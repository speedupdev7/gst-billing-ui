import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FiSave, FiX, FiBriefcase, FiRefreshCcw, FiLoader } from "react-icons/fi";
import axios from "axios";
import { useToast } from "../contextapi/ToastContext";
import ReusableDialogueBox from "../contextapi/ReusableDialogueBox";

export default function ExpenseMaster() {
  const toast = useToast();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editId = searchParams.get("id");
  
    // State for logic handling
    const [loading, setLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState({
    expenseCode: "",
    expenseName: "",
    description: "",
    isReimbursable: false,
  });
  // --- 1. FETCH POST API CALLING (To prevent blank form on edit) ---
  useEffect(() => {
    if (editId) {
      axios.get(`/api/v1/expenses/${editId}`)
        .then((res) => {
          const data = res.data;
          setForm({
            ...data,
           
          });
        })
        .catch((err) => {
          console.error("Fetch Error:", err);
          toast.error("Failed to load expense details");
        });
    }
  }, [editId]);

   // --- 2.  PUT API CALLING ---
  const updateExpense = async () => {
    try {
      const payload = {
        ...form,
      };
      const response = await axios.put(`/api/v1/expenses/${editId}`, payload);
      toast.success("Updated successfully!");
      navigate("/expenses-master-list");
      console.log(response.data);
      
    } catch (error) {
      console.error("Update Error:", error);
      toast.error("Error occurred while updating data");
    } finally {
      setLoading(false);
    }
  };

   // --- 3. POST API CALLING ---
  const saveExpense = async () => {
    try {
      const payload = {
        ...form,
      
      };
      const response = await axios.post("/api/v1/expenses", payload);
      toast.success("Saved successfully!");
      navigate("/expenses-master-list");
      console.log(response.data);
       
    } catch (error) {
      console.error("Backend Error Detail:", error.response?.data);
      console.error("Save Error:", error);
      if (error.response && error.response.status === 409) {
        toast.error("Expense record already exists!");
      }else if(error.response && error.response.status===500){
          toast.error("Server Error: Please check if the Expense Code is unique.");
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
      await updateExpense();
    } else {
      await saveExpense();
    }
  };
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((s) => ({
      ...s,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
const handleConfirmTrigger = (e) => {
    if (e) e.preventDefault();
    if (loading) return;
    setIsDialogOpen(true);
  };

  const handleReset = () =>
    setForm({
      expenseCode: "",
      expenseName: "",
      description: "",
      isReimbursable: false,
    });

  const inputClass =
    "mt-1 px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-400 outline-none bg-white shadow-sm w-full";

  return (
    <div className="min-h-screen bg-gray-50 px-2 py-3 sm:p-8">
      {/* MOBILE FLAT / DESKTOP CARD */}
      <div
        className="
          w-full
          sm:max-w-4xl
          sm:mx-auto
          bg-white
          p-4
          sm:p-8
          sm:rounded-xl
          sm:shadow-2xl
        "
      >
         <ReusableDialogueBox
        isOpen={isDialogOpen}
        title={editId ? "Confirm Update" : "Confirm Save"}
        message={editId ? "Are you sure you want to update this expense?" : "Are you sure you want to save this expense?"}
        onConfirm={handleSubmit}
        onCancel={() => setIsDialogOpen(false)}
      />
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-indigo-700 flex items-center gap-2">
            <FiBriefcase />
            Expense Master
          </h1>

          <Link
            to="/expenses-master-list"
            className="mt-3 sm:mt-0 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold shadow-md hover:bg-indigo-700 transition w-full sm:w-auto text-center"
          >
            VIEW LIST
          </Link>
        </div>

        <form onSubmit={handleConfirmTrigger} className="space-y-8">
          {/* Expense Fields */}
          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-slate-700 mb-4 border-b pb-2">
              Expense Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Expense Code */}
              <div>
                <label className="text-sm font-medium text-slate-600">
                  Expense Code
                </label>
                <input
                  name="expenseCode"
                  value={form.expenseCode}
                  onChange={handleChange}
                  type="text"
                  className={inputClass}
                  placeholder="Enter expense code"
                />
              </div>

              {/* Expense Name */}
              <div>
                <label className="text-sm font-medium text-slate-600">
                  Expense Name
                </label>
                <input
                  name="expenseName"
                  value={form.expenseName}
                  onChange={handleChange}
                  type="text"
                  className={inputClass}
                  placeholder="Enter expense name"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-slate-600">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  className={inputClass}
                  placeholder="Enter description"
                />
              </div>

              {/* Is Reimbursable */}
              <div className="flex items-center gap-3 mt-2">
                <input
                  id="isReimbursable"
                  name="isReimbursable"
                  type="checkbox"
                  checked={form.isReimbursable}
                  onChange={handleChange}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
                <label
                  htmlFor="isReimbursable"
                  className="text-sm font-medium text-slate-600"
                >
                  Is Reimbursable
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
              {editId ? "UPDATE EXPENSE" : "SAVE EXPENSE"}
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
    </div>
  );
}
