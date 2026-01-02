
import React, { useState } from 'react';
import { ParticleConfig, BehaviorType } from '../types';
import { generatePreset } from '../services/geminiService';

interface SidebarProps {
  config: ParticleConfig;
  onChange: (newConfig: ParticleConfig) => void;
  presets: ParticleConfig[];
  onPresetSelect: (p: ParticleConfig) => void;
  isHandTrackingEnabled: boolean;
  onToggleHandTracking: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  config, onChange, presets, onPresetSelect, 
  isHandTrackingEnabled, onToggleHandTracking 
}) => {
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const generated = await generatePreset(aiPrompt);
      const newConfig: ParticleConfig = {
        ...config,
        ...generated,
        id: `ai-${Date.now()}`,
      } as ParticleConfig;
      onChange(newConfig);
      setAiPrompt('');
    } catch (err) {
      alert("Failed to generate preset. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const updateField = <K extends keyof ParticleConfig>(key: K, value: ParticleConfig[K]) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className={`fixed top-0 left-0 h-full bg-slate-900/90 backdrop-blur-2xl border-r border-slate-700/50 transition-all duration-300 z-10 flex flex-col ${isOpen ? 'w-80' : 'w-0 overflow-hidden'}`}>
      <div className="p-6 overflow-y-auto flex-1">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-bold text-white bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Nebula Editor
          </h1>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
        </div>

        {/* Hand Tracking Toggle */}
        <div className="mb-8 p-5 bg-slate-800/40 rounded-2xl border border-slate-700/50 shadow-inner">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              Hand Control
            </label>
            <button 
              onClick={onToggleHandTracking}
              className={`w-12 h-6 rounded-full transition-all relative ${isHandTrackingEnabled ? 'bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]' : 'bg-slate-700'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${isHandTrackingEnabled ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
          <p className="text-[10px] text-slate-500 font-medium leading-relaxed uppercase tracking-tight">
            Use your index finger to emit particles. Pinch (Thumb + Index) to trigger gravity well.
          </p>
        </div>

        {/* AI Generator */}
        <div className="mb-8 space-y-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dream with AI</label>
          <div className="relative">
            <input 
              type="text" 
              placeholder="e.g., 'Fire storm'..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all pr-12 placeholder:text-slate-600"
              onKeyDown={(e) => e.key === 'Enter' && handleAiGenerate()}
            />
            <button 
              onClick={handleAiGenerate}
              disabled={isGenerating}
              className="absolute right-2 top-2 p-1.5 bg-blue-600 hover:bg-blue-500 rounded-md text-white disabled:opacity-50 transition-colors"
            >
              {isGenerating ? (
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
              )}
            </button>
          </div>
        </div>

        {/* Presets */}
        <div className="mb-8">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">Library Presets</label>
          <div className="grid grid-cols-2 gap-2">
            {presets.map(p => (
              <button 
                key={p.id}
                onClick={() => onPresetSelect(p)}
                className={`text-xs p-2 rounded border transition-all ${config.id === p.id ? 'bg-blue-600/20 border-blue-500 text-blue-400 font-bold' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500'}`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-6">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Physics & Forces</label>
          
          <ControlItem label="Density" value={config.count} min={10} max={1000} onChange={v => updateField('count', v)} />
          <ControlItem label="Speed" value={config.speed} min={0.1} max={15} step={0.1} onChange={v => updateField('speed', v)} />
          <ControlItem label="Gravity" value={config.gravity} min={-0.5} max={0.5} step={0.01} onChange={v => updateField('gravity', v)} />
          <ControlItem label="Wind" value={config.wind} min={-0.5} max={0.5} step={0.01} onChange={v => updateField('wind', v)} />
          <ControlItem label="Friction" value={config.friction} min={0.8} max={1.0} step={0.001} onChange={v => updateField('friction', v)} />
          <ControlItem label="Life" value={config.life} min={10} max={1000} onChange={v => updateField('life', v)} />
          
          <div className="space-y-2">
            <label className="text-sm text-slate-300">Behavior</label>
            <select 
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={config.behavior}
              onChange={(e) => updateField('behavior', e.target.value as BehaviorType)}
            >
              {Object.values(BehaviorType).map(t => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm text-slate-300">Glow Bloom</label>
            <button 
              onClick={() => updateField('glow', !config.glow)}
              className={`w-12 h-6 rounded-full transition-colors relative ${config.glow ? 'bg-blue-600' : 'bg-slate-700'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${config.glow ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ControlItem: React.FC<{ label: string, value: number, min: number, max: number, step?: number, onChange: (v: number) => void }> = ({ label, value, min, max, step = 1, onChange }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <label className="text-sm text-slate-300">{label}</label>
      <span className="text-xs text-slate-500 font-mono">{value.toFixed(2)}</span>
    </div>
    <input 
      type="range" 
      min={min} 
      max={max} 
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
    />
  </div>
);

export default Sidebar;
