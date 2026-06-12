import initSqlJs, { Database } from 'sql.js';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config.js';

let db: Database;
let dbPath: string;

export async function getDb(): Promise<Database> {
  if (!db) {
    const SQL = await initSqlJs();
    
    const dbDir = dirname(config.dbPath);
    mkdirSync(dbDir, { recursive: true });
    
    dbPath = config.dbPath;
    
    if (existsSync(dbPath)) {
      const buffer = readFileSync(dbPath);
      db = new SQL.Database(buffer);
    } else {
      db = new SQL.Database();
    }
    
    db.run('PRAGMA foreign_keys = ON');
    
    // 执行 schema
    try {
      const schemaPath = new URL('./schema.sql', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
      console.log('Loading schema from:', schemaPath);
      const schema = readFileSync(schemaPath, 'utf-8');
      const statements = schema.split(';').filter(s => s.trim().length > 0);
      for (const stmt of statements) {
        try {
          db.run(stmt);
        } catch (e: any) {
          // 忽略重复插入等错误
          if (!e.message.includes('UNIQUE constraint')) {
            console.warn('Schema statement warning:', e.message);
          }
        }
      }
      console.log('✅ Schema loaded');
    } catch (e) {
      console.error('Failed to load schema:', e);
    }
  }
  return db;
}

export function saveDb(): void {
  if (db && dbPath) {
    const data = db.export();
    const buffer = Buffer.from(data);
    writeFileSync(dbPath, buffer);
  }
}

export function closeDb(): void {
  if (db) {
    saveDb();
    db.close();
  }
}

export function dbAll(sql: string, params: any[] = []): any[] {
  const stmt = db.prepare(sql);
  if (params.length > 0) {
    stmt.bind(params);
  }
  const results: any[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

export function dbGet(sql: string, params: any[] = []): any | undefined {
  const stmt = db.prepare(sql);
  if (params.length > 0) {
    stmt.bind(params);
  }
  let result: any | undefined;
  if (stmt.step()) {
    result = stmt.getAsObject();
  }
  stmt.free();
  return result;
}

export function dbRun(sql: string, params: any[] = []): { changes: number; lastInsertRowid: number } {
  db.run(sql, params);
  const changes = db.getRowsModified();
  const lastRow = dbGet('SELECT last_insert_rowid() as id');
  return { changes, lastInsertRowid: lastRow?.id || 0 };
}
