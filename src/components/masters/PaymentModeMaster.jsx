import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FiSave, FiRefreshCcw, FiCreditCard, FiLoader, FiX } from "react-icons/fi";
import { useToast } from "../contextapi/ToastContext";
import ReusableDialogueBox from "../contextapi/ReusableDialogueBox";

export default function PaymentModeMaster() {
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");

  // State for logic handling
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [errors, setErrors] = useState({});

  // Payment Mode form fields
  const [form, setForm] = useState({
    paymentModeCode: "",
    paymentModeName: "",
    description: "",
    isActive: true
  });

  // --- 1. FETCH POST API CALLING (To prevent blank form on edit) ---
  useEffect(() => {
    if (editId) {
      // Mock data for demo - replace with actual API call
      const mockData = {
        paymentModeCode: "CASH",
        paymentModeName: "Cash Payment",
        description: "Direct cash payment method",
        isActive: true
      };
      setForm(mockData);
    }
  }, [editId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((s) => ({
      ...s,
      [name]: type === "checkbox" ? checked : value
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.paymentModeCode.trim()) newErrors.paymentModeCode = "Payment Mode Code is required";
    if (!form.paymentModeName.trim()) newErrors.paymentModeName = "Payment Mode Name is required";
    return newErrors;
  };

  // --- 2.  PUT API CALLING (Mock) ---
  const updatePaymentMode = async () => {
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Updated successfully!");
      navigate("/payment-mode-master-list");
    } catch (error) {
      console.error("Update Error:", error);
      toast.error("Error occurred while updating data");
    } finally {
      setLoading(false);
    }
  };

  // --- 3. POST API CALLING (Mock) ---
  const savePaymentMode = async () => {
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Saved successfully!");
      navigate("/payment-mode-master-list");
    } catch (error) {
      console.error("Save Error:", error);
      if (error.response && error.response.status === 409) {
        toast.error("Payment Mode record already exists!");
      } else {
        toast.error("Error occurred while saving data");
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Handles which API to call ---
  const handleSubmit = async () => {
    setIsDialogOpen(false);
    setLoading(true);

    if (editId) {
      await updatePaymentMode();
    } else {
      await savePaymentMode();
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

  const handleReset = () => {
    setForm({
      paymentModeCode: "",
      paymentModeName: "",
      description: "",
      isActive: true
    });
    setErrors({});
  };

  const inputClass = (field) => `w-full rounded-md border bg-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 shadow-sm px-3 py-2 ${errors[field] ? "border-red-500" : "border-slate-300"}`;

  return (
    <div className="w-full m-0 p-0 bg-white">
      <ReusableDialogueBox
        isOpen={isDialogOpen}
        title={editId ? "Confirm Update" : "Confirm Save"}
        message={editId ? "Are you sure you want to update this payment mode?" : "Are you sure you want to save this payment mode?"}
        onConfirm={handleSubmit}
        onCancel={() => setIsDialogOpen(false)}
      />

      {/* Header */}
      <div className="w-full flex items-center justify-between px-3 py-3 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-indigo-600 text-white flex items-center justify-center text-lg shadow">
            <FiCreditCard />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-indigo-700 leading-tight">Payment Mode Master</h1>
            <p className="text-xs text-slate-500">{editId ? "Update existing payment mode" : "Add new payment mode details"}</p>
          </div>
        </div>

        <Link
          to="/payment-mode-master-list"
          className="px-3 py-1.5 rounded-md bg-indigo-600 text-white text-xs font-semibold shadow hover:bg-indigo-700 transition-colors"
        >
          VIEW LIST
        </Link>
      </div>

      {/* Form */}
      <form onSubmit={handleConfirmTrigger} className="w-full p-3 space-y-4">
        {/* Row 1: Primary Identity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-600">Payment Mode Code <span className="text-red-500">*</span></label>
            <input
              name="paymentModeCode"
              value={form.paymentModeCode}
              onChange={handleChange}
              type="text"
              className={`${inputClass("paymentModeCode")}`}
              placeholder="e.g., CASH, CARD, UPI"
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Payment Mode Name <span className="text-red-500">*</span></label>
            <input
              name="paymentModeName"
              value={form.paymentModeName}
              onChange={handleChange}
              type="text"
              className={`${inputClass("paymentModeName")}`}
              placeholder="e.g., Cash Payment, Credit Card"
              required
            />
          </div>
        </div>

        {/* Description Section */}
        <div className="space-y-3 pt-2">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Additional Details</h3>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                className={`${inputClass("description")}`}
                placeholder="Optional description about this payment mode"
              />
            </div>
          </div>
        </div>

        {/* Status Section */}
        <div className="space-y-3 pt-2">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</h3>
          <div className="flex items-center gap-3">
            <input
              id="isActive"
              name="isActive"
              type="checkbox"
              checked={form.isActive}
              onChange={handleChange}
              className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-slate-600">
              Active Payment Mode
            </label>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t">
          <button
            type="submit"
            disabled={loading}
            className={`flex items-center justify-center gap-2 px-6 py-2 rounded-md text-white text-sm font-semibold shadow transition-all ${editId ? "bg-blue-600 hover:bg-blue-700" : "bg-emerald-600 hover:bg-emerald-700"}`}
          >
            {loading ? <FiLoader className="animate-spin" /> : <FiSave />}
            {editId ? "UPDATE PAYMENT MODE" : "SAVE PAYMENT MODE"}
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
