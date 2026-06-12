import { ChevronRight, FileText, Map, StickyNote } from 'lucide-react';

interface RightPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  book: any;
}

export function RightPanel({ isOpen, onToggle }: RightPanelProps) {
  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="w-11 h-full glass border-l border-black/5 dark:border-white/5 flex items-center justify-center hover:bg-surface-hover dark:hover:bg-surface-dark-hover transition-colors"
      >
        <ChevronRight className="w-4 h-4 text-secondary rotate-180" />
      </button>
    );
  }

  return (
    <aside className="w-72 h-full glass border-l border-black/5 dark:border-white/5 flex flex-col">
      {/* 头部 */}
      <div className="h-11 border-b border-black/5 dark:border-white/5 flex items-center justify-between px-3 shrink-0">
        <div className="flex items-center gap-2">
          <FileText className="w-3.5 h-3.5 text-secondary" />
          <span className="text-xs font-semibold text-secondary">相关内容</span>
        </div>
        <button
          onClick={onToggle}
          className="w-6 h-6 rounded-md hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center text-tertiary"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 内容 */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* 相关段落 */}
        <div>
          <div className="text-[11px] font-semibold text-quaternary uppercase tracking-wider mb-2 px-1">
            检索到的相关段落
          </div>
          <div className="space-y-1.5">
            <div className="p-2.5 rounded-macos glass border border-primary/20 hover:border-primary/40 transition-colors cursor-pointer">
              <div className="text-xs font-medium text-primary mb-1">第一章：神经网络基础</div>
              <p className="text-[11px] text-tertiary line-clamp-3 leading-relaxed">
                神经网络是一种计算模型，灵感来源于生物大脑中神经元的工作方式。它由大量的节点组成，这些节点按层排列...
              </p>
            </div>
            <div className="p-2.5 rounded-macos glass hover:bg-surface-hover dark:hover:bg-surface-dark-hover transition-colors cursor-pointer">
              <div className="text-xs font-medium mb-1">1.1 感知机模型</div>
              <p className="text-[11px] text-tertiary line-clamp-3 leading-relaxed">
                感知机是最简单的神经网络形式，它接收多个输入信号，每个信号乘以对应的权重后求和...
              </p>
            </div>
          </div>
        </div>

        {/* 知识图谱 */}
        <div>
          <div className="text-[11px] font-semibold text-quaternary uppercase tracking-wider mb-2 px-1">
            知识图谱
          </div>
          <button className="w-full p-2.5 rounded-macos glass hover:bg-surface-hover dark:hover:bg-surface-dark-hover transition-colors text-left group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Map className="w-3.5 h-3.5 text-secondary" />
                <span className="text-xs font-medium">查看概念关系图</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>
        </div>

        {/* 笔记 */}
        <div>
          <div className="text-[11px] font-semibold text-quaternary uppercase tracking-wider mb-2 px-1">
            我的笔记
          </div>
          <textarea
            placeholder="在这里记录你的理解..."
            className="w-full h-28 p-2.5 rounded-macos input-glass resize-none text-xs leading-relaxed"
          />
          <div className="flex items-center justify-between mt-2 px-1">
            <span className="text-[10px] text-quaternary flex items-center gap-1">
              <StickyNote className="w-3 h-3" />
              自动保存
            </span>
            <button className="text-[11px] text-primary font-medium hover:underline">
              保存笔记
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
