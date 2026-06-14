import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Save, RotateCcw, Package } from "lucide-react";
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
      navigate("/opening-stock");
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

  return (
    <div className="min-h-screen bg-gray-100 p-3 md:p-4">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
        <div className="flex items-center gap-2">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Package className="text-blue-600" size={18} />
          </div>

          <div>
            <h1 className="text-lg font-bold text-gray-800">Opening Stock Form</h1>
            <p className="text-xs text-gray-500 mt-1">
              Add medicine opening stock details
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 mt-4 p-4">
        {errors.length > 0 && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div ref={itemWrapperRef} className="relative">
            <label className="text-xs font-medium text-gray-700">Item Name</label>
            <input
              type="text"
              name="itemName"
              value={formData.itemName}
              onChange={handleItemNameChange}
              placeholder="Select or enter item name"
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-200"
            />
            {showItemDropdown && itemSuggestions.length > 0 && (
              <div className="absolute z-20 mt-1 max-h-52 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                {itemSuggestions.map((item) => (
                  <button
                    key={item.itemId}
                    type="button"
                    onMouseDown={() => selectItem(item)}
                    className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                  >
                    <div className="font-medium">{item.itemName}</div>
                    <div className="text-xs text-slate-500">{item.itemCode || item.batchCode || ""}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-200"
            >
              <option value="">Select Category</option>
              <option>Tablet</option>
              <option>Syrup</option>
              <option>Capsule</option>
              <option>Injection</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700">Batch No</label>
            <input
              type="text"
              name="batchNo"
              value={formData.batchNo}
              onChange={handleChange}
              placeholder="Enter batch number"
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-200"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700">Quantity</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="Enter quantity"
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-200"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700">Purchase Rate</label>
            <input
              type="number"
              name="purchaseRate"
              value={formData.purchaseRate}
              onChange={handleChange}
              placeholder="Enter purchase rate"
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-200"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700">Selling Rate</label>
            <input
              type="number"
              name="sellingRate"
              value={formData.sellingRate}
              onChange={handleChange}
              placeholder="Enter selling rate"
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-200"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700">MRP</label>
            <input
              type="number"
              name="mrp"
              value={formData.mrp}
              onChange={handleChange}
              placeholder="Enter MRP"
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-200"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700">GST %</label>
            <input
              type="number"
              name="gst"
              value={formData.gst}
              onChange={handleChange}
              placeholder="Enter GST"
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-200"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700">Total Amount</label>
            <div className="w-full mt-1 rounded-lg border border-gray-300 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              {Number.isFinite(totalAmount) ? totalAmount.toFixed(2) : "0.00"}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700">Expiry Date</label>
            <input
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-200"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-medium text-gray-700">Supplier Name</label>
            <input
              type="text"
              name="supplier"
              value={formData.supplier}
              onChange={handleChange}
              placeholder="Enter supplier name"
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-200"
            />
          </div>

          <div className="md:col-span-2 lg:col-span-3">
            <label className="text-xs font-medium text-gray-700">Remarks</label>
            <textarea
              rows="3"
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              placeholder="Enter remarks..."
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-200 resize-none"
            ></textarea>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-5">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Save size={16} />
            {isLoading ? "Saving..." : "Save Stock"}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 border border-gray-300 bg-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            <RotateCcw size={16} />
            Reset
          </button>
        </div>
      </form>

      {result && (
        <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-slate-800">
          <h2 className="mb-2 text-base font-semibold text-slate-900">Opening Stock Saved</h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <span className="font-semibold">Opening Stock ID:</span> {result.openingStockId}
            </div>
            <div>
              <span className="font-semibold">Item Name:</span> {result.itemName}
            </div>
            <div>
              <span className="font-semibold">Item Code:</span> {result.itemCode}
            </div>
            <div>
              <span className="font-semibold">Total Amount:</span> {result.totalAmount?.toFixed(2)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpeningStockForm;
