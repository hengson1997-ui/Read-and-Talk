import { useState } from 'react';
import { Settings } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { ChatView } from './components/ChatView';
import { RightPanel } from './components/RightPanel';
import { ThemeToggle } from './components/ThemeToggle';
import { BookUpload } from './components/BookUpload';
import { Dashboard } from './components/Dashboard';
import { Settings as SettingsPanel } from './components/Settings';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [refreshBooks, setRefreshBooks] = useState(0);
  const [refreshConversations, setRefreshConversations] = useState(0);
  const [view, setView] = useState<'dashboard' | 'chat'>('dashboard');

  const handleUploadSuccess = async (book: any) => {
    setSelectedBook(book);
    setRefreshBooks(prev => prev + 1);

    // 自动创建对话
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId: book.id, title: `关于《${book.title}》的对话` }),
      });
      const conversation = await res.json();
      setSelectedConversation(conversation);
      setRefreshConversations(prev => prev + 1);
      setView('chat');
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const handleStartConversation = async (book: any) => {
    setSelectedBook(book);
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId: book.id, title: `关于《${book.title}》的对话` }),
      });
      const conversation = await res.json();
      setSelectedConversation(conversation);
      setRefreshConversations(prev => prev + 1);
      setView('chat');
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const handleSelectConversation = (conv: any) => {
    setSelectedConversation(conv);
    setView('chat');
  };

  const handleBackToDashboard = () => {
    setView('dashboard');
    setSelectedConversation(null);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* 顶部导航栏 - macOS 风格 */}
      <nav className="h-12 glass border-b border-black/5 dark:border-white/5 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBackToDashboard}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          >
            <div className="w-7 h-7 rounded-macos bg-gradient-to-br from-primary to-accent-purple flex items-center justify-center shadow-macos">
              <span className="text-white font-bold text-xs">RT</span>
            </div>
            <span className="font-semibold text-sm tracking-tight">Read & Talk</span>
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleBackToDashboard}
            className={`btn-ghost px-3 py-1.5 rounded-macos text-xs font-medium ${view === 'dashboard' ? 'bg-primary/10 text-primary' : ''}`}
          >
            首页
          </button>
          <button className="btn-ghost px-3 py-1.5 rounded-macos text-xs font-medium">
            学习进度
          </button>
          <button className="btn-ghost px-3 py-1.5 rounded-macos text-xs font-medium">
            复习
          </button>
          <div className="w-px h-4 bg-black/10 dark:bg-white/10 mx-1" />
          <ThemeToggle />
          <button
            onClick={() => setShowSettings(true)}
            className="w-8 h-8 rounded-macos btn-ghost flex items-center justify-center"
            title="设置"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* 主内容区 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧栏 - 仅在聊天视图显示 */}
        {view === 'chat' && (
          <Sidebar
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
            selectedBook={selectedBook}
            onSelectBook={setSelectedBook}
            selectedConversation={selectedConversation}
            onSelectConversation={handleSelectConversation}
            onUploadClick={() => setShowUpload(true)}
            refreshTrigger={refreshBooks}
            refreshConversations={refreshConversations}
          />
        )}

        {/* 中间内容区 */}
        {view === 'dashboard' ? (
          <Dashboard
            onSelectBook={setSelectedBook}
            onUploadClick={() => setShowUpload(true)}
            onStartConversation={handleStartConversation}
          />
        ) : (
          <ChatView
            conversation={selectedConversation}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />
        )}

        {/* 右侧面板 - 仅在聊天视图显示 */}
        {view === 'chat' && (
          <RightPanel
            isOpen={rightPanelOpen}
            onToggle={() => setRightPanelOpen(!rightPanelOpen)}
            book={selectedBook}
          />
        )}
      </div>

      {/* 上传弹窗 */}
      <BookUpload
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        onUpload={handleUploadSuccess}
      />

      {/* 设置弹窗 */}
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
}
