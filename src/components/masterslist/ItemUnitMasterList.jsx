import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  FileSpreadsheet,
  FileText,
  Printer,
  Plus,
  ArrowLeft,
  Briefcase,
  Ruler,
  Hash,
  Percent,
} from "lucide-react";
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ModeEditIcon from '@mui/icons-material/ModeEdit';

import { useToast } from "../contextapi/ToastContext";
import { useExport } from "../contextapi/ExportContext";
import { useActions } from "../contextapi/ActionsContext";

export default function UnitMasterList() {
  const { error } = useToast();
  const { exportExcel, exportPDF, printTable } = useExport();
  const { onView, onEdit, onDelete } = useActions();

  const [query, setQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [onlySelectedExport, setOnlySelectedExport] = useState(false);
  const [perPage] = useState(10);
  const [page, setPage] = useState(1);

  // --- VIEW STATES ---
  const [viewMode, setViewMode] = useState("list"); // "list" or "details"
  const [selectedUnit, setSelectedUnit] = useState(null);

  /* ---------------- SAMPLE DATA ---------------- */
  const units = useMemo(
    () => [
      {
        UnitCode: "PCS",
        UnitName: "Pieces",
        UnitSymbol: "pc",
        DecimalAllowed: 0,
        IsBaseUnit: true,
      },
      {
        UnitCode: "KG",
        UnitName: "Kilogram",
        UnitSymbol: "kg",
        DecimalAllowed: 3,
        IsBaseUnit: false,
      },
      {
        UnitCode: "LTR",
        UnitName: "Litre",
        UnitSymbol: "l",
        DecimalAllowed: 2,
        IsBaseUnit: false,
      },
    ],
    []
  );

  /* ---------------- FILTER ---------------- */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return units;

    return units.filter(
      (u) =>
        u.UnitCode.toLowerCase().includes(q) ||
        u.UnitName.toLowerCase().includes(q) ||
        u.UnitSymbol.toLowerCase().includes(q) ||
        String(u.DecimalAllowed).includes(q) ||
        (u.IsBaseUnit ? "yes" : "no").includes(q)
    );
  }, [units, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);

  /* ---------------- SELECT ---------------- */
  const toggleRow = (code) => {
    setSelectedRows((prev) =>
      prev.includes(code) ? prev.filter((x) => x !== code) : [...prev, code]
    );
  };

  const toggleAll = () => {
    const visible = pageItems.map((u) => u.UnitCode);
    const allSelected = visible.every((c) => selectedRows.includes(c));

    if (allSelected)
      setSelectedRows((s) => s.filter((c) => !visible.includes(c)));
    else setSelectedRows((s) => Array.from(new Set([...s, ...visible])));
  };

  /* ---------------- EXPORT LOGIC ---------------- */
  const exportColumns = [
    { key: "UnitCode", header: "Unit Code" },
    { key: "UnitName", header: "Unit Name" },
    { key: "UnitSymbol", header: "Unit Symbol" },
    { key: "DecimalAllowed", header: "Decimal Allowed" },
    { key: "IsBaseUnit", header: "Base Unit" },
  ];

  const handleExport = (type) => {
    const sourceData = onlySelectedExport
      ? units.filter((u) => selectedRows.includes(u.UnitCode))
      : filtered;

    if (sourceData.length === 0) {
      error(onlySelectedExport ? "No units selected for export." : "No data available.");
      return;
    }

    // Format data for export (e.g., converting boolean to YES/NO)
    const formattedData = sourceData.map(u => ({
      ...u,
      IsBaseUnit: u.IsBaseUnit ? "YES" : "NO"
    }));

    const config = {
      fileName: "Unit_Master_List",
      title: "Item Unit Report",
      columns: exportColumns,
      rows: formattedData,
    };

    if (type === "excel") exportExcel(config);
    if (type === "pdf") exportPDF(config);
    if (type === "print") printTable(config);
  };

  /* ---------------- ACTIONS ---------------- */
  const handleView = (u) => {
    setSelectedUnit(u);
    setViewMode("details");
    if (onView) onView(u);
  };

  /* ---------------- RENDER VIEW: DETAILS PAGE ---------------- */
  if (viewMode === "details" && selectedUnit) {
    return (
      <div className="font-poppins bg-slate-50 min-h-screen p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header Controls */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setViewMode("list")}
              className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition font-semibold"
            >
              <ArrowLeft className="w-5 h-5" /> Back to List
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(selectedUnit)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-indigo-700 transition"
              >
                <ModeEditIcon sx={{ fontSize: 18 }} /> Edit Unit
              </button>
            </div>
          </div>

          {/* Main Content Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            {/* Banner */}
            <div className="bg-blue-900 p-8 text-white flex items-center gap-6">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-3xl font-black border border-white/30">
                {selectedUnit.UnitSymbol || selectedUnit.UnitName?.charAt(0)}
              </div>
              <div>
                <h1 className="text-3xl font-bold">{selectedUnit.UnitName}</h1>
                <p className="text-blue-200 flex items-center gap-2 mt-1">
                  <Briefcase className="w-4 h-4" /> Unit Code: {selectedUnit.UnitCode}
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">

              {/* Main Sections */}
              <div className="md:col-span-2 space-y-8">
                <section>
                  <h3 className="text-indigo-900 font-bold text-lg mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-indigo-600 rounded-full"></div> Unit Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Unit Code</p>
                      <p className="text-base font-mono font-bold text-slate-700">{selectedUnit.UnitCode}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Unit Name</p>
                      <p className="text-base font-bold text-slate-700">{selectedUnit.UnitName}</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-indigo-900 font-bold text-lg mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-indigo-600 rounded-full"></div> Measurement Settings
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-100">
                      <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg"><Hash className="w-5 h-5" /></div>
                      <div>
                        <p className="text-xs text-slate-400">Unit Symbol</p>
                        <p className="font-bold text-slate-700">{selectedUnit.UnitSymbol}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-100">
                      <div className="p-3 bg-amber-50 text-amber-600 rounded-lg"><Percent className="w-5 h-5" /></div>
                      <div>
                        <p className="text-xs text-slate-400">Decimal Places Allowed</p>
                        <p className="font-bold text-slate-700">{selectedUnit.DecimalAllowed}</p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl text-white shadow-lg shadow-indigo-200">
                  <Ruler className="w-10 h-10 text-indigo-300 mb-6" />
                  <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-1">Unit Type</h4>
                  <p className="text-xl font-bold mb-6">{selectedUnit.IsBaseUnit ? "Base Unit" : "Derived Unit"}</p>

                  <div className={`flex items-center gap-2 text-[10px] font-bold ${selectedUnit.IsBaseUnit ? "text-emerald-400" : "text-slate-300"}`}>
                    <div className={`w-2 h-2 rounded-full ${selectedUnit.IsBaseUnit ? "bg-emerald-400 animate-pulse" : "bg-slate-300"}`}></div>
                    {selectedUnit.IsBaseUnit ? "BASE UNIT" : "NOT A BASE UNIT"}
                  </div>
                </div>

                <div className="p-6 border border-slate-100 rounded-2xl bg-white">
                  <h4 className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-tighter">System Info</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Base Unit</span>
                      <span className={`font-bold uppercase ${selectedUnit.IsBaseUnit ? "text-emerald-600" : "text-slate-500"}`}>
                        {selectedUnit.IsBaseUnit ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Data Status</span>
                      <span className="text-emerald-600 font-bold uppercase">Active</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- RENDER VIEW: MAIN LIST ---------------- */
  return (
    <div className="font-poppins bg-slate-50 min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">

        {/* --- MAIN PAGE HEADER --- */}
        <div className="p-6 md:p-8 border-b border-slate-900">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Item Unit List</h1>
              {/* Divider line for title */}
              <div className="h-1 w-12 bg-blue-900 mt-2 rounded-full"></div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Search by code, name..."
                    className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-l-lg text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                  />
                </div>
                <button
                  className="bg-blue-900 text-white px-4 py-2 rounded-r-lg text-sm font-semibold transition-colors border border-blue-600 shadow-sm flex items-center gap-2"
                  onClick={() => {/* Your search logic here */ }}
                >
                  Search
                </button>
              </div>
              <Link
                to="/unit-master"
                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-900 text-white rounded-lg text-xs font-semibold hover:bg-blue-800 transition-all shadow-md active:scale-95"
              >
                <Plus className="w-4 h-4" /> Add Unit
              </Link>
            </div>
          </div>

          {/* Export Bar */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-end gap-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-auto">Export Options</span>

            <span className="text-xs font-semibold text-slate-600">{selectedRows.length} selected</span>

            <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={onlySelectedExport}
                onChange={(e) => setOnlySelectedExport(e.target.checked)}
                className="w-4 h-4"
              />
              Export selected only
            </label>

            <button
              onClick={() => handleExport("excel")}
              className="flex items-center gap-2 px-3 py-1.5 bg-white text-emerald-700 border border-emerald-200 rounded-md text-xs font-bold hover:bg-emerald-50 hover:border-emerald-400 transition shadow-sm"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
            </button>

            <button
              onClick={() => handleExport("pdf")}
              className="flex items-center gap-2 px-3 py-1.5 bg-white text-rose-700 border border-rose-200 rounded-md text-xs font-bold hover:bg-rose-50 hover:border-rose-400 transition shadow-sm"
            >
              <FileText className="w-3.5 h-3.5" /> PDF
            </button>

            <button
              onClick={() => handleExport("print")}
              className="flex items-center gap-2 px-3 py-1.5 bg-white text-slate-700 border border-slate-200 rounded-md text-xs font-bold hover:bg-slate-50 hover:border-slate-400 transition shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
          </div>
        </div>

        {/* --- DATA TABLE --- */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-gray-200 border-b border-slate-300 text-black uppercase text-[11px] font-semibold tracking-wider">
                <th className="px-6 py-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      pageItems.length > 0 &&
                      pageItems.every((u) => selectedRows.includes(u.UnitCode))
                    }
                    onChange={toggleAll}
                  />
                </th>
                <th className="px-6 py-4 text-center w-20">Sr No</th>
                <th className="px-6 py-4 text-center w-36">Actions</th>
                <th className="px-6 py-4">Unit Details</th>
                <th className="px-6 py-4">Symbol</th>
                <th className="px-6 py-4 text-center">Decimal</th>
                <th className="px-6 py-4 text-center">Base Unit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {pageItems.length > 0 ? (
                pageItems.map((u, index) => {
                  const selected = selectedRows.includes(u.UnitCode);
                  return (
                    <tr
                      key={u.UnitCode}
                      className={`group transition-colors border-b border-slate-300 ${
                        selected ? "bg-indigo-100/60" : "hover:bg-teal-300/50"
                      }`}
                    >
                      <td className="px-6 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleRow(u.UnitCode)}
                        />
                      </td>
                      <td className="px-6 py-4 text-center text-slate-900 font-medium">
                        {(page - 1) * perPage + index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleView(u)} className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-indigo-600 transition" title="View Details">
                            <VisibilityIcon sx={{ fontSize: 18 }} />
                          </button>
                          <button onClick={() => onEdit(u)} className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-sky-600 transition" title="Edit">
                            <ModeEditIcon sx={{ fontSize: 18 }} />
                          </button>
                          <button onClick={() => onDelete(u)} className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-rose-500 transition" title="Delete">
                            <DeleteIcon sx={{ fontSize: 18 }} />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800 font-poppins">{u.UnitName}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">Code: {u.UnitCode}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-700 font-medium">{u.UnitSymbol}</td>
                      <td className="px-6 py-4 text-center text-slate-600">{u.DecimalAllowed}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${u.IsBaseUnit ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {u.IsBaseUnit ? "YES" : "NO"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-400 font-poppins">
                    No units found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* --- PAGINATION --- */}
        <div className="px-6 py-4 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            Showing <span className="font-bold text-slate-700">{filtered.length === 0 ? 0 : (page - 1) * perPage + 1}</span> to <span className="font-bold text-slate-700">{Math.min(page * perPage, filtered.length)}</span> of <span className="font-bold text-slate-700">{filtered.length}</span> units
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 border border-slate-200 rounded-md text-xs font-semibold bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Prev
            </button>
            <div className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-xs font-bold">
              {page} / {totalPages}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 border border-slate-200 rounded-md text-xs font-semibold bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}