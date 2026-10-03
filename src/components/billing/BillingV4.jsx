import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Save, Printer, Mail, Send, Truck, XCircle, X, Plus, Trash2, Loader2,
  MapPin, FileText, Search, Hash, User, CreditCard, Landmark, CheckCircle,
  AlertCircle, Calendar, Clock, Phone, List, ArrowRight, Package, Users, ClipboardList, Receipt
} from 'lucide-react';
import DatePicker from "react-datepicker";
import { usePayment } from "../contextapi/PaymentContext";
import MultiTransaction from "../contextapi/MultiTransaction";
import "react-datepicker/dist/react-datepicker.css";
import axios from 'axios';

/* ════════════════════════════════════════════════════════════
   Pure helpers (outside the component → never re-created)
   ════════════════════════════════════════════════════════════ */
const BILLING_STATE_CODE = "27";

const createEmptyRow = () => ({
  id: Date.now() + Math.random(), itemId: null, itemCode: '', itemName: '',
  itemNameDetails: '', hsn: '', batch: '', rate: 0, qty: 0,
  grossAmount: 0, discP: 0, discA: 0, taxableAmt: 0, gstP: 18, gstA: 0, lineTotal: 0
});

const fmtINR = (n) =>
  Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const numberToWords = (num) => {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const mg = (n) => { let s = ''; if (n > 99) { s += a[Math.floor(n / 100)] + 'Hundred '; n %= 100; } if (n > 19) { s += b[Math.floor(n / 10)] + ' ' + a[n % 10]; } else { s += a[n]; } return s; };
  if (num === 0) return 'Zero';
  let words = '', n = num;
  const cr = Math.floor(n / 10000000); n %= 10000000;
  const lk = Math.floor(n / 100000); n %= 100000;
  const th = Math.floor(n / 1000); n %= 1000;
  if (cr > 0) words += mg(cr) + 'Crore ';
  if (lk > 0) words += mg(lk) + 'Lakh ';
  if (th > 0) words += mg(th) + 'Thousand ';
  if (n > 0) words += mg(n);
  return words.trim();
};

// Row values are *derived* from raw inputs, so nothing can go stale
// (e.g. picking a customer after adding items re-splits CGST/SGST/IGST correctly).
const computeInvoice = (rows, sameState) => {
  let tG = 0, tD = 0, tGST = 0;
  const items = rows.map(item => {
    const gross = (parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0);
    const disc = (gross * (parseFloat(item.discP) || 0)) / 100;
    const taxable = gross - disc;
    const tax = (taxable * (parseFloat(item.gstP) || 0)) / 100;
    const cgst = sameState ? tax / 2 : 0;
    const sgst = sameState ? tax / 2 : 0;
    const igst = !sameState ? tax : 0;
    tG += gross; tD += disc; tGST += tax;
    return { ...item, grossAmount: gross, discA: disc, taxableAmt: taxable, gstA: tax, cgst, sgst, igst, lineTotal: taxable + tax };
  });
  const raw = tG - tD + tGST, rounded = Math.round(raw);
  return {
    items,
    totals: {
      totalGross: tG, totalDisc: tD, totalTaxable: tG - tD, totalGST: tGST,
      invoiceTotal: rounded, roundOff: (rounded - raw).toFixed(2)
    }
  };
};

/* ════════════════════════════════════════════════════════════
   Design tokens  (original palette: navy · amber · black table · blue · emerald · slate-900 bar)
   ════════════════════════════════════════════════════════════ */
const inputCls =
  "w-full h-10 rounded-xl border border-amber-200 bg-white px-3 text-[13px] font-medium text-slate-700 " +
  "placeholder:text-slate-300 placeholder:font-normal shadow-sm outline-none transition-all duration-150 " +
  "hover:border-amber-300 focus:border-amber-400 focus:ring-4 focus:ring-amber-100";

const cellBase =
  "w-full h-9 rounded-lg border border-transparent bg-transparent px-2.5 text-[13px] outline-none " +
  "placeholder:text-slate-300 transition-all duration-150 hover:bg-slate-50";
const cellBlue = `${cellBase} text-slate-700 focus:bg-blue-50/50 focus:border-blue-300 focus:ring-2 focus:ring-blue-400/20`;
const cellAmber = `${cellBase} text-slate-700 focus:bg-amber-50/60 focus:border-amber-300 focus:ring-2 focus:ring-amber-400/25`;
const cellSlate = `${cellBase} text-slate-500 focus:bg-white focus:border-slate-300 focus:ring-2 focus:ring-slate-200`;

// Modern buttons: soft inner highlight, glow shadow, press feedback, visible keyboard focus
const btnBase =
  "group relative inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl text-[13px] font-semibold whitespace-nowrap select-none " +
  "transition-all duration-200 ease-out active:scale-[0.96] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 " +
  "disabled:opacity-50 disabled:pointer-events-none";
const btn = {
  // header (on navy)
  headerGhost: `${btnBase} bg-white/10 text-white border border-white/20 backdrop-blur hover:bg-white/20 hover:border-white/30 hover:-translate-y-px focus-visible:ring-white/70 focus-visible:ring-offset-[#1e3a8a]`,
  // light surfaces
  addRow: `${btnBase} !h-9 !w-9 !px-0 !rounded-xl bg-gradient-to-b from-blue-500 to-blue-600 text-white border border-blue-400/30 shadow-md shadow-blue-600/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] hover:from-blue-400 hover:to-blue-500 hover:shadow-lg hover:shadow-blue-600/40 hover:-translate-y-px focus-visible:ring-blue-500 focus-visible:ring-offset-white`,
  // dark action bar
  primary: `${btnBase} bg-gradient-to-b from-blue-500 to-blue-600 text-white border border-blue-400/30 shadow-lg shadow-blue-900/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] hover:from-blue-400 hover:to-blue-500 hover:shadow-blue-500/30 hover:-translate-y-px focus-visible:ring-blue-400 focus-visible:ring-offset-slate-900`,
  secondary: `${btnBase} bg-slate-800 text-slate-100 border border-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:bg-slate-700 hover:border-slate-600 hover:-translate-y-px focus-visible:ring-slate-400 focus-visible:ring-offset-slate-900`,
  indigo: `${btnBase} bg-indigo-500/10 text-indigo-300 border border-indigo-400/30 hover:bg-indigo-600 hover:text-white hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-600/30 hover:-translate-y-px focus-visible:ring-indigo-400 focus-visible:ring-offset-slate-900`,
  orange: `${btnBase} bg-orange-500/10 text-orange-300 border border-orange-400/30 hover:bg-orange-600 hover:text-white hover:border-orange-400 hover:shadow-lg hover:shadow-orange-600/30 hover:-translate-y-px focus-visible:ring-orange-400 focus-visible:ring-offset-slate-900`,
  ghostDanger: `${btnBase} text-slate-400 hover:text-red-300 hover:bg-red-500/10 focus-visible:ring-red-400 focus-visible:ring-offset-slate-900`,
};

const tones = {
  amber: {
    wrap: 'border-amber-200/60',
    strip: 'bg-gradient-to-r from-amber-100/70 to-amber-50/30 border-amber-200/60',
    chip: 'from-amber-400 to-amber-500 shadow-amber-500/30',
    title: 'text-amber-900',
    sub: 'text-amber-700/70',
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
   Small presentational components
   (defined OUTSIDE the main component on purpose — defining them
    inside remounts every input on each keystroke and kills focus)
   ════════════════════════════════════════════════════════════ */
const Field = ({ label, htmlFor, children, className = '' }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <label htmlFor={htmlFor} className="text-[12px] font-semibold text-slate-500">{label}</label>
    {children}
  </div>
);

const IconInput = React.forwardRef(({ icon: Icon, iconClass = 'text-slate-400', className = '', ...props }, ref) => (
  <div className="relative">
    {Icon && <Icon size={15} className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${iconClass}`} />}
    <input ref={ref} className={`${inputCls} ${Icon ? 'pl-9' : ''} ${className}`} {...props} />
  </div>
));

const Section = ({ icon: Icon, title, subtitle, tone = 'amber', bodyClass = '', action, children }) => {
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

const StatCard = ({ title, accent, boxCls, children }) => (
  <div className={`rounded-2xl border p-5 ${boxCls}`}>
    <div className="mb-1 flex items-center gap-2 border-b pb-3" style={{ borderColor: 'inherit' }}>
      <span className={`h-4 w-1.5 rounded-full ${accent.bar}`} />
      <h4 className={`text-[13px] font-bold ${accent.text}`}>{title}</h4>
    </div>
    <dl className="divide-y divide-dashed divide-slate-200">{children}</dl>
  </div>
);

/* ════════════════════════════════════════════════════════════
   Main component
   ════════════════════════════════════════════════════════════ */
const BillingV4 = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const invoiceId = id;
  const screenKey = "billing-v4";

  // header / customer
  const [invoiceDate, setInvoiceDate] = useState(new Date());
  const [invoiceTime, setInvoiceTime] = useState(new Date());
  const [invoiceNo, setInvoiceNo] = useState('');
  const [placeOfSupply] = useState('Maharashtra');
  const [reverseCharge, setReverseCharge] = useState(false);
  const [transporterName, setTransporterName] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [narration, setNarration] = useState('');

  const [customerSearch, setCustomerSearch] = useState('');
  const [customerSuggestions, setCustomerSuggestions] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [customerHighlight, setCustomerHighlight] = useState(0);

  // items
  const [rawItems, setRawItems] = useState(() => [createEmptyRow()]);
  const [itemSuggestions, setItemSuggestions] = useState([]);
  const [showItemDropdown, setShowItemDropdown] = useState(false);
  const [itemHighlight, setItemHighlight] = useState(0);
  const [activeRowIndex, setActiveRowIndex] = useState(null);
  const [dropdownCoords, setDropdownCoords] = useState(null);

  // print
  const [isLoadingPrint, setIsLoadingPrint] = useState(false);
  const [printError, setPrintError] = useState(null);

  // refs
  const itemInputRefs = useRef({});
  const qtyInputRefs = useRef({});
  const itemListRef = useRef(null);
  const customerDropdownRef = useRef(null);
  const searchCustomersTimer = useRef(null);
  const itemReqId = useRef(0);          // guards against out-of-order search responses
  const focusRowRef = useRef(null);     // row to focus after a new row mounts

  const {
    activeMethods, paymentSplit, paymentRefs, discountMode, showPaymentModal,
    setShowPaymentModal, setActiveMethods, setPaymentSplit, setPaymentRefs, setDiscountMode
  } = usePayment();

  // ── derived values ───────────────────────────────────────
  const isSameState = String(selectedCustomer?.stateCode || '') === BILLING_STATE_CODE;
  const { items, totals } = useMemo(() => computeInvoice(rawItems, isSameState), [rawItems, isSameState]);

  // ── payment helpers ──────────────────────────────────────
  const getPaymentAmount = (method) => {
    const rawValue = parseFloat(paymentSplit[method.id] || 0) || 0;
    if (method.type === 'Discount') {
      const mode = discountMode[method.id] || 'rupee';
      return mode === 'percent'
        ? parseFloat(((totals.invoiceTotal * rawValue) / 100).toFixed(2))
        : rawValue;
    }
    return rawValue;
  };

  const buildPaymentsPayload = () => {
    const methods = activeMethods.map((method) => {
      const amount = getPaymentAmount(method);
      if (!amount || amount <= 0) return null;
      const normalizedMode = {
        Cash: 'CASH', UPI: 'UPI', 'Credit Card': 'CREDIT_CARD',
        'Debit Card': 'DEBIT_CARD', Cheque: 'CHEQUE', Discount: 'DISCOUNT'
      }[method.type] || method.type;
      const needsRef = ['UPI', 'CHEQUE', 'CREDIT_CARD', 'DEBIT_CARD'].includes(normalizedMode);
      const rec = {
        paymentMode: normalizedMode, amount: parseFloat(amount.toFixed(2)),
        referenceNo: needsRef ? paymentRefs[method.id] || null : null,
        paymentDate: invoiceDate.toISOString().split('T')[0], methodId: method.id
      };
      if (method.type === 'Discount') rec.discountMode = discountMode[method.id] || 'rupee';
      return rec;
    });
    return methods.filter(Boolean);
  };

  const openPayment = () => {
    localStorage.setItem('activePaymentScreen', screenKey);
    setShowPaymentModal(true);
  };

  // ── customer search ──────────────────────────────────────
  const searchCustomers = (query) => {
    if (searchCustomersTimer.current) clearTimeout(searchCustomersTimer.current);

    if (query.length < 3) {
      setCustomerSuggestions(prev => (prev.length ? [] : prev));
      setShowCustomerDropdown(false);
      return;
    }

    searchCustomersTimer.current = setTimeout(async () => {
      try {
        const res = await axios.get(`/api/customer-master/search?q=${encodeURIComponent(query)}`);
        if (res.data && res.data.length > 0) {
          setCustomerSuggestions(res.data);
          setCustomerHighlight(0);
          setShowCustomerDropdown(true);
        } else {
          setCustomerSuggestions([]);
          setShowCustomerDropdown(false);
        }
      } catch {
        setCustomerSuggestions([]);
        setShowCustomerDropdown(false);
      }
    }, 250);
  };

  const selectCustomer = (c) => {
    if (searchCustomersTimer.current) clearTimeout(searchCustomersTimer.current);
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

  // ── item search ──────────────────────────────────────────
  const searchItems = async (query) => {
    const req = ++itemReqId.current;
    if (query.length < 3) { setItemSuggestions([]); setShowItemDropdown(false); return; }
    try {
      const res = await axios.get(`/api/item-master/search?q=${encodeURIComponent(query)}`);
      if (req !== itemReqId.current) return; // stale response / input already blurred
      const list = Array.isArray(res.data) ? res.data : [];
      setItemSuggestions(list);
      setItemHighlight(0);
      setShowItemDropdown(list.length > 0);
    } catch {
      if (req !== itemReqId.current) return;
      setItemSuggestions([]); setShowItemDropdown(false);
    }
  };

  const updateItemDropdownPosition = useCallback((idx) => {
    const input = itemInputRefs.current[idx];
    if (!input) return;
    const rect = input.getBoundingClientRect();
    setDropdownCoords({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX, width: Math.max(rect.width, 340) });
  }, []);

  const handleItemChange = (index, field, value) =>
    setRawItems(prev => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));

  const selectItem = (index, item) => {
    itemReqId.current++;
    setRawItems(prev => prev.map((r, i) => i === index ? {
      ...r,
      itemId: item.itemId, itemCode: item.itemCode, itemName: item.itemName,
      itemNameDetails: item.itemNameDetails, hsn: item.hsnCode, gstP: item.gstRate,
      rate: item.salePrice, batch: item.batchCode || r.batch || 'BATCH01', itemUnit: item.unit
    } : r));
    setShowItemDropdown(false);
    setItemSuggestions([]);
    // jump straight to quantity so billing stays keyboard-fast
    requestAnimationFrame(() => qtyInputRefs.current[index]?.focus());
  };

  const handleItemKeyDown = (e) => {
    const n = itemSuggestions.length;
    if (!showItemDropdown || !n) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setItemHighlight(h => (h + 1) % n); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setItemHighlight(h => (h - 1 + n) % n); }
    else if (e.key === 'Enter') { e.preventDefault(); selectItem(activeRowIndex, itemSuggestions[itemHighlight] || itemSuggestions[0]); }
    else if (e.key === 'Escape') { setShowItemDropdown(false); }
  };

  const addNewRow = () => {
    focusRowRef.current = rawItems.length;
    setRawItems(prev => [...prev, createEmptyRow()]);
  };

  const removeRow = (rowId) =>
    setRawItems(prev => (prev.length > 1 ? prev.filter(i => i.id !== rowId) : prev));

  // Tab on the last field of the last filled row → new row, focus lands on its item box
  const handleGstKeyDown = (e, index) => {
    if (e.key !== 'Tab' || e.shiftKey || index !== rawItems.length - 1) return;
    const row = rawItems[index];
    if (!row.itemId && !row.itemName) return; // don't stack empty rows
    e.preventDefault();
    addNewRow();
  };

  // ── effects ──────────────────────────────────────────────
  useEffect(() => {
    if (focusRowRef.current !== null) {
      itemInputRefs.current[focusRowRef.current]?.focus();
      focusRowRef.current = null;
    }
  }, [rawItems.length]);

  useEffect(() => {
    if (!showItemDropdown || activeRowIndex === null) { setDropdownCoords(null); return; }
    updateItemDropdownPosition(activeRowIndex);
    const h = () => updateItemDropdownPosition(activeRowIndex);
    window.addEventListener('resize', h);
    window.addEventListener('scroll', h, true);
    return () => { window.removeEventListener('resize', h); window.removeEventListener('scroll', h, true); };
  }, [showItemDropdown, activeRowIndex, itemSuggestions.length, updateItemDropdownPosition]);

  // keep keyboard-highlighted option visible
  useEffect(() => {
    customerDropdownRef.current?.children[customerHighlight]?.scrollIntoView({ block: 'nearest' });
  }, [customerHighlight, showCustomerDropdown]);
  useEffect(() => {
    itemListRef.current?.children[itemHighlight]?.scrollIntoView({ block: 'nearest' });
  }, [itemHighlight, dropdownCoords]);

  useEffect(() => () => { if (searchCustomersTimer.current) clearTimeout(searchCustomersTimer.current); }, []);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const { data } = await axios.get(`/api/invoice/${id}`);
        setInvoiceNo(data.invoiceNo || '');
        setNarration(data.narration || '');
        if (data.invoiceDate) setInvoiceDate(new Date(data.invoiceDate));
        const c = data.customer || data.Customer;
        if (c) { setSelectedCustomer(c); setCustomerSearch(c.customerName || ''); }
        const apiItems = data.items || data.InvoiceItems || data.items_list;
        if (apiItems && Array.isArray(apiItems)) {
          setRawItems(apiItems.map(item => ({
            id: item.id || Date.now() + Math.random(), itemId: item.itemId,
            itemName: item.itemName || item.item_name, hsn: item.hsnCode || item.hsn || '',
            batch: item.batch || item.batchNo || '', rate: Number(item.rate) || 0,
            qty: Number(item.quantity) || Number(item.qty) || 0,
            discP: Number(item.discountPercent) || Number(item.discP) || 0,
            gstP: Number(item.gstRate) || Number(item.gstP) || 0,
            grossAmount: 0, taxableAmt: 0, lineTotal: 0
          })));
        }
      } catch (err) { console.error(err); }
    };
    load();
  }, [id]);

  // ── save / update / print ────────────────────────────────
  const updateInvoice = async () => {
    try {
      await axios.put(`/api/invoice/${id}`, { invoiceNo, invoiceDate, customerId: selectedCustomer?.customerId, items, totalTaxable: totals.totalTaxable, totalGST: totals.totalGST, invoiceTotal: totals.invoiceTotal, narration });
      navigate('/billing_v4/list');
    } catch (err) { console.error(err); }
  };

  const saveInvoice = async () => {
    if (!selectedCustomer) { alert('Please select a customer'); return; }
    const payments = buildPaymentsPayload();
    const paidAmount = payments.reduce((s, p) => s + p.amount, 0);
    const invoiceData = {
      invoiceNo: invoiceNo || `INV/${new Date().getFullYear()}/${Date.now()}`,
      invoiceDate: invoiceDate.toISOString().split('T')[0], unitId: 1,
      customerId: selectedCustomer.customerId, placeOfSupply, stateCode: selectedCustomer.stateCode, reverseCharge,
      totalGrossAmount: totals.totalGross, totalDiscount: totals.totalDisc, taxableAmount: totals.totalTaxable,
      totalCgst: isSameState ? totals.totalGST / 2 : 0, totalSgst: isSameState ? totals.totalGST / 2 : 0,
      totalIgst: !isSameState ? totals.totalGST : 0, roundOff: parseFloat(totals.roundOff),
      finalAmount: totals.invoiceTotal, transporterName, vehicleNumber, narration,
      items: items.map(i => ({ itemId: i.itemId, batchCode: i.batch || 'BATCH01', hsnCode: i.hsn, quantity: i.qty, rate: i.rate, grossAmount: i.grossAmount, discountPct: i.discP, discountAmt: i.discA, taxableAmount: i.taxableAmt, gstRate: i.gstP, cgstAmt: i.cgst || 0, sgstAmt: i.sgst || 0, igstAmt: i.igst || 0, lineTotal: i.lineTotal })),
      balance: { invoiceAmount: totals.invoiceTotal, paidAmount, balanceAmount: parseFloat((totals.invoiceTotal - paidAmount).toFixed(2)), dueDate: new Date(Date.now() + 30 * 864e5).toISOString().split('T')[0], status: paidAmount >= totals.invoiceTotal ? 'Paid' : 'Unpaid' },
      payments
    };
    try {
      await axios.post('/api/invoice', invoiceData);
      setActiveMethods([]); setPaymentSplit({}); setPaymentRefs({}); setDiscountMode({}); setShowPaymentModal(false);
      navigate('/billing-v4-list');
    } catch { alert('Error saving invoice.'); }
  };

  const buildInvoicePayload = () => {
    const payments = buildPaymentsPayload();
    const paidAmount = payments.reduce((s, p) => s + p.amount, 0);
    return {
      invoiceNo: invoiceNo || `INV/${new Date().getFullYear()}/${Date.now()}`,
      invoiceDate: invoiceDate.toISOString().split('T')[0], unitId: 1,
      customerId: selectedCustomer?.customerId, placeOfSupply, stateCode: selectedCustomer?.stateCode || '',
      reverseCharge, transporterName, vehicleNumber, narration,
      items: items.filter(i => i.itemId).map(i => ({ itemId: i.itemId, hsnCode: i.hsn || '', quantity: i.qty, rate: i.rate, gstRate: i.gstP, lineTotal: i.lineTotal, itemName: i.itemName, itemCode: i.itemCode || '' })),
      balance: { invoiceAmount: totals.invoiceTotal, paidAmount, balanceAmount: parseFloat((totals.invoiceTotal - paidAmount).toFixed(2)), status: paidAmount >= totals.invoiceTotal ? 'Paid' : 'Unpaid', dueDate: new Date(Date.now() + 30 * 864e5).toISOString().split('T')[0] },
      payments
    };
  };

  const handleSaveAndPrint = async () => {
    if (!selectedCustomer) { setPrintError('Please select a customer'); return; }
    if (items.filter(i => i.itemId).length === 0) { setPrintError('Please add at least one item'); return; }
    const payments = buildPaymentsPayload();
    const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
    if (payments.length === 0) { setPrintError('Please select a payment method.'); return; }
    if (totalPaid < totals.invoiceTotal - 0.01) { setPrintError('Payment is incomplete.'); return; }
    setPrintError(null); setIsLoadingPrint(true);
    try {
      const res = await axios.post('/api/invoice/save-and-print', buildInvoicePayload(), { responseType: 'blob', headers: { 'Content-Type': 'application/json' } });
      const url = window.URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url; a.download = `invoice_${invoiceNo || Date.now()}.pdf`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) { setPrintError(err.response?.data?.message || 'Failed to save and print.'); }
    finally { setIsLoadingPrint(false); }
  };

  const roundOffNum = parseFloat(totals.roundOff) || 0;

  // ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-amber-50/20 p-3 font-poppins text-[13px] text-slate-700 md:p-6">
      <div className="mx-auto max-w-[1500px] rounded-3xl border border-amber-200/60 bg-white shadow-2xl shadow-amber-900/5">

        {/* ── TOP BAR ──────────────────────────────────────── */}
        <header className="relative flex flex-wrap items-center gap-x-5 gap-y-3 overflow-hidden rounded-t-3xl border-b border-white/10 bg-gradient-to-r from-[#061a4c] via-[#1e3a8a] to-[#061a4c] px-6 py-4 text-white shadow-xl">
          <div className="pointer-events-none absolute -left-10 -top-16 h-40 w-40 rounded-full bg-blue-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-10 -bottom-16 h-40 w-40 rounded-full bg-indigo-400/20 blur-3xl" />

          <div className="relative flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-900/40 ring-1 ring-white/25">
              <FileText size={19} className="text-white" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-[16px] font-bold leading-tight tracking-wide text-white">Tax Invoice</h1>
                {invoiceId && (
                  <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[10.5px] font-semibold text-amber-200 ring-1 ring-inset ring-amber-300/40">
                    Editing
                  </span>
                )}
              </div>
              <p className="text-[11.5px] font-medium text-blue-200/70">Sales entry</p>
            </div>
          </div>

          <div className="relative hidden h-9 w-px bg-blue-300/20 sm:block" />

          {/* Reverse charge switch */}
          <button
            type="button"
            role="switch"
            aria-checked={reverseCharge}
            onClick={() => setReverseCharge(v => !v)}
            className="relative flex items-center gap-2.5 rounded-full py-1 pl-1 pr-3 transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            <span className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ${reverseCharge ? 'bg-blue-400' : 'bg-blue-900/70 ring-1 ring-inset ring-white/15'}`}>
              <span className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-md transition-transform duration-200 ${reverseCharge ? 'translate-x-4' : ''}`} />
            </span>
            <span className="text-[12.5px] font-semibold text-blue-100/90">Reverse charge</span>
          </button>

          <div className="relative ml-auto">
            <button type="button" onClick={() => navigate('/billing-v4-list')} className={btn.headerGhost}>
              <List size={15} />
              View all invoices
            </button>
          </div>
        </header>

        {/* ── INVOICE HEADER ───────────────────────────────── */}
        <Section icon={ClipboardList} title="Invoice header" subtitle="Number, date and reference" tone="amber" bodyClass="bg-amber-50/30">
          <div className="grid grid-cols-12 gap-4">
            <Field label="Invoice no." htmlFor="invoiceNo" className="col-span-12 sm:col-span-6 lg:col-span-3">
              <input id="invoiceNo" className={inputCls} placeholder="INV/2024/0001" value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} />
            </Field>

            <Field label="Invoice date" htmlFor="invoiceDate" className="col-span-12 sm:col-span-6 lg:col-span-3">
              <div className="relative">
                <Calendar size={15} className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-amber-500" />
                <DatePicker
                  id="invoiceDate"
                  selected={invoiceDate} onChange={d => d && setInvoiceDate(d)}
                  dateFormat="dd MMM yyyy" showYearDropdown showMonthDropdown dropdownMode="select"
                  wrapperClassName="!block w-full" popperClassName="!z-50"
                  className={`${inputCls} pl-9`}
                  calendarClassName="!rounded-xl !border !border-amber-200 !shadow-xl"
                />
              </div>
            </Field>

            <Field label="Time" htmlFor="invoiceTime" className="col-span-12 sm:col-span-6 lg:col-span-3">
              <div className="relative">
                <Clock size={15} className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-amber-500" />
                <DatePicker
                  id="invoiceTime"
                  selected={invoiceTime} onChange={t => t && setInvoiceTime(t)}
                  showTimeSelect showTimeSelectOnly timeIntervals={5} timeCaption="Time" dateFormat="hh:mm aa"
                  wrapperClassName="!block w-full" popperClassName="!z-50"
                  className={`${inputCls} pl-9`}
                />
              </div>
            </Field>

            <Field label="Original invoice (for returns)" htmlFor="origInvoice" className="col-span-12 sm:col-span-6 lg:col-span-3">
              <IconInput id="origInvoice" icon={Search} iconClass="text-amber-400" placeholder="Find invoice..." />
            </Field>
          </div>
        </Section>

        {/* ── CUSTOMER ─────────────────────────────────────── */}
        <Section icon={Users} title="Customer & billing details" subtitle="Type at least 3 letters to search" tone="amber" bodyClass="bg-white">
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
                    if (searchCustomersTimer.current) clearTimeout(searchCustomersTimer.current);
                    setShowCustomerDropdown(false);
                  }}
                />
                {showCustomerDropdown && customerSuggestions.length > 0 && (
                  <div
                    ref={customerDropdownRef}
                    role="listbox"
                    onMouseDown={e => e.preventDefault()}
                    className="absolute left-0 top-full z-30 mt-1.5 max-h-56 w-full min-w-[280px] overflow-y-auto rounded-2xl border border-amber-200 bg-white p-1.5 shadow-2xl shadow-amber-900/10"
                  >
                    {customerSuggestions.map((c, i) => (
                      <div
                        key={c.customerId ?? i}
                        role="option"
                        aria-selected={i === customerHighlight}
                        onMouseEnter={() => setCustomerHighlight(i)}
                        onMouseDown={e => { e.preventDefault(); selectCustomer(c); }}
                        className={`cursor-pointer rounded-xl px-3 py-2.5 transition-colors ${i === customerHighlight ? 'bg-amber-50 ring-1 ring-inset ring-amber-200' : ''}`}
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
              <IconInput
                id="gstin" icon={Landmark} className="uppercase !bg-blue-50/30" placeholder="27AAAAA0000A1Z5"
                value={selectedCustomer?.gstin || ''}
                onChange={e => setSelectedCustomer(p => p ? { ...p, gstin: e.target.value } : null)}
              />
            </Field>

            <Field label="PAN" htmlFor="pan" className="col-span-12 sm:col-span-6 lg:col-span-3">
              <IconInput id="pan" icon={CreditCard} className="uppercase !bg-blue-50/30" placeholder="ABCDE1234F" />
            </Field>

            <Field label="Mobile number" htmlFor="mobile" className="col-span-12 sm:col-span-6 lg:col-span-3">
              <IconInput
                id="mobile" icon={Phone} inputMode="tel" placeholder="98XXXXXXXX"
                value={selectedCustomer?.mobileNo || ''}
                onChange={e => setSelectedCustomer(p => p ? { ...p, mobileNo: e.target.value } : null)}
              />
            </Field>

            <Field label="Email ID" htmlFor="email" className="col-span-12 sm:col-span-6 lg:col-span-3">
              <IconInput
                id="email" icon={Mail} type="email" placeholder="customer@email.com"
                value={selectedCustomer?.email || ''}
                onChange={e => setSelectedCustomer(p => p ? { ...p, email: e.target.value } : null)}
              />
            </Field>

            <Field label="Billing address" htmlFor="billingAddress" className="col-span-12 sm:col-span-8 lg:col-span-4">
              <IconInput
                id="billingAddress" icon={MapPin} placeholder="Street, City, Zip..."
                value={selectedCustomer?.billingAddress || ''}
                onChange={e => setSelectedCustomer(p => p ? { ...p, billingAddress: e.target.value } : null)}
              />
            </Field>

            <Field label="Billing state" htmlFor="billingState" className="col-span-12 sm:col-span-4 lg:col-span-2">
              <input
                id="billingState" className={`${inputCls} !bg-slate-50`} placeholder="Maharashtra"
                value={selectedCustomer?.state || selectedCustomer?.stateCode || ''}
                onChange={e => setSelectedCustomer(p => p ? { ...p, state: e.target.value } : null)}
              />
            </Field>
          </div>
        </Section>

        {/* ── ITEM TABLE ───────────────────────────────────── */}
        <Section
          icon={Package}
          title="Line items"
          subtitle="Search an item, press Enter to pick it, Tab on the last field adds a new row"
          tone="slate"
          bodyClass="bg-white"
        >
          <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] border-collapse">
                <thead>
                  <tr className="divide-x divide-white/5 border-b border-white/10 bg-[#111111] text-[11.5px] font-semibold">
                    <th className="w-12 p-3.5 text-center text-slate-500">#</th>
                    <th className="min-w-[280px] bg-white/[0.02] p-3.5 text-left text-slate-100/90">Item description</th>
                    <th className="w-28 p-3.5 text-center text-slate-400">HSN/SAC</th>
                    <th className="w-28 p-3.5 text-center text-slate-400">Batch</th>
                    <th className="w-28 bg-amber-400/[0.05] p-3.5 text-right text-amber-200/80">Rate</th>
                    <th className="w-20 bg-amber-400/[0.05] p-3.5 text-right text-amber-200/80">Qty</th>
                    <th className="w-28 p-3.5 text-right font-medium text-slate-500">Gross amt</th>
                    <th className="w-24 bg-rose-400/[0.03] p-3.5 text-right text-rose-400/70">Disc %</th>
                    <th className="w-28 bg-[#1c1c1c] p-3.5 text-right text-slate-200">Taxable</th>
                    <th className="w-24 p-3.5 text-right text-slate-400">GST %</th>
                    <th className="w-36 bg-emerald-500/[0.08] p-3.5 text-right font-bold text-emerald-300 shadow-[inset_0_-2px_0_rgba(16,185,129,0.25)]">Total amt</th>
                    <th className="w-28 p-3.5 text-center text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {items.map((item, idx) => (
                    <tr key={item.id} className="transition-colors duration-100 hover:bg-amber-50/20 focus-within:bg-blue-50/30">
                      <td className="px-3 pt-3.5 pb-2 text-center align-top">
                        <span className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-400">
                          {idx + 1}
                        </span>
                      </td>

                      {/* Item */}
                      <td className="px-2 py-2 align-top">
                        <input
                          ref={el => { itemInputRefs.current[idx] = el; }}
                          className={`${cellBlue} font-medium`}
                          type="text"
                          autoComplete="off"
                          aria-label={`Item ${idx + 1}`}
                          value={item.itemName}
                          placeholder="Search or enter item..."
                          onChange={e => {
                            handleItemChange(idx, 'itemName', e.target.value);
                            searchItems(e.target.value);
                            updateItemDropdownPosition(idx);
                          }}
                          onKeyDown={handleItemKeyDown}
                          onFocus={() => {
                            setActiveRowIndex(idx);
                            if (itemSuggestions.length > 0) setShowItemDropdown(true);
                            updateItemDropdownPosition(idx);
                          }}
                          onBlur={() => { itemReqId.current++; setShowItemDropdown(false); }}
                        />
                        <p className="mt-1 px-2.5 text-[11px] tabular-nums text-slate-400">
                          <span className="font-semibold text-rose-400">Disc</span> ₹{fmtINR(item.discA)}
                          {isSameState
                            ? <> &nbsp;•&nbsp; CGST ₹{fmtINR(item.cgst)} &nbsp;•&nbsp; SGST ₹{fmtINR(item.sgst)}</>
                            : <> &nbsp;•&nbsp; IGST ₹{fmtINR(item.igst)}</>}
                        </p>
                      </td>

                      {/* HSN */}
                      <td className="px-2 py-2 align-top">
                        <input className={`${cellSlate} text-center`} type="text" aria-label="HSN or SAC" placeholder="HSN"
                          value={item.hsn} onChange={e => handleItemChange(idx, 'hsn', e.target.value)} />
                      </td>

                      {/* Batch */}
                      <td className="px-2 py-2 align-top">
                        <input className={`${cellSlate} text-center`} type="text" aria-label="Batch" placeholder="Batch"
                          value={item.batch || ''} onChange={e => handleItemChange(idx, 'batch', e.target.value)} />
                      </td>

                      {/* Rate */}
                      <td className="bg-amber-50/10 px-2 py-2 align-top">
                        <input
                          className={`${cellAmber} text-right font-semibold tabular-nums`}
                          type="text" inputMode="decimal" aria-label="Rate" placeholder="0.00"
                          value={item.rate === 0 ? '' : item.rate}
                          onFocus={e => e.target.select()}
                          onBlur={e => handleItemChange(idx, 'rate', parseFloat(e.target.value) || 0)}
                          onChange={e => { const v = e.target.value; if (v === '' || /^\d*\.?\d*$/.test(v)) handleItemChange(idx, 'rate', v); }}
                        />
                      </td>

                      {/* Qty */}
                      <td className="bg-amber-50/10 px-2 py-2 align-top">
                        <input
                          ref={el => { qtyInputRefs.current[idx] = el; }}
                          className={`${cellAmber} text-right font-black tabular-nums !text-slate-800`}
                          type="text" inputMode="numeric" aria-label="Quantity" placeholder="0"
                          value={item.qty === 0 ? '' : item.qty}
                          onFocus={e => e.target.select()}
                          onChange={e => { const v = e.target.value; if (v === '' || /^\d*$/.test(v)) handleItemChange(idx, 'qty', v === '' ? 0 : parseInt(v, 10)); }}
                        />
                      </td>

                      {/* Gross */}
                      <td className="px-3 pt-3.5 pb-2 text-right align-top text-[12px] font-medium tabular-nums text-slate-400">{fmtINR(item.grossAmount)}</td>

                      {/* Disc % */}
                      <td className="px-2 py-2 align-top">
                        <input
                          className={`${cellSlate} text-right tabular-nums`}
                          type="text" inputMode="decimal" aria-label="Discount percent" placeholder="0"
                          value={item.discP === 0 ? '' : item.discP}
                          onFocus={e => e.target.select()}
                          onBlur={e => handleItemChange(idx, 'discP', parseFloat(e.target.value) || 0)}
                          onChange={e => { const v = e.target.value; if (v === '') { handleItemChange(idx, 'discP', 0); return; } if (/^\d*\.?\d*$/.test(v)) handleItemChange(idx, 'discP', v); }}
                        />
                      </td>

                      {/* Taxable */}
                      <td className="bg-slate-50/50 px-3 pt-3.5 pb-2 text-right align-top text-[12.5px] font-semibold tabular-nums text-slate-700">{fmtINR(item.taxableAmt)}</td>

                      {/* GST % */}
                      <td className="px-2 py-2 align-top">
                        <input
                          className={`${cellBase} bg-blue-50/60 text-right font-black tabular-nums text-blue-600 focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-400/25`}
                          type="text" inputMode="decimal" aria-label="GST percent" placeholder="0"
                          value={item.gstP}
                          onFocus={e => e.target.select()}
                          onKeyDown={e => handleGstKeyDown(e, idx)}
                          onBlur={e => handleItemChange(idx, 'gstP', parseFloat(e.target.value) || 0)}
                          onChange={e => { const v = e.target.value; if (v === '' || /^\d*\.?\d*$/.test(v)) handleItemChange(idx, 'gstP', v); }}
                        />
                      </td>

                      {/* Total */}
                      <td className="bg-emerald-50/20 px-3 pt-3.5 pb-2 text-right align-top text-[13px] font-black tabular-nums text-slate-900">
                        ₹{fmtINR(item.lineTotal)}
                      </td>

                      {/* Remove */}
                      <td className="px-2 py-2 align-top">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => removeRow(item.id)}
                            disabled={rawItems.length === 1}
                            aria-label={`Remove item ${idx + 1}`}
                            title="Remove row"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-300 transition-all duration-150 hover:bg-red-50 hover:text-red-500 active:scale-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 disabled:pointer-events-none disabled:opacity-30"
                          >
                            <Trash2 size={15} />
                          </button>
                          {idx === items.length - 1 && (
                            <button
                              type="button"
                              onClick={addNewRow}
                              aria-label="Add new row"
                              title="Add new row"
                              className={btn.addRow}
                            >
                              <Plus size={16} strokeWidth={2.75} className="transition-transform duration-200 group-hover:rotate-90" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Section>

        {/* Item dropdown (portal so the table never clips it) */}
        {showItemDropdown && activeRowIndex !== null && itemSuggestions.length > 0 && dropdownCoords && typeof document !== 'undefined' && createPortal(
          <div
            style={{ position: 'absolute', top: dropdownCoords.top + 4, left: dropdownCoords.left, width: dropdownCoords.width, zIndex: 99999 }}
            onMouseDown={e => e.preventDefault()}  // keep focus in the input while clicking / scrolling the list
          >
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl shadow-blue-900/15">
              <div ref={itemListRef} role="listbox" className="max-h-[280px] overflow-y-auto divide-y divide-slate-50">
                {itemSuggestions.map((s, i) => {
                  const on = i === itemHighlight;
                  return (
                    <div
                      key={s.itemId ?? i}
                      role="option"
                      aria-selected={on}
                      onMouseEnter={() => setItemHighlight(i)}
                      onMouseDown={() => selectItem(activeRowIndex, s)}
                      className={`cursor-pointer px-4 py-3 transition-colors ${on ? 'bg-blue-600' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className={`text-[13px] font-semibold ${on ? 'text-white' : 'text-slate-700'}`}>{s.itemName}</span>
                        <span className={`shrink-0 rounded-md px-2 py-0.5 text-[10.5px] font-bold ${on ? 'bg-blue-400/30 text-white' : 'bg-slate-100 text-slate-500'}`}>{s.itemCode}</span>
                      </div>
                      <p className={`mt-0.5 text-[11px] ${on ? 'text-blue-100' : 'text-slate-400'}`}>
                        HSN: {s.hsnCode}
                        {s.salePrice != null && <> &nbsp;•&nbsp; ₹{fmtINR(s.salePrice)}</>}
                        {s.gstRate != null && <> &nbsp;•&nbsp; GST {s.gstRate}%</>}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* ── SUMMARY ──────────────────────────────────────── */}
        <Section icon={Receipt} title="Invoice summary" subtitle="Totals update as you edit line items" tone="blue" bodyClass="bg-white">
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <StatCard
                title="Taxes & adjustments"
                boxCls="border-slate-200 bg-slate-50"
                accent={{ bar: 'bg-blue-500', text: 'text-blue-600' }}
              >
                <StatRow label="Total CGST" value={`₹ ${fmtINR(isSameState ? totals.totalGST / 2 : 0)}`} tone="text-black" />
                <StatRow label="Total SGST" value={`₹ ${fmtINR(isSameState ? totals.totalGST / 2 : 0)}`} tone="text-black" />
                <StatRow label="Total IGST" value={`₹ ${fmtINR(!isSameState ? totals.totalGST : 0)}`} tone="text-black" />
                <StatRow
                  label="Round off"
                  value={`${roundOffNum > 0 ? '+' : roundOffNum < 0 ? '−' : ''}₹ ${Math.abs(roundOffNum).toFixed(2)}`}
                  tone="text-rose-600"
                />
              </StatCard>

              <StatCard
                title="Billing totals"
                boxCls="border-blue-100 bg-blue-50/20"
                accent={{ bar: 'bg-blue-400', text: 'text-blue-600' }}
              >
                <StatRow label="Total gross" value={`₹ ${fmtINR(totals.totalGross)}`} tone="text-slate-900" />
                <StatRow label="Total disc" value={`−₹ ${fmtINR(totals.totalDisc)}`} tone="text-green-700" />
                <StatRow label="Taxable amt" value={`₹ ${fmtINR(totals.totalTaxable)}`} tone="text-slate-700" />
                <StatRow label="Total GST" value={`+₹ ${fmtINR(totals.totalGST)}`} tone="text-blue-600" />
              </StatCard>
            </div>

            {/* Payable amount → opens payment */}
            <button
              type="button"
              onClick={openPayment}
              className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-900 p-7 text-left text-white shadow-xl shadow-emerald-900/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-emerald-900/35 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/40 active:translate-y-0 active:scale-[0.995]"
            >
              <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
              <span className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
              <span className="pointer-events-none absolute -bottom-10 -left-4 h-28 w-28 rounded-full bg-emerald-400/10 blur-2xl" />
              {/* soft sheen that sweeps across on hover */}
              <span className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-all duration-700 group-hover:left-full group-hover:opacity-100" />

              <div className="relative flex flex-wrap items-center justify-between gap-5">
                <div className="flex items-center gap-4">
                  <span className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm transition-colors group-hover:bg-white/20">
                    <CreditCard size={32} />
                  </span>
                  <div>
                    <p className="text-[12px] font-black uppercase tracking-[0.28em] text-emerald-100/80">Invoice payable amount</p>
                    <p className="mt-1 text-[11.5px] font-medium text-emerald-100/55">{numberToWords(totals.invoiceTotal)} Rupees Only</p>
                    <span className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3.5 py-1.5 text-[12.5px] font-semibold backdrop-blur-sm transition-all group-hover:bg-white/20">
                      Receive payment
                      <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>

                <p className="flex items-end gap-0.5 tabular-nums">
                  <span className="mb-1.5 text-2xl font-light text-emerald-200/80">₹</span>
                  <span className="text-6xl font-black tracking-tight">{totals.invoiceTotal.toLocaleString('en-IN')}</span>
                  <span className="mb-1.5 text-2xl font-black opacity-70">.00</span>
                </p>
              </div>
            </button>
          </div>
        </Section>

        {/* ── SHIPPING & TRANSPORT ─────────────────────────── */}
        <Section icon={Truck} title="Shipping & transport" subtitle="Optional — used for delivery and e-way bill" tone="amber" bodyClass="bg-white">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Contact person" htmlFor="contactPerson">
              <IconInput id="contactPerson" icon={User} placeholder="In-charge name" />
            </Field>
            <Field label="Shipping address" htmlFor="shipAddress" className="lg:col-span-2">
              <IconInput id="shipAddress" icon={Truck} placeholder="Same as billing or other..." />
            </Field>
            <Field label="Shipping state" htmlFor="shipState">
              <input id="shipState" className={`${inputCls} !bg-slate-50`} placeholder="Maharashtra" />
            </Field>
            <Field label="Transporter name" htmlFor="transporter">
              <IconInput id="transporter" icon={Truck} placeholder="Transporter" value={transporterName} onChange={e => setTransporterName(e.target.value)} />
            </Field>
            <Field label="Vehicle number" htmlFor="vehicle">
              <input id="vehicle" className={`${inputCls} uppercase`} placeholder="MH12AB1234" value={vehicleNumber} onChange={e => setVehicleNumber(e.target.value)} />
            </Field>
          </div>
        </Section>

        {/* ── NARRATION ────────────────────────────────────── */}
        <Section icon={FileText} title="Narration / remarks" subtitle="Printed as remarks on the invoice" tone="slate" bodyClass="bg-slate-50/60">
          <textarea
            id="narration"
            aria-label="Narration or remarks"
            className="h-24 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-[13px] text-slate-600 shadow-sm outline-none transition-all duration-150 placeholder:text-slate-300 hover:border-slate-300 focus:border-blue-300 focus:ring-4 focus:ring-blue-200/60"
            placeholder="Enter any additional notes or remarks..."
            value={narration}
            onChange={e => setNarration(e.target.value)}
          />
        </Section>

        {/* ── ERROR BANNER ─────────────────────────────────── */}
        {printError && (
          <div role="alert" className="flex items-start gap-3 border-t border-red-200 bg-red-50 px-6 py-3 text-red-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <p className="flex-1 text-[13px] font-semibold">{printError}</p>
            <button
              type="button" onClick={() => setPrintError(null)} aria-label="Dismiss"
              className="rounded-lg p-1 text-red-500 transition-colors hover:bg-red-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* ── ACTION BAR (sticks to bottom of viewport) ────── */}
        <footer className="sticky bottom-0 z-30 flex flex-wrap items-center gap-2.5 rounded-b-3xl border-t border-slate-800 bg-slate-900/95 px-6 py-3.5 text-white shadow-[0_-10px_30px_-10px_rgba(15,23,42,0.45)] backdrop-blur">
          <button type="button" onClick={invoiceId ? updateInvoice : saveInvoice} className={btn.primary}>
            {invoiceId
              ? <><CheckCircle size={16} strokeWidth={2.5} /> Update invoice</>
              : <><Save size={16} strokeWidth={2.5} /> Save invoice</>}
          </button>

          <button type="button" onClick={handleSaveAndPrint} disabled={isLoadingPrint} className={btn.secondary}>
            {isLoadingPrint
              ? <><Loader2 size={16} className="animate-spin text-slate-300" /> Processing…</>
              : <><Printer size={16} className="text-slate-400 transition-colors group-hover:text-white" /> Save & print</>}
          </button>

          <button type="button" className={btn.secondary}>
            <Mail size={16} className="text-slate-400 transition-colors group-hover:text-white" />
            Email
          </button>

          <div className="mx-1 hidden h-6 w-px bg-slate-700 sm:block" />

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
        <MultiTransaction totals={totals} hasInvoiceDiscount={Number(totals.totalDisc || 0) > 0} />
      )}
    </div>
  );
};

export default BillingV4;