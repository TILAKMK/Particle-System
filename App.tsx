
import React, { useState, useCallback } from 'react';
import ParticleEngine from './components/ParticleEngine';
import Sidebar from './components/Sidebar';
import HandTracker from './components/HandTracker';
import { DEFAULT_CONFIGS } from './constants';
import { ParticleConfig, Vector } from './types';

const App: React.FC = () => {
  const [config, setConfig] = useState<ParticleConfig>(DEFAULT_CONFIGS[0]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isHandTrackingEnabled, setIsHandTrackingEnabled] = useState(false);
  const [handPos, setHandPos] = useState<Vector>({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [isPinching, setIsPinching] = useState(false);

  const handleHandUpdate = useCallback((pos: Vector, pinching: boolean) => {
    setHandPos(pos);
    setIsPinching(pinching);
  }, []);

  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden">
      {/* Background Simulation */}
      <ParticleEngine 
        config={config} 
        externalPos={isHandTrackingEnabled ? handPos : undefined}
        isInteractionActive={isPinching}
      />

      {/* Main UI */}
      <div className="relative z-10 w-full h-full">
        {isSidebarOpen ? (
          <Sidebar 
            config={config} 
            onChange={setConfig} 
            presets={DEFAULT_CONFIGS}
            onPresetSelect={(p) => setConfig(p)}
            isHandTrackingEnabled={isHandTrackingEnabled}
            onToggleHandTracking={() => setIsHandTrackingEnabled(!isHandTrackingEnabled)}
          />
        ) : (
          <div className="fixed top-6 left-6 flex gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-4 bg-slate-900/90 backdrop-blur-xl text-white rounded-2xl border border-slate-700/50 hover:bg-slate-800 transition-all shadow-2xl flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
              <span className="text-xs font-bold uppercase tracking-widest hidden md:inline">Controls</span>
            </button>
            <button 
              onClick={() => setIsHandTrackingEnabled(!isHandTrackingEnabled)}
              className={`p-4 backdrop-blur-xl rounded-2xl border transition-all shadow-2xl ${isHandTrackingEnabled ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-900/90 border-slate-700 text-slate-400'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            </button>
          </div>
        )}

        <HandTracker 
          isEnabled={isHandTrackingEnabled} 
          onHandUpdate={handleHandUpdate} 
        />

        {/* Status Overlay */}
        <div className="fixed bottom-6 right-6 p-6 bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-slate-800/50 text-right pointer-events-none group">
          <h2 className="text-2xl font-black text-white mb-1 uppercase tracking-tighter italic">{config.name}</h2>
          <div className="flex flex-col items-end gap-1">
             <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${isHandTrackingEnabled ? 'bg-blue-500 animate-pulse' : 'bg-slate-600'}`}></span>
                <p className="text-[10px] text-slate-400 font-bold tracking-[0.2em] uppercase">
                  {isHandTrackingEnabled ? (isPinching ? 'ATTRACT MODE' : 'CURSOR: HAND') : 'CURSOR: MOUSE'}
                </p>
             </div>
             <p className="text-[10px] text-slate-500 tracking-widest uppercase">
               Engines Active • {config.count} Particles
             </p>
          </div>
        </div>

        {/* Visual Guide for Hands */}
        {!isHandTrackingEnabled && (
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-5">
            <div className="w-64 h-64 border-2 border-dashed border-slate-500 rounded-full animate-spin-slow"></div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default App;
