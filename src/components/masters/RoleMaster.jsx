import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FiSave, FiX, FiBriefcase,FiRefreshCcw,FiLoader  } from "react-icons/fi";
import axios from "axios";
import { useToast } from "../contextapi/ToastContext";
import ReusableDialogueBox from "../contextapi/ReusableDialogueBox";

export default function RoleMaster() {
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");

  // State for logic handling
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    roleId:"",
    roleCode: "",
    roleName: "",
    description: "",
    isSystemRole: false,
    isActive: true,
  });

  // --- 1. FETCH POST API CALLING (To prevent blank form on edit) ---
  useEffect(() => {
    if (editId) {
      axios.get(`/api/v1/roles/${editId}`)
        .then((res) => {
          const data = res.data;
          setForm({
            ...data,
            isSystemRole: data.roleType === 'SYSTEM',
          });
        })
        .catch((err) => {
          console.error("Fetch Error:", err);
          toast.error("Failed to load role details");
        });
    }
  }, [editId]);



  // --- 2.  PUT API CALLING ---
  const updateRole = async () => {
    try {
      const payload = {
        ...form,
        roleType: form.isSystemRole ? 'SYSTEM' : 'NORMAL',
      };
      const response = await axios.put(`/api/v1/roles/${editId}`, payload);
      toast.success("Updated successfully!");
      navigate("/role-master-list");
      console.log(response.data);
      
    } catch (error) {
      console.error("Update Error:", error);
      toast.error("Error occurred while updating data");
    } finally {
      setLoading(false);
    }
  };

  // --- 3. POST API CALLING ---
  const saveRole = async () => {
    try {
      const payload = {
        ...form,
        roleType: form.isSystemRole ? 'SYSTEM' : 'NORMAL',
      };
      const response = await axios.post("/api/v1/roles", payload);
      toast.success("Saved successfully!");
      navigate("/role-master-list");
      console.log(response.data);
       
    } catch (error) {
      console.error("Backend Error Detail:", error.response?.data);
      console.error("Save Error:", error);
      if (error.response && error.response.status === 409) {
        toast.error("Role record already exists!");
      }else if(error.response && error.response.status===500){
          toast.error("Server Error: Please check if the Role Code is unique.");
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
      await updateRole();
    } else {
      await saveRole();
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


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((s) => ({
      ...s,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.roleCode.trim()) newErrors.roleCode = "Role Code is required";
    if (!form.roleName.trim()) newErrors.roleName = "Role Name is required";
    if (!form.description.trim()) newErrors.description = "Description is required";
    return newErrors;
  };


  const handleReset = () => {
    setForm({
      roleCode: "",
      roleName: "",
      description: "",
      isSystemRole: false,
      isActive: true,
    });
    setErrors({});
  };

  const inputClass = (field) => `mt-1 px-3 py-2 border bg-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 shadow-sm w-full rounded-md ${errors[field] ? "border-red-500" : "border-slate-300"}`;

  return (
    <div className="bg-white rounded-xl shadow-2xl p-6 border border-slate-200 min-h-[400px]">
      <ReusableDialogueBox
        isOpen={isDialogOpen}
        title={editId ? "Confirm Update" : "Confirm Save"}
        message={editId ? "Are you sure you want to update this role?" : "Are you sure you want to save this role?"}
        onConfirm={handleSubmit}
        onCancel={() => setIsDialogOpen(false)}
      />
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b">
        <h1 className="text-3xl font-extrabold text-indigo-700 flex items-center gap-2">
          <FiBriefcase />
          Role Master
        </h1>
        <p className="text-xs text-slate-500">{editId ? "Update existing role" : "Add new role details"}</p>

        <Link
          to="/role-master-list"
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold shadow-md hover:bg-indigo-700 transition"
        >
          VIEW LIST
        </Link>
      </div>

      <form onSubmit={handleConfirmTrigger} className="space-y-8">
        {/* Role Fields */}
        <section>
          <h2 className="text-xl font-semibold text-slate-700 mb-4 border-b pb-2">
            Role Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Role Code */}
            <div>
              <label className="text-sm font-medium text-slate-600">
                Role Code <span className="text-red-500">*</span>
              </label>
              <input
                name="roleCode"
                value={form.roleCode}
                onChange={handleChange}
                type="text"
                className={inputClass("roleCode")}
                placeholder="Enter role code (e.g. ADMIN, USER)"
              />
            </div>

            {/* Role Name */}
            <div>
              <label className="text-sm font-medium text-slate-600">
                Role Name <span className="text-red-500">*</span>
              </label>
              <input
                name="roleName"
                value={form.roleName}
                onChange={handleChange}
                type="text"
                className={inputClass("roleName")}
                placeholder="Enter role name (e.g. Administrator)"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-600">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                className={inputClass("description")}
                placeholder="Short description about this role"
              />
            </div>

            {/* Is System Role (checkbox) */}
            <div className="flex items-center gap-3 mt-2 md:col-span-2">
              <input
                id="isSystemRole"
                name="isSystemRole"
                type="checkbox"
                checked={form.isSystemRole}
                onChange={handleChange}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <label
                htmlFor="isSystemRole"
                className="text-sm font-medium text-slate-600"
              >
                Is System Role (core role that cannot be deleted)
              </label>
            </div>

            {/* Is Active (checkbox) */}
            <div className="flex items-center gap-3 mt-2 md:col-span-2">
              <input
                id="isActive"
                name="isActive"
                type="checkbox"
                checked={form.isActive}
                onChange={handleChange}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <label
                htmlFor="isActive"
                className="text-sm font-medium text-slate-600"
              >
                Is Active
              </label>
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
            {editId ? "UPDATE ROLE" : "SAVE ROLE"}
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
