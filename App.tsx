
import React, { useState, useCallback, useEffect } from 'react';
import { GestureCamera } from './components/GestureCamera';
import { PresentationView } from './components/PresentationView';
import { UploadOverlay } from './components/UploadOverlay';
import { Sidebar } from './components/Sidebar';
import { GridView } from './components/GridView';
import { GestureType, ViewMode } from './types';

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('upload');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [totalSlides, setTotalSlides] = useState(0);
  const [isCooldown, setIsCooldown] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(true); 
  const [isCameraPreviewVisible, setIsCameraPreviewVisible] = useState(true); 
  const [isFlipped, setIsFlipped] = useState(true);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  const COOLDOWN_MS = 1500; 

  const triggerCooldown = () => {
    setIsCooldown(true);
    setTimeout(() => {
      setIsCooldown(false);
    }, COOLDOWN_MS);
  };

  // 基础翻页逻辑：纯粹的状态更新
  const handleNext = useCallback(() => {
    setCurrentSlide(prev => {
        if (totalSlides > 0 && prev < totalSlides - 1) {
            return prev + 1;
        }
        return prev;
    });
  }, [totalSlides]);

  const handlePrev = useCallback(() => {
    setCurrentSlide(prev => {
        if (prev > 0) {
            return prev - 1;
        }
        return prev;
    });
  }, []);

  // 手势识别逻辑：仅手势触发时才应用 Cooldown
  const onGestureDetected = useCallback((gesture: GestureType) => {
    if (viewMode !== 'present' || isCooldown || !isCameraActive) return;
    if (gesture === GestureType.NEXT) {
      handleNext();
      triggerCooldown(); // 仅手势触发冷却
    } else if (gesture === GestureType.PREV) {
      handlePrev();
      triggerCooldown(); // 仅手势触发冷却
    }
  }, [handleNext, handlePrev, viewMode, isCooldown, isCameraActive]);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setViewMode('preview');
    setIsSidebarVisible(true);
  };

  const handleSelectSlide = (index: number) => {
    setCurrentSlide(index);
    setViewMode('present');
    setIsSidebarVisible(false);
  };

  const handleBackToPreview = () => {
    setViewMode('preview');
    setIsSidebarVisible(true);
  };

  return (
    <div className="relative w-full h-screen bg-zinc-950 text-zinc-100 flex overflow-hidden font-sans">
      {(viewMode === 'preview' || (viewMode === 'present' && isSidebarVisible)) && (
        <div className={`${viewMode === 'present' ? 'absolute inset-y-0 left-0 z-[60]' : 'relative'}`}>
          <Sidebar 
            currentSlide={currentSlide} 
            totalSlides={totalSlides} 
            isCameraActive={isCameraActive}
            setIsCameraActive={(val) => {
              setIsCameraActive(val);
              if (val) setIsCameraPreviewVisible(true); 
            }}
            isFlipped={isFlipped}
            setIsFlipped={setIsFlipped}
            viewMode={viewMode}
            onBack={handleBackToPreview}
            onClose={() => setIsSidebarVisible(false)}
            onExit={() => { setFile(null); setViewMode('upload'); setCurrentSlide(0); }}
          />
        </div>
      )}

      <main className={`flex-1 relative flex items-center justify-center bg-black overflow-hidden transition-all duration-500`}>
        {viewMode === 'upload' && <UploadOverlay onFileSelect={handleFileSelect} />}
        
        {viewMode === 'preview' && file && (
          <GridView 
            file={file} 
            onSelectSlide={handleSelectSlide} 
            onTotalSlidesDetected={setTotalSlides}
          />
        )}

        {viewMode === 'present' && file && (
          <PresentationView 
            file={file} 
            currentSlide={currentSlide} 
            onTotalSlidesDetected={setTotalSlides} 
            onNext={handleNext}
            onPrev={handlePrev}
            isCooldown={isCooldown}
          />
        )}

        {viewMode === 'present' && !isSidebarVisible && (
          <button 
            onClick={() => setIsSidebarVisible(true)}
            className="absolute bottom-6 left-6 w-12 h-12 rounded-full bg-zinc-900/80 backdrop-blur-md border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all z-50 flex items-center justify-center group shadow-xl"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
        )}

        {isCameraActive && viewMode === 'present' && (
          <>
            <div 
              className={`absolute bottom-6 right-6 w-64 aspect-video rounded-2xl overflow-hidden border-2 border-zinc-700 shadow-2xl bg-zinc-900 z-50 transition-all duration-500 origin-bottom-right ${
                isCameraPreviewVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
              }`}
            >
               <GestureCamera 
                  onGesture={onGestureDetected} 
                  isFlipped={isFlipped}
                  isCooldown={isCooldown}
                  onClose={() => setIsCameraPreviewVisible(false)}
               />
            </div>

            {!isCameraPreviewVisible && (
              <button 
                onClick={() => setIsCameraPreviewVisible(true)}
                className="absolute bottom-6 right-6 w-12 h-12 rounded-full bg-zinc-900/80 backdrop-blur-md border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all z-50 flex items-center justify-center group overflow-hidden shadow-xl"
                title="Show Camera Preview"
              >
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <svg className="w-5 h-5 relative" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                </svg>
              </button>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;
