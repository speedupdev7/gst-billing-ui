import React, { useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Search,
  RotateCcw,
  FileSpreadsheet,
  FileText,
  Printer,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Filter,
  TrendingUp,
  Package,
  ShoppingCart,
  Layers
} from "lucide-react";

export default function AssetPurchaseReport() {
  const [filters, setFilters] = useState({
    unit: "Main Branch - Mumbai",
    fromDate: new Date(),
    toDate: new Date(),
    supplier: "All",
    category: "All",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const rawData = useMemo(() => [
    { id: 1, purchaseDate: "10 Apr 2024", invoiceNo: "INV-101", supplier: "ABC Medical Suppliers", assetName: "ECG Machine", category: "Medical Equipment", qty: 1, rate: 85000 },
    { id: 2, purchaseDate: "12 Apr 2024", invoiceNo: "INV-102", supplier: "XYZ Traders", assetName: "Office Chair", category: "Furniture", qty: 10, rate: 3500 },
    { id: 3, purchaseDate: "15 Apr 2024", invoiceNo: "INV-103", supplier: "Global Tech", assetName: "Dell Monitor", category: "IT Hardware", qty: 5, rate: 12000 },
    { id: 4, purchaseDate: "18 Apr 2024", invoiceNo: "INV-104", supplier: "ABC Medical Suppliers", assetName: "Patient Monitor", category: "Medical Equipment", qty: 2, rate: 45000 },
    { id: 5, purchaseDate: "20 Apr 2024", invoiceNo: "INV-105", supplier: "Global Tech", assetName: "Laptop L3", category: "IT Hardware", qty: 2, rate: 55000 },
    { id: 6, purchaseDate: "22 Apr 2024", invoiceNo: "INV-106", supplier: "XYZ Traders", assetName: "Meeting Table", category: "Furniture", qty: 1, rate: 15000 },
  ], []);

  const filteredData = useMemo(() => {
    return rawData.filter((item) => {
      const matchSupplier = filters.supplier === "All" || item.supplier === filters.supplier;
      const matchCategory = filters.category === "All" || item.category === filters.category;
      return matchSupplier && matchCategory;
    });
  }, [filters, rawData]);

  // --- STATS CALCULATION ---
  const stats = useMemo(() => {
    const totalAmount = filteredData.reduce((acc, curr) => acc + (curr.qty * curr.rate), 0);
    const totalItems = filteredData.reduce((acc, curr) => acc + curr.qty, 0);
    const uniqueSuppliers = new Set(filteredData.map(d => d.supplier)).size;
    return { totalAmount, totalItems, uniqueSuppliers };
  }, [filteredData]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const inputStyles = "w-full h-10 pl-3 pr-8 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none appearance-none cursor-pointer text-slate-700 font-semibold shadow-sm";

  return (
    <div className="font-poppins bg-[#f8fafc] min-h-screen p-4 md:p-8">
      <div id="root-portal" />

      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              <div className="p-2 bg-blue-900 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              ASSET PURCHASE REPORT
            </h1>
           
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50 transition shadow-sm flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Excel
            </button>
            <button className="px-4 py-2 bg-blue-900 text-white rounded-lg text-xs font-bold hover:bg-blue-800 transition shadow-md flex items-center gap-2">
              <Printer className="w-4 h-4" /> Print Report
            </button>
          </div>
        </div>

        {/* --- STATS CARDS --- */}
        

        {/* --- MAIN CONTENT CARD --- */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          
          {/* FILTER BAR */}
          <div className="p-6 border-b border-slate-100 bg-slate-50/30">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block ml-1">Supplier</label>
                <select className={inputStyles} value={filters.supplier} onChange={e => setFilters({...filters, supplier: e.target.value})}>
                  <option>All</option>
                  <option>ABC Medical Suppliers</option>
                  <option>XYZ Traders</option>
                  <option>Global Tech</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block ml-1">Asset Category</label>
                <select className={inputStyles} value={filters.category} onChange={e => setFilters({...filters, category: e.target.value})}>
                  <option>All</option>
                  <option>Medical Equipment</option>
                  <option>Furniture</option>
                  <option>IT Hardware</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block ml-1">Period From</label>
                <div className="relative">
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <DatePicker selected={filters.fromDate} onChange={d => setFilters({...filters, fromDate: d})} dateFormat="dd MMM yyyy" className={inputStyles} />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block ml-1">Period To</label>
                  <div className="relative">
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <DatePicker selected={filters.toDate} onChange={d => setFilters({...filters, toDate: d})} dateFormat="dd MMM yyyy" className={inputStyles} />
                  </div>
                </div>
                <button onClick={() => setFilters({ ...filters, supplier: "All", category: "All" })} className="h-10 w-10 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-rose-500 hover:bg-rose-50 transition shadow-sm mt-auto" title="Reset">
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800 text-white uppercase text-[10px] font-bold tracking-widest">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Asset & Invoice</th>
                  <th className="px-6 py-4">Vendor</th>
                  <th className="px-6 py-4 text-center">Qty</th>
                  <th className="px-6 py-4 text-right">Unit Rate</th>
                  <th className="px-6 py-4 text-right">Net Payable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedData.map((d) => (
                  <tr key={d.id} className="hover:bg-indigo-50/20 transition-colors group">
                    <td className="px-6 py-5 text-slate-500 font-medium text-xs">{d.purchaseDate}</td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800">{d.assetName}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] font-bold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded uppercase">{d.category}</span>
                          <span className="text-[9px] text-slate-400 font-mono">#{d.invoiceNo}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-slate-700 text-xs font-semibold">{d.supplier}</div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="inline-block px-2 py-1 bg-slate-100 text-slate-700 rounded-md font-bold text-xs">{d.qty}</span>
                    </td>
                    <td className="px-6 py-5 text-right text-slate-600 text-xs font-medium">₹{d.rate.toLocaleString()}</td>
                    <td className="px-6 py-5 text-right">
                      <div className="text-sm font-black text-blue-900">₹{(d.qty * d.rate).toLocaleString()}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-400 uppercase">
              Showing <span className="text-slate-700">{Math.min((currentPage-1)*itemsPerPage+1, filteredData.length)} - {Math.min(currentPage*itemsPerPage, filteredData.length)}</span> of {filteredData.length}
            </p>
            <div className="flex items-center gap-2">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 transition shadow-sm">
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>
              <div className="px-4 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 shadow-sm">
                {currentPage} / {totalPages}
              </div>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 transition shadow-sm">
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}