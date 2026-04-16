// src/pages/UnitCompanyMaster.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiLock,
  FiSave,
  FiX,
  FiBriefcase,
} from "react-icons/fi";

export default function UnitCompanyMaster() {
  const [form, setForm] = useState({
    userCode: "",
    userName: "",
    loginName: "",
    passwordHash: "",
    mobileNo: "",
    emailID: "",
    roleID: "",
    departmentID: "",
    branchID: "",
  });

  const navigate = useNavigate();

  const inputBase =
    "w-full rounded-md border border-slate-300 bg-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 shadow-sm";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleReset = () =>
    setForm({
      userCode: "",
      userName: "",
      loginName: "",
      passwordHash: "",
      mobileNo: "",
      emailID: "",
      roleID: "",
      departmentID: "",
      branchID: "",
    });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("SUBMIT DATA:", form);
    alert("User Saved Successfully!");
  };

  return (
    <div className="w-full bg-white p-0 m-0">
      {/* HEADER */}
      <div className="w-full bg-white border-b p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-md bg-indigo-600 text-white flex items-center justify-center text-lg shadow">
            <FiBriefcase />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">
              User Master
            </h1>
            <p className="text-xs text-slate-500">
              Add user login & role details
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("/user-master-list")}
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
            Basic Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600">
                User Code *
              </label>
              <input
                name="userCode"
                value={form.userCode}
                onChange={handleChange}
                className={`${inputBase} px-3 py-2`}
                placeholder="USR001"
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600">
                User Name *
              </label>
              <input
                name="userName"
                value={form.userName}
                onChange={handleChange}
                className={`${inputBase} px-3 py-2`}
                placeholder="Full name"
                required
              />
            </div>
          </div>
        </section>

        {/* LOGIN DETAILS */}
        <section>
          <h2 className="text-sm font-semibold text-slate-700 mb-2">
            Login Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600">
                Login Name
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-3 text-slate-400" />
                <input
                  name="loginName"
                  value={form.loginName}
                  onChange={handleChange}
                  className={`${inputBase} pl-10 pr-3 py-2`}
                  placeholder="username"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  name="passwordHash"
                  value={form.passwordHash}
                  onChange={handleChange}
                  className={`${inputBase} pl-10 pr-3 py-2`}
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section>
          <h2 className="text-sm font-semibold text-slate-700 mb-2">
            Contact Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600">
                Mobile No
              </label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-3 text-slate-400" />
                <input
                  name="mobileNo"
                  value={form.mobileNo}
                  onChange={handleChange}
                  className={`${inputBase} pl-10 pr-3 py-2`}
                  placeholder="+91 9876543210"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600">
                Email ID
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-3 text-slate-400" />
                <input
                  name="emailID"
                  value={form.emailID}
                  onChange={handleChange}
                  className={`${inputBase} pl-10 pr-3 py-2`}
                  placeholder="user@email.com"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ORGANIZATION */}
        <section>
          <h2 className="text-sm font-semibold text-slate-700 mb-2">
            Organization Mapping
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600">
                Role ID
              </label>
              <input
                name="roleID"
                value={form.roleID}
                onChange={handleChange}
                className={`${inputBase} px-3 py-2`}
                placeholder="Admin / User"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600">
                Department ID
              </label>
              <input
                name="departmentID"
                value={form.departmentID}
                onChange={handleChange}
                className={`${inputBase} px-3 py-2`}
                placeholder="Accounts"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600">
                Branch ID
              </label>
              <input
                name="branchID"
                value={form.branchID}
                onChange={handleChange}
                className={`${inputBase} px-3 py-2`}
                placeholder="Mumbai"
              />
            </div>
          </div>
        </section>

        {/* BUTTONS */}
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
