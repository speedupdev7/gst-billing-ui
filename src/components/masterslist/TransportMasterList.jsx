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
  MapPin,
  Mail,
  Phone,
  User,
  Truck,
} from "lucide-react";
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ModeEditIcon from '@mui/icons-material/ModeEdit';

// Global Context Hooks
import { useToast } from "../contextapi/ToastContext";
import { useExport } from "../contextapi/ExportContext";
import { useActions } from "../contextapi/ActionsContext";

export default function TransportMasterList() {
  // Initialize Global Hooks
  const { error, info } = useToast();
  const { exportExcel, exportPDF, printTable } = useExport();
  const { onView, onEdit, onDelete } = useActions();

  const [query, setQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState([]); // Array of TransportNames
  const [onlySelectedExport, setOnlySelectedExport] = useState(false);
  const [perPage] = useState(10);
  const [page, setPage] = useState(1);

  // --- VIEW STATES ---
  const [viewMode, setViewMode] = useState("list"); // "list" or "details"
  const [selectedTransport, setSelectedTransport] = useState(null);

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

  /* ---------------- ACTIONS ---------------- */
  const handleView = (t) => {
    setSelectedTransport(t);
    setViewMode("details");
    if (onView) onView(t);
  };

  /* ---------------- RENDER VIEW: DETAILS PAGE ---------------- */
  if (viewMode === "details" && selectedTransport) {
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
                onClick={() => onEdit(selectedTransport)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-indigo-700 transition"
              >
                <ModeEditIcon sx={{ fontSize: 18 }} /> Edit Transport
              </button>
            </div>
          </div>

          {/* Main Content Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            {/* Banner */}
            <div className="bg-blue-900 p-8 text-white flex items-center gap-6">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-3xl font-black border border-white/30 uppercase">
                {selectedTransport.TransportName?.charAt(0) || "T"}
              </div>
              <div>
                <h1 className="text-3xl font-bold">{selectedTransport.TransportName}</h1>
                <p className="text-blue-200 flex items-center gap-2 mt-1">
                  <Briefcase className="w-4 h-4" /> Transport Profile
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">

              {/* Main Sections */}
              <div className="md:col-span-2 space-y-8">
                <section>
                  <h3 className="text-indigo-900 font-bold text-lg mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-indigo-600 rounded-full"></div> Contact Person
                  </h3>
                  <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-100">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg"><User className="w-5 h-5" /></div>
                    <div>
                      <p className="text-xs text-slate-400">Name</p>
                      <p className="font-bold text-slate-700">{selectedTransport.ContactPerson || "-"}</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-indigo-900 font-bold text-lg mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-indigo-600 rounded-full"></div> Contact & Communication
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-100">
                      <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg"><Phone className="w-5 h-5" /></div>
                      <div>
                        <p className="text-xs text-slate-400">Mobile No</p>
                        <p className="font-bold text-slate-700">{selectedTransport.MobileNo || "-"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-100">
                      <div className="p-3 bg-sky-50 text-sky-600 rounded-lg"><Phone className="w-5 h-5" /></div>
                      <div>
                        <p className="text-xs text-slate-400">Phone No</p>
                        <p className="font-bold text-slate-700">{selectedTransport.PhoneNo || "-"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-100">
                      <div className="p-3 bg-amber-50 text-amber-600 rounded-lg"><Mail className="w-5 h-5" /></div>
                      <div className="min-w-0">
                        <p className="text-xs text-slate-400">Email</p>
                        <p className="font-bold text-indigo-600 underline truncate">{selectedTransport.EmailID || "-"}</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-indigo-900 font-bold text-lg mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-indigo-600 rounded-full"></div> Business Address
                  </h3>
                  <div className="flex gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <MapPin className="w-6 h-6 text-rose-500 mt-1" />
                    <div>
                      <p className="text-slate-700 leading-relaxed font-medium">{selectedTransport.Address}</p>
                      <p className="text-slate-500 mt-1 font-bold">
                        {selectedTransport.City}, State Code {selectedTransport.StateCode} - {selectedTransport.Pincode}
                      </p>
                    </div>
                  </div>
                </section>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl text-white shadow-lg shadow-indigo-200">
                  <Truck className="w-10 h-10 text-indigo-300 mb-6" />
                  <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-1">Transport Type</h4>
                  <p className="text-xl font-bold mb-6">{selectedTransport.IsOwnTransport ? "Own Transport" : "Third Party"}</p>

                  <div className={`flex items-center gap-2 text-[10px] font-bold ${selectedTransport.IsOwnTransport ? "text-emerald-400" : "text-slate-300"}`}>
                    <div className={`w-2 h-2 rounded-full ${selectedTransport.IsOwnTransport ? "bg-emerald-400 animate-pulse" : "bg-slate-300"}`}></div>
                    {selectedTransport.IsOwnTransport ? "OWN FLEET" : "EXTERNAL CARRIER"}
                  </div>
                </div>

                <div className="p-6 border border-slate-100 rounded-2xl bg-white">
                  <h4 className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-tighter">System Info</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Own Transport</span>
                      <span className={`font-bold uppercase ${selectedTransport.IsOwnTransport ? "text-emerald-600" : "text-slate-500"}`}>
                        {selectedTransport.IsOwnTransport ? "Yes" : "No"}
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
              <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Transport Master</h1>
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
                    placeholder="Search by name, contact, city..."
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
                to="/transport-master"
                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-900 text-white rounded-lg text-xs font-semibold hover:bg-blue-800 transition-all shadow-md active:scale-95"
              >
                <Plus className="w-4 h-4" /> Add Transport
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
              Export Selected Only
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
                    checked={pageItems.length > 0 && pageItems.every(t => selectedRows.includes(t.TransportName))}
                    onChange={toggleAll}
                  />
                </th>
                <th className="px-6 py-4 text-center w-20">Sr No</th>
                <th className="px-6 py-4 text-center w-36">Actions</th>
                <th className="px-6 py-4">Transport Details</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4 text-center">Own</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {pageItems.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-400 font-poppins">No transport records found.</td>
                </tr>
              ) : (
                pageItems.map((t, index) => {
                  const isSelected = selectedRows.includes(t.TransportName);
                  return (
                    <tr
                      key={t.TransportName}
                      className={`group transition-colors border-b border-slate-300 ${isSelected ? "bg-indigo-100/60" : "hover:bg-teal-300/50"}`}
                    >
                      <td className="px-6 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRow(t.TransportName)}
                        />
                      </td>
                      <td className="px-6 py-4 text-center text-slate-900 font-medium">
                        {(page - 1) * perPage + index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleView(t)} className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-indigo-600 transition" title="View Details">
                            <VisibilityIcon sx={{ fontSize: 18 }} />
                          </button>
                          <button onClick={() => onEdit(t)} className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-sky-600 transition" title="Edit Transport">
                            <ModeEditIcon sx={{ fontSize: 18 }} />
                          </button>
                          <button onClick={() => onDelete(t)} className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-rose-500 transition" title="Delete Transport">
                            <DeleteIcon sx={{ fontSize: 18 }} />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800 font-poppins">{t.TransportName}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{t.EmailID}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-700 font-medium">{t.ContactPerson}</div>
                        <div className="text-xs text-slate-400">{t.MobileNo}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {t.City}, {t.Pincode}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${t.IsOwnTransport ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                          {t.IsOwnTransport ? "YES" : "NO"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* --- PAGINATION --- */}
        <div className="px-6 py-4 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            Showing <span className="font-bold text-slate-700">{filtered.length === 0 ? 0 : (page - 1) * perPage + 1}</span> to <span className="font-bold text-slate-700">{Math.min(page * perPage, filtered.length)}</span> of <span className="font-bold text-slate-700">{filtered.length}</span> entries
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 border border-slate-200 rounded-md text-xs font-semibold bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Prev
            </button>
            <div className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-xs font-bold">
              {page} / {totalPages}
            </div>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
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