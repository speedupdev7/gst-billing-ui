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

export default function BillingReturnReport() {
  /* ---------------- DATE HELPERS ---------------- */
  const getTodayISODate = () => new Date().toISOString().split("T")[0];

  /* ---------------- FILTER STATE ---------------- */
  const initialFilters = {
    unit: "Main Billing Counter",
    fromDate: getTodayISODate(),
    toDate: getTodayISODate(),
    returnStatus: "All",
    reason: "All",
  };

  const [filters, setFilters] = useState(initialFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  /* ---------------- RETURN DATA ---------------- */
  const rawData = useMemo(
    () => [
      { id: 1, returnNo: "RET-2024-001", origBillNo: "BIL-2024-001", date: "2024-04-20", customer: "John Doe", type: "Pharmacy", returnAmt: 450, taxRefund: 22, reason: "Expired Product", status: "Completed", mode: "Cash" },
      { id: 2, returnNo: "RET-2024-002", origBillNo: "BIL-2024-105", date: "2024-04-20", customer: "Jane Smith", type: "Lab", returnAmt: 1200, taxRefund: 60, reason: "Test Cancelled", status: "Completed", mode: "UPI" },
      { id: 3, returnNo: "RET-2024-003", origBillNo: "BIL-2024-210", date: "2024-04-21", customer: "Robert Brown", type: "OPD", returnAmt: 500, taxRefund: 0, reason: "Doctor Unavailable", status: "Pending", mode: "-" },
      { id: 4, returnNo: "RET-2024-004", origBillNo: "BIL-2024-098", date: "2024-04-21", customer: "Emily Davis", type: "Pharmacy", returnAmt: 150, taxRefund: 8, reason: "Wrong Dosage", status: "Completed", mode: "Wallet" },
      { id: 5, returnNo: "RET-2024-005", origBillNo: "BIL-2024-302", date: "2024-04-22", customer: "Michael Wilson", type: "IPD", returnAmt: 5000, taxRefund: 250, reason: "Admission Cancelled", status: "Completed", mode: "Bank Transfer" },
    ],
    []
  );

  /* ---------------- CALCULATION ---------------- */
  const returnData = useMemo(() => {
    return rawData
      .filter((item) => {
        const matchStatus = filters.returnStatus === "All" || item.status === filters.returnStatus;
        const matchReason = filters.reason === "All" || item.reason === filters.reason;
        return matchStatus && matchReason;
      })
      .map((item) => {
        const totalRefund = item.returnAmt + item.taxRefund;
        return { ...item, totalRefund };
      });
  }, [rawData, filters]);

  /* ---------------- PAGINATION ---------------- */
  const totalPages = Math.ceil(returnData.length / itemsPerPage);
  const paginatedData = returnData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleReset = () => {
    setFilters(initialFilters);
    setCurrentPage(1);
  };

  const inputStyles = "w-full h-11 rounded-xl border border-slate-300 bg-white text-sm px-4 focus:ring-2 focus:ring-blue-500 transition-all outline-none appearance-none cursor-pointer text-slate-700 font-medium";

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 w-full">
      {/* HEADER */}
      <div className="w-full bg-white border-b border-black px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 uppercase">
            Billing <span className="text-rose-600">Return Report</span>
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
              <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Return Status</label>
              <select
                value={filters.returnStatus}
                onChange={(e) => setFilters({ ...filters, returnStatus: e.target.value })}
                className={inputStyles}
              >
                <option>All</option>
                <option>Completed</option>
                <option>Pending</option>
                <option>Rejected</option>
              </select>
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Return Reason</label>
              <select
                value={filters.reason}
                onChange={(e) => setFilters({ ...filters, reason: e.target.value })}
                className={inputStyles}
              >
                <option>All</option>
                <option>Expired Product</option>
                <option>Test Cancelled</option>
                <option>Doctor Unavailable</option>
                <option>Wrong Dosage</option>
              </select>
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">From Date</label>
              <input type="date" value={filters.fromDate} onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })} className={inputStyles} />
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">To Date</label>
              <input type="date" value={filters.toDate} onChange={(e) => setFilters({ ...filters, toDate: e.target.value })} className={inputStyles} />
            </div>
          </div>

          <div className="mt-8 flex flex-col md:flex-row justify-between gap-6 items-center">
            <div className="flex gap-3 w-full md:w-auto">
              <button className="flex-1 md:flex-none h-11 bg-slate-900 hover:bg-black text-white px-10 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all shadow-lg active:scale-95">
                <Search className="w-4 h-4" /> View Returns
              </button>
              <button onClick={handleReset} className="flex-1 md:flex-none h-11 bg-red-50 border border-rose-200 hover:bg-rose-100 text-rose-600 px-8 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all active:scale-95">
                <RotateCcw className="w-4 h-4" /> Reset
              </button>
            </div>

            <div className="flex gap-2 w-full md:w-auto justify-end">
              <button className="flex-1 md:flex-none h-11 px-4 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 flex items-center justify-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Excel
              </button>
              <button className="flex-1 md:flex-none h-11 px-4 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 flex items-center justify-center gap-2">
                <FileText className="w-4 h-4 text-rose-600" /> PDF
              </button>
            </div>
          </div>
        </div>

        {/* DATA TABLE SECTION */}
        <div className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse  min-w-[1100px]">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest border-r border-slate-700">Return Details</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest border-r border-slate-700">Customer</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest border-r border-slate-700">Return Reason</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-right border-r border-slate-700">Base Refund</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-right border-r border-slate-700">Tax Refund</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-right border-r border-slate-700">Total Refund</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-center">Status</th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-black-200 bg-white">
                {paginatedData.length > 0 ? (
                  paginatedData.map((d) => (
                    <tr key={d.id} className="hover:bg-rose-50/30 transition-colors">
                      <td className="px-6 py-4 border-r border-slate-100">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-rose-600 uppercase tracking-tighter">{d.returnNo}</span>
                          <span className="text-[10px] font-bold text-slate-400">On Bill: {d.origBillNo}</span>
                          <span className="text-[10px] text-slate-400">{d.date}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 border-r border-slate-100">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-800">{d.customer}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">{d.type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-600 border-r border-slate-100 italic">
                        "{d.reason}"
                      </td>
                      <td className="px-6 py-4 text-sm text-right border-r border-slate-100">₹{d.returnAmt.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-right text-slate-500 border-r border-slate-100">₹{d.taxRefund.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-right font-black text-rose-700 bg-rose-50/50 border-r border-slate-100">
                        ₹{d.totalRefund.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          d.status === "Completed" ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
                        }`}>
                          {d.status} {d.status === "Completed" && `(${d.mode})`}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-10 text-center text-slate-400 font-medium italic">No return records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">
              Total Returns: <span className="text-rose-600">{returnData.length}</span> records
            </span>

            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || returnData.length === 0}
                className="w-10 h-10 flex items-center justify-center bg-white border border-slate-300 rounded-lg disabled:opacity-30 hover:bg-slate-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="flex items-center px-4 text-xs font-black bg-white border border-slate-300 rounded-lg">{currentPage} / {totalPages || 1}</span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || returnData.length === 0}
                className="w-10 h-10 flex items-center justify-center bg-white border border-slate-300 rounded-lg disabled:opacity-30 hover:bg-slate-50"
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
