import React, { useState } from "react";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
import LoginIllustration from "../assets/LoginBackground.png";
import logoimage from "../assets/logoimage.png";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row relative overflow-x-hidden bg-[#f0f9ff] font-poppins">
      
      {/* --- PC ONLY BACKGROUND LAYERS --- */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#94a3b8] via-[#f8faff] to-[#0ea5e9] hidden lg:block" />
      
      <div className="absolute bottom-0 right-0 w-72 h-72 opacity-50 pointer-events-none hidden lg:block"
        style={{
          backgroundImage: `radial-gradient(#0f172a 1.5px, transparent 1.5px)`,
          backgroundSize: "20px 20px",
          maskImage: "radial-gradient(circle at bottom right, black, transparent 100%)"
        }}
      />

      {/* --- UPDATED: MOBILE/TABLET UNIFIED BACKGROUND WITH DOTS --- */}
      <div className="absolute inset-0 lg:hidden">
        {/* The Base Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#4ca5bf] via-[#e0f2f7] to-[#f0f9ff]" />
        
        {/* The Dotted Pattern Layer */}
        <div 
          className="absolute inset-0 opacity-[0.15]" 
          style={{
            backgroundImage: `radial-gradient(#003366 1px, transparent 1px)`,
            backgroundSize: "24px 24px"
          }}
        />
      </div>

      {/* --- MAIN CONTAINER --- */}
      <div className="relative z-10 flex flex-col lg:flex-row w-full h-full lg:h-screen items-center">
        
        {/* --- TOP SECTION (Mobile/Tab) / LEFT SECTION (PC) --- */}
        <div className="w-full lg:flex-1 flex flex-col items-center justify-center pt-10 pb-4 lg:p-0">
          
          {/* Mobile/Tab Logo + Name */}
          <div className="lg:hidden mb-6 flex items-center gap-3 px-8 w-full justify-start">
            <img src={logoimage} alt="Logo" className="h-10 w-10 object-contain drop-shadow-md" />
            <span className="text-white font-semibold text-2xl tracking-tight drop-shadow-sm">
              ABC
            </span>
          </div>

          <div className="relative flex items-center justify-center w-full px-6 lg:px-0">
            <div className="absolute w-[60%] h-[60%] bg-blue-500/10 blur-[80px] rounded-full hidden lg:block" />
            <img
              src={LoginIllustration}
              alt="GST Illustration"
              className="relative z-10 w-full max-w-[320px] md:max-w-[450px] lg:max-w-none lg:max-h-[85vh] object-contain drop-shadow-2xl lg:drop-shadow-[0_20px_50px_rgba(8,145,170,0.3)]"
            />
          </div>
        </div>

        {/* --- BOTTOM SECTION (Mobile/Tab) / RIGHT SECTION (PC) --- */}
        <div className="w-full lg:flex-1 flex flex-col items-center justify-center px-6 py-10 lg:p-0 z-20">
          
          <div className="w-full max-w-[380px] lg:max-w-[400px] bg-white/90 lg:bg-transparent p-8 lg:p-0 rounded-[30px] shadow-2xl shadow-blue-900/20 lg:shadow-none">
            
            {/* Mobile Header Text */}
            <div className="mb-8 lg:hidden text-left">
              <h1 className="text-3xl font-bold text-[#003366]">Login</h1>
              <p className="text-orange-500 font-semibold">Sign in to your Account</p>
            </div>

            {/* PC Branding (Logo Left, Text Right) */}
            <div className="hidden lg:flex items-center gap-4 mb-8 w-full">
              <div className="relative p-2 bg-white rounded-xl border border-slate-100 shadow-sm w-14 h-14 flex-shrink-0">
                <img src={logoimage} alt="Logo" className="w-full h-full object-contain" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-white" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-black text-slate-800 tracking-tighter leading-none">
                  ACTIVE <span className="text-cyan-600">CLOUD</span>
                </h1>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">
                  Business Solutions
                </p>
              </div>
            </div>

            {/* FORM */}
            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="hidden lg:block text-[10px] font-black text-slate-400 uppercase ml-1 mb-1.5 tracking-widest">
                  Username
                </label>
                <input
                  type="text"
                  placeholder="Username"
                  className="w-full px-5 py-4 lg:py-3.5 bg-white lg:bg-slate-50/50 border-2 border-[#89cddb] lg:border-slate-200 rounded-xl lg:rounded-2xl text-sm outline-none focus:border-cyan-600 transition-all shadow-sm"
                />
              </div>

              <div>
                <label className="hidden lg:block text-[10px] font-black text-slate-400 uppercase ml-1 mb-1.5 tracking-widest">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="w-full px-5 py-4 lg:py-3.5 bg-white lg:bg-slate-50/50 border-2 border-[#89cddb] lg:border-slate-200 rounded-xl lg:rounded-2xl text-sm outline-none focus:border-cyan-600 transition-all shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPassword ? <HiOutlineEyeOff size={22} /> : <HiOutlineEye size={22} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end pr-1">
                <button className="text-[11px] text-cyan-700 font-bold uppercase hover:text-slate-900 transition-colors">
                  Forgot Password?
                </button>
              </div>

              <button className="w-full py-4 bg-[#0e8ca3] lg:bg-slate-900 text-white rounded-xl lg:rounded-2xl font-bold lg:font-black text-sm lg:text-[11px] lg:tracking-[0.25em] uppercase transition-all active:scale-[0.97] shadow-lg shadow-cyan-900/20">
                Login
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="relative z-10 w-full text-center py-8 lg:absolute lg:bottom-6">
        <p className="text-[#003366] lg:text-slate-900 text-[10px] font-bold lg:font-black uppercase tracking-widest lg:tracking-[0.4em] leading-relaxed px-4">
          Designed And Developed By <span className="text-cyan-800 lg:text-cyan-700">ABC Pvt. Ltd.</span> <br />
          <span className="opacity-60 lg:opacity-40">© 2023 All Rights Reserved</span>
        </p>
      </div>

    </div>
  );
};

export default LoginPage;