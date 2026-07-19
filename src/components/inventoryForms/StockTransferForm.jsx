import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRightLeft,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Hash,
  CalendarDays,
  FileText,
  XCircle,
  List,
  Warehouse,
  Package,
} from "lucide-react";

const StockTransferForm = () => {
  const navigate = useNavigate();

  const [items, setItems] = useState([
    { itemName: "", quantity: "", remarks: "" },
  ]);

  const [formData, setFormData] = useState({
    transferNo: "",
    fromStore: "",
    toStore: "",
    transferDate: "",
    status: "",
    notes: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleItemChange = (index, e) => {
    const values = [...items];
    values[index][e.target.name] = e.target.value;
    setItems(values);
  };

  const addItem = () => {
    setItems([...items, { itemName: "", quantity: "", remarks: "" }]);
  };

  const removeItem = (index) => {
    const values = [...items];
    values.splice(index, 1);
    setItems(values);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalData = { ...formData, items };
    console.log(finalData);
    alert("Stock Transfer Saved Successfully");
  };

  const handleReset = () => {
    setFormData({
      transferNo: "",
      fromStore: "",
      toStore: "",
      transferDate: "",
      status: "",
      notes: "",
    });
    setItems([{ itemName: "", quantity: "", remarks: "" }]);
  };

  const labelCls = "text-slate-500 font-bold uppercase block mb-1.5 text-[10px]";
  const inputCls =
    "w-full border border-orange-200 rounded-md p-2 bg-white outline-none shadow-sm focus:ring-2 focus:ring-orange-400 transition-all text-sm";

  return (
    <div
      className="min-h-screen p-2 sm:p-4 md:p-3 text-[12px] font-sans text-slate-700"
      style={{ background: "linear-gradient(135deg, #fff7ed 0%, #f8fafc 30%, #f1f5f9 100%)" }}
    >
      <div className="max-w-[1500px] mx-auto bg-white rounded-xl overflow-hidden border border-orange-200 shadow-xl shadow-orange-100/50">
        {/* ─── STICKY TOP ACTION BAR ─── */}
        <div className="flex bg-gradient-to-r from-slate-900 via-slate-800 to-orange-950 text-white p-3 gap-3 items-center border-b border-white/10 shadow-lg">
          <div className="flex items-center gap-3 pr-4 border-r border-orange-400/30 mr-2">
            <div className="bg-gradient-to-br from-orange-400 to-slate-600 p-2 rounded-xl shadow-inner ring-1 ring-white/20">
              <ArrowRightLeft size={20} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm tracking-tight text-white uppercase">
                Stock Transfer Entry
              </span>
              <span className="text-[10px] text-orange-300 font-medium tracking-widest">
                Move Stock Between Stores &amp; Warehouses
              </span>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-orange-700/40 rounded-lg border border-orange-500/30">
            <button
              onClick={() => navigate("/stock-transfer")}
              className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-orange-200 hover:text-white"
            >
              <List size={13} /> View List
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* ─── SECTION 1: TRANSFER DETAILS ─── */}
          <div className="grid grid-cols-12 bg-gradient-to-br from-orange-50 via-slate-50 to-white border-b border-orange-200">
            <div className="col-span-12 p-3 bg-orange-100/50 flex items-center justify-between border-b border-orange-200">
              <div className="flex items-center gap-2">
                <Hash size={14} className="text-orange-800" />
                <span className="font-bold text-orange-800 uppercase tracking-wider text-[10px]">
                  Transfer Details
                </span>
              </div>
            </div>

            <div className="col-span-12 md:col-span-4 p-4 border-r border-b border-orange-200/50 bg-white/40">
              <label className={labelCls}>Transfer No</label>
              <div className="relative">
                <Hash size={14} className="absolute left-3 top-3 text-orange-400" />
                <input
                  type="text"
                  name="transferNo"
                  value={formData.transferNo}
                  onChange={handleChange}
                  placeholder="TRF-2026-0001"
                  className={`${inputCls} pl-9 font-bold`}
                />
              </div>
            </div>

            <div className="col-span-12 md:col-span-4 p-4 border-r border-b border-orange-200/50">
              <label className={labelCls}>Transfer Date</label>
              <div className="relative">
                <CalendarDays size={14} className="absolute left-3 top-3 text-orange-400 pointer-events-none" />
                <input
                  type="date"
                  name="transferDate"
                  value={formData.transferDate}
                  onChange={handleChange}
                  className={`${inputCls} pl-9 font-semibold`}
                />
              </div>
            </div>

            <div className="col-span-12 md:col-span-4 p-4 border-b border-orange-200/50 bg-slate-50/60">
              <label className="text-slate-600 font-bold uppercase block mb-1.5 text-[10px]">Transfer Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={`${inputCls} border-slate-300 font-semibold text-slate-700`}
              >
                <option value="">Select Status</option>
                <option>Pending</option>
                <option>In Transit</option>
                <option>Completed</option>
              </select>
            </div>
          </div>

          {/* ─── SECTION 2: ROUTE (FROM / TO) ─── */}
          <div className="grid grid-cols-12 border-b border-orange-200">
            <div className="col-span-12 p-3 bg-slate-100/60 flex items-center justify-between border-b border-orange-200">
              <div className="flex items-center gap-2">
                <Warehouse size={14} className="text-slate-800" />
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                  Route: Source &amp; Destination
                </span>
              </div>
            </div>

            <div className="col-span-12 md:col-span-6 p-4 border-r border-b border-orange-200/50 bg-orange-50/20">
              <label className={labelCls}>From Store</label>
              <div className="relative">
                <Warehouse size={14} className="absolute left-3 top-3 text-orange-400" />
                <select
                  name="fromStore"
                  value={formData.fromStore}
                  onChange={handleChange}
                  className={`${inputCls} pl-9 font-semibold`}
                >
                  <option value="">Select Store</option>
                  <option>Main Store</option>
                  <option>Warehouse</option>
                  <option>Branch Store</option>
                </select>
              </div>
            </div>

            <div className="col-span-12 md:col-span-6 p-4 border-b border-orange-200/50 bg-slate-50/40">
              <label className={labelCls}>To Store</label>
              <div className="relative">
                <ArrowRightLeft size={14} className="absolute left-3 top-3 text-slate-400" />
                <select
                  name="toStore"
                  value={formData.toStore}
                  onChange={handleChange}
                  className={`${inputCls} pl-9 font-semibold`}
                >
                  <option value="">Select Store</option>
                  <option>Main Store</option>
                  <option>Warehouse</option>
                  <option>Branch Store</option>
                </select>
              </div>
            </div>
          </div>

          {/* ─── SECTION 3: TRANSFER ITEMS ─── */}
          <div className="border-b border-orange-200">
            <div className="p-3 bg-orange-100/40 flex items-center justify-between border-b border-orange-200">
              <div className="flex items-center gap-2">
                <Package size={14} className="text-orange-800" />
                <span className="font-bold text-orange-800 uppercase tracking-wider text-[10px]">
                  Transfer Items
                </span>
              </div>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-1.5 bg-gradient-to-r from-orange-600 to-slate-700 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wide hover:from-orange-700 hover:to-slate-800 transition-all shadow-sm"
              >
                <Plus size={13} /> Add Item
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gradient-to-r from-slate-900 via-slate-800 to-orange-950 text-white text-[10px] uppercase tracking-widest">
                  <tr>
                    <th className="p-3 text-center w-12">Sr.</th>
                    <th className="p-3 text-left min-w-[220px]">Item Name</th>
                    <th className="p-3 text-center w-28">Quantity</th>
                    <th className="p-3 text-left min-w-[200px]">Remarks</th>
                    <th className="p-3 text-center w-20">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-orange-50">
                  {items.map((item, index) => (
                    <tr key={index} className="hover:bg-orange-50/40 transition-colors">
                      <td className="p-3 text-center text-xs text-orange-300 font-mono">{index + 1}</td>

                      <td className="p-2">
                        <input
                          type="text"
                          name="itemName"
                          value={item.itemName}
                          onChange={(e) => handleItemChange(index, e)}
                          placeholder="Enter item name"
                          className="w-full border border-orange-200 rounded-md px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400 transition-all font-semibold"
                        />
                      </td>

                      <td className="p-2">
                        <input
                          type="number"
                          name="quantity"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, e)}
                          placeholder="0"
                          className="w-full border border-orange-200 rounded-md px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400 text-right font-mono transition-all"
                        />
                      </td>

                      <td className="p-2">
                        <input
                          type="text"
                          name="remarks"
                          value={item.remarks}
                          onChange={(e) => handleItemChange(index, e)}
                          placeholder="Remarks"
                          className="w-full border border-orange-200 rounded-md px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400 transition-all"
                        />
                      </td>

                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          disabled={items.length === 1}
                          className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center mx-auto transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ─── NOTES ─── */}
          <div className="col-span-12 p-6 bg-orange-50/20 border-b border-orange-100">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={14} className="text-orange-500" />
              <span className="text-slate-700 font-bold uppercase text-[11px] tracking-widest">
                Notes / Internal Remarks
              </span>
            </div>
            <textarea
              rows="3"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Enter notes..."
              className="w-full bg-white border border-orange-200 rounded-lg p-3 focus:ring-2 focus:ring-orange-400 outline-none text-slate-600 text-sm resize-none"
            ></textarea>
          </div>

          {/* ─── STICKY BOTTOM ACTION BAR ─── */}
          <div className="flex bg-slate-900/95 backdrop-blur-md text-white p-3 gap-3 items-center">
            <button
              type="submit"
              className="flex items-center gap-2.5 bg-gradient-to-b from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all shadow-lg shadow-orange-900/40 active:scale-95 border-t border-orange-400/30"
            >
              <Save size={16} strokeWidth={2.5} />
              Save Transfer
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-2.5 bg-slate-800 hover:bg-slate-700 px-4 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-wider border border-slate-600 transition-all active:bg-slate-900"
            >
              <RotateCcw size={16} className="text-orange-300" />
              Reset
            </button>

            <button
              type="button"
              onClick={() => navigate("/stock-transfer")}
              className="flex items-center gap-2.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 px-4 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-wider ml-auto transition-all group"
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

export default StockTransferForm;