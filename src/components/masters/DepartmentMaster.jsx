import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiBriefcase,
  FiSave,
  FiX,
} from "react-icons/fi";

export default function UnitCompanyMaster() {
  const navigate = useNavigate();

  /* ---------------- FORM STATE (UPDATED) ---------------- */
  const [form, setForm] = useState({
    id: "",
    departmentCode: "",
    departmentName: "",
    description: "",
  });

  const inputBase =
    "w-full rounded-md border border-slate-300 bg-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 shadow-sm";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleReset = () =>
    setForm({
      id: "",
      departmentCode: "",
      departmentName: "",
      description: "",
    });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("SUBMIT DEPARTMENT DATA:", form);
    alert("Department Saved Successfully!");
  };

  return (
    <div className="w-full bg-white p-0 m-0">
      {/* HEADER (UNCHANGED STYLE) */}
      <div className="w-full bg-white border-b p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-md bg-indigo-600 text-white flex items-center justify-center text-lg shadow">
            <FiBriefcase />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">
              Department Master
            </h1>
            <p className="text-xs text-slate-500">
              Add department details
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("/department-master-list")}
          className="px-3 py-1.5 text-xs rounded-md bg-indigo-600 text-white shadow hover:bg-indigo-700 cursor-pointer"
        >
          VIEW LIST
        </button>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="w-full p-3 space-y-5">

        {/* BASIC INFO */}
        <section>
          <h2 className="text-sm font-semibold text-slate-700 mb-2">
            Department Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* ID */}
            <div>
              <label className="text-xs font-medium text-slate-600">
                ID
              </label>
              <input
                name="id"
                value={form.id}
                onChange={handleChange}
                className={`${inputBase} px-3 py-2`}
                placeholder="Auto / Manual"
              />
            </div>

            {/* Department Code */}
            <div>
              <label className="text-xs font-medium text-slate-600">
                Department Code *
              </label>
              <input
                name="departmentCode"
                value={form.departmentCode}
                onChange={handleChange}
                className={`${inputBase} px-3 py-2`}
                placeholder="DEP001"
                required
              />
            </div>

            {/* Department Name */}
            <div>
              <label className="text-xs font-medium text-slate-600">
                Department Name *
              </label>
              <input
                name="departmentName"
                value={form.departmentName}
                onChange={handleChange}
                className={`${inputBase} px-3 py-2`}
                placeholder="Accounts / HR"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-medium text-slate-600">
                Description
              </label>
              <input
                name="description"
                value={form.description}
                onChange={handleChange}
                className={`${inputBase} px-3 py-2`}
                placeholder="Department description"
              />
            </div>
          </div>
        </section>

        {/* BUTTONS (UNCHANGED STYLE) */}
        <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t">
          <button
            type="submit"
            className="bg-emerald-600 text-white px-4 py-2 rounded-md text-sm flex items-center justify-center gap-2 shadow hover:bg-emerald-700"
          >
            <FiSave /> Save
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="bg-red-500 text-white px-4 py-2 rounded-md text-sm flex items-center justify-center gap-2 shadow hover:bg-red-600"
          >
            <FiX /> Clear
          </button>
        </div>
      </form>
    </div>
  );
}
