import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Save,
  RotateCcw,
  Building2,
  Mail,
  MapPin,
  Landmark,
  List,
  ShieldCheck,
  Phone,
  Hash,
} from "lucide-react";

const initialFormData = {
  assetName: "",
  gstin: "",
  pan: "",
  email: "",
  phone: "",
  addressLine: "",
  city: "",
  pincode: "",
  state: "",
  stateCode: "",
  bankName: "",
  accountNumber: "",
};

const AssetPurchaseForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    alert("Asset Purchase Saved Successfully");
  };

  const handleReset = () => {
    setFormData(initialFormData);
  };

  const labelCls = "text-slate-500 font-bold uppercase block mb-1.5 text-[10px]";
  const inputCls =
    "w-full border border-emerald-200 rounded-md p-2.5 bg-white text-sm outline-none shadow-sm focus:ring-2 focus:ring-emerald-400 transition-all placeholder:text-slate-300";

  return (
    <div
      className="min-h-screen p-2 sm:p-4 md:p-3 text-[12px] font-sans text-slate-700"
      style={{ background: "linear-gradient(135deg, #ecfdf5 0%, #ecfeff 30%, #f8fafc 100%)" }}
    >
      <div className="max-w-6xl mx-auto bg-white rounded-xl overflow-hidden border border-emerald-200 shadow-xl shadow-emerald-100/50">
        {/* ─── STICKY TOP ACTION BAR ─── */}
        <div className="flex bg-gradient-to-r from-emerald-950 via-emerald-900 to-cyan-950 text-white p-3 gap-3 items-center border-b border-white/10 shadow-lg">
          <div className="flex items-center gap-3 pr-4 border-r border-emerald-400/30 mr-2">
            <div className="bg-gradient-to-br from-emerald-400 to-cyan-600 p-2 rounded-xl shadow-inner ring-1 ring-white/20">
              <Building2 size={20} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm tracking-tight text-white uppercase">
                Asset Purchase Entry
              </span>
              <span className="text-[10px] text-emerald-300 font-medium tracking-widest">
                Add New Asset / Inventory Details
              </span>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-emerald-700/40 rounded-lg border border-emerald-500/30">
            <button
              type="button"
              onClick={() => navigate("/asset-purchase-list")}
              className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-emerald-200 hover:text-white"
            >
              <List size={13} /> View List
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* ─── SECTION 1: GENERAL & LEGAL INFO ─── */}
          <div className="grid grid-cols-12 bg-gradient-to-br from-emerald-50 via-cyan-50 to-white border-b border-emerald-200">
            <div className="col-span-12 p-3 bg-emerald-100/50 flex items-center justify-between border-b border-emerald-200">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-emerald-800" />
                <span className="font-bold text-emerald-800 uppercase tracking-wider text-[10px]">
                  General &amp; Legal Info
                </span>
              </div>
            </div>

            <div className="col-span-12 p-4 border-b border-emerald-200/50 bg-white/40">
              <label className={labelCls}>Asset / Unit Name *</label>
              <div className="relative">
                <Building2 size={14} className="absolute left-3 top-3 text-emerald-400" />
                <input
                  type="text"
                  name="assetName"
                  value={formData.assetName}
                  onChange={handleChange}
                  placeholder="Enter asset or unit name"
                  className={`${inputCls} pl-9 font-semibold`}
                />
              </div>
            </div>

            <div className="col-span-12 md:col-span-6 p-4 border-r border-b border-emerald-200/50">
              <label className={labelCls}>GSTIN</label>
              <div className="relative">
                <Hash size={14} className="absolute left-3 top-3 text-emerald-400" />
                <input
                  type="text"
                  name="gstin"
                  value={formData.gstin}
                  onChange={handleChange}
                  placeholder="22AAAAA0000A1Z5"
                  className={`${inputCls} pl-9 font-mono uppercase`}
                />
              </div>
            </div>

            <div className="col-span-12 md:col-span-6 p-4 border-b border-emerald-200/50 bg-cyan-50/20">
              <label className={labelCls}>PAN</label>
              <div className="relative">
                <Hash size={14} className="absolute left-3 top-3 text-cyan-400" />
                <input
                  type="text"
                  name="pan"
                  value={formData.pan}
                  onChange={handleChange}
                  placeholder="ABCDE1234F"
                  className={`${inputCls} pl-9 font-mono uppercase border-cyan-200 focus:ring-cyan-400`}
                />
              </div>
            </div>
          </div>

          {/* ─── SECTION 2: CONTACT DETAILS ─── */}
          <div className="grid grid-cols-12 border-b border-emerald-200">
            <div className="col-span-12 p-3 bg-cyan-100/40 flex items-center justify-between border-b border-emerald-200">
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-cyan-800" />
                <span className="font-bold text-cyan-800 uppercase tracking-wider text-[10px]">
                  Contact Details
                </span>
              </div>
            </div>

            <div className="col-span-12 md:col-span-6 p-4 border-r border-b border-emerald-200/50">
              <label className={labelCls}>Email *</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-3 text-emerald-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  className={`${inputCls} pl-9`}
                />
              </div>
            </div>

            <div className="col-span-12 md:col-span-6 p-4 border-b border-emerald-200/50 bg-cyan-50/20">
              <label className={labelCls}>Phone *</label>
              <div className="relative">
                <Phone size={14} className="absolute left-3 top-3 text-cyan-400" />
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className={`${inputCls} pl-9 border-cyan-200 focus:ring-cyan-400`}
                />
              </div>
            </div>
          </div>

          {/* ─── SECTION 3: REGISTERED ADDRESS ─── */}
          <div className="grid grid-cols-12 border-b border-emerald-200">
            <div className="col-span-12 p-3 bg-emerald-100/40 flex items-center justify-between border-b border-emerald-200">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-emerald-800" />
                <span className="font-bold text-emerald-800 uppercase tracking-wider text-[10px]">
                  Registered Address
                </span>
              </div>
            </div>

            <div className="col-span-12 p-4 border-b border-emerald-200/50 bg-white/40">
              <label className={labelCls}>Address Line</label>
              <div className="relative">
                <MapPin size={14} className="absolute left-3 top-3 text-emerald-400" />
                <input
                  type="text"
                  name="addressLine"
                  value={formData.addressLine}
                  onChange={handleChange}
                  placeholder="Address line"
                  className={`${inputCls} pl-9`}
                />
              </div>
            </div>

            <div className="col-span-6 md:col-span-3 p-4 border-r border-b border-emerald-200/50">
              <label className={labelCls}>City *</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
                className={inputCls}
              />
            </div>

            <div className="col-span-6 md:col-span-3 p-4 border-r border-b border-emerald-200/50">
              <label className={labelCls}>Pincode *</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="Pincode"
                className={`${inputCls} font-mono`}
              />
            </div>

            <div className="col-span-6 md:col-span-3 p-4 border-r border-b border-emerald-200/50 bg-cyan-50/20">
              <label className={labelCls}>State *</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="State"
                className={`${inputCls} border-cyan-200 focus:ring-cyan-400`}
              />
            </div>

            <div className="col-span-6 md:col-span-3 p-4 border-b border-emerald-200/50 bg-cyan-50/20">
              <label className={labelCls}>State Code *</label>
              <input
                type="text"
                name="stateCode"
                value={formData.stateCode}
                onChange={handleChange}
                placeholder="State Code"
                className={`${inputCls} font-mono border-cyan-200 focus:ring-cyan-400`}
              />
            </div>
          </div>

          {/* ─── SECTION 4: BANK DETAILS ─── */}
          <div className="grid grid-cols-12 border-b border-emerald-100">
            <div className="col-span-12 p-3 bg-emerald-100/40 flex items-center justify-between border-b border-emerald-200">
              <div className="flex items-center gap-2">
                <Landmark size={14} className="text-emerald-800" />
                <span className="font-bold text-emerald-800 uppercase tracking-wider text-[10px]">
                  Bank Details
                </span>
              </div>
            </div>

            <div className="col-span-12 md:col-span-6 p-4 border-r border-b border-emerald-200/50 bg-emerald-50/30">
              <label className={labelCls}>Bank Name *</label>
              <div className="relative">
                <Landmark size={14} className="absolute left-3 top-3 text-emerald-400" />
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                  placeholder="Bank Name"
                  className={`${inputCls} pl-9 font-semibold`}
                />
              </div>
            </div>

            <div className="col-span-12 md:col-span-6 p-4 border-b border-emerald-200/50 bg-emerald-50/30">
              <label className={labelCls}>Account Number *</label>
              <div className="relative">
                <Hash size={14} className="absolute left-3 top-3 text-emerald-400" />
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  placeholder="Account Number"
                  className={`${inputCls} pl-9 font-mono font-semibold`}
                />
              </div>
            </div>
          </div>

          {/* ─── STICKY BOTTOM ACTION BAR ─── */}
          <div className="flex bg-emerald-950/95 backdrop-blur-md text-white p-4 gap-3 items-center">
            <button
              type="submit"
              className="flex items-center gap-2.5 bg-gradient-to-b from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 px-8 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all shadow-lg shadow-emerald-900/40 active:scale-95 border-t border-emerald-400/30"
            >
              <Save size={16} strokeWidth={2.5} />
              Save
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-2.5 bg-emerald-900 hover:bg-emerald-800 px-6 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-wider border border-emerald-700 transition-all active:bg-emerald-950"
            >
              <RotateCcw size={16} className="text-emerald-300" />
              Reset Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssetPurchaseForm;