// src/components/masterslist/DesignationMasterList.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
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

// 🔹 Contexts
import { useToast } from "../contextapi/ToastContext";
import { useExport } from "../contextapi/ExportContext";
import { useActions } from "../contextapi/ActionsContext";
import ReusableDialogueBox from "../contextapi/ReusableDialogueBox";

export default function DesignationList() {
  const navigate = useNavigate();
  const toast = useToast();
  const { exportExcel, exportPDF, printTable } = useExport();
  const { onView, onEdit, onDelete } = useActions();

  const [query, setQuery] = useState("");
  const [perPage] = useState(10);
  const [page, setPage] = useState(1);
  const [designations, setDesignations] = useState([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [designationToDelete, setDesignationToDelete] = useState(null);
  const [selectedDesignation, setSelectedDesignation] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    const fetchDesignations = async () => {
      try {
        const response = await axios.get("/api/v1/designations?page=0&size=1000");
        const payload = response.data || {};
        const content = Array.isArray(payload) ? payload : payload.content || [];
        setDesignations(
          content.map((item) => ({
            ID: item.designationId,
            DesignationCode: item.designationCode || "",
            DesignationName: item.designationName || "",
            LevelRank: item.levelRank ?? "",
            isActive: item.isActive ?? true,
          }))
        );
      } catch (error) {
        console.error("Failed loading designations:", error);
        toast.error("Unable to load the designation list.");
      }
    };

    fetchDesignations();
  }, [toast]);

  /* ---------------- FILTER + PAGINATION ---------------- */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return designations;

    return designations.filter((d) =>
      (String(d.ID) || "").toLowerCase().includes(q) ||
      (d.DesignationCode || "").toLowerCase().includes(q) ||
      (d.DesignationName || "").toLowerCase().includes(q) ||
      (String(d.LevelRank) || "").toLowerCase().includes(q)
    );
  }, [designations, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);

  /* ---------------- EXPORT HELPERS ---------------- */
  const exportColumns = [
    { key: "ID", header: "ID" },
    { key: "DesignationCode", header: "Designation Code" },
    { key: "DesignationName", header: "Designation Name" },
    { key: "LevelRank", header: "Level Rank" },
  ];

  const handleExportExcel = () => {
    if (!filtered.length) {
      toast.error("No data to export.");
      return;
    }
    exportExcel({
      fileName: "DesignationList",
      sheetName: "Designations",
      columns: exportColumns,
      rows: filtered,
    });
  };

  const handleExportPDF = () => {
    if (!filtered.length) {
      toast.error("No data to export.");
      return;
    }
    exportPDF({
      fileName: "DesignationList",
      title: "Designation List",
      columns: exportColumns,
      rows: filtered,
    });
  };

  const handlePrint = () => {
    if (!filtered.length) {
      toast.error("No data to print.");
      return;
    }
    printTable({
      title: "Designation List",
      columns: exportColumns,
      rows: filtered,
    });
  };

  /* ---------------- ROW ACTIONS (context) ---------------- */
  const handleView = (designation) => {
    setSelectedDesignation(designation);
    setIsViewModalOpen(true);
    onView("Designation", designation);
  };

  const handleEdit = (designation) => {
    onEdit("Designation", designation.ID, () =>
      navigate(`/designation-master?id=${designation.ID}`)
    );
  };

  const openDeleteModal = (id) => {
    setDesignationToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!designationToDelete) return;

    try {
      await axios.delete(`/api/v1/designations/${designationToDelete}`);
      setDesignations((prev) =>
        prev.filter((designation) => designation.ID !== designationToDelete)
      );
      toast.success("Designation deleted successfully.");
    } catch (error) {
      console.error("Designation deletion failed:", error);
      toast.error(
        error?.response?.data?.message || "Failed to delete designation."
      );
    } finally {
      setIsDeleteDialogOpen(false);
      setDesignationToDelete(null);
    }
  };

  /* ---------------- RENDER ---------------- */
  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl border border-slate-100 min-h-full">
      {/* Header & Search/Add */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b">
        <h1 className="text-3xl font-bold text-indigo-700">
          Designation List
        </h1>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Search Input */}
          <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 border w-full sm:w-80 shadow-inner">
            <Search className="text-slate-400 w-5 h-5" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by ID, code, name or level"
              className="bg-transparent outline-none text-sm w-full placeholder:text-slate-400"
            />
          </div>

          {/* Add Designation Button */}
          <Link
            to="/designation-master"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-900 text-white rounded-sm text-xs font-semibold transition"
            title="Add Designation"
          >
            <Plus className="w-3.5 h-3.5" /> Add Designation
          </Link>
        </div>
      </div>

      {/* EXPORT OPTIONS */}
      <div className="flex flex-wrap items-center justify-end gap-3 mb-6 p-2 bg-slate-50 rounded-xl border border-slate-200">
        <button
          onClick={handleExportExcel}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition"
        >
          <Download className="w-4 h-4" /> Excel
        </button>
        <button
          onClick={handleExportPDF}
          className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-semibold hover:bg-rose-700 transition"
        >
          <FileText className="w-4 h-4" /> PDF
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
        >
          <Printer className="w-4 h-4" /> Print
        </button>
      </div>

      <div className="overflow-hidden border rounded-xl shadow-lg">
        <table className="min-w-full text-sm table-auto">
          <thead className="bg-indigo-900 text-white">
            <tr>
              <th className="px-4 py-3 text-center w-16">Sr No.</th>
              <th className="px-4 py-3 text-center w-32">Actions</th>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Designation Code</th>
              <th className="px-4 py-3 text-left">Designation Name</th>
              <th className="px-4 py-3 text-left">Level Rank</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pageItems.length > 0 ? (
              pageItems.map((d, index) => (
                <tr key={d.ID} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 text-center font-medium text-slate-500">
                    {(page - 1) * perPage + index + 1}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleView(d)}
                        className="p-2 rounded-full hover:bg-slate-100 text-indigo-600 transition"
                        title="View"
                      >
                        <VisibilityIcon sx={{ fontSize: 18 }} />
                      </button>
                      <button
                        onClick={() => handleEdit(d)}
                        className="p-2 rounded-full hover:bg-slate-100 text-sky-600 transition"
                        title="Edit"
                      >
                        <ModeEditIcon sx={{ fontSize: 18 }} />
                      </button>
                      <button
                        onClick={() => openDeleteModal(d.ID)}
                        className="p-2 rounded-full hover:bg-slate-100 text-rose-600 transition"
                        title="Delete"
                      >
                        <DeleteIcon sx={{ fontSize: 18 }} />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-600">{d.ID}</td>
                  <td className="px-4 py-3 text-slate-700">{d.DesignationCode}</td>
                  <td className="px-4 py-3 font-medium text-slate-700">{d.DesignationName}</td>
                  <td className="px-4 py-3 text-slate-700">{d.LevelRank}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-8 text-slate-500 italic">
                  No designations found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="md:hidden p-4 space-y-4">
        {pageItems.length === 0 && (
          <div className="text-center py-6 text-slate-500 italic">No designations found.</div>
        )}

        {pageItems.map((d) => (
          <div key={d.ID} className="border rounded-xl p-4 shadow-md bg-white border-slate-200">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-lg text-indigo-700 truncate">{d.DesignationName}</div>
                <div className="text-sm text-slate-500 mt-1">
                  <span className="font-mono text-xs px-2 py-0.5 bg-slate-200 rounded-full">ID: {d.ID}</span>
                  <span className="ml-2 text-xs text-slate-400">Code: {d.DesignationCode}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded-full">Rank {d.LevelRank}</div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4 pt-3 border-t">
              <button onClick={() => handleView(d)} className="p-2 rounded-full hover:bg-slate-100 text-indigo-600 transition" title="View"><VisibilityIcon sx={{ fontSize: 18 }} /></button>
              <button onClick={() => handleEdit(d)} className="p-2 rounded-full hover:bg-slate-100 text-sky-600 transition" title="Edit"><ModeEditIcon sx={{ fontSize: 18 }} /></button>
              <button onClick={() => openDeleteModal(d.ID)} className="p-2 rounded-full hover:bg-slate-100 text-rose-600 transition" title="Delete"><DeleteIcon sx={{ fontSize: 18 }} /></button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer / Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 p-4 border-t">
        <div className="text-sm text-slate-600">
          Showing{" "}
          {Math.min((page - 1) * perPage + 1, filtered.length)} -{" "}
          {Math.min(page * perPage, filtered.length)} of{" "}
          {filtered.length} total result
          {filtered.length !== 1 ? "s" : ""}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={page === 1}
          >
            Prev
          </button>

          <div className="px-4 py-2 border border-indigo-500 bg-indigo-50 text-indigo-700 rounded-lg font-semibold">
            {page} / {totalPages}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      </div>

      <ReusableDialogueBox
        isOpen={isDeleteDialogOpen}
        title="Delete Designation"
        message="Are you sure you want to delete this designation? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />

      <div className={`fixed inset-0 z-[999] overflow-hidden transition-opacity duration-500 ${isViewModalOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsViewModalOpen(false)} />
        <div className={`absolute inset-y-0 right-0 max-w-lg w-full bg-white shadow-2xl transform transition-transform duration-500 ease-in-out ${isViewModalOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="h-full flex flex-col">
            <div className="p-6 border-b bg-indigo-50 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-indigo-900">Designation Details</h2>
                <p className="text-xs text-indigo-600 mt-1">Review designation information</p>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} className="p-2 hover:bg-white rounded-full transition">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Designation Code</p>
                    <p className="text-sm font-mono text-slate-700">{selectedDesignation?.DesignationCode || "N/A"}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Level Rank</p>
                    <p className="text-sm text-slate-700">{selectedDesignation?.LevelRank ?? "N/A"}</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Designation Name</p>
                  <p className="text-sm text-slate-700">{selectedDesignation?.DesignationName || "N/A"}</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Status</p>
                  <p className={`text-sm font-bold ${selectedDesignation?.isActive ? "text-emerald-600" : "text-rose-600"}`}>
                    {selectedDesignation?.isActive ? "Active" : "Inactive"}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-slate-50 flex gap-3">
              <button
                onClick={() => navigate(`/designation-master?id=${selectedDesignation?.ID}`)}
                className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition shadow-md"
              >
                Edit Designation
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
    </div>
  );
}
