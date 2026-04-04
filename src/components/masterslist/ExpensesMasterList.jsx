import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Eye,
  Edit,
  Trash2,
  Search,
  FileSpreadsheet,
  FileText,
  Printer,
  Plus,
  X,
} from "lucide-react";

// Import your context
import { useExport } from "../contextapi/ExportContext";

/* ---------------- Enhanced Toasts Component ---------------- */
function Toasts({ toasts, remove }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`max-w-sm w-full px-4 py-3 rounded-xl shadow-xl border flex items-start gap-3 transition-opacity duration-300 pointer-events-auto ${
            t.type === "success"
              ? "bg-emerald-50 border-emerald-300 text-emerald-800"
              : t.type === "error"
              ? "bg-rose-50 border-rose-300 text-rose-800"
              : "bg-sky-50 border-sky-300 text-sky-800"
          }`}
        >
          <div className="flex-1 text-sm font-medium">{t.message}</div>
          <button
            onClick={() => remove(t.id)}
            className="text-sm opacity-80 hover:opacity-100 transition-opacity p-1 -m-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

export default function ExpensesMasterList() {
  const { exportExcel, exportPDF, printTable } = useExport();

  const [query, setQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState([]); 
  const [toasts, setToasts] = useState([]);
  const [perPage] = useState(10);
  const [page, setPage] = useState(1);

  // --- Column Configuration for Context API ---
  const exportColumns = [
    { header: "Expense Code", key: "ExpenseCode" },
    { header: "Expense Name", key: "ExpenseName" },
    { header: "Category ID", key: "ExpenseCategoryID" },
    { header: "HSN Code", key: "HSNCode" },
    { header: "GST Applicable", key: "GSTDisplay" },
    { header: "Default GST %", key: "DefaultGSTPercent" },
    { header: "Is Reimbursable", key: "ReimburseDisplay" },
  ];

  const pushToast = (type, message, ttl = 3500) => {
    const id = Date.now() + Math.random().toString(36).slice(2, 7);
    setToasts((s) => [...s, { id, type, message }]);
    if (ttl > 0) setTimeout(() => setToasts((s) => s.filter((t) => t.id !== id)), ttl);
  };

  const removeToast = (id) => setToasts((s) => s.filter((t) => t.id !== id));

  const expenses = useMemo(() => [
    { ExpenseCode: "EXP-TRVL", ExpenseName: "Travel Expense", ExpenseCategoryID: "CAT-TRAVEL", HSNCode: "9964", GSTApplicable: true, DefaultGSTPercent: 5, IsReimbursable: true },
    { ExpenseCode: "EXP-MEAL", ExpenseName: "Meal / Food Expense", ExpenseCategoryID: "CAT-MEAL", HSNCode: "9963", GSTApplicable: true, DefaultGSTPercent: 18, IsReimbursable: true },
    { ExpenseCode: "EXP-OFCSUP", ExpenseName: "Office Supplies", ExpenseCategoryID: "CAT-OFFICE", HSNCode: "4819", GSTApplicable: true, DefaultGSTPercent: 12, IsReimbursable: false },
    { ExpenseCode: "EXP-MISC", ExpenseName: "Miscellaneous", ExpenseCategoryID: "CAT-MISC", HSNCode: "9997", GSTApplicable: false, DefaultGSTPercent: 0, IsReimbursable: false },
  ], []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return expenses;
    return expenses.filter((item) =>
      Object.values(item).some(val => String(val).toLowerCase().includes(q))
    );
  }, [expenses, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);

  // --- Selection Logic ---
  const toggleRow = (code) => {
    setSelectedRows((prev) => prev.includes(code) ? prev.filter((x) => x !== code) : [...prev, code]);
  };

  const toggleAll = () => {
    const visibleCodes = pageItems.map((c) => c.ExpenseCode);
    const allSelected = visibleCodes.every((code) => selectedRows.includes(code));
    if (allSelected) setSelectedRows((s) => s.filter((code) => !visibleCodes.includes(code)));
    else setSelectedRows((s) => Array.from(new Set([...s, ...visibleCodes])));
  };

  // --- Export Logic Bridge ---
  const handleExport = (type) => {
    const isSelectedMode = selectedRows.length > 0;
    const sourceData = isSelectedMode 
      ? expenses.filter(e => selectedRows.includes(e.ExpenseCode))
      : filtered; // Export either selected or the currently filtered set

    if (sourceData.length === 0) {
      pushToast("error", "No data available to export.");
      return;
    }

    // Format data for the files (convert booleans/nulls)
    const formattedData = sourceData.map(e => ({
      ...e,
      GSTDisplay: e.GSTApplicable ? "Yes" : "No",
      ReimburseDisplay: e.IsReimbursable ? "Yes" : "No",
      DefaultGSTPercent: e.DefaultGSTPercent ?? 0
    }));

    const config = {
      fileName: `Expense_List_${isSelectedMode ? 'Selected' : 'All'}`,
      title: "Expense Master List Report",
      columns: exportColumns,
      rows: formattedData
    };

    if (type === 'excel') exportExcel(config);
    if (type === 'pdf') exportPDF(config);
    if (type === 'print') printTable(config);
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl border border-slate-100 min-h-full">
      <Toasts toasts={toasts} remove={removeToast} />

      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b">
        <h1 className="text-3xl font-bold text-indigo-700">Expense List</h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 border w-full sm:w-80 shadow-inner">
            <Search className="text-slate-400 w-5 h-5" />
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              placeholder="Search expenses..."
              className="bg-transparent outline-none text-sm w-full placeholder:text-slate-400"
            />
          </div>
          <Link to="/expense-master" className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold shadow-md hover:bg-indigo-700 transition transform hover:scale-[1.02]">
            <Plus className="w-4 h-4" /> Add Expense
          </Link>
        </div>
      </div>

      {/* Export Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5 p-3 rounded-lg bg-slate-50 border border-slate-200">
        <div className="text-sm font-medium">
          {selectedRows.length > 0 ? (
            <span className="text-indigo-600">Selected: {selectedRows.length} items</span>
          ) : (
            <span className="text-slate-500">Showing {filtered.length} items</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => handleExport('excel')} className="px-3 py-2 flex items-center gap-2 bg-green-600 text-white rounded-lg text-sm font-medium shadow-md hover:bg-green-700 transition transform hover:scale-[1.02]">
            <FileSpreadsheet className="w-4 h-4" /> Excel
          </button>
          <button onClick={() => handleExport('pdf')} className="px-3 py-2 flex items-center gap-2 bg-red-600 text-white rounded-lg text-sm font-medium shadow-md hover:bg-red-700 transition transform hover:scale-[1.02]">
            <FileText className="w-4 h-4" /> PDF
          </button>
          <button onClick={() => handleExport('print')} className="px-3 py-2 flex items-center gap-2 bg-slate-700 text-white rounded-lg text-sm font-medium shadow-md hover:bg-slate-800 transition transform hover:scale-[1.02]">
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="overflow-x-auto border rounded-xl shadow-lg">
        <table className="min-w-full text-sm table-auto hidden md:table">
          <thead className="bg-blue-900 sticky top-0 border-b">
            <tr className="text-white text-left">
              <th className="px-4 py-3 w-10">
                <input type="checkbox" checked={pageItems.length > 0 && pageItems.every((c) => selectedRows.includes(c.ExpenseCode))} onChange={toggleAll} className="w-4 h-4 rounded" />
              </th>
              <th className="px-4 py-3">Expense Code</th>
              <th className="px-4 py-3">Expense Name</th>
              <th className="px-4 py-3">Category ID</th>
              <th className="px-4 py-3">HSN Code</th>
              <th className="px-4 py-3">GST App.</th>
              <th className="px-4 py-3">GST %</th>
              <th className="px-4 py-3">Reimbursable</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((e) => (
              <tr key={e.ExpenseCode} className={`border-b border-slate-100 transition ${selectedRows.includes(e.ExpenseCode) ? "bg-indigo-50" : "hover:bg-slate-50"}`}>
                <td className="px-4 py-3">
                  <input type="checkbox" checked={selectedRows.includes(e.ExpenseCode)} onChange={() => toggleRow(e.ExpenseCode)} className="w-4 h-4 rounded" />
                </td>
                <td className="px-4 py-3 font-mono text-xs">{e.ExpenseCode}</td>
                <td className="px-4 py-3 font-medium text-slate-700">{e.ExpenseName}</td>
                <td className="px-4 py-3">{e.ExpenseCategoryID}</td>
                <td className="px-4 py-3">{e.HSNCode}</td>
                <td className="px-4 py-3">{e.GSTApplicable ? "Yes" : "No"}</td>
                <td className="px-4 py-3">{e.DefaultGSTPercent}%</td>
                <td className="px-4 py-3">{e.IsReimbursable ? "Yes" : "No"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <button className="p-2 rounded-full hover:bg-slate-200 text-slate-600"><Eye className="w-4 h-4" /></button>
                    <button className="p-2 rounded-full hover:bg-slate-200 text-sky-600"><Edit className="w-4 h-4" /></button>
                    <button className="p-2 rounded-full hover:bg-slate-200 text-rose-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Mobile Card View */}
        <div className="md:hidden p-4 space-y-4">
          {pageItems.map((e) => (
            <div key={e.ExpenseCode} className={`border rounded-xl p-4 shadow-md transition ${selectedRows.includes(e.ExpenseCode) ? "bg-indigo-50 border-indigo-300" : "bg-white border-slate-200"}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 pr-4">
                  <div className="font-semibold text-lg text-indigo-700 truncate">{e.ExpenseName}</div>
                  <div className="text-sm text-slate-500 mt-1">
                    <span className="font-mono text-xs px-2 py-0.5 bg-slate-200 rounded-full">Code: {e.ExpenseCode}</span>
                  </div>
                </div>
                <input type="checkbox" checked={selectedRows.includes(e.ExpenseCode)} onChange={() => toggleRow(e.ExpenseCode)} className="w-5 h-5 rounded" />
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-dashed">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500">HSN / GST %</span>
                  <span className="text-base font-bold text-slate-700">{e.HSNCode} / {e.DefaultGSTPercent}%</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-xs text-slate-500">Reimbursable</span>
                  <span className="text-base font-bold text-slate-700">{e.IsReimbursable ? "Yes" : "No"}</span>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4 pt-3 border-t">
                <button className="p-2 rounded-full hover:bg-slate-200 text-slate-600"><Eye className="w-5 h-5" /></button>
                <button className="p-2 rounded-full hover:bg-slate-200 text-sky-600"><Edit className="w-5 h-5" /></button>
                <button className="p-2 rounded-full hover:bg-slate-200 text-rose-600"><Trash2 className="w-5 h-5" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 p-4 border-t">
        <div className="text-sm text-slate-600">
          Showing {Math.min((page - 1) * perPage + 1, filtered.length)} - {Math.min(page * perPage, filtered.length)} of {filtered.length} total
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-50">Prev</button>
          <div className="px-4 py-2 border border-indigo-500 bg-indigo-50 text-indigo-700 rounded-lg font-semibold">{page} / {totalPages}</div>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-50">Next</button>
        </div>
      </div>
    </div>
  );
}
