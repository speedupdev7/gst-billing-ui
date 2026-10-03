import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import {
  Save, Printer, Mail, Send, Truck, XCircle, X, Search, Clock, Calendar, Hash,
  RefreshCcw, User, CreditCard, Landmark, CheckCircle, RotateCcw, AlertCircle,
  List, Loader2, Phone, MapPin, FileText, ArrowRight, Package, Users,
  ClipboardList, Receipt, History, Eraser, ChevronDown
} from 'lucide-react';
import DatePicker from "react-datepicker";
import { usePayment } from "../contextapi/PaymentContext";
import { useToast } from "../contextapi/ToastContext";
import MultiTransaction from "../contextapi/MultiTransaction";
import "react-datepicker/dist/react-datepicker.css";
import axios from 'axios';

/* ════════════════════════════════════════════════════════════
   Palette (unchanged, rose-dominant)
   Top bar    #881337 → #be123c → #9f1239
   Sections   rose-50/100/200 tints
   Table      #1a0808 → #111111 header with rose / blue / emerald accents
   CTA        rose gradient (return) · emerald gradient (invoice)
   Action bar #1c0a0a → #3b0d0d
   ════════════════════════════════════════════════════════════ */

/* ════════════════════════════════════════════════════════════
   Pure helpers
   ════════════════════════════════════════════════════════════ */
const fmtINR = (n) =>
  Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const splitAmount = (n) => {
  const [i, d] = Number(n || 0).toFixed(2).split('.');
  return { int: Number(i).toLocaleString('en-IN'), dec: d };
};

const sameLine = (a, row) =>
  a.invoiceItemId != null && row.invoiceItemId != null
    ? a.invoiceItemId === row.invoiceItemId
    : a.itemId === row.itemId;

// Everything on screen is derived from the raw rows → nothing goes stale.
const computeRows = (rows) => {
  const T = { gross: 0, disc: 0, taxable: 0, gst: 0, cgst: 0, sgst: 0, igst: 0 };
  const R = { gross: 0, disc: 0, taxable: 0, gst: 0, cgst: 0, sgst: 0, igst: 0 };

  const items = rows.map(item => {
    const rate = Number(item.rate) || 0;
    const qty = Number(item.qty) || 0;
    const rq = Number(item.returnQty) || 0;
    const dp = Number(item.discP) || 0;
    const gp = Number(item.gstP) || 0;
    const calc = (q) => {
      const gross = q * rate;
      const disc = (gross * dp) / 100;
      const taxable = gross - disc;
      const tax = (taxable * gp) / 100;
      return { gross, disc, taxable, tax, total: taxable + tax };
    };
    const inv = calc(qty);
    const ret = calc(rq);
    const active = rq > 0 ? ret : inv;
    const split = (t) => (item.isIgst ? { cgst: 0, sgst: 0, igst: t } : { cgst: t / 2, sgst: t / 2, igst: 0 });

    T.gross += inv.gross; T.disc += inv.disc; T.taxable += inv.taxable; T.gst += inv.tax;
    const is = split(inv.tax); T.cgst += is.cgst; T.sgst += is.sgst; T.igst += is.igst;
    R.gross += ret.gross; R.disc += ret.disc; R.taxable += ret.taxable; R.gst += ret.tax;
    const rs = split(ret.tax); R.cgst += rs.cgst; R.sgst += rs.sgst; R.igst += rs.igst;

    return {
      ...item,
      grossAmount: inv.gross, discA: inv.disc, taxableAmt: inv.taxable, gstA: inv.tax, lineTotal: inv.total,
      ret, active, split: split(active.tax)
    };
  });

  const raw = T.taxable + T.gst, rounded = Math.round(raw);
  return {
    items,
    totals: {
      totalGross: T.gross, totalDisc: T.disc, totalTaxable: T.taxable, totalGST: T.gst,
      totalCgst: T.cgst, totalSgst: T.sgst, totalIgst: T.igst,
      invoiceTotal: rounded, roundOff: (rounded - raw).toFixed(2)
    },
    returnTotals: { ...R, total: R.taxable + R.gst }
  };
};

/* ════════════════════════════════════════════════════════════
   Design tokens
   ════════════════════════════════════════════════════════════ */
const inputCls =
  "w-full h-10 rounded-xl border border-rose-200 bg-white px-3 text-[13px] font-medium text-slate-700 " +
  "placeholder:text-slate-300 placeholder:font-normal shadow-sm outline-none transition-all duration-150 " +
  "hover:border-rose-300 focus:border-rose-400 focus:ring-4 focus:ring-rose-100";
const roInput = "!bg-slate-50 !text-slate-600 cursor-default";

const btnBase =
  "group relative inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl text-[13px] font-semibold whitespace-nowrap select-none " +
  "transition-all duration-200 ease-out active:scale-[0.96] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 " +
  "disabled:opacity-50 disabled:pointer-events-none";
const btn = {
  // header (on rose)
  headerWhite: `${btnBase} bg-white text-rose-800 shadow-lg shadow-rose-950/30 hover:bg-rose-50 hover:-translate-y-px focus-visible:ring-white focus-visible:ring-offset-[#9f1239]`,
  headerGhost: `${btnBase} !h-9 bg-white/10 text-white border border-white/20 backdrop-blur hover:bg-white/20 hover:border-white/30 hover:-translate-y-px focus-visible:ring-white/70 focus-visible:ring-offset-[#9f1239]`,
  // dark action bar
  primary: `${btnBase} bg-gradient-to-b from-rose-600 to-rose-700 text-white border border-rose-400/30 shadow-lg shadow-rose-600/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] hover:from-rose-500 hover:to-rose-600 hover:-translate-y-px focus-visible:ring-rose-400 focus-visible:ring-offset-[#1c0a0a] disabled:!bg-none disabled:!bg-[#4b1c1c] disabled:!shadow-none disabled:!border-rose-950`,
  secondary: `${btnBase} bg-rose-900/40 text-rose-50 border border-rose-700/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:bg-rose-800 hover:border-rose-600 hover:-translate-y-px focus-visible:ring-rose-300 focus-visible:ring-offset-[#1c0a0a]`,
  indigo: `${btnBase} bg-indigo-500/10 text-indigo-300 border border-indigo-400/30 hover:bg-indigo-600 hover:text-white hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-600/30 hover:-translate-y-px focus-visible:ring-indigo-400 focus-visible:ring-offset-[#1c0a0a]`,
  orange: `${btnBase} bg-orange-500/10 text-orange-300 border border-orange-400/30 hover:bg-orange-600 hover:text-white hover:border-orange-400 hover:shadow-lg hover:shadow-orange-600/30 hover:-translate-y-px focus-visible:ring-orange-400 focus-visible:ring-offset-[#1c0a0a]`,
  ghostDanger: `${btnBase} text-rose-300/60 hover:text-red-300 hover:bg-red-500/10 focus-visible:ring-red-400 focus-visible:ring-offset-[#1c0a0a]`,
};

const tones = {
  rose: {
    wrap: 'border-rose-200/60',
    strip: 'bg-gradient-to-r from-rose-100/70 to-rose-50/30 border-rose-200/60',
    chip: 'from-rose-400 to-rose-500 shadow-rose-500/30',
    title: 'text-rose-900',
    sub: 'text-rose-700/70',
  },
  slate: {
    wrap: 'border-slate-200',
    strip: 'bg-gradient-to-r from-slate-100 to-slate-50 border-slate-200',
    chip: 'from-slate-700 to-slate-900 shadow-slate-900/25',
    title: 'text-slate-800',
    sub: 'text-slate-500',
  },
  blue: {
    wrap: 'border-slate-200',
    strip: 'bg-gradient-to-r from-blue-50 to-white border-blue-100',
    chip: 'from-blue-500 to-blue-600 shadow-blue-500/30',
    title: 'text-slate-800',
    sub: 'text-slate-500',
  },
};

/* ════════════════════════════════════════════════════════════
   Presentational components
   (kept OUTSIDE the main component — defining them inside remounts
    every input on each keystroke and kills focus)
   ════════════════════════════════════════════════════════════ */
const Field = ({ label, htmlFor, children, className = '' }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <label htmlFor={htmlFor} className="text-[12px] font-semibold text-slate-500">{label}</label>
    {children}
  </div>
);

const IconInput = React.forwardRef(({ icon: Icon, iconClass = 'text-slate-400', className = '', right, ...props }, ref) => (
  <div className="relative">
    {Icon && <Icon size={15} className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${iconClass}`} />}
    <input ref={ref} className={`${inputCls} ${Icon ? 'pl-9' : ''} ${right ? 'pr-9' : ''} ${className}`} {...props} />
    {right && <span className="absolute right-3 top-1/2 -translate-y-1/2">{right}</span>}
  </div>
));

const Section = ({ icon: Icon, title, subtitle, tone = 'rose', bodyClass = '', action, children }) => {
  const t = tones[tone];
  return (
    <section className={`border-t ${t.wrap}`}>
      <div className={`flex items-center gap-3 border-b px-6 py-3 ${t.strip}`}>
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md ${t.chip}`}>
          <Icon size={15} />
        </span>
        <div className="min-w-0">
          <h3 className={`text-[14px] font-bold leading-tight ${t.title}`}>{title}</h3>
          {subtitle && <p className={`text-[11.5px] ${t.sub}`}>{subtitle}</p>}
        </div>
        {action && <div className="ml-auto">{action}</div>}
      </div>
      <div className={`px-6 py-5 ${bodyClass}`}>{children}</div>
    </section>
  );
};

const StatRow = ({ label, value, tone = 'text-slate-900' }) => (
  <div className="flex items-center justify-between gap-3 py-2.5 text-[13px]">
    <dt className="font-medium text-slate-500">{label}</dt>
    <dd className={`font-bold tabular-nums ${tone}`}>{value}</dd>
  </div>
);

const StatCard = ({ title, bar, text, boxCls, children }) => (
  <div className={`rounded-2xl border p-5 transition-colors duration-300 ${boxCls}`}>
    <div className="mb-1 flex items-center gap-2 border-b border-inherit pb-3">
      <span className={`h-4 w-1.5 rounded-full ${bar}`} />
      <h4 className={`text-[13px] font-bold ${text}`}>{title}</h4>
    </div>
    <dl className="divide-y divide-dashed divide-slate-200">{children}</dl>
  </div>
);

/* ════════════════════════════════════════════════════════════
   Main component
   ════════════════════════════════════════════════════════════ */
const BillingReturnV4 = () => {
  const location = useLocation();
  const invoiceFromList = location.state?.invoice;
  const toast = useToast();
  const navigate = useNavigate();
  const screenKey = "return";

  const { showPaymentModal, setShowPaymentModal } = usePayment();

  // invoice header
  const [invoiceDate, setInvoiceDate] = useState(new Date());
  const [invoiceTime, setInvoiceTime] = useState(new Date());
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [loadedInvoiceNo, setLoadedInvoiceNo] = useState(null);
  const [isLoadingInvoice, setIsLoadingInvoice] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [narration, setNarration] = useState('');

  // customer
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerSuggestions, setCustomerSuggestions] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [customerHighlight, setCustomerHighlight] = useState(0);

  // rows
  const [rawItems, setRawItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [returnAll, setReturnAll] = useState(false);

  // return meta
  const [returnHistory, setReturnHistory] = useState([]);
  const [isLoadingReturns, setIsLoadingReturns] = useState(false);
  const [returnReasonCode, setReturnReasonCode] = useState('DEFECT');
  const [returnReasonText, setReturnReasonText] = useState('');
  const [returnRemarks, setReturnRemarks] = useState('');
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);
  const [printError, setPrintError] = useState(null);

  // refs
  const returnQtyRefs = useRef({});
  const customerDropdownRef = useRef(null);
  const customerTimer = useRef(null);
  const invoiceTimer = useRef(null);
  const invoiceReqId = useRef(0);   // ignore out-of-order invoice responses

  // ── derived ──────────────────────────────────────────────
  const { items, totals, returnTotals } = useMemo(() => computeRows(rawItems), [rawItems]);
  const adjustmentList = items.filter(i => Number(i.returnQty) > 0);
  const isReturnActive = adjustmentList.length > 0;
  const payable = isReturnActive ? returnTotals.total : totals.invoiceTotal;
  const payableParts = splitAmount(payable);

  // how much of a line can still be returned (original qty − already returned)
  const getAvail = (row) => {
    const returned = (returnHistory || []).reduce((sum, ret) => (
      sum + (ret.items || []).filter(i => sameLine(i, row)).reduce((s, i) => s + (Number(i.quantity) || 0), 0)
    ), 0);
    return Math.max(0, (Number(row.qty) || 0) - returned);
  };

  // ── invoice loading ──────────────────────────────────────
  const fetchReturnHistory = async (invNo) => {
    try {
      setIsLoadingReturns(true);
      const res = await axios.get(`/api/invoice/${encodeURIComponent(invNo)}/returns`);
      const returns = res.data?.data || res.data || [];
      setReturnHistory(Array.isArray(returns) ? returns : []);
    } catch { setReturnHistory([]); }
    finally { setIsLoadingReturns(false); }
  };

  const getInvoiceByNumber = async (invNo) => {
    const q = (invNo || '').trim();
    if (q.length < 3) return;
    const req = ++invoiceReqId.current;
    setIsLoadingInvoice(true);
    setLoadError('');
    try {
      const res = await axios.get('/api/invoice/search-by-number', { params: { invoiceNo: q } });
      if (req !== invoiceReqId.current) return;
      const data = res.data?.data || res.data;
      if (!data) { setLoadError('No invoice found with this number'); return; }

      const customer = data.customer || data.unit || data.customerMaster || null;
      setSelectedCustomer(customer);
      setCustomerSearch(customer?.customerName || customer?.name || data.customerName || '');
      setShowCustomerDropdown(false);
      const apiInvoiceNo = data.invoiceNo || q;
      setInvoiceNo(apiInvoiceNo); setLoadedInvoiceNo(apiInvoiceNo);
      if (data.invoiceDate) setInvoiceDate(new Date(data.invoiceDate));
      setNarration(data.narration || '');

      const invoiceItems = data.invoiceItems || data.items || [];
      setRawItems(invoiceItems.map(item => ({
        id: Date.now() + Math.random(),
        invoiceItemId: item.invoiceItemId || item.id,
        itemId: item.itemId,
        itemName: item.itemName || item.item?.itemName || '',
        batch: item.batchCode || item.batch || '',
        hsn: item.hsnCode || item.hsn || '0000',
        rate: item.rate ?? 0, qty: item.quantity ?? item.qty ?? 0, returnQty: 0,
        discP: item.discountPct ?? item.discP ?? 0,
        gstP: item.gstRate ?? 0,
        isIgst: (item.igstAmt ?? 0) > 0,
      })));
      setEditingId(null);
      setReturnAll(false);
      fetchReturnHistory(apiInvoiceNo);
    } catch (err) {
      if (req !== invoiceReqId.current) return;
      setLoadError(err.response?.status === 404 ? 'No invoice found with this number' : 'Could not load the invoice. Try again.');
    } finally {
      if (req === invoiceReqId.current) setIsLoadingInvoice(false);
    }
  };

  // kept for parity with the API response (not rendered directly)
  const [, setOriginalInvoiceData] = useState(null);

  const handleInvoiceSearchChange = (v) => {
    setInvoiceSearch(v);
    setLoadError('');
    if (invoiceTimer.current) clearTimeout(invoiceTimer.current);
    if (v.trim().length < 3) return;
    invoiceTimer.current = setTimeout(() => getInvoiceByNumber(v), 450);
  };

  const handleInvoiceSearchKeyDown = (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    if (invoiceTimer.current) clearTimeout(invoiceTimer.current);
    getInvoiceByNumber(invoiceSearch);
  };

  useEffect(() => {
    if (invoiceFromList?.invoiceNo) {
      setInvoiceSearch(invoiceFromList.invoiceNo);
      getInvoiceByNumber(invoiceFromList.invoiceNo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceFromList]);

  useEffect(() => () => {
    if (customerTimer.current) clearTimeout(customerTimer.current);
    if (invoiceTimer.current) clearTimeout(invoiceTimer.current);
  }, []);

  // ── customer search ──────────────────────────────────────
  const searchCustomers = (q) => {
    if (customerTimer.current) clearTimeout(customerTimer.current);
    if (q.length < 3) {
      setCustomerSuggestions(prev => (prev.length ? [] : prev));
      setShowCustomerDropdown(false);
      return;
    }
    customerTimer.current = setTimeout(async () => {
      try {
        const res = await axios.get(`/api/customer-master/search?q=${encodeURIComponent(q)}`);
        const list = Array.isArray(res.data) ? res.data : [];
        setCustomerSuggestions(list);
        setCustomerHighlight(0);
        setShowCustomerDropdown(list.length > 0);
      } catch { setCustomerSuggestions([]); setShowCustomerDropdown(false); }
    }, 250);
  };

  const selectCustomer = (c) => {
    if (customerTimer.current) clearTimeout(customerTimer.current);
    setSelectedCustomer(c);
    setCustomerSearch(c.customerName);
    setCustomerSuggestions([]);
    setCustomerHighlight(0);
    setShowCustomerDropdown(false);
  };

  const handleCustomerKeyDown = (e) => {
    const n = customerSuggestions.length;
    if (!n) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!showCustomerDropdown) { setShowCustomerDropdown(true); return; }
      setCustomerHighlight(h => (h + 1) % n);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCustomerHighlight(h => (h - 1 + n) % n);
    } else if (e.key === 'Enter' && showCustomerDropdown) {
      e.preventDefault();
      selectCustomer(customerSuggestions[customerHighlight] || customerSuggestions[0]);
    } else if (e.key === 'Escape') {
      setShowCustomerDropdown(false);
    }
  };

  useEffect(() => {
    customerDropdownRef.current?.children[customerHighlight]?.scrollIntoView({ block: 'nearest' });
  }, [customerHighlight, showCustomerDropdown]);

  // ── return-qty editing ───────────────────────────────────
  const toggleEdit = (id) => setEditingId(prev => (prev === id ? null : id));

  // focus the return-qty box as soon as a row is switched to edit mode
  useEffect(() => {
    if (editingId == null) return;
    const idx = rawItems.findIndex(r => r.id === editingId);
    const el = returnQtyRefs.current[idx];
    if (el) { el.focus(); el.select(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingId]);

  const setReturnQty = (id, v) =>
    setRawItems(prev => prev.map(r => (r.id === id ? { ...r, returnQty: v } : r)));

  const handleReturnQtyKeyDown = (e, idx) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // confirm and jump to the next row that still has stock to return
      const next = items.slice(idx + 1).find(r => getAvail(r) > 0);
      setEditingId(next ? next.id : null);
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  const handleReturnAll = (checked) => {
    setReturnAll(checked);
    setEditingId(null);
    setRawItems(prev => prev.map(r => ({ ...r, returnQty: checked ? getAvail(r) : 0 })));
  };

  const handleClearAll = () => {
    setReturnAll(false);
    setEditingId(null);
    setRawItems(prev => prev.map(r => ({ ...r, returnQty: 0 })));
  };

  const openPayment = () => {
    localStorage.setItem('activePaymentScreen', screenKey);
    setShowPaymentModal(true);
  };

  // ── submit ───────────────────────────────────────────────
  const submitReturn = async () => {
    const invNo = loadedInvoiceNo;
    if (!invNo) { toast.error('Load an invoice first.'); return; }
    const lines = adjustmentList.map(item => ({
      invoiceItemId: item.invoiceItemId || item.itemId, itemId: item.itemId,
      batchCode: item.batch || 'BATCH01', hsnCode: item.hsn || '0000',
      quantity: Number(item.returnQty), rate: item.rate,
      grossAmount: item.ret.gross,
      discountPct: item.discP,
      discountAmt: item.ret.disc,
      taxableAmount: item.ret.taxable,
      gstRate: item.gstP,
      cgstAmt: item.isIgst ? 0 : item.ret.tax / 2,
      sgstAmt: item.isIgst ? 0 : item.ret.tax / 2,
      igstAmt: item.isIgst ? item.ret.tax : 0,
      lineTotal: item.ret.total,
    }));
    if (lines.length === 0) { toast.error('Please select items to return'); return; }
    const payload = {
      invoiceNo: invNo,
      returnNo: `RTN-${new Date().getFullYear()}-${Date.now()}`,
      returnDate: new Date().toISOString().split('T')[0],
      returnType: 'RETURN', reasonCode: returnReasonCode,
      reasonText: returnReasonText, remarks: returnRemarks, items: lines,
    };
    try {
      setIsSubmittingReturn(true);
      const res = await axios.post('/api/invoice/returns', payload);
      if (res.status === 200 || res.status === 201) {
        toast.success('Return submitted successfully!');
        setReturnReasonCode('DEFECT'); setReturnReasonText(''); setReturnRemarks('');
        setRawItems(prev => prev.map(i => ({ ...i, returnQty: 0 })));
        setReturnAll(false);
        setEditingId(null);
        fetchReturnHistory(invNo);
      }
    } catch (err) {
      toast.error(`Error: ${err.response?.data?.message || err.message}`);
    } finally { setIsSubmittingReturn(false); }
  };

  // ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-rose-50/20 p-3 font-poppins text-[13px] text-slate-700 md:p-6">
      <div className="mx-auto max-w-[1500px] rounded-3xl border border-rose-200/60 bg-white shadow-2xl shadow-rose-900/5">

        {/* ── TOP BAR ──────────────────────────────────────── */}
        <header
          className="relative flex flex-wrap items-center gap-x-5 gap-y-3 overflow-hidden rounded-t-3xl border-b border-white/10 px-6 py-4 text-white shadow-xl"
          style={{ background: 'linear-gradient(135deg, #881337 0%, #be123c 45%, #9f1239 100%)' }}
        >
          <div className="pointer-events-none absolute -left-10 -top-16 h-40 w-40 rounded-full bg-rose-300/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-10 -bottom-16 h-40 w-40 rounded-full bg-pink-300/20 blur-3xl" />

          <div className="relative flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-300 to-rose-600 shadow-lg shadow-rose-950/40 ring-1 ring-white/25">
              <RefreshCcw size={19} className="text-white" />
            </span>
            <div>
              <h1 className="text-[16px] font-bold leading-tight tracking-wide text-white">Billing Return</h1>
              <p className="text-[11.5px] font-medium text-rose-100/70">Credit note entry</p>
            </div>
          </div>

          <div className="relative hidden h-9 w-px bg-rose-200/20 sm:block" />

          {/* Return all switch */}
          <button
            type="button"
            role="switch"
            aria-checked={returnAll}
            disabled={items.length === 0}
            onClick={() => handleReturnAll(!returnAll)}
            className="relative flex items-center gap-2.5 rounded-full py-1 pl-1 pr-3 transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 disabled:pointer-events-none disabled:opacity-40"
          >
            <span className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ${returnAll ? 'bg-rose-200' : 'bg-rose-950/60 ring-1 ring-inset ring-white/15'}`}>
              <span className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full shadow-md transition-transform duration-200 ${returnAll ? 'translate-x-4 bg-rose-700' : 'bg-white'}`} />
            </span>
            <span className="text-[12.5px] font-semibold text-rose-50/90">Return all</span>
          </button>

          <button type="button" onClick={handleClearAll} disabled={!isReturnActive} className={`relative ${btn.headerGhost}`}>
            <Eraser size={14} />
            Clear all
          </button>

          {isReturnActive && (
            <div className="relative flex items-center gap-2 rounded-xl border border-rose-200/25 bg-rose-950/30 px-3 py-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-200" />
              <span className="text-[12px] font-semibold text-rose-50">
                {adjustmentList.length} item{adjustmentList.length > 1 ? 's' : ''} selected
              </span>
            </div>
          )}

          <div className="relative ml-auto">
            <button type="button" onClick={() => navigate('/billing-return-v4-list')} className={btn.headerWhite}>
              <List size={15} />
              View all returns
            </button>
          </div>
        </header>

        {/* ── ERROR BANNER ─────────────────────────────────── */}
        {printError && (
          <div role="alert" className="flex items-start gap-3 border-b border-red-200 bg-red-50 px-6 py-3 text-red-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-[13px] font-bold">Something went wrong</p>
              <p className="mt-0.5 text-[12px] text-red-600">{printError}</p>
            </div>
            <button
              type="button" onClick={() => setPrintError(null)} aria-label="Dismiss"
              className="rounded-lg p-1 text-red-500 transition-colors hover:bg-red-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* ── INVOICE REFERENCE ────────────────────────────── */}
        <Section icon={ClipboardList} title="Invoice reference & header" subtitle="Search the original invoice to load its items" tone="rose" bodyClass="bg-rose-50/30">
          <div className="grid grid-cols-12 gap-4">
            <Field label="Search & load invoice" htmlFor="invoiceSearch" className="col-span-12 sm:col-span-6 lg:col-span-3">
              <IconInput
                id="invoiceSearch" icon={Search} iconClass="text-rose-400" autoComplete="off"
                placeholder="Type invoice number..."
                value={invoiceSearch}
                onChange={e => handleInvoiceSearchChange(e.target.value)}
                onKeyDown={handleInvoiceSearchKeyDown}
                right={isLoadingInvoice ? <Loader2 size={15} className="animate-spin text-rose-400" /> : null}
              />
              {loadError && (
                <p className="flex items-center gap-1 text-[11.5px] font-medium text-red-600">
                  <AlertCircle size={12} /> {loadError}
                </p>
              )}
            </Field>

            <Field label="Invoice no. (loaded)" htmlFor="invoiceNo" className="col-span-12 sm:col-span-6 lg:col-span-3">
              <input id="invoiceNo" className={`${inputCls} ${roInput} !font-bold !text-rose-700`} placeholder="INV/2024/0001" value={invoiceNo} readOnly />
            </Field>

            <Field label="Invoice date" htmlFor="invoiceDate" className="col-span-12 sm:col-span-6 lg:col-span-3">
              <div className="relative">
                <Calendar size={15} className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-rose-400" />
                <DatePicker
                  id="invoiceDate"
                  selected={invoiceDate} onChange={d => d && setInvoiceDate(d)}
                  dateFormat="dd MMM yyyy" showYearDropdown showMonthDropdown dropdownMode="select"
                  wrapperClassName="!block w-full" popperClassName="!z-50"
                  className={`${inputCls} pl-9`}
                  calendarClassName="!rounded-xl !border !border-rose-200 !shadow-xl"
                />
              </div>
            </Field>

            <Field label="Time" htmlFor="invoiceTime" className="col-span-12 sm:col-span-6 lg:col-span-3">
              <div className="relative">
                <Clock size={15} className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-rose-400" />
                <DatePicker
                  id="invoiceTime"
                  selected={invoiceTime} onChange={t => t && setInvoiceTime(t)}
                  showTimeSelect showTimeSelectOnly timeIntervals={5} timeCaption="Time" dateFormat="hh:mm aa"
                  wrapperClassName="!block w-full" popperClassName="!z-50"
                  className={`${inputCls} pl-9`}
                />
              </div>
            </Field>
          </div>
        </Section>

        {/* ── CUSTOMER ─────────────────────────────────────── */}
        <Section icon={Users} title="Customer details" subtitle="Filled automatically from the loaded invoice" tone="rose" bodyClass="bg-white">
          <div className="grid grid-cols-12 gap-4">
            <Field label="Customer ID" htmlFor="customerId" className="col-span-12 sm:col-span-6 lg:col-span-2">
              <IconInput id="customerId" icon={Hash} className="!bg-slate-50" placeholder="CUST-001" />
            </Field>

            <Field label="Customer name" htmlFor="customerName" className="col-span-12 sm:col-span-6 lg:col-span-4">
              <div className="relative">
                <User size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="customerName"
                  autoComplete="off"
                  role="combobox"
                  aria-expanded={showCustomerDropdown}
                  aria-autocomplete="list"
                  className={`${inputCls} pl-9 !font-bold`}
                  placeholder="Search or enter name..."
                  value={customerSearch}
                  onChange={e => { setCustomerSearch(e.target.value); searchCustomers(e.target.value); }}
                  onKeyDown={handleCustomerKeyDown}
                  onFocus={() => customerSuggestions.length > 0 && setShowCustomerDropdown(true)}
                  onBlur={() => {
                    if (customerTimer.current) clearTimeout(customerTimer.current);
                    setShowCustomerDropdown(false);
                  }}
                />
                {showCustomerDropdown && customerSuggestions.length > 0 && (
                  <div
                    ref={customerDropdownRef}
                    role="listbox"
                    onMouseDown={e => e.preventDefault()}
                    className="absolute left-0 top-full z-30 mt-1.5 max-h-56 w-full min-w-[280px] overflow-y-auto rounded-2xl border border-rose-200 bg-white p-1.5 shadow-2xl shadow-rose-900/10"
                  >
                    {customerSuggestions.map((c, i) => (
                      <div
                        key={c.customerId ?? i}
                        role="option"
                        aria-selected={i === customerHighlight}
                        onMouseEnter={() => setCustomerHighlight(i)}
                        onMouseDown={e => { e.preventDefault(); selectCustomer(c); }}
                        className={`cursor-pointer rounded-xl px-3 py-2.5 transition-colors ${i === customerHighlight ? 'bg-rose-50 ring-1 ring-inset ring-rose-200' : ''}`}
                      >
                        <p className="text-[13px] font-bold text-slate-700">{c.customerName}</p>
                        <p className="mt-0.5 text-[11px] text-slate-400">{[c.gstin, c.state].filter(Boolean).join('  •  ')}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Field>

            <Field label="GST number" htmlFor="gstin" className="col-span-12 sm:col-span-6 lg:col-span-3">
              <IconInput id="gstin" icon={Landmark} className={`uppercase ${roInput}`} placeholder="27AAAAA0000A1Z5" value={selectedCustomer?.gstin || ''} readOnly />
            </Field>

            <Field label="Mobile" htmlFor="mobile" className="col-span-12 sm:col-span-6 lg:col-span-3">
              <IconInput id="mobile" icon={Phone} className={roInput} placeholder="98XXXXXXXX" value={selectedCustomer?.mobileNo || ''} readOnly />
            </Field>
          </div>
        </Section>

        {/* ── ITEM TABLE ───────────────────────────────────── */}
        <Section
          icon={Package}
          title="Return items"
          subtitle="Click the return icon on a row, type the quantity, press Enter to confirm and move to the next row"
          tone="slate"
          bodyClass="bg-white"
        >
          <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1150px] border-collapse">
                <thead>
                  <tr
                    className="divide-x divide-white/5 border-b border-white/10 text-[11.5px] font-semibold"
                    style={{ background: 'linear-gradient(180deg, #1a0808 0%, #111111 100%)' }}
                  >
                    <th className="w-12 p-3.5 text-center text-slate-500">#</th>
                    <th className="min-w-[240px] bg-white/[0.02] p-3.5 text-left text-slate-100/90">Item description</th>
                    <th className="w-24 p-3.5 text-center text-slate-400">Batch</th>
                    <th className="w-28 bg-slate-800/30 p-3.5 text-right text-slate-300/70">Rate</th>
                    <th className="w-20 bg-slate-800/30 p-3.5 text-right text-slate-300/70">Qty</th>
                    <th className="w-20 p-3.5 text-right text-blue-300/80">Avail</th>
                    <th className="w-32 bg-rose-400/[0.08] p-3.5 text-right font-bold text-rose-300 shadow-[inset_0_-2px_0_rgba(244,63,94,0.25)]">Return qty</th>
                    <th className="w-28 p-3.5 text-right font-medium text-slate-500">Gross</th>
                    <th className="w-20 bg-rose-400/[0.03] p-3.5 text-right text-rose-400/70">Disc %</th>
                    <th className="w-28 bg-[#1c1c1c] p-3.5 text-right text-slate-200">Taxable</th>
                    <th className="w-24 p-3.5 text-right text-slate-400">GST %</th>
                    <th className="w-36 bg-emerald-500/[0.08] p-3.5 text-right font-bold text-emerald-300 shadow-[inset_0_-2px_0_rgba(16,185,129,0.25)]">Total</th>
                    <th className="w-20 p-3.5 text-center text-slate-500">Return</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 bg-white">
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={13} className="px-6 py-14 text-center">
                        <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-400 ring-1 ring-rose-100">
                          <Package size={22} />
                        </span>
                        <p className="text-[14px] font-semibold text-slate-700">No invoice loaded yet</p>
                        <p className="mt-1 text-[12px] text-slate-400">Search an invoice number above to load its items for return.</p>
                      </td>
                    </tr>
                  )}

                  {items.map((item, idx) => {
                    const isEditing = editingId === item.id;
                    const avail = getAvail(item);
                    const hasReturn = Number(item.returnQty) > 0;
                    const soldOut = avail === 0;

                    return (
                      <tr key={item.id} className={`transition-colors duration-100 ${hasReturn ? 'bg-rose-50/40' : 'hover:bg-rose-50/20'} ${isEditing ? '!bg-rose-50/60' : ''}`}>
                        <td className="px-3 py-3 text-center align-middle">
                          <span className={`mx-auto flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${hasReturn ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-400'}`}>
                            {idx + 1}
                          </span>
                        </td>

                        {/* Item */}
                        <td className="px-3 py-3 align-middle">
                          <p className="text-[13px] font-semibold text-slate-700">{item.itemName || '—'}</p>
                          <p className="mt-0.5 text-[11px] tabular-nums text-slate-400">
                            <span className={`font-semibold ${hasReturn ? 'text-rose-500' : 'text-slate-500'}`}>{hasReturn ? 'Return' : 'Invoice'}</span>
                            &nbsp;•&nbsp; Disc ₹{fmtINR(item.active.disc)}
                            {item.isIgst
                              ? <> &nbsp;•&nbsp; IGST ₹{fmtINR(item.split.igst)}</>
                              : <> &nbsp;•&nbsp; CGST ₹{fmtINR(item.split.cgst)} &nbsp;•&nbsp; SGST ₹{fmtINR(item.split.sgst)}</>}
                          </p>
                        </td>

                        <td className="px-3 py-3 text-center align-middle text-[12px] text-slate-500">{item.batch || '—'}</td>
                        <td className="bg-slate-50/30 px-3 py-3 text-right align-middle text-[13px] font-medium tabular-nums text-slate-600">{item.rate === 0 ? '—' : fmtINR(item.rate)}</td>
                        <td className="bg-slate-50/30 px-3 py-3 text-right align-middle text-[13px] font-bold tabular-nums text-slate-600">{item.qty}</td>
                        <td className="bg-blue-50/30 px-3 py-3 text-right align-middle text-[13px] font-bold tabular-nums text-blue-600">{avail}</td>

                        {/* Return qty */}
                        <td className="bg-rose-50/30 px-2 py-2 align-middle">
                          <input
                            ref={el => { returnQtyRefs.current[idx] = el; }}
                            className={`h-9 w-full rounded-lg border px-2.5 text-right text-[13px] font-black tabular-nums outline-none transition-all duration-150 ${
                              isEditing
                                ? 'border-rose-300 bg-white text-rose-700 ring-4 ring-rose-100'
                                : 'cursor-default border-transparent bg-transparent text-slate-500'
                            }`}
                            type="text" inputMode="numeric" autoComplete="off"
                            aria-label={`Return quantity for ${item.itemName || `item ${idx + 1}`}`}
                            disabled={!isEditing}
                            value={Number(item.returnQty) === 0 ? '' : item.returnQty}
                            placeholder={isEditing ? `max ${avail}` : '—'}
                            onChange={e => {
                              const raw = e.target.value;
                              if (raw !== '' && !/^\d+$/.test(raw)) return;
                              let v = raw === '' ? 0 : parseInt(raw, 10);
                              if (v > avail) v = avail;
                              setReturnQty(item.id, v);
                              if (returnAll) setReturnAll(false);
                            }}
                            onKeyDown={e => handleReturnQtyKeyDown(e, idx)}
                          />
                        </td>

                        <td className="px-3 py-3 text-right align-middle text-[12px] font-medium tabular-nums text-slate-400">{fmtINR(item.grossAmount)}</td>
                        <td className="px-3 py-3 text-right align-middle text-[13px] tabular-nums text-slate-500">{item.discP || 0}</td>
                        <td className="bg-slate-50/50 px-3 py-3 text-right align-middle text-[12.5px] font-semibold tabular-nums text-slate-700">{fmtINR(item.taxableAmt)}</td>
                        <td className="px-3 py-3 text-right align-middle">
                          <span className="inline-block rounded-lg bg-rose-50/70 px-2.5 py-1 text-[13px] font-black tabular-nums text-rose-600">{item.gstP}</span>
                        </td>
                        <td className={`px-3 py-3 text-right align-middle text-[13px] font-black tabular-nums ${hasReturn ? 'bg-rose-50/40 text-rose-700' : 'bg-emerald-50/20 text-slate-900'}`}>
                          ₹{fmtINR(item.lineTotal)}
                        </td>

                        {/* Toggle edit */}
                        <td className="px-2 py-2 text-center align-middle">
                          <button
                            type="button"
                            onClick={() => toggleEdit(item.id)}
                            disabled={soldOut}
                            aria-pressed={isEditing}
                            aria-label={isEditing ? 'Confirm return quantity' : 'Enable return for this item'}
                            title={soldOut ? 'Fully returned' : isEditing ? 'Confirm' : 'Enable return'}
                            className={`mx-auto flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 active:scale-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 disabled:pointer-events-none disabled:opacity-30 ${
                              isEditing
                                ? 'bg-emerald-50 text-emerald-600 shadow-sm ring-1 ring-emerald-200'
                                : 'bg-slate-100 text-slate-400 hover:bg-rose-50 hover:text-rose-600'
                            }`}
                          >
                            {isEditing ? <CheckCircle size={16} strokeWidth={2.5} /> : <RotateCcw size={15} />}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </Section>

        {/* ── SUMMARY ──────────────────────────────────────── */}
        <Section
          icon={Receipt}
          title={isReturnActive ? 'Return summary' : 'Invoice summary'}
          subtitle={isReturnActive ? 'Showing totals for the selected return quantities' : 'Showing totals for the loaded invoice'}
          tone="blue"
          bodyClass="bg-white"
        >
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <StatCard
                title={isReturnActive ? 'Return tax adjustments' : 'Taxes & adjustments'}
                boxCls={isReturnActive ? 'border-rose-200 bg-rose-50/50' : 'border-slate-200 bg-slate-50'}
                bar={isReturnActive ? 'bg-rose-500' : 'bg-blue-500'}
                text={isReturnActive ? 'text-rose-600' : 'text-blue-600'}
              >
                <StatRow label="Total CGST" value={`₹ ${fmtINR(isReturnActive ? returnTotals.cgst : totals.totalCgst)}`} tone={isReturnActive ? 'text-rose-700' : 'text-black'} />
                <StatRow label="Total SGST" value={`₹ ${fmtINR(isReturnActive ? returnTotals.sgst : totals.totalSgst)}`} tone={isReturnActive ? 'text-rose-700' : 'text-black'} />
                <StatRow label="Total IGST" value={`₹ ${fmtINR(isReturnActive ? returnTotals.igst : totals.totalIgst)}`} tone={isReturnActive ? 'text-rose-700' : 'text-black'} />
                <StatRow label="Round off" value={`₹ ${isReturnActive ? '0.00' : totals.roundOff}`} tone="text-rose-600" />
              </StatCard>

              <StatCard
                title={isReturnActive ? 'Return financials' : 'Invoice totals'}
                boxCls={isReturnActive ? 'border-rose-100 bg-rose-50/30' : 'border-blue-100 bg-blue-50/20'}
                bar={isReturnActive ? 'bg-rose-400' : 'bg-blue-400'}
                text={isReturnActive ? 'text-rose-600' : 'text-blue-600'}
              >
                <StatRow label="Total gross" value={`₹ ${fmtINR(isReturnActive ? returnTotals.gross : totals.totalGross)}`} tone="text-slate-900" />
                <StatRow label="Total disc" value={`−₹ ${fmtINR(isReturnActive ? returnTotals.disc : totals.totalDisc)}`} tone="text-green-700" />
                <StatRow label="Taxable amt" value={`₹ ${fmtINR(isReturnActive ? returnTotals.taxable : totals.totalTaxable)}`} tone="text-slate-700" />
                <StatRow label="Total GST" value={`+₹ ${fmtINR(isReturnActive ? returnTotals.gst : totals.totalGST)}`} tone={isReturnActive ? 'text-rose-600' : 'text-blue-600'} />
              </StatCard>
            </div>

            {/* Grand total / refund bar */}
            <button
              type="button"
              onClick={openPayment}
              className="group relative w-full overflow-hidden rounded-2xl p-7 text-left text-white shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-rose-400/40 active:translate-y-0 active:scale-[0.995]"
              style={{
                background: isReturnActive
                  ? 'linear-gradient(135deg, #881337 0%, #be123c 50%, #9f1239 100%)'
                  : 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #059669 100%)',
                boxShadow: isReturnActive ? '0 20px 40px -15px rgba(136,19,55,0.45)' : '0 20px 40px -15px rgba(6,78,59,0.45)'
              }}
            >
              <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
              <span className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
              <span className="pointer-events-none absolute -bottom-10 -left-4 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
              <span className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-all duration-700 group-hover:left-full group-hover:opacity-100" />

              <div className="relative flex flex-wrap items-center justify-between gap-5">
                <div className="flex items-center gap-4">
                  <span className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm transition-colors group-hover:bg-white/20">
                    {isReturnActive ? <RotateCcw size={32} /> : <CreditCard size={32} />}
                  </span>
                  <div>
                    <p className="text-[12px] font-black uppercase tracking-[0.28em] text-white/80">
                      {isReturnActive ? 'Total refund / credit amount' : 'Invoice payable amount'}
                    </p>
                    <p className="mt-1 text-[11.5px] font-medium text-white/55">
                      {isReturnActive ? 'Click to process credit note' : 'Click to proceed with payment'}
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3.5 py-1.5 text-[12.5px] font-semibold backdrop-blur-sm transition-all group-hover:bg-white/20">
                      {isReturnActive ? 'Process credit note' : 'Receive payment'}
                      <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>

                <p className="flex items-end gap-0.5 tabular-nums">
                  <span className="mb-1.5 text-2xl font-light text-white/70">₹</span>
                  <span className="text-6xl font-black tracking-tight">{payableParts.int}</span>
                  <span className="mb-1.5 text-2xl font-black opacity-70">.{payableParts.dec}</span>
                </p>
              </div>
            </button>
          </div>
        </Section>

        {/* ── CREDIT NOTE ADJUSTMENT TABLE ─────────────────── */}
        {isReturnActive && (
          <Section
            icon={FileText}
            title="Credit note summary"
            subtitle="Adjustment ledger for returned stock"
            tone="rose"
            bodyClass="bg-slate-50/40"
            action={
              <div className="flex items-center gap-2 rounded-xl border border-rose-100 bg-white px-3 py-1.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500" />
                <span className="text-[12px] font-semibold text-rose-700">
                  {adjustmentList.length} reversal {adjustmentList.length === 1 ? 'line' : 'lines'}
                </span>
              </div>
            }
          >
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80 text-[12px] font-semibold text-slate-500">
                      <th className="w-16 px-5 py-3 text-center">#</th>
                      <th className="px-5 py-3 text-left">Particulars</th>
                      <th className="px-5 py-3 text-center">Qty</th>
                      <th className="px-5 py-3 text-right">Taxable value</th>
                      <th className="px-5 py-3 text-right text-rose-500">GST credit</th>
                      <th className="w-40 px-5 py-3 text-right">
                        <span className="rounded-full bg-rose-600 px-3 py-1 text-[11px] font-semibold text-white">Sub-total</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {adjustmentList.map((entry, i) => (
                      <tr key={entry.id} className="transition-colors hover:bg-rose-50/30">
                        <td className="px-5 py-2.5 text-center font-mono text-[11px] text-slate-400">{String(i + 1).padStart(2, '0')}</td>
                        <td className="px-5 py-2.5">
                          <div className="text-[13px] font-semibold text-slate-700">{entry.itemName}</div>
                          <div className="mt-0.5 text-[11px] text-slate-400">Batch: {entry.batch || 'N/A'}</div>
                        </td>
                        <td className="px-5 py-2.5 text-center">
                          <span className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg border border-rose-100 bg-rose-50 text-[12px] font-black text-rose-700">
                            {entry.returnQty}
                          </span>
                        </td>
                        <td className="px-5 py-2.5 text-right font-mono text-[12px] text-slate-600">₹{fmtINR(entry.ret.taxable)}</td>
                        <td className="px-5 py-2.5 text-right font-mono text-[12px] font-semibold text-rose-600">+₹{fmtINR(entry.ret.tax)}</td>
                        <td className="px-5 py-2.5 text-right text-[13px] font-bold text-slate-800">₹{fmtINR(entry.ret.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t-2 border-slate-100">
                    <tr className="bg-rose-50/40">
                      <td colSpan={5} className="px-5 py-3 text-right text-[12px] font-semibold text-rose-900/70">Net credit value</td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-base font-black text-rose-700">₹{fmtINR(returnTotals.total)}</span>
                          <div className="mt-0.5 h-0.5 w-10 rounded-full bg-rose-600" />
                        </div>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </Section>
        )}

        {/* ── RETURN REASON ────────────────────────────────── */}
        <Section icon={RotateCcw} title="Return reason & remarks" subtitle="Saved with the credit note" tone="rose" bodyClass="bg-white">
          <div className="grid grid-cols-12 gap-4">
            <Field label="Reason code" htmlFor="reasonCode" className="col-span-12 sm:col-span-6 lg:col-span-3">
              <div className="relative">
                <select
                  id="reasonCode"
                  className={`${inputCls} cursor-pointer appearance-none pr-9`}
                  value={returnReasonCode}
                  onChange={e => setReturnReasonCode(e.target.value)}
                >
                  <option value="DEFECT">Defect</option>
                  <option value="DAMAGE">Damage</option>
                  <option value="EXPIRY">Expiry</option>
                  <option value="QUALITY">Quality Issue</option>
                  <option value="EXCESS">Excess Stock</option>
                  <option value="WRONG_ITEM">Wrong Item</option>
                  <option value="OTHER">Other</option>
                </select>
                <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-rose-400" />
              </div>
            </Field>

            <Field label="Reason description" htmlFor="reasonText" className="col-span-12 sm:col-span-6 lg:col-span-4">
              <input id="reasonText" className={inputCls} placeholder="Detailed reason for return..." value={returnReasonText} onChange={e => setReturnReasonText(e.target.value)} />
            </Field>

            <Field label="Remarks" htmlFor="returnRemarks" className="col-span-12 lg:col-span-5">
              <input id="returnRemarks" className={inputCls} placeholder="Additional remarks..." value={returnRemarks} onChange={e => setReturnRemarks(e.target.value)} />
            </Field>
          </div>
        </Section>

        {/* ── RETURN HISTORY ───────────────────────────────── */}
        {returnHistory && returnHistory.length > 0 && (
          <Section
            icon={History}
            title="Return history"
            subtitle="Earlier returns against this invoice"
            tone="blue"
            bodyClass="bg-blue-50/20"
            action={isLoadingReturns && <span className="animate-pulse text-[12px] text-slate-400">Loading…</span>}
          >
            <div className="max-h-44 space-y-2 overflow-y-auto pr-1">
              {returnHistory.map((ret, i) => (
                <div key={ret.returnNo ?? i} className="flex items-start justify-between gap-3 rounded-xl border border-blue-100 bg-white px-4 py-3 shadow-sm">
                  <div>
                    <span className="text-[12.5px] font-bold text-slate-700">{ret.returnNo}</span>
                    <span className="ml-2 text-[11px] text-slate-400">{ret.returnDate}</span>
                    {ret.reasonText && <p className="mt-0.5 text-[12px] text-slate-500">{ret.reasonText}</p>}
                  </div>
                  <span className="shrink-0 rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">{ret.reasonCode}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ── SHIPPING ─────────────────────────────────────── */}
        <Section icon={Truck} title="Shipping details" subtitle="Optional" tone="rose" bodyClass="bg-white">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Contact person" htmlFor="contactPerson">
              <IconInput id="contactPerson" icon={User} placeholder="In-charge name" />
            </Field>
            <Field label="Shipping address" htmlFor="shipAddress" className="lg:col-span-2">
              <IconInput id="shipAddress" icon={MapPin} placeholder="Same as billing or other..." />
            </Field>
            <Field label="Shipping state" htmlFor="shipState">
              <input id="shipState" className={`${inputCls} !bg-slate-50`} placeholder="Maharashtra" />
            </Field>
          </div>
        </Section>

        {/* ── NARRATION ────────────────────────────────────── */}
        <Section icon={FileText} title="Narration / return notes" subtitle="Printed as remarks on the credit note" tone="slate" bodyClass="bg-slate-50/60">
          <textarea
            id="narration"
            aria-label="Narration or return notes"
            className="h-24 w-full resize-none rounded-xl border border-rose-200 bg-white px-4 py-3 text-[13px] text-slate-600 shadow-sm outline-none transition-all duration-150 placeholder:text-slate-300 hover:border-rose-300 focus:border-rose-300 focus:ring-4 focus:ring-rose-200/60"
            placeholder="Enter any additional notes..."
            value={narration}
            onChange={e => setNarration(e.target.value)}
          />
        </Section>

        {/* ── ACTION BAR (sticks to bottom of viewport) ────── */}
        <footer
          className="sticky bottom-0 z-30 flex flex-wrap items-center gap-2.5 rounded-b-3xl border-t px-6 py-3.5 text-white shadow-[0_-10px_30px_-10px_rgba(28,10,10,0.5)] backdrop-blur"
          style={{ background: 'linear-gradient(90deg, rgba(28,10,10,0.97) 0%, rgba(59,13,13,0.97) 50%, rgba(28,10,10,0.97) 100%)', borderColor: '#3b0d0d' }}
        >
          <button type="button" onClick={submitReturn} disabled={isSubmittingReturn || !isReturnActive} className={btn.primary}>
            {isSubmittingReturn
              ? <><Loader2 size={16} className="animate-spin" /> Submitting…</>
              : <><Save size={16} strokeWidth={2.5} /> Submit return</>}
          </button>

          <button type="button" className={btn.secondary}>
            <Printer size={16} className="text-rose-300 transition-colors group-hover:text-white" />
            Save & print
          </button>

          <button type="button" className={btn.secondary}>
            <Mail size={16} className="text-rose-300 transition-colors group-hover:text-white" />
            Email
          </button>

          <div className="mx-1 hidden h-6 w-px bg-rose-900 sm:block" />

          <button type="button" className={btn.indigo}>
            <Send size={16} className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            e-Invoice
          </button>

          <button type="button" className={btn.orange}>
            <Truck size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            e-Way bill
          </button>

          <button type="button" className={`${btn.ghostDanger} ml-auto`}>
            <XCircle size={16} className="transition-transform duration-300 group-hover:rotate-90" />
            Cancel
          </button>
        </footer>
      </div>

      {showPaymentModal && (
        <MultiTransaction
          totals={isReturnActive ? { invoiceTotal: returnTotals.total } : totals}
        />
      )}
    </div>
  );
};

export default BillingReturnV4;