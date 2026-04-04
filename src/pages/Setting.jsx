import React, { useState, useEffect } from "react";
import { FiZap, FiMousePointer, FiLayers } from "react-icons/fi";

const STORAGE_KEY = "app-settings";

const PRESETS = [
  {
    key: "midnight-cobalt",
    name: "Midnight Cobalt",
    themeColor: "#2563EB",
    navbarColor: "#020617",
    drawerColor: "#FFFFFF",
    navbarUseGradient: true,
    navbarGradientStart: "#020617",
    navbarGradientEnd: "#1E3A8A",
    note: "High-Authority Corporate"
  },
  {
    key: "emerald-executive",
    name: "Emerald Executive",
    themeColor: "#1d805f",
    navbarColor: "#064E3B",
    drawerColor: "#e9f9f1",
    navbarUseGradient: true,
    navbarGradientStart: "#0c2c23",
    navbarGradientEnd: "#065F46",
    note: "Financial Growth & Stability"
  },
  {
    key: "royal-amethyst",
    name: "Royal Amethyst",
    themeColor: "#4700ee",
    navbarColor: "#2E1065",
    drawerColor: "#ebe3e3",
    navbarUseGradient: true,
    navbarGradientStart: "#0e0223",
    navbarGradientEnd: "#4C1D95",
    note: "Modern Luxury & Creative"
  },
  {
    key: "obsidian-rose",
    name: "Obsidian Rose",
    themeColor: "#E11D48",
    navbarColor: "#0F172A",
    drawerColor: "#dfdede",
    navbarUseGradient: true,
    navbarGradientStart: "#0F172A",
    navbarGradientEnd: "#44403C",
    note: "Bold, Dynamic & Urgent"
  },
  {
    key: "sky-frost",
    name: "Sky Frost",
    themeColor: "#0EA5E9",
    navbarColor: "#0369A1",
    drawerColor: "#F0F9FF",
    navbarUseGradient: true,
    navbarGradientStart: "#041c2a",
    navbarGradientEnd: "#0EA5E9",
    note: "Clean, Airy & Modern"
  },
  {
    key: "sunset-peach",
    name: "Sunset Peach",
    themeColor: "#71a600",
    navbarColor: "#4C1D95",
    drawerColor: "#e0e9d9",
    navbarUseGradient: true,
    navbarGradientStart: "#0c011c",
    navbarGradientEnd: "#69c400",
    note: "Friendly & Creative"
  }
];

export default function ThemeControls({ className }) {
  const [selectedPreset, setSelectedPreset] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    const initialKey = raw ? JSON.parse(raw).themeName : "midnight-cobalt";
    const initialTheme = PRESETS.find(p => p.key === initialKey) || PRESETS[0];
    setSelectedPreset(initialTheme);
  }, []);

  // Combined logic: Change, Save, and Broadcast all at once
  const handleThemeSelect = (p) => {
    // 1. Update UI state
    setSelectedPreset(p);
    
    // 2. Save to LocalStorage immediately
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...p, themeName: p.key }));
    
    // 3. Broadcast to other components
    window.dispatchEvent(new CustomEvent("app-theme-updated", { 
      detail: { ...p, themeName: p.key } 
    }));
  };

  if (!selectedPreset) return null;

  return (
    <div className={`min-h-[550px] bg-white rounded-3xl overflow-hidden flex flex-col lg:flex-row border border-slate-100 shadow-2xl ${className}`}>

      {/* LEFT: SELECTION PANEL */}
      <div className="w-full lg:w-[380px] border-r border-slate-100 flex flex-col bg-slate-50/50">
        <div className="p-8 pb-6">
          <div className="flex items-center gap-2 mb-1">
            <FiLayers className="text-blue-600" />
            <h2 className="text-xl font-black tracking-tighter text-slate-900">Theme's </h2>
          </div>
          <p className="text-slate-500 text-xs font-medium italic">Changes are applied instantly.</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {PRESETS.map((p) => {
            const isActive = selectedPreset?.key === p.key;

            return (
              <button
                key={p.key}
                onClick={() => handleThemeSelect(p)}
                className={`w-full group flex items-center gap-3 p-4 rounded-2xl transition-all ${
                  isActive
                    ? "bg-white shadow-md ring-1 ring-slate-200"
                    : "hover:bg-white/60 text-slate-500"
                }`}
              >
                <div
                  className="w-10 h-10 rounded-xl shrink-0 shadow-inner flex items-center justify-center text-white"
                  style={{ background: p.navbarUseGradient ? `linear-gradient(135deg, ${p.navbarGradientStart}, ${p.navbarGradientEnd})` : p.navbarColor }}
                >
                  {isActive ? <FiZap size={14} className="text-white" /> : <div className="w-1.5 h-1.5 bg-white/40 rounded-full" />}
                </div>

                <div className="flex-1 text-left">
                  <p className={`font-bold text-sm ${isActive ? "text-slate-900" : "text-slate-500"}`}>
                    {p.name}
                  </p>
                  <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">{p.note}</p>
                </div>

                {isActive && <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT: LIVE STUDIO PREVIEW */}
      <div className="flex-1 bg-white p-8 lg:p-12 flex flex-col items-center justify-center relative">
        <div className="absolute top-8 left-8 flex items-center gap-2 text-slate-300 font-bold text-[10px] uppercase tracking-[0.2em]">
          <FiMousePointer /> Live Canvas
        </div>

        <div className="w-full max-w-2xl aspect-video rounded-3xl shadow-[0_30px_70px_-20px_rgba(0,0,0,0.12)] overflow-hidden border border-slate-100 flex flex-col bg-white">
          {/* Mock Nav */}
          <div
            className="h-10 px-5 flex items-center justify-between"
            style={{
              background: selectedPreset.navbarUseGradient
                ? `linear-gradient(90deg, ${selectedPreset.navbarGradientStart}, ${selectedPreset.navbarGradientEnd})`
                : selectedPreset.navbarColor
            }}
          >
            <div className="w-16 h-2 bg-white/20 rounded-full" />
            <div className="w-5 h-5 rounded-full bg-white/10" />
          </div>

          <div className="flex-1 flex">
            {/* Mock Sidebar */}
            <div
              className="w-24 border-r border-slate-50 p-4 space-y-3"
              style={{ background: selectedPreset.drawerColor }}
            >
              <div className="w-full h-1.5 bg-slate-100 rounded-full" />
              <div className="w-3/4 h-1.5 bg-slate-100 rounded-full" />
            </div>

            {/* Mock Content */}
            <div className="flex-1 p-6 space-y-4">
              <div className="w-1/3 h-4 bg-slate-50 rounded-md mb-6" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-20 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 flex items-center justify-center" >
                  <div className="w-8 h-8 rounded-full bg-white shadow-sm" />
                </div>
                <div className="h-20 bg-slate-50/50 rounded-xl border border-dashed border-slate-200" />
              </div>
              <div className="flex justify-end pt-4">
                <div
                  className="px-5 py-2 rounded-lg text-white text-[9px] font-black shadow-lg transition-colors duration-500"
                  style={{ background: selectedPreset.themeColor }}
                >
                  Theme Applied
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-8 text-[10px] font-bold uppercase text-slate-300 tracking-tighter">
          Active Environment: {selectedPreset.name}
        </p>
      </div>
    </div>
  );
}
