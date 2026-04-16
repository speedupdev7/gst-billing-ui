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
  const [errors, setErrors] = useState({});

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
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.supplierName.trim()) newErrors.supplierName = "Supplier Name is required";
    if (!form.address.trim()) newErrors.address = "Address is required";
    if (!form.city.trim()) newErrors.city = "City is required";
    if (!form.state.trim()) newErrors.state = "State is required";
    if (!form.pinCode.trim()) newErrors.pinCode = "Pin Code is required";
    if (!form.stateCode.trim()) newErrors.stateCode = "State Code is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    if (!form.mobileNo.trim()) newErrors.mobileNo = "Mobile Number is required";
    if (!form.bankName.trim()) newErrors.bankName = "Bank Name is required";
    if (!form.accountNumber.trim()) newErrors.accountNumber = "Account Number is required";
    if (form.gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(form.gstin)) {
      newErrors.gstin = "Invalid GSTIN format";
    }
    if (form.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.pan)) {
      newErrors.pan = "Invalid PAN format";
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Invalid email format";
    }
    if (form.mobileNo && !/^[6-9]\d{9}$/.test(form.mobileNo)) {
      newErrors.mobileNo = "Invalid mobile number (10 digits starting with 6-9)";
    }
    if (form.pinCode && !/^\d{6}$/.test(form.pinCode)) {
      newErrors.pinCode = "Invalid pincode (6 digits)";
    }
    if (form.stateCode && !/^\d{2}$/.test(form.stateCode)) {
      newErrors.stateCode = "Invalid state code (2 digits)";
    }
    if (form.accountNumber && !/^\d+$/.test(form.accountNumber)) {
      newErrors.accountNumber = "Account number must be numeric";
    }
    return newErrors;
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
      supplierId: "", supplierName: "", contactPerson: "", gstin: "",
      pan: "", mobileNo: "", email: "", address: "", address1: "",
      city: "", pinCode: "", state: "", stateCode: "",
      bankName: "", accountNumber: "", ifsc: "", branchName: ""
    });
    setErrors({});
  };

  const inputClass = (field) => `w-full rounded-md border bg-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 shadow-sm px-3 py-2 ${errors[field] ? "border-red-500" : "border-slate-300"}`;

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
              className={`${inputClass("supplierName")}`}
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
              className={`${inputClass("contactPerson")}`}
              placeholder="Full Name"
            />
          </div>
        </div>

        {/* Row 2: Tax Info & Contact */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <input
              name="gstin"
              value={form.gstin}
              onChange={handleChange}
              type="text"
              className={`${inputClass("gstin")}`}
              placeholder="22AAAAA0000A1Z5"
            />
          </div>
          <div>
            <input
              name="pan"
              value={form.pan}
              onChange={handleChange}
              type="text"
              className={`${inputClass("pan")}`}
              placeholder="ABCDE1234F"
            />
          </div>
          <div>
            <input
              name="mobileNo"
              value={form.mobileNo}
              onChange={handleChange}
              type="tel"
              className={`${inputClass("mobileNo")}`}
              placeholder="+91-0000000000"
            />
          </div>
          <div>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              type="email"
              className={`${inputClass("email")}`}
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
              className={`${inputClass("address")}`}
              placeholder="Address Line 1"
            />
            <input
              name="address1"
              value={form.address1}
              onChange={handleChange}
              className={`${inputClass("address1")}`}
              placeholder="Address Line 2"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input name="city" value={form.city} onChange={handleChange} className={`${inputClass("city")}`} placeholder="City" />
            <input name="pinCode" value={form.pinCode} onChange={handleChange} className={`${inputClass("pinCode")}`} placeholder="Pin Code" />
            <input name="state" value={form.state} onChange={handleChange} className={`${inputClass("state")}`} placeholder="State" />
            <input name="stateCode" value={form.stateCode} onChange={handleChange} className={`${inputClass("stateCode")}`} placeholder="State Code" />
          </div>
        </div>

        {/* Banking Section */}
        <div className="space-y-3 pt-2">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bank Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input name="bankName" value={form.bankName} onChange={handleChange} className={`${inputClass("bankName")}`} placeholder="Bank Name" />
            <input name="accountNumber" value={form.accountNumber} onChange={handleChange} className={`${inputClass("accountNumber")}`} placeholder="Account Number" />
            <input name="ifsc" value={form.ifsc} onChange={handleChange} className={`${inputClass("ifsc")}`} placeholder="IFSC Code" />
            <input name="branchName" value={form.branchName} onChange={handleChange} className={`${inputClass("branchName")}`} placeholder="Branch Name" />
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
