import { useState, useEffect, useRef } from 'react';
import { Send, Mic, Paperclip, Volume2, ChevronLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: number;
  role: 'user' | 'teacher';
  content: string;
  audio_path?: string;
  created_at: string;
}

interface ChatViewProps {
  conversation: any;
  onToggleSidebar: () => void;
}

export function ChatView({ conversation, onToggleSidebar }: ChatViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversation) {
      fetchMessages(conversation.id);
    }
  }, [conversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  const fetchMessages = async (conversationId: number) => {
    const res = await fetch(`/api/conversations/${conversationId}/messages`);
    const data = await res.json();
    setMessages(data);
  };

  const handleSend = async () => {
    if (!input.trim() || !conversation) return;

    const userMessage = input.trim();
    setInput('');
    setIsTyping(true);

    const newUserMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newUserMessage]);

    try {
      const response = await fetch(`/api/conversations/${conversation.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let fullText = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                setIsTyping(false);
                setStreamingText('');
                fetchMessages(conversation.id);
              } else {
                try {
                  const parsed = JSON.parse(data);
                  if (parsed.type === 'text') {
                    fullText += parsed.content;
                    setStreamingText(fullText);
                  }
                } catch (e) {
                  // 忽略解析错误
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 rounded-macos-2xl bg-gradient-to-br from-primary/10 to-accent-purple/10 flex items-center justify-center mx-auto mb-5">
            <span className="text-4xl">📖</span>
          </div>
          <h2 className="text-xl font-semibold mb-2">开始你的学习之旅</h2>
          <p className="text-sm text-secondary max-w-sm">
            上传一本书，然后与 AI 教师进行深度对话，彻底理解新概念
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* 聊天头部 */}
      <div className="h-11 glass border-b border-black/5 dark:border-white/5 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="w-7 h-7 rounded-md hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center text-secondary"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="text-sm font-medium">{conversation.title || '新对话'}</div>
            <div className="text-[10px] text-tertiary">苏格拉底老师</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="btn-ghost px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5">
            <Mic className="w-3.5 h-3.5" />
            语音
          </button>
        </div>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={msg.id}
            className={`flex gap-3 animate-fade-in ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            style={{ animationDelay: `${index * 0.03}s` }}
          >
            {/* 头像 */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm ${
                msg.role === 'teacher'
                  ? 'bg-gradient-to-br from-primary to-accent-purple shadow-macos'
                  : 'bg-black/5 dark:bg-white/10'
              }`}
            >
              {msg.role === 'teacher' ? '🧑‍🏫' : '👤'}
            </div>

            {/* 消息内容 */}
            <div className={`max-w-[75%] ${msg.role === 'user' ? 'text-right' : ''}`}>
              <div className="flex items-center gap-2 mb-1 text-[11px] text-tertiary">
                <span>{msg.role === 'teacher' ? '老师' : '我'}</span>
                <span>
                  {new Date(msg.created_at).toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <div
                className={`p-3 rounded-macos-lg ${
                  msg.role === 'teacher' ? 'message-teacher' : 'message-student'
                }`}
              >
                {msg.role === 'teacher' ? (
                  <div className="prose prose-sm max-w-none text-[13px] leading-relaxed">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-[13px] leading-relaxed">{msg.content}</p>
                )}
              </div>

              {/* 音频播放器 */}
              {msg.role === 'teacher' && msg.audio_path && (
                <div className="mt-2 flex items-center gap-2 max-w-[240px]">
                  <button className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                    <Volume2 className="w-3.5 h-3.5 text-primary" />
                  </button>
                  <div className="flex-1 h-1 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                    <div className="w-0 h-full bg-primary rounded-full" />
                  </div>
                  <span className="text-[10px] text-tertiary">0:00</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* 流式输出 */}
        {streamingText && (
          <div className="flex gap-3 animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent-purple flex items-center justify-center flex-shrink-0 shadow-macos text-sm">
              🧑‍🏫
            </div>
            <div className="max-w-[75%]">
              <div className="flex items-center gap-2 mb-1 text-[11px] text-tertiary">
                <span>老师</span>
              </div>
              <div className="p-3 rounded-macos-lg message-teacher">
                <div className="prose prose-sm max-w-none text-[13px] leading-relaxed">
                  <ReactMarkdown>{streamingText}</ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 打字指示器 */}
        {isTyping && !streamingText && (
          <div className="flex gap-3 animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent-purple flex items-center justify-center flex-shrink-0 shadow-macos text-sm">
              🧑‍🏫
            </div>
            <div className="p-3 rounded-macos-lg message-teacher">
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="p-4 glass border-t border-black/5 dark:border-white/5">
        <div className="flex items-end gap-2 max-w-3xl mx-auto">
          <button className="w-8 h-8 rounded-macos btn-ghost flex items-center justify-center flex-shrink-0">
            <Paperclip className="w-4 h-4" />
          </button>

          <div className="flex-1 input-glass rounded-macos-lg px-3.5 py-2.5">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入你的问题..."
              rows={1}
              className="w-full bg-transparent outline-none resize-none text-[13px] leading-relaxed"
              style={{ minHeight: '20px', maxHeight: '100px' }}
            />
          </div>

          <button className="w-8 h-8 rounded-macos btn-ghost flex items-center justify-center flex-shrink-0">
            <Mic className="w-4 h-4" />
          </button>

          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="w-8 h-8 rounded-macos btn-primary flex items-center justify-center flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
