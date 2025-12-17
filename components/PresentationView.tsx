
import React, { useEffect, useRef, useState } from 'react';

interface PresentationViewProps {
  file: File;
  currentSlide: number;
  onTotalSlidesDetected: (total: number) => void;
  onNext: () => void;
  onPrev: () => void;
  isCooldown: boolean;
}

declare const pdfjsLib: any;

export const PresentationView: React.FC<PresentationViewProps> = ({ 
  file, 
  currentSlide, 
  onTotalSlidesDetected, 
  onNext, 
  onPrev,
  isCooldown
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfDocRef = useRef<any>(null);
  const renderTaskRef = useRef<any>(null);

  useEffect(() => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    const loadPdf = async () => {
      setLoading(true);
      try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        pdfDocRef.current = pdf;
        onTotalSlidesDetected(pdf.numPages);
        setLoading(false);
      } catch (err) {
        console.error("PDF Load Error:", err);
        setError("无法解析 PDF 文件，请确保文件格式正确。");
        setLoading(false);
      }
    };

    loadPdf();
  }, [file, onTotalSlidesDetected]);

  const renderPage = async () => {
    if (!pdfDocRef.current || loading) return;

    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
    }

    try {
      const page = await pdfDocRef.current.getPage(currentSlide + 1);
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const context = canvas.getContext('2d');
      if (!context) return;

      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      const unscaledViewport = page.getViewport({ scale: 1 });
      const scale = Math.min(
        containerWidth / unscaledViewport.width, 
        containerHeight / unscaledViewport.height
      ) * 0.98;
      const viewport = page.getViewport({ scale });

      const dpr = window.devicePixelRatio || 1;
      canvas.width = viewport.width * dpr;
      canvas.height = viewport.height * dpr;
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;

      context.scale(dpr, dpr);

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      const renderTask = page.render(renderContext);
      renderTaskRef.current = renderTask;
      await renderTask.promise;
    } catch (err) {
      if (err.name !== 'RenderingCancelledException') {
        console.error("Render Error:", err);
      }
    }
  };

  useEffect(() => {
    renderPage();
  }, [currentSlide, loading]);

  useEffect(() => {
    const handleResize = () => {
      renderPage();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentSlide, loading]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-6">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
        <p className="text-zinc-400 font-medium tracking-widest animate-pulse text-xs">PREPARING SLIDES...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-12 bg-zinc-900 rounded-3xl border border-zinc-800">
        <div className="text-red-500 text-3xl mb-4">⚠️</div>
        <p className="text-zinc-300 text-sm">{error}</p>
      </div>
    );
  }

  /**
   * 精简版高质感玻璃胶囊
   * 缩小了体积(px-0.5 py-0.5)，降低了非悬停透明度(opacity-10)
   * 移除了扩散性的底部大阴影，改为紧凑的阴影
   */
  const glassCapsuleStyle = `
    group/capsule
    relative
    flex items-center gap-1 px-1 py-1 rounded-full
    bg-white/[0.15]
    backdrop-blur-[40px]
    border border-white/40
    shadow-[0_8px_32px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.4)]
    transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]
    opacity-10 hover:opacity-100
    hover:scale-[1.05]
  `;

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center bg-black overflow-hidden relative">
      <div className="relative">
        <canvas 
          ref={canvasRef} 
          className="rounded-sm bg-white shadow-2xl"
        />
        
        {/* 精简高质感控制条 */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50">
          <div className={glassCapsuleStyle}>
            
            {/* Previous Button */}
            <button 
              onClick={(e) => { e.stopPropagation(); onPrev(); }}
              disabled={currentSlide === 0}
              className={`
                w-10 h-10 rounded-full flex items-center justify-center text-white relative z-10
                transition-all duration-300
                ${currentSlide === 0 ? 'opacity-5 grayscale cursor-not-allowed' : 'hover:bg-white/20 active:scale-90 opacity-100'}
              `}
            >
              <svg className="w-5 h-5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M15 18l-6-6 6-6" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* Page Indicator: 缩小字体，hover才显现 */}
            <div className="px-3 flex items-center justify-center min-w-[140px] border-x border-white/20 relative z-10">
              <div className="text-white select-none flex items-center gap-1.5 opacity-0 group-hover/capsule:opacity-100 transition-opacity duration-500">
                <span className="opacity-70 uppercase text-[9px] font-black tracking-tighter">PAGE</span>
                <div className="flex items-center font-black">
                   <span className="text-base text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
                     {String(currentSlide + 1).padStart(2, '0')}
                   </span>
                   <span className="mx-1.5 opacity-30 text-xs font-light">/</span>
                   <span className="opacity-50 text-xs">
                     {pdfDocRef.current?.numPages}
                   </span>
                </div>
              </div>
              
              {/* 未悬停时的极简圆点 */}
              <div className="absolute inset-0 flex items-center justify-center opacity-100 group-hover/capsule:opacity-0 transition-opacity">
                <div className="w-1.5 h-1.5 rounded-full bg-white/60 shadow-sm"></div>
              </div>
            </div>

            {/* Next Button (右箭头) */}
            <button 
              onClick={(e) => { e.stopPropagation(); onNext(); }}
              disabled={currentSlide === (pdfDocRef.current?.numPages - 1)}
              className={`
                w-10 h-10 rounded-full flex items-center justify-center text-white relative z-10
                transition-all duration-300
                ${currentSlide === (pdfDocRef.current?.numPages - 1) ? 'opacity-5 grayscale cursor-not-allowed' : 'hover:bg-white/20 active:scale-90 opacity-100'}
              `}
            >
              <svg className="w-5 h-5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 18l6-6-6-6" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};
