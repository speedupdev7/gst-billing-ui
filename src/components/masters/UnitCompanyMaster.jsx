import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useToast } from "../contextapi/ToastContext";
import ReusableDialogueBox from "../contextapi/ReusableDialogueBox";
import {
  FiMail,
  FiPhone,
  FiSave,
  FiMapPin,
  FiBriefcase,
} from "react-icons/fi";

export default function UnitCompanyMaster() {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [form, setForm] = useState({
    unitName: "",
    gstin: "",
    pan: "",
    address: "",
    city: "",
    pincode: "",
    state: "",
    stateCode: "",
    email: "",
    mobileNo: "",
    bankName: "",
    accountNumber: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // --- SEPARATE API: PUT (Update) ---
  const updateUnit = async () => {
    try {
      await axios.put(`/api/unit-master/${editId}`, form);
      toast.success("Updated successfully!");
      navigate("/unit-company-list");
    } catch (error) {
      console.error("Update Error:", error);
      toast.error("Error occurred while updating");
    }
  };

  // --- SEPARATE API: POST (Save) ---
  const saveUnit = async () => {
    try {
      await axios.post("/api/unit-master", form);
      toast.success("Saved successfully!");
      navigate("/unit-company-list");
    } catch (error) {
      console.error("Save Error:", error);
      toast.error("Error occurred while saving");
    }
  };

  // --- Logic to decide which API to call ---
  const handleFinalSubmit = async () => {
    setIsDialogOpen(false);
    if (editId) {
      await updateUnit();
    } else {
      await saveUnit();
    }
  };

  const handleConfirmTrigger = (e) => {
    e.preventDefault();
    setIsDialogOpen(true);
  };

  useEffect(() => {
    if (editId) {
      axios.get(`/api/unit-master/${editId}`)
        .then((res) => {
          setForm(res.data);
        })
        .catch((err) => console.error("Edit Error:", err));
    }
  }, [editId]);

  const handleReset = () =>
    setForm({
      unitName: "", gstin: "", pan: "", address: "", city: "",
      pincode: "", state: "", stateCode: "", email: "",
      mobileNo: "", bankName: "", accountNumber: "",
    });

  const inputBase =
    "w-full rounded-md border border-slate-300 bg-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 shadow-sm px-3 py-2";

  return (
    <div className="w-full bg-white p-0 m-0">
      
      <ReusableDialogueBox 
        isOpen={isDialogOpen}
        title={editId ? "Confirm Update" : "Confirm Save"}
        message={editId ? "Are you sure you want to update this company?" : "Are you sure you want to save this company?"}
        onConfirm={handleFinalSubmit}
        onCancel={() => setIsDialogOpen(false)}
      />

      {/* HEADER */}
      <div className="w-full bg-white border-b p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-md bg-indigo-600 text-white flex items-center justify-center text-lg shadow">
            <FiBriefcase />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">Unit Company Master</h1>
            <p className="text-xs text-slate-500">Add unit/company details</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate("/unit-company-list")}
          className="px-3 py-1.5 text-xs rounded-md bg-indigo-600 text-white shadow hover:bg-indigo-700"
        >
          VIEW LIST
        </button>
      </div>

      <form onSubmit={handleConfirmTrigger} className="w-full p-3 space-y-5">
        {/* SECTION 1: Legal */}
        <section>
          <h2 className="text-sm font-semibold text-slate-700 mb-2">General & Legal Info</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-600">Unit Name *</label>
              <input name="unitName" value={form.unitName} onChange={handleChange} className={inputBase} placeholder="Enter company name" required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600">GSTIN</label>
                <input name="gstin" value={form.gstin} onChange={handleChange} className={inputBase} placeholder="22AAAAA0000A1Z5" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">PAN</label>
                <input name="pan" value={form.pan} onChange={handleChange} className={inputBase} placeholder="ABCDE1234F" />
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: Contact */}
        <section>
          <h2 className="text-sm font-semibold text-slate-700 mb-2">Contact Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <label className="text-xs font-medium text-slate-600">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-3 text-slate-400" />
                <input name="email" type="email" value={form.email} onChange={handleChange} className={`${inputBase} pl-10`} placeholder="name@company.com" />
              </div>
            </div>
            <div className="relative">
              <label className="text-xs font-medium text-slate-600">Phone</label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-3 text-slate-400" />
                <input name="mobileNo" value={form.mobileNo} onChange={handleChange} className={`${inputBase} pl-10`} placeholder="+91 98765 43210" />
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: Address */}
        <section>
          <h2 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1"><FiMapPin /> Registered Address</h2>
          <div className="space-y-4">
            <input name="address" value={form.address} onChange={handleChange} className={inputBase} placeholder="Address line" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <input name="city" value={form.city} onChange={handleChange} className={inputBase} placeholder="City" />
              <input name="pincode" value={form.pincode} onChange={handleChange} className={inputBase} placeholder="Pincode" />
              <input name="state" value={form.state} onChange={handleChange} className={inputBase} placeholder="State" />
              <input name="stateCode" value={form.stateCode} onChange={handleChange} className={inputBase} placeholder="State Code" />
            </div>
          </div>
        </section>

        {/* SECTION 4: Banking */}
        <section>
          <h2 className="text-sm font-semibold text-slate-700 mb-2">Bank Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input name="bankName" value={form.bankName} onChange={handleChange} className={inputBase} placeholder="Bank Name" />
            <input name="accountNumber" value={form.accountNumber} onChange={handleChange} className={inputBase} placeholder="Account Number" />
          </div>
        </section>

        {/* BUTTONS */}
        <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t">
          <div className="flex gap-3">
            {editId ? (
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md">Update</button>
            ) : (
              <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-md">Save</button>
            )}
          </div>
          <button type="button" onClick={handleReset} className="bg-slate-100 text-slate-600 px-6 py-2 rounded-md text-sm hover:bg-slate-200">
            Reset Form
          </button>
        </div>
      </form>
    </div>
  );
}
