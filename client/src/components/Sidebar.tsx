import { useState, useEffect } from 'react';
import { Book, Target, Bell, Settings, Plus, MessageSquare, ChevronDown } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  selectedBook: any;
  onSelectBook: (book: any) => void;
  selectedConversation: any;
  onSelectConversation: (conv: any) => void;
  onUploadClick: () => void;
  refreshTrigger?: number;
  refreshConversations?: number;
}

export function Sidebar({
  isOpen,
  onToggle,
  selectedBook,
  onSelectBook,
  selectedConversation,
  onSelectConversation,
  onUploadClick,
  refreshTrigger,
  refreshConversations,
}: SidebarProps) {
  const [books, setBooks] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);

  useEffect(() => {
    fetchBooks();
  }, [refreshTrigger]);

  useEffect(() => {
    if (selectedBook) {
      fetchConversations(selectedBook.id);
    }
  }, [selectedBook, refreshConversations]);

  const fetchBooks = async () => {
    try {
      const res = await fetch('/api/books');
      const data = await res.json();
      setBooks(data);
    } catch (error) {
      console.error('Failed to fetch books:', error);
    }
  };

  const fetchConversations = async (bookId: number) => {
    try {
      const res = await fetch(`/api/conversations?bookId=${bookId}`);
      const data = await res.json();
      setConversations(data);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="w-11 h-full glass border-r border-black/5 dark:border-white/5 flex items-center justify-center hover:bg-surface-hover dark:hover:bg-surface-dark-hover transition-colors shrink-0"
      >
        <Book className="w-4 h-4 text-secondary" />
      </button>
    );
  }

  return (
    <aside className="w-60 h-full glass border-r border-black/5 dark:border-white/5 flex flex-col shrink-0">
      {/* Header */}
      <div className="p-3 border-b border-black/5 dark:border-white/5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-tertiary uppercase tracking-wider">资料库</span>
          <button
            onClick={onToggle}
            className="w-6 h-6 rounded-md hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center text-tertiary"
          >
            <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
          </button>
        </div>
      </div>

      {/* Upload button */}
      <div className="p-3">
        <button
          onClick={onUploadClick}
          className="w-full btn-primary py-2 rounded-macos flex items-center justify-center gap-2 text-xs font-medium"
        >
          <Plus className="w-3.5 h-3.5" />
          上传新书
        </button>
      </div>

      {/* Books list */}
      <div className="px-3 mb-3">
        <div className="text-[11px] font-semibold text-quaternary uppercase tracking-wider mb-2 px-1">
          书籍
        </div>
        <div className="space-y-0.5">
          {books.length === 0 ? (
            <div className="text-xs text-tertiary py-3 px-2">暂无书籍</div>
          ) : (
            books.map((book) => (
              <button
                key={book.id}
                onClick={() => onSelectBook(book)}
                className={`w-full p-2 rounded-macos text-left transition-all ${
                  selectedBook?.id === book.id
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Book className="w-3.5 h-3.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{book.title}</div>
                    <div className="text-[10px] text-tertiary mt-0.5">{book.total_chunks} 段落</div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Conversations */}
      <div className="px-3 flex-1 overflow-y-auto">
        <div className="text-[11px] font-semibold text-quaternary uppercase tracking-wider mb-2 px-1">
          对话
        </div>
        <div className="space-y-0.5">
          {conversations.length === 0 ? (
            <div className="text-xs text-tertiary py-3 px-2">暂无对话</div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => onSelectConversation(conv)}
                className={`w-full p-2 rounded-macos text-left transition-all ${
                  selectedConversation?.id === conv.id
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{conv.title || '新对话'}</div>
                    <div className="text-[10px] text-tertiary mt-0.5">
                      {new Date(conv.created_at).toLocaleDateString('zh-CN')}
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Bottom toolbar */}
      <div className="p-3 border-t border-black/5 dark:border-white/5">
        <div className="flex items-center gap-1">
          <button className="flex-1 btn-ghost py-1.5 rounded-macos flex items-center justify-center gap-1.5 text-[11px] font-medium">
            <Target className="w-3.5 h-3.5" />
            路径
          </button>
          <button className="flex-1 btn-ghost py-1.5 rounded-macos flex items-center justify-center gap-1.5 text-[11px] font-medium">
            <Bell className="w-3.5 h-3.5" />
            复习
          </button>
          <button className="w-8 btn-ghost py-1.5 rounded-macos flex items-center justify-center">
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
