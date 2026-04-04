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

export default function FinancialYearList() {
  const navigate = useNavigate();

  const { error } = useToast();
  const { exportExcel, exportPDF, printTable } = useExport();
  const { onView, onEdit, onDelete } = useActions();

  const [query, setQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [onlySelectedExport, setOnlySelectedExport] = useState(false);
  const [perPage] = useState(10);
  const [page, setPage] = useState(1);

  const financialYears = useMemo(
    () => [
      {
        FinancialYearName: "2023-2024",
        FromDate: "2023-04-01",
        ToDate: "2024-03-31",
        AssessmentYear: "2024-2025",
        IsCurrentYear: false,
        IsLocked: true,
      },
      {
        FinancialYearName: "2024-2025",
        FromDate: "2024-04-01",
        ToDate: "2025-03-31",
        AssessmentYear: "2025-2026",
        IsCurrentYear: true,
        IsLocked: false,
      },
    ],
    []
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return financialYears;
    return financialYears.filter(
      (f) =>
        f.FinancialYearName.toLowerCase().includes(q) ||
        f.AssessmentYear.toLowerCase().includes(q)
    );
  }, [financialYears, query]);

  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);

  const toggleRow = (name) => {
    setSelectedRows((p) =>
      p.includes(name) ? p.filter((x) => x !== name) : [...p, name]
    );
  };

  const toggleAll = () => {
    const visible = pageItems.map((f) => f.FinancialYearName);
    const allSelected = visible.every((v) => selectedRows.includes(v));
    setSelectedRows(allSelected ? [] : visible);
  };

  /* --- EXPORT LOGIC --- */
  const exportColumns = [
    { key: "FinancialYearName", header: "Financial Year" },
    { key: "FromDate", header: "From Date" },
    { key: "ToDate", header: "To Date" },
    { key: "AssessmentYear", header: "Assessment Year" },
    { key: "IsCurrentYearDisplay", header: "Current Year" },
    { key: "IsLockedDisplay", header: "Locked" },
  ];

  const handleExport = (type) => {
    const sourceData = onlySelectedExport
      ? financialYears.filter((f) => selectedRows.includes(f.FinancialYearName))
      : filtered;

    if (sourceData.length === 0) {
      error("No data available to export.");
      return;
    }

    // Format boolean values for display in files
    const formattedData = sourceData.map((f) => ({
      ...f,
      IsCurrentYearDisplay: f.IsCurrentYear ? "Yes" : "No",
      IsLockedDisplay: f.IsLocked ? "Yes" : "No",
    }));

    const config = {
      fileName: `Financial_Year_List`,
      title: "Financial Year Master Report",
      columns: exportColumns,
      rows: formattedData,
    };

    if (type === "excel") exportExcel(config);
    if (type === "pdf") exportPDF(config);
    if (type === "print") printTable(config);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-2xl border">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-5 pb-4 border-b">
        <h1 className="text-3xl font-bold text-indigo-700">
          Financial Year List
        </h1>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 border rounded-lg w-72">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search financial year..."
              className="bg-transparent outline-none text-sm w-full"
            />
          </div>

          <Link
            to="/financial-year"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Year
          </Link>
        </div>
      </div>

      {/* EXPORT */}
      <div className="flex items-center justify-between mb-4 bg-slate-50 p-3 rounded-lg border">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={onlySelectedExport}
            onChange={(e) => setOnlySelectedExport(e.target.checked)}
            className="w-4 h-4"
          />
          Export selected only
        </label>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport("excel")}
            className="px-3 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2 text-sm"
          >
            <FileSpreadsheet className="w-4 h-4" /> Excel
          </button>

          <button
            onClick={() => handleExport("pdf")}
            className="px-3 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2 text-sm"
          >
            <FileText className="w-4 h-4" /> PDF
          </button>

          <button
            onClick={() => handleExport("print")}
            className="px-3 py-2 bg-slate-700 text-white rounded-lg flex items-center gap-2 text-sm"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-blue-900 text-white">
            <tr>
              <th className="w-10 px-3 py-3 text-center">
                <input
                  type="checkbox"
                  onChange={toggleAll}
                  checked={
                    pageItems.length > 0 &&
                    pageItems.every((v) =>
                      selectedRows.includes(v.FinancialYearName)
                    )
                  }
                />
              </th>
              <th className="px-4 py-3 text-left">Financial Year</th>
              <th className="px-4 py-3 text-left">From</th>
              <th className="px-4 py-3 text-left">To</th>
              <th className="px-4 py-3 text-left">Assessment Year</th>
              <th className="px-4 py-3 text-center w-28">Current</th>
              <th className="px-4 py-3 text-center w-24">Locked</th>
              <th className="px-4 py-3 text-center w-32">Actions</th>
            </tr>
          </thead>

          <tbody>
            {pageItems.map((f) => (
              <tr
                key={f.FinancialYearName}
                className={`border-b hover:bg-slate-50 ${
                  selectedRows.includes(f.FinancialYearName)
                    ? "bg-indigo-50/50"
                    : ""
                }`}
              >
                <td className="px-3 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(f.FinancialYearName)}
                    onChange={() => toggleRow(f.FinancialYearName)}
                  />
                </td>

                <td className="px-4 py-2 font-medium">
                  {f.FinancialYearName}
                </td>
                <td className="px-4 py-2">{f.FromDate}</td>
                <td className="px-4 py-2">{f.ToDate}</td>
                <td className="px-4 py-2">{f.AssessmentYear}</td>

                <td className="px-4 py-2 text-center">
                  {f.IsCurrentYear ? "Yes" : "No"}
                </td>
                <td className="px-4 py-2 text-center">
                  {f.IsLocked ? "Yes" : "No"}
                </td>

                <td className="px-4 py-2">
                  <div className="flex items-center justify-center gap-2">
                    <Eye
                      className="w-4 h-4 cursor-pointer"
                      onClick={() => onView(f)}
                    />
                    <Edit
                      className="w-4 h-4 text-sky-600 cursor-pointer"
                      onClick={() => onEdit(f)}
                    />
                    <Trash2
                      className="w-4 h-4 text-rose-600 cursor-pointer"
                      onClick={() => onDelete(f)}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
