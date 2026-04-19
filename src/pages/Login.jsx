import React, { useState } from "react";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
import { RiCloudLine } from "react-icons/ri";
import LoginIllustration from "../assets/LoginBackground.png";
import logoimage from "../assets/logoimage.png";
const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [passcode, setPasscode] = useState(new Array(8).fill(""));

  const handleChange = (val, i) => {
    if (isNaN(val)) return;
    const newCode = [...passcode];
    newCode[i] = val.slice(-1);
    setPasscode(newCode);

    if (val && i < 7) {
      document.getElementById(`pin-${i + 1}`).focus();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#f0f9ff]">

      {/* --- BACKGROUND UI --- */}

      {/* 1. Primary Mesh Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#94a3b8] via-[#f8faff] to-[#0ea5e9]" />

      {/* 2. Main Professional Dotted Grid */}
      <div className="absolute inset-0 z-0 opacity-[0.4]"
        style={{
          backgroundImage: `radial-gradient(#0891b2 0.7px, transparent 0.6px)`,
          backgroundSize: '30px 30px'
        }}
      />

      {/* 3. NEW: BOTTOM DOTTED DESIGN (Decent & Structured) */}
      <div className="absolute bottom-0 left-0 w-full h-64 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#0f172a 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
          maskImage: 'linear-gradient(to top, black, transparent)' // Fades out as it goes up
        }}
      />

      {/* 4. Vertical Dotted Accents at Bottom Corners */}
      <div className="absolute bottom-10 right-10 hidden lg:block opacity-20">
        <div className="grid grid-cols-2 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 bg-slate-900 rounded-full" />
          ))}
        </div>
      </div>

      {/* 5. Floating Glassmorphism Orbs */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-cyan-200/30 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[30%] bg-indigo-200/30 blur-[100px] rounded-full" />

      {/* --- MAIN CONTENT --- */}
      <div className="relative z-10 flex flex-col lg:flex-row w-full max-w-7xl items-center justify-between px-6 sm:px-10 gap-12">

        <div className="hidden md:flex w-full lg:w-[60%] items-center justify-center">
          <div className="relative w-full flex justify-center">

            <div className="absolute inset-0 bg-blue-900/20 blur-[50px] rounded-full scale-40" />

            <img
              src={LoginIllustration}
              alt="illustration"
              className="relative z-10 w-full 
                 max-w-[550px] 
                 md:max-w-[700px] 
                 lg:max-w-none 
                 lg:w-[900px] 
                 xl:w-[900px] 
                 2xl:w-[1300px] 
                 h-auto object-contain 
                 drop-shadow-[0_20px_60px_rgba(8,145,170,0.25)]"
            />
          </div>
        </div>

        {/* LOGIN CARD SIDE */}
        <div className="w-full max-w-sm flex justify-center lg:justify-end">
          <div className="w-full bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white/60">

            {/* LOGO */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-14 h-14 flex items-center justify-center mb-3">
                <div className="relative">
                  <img src={logoimage} alt="Logo" />
                  <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-orange-400 rounded-full border-2 border-white" />
                </div>
              </div>
              <h1 className="text-lg font-black text-slate-800 text-center tracking-tight">
                GST Billing
              </h1>
            </div>

            {/* FORM */}
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Username"
                className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm outline-none focus:border-cyan-500 focus:bg-white transition-all shadow-sm"
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm outline-none focus:border-cyan-500 focus:bg-white transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-cyan-600"
                >
                  {showPassword ? <HiOutlineEyeOff size={18} /> : <HiOutlineEye size={18} />}
                </button>
              </div>

              <div className="text-right text-[11px] text-cyan-600 cursor-pointer font-bold uppercase tracking-tighter hover:underline">
                Forgot Password?
              </div>

              <button className="w-full mt-4 py-3.5 bg-[#4c5bb4] hover:bg-[#3f4b94] text-white rounded-sm font-bold shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] uppercase text-[11px] tracking-[0.15em]">
                Login
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="absolute bottom-6 w-full text-center ">
        <p className="text-black text-[10px] font-semibold uppercase tracking-[0.3em] leading-relaxed md:m-8">
          Designed And Developed By AC Pvt. Ltd. <br />
          <span className="opacity-70">Copyright © 2026 All Rights Reserved</span>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;