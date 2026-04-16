import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  Edit,
  Trash2,
  Search,
  FileSpreadsheet,
  FileText,
  Printer,
  Plus,
} from "lucide-react";

import { useToast } from "../contextapi/ToastContext";
import { useExport } from "../contextapi/ExportContext";
import { useActions } from "../contextapi/ActionsContext";

export default function UnitMasterList() {
  const navigate = useNavigate();

  const { error } = useToast();
  const { exportExcel, exportPDF, printTable } = useExport();
  const { onView, onEdit, onDelete } = useActions();

  const [query, setQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [onlySelectedExport, setOnlySelectedExport] = useState(false);
  const [perPage] = useState(10);
  const [page, setPage] = useState(1);

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

  /* ---------------- RENDER ---------------- */
  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl border border-slate-100">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b">
        <h1 className="text-3xl font-bold text-indigo-700">
          Item Unit List
        </h1>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 border w-full sm:w-80">
            <Search className="w-5 h-5 text-slate-400" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search unit..."
              className="bg-transparent outline-none text-sm w-full"
            />
          </div>

          <Link
            to="/unit-master"
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-900 text-white rounded-sm text-xs font-semibold transition"
          >
            <Plus className="w-3.5 h-3.5" /> Add Unit
          </Link>
        </div>
      </div>

      {/* EXPORT BAR */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-5 p-3 bg-slate-50 border rounded-lg">
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <span className="font-semibold">{selectedRows.length} selected</span>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={onlySelectedExport}
              onChange={(e) => setOnlySelectedExport(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            Export selected only
          </label>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => handleExport("excel")}
            className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm flex items-center gap-2 hover:bg-green-700 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" /> Excel
          </button>
          <button 
            onClick={() => handleExport("pdf")}
            className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm flex items-center gap-2 hover:bg-red-700 transition-colors"
          >
            <FileText className="w-4 h-4" /> PDF
          </button>
          <button 
            onClick={() => handleExport("print")}
            className="px-3 py-2 bg-slate-700 text-white rounded-lg text-sm flex items-center gap-2 hover:bg-slate-800 transition-colors"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto border rounded-xl shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-blue-900 text-white">
            <tr>
              <th className="px-4 py-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={
                    pageItems.length > 0 &&
                    pageItems.every((u) => selectedRows.includes(u.UnitCode))
                  }
                  onChange={toggleAll}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="px-4 py-3 text-left w-28">Unit Code</th>
              <th className="px-4 py-3 text-left w-56">Unit Name</th>
              <th className="px-4 py-3 text-left w-32">Unit Symbol</th>
              <th className="px-4 py-3 text-center w-36">Decimal</th>
              <th className="px-4 py-3 text-center w-32">Base Unit</th>
              <th className="px-4 py-3 text-center w-28">Actions</th>
            </tr>
          </thead>

          <tbody>
            {pageItems.length > 0 ? (
              pageItems.map((u) => {
                const selected = selectedRows.includes(u.UnitCode);
                return (
                  <tr
                    key={u.UnitCode}
                    className={`border-b transition-colors ${
                      selected ? "bg-indigo-50" : "hover:bg-slate-50"
                    }`}
                  >
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleRow(u.UnitCode)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-left">{u.UnitCode}</td>
                    <td className="px-4 py-3 font-medium text-left text-slate-700">{u.UnitName}</td>
                    <td className="px-4 py-3 text-left text-slate-600">{u.UnitSymbol}</td>
                    <td className="px-4 py-3 text-center text-slate-600">{u.DecimalAllowed}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${u.IsBaseUnit ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {u.IsBaseUnit ? "YES" : "NO"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => onView(u)} className="p-2 rounded-full hover:bg-slate-200 transition-colors" title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => onEdit(u)} className="p-2 rounded-full hover:bg-slate-200 text-sky-600 transition-colors" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => onDelete(u)} className="p-2 rounded-full hover:bg-slate-200 text-rose-600 transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-10 text-slate-400 italic">
                  No units found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
