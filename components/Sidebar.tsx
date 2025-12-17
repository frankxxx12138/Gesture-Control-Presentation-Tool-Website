
import React from 'react';
import { ViewMode } from '../types';

interface SidebarProps {
  currentSlide: number;
  totalSlides: number;
  isCameraActive: boolean;
  setIsCameraActive: (val: boolean) => void;
  isFlipped: boolean;
  setIsFlipped: (val: boolean) => void;
  viewMode: ViewMode;
  onBack: () => void;
  onClose?: () => void;
  onExit: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentSlide, 
  totalSlides, 
  isCameraActive, 
  setIsCameraActive,
  isFlipped,
  setIsFlipped,
  viewMode,
  onBack,
  onClose,
  onExit
}) => {
  return (
    <aside className="h-full w-80 bg-zinc-900/95 border-r border-zinc-800 p-6 flex flex-col gap-8 z-[100] backdrop-blur-2xl shadow-2xl transition-all duration-300">
       {/* Top Navigation Row - Now only contains Exit */}
       <div className="flex items-center justify-between">
          <button 
            onClick={onExit}
            className="group flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 text-zinc-400 hover:bg-red-500/10 hover:text-red-500 transition-all border border-zinc-700/50 hover:border-red-500/30"
            title="Exit to Upload"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            <span className="text-xs font-bold uppercase tracking-wider">Exit</span>
          </button>
       </div>

       {/* Branding & Status */}
       <div>
          <h1 className="text-xl font-black tracking-tighter text-white flex items-center gap-2">
             <span className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-[10px]">G</span>
             GESTURE TOOL
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold">Presenter Pro</p>
            <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
            <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest animate-pulse">Live</span>
          </div>
       </div>

       {/* View Mode Actions - Overview Grid stays here */}
       {viewMode === 'present' && (
         <button 
           onClick={onBack}
           className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 hover:bg-blue-600/20 hover:border-blue-500/40 transition-all font-bold text-sm shadow-inner"
         >
           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
           Overview Grid
         </button>
       )}

       {/* Statistics/Progress */}
       <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-zinc-950/50 border border-zinc-800/50 shadow-sm">
             <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-2 flex justify-between">
                <span>Slide Progress</span>
                <span className="text-zinc-600 font-mono">{viewMode === 'present' ? currentSlide + 1 : '0'}/{totalSlides}</span>
             </div>
             <div className="flex items-baseline gap-1">
                <span className="text-4xl font-mono font-black text-white">
                  {viewMode === 'present' ? String(currentSlide + 1).padStart(2, '0') : '--'}
                </span>
                <span className="text-zinc-600 font-mono text-sm">/ {totalSlides || '--'}</span>
             </div>
             <div className="w-full bg-zinc-900 h-1.5 rounded-full mt-4 overflow-hidden border border-zinc-800">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-blue-400 h-full transition-all duration-700 ease-out" 
                  style={{ width: `${totalSlides && viewMode === 'present' ? ((currentSlide + 1) / totalSlides) * 100 : 0}%` }}
                ></div>
             </div>
          </div>
       </div>

       {/* Primary Controls */}
       <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pr-2">
          <div className="space-y-3">
             <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest px-1">Vision Engine</div>
             
             <button 
                onClick={() => setIsCameraActive(!isCameraActive)}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border transition-all ${
                  isCameraActive 
                    ? 'bg-zinc-800/80 border-zinc-700 text-white shadow-sm' 
                    : 'bg-red-500/5 border-red-500/20 text-red-400'
                }`}
             >
                <div className="flex flex-col items-start">
                  <span className="text-sm font-bold">Gesture Tracking</span>
                  <span className="text-[9px] text-zinc-500 uppercase tracking-tighter">{isCameraActive ? 'Active' : 'Disabled'}</span>
                </div>
                <div className={`w-10 h-5 rounded-full relative transition-colors ${isCameraActive ? 'bg-blue-600' : 'bg-zinc-700'}`}>
                   <div className={`absolute top-1 w-3 h-3 rounded-full bg-white shadow-lg transition-all ${isCameraActive ? 'left-6' : 'left-1'}`}></div>
                </div>
             </button>

             <button 
                onClick={() => setIsFlipped(!isFlipped)}
                className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl border border-zinc-800 bg-zinc-800/40 text-zinc-300 hover:border-zinc-700 hover:text-white transition-all"
             >
                <span className="text-sm font-medium">Mirror Feedback</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${isFlipped ? 'bg-blue-500/20 text-blue-400' : 'bg-zinc-700 text-zinc-500'}`}>
                  {isFlipped ? 'ON' : 'OFF'}
                </span>
             </button>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-800/20 border border-zinc-800/40 space-y-4">
             <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest px-1">Control Map</div>
             <div className="space-y-4 text-xs">
                <div className="flex items-center gap-3 group">
                   <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono text-blue-400 text-lg group-hover:border-blue-500/30 transition-colors">←</div>
                   <div className="flex flex-col">
                      <span className="text-zinc-300 font-bold">Previous Page</span>
                      <span className="text-[10px] text-zinc-500 italic">Swipe to left edge</span>
                   </div>
                </div>
                <div className="flex items-center gap-3 group">
                   <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono text-emerald-400 text-lg group-hover:border-emerald-500/30 transition-colors">→</div>
                   <div className="flex flex-col">
                      <span className="text-zinc-300 font-bold">Next Page</span>
                      <span className="text-[10px] text-zinc-500 italic">Swipe right OR <b>Snap Finger</b></span>
                   </div>
                </div>
             </div>
          </div>
       </div>

       {/* Footer - Only Contains Hide Menu Button */}
       <div className="pt-6 border-t border-zinc-800/60 mt-auto">
          {viewMode === 'present' && onClose && (
            <button 
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white border border-zinc-700/50 transition-all font-bold text-xs uppercase tracking-widest shadow-lg group"
            >
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/>
              </svg>
              Hide Menu Bar
            </button>
          )}
       </div>
    </aside>
  );
};
