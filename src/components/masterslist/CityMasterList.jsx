import React, { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Search,
  Plus,
  FileText,
  Download,
  Printer,
  X,
} from "lucide-react";
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ModeEditIcon from '@mui/icons-material/ModeEdit';

// Custom Context Hooks
import { useToast } from "../contextapi/ToastContext";
import { useExport } from "../contextapi/ExportContext";
import { useActions } from "../contextapi/ActionsContext";
import ReusableDialogueBox from "../contextapi/ReusableDialogueBox";

const CityMasterList = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { exportExcel, exportPDF, printTable } = useExport();
  const { onView } = useActions();

  // States
  const [query, setQuery] = useState("");
  const [perPage] = useState(10);
  const [page, setPage] = useState(1);
  const [cities, setCities] = useState([]);

  // --- DIALOGUE & VIEW STATES ---
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [cityToDelete, setCityToDelete] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  // FETCH DATA
  const fetchCities = () => {
    axios.get("/api/v1/cities?page=0&size=1000")
      .then((res) => {
        // Extract content from paginated response, preserving backend order
        const actualData = res.data.content || (Array.isArray(res.data) ? res.data : res.data.cities || []);
        setCities(actualData);
      })
      .catch((err) => {
        console.error("GET ERROR:", err);
        toast.error("Failed to load City data");
        setCities([]);
      });
  };

  useEffect(() => {
    fetchCities();
  }, []);

  // DELETE HANDLER
  const openDeleteModal = (cityId) => {
    setCityToDelete(cityId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!cityToDelete) return;
    try {
      const response = await axios.delete(`/api/v1/cities/${cityToDelete}`);
      setCities(prev => prev.filter(city => city.cityId !== cityToDelete));
      console.log(response.data);
      toast.success("City deleted successfully!");
    } catch (err) {
      console.error("Delete Error:", err);
      const msg = err.response?.data?.message || "Delete failed. City might be in use or protected.";
      toast.error(msg);
    } finally {
      setIsDeleteDialogOpen(false);
      setCityToDelete(null);
    }
  };

  const handleView = (cityData) => {
    setSelectedCity(cityData);
    setIsViewModalOpen(true);
    if (onView) onView("City", cityData);
  };

  // FILTER LOGIC - Preserves original backend order
  const filtered = useMemo(() => {
    if (!Array.isArray(cities)) return [];
    const q = query.trim().toLowerCase();
    if (!q) return cities; // Return in original backend order
    return cities.filter(c =>
      (c.cityName || "").toLowerCase().includes(q) ||
      (c.cityCode || "").toLowerCase().includes(q) ||
      (c.stateName || "").toLowerCase().includes(q) ||
      (c.countryName || "").toLowerCase().includes(q) ||
      (c.stdCode || "").toLowerCase().includes(q) ||
      (c.postalCode || "").toLowerCase().includes(q)
    );
  }, [cities, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);

  const exportColumns = [
    { key: "cityCode", header: "City Code" },
    { key: "cityName", header: "City Name" },
    { key: "stateName", header: "State" },
    { key: "countryName", header: "Country" },
    { key: "stdCode", header: "STD Code" },
    { key: "postalCode", header: "Postal Code" },
  ];

  const handleExport = (type) => {
    const sourceData = filtered;

    if (sourceData.length === 0) {
      toast.error("No data to export.");
      return;
    }

    const config = {
      fileName: `City_List`,
      title: "City Master Report",
      columns: exportColumns,
      rows: sourceData
    };

    if (type === "excel") {
      exportExcel(config);
      toast.success("Exported to Excel");
    }
    if (type === "pdf") {
      exportPDF(config);
      toast.success("Exported to PDF");
    }
    if (type === "print") {
      printTable(config);
      toast.success("Print dialog opened");
    }
  };

  return (
    <div className="font-poppins bg-white p-6 md:p-8 rounded-xl shadow-2xl border border-slate-100 min-h-full">

      <ReusableDialogueBox
        isOpen={isDeleteDialogOpen}
        title="Delete City"
        message="Are you sure you want to delete this city? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />

      {/* --- SIDE VIEW PANEL --- */}
      <div className={`fixed inset-0 z-[999] overflow-hidden transition-opacity duration-500 ${isViewModalOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsViewModalOpen(false)} />
        <div className={`absolute inset-y-0 right-0 max-w-lg w-full bg-white shadow-2xl transform transition-transform duration-500 ease-in-out ${isViewModalOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="h-full flex flex-col">
            <div className="p-6 border-b bg-indigo-50 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-indigo-900">City Profile</h2>
                <p className="text-xs text-indigo-600 mt-1">Detailed information</p>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} className="p-2 hover:bg-white rounded-full transition">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              <div className="space-y-8">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">City Code</p>
                  <p className="text-sm font-mono text-slate-700">{selectedCity?.cityCode || "N/A"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl uppercase">
                    {selectedCity?.cityName?.charAt(0) || "C"}
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 uppercase">{selectedCity?.cityName}</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">State</p>
                    <p className="text-sm text-slate-700">{selectedCity?.stateName || "N/A"}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Country</p>
                    <p className="text-sm font-bold text-emerald-600">{selectedCity?.countryName || "N/A"}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">STD Code</p>
                    <p className="text-sm text-slate-700">{selectedCity?.stdCode || "N/A"}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Postal Code</p>
                    <p className="text-sm text-slate-700">{selectedCity?.postalCode || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-slate-50 flex gap-3">
              <button
                onClick={() => navigate(`/city-master?id=${selectedCity?.cityId}`)}
                className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition shadow-md"
              >
                Edit City
              </button>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b">
        <h1 className="text-xl font-semibold text-indigo-700">City Master List</h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 border w-full sm:w-80 shadow-inner">
            <Search className="text-slate-400 w-5 h-5" />
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              placeholder="Search Cities..."
              className="bg-transparent outline-none text-sm w-full"
            />
          </div>
          <Link
            to="/city-master"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-900 text-white rounded-sm text-xs font-semibold transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add City
          </Link>
        </div>
      </div>

      {/* EXPORT OPTIONS */}
      <div className="flex flex-wrap items-center justify-end gap-3 mb-6 p-2 bg-slate-50 rounded-xl border border-slate-200">
        <button onClick={() => exportExcel({ fileName: "Cities", sheetName: "Cities", columns: exportColumns, rows: filtered })} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition">
          <Download className="w-4 h-4" /> Excel
        </button>
        <button onClick={() => exportPDF({ fileName: "Cities", title: "City List", columns: exportColumns, rows: filtered })} className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-semibold hover:bg-rose-700 transition">
          <FileText className="w-4 h-4" /> PDF
        </button>
        <button onClick={() => printTable({ title: "City List", columns: exportColumns, rows: filtered })} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm hover:bg-slate-100 transition">
          <Printer className="w-4 h-4" /> Print
        </button>
      </div>

      {/* DATA TABLE */}
      <div className="overflow-hidden border rounded-xl shadow-lg">
        <table className="min-w-full text-sm table-auto">
          <thead className="bg-indigo-900 text-white">
            <tr>
              <th className="px-4 py-3 text-center w-16">Sr No.</th>
              <th className="px-4 py-3 text-center w-32">Actions</th>
              <th className="px-4 py-3 text-left">City Code</th>
              <th className="px-4 py-3 text-left">City Name</th>
              <th className="px-4 py-3 text-left">State</th>
              <th className="px-4 py-3 text-center">Country</th>
              <th className="px-4 py-3 text-center">STD Code</th>
              <th className="px-4 py-3 text-center">Postal Code</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pageItems.length > 0 ? (
              pageItems.map((city, index) => (
                <tr key={city.cityId} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 text-center font-medium text-slate-500">
                    {(page - 1) * perPage + index + 1}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => handleView(city)} className="p-2 rounded-full hover:bg-indigo-100 text-indigo-600 transition">
                        <VisibilityIcon sx={{ fontSize: 18 }} />
                      </button>
                      <button onClick={() => navigate(`/city-master?id=${city.cityId}`)} className="p-2 rounded-full hover:bg-sky-100 text-sky-600 transition">
                        <ModeEditIcon sx={{ fontSize: 18 }} />
                      </button>
                      <button onClick={() => openDeleteModal(city.cityId)} className="p-2 rounded-full hover:bg-rose-100 text-rose-600 transition">
                        <DeleteIcon sx={{ fontSize: 18 }} />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-700">{city.cityCode}</td>
                  <td className="px-4 py-3 font-medium text-slate-700 uppercase">{city.cityName}</td>
                  <td className="px-4 py-3 text-slate-500">{city.stateName}</td>
                  <td className="px-4 py-3 text-center font-medium text-slate-700">{city.countryName}</td>
                  <td className="px-4 py-3 text-center">{city.stdCode}</td>
                  <td className="px-4 py-3 text-center">{city.postalCode}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="px-4 py-10 text-center text-slate-400 italic">No Cities found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 p-4 border-t">
        <div className="text-sm text-slate-600">
          Showing <b>{filtered.length > 0 ? (page - 1) * perPage + 1 : 0}</b> to <b>{Math.min(page * perPage, filtered.length)}</b> of <b>{filtered.length}</b>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 border rounded-lg hover:bg-slate-50 disabled:opacity-50 transition">Prev</button>
          <div className="px-4 py-2 border border-indigo-500 bg-indigo-50 text-indigo-700 rounded-lg font-bold">{page} / {totalPages}</div>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 border rounded-lg hover:bg-slate-50 disabled:opacity-50 transition">Next</button>
        </div>
      </div>
    </div>
  );
};

export default CityMasterList;
