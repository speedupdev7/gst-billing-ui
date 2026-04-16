import React, { useState, useEffect } from "react";
import { FiSun, FiMoon, FiLayers } from "react-icons/fi";

export default function ThemeControls() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");

  const toggleTheme = (isDark) => {
    setDarkMode(isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
    // Broadcast to DashboardLayout
    window.dispatchEvent(new Event("theme-changed"));
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border dark:border-slate-700">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <FiLayers className="text-blue-600" />
          <h2 className="text-lg font-black text-slate-900 dark:text-white">Display Settings</h2>
        </div>
        <p className="text-xs text-slate-500">Dark mode is active on Mobile/Tablets only.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => toggleTheme(false)}
          className={`flex items-center justify-center gap-2 py-3 rounded-2xl border transition-all ${!darkMode ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-transparent border-slate-200 text-slate-400'}`}
        >
          <FiSun /> Light
        </button>
        <button
          onClick={() => toggleTheme(true)}
          className={`flex items-center justify-center gap-2 py-3 rounded-2xl border transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-transparent border-slate-200 text-slate-400'}`}
        >
          <FiMoon /> Dark
        </button>
      </div>
      
      {/* PC Warning Message */}
      <div className="hidden lg:block mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100">
        <p className="text-[10px] text-amber-700 font-bold uppercase leading-tight">
          Note: You are on a Desktop. Dark mode will not activate until you resize to a smaller screen.
        </p>
      </div>
    </div>
  );
}