import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Download,
  Filter,
  Package,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  TrendingUp,
  IndianRupee,
  Layers,
  MoreVertical,
  FileSpreadsheet,
  Printer,
  X,
} from "lucide-react";

/* ── constants ── */
const ITEMS_PER_PAGE = 8;

const STOCK_DATA = [
  {
    id: 1,
    item: "Paracetamol 500mg",
    category: "Tablet",
    batch: "BT1023",
    qty: 120,
    rate: 12,
    amount: 1440,
    expiry: "12/2027",
    status: "In Stock",
  },
  {
    id: 2,
    item: "Cough Syrup",
    category: "Syrup",
    batch: "SY2201",
    qty: 45,
    rate: 85,
    amount: 3825,
    expiry: "08/2026",
    status: "In Stock",
  },
  {
    id: 3,
    item: "Vitamin Capsules",
    category: "Capsule",
    batch: "VC9088",
    qty: 75,
    rate: 35,
    amount: 2625,
    expiry: "03/2028",
    status: "In Stock",
  },
  {
    id: 4,
    item: "Amoxicillin 250mg",
    category: "Capsule",
    batch: "AM4412",
    qty: 8,
    rate: 18,
    amount: 144,
    expiry: "06/2026",
    status: "Low Stock",
  },
  {
    id: 5,
    item: "Cetirizine 10mg",
    category: "Tablet",
    batch: "CT6634",
    qty: 200,
    rate: 5,
    amount: 1000,
    expiry: "01/2028",
    status: "In Stock",
  },
  {
    id: 6,
    item: "Antacid Suspension",
    category: "Syrup",
    batch: "AS3321",
    qty: 30,
    rate: 120,
    amount: 3600,
    expiry: "09/2025",
    status: "Expiring",
  },
  {
    id: 7,
    item: "Metformin 500mg",
    category: "Tablet",
    batch: "MT7890",
    qty: 5,
    rate: 22,
    amount: 110,
    expiry: "11/2027",
    status: "Low Stock",
  },
  {
    id: 8,
    item: "Azithromycin 500mg",
    category: "Tablet",
    batch: "AZ1145",
    qty: 60,
    rate: 45,
    amount: 2700,
    expiry: "07/2027",
    status: "In Stock",
  },
  {
    id: 9,
    item: "Omega-3 Capsules",
    category: "Capsule",
    batch: "OM5523",
    qty: 90,
    rate: 60,
    amount: 5400,
    expiry: "05/2028",
    status: "In Stock",
  },
  {
    id: 10,
    item: "Iron Syrup",
    category: "Syrup",
    batch: "IR8801",
    qty: 12,
    rate: 95,
    amount: 1140,
    expiry: "04/2026",
    status: "Low Stock",
  },
  {
    id: 11,
    item: "Pantoprazole 40mg",
    category: "Tablet",
    batch: "PT2244",
    qty: 150,
    rate: 14,
    amount: 2100,
    expiry: "02/2028",
    status: "In Stock",
  },
  {
    id: 12,
    item: "Calcium + D3 Tablets",
    category: "Tablet",
    batch: "CA9901",
    qty: 3,
    rate: 28,
    amount: 84,
    expiry: "10/2025",
    status: "Expiring",
  },
];

/* ── helpers ── */
const inr = (n) => "₹" + Number(n).toLocaleString("en-IN");

const STATUS_CFG = {
  "In Stock": {
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  "Low Stock": {
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  Expiring: {
    dot: "bg-rose-500",
    badge: "bg-rose-50 text-rose-700 border border-rose-200",
  },
};

const CAT_COLORS = {
  Tablet: "bg-blue-50 text-blue-700",
  Syrup: "bg-teal-50 text-teal-700",
  Capsule: "bg-purple-50 text-purple-700",
};

/* ══════════════════════════════════════════════
   STAT CARD
══════════════════════════════════════════════ */
function StatCard({ label, value, sub, icon, accent, onClick }) {
  const cfg = {
    blue: { ring: "ring-blue-100", bg: "bg-blue-50", text: "text-blue-600" },
    green: {
      ring: "ring-emerald-100",
      bg: "bg-emerald-50",
      text: "text-emerald-600",
    },
    amber: {
      ring: "ring-amber-100",
      bg: "bg-amber-50",
      text: "text-amber-600",
    },
    indigo: {
      ring: "ring-indigo-100",
      bg: "bg-indigo-50",
      text: "text-indigo-600",
    },
  };
  const c = cfg[accent] || cfg.blue;
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200 p-4 flex items-start gap-3 ${onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}
    >
      <div
        className={`w-10 h-10 rounded-lg ${c.bg} ring-1 ${c.ring} flex items-center justify-center flex-shrink-0`}
      >
        <span className={c.text}>{icon}</span>
      </div>
      <div>
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
          {label}
        </p>
        <p className={`text-xl font-bold ${c.text} leading-tight mt-0.5`}>
          {value}
        </p>
        {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
const OpeningStock = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [showExportMenu, setShowExportMenu] = useState(false);

  /* ── filtered data ── */
  const filtered = useMemo(() => {
    return STOCK_DATA.filter((r) => {
      const matchSearch =
        r.item.toLowerCase().includes(search.toLowerCase()) ||
        r.batch.toLowerCase().includes(search.toLowerCase());
      const matchCategory = category === "All" || r.category === category;
      const matchStatus = statusFilter === "All" || r.status === statusFilter;
      return matchSearch && matchCategory && matchStatus;
    });
  }, [search, category, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const pageRows = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  /* ── totals ── */
  const totals = useMemo(
    () => ({
      items: STOCK_DATA.length,
      qty: STOCK_DATA.reduce((s, r) => s + r.qty, 0),
      value: STOCK_DATA.reduce((s, r) => s + r.amount, 0),
      lowStock: STOCK_DATA.filter(
        (r) => r.status === "Low Stock" || r.status === "Expiring",
      ).length,
    }),
    [],
  );

  const inputCls =
    "h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all appearance-none";

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* ── HEADER ── */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">
              Opening Stock
            </h1>
            <p className="text-[11px] text-slate-400 font-medium uppercase tracking-widest">
              Inventory ·{" "}
              {new Date().toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* export dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu((v) => !v)}
              className="h-9 px-4 rounded-lg border border-slate-200 bg-white text-slate-600 text-sm font-semibold hover:bg-slate-50 flex items-center gap-2 transition-all"
            >
              <Download className="w-4 h-4" /> Export
            </button>
            {showExportMenu && (
              <div className="absolute right-0 top-11 bg-white border border-slate-200 rounded-xl shadow-lg z-20 w-44 py-1">
                <button
                  onClick={() => setShowExportMenu(false)}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-500" />{" "}
                  Export Excel
                </button>
                <button
                  onClick={() => setShowExportMenu(false)}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Printer className="w-4 h-4 text-slate-500" /> Print
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => navigate("/opening-stock-form")}
            className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center gap-2 transition-all active:scale-95 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Stock
          </button>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 px-6 pt-4">
        <StatCard
          label="Total Items"
          value={totals.items}
          sub="unique SKUs"
          icon={<Layers className="w-5 h-5" />}
          accent="blue"
        />
        <StatCard
          label="Total Quantity"
          value={totals.qty.toLocaleString("en-IN")}
          sub="units in stock"
          icon={<Package className="w-5 h-5" />}
          accent="indigo"
        />
        <StatCard
          label="Stock Value"
          value={inr(totals.value)}
          sub="at cost price"
          icon={<IndianRupee className="w-5 h-5" />}
          accent="green"
        />
        <StatCard
          label="Alerts"
          value={totals.lowStock}
          sub="low stock / expiring"
          icon={<AlertTriangle className="w-5 h-5" />}
          accent="amber"
          onClick={() =>
            setStatusFilter(statusFilter === "All" ? "Low Stock" : "All")
          }
        />
      </div>

      {/* ── TABLE CARD ── */}
      <div className="mx-6 mt-4 mb-8 bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* search + filters */}
        <div className="px-5 py-3 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search item or batch…"
              className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className={inputCls}
            >
              <option value="All">All Categories</option>
              <option>Tablet</option>
              <option>Syrup</option>
              <option>Capsule</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className={inputCls}
            >
              <option value="All">All Statuses</option>
              <option>In Stock</option>
              <option>Low Stock</option>
              <option>Expiring</option>
            </select>

            {(category !== "All" || statusFilter !== "All" || search) && (
              <button
                onClick={() => {
                  setCategory("All");
                  setStatusFilter("All");
                  setSearch("");
                  setPage(1);
                }}
                className="h-9 px-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 text-xs font-semibold hover:bg-rose-100 flex items-center gap-1.5 transition-all"
              >
                <X className="w-3.5 h-3.5" /> Clear
              </button>
            )}

            <span className="text-xs font-semibold text-slate-400">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* table */}
        <div className="overflow-x-auto">
          <table
            className="w-full text-left border-collapse"
            style={{ minWidth: "860px" }}
          >
            <thead>
              <tr className="bg-slate-800 text-white">
                {[
                  ["#", "w-10  text-center"],
                  ["Item Name", "text-left"],
                  ["Category", "text-left"],
                  ["Batch No", "text-left"],
                  ["Qty", "text-right"],
                  ["Rate", "text-right"],
                  ["Amount", "text-right"],
                  ["Expiry", "text-center"],
                  ["Status", "text-center"],
                  ["", "w-10  text-center"],
                ].map(([h, cls]) => (
                  <th
                    key={h}
                    className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-widest ${cls}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {pageRows.length > 0 ? (
                pageRows.map((r, i) => {
                  const sc = STATUS_CFG[r.status] || STATUS_CFG["In Stock"];
                  const serial = (page - 1) * ITEMS_PER_PAGE + i + 1;
                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-blue-50/30 transition-colors group"
                    >
                      <td className="px-4 py-3 text-center text-xs text-slate-400 font-mono">
                        {serial}
                      </td>

                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-slate-800">
                          {r.item}
                        </p>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded ${CAT_COLORS[r.category] || "bg-slate-100 text-slate-600"}`}
                        >
                          {r.category}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {r.batch}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <span
                          className={`text-sm font-bold tabular-nums ${r.qty <= 10 ? "text-rose-600" : "text-slate-800"}`}
                        >
                          {r.qty}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right text-sm text-slate-600 tabular-nums">
                        {inr(r.rate)}
                      </td>

                      <td className="px-4 py-3 text-right text-sm font-bold text-blue-700 tabular-nums">
                        {inr(r.amount)}
                      </td>

                      <td className="px-4 py-3 text-center text-xs text-slate-500">
                        {r.expiry}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${sc.badge}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}
                          />
                          {r.status}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={10}
                    className="px-6 py-16 text-center text-slate-400 text-sm"
                  >
                    No stock records match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* footer / pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 border-t border-slate-100 bg-slate-50">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Showing{" "}
            <span className="text-slate-700">
              {filtered.length > 0 ? (page - 1) * ITEMS_PER_PAGE + 1 : 0}
            </span>{" "}
            –{" "}
            <span className="text-slate-700">
              {Math.min(page * ITEMS_PER_PAGE, filtered.length)}
            </span>{" "}
            of <span className="text-slate-700">{filtered.length}</span> entries
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                  page === p
                    ? "bg-blue-600 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpeningStock;
