import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Truck,
  CalendarDays,
  FileText,
  XCircle,
  List,
  IndianRupee,
  Package,
} from "lucide-react";

const StockOrderForm = () => {
  const navigate = useNavigate();

  const [items, setItems] = useState([
    { itemName: "", quantity: "", rate: "", amount: "" },
  ]);

  const [formData, setFormData] = useState({
    supplier: "",
    orderDate: "",
    status: "",
    remarks: "",
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

    if (e.target.name === "quantity" || e.target.name === "rate") {
      const qty = e.target.name === "quantity" ? e.target.value : values[index].quantity;
      const rate = e.target.name === "rate" ? e.target.value : values[index].rate;
      values[index].amount = qty * rate;
    }

    setItems(values);
  };

  const addItem = () => {
    setItems([...items, { itemName: "", quantity: "", rate: "", amount: "" }]);
  };

  const removeItem = (index) => {
    const values = [...items];
    values.splice(index, 1);
    setItems(values);
  };

  const totalAmount = items.reduce((acc, item) => acc + Number(item.amount || 0), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalData = { ...formData, items, totalAmount };
    console.log(finalData);
    alert("Stock Order Saved Successfully");
  };

  const handleReset = () => {
    setFormData({ supplier: "", orderDate: "", status: "", remarks: "" });
    setItems([{ itemName: "", quantity: "", rate: "", amount: "" }]);
  };

  const labelCls = "text-slate-500 font-bold uppercase block mb-1.5 text-[10px]";
  const inputCls =
    "w-full border border-indigo-200 rounded-md p-2 bg-white outline-none shadow-sm focus:ring-2 focus:ring-indigo-400 transition-all text-sm";

  return (
    <div
      className="min-h-screen p-2 sm:p-4 md:p-3 text-[12px] font-sans text-slate-700"
      style={{ background: "linear-gradient(135deg, #eef2ff 0%, #f0f9ff 30%, #f8fafc 100%)" }}
    >
      <div className="max-w-[1500px] mx-auto bg-white rounded-xl overflow-hidden border border-indigo-200 shadow-xl shadow-indigo-100/50">
        {/* ─── STICKY TOP ACTION BAR ─── */}
        <div className="flex bg-gradient-to-r from-indigo-950 via-indigo-900 to-sky-950 text-white p-3 gap-3 items-center border-b border-white/10 shadow-lg">
          <div className="flex items-center gap-3 pr-4 border-r border-indigo-400/30 mr-2">
            <div className="bg-gradient-to-br from-indigo-400 to-sky-600 p-2 rounded-xl shadow-inner ring-1 ring-white/20">
              <ShoppingCart size={20} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm tracking-tight text-white uppercase">
                Stock Order Entry
              </span>
              <span className="text-[10px] text-indigo-300 font-medium tracking-widest">
                Create &amp; Manage Purchase Orders
              </span>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-indigo-700/40 rounded-lg border border-indigo-500/30">
            <button
              onClick={() => navigate("/stock-order")}
              className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-indigo-200 hover:text-white"
            >
              <List size={13} /> View List
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* ─── SECTION 1: ORDER DETAILS ─── */}
          <div className="grid grid-cols-12 bg-gradient-to-br from-indigo-50 via-sky-50 to-white border-b border-indigo-200">
            <div className="col-span-12 p-3 bg-indigo-100/50 flex items-center justify-between border-b border-indigo-200">
              <div className="flex items-center gap-2">
                <Truck size={14} className="text-indigo-800" />
                <span className="font-bold text-indigo-800 uppercase tracking-wider text-[10px]">
                  Order Details
                </span>
              </div>
            </div>

            <div className="col-span-12 md:col-span-4 p-4 border-r border-b border-indigo-200/50 bg-white/40">
              <label className={labelCls}>Supplier Name</label>
              <div className="relative">
                <Truck size={14} className="absolute left-3 top-3 text-indigo-400" />
                <input
                  type="text"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleChange}
                  placeholder="Enter supplier name"
                  className={`${inputCls} pl-9 font-semibold`}
                />
              </div>
            </div>

            <div className="col-span-12 md:col-span-4 p-4 border-r border-b border-indigo-200/50">
              <label className={labelCls}>Order Date</label>
              <div className="relative">
                <CalendarDays size={14} className="absolute left-3 top-3 text-indigo-400 pointer-events-none" />
                <input
                  type="date"
                  name="orderDate"
                  value={formData.orderDate}
                  onChange={handleChange}
                  className={`${inputCls} pl-9 font-semibold`}
                />
              </div>
            </div>

            <div className="col-span-12 md:col-span-4 p-4 border-b border-indigo-200/50 bg-sky-50/40">
              <label className="text-sky-600 font-bold uppercase block mb-1.5 text-[10px]">Order Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={`${inputCls} border-sky-200 font-semibold text-sky-700`}
              >
                <option value="">Select Status</option>
                <option>Pending</option>
                <option>Processing</option>
                <option>Completed</option>
              </select>
            </div>
          </div>

          {/* ─── SECTION 2: ORDER ITEMS ─── */}
          <div className="border-b border-indigo-200">
            <div className="p-3 bg-sky-100/40 flex items-center justify-between border-b border-indigo-200">
              <div className="flex items-center gap-2">
                <Package size={14} className="text-sky-800" />
                <span className="font-bold text-sky-800 uppercase tracking-wider text-[10px]">
                  Order Items
                </span>
              </div>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-sky-600 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wide hover:from-indigo-700 hover:to-sky-700 transition-all shadow-sm"
              >
                <Plus size={13} /> Add Item
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-sky-950 text-white text-[10px] uppercase tracking-widest">
                  <tr>
                    <th className="p-3 text-center w-12">Sr.</th>
                    <th className="p-3 text-left min-w-[220px]">Item Name</th>
                    <th className="p-3 text-center w-24">Qty</th>
                    <th className="p-3 text-center w-28">Rate</th>
                    <th className="p-3 text-right w-32">Amount</th>
                    <th className="p-3 text-center w-20">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-indigo-50">
                  {items.map((item, index) => (
                    <tr key={index} className="hover:bg-indigo-50/40 transition-colors">
                      <td className="p-3 text-center text-xs text-indigo-300 font-mono">{index + 1}</td>

                      <td className="p-2">
                        <input
                          type="text"
                          name="itemName"
                          value={item.itemName}
                          onChange={(e) => handleItemChange(index, e)}
                          placeholder="Enter item name"
                          className="w-full border border-indigo-200 rounded-md px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all font-semibold"
                        />
                      </td>

                      <td className="p-2">
                        <input
                          type="number"
                          name="quantity"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, e)}
                          placeholder="0"
                          className="w-full border border-indigo-200 rounded-md px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 text-right font-mono transition-all"
                        />
                      </td>

                      <td className="p-2">
                        <div className="relative">
                          <IndianRupee size={11} className="absolute left-2 top-2.5 text-indigo-300" />
                          <input
                            type="number"
                            name="rate"
                            value={item.rate}
                            onChange={(e) => handleItemChange(index, e)}
                            placeholder="0.00"
                            className="w-full border border-indigo-200 rounded-md pl-6 pr-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 text-right font-mono transition-all"
                          />
                        </div>
                      </td>

                      <td className="p-2 text-right">
                        <span className="text-sm font-bold text-indigo-700 font-mono">
                          ₹{Number(item.amount || 0).toLocaleString("en-IN")}
                        </span>
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

          {/* ─── TOTAL AMOUNT ─── */}
          <div className="flex justify-end p-5 bg-indigo-50/20 border-b border-indigo-100">
            <div className="bg-gradient-to-br from-indigo-50 to-sky-50 border border-indigo-200 rounded-xl px-6 py-3 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 block mb-1">
                Total Order Amount
              </span>
              <span className="text-2xl font-black text-indigo-700 font-mono">
                ₹{totalAmount.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* ─── REMARKS ─── */}
          <div className="col-span-12 p-6 bg-indigo-50/20 border-b border-indigo-100">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={14} className="text-indigo-500" />
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
              className="w-full bg-white border border-indigo-200 rounded-lg p-3 focus:ring-2 focus:ring-indigo-400 outline-none text-slate-600 text-sm resize-none"
            ></textarea>
          </div>

          {/* ─── STICKY BOTTOM ACTION BAR ─── */}
          <div className="flex bg-indigo-950/95 backdrop-blur-md text-white p-3 gap-3 items-center">
            <button
              type="submit"
              className="flex items-center gap-2.5 bg-gradient-to-b from-indigo-500 to-sky-600 hover:from-indigo-400 hover:to-sky-500 px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all shadow-lg shadow-indigo-900/40 active:scale-95 border-t border-indigo-400/30"
            >
              <Save size={16} strokeWidth={2.5} />
              Save Order
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-2.5 bg-indigo-900 hover:bg-indigo-800 px-4 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-wider border border-indigo-700 transition-all active:bg-indigo-950"
            >
              <RotateCcw size={16} className="text-indigo-300" />
              Reset
            </button>

            <button
              type="button"
              onClick={() => navigate("/stock-order")}
              className="flex items-center gap-2.5 text-indigo-400 hover:text-rose-400 hover:bg-rose-500/10 px-4 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-wider ml-auto transition-all group"
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

export default StockOrderForm;