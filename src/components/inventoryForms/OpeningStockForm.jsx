import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Save,
  RotateCcw,
  Package,
  IndianRupee,
  CalendarDays,
  Truck,
  Search,
  Hash,
  Layers,
  FileText,
  CheckCircle2,
  XCircle,
  List,
} from "lucide-react";
import { useToast } from "../contextapi/ToastContext";

const initialFormData = {
  itemId: null,
  itemName: "",
  category: "",
  batchNo: "",
  quantity: "",
  purchaseRate: "",
  sellingRate: "",
  mrp: "",
  gst: "",
  expiryDate: "",
  supplier: "",
  remarks: "",
};

const OpeningStockForm = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [itemSuggestions, setItemSuggestions] = useState([]);
  const [showItemDropdown, setShowItemDropdown] = useState(false);
  const itemWrapperRef = useRef(null);

  const totalAmount = Number(formData.quantity || 0) * Number(formData.purchaseRate || 0);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (itemWrapperRef.current && !itemWrapperRef.current.contains(event.target)) {
        setShowItemDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemNameChange = async (e) => {
    const itemName = e.target.value;
    setFormData((prev) => ({ ...prev, itemName, itemId: null }));
    setResult(null);

    if (itemName.trim().length < 2) {
      setItemSuggestions([]);
      setShowItemDropdown(false);
      return;
    }

    try {
      const response = await axios.get(`/api/item-master/search?q=${encodeURIComponent(itemName)}`);
      setItemSuggestions(response.data || []);
      setShowItemDropdown((response.data || []).length > 0);
    } catch {
      setItemSuggestions([]);
      setShowItemDropdown(false);
    }
  };

  const selectItem = (item) => {
    setFormData((prev) => ({
      ...prev,
      itemId: item.itemId,
      itemName: item.itemName,
    }));
    setItemSuggestions([]);
    setShowItemDropdown(false);
  };

  const validateForm = () => {
    const validationErrors = [];
    const quantity = Number(formData.quantity);
    const purchaseRate = Number(formData.purchaseRate);
    const sellingRate = Number(formData.sellingRate);
    const mrp = Number(formData.mrp);

    if (!formData.itemId && !formData.itemName.trim()) {
      validationErrors.push("Item must be selected or entered.");
    }
    if (!formData.batchNo.trim()) {
      validationErrors.push("Batch code is required.");
    }
    if (!quantity || quantity <= 0) {
      validationErrors.push("Quantity must be greater than 0.");
    }
    if (!purchaseRate || purchaseRate <= 0) {
      validationErrors.push("Purchase rate must be greater than 0.");
    }
    if (!sellingRate || sellingRate <= 0) {
      validationErrors.push("Selling rate must be greater than 0.");
    }
    if (!mrp || mrp <= 0) {
      validationErrors.push("MRP must be greater than 0.");
    }
    if (!formData.expiryDate) {
      validationErrors.push("Expiry date is required.");
    }
    if (!formData.supplier.trim()) {
      validationErrors.push("Supplier name is required.");
    }

    return validationErrors;
  };

  const buildPayload = () => ({
    itemId: formData.itemId,
    itemName: formData.itemId ? undefined : formData.itemName.trim() || undefined,
    batchCode: formData.batchNo.trim(),
    quantity: Number(formData.quantity),
    purchaseRate: Number(formData.purchaseRate),
    sellingRate: Number(formData.sellingRate),
    mrp: Number(formData.mrp),
    gstPercent: formData.gst ? Number(formData.gst) : undefined,
    expiryDate: formData.expiryDate,
    supplierName: formData.supplier.trim(),
    remarks: formData.remarks.trim() || undefined,
  });

  const addOpeningStock = async () => {
    const payload = buildPayload();
    setIsLoading(true);

    try {
      const response = await axios.post("/api/item-master/opening-stock", payload, {
        headers: { "Content-Type": "application/json" },
      });

      setResult(response.data);
      toast.success(`Opening stock added successfully for ${response.data.itemName || formData.itemName}`);
      setErrors([]);
      setFormData(initialFormData);
      setItemSuggestions([]);
      setShowItemDropdown(false);
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Failed to save opening stock.";
      if (error.response?.status === 404) {
        toast.error("Item not found. Please select a valid item.");
      } else if (error.response?.status === 400) {
        toast.error(message);
      } else {
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResult(null);

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      validationErrors.forEach((message) => toast.error(message));
      return;
    }

    setErrors([]);
    await addOpeningStock();
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setErrors([]);
    setResult(null);
    setItemSuggestions([]);
    setShowItemDropdown(false);
  };

  const labelCls = "text-slate-500 font-bold uppercase block mb-1.5 text-[10px]";
  const inputCls =
    "w-full border border-violet-200 rounded-md p-2 bg-white outline-none shadow-sm focus:ring-2 focus:ring-violet-400 transition-all text-sm";

  return (
    <div
      className="min-h-screen p-2 sm:p-4 md:p-3 text-[12px] font-sans text-slate-700"
      style={{ background: "linear-gradient(135deg, #faf5ff 0%, #fdf4ff 30%, #fffbeb 100%)" }}
    >
      <div className="max-w-[1500px] mx-auto bg-white rounded-xl overflow-hidden border border-violet-200 shadow-xl shadow-violet-100/50">
        {/* ─── STICKY TOP ACTION BAR ─── */}
        <div className="flex bg-gradient-to-r from-violet-950 via-violet-900 to-fuchsia-950 text-white p-3 gap-3 items-center border-b border-white/10 shadow-lg">
          <div className="flex items-center gap-3 pr-4 border-r border-violet-400/30 mr-2">
            <div className="bg-gradient-to-br from-violet-400 to-fuchsia-600 p-2 rounded-xl shadow-inner ring-1 ring-white/20">
              <Package size={20} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm tracking-tight text-white uppercase">
                Opening Stock Entry
              </span>
              <span className="text-[10px] text-violet-300 font-medium tracking-widest">
                Inventory / New Batch Addition
              </span>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-violet-700/40 rounded-lg border border-violet-500/30">
            <button
              onClick={() => navigate("/opening-stock")}
              className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-violet-200 hover:text-white"
            >
              <List size={13} /> View List
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* ─── VALIDATION ERRORS ─── */}
          {errors.length > 0 && (
            <div className="m-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* ─── SECTION 1: ITEM & BATCH DETAILS ─── */}
          <div className="grid grid-cols-12 bg-gradient-to-br from-violet-50 via-fuchsia-50 to-white border-b border-violet-200">
            <div className="col-span-12 p-3 bg-violet-100/50 flex items-center justify-between border-b border-violet-200">
              <div className="flex items-center gap-2">
                <Layers size={14} className="text-violet-800" />
                <span className="font-bold text-violet-800 uppercase tracking-wider text-[10px]">
                  Item & Batch Details
                </span>
              </div>
            </div>

            <div ref={itemWrapperRef} className="col-span-12 md:col-span-4 p-4 border-r border-b border-violet-200/50 bg-white/40 relative">
              <label className={labelCls}>Item Name</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-3 text-violet-400" />
                <input
                  type="text"
                  name="itemName"
                  value={formData.itemName}
                  onChange={handleItemNameChange}
                  placeholder="Select or enter item name"
                  className={`${inputCls} pl-9 font-semibold`}
                />
              </div>
              {showItemDropdown && itemSuggestions.length > 0 && (
                <div className="absolute z-20 mt-1 max-h-52 w-[calc(100%-2rem)] overflow-auto rounded-lg border border-violet-200 bg-white shadow-lg">
                  {itemSuggestions.map((item) => (
                    <button
                      key={item.itemId}
                      type="button"
                      onMouseDown={() => selectItem(item)}
                      className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-violet-50 border-b border-violet-50 last:border-b-0"
                    >
                      <div className="font-bold">{item.itemName}</div>
                      <div className="text-xs text-violet-400">{item.itemCode || item.batchCode || ""}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="col-span-12 md:col-span-3 p-4 border-r border-b border-violet-200/50">
              <label className={labelCls}>Category</label>
              <select name="category" value={formData.category} onChange={handleChange} className={inputCls}>
                <option value="">Select Category</option>
                <option>Tablet</option>
                <option>Syrup</option>
                <option>Capsule</option>
                <option>Injection</option>
              </select>
            </div>

            <div className="col-span-12 md:col-span-2 p-4 border-r border-b border-violet-200/50">
              <label className={labelCls}>Batch No</label>
              <div className="relative">
                <Hash size={14} className="absolute left-2.5 top-3 text-violet-400" />
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

            <div className="col-span-12 md:col-span-3 p-4 border-b border-violet-200/50 bg-violet-50/20">
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

          {/* ─── SECTION 2: PRICING & TAX DETAILS ─── */}
          <div className="grid grid-cols-12 border-b border-violet-200">
            <div className="col-span-12 p-3 bg-fuchsia-100/40 flex items-center justify-between border-b border-violet-200">
              <div className="flex items-center gap-2">
                <IndianRupee size={14} className="text-fuchsia-800" />
                <span className="font-bold text-fuchsia-800 uppercase tracking-wider text-[10px]">
                  Pricing &amp; Tax Details
                </span>
              </div>
            </div>

            <div className="col-span-6 md:col-span-3 p-4 border-r border-b border-violet-200/50 bg-violet-50/10">
              <label className={labelCls}>Purchase Rate</label>
              <div className="relative">
                <IndianRupee size={13} className="absolute left-2.5 top-3 text-violet-400" />
                <input
                  type="number"
                  name="purchaseRate"
                  value={formData.purchaseRate}
                  onChange={handleChange}
                  placeholder="0.00"
                  className={`${inputCls} pl-7 text-right font-mono font-semibold`}
                />
              </div>
            </div>

            <div className="col-span-6 md:col-span-3 p-4 border-r border-b border-violet-200/50 bg-violet-50/10">
              <label className={labelCls}>Selling Rate</label>
              <div className="relative">
                <IndianRupee size={13} className="absolute left-2.5 top-3 text-violet-400" />
                <input
                  type="number"
                  name="sellingRate"
                  value={formData.sellingRate}
                  onChange={handleChange}
                  placeholder="0.00"
                  className={`${inputCls} pl-7 text-right font-mono font-semibold`}
                />
              </div>
            </div>

            <div className="col-span-6 md:col-span-3 p-4 border-r border-b border-violet-200/50 bg-violet-50/10">
              <label className={labelCls}>MRP</label>
              <div className="relative">
                <IndianRupee size={13} className="absolute left-2.5 top-3 text-violet-400" />
                <input
                  type="number"
                  name="mrp"
                  value={formData.mrp}
                  onChange={handleChange}
                  placeholder="0.00"
                  className={`${inputCls} pl-7 text-right font-mono font-semibold`}
                />
              </div>
            </div>

            <div className="col-span-6 md:col-span-3 p-4 border-b border-violet-200/50 bg-violet-50/10">
              <label className={labelCls}>GST %</label>
              <input
                type="number"
                name="gst"
                value={formData.gst}
                onChange={handleChange}
                placeholder="0"
                className={`${inputCls} text-right font-mono font-semibold`}
              />
            </div>
          </div>

          {/* ─── SECTION 3: EXPIRY, SUPPLIER & TOTAL ─── */}
          <div className="grid grid-cols-12 border-b border-violet-200">
            <div className="col-span-12 p-3 bg-violet-100/40 flex items-center justify-between border-b border-violet-200">
              <div className="flex items-center gap-2">
                <Truck size={14} className="text-violet-800" />
                <span className="font-bold text-violet-800 uppercase tracking-wider text-[10px]">
                  Expiry, Supplier &amp; Total
                </span>
              </div>
            </div>

            <div className="col-span-12 md:col-span-4 p-4 border-r border-b border-violet-200/50">
              <label className={labelCls}>Expiry Date</label>
              <div className="relative">
                <CalendarDays size={14} className="absolute left-3 top-3 text-violet-400 pointer-events-none" />
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  className={`${inputCls} pl-9 font-semibold`}
                />
              </div>
            </div>

            <div className="col-span-12 md:col-span-4 p-4 border-r border-b border-violet-200/50">
              <label className={labelCls}>Supplier Name</label>
              <div className="relative">
                <Truck size={14} className="absolute left-3 top-3 text-violet-400" />
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

            <div className="col-span-12 md:col-span-4 p-4 border-b border-violet-200/50 bg-amber-50/50">
              <label className="text-amber-600 font-bold uppercase block mb-1.5 text-[10px]">
                Total Amount
              </label>
              <div className="w-full rounded-md border border-amber-200 bg-white px-3 py-2 text-right font-mono font-black text-amber-700 text-base shadow-sm">
                ₹{Number.isFinite(totalAmount) ? totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "0.00"}
              </div>
            </div>
          </div>

          {/* ─── REMARKS ─── */}
          <div className="col-span-12 p-6 bg-violet-50/20 border-b border-violet-100">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={14} className="text-violet-500" />
              <span className="text-slate-700 font-bold uppercase text-[11px] tracking-widest">
                Remarks / Internal Notes
              </span>
            </div>
            <textarea
              rows="3"
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              placeholder="Enter any additional information about this stock entry..."
              className="w-full bg-white border border-violet-200 rounded-lg p-3 focus:ring-2 focus:ring-violet-400 outline-none text-slate-600 text-sm resize-none"
            ></textarea>
          </div>

          {/* ─── STICKY BOTTOM ACTION BAR ─── */}
          <div className="flex bg-violet-950/95 backdrop-blur-md text-white p-3 gap-3 items-center">
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2.5 bg-gradient-to-b from-violet-500 to-fuchsia-600 hover:from-violet-400 hover:to-fuchsia-500 px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all shadow-lg shadow-violet-900/40 active:scale-95 border-t border-violet-400/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={16} strokeWidth={2.5} />
              {isLoading ? "Saving..." : "Save Stock"}
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-2.5 bg-violet-900 hover:bg-violet-800 px-4 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-wider border border-violet-700 transition-all active:bg-violet-950"
            >
              <RotateCcw size={16} className="text-violet-300" />
              Reset
            </button>

            <button
              type="button"
              onClick={() => navigate("/opening-stock")}
              className="flex items-center gap-2.5 text-violet-400 hover:text-rose-400 hover:bg-rose-500/10 px-4 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-wider ml-auto transition-all group"
            >
              <XCircle size={16} className="group-hover:rotate-90 transition-transform duration-300" />
              Cancel
            </button>
          </div>
        </form>

        {/* ─── SUCCESS RESULT ─── */}
        {result && (
          <div className="m-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-slate-800">
            <h2 className="mb-3 text-base font-semibold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 size={16} /> Opening Stock Saved
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <span className="block text-[10px] font-bold uppercase text-emerald-500">Opening Stock ID</span>
                <span className="font-semibold">{result.openingStockId}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase text-emerald-500">Item Name</span>
                <span className="font-semibold">{result.itemName}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase text-emerald-500">Item Code</span>
                <span className="font-semibold">{result.itemCode}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase text-emerald-500">Total Amount</span>
                <span className="font-semibold">₹{result.totalAmount?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OpeningStockForm;