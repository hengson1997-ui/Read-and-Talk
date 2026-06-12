import { Play, Pause, SkipBack, SkipForward, Volume2, Repeat } from 'lucide-react';
import { useState } from 'react';

export function GlobalPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState('1x');

  return (
    <div className="h-10 glass border-b border-white/5 flex items-center px-4 gap-3 text-xs">
      {/* 播放控制 */}
      <div className="flex items-center gap-1">
        <button className="w-6 h-6 rounded hover:bg-white/10 flex items-center justify-center text-gray-400">
          <SkipBack className="w-3 h-3" />
        </button>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-7 h-7 rounded-full bg-primary flex items-center justify-center hover:bg-primary-dim transition-colors"
        >
          {isPlaying ? (
            <Pause className="w-3 h-3 text-white" />
          ) : (
            <Play className="w-3 h-3 text-white ml-0.5" />
          )}
        </button>
        <button className="w-6 h-6 rounded hover:bg-white/10 flex items-center justify-center text-gray-400">
          <SkipForward className="w-3 h-3" />
        </button>
      </div>

      {/* 进度条 */}
      <div className="flex-1 flex items-center gap-2 max-w-md">
        <span className="text-gray-500 font-mono w-8 text-right">1:23</span>
        <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden cursor-pointer group">
          <div className="w-[42%] h-full bg-gradient-to-r from-primary to-primary-dim rounded-full relative">
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
        <span className="text-gray-500 font-mono w-8">2:15</span>
      </div>

      {/* 当前播放信息 */}
      <div className="hidden sm:flex items-center gap-2 min-w-0">
        <span className="text-gray-400">📖</span>
        <span className="font-medium truncate max-w-[120px]">深度学习入门</span>
        <span className="text-gray-500">·</span>
        <span className="text-gray-500 truncate max-w-[100px]">讨论第一章</span>
      </div>

      {/* 速度 */}
      <div className="flex items-center gap-0.5">
        {['1x', '1.25x', '1.5x'].map((s) => (
          <button
            key={s}
            onClick={() => setSpeed(s)}
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors ${
              speed === s
                ? 'bg-primary/20 text-primary'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* 音量 */}
      <div className="flex items-center gap-1">
        <Volume2 className="w-3 h-3 text-gray-400" />
        <input
          type="range"
          min="0"
          max="100"
          defaultValue="75"
          className="w-14 h-1 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full"
        />
      </div>

      {/* 循环 */}
      <button className="w-6 h-6 rounded hover:bg-white/10 flex items-center justify-center text-gray-400">
        <Repeat className="w-3 h-3" />
      </button>
    </div>
  );
}
