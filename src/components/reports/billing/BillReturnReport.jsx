import React, { useMemo, useState } from "react";
import {
  Search,
  RotateCcw,
  FileSpreadsheet,
  FileText,
  Printer,
  ChevronLeft,
  ChevronRight,
  Undo2,
} from "lucide-react";

import { useToast } from "../../contextapi/ToastContext";
import { useExport } from "../../contextapi/ExportContext";

const ITEMS_PER_PAGE = 10;

const getTodayISO = () => new Date().toISOString().split("T")[0];

const inr = (n) =>
  "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2 });

function SummaryCard({ label, value, colorClass }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
        {label}
      </p>
      <p className={`text-xl font-bold ${colorClass}`}>{value}</p>
    </div>
  );
}

export default function BillingReturnReport() {
  const { error, info } = useToast();
  const { exportExcel, exportPDF, printTable } = useExport();

  const initialFilters = {
    unit: "Main Billing Counter",
    fromDate: getTodayISO(),
    toDate: getTodayISO(),
    returnStatus: "All",
    reason: "All",
  };

  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [currentPage, setCurrentPage] = useState(1);

  const RAW_DATA = useMemo(
    () => [
      { id: 1, returnNo: "RET-2024-001", origBillNo: "BIL-2024-001", date: "2024-04-20", customer: "John Doe", type: "Pharmacy", returnAmt: 450, taxRefund: 22, reason: "Expired Product", status: "Completed", mode: "Cash" },
      { id: 2, returnNo: "RET-2024-002", origBillNo: "BIL-2024-105", date: "2024-04-20", customer: "Jane Smith", type: "Lab", returnAmt: 1200, taxRefund: 60, reason: "Test Cancelled", status: "Completed", mode: "UPI" },
      { id: 3, returnNo: "RET-2024-003", origBillNo: "BIL-2024-210", date: "2024-04-21", customer: "Robert Brown", type: "OPD", returnAmt: 500, taxRefund: 0, reason: "Doctor Unavailable", status: "Pending", mode: "-" },
      { id: 4, returnNo: "RET-2024-004", origBillNo: "BIL-2024-098", date: "2024-04-21", customer: "Emily Davis", type: "Pharmacy", returnAmt: 150, taxRefund: 8, reason: "Wrong Dosage", status: "Completed", mode: "Wallet" },
      { id: 5, returnNo: "RET-2024-005", origBillNo: "BIL-2024-302", date: "2024-04-22", customer: "Michael Wilson", type: "IPD", returnAmt: 5000, taxRefund: 250, reason: "Admission Cancelled", status: "Completed", mode: "Bank Transfer" },
    ],
    []
  );

  const returnData = useMemo(() => {
    return RAW_DATA.filter((item) => {
      const matchStatus = appliedFilters.returnStatus === "All" || item.status === appliedFilters.returnStatus;
      const matchReason = appliedFilters.reason === "All" || item.reason === appliedFilters.reason;
      const matchFrom = !appliedFilters.fromDate || item.date >= appliedFilters.fromDate;
      const matchTo = !appliedFilters.toDate || item.date <= appliedFilters.toDate;
      return matchStatus && matchReason && matchFrom && matchTo;
    }).map((item) => ({ ...item, totalRefund: item.returnAmt + item.taxRefund }));
  }, [RAW_DATA, appliedFilters]);

  const totals = useMemo(
    () =>
      returnData.reduce(
        (acc, r) => ({ base: acc.base + r.returnAmt, tax: acc.tax + r.taxRefund, total: acc.total + r.totalRefund }),
        { base: 0, tax: 0, total: 0 }
      ),
    [returnData]
  );

  const totalPages = Math.max(1, Math.ceil(returnData.length / ITEMS_PER_PAGE));
  const paginatedData = returnData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleFilterChange = (key, value) => setFilters((p) => ({ ...p, [key]: value }));

  const handleSearch = () => {
    setAppliedFilters(filters);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
    setCurrentPage(1);
  };

  const handleExport = (type) => {
    if (returnData.length === 0) {
      error("No data available to export.");
      return;
    }
    const config = {
      fileName: `Return_Report_${appliedFilters.fromDate}_to_${appliedFilters.toDate}`,
      title: "Return Report",
      columns: [
        { key: "returnNo", header: "Return No" },
        { key: "origBillNo", header: "Original Bill" },
        { key: "date", header: "Date" },
        { key: "customer", header: "Customer" },
        { key: "returnAmt", header: "Base Refund" },
        { key: "taxRefund", header: "Tax Refund" },
        { key: "totalRefund", header: "Total Refund" },
        { key: "status", header: "Status" },
      ],
      rows: returnData,
    };
    if (type === "excel") exportExcel(config);
    else if (type === "pdf") exportPDF(config);
    else if (type === "print") {
      printTable(config);
      info("Preparing print view…");
    }
  };

  const inputCls =
    "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all appearance-none";

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">

      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center">
            <Undo2 className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">Billing Return Report</h1>
            <p className="text-[11px] text-slate-400 font-medium uppercase tracking-widest">{filters.unit}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={() => handleExport("excel")} className="h-9 px-4 rounded-lg border border-slate-200 bg-white text-slate-600 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5 transition-all">
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> Excel
          </button>
          <button onClick={() => handleExport("pdf")} className="h-9 px-4 rounded-lg border border-slate-200 bg-white text-slate-600 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5 transition-all">
            <FileText className="w-4 h-4 text-rose-500" /> PDF
          </button>
          <button onClick={() => handleExport("print")} className="h-9 px-4 rounded-lg bg-slate-800 text-white text-xs font-semibold hover:bg-slate-900 flex items-center gap-1.5 transition-all">
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 px-6 py-4">
        <SummaryCard label="Total Base" value={inr(totals.base)} colorClass="text-slate-800" />
        <SummaryCard label="Total Tax" value={inr(totals.tax)} colorClass="text-rose-600" />
        <SummaryCard label="Total Refund" value={inr(totals.total)} colorClass="text-rose-700" />
        <div />
      </div>

      <div className="mx-6 mb-4 bg-white rounded-xl border border-slate-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Return Status</label>
            <select value={filters.returnStatus} onChange={(e) => handleFilterChange("returnStatus", e.target.value)} className={inputCls}>
              <option>All</option>
              <option>Completed</option>
              <option>Pending</option>
              <option>Rejected</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Return Reason</label>
            <select value={filters.reason} onChange={(e) => handleFilterChange("reason", e.target.value)} className={inputCls}>
              <option>All</option>
              <option>Expired Product</option>
              <option>Test Cancelled</option>
              <option>Doctor Unavailable</option>
              <option>Wrong Dosage</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">From Date</label>
            <input type="date" value={filters.fromDate} onChange={(e) => handleFilterChange("fromDate", e.target.value)} className={inputCls} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">To Date</label>
            <input type="date" value={filters.toDate} onChange={(e) => handleFilterChange("toDate", e.target.value)} className={inputCls} />
          </div>
        </div>

        <div className="flex gap-2 mt-4 justify-end">
          <button onClick={handleSearch} className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition-all active:scale-95 shadow-sm">
            <Search className="w-4 h-4" /> Search
          </button>
          <button onClick={handleReset} className="h-10 px-5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all active:scale-95">
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
        </div>
      </div>

      <div className="mx-6 mb-6 bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" style={{ minWidth: "1050px" }}>
            <thead>
              <tr className="bg-slate-800 text-white">
                {[
                  ["Return No", "text-left"],
                  ["Original Bill", "text-left"],
                  ["Return Date", "text-left"],
                  ["Customer", "text-left"],
                  ["Base Refund", "text-right"],
                  ["Tax Refund", "text-right"],
                  ["Total Refund", "text-right"],
                  ["Status", "text-center"],
                ].map(([label, align]) => (
                  <th key={label} className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-widest ${align}`}>
                    {label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {paginatedData.length > 0 ? (
                paginatedData.map((d) => (
                  <tr key={d.id} className="hover:bg-rose-50/30 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-sm font-bold text-rose-600 tracking-tight">{d.returnNo}</span>
                      <div className="text-[10px] text-slate-400">{d.date}</div>
                    </td>

                    <td className="px-4 py-3 text-sm text-slate-600">{d.origBillNo}</td>

                    <td className="px-4 py-3 text-sm font-semibold text-slate-800">{d.type}</td>

                    <td className="px-4 py-3 text-sm font-semibold text-slate-800">{d.customer}</td>

                    <td className="px-4 py-3 text-sm text-right text-slate-700 font-medium tabular-nums">{inr(d.returnAmt)}</td>

                    <td className="px-4 py-3 text-sm text-right text-slate-500 font-medium tabular-nums">{inr(d.taxRefund)}</td>

                    <td className="px-4 py-3 text-sm text-right font-bold text-rose-700 tabular-nums">{inr(d.totalRefund)}</td>

                    <td className="px-4 py-3 text-center">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                        d.status === "Completed" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>
                        {d.status}
                        {d.mode !== "-" && <span className="text-[10px] opacity-70">· {d.mode}</span>}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-slate-400 text-sm">No return records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 border-t border-slate-100 bg-slate-50">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Showing{' '}
            <span className="text-slate-700">{returnData.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}</span>
            {' '}–{' '}
            <span className="text-slate-700">{Math.min(currentPage * ITEMS_PER_PAGE, returnData.length)}</span>
            {' '}of{' '}
            <span className="text-slate-700">{returnData.length}</span> returns
          </span>

          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1 || returnData.length === 0} className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setCurrentPage(p)} className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === p ? "bg-blue-600 text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"}`}>
                {p}
              </button>
            ))}

            <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages || returnData.length === 0} className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
