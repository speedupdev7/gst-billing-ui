import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Save,
  RotateCcw,
  Package,
  Hash,
  CalendarDays,
  Truck,
  FileText,
  XCircle,
  List,
  ShieldAlert,
} from "lucide-react";

const initialFormData = {
  itemName: "",
  batchNo: "",
  quantity: "",
  expiryDate: "",
  supplier: "",
  actionType: "",
  remarks: "",
};

const StockExpiryForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormData);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    alert("Expiry Stock Saved Successfully");
  };

  const handleReset = () => {
    setFormData(initialFormData);
  };

  const labelCls = "text-slate-500 font-bold uppercase block mb-1.5 text-[10px]";
  const inputCls =
    "w-full border border-rose-200 rounded-md p-2 bg-white outline-none shadow-sm focus:ring-2 focus:ring-rose-400 transition-all text-sm";

  return (
    <div
      className="min-h-screen p-2 sm:p-4 md:p-3 text-[12px] font-sans text-slate-700"
      style={{ background: "linear-gradient(135deg, #fff1f2 0%, #fff7ed 30%, #fffbeb 100%)" }}
    >
      <div className="max-w-[1500px] mx-auto bg-white rounded-xl overflow-hidden border border-rose-200 shadow-xl shadow-rose-100/50">
        {/* ─── STICKY TOP ACTION BAR ─── */}
        <div className="flex bg-gradient-to-r from-rose-950 via-rose-900 to-amber-950 text-white p-3 gap-3 items-center border-b border-white/10 shadow-lg">
          <div className="flex items-center gap-3 pr-4 border-r border-rose-400/30 mr-2">
            <div className="bg-gradient-to-br from-rose-400 to-amber-600 p-2 rounded-xl shadow-inner ring-1 ring-white/20">
              <ShieldAlert size={20} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm tracking-tight text-white uppercase">
                Stock Expiry Entry
              </span>
              <span className="text-[10px] text-rose-300 font-medium tracking-widest">
                Manage Expired / Near-Expiry Medicines
              </span>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-rose-700/40 rounded-lg border border-rose-500/30">
            <button
              onClick={() => navigate("/stock-expiry")}
              className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-rose-200 hover:text-white"
            >
              <List size={13} /> View List
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* ─── SECTION 1: ITEM & BATCH DETAILS ─── */}
          <div className="grid grid-cols-12 bg-gradient-to-br from-rose-50 via-amber-50 to-white border-b border-rose-200">
            <div className="col-span-12 p-3 bg-rose-100/50 flex items-center justify-between border-b border-rose-200">
              <div className="flex items-center gap-2">
                <Package size={14} className="text-rose-800" />
                <span className="font-bold text-rose-800 uppercase tracking-wider text-[10px]">
                  Item &amp; Batch Details
                </span>
              </div>
            </div>

            <div className="col-span-12 md:col-span-5 p-4 border-r border-b border-rose-200/50 bg-white/40">
              <label className={labelCls}>Item Name</label>
              <input
                type="text"
                name="itemName"
                value={formData.itemName}
                onChange={handleChange}
                placeholder="Enter item name"
                className={`${inputCls} font-semibold`}
              />
            </div>

            <div className="col-span-12 md:col-span-3 p-4 border-r border-b border-rose-200/50">
              <label className={labelCls}>Batch No</label>
              <div className="relative">
                <Hash size={14} className="absolute left-2.5 top-3 text-rose-400" />
                <input
                  type="text"
                  name="batchNo"
                  value={formData.batchNo}
                  onChange={handleChange}
                  placeholder="BATCH01"
                  className={`${inputCls} pl-8 font-bold`}
                />
              </div>
            </div>

            <div className="col-span-12 md:col-span-4 p-4 border-b border-rose-200/50 bg-rose-50/20">
              <label className={labelCls}>Quantity</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="Enter quantity"
                className={`${inputCls} font-bold text-right`}
              />
            </div>
          </div>

          {/* ─── SECTION 2: EXPIRY & SUPPLIER ─── */}
          <div className="grid grid-cols-12 border-b border-rose-200">
            <div className="col-span-12 p-3 bg-amber-100/40 flex items-center justify-between border-b border-rose-200">
              <div className="flex items-center gap-2">
                <CalendarDays size={14} className="text-amber-800" />
                <span className="font-bold text-amber-800 uppercase tracking-wider text-[10px]">
                  Expiry &amp; Supplier Details
                </span>
              </div>
            </div>

            <div className="col-span-12 md:col-span-4 p-4 border-r border-b border-rose-200/50">
              <label className={labelCls}>Expiry Date</label>
              <div className="relative">
                <CalendarDays size={14} className="absolute left-3 top-3 text-rose-400 pointer-events-none" />
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  className={`${inputCls} pl-9 font-semibold`}
                />
              </div>
            </div>

            <div className="col-span-12 md:col-span-4 p-4 border-r border-b border-rose-200/50">
              <label className={labelCls}>Supplier Name</label>
              <div className="relative">
                <Truck size={14} className="absolute left-3 top-3 text-rose-400" />
                <input
                  type="text"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleChange}
                  placeholder="Enter supplier"
                  className={`${inputCls} pl-9 font-semibold`}
                />
              </div>
            </div>

            <div className="col-span-12 md:col-span-4 p-4 border-b border-rose-200/50 bg-amber-50/50">
              <label className="text-amber-600 font-bold uppercase block mb-1.5 text-[10px]">Action Type</label>
              <select
                name="actionType"
                value={formData.actionType}
                onChange={handleChange}
                className={`${inputCls} border-amber-200 font-semibold text-amber-700`}
              >
                <option value="">Select Action</option>
                <option>Return To Supplier</option>
                <option>Damage Entry</option>
                <option>Dispose</option>
              </select>
            </div>
          </div>

          {/* ─── REMARKS ─── */}
          <div className="col-span-12 p-6 bg-rose-50/20 border-b border-rose-100">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={14} className="text-rose-500" />
              <span className="text-slate-700 font-bold uppercase text-[11px] tracking-widest">
                Remarks / Internal Notes
              </span>
            </div>
            <textarea
              rows="3"
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              placeholder="Enter remarks..."
              className="w-full bg-white border border-rose-200 rounded-lg p-3 focus:ring-2 focus:ring-rose-400 outline-none text-slate-600 text-sm resize-none"
            ></textarea>
          </div>

          {/* ─── STICKY BOTTOM ACTION BAR ─── */}
          <div className="flex bg-rose-950/95 backdrop-blur-md text-white p-3 gap-3 items-center">
            <button
              type="submit"
              className="flex items-center gap-2.5 bg-gradient-to-b from-rose-500 to-amber-600 hover:from-rose-400 hover:to-amber-500 px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all shadow-lg shadow-rose-900/40 active:scale-95 border-t border-rose-400/30"
            >
              <Save size={16} strokeWidth={2.5} />
              Save Entry
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-2.5 bg-rose-900 hover:bg-rose-800 px-4 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-wider border border-rose-700 transition-all active:bg-rose-950"
            >
              <RotateCcw size={16} className="text-rose-300" />
              Reset
            </button>

            <button
              type="button"
              onClick={() => navigate("/stock-expiry")}
              className="flex items-center gap-2.5 text-rose-400 hover:text-rose-200 hover:bg-rose-500/10 px-4 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-wider ml-auto transition-all group"
            >
              <XCircle size={16} className="group-hover:rotate-90 transition-transform duration-300" />
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockExpiryForm;