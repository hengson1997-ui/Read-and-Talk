import { useState, useEffect } from 'react';
import { Book, Clock, Star, Upload, MessageSquare, Target, Brain, ChevronRight, Sparkles } from 'lucide-react';

interface DashboardProps {
  onSelectBook: (book: any) => void;
  onUploadClick: () => void;
  onStartConversation: (book: any) => void;
}

interface Stats {
  totalBooks: number;
  totalConversations: number;
  conceptsLearned: number;
  reviewPending: number;
}

interface RecentBook {
  id: number;
  title: string;
  total_chunks: number;
  summary?: string;
  learning_focus?: string;
  created_at: string;
}

export function Dashboard({ onSelectBook, onUploadClick, onStartConversation }: DashboardProps) {
  const [stats, setStats] = useState<Stats>({
    totalBooks: 0,
    totalConversations: 0,
    conceptsLearned: 0,
    reviewPending: 0,
  });
  const [recentBooks, setRecentBooks] = useState<RecentBook[]>([]);
  const [pendingReviews, setPendingReviews] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const booksRes = await fetch('/api/books');
      const books = await booksRes.json();

      const reviewRes = await fetch('/api/review/pending');
      const reviews = await reviewRes.json();

      setStats({
        totalBooks: books.length,
        totalConversations: 0,
        conceptsLearned: 0,
        reviewPending: reviews.length,
      });

      setRecentBooks(books.slice(0, 6));
      setPendingReviews(reviews.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  const handleBookClick = (book: RecentBook) => {
    onSelectBook(book);
    onStartConversation(book);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return '夜深了';
    if (hour < 12) return '早上好';
    if (hour < 14) return '中午好';
    if (hour < 18) return '下午好';
    return '晚上好';
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* 欢迎区域 */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-[32px] font-bold mb-1 tracking-tight">
            {getGreeting()} 👋
          </h1>
          <p className="text-[15px] text-secondary">
            继续你的学习之旅，探索新知识
          </p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <StatCard
            icon={<Book className="w-4 h-4" />}
            label="我的书籍"
            value={stats.totalBooks}
            color="bg-accent-blue/10 text-accent-blue"
            delay={0}
          />
          <StatCard
            icon={<MessageSquare className="w-4 h-4" />}
            label="对话次数"
            value={stats.totalConversations}
            color="bg-accent-green/10 text-accent-green"
            delay={1}
          />
          <StatCard
            icon={<Brain className="w-4 h-4" />}
            label="已学概念"
            value={stats.conceptsLearned}
            color="bg-accent-purple/10 text-accent-purple"
            delay={2}
          />
          <StatCard
            icon={<Clock className="w-4 h-4" />}
            label="待复习"
            value={stats.reviewPending}
            color="bg-accent-orange/10 text-accent-orange"
            delay={3}
          />
        </div>

        {/* 快速操作 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
          <button
            onClick={onUploadClick}
            className="group p-5 rounded-macos-xl glass hover:bg-surface-hover dark:hover:bg-surface-dark-hover transition-all animate-fade-in stagger-3"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-macos-lg bg-gradient-to-br from-primary to-accent-purple flex items-center justify-center shadow-macos group-hover:shadow-macos-md transition-shadow">
                <Upload className="w-5 h-5 text-white" />
              </div>
              <div className="text-left flex-1">
                <div className="font-semibold text-[15px]">上传新书</div>
                <div className="text-xs text-tertiary mt-0.5">支持 PDF、TXT 格式</div>
              </div>
              <ChevronRight className="w-4 h-4 text-tertiary group-hover:text-secondary transition-colors" />
            </div>
          </button>

          <button
            onClick={() => {}}
            className="group p-5 rounded-macos-xl glass hover:bg-surface-hover dark:hover:bg-surface-dark-hover transition-all animate-fade-in stagger-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-macos-lg bg-gradient-to-br from-accent-green to-accent-teal flex items-center justify-center shadow-macos group-hover:shadow-macos-md transition-shadow">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div className="text-left flex-1">
                <div className="font-semibold text-[15px]">学习路径</div>
                <div className="text-xs text-tertiary mt-0.5">查看推荐学习内容</div>
              </div>
              <ChevronRight className="w-4 h-4 text-tertiary group-hover:text-secondary transition-colors" />
            </div>
          </button>
        </div>

        {/* 最近阅读 */}
        <div className="mb-8 animate-fade-in stagger-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[17px] font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4 text-tertiary" />
              最近阅读
            </h2>
            <button className="text-xs text-primary hover:underline">
              查看全部
            </button>
          </div>

          {recentBooks.length === 0 ? (
            <div className="p-12 rounded-macos-xl glass text-center">
              <div className="w-16 h-16 rounded-macos-xl bg-gradient-to-br from-primary/10 to-accent-purple/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <p className="text-[15px] font-medium mb-1">开始你的阅读之旅</p>
              <p className="text-sm text-tertiary mb-5">
                上传一本书，与 AI 教师进行深度对话
              </p>
              <button
                onClick={onUploadClick}
                className="btn-primary px-5 py-2 rounded-macos text-sm font-medium"
              >
                上传第一本书
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {recentBooks.map((book, index) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onClick={() => handleBookClick(book)}
                  delay={index}
                />
              ))}
            </div>
          )}
        </div>

        {/* 待复习内容 */}
        {pendingReviews.length > 0 && (
          <div className="animate-fade-in stagger-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[17px] font-semibold flex items-center gap-2">
                <Star className="w-4 h-4 text-accent-orange" />
                待复习内容
              </h2>
              <button className="text-xs text-primary hover:underline">
                开始复习
              </button>
            </div>

            <div className="space-y-2">
              {pendingReviews.map((review, index) => (
                <div
                  key={index}
                  className="p-4 rounded-macos glass hover:bg-surface-hover dark:hover:bg-surface-dark-hover transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[15px] font-medium">{review.name}</div>
                      <div className="text-xs text-tertiary mt-0.5">
                        {review.book_title}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-accent-orange font-medium px-2.5 py-1 rounded-full bg-accent-orange/10">
                        需要复习
                      </span>
                      <ChevronRight className="w-4 h-4 text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, delay }: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  delay: number;
}) {
  return (
    <div
      className={`p-4 rounded-macos-lg glass hover-lift animate-fade-in stagger-${delay + 1}`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-macos ${color} flex items-center justify-center`}>
          {icon}
        </div>
        <div>
          <div className="text-xl font-bold tracking-tight">{value}</div>
          <div className="text-[11px] text-tertiary font-medium">
            {label}
          </div>
        </div>
      </div>
    </div>
  );
}

function BookCard({ book, onClick, delay }: { book: RecentBook; onClick: () => void; delay: number }) {
  const coverGradients = [
    'from-blue-500 to-indigo-600',
    'from-purple-500 to-pink-500',
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-red-500',
    'from-cyan-500 to-blue-600',
    'from-pink-500 to-rose-600',
  ];

  const gradientIndex = book.id % coverGradients.length;

  return (
    <div
      onClick={onClick}
      className="group p-4 rounded-macos-lg glass hover:bg-surface-hover dark:hover:bg-surface-dark-hover hover-lift cursor-pointer animate-fade-in"
      style={{ animationDelay: `${delay * 0.05}s` }}
    >
      <div className="flex gap-3.5">
        {/* 书籍封面 */}
        <div className={`w-14 h-[72px] rounded-macos bg-gradient-to-br ${coverGradients[gradientIndex]} flex items-center justify-center flex-shrink-0 shadow-macos group-hover:shadow-macos-md transition-shadow`}>
          <Book className="w-6 h-6 text-white/90" />
        </div>

        {/* 书籍信息 */}
        <div className="flex-1 min-w-0 py-0.5">
          <h3 className="text-[15px] font-semibold truncate group-hover:text-primary transition-colors">
            {book.title}
          </h3>
          {book.summary ? (
            <p className="text-[11px] text-tertiary mt-1 line-clamp-2">
              {book.summary.substring(0, 60)}...
            </p>
          ) : (
            <p className="text-xs text-tertiary mt-1">
              {book.total_chunks} 个段落
            </p>
          )}
          <p className="text-[11px] text-quaternary mt-2">
            {new Date(book.created_at).toLocaleDateString('zh-CN')}
          </p>
        </div>
      </div>
    </div>
  );
}
