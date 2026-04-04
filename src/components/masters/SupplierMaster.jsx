// src/pages/SupplierMaster.jsx
import React, { useState, useEffect } from "react";
import { Link,useNavigate, useSearchParams } from "react-router-dom";
import { FiSave, FiRefreshCcw, FiTruck, FiLoader, FiX } from "react-icons/fi";
import axios from "axios";
import { useToast } from "../contextapi/ToastContext";
import ReusableDialogueBox from "../contextapi/ReusableDialogueBox";

export default function SupplierMaster() {
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");

  // State for logic handling
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Supplier form fields
  const [form, setForm] = useState({
    supplierId: "",
    supplierName: "",
    contactPerson: "",
    gstin: "",
    pan: "",
    mobileNo: "",
    email: "",
    address: "",
    address1: "",
    city: "",
    pinCode: "",
    state: "",
    stateCode: "",
    bankName: "",
    accountNumber: "",
    ifsc: "",
    branchName: ""
  });

  // --- 1. FETCH POST API CALLING (To prevent blank form on edit) ---
  useEffect(() => {
    if (editId) {
      axios.get(`/api/supplier-master/${editId}`)
        .then((res) => {
          setForm(res.data);
        })
        .catch((err) => {
          console.error("Fetch Error:", err);
          toast.error("Failed to load supplier details");
        });
    }
  }, [editId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  // --- 2.  PUT API CALLING ---
  const updateSupplier = async () => {
    try {
      const response = await axios.put(`/api/supplier-master/${editId}`, form);
      toast.success("Updated successfully!");
      navigate("/supplier-master-list");
    } catch (error) {
      console.error("Update Error:", error);
      toast.error("Error occurred while updating data");
    } finally {
      setLoading(false);
    }
  };

  // --- 3. POST API CALLING ---
  const saveSupplier = async () => {
    try {
      const response = await axios.post("/api/supplier-master", form);
      toast.success("Saved successfully!");
      navigate("/supplier-master-list");
    } catch (error) {
      console.error("Save Error:", error);
      if (error.response && error.response.status === 409) {
        toast.error("Supplier record already exists!");
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
      await updateSupplier();
    } else {
      await saveSupplier();
    }
  };

  const handleConfirmTrigger = (e) => {
    if (e) e.preventDefault();
    if (loading) return;
    setIsDialogOpen(true);
  };

  const handleReset = () => {
    setForm({
      supplierId: "", supplierName: "", contactPerson: "", gstin: "",
      pan: "", mobileNo: "", email: "", address: "", address1: "",
      city: "", pinCode: "", state: "", stateCode: "",
      bankName: "", accountNumber: "", ifsc: "", branchName: ""
    });
  };

  const inputClass =
    "w-full rounded-md border border-slate-300 bg-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 shadow-sm";

  return (
    <div className="w-full m-0 p-0 bg-white">
      <ReusableDialogueBox
        isOpen={isDialogOpen}
        title={editId ? "Confirm Update" : "Confirm Save"}
        message={editId ? "Are you sure you want to update this supplier?" : "Are you sure you want to save this supplier?"}
        onConfirm={handleSubmit}
        onCancel={() => setIsDialogOpen(false)}
      />

      {/* Header */}
      <div className="w-full flex items-center justify-between px-3 py-3 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-indigo-600 text-white flex items-center justify-center text-lg shadow">
            <FiTruck />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-indigo-700 leading-tight">Supplier Master</h1>
            <p className="text-xs text-slate-500">{editId ? "Update existing supplier" : "Add new supplier details"}</p>
          </div>
        </div>

        <Link
          to="/supplier-master-list"
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
            <label className="text-xs font-medium text-slate-600">Supplier Name <span className="text-red-500">*</span></label>
            <input
              name="supplierName"
              value={form.supplierName}
              onChange={handleChange}
              type="text"
              className={`${inputClass} px-3 py-2 mt-1`}
              placeholder="e.g., ABC Suppliers Pvt. Ltd."
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Contact Person</label>
            <input
              name="contactPerson"
              value={form.contactPerson}
              onChange={handleChange}
              type="text"
              className={`${inputClass} px-3 py-2 mt-1`}
              placeholder="Full Name"
            />
          </div>
        </div>

        {/* Row 2: Tax Info & Contact */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-600">GSTIN</label>
            <input
              name="gstin"
              value={form.gstin}
              onChange={handleChange}
              type="text"
              className={`${inputClass} px-3 py-2 mt-1`}
              placeholder="22AAAAA0000A1Z5"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">PAN</label>
            <input
              name="pan"
              value={form.pan}
              onChange={handleChange}
              type="text"
              className={`${inputClass} px-3 py-2 mt-1`}
              placeholder="ABCDE1234F"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Mobile No</label>
            <input
              name="mobileNo"
              value={form.mobileNo}
              onChange={handleChange}
              type="tel"
              className={`${inputClass} px-3 py-2 mt-1`}
              placeholder="+91-0000000000"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Email</label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              type="email"
              className={`${inputClass} px-3 py-2 mt-1`}
              placeholder="supplier@email.com"
            />
          </div>
        </div>

        {/* Address Section */}
        <div className="space-y-3 pt-2">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Address Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              className={`${inputClass} px-3 py-2`}
              placeholder="Address Line 1"
            />
            <input
              name="address1"
              value={form.address1}
              onChange={handleChange}
              className={`${inputClass} px-3 py-2`}
              placeholder="Address Line 2"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input name="city" value={form.city} onChange={handleChange} className={`${inputClass} px-3 py-2`} placeholder="City" />
            <input name="pinCode" value={form.pinCode} onChange={handleChange} className={`${inputClass} px-3 py-2`} placeholder="Pin Code" />
            <input name="state" value={form.state} onChange={handleChange} className={`${inputClass} px-3 py-2`} placeholder="State" />
            <input name="stateCode" value={form.stateCode} onChange={handleChange} className={`${inputClass} px-3 py-2`} placeholder="State Code" />
          </div>
        </div>

        {/* Banking Section */}
        <div className="space-y-3 pt-2">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bank Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input name="bankName" value={form.bankName} onChange={handleChange} className={`${inputClass} px-3 py-2`} placeholder="Bank Name" />
            <input name="accountNumber" value={form.accountNumber} onChange={handleChange} className={`${inputClass} px-3 py-2`} placeholder="Account Number" />
            <input name="ifsc" value={form.ifsc} onChange={handleChange} className={`${inputClass} px-3 py-2`} placeholder="IFSC Code" />
            <input name="branchName" value={form.branchName} onChange={handleChange} className={`${inputClass} px-3 py-2`} placeholder="Branch Name" />
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
            {editId ? "UPDATE SUPPLIER" : "SAVE SUPPLIER"}
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
