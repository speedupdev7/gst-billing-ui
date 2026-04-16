import React, { useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Save,
  User,
  Briefcase,
  CreditCard,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Camera
} from "lucide-react";

export default function EmployeeMaster() {
  const initialState = {
    // Basic & Employment
    EmployeeCode: "",
    FirstName: "",
    LastName: "",
    EmailID: "",
    MobileNo: "",
    EmploymentType: "Full-Time",
    JoiningDate: "",
    Department: "",
    Designation: "",
    ReportingManager: "",
    
    // Personal & Identity
    DateOfBirth: "",
    Gender: "",
    MaritalStatus: "",
    BloodGroup: "",
    AadhaarNumber: "",
    PANNumber: "",
    
    // Address
    CurrentAddress: "",
    PermanentAddress: "",
    City: "",
    State: "",
    PostalCode: "",

    // Financial
    Salary: "",
    BankAccountNo: "",
    BankName: "",
    BankIFSC: "",
    PFNumber: "",
    ESICNumber: "",
    
    // Emergency
    EmergencyContactName: "",
    EmergencyContactNumber: "",
  };

  const tabs = useMemo(() => [
    {
      id: "employment",
      name: "1. Employment",
      icon: Briefcase,
      fields: [
        { label: "Employee Code", name: "EmployeeCode", type: "text", required: true },
        { label: "First Name", name: "FirstName", type: "text", required: true },
        { label: "Last Name", name: "LastName", type: "text", required: true },
        { label: "Official Email", name: "EmailID", type: "email", required: true },
        { label: "Joining Date", name: "JoiningDate", type: "date", required: true },
        { label: "Employment Type", name: "EmploymentType", type: "select", options: ["Full-Time", "Contract", "Intern", "Part-Time"] },
        { label: "Department", name: "Department", type: "select", options: ["IT", "HR", "Sales", "Finance", "Operations"] },
        { label: "Designation", name: "Designation", type: "text" },
        { label: "Reporting Manager", name: "ReportingManager", type: "text" },
      ],
    },
    {
      id: "personal",
      name: "2. Personal & Identity",
      icon: User,
      fields: [
        { label: "Date of Birth", name: "DateOfBirth", type: "date" },
        { label: "Gender", name: "Gender", type: "select", options: ["Male", "Female", "Other"] },
        { label: "Personal Mobile", name: "MobileNo", type: "tel" },
        { label: "Aadhaar Number", name: "AadhaarNumber", type: "text" },
        { label: "PAN Number", name: "PANNumber", type: "text" },
        { label: "Blood Group", name: "BloodGroup", type: "select", options: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"] },
        { label: "Marital Status", name: "MaritalStatus", type: "select", options: ["Single", "Married", "Divorced"] },
        { label: "Current Address", name: "CurrentAddress", type: "text", span: 3 },
        { label: "City", name: "City", type: "text" },
        { label: "State", name: "State", type: "text" },
        { label: "Postal Code", name: "PostalCode", type: "text" },
      ],
    },
    {
      id: "statutory",
      name: "3. Statutory & Bank",
      icon: CreditCard,
      fields: [
        { label: "Bank Name", name: "BankName", type: "text" },
        { label: "Account Number", name: "BankAccountNo", type: "text" },
        { label: "IFSC Code", name: "BankIFSC", type: "text" },
        { label: "Gross Salary (CTC)", name: "Salary", type: "number" },
        { label: "PF Number", name: "PFNumber", type: "text" },
        { label: "ESIC Number", name: "ESICNumber", type: "text" },
        { label: "Emergency Contact Name", name: "EmergencyContactName", type: "text" },
        { label: "Emergency Contact No.", name: "EmergencyContactNumber", type: "tel" },
      ],
    },
  ], []);

  const [form, setForm] = useState(initialState);
  const [activeTabId, setActiveTabId] = useState(tabs[0].id);
  const [message, setMessage] = useState(null);

  const currentTabIndex = tabs.findIndex((t) => t.id === activeTabId);
  const isFirstTab = currentTabIndex === 0;
  const isLastTab = currentTabIndex === tabs.length - 1;

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage({ type: "success", text: "Employee record updated!" });
    setTimeout(() => setMessage(null), 3000);
  };

  const inputClass =
    "mt-1.5 px-4 py-2.5 border border-slate-200 rounded-xl w-full bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-200 text-sm font-medium text-slate-700";

  const renderField = (field) => (
    <div key={field.name} className={field.span === 3 ? "md:col-span-3" : ""}>
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
        {field.label} {field.required && <span className="text-rose-500">*</span>}
      </label>
      {field.type === "select" ? (
        <select name={field.name} value={form[field.name]} onChange={handleChange} className={inputClass}>
          <option value="">Select Option</option>
          {field.options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      ) : (
        <input type={field.type} name={field.name} value={form[field.name]} onChange={handleChange} className={inputClass} placeholder={`Enter ${field.label.toLowerCase()}`} />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-8 flex justify-center">
      {message && (
        <div className="fixed top-6 right-6 bg-slate-900 text-white px-6 py-3 rounded-2xl flex items-center gap-3 shadow-2xl z-50 animate-in fade-in slide-in-from-top-4">
          <CheckCircle className="w-5 h-5 text-emerald-400" /> 
          <span className="font-semibold text-sm">{message.text}</span>
        </div>
      )}

      <div className="w-full max-w-5xl">
        {/* HEADER SECTION */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Create <span className="text-indigo-600">Employee</span>
            </h1>
            <p className="text-slate-500 font-medium text-sm">Add a new team member to the organization.</p>
          </div>
          <Link to="/employee-master-list" className="bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2">
            View List
          </Link>
        </div>

        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          {/* PROFILE PREVIEW HEADER */}
          <div className="bg-indigo-600 p-8 flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 bg-indigo-400 rounded-3xl border-4 border-indigo-500/50 flex items-center justify-center text-white relative group cursor-pointer">
              <Camera className="w-8 h-8 opacity-70 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 bg-black/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-bold uppercase">Upload</div>
            </div>
            <div className="text-center md:text-left">
               <h2 className="text-2xl font-bold text-white leading-none mb-2">
                 {form.FirstName || "New"} {form.LastName || "Employee"}
               </h2>
               <p className="text-indigo-100 font-medium opacity-80">{form.Designation || "Designation not set"} • {form.Department || "Dept"}</p>
            </div>
          </div>

          {/* TABS NAVIGATION */}
          <div className="flex px-8 border-b border-slate-50 bg-white sticky top-0 z-10">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTabId === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTabId(tab.id)}
                  className={`flex items-center gap-2 py-5 px-4 text-xs font-bold uppercase tracking-widest transition-all relative ${
                    isActive ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                  {isActive && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full" />}
                </button>
              );
            })}
          </div>

          {/* FORM CONTENT */}
          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
              {tabs.find((t) => t.id === activeTabId)?.fields.map(renderField)}
            </div>

            {/* NAVIGATION BUTTONS */}
            <div className="mt-12 flex items-center justify-between border-t border-slate-50 pt-8">
              {!isFirstTab ? (
                <button 
                  type="button" 
                  onClick={() => setActiveTabId(tabs[currentTabIndex - 1].id)} 
                  className="flex items-center gap-2 text-slate-500 font-bold hover:text-indigo-600 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" /> Previous Step
                </button>
              ) : <div></div>}

              <div className="flex gap-4">
                {!isLastTab ? (
                  <button 
                    type="button" 
                    onClick={() => setActiveTabId(tabs[currentTabIndex + 1].id)} 
                    className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95"
                  >
                    Next Phase <ArrowRight className="w-5 h-5" />
                  </button>
                ) : (
                  <>
                    <button 
                      type="button" 
                      onClick={() => setForm(initialState)} 
                      className="text-slate-400 font-bold px-6 hover:text-rose-500 transition-colors"
                    >
                      Reset Form
                    </button>
                    <button 
                      type="submit" 
                      className="bg-indigo-600 text-white px-10 py-3.5 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
                    >
                      <Save className="w-5 h-5" /> Finalize & Save
                    </button>
                  </>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
