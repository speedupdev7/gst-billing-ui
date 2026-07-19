import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  ShoppingCart,
  Truck,
  Clock,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  RefreshCcw,
  Package,
  Hash,
  CalendarDays,
  IndianRupee,
} from "lucide-react";

const ITEMS_PER_PAGE = 8;

const STATUS_CFG = {
  Pending: { badge: "bg-rose-50 text-rose-700 border border-rose-200", dot: "bg-rose-500" },
  Processing: { badge: "bg-amber-50 text-amber-700 border border-amber-200", dot: "bg-amber-500" },
  Completed: { badge: "bg-emerald-50 text-emerald-700 border border-emerald-200", dot: "bg-emerald-500" },
};

function StatCard({ label, value, sub, icon, accent, onClick }) {
  const cfg = {
    indigo: { bg: "bg-indigo-50", ring: "ring-indigo-100", text: "text-indigo-600" },
    rose: { bg: "bg-rose-50", ring: "ring-rose-100", text: "text-rose-600" },
    amber: { bg: "bg-amber-50", ring: "ring-amber-100", text: "text-amber-600" },
    emerald: { bg: "bg-emerald-50", ring: "ring-emerald-100", text: "text-emerald-600" },
  };
  const c = cfg[accent] || cfg.indigo;
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-indigo-100 p-4 flex items-start gap-3 shadow-sm ${
        onClick ? "cursor-pointer hover:shadow-md hover:border-indigo-200 transition-all" : ""
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

const StockOrder = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const orderData = [
    { id: 1, orderNo: "ORD-1001", supplier: "ABC Pharma", items: 12, amount: 12500, orderDate: "10/05/2026", status: "Pending" },
    { id: 2, orderNo: "ORD-1002", supplier: "MediCare Ltd", items: 8, amount: 8450, orderDate: "09/05/2026", status: "Processing" },
    { id: 3, orderNo: "ORD-1003", supplier: "Health Plus", items: 15, amount: 18200, orderDate: "08/05/2026", status: "Completed" },
  ];

  const filtered = useMemo(() => {
    return orderData.filter((r) => {
      const matchSearch =
        r.orderNo.toLowerCase().includes(search.toLowerCase()) ||
        r.supplier.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "All" || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const pageRows = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const totals = { total: 124, pending: 14, processing: 9, completed: 101 };

  const hasFilter = search || statusFilter !== "All";
  const handleReset = () => {
    setSearch("");
    setStatusFilter("All");
    setPage(1);
  };

  const openView = (row) => {
    setSelectedRow(row);
    setIsModalOpen(true);
  };

  const inputCls =
    "h-9 rounded-lg border border-indigo-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all appearance-none";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/40 via-slate-50 to-sky-50/40 font-sans text-slate-900">
      {/* ── HEADER ── */}
      <div className="bg-white border-b border-indigo-100 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600 to-sky-600 flex items-center justify-center shadow-md shadow-indigo-200">
            <ShoppingCart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">Stock Orders</h1>
            <p className="text-[11px] text-indigo-400 font-medium uppercase tracking-widest">
              Manage medicine and stock purchase orders
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("/stock-order-form")}
          className="h-9 px-4 rounded-lg bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 text-white text-sm font-semibold flex items-center gap-2 transition-all active:scale-95 shadow-sm shadow-indigo-200 w-fit"
        >
          <Plus className="w-4 h-4" /> New Order
        </button>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 px-6 pt-4">
        <StatCard label="Total Orders" value={totals.total} sub="all time" icon={<Package className="w-5 h-5" />} accent="indigo" />
        <StatCard
          label="Pending"
          value={totals.pending}
          sub="awaiting action"
          icon={<Clock className="w-5 h-5" />}
          accent="rose"
          onClick={() => setStatusFilter(statusFilter === "Pending" ? "All" : "Pending")}
        />
        <StatCard
          label="Processing"
          value={totals.processing}
          sub="in progress"
          icon={<Truck className="w-5 h-5" />}
          accent="amber"
          onClick={() => setStatusFilter(statusFilter === "Processing" ? "All" : "Processing")}
        />
        <StatCard
          label="Completed"
          value={totals.completed}
          sub="fulfilled orders"
          icon={<CheckCircle className="w-5 h-5" />}
          accent="emerald"
          onClick={() => setStatusFilter(statusFilter === "Completed" ? "All" : "Completed")}
        />
      </div>

      {/* ── TABLE CARD ── */}
      <div className="mx-6 mt-4 mb-8 bg-white rounded-xl border border-indigo-100 overflow-hidden shadow-sm">
        {/* controls */}
        <div className="px-5 py-3 border-b border-indigo-50 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-indigo-300" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search order or supplier…"
              className="w-full h-9 rounded-lg border border-indigo-200 bg-indigo-50/40 pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <input type="date" className={inputCls} />

            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className={inputCls}>
              <option value="All">All Status</option>
              <option>Pending</option>
              <option>Processing</option>
              <option>Completed</option>
            </select>

            {hasFilter && (
              <button
                onClick={handleReset}
                className="h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 text-xs font-semibold hover:bg-slate-100 flex items-center gap-1.5 transition-all"
              >
                <X className="w-3.5 h-3.5" /> Clear
              </button>
            )}

            <span className="text-xs font-semibold text-indigo-400">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" style={{ minWidth: "860px" }}>
            <thead>
              <tr className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-sky-950 text-white">
                {[
                  ["Action", "w-16 text-center"],
                  ["Order No", "text-left"],
                  ["Supplier", "text-left"],
                  ["Items", "text-center"],
                  ["Amount", "text-right"],
                  ["Order Date", "text-center"],
                  ["Status", "text-center"],
                ].map(([h, cls]) => (
                  <th key={h} className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-widest ${cls}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-indigo-50">
              {pageRows.length > 0 ? (
                pageRows.map((order) => (
                  <tr key={order.id} className="hover:bg-indigo-50/40 transition-colors group">
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => openView(order)}
                        className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white flex items-center justify-center mx-auto transition-all"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>

                    <td className="px-4 py-3 text-sm">
                      <span className="text-xs font-semibold text-sky-600 bg-sky-50 border border-sky-100 px-2 py-0.5 rounded-md font-mono">
                        {order.orderNo}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-sm font-semibold text-slate-800">{order.supplier}</td>

                    <td className="px-4 py-3 text-center text-sm font-semibold tabular-nums">{order.items}</td>

                    <td className="px-4 py-3 text-right text-sm font-bold text-indigo-700 tabular-nums">
                      ₹{order.amount.toLocaleString("en-IN")}
                    </td>

                    <td className="px-4 py-3 text-center text-xs text-slate-500">{order.orderDate}</td>

                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${STATUS_CFG[order.status]?.badge}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CFG[order.status]?.dot}`} />
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-slate-400 text-sm">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-400">
                        <RefreshCcw className="w-5 h-5" />
                      </div>
                      No orders match the current filters.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* footer / pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 border-t border-indigo-50 bg-indigo-50/30">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Showing <span className="text-indigo-700">{filtered.length > 0 ? (page - 1) * ITEMS_PER_PAGE + 1 : 0}</span> –{" "}
            <span className="text-indigo-700">{Math.min(page * ITEMS_PER_PAGE, filtered.length)}</span> of{" "}
            <span className="text-indigo-700">{filtered.length}</span> entries
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-indigo-200 bg-white text-indigo-600 hover:bg-indigo-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                  page === p
                    ? "bg-gradient-to-r from-indigo-600 to-sky-600 text-white shadow-sm"
                    : "border border-indigo-200 bg-white text-indigo-600 hover:bg-indigo-100"
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-indigo-200 bg-white text-indigo-600 hover:bg-indigo-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
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
            <div className="p-5 bg-gradient-to-r from-indigo-700 to-sky-700 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <ShoppingCart size={16} />
                <span className="text-sm font-bold">Stock Order Details</span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-white/15 border border-white/25 text-white rounded-lg px-3 py-1.5 text-xs font-semibold hover:bg-white/25"
              >
                Close
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mb-1 flex items-center gap-1">
                    <Hash size={10} /> Order No
                  </label>
                  <p className="text-sm font-mono font-bold text-sky-600">{selectedRow.orderNo}</p>
                </div>
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Supplier</label>
                  <p className="text-sm font-bold text-slate-800">{selectedRow.supplier}</p>
                </div>
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Total Items</label>
                  <p className="text-sm font-bold text-slate-800">{selectedRow.items}</p>
                </div>
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mb-1 flex items-center gap-1">
                    <CalendarDays size={10} /> Order Date
                  </label>
                  <p className="text-sm font-semibold text-slate-700">{selectedRow.orderDate}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Status</label>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${STATUS_CFG[selectedRow.status]?.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CFG[selectedRow.status]?.dot}`} />
                    {selectedRow.status}
                  </span>
                </div>
              </div>

              <hr className="border-indigo-100" />

              <div className="bg-gradient-to-br from-indigo-50 to-sky-50 border border-indigo-200 rounded-xl p-5 flex items-center justify-between">
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-widest text-indigo-500 block mb-1">Order Amount</label>
                  <p className="text-2xl font-black text-indigo-700 font-mono">
                    ₹{selectedRow.amount.toLocaleString("en-IN")}
                  </p>
                </div>
                <IndianRupee className="text-indigo-300" size={32} />
              </div>
            </div>

            <div className="p-4 border-t border-indigo-100 bg-indigo-50/40 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-indigo-200 bg-white text-indigo-700 text-xs font-semibold hover:bg-indigo-50"
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

export default StockOrder;