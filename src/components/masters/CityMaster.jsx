import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FiSave, FiX, FiBriefcase, FiRefreshCcw, FiLoader } from "react-icons/fi";
import axios from "axios";
import { useToast } from "../contextapi/ToastContext";
import ReusableDialogueBox from "../contextapi/ReusableDialogueBox";

export default function CityMaster() {

   const toast = useToast();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editId = searchParams.get("id");
  
    // State for logic handling
    const [loading, setLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [form, setForm] = useState({
    cityCode: "",
    cityName: "",
    stateID: "",
    countryID: "",
    stdCode: "",
    postalCode: "",
  });

  // --- 1. FETCH POST API CALLING (To prevent blank form on edit) ---
  useEffect(() => {
    if (editId) {
      axios.get(`/api/v1/cities/${editId}`)
        .then((res) => {
          const data = res.data;
          setForm({
            ...data,
          });
        })
        .catch((err) => {
          console.error("Fetch Error:", err);
          toast.error("Failed to load city details");
        });
    }
  }, [editId]);

  // --- 2.  PUT API CALLING ---
  const updateRole = async () => {
    try {
      const payload = {
        ...form,
      };
      const response = await axios.put(`/api/v1/cities/${editId}`, payload);
      toast.success("Updated successfully!");
      navigate("/city-master-list");
      console.log(response.data);
      
    } catch (error) {
      console.error("Update Error:", error);
      toast.error("Error occurred while updating city");
    } finally {
      setLoading(false);
    }
  };

   // --- 3. POST API CALLING ---
  const saveRole = async () => {
    try {
      const payload = {
        ...form,
        
      };
      const response = await axios.post("/api/v1/cities", payload);
      toast.success("Saved successfully!");
      navigate("/city-master-list");
      console.log(response.data);
       
    } catch (error) {
      console.error("Backend Error Detail:", error.response?.data);
      console.error("Save Error:", error);
      if (error.response && error.response.status === 409) {
        toast.error("City record already exists!");
      } else if (error.response && error.response.status === 500) {
          toast.error("Server Error: Please check if the City Code is unique.");
      } else {
        toast.error("Error occurred while saving city");
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
    setIsDialogOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };


  const handleReset = () =>
    setForm({
      cityCode: "",
      cityName: "",
      stateID: "",
      countryID: "",
      stdCode: "",
      postalCode: "",
    });

  const inputClass =
    "mt-1 px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-400 outline-none bg-white shadow-sm w-full";

  return (
    <div className="bg-white rounded-xl shadow-2xl p-6 border border-slate-200 min-h-[400px]">
     <ReusableDialogueBox
        isOpen={isDialogOpen}
        title={editId ? "Confirm Update" : "Confirm Save"}
        message={editId ? "Are you sure you want to update this city?" : "Are you sure you want to save this city?"}
        onConfirm={handleSubmit}
        onCancel={() => setIsDialogOpen(false)}
      />
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b">
        <h1 className="text-3xl font-extrabold text-indigo-700 flex items-center gap-2">
          <FiBriefcase />
          City Master
        </h1>

        <Link
          to="/city-master-list"
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold shadow-md hover:bg-indigo-700 transition"
        >
          VIEW LIST
        </Link>
      </div>

      <form onSubmit={handleConfirmTrigger} className="space-y-8">
        {/* City Fields */}
        <section>
          <h2 className="text-xl font-semibold text-slate-700 mb-4 border-b pb-2">
            City Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-slate-600">
                City Code
              </label>
              <input
                name="cityCode"
                value={form.cityCode}
                onChange={handleChange}
                type="text"
                className={inputClass}
                placeholder="Enter city code"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-600">
                City Name
              </label>
              <input
                name="cityName"
                value={form.cityName}
                onChange={handleChange}
                type="text"
                className={inputClass}
                placeholder="Enter city name"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-600">
                State ID
              </label>
              <input
                name="stateID"
                value={form.stateID}
                onChange={handleChange}
                type="text"
                className={inputClass}
                placeholder="Enter state ID"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-600">
                Country ID
              </label>
              <input
                name="countryID"
                value={form.countryID}
                onChange={handleChange}
                type="text"
                className={inputClass}
                placeholder="Enter country ID"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-600">
                STD Code
              </label>
              <input
                name="stdCode"
                value={form.stdCode}
                onChange={handleChange}
                type="text"
                className={inputClass}
                placeholder="e.g. 022"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-600">
                Postal Code
              </label>
              <input
                name="postalCode"
                value={form.postalCode}
                onChange={handleChange}
                type="text"
                className={inputClass}
                placeholder="e.g. 400001"
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
                   {editId ? "UPDATE CITY" : "SAVE CITY"}
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
