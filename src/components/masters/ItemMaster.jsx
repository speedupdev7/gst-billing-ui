import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useToast } from "../contextapi/ToastContext";
import ReusableDialogueBox from "../contextapi/ReusableDialogueBox";
import { FiSave, FiRefreshCcw, FiPackage, FiLoader } from "react-icons/fi";

export default function ItemMaster() {
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");

  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    itemName: "",
    itemNameDetails: "",
    itemCode: "",
    hsnCode: "",
    unit: "",
    gstRate: "",
    purchasePrice: "",
    salePrice: "",
    mrp: "",
    openingStock: "",
  });

  useEffect(() => {
    if (editId) {
      axios
        .get(`/api/item-master/${editId}`)
        .then((res) => {
          setForm(res.data);
        })
        .catch((err) => {
          console.error("Fetch Error:", err);
          toast.error("Failed to load item details");
        });
    }
  }, [editId, toast]);

  const updateItem = async () => {
    try {
      const response = await axios.put(`/api/item-master/${editId}`, form);
      toast.success("Updated successfully!");
      navigate("/item-master-list");
      console.log(response.data);
    } catch (error) {
      console.error("Update Error:", error);
      toast.error("Error occurred while updating item");
    } finally {
      setLoading(false);
    }
  };

  const saveItem = async () => {
    try {
      const response = await axios.post("/api/item-master", form);
      toast.success("Saved successfully!");
      navigate("/item-master-list");
      console.log(response.data);
    } catch (error) {
      console.error("Backend Error Detail:", error.response?.data);
      console.error("Save Error:", error);
      if (error.response && error.response.status === 409) {
        toast.error("Item record already exists!");
      } else {
        toast.error("Error occurred while saving item");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setIsDialogOpen(false);
    setLoading(true);

    if (editId) {
      await updateItem();
    } else {
      await saveItem();
    }
  };

  const handleConfirmTrigger = (e) => {
    if (e) e.preventDefault();
    if (loading) return;
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setIsDialogOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.itemName.trim()) newErrors.itemName = "Item Name is required";
    if (!form.itemCode.trim()) newErrors.itemCode = "Item Code is required";
    if (form.hsnCode && !/^\d{4,8}$/.test(form.hsnCode)) {
      newErrors.hsnCode = "HSN Code must be 4-8 digits";
    }
    if (form.gstRate && form.gstRate !== "" && (isNaN(Number(form.gstRate)) || Number(form.gstRate) < 0 || Number(form.gstRate) > 100)) {
      newErrors.gstRate = "GST Rate must be between 0 and 100";
    }
    if (form.purchasePrice && form.purchasePrice !== "" && (isNaN(Number(form.purchasePrice)) || Number(form.purchasePrice) < 0)) {
      newErrors.purchasePrice = "Purchase Price must be a positive number";
    }
    if (form.salePrice && form.salePrice !== "" && (isNaN(Number(form.salePrice)) || Number(form.salePrice) < 0)) {
      newErrors.salePrice = "Sale Price must be a positive number";
    }
    if (form.mrp && form.mrp !== "" && (isNaN(Number(form.mrp)) || Number(form.mrp) < 0)) {
      newErrors.mrp = "MRP must be a positive number";
    }
    if (form.openingStock && form.openingStock !== "" && (isNaN(Number(form.openingStock)) || Number(form.openingStock) < 0)) {
      newErrors.openingStock = "Opening Stock must be a positive number";
    }
    return newErrors;
  };

  const handleReset = () => {
    setForm({
      itemName: "",
      itemNameDetails: "",
      itemCode: "",
      hsnCode: "",
      unit: "",
      gstRate: "",
      purchasePrice: "",
      salePrice: "",
      mrp: "",
      openingStock: "",
    });
    setErrors({});
  };

  const inputClass = (field) => `w-full rounded-md border bg-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 shadow-sm ${errors[field] ? "border-red-500 bg-red-50" : "border-slate-300"}`;

  return (
    <div className="w-full m-0 p-0 bg-white">
      <ReusableDialogueBox
        isOpen={isDialogOpen}
        title={editId ? "Confirm Update" : "Confirm Save"}
        message={editId ? "Are you sure you want to update this item?" : "Are you sure you want to save this item?"}
        onConfirm={handleSubmit}
        onCancel={() => setIsDialogOpen(false)}
      />

      <div className="w-full flex items-center justify-between px-3 py-3 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-indigo-600 text-white flex items-center justify-center text-lg shadow">
            <FiPackage />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-indigo-700 leading-tight">Item Master</h1>
            <p className="text-xs text-slate-500">Add or update items</p>
          </div>
        </div>

        <Link
          to="/item-master-list"
          className="px-3 py-1.5 rounded-md bg-indigo-600 text-white text-xs font-semibold shadow hover:bg-indigo-700"
        >
          VIEW LIST
        </Link>
      </div>

      <form onSubmit={handleConfirmTrigger} className="w-full p-3 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-semibold text-slate-600">
              Item Name <span className="text-red-500">*</span>
            </label>
            <input
              name="itemName"
              value={form.itemName}
              onChange={handleChange}
              type="text"
              className={`${inputClass("itemName")} px-2 py-1.5 mt-0.5`}
              placeholder="e.g., Blue Pen"
              required
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600">
              Item Code <span className="text-red-500">*</span>
            </label>
            <input
              name="itemCode"
              value={form.itemCode}
              onChange={handleChange}
              type="text"
              className={`${inputClass("itemCode")} px-2 py-1.5 mt-0.5`}
              placeholder="e.g., BP-001"
              required
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-600">Item Details</label>
          <input
            name="itemNameDetails"
            value={form.itemNameDetails}
            onChange={handleChange}
            type="text"
            className={`${inputClass("itemNameDetails")} px-3 py-2 mt-1`}
            placeholder="Details / description (e.g., Ballpoint pen, blue ink)"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-600">HSN Code</label>
            <input
              name="hsnCode"
              value={form.hsnCode}
              onChange={handleChange}
              type="text"
              className={`${inputClass("hsnCode")} px-3 py-2 mt-1`}
              placeholder="e.g., 9608"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600">Unit</label>
            <input
              name="unit"
              value={form.unit}
              onChange={handleChange}
              type="text"
              className={`${inputClass("unit")} px-3 py-2 mt-1`}
              placeholder="pcs, pack"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600">GST Rate (%)</label>
            <input
              name="gstRate"
              value={form.gstRate}
              onChange={handleChange}
              type="number"
              min="0"
              step="0.01"
              className={`${inputClass("gstRate")} px-3 py-2 mt-1`}
              placeholder="e.g., 18"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-600">Purchase Price</label>
            <input
              name="purchasePrice"
              value={form.purchasePrice}
              onChange={handleChange}
              type="number"
              min="0"
              step="0.01"
              className={`${inputClass("purchasePrice")} px-3 py-2 mt-1`}
              placeholder="Purchase price"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600">Sale Price</label>
            <input
              name="salePrice"
              value={form.salePrice}
              onChange={handleChange}
              type="number"
              min="0"
              step="0.01"
              className={`${inputClass("salePrice")} px-3 py-2 mt-1`}
              placeholder="Sale price"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600">MRP</label>
            <input
              name="mrp"
              value={form.mrp}
              onChange={handleChange}
              type="number"
              min="0"
              step="0.01"
              className={`${inputClass("mrp")} px-3 py-2 mt-1`}
              placeholder="Maximum Retail Price"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-[11px] font-semibold text-slate-600">Opening Stock</label>
            <input
              name="openingStock"
              value={form.openingStock}
              onChange={handleChange}
              type="number"
              min="0"
              step="1"
              className={`${inputClass("openingStock")} px-2 py-1.5 mt-0.5`}
              placeholder="Initial stock quantity"
            />
          </div>

          <div />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t">
          <button
            type="submit"
            disabled={loading}
            className={`flex items-center justify-center gap-2 px-6 py-2 rounded-md text-white text-sm font-semibold shadow transition-all ${
              editId ? "bg-blue-600 hover:bg-blue-700" : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {loading ? <FiLoader className="animate-spin" /> : <FiSave />}
            {editId ? "UPDATE ITEM" : "SAVE ITEM"}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="flex items-center justify-center gap-2 bg-slate-100 text-slate-600 px-6 py-2 rounded-md text-sm hover:bg-slate-200 transition-colors"
          >
            <FiRefreshCcw /> RESET FORM
          </button>
        </div>
      </form>
    </div>
  );
}
