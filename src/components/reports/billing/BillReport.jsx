import React, { useMemo, useState } from "react";
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
  Receipt,
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

/* ── helpers ── */
const inr = (n) =>
  "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2 });

const calcRow = (row) => {
  const taxable = row.grossAmount - row.discount;
  const gstAmount = Math.round(taxable * (row.gstPct / 100));
  const netAmount = taxable + gstAmount;
  return { ...row, gstAmount, netAmount };
};

/* ── status config ── */
const STATUS_CONFIG = {
  Paid: {
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

/* ── mock data ── */
const RAW_DATA = [
  { id: 1,  billNo: "BIL-2024-001", date: "2024-04-20", invoiceNo: "INV-001", customer: "John Doe",        type: "OPD",      grossAmount: 1200,  discount: 100,  gstPct: 5,  status: "Paid",      mode: "UPI" },
  { id: 2,  billNo: "BIL-2024-002", date: "2024-04-20", invoiceNo: "INV-002", customer: "Jane Smith",      type: "IPD",      grossAmount: 45000, discount: 2000, gstPct: 12, status: "Paid",      mode: "Bank Transfer" },
  { id: 3,  billNo: "BIL-2024-003", date: "2024-04-21", invoiceNo: "INV-003", customer: "Robert Brown",    type: "Pharmacy", grossAmount: 850,   discount: 0,    gstPct: 5,  status: "Pending",   mode: "-" },
  { id: 4,  billNo: "BIL-2024-004", date: "2024-04-21", invoiceNo: "INV-004", customer: "Emily Davis",     type: "Lab",      grossAmount: 2500,  discount: 250,  gstPct: 18, status: "Paid",      mode: "Cash" },
  { id: 5,  billNo: "BIL-2024-005", date: "2024-04-22", invoiceNo: "INV-005", customer: "Michael Wilson",  type: "OPD",      grossAmount: 1500,  discount: 0,    gstPct: 5,  status: "Cancelled", mode: "-" },
  { id: 6,  billNo: "BIL-2024-006", date: "2024-04-22", invoiceNo: "INV-006", customer: "Sarah Connor",    type: "IPD",      grossAmount: 12500, discount: 500,  gstPct: 12, status: "Paid",      mode: "Card" },
  { id: 7,  billNo: "BIL-2024-007", date: "2024-04-23", invoiceNo: "INV-007", customer: "Anita Desai",     type: "Lab",      grossAmount: 3200,  discount: 200,  gstPct: 18, status: "Paid",      mode: "UPI" },
  { id: 8,  billNo: "BIL-2024-008", date: "2024-04-23", invoiceNo: "INV-008", customer: "Ravi Mehta",      type: "Pharmacy", grossAmount: 640,   discount: 0,    gstPct: 5,  status: "Pending",   mode: "-" },
  { id: 9,  billNo: "BIL-2024-009", date: "2024-04-24", invoiceNo: "INV-009", customer: "Priya Sharma",    type: "OPD",      grossAmount: 900,   discount: 50,   gstPct: 5,  status: "Paid",      mode: "Cash" },
  { id: 10, billNo: "BIL-2024-010", date: "2024-04-24", invoiceNo: "INV-010", customer: "Suresh Patil",    type: "IPD",      grossAmount: 28000, discount: 1000, gstPct: 12, status: "Pending",   mode: "-" },
  { id: 11, billNo: "BIL-2024-011", date: "2024-04-25", invoiceNo: "INV-011", customer: "Meena Kulkarni",  type: "Lab",      grossAmount: 1800,  discount: 100,  gstPct: 18, status: "Paid",      mode: "UPI" },
  { id: 12, billNo: "BIL-2024-012", date: "2024-04-25", invoiceNo: "INV-012", customer: "Arun Joshi",      type: "Pharmacy", grossAmount: 320,   discount: 0,    gstPct: 5,  status: "Cancelled", mode: "-" },
];

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
══════════════════════════════════════════════ */
export default function BillingReport() {
  const { error, info } = useToast();
  const { exportExcel, exportPDF, printTable } = useExport();

  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(INITIAL_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);

  /* ── filtering + calculation ── */
  const billingData = useMemo(() => {
    return RAW_DATA.filter((row) => {
      const matchStatus =
        appliedFilters.status === "All" || row.status === appliedFilters.status;
      const matchMode =
        appliedFilters.paymentMode === "All" ||
        row.mode === appliedFilters.paymentMode;
      const matchFrom =
        !appliedFilters.fromDate || row.date >= appliedFilters.fromDate;
      const matchTo =
        !appliedFilters.toDate || row.date <= appliedFilters.toDate;
      return matchStatus && matchMode && matchFrom && matchTo;
    }).map(calcRow);
  }, [appliedFilters]);

  /* ── summary totals ── */
  const totals = useMemo(
    () =>
      billingData.reduce(
        (acc, r) => ({
          gross: acc.gross + r.grossAmount,
          discount: acc.discount + r.discount,
          gst: acc.gst + r.gstAmount,
          net: acc.net + r.netAmount,
        }),
        { gross: 0, discount: 0, gst: 0, net: 0 }
      ),
    [billingData]
  );

  /* ── pagination ── */
  const totalPages = Math.max(1, Math.ceil(billingData.length / ITEMS_PER_PAGE));
  const paginatedData = billingData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  /* ── handlers ── */
  const handleFilterChange = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const handleSearch = () => {
    setAppliedFilters(filters);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setFilters(INITIAL_FILTERS);
    setAppliedFilters(INITIAL_FILTERS);
    setCurrentPage(1);
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
        { key: "billNo",      header: "Bill No" },
        { key: "date",        header: "Bill Date" },
        { key: "invoiceNo",   header: "Invoice No" },
        { key: "customer",    header: "Customer Name" },
        { key: "grossAmount", header: "Gross Amount" },
        { key: "discount",    header: "Discount" },
        { key: "gstAmount",   header: "GST Amount" },
        { key: "gstPct",      header: "GST %" },
        { key: "netAmount",   header: "Net Amount" },
        { key: "status",      header: "Payment Status" },
      ],
      rows: billingData,
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
            <Receipt className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">
              Billing Report
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
        <SummaryCard label="Total Gross"    value={inr(totals.gross)}    colorClass="text-slate-800" />
        <SummaryCard label="Total Discount" value={inr(totals.discount)} colorClass="text-rose-600" />
        <SummaryCard label="Total GST"      value={inr(totals.gst)}      colorClass="text-blue-600" />
        <SummaryCard label="Total Net"      value={inr(totals.net)}      colorClass="text-emerald-600" />
      </div>

      {/* ── FILTERS ── */}
      <div className="mx-6 mb-4 bg-white rounded-xl border border-slate-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
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
              <option>Paid</option>
              <option>Pending</option>
              <option>Cancelled</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
              Payment Mode
            </label>
            <select
              value={filters.paymentMode}
              onChange={(e) => handleFilterChange("paymentMode", e.target.value)}
              className={inputCls}
            >
              <option value="All">All Modes</option>
              <option>Cash</option>
              <option>UPI</option>
              <option>Card</option>
              <option>Bank Transfer</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2 mt-4 justify-end">
          <button
            onClick={handleSearch}
            className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition-all active:scale-95 shadow-sm"
          >
            <Search className="w-4 h-4" /> Search
          </button>
          <button
            onClick={handleReset}
            className="h-10 px-5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
        </div>
      </div>

      {/* ── TABLE ── */}
      <div className="mx-6 mb-6 bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" style={{ minWidth: "1050px" }}>
            <thead>
              <tr className="bg-slate-800 text-white">
                {[
                  ["Bill No",         "text-left"],
                  ["Bill Date",       "text-left"],
                  ["Invoice No",      "text-left"],
                  ["Customer Name",   "text-left"],
                  ["Gross Amount",    "text-right"],
                  ["Discount",        "text-right"],
                  ["GST Amount",      "text-right"],
                  ["GST %",           "text-center"],
                  ["Net Amount",      "text-right"],
                  ["Payment Status",  "text-center"],
                ].map(([label, align]) => (
                  <th
                    key={label}
                    className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-widest ${align}`}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {paginatedData.length > 0 ? (
                paginatedData.map((row) => {
                  const sc = STATUS_CONFIG[row.status];
                  return (
                    <tr key={row.id} className="hover:bg-blue-50/40 transition-colors">
                      {/* Bill No */}
                      <td className="px-4 py-3">
                        <span className="text-sm font-bold text-blue-600 tracking-tight">
                          {row.billNo}
                        </span>
                      </td>

                      {/* Bill Date */}
                      <td className="px-4 py-3 text-sm text-slate-600">{row.date}</td>

                      {/* Invoice No */}
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {row.invoiceNo}
                        </span>
                      </td>

                      {/* Customer Name */}
                      <td className="px-4 py-3 text-sm font-semibold text-slate-800">
                        {row.customer}
                        <span className="ml-2 text-[10px] font-medium text-slate-400">
                          {row.type}
                        </span>
                      </td>

                      {/* Gross Amount */}
                      <td className="px-4 py-3 text-sm text-right text-slate-700 font-medium tabular-nums">
                        {inr(row.grossAmount)}
                      </td>

                      {/* Discount */}
                      <td className="px-4 py-3 text-sm text-right text-rose-500 font-medium tabular-nums">
                        {row.discount > 0 ? `-${inr(row.discount)}` : "—"}
                      </td>

                      {/* GST Amount */}
                      <td className="px-4 py-3 text-sm text-right text-blue-600 font-medium tabular-nums">
                        {inr(row.gstAmount)}
                      </td>

                      {/* GST % */}
                      <td className="px-4 py-3 text-center">
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          {row.gstPct}%
                        </span>
                      </td>

                      {/* Net Amount */}
                      <td className="px-4 py-3 text-sm text-right font-bold text-slate-900 tabular-nums">
                        {inr(row.netAmount)}
                      </td>

                      {/* Payment Status */}
                      <td className="px-4 py-3 text-center">
                        <div
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${sc.cls}`}
                        >
                          {sc.icon}
                          {row.status}
                          {row.mode !== "-" && (
                            <span className="text-[10px] opacity-70">· {row.mode}</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="px-6 py-16 text-center text-slate-400 text-sm">
                    No transactions found for the selected filters.
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
              {billingData.length > 0
                ? (currentPage - 1) * ITEMS_PER_PAGE + 1
                : 0}
            </span>{" "}
            –{" "}
            <span className="text-slate-700">
              {Math.min(currentPage * ITEMS_PER_PAGE, billingData.length)}
            </span>{" "}
            of{" "}
            <span className="text-slate-700">{billingData.length}</span> bills
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1 || billingData.length === 0}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                  currentPage === p
                    ? "bg-blue-600 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages || billingData.length === 0}
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