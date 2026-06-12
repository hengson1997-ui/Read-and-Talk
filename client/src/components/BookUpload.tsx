import { useState, useRef } from 'react';
import { X, Upload, File } from 'lucide-react';

interface BookUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (book: any) => void;
}

export function BookUpload({ isOpen, onClose, onUpload }: BookUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setTitle(selectedFile.name.replace(/\.[^.]+$/, ''));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setTitle(droppedFile.name.replace(/\.[^.]+$/, ''));
    }
  };

  const handleUpload = async () => {
    if (!file || !title.trim()) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);

    try {
      const res = await fetch('/api/books/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      onUpload(data);
      onClose();
      setFile(null);
      setTitle('');
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-liquid rounded-macos-2xl w-[440px] max-w-[90vw] animate-scale-in" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-black/5 dark:border-white/5">
          <h2 className="text-[15px] font-semibold">上传新书</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-md hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center">
            <X className="w-4 h-4 text-secondary" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          {/* Upload zone */}
          <div
            className={`border-2 border-dashed rounded-macos-xl p-8 text-center cursor-pointer transition-all ${
              file
                ? 'border-primary/40 bg-primary/5'
                : 'border-black/10 dark:border-white/10 hover:border-primary/30 hover:bg-primary/5'
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
          >
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-macos bg-primary/10 flex items-center justify-center">
                  <File className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <div className="text-[13px] font-medium">{file.name}</div>
                  <div className="text-xs text-tertiary mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                </div>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-macos-lg bg-black/5 dark:bg-white/5 flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-5 h-5 text-secondary" />
                </div>
                <div className="text-[13px] text-secondary">拖拽文件到这里，或点击选择文件</div>
                <div className="text-xs text-tertiary mt-1">支持 PDF、TXT 格式</div>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt"
            className="hidden"
            onChange={handleFileSelect}
          />

          {/* Title input */}
          <div className="mt-4">
            <label className="text-xs font-medium text-secondary mb-2 block">书名</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="自动填充文件名，可编辑"
              className="w-full input-glass rounded-macos px-3 py-2 text-[13px]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t border-black/5 dark:border-white/5">
          <button onClick={onClose} className="btn-ghost px-4 py-1.5 rounded-macos text-[13px] font-medium">
            取消
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || !title.trim() || isUploading}
            className="btn-primary px-5 py-1.5 rounded-macos text-[13px] font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isUploading ? '上传中...' : '上传'}
          </button>
        </div>
      </div>
    </div>
  );
}
