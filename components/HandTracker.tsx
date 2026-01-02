
import React, { useEffect, useRef, useState } from 'react';
import { Vector } from '../types';

interface HandTrackerProps {
  onHandUpdate: (pos: Vector, isPinching: boolean) => void;
  isEnabled: boolean;
}

const HandTracker: React.FC<HandTrackerProps> = ({ onHandUpdate, isEnabled }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  useEffect(() => {
    if (!isEnabled) return;

    let hands: any;
    let camera: any;

    const onResults = (results: any) => {
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        
        // Index finger tip is landmark 8
        const indexTip = landmarks[8];
        const thumbTip = landmarks[4];

        // Convert normalized coordinates to pixel coordinates
        const x = (1 - indexTip.x) * window.innerWidth;
        const y = indexTip.y * window.innerHeight;

        // Calculate distance between index tip and thumb tip for pinch gesture
        const dx = indexTip.x - thumbTip.x;
        const dy = indexTip.y - thumbTip.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Threshold for pinch gesture
        const isPinching = dist < 0.05;

        onHandUpdate({ x, y }, isPinching);

        // Preview rendering
        if (canvasRef.current) {
          const canvasCtx = canvasRef.current.getContext('2d');
          if (canvasCtx) {
            canvasCtx.save();
            canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            // @ts-ignore
            window.drawConnectors(canvasCtx, landmarks, window.HAND_CONNECTIONS, { color: '#3b82f6', lineWidth: 2 });
            // @ts-ignore
            window.drawLandmarks(canvasCtx, landmarks, { color: isPinching ? '#f43f5e' : '#10b981', lineWidth: 1, radius: 2 });
            canvasCtx.restore();
          }
        }
      }
    };

    // @ts-ignore
    hands = new window.Hands({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    hands.onResults(onResults);

    if (videoRef.current) {
      // @ts-ignore
      camera = new window.Camera(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current) {
            await hands.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480
      });
      camera.start().then(() => setIsCameraReady(true));
    }

    return () => {
      if (camera) camera.stop();
      if (hands) hands.close();
    };
  }, [isEnabled, onHandUpdate]);

  return (
    <div className={`fixed bottom-6 left-6 z-20 transition-opacity duration-500 ${isEnabled ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="relative w-48 h-36 bg-slate-900/90 border border-slate-700/50 rounded-xl overflow-hidden shadow-2xl backdrop-blur-xl">
        <video ref={videoRef} className="hidden" playsInline muted />
        <canvas ref={canvasRef} className="w-full h-full transform scale-x-[-1]" width={640} height={480} />
        {!isCameraReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-slate-400 gap-2">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[10px] uppercase tracking-widest font-bold">Waking Up Sensor</span>
          </div>
        )}
      </div>
      <div className="mt-3 flex items-center justify-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isCameraReady ? 'bg-green-500 animate-pulse' : 'bg-slate-700'}`}></div>
        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
          Hand Input: {isCameraReady ? 'Live' : 'Pending'}
        </div>
      </div>
    </div>
  );
};

export default HandTracker;
