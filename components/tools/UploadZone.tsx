'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface UploadZoneProps {
  title?: string;
  description?: string;
  onImageChange: (dataUrl: string | null) => void;
  previewUrl?: string | null;
}

export default function UploadZone({
  title = '点击或拖拽上传图片',
  description = '支持 JPG, PNG 格式，文件大小不超过 10MB',
  onImageChange,
  previewUrl: externalPreview,
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [internalPreview, setInternalPreview] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const previewUrl = externalPreview || internalPreview;

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setInternalPreview(url);
      onImageChange(url);
    };
    reader.readAsDataURL(file);
  }, [onImageChange]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer?.files;
    if (files?.length) handleFile(files[0]);
  }, [handleFile]);

  const onFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length) handleFile(files[0]);
  }, [handleFile]);

  const clear = useCallback(() => {
    setInternalPreview(null);
    onImageChange(null);
    if (fileInput.current) fileInput.current.value = '';
  }, [onImageChange]);

  if (previewUrl) {
    return (
      <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-900/50 group">
        <img src={previewUrl} alt="预览" className="w-full h-auto max-h-[500px] object-contain" />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
          <button onClick={clear} className="p-3 bg-red-500/80 hover:bg-red-500 rounded-full text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
          <button onClick={() => fileInput.current?.click()} className="p-3 bg-indigo-500/80 hover:bg-indigo-500 rounded-full text-white transition-colors">
            <ImageIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-xs text-white/80">
          预览图
        </div>
        <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={onFileSelect} />
      </div>
    );
  }

  return (
    <div
      onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      onClick={() => fileInput.current?.click()}
      className={`relative group cursor-pointer border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center transition-all duration-300 ${
        isDragging ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 hover:border-indigo-500/50 hover:bg-white/5'
      }`}
    >
      <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={onFileSelect} />

      <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
        <Upload className="w-8 h-8 text-indigo-400" />
      </div>

      <h3 className="text-lg font-medium text-slate-200 mb-2">{title}</h3>
      <p className="text-sm text-slate-400 text-center max-w-xs">{description}</p>

      <div className="mt-6 px-4 py-2 bg-slate-800 rounded-lg text-xs font-mono text-slate-500">
        DRAG & DROP ZONE
      </div>
    </div>
  );
}
