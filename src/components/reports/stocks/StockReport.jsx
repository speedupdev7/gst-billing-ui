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

export default function StockReport() {
  /* ---------------- DATE HELPER ---------------- */
  const getTodayDate = () => new Date().toISOString().split("T")[0];

  const getTodayISODate = () => {
    return new Date().toISOString().split("T")[0];
  };

  // DD/MM/YYYY → YYYY-MM-DD
  const toISODate = (ddmmyyyy) => {
    const [dd, mm, yyyy] = ddmmyyyy.split("/");
    if (!dd || !mm || !yyyy) return "";
    return `${yyyy}-${mm}-${dd}`;
  };

  // YYYY-MM-DD → DD/MM/YYYY
  const toDDMMYYYY = (iso) => {
    if (!iso) return "";
    const [yyyy, mm, dd] = iso.split("-");
    return `${dd}/${mm}/${yyyy}`;
  };

  /* ---------------- FILTER STATE ---------------- */
  const initialFilters = {
    unit: "Main Warehouse",
    fromDate: getTodayISODate(),
    toDate: getTodayISODate(),
    supplier: "All",
    category: "All",
  };

  const [filters, setFilters] = useState(initialFilters);
  const [datefilters, setDateFilters] = useState({
    fromDate: "",
    toDate: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  /* ---------------- STOCK DATA ---------------- */
  const rawData = useMemo(
    () => [
      { id: 1, itemName: "ECG Machine", category: "Medical Equipment", unit: "Nos", openingStock: 2, inwardQty: 1, outwardQty: 0, rate: 85000 },
      { id: 2, itemName: "Office Chair", category: "Furniture", unit: "Nos", openingStock: 15, inwardQty: 10, outwardQty: 5, rate: 3500 },
      { id: 3, itemName: "Dell Monitor", category: "IT Hardware", unit: "Nos", openingStock: 8, inwardQty: 5, outwardQty: 6, rate: 12000 },
      { id: 4, itemName: "Laser Printer", category: "IT Hardware", unit: "Nos", openingStock: 4, inwardQty: 2, outwardQty: 1, rate: 18500 },
      { id: 5, itemName: "Meeting Table", category: "Furniture", unit: "Nos", openingStock: 1, inwardQty: 1, outwardQty: 0, rate: 15000 },
      { id: 6, itemName: "Stethoscope", category: "Medical Equipment", unit: "Nos", openingStock: 20, inwardQty: 5, outwardQty: 2, rate: 2500 },
      { id: 7, itemName: "Surgical Gloves", category: "Medical Equipment", unit: "Box", openingStock: 50, inwardQty: 20, outwardQty: 15, rate: 450 },
    ],
    []
  );

  /* ---------------- STOCK CALCULATION ---------------- */
  const stockData = useMemo(() => {
    return rawData
      .filter((item) => {
        const matchCategory = filters.category === "All" || item.category === filters.category;
        return matchCategory;
      })
      .map((item) => {
        const closingStock = item.openingStock + item.inwardQty - item.outwardQty;
        return {
          ...item,
          closingStock,
          stockValue: closingStock * item.rate,
        };
      });
  }, [rawData, filters]);

  /* ---------------- PAGINATION ---------------- */
  const totalPages = Math.ceil(stockData.length / itemsPerPage);
  const paginatedData = stockData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleReset = () => {
    setFilters(initialFilters);
    setCurrentPage(1);
  };

  /* ---------------- STYLES ---------------- */
  const inputStyles = "w-full h-11 rounded-xl border border-slate-300 bg-white text-sm px-4 focus:ring-2 focus:ring-blue-500 transition-all outline-none appearance-none cursor-pointer text-slate-700 font-medium";

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 w-full">
      {/* HEADER */}
      <div className="w-full bg-white border-b border-black px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 uppercase">
            Current Stock <span className="text-blue-600">Report</span>
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
              <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Supplier</label>
              <select
                value={filters.supplier}
                onChange={(e) => setFilters({ ...filters, supplier: e.target.value })}
                className={inputStyles}
              >
                <option>All</option>
                <option>ABC Medical Suppliers</option>
                <option>XYZ Traders</option>
                <option>Global Tech</option>
              </select>
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className={inputStyles}
              >
                <option>All</option>
                <option>Medical Equipment</option>
                <option>Furniture</option>
                <option>IT Hardware</option>
              </select>
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">
                From Date
              </label>

              <input
                type="text"
                placeholder="DD/MM/YYYY"
                value={filters.fromDate}
                onChange={(e) => {
                  const value = e.target.value;
                  setFilters({ ...filters, fromDate: value });
                }}
                className={inputStyles}
              />
            </div>


            <div className="flex flex-col space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">
                To Date
              </label>

              <input
                type="text"
                placeholder="DD/MM/YYYY"
                value={filters.toDate}
                onChange={(e) => {
                  const value = e.target.value;
                  setFilters({ ...filters, toDate: value });
                }}
                className={inputStyles}
              />
            </div>

          </div>

          <div className="mt-8 flex flex-col md:flex-row justify-between gap-6 items-center">
            <div className="flex gap-3 w-full md:w-auto">
              <button className="flex-1 md:flex-none h-11 bg-blue-600 hover:bg-blue-700 text-white px-10 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all shadow-lg active:scale-95">
                <Search className="w-4 h-4" /> Search
              </button>

              <button onClick={handleReset} className="w-11 h-11 bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center transition-all active:scale-95">
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={handleReset}
                className="flex-1 md:flex-none h-11 bg-red-50 border border-rose-200 hover:bg-rose-100 text-rose-600 px-8 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all active:scale-95"
              >
                <RotateCcw className="w-4 h-4" /> Reset
              </button>
            </div>

            <div className="flex gap-2 w-full md:w-auto justify-end">
              <button className="flex-1 md:flex-none h-11 px-4 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Excel
              </button> 
              <button className="flex-1 md:flex-none h-11 px-4 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                <FileText className="w-4 h-4 text-rose-600" /> PDF
              </button>

              <button className="flex-1 md:flex-none h-11 px-4 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition-all flex items-center justify-center gap-2">
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
                <tr className="bg-blue-600 text-white">
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest border-r border-blue-500/50">Item Name</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest border-r border-blue-500/50">Category</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-center border-r border-blue-500/50">Unit</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-center border-r border-blue-500/50">Opening</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-center border-r border-blue-500/50">Inward</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-center border-r border-blue-500/50">Outward</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-center border-r border-blue-500/50">Closing</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-right border-r border-blue-500/50">Rate</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-right">Stock Value</th>

                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {paginatedData.length > 0 ? (
                  paginatedData.map((d) => (
                    <tr key={d.id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-slate-800 border-r border-slate-100">{d.itemName}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-500 border-r border-slate-100">{d.category}</td>
                      <td className="px-6 py-4 text-sm text-center border-r border-slate-100">{d.unit}</td>
                      <td className="px-6 py-4 text-sm text-center font-medium border-r border-slate-100">{d.openingStock}</td>
                      <td className="px-6 py-4 text-sm text-center font-bold text-emerald-600 border-r border-slate-100">+{d.inwardQty}</td>
                      <td className="px-6 py-4 text-sm text-center font-bold text-rose-600 border-r border-slate-100">-{d.outwardQty}</td>
                      <td className="px-6 py-4 text-sm text-center font-black text-slate-900 bg-slate-50 border-r border-slate-100">{d.closingStock}</td>
                      <td className="px-6 py-4 text-sm text-right border-r border-slate-100">₹{d.rate.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-right font-black text-blue-700 bg-blue-50/20">
                        ₹{d.stockValue.toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="px-6 py-10 text-center text-slate-400 font-medium italic">No stock data available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">
              Showing <span className="text-slate-900">{stockData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to <span className="text-slate-900">{Math.min(currentPage * itemsPerPage, stockData.length)}</span> of <span className="text-slate-900">{stockData.length}</span> records
            </span>

            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || stockData.length === 0}
                className="w-10 h-10 flex items-center justify-center bg-white border border-slate-300 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded-lg text-xs font-black transition-all ${currentPage === i + 1
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                    : "bg-white border border-slate-300 text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || stockData.length === 0}
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
