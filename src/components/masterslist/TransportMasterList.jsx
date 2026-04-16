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

// Global Context Hooks
import { useToast } from "../contextapi/ToastContext";
import { useExport } from "../contextapi/ExportContext";
import { useActions } from "../contextapi/ActionsContext";

export default function TransportMasterList() {
  const navigate = useNavigate();

  // Initialize Global Hooks
  const { error, info } = useToast();
  const { exportExcel, exportPDF, printTable } = useExport();
  const { onView, onEdit, onDelete } = useActions();

  const [query, setQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState([]); // Array of TransportNames
  const [onlySelectedExport, setOnlySelectedExport] = useState(false);
  const [perPage] = useState(10);
  const [page, setPage] = useState(1);

  /* ---------------- SAMPLE DATA ---------------- */
  const transports = useMemo(
    () => [
      {
        TransportName: "ABC Logistics",
        ContactPerson: "Ramesh",
        MobileNo: "9876543210",
        PhoneNo: "022123456",
        EmailID: "abc@logistics.com",
        Address: "Andheri East",
        City: "Mumbai",
        StateCode: "27",
        Pincode: "400069",
        IsOwnTransport: true,
      },
      {
        TransportName: "Fast Movers",
        ContactPerson: "Suresh",
        MobileNo: "9123456780",
        PhoneNo: "",
        EmailID: "fast@move.com",
        Address: "MIDC Area",
        City: "Pune",
        StateCode: "27",
        Pincode: "411001",
        IsOwnTransport: false,
      },
    ],
    []
  );

  /* ---------------- FILTER LOGIC ---------------- */
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return transports;
    return transports.filter(
      (t) =>
        t.TransportName.toLowerCase().includes(q) ||
        t.ContactPerson.toLowerCase().includes(q) ||
        t.MobileNo.includes(q) ||
        t.City.toLowerCase().includes(q)
    );
  }, [transports, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);

  /* ---------------- SELECTION LOGIC ---------------- */
  const toggleRow = (name) => {
    setSelectedRows((p) =>
      p.includes(name) ? p.filter((x) => x !== name) : [...p, name]
    );
  };

  const toggleAll = () => {
    const visible = pageItems.map((t) => t.TransportName);
    const allVisibleSelected = visible.every((v) => selectedRows.includes(v));
    if (allVisibleSelected) {
      setSelectedRows((prev) => prev.filter((name) => !visible.includes(name)));
    } else {
      setSelectedRows((prev) => Array.from(new Set([...prev, ...visible])));
    }
  };

  /* ---------------- EXPORT LOGIC ---------------- */
  const handleExport = (type) => {
    const sourceData = onlySelectedExport
      ? transports.filter((t) => selectedRows.includes(t.TransportName))
      : filtered;

    if (sourceData.length === 0) {
      error(onlySelectedExport ? "Please select records to export." : "No data available to export.");
      return;
    }

    const config = {
      fileName: "Transport_Master_List",
      title: "Transport Master Report",
      columns: [
        { key: "TransportName", header: "Transport Name" },
        { key: "ContactPerson", header: "Contact Person" },
        { key: "MobileNo", header: "Mobile No" },
        { key: "EmailID", header: "Email" },
        { key: "City", header: "City" },
        { key: "IsOwnTransport", header: "Own Transport" },
      ],
      rows: sourceData.map(item => ({
        ...item,
        IsOwnTransport: item.IsOwnTransport ? "Yes" : "No"
      })),
    };

    if (type === "excel") exportExcel(config);
    else if (type === "pdf") exportPDF(config);
    else if (type === "print") {
      printTable(config);
      info("Opening print dialog...");
    }
  };

  /* ---------------- RENDER ---------------- */
  return (
    <div className="bg-white p-6 rounded-xl shadow-2xl border border-slate-100 min-h-full">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b">
        <h1 className="text-3xl font-bold text-indigo-700">Transport Master</h1>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 border rounded-lg w-full sm:w-72 shadow-inner">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              placeholder="Search transport..."
              className="bg-transparent outline-none text-sm w-full"
            />
          </div>

          <Link
            to="/transport-master"
            className="px-3 py-1.5 bg-blue-900 text-white rounded-sm text-xs font-semibold transition"
          >
            <Plus className="w-3.5 h-3.5" /> Add Transport
          </Link>
        </div>
      </div>

      {/* TOOLBAR SECTION */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5 p-3 rounded-lg bg-slate-50 border border-slate-200">
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <span className="font-semibold">{selectedRows.length} selected</span>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={onlySelectedExport}
              onChange={(e) => setOnlySelectedExport(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300"
            />
            <span>Export Selected Only</span>
          </label>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => handleExport("excel")} className="p-2 sm:px-3 sm:py-2 bg-green-600 text-white rounded-lg text-sm flex items-center gap-2 hover:bg-green-700 transition" title="Export Excel">
            <FileSpreadsheet className="w-4 h-4" /> <span className="hidden sm:inline">Excel</span>
          </button>
          <button onClick={() => handleExport("pdf")} className="p-2 sm:px-3 sm:py-2 bg-red-600 text-white rounded-lg text-sm flex items-center gap-2 hover:bg-red-700 transition" title="Export PDF">
            <FileText className="w-4 h-4" /> <span className="hidden sm:inline">PDF</span>
          </button>
          <button onClick={() => handleExport("print")} className="p-2 sm:px-3 sm:py-2 bg-slate-700 text-white rounded-lg text-sm flex items-center gap-2 hover:bg-slate-800 transition" title="Print Table">
            <Printer className="w-4 h-4" /> <span className="hidden sm:inline">Print</span>
          </button>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="overflow-x-auto border rounded-xl shadow-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-blue-900 text-white sticky top-0">
            <tr>
              <th className="w-10 px-4 py-3 text-center">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-300 text-indigo-600"
                  checked={pageItems.length > 0 && pageItems.every(t => selectedRows.includes(t.TransportName))}
                  onChange={toggleAll} 
                />
              </th>
              <th className="px-4 py-3 text-left">Transport Name</th>
              <th className="px-4 py-3 text-left">Contact</th>
              <th className="px-4 py-3 text-left">Location</th>
              <th className="px-4 py-3 text-center">Own</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {pageItems.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-10 text-slate-400 italic">No transport records found.</td></tr>
            ) : (
              pageItems.map((t) => {
                const isSelected = selectedRows.includes(t.TransportName);
                return (
                  <tr key={t.TransportName} className={`transition-colors ${isSelected ? "bg-indigo-50" : "hover:bg-slate-50"}`}>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleRow(t.TransportName)}
                        className="rounded border-slate-300 text-indigo-600"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-700">{t.TransportName}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{t.EmailID}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-700 font-medium">{t.ContactPerson}</div>
                      <div className="text-xs text-slate-500">{t.MobileNo}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {t.City}, {t.Pincode}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${t.IsOwnTransport ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                        {t.IsOwnTransport ? "YES" : "NO"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => onView(t)} className="p-2 hover:bg-slate-200 rounded-full transition text-slate-600" title="View Detail">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => onEdit(t)} className="p-2 hover:bg-slate-200 rounded-full transition text-sky-600" title="Edit Transport">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => onDelete(t)} className="p-2 hover:bg-slate-200 rounded-full transition text-rose-600" title="Delete Transport">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION SECTION */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t">
        <div className="text-sm text-slate-500">
          Showing {filtered.length === 0 ? 0 : (page - 1) * perPage + 1} to {Math.min(page * perPage, filtered.length)} of {filtered.length} entries
        </div>
        <div className="flex items-center gap-2">
          <button 
            disabled={page === 1} 
            onClick={() => setPage(p => p - 1)} 
            className="px-4 py-2 border rounded-lg hover:bg-slate-50 disabled:opacity-50 transition"
          >
            Prev
          </button>
          <span className="px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg font-bold">
            {page} / {totalPages}
          </span>
          <button 
            disabled={page === totalPages} 
            onClick={() => setPage(p => p + 1)} 
            className="px-4 py-2 border rounded-lg hover:bg-slate-50 disabled:opacity-50 transition"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
