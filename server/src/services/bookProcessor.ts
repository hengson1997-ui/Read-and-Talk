import { readFileSync } from 'fs';
import { extname } from 'path';
import { getDb, dbRun, dbGet, dbAll, saveDb } from '../db/index.js';
import { getLLMConfig } from './settings.js';
import OpenAI from 'openai';

interface ExtractedConcept {
  name: string;
  description: string;
  chapter: string | null;
  importance: 'high' | 'medium' | 'low';
  relatedConcepts: string[];
}

interface ChapterSummary {
  chapter: string;
  summary: string;
  keyPoints: string[];
}

export async function processBook(filePath: string, bookId: number): Promise<number> {
  const ext = extname(filePath).toLowerCase();
  let text: string;

  if (ext === '.pdf') {
    const pdfParse = (await import('pdf-parse')).default;
    const buffer = readFileSync(filePath);
    const data = await pdfParse(buffer);
    text = data.text;
  } else if (ext === '.txt') {
    text = readFileSync(filePath, 'utf-8');
  } else {
    throw new Error(`Unsupported file type: ${ext}`);
  }

  // 1. 分块存储
  const chunks = splitIntoChunks(text);
  const db = getDb();

  for (const chunk of chunks) {
    dbRun(`
      INSERT INTO book_chunks (book_id, content, chunk_index, chapter)
      VALUES (?, ?, ?, ?)
    `, [bookId, chunk.content, chunk.index, chunk.chapter]);
  }

  dbRun('UPDATE books SET total_chunks = ? WHERE id = ?', [chunks.length, bookId]);
  saveDb();

  // 2. 调用 LLM 提取概念和知识点
  try {
    await extractConceptsWithLLM(bookId, text, chunks);
  } catch (error) {
    console.error('LLM extraction failed, falling back to simple extraction:', error);
    extractConceptsSimple(bookId, text);
  }

  return chunks.length;
}

async function extractConceptsWithLLM(bookId: number, fullText: string, chunks: Array<{ content: string; chapter: string | null }>) {
  const config = getLLMConfig();
  const client = new OpenAI({
    baseURL: config.baseUrl,
    apiKey: config.apiKey || 'dummy',
  });

  // 获取书籍信息
  const book = dbGet('SELECT title FROM books WHERE id = ?', [bookId]);
  const bookTitle = book?.title || '未知书籍';

  // 取前 5000 字作为样本进行分析
  const sampleText = fullText.substring(0, 5000);

  // 1. 提取章节结构
  const chapters = extractChapters(chunks);

  // 2. 调用 LLM 提取核心概念
  const conceptPrompt = `你是一位资深的教育专家，正在分析《${bookTitle}》这本书。

请从以下文本中提取 15-20 个核心知识点/概念，用于教学。

要求：
1. 每个概念应该是可教学的、有明确边界的
2. 包含概念名称、简要描述、重要程度
3. 标注概念之间的关联关系
4. 适合用苏格拉底式提问来教学

请以 JSON 格式返回：
{
  "concepts": [
    {
      "name": "概念名称",
      "description": "一句话描述",
      "importance": "high/medium/low",
      "relatedConcepts": ["相关概念1", "相关概念2"]
    }
  ]
}

书籍内容：
${sampleText}`;

  try {
    const conceptResponse = await client.chat.completions.create({
      model: config.model,
      messages: [{ role: 'user', content: conceptPrompt }],
      temperature: 0.3,
      max_tokens: 3000,
      response_format: { type: 'json_object' },
    });

    const conceptResult = JSON.parse(conceptResponse.choices[0]?.message?.content || '{"concepts":[]}');
    const concepts: ExtractedConcept[] = conceptResult.concepts || [];

    // 3. 存储概念到数据库
    for (const concept of concepts) {
      dbRun(`
        INSERT INTO concepts (book_id, name, description, chapter, importance, related_concept_ids)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        bookId,
        concept.name,
        concept.description,
        concept.chapter || null,
        concept.importance,
        JSON.stringify(concept.relatedConcepts),
      ]);
    }

    // 4. 为每个章节生成摘要
    if (chapters.length > 0) {
      await generateChapterSummaries(client, config.model, bookId, bookTitle, chapters, chunks);
    }

    // 5. 生成书籍整体摘要
    await generateBookSummary(client, config.model, bookId, bookTitle, sampleText);

    saveDb();
    console.log(`✅ Extracted ${concepts.length} concepts for "${bookTitle}"`);

  } catch (error) {
    console.error('LLM concept extraction failed:', error);
    throw error;
  }
}

async function generateChapterSummaries(
  client: OpenAI,
  model: string,
  bookId: number,
  bookTitle: string,
  chapters: string[],
  chunks: Array<{ content: string; chapter: string | null }>
) {
  for (const chapter of chapters.slice(0, 5)) { // 最多处理 5 个章节
    const chapterChunks = chunks.filter(c => c.chapter === chapter);
    const chapterText = chapterChunks.map(c => c.content).join('\n').substring(0, 3000);

    if (chapterText.length < 100) continue;

    const prompt = `为《${bookTitle}》的"${chapter}"章节生成教学摘要。

要求：
1. 100-200 字的章节概述
2. 提取 3-5 个关键要点
3. 适合学生快速理解章节核心内容

请以 JSON 格式返回：
{
  "summary": "章节概述",
  "keyPoints": ["要点1", "要点2", "要点3"]
}

章节内容：
${chapterText}`;

    try {
      const response = await client.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 500,
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0]?.message?.content || '{}');

      dbRun(`
        INSERT INTO chapter_summaries (book_id, chapter, summary, key_points)
        VALUES (?, ?, ?, ?)
      `, [
        bookId,
        chapter,
        result.summary || '',
        JSON.stringify(result.keyPoints || []),
      ]);
    } catch (error) {
      console.error(`Failed to generate summary for chapter "${chapter}":`, error);
    }
  }
}

async function generateBookSummary(
  client: OpenAI,
  model: string,
  bookId: number,
  bookTitle: string,
  sampleText: string
) {
  const prompt = `为《${bookTitle}》生成一份教学导读。

要求：
1. 200-300 字的书籍概述
2. 适合学生快速了解本书核心价值
3. 指出学习重点和建议

请以 JSON 格式返回：
{
  "summary": "书籍概述",
  "learningFocus": ["学习重点1", "学习重点2"],
  "suggestions": "学习建议"
}

书籍内容（节选）：
${sampleText}`;

  try {
    const response = await client.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 800,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0]?.message?.content || '{}');

    dbRun(`
      UPDATE books SET
        summary = ?,
        learning_focus = ?,
        suggestions = ?
      WHERE id = ?
    `, [
      result.summary || '',
      JSON.stringify(result.learningFocus || []),
      result.suggestions || '',
      bookId,
    ]);
  } catch (error) {
    console.error('Failed to generate book summary:', error);
  }
}

function extractChapters(chunks: Array<{ content: string; chapter: string | null }>): string[] {
  const chapters = new Set<string>();
  for (const chunk of chunks) {
    if (chunk.chapter) {
      chapters.add(chunk.chapter);
    }
  }
  return Array.from(chapters);
}

function splitIntoChunks(text: string): Array<{ content: string; index: number; chapter: string | null }> {
  const chunks: Array<{ content: string; index: number; chapter: string | null }> = [];

  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);

  let currentChunk = '';
  let chunkIndex = 0;
  let currentChapter: string | null = null;

  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim();

    const chapterMatch = trimmed.match(/^(第[一二三四五六七八九十百千\d]+[章节篇]|Chapter\s+\d+|CHAPTER\s+\d+)/i);
    if (chapterMatch) {
      currentChapter = chapterMatch[0];
    }

    if (currentChunk.length + trimmed.length > 500 && currentChunk.length > 0) {
      chunks.push({
        content: currentChunk.trim(),
        index: chunkIndex++,
        chapter: currentChapter,
      });
      currentChunk = '';
    }

    currentChunk += trimmed + '\n\n';
  }

  if (currentChunk.trim().length > 0) {
    chunks.push({
      content: currentChunk.trim(),
      index: chunkIndex,
      chapter: currentChapter,
    });
  }

  return chunks;
}

// 简单提取作为后备方案
function extractConceptsSimple(bookId: number, text: string) {
  const words = text.split(/[\s,，。！？、；：""''（）\[\]【】]+/).filter(w => w.length >= 2 && w.length <= 10);
  const wordCount: Record<string, number> = {};

  for (const word of words) {
    wordCount[word] = (wordCount[word] || 0) + 1;
  }

  const keywords = Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word]) => word);

  for (const keyword of keywords) {
    dbRun(`
      INSERT INTO concepts (book_id, name, description, importance)
      VALUES (?, ?, ?, ?)
    `, [bookId, keyword, `关于"${keyword}"的概念`, 'medium']);
  }
}
