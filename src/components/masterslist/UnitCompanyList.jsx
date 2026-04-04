import React, { useMemo, useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
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

export default function UnitCompanyList() {
  const navigate = useNavigate();
  const toast = useToast();
  const { exportExcel, exportPDF, printTable } = useExport();
  const { onView } = useActions();

  // States
  const [query, setQuery] = useState("");
  const [perPage] = useState(10);
  const [page, setPage] = useState(1);
  const [companies, setCompanies] = useState([]);

  // --- DIALOGUE & VIEW STATES ---
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Load List Data
  const fetchCompanies = () => {
    axios.get("/api/unit-master")
      .then((res) => {
        // Extract content from paginated response, preserving backend order
        const actualData = res.data.content || (Array.isArray(res.data) ? res.data : res.data.companies || []);
        setCompanies(actualData);
      })
      .catch((err) => {
        console.error("GET ERROR:", err);
        toast.error("Failed to load company data");
      });
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  // DELETE HANDLERS
  const openDeleteModal = (unitId) => {
    setUnitToDelete(unitId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!unitToDelete) return;
    try {
      await axios.delete(`/api/unit-master/${unitToDelete}`);
      setCompanies(prev => prev.filter(item => item.unitId !== unitToDelete));
      toast.success("Record deleted successfully!");
    } catch (err) {
      toast.error("Delete failed. Please try again.");
    } finally {
      setIsDeleteDialogOpen(false);
      setUnitToDelete(null);
    }
  };

  const handleView = (company) => {
    setSelectedCompany(company);
    setIsViewModalOpen(true);
    onView("Company", company);
  };

  // Filter Logic - Preserves original backend order
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return companies; // Return in original backend order
    return companies.filter(c =>
      (c.unitName || "").toLowerCase().includes(q) ||
      (c.gstin || "").toLowerCase().includes(q) ||
      (c.city || "").toLowerCase().includes(q)
    );
  }, [companies, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);

  const exportColumns = [
    { key: "unitName", header: "Company Name" },
    { key: "gstin", header: "GSTIN" },
    { key: "pan", header: "PAN" },
    { key: "city", header: "City" },
    { key: "mobileNo", header: "Phone" },
    { key: "email", header: "Email" },
  ];

  return (
    <div className="font-poppins bg-white p-6 md:p-8 rounded-xl shadow-2xl border border-slate-100 min-h-full">

      {/* DELETE DIALOGUE */}
      <ReusableDialogueBox
        isOpen={isDeleteDialogOpen}
        title="Delete Record"
        message="Are you sure you want to permanently delete this company?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />

      {/* --- SIDE SLIDE-OVER PANEL --- */}
      <div
        className={`fixed inset-0 z-[999] overflow-hidden transition-opacity duration-500 ${isViewModalOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsViewModalOpen(false)} />

        <div className={`absolute inset-y-0 right-0 max-w-lg w-full bg-white shadow-2xl transform transition-transform duration-500 ease-in-out ${isViewModalOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-6 border-b bg-indigo-50 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-indigo-900">Company Profile</h2>
                <p className="text-xs text-indigo-600 mt-1">Detailed information for {selectedCompany?.unitName}</p>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} className="p-2 hover:bg-white rounded-full shadow-sm transition">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8">
              <div className="space-y-8">
                {/* Identity Section */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                      {selectedCompany?.unitName?.charAt(0)}
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">{selectedCompany?.unitName}</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">GSTIN</p>
                      <p className="text-sm font-mono text-slate-700">{selectedCompany?.gstin || "N/A"}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">PAN</p>
                      <p className="text-sm font-mono text-slate-700">{selectedCompany?.pan || "N/A"}</p>
                    </div>
                  </div>
                </div>

                {/* Contact & Location */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-1">Contact & Location</h4>
                  <div className="flex gap-3">
                    <div className="p-2 bg-indigo-50 rounded-md text-indigo-600 h-fit"><Search className="w-4 h-4" /></div>
                    <div>
                      <p className="text-sm text-slate-700">{selectedCompany?.address}</p>
                      <p className="text-sm text-slate-500">{selectedCompany?.city}, {selectedCompany?.state} - {selectedCompany?.pincode}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="p-2 bg-emerald-50 rounded-md text-emerald-600 h-fit"><Plus className="w-4 h-4" /></div>
                    <div>
                      <p className="text-sm text-slate-700">{selectedCompany?.mobileNo}</p>
                      <p className="text-sm text-indigo-600 underline">{selectedCompany?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Banking Section */}
                <div className="p-4 rounded-xl border-2 border-dashed border-slate-100">
                  <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Bank Details</h4>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-slate-700">{selectedCompany?.bankName}</p>
                    <p className="text-xs font-mono text-slate-500">A/C: {selectedCompany?.accountNumber}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t bg-slate-50 flex gap-3">
              <button
                onClick={() => navigate(`/unit-company?id=${selectedCompany.unitId}`)}
                className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition shadow-md shadow-indigo-200"
              >
                Edit Company
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
        <h1 className="text-xl font-semibold text-indigo-700 font-poppins">Unit Company List</h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 border w-full sm:w-80 shadow-inner">
            <Search className="text-slate-400 w-5 h-5" />
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              placeholder="Search..."
              className="bg-transparent outline-none text-sm w-full"
            />
          </div>
          <Link to="/unit-company" className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold font-poppins hover:bg-indigo-700 transition">
            <Plus className="w-4 h-4" /> Add Company
          </Link>
        </div>
      </div>

      {/* EXPORT OPTIONS */}
      <div className="flex flex-wrap items-center justify-end gap-3 mb-6 p-2 bg-slate-50 rounded-xl border border-slate-200">
        <button onClick={() => exportExcel({ fileName: "Companies_List", sheetName: "Companies", columns: exportColumns, rows: filtered })} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition">
          <Download className="w-4 h-4" /> Excel
        </button>
        <button onClick={() => exportPDF({ fileName: "Units", title: "Unit List", columns: exportColumns, rows: filtered })} className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-semibold hover:bg-rose-700 transition">
          <FileText className="w-4 h-4" /> PDF
        </button>
        <button onClick={() => printTable({ title: "Unit List", columns: exportColumns, rows: filtered })} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 transition">
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
              <th className="px-4 py-3 text-left">Company Name</th>
              <th className="px-4 py-3 text-left">GSTIN</th>
              <th className="px-4 py-3 text-left">City / Contact</th>
            </tr>
          </thead>

          <tbody>
            {pageItems.map((c, index) => (
              <tr key={c.unitId} className="border-b border-slate-100 hover:bg-slate-50 transition">

                <td className="px-4 py-3 text-center font-medium text-slate-500">
                  {(page - 1) * perPage + index + 1}
                </td>

                <td className="px-4 py-3 text-center border-r border-slate-50">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => handleView(c)} className="p-2 rounded-full hover:bg-indigo-100 text-indigo-600 transition">
                      <VisibilityIcon sx={{ fontSize: 18 }} />
                    </button>

                    <button onClick={() => navigate(`/unit-company?id=${c.unitId}`)} className="p-2 rounded-full hover:bg-sky-100 text-sky-600 transition">
                      <ModeEditIcon sx={{ fontSize: 18 }} />
                    </button>

                    <button onClick={() => openDeleteModal(c.unitId)} className="p-2 rounded-full hover:bg-rose-100 text-rose-600 transition">
                      <DeleteIcon sx={{ fontSize: 18 }} />
                    </button>
                  </div>
                </td>

                <td className="px-4 py-3 font-medium text-slate-700">
                  {c.unitName}
                  <div className="text-[10px] text-slate-400 font-mono">PAN: {c.pan}</div>
                </td>

                <td className="px-4 py-3 font-mono text-indigo-600">{c.gstin}</td>

                <td className="px-4 py-3 text-slate-600">
                  {c.city}
                  <div className="text-xs text-slate-400">{c.email}</div>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 p-4 border-t">
        <div className="text-sm text-slate-600">
          Showing <b>{Math.min((page - 1) * perPage + 1, filtered.length)}</b> to <b>{Math.min(page * perPage, filtered.length)}</b> of <b>{filtered.length}</b>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 border rounded-lg hover:bg-slate-50 disabled:opacity-50 transition">Prev</button>
          <div className="px-4 py-2 border border-indigo-500 bg-indigo-50 text-indigo-700 rounded-lg font-bold">{page} / {totalPages}</div>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 border rounded-lg hover:bg-slate-50 disabled:opacity-50 transition">Next</button>
        </div>
      </div>
    </div>
  );
}
