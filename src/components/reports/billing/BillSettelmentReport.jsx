import React, { useState, useEffect } from "react";
import {
  Search,
  RotateCcw,
  FileSpreadsheet,
  FileText,
  Printer,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  XCircle,
  Wallet,
} from "lucide-react";

import { useToast } from "../../contextapi/ToastContext";
import { useExport } from "../../contextapi/ExportContext";

const ITEMS_PER_PAGE = 10;

const getTodayISO = () => new Date().toISOString().split("T")[0];

const INITIAL_FILTERS = {
  fromDate: getTodayISO(),
  toDate: getTodayISO(),
  status: "All",
};

const INITIAL_SUMMARY = {
  totalBillAmount: 0,
  totalPaidAmount: 0,
  totalSettlementAmount: 0,
  totalPendingAmount: 0,
};

/* ── helpers ── */
const inr = (n) =>
  "₹" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

/* ── status config ── */
const STATUS_CONFIG = {
  Settled: {
    icon: <CheckCircle className="w-3 h-3" />,
    cls: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  Pending: {
    icon: <Clock className="w-3 h-3" />,
    cls: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  Cancelled: {
    icon: <XCircle className="w-3 h-3" />,
    cls: "bg-rose-50 text-rose-700 border border-rose-200",
  },
};

/* ══════════════════════════════════════════════
   SUMMARY CARD
══════════════════════════════════════════════ */
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

/* ══════════════════════════════════════════════
   MAIN COMPONENT
   Single source of truth: GET /api/invoice/settlements/report
   — table rows (`entries`), summary cards (`totals`), and
   pagination all come from this one response. No other bill
   settlement endpoint is called.
══════════════════════════════════════════════ */
export default function BillSettlementReport() {
  const { error, info } = useToast();
  const { exportExcel, exportPDF, printTable } = useExport();

  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(INITIAL_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [settlementData, setSettlementData] = useState([]);
  const [summary, setSummary] = useState(INITIAL_SUMMARY);
  const [loading, setLoading] = useState(false);

  /* ── single API call: drives table + summary + pagination ── */
  const fetchSettlementReport = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        fromDate: appliedFilters.fromDate,
        toDate: appliedFilters.toDate,
        status: appliedFilters.status,
        page: currentPage - 1, // backend pages are 0-indexed
        size: ITEMS_PER_PAGE,
      });

      const response = await fetch(
        `http://localhost:8081/api/invoice/settlements/report?${params.toString()}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch bill settlement report");
      }

      const result = await response.json();
      const totals = result.totals || {};

      // Table rows
      setSettlementData(result.entries || []);

      // Summary cards
      setSummary({
        totalBillAmount: totals.totalBillAmount || 0,
        totalPaidAmount: totals.totalPaidAmount || 0,
        totalSettlementAmount: totals.totalSettlementAmount || 0,
        totalPendingAmount: totals.totalPendingAmount || 0,
      });

      // Pagination — synced with backend's own page state
      setTotalPages(Math.max(1, result.totalPages || 1));
      setTotalRecords(result.totalElements || 0);
      if (typeof result.pageNumber === "number") {
        setCurrentPage(result.pageNumber + 1); // back to 1-indexed for the UI
      }
    } catch (err) {
      console.error(err);
      error("Unable to load bill settlement report");
      setSettlementData([]);
      setSummary(INITIAL_SUMMARY);
      setTotalPages(1);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  // Every trigger — initial load, Search, filter change, page change —
  // funnels through this one effect, which calls the one report API.
  useEffect(() => {
    fetchSettlementReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedFilters, currentPage]);

  /* ── handlers ── */
  const handleFilterChange = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  // Search only applies the filters - the useEffect above triggers the fetch.
  const handleSearch = () => {
    setCurrentPage(1);
    setAppliedFilters(filters);
  };

  const handleReset = () => {
    setFilters(INITIAL_FILTERS);
    setCurrentPage(1);
    setAppliedFilters(INITIAL_FILTERS);
  };

  const handleExport = (type) => {
    if (settlementData.length === 0) {
      error("No data available to export.");
      return;
    }
    const config = {
      fileName: `Bill_Settlement_Report_${appliedFilters.fromDate}_to_${appliedFilters.toDate}`,
      title: "Bill Settlement Report",
      columns: [
        { key: "settlementId", header: "Settlement ID" },
        { key: "settlementDate", header: "Date" },
        { key: "customerName", header: "Customer Name" },
        { key: "city", header: "City" },
        { key: "mobileNo", header: "Mobile No" },
        { key: "billNo", header: "Bill No" },
        { key: "billDate", header: "Bill Date" },
        { key: "billAmount", header: "Bill Amt" },
        { key: "discountAmount", header: "Disc. Amt" },
        { key: "finalAmount", header: "Final Amt" },
        { key: "paidAmount", header: "Paid Amt" },
        { key: "pendingAmount", header: "Pending Amt" },
        { key: "settlementAmount", header: "Settlement Amt" },
        { key: "currentPending", header: "Current Pending" },
        { key: "deliveryDate", header: "Delivery Date" },
        { key: "billStatus", header: "Bill Status" },
      ],
      rows: settlementData,
    };
    if (type === "excel") exportExcel(config);
    else if (type === "pdf") exportPDF(config);
    else if (type === "print") {
      printTable(config);
      info("Preparing print view…");
    }
  };

  /* ── shared input class ── */
  const inputCls =
    "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all appearance-none";

  /* ══════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* ── HEADER ── */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">
              Bill Settlement Report
            </h1>
            <p className="text-[11px] text-slate-400 font-medium uppercase tracking-widest">
              Main Billing Counter
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleExport("excel")}
            className="h-9 px-4 rounded-lg border border-slate-200 bg-white text-slate-600 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> Excel
          </button>
          <button
            onClick={() => handleExport("pdf")}
            className="h-9 px-4 rounded-lg border border-slate-200 bg-white text-slate-600 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5 transition-all"
          >
            <FileText className="w-4 h-4 text-rose-500" /> PDF
          </button>
          <button
            onClick={() => handleExport("print")}
            className="h-9 px-4 rounded-lg bg-slate-800 text-white text-xs font-semibold hover:bg-slate-900 flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </div>

      {/* ── SUMMARY CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 px-6 py-4">
        <SummaryCard
          label="Total Bill Amt"
          value={inr(summary.totalBillAmount)}
          colorClass="text-slate-800"
        />
        <SummaryCard
          label="Total Paid Amt"
          value={inr(summary.totalPaidAmount)}
          colorClass="text-emerald-600"
        />
        <SummaryCard
          label="Total Settlement Amt"
          value={inr(summary.totalSettlementAmount)}
          colorClass="text-blue-600"
        />
        <SummaryCard
          label="Current Pending"
          value={inr(summary.totalPendingAmount)}
          colorClass="text-rose-600"
        />
      </div>

      {/* ── FILTERS ── */}
      <div className="mx-6 mb-4 bg-white rounded-xl border border-slate-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
              From Date
            </label>
            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) => handleFilterChange("fromDate", e.target.value)}
              className={inputCls}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
              To Date
            </label>
            <input
              type="date"
              value={filters.toDate}
              onChange={(e) => handleFilterChange("toDate", e.target.value)}
              className={inputCls}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
              Bill Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className={inputCls}
            >
              <option value="All">All Statuses</option>
              <option>Settled</option>
              <option>Pending</option>
              <option>Cancelled</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2 mt-4 justify-end">
          <button
            onClick={handleSearch}
            disabled={loading}
            className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition-all active:scale-95 shadow-sm disabled:opacity-60"
          >
            <Search className="w-4 h-4" /> Search
          </button>
          <button
            onClick={handleReset}
            disabled={loading}
            className="h-10 px-5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-60"
          >
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
        </div>
      </div>

      {/* ── TABLE ── */}
      <div className="mx-6 mb-6 bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table
            className="w-full text-left border-collapse"
            style={{ minWidth: "1900px" }}
          >
            <thead>
              <tr className="bg-slate-800 text-white">
                {[
                  ["Settlement ID", "text-left"],
                  ["Date", "text-left"],
                  ["Customer Name", "text-left"],
                  ["City", "text-left"],
                  ["Mobile No", "text-left"],
                  ["Bill No", "text-left"],
                  ["Bill Date", "text-left"],
                  ["Bill Amt", "text-right"],
                  ["Disc. Amt", "text-right"],
                  ["Final Amt", "text-right"],
                  ["Paid Amt", "text-right"],
                  ["Pending Amt", "text-right"],
                  ["Settlement Amt", "text-right"],
                  ["Current Pending", "text-right"],
                  ["Delivery Date", "text-left"],
                  ["Bill Status", "text-center"],
                ].map(([label, align]) => (
                  <th
                    key={label}
                    className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-widest whitespace-nowrap ${align}`}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={16}
                    className="px-6 py-16 text-center text-slate-400 text-sm"
                  >
                    Loading bill settlement report…
                  </td>
                </tr>
              ) : settlementData.length > 0 ? (
                settlementData.map((row) => {
                  const status = row.billStatus || "Pending";
                  const sc = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;
                  return (
                    <tr
                      key={row.settlementId || row.id}
                      className="hover:bg-blue-50/40 transition-colors"
                    >
                      {/* Settlement ID */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {row.settlementId}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                        {row.settlementDate}
                      </td>

                      {/* Customer Name */}
                      <td className="px-4 py-3 text-sm font-semibold text-slate-800 whitespace-nowrap">
                        {row.customerName}
                      </td>

                      {/* City */}
                      <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                        {row.city}
                      </td>

                      {/* Mobile No */}
                      <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                        {row.mobileNo}
                      </td>

                      {/* Bill No */}
                      <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                        {row.billNo}
                      </td>

                      {/* Bill Date */}
                      <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                        {row.billDate}
                      </td>

                      {/* Bill Amt */}
                      <td className="px-4 py-3 text-sm text-right text-slate-700 font-medium tabular-nums whitespace-nowrap">
                        {inr(row.billAmount)}
                      </td>

                      {/* Disc. Amt */}
                      <td className="px-4 py-3 text-sm text-right text-rose-500 font-medium tabular-nums whitespace-nowrap">
                        {row.discountAmount > 0
                          ? `-${inr(row.discountAmount)}`
                          : "—"}
                      </td>

                      {/* Final Amt */}
                      <td className="px-4 py-3 text-sm text-right font-bold text-slate-900 tabular-nums whitespace-nowrap">
                        {inr(row.finalAmount)}
                      </td>

                      {/* Paid Amt */}
                      <td className="px-4 py-3 text-sm text-right text-emerald-600 font-medium tabular-nums whitespace-nowrap">
                        {inr(row.paidAmount)}
                      </td>

                      {/* Pending Amt */}
                      <td className="px-4 py-3 text-sm text-right text-amber-600 font-medium tabular-nums whitespace-nowrap">
                        {inr(row.pendingAmount)}
                      </td>

                      {/* Settlement Amt */}
                      <td className="px-4 py-3 text-sm text-right text-blue-600 font-medium tabular-nums whitespace-nowrap">
                        {inr(row.settlementAmount)}
                      </td>

                      {/* Current Pending */}
                      <td className="px-4 py-3 text-sm text-right text-rose-600 font-semibold tabular-nums whitespace-nowrap">
                        {inr(row.currentPending)}
                      </td>

                      {/* Delivery Date */}
                      <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                        {row.deliveryDate}
                      </td>

                      {/* Bill Status */}
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <div
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${sc.cls}`}
                        >
                          {sc.icon}
                          {status}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={16}
                    className="px-6 py-16 text-center text-slate-400 text-sm"
                  >
                    No settlements found for the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 border-t border-slate-100 bg-slate-50">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Showing{" "}
            <span className="text-slate-700">
              {totalRecords > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}
            </span>{" "}
            –{" "}
            <span className="text-slate-700">
              {Math.min(currentPage * ITEMS_PER_PAGE, totalRecords)}
            </span>{" "}
            of <span className="text-slate-700">{totalRecords}</span> settlements
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1 || loading}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                disabled={loading}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all disabled:opacity-50 ${
                  currentPage === p
                    ? "bg-blue-600 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(p + 1, totalPages))
              }
              disabled={currentPage === totalPages || loading}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}