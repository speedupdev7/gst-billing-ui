import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineUser,
  HiOutlineLockClosed,
  HiOutlineOfficeBuilding,
} from "react-icons/hi";
import LoginIllustration from "../assets/LoginBackground.webp";
import logoimage from "../assets/logoImage.png";

/* ------------------------------------------------------------------ */
/* Reusable input (defined outside LoginPage so it never remounts and  */
/* the input keeps focus while typing)                                  */
/* ------------------------------------------------------------------ */
const Field = ({
  id,
  label,
  icon: Icon,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  rightSlot,
}) => (
  <div>
    <label
      htmlFor={id}
      className="mb-1.5 ml-1 block text-[13px] font-semibold text-slate-600"
    >
      {label}
    </label>
    <div className="group relative">
      <Icon
        size={20}
        aria-hidden="true"
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-cyan-600"
      />
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        autoCapitalize="none"
        spellCheck={false}
        required
        className={`h-12 w-full rounded-xl border-2 border-[#89cddb] bg-white/90 pl-12 text-sm text-slate-800 shadow-sm outline-none transition-all placeholder:text-slate-400 hover:border-cyan-500 focus:border-cyan-600 focus:bg-white focus:ring-4 focus:ring-cyan-600/15 md:h-[clamp(2.5rem,5vh,3rem)] lg:h-[clamp(2.75rem,5.5vh,3.25rem)] lg:rounded-2xl lg:border-slate-200 lg:bg-white/70 lg:hover:border-slate-300 lg:focus:border-cyan-600 ${
          rightSlot ? "pr-12" : "pr-4"
        }`}
      />
      {rightSlot}
    </div>
  </div>
);

const LoginPage = () => {
  const navigate = useNavigate();
  const submissionInProgress = useRef(false);
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submissionInProgress.current) return;

    const isLoopbackHost = ["localhost", "127.0.0.1", "[::1]"].includes(
      window.location.hostname
    );
    if (!isLoopbackHost && window.location.protocol !== "https:") {
      setPassword("");
      setErrorMessage("A secure connection is required to sign in.");
      return;
    }

    submissionInProgress.current = true;
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/authenticate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          tenantId,
        }),
      });

      if (response.status === 200) {
        sessionStorage.setItem("gst-authenticated", "true");
        navigate("/");
      } else if (response.status === 403) {
        setErrorMessage("Invalid username, password, or tenant");
      } else {
        setErrorMessage("Unable to sign in. Please try again.");
      }
    } catch {
      setErrorMessage("Unable to sign in. Please try again.");
    } finally {
      setPassword("");
      submissionInProgress.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col overflow-x-hidden bg-[#f0f9ff] font-poppins md:h-[100dvh] md:overflow-y-auto lg:h-auto lg:overflow-y-visible">
      {/* ============================================================ */}
      {/* BACKGROUNDS                                                   */}
      {/* ============================================================ */}

      {/* ---- Laptop / Desktop background ---- */}
      <div aria-hidden="true" className="absolute inset-0 hidden overflow-hidden lg:block">
        {/* original gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#94a3b8] via-[#f8faff] to-[#0ea5e9]" />

        {/* soft light orbs for depth */}
        <div className="absolute -left-32 -top-32 h-[520px] w-[520px] rounded-full bg-white/60 blur-[110px]" />
        <div className="absolute -bottom-40 right-[-8%] h-[560px] w-[560px] rounded-full bg-sky-400/40 blur-[120px]" />
        <div className="absolute left-[18%] top-[55%] h-[320px] w-[320px] rounded-full bg-cyan-300/30 blur-[100px]" />

        {/* fine grid, faded toward the edges */}
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(15,23,42,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.07) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage:
              "radial-gradient(ellipse at center, black 30%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          }}
        />

        {/* concentric rings behind the illustration */}
        <div className="absolute left-1/4 top-1/2 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/70" />
        <div className="absolute left-1/4 top-1/2 h-[860px] w-[860px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/40" />

        {/* original dotted corner */}
        <div
          className="absolute bottom-0 right-0 h-80 w-80 opacity-50"
          style={{
            backgroundImage: "radial-gradient(#0f172a 1.5px, transparent 1.5px)",
            backgroundSize: "20px 20px",
            maskImage: "radial-gradient(circle at bottom right, black, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(circle at bottom right, black, transparent 100%)",
          }}
        />
      </div>

      {/* ---- Mobile / Tablet background ---- */}
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden lg:hidden">
        {/* original gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#4ca5bf] via-[#e0f2f7] to-[#f0f9ff]" />
        {/* glow + soft shapes */}
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/30 blur-[70px]" />
        <div className="absolute -left-20 top-40 h-64 w-64 rounded-full bg-cyan-200/50 blur-[80px]" />
        <div className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-sky-300/40 blur-[90px]" />
        {/* original dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: "radial-gradient(#003366 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      {/* ============================================================ */}
      {/* MAIN CONTENT                                                  */}
      {/* ============================================================ */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1700px] flex-1 flex-col items-center md:min-h-0 lg:flex-row">
        {/* ---------- ILLUSTRATION SIDE ---------- */}
        <section className="flex w-full flex-col items-center justify-center px-6 pb-2 pt-8 sm:pt-10 md:min-h-0 md:flex-1 md:pb-0 md:pt-6 lg:w-1/2 lg:flex-none lg:px-8 lg:py-8 xl:px-14">
          {/* Mobile / tablet brand pill */}
          <div className="mb-6 flex w-full max-w-[420px] items-center justify-start lg:hidden md:mb-3 md:max-w-[520px]">
            <div className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/60 py-2 pl-2 pr-5 shadow-lg shadow-cyan-900/10 backdrop-blur-md">
              <div className="relative h-10 w-10 shrink-0 rounded-xl bg-white p-1.5 shadow-sm">
                <img
                  src={logoimage}
                  alt="Logo"
                  className="h-full w-full object-contain"
                />
                <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-orange-500" />
              </div>
              <div className="leading-tight">
                <p className="text-base font-extrabold tracking-tight text-[#003366]">
                  ACTIVE <span className="text-cyan-700">CLOUD</span>
                </p>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  Business Solutions
                </p>
              </div>
            </div>
          </div>

          {/* Illustration */}
          <div className="relative flex w-full items-center justify-center md:min-h-0 md:flex-1 lg:flex-none">
            <div className="absolute hidden h-[60%] w-[60%] rounded-full bg-blue-500/15 blur-[80px] lg:block" />
            <img
              src={LoginIllustration}
              alt="GST Illustration"
              className="relative z-10 w-full max-w-[300px] object-contain drop-shadow-2xl sm:max-w-[360px] md:h-full md:max-h-full md:max-w-[520px] lg:h-auto lg:max-w-full lg:max-h-[min(70vh,680px)] lg:drop-shadow-[0_25px_50px_rgba(8,145,170,0.3)]"
            />
          </div>
        </section>

        {/* ---------- FORM SIDE ---------- */}
        <section className="flex w-full items-center justify-center px-4 pb-8 pt-4 sm:px-6 md:shrink-0 md:pb-2 md:pt-3 lg:w-1/2 lg:px-8 lg:py-8 xl:px-14">
          <div className="relative w-full max-w-[400px] md:max-w-[460px] lg:max-w-[440px] 2xl:max-w-[470px]">
            {/* soft glow behind the card */}
            <div
              aria-hidden="true"
              className="absolute -inset-3 -z-10 rounded-[40px] bg-gradient-to-br from-white/60 via-cyan-200/30 to-sky-400/30 blur-2xl"
            />

            <div className="overflow-hidden rounded-[28px] border border-white/70 bg-white/85 p-7 shadow-2xl shadow-blue-900/20 backdrop-blur-xl sm:p-9 md:px-9 md:py-[clamp(1.25rem,3.5vh,2.25rem)] lg:bg-white/60 lg:px-10 lg:py-[clamp(1.5rem,4.5vh,2.75rem)] lg:shadow-[0_30px_80px_-20px_rgba(15,23,42,0.35)]">
              {/* top accent line */}
              <div
                aria-hidden="true"
                className="-mx-7 -mt-7 mb-7 h-1.5 bg-gradient-to-r from-cyan-600 via-sky-500 to-orange-500 sm:-mx-9 sm:-mt-9 sm:mb-8 md:-mt-[clamp(1.25rem,3.5vh,2.25rem)] md:mb-[clamp(1rem,2.5vh,1.75rem)] lg:-mx-10 lg:-mt-[clamp(1.5rem,4.5vh,2.75rem)] lg:mb-[clamp(1.25rem,3vh,2rem)]"
              />

              {/* PC branding (logo left, text right) */}
              <div className="mb-5 hidden w-full items-center gap-4 lg:flex">
                <div className="relative h-14 w-14 flex-shrink-0 rounded-xl border border-slate-100 bg-white p-2 shadow-sm">
                  <img
                    src={logoimage}
                    alt="Logo"
                    className="h-full w-full object-contain"
                  />
                  <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-orange-500" />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-xl font-black leading-none tracking-tighter text-slate-800">
                    ACTIVE <span className="text-cyan-600">CLOUD</span>
                  </h2>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Business Solutions
                  </p>
                </div>
              </div>

              {/* Heading */}
              <div className="mb-6 text-left md:mb-[clamp(0.75rem,2vh,1.5rem)] lg:mb-[clamp(1rem,2.5vh,1.5rem)]">
                <h1 className="text-3xl font-bold text-[#003366] lg:text-[28px] lg:text-slate-800">
                  Welcome back
                </h1>
                <p className="mt-0.5 text-sm font-semibold text-orange-500">
                  Sign in to your account
                </p>
              </div>

              {/* FORM */}
              <form
                className="space-y-4 md:space-y-[clamp(0.7rem,1.8vh,1.25rem)] lg:space-y-[clamp(0.85rem,2vh,1.25rem)]"
                onSubmit={handleSubmit}
              >
                <Field
                  id="username"
                  label="Username"
                  icon={HiOutlineUser}
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Enter your username"
                  autoComplete="username"
                />

                <Field
                  id="password"
                  label="Password"
                  icon={HiOutlineLockClosed}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  rightSlot={
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      aria-pressed={showPassword}
                      className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
                    >
                      {showPassword ? (
                        <HiOutlineEyeOff size={21} />
                      ) : (
                        <HiOutlineEye size={21} />
                      )}
                    </button>
                  }
                />

                <Field
                  id="tenantId"
                  label="Tenant ID"
                  icon={HiOutlineOfficeBuilding}
                  value={tenantId}
                  onChange={(event) => setTenantId(event.target.value)}
                  placeholder="Enter your tenant ID"
                  autoComplete="organization"
                />

                {errorMessage && (
                  <div
                    role="alert"
                    aria-live="polite"
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600"
                  >
                    {errorMessage}
                  </div>
                )}

                <div className="flex justify-end pr-1">
                  {/* type="button" so it never submits the form */}
                  <button
                    type="button"
                    className="rounded text-[11px] font-bold uppercase tracking-wide text-cyan-700 transition-colors hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#0e8ca3] text-sm font-bold uppercase text-white shadow-lg shadow-cyan-900/25 transition-all hover:bg-[#0b7a8f] focus:outline-none focus-visible:ring-4 focus-visible:ring-cyan-600/30 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 md:h-[clamp(2.5rem,5vh,3rem)] lg:h-[clamp(2.75rem,5.5vh,3.25rem)] lg:rounded-2xl lg:bg-slate-900 lg:text-[11px] lg:font-black lg:tracking-[0.25em] lg:hover:bg-slate-800"
                >
                  {isSubmitting && (
                    <span
                      aria-hidden="true"
                      className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                    />
                  )}
                  <span className="relative">
                    {isSubmitting ? "Signing in..." : "Login"}
                  </span>
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>

      {/* ============================================================ */}
      {/* FOOTER (in normal flow, so it never overlaps on short screens) */}
      {/* ============================================================ */}
      <footer className="relative z-10 w-full px-4 py-5 text-center md:shrink-0 md:py-3 lg:py-4">
        <p className="text-[10px] font-bold uppercase leading-relaxed tracking-widest text-[#003366] lg:font-black lg:tracking-[0.4em] lg:text-slate-900">
          Designed And Developed By{" "}
          <span className="text-cyan-800 lg:text-cyan-700">ACTIVE CLOUD
 Pvt. Ltd.</span>
          <br />
          <span className="opacity-60 lg:opacity-40">
            © {new Date().getFullYear()} All Rights Reserved
          </span>
        </p>
      </footer>
    </div>
  );
};

export default LoginPage;
