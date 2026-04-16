import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FiSave, FiX, FiBriefcase, FiRefreshCcw, FiLoader } from "react-icons/fi";
import axios from "axios";
import { useToast } from "../contextapi/ToastContext";
import ReusableDialogueBox from "../contextapi/ReusableDialogueBox";

export default function QualificationMaster() {

  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");

  // State for logic handling
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    qualificationCode: "",
    qualificationName: "",
    //  qualificationType: "",
    description: "",
  });

  // --- 1. FETCH POST API CALLING (To prevent blank form on edit) ---
  useEffect(() => {
    if (editId) {
      axios.get(`/api/v1/qualifications/${editId}`)
        .then((res) => {
          setForm(res.data);
        })
        .catch((err) => {
          console.error("Fetch Error:", err);
          toast.error("Failed to load supplier details");
        });
    }
  }, [editId]);



  // --- 2.  PUT API CALLING ---
  const updateQualification = async () => {
    try {
      const response = await axios.put(`/api/v1/qualifications/${editId}`, form);
      toast.success("Updated successfully!");
      navigate("/qualification-master-list");
    } catch (error) {
      console.error("Update Error:", error);
      toast.error("Error occurred while updating data");
    } finally {
      setLoading(false);
    }
  };

  // --- 3. POST API CALLING ---
  const saveQualification = async () => {
    try {
      const response = await axios.post("/api/v1/qualifications", form);
      toast.success("Saved successfully!");
      navigate("/qualification-master-list");
    } catch (error) {
      console.error("Save Error:", error);
      if (error.response && error.response.status === 409) {
        toast.warning("Qualification code record already exists!");
      } else {
        toast.error("Error occurred while saving data");
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.qualificationCode.trim()) newErrors.qualificationCode = "Qualification Code is required";
    if (!form.qualificationName.trim()) newErrors.qualificationName = "Qualification Name is required";
    return newErrors;
  };
  // --- Handles which API to call ---
  const handleSubmit = async () => {
    setIsDialogOpen(false);
    setLoading(true);

    if (editId) {
      await updateQualification();
    } else {
      await saveQualification();
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
      qualificationCode: "",
      qualificationName: "",
      qualificationType: "",
      description: "",
    });
    setErrors({});
  };

  const inputClass = (field) => `mt-1 px-3 py-2 border bg-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 shadow-sm w-full rounded-md ${errors[field] ? "border-red-500" : "border-slate-300"}`;

  return (
    <div className="bg-white rounded-xl shadow-2xl p-6 border border-slate-200 min-h-[400px]">

      <ReusableDialogueBox
        isOpen={isDialogOpen}
        title={editId ? "Confirm Update" : "Confirm Save"}
        message={editId ? "Are you sure you want to update this supplier?" : "Are you sure you want to save this supplier?"}
        onConfirm={handleSubmit}
        onCancel={() => setIsDialogOpen(false)}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b">
        <h1 className="text-3xl font-extrabold text-indigo-700 flex items-center gap-2">
          <FiBriefcase />
          Qualification Master
        </h1>
        {/* <p className="text-xs text-slate-500">{editId ? "Update existing supplier" : "Add new supplier details"}</p> */}


        <Link
          to="/qualification-master-list"
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold shadow-md hover:bg-indigo-700 transition"
        >
          VIEW LIST
        </Link>
      </div>

      <form onSubmit={handleConfirmTrigger} className="space-y-8">
        {/* Qualification Fields */}
        <section>
          <h2 className="text-xl font-semibold text-slate-700 mb-4 border-b pb-2">
            Qualification Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-slate-600">
                Qualification Code <span className="text-red-500">*</span>
              </label>
              <input
                name="qualificationCode"
                value={form.qualificationCode}
                onChange={handleChange}
                type="text"
                className={inputClass("qualificationCode")}
                placeholder="Enter qualification code"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-600">
                Qualification Name <span className="text-red-500">*</span>
              </label>
              <input
                name="qualificationName"
                value={form.qualificationName}
                onChange={handleChange}
                type="text"
                className={inputClass("qualificationName")}
                placeholder="Enter qualification name"
              />
            </div>

            {/* <div>
              <label className="text-sm font-medium text-slate-600">
                Qualification Type
              </label>
              <input
                name="qualificationType"
                value={form.qualificationType}
                onChange={handleChange}
                type="text"
                className={inputClass}
                placeholder="e.g. Graduate, Post Graduate, Certificate"
              />
              
            </div> */}

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
                placeholder="Short description about this qualification"
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
