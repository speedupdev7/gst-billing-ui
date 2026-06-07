import React, { useMemo, useState } from "react";
import {
  Search,
  RotateCcw,
  FileSpreadsheet,
  FileText,
  Printer,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  IndianRupee,
  Percent,
  FileCheck,
  AlertCircle,
  CheckCircle2,
  Clock3,
} from "lucide-react";

import { useToast } from "../../contextapi/ToastContext";
import { useExport } from "../../contextapi/ExportContext";

/* ══════════════════════════════════════════════
   CONSTANTS & HELPERS
══════════════════════════════════════════════ */
const ITEMS_PER_PAGE = 8;
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const YEARS = ["2024-25", "2023-24", "2022-23"];
const GST_SLABS = ["All", "5%", "12%", "18%", "28%", "0%"];
const SUPPLY_TYPES = ["All", "B2B", "B2C", "Export", "Exempt"];

const inr = (n) =>
  "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2 });

const pct = (n) => Number(n).toFixed(2) + "%";

/* ── raw mock data ── */
const RAW_DATA = [
  { id:1,  gstin:"27AAECW1111A1Z5", party:"Apollo Hospitals",        invoiceNo:"INV-2024-001", invoiceDate:"2024-04-05", supplyType:"B2B", taxableValue:42000, cgst:2520, sgst:2520, igst:0,    cess:0,   gstSlab:12, status:"Filed" },
  { id:2,  gstin:"27AABCU9603R1ZM", party:"Cipla Ltd.",               invoiceNo:"INV-2024-002", invoiceDate:"2024-04-08", supplyType:"B2B", taxableValue:18500, cgst:1665, sgst:1665, igst:0,    cess:0,   gstSlab:18, status:"Pending" },
  { id:3,  gstin:"27AADCB2230M1ZP", party:"Sun Pharma Dist.",         invoiceNo:"INV-2024-003", invoiceDate:"2024-04-10", supplyType:"B2C", taxableValue:3200,  cgst:80,   sgst:80,   igst:0,    cess:0,   gstSlab:5,  status:"Filed" },
  { id:4,  gstin:"27AAACR5055K1ZK", party:"Reliance Retail",          invoiceNo:"INV-2024-004", invoiceDate:"2024-04-12", supplyType:"B2B", taxableValue:95000, cgst:0,    sgst:0,    igst:17100,cess:0,   gstSlab:18, status:"Filed" },
  { id:5,  gstin:"27AABCM5553Q1ZI", party:"Medanta Healthcare",       invoiceNo:"INV-2024-005", invoiceDate:"2024-04-15", supplyType:"B2B", taxableValue:67000, cgst:4020, sgst:4020, igst:0,    cess:0,   gstSlab:12, status:"Mismatch" },
  { id:6,  gstin:"",                 party:"Walk-in Patient",          invoiceNo:"INV-2024-006", invoiceDate:"2024-04-18", supplyType:"B2C", taxableValue:1400,  cgst:35,   sgst:35,   igst:0,    cess:0,   gstSlab:5,  status:"Filed" },
  { id:7,  gstin:"27AACCS4699N1ZB", party:"Lupin Ltd.",                invoiceNo:"INV-2024-007", invoiceDate:"2024-04-20", supplyType:"B2B", taxableValue:28000, cgst:2520, sgst:2520, igst:0,    cess:0,   gstSlab:18, status:"Filed" },
  { id:8,  gstin:"27AABCK4649P1ZR", party:"Kiran Diagnostics",        invoiceNo:"INV-2024-008", invoiceDate:"2024-04-22", supplyType:"B2B", taxableValue:12000, cgst:720,  sgst:720,  igst:0,    cess:0,   gstSlab:12, status:"Pending" },
  { id:9,  gstin:"27AAECS3539P1ZJ", party:"Sahyadri Hospitals",       invoiceNo:"INV-2024-009", invoiceDate:"2024-04-24", supplyType:"B2B", taxableValue:54000, cgst:0,    sgst:0,    igst:9720, cess:0,   gstSlab:18, status:"Filed" },
  { id:10, gstin:"27AABCW3165G1ZN", party:"Wockhardt Ltd.",           invoiceNo:"INV-2024-010", invoiceDate:"2024-04-26", supplyType:"Export",taxableValue:88000,cgst:0,   sgst:0,    igst:0,    cess:0,   gstSlab:0,  status:"Filed" },
  { id:11, gstin:"27AADCP4532R1ZH", party:"Poona Hospital",           invoiceNo:"INV-2024-011", invoiceDate:"2024-04-28", supplyType:"B2B", taxableValue:33000, cgst:1980, sgst:1980, igst:0,    cess:0,   gstSlab:12, status:"Filed" },
  { id:12, gstin:"27AACCE4268P1ZD", party:"Entod Pharmaceuticals",    invoiceNo:"INV-2024-012", invoiceDate:"2024-04-30", supplyType:"B2B", taxableValue:7500,  cgst:675,  sgst:675,  igst:0,    cess:0,   gstSlab:18, status:"Mismatch" },
  { id:13, gstin:"27AABCV4163H1ZV", party:"Vidal Health Insurance",   invoiceNo:"INV-2024-013", invoiceDate:"2024-05-02", supplyType:"Exempt",taxableValue:22000,cgst:0,  sgst:0,    igst:0,    cess:0,   gstSlab:0,  status:"Filed" },
  { id:14, gstin:"27AABCD4040J1ZS", party:"Dr. Agarwals Eye Care",    invoiceNo:"INV-2024-014", invoiceDate:"2024-05-05", supplyType:"B2B", taxableValue:41000, cgst:2460, sgst:2460, igst:0,    cess:0,   gstSlab:12, status:"Filed" },
  { id:15, gstin:"27AADCK4213N1ZX", party:"Kokilaben Dhirubhai Hosp", invoiceNo:"INV-2024-015", invoiceDate:"2024-05-08", supplyType:"B2B", taxableValue:76000, cgst:6840, sgst:6840, igst:0,    cess:0,   gstSlab:18, status:"Pending" },
];

/* ══════════════════════════════════════════════
   TAB DEFINITIONS
══════════════════════════════════════════════ */
const TABS = [
  { id: "summary",  label: "Summary",  icon: <TrendingUp className="w-4 h-4" /> },
  { id: "gstr1",    label: "GSTR-1",   icon: <FileCheck className="w-4 h-4" /> },
  { id: "gstr2",    label: "GSTR-2A",  icon: <FileText className="w-4 h-4" /> },
  { id: "gstr3b",   label: "GSTR-3B",  icon: <IndianRupee className="w-4 h-4" /> },
];

/* ══════════════════════════════════════════════
   REUSABLE COMPONENTS
══════════════════════════════════════════════ */
function StatCard({ label, value, sub, icon, accent }) {
  const accents = {
    blue:   { bg: "bg-blue-50",   text: "text-blue-600",   border: "border-blue-100" },
    green:  { bg: "bg-emerald-50",text: "text-emerald-600",border: "border-emerald-100" },
    rose:   { bg: "bg-rose-50",   text: "text-rose-600",   border: "border-rose-100" },
    amber:  { bg: "bg-amber-50",  text: "text-amber-600",  border: "border-amber-100" },
    indigo: { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-100" },
  };
  const a = accents[accent] || accents.blue;
  return (
    <div className={`rounded-xl border ${a.border} bg-white p-4 flex items-start gap-3`}>
      <div className={`w-10 h-10 rounded-lg ${a.bg} flex items-center justify-center flex-shrink-0`}>
        <span className={a.text}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
        <p className={`text-xl font-bold ${a.text} leading-tight`}>{value}</p>
        {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const cfg = {
    Filed:    { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: <CheckCircle2 className="w-3 h-3" /> },
    Pending:  { cls: "bg-amber-50 text-amber-700 border-amber-200",       icon: <Clock3 className="w-3 h-3" /> },
    Mismatch: { cls: "bg-rose-50 text-rose-700 border-rose-200",          icon: <AlertCircle className="w-3 h-3" /> },
  };
  const c = cfg[status] || cfg.Pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${c.cls}`}>
      {c.icon} {status}
    </span>
  );
}

function SlabBadge({ slab }) {
  if (slab === 0) return <span className="text-xs font-bold text-slate-400">Exempt / 0%</span>;
  const colors = {
    5:  "bg-teal-50 text-teal-700",
    12: "bg-blue-50 text-blue-700",
    18: "bg-indigo-50 text-indigo-700",
    28: "bg-purple-50 text-purple-700",
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${colors[slab] || "bg-slate-100 text-slate-600"}`}>
      {slab}%
    </span>
  );
}

/* ══════════════════════════════════════════════
   SUMMARY TAB
══════════════════════════════════════════════ */
function SummaryTab({ data }) {
  const totals = useMemo(() => {
    const t = data.reduce(
      (acc, r) => ({
        taxable: acc.taxable + r.taxableValue,
        cgst:    acc.cgst + r.cgst,
        sgst:    acc.sgst + r.sgst,
        igst:    acc.igst + r.igst,
        totalGst:acc.totalGst + r.cgst + r.sgst + r.igst,
        invoices:acc.invoices + 1,
        filed:   acc.filed + (r.status === "Filed" ? 1 : 0),
        pending: acc.pending + (r.status === "Pending" ? 1 : 0),
        mismatch:acc.mismatch + (r.status === "Mismatch" ? 1 : 0),
      }),
      { taxable:0, cgst:0, sgst:0, igst:0, totalGst:0, invoices:0, filed:0, pending:0, mismatch:0 }
    );
    return t;
  }, [data]);

  /* slab-wise breakup */
  const slabBreakup = useMemo(() => {
    const map = {};
    data.forEach((r) => {
      const k = r.gstSlab;
      if (!map[k]) map[k] = { taxable: 0, gst: 0, count: 0 };
      map[k].taxable += r.taxableValue;
      map[k].gst += r.cgst + r.sgst + r.igst;
      map[k].count += 1;
    });
    return Object.entries(map).sort((a, b) => Number(a[0]) - Number(b[0]));
  }, [data]);

  return (
    <div className="space-y-6">
      {/* kpi row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Taxable Turnover" value={inr(totals.taxable)} sub={`${totals.invoices} invoices`} icon={<IndianRupee className="w-5 h-5" />} accent="blue" />
        <StatCard label="Total GST Liability" value={inr(totals.totalGst)} sub={`CGST + SGST + IGST`} icon={<Percent className="w-5 h-5" />} accent="indigo" />
        <StatCard label="Filed" value={totals.filed} sub="invoices filed" icon={<CheckCircle2 className="w-5 h-5" />} accent="green" />
        <StatCard label="Pending / Mismatch" value={totals.pending + totals.mismatch} sub={`${totals.pending} pending · ${totals.mismatch} mismatch`} icon={<AlertCircle className="w-5 h-5" />} accent="rose" />
      </div>

      {/* tax component breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {[
          { label: "CGST Collected",  value: totals.cgst,  accent: "blue" },
          { label: "SGST Collected",  value: totals.sgst,  accent: "indigo" },
          { label: "IGST Collected",  value: totals.igst,  accent: "amber" },
        ].map(({ label, value, accent }) => (
          <StatCard key={label} label={label} value={inr(value)} icon={<IndianRupee className="w-5 h-5" />} accent={accent} />
        ))}
      </div>

      {/* slab-wise table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
          <Percent className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-bold text-slate-700">GST Slab-wise Breakup</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
              <th className="px-5 py-3 text-left">GST Rate</th>
              <th className="px-5 py-3 text-right">Invoices</th>
              <th className="px-5 py-3 text-right">Taxable Value</th>
              <th className="px-5 py-3 text-right">GST Amount</th>
              <th className="px-5 py-3 text-right">Effective Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {slabBreakup.map(([slab, d]) => (
              <tr key={slab} className="hover:bg-slate-50/70 transition-colors">
                <td className="px-5 py-3"><SlabBadge slab={Number(slab)} /></td>
                <td className="px-5 py-3 text-right text-slate-600">{d.count}</td>
                <td className="px-5 py-3 text-right font-medium text-slate-800 tabular-nums">{inr(d.taxable)}</td>
                <td className="px-5 py-3 text-right font-semibold text-indigo-600 tabular-nums">{inr(d.gst)}</td>
                <td className="px-5 py-3 text-right text-slate-500">{d.taxable > 0 ? pct((d.gst / d.taxable) * 100) : "0.00%"}</td>
              </tr>
            ))}
            <tr className="bg-slate-800 text-white font-bold">
              <td className="px-5 py-3 text-sm">Total</td>
              <td className="px-5 py-3 text-right tabular-nums">{totals.invoices}</td>
              <td className="px-5 py-3 text-right tabular-nums">{inr(totals.taxable)}</td>
              <td className="px-5 py-3 text-right tabular-nums">{inr(totals.totalGst)}</td>
              <td className="px-5 py-3 text-right">{totals.taxable > 0 ? pct((totals.totalGst / totals.taxable) * 100) : "—"}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   DETAIL TABLE (shared by GSTR-1 / GSTR-2A / GSTR-3B)
══════════════════════════════════════════════ */
function DetailTable({ data, type }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(data.length / ITEMS_PER_PAGE));
  const rows = data.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  /* columns vary slightly by type */
  const showGSTIN = type !== "gstr3b";

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse" style={{ minWidth: "980px" }}>
          <thead>
            <tr className="bg-slate-800 text-white">
              {[
                ["Invoice No",   "text-left"],
                ["Invoice Date", "text-left"],
                ...(showGSTIN ? [["GSTIN / Party", "text-left"]] : [["Party Name", "text-left"]]),
                ["Supply Type",  "text-center"],
                ["Taxable Value","text-right"],
                ["CGST",         "text-right"],
                ["SGST",         "text-right"],
                ["IGST",         "text-right"],
                ["Total GST",    "text-right"],
                ["GST Slab",     "text-center"],
                ["Status",       "text-center"],
              ].map(([h, align]) => (
                <th key={h} className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-widest ${align}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length > 0 ? rows.map((r) => {
              const totalGst = r.cgst + r.sgst + r.igst;
              const supplyColors = {
                B2B: "bg-blue-50 text-blue-700",
                B2C: "bg-teal-50 text-teal-700",
                Export: "bg-purple-50 text-purple-700",
                Exempt: "bg-slate-100 text-slate-500",
              };
              return (
                <tr key={r.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-sm font-bold text-blue-600">{r.invoiceNo}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">{r.invoiceDate}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold text-slate-800 leading-tight">{r.party}</p>
                    {showGSTIN && r.gstin && (
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{r.gstin}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${supplyColors[r.supplyType] || "bg-slate-100 text-slate-600"}`}>
                      {r.supplyType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-slate-800 tabular-nums">{inr(r.taxableValue)}</td>
                  <td className="px-4 py-3 text-right text-sm text-slate-600 tabular-nums">{r.cgst > 0 ? inr(r.cgst) : "—"}</td>
                  <td className="px-4 py-3 text-right text-sm text-slate-600 tabular-nums">{r.sgst > 0 ? inr(r.sgst) : "—"}</td>
                  <td className="px-4 py-3 text-right text-sm text-slate-600 tabular-nums">{r.igst > 0 ? inr(r.igst) : "—"}</td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-indigo-600 tabular-nums">{totalGst > 0 ? inr(totalGst) : "Nil"}</td>
                  <td className="px-4 py-3 text-center"><SlabBadge slab={r.gstSlab} /></td>
                  <td className="px-4 py-3 text-center"><StatusBadge status={r.status} /></td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={11} className="px-6 py-16 text-center text-slate-400 text-sm">
                  No records found for the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 border-t border-slate-100 bg-slate-50">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
          Showing{" "}
          <span className="text-slate-700">{data.length > 0 ? (page - 1) * ITEMS_PER_PAGE + 1 : 0}</span>
          {" "}–{" "}
          <span className="text-slate-700">{Math.min(page * ITEMS_PER_PAGE, data.length)}</span>
          {" "}of{" "}
          <span className="text-slate-700">{data.length}</span> invoices
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                page === p ? "bg-indigo-600 text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   GSTR-3B SPECIAL VIEW
══════════════════════════════════════════════ */
function GSTR3BTab({ data }) {
  const t = useMemo(() =>
    data.reduce(
      (acc, r) => ({
        outwardTaxable:   acc.outwardTaxable + r.taxableValue,
        outwardGST:       acc.outwardGST + r.cgst + r.sgst + r.igst,
        cgst:             acc.cgst + r.cgst,
        sgst:             acc.sgst + r.sgst,
        igst:             acc.igst + r.igst,
      }),
      { outwardTaxable: 0, outwardGST: 0, cgst: 0, sgst: 0, igst: 0 }
    ),
    [data]
  );

  const sections = [
    {
      title: "3.1 – Outward supplies and inward supplies liable to reverse charge",
      rows: [
        { desc: "(a) Outward taxable supplies (other than zero rated, nil rated, and exempted)", taxable: t.outwardTaxable, cgst: t.cgst, sgst: t.sgst, igst: t.igst },
        { desc: "(b) Outward taxable supplies (zero rated)", taxable: 88000, cgst: 0, sgst: 0, igst: 0 },
        { desc: "(c) Other outward supplies (nil rated, exempted)", taxable: 22000, cgst: 0, sgst: 0, igst: 0 },
        { desc: "(d) Inward supplies (liable to reverse charge)", taxable: 0, cgst: 0, sgst: 0, igst: 0 },
        { desc: "(e) Non-GST outward supplies", taxable: 0, cgst: 0, sgst: 0, igst: 0 },
      ],
    },
    {
      title: "3.2 – Of the supplies shown in 3.1(a) above, inter-state supplies to",
      rows: [
        { desc: "Unregistered persons", taxable: 26100, cgst: 0, sgst: 0, igst: 4698 },
        { desc: "Composition taxable persons", taxable: 0,     cgst: 0, sgst: 0, igst: 0 },
        { desc: "UIN holders", taxable: 0,     cgst: 0, sgst: 0, igst: 0 },
      ],
    },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Outward Taxable"  value={inr(t.outwardTaxable)} icon={<TrendingUp className="w-5 h-5" />} accent="blue" />
        <StatCard label="Total GST Payable" value={inr(t.outwardGST)}   icon={<IndianRupee className="w-5 h-5" />} accent="indigo" />
        <StatCard label="ITC Available"     value={inr(0)}               icon={<TrendingDown className="w-5 h-5" />} accent="green" sub="Upload purchase register" />
        <StatCard label="Net Payable"        value={inr(t.outwardGST)}   icon={<Percent className="w-5 h-5" />} accent="rose" />
      </div>

      {sections.map((sec) => (
        <div key={sec.title} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-3 bg-indigo-600">
            <h3 className="text-xs font-semibold text-indigo-100 uppercase tracking-wider">{sec.title}</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                <th className="px-5 py-2.5 text-left w-1/2">Description</th>
                <th className="px-5 py-2.5 text-right">Taxable Value</th>
                <th className="px-5 py-2.5 text-right">CGST</th>
                <th className="px-5 py-2.5 text-right">SGST / UTGST</th>
                <th className="px-5 py-2.5 text-right">IGST</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sec.rows.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/70">
                  <td className="px-5 py-3 text-slate-600 leading-snug">{row.desc}</td>
                  <td className="px-5 py-3 text-right font-medium text-slate-800 tabular-nums">{row.taxable > 0 ? inr(row.taxable) : "—"}</td>
                  <td className="px-5 py-3 text-right text-slate-600 tabular-nums">{row.cgst > 0 ? inr(row.cgst) : "—"}</td>
                  <td className="px-5 py-3 text-right text-slate-600 tabular-nums">{row.sgst > 0 ? inr(row.sgst) : "—"}</td>
                  <td className="px-5 py-3 text-right text-slate-600 tabular-nums">{row.igst > 0 ? inr(row.igst) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      <DetailTable data={data} type="gstr3b" />
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
export default function GSTReport() {
  const { error, info } = useToast();
  const { exportExcel, exportPDF, printTable } = useExport();

  /* ── filter state ── */
  const [filters, setFilters] = useState({
    month: "April",
    financialYear: "2024-25",
    supplyType: "All",
    gstSlab: "All",
  });
  const [appliedFilters, setAppliedFilters] = useState({ ...filters });
  const [activeTab, setActiveTab] = useState("summary");

  /* ── filtered data ── */
  const filteredData = useMemo(() => {
    return RAW_DATA.filter((r) => {
      const matchSupply = appliedFilters.supplyType === "All" || r.supplyType === appliedFilters.supplyType;
      const matchSlab   = appliedFilters.gstSlab === "All"    || r.gstSlab === parseInt(appliedFilters.gstSlab);
      return matchSupply && matchSlab;
    });
  }, [appliedFilters]);

  const handleSearch = () => {
    setAppliedFilters({ ...filters });
  };

  const handleReset = () => {
    const def = { month: "April", financialYear: "2024-25", supplyType: "All", gstSlab: "All" };
    setFilters(def);
    setAppliedFilters(def);
  };

  const handleExport = (type) => {
    if (filteredData.length === 0) { error("No data to export."); return; }
    const config = {
      fileName: `GST_Report_${appliedFilters.month}_${appliedFilters.financialYear}`,
      title: `GST Report – ${appliedFilters.month} ${appliedFilters.financialYear}`,
      columns: [
        { key: "invoiceNo",    header: "Invoice No" },
        { key: "invoiceDate",  header: "Invoice Date" },
        { key: "gstin",        header: "GSTIN" },
        { key: "party",        header: "Party Name" },
        { key: "supplyType",   header: "Supply Type" },
        { key: "taxableValue", header: "Taxable Value" },
        { key: "cgst",         header: "CGST" },
        { key: "sgst",         header: "SGST" },
        { key: "igst",         header: "IGST" },
        { key: "gstSlab",      header: "GST Slab %" },
        { key: "status",       header: "Status" },
      ],
      rows: filteredData,
    };
    if (type === "excel") exportExcel(config);
    else if (type === "pdf") exportPDF(config);
    else if (type === "print") { printTable(config); info("Preparing print view…"); }
  };

  const inputCls =
    "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all appearance-none";

  /* ══════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">

      {/* ── HEADER ── */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center">
            <FileCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">GST Report</h1>
            <p className="text-[11px] text-slate-400 font-medium uppercase tracking-widest">
              {appliedFilters.month} · FY {appliedFilters.financialYear}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400 font-mono hidden md:block">GSTIN: 27AAECW5370P1ZS</span>
          <button onClick={() => handleExport("excel")} className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-slate-600 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5 transition-all">
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> Excel
          </button>
          <button onClick={() => handleExport("pdf")} className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-slate-600 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5 transition-all">
            <FileText className="w-4 h-4 text-rose-500" /> PDF
          </button>
          <button onClick={() => handleExport("print")} className="h-9 px-3 rounded-lg bg-slate-800 text-white text-xs font-semibold hover:bg-slate-900 flex items-center gap-1.5 transition-all">
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </div>

      {/* ── FILTERS ── */}
      <div className="mx-6 mt-4 bg-white rounded-xl border border-slate-200 p-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Month</label>
            <select value={filters.month} onChange={(e) => setFilters((f) => ({ ...f, month: e.target.value }))} className={inputCls}>
              {MONTHS.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Financial Year</label>
            <select value={filters.financialYear} onChange={(e) => setFilters((f) => ({ ...f, financialYear: e.target.value }))} className={inputCls}>
              {YEARS.map((y) => <option key={y}>{y}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Supply Type</label>
            <select value={filters.supplyType} onChange={(e) => setFilters((f) => ({ ...f, supplyType: e.target.value }))} className={inputCls}>
              {SUPPLY_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">GST Slab</label>
            <select value={filters.gstSlab} onChange={(e) => setFilters((f) => ({ ...f, gstSlab: e.target.value }))} className={inputCls}>
              {GST_SLABS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={handleSearch} className="h-10 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition-all active:scale-95 shadow-sm">
            <Search className="w-4 h-4" /> Generate Report
          </button>
          <button onClick={handleReset} className="h-10 px-5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all active:scale-95">
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="mx-6 mt-4">
        <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── TAB CONTENT ── */}
      <div className="mx-6 mt-4 mb-8">
        {activeTab === "summary" && <SummaryTab data={filteredData} />}
        {activeTab === "gstr1"   && <DetailTable data={filteredData} type="gstr1" />}
        {activeTab === "gstr2"   && <DetailTable data={filteredData} type="gstr2" />}
        {activeTab === "gstr3b"  && <GSTR3BTab   data={filteredData} />}
      </div>

    </div>
  );
}