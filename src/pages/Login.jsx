import React, { useState } from "react";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
import LoginIllustration from "../assets/LoginBackground.png";
import logoimage from "../assets/logoimage.png";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#f0f9ff] font-poppins">

      {/* --- BACKGROUND LAYERS --- */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#94a3b8] via-[#f8faff] to-[#0ea5e9]" />

      <div className="absolute bottom-0 right-0 w-72 h-72 opacity-50 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#0f172a 1.5px, transparent 1.5px)`,
          backgroundSize: "20px 20px",
          maskImage: "radial-gradient(circle at bottom right, black, transparent 100%)"
        }}
      />

      <div
        className="absolute top-0 left-0 w-80 h-80 opacity-50 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#0f172a 1.5px, transparent 1.2px)`,
          backgroundSize: "20px 20px",
          maskImage: "radial-gradient(circle at top left, black, transparent 70%)"
        }}
      />

      {/* Dotted Accents */}
      {/* UNIQUE MESH BACKGROUND */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `
      linear-gradient(120deg, rgba(15,23,42,0.08) 1px, transparent 1px),
      linear-gradient(60deg, rgba(15,23,42,0.08) 1px, transparent 1px)
    `,
          backgroundSize: "50px 50px",
        }}
      />
      {/* --- MAIN CONTENT --- */}
      {/* md:flex-col: Stacks Image on Top and Form on Bottom for Tablets.
          md:justify-start + md:pt-10: Moves the whole stack to the Upper Side.
          lg:flex-row + lg:justify-center: Returns to side-by-side centered for PC.
      */}
      <div className="relative z-10 flex flex-col lg:flex-row w-full max-w-7xl h-full items-center justify-center md:justify-start lg:justify-center px-6 md:pt-10 lg:pt-0 gap-6 lg:gap-16">

        {/* IMAGE SIDE (UPPER SIDE on Tab) */}
        <div className="flex items-center justify-center w-full lg:flex-1">
          <div className="relative flex items-center justify-center w-full">
            <div className="absolute w-[60%] h-[60%] bg-blue-500/10 blur-[80px] rounded-full" />
            <img
              src={LoginIllustration}
              alt="GST Illustration"
              className="relative z-10 
                w-auto 
                max-h-[55vh]    /* Tab: Smaller height to leave room for form below */
                lg:max-h-[115vh]  /* PC: Big size */
                object-contain 
                drop-shadow-[0_20px_50px_rgba(8,145,170,0.3)]"
            />
          </div>
        </div>

        {/* LOGIN CARD (LOWER SIDE on Tab) */}
        <div className="w-full max-w-[350px] md:max-w-[490px] lg:max-w-[400px] shrink-0 flex justify-center z-20  md:mt-[-120px] lg:mt-0">
          <div className="w-full bg-white/85 backdrop-blur-lg rounded-2xl p-7 md:p-8 shadow-[0_30px_100px_-20px_rgba(0,0,0,0.2)] border border-white">

            {/* LOGO */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center mb-3">
                <div className="relative p-2.5 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <img src={logoimage} alt="Logo" className="w-full h-full object-contain" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-white" />
                </div>
              </div>

              <h1 className="text-lg md:text-xl font-black text-slate-800 text-center tracking-tighter">
                GST BILLING <span className="text-cyan-600">PRO</span>
              </h1>
              <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">
                Business Solutions
              </p>
            </div>

            {/* FORM */}
            <form className="space-y-4 md:space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1 mb-1.5 block tracking-widest">
                  Username
                </label>
                <input
                  type="text"
                  placeholder="Enter username"
                  className="w-full px-5 py-3 md:py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-cyan-500 focus:bg-white transition-all shadow-sm"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1 mb-1.5 block tracking-widest">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full px-5 py-3 md:py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-cyan-500 focus:bg-white transition-all shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-600 transition-colors"
                  >
                    {showPassword ? <HiOutlineEyeOff size={18} /> : <HiOutlineEye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end pr-1">
                <button className="text-[10px] text-cyan-600 font-black uppercase tracking-tighter hover:text-slate-900 transition-colors">
                  Forgot Password?
                </button>
              </div>

              <button className="w-full py-3.5 md:py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-[11px] tracking-[0.25em] uppercase transition-all active:scale-[0.97] shadow-xl shadow-slate-200">
                Sign In
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="absolute bottom-6 w-full text-center px-4">
        <p className="text-slate-900 text-[9px] font-black uppercase tracking-[0.4em] leading-relaxed">
          Powered By <span className="text-cyan-700">AC Pvt. Ltd.</span> <br />
          <span className="opacity-40 font-bold tracking-widest">© 2026 All Rights Reserved</span>
        </p>
      </div>

    </div>
  );
};

export default LoginPage;