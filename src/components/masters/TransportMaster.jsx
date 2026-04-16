import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiMail,
  FiPhone,
  FiSave,
  FiX,
  FiMapPin,
  FiBriefcase,
} from "react-icons/fi";

export default function TransportMaster() {
  const navigate = useNavigate();

  /* ---------------- FORM STATE ---------------- */
  const [form, setForm] = useState({
    TransportCode: "",
    TransportName: "",
    GSTIN: "",
    PANNo: "",
    ContactPerson: "",
    MobileNo: "",
    PhoneNo: "",
    EmailID: "",
    Address: "",
    City: "",
    StateCode: "",
    Pincode: "",
    IsOwnTransport: false,
  });

  const inputBase =
    "w-full rounded-md border border-slate-300 bg-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 shadow-sm";

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({
      ...p,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleReset = () =>
    setForm({
      TransportCode: "",
      TransportName: "",
      GSTIN: "",
      PANNo: "",
      ContactPerson: "",
      MobileNo: "",
      PhoneNo: "",
      EmailID: "",
      Address: "",
      City: "",
      StateCode: "",
      Pincode: "",
      IsOwnTransport: false,
    });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("TRANSPORT DATA:", form);
    alert("Transport Saved Successfully!");
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
              Transport Master
            </h1>
            <p className="text-xs text-slate-500">
              Add transport / vehicle details
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("/transport-master-list")}
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
            Transport Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600">
                Transport Code *
              </label>
              <input
                name="TransportCode"
                value={form.TransportCode}
                onChange={handleChange}
                className={`${inputBase} px-3 py-2`}
                placeholder="TRN001"
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600">
                Transport Name *
              </label>
              <input
                name="TransportName"
                value={form.TransportName}
                onChange={handleChange}
                className={`${inputBase} px-3 py-2`}
                placeholder="ABC Logistics"
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600">
                GSTIN
              </label>
              <input
                name="GSTIN"
                value={form.GSTIN}
                onChange={handleChange}
                className={`${inputBase} px-3 py-2`}
                placeholder="22AAAAA0000A1Z5"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600">
                PAN No
              </label>
              <input
                name="PANNo"
                value={form.PANNo}
                onChange={handleChange}
                className={`${inputBase} px-3 py-2`}
                placeholder="AAAAA0000A"
              />
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
                Contact Person
              </label>
              <input
                name="ContactPerson"
                value={form.ContactPerson}
                onChange={handleChange}
                className={`${inputBase} px-3 py-2`}
                placeholder="Person name"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600">
                Mobile No
              </label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-3 text-slate-400" />
                <input
                  name="MobileNo"
                  value={form.MobileNo}
                  onChange={handleChange}
                  className={`${inputBase} pl-10 pr-3 py-2`}
                  placeholder="+91 9876543210"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600">
                Phone No
              </label>
              <input
                name="PhoneNo"
                value={form.PhoneNo}
                onChange={handleChange}
                className={`${inputBase} px-3 py-2`}
                placeholder="022-123456"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600">
                Email ID
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-3 text-slate-400" />
                <input
                  name="EmailID"
                  value={form.EmailID}
                  onChange={handleChange}
                  className={`${inputBase} pl-10 pr-3 py-2`}
                  placeholder="transport@email.com"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ADDRESS */}
        <section>
          <h2 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1">
            <FiMapPin /> Address Details
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-600">
                Address
              </label>
              <input
                name="Address"
                value={form.Address}
                onChange={handleChange}
                className={`${inputBase} px-3 py-2`}
                placeholder="Full address"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600">
                  City
                </label>
                <input
                  name="City"
                  value={form.City}
                  onChange={handleChange}
                  className={`${inputBase} px-3 py-2`}
                  placeholder="City"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600">
                  State Code
                </label>
                <input
                  name="StateCode"
                  value={form.StateCode}
                  onChange={handleChange}
                  className={`${inputBase} px-3 py-2`}
                  placeholder="27"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600">
                  Pincode
                </label>
                <input
                  name="Pincode"
                  value={form.Pincode}
                  onChange={handleChange}
                  className={`${inputBase} px-3 py-2`}
                  placeholder="400001"
                />
              </div>
            </div>
          </div>
        </section>

        {/* OWN TRANSPORT */}
        <section>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              name="IsOwnTransport"
              checked={form.IsOwnTransport}
              onChange={handleChange}
              className="w-4 h-4"
            />
            Is Own Transport
          </label>
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
