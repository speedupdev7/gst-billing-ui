import React, { useMemo, useState } from "react";
import {
  Search,
  RotateCcw,
  FileSpreadsheet,
  FileText,
  Printer,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Import your global context hooks
import { useToast } from "../../contextapi/ToastContext";
import { useExport } from "../../contextapi/ExportContext";

export default function BillingReport() {
  /* ---------------- HOOKS ---------------- */
  const { error, info } = useToast();
  const { exportExcel, exportPDF, printTable } = useExport();

  /* ---------------- DATE HELPERS ---------------- */
  const getTodayISODate = () => new Date().toISOString().split("T")[0];

  /* ---------------- FILTER STATE ---------------- */
  const initialFilters = {
    unit: "Main Billing Counter",
    fromDate: getTodayISODate(),
    toDate: getTodayISODate(),
    status: "All",
    paymentMode: "All",
  };

  const [filters, setFilters] = useState(initialFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  /* ---------------- BILLING DATA ---------------- */
  const rawData = useMemo(
    () => [
      { id: 1, billNo: "BIL-2024-001", date: "2024-04-20", customer: "John Doe", type: "OPD", amount: 1200, discount: 100, tax: 60, status: "Paid", mode: "UPI" },
      { id: 2, billNo: "BIL-2024-002", date: "2024-04-20", customer: "Jane Smith", type: "IPD", amount: 45000, discount: 2000, tax: 2250, status: "Paid", mode: "Bank Transfer" },
      { id: 3, billNo: "BIL-2024-003", date: "2024-04-21", customer: "Robert Brown", type: "Pharmacy", amount: 850, discount: 0, tax: 42, status: "Pending", mode: "-" },
      { id: 4, billNo: "BIL-2024-004", date: "2024-04-21", customer: "Emily Davis", type: "Lab", amount: 2500, discount: 250, tax: 125, status: "Paid", mode: "Cash" },
      { id: 5, billNo: "BIL-2024-005", date: "2024-04-22", customer: "Michael Wilson", type: "OPD", amount: 1500, discount: 0, tax: 75, status: "Cancelled", mode: "-" },
      { id: 6, billNo: "BIL-2024-006", date: "2024-04-22", customer: "Sarah Connor", type: "IPD", amount: 12500, discount: 500, tax: 625, status: "Paid", mode: "Card" },
    ],
    []
  );

  /* ---------------- FILTERING & CALCULATION ---------------- */
  const billingData = useMemo(() => {
    return rawData
      .filter((item) => {
        const matchStatus = filters.status === "All" || item.status === filters.status;
        const matchMode = filters.paymentMode === "All" || item.mode === filters.paymentMode;
        // Note: Real apps would also filter by date range here
        return matchStatus && matchMode;
      })
      .map((item) => ({
        ...item,
        netAmount: item.amount - item.discount + item.tax,
      }));
  }, [rawData, filters]);

  /* ---------------- PAGINATION ---------------- */
  const totalPages = Math.ceil(billingData.length / itemsPerPage);
  const paginatedData = billingData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleReset = () => {
    setFilters(initialFilters);
    setCurrentPage(1);
  };

  /* ---------------- EXPORT HANDLER ---------------- */
  const handleExport = (type) => {
    if (billingData.length === 0) {
      error("No data available to export.");
      return;
    }

    const config = {
      fileName: `Billing_Report_${filters.fromDate}_to_${filters.toDate}`,
      title: `Billing Report (${filters.unit})`,
      columns: [
        { key: "billNo", header: "Bill No" },
        { key: "date", header: "Date" },
        { key: "customer", header: "Customer Name" },
        { key: "type", header: "Category" },
        { key: "amount", header: "Gross Amt" },
        { key: "discount", header: "Discount" },
        { key: "tax", header: "Tax" },
        { key: "netAmount", header: "Net Amount" },
        { key: "status", header: "Status" },
        { key: "mode", header: "Mode" },
      ],
      rows: billingData,
    };

    if (type === "excel") exportExcel(config);
    else if (type === "pdf") exportPDF(config);
    else if (type === "print") {
      printTable(config);
      info("Preparing print view...");
    }
  };

  /* ---------------- STYLES ---------------- */
  const inputStyles = "w-full h-11 rounded-xl border border-slate-300 bg-white text-sm px-4 focus:ring-2 focus:ring-blue-500 transition-all outline-none appearance-none cursor-pointer text-slate-700 font-medium";

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 w-full">
      {/* HEADER */}
      <div className="w-full bg-white border-b border-black px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 uppercase">
            Billing <span className="text-blue-600">Report</span>
          </h1>
          <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest mt-0.5">
            {filters.unit}
          </p>
        </div>
      </div>

      <div className="w-full">
        {/* FILTER SECTION */}
        <div className="bg-white p-6 border-b border-black">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
            <div className="flex flex-col space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Bill Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className={inputStyles}
              >
                <option>All</option>
                <option>Paid</option>
                <option>Pending</option>
                <option>Cancelled</option>
              </select>
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Payment Mode</label>
              <select
                value={filters.paymentMode}
                onChange={(e) => setFilters({ ...filters, paymentMode: e.target.value })}
                className={inputStyles}
              >
                <option>All</option>
                <option>Cash</option>
                <option>UPI</option>
                <option>Card</option>
                <option>Bank Transfer</option>
              </select>
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">From Date</label>
              <input
                type="date"
                value={filters.fromDate}
                onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
                className={inputStyles}
              />
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">To Date</label>
              <input
                type="date"
                value={filters.toDate}
                onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
                className={inputStyles}
              />
            </div>
          </div>

          <div className="mt-8 flex flex-col md:flex-row justify-between gap-6 items-center">
            <div className="flex gap-3 w-full md:w-auto">
              <button className="flex-1 md:flex-none h-11 bg-blue-600 hover:bg-blue-700 text-white px-10 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all shadow-lg active:scale-95">
                <Search className="w-4 h-4" /> Generate Report
              </button>
              <button
                onClick={handleReset}
                className="flex-1 md:flex-none h-11 bg-red-50 border border-rose-200 hover:bg-rose-100 text-rose-600 px-8 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all active:scale-95"
              >
                <RotateCcw className="w-4 h-4" /> Reset
              </button>
            </div>

            <div className="flex gap-2 w-full md:w-auto justify-end">
              <button 
                onClick={() => handleExport("excel")}
                className="flex-1 md:flex-none h-11 px-4 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Excel
              </button>
              <button 
                onClick={() => handleExport("pdf")}
                className="flex-1 md:flex-none h-11 px-4 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4 text-rose-600" /> PDF
              </button>
              <button 
                onClick={() => handleExport("print")}
                className="flex-1 md:flex-none h-11 px-4 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition-all flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" /> Print
              </button>
            </div>
          </div>
        </div>

        {/* DATA TABLE SECTION */}
        <div className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1100px]">
              <thead>
                <tr className="bg-blue-900 text-white">
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest border-r border-blue-500/50">Bill No</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest border-r border-blue-500/50">Customer Name</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-center border-r border-blue-500/50">Category</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-right border-r border-blue-500/50">Gross Amt</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-right border-r border-blue-500/50">Discount</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-right border-r border-blue-500/50">Tax</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-right border-r border-blue-500/50">Net Amount</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-center">Payment Status</th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-black-200 bg-white">
                {paginatedData.length > 0 ? (
                  paginatedData.map((d) => (
                    <tr key={d.id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="px-6 py-4 border-r border-slate-100">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-blue-600 uppercase tracking-tighter">{d.billNo}</span>
                          <span className="text-[10px] font-bold text-slate-400">{d.date}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-800 border-r border-slate-100">{d.customer}</td>
                      <td className="px-6 py-4 text-sm text-center font-semibold text-slate-500 border-r border-slate-100">{d.type}</td>
                      <td className="px-6 py-4 text-sm text-right border-r border-slate-100">₹{d.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-right text-rose-500 border-r border-slate-100">-₹{d.discount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-right text-slate-500 border-r border-slate-100">+₹{d.tax.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-right font-black text-blue-700 bg-blue-50/20 border-r border-slate-100">
                        ₹{d.netAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          d.status === "Paid" ? "bg-emerald-100 text-emerald-600" : 
                          d.status === "Pending" ? "bg-amber-100 text-amber-600" : "bg-rose-100 text-rose-600"
                        }`}>
                          {d.status} {d.status === "Paid" && `(${d.mode})`}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-10 text-center text-slate-400 font-medium ">No transactions found for selected filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">
              Showing <span className="text-slate-900">{billingData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to <span className="text-slate-900">{Math.min(currentPage * itemsPerPage, billingData.length)}</span> of <span className="text-slate-900">{billingData.length}</span> bills
            </span>

            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || billingData.length === 0}
                className="w-10 h-10 flex items-center justify-center bg-white border border-slate-300 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded-lg text-xs font-black transition-all ${currentPage === i + 1
                      ? "bg-blue-600 text-white"
                      : "bg-white border border-slate-300 text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || billingData.length === 0}
                className="w-10 h-10 flex items-center justify-center bg-white border border-slate-300 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
