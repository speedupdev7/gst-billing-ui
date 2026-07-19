import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Search,
  Plus,
  Download,
  Package,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  IndianRupee,
  Layers,
  FileSpreadsheet,
  Printer,
  X,
  Eye,
  RefreshCcw,
  Hash,
  CalendarDays,
  Truck,
  Sparkles,
} from "lucide-react";

const ITEMS_PER_PAGE = 8;

const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });

const STATUS_CFG = {
  "In Stock": { badge: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  "Low Stock": { badge: "bg-amber-50 text-amber-700 border border-amber-200" },
  Expiring: { badge: "bg-rose-50 text-rose-700 border border-rose-200" },
};

function StatCard({ label, value, sub, icon, accent, onClick }) {
  const cfg = {
    violet: { bg: "bg-violet-50", ring: "ring-violet-100", text: "text-violet-600" },
    fuchsia: { bg: "bg-fuchsia-50", ring: "ring-fuchsia-100", text: "text-fuchsia-600" },
    amber: { bg: "bg-amber-50", ring: "ring-amber-100", text: "text-amber-600" },
    emerald: { bg: "bg-emerald-50", ring: "ring-emerald-100", text: "text-emerald-600" },
  };
  const c = cfg[accent] || cfg.violet;
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-violet-100 p-4 flex items-start gap-3 shadow-sm ${
        onClick ? "cursor-pointer hover:shadow-md hover:border-violet-200 transition-all" : ""
      }`}
    >
      <div className={`w-10 h-10 rounded-lg ${c.bg} ring-1 ${c.ring} flex items-center justify-center flex-shrink-0`}>
        <span className={c.text}>{icon}</span>
      </div>
      <div>
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">{label}</p>
        <p className={`text-xl font-bold ${c.text} leading-tight mt-0.5`}>{value}</p>
        {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

const OpeningStock = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(ITEMS_PER_PAGE);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [reportData, setReportData] = useState({
    items: [],
    totalItems: 0,
    totalQuantity: 0,
    overallStockValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  const fetchOpeningStockReport = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const response = await axios.get("/api/item-master/opening-stock-report", {
        headers: { "Content-Type": "application/json" },
      });
      const data = response.data || {
        items: [],
        totalItems: 0,
        totalQuantity: 0,
        overallStockValue: 0,
      };
      setReportData({
        items: Array.isArray(data.items) ? data.items : [],
        totalItems: Number(data.totalItems) || 0,
        totalQuantity: Number(data.totalQuantity) || 0,
        overallStockValue: Number(data.overallStockValue) || 0,
      });
    } catch (error) {
      setApiError(
        error.response?.data?.message || error.message || "Failed to load opening stock report."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpeningStockReport();
  }, []);

  const filtered = useMemo(() => {
    return reportData.items.filter((r) => {
      const matchSearch =
        r.itemName?.toLowerCase().includes(search.toLowerCase()) ||
        r.batchCode?.toLowerCase().includes(search.toLowerCase()) ||
        r.itemCode?.toLowerCase().includes(search.toLowerCase());
      const matchCategory = category === "All" || r.category === category;
      const matchStatus = statusFilter === "All" || r.status === statusFilter;
      return matchSearch && matchCategory && matchStatus;
    });
  }, [search, category, statusFilter, reportData.items]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const totals = useMemo(
    () => ({
      items: reportData.totalItems,
      qty: reportData.totalQuantity,
      value: reportData.overallStockValue,
      lowStock: reportData.items.filter((r) => r.openingStock < 20).length,
    }),
    [reportData]
  );

  const hasFilter = search || category !== "All" || statusFilter !== "All";
  const handleReset = () => {
    setSearch("");
    setCategory("All");
    setStatusFilter("All");
    setPage(1);
  };

  const openView = (row) => {
    setSelectedRow(row);
    setIsModalOpen(true);
  };

  const inputCls =
    "h-9 rounded-lg border border-violet-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all appearance-none";

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50/40 via-slate-50 to-amber-50/30 font-sans text-slate-900">
      {/* ── HEADER ── */}
      <div className="bg-white border-b border-violet-100 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-md shadow-violet-200">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">Opening Stock</h1>
            <p className="text-[11px] text-violet-400 font-medium uppercase tracking-widest">
              Inventory ·{" "}
              {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchOpeningStockReport}
            className="h-9 w-9 rounded-lg border border-violet-200 bg-white text-violet-600 hover:bg-violet-50 flex items-center justify-center transition-all"
            title="Refresh"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowExportMenu((v) => !v)}
              className="h-9 px-4 rounded-lg border border-violet-200 bg-white text-violet-700 text-sm font-semibold hover:bg-violet-50 flex items-center gap-2 transition-all"
            >
              <Download className="w-4 h-4" /> Export
            </button>
            {showExportMenu && (
              <div className="absolute right-0 top-11 bg-white border border-violet-100 rounded-xl shadow-lg z-20 w-44 py-1">
                <button
                  onClick={() => setShowExportMenu(false)}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-violet-50 flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> Export Excel
                </button>
                <button
                  onClick={() => setShowExportMenu(false)}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-violet-50 flex items-center gap-2"
                >
                  <Printer className="w-4 h-4 text-slate-500" /> Print
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => navigate("/opening-stock-form")}
            className="h-9 px-4 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white text-sm font-semibold flex items-center gap-2 transition-all active:scale-95 shadow-sm shadow-violet-200"
          >
            <Plus className="w-4 h-4" /> Add Stock
          </button>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 px-6 pt-4">
        <StatCard label="Total Items" value={totals.items} sub="unique SKUs" icon={<Layers className="w-5 h-5" />} accent="violet" />
        <StatCard label="Total Quantity" value={totals.qty.toLocaleString("en-IN")} sub="units in stock" icon={<Package className="w-5 h-5" />} accent="fuchsia" />
        <StatCard label="Stock Value" value={inr(totals.value)} sub="at cost price" icon={<IndianRupee className="w-5 h-5" />} accent="emerald" />
        <StatCard
          label="Alerts"
          value={totals.lowStock}
          sub="low stock"
          icon={<AlertTriangle className="w-5 h-5" />}
          accent="amber"
          onClick={() => setStatusFilter(statusFilter === "All" ? "Low Stock" : "All")}
        />
      </div>

      {/* ── TABLE CARD ── */}
      <div className="mx-6 mt-4 mb-8 bg-white rounded-xl border border-violet-100 overflow-hidden shadow-sm">
        {/* controls */}
        <div className="px-5 py-3 border-b border-violet-50 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-violet-300" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search item, code or batch…"
              className="w-full h-9 rounded-lg border border-violet-200 bg-violet-50/40 pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className={inputCls}>
              <option value="All">All Categories</option>
              <option>Tablet</option>
              <option>Syrup</option>
              <option>Capsule</option>
            </select>

            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className={inputCls}>
              <option value="All">All Statuses</option>
              <option>In Stock</option>
              <option>Low Stock</option>
              <option>Expiring</option>
            </select>

            {hasFilter && (
              <button
                onClick={handleReset}
                className="h-9 px-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 text-xs font-semibold hover:bg-rose-100 flex items-center gap-1.5 transition-all"
              >
                <X className="w-3.5 h-3.5" /> Clear
              </button>
            )}

            <div className="w-[1px] h-5 bg-violet-100 mx-1" />

            <span className="text-xs text-violet-400 font-medium">Show</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              className={inputCls}
              style={{ height: "36px" }}
            >
              <option value={8}>8</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" style={{ minWidth: "900px" }}>
            <thead>
              <tr className="bg-gradient-to-r from-violet-950 via-violet-900 to-fuchsia-950 text-white">
                {[
                  ["Action", "w-16 text-center"],
                  ["Item Code", "text-left"],
                  ["Item Name", "text-left"],
                  ["Batch No", "text-left"],
                  ["Category", "text-center"],
                  ["Quantity", "text-right"],
                  ["Rate", "text-right"],
                  ["Amount", "text-right"],
                  ["Expiry", "text-center"],
                  ["Status", "text-center"],
                ].map(([h, cls]) => (
                  <th key={h} className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-widest ${cls}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-violet-50">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-6 py-16 text-center text-slate-400 text-sm">
                    Loading opening stock…
                  </td>
                </tr>
              ) : apiError ? (
                <tr>
                  <td colSpan={10} className="px-6 py-16 text-center text-rose-500 text-sm">
                    {apiError}
                  </td>
                </tr>
              ) : pageRows.length > 0 ? (
                pageRows.map((r, i) => (
                  <tr
                    key={r.openingStockId || `${r.itemId}-${r.batchCode}-${i}`}
                    className="hover:bg-violet-50/40 transition-colors group"
                  >
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => openView(r)}
                        className="w-7 h-7 rounded-lg bg-violet-50 border border-violet-100 text-violet-600 hover:bg-violet-600 hover:text-white flex items-center justify-center mx-auto transition-all"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>

                    <td className="px-4 py-3 text-sm font-semibold text-slate-800">{r.itemCode || "—"}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{r.itemName || "—"}</td>

                    <td className="px-4 py-3 text-sm">
                      <span className="text-xs font-semibold text-fuchsia-600 bg-fuchsia-50 border border-fuchsia-100 px-2 py-0.5 rounded-md font-mono">
                        {r.batchCode || "—"}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-violet-500 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-md">
                        {r.category || "—"}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right text-sm font-semibold tabular-nums">
                      {r.openingStock?.toLocaleString("en-IN") ?? "0"}
                    </td>

                    <td className="px-4 py-3 text-right text-sm text-slate-600 tabular-nums">
                      {r.purchasePrice != null ? inr(r.purchasePrice) : "—"}
                    </td>

                    <td className="px-4 py-3 text-right text-sm font-bold text-violet-700 tabular-nums">
                      {r.totalAmount != null ? inr(r.totalAmount) : "—"}
                    </td>

                    <td className="px-4 py-3 text-center text-xs text-slate-500">{r.expiryDate || "—"}</td>

                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                          STATUS_CFG[r.status]?.badge || "bg-slate-50 text-slate-500 border border-slate-200"
                        }`}
                      >
                        {r.status || "N/A"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="px-6 py-16 text-center text-slate-400 text-sm">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center text-violet-400">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      No stock records match the current filters.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* footer / pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 border-t border-violet-50 bg-violet-50/30">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Showing <span className="text-violet-700">{filtered.length > 0 ? (page - 1) * pageSize + 1 : 0}</span> –{" "}
            <span className="text-violet-700">{Math.min(page * pageSize, filtered.length)}</span> of{" "}
            <span className="text-violet-700">{filtered.length}</span> entries
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-violet-200 bg-white text-violet-600 hover:bg-violet-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                  page === p
                    ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-sm"
                    : "border border-violet-200 bg-white text-violet-600 hover:bg-violet-100"
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-violet-200 bg-white text-violet-600 hover:bg-violet-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── VIEW MODAL ── */}
      {isModalOpen && selectedRow && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-5">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
            {/* modal header */}
            <div className="p-5 bg-gradient-to-r from-violet-700 to-fuchsia-700 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Package size={16} />
                <span className="text-sm font-bold">Opening Stock Details</span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-white/15 border border-white/25 text-white rounded-lg px-3 py-1.5 text-xs font-semibold hover:bg-white/25"
              >
                Close
              </button>
            </div>

            {/* modal body */}
            <div className="p-6 overflow-y-auto flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Item Name</label>
                  <p className="text-sm font-bold text-slate-800">{selectedRow.itemName || "—"}</p>
                </div>
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Item Code</label>
                  <p className="text-sm font-bold text-slate-800">{selectedRow.itemCode || "—"}</p>
                </div>
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mb-1 flex items-center gap-1">
                    <Hash size={10} /> Batch No
                  </label>
                  <p className="text-sm font-mono font-semibold text-fuchsia-600">{selectedRow.batchCode || "—"}</p>
                </div>
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Category</label>
                  <p className="text-sm font-semibold text-violet-600">{selectedRow.category || "—"}</p>
                </div>
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Quantity</label>
                  <p className="text-sm font-bold text-slate-800">{selectedRow.openingStock?.toLocaleString("en-IN") ?? "0"}</p>
                </div>
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mb-1 flex items-center gap-1">
                    <CalendarDays size={10} /> Expiry Date
                  </label>
                  <p className="text-sm font-semibold text-slate-700">{selectedRow.expiryDate || "—"}</p>
                </div>
                {selectedRow.supplierName && (
                  <div className="col-span-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mb-1 flex items-center gap-1">
                      <Truck size={10} /> Supplier
                    </label>
                    <p className="text-sm font-semibold text-slate-700">{selectedRow.supplierName}</p>
                  </div>
                )}
              </div>

              <hr className="border-violet-100" />

              {/* summary strip */}
              <div className="bg-gradient-to-br from-violet-50 to-amber-50 border border-violet-200 rounded-xl p-5 flex items-center justify-between flex-wrap gap-4">
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-widest text-violet-500 block mb-1">Total Amount</label>
                  <p className="text-2xl font-black text-violet-700 font-mono">
                    {selectedRow.totalAmount != null ? inr(selectedRow.totalAmount) : "—"}
                  </p>
                </div>
                <div className="text-right">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-amber-600 block mb-1">Rate</label>
                  <p className="text-sm font-bold text-amber-700 font-mono">
                    {selectedRow.purchasePrice != null ? inr(selectedRow.purchasePrice) : "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* modal footer */}
            <div className="p-4 border-t border-violet-100 bg-violet-50/40 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-violet-200 bg-white text-violet-700 text-xs font-semibold hover:bg-violet-50"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpeningStock;