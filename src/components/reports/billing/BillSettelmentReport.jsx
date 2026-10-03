import React, { useState, useEffect } from "react";
import {
  Search,
  RotateCcw,
  RefreshCw,
  FileSpreadsheet,
  FileText,
  Printer,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock3,
  XCircle,
  Wallet,
  BadgeIndianRupee,
  ReceiptText,
  PiggyBank,
} from "lucide-react";

import { useToast } from "../../contextapi/ToastContext";
import { useExport } from "../../contextapi/ExportContext";

const ITEMS_PER_PAGE = 10;

const getTodayISO = () => new Date().toISOString().split("T")[0];

const INITIAL_FILTERS = {
  fromDate: getTodayISO(),
  toDate: getTodayISO(),
  status: "All",
  paymentMode: "All",
};

const INITIAL_SUMMARY = {
  totalGross: 0,
  totalDiscount: 0,
  totalGst: 0,
  totalNet: 0,
};

/* ── helpers ── */
const inr = (n) =>
  "\u20B9" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

const formatDate = (d) => {
  if (!d) return "—";
  try {
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return d;
    return dt.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return d;
  }
};

/* ── status config (compact badges) ── */
const STATUS_CONFIG = {
  Paid: {
    icon: <CheckCircle2 className="w-3 h-3" />,
    dot: "bg-emerald-500",
    cls: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  },
  Pending: {
    icon: <Clock3 className="w-3 h-3" />,
    dot: "bg-amber-500",
    cls: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  },
  Cancelled: {
    icon: <XCircle className="w-3 h-3" />,
    dot: "bg-rose-500",
    cls: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200",
  },
};

/* ══════════════════════════════════════════════
   SUMMARY CARD — compact, top-border accent
══════════════════════════════════════════════ */
function SummaryCard({ label, value, count, icon, accent }) {
  const ACCENTS = {
    blue: { border: "#2563EB", bg: "#EFF6FF", icon: "#2563EB" },
    green: { border: "#059669", bg: "#ECFDF5", icon: "#059669" },
    orange: { border: "#D97706", bg: "#FFFBEB", icon: "#D97706" },
    red: { border: "#DC2626", bg: "#FEF2F2", icon: "#DC2626" },
  };
  const a = ACCENTS[accent] || ACCENTS.blue;

  return (
    <div
      className="group bg-white rounded-[12px] border border-[#E2E8F0] px-4 py-3 flex items-center gap-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:shadow-[0_4px_12px_rgba(15,23,42,0.08)] hover:-translate-y-[1px] transition-all duration-150"
      style={{ borderTop: `3px solid ${a.border}` }}
    >
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-150 group-hover:scale-105"
        style={{ backgroundColor: a.bg, color: a.icon }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider leading-none mb-1.5 truncate">
          {label}
        </p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-[18px] font-bold text-[#0F172A] leading-none tabular-nums">
            {value}
          </span>
          {count !== undefined && (
            <span className="text-[10.5px] font-medium text-[#94A3B8] leading-none">
              · {count} bills
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN COMPONENT
   Single source of truth: GET /api/reports/billing/paginated
   — table rows, summary cards, and pagination all come from
   this one response. No other billing report endpoint is called.
══════════════════════════════════════════════ */
export default function BillingReport() {
  const { error, info } = useToast();
  const { exportExcel, exportPDF, printTable } = useExport();

  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(INITIAL_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [billingData, setBillingData] = useState([]);
  const [summary, setSummary] = useState(INITIAL_SUMMARY);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  /* ── single API call: drives table + summary + pagination ── */
  const fetchBillingReport = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        fromDate: appliedFilters.fromDate,
        toDate: appliedFilters.toDate,
        status: appliedFilters.status,
        paymentMode: appliedFilters.paymentMode,
        page: currentPage - 1, // backend pages are 0-indexed
        size: ITEMS_PER_PAGE,
      });

      const response = await fetch(
        `http://localhost:8081/api/reports/billing/paginated?${params.toString()}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch billing report");
      }

      const result = await response.json();
      const page = result.invoicesPage || {};

      // Table rows
      setBillingData(page.content || []);

      // Summary cards
      setSummary({
        totalGross: result.totalGross || 0,
        totalDiscount: result.totalDiscount || 0,
        totalGst: result.totalGst || 0,
        totalNet: result.totalNet || 0,
      });

      // Pagination — synced with backend's own page state
      setTotalPages(Math.max(1, page.totalPages || 1));
      setTotalRecords(page.totalElements || 0);
      if (typeof page.pageNumber === "number") {
        setCurrentPage(page.pageNumber + 1); // back to 1-indexed for the UI
      }
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
      error("Unable to load billing report");
      setBillingData([]);
      setSummary(INITIAL_SUMMARY);
      setTotalPages(1);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  // Every trigger — initial load, Search, filter change, page change —
  // funnels through this one effect, which calls the one paginated API.
  useEffect(() => {
    fetchBillingReport();
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

  // Re-runs the current query without changing filters or page.
  const handleRefresh = () => {
    fetchBillingReport();
  };

  const handleExport = (type) => {
    if (billingData.length === 0) {
      error("No data available to export.");
      return;
    }
    const config = {
      fileName: `Billing_Report_${appliedFilters.fromDate}_to_${appliedFilters.toDate}`,
      title: "Billing Report",
      columns: [
        { key: "invoiceNo", header: "Invoice No" },
        { key: "invoiceDate", header: "Invoice Date" },
        { key: "customerName", header: "Customer Name" },
        { key: "totalGrossAmount", header: "Gross Amount" },
        { key: "totalDiscount", header: "Discount" },
        { key: "totalCgst", header: "CGST" },
        { key: "totalSgst", header: "SGST" },
        { key: "totalIgst", header: "IGST" },
        { key: "finalAmount", header: "Net Amount" },
        { key: "balanceStatus", header: "Payment Status" },
      ],
      rows: billingData.map((row) => ({
        ...row,
        balanceStatus: row.balance?.status,
      })),
    };
    if (type === "excel") exportExcel(config);
    else if (type === "pdf") exportPDF(config);
    else if (type === "print") {
      printTable(config);
      info("Preparing print view…");
    }
  };

  /* ── shared control classes (compact toolbar) ── */
  const inputCls =
    "h-9 rounded-[8px] border border-[#E2E8F0] bg-white px-2.5 text-[13px] text-[#0F172A] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 transition-colors appearance-none";

  const btnBase =
    "h-9 px-3.5 rounded-[8px] text-[12.5px] font-semibold flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";
  const btnPrimary = `${btnBase} bg-[#2563EB] text-white hover:bg-[#1D4ED8]`;
  const btnGhost = `${btnBase} bg-white border border-[#E2E8F0] text-[#334155] hover:bg-[#F8FAFC]`;

  const periodLabel =
    appliedFilters.fromDate === appliedFilters.toDate
      ? formatDate(appliedFilters.fromDate)
      : `${formatDate(appliedFilters.fromDate)} – ${formatDate(appliedFilters.toDate)}`;

  const startRow = totalRecords > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0;
  const endRow = Math.min(currentPage * ITEMS_PER_PAGE, totalRecords);

  /* ══════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#0F172A]">
      {/* ── HEADER: title + period + export, one row ── */}
      <div className="bg-white border-b border-[#E2E8F0] px-5 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[8px] bg-[#EFF6FF] flex items-center justify-center">
            <ReceiptText className="w-4 h-4 text-[#2563EB]" />
          </div>
          <div>
            <div className="flex items-baseline gap-2.5">
              <h1 className="text-[15px] font-bold text-[#0F172A] leading-none">
                Bill Settlement Report
              </h1>
              <span className="text-[11.5px] text-[#64748B] font-medium leading-none">
                {periodLabel}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="relative flex h-1.5 w-1.5">
                {!loading && (
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                )}
                <span
                  className={`relative inline-flex h-1.5 w-1.5 rounded-full ${
                    loading ? "bg-amber-400" : "bg-emerald-500"
                  }`}
                />
              </span>
              <span className="text-[10.5px] text-[#94A3B8] font-medium leading-none">
                {loading
                  ? "Refreshing…"
                  : lastUpdated
                  ? `Updated ${lastUpdated.toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}`
                  : "Not loaded yet"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={() => handleExport("excel")} className={btnGhost}>
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Excel
          </button>
          <button onClick={() => handleExport("pdf")} className={btnGhost}>
            <FileText className="w-3.5 h-3.5 text-rose-600" /> PDF
          </button>
          <button onClick={() => handleExport("print")} className={`${btnPrimary} shadow-sm active:scale-95`}>
            <Printer className="w-3.5 h-3.5" /> Print
          </button>
        </div>
      </div>

      {/* ── SUMMARY CARDS: compact, colored top border ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 px-5 pt-4">
        <SummaryCard
          label="Total Bill Amount"
          value={inr(summary.totalGross)}
          icon={<BadgeIndianRupee className="w-4 h-4" />}
          accent="blue"
        />
        <SummaryCard
          label="Total GST Collected"
          value={inr(summary.totalGst)}
          icon={<PiggyBank className="w-4 h-4" />}
          accent="orange"
        />
        <SummaryCard
          label="Total Discount"
          value={inr(summary.totalDiscount)}
          icon={<Wallet className="w-4 h-4" />}
          accent="red"
        />
        <SummaryCard
          label="Total Net Settlement"
          value={inr(summary.totalNet)}
          count={totalRecords}
          icon={<CheckCircle2 className="w-4 h-4" />}
          accent="green"
        />
      </div>

      {/* ── FILTER TOOLBAR: single compact row ── */}
      <div className="mx-5 mt-3 bg-white rounded-[10px] border border-[#E2E8F0] px-4 py-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="flex flex-wrap items-end gap-2.5">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider">
              From
            </label>
            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) => handleFilterChange("fromDate", e.target.value)}
              className={`${inputCls} w-[140px]`}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider">
              To
            </label>
            <input
              type="date"
              value={filters.toDate}
              onChange={(e) => handleFilterChange("toDate", e.target.value)}
              className={`${inputCls} w-[140px]`}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider">
              Bill Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className={`${inputCls} w-[130px]`}
            >
              <option value="All">All Statuses</option>
              <option>Paid</option>
              <option>Pending</option>
              <option>Cancelled</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider">
              Payment Mode
            </label>
            <select
              value={filters.paymentMode}
              onChange={(e) => handleFilterChange("paymentMode", e.target.value)}
              className={`${inputCls} w-[130px]`}
            >
              <option value="All">All Modes</option>
              <option>Cash</option>
              <option>UPI</option>
              <option>Card</option>
              <option>Bank Transfer</option>
            </select>
          </div>

          <div className="flex-1" />

          <div className="flex gap-2">
            <button onClick={handleSearch} disabled={loading} className={btnPrimary}>
              <Search className="w-3.5 h-3.5" /> Search
            </button>
            <button onClick={handleReset} disabled={loading} className={btnGhost}>
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
            <button onClick={handleRefresh} disabled={loading} className={btnGhost}>
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* ── TABLE: primary focus, dense + sticky header ── */}
      <div className="mx-5 mt-3 mb-5 bg-white rounded-[10px] border border-[#E2E8F0] overflow-hidden shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
        <div className="overflow-x-auto max-h-[64vh]">
          <table className="w-full text-left border-collapse" style={{ minWidth: "1150px" }}>
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#0F172A]">
                {[
                  ["Invoice No", "text-left"],
                  ["Invoice Date", "text-center"],
                  ["Customer Name", "text-left"],
                  ["Gross Amount", "text-right"],
                  ["Discount", "text-right"],
                  ["CGST", "text-right"],
                  ["SGST", "text-right"],
                  ["IGST", "text-right"],
                  ["Net Amount", "text-right"],
                  ["Payment Status", "text-center"],
                ].map(([label, align]) => (
                  <th
                    key={label}
                    className={`px-3.5 py-2.5 text-[10.5px] font-semibold text-white/90 uppercase tracking-wider ${align}`}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                Array.from({ length: 6 }, (_, i) => (
                  <tr key={`skeleton-${i}`} className="border-b border-[#EDF1F5]">
                    {Array.from({ length: 10 }, (_, j) => (
                      <td key={j} className="px-3.5 py-3">
                        <div
                          className="h-3 rounded-full bg-[#EDF1F5] animate-pulse"
                          style={{ width: j === 2 ? "80%" : j === 9 ? "60px" : "70%" }}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              ) : billingData.length > 0 ? (
                billingData.map((row, idx) => {
                  const status = row.balance?.status || "Pending";
                  const sc = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;
                  return (
                    <tr
                      key={row.invoiceNo || row.id}
                      className={`border-b border-[#EDF1F5] transition-colors hover:bg-[#EFF6FF]/70 hover:shadow-[inset_2px_0_0_#2563EB] ${
                        idx % 2 === 1 ? "bg-[#FAFBFC]" : "bg-white"
                      }`}
                    >
                      {/* Invoice No */}
                      <td className="px-3.5 py-2 whitespace-nowrap">
                        <span className="text-[11.5px] font-semibold text-[#334155] bg-[#F1F5F9] px-1.5 py-0.5 rounded-[4px]">
                          {row.invoiceNo}
                        </span>
                      </td>

                      {/* Invoice Date */}
                      <td className="px-3.5 py-2 text-[12.5px] text-[#475569] text-center whitespace-nowrap">
                        {formatDate(row.invoiceDate)}
                      </td>

                      {/* Customer Name */}
                      <td className="px-3.5 py-2 text-[12.5px] font-semibold text-[#0F172A]">
                        {row.customerName}
                      </td>

                      {/* Gross Amount */}
                      <td className="px-3.5 py-2 text-[12.5px] text-right text-[#334155] font-medium tabular-nums">
                        {inr(row.totalGrossAmount)}
                      </td>

                      {/* Discount */}
                      <td className="px-3.5 py-2 text-[12.5px] text-right text-[#DC2626] font-medium tabular-nums">
                        {row.totalDiscount > 0 ? `-${inr(row.totalDiscount)}` : "—"}
                      </td>

                      {/* CGST */}
                      <td className="px-3.5 py-2 text-[12.5px] text-right text-[#2563EB] font-medium tabular-nums">
                        {inr(row.totalCgst)}
                      </td>

                      {/* SGST */}
                      <td className="px-3.5 py-2 text-[12.5px] text-right text-[#2563EB] font-medium tabular-nums">
                        {inr(row.totalSgst)}
                      </td>

                      {/* IGST */}
                      <td className="px-3.5 py-2 text-[12.5px] text-right text-[#2563EB] font-medium tabular-nums">
                        {inr(row.totalIgst)}
                      </td>

                      {/* Net / Final Amount */}
                      <td className="px-3.5 py-2 text-[13px] text-right font-bold text-[#0F172A] tabular-nums">
                        {inr(row.finalAmount)}
                      </td>

                      {/* Payment Status */}
                      <td className="px-3.5 py-2 text-center">
                        <div
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10.5px] font-semibold ${sc.cls}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {status}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-[#F1F5F9] flex items-center justify-center">
                        <ReceiptText className="w-5 h-5 text-[#94A3B8]" />
                      </div>
                      <p className="text-[13px] font-semibold text-[#334155]">
                        No bills found
                      </p>
                      <p className="text-[11.5px] text-[#94A3B8]">
                        Try widening the date range or clearing a filter.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 px-4 py-2.5 border-t border-[#E2E8F0] bg-[#F8FAFC]">
          <span className="text-[11.5px] font-medium text-[#64748B]">
            Showing <span className="text-[#0F172A] font-semibold">{startRow}</span>–
            <span className="text-[#0F172A] font-semibold">{endRow}</span> of{" "}
            <span className="text-[#0F172A] font-semibold">{totalRecords}</span> bills
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1 || loading}
              className="w-7 h-7 flex items-center justify-center rounded-[6px] border border-[#E2E8F0] bg-white text-[#475569] hover:bg-[#F1F5F9] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                disabled={loading}
                className={`w-7 h-7 rounded-[6px] text-[11.5px] font-semibold transition-all disabled:opacity-50 ${
                  currentPage === p
                    ? "bg-[#2563EB] text-white shadow-[0_2px_5px_rgba(37,99,235,0.35)]"
                    : "border border-[#E2E8F0] bg-white text-[#475569] hover:bg-[#F1F5F9]"
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages || loading}
              className="w-7 h-7 flex items-center justify-center rounded-[6px] border border-[#E2E8F0] bg-white text-[#475569] hover:bg-[#F1F5F9] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}