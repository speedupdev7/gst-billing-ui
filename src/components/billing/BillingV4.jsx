import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Save, Printer, Mail, Send, Truck, XCircle, X, Plus,
  MapPin, FileText, Search, Hash, User, CreditCard,
  Landmark, ChevronDown, CheckCircle
} from 'lucide-react';
import DatePicker from "react-datepicker";
import { usePayment } from "../contextapi/PaymentContext";
import MultiTransaction from "../contextapi/MultiTransaction";
import "react-datepicker/dist/react-datepicker.css";
import axios from 'axios';

const BillingV4 = () => {
  const navigate = useNavigate();
  const [paymentMode, setPaymentMode]       = useState('');
  const [invoiceDate, setInvoiceDate]       = useState(new Date());
  const [invoiceTime, setInvoiceTime]       = useState(new Date());
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerSuggestions, setCustomerSuggestions] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [itemSearch, setItemSearch]         = useState('');
  const [itemSuggestions, setItemSuggestions] = useState([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showItemDropdown, setShowItemDropdown] = useState(false);
  const itemInputRefs = useRef({});
  const [dropdownCoords, setDropdownCoords] = useState(null);
  const [invoiceNo, setInvoiceNo]           = useState('');
  const [placeOfSupply, setPlaceOfSupply]   = useState('Maharashtra');
  const [reverseCharge, setReverseCharge]   = useState(false);
  const [transporterName, setTransporterName] = useState('');
  const [vehicleNumber, setVehicleNumber]   = useState('');
  const [narration, setNarration]           = useState('');
  const { id: invoiceId } = useParams();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const screenKey = "billing-v4";

  const {
    activeMethods, paymentSplit, paymentRefs, discountMode, showPaymentModal,
    setShowPaymentModal, setActiveMethods, setPaymentSplit, setPaymentRefs, setDiscountMode
  } = usePayment();

  const [activeRowIndex, setActiveRowIndex] = useState(null);
  const [isLoadingPrint, setIsLoadingPrint] = useState(false);
  const [printError, setPrintError]         = useState(null);

  // ── helpers ──────────────────────────────────────────────
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

  const createEmptyRow = () => ({
    id: Date.now() + Math.random(), itemId: null, itemCode: '', itemName: '',
    itemNameDetails: '', hsn: '', batch: '', rate: 0, qty: 0,
    grossAmount: 0, discP: 0, discA: 0, taxableAmt: 0, gstP: 18, gstA: 0, lineTotal: 0
  });

  const numberToWords = (num) => {
    const a = ['','One ','Two ','Three ','Four ','Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen '];
    const b = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
    const mg = (n) => { let s=''; if(n>99){s+=a[Math.floor(n/100)]+'Hundred ';n%=100;} if(n>19){s+=b[Math.floor(n/10)]+' '+a[n%10];}else{s+=a[n];} return s; };
    if(num===0) return 'Zero';
    let words='', n=num;
    const cr=Math.floor(n/10000000); n%=10000000;
    const lk=Math.floor(n/100000);   n%=100000;
    const th=Math.floor(n/1000);     n%=1000;
    if(cr>0) words+=mg(cr)+'Crore ';
    if(lk>0) words+=mg(lk)+'Lakh ';
    if(th>0) words+=mg(th)+'Thousand ';
    if(n>0)  words+=mg(n);
    return words.trim();
  };

  // ── API ───────────────────────────────────────────────────
  const searchCustomers = async (query) => {
    if (query.length < 3) { setCustomerSuggestions([]); return; }
    try {
      const res = await axios.get(`/api/customer-master/search?q=${encodeURIComponent(query)}`);
      setCustomerSuggestions(res.data); setShowCustomerDropdown(true);
    } catch { setCustomerSuggestions([]); }
  };

  const searchItems = async (query) => {
    if (query.length < 3) { setItemSuggestions([]); setShowItemDropdown(false); return; }
    try {
      const res = await axios.get(`/api/item-master/search?q=${encodeURIComponent(query)}`);
      setItemSuggestions(res.data); setShowItemDropdown(true);
    } catch { setItemSuggestions([]); setShowItemDropdown(false); }
  };

  const updateItemDropdownPosition = useCallback((idx) => {
    const input = itemInputRefs.current[idx];
    if (!input) return;
    const rect = input.getBoundingClientRect();
    setDropdownCoords({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX, width: rect.width });
  }, []);

  useEffect(() => {
    if (!showItemDropdown || activeRowIndex === null) { setDropdownCoords(null); return; }
    updateItemDropdownPosition(activeRowIndex);
    const h = () => updateItemDropdownPosition(activeRowIndex);
    window.addEventListener('resize', h);
    window.addEventListener('scroll', h, true);
    return () => { window.removeEventListener('resize', h); window.removeEventListener('scroll', h, true); };
  }, [showItemDropdown, activeRowIndex, itemSuggestions.length, updateItemDropdownPosition]);

  const selectCustomer = (c) => { setSelectedCustomer(c); setCustomerSearch(c.customerName); setShowCustomerDropdown(false); };

  const selectItem = (index, item) => {
    const u = [...items];
    u[index] = { ...u[index], itemId: item.itemId, itemCode: item.itemCode, itemName: item.itemName, itemNameDetails: item.itemNameDetails, hsn: item.hsnCode, gstP: item.gstRate, rate: item.salePrice, batch: item.batchCode || u[index].batch || 'BATCH01', itemUnit: item.unit };
    setItems(calculateTotals(u)); setItemSearch(''); setShowItemDropdown(false);
  };

  useEffect(() => {
    const fetch = async () => {
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
          const mapped = apiItems.map(item => ({
            id: item.id || Date.now() + Math.random(), itemId: item.itemId,
            itemName: item.itemName || item.item_name, hsn: item.hsnCode || item.hsn || '',
            batch: item.batch || item.batchNo || '', rate: Number(item.rate) || 0,
            qty: Number(item.quantity) || Number(item.qty) || 0,
            discP: Number(item.discountPercent) || Number(item.discP) || 0,
            gstP: Number(item.gstRate) || Number(item.gstP) || 0,
            grossAmount: 0, taxableAmt: 0, lineTotal: 0
          }));
          setItems(calculateTotals(mapped));
        }
      } catch (err) { console.error(err); }
    };
    fetch();
  }, [id]);

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
      totalCgst: isSameState ? totals.totalGST/2 : 0, totalSgst: isSameState ? totals.totalGST/2 : 0,
      totalIgst: !isSameState ? totals.totalGST : 0, roundOff: parseFloat(totals.roundOff),
      finalAmount: totals.invoiceTotal, transporterName, vehicleNumber, narration,
      items: items.map(i => ({ itemId: i.itemId, batchCode: i.batch||'BATCH01', hsnCode: i.hsn, quantity: i.qty, rate: i.rate, grossAmount: i.grossAmount, discountPct: i.discP, discountAmt: i.discA, taxableAmount: i.taxableAmt, gstRate: i.gstP, cgstAmt: i.cgst||0, sgstAmt: i.sgst||0, igstAmt: i.igst||0, lineTotal: i.lineTotal })),
      balance: { invoiceAmount: totals.invoiceTotal, paidAmount, balanceAmount: parseFloat((totals.invoiceTotal-paidAmount).toFixed(2)), dueDate: new Date(Date.now()+30*864e5).toISOString().split('T')[0], status: paidAmount>=totals.invoiceTotal?'Paid':'Unpaid' },
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
      customerId: selectedCustomer?.customerId, placeOfSupply, stateCode: selectedCustomer?.stateCode||'',
      reverseCharge, transporterName:'', vehicleNumber:'', narration:'',
      items: items.filter(i=>i.itemId).map(i => ({ itemId:i.itemId, hsnCode:i.hsn||'', quantity:i.qty, rate:i.rate, gstRate:i.gstP, lineTotal:i.lineTotal, itemName:i.itemName, itemCode:i.itemCode||'' })),
      balance: { invoiceAmount:totals.invoiceTotal, paidAmount, balanceAmount:parseFloat((totals.invoiceTotal-paidAmount).toFixed(2)), status:paidAmount>=totals.invoiceTotal?'Paid':'Unpaid', dueDate:new Date(Date.now()+30*864e5).toISOString().split('T')[0] },
      payments
    };
  };

  const handleSaveAndPrint = async () => {
    if (!selectedCustomer) { setPrintError('Please select a customer'); return; }
    if (items.filter(i=>i.itemId).length===0) { setPrintError('Please add at least one item'); return; }
    const payments = buildPaymentsPayload();
    const totalPaid = payments.reduce((s,p)=>s+p.amount,0);
    if (payments.length===0) { setPrintError('Please select a payment method.'); return; }
    if (totalPaid < totals.invoiceTotal - 0.01) { setPrintError('Payment is incomplete.'); return; }
    setPrintError(null); setIsLoadingPrint(true);
    try {
      const res = await axios.post('/api/invoice/save-and-print', buildInvoicePayload(), { responseType:'blob', headers:{'Content-Type':'application/json'} });
      const url = window.URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href=url; a.download=`invoice_${invoiceNo||Date.now()}.pdf`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) { setPrintError(err.response?.data?.message||'Failed to save and print.'); }
    finally { setIsLoadingPrint(false); }
  };

  const [items, setItems] = useState([createEmptyRow()]);
  const [totals, setTotals] = useState({ totalGross:0, totalDisc:0, totalTaxable:0, totalGST:0, invoiceTotal:0, roundOff:0 });

  const BILLING_STATE_CODE = "27";
  const isSameState = String(selectedCustomer?.stateCode||'') === BILLING_STATE_CODE;

  const calculateTotals = useCallback((currentItems) => {
    let tG=0, tD=0, tGST=0;
    const updated = currentItems.map(item => {
      const gross   = (parseFloat(item.qty)||0) * (parseFloat(item.rate)||0);
      const disc    = (gross * (parseFloat(item.discP)||0)) / 100;
      const taxable = gross - disc;
      const tax     = (taxable * (parseFloat(item.gstP)||0)) / 100;
      const cgst    = isSameState ? tax/2 : 0;
      const sgst    = isSameState ? tax/2 : 0;
      const igst    = !isSameState ? tax : 0;
      tG+=gross; tD+=disc; tGST+=tax;
      return { ...item, grossAmount:gross, discA:disc, taxableAmt:taxable, gstA:tax, cgst, sgst, igst, lineTotal:taxable+tax };
    });
    const raw=tG-tD+tGST, rounded=Math.round(raw);
    setTotals({ totalGross:tG, totalDisc:tD, totalTaxable:tG-tD, totalGST:tGST, invoiceTotal:rounded, roundOff:(rounded-raw).toFixed(2) });
    return updated;
  }, [isSameState]);

  const handleItemChange = (index, field, value) => { const u=[...items]; u[index][field]=value; setItems(calculateTotals(u)); };
  const addNewRow  = () => setItems([...items, createEmptyRow()]);
  const removeRow  = (id) => { if(items.length>1) setItems(calculateTotals(items.filter(i=>i.id!==id))); };
  const handleKeyDown = (e, index) => { if(e.key==='Tab' && !e.shiftKey && index===items.length-1) addNewRow(); };

  // ── INPUT FIELD COMPONENT (DRY helper) ───────────────────
  const Field = ({ label, children, className='' }) => (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-[0.12em]">{label}</label>
      {children}
    </div>
  );

  const inputCls = "w-full border border-amber-200 rounded-lg px-3 py-2 bg-white font-medium font-poppins text-slate-700 text-[12px] outline-none shadow-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all placeholder:text-slate-300 placeholder:font-normal";

  // ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-amber-50/20 text-[12px] font-poppins text-slate-700">
      <div className="max-w-[1500px] mx-auto bg-white rounded-2xl overflow-hidden border border-amber-200/60 shadow-2xl shadow-amber-900/5">

        {/* ── ERROR BANNER ─────────────────────────────────── */}
        {printError && (
          <div className="bg-red-50 border-b-2 border-red-200 px-5 py-3.5 flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <XCircle size={15} className="text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-red-800">Error</p>
              <p className="text-[11px] text-red-600 mt-0.5">{printError}</p>
            </div>
            <button onClick={() => setPrintError(null)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-100 transition-colors">
              <X size={14} />
            </button>
          </div>
        )}

        {/* ── TOP ACTION BAR ───────────────────────────────── */}
        <div className="flex bg-gradient-to-r from-[#061a4c] via-[#1e3a8a] to-[#061a4c] text-white px-5 py-3.5 gap-4 items-center border-b border-white/10 shadow-xl">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-2.5 rounded-xl shadow-lg ring-1 ring-white/20">
              <FileText size={18} className="text-white" />
            </div>
            <div>
              <p className="font-black text-sm tracking-widest text-white uppercase">Tax Invoice</p>
              <p className="text-[9px] text-blue-200/60 uppercase tracking-[0.2em] font-medium">Sales Entry</p>
            </div>
          </div>

          <div className="h-8 w-px bg-blue-400/20 mx-1" />

          {/* Reverse charge pill */}
          <label className="flex items-center gap-2 cursor-pointer select-none group">
            <div
              onClick={() => setReverseCharge(!reverseCharge)}
              className={`w-8 h-4 rounded-full relative transition-all duration-200 ${reverseCharge ? 'bg-blue-400' : 'bg-blue-900/60'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform duration-200 ${reverseCharge ? 'translate-x-4' : ''}`} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200/80 group-hover:text-white transition-colors">Reverse Charge</span>
          </label>

          <div className="ml-auto">
            <button
              onClick={() => navigate('/billing-v4-list')}
              className="flex items-center gap-1.5 px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg bg-indigo-600/80 hover:bg-indigo-500 text-white border border-indigo-400/30 transition-all shadow-lg"
            >
              <FileText size={12} />
              View List
            </button>
          </div>
        </div>

        {/* ── SECTION: INVOICE HEADER ──────────────────────── */}
        <div className="bg-amber-50/30">
          {/* Section Label */}
          <div className="flex items-center gap-2 px-5 py-2.5 bg-amber-100/50 border-b border-amber-200/60">
            <div className="w-1 h-3.5 rounded-full bg-amber-500" />
            <span className="text-[10px] font-black text-amber-800 uppercase tracking-[0.15em]">Invoice Header</span>
          </div>

          <div className="grid grid-cols-12 divide-x divide-amber-200/40">
            <div className="col-span-12 md:col-span-3 p-4 border-b border-amber-200/40">
              <Field label="Invoice No">
                <input className={inputCls} placeholder="INV/2024/0001" value={invoiceNo} onChange={e=>setInvoiceNo(e.target.value)} />
              </Field>
            </div>

            <div className="col-span-12 md:col-span-3 p-4 border-b border-amber-200/40">
              <Field label="Invoice Date">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  </div>
                  <DatePicker selected={invoiceDate} onChange={d=>setInvoiceDate(d)} dateFormat="dd MMM yyyy" showYearDropdown showMonthDropdown dropdownMode="select"
                    className="w-full border border-amber-200 rounded-lg px-3 py-2 pl-9 bg-white font-medium text-slate-700 text-[12px] outline-none shadow-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 h-[38px]"
                    calendarClassName="!rounded-xl !border !border-amber-200 shadow-xl" />
                </div>
              </Field>
            </div>

            <div className="col-span-12 md:col-span-3 p-4 border-b border-amber-200/40">
              <Field label="Time">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </div>
                  <DatePicker selected={invoiceTime} onChange={t=>setInvoiceTime(t)} showTimeSelect showTimeSelectOnly timeIntervals={5} timeCaption="Time" dateFormat="hh:mm aa"
                    className="w-full border border-amber-200 rounded-lg px-3 py-2 pl-9 bg-white font-medium text-slate-700 text-[12px] outline-none shadow-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 h-[38px]" />
                </div>
              </Field>
            </div>

            <div className="col-span-12 md:col-span-3 p-4 border-b border-amber-200/40 bg-amber-50/40">
              <Field label="Search Original Invoice">
                <div className="relative">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
                  <input className={`${inputCls} pl-9`} placeholder="Find invoice..." />
                </div>
              </Field>
            </div>
          </div>
        </div>

        {/* ── SECTION: CUSTOMER ────────────────────────────── */}
        <div className="border-t border-amber-200/60">
          <div className="flex items-center gap-2 px-5 py-2.5 bg-amber-100/30 border-b border-amber-200/60">
            <div className="w-1 h-3.5 rounded-full bg-amber-400" />
            <span className="text-[10px] font-black text-amber-800 uppercase tracking-[0.15em]">Customer & Billing Details</span>
          </div>

          <div className="grid grid-cols-12 divide-x divide-amber-200/30">
            {/* Row 1 */}
            <div className="col-span-12 md:col-span-2 p-4 border-b border-amber-200/30 bg-slate-50/40">
              <Field label="Customer ID">
                <div className="relative">
                  <Hash size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input className={`${inputCls} pl-9`} placeholder="CUST-001" />
                </div>
              </Field>
            </div>

            <div className="col-span-12 md:col-span-4 p-4 border-b border-amber-200/30">
              <Field label="Customer Name">
                <div className="relative">
                  <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    className={`${inputCls} pl-9 font-bold`}
                    placeholder="Search or enter name..."
                    value={customerSearch}
                    onChange={e => { setCustomerSearch(e.target.value); searchCustomers(e.target.value); }}
                    onFocus={() => customerSuggestions.length > 0 && setShowCustomerDropdown(true)}
                    onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 200)}
                  />
                  {showCustomerDropdown && customerSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full bg-white border border-amber-200 rounded-xl shadow-2xl max-h-44 overflow-y-auto mt-1.5 divide-y divide-amber-50">
                      {customerSuggestions.map((c, i) => (
                        <div key={i} className="px-4 py-2.5 hover:bg-amber-50 cursor-pointer group transition-colors" onClick={() => selectCustomer(c)}>
                          <p className="font-bold text-slate-700 text-[12px]">{c.customerName}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{c.gstin} · {c.state}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Field>
            </div>

            <div className="col-span-12 md:col-span-3 p-4 border-b border-amber-200/30 bg-blue-50/10">
              <Field label="GST Number">
                <div className="relative">
                  <Landmark size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input className={`${inputCls} pl-9 uppercase`} placeholder="27AAAAA0000A1Z5"
                    value={selectedCustomer?.gstin || ''}
                    onChange={e => setSelectedCustomer(p => p ? {...p, gstin:e.target.value} : null)} />
                </div>
              </Field>
            </div>

            <div className="col-span-12 md:col-span-3 p-4 border-b border-amber-200/30 bg-blue-50/10">
              <Field label="PAN">
                <div className="relative">
                  <CreditCard size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input className={`${inputCls} pl-9 uppercase`} placeholder="ABCDE1234F" />
                </div>
              </Field>
            </div>

            {/* Row 2 */}
            <div className="col-span-12 md:col-span-3 p-4 border-b border-amber-200/30">
              <Field label="Mobile Number">
                <div className="relative">
                  <Send size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input className={`${inputCls} pl-9`} placeholder="98XXXXXXXX"
                    value={selectedCustomer?.mobileNo || ''}
                    onChange={e => setSelectedCustomer(p => p ? {...p, mobileNo:e.target.value} : null)} />
                </div>
              </Field>
            </div>

            <div className="col-span-12 md:col-span-3 p-4 border-b border-amber-200/30">
              <Field label="Email ID">
                <div className="relative">
                  <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="email" className={`${inputCls} pl-9`} placeholder="customer@email.com"
                    value={selectedCustomer?.email || ''}
                    onChange={e => setSelectedCustomer(p => p ? {...p, email:e.target.value} : null)} />
                </div>
              </Field>
            </div>

            <div className="col-span-12 md:col-span-4 p-4 border-b border-amber-200/30">
              <Field label="Billing Address">
                <div className="relative">
                  <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input className={`${inputCls} pl-9`} placeholder="Street, City, Zip..."
                    value={selectedCustomer?.billingAddress || ''}
                    onChange={e => setSelectedCustomer(p => p ? {...p, billingAddress:e.target.value} : null)} />
                </div>
              </Field>
            </div>

            <div className="col-span-12 md:col-span-2 p-4 border-b border-amber-200/30 bg-slate-50/40">
              <Field label="Billing State">
                <input className={inputCls} placeholder="Maharashtra"
                  value={selectedCustomer?.state || selectedCustomer?.stateCode || ''}
                  onChange={e => setSelectedCustomer(p => p ? {...p, state:e.target.value} : null)} />
              </Field>
            </div>
          </div>
        </div>

        {/* ── ITEM TABLE ───────────────────────────────────── */}
        <div className="overflow-x-auto border-t border-slate-200">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#111111] text-[10px] uppercase tracking-widest font-semibold divide-x divide-white/5 border-b border-white/10">
                <th className="p-3.5 w-12 text-center text-slate-600">#</th>
                <th className="p-3.5 min-w-[260px] text-left text-slate-100/90 bg-white/[0.02]">Item Description</th>
                <th className="p-3.5 w-28 text-center text-slate-400">HSN/SAC</th>
                <th className="p-3.5 w-28 text-center text-slate-400">Batch</th>
                <th className="p-3.5 w-32 text-center text-amber-200/80 bg-amber-400/[0.04]">Rate</th>
                <th className="p-3.5 w-20 text-center text-amber-200/80 bg-amber-400/[0.04]">Qty</th>
                <th className="p-3.5 w-28 text-center text-slate-500/50 font-medium">Gross Amt</th>
                <th className="p-3.5 w-24 text-center text-rose-400/60 bg-rose-400/[0.02]">Disc %</th>
                <th className="p-3.5 w-32 text-center text-slate-200 bg-[#1c1c1c]">Taxable</th>
                <th className="p-3.5 w-24 text-center text-slate-400">GST %</th>
                <th className="p-3.5 w-36 text-center text-emerald-300 font-bold bg-emerald-500/[0.07] shadow-[inset_0_-2px_0_rgba(16,185,129,0.18)]">Total Amt</th>
                <th className="p-3.5 w-24 text-center text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100/80">
              {items.map((item, idx) => (
                <React.Fragment key={item.id}>
                  <tr className="group hover:bg-amber-50/20 transition-colors duration-100">
                    {/* Sr */}
                    <td className="p-3 text-center border-r border-slate-100">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 font-bold text-[10px] flex items-center justify-center mx-auto">
                        {idx + 1}
                      </span>
                    </td>

                    {/* Item Name */}
                    <td className="p-1.5 border-r border-slate-100 overflow-visible">
                      <input
                        ref={el => { itemInputRefs.current[idx] = el; }}
                        className="w-full bg-transparent focus:bg-blue-50/30 border-none focus:ring-2 focus:ring-blue-400/15 rounded-lg px-2.5 py-1.5 text-[13px] text-slate-700 placeholder:text-slate-300 outline-none font-medium transition-all"
                        type="text"
                        value={item.itemName}
                        onChange={e => { handleItemChange(idx,'itemName',e.target.value); setItemSearch(e.target.value); searchItems(e.target.value); updateItemDropdownPosition(idx); }}
                        onFocus={() => { setActiveRowIndex(idx); if(itemSuggestions.length>0) setShowItemDropdown(true); updateItemDropdownPosition(idx); }}
                        onBlur={() => setTimeout(() => { setShowItemDropdown(false); setActiveRowIndex(null); }, 200)}
                        placeholder="Search or enter item..."
                      />
                    </td>

                    {/* HSN */}
                    <td className="p-1.5 border-r border-slate-100">
                      <input className="w-full bg-transparent border-none focus:ring-1 focus:ring-slate-200 rounded-lg px-2 py-1.5 text-[12px] text-slate-500 outline-none text-center" type="text" value={item.hsn} onChange={e=>handleItemChange(idx,'hsn',e.target.value)} placeholder="HSN" />
                    </td>

                    {/* Batch */}
                    <td className="p-1.5 border-r border-slate-100">
                      <input className="w-full bg-transparent border-none focus:ring-1 focus:ring-slate-200 rounded-lg px-2 py-1.5 text-[12px] text-slate-500 outline-none text-center" type="text" value={item.batch||''} onChange={e=>handleItemChange(idx,'batch',e.target.value)} placeholder="Batch" />
                    </td>

                    {/* Rate */}
                    <td className="p-1.5 border-r border-slate-100 bg-amber-50/10">
                      <input
                        className="w-full bg-transparent border-none focus:ring-2 focus:ring-amber-400/15 rounded-lg px-2 py-1.5 text-right text-[13px] text-slate-700 outline-none font-semibold"
                        type="text" inputMode="decimal"
                        value={item.rate===0?'':item.rate}
                        onBlur={e=>handleItemChange(idx,'rate',parseFloat(e.target.value)||0)}
                        onChange={e=>{ const v=e.target.value; if(v===''||/^\d*\.?\d*$/.test(v)) handleItemChange(idx,'rate',v); }}
                      />
                    </td>

                    {/* Qty */}
                    <td className="p-1.5 border-r border-slate-100 bg-amber-50/10">
                      <input
                        className="w-full bg-transparent border-none focus:ring-2 focus:ring-amber-400/15 rounded-lg px-2 py-1.5 text-right text-[13px] font-black text-slate-800 outline-none"
                        type="text" inputMode="numeric"
                        value={item.qty===0?'':item.qty}
                        onBlur={e=>e.target.value===''&&handleItemChange(idx,'qty',0)}
                        onChange={e=>{ const v=e.target.value; if(v===''||/^\d*$/.test(v)) handleItemChange(idx,'qty',v===''?0:parseInt(v)); }}
                      />
                    </td>

                    {/* Gross */}
                    <td className="px-3 py-2 text-right text-slate-400 font-medium text-[11px] border-r border-slate-100">
                      {(item.grossAmount||0).toFixed(2)}
                    </td>

                    {/* Disc % */}
                    <td className="p-1.5 border-r border-slate-100">
                      <input
                        className="w-full bg-transparent border-none focus:ring-1 focus:ring-slate-200 rounded-lg px-2 py-1.5 text-right text-[13px] text-slate-500 outline-none"
                        type="text" inputMode="decimal" placeholder="0"
                        value={item.discP===0?'':item.discP}
                        onBlur={e=>handleItemChange(idx,'discP',parseFloat(e.target.value)||0)}
                        onChange={e=>{ const v=e.target.value; if(v===''){handleItemChange(idx,'discP',0);return;} if(/^\d*\.?\d*$/.test(v)) handleItemChange(idx,'discP',v); }}
                      />
                    </td>

                    {/* Taxable */}
                    <td className="px-3 py-2 text-right font-semibold text-slate-700 text-[12px] border-r border-slate-100 bg-slate-50/50">
                      {(item.taxableAmt||0).toFixed(2)}
                    </td>

                    {/* GST % */}
                    <td className="p-1.5 border-r border-slate-100">
                      <input
                        className="w-full bg-blue-50/60 border-none focus:ring-2 focus:ring-blue-400/20 rounded-lg px-2 py-1.5 text-right text-[13px] font-black text-blue-600 outline-none"
                        type="number"
                        value={item.gstP}
                        onKeyDown={e=>handleKeyDown(e,idx)}
                        onChange={e=>{ const v=parseFloat(e.target.value); handleItemChange(idx,'gstP',isNaN(v)?0:v); }}
                      />
                    </td>

                    {/* Line Total */}
                    <td className="px-3 py-2 text-right font-black text-slate-900 text-[13px] bg-emerald-50/20 border-r border-slate-100">
                      ₹{(item.lineTotal||0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Actions */}
                    <td className="p-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={()=>removeRow(item.id)} className="w-7 h-7 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center">
                          <XCircle size={16} strokeWidth={2.5} />
                        </button>
                        {idx === items.length - 1 && (
                          <button onClick={addNewRow} className="w-7 h-7 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all flex items-center justify-center shadow-sm">
                            <Plus size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Tax Sub-row */}
                  <tr className="bg-gradient-to-r from-slate-50/60 to-transparent text-[9.5px] text-slate-400 border-b border-slate-100/60">
                    <td colSpan={3} className="py-1.5 px-4 text-right text-[9px] font-bold text-slate-300 uppercase tracking-widest border-r border-slate-100/60">Tax Detail</td>
                    <td colSpan={2} className="py-1.5 px-3 border-r border-slate-100/60">
                      <span className="text-rose-400 font-semibold uppercase text-[9px]">Disc</span>
                      <span className="text-slate-700 font-bold ml-1.5 text-[10px]">
                        ₹{((parseFloat(item.rate)||0)*(parseFloat(item.qty)||0)*(parseFloat(item.discP)||0)/100).toFixed(2)}
                      </span>
                    </td>
                    <td colSpan={2} className="py-1.5 px-3 border-r border-slate-100/60">
                      <span className="text-slate-400">CGST</span>
                      <span className="text-slate-700 font-bold ml-1.5 text-[10px]">₹{Number(item.cgst||0).toFixed(2)}</span>
                    </td>
                    <td colSpan={2} className="py-1.5 px-3 border-r border-slate-100/60">
                      <span className="text-slate-400">SGST</span>
                      <span className="text-slate-700 font-bold ml-1.5 text-[10px]">₹{Number(item.sgst||0).toFixed(2)}</span>
                    </td>
                    <td colSpan={2} className="py-1.5 px-3 border-r border-slate-100/60">
                      <span className="text-slate-400">IGST</span>
                      <span className="text-slate-700 font-bold ml-1.5 text-[10px]">₹{Number(item.igst||0).toFixed(2)}</span>
                    </td>
                    <td colSpan={1} />
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Item Dropdown Portal */}
        {showItemDropdown && activeRowIndex !== null && itemSuggestions.length > 0 && dropdownCoords && typeof document !== 'undefined' && createPortal(
          <div style={{ position:'absolute', top:dropdownCoords.top, left:dropdownCoords.left, width:dropdownCoords.width, zIndex:99999 }}>
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xl shadow-blue-900/10 overflow-hidden mt-1">
              <div className="max-h-[260px] overflow-y-auto divide-y divide-slate-50">
                {itemSuggestions.map((s, i) => (
                  <div key={i} className="px-4 py-3 hover:bg-blue-600 group/item cursor-pointer transition-colors" onMouseDown={()=>selectItem(activeRowIndex,s)}>
                    <div className="flex justify-between items-start gap-2">
                      <div className="font-semibold text-[12px] text-slate-700 group-hover/item:text-white">{s.itemName}</div>
                      <span className="text-[9px] uppercase tracking-widest font-black px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 group-hover/item:bg-blue-400/30 group-hover/item:text-white flex-shrink-0">{s.itemCode}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 group-hover/item:text-blue-100 mt-0.5">HSN: {s.hsnCode}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* ── SUMMARY SECTION ──────────────────────────────── */}
        <div className="border-t border-slate-200 bg-white">
          <div className="p-6 space-y-5">

            {/* Tax + Totals boxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Box 1: Tax */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                  <div className="w-1.5 h-4 rounded-full bg-blue-500" />
                  <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.15em]">Taxes & Adjustments</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label:'Total CGST',  value: isSameState?(totals.totalGST/2).toFixed(2):'0.00', color:'text-black' },
                    { label:'Total SGST',  value: isSameState?(totals.totalGST/2).toFixed(2):'0.00', color:'text-black' },
                    { label:'Total IGST',  value: !isSameState?totals.totalGST.toFixed(2):'0.00',    color:'text-black' },
                    { label:'Round Off',   value: totals.roundOff, color:'text-rose-600' },
                  ].map(({label,value,color}) => (
                    <div key={label} className="flex flex-col gap-0.5">
                      <span className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider">{label}</span>
                      <span className={`font-black text-lg ${color}`}>₹ {value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Box 2: Billing Totals */}
              <div className="bg-blue-50/20 rounded-2xl border border-blue-100 p-5 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-blue-100">
                  <div className="w-1.5 h-4 rounded-full bg-blue-400" />
                  <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.15em]">Billing Totals</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label:'Total Gross',  value:`₹ ${totals.totalGross.toFixed(2)}`,  color:'text-slate-900' },
                    { label:'Total Disc',   value:`−₹ ${totals.totalDisc.toFixed(2)}`, color:'text-green-700' },
                    { label:'Taxable Amt',  value:`₹ ${totals.totalTaxable.toFixed(2)}`,color:'text-slate-700' },
                    { label:'Total GST',    value:`+₹ ${totals.totalGST.toFixed(2)}`,  color:'text-blue-600'  },
                  ].map(({label,value,color}) => (
                    <div key={label} className="flex flex-col gap-0.5">
                      <span className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider">{label}</span>
                      <span className={`font-black text-lg ${color}`}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Grand Total CTA */}
            <div
              onClick={() => { localStorage.setItem('activePaymentScreen', screenKey); setShowPaymentModal(true); }}
              className="w-full bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-900 text-white p-6 rounded-2xl relative overflow-hidden cursor-pointer hover:shadow-2xl hover:shadow-emerald-900/30 transition-all duration-300 active:scale-[0.99] group"
            >
              {/* Decorative ring */}
              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
              <div className="relative z-10 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3.5 bg-white/10 rounded-xl border border-white/15 group-hover:bg-white/15 transition-colors backdrop-blur-sm">
                    <CreditCard size={28} />
                  </div>
                  <div>
                    <p className="text-[9.5px] font-black uppercase tracking-[0.3em] text-emerald-100/80">Invoice Payable Amount</p>
                    <p className="text-emerald-100/50 text-[10px] font-medium mt-0.5">
                      {numberToWords(totals.invoiceTotal)} Rupees Only
                    </p>
                  </div>
                </div>
                <div className="text-right flex items-end gap-0.5">
                  <span className="text-xl font-light text-emerald-200/80 mb-1">₹</span>
                  <span className="text-5xl font-black tracking-tight">{totals.invoiceTotal.toLocaleString('en-IN')}</span>
                  <span className="text-xl font-black mb-1 opacity-70">.00</span>
                </div>
              </div>
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-8 -left-4 w-24 h-24 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />
            </div>
          </div>
        </div>

        {/* ── SHIPPING & TRANSPORT ─────────────────────────── */}
        <div className="grid grid-cols-12 border-t border-amber-200/50 divide-x divide-amber-200/40">
          <div className="col-span-12 md:col-span-4 p-4 border-b border-amber-200/40">
            <Field label="Contact Person">
              <div className="relative">
                <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input className={`${inputCls} pl-9`} placeholder="In-charge name" />
              </div>
            </Field>
          </div>

          <div className="col-span-12 md:col-span-5 p-4 border-b border-amber-200/40">
            <Field label="Shipping Address">
              <div className="relative">
                <Truck size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input className={`${inputCls} pl-9`} placeholder="Same as billing or other..." />
              </div>
            </Field>
          </div>

          <div className="col-span-12 md:col-span-3 p-4 border-b border-amber-200/40 bg-slate-50/30">
            <Field label="Shipping State">
              <input className={inputCls} placeholder="Maharashtra" />
            </Field>
          </div>
        </div>

        {/* ── NARRATION ────────────────────────────────────── */}
        <div className="p-5 bg-slate-50/60 border-t border-slate-200">
          <Field label="Narration / Remarks">
            <textarea
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 h-20 focus:ring-2 focus:ring-blue-200 focus:border-blue-300 outline-none text-slate-600 text-[12px] resize-none transition-all"
              placeholder="Enter any additional notes or remarks..."
              value={narration}
              onChange={e=>setNarration(e.target.value)}
            />
          </Field>
        </div>

        {/* ── FINAL ACTION BAR ─────────────────────────────── */}
        <div className="flex items-center gap-2.5 bg-slate-900 text-white px-5 py-3.5 border-t border-slate-800 flex-wrap">

          {/* Save / Update */}
          <button
            onClick={invoiceId ? updateInvoice : saveInvoice}
            className="flex items-center gap-2 bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 px-5 py-2.5 rounded-xl font-black text-[10.5px] uppercase tracking-widest transition-all shadow-lg shadow-blue-900/40 active:scale-95 border border-blue-400/20"
          >
            {invoiceId ? <><CheckCircle size={15} strokeWidth={2.5} /> Update Invoice</> : <><Save size={15} strokeWidth={2.5} /> Save Invoice</>}
          </button>

          {/* Save & Print */}
          <button
            onClick={handleSaveAndPrint}
            disabled={isLoadingPrint}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 px-4 py-2.5 rounded-xl font-bold text-[10.5px] uppercase tracking-wider border border-slate-700/80 transition-all"
          >
            <Printer size={15} className={`text-slate-400 ${isLoadingPrint?'animate-spin':''}`} />
            {isLoadingPrint ? 'Processing...' : 'Save & Print'}
          </button>

          {/* Email */}
          <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2.5 rounded-xl font-bold text-[10.5px] uppercase tracking-wider border border-slate-700/80 transition-all">
            <Mail size={15} className="text-slate-400" />
            Email
          </button>

          <div className="h-5 w-px bg-slate-700 mx-1" />

          {/* e-Invoice */}
          <button className="flex items-center gap-2 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-300 hover:text-white px-4 py-2.5 rounded-xl font-black text-[10.5px] uppercase tracking-widest border border-indigo-500/25 transition-all">
            <Send size={15} />
            e-Invoice
          </button>

          {/* e-Way Bill */}
          <button className="flex items-center gap-2 bg-orange-600/10 hover:bg-orange-600 text-orange-400 hover:text-white px-4 py-2.5 rounded-xl font-black text-[10.5px] uppercase tracking-widest border border-orange-500/25 transition-all">
            <Truck size={15} />
            e-Way Bill
          </button>

          {/* Cancel */}
          <button className="flex items-center gap-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 px-4 py-2.5 rounded-xl font-bold text-[10.5px] uppercase tracking-wider ml-auto transition-all group">
            <XCircle size={15} className="group-hover:rotate-90 transition-transform duration-300" />
            Cancel
          </button>
        </div>

      </div>

      {showPaymentModal && (
        <MultiTransaction totals={totals} hasInvoiceDiscount={Number(totals.totalDisc||0)>0} />
      )}
    </div>
  );
};

export default BillingV4;