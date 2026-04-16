// src/pages/CustomerMaster.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FiSave, FiMail, FiPhone, FiX, FiBriefcase, FiRefreshCcw, FiLoader, FiCreditCard } from "react-icons/fi";
import axios from "axios";
import { useToast } from "../contextapi/ToastContext";
import ReusableDialogueBox from "../contextapi/ReusableDialogueBox";

export default function CustomerMaster() {
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");

  // State for logic handling
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [form, setForm] = useState({
    customerName: "", gstin: "", pan: "", line1: "", line2: "",
    city: "", pinCode: "", state: "", stateCode: "",
    email: "", mobileNo: "", creditlimit: "", bankName: "",
    accountNumber: "", ifsc: "", district: "", customerType: ""
  });

  // --- 1. FETCH POST API CALLING (To prevent blank form on edit) ---
  useEffect(() => {
    if (editId) {
      axios.get(`/api/customer-master/${editId}`)
        .then((res) => {
          setForm(res.data);
        })
        .catch((err) => {
          console.error("Fetch Error:", err);
          toast.error("Failed to load customer details");
        });
    }
  }, [editId, toast]);

  // --- 2.  PUT API CALLING ---
  const buildCustomerPayload = () => ({
    customerName: form.customerName,
    gstin: form.gstin,
    state: form.state,
    stateCode: form.stateCode,
    email: form.email,
    mobileNo: form.mobileNo,
    customerType: form.customerType,
    pinCode: form.pinCode,
    district: form.district,
    billingAddress: [form.line1, form.line2, form.city, form.state, form.stateCode]
      .filter(Boolean)
      .join(", "),
  });

  const updateCustomer = async () => {
    try {
      const response = await axios.put(`/api/customer-master/${editId}`, buildCustomerPayload());
      toast.success("Updated successfully!");
      navigate("/customer-master-list");
      console.log(response.data);
    } catch (error) {
      console.error("Update Error:", error);
      toast.error(error.response?.data?.message || "Error occurred while updating customer");
    } finally {
      setLoading(false);
    }
  };

  // --- 3. POST API CALLING ---
  const saveCustomer = async () => {
    try {
      const response = await axios.post("/api/customer-master", buildCustomerPayload());
      toast.success("Saved successfully!");
      navigate("/customer-master-list");
      console.log(response.data);

    } catch (error) {
      console.error("Backend Error Detail:", error.response?.data);
      console.error("Save Error:", error);
      const message = error.response?.data?.message || error.response?.data?.error || "Error occurred while saving customer";
      if (error.response && error.response.status === 409) {
        toast.error(message || "Customer record already exists!");
      } else {
        toast.error(message);
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
      await updateCustomer();
    } else {
      await saveCustomer();
    }
  };

  const handleConfirmTrigger = (e) => {
    if (e) e.preventDefault();
    if (loading) return;
    setIsDialogOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };



  const handleReset = () =>
    setForm({
      customerName: "", gstin: "", pan: "", line1: "", line2: "",
      city: "", pinCode: "", state: "", stateCode: "",
      email: "", mobileNo: "", creditlimit: "", bankName: "",
      accountNumber: "", ifsc: "", district: "", customerType: ""
    });

  const inputClass =
    "w-full rounded-md border border-slate-300 bg-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 shadow-sm";

  return (
    <div className="w-full m-0 p-0 bg-white">
      <ReusableDialogueBox
        isOpen={isDialogOpen}
        title={editId ? "Confirm Update" : "Confirm Save"}
        message={editId ? "Are you sure you want to update this customer?" : "Are you sure you want to save this customer?"}
        onConfirm={handleSubmit}
        onCancel={() => setIsDialogOpen(false)}
      />
      {/* Header */}
      <div className="w-full flex items-center justify-between px-3 py-3 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-indigo-600 text-white flex items-center justify-center text-lg shadow">
            <FiBriefcase />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-indigo-700 leading-tight">Customer Master</h1>
            <p className="text-xs text-slate-500">Add or update customer / unit details</p>
          </div>
        </div>
        <Link
          to="/customer-master-list"
          className="px-3 py-1.5 rounded-md bg-indigo-600 text-white text-xs font-semibold shadow hover:bg-indigo-700"
        >
          VIEW LIST
        </Link>
      </div>

      {/* Form */}
      <form onSubmit={handleConfirmTrigger} className="w-full p-3 space-y-4">

        {/* Row: Customer Name (Full Width) */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12">
            <label className="text-xs font-medium text-slate-600">Customer Name <span className="text-red-500">*</span></label>
            <input
              name="customerName"
              value={form.customerName}
              onChange={handleChange}
              type="text"
              className={`${inputClass} px-3 py-2 mt-1`}
              placeholder="e.g., ABC Traders"
              required
            />
          </div>
        </div>

        {/* Row: GSTIN, PAN, Credit Limit (4-4-4 split) */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-4">
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
          <div className="col-span-12 md:col-span-4">
            <label className="text-xs font-medium text-slate-600">PAN</label>
            <input
              name="pan"
              value={form.pan}
              onChange={handleChange}
              type="text"
              className={`${inputClass} px-3 py-2 mt-1`}
              placeholder="AAAAA0000A"
            />
          </div>
          <div className="col-span-12 md:col-span-4">
            <label className="text-xs font-medium text-slate-600">Credit Limit</label>
            <div className="relative mt-1">
              <FiCreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                name="creditlimit"
                value={form.creditlimit}
                onChange={handleChange}
                type="number"
                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-400 outline-none bg-white shadow-sm text-sm"
                placeholder="e.g., 500000"
              />
            </div>
          </div>
        </div>

        {/* Row: Address Lines (6-6 split) */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-6">
            <label className="text-xs font-medium text-slate-600">Address Line 1</label>
            <input
              name="line1"
              value={form.line1}
              onChange={handleChange}
              type="text"
              className={`${inputClass} px-3 py-2 mt-1`}
              placeholder="Building / Street"
            />
          </div>
          <div className="col-span-12 md:col-span-6">
            <label className="text-xs font-medium text-slate-600">Address Line 2</label>
            <input
              name="line2"
              value={form.line2}
              onChange={handleChange}
              type="text"
              className={`${inputClass} px-3 py-2 mt-1`}
              placeholder="Area / Landmark"
            />
          </div>
        </div>

        {/* Row: City, Pin, State, State Code (Split) */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-3">
            <label className="text-xs font-medium text-slate-600">City</label>
            <input name="city" value={form.city} onChange={handleChange} type="text" className={`${inputClass} px-3 py-2 mt-1`} />
          </div>
          <div className="col-span-12 md:col-span-3">
            <label className="text-xs font-medium text-slate-600">Pin Code</label>
            <input name="pinCode" value={form.pinCode} onChange={handleChange} type="text" className={`${inputClass} px-3 py-2 mt-1`} />
          </div>
          <div className="col-span-8 md:col-span-4">
            <label className="text-xs font-medium text-slate-600">State</label>
            <input name="state" value={form.state} onChange={handleChange} type="text" className={`${inputClass} px-3 py-2 mt-1`} />
          </div>
          <div className="col-span-4 md:col-span-2">
            <label className="text-xs font-medium text-slate-600">State Code</label>
            <input name="stateCode" value={form.stateCode} onChange={handleChange} type="text" className={`${inputClass} px-3 py-2 mt-1`} />
          </div>
        </div>

        {/* Row: Email & Phone (6-6 split) */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-6">
            <label className="text-xs font-medium text-slate-600">Email</label>
            <div className="relative mt-1">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                type="email"
                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-400 outline-none bg-white shadow-sm text-sm"
                placeholder="name@mail.com"
              />
            </div>
          </div>
          <div className="col-span-12 md:col-span-6">
            <label className="text-xs font-medium text-slate-600">Phone Number</label>
            <div className="relative mt-1">
              <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                name="mobileNo"
                value={form.mobileNo}
                onChange={handleChange}
                type="tel"
                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-400 outline-none bg-white shadow-sm text-sm"
                placeholder="+91-0000000000"
              />
            </div>
          </div>
        </div>

        {/* Row: Bank Details (4-4-4 split) */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-4">
            <label className="text-xs font-medium text-slate-600">Bank Name</label>
            <input name="bankName" value={form.bankName} onChange={handleChange} type="text" className={`${inputClass} px-3 py-2 mt-1`} />
          </div>
          <div className="col-span-12 md:col-span-4">
            <label className="text-xs font-medium text-slate-600">Account Number</label>
            <input name="accountNumber" value={form.accountNumber} onChange={handleChange} type="text" className={`${inputClass} px-3 py-2 mt-1`} />
          </div>
          <div className="col-span-12 md:col-span-4">
            <label className="text-xs font-medium text-slate-600">IFSC Code</label>
            <input name="ifsc" value={form.ifsc} onChange={handleChange} type="text" className={`${inputClass} px-3 py-2 mt-1`} />
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
            {editId ? "UPDATE CUSTOMER" : "SAVE CUSTOMER"}
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
