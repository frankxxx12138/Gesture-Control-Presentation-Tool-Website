
import React, { useRef, useEffect } from 'react';
import { GestureType } from '../types';

interface GestureCameraProps {
  onGesture: (gesture: GestureType) => void;
  isFlipped: boolean;
  isCooldown: boolean;
  onClose: () => void;
}

declare const Hands: any;
declare const Camera: any;
declare const drawConnectors: any;
declare const drawLandmarks: any;
declare const HAND_CONNECTIONS: any;

export const GestureCamera: React.FC<GestureCameraProps> = ({ onGesture, isFlipped, isCooldown, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const historyRef = useRef<{x: number, y: number, time: number}[]>([]);
  const handsRef = useRef<any>(null);
  const isClosingRef = useRef(false);
  
  // 响指检测相关的 Ref
  const lastPinchTimeRef = useRef<number>(0);
  const isPinchingRef = useRef<boolean>(false);
  const snapEffectRef = useRef<{time: number, x: number, y: number} | null>(null);

  const propsRef = useRef({ onGesture, isFlipped, isCooldown });
  useEffect(() => {
    propsRef.current = { onGesture, isFlipped, isCooldown };
  }, [onGesture, isFlipped, isCooldown]);

  useEffect(() => {
    if (!videoRef.current || !canvasRef.current) return;
    
    isClosingRef.current = false;
    const videoElement = videoRef.current;
    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext('2d');

    const hands = new Hands({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.6
    });

    hands.onResults((results: any) => {
      if (isClosingRef.current || !canvasCtx) return;

      const { isCooldown: cooldownActive, isFlipped: flipped, onGesture: trigger } = propsRef.current;
      const now = Date.now();

      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      
      if (flipped) {
        canvasCtx.save();
        canvasCtx.translate(canvasElement.width, 0);
        canvasCtx.scale(-1, 1);
      }
      
      canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        const wrist = landmarks[0]; 
        const thumbTip = landmarks[4];
        const middleTip = landmarks[12];

        // 绘制骨架
        drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, { color: '#3b82f6', lineWidth: 4 });
        drawLandmarks(canvasCtx, landmarks, { color: '#ffffff', lineWidth: 1, radius: 2 });

        if (!cooldownActive) {
          // --- 挥手检测逻辑 (基于手腕坐标) ---
          historyRef.current.push({ x: wrist.x, y: wrist.y, time: now });
          if (historyRef.current.length > 25) historyRef.current.shift();

          // 绘制轨迹反馈
          canvasCtx.beginPath();
          canvasCtx.strokeStyle = 'rgba(59, 130, 246, 0.8)';
          canvasCtx.lineWidth = 5;
          canvasCtx.lineCap = 'round';
          historyRef.current.forEach((p, i) => {
            const px = p.x * canvasElement.width;
            const py = p.y * canvasElement.height;
            if (i === 0) canvasCtx.moveTo(px, py);
            else canvasCtx.lineTo(px, py);
          });
          canvasCtx.stroke();

          // 1. 挥手判定
          if (historyRef.current.length >= 10) {
            const start = historyRef.current[0];
            const end = historyRef.current[historyRef.current.length - 1];
            const duration = end.time - start.time;

            if (duration < 600) {
              const dx = end.x - start.x;
              const dy = Math.abs(end.y - start.y);
              const threshold = 0.22;

              if (dy < 0.25) {
                const swipeScore = flipped ? dx : -dx;
                if (swipeScore > threshold) {
                  trigger(GestureType.NEXT);
                  historyRef.current = [];
                } else if (swipeScore < -threshold) {
                  trigger(GestureType.PREV);
                  historyRef.current = [];
                }
              }
            }
          }

          // --- 响指(Snap)检测逻辑 ---
          // 计算大拇指指尖和中指指尖的距离
          const pinchDist = Math.sqrt(
            Math.pow(thumbTip.x - middleTip.x, 2) + 
            Math.pow(thumbTip.y - middleTip.y, 2)
          );

          // 响指逻辑：快速捏合(距离极小)后立即弹开(距离变大)
          if (pinchDist < 0.05) {
            if (!isPinchingRef.current) {
              lastPinchTimeRef.current = now;
              isPinchingRef.current = true;
            }
          } else if (isPinchingRef.current && pinchDist > 0.15) {
            const timeSincePinch = now - lastPinchTimeRef.current;
            // 如果在 300ms 内完成捏合到弹开，视为响指
            if (timeSincePinch < 350) {
              trigger(GestureType.NEXT); // 响指映射为下一页
              isPinchingRef.current = false;
              historyRef.current = [];
              // 添加视觉反馈效果
              snapEffectRef.current = { time: now, x: thumbTip.x, y: thumbTip.y };
            }
            if (timeSincePinch > 600) isPinchingRef.current = false; // 超时重置
          }
        }
      } else {
        if (historyRef.current.length > 0) historyRef.current.shift();
        isPinchingRef.current = false;
      }

      // 绘制响指视觉特效
      if (snapEffectRef.current && now - snapEffectRef.current.time < 500) {
        const effect = snapEffectRef.current;
        const progress = (now - effect.time) / 500;
        canvasCtx.beginPath();
        canvasCtx.arc(effect.x * canvasElement.width, effect.y * canvasElement.height, 10 + progress * 50, 0, Math.PI * 2);
        canvasCtx.strokeStyle = `rgba(59, 130, 246, ${1 - progress})`;
        canvasCtx.lineWidth = 3;
        canvasCtx.stroke();
      }

      if (flipped) {
        canvasCtx.restore(); 
      }

      if (cooldownActive) {
        historyRef.current = []; 
        canvasCtx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);
        canvasCtx.fillStyle = '#3b82f6';
        canvasCtx.font = 'bold 24px "Inter", sans-serif';
        canvasCtx.textAlign = 'center';
        canvasCtx.textBaseline = 'middle';
        canvasCtx.fillText('SYNCING...', canvasElement.width / 2, canvasElement.height / 2);
      }
      
      canvasCtx.restore();
    });

    handsRef.current = hands;

    const camera = new Camera(videoElement, {
      onFrame: async () => {
        if (isClosingRef.current || !handsRef.current) return;
        try {
          await handsRef.current.send({ image: videoElement });
        } catch (e) {}
      },
      width: 640,
      height: 480
    });

    camera.start();

    return () => {
      isClosingRef.current = true;
      if (camera) camera.stop().catch(() => {});
      if (handsRef.current) {
        const h = handsRef.current;
        handsRef.current = null;
        setTimeout(() => h.close(), 100);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden group/camera">
      <video ref={videoRef} className="hidden" playsInline muted />
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        className="w-full h-full object-cover"
      />
      
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-2 left-2 w-7 h-7 bg-zinc-900/80 backdrop-blur-md rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-red-500/80 border border-zinc-700/50 opacity-0 group-hover/camera:opacity-100 transition-all duration-300 shadow-lg z-50"
        title="Hide Preview"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-0.5 bg-black/40 backdrop-blur-md rounded-full border border-white/5 pointer-events-none">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest">Vision Live</span>
      </div>
    </div>
  );
};
