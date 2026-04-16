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

export default function DepartmentMasterList() {
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
  const departments = useMemo(
    () => [
      {
        ID: 1,
        DepartmentCode: "ACC",
        DepartmentName: "Accounts",
        Description: "Handles finance & accounts",
      },
      {
        ID: 2,
        DepartmentCode: "HR",
        DepartmentName: "Human Resources",
        Description: "Employee management",
      },
      {
        ID: 3,
        DepartmentCode: "IT",
        DepartmentName: "Information Technology",
        Description: "Systems & infrastructure",
      },
    ],
    []
  );

  /* ---------------- FILTER + PAGINATION ---------------- */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return departments;

    return departments.filter(
      (d) =>
        String(d.ID).includes(q) ||
        d.DepartmentCode.toLowerCase().includes(q) ||
        d.DepartmentName.toLowerCase().includes(q) ||
        (d.Description || "").toLowerCase().includes(q)
    );
  }, [departments, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);

  /* ---------------- SELECT ROWS ---------------- */
  const toggleRow = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    const visibleIds = pageItems.map((d) => d.ID);
    const allSelected = visibleIds.every((id) =>
      selectedRows.includes(id)
    );

    if (allSelected)
      setSelectedRows((s) => s.filter((id) => !visibleIds.includes(id)));
    else setSelectedRows((s) => Array.from(new Set([...s, ...visibleIds])));
  };

  /* ---------------- EXPORT ---------------- */
  const getRowsForExport = (selectedOnly) => {
    if (selectedOnly && selectedRows.length === 0) {
      error("No departments selected for export/print.");
      return [];
    }
    return selectedOnly
      ? departments.filter((d) => selectedRows.includes(d.ID))
      : departments;
  };

  const exportColumns = [
    { key: "ID", header: "ID" },
    { key: "DepartmentCode", header: "Department Code" },
    { key: "DepartmentName", header: "Department Name" },
    { key: "Description", header: "Description" },
  ];

  const handleExportExcel = (selectedOnly) => {
    const rows = getRowsForExport(selectedOnly);
    if (!rows.length) return;

    exportExcel({
      fileName: "DepartmentList",
      sheetName: "Departments",
      columns: exportColumns,
      rows,
    });
  };

  const handleExportPDF = (selectedOnly) => {
    const rows = getRowsForExport(selectedOnly);
    if (!rows.length) return;

    exportPDF({
      fileName: "DepartmentList",
      title: "Department List",
      columns: exportColumns,
      rows,
    });
  };

  const handlePrint = (selectedOnly) => {
    const rows = getRowsForExport(selectedOnly);
    if (!rows.length) return;

    printTable({
      title: `Department List (${selectedOnly ? "Selected Only" : "All"})`,
      columns: exportColumns,
      rows,
    });
  };

  /* ---------------- ACTIONS ---------------- */
  const handleView = (dept) => onView("Department", dept);

  const handleEdit = (dept) =>
    onEdit("Department", dept.ID, () =>
      navigate(`/department-master?id=${dept.ID}`)
    );

  const handleDelete = (id) => onDelete("Department", id);

  /* ---------------- RENDER ---------------- */
  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl border border-slate-100 min-h-full">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b">
        <h1 className="text-3xl font-bold text-indigo-700">
          Department List
        </h1>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 border w-full sm:w-80 shadow-inner">
            <Search className="text-slate-400 w-5 h-5" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by ID, code, name or description"
              className="bg-transparent outline-none text-sm w-full"
            />
          </div>

          <Link
            to="/department-master"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-900 text-white rounded-sm text-xs font-semibold transition"
          >
            <Plus className="w-3.5 h-3.5" /> Add Department
          </Link>
        </div>
      </div>

      {/* EXPORT RIGHT SIDE */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5 p-3 rounded-lg bg-slate-50 border">
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <span className="font-semibold">
            {selectedRows.length} selected
          </span>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={onlySelectedExport}
              onChange={(e) => setOnlySelectedExport(e.target.checked)}
              className="w-4 h-4"
            />
            Export/Print selected only
          </label>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleExportExcel(onlySelectedExport)}
            className="px-3 py-2 flex items-center gap-2 bg-green-600 text-white rounded-lg text-sm"
          >
            <FileSpreadsheet className="w-4 h-4" /> Excel
          </button>

          <button
            onClick={() => handleExportPDF(onlySelectedExport)}
            className="px-3 py-2 flex items-center gap-2 bg-red-600 text-white rounded-lg text-sm"
          >
            <FileText className="w-4 h-4" /> PDF
          </button>

          <button
            onClick={() => handlePrint(onlySelectedExport)}
            className="px-3 py-2 flex items-center gap-2 bg-slate-700 text-white rounded-lg text-sm"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto border rounded-xl shadow-lg">
        <table className="min-w-full text-sm hidden md:table">
          <thead className="bg-blue-900 text-white">
            <tr>
              <th className="px-4 py-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={
                    pageItems.length > 0 &&
                    pageItems.every((d) =>
                      selectedRows.includes(d.ID)
                    )
                  }
                  onChange={toggleAll}
                />
              </th>
              <th className="px-4 py-3 w-16 text-left">ID</th>
              <th className="px-4 py-3 w-40 text-left">
                Department Code
              </th>
              <th className="px-4 py-3 w-64 text-left">
                Department Name
              </th>
              <th className="px-4 py-3 text-left">
                Description
              </th>
              <th className="px-4 py-3 text-center w-28">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {pageItems.map((d) => {
              const selected = selectedRows.includes(d.ID);
              return (
                <tr
                  key={d.ID}
                  className={`border-b ${
                    selected
                      ? "bg-indigo-100/50"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleRow(d.ID)}
                    />
                  </td>

                  <td className="px-4 py-3 text-left">
                    {d.ID}
                  </td>

                  <td className="px-4 py-3 text-left font-mono text-sm text-slate-700">
                    {d.DepartmentCode}
                  </td>

                  <td className="px-4 py-3 text-left font-medium text-slate-800">
                    {d.DepartmentName}
                  </td>

                  <td className="px-4 py-3 text-left text-slate-600 break-words">
                    {d.Description}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-1">
                      <button
                        onClick={() => handleView(d)}
                        className="p-2 rounded-full hover:bg-slate-200"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(d)}
                        className="p-2 rounded-full hover:bg-slate-200 text-sky-600"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(d.ID)}
                        className="p-2 rounded-full hover:bg-slate-200 text-rose-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
