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
  const [errors, setErrors] = useState({});

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
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.unitName.trim()) newErrors.unitName = "Unit Name is required";
    if (!form.gstin.trim()) newErrors.gstin = "GSTIN is required";
    if (!form.pan.trim()) newErrors.pan = "PAN is required";
    if (!form.address.trim()) newErrors.address = "Address is required";
    if (!form.city.trim()) newErrors.city = "City is required";
    if (!form.state.trim()) newErrors.state = "State is required";
    if (!form.pincode.trim()) newErrors.pincode = "Pincode is required";
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
    if (form.pincode && !/^\d{6}$/.test(form.pincode)) {
      newErrors.pincode = "Invalid pincode (6 digits)";
    }
    if (form.stateCode && !/^\d{2}$/.test(form.stateCode)) {
      newErrors.stateCode = "Invalid state code (2 digits)";
    }
    if (form.accountNumber && !/^\d+$/.test(form.accountNumber)) {
      newErrors.accountNumber = "Account number must be numeric";
    }
    return newErrors;
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
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
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

  const handleReset = () => {
    setForm({
      unitName: "", gstin: "", pan: "", address: "", city: "",
      pincode: "", state: "", stateCode: "", email: "",
      mobileNo: "", bankName: "", accountNumber: "",
    });
    setErrors({});
  };

  const inputBase = (field) => `w-full rounded-md border bg-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 shadow-sm px-3 py-2 ${errors[field] ? "border-red-500" : "border-slate-300"}`;

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
          className="px-3 py-1.5 text-xs rounded-md bg-indigo-600 text-white shadow hover:bg-indigo-700 cursor-pointer"
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
             <div>
                <label className="text-xs font-medium text-slate-600">Unit Name *</label>
                <input name="unitName" value={form.unitName} onChange={handleChange} className={inputBase("unitName")} placeholder="Enter company name" />
                {/* {errors.unitName && <p className="text-red-500 text-xs mt-1">{errors.unitName}</p>} */}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600">GSTIN</label>
                <input name="gstin" value={form.gstin} onChange={handleChange} className={inputBase("gstin")} placeholder="22AAAAA0000A1Z5" />
                {/* {errors.gstin && <p className="text-red-500 text-xs mt-1">{errors.gstin}</p>} */}
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">PAN</label>
                <input name="pan" value={form.pan} onChange={handleChange} className={inputBase("pan")} placeholder="ABCDE1234F" />
                {/* {errors.pan && <p className="text-red-500 text-xs mt-1">{errors.pan}</p>} */}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: Contact */}
        <section>
          <h2 className="text-sm font-semibold text-slate-700 mb-2">Contact Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <label className="text-xs font-medium text-slate-600">Email *</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-3 text-slate-400" />
                <input name="email" type="email" value={form.email} onChange={handleChange} className={`${inputBase("email")} pl-10`} placeholder="name@company.com" />
              </div>
              {/* {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>} */}
            </div>
            <div className="relative">
              <label className="text-xs font-medium text-slate-600">Phone *</label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-3 text-slate-400" />
                <input name="mobileNo" value={form.mobileNo} onChange={handleChange} className={`${inputBase("mobileNo")} pl-10`} placeholder="+91 98765 43210" />
              </div>
              {/* {errors.mobileNo && <p className="text-red-500 text-xs mt-1">{errors.mobileNo}</p>} */}
            </div>
          </div>
        </section>

        {/* SECTION 3: Address */}
        <section>
          <h2 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1"><FiMapPin /> Registered Address</h2>
          <div className="space-y-4">
            <div>
              <input name="address" value={form.address} onChange={handleChange} className={inputBase("address")} placeholder="Address line" />
              {/* {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>} */}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600">City *</label>
                <input name="city" value={form.city} onChange={handleChange} className={inputBase("city")} placeholder="City" />
                {/* {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>} */}
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Pincode *</label>
                <input name="pincode" value={form.pincode} onChange={handleChange} className={inputBase("pincode")} placeholder="Pincode" />
                {/* {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>} */}
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">State *</label>
                <input name="state" value={form.state} onChange={handleChange} className={inputBase("state")} placeholder="State" />
                {/* {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>} */} 
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">State Code *</label>
                <input name="stateCode" value={form.stateCode} onChange={handleChange} className={inputBase("stateCode")} placeholder="State Code" />
                {/* {errors.stateCode && <p className="text-red-500 text-xs mt-1">{errors.stateCode}</p>} */}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: Banking */}
        <section>
          <h2 className="text-sm font-semibold text-slate-700 mb-2">Bank Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600">Bank Name *</label>
              <input name="bankName" value={form.bankName} onChange={handleChange} className={inputBase("bankName")} placeholder="Bank Name" />
              {/* {errors.bankName && <p className="text-red-500 text-xs mt-1">{errors.bankName}</p>} */}
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Account Number *</label>
              <input name="accountNumber" value={form.accountNumber} onChange={handleChange} className={inputBase("accountNumber")} placeholder="Account Number" />
              {/* {errors.accountNumber && <p className="text-red-500 text-xs mt-1">{errors.accountNumber}</p>} */}
            </div>
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