import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon, Type, Loader2, AlertCircle, Pencil } from 'lucide-react';
import { cn } from '../lib/utils';

interface UploadZoneProps {
  onProcess: (input: string | { mimeType: string; data: string }) => Promise<void>;
  isProcessing: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onProcess, isProcessing }) => {
  const [textInput, setTextInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setError(null);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      try {
        await onProcess({ mimeType: file.type, data: base64 });
      } catch (err: any) {
        setError(err.message || '哎呀，图片处理失败了，请再试一次吧！');
      }
    };
    reader.readAsDataURL(file);
  }, [onProcess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png'] },
    multiple: false,
    disabled: isProcessing
  } as any);

  const handleTextSubmit = async () => {
    if (!textInput.trim()) return;
    setError(null);
    try {
      await onProcess(textInput);
      setTextInput('');
    } catch (err: any) {
      setError(err.message || '文字处理出错了，请检查一下单词哦！');
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-12 py-12 px-6">
      <div className="text-center space-y-4">
        <h2 className="text-5xl font-bold text-primary tracking-wide">宝贝的单词加油站</h2>
        <p className="text-text-sub text-xl font-bold">把要背的单词写下来，或者拍张照片发给我吧！</p>
      </div>

      <div className="grid gap-10 md:grid-cols-2">
        {/* Text Input */}
        <div className="flex flex-col space-y-6 rounded-[40px] border-4 border-border-main bg-white p-8 bubble-shadow transition-all hover:translate-y-[-4px]">
          <div className="flex items-center gap-3 text-secondary">
            <Pencil size={28} />
            <h3 className="text-2xl font-bold">手写输入</h3>
          </div>
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="在这里输入单词，比如：apple, banana..."
            className="flex-1 min-h-[200px] w-full rounded-3xl border-4 border-border-main bg-bg-main p-6 text-lg font-bold text-text-main focus:border-secondary focus:ring-0 outline-none transition-all placeholder:text-text-sub/40"
            disabled={isProcessing}
          />
          <button
            onClick={handleTextSubmit}
            disabled={isProcessing || !textInput.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-3xl bg-secondary py-5 text-xl font-black text-white transition-all hover:opacity-90 disabled:opacity-50 bubble-shadow"
          >
            {isProcessing ? <Loader2 className="animate-spin" size={24} /> : '开始变魔术'}
          </button>
        </div>

        {/* Image Upload */}
        <div
          {...getRootProps()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center space-y-8 rounded-[40px] border-4 border-dashed p-8 transition-all bubble-shadow",
            isDragActive ? "border-primary bg-primary/5" : "border-border-main bg-white hover:border-primary/50 hover:bg-bg-main",
            isProcessing && "pointer-events-none opacity-50"
          )}
        >
          <input {...getInputProps()} />
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-primary animate-bounce">
            <ImageIcon size={48} />
          </div>
          <div className="text-center space-y-3">
            <p className="text-2xl font-bold text-text-main">拍张照片上传</p>
            <p className="text-base font-bold text-text-sub">把书上的单词拍下来就行啦</p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border-4 border-border-main px-8 py-4 text-lg font-black text-text-sub transition-all hover:border-primary hover:text-primary bg-white">
            <Upload size={20} />
            <span>选择照片</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-3xl bg-red-50 p-6 text-lg font-bold text-red-600 border-4 border-red-100">
          <AlertCircle size={24} />
          <p>{error}</p>
        </div>
      )}

      {isProcessing && (
        <div className="flex flex-col items-center justify-center space-y-8 py-12">
          <div className="relative">
            <Loader2 className="h-20 w-20 animate-spin text-primary" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-10 w-10 rounded-full bg-primary/20 animate-ping" />
            </div>
          </div>
          <div className="text-center space-y-3">
            <p className="text-3xl font-bold text-primary animate-pulse">小助手正在努力学习中...</p>
            <p className="text-xl font-bold text-text-sub">正在为您把单词变成有趣的卡片</p>
          </div>
        </div>
      )}
    </div>
  );
};
