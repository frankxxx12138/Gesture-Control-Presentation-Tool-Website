
import React, { useEffect, useRef, useState } from 'react';

interface GridViewProps {
  file: File;
  onSelectSlide: (index: number) => void;
  onTotalSlidesDetected: (total: number) => void;
}

declare const pdfjsLib: any;

export const GridView: React.FC<GridViewProps> = ({ file, onSelectSlide, onTotalSlidesDetected }) => {
  const [loading, setLoading] = useState(true);
  const [totalSlides, setTotalSlides] = useState(0);
  const pdfDocRef = useRef<any>(null);

  useEffect(() => {
    const loadPdf = async () => {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      pdfDocRef.current = pdf;
      setTotalSlides(pdf.numPages);
      onTotalSlidesDetected(pdf.numPages);
      setLoading(false);
    };
    loadPdf();
  }, [file, onTotalSlidesDetected]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-zinc-500 font-medium tracking-widest uppercase text-xs">Generating Previews...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto p-12 custom-scrollbar bg-zinc-950">
      <header className="max-w-7xl mx-auto mb-12 flex items-end justify-between">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tight">Slide Overview</h2>
          <p className="text-zinc-500 mt-2 font-medium">Select a slide to start your presentation</p>
        </div>
        <div className="text-zinc-600 font-mono text-sm">
          {totalSlides} SLIDERS DETECTED
        </div>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {Array.from({ length: totalSlides }).map((_, index) => (
          <Thumbnail 
            key={index} 
            index={index} 
            pdf={pdfDocRef.current} 
            onClick={() => onSelectSlide(index)} 
          />
        ))}
      </div>
    </div>
  );
};

interface ThumbnailProps {
  index: number;
  pdf: any;
  onClick: () => void;
}

const Thumbnail: React.FC<ThumbnailProps> = ({ index, pdf, onClick }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    const renderThumbnail = async () => {
      if (!pdf || rendered) return;
      try {
        const page = await pdf.getPage(index + 1);
        const canvas = canvasRef.current;
        if (!canvas) return;

        const viewport = page.getViewport({ scale: 0.5 });
        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;
        setRendered(true);
      } catch (err) {
        console.error("Thumbnail render error", err);
      }
    };
    renderThumbnail();
  }, [pdf, index, rendered]);

  return (
    <button 
      onClick={onClick}
      className="group relative flex flex-col gap-3 text-left focus:outline-none"
    >
      <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 transition-all duration-300 group-hover:border-blue-500/50 group-hover:shadow-[0_0_30px_-10px_rgba(59,130,246,0.3)] group-hover:-translate-y-1">
        <canvas 
          ref={canvasRef} 
          className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
           <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center shadow-xl transform scale-75 group-hover:scale-100 transition-transform">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M4.5 3a.5.5 0 00-.5.5v13a.5.5 0 00.81.39l11-6.5a.5.5 0 000-.78l-11-6.5A.5.5 0 004.5 3z"/></svg>
           </div>
        </div>
        <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[10px] font-bold text-white/80 border border-white/10 tracking-widest">
           {String(index + 1).padStart(2, '0')}
        </div>
      </div>
      <div className="px-1">
        <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest group-hover:text-blue-400 transition-colors">Slide {index + 1}</div>
      </div>
    </button>
  );
};
