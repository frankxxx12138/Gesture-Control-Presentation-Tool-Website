
import React, { useState } from 'react';

interface UploadOverlayProps {
  onFileSelect: (file: File) => void;
}

export const UploadOverlay: React.FC<UploadOverlayProps> = ({ onFileSelect }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].name.toLowerCase().endsWith('.pdf')) {
      onFileSelect(files[0]);
    } else {
      alert("请上传 PDF 格式的幻灯片文件以获得最佳显示效果。");
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  return (
    <div 
      className={`
        w-full h-full flex flex-col items-center justify-center p-12 transition-all duration-300
        ${isDragging ? 'bg-blue-600/10 scale-[1.02]' : 'bg-transparent'}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className={`
        max-w-xl w-full border-2 border-dashed rounded-[2rem] p-16 text-center flex flex-col items-center gap-8 transition-all
        ${isDragging ? 'border-blue-500 bg-blue-500/5 shadow-2xl shadow-blue-500/10' : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'}
      `}>
        <div className="w-24 h-24 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-3xl flex items-center justify-center shadow-2xl border border-zinc-700/50">
           <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
           </svg>
        </div>
        
        <div className="space-y-3">
           <h2 className="text-3xl font-black text-white">Upload Your Slides</h2>
           <p className="text-zinc-500 text-sm max-w-xs mx-auto leading-relaxed">
             Drop your <span className="text-blue-400 font-bold">PDF presentation</span> here to enable AI hand-gesture control.
           </p>
        </div>

        <label className="group relative cursor-pointer">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-200"></div>
          <div className="relative bg-zinc-100 text-zinc-950 px-10 py-4 rounded-full font-bold hover:bg-white transition-all flex items-center gap-2">
            <span>Select PDF</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="2" strokeLinecap="round"/></svg>
          </div>
          <input 
            type="file" 
            className="hidden" 
            accept=".pdf" 
            onChange={handleFileInput}
          />
        </label>
        
        <div className="grid grid-cols-2 gap-6 mt-4">
            <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> High Definition
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Gesture Sync
            </div>
        </div>
      </div>
    </div>
  );
};
