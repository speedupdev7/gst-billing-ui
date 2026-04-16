import React, { useEffect, useState } from "react";
import { FiSave, FiX, FiBriefcase, FiRefreshCcw, FiLoader } from "react-icons/fi";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useToast } from "../contextapi/ToastContext";
import ReusableDialogueBox from "../contextapi/ReusableDialogueBox";

export default function DesignationMaster() {
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");

  // State for logic handling
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState({
    designationCode: "",
    designationName: "",
    designationType: "",
    description: "",
  });
  const [errors, setErrors] = useState({});
  // --- 1. FETCH POST API CALLING (To prevent blank form on edit) ---
  useEffect(() => {
    if (editId) {
      axios.get(`/api/v1/designations/${editId}`)
        .then((res) => {
          const data = res.data;
          setForm({
            ...data,
          });
        })
        .catch((err) => {
          console.error("Fetch Error:", err);
          toast.error("Failed to load designation details");
        });
    }
  }, [editId, toast]);

  // --- 2.  PUT API CALLING ---
  const updateDesignation = async () => {
    try {
      const payload = {
        ...form,
      };
      const response = await axios.put(`/api/v1/designations/${editId}`, payload);
      toast.success("Updated successfully!");
      navigate("/designation-master-list");
      console.log(response.data);
    } catch (error) {
      console.error("Update Error:", error);
      toast.error("Error occurred while updating data");
    } finally {
      setLoading(false);
    }
  };

  // --- 3. POST API CALLING ---
  const saveDesignation = async () => {
    try {
      const payload = {
        ...form,

      };
      const response = await axios.post("/api/v1/designations", payload);
      toast.success("Saved successfully!");
      navigate("/designation-master-list");
      console.log(response.data);

    } catch (error) {
      console.error("Backend Error Detail:", error.response?.data);
      console.error("Save Error:", error);
      if (error.response && error.response.status === 409) {
        toast.error("Designation record already exists!");
      } else if (error.response && error.response.status === 500) {
        toast.error("Server Error: Please check if the Designation Code is unique.");
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
      await updateDesignation();
    } else {
      await saveDesignation();
    }
  };

  const handleConfirmTrigger = (e) => {
    if (e) e.preventDefault();
    if (loading) return;
    if (!validateForm()) return;
    setIsDialogOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.designationCode.trim()) {
      newErrors.designationCode = "Designation Code is required";
    }
    if (!form.designationName.trim()) {
      newErrors.designationName = "Designation Name is required";
    }
    if (!form.designationType.trim()) {
      newErrors.designationType = "Designation Type is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleReset = () => {
    setForm({
      designationCode: "",
      designationName: "",
      designationType: "",
      description: "",
    });
    setErrors({});
  };

  const inputClass = (fieldName) =>
    `mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-400 outline-none bg-white shadow-sm w-full ${
      errors[fieldName] ? "border-red-500 bg-red-50" : "border-slate-300"
    }`;

  return (
    <div className="bg-white rounded-xl shadow-2xl p-6 border border-slate-200 min-h-[400px]">
      <ReusableDialogueBox
        isOpen={isDialogOpen}
        title={editId ? "Confirm Update" : "Confirm Save"}
        message={editId ? "Are you sure you want to update this designation?" : "Are you sure you want to save this designation?"}
        onConfirm={handleSubmit}
        onCancel={() => setIsDialogOpen(false)}
      />
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b">
        <h1 className="text-3xl font-extrabold text-indigo-700 flex items-center gap-2">
          <FiBriefcase />
          Designation Master
        </h1>

        <Link
          to="/designation-master-list"
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold shadow-md hover:bg-indigo-700 transition"
        >
          VIEW LIST
        </Link>
      </div>

      <form onSubmit={handleConfirmTrigger} className="space-y-8">
        {/* Designation Fields */}
        <section>
          <h2 className="text-xl font-semibold text-slate-700 mb-4 border-b pb-2">
            Designation Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-slate-600">
                Designation Code
              </label>
              <input
                name="designationCode"
                value={form.designationCode}
                onChange={handleChange}
                type="text"
                className={inputClass("designationCode")}
                placeholder="Enter designation code"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-600">
                Designation Name
              </label>
              <input
                name="designationName"
                value={form.designationName}
                onChange={handleChange}
                type="text"
                className={inputClass("designationName")}
                placeholder="Enter designation name"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-600">
                Designation Type
              </label>
              <input
                name="designationType"
                value={form.designationType}
                onChange={handleChange}
                type="text"
                className={inputClass("designationType")}
                placeholder="e.g. Graduate, Post Graduate, Certificate"
              />
              {/* Agar dropdown chahiye ho to yahan <select> bhi bana sakte hain */}
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-600">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                className={inputClass("description")}
                placeholder="Short description about this designation"
              />
            </div>
          </div>
        </section>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t">
          <button
            type="submit"
            disabled={loading}
            className={`flex items-center justify-center gap-2 px-6 py-2 rounded-md text-white text-sm font-semibold shadow transition-all ${editId ? "bg-blue-600 hover:bg-blue-700" : "bg-emerald-600 hover:bg-emerald-700"}`}
          >
            {loading ? <FiLoader className="animate-spin" /> : <FiSave />}
            {editId ? "UPDATE DESIGNATION" : "SAVE DESIGNATION"}
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
