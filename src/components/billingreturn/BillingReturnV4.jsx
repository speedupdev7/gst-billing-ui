import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import {
    Save, Printer, Mail, Send, Truck, XCircle, X, Plus,
    MapPin, FileText, Search, Clock, Calendar, Hash,
    RefreshCcw, User, CreditCard, Landmark, CheckCircle,
    RotateCcw, AlertTriangle
} from 'lucide-react';
import DatePicker from "react-datepicker";
import { usePayment } from "../contextapi/PaymentContext";
import { useToast } from "../contextapi/ToastContext";
import MultiTransaction from "../contextapi/MultiTransaction";
import { useLocation } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";
import axios from 'axios';

// ─────────────────────────────────────────────
//  COLOR PALETTE  (rose-dominant — mirrors
//  BillingV4's blue/amber but in rose/amber)
//
//  Top bar:   from-rose-900 via-rose-800 to-rose-900
//  Sections:  rose-100/200 tints  (amber-100 in billing)
//  Table:     slate-900 + rose accents
//  CTA block: rose-800 → rose-700 → rose-900
//  Action bar: #1c0a0a deep-rose near-black
// ─────────────────────────────────────────────

const BillingReturnV4 = () => {
    const location = useLocation();
    const invoiceFromList = location.state?.invoice;
    const toast = useToast();
    const navigate = useNavigate();
    // ── State ───────────────────────────────────────────────
    const [invoiceDate, setInvoiceDate] = useState(new Date());
    const [invoiceTime, setInvoiceTime] = useState(new Date());
    const [customerSearch, setCustomerSearch] = useState('');
    const [customerSuggestions, setCustomerSuggestions] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
    const [invoiceNo, setInvoiceNo] = useState('');
    const [placeOfSupply, setPlaceOfSupply] = useState('Maharashtra');
    const [reverseCharge, setReverseCharge] = useState(false);
    const [narration, setNarration] = useState('');
    const [returnAll, setReturnAll] = useState(false);
    const [clearAll, setClearAll] = useState(false);
    const screenKey = "return";

    const { showPaymentModal, setShowPaymentModal } = usePayment();

    const [editingId, setEditingId] = useState(null);
    const [returnHistory, setReturnHistory] = useState([]);
    const [isLoadingReturns, setIsLoadingReturns] = useState(false);
    const [returnReasonCode, setReturnReasonCode] = useState('DEFECT');
    const [returnReasonText, setReturnReasonText] = useState('');
    const [returnRemarks, setReturnRemarks] = useState('');
    const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);
    const [originalInvoiceData, setOriginalInvoiceData] = useState(null);
    const [loadedInvoiceNo, setLoadedInvoiceNo] = useState(null);
    const [printError, setPrintError] = useState(null);

    const toggleEdit = (id) => setEditingId(prev => prev === id ? null : id);

    // ── Row factory ─────────────────────────────────────────
    const createEmptyRow = () => ({
        id: Date.now() + Math.random(), itemId: null, itemCode: '',
        itemName: '', itemNameDetails: '', hsn: '', batch: '',
        rate: 0, qty: 0, returnQty: 0,
        grossAmount: 0, discP: 0, discA: 0, taxableAmt: 0,
        gstP: 18, gstA: 0, lineTotal: 0
    });

    const [items, setItems] = useState([createEmptyRow()]);
    const [totals, setTotals] = useState({
        totalGross: 0, totalDisc: 0, totalTaxable: 0,
        totalGST: 0, invoiceTotal: 0, roundOff: 0
    });

    // ── Calculations ────────────────────────────────────────
    const calculateTotals = useCallback((currentItems) => {
        let tG = 0, tD = 0, tGST = 0;
        const updated = currentItems.map(item => {
            const gross = (parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0);
            const disc = (gross * (parseFloat(item.discP) || 0)) / 100;
            const taxable = gross - disc;
            const tax = (taxable * (parseFloat(item.gstP) || 0)) / 100;
            tG += gross; tD += disc; tGST += tax;
            return { ...item, grossAmount: gross, discA: disc, taxableAmt: taxable, gstA: tax, lineTotal: taxable + tax };
        });
        const raw = tG - tD + tGST, rounded = Math.round(raw);
        setTotals({ totalGross: tG, totalDisc: tD, totalTaxable: tG - tD, totalGST: tGST, invoiceTotal: rounded, roundOff: (rounded - raw).toFixed(2) });
        return updated;
    }, []);

    const handleItemChange = (index, field, value) => {
        const u = [...items]; u[index][field] = value; setItems(u);
    };

    const addNewRow = () => setItems([...items, createEmptyRow()]);
    const removeRow = (id) => { if (items.length > 1) setItems(calculateTotals(items.filter(i => i.id !== id))); };

    // ── Return totals ────────────────────────────────────────
    const returnTotals = items.reduce((acc, item) => {
        const qty = Number(item.returnQty) || 0;
        const gross = item.rate * qty;
        const disc = gross * ((Number(item.discP) || 0) / 100);
        const taxable = gross - disc;
        const gst = taxable * ((Number(item.gstP) || 0) / 100);
        return { gross: acc.gross + gross, disc: acc.disc + disc, taxable: acc.taxable + taxable, gst: acc.gst + gst };
    }, { gross: 0, disc: 0, taxable: 0, gst: 0 });

    const isReturnActive = returnTotals.gross > 0;
    const adjustmentList = items.filter(i => i.returnQty > 0);
    const isAdjustmentActive = adjustmentList.length > 0;

    // ── API ─────────────────────────────────────────────────
    const searchCustomers = async (q) => {
        if (q.length < 3) { setCustomerSuggestions([]); return; }
        try {
            const res = await axios.get(`/api/customer-master/search?q=${encodeURIComponent(q)}`);
            setCustomerSuggestions(res.data); setShowCustomerDropdown(true);
        } catch { setCustomerSuggestions([]); }
    };

    const selectCustomer = (c) => { setSelectedCustomer(c); setCustomerSearch(c.customerName); setShowCustomerDropdown(false); };

    const getInvoiceByNumber = async (invNo) => {
        try {
            if (!invNo || invNo.length < 3) return;
            const res = await axios.get('/api/invoice/search-by-number', { params: { invoiceNo: invNo } });
            const data = res.data?.data || res.data;
            if (!data) return;
            const customer = data.customer || data.unit || data.customerMaster || null;
            setSelectedCustomer(customer);
            setCustomerSearch(customer?.customerName || customer?.name || data.customerName || '');
            setShowCustomerDropdown(false);
            const apiInvoiceNo = data.invoiceNo || invNo;
            setInvoiceNo(apiInvoiceNo); setLoadedInvoiceNo(apiInvoiceNo);
            if (data.invoiceDate) setInvoiceDate(new Date(data.invoiceDate));
            if (data.placeOfSupply) setPlaceOfSupply(data.placeOfSupply);
            setReverseCharge(Boolean(data.reverseCharge));
            setNarration(data.narration || '');
            const invoiceItems = data.invoiceItems || data.items || [];
            const mapped = invoiceItems.map(item => ({
                id: Date.now() + Math.random(),
                invoiceItemId: item.invoiceItemId || item.id,
                itemId: item.itemId,
                itemName: item.itemName || item.item?.itemName || '',
                batch: item.batchCode || item.batch || '',
                hsn: item.hsnCode || item.hsn || '0000',
                rate: item.rate ?? 0, qty: item.quantity ?? item.qty ?? 0, returnQty: 0,
                grossAmount: item.grossAmount ?? 0,
                discP: item.discountPct ?? item.discP ?? 0, discA: item.discountAmt ?? 0,
                taxableAmt: item.taxableAmount ?? 0,
                gstP: item.gstRate ?? 0, gstA: (item.cgstAmt ?? 0) + (item.sgstAmt ?? 0),
                lineTotal: item.lineTotal ?? 0,
            }));
            setItems(calculateTotals(mapped));
            setOriginalInvoiceData(data);
            fetchReturnHistory(apiInvoiceNo);
        } catch (err) { console.error(err); }
    };

    const fetchReturnHistory = async (invNo) => {
        try {
            setIsLoadingReturns(true);
            const res = await axios.get(`/api/invoice/${encodeURIComponent(invNo)}/returns`);
            const returns = res.data?.data || res.data || [];
            setReturnHistory(Array.isArray(returns) ? returns : []);
        } catch { setReturnHistory([]); }
        finally { setIsLoadingReturns(false); }
    };

    const getAvailableQuantity = (itemId) => {
        if (!originalInvoiceData?.items) return 0;
        const orig = originalInvoiceData.items.find(i => i.itemId === itemId);
        if (!orig) return 0;
        const totalReturned = (returnHistory || []).reduce((sum, ret) => {
            const ri = ret.items?.find(i => i.itemId === itemId);
            return sum + (ri?.quantity || 0);
        }, 0);
        return (orig.quantity || 0) - totalReturned;
    };

    useEffect(() => {
        if (invoiceFromList?.invoiceNo) getInvoiceByNumber(invoiceFromList.invoiceNo);
    }, [invoiceFromList]);

    const submitReturn = async () => {
        const invNo = loadedInvoiceNo || invoiceNo;
        if (!invNo) { toast.error('Load an invoice first.'); return; }
        const lines = items.filter(i => i.returnQty > 0).map(item => ({
            invoiceItemId: item.invoiceItemId || item.itemId, itemId: item.itemId,
            batchCode: item.batch || 'BATCH01', hsnCode: item.hsn || '0000',
            quantity: item.returnQty, rate: item.rate,
            grossAmount: item.rate * item.returnQty,
            discountPct: item.discP,
            discountAmt: (item.rate * item.returnQty * item.discP) / 100,
            taxableAmount: (item.rate * item.returnQty) * (1 - item.discP / 100),
            gstRate: item.gstP,
            cgstAmt: ((item.rate * item.returnQty * (1 - item.discP / 100)) * item.gstP / 100) / 2,
            sgstAmt: ((item.rate * item.returnQty * (1 - item.discP / 100)) * item.gstP / 100) / 2,
            igstAmt: 0,
            lineTotal: (item.rate * item.returnQty * (1 - item.discP / 100)) * (1 + item.gstP / 100),
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
                setItems(calculateTotals(items.map(i => ({ ...i, returnQty: 0 }))));
                setReturnAll(false);
                fetchReturnHistory(invNo);
            }
        } catch (err) {
            toast.error(`Error: ${err.response?.data?.message || err.message}`);
        } finally { setIsSubmittingReturn(false); }
    };

    // ── shared input class ──────────────────────────────────
    const inputCls = "w-full border border-rose-200 rounded-lg px-3 py-2 bg-white font-medium text-slate-700 text-[12px] outline-none shadow-sm focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all placeholder:text-slate-300 placeholder:font-normal";

    const Field = ({ label, children, className = '' }) => (
        <div className={`flex flex-col gap-1.5 ${className}`}>
            <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-[0.12em]">{label}</label>
            {children}
        </div>
    );

    // ────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-rose-50/20 text-[12px] font-poppins text-slate-700">
            <div className="max-w-[1500px] mx-auto bg-white rounded-2xl overflow-hidden border border-rose-200/60 shadow-2xl shadow-rose-900/5">

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

                {/* ── TOP BAR ──────────────────────────────────────── */}
                <div
                    className="flex items-center gap-4 px-5 py-3.5 text-white border-b border-white/10 shadow-xl"
                    style={{ background: 'linear-gradient(135deg, #881337 0%, #be123c 45%, #9f1239 100%)' }}
                >
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-rose-300 to-rose-600 p-2.5 rounded-xl shadow-lg ring-1 ring-white/20">
                            <RefreshCcw size={18} className="text-white" />
                        </div>
                        <div>
                            <p className="font-black text-sm tracking-widest text-white uppercase">Billing Return</p>
                            <p className="text-[9px] text-rose-200/60 uppercase tracking-[0.2em] font-medium">Credit Note Entry</p>
                        </div>
                    </div>

                    <div className="h-8 w-px bg-rose-400/20 mx-1" />

                    {/* Return All toggle */}
                    <label className="flex items-center gap-2 cursor-pointer select-none group">
                        <input
                            type="checkbox"
                            checked={returnAll}
                            onChange={e => {
                                setReturnAll(e.target.checked);
                                if (e.target.checked) setItems(items.map(i => ({ ...i, returnQty: i.qty })));
                            }}
                            className="w-3.5 h-3.5 accent-rose-300"
                        />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-200/80">Return All</span>
                    </label>

                    {/* Clear All toggle */}
                    <label className="flex items-center gap-2 cursor-pointer select-none group">
                        <input
                            type="checkbox"
                            checked={clearAll}
                            onChange={e => {
                                if (e.target.checked) {
                                    setClearAll(true);
                                    setItems(items.map(i => ({ ...i, returnQty: 0 })));
                                    setReturnAll(false);
                                    setTimeout(() => setClearAll(false), 300);
                                }
                            }}
                            className="w-3.5 h-3.5 accent-red-400"
                        />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-200/80">Clear All</span>
                    </label>

                    {isReturnActive && (
                        <div className="flex items-center gap-1.5 ml-2 px-3 py-1.5 bg-rose-900/40 rounded-lg border border-rose-400/20">
                            <span className="w-1.5 h-1.5 bg-rose-300 rounded-full animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-rose-100">
                                {adjustmentList.length} Item{adjustmentList.length > 1 ? 's' : ''} Selected
                            </span>
                        </div>
                    )}

                    {/* BUTTON MOVED TO RIGHT SIDE, COMPACT SIZE */}
                    <button
                        onClick={() => navigate('/billing-return-v4-list')}
                        className="ml-auto px-3.5 py-1 text-xs font-bold text-[#880d2e] 
        bg-white border border-transparent rounded-md shadow-sm hover:bg-pink-50
         focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 
         focus:ring-offset-[#881337] transition-all duration-200 cusrsor-pointer"
                    >
                        View List
                    </button>
                </div>

                {/* ── SECTION: INVOICE HEADER ──────────────────────── */}
                <div className="bg-rose-50/30">
                    <div className="flex items-center gap-2 px-5 py-2.5 bg-rose-100/50 border-b border-rose-200/60">
                        <div className="w-1 h-3.5 rounded-full bg-rose-500" />
                        <span className="text-[10px] font-black text-rose-800 uppercase tracking-[0.15em]">Invoice Reference & Header</span>
                    </div>

                    <div className="grid grid-cols-12 divide-x divide-rose-200/40">
                        {/* Search Invoice */}
                        <div className="col-span-12 md:col-span-3 p-4 border-b border-rose-200/40 bg-rose-50/40">
                            <Field label="Search & Load Invoice">
                                <div className="relative">
                                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-400" />
                                    <input
                                        className={`${inputCls} pl-9`}
                                        placeholder="Type invoice number..."
                                        onChange={e => { setInvoiceNo(e.target.value); getInvoiceByNumber(e.target.value); }}
                                    />
                                </div>
                            </Field>
                        </div>

                        {/* Invoice No */}
                        <div className="col-span-12 md:col-span-3 p-4 border-b border-rose-200/40">
                            <Field label="Invoice No (Loaded)">
                                <input className={`${inputCls} font-bold text-rose-700`} placeholder="INV/2024/0001" value={invoiceNo} readOnly />
                            </Field>
                        </div>

                        {/* Invoice Date */}
                        <div className="col-span-12 md:col-span-3 p-4 border-b border-rose-200/40">
                            <Field label="Invoice Date">
                                <div className="relative">
                                    <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-400 z-10" />
                                    <DatePicker selected={invoiceDate} onChange={d => setInvoiceDate(d)} dateFormat="dd MMM yyyy"
                                        showYearDropdown showMonthDropdown dropdownMode="select"
                                        className="w-full border border-rose-200 rounded-lg px-3 py-2 pl-9 bg-white font-medium text-slate-700 text-[12px] outline-none shadow-sm focus:border-rose-400 focus:ring-2 focus:ring-rose-100 h-[38px]" />
                                </div>
                            </Field>
                        </div>

                        {/* Time */}
                        <div className="col-span-12 md:col-span-3 p-4 border-b border-rose-200/40">
                            <Field label="Time">
                                <div className="relative">
                                    <Clock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-400 z-10" />
                                    <DatePicker selected={invoiceTime} onChange={t => setInvoiceTime(t)}
                                        showTimeSelect showTimeSelectOnly timeIntervals={5} timeCaption="Time" dateFormat="hh:mm aa"
                                        className="w-full border border-rose-200 rounded-lg px-3 py-2 pl-9 bg-white font-medium text-slate-700 text-[12px] outline-none shadow-sm focus:border-rose-400 focus:ring-2 focus:ring-rose-100 h-[38px]" />
                                </div>
                            </Field>
                        </div>
                    </div>
                </div>

                {/* ── SECTION: CUSTOMER ────────────────────────────── */}
                <div className="border-t border-rose-200/60">
                    <div className="flex items-center gap-2 px-5 py-2.5 bg-rose-100/30 border-b border-rose-200/60">
                        <div className="w-1 h-3.5 rounded-full bg-rose-400" />
                        <span className="text-[10px] font-black text-rose-800 uppercase tracking-[0.15em]">Customer Details</span>
                    </div>

                    <div className="grid grid-cols-12 divide-x divide-rose-200/30">
                        <div className="col-span-12 md:col-span-2 p-4 border-b border-rose-200/30 bg-slate-50/40">
                            <Field label="Customer ID">
                                <div className="relative">
                                    <Hash size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input className={`${inputCls} pl-9`} placeholder="CUST-001" />
                                </div>
                            </Field>
                        </div>

                        <div className="col-span-12 md:col-span-4 p-4 border-b border-rose-200/30">
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
                                        <div className="absolute z-10 w-full bg-white border border-rose-200 rounded-xl shadow-2xl max-h-44 overflow-y-auto mt-1.5 divide-y divide-rose-50">
                                            {customerSuggestions.map((c, i) => (
                                                <div key={i} className="px-4 py-2.5 hover:bg-rose-50 cursor-pointer transition-colors" onClick={() => selectCustomer(c)}>
                                                    <p className="font-bold text-slate-700 text-[12px]">{c.customerName}</p>
                                                    <p className="text-[10px] text-slate-400 mt-0.5">{c.gstin} · {c.state}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </Field>
                        </div>

                        <div className="col-span-12 md:col-span-3 p-4 border-b border-rose-200/30 bg-rose-50/10">
                            <Field label="GST Number">
                                <div className="relative">
                                    <Landmark size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input className={`${inputCls} pl-9 uppercase`} placeholder="27AAAAA0000A1Z5"
                                        value={selectedCustomer?.gstin || ''} readOnly />
                                </div>
                            </Field>
                        </div>

                        <div className="col-span-12 md:col-span-3 p-4 border-b border-rose-200/30">
                            <Field label="Mobile">
                                <div className="relative">
                                    <Send size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input className={`${inputCls} pl-9`} placeholder="98XXXXXXXX"
                                        value={selectedCustomer?.mobileNo || ''} readOnly />
                                </div>
                            </Field>
                        </div>
                    </div>
                </div>

                {/* ── ITEM TABLE ───────────────────────────────────── */}
                <div className="overflow-x-auto border-t border-slate-200">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr
                                className="text-[10px] uppercase tracking-widest font-semibold divide-x divide-white/5 border-b border-white/10"
                                style={{ background: 'linear-gradient(180deg, #1a0808 0%, #111111 100%)' }}
                            >
                                <th className="p-3.5 w-12 text-center text-slate-600">#</th>
                                <th className="p-3.5 min-w-[220px] text-left text-slate-100/90 bg-white/[0.02]">Item Description</th>
                                <th className="p-3.5 w-24 text-center text-slate-400">Batch</th>
                                <th className="p-3.5 w-28 text-center text-slate-300/60 bg-slate-800/30">Rate</th>
                                <th className="p-3.5 w-20 text-center text-slate-300/60 bg-slate-800/30">Qty</th>
                                <th className="p-3.5 w-20 text-center text-blue-300/80">Avail</th>
                                <th className="p-3.5 w-28 text-center text-rose-300 font-bold bg-rose-400/[0.08] shadow-[inset_0_-2px_0_rgba(244,63,94,0.2)]">Return Qty</th>
                                <th className="p-3.5 w-28 text-center text-slate-500/50">Gross</th>
                                <th className="p-3.5 w-20 text-center text-rose-400/60 bg-rose-400/[0.02]">Disc%</th>
                                <th className="p-3.5 w-28 text-center text-slate-200 bg-[#1c1c1c]">Taxable</th>
                                <th className="p-3.5 w-24 text-center text-slate-400">GST%</th>
                                <th className="p-3.5 w-32 text-center text-emerald-300 font-bold bg-emerald-500/[0.07] shadow-[inset_0_-2px_0_rgba(16,185,129,0.18)]">Total</th>
                                <th className="p-3.5 w-24 text-center text-slate-500">Act.</th>
                            </tr>
                        </thead>

                        <tbody className="bg-white divide-y divide-slate-100/80">
                            {items.map((item, idx) => {
                                const isEditing = editingId === item.id;
                                const availQty = getAvailableQuantity(item.itemId) || item.qty;
                                const hasReturn = item.returnQty > 0;

                                return (
                                    <React.Fragment key={item.id}>
                                        <tr className={`group transition-colors duration-100 ${hasReturn ? 'bg-rose-50/30' : 'hover:bg-rose-50/10'}`}>

                                            {/* Sr */}
                                            <td className="p-3 text-center border-r border-slate-100">
                                                <span className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center mx-auto ${hasReturn ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-400'}`}>
                                                    {idx + 1}
                                                </span>
                                            </td>

                                            {/* Item Name */}
                                            <td className="p-1.5 border-r border-slate-100">
                                                <input
                                                    className="w-full bg-transparent border-none focus:bg-blue-50/20 rounded-lg px-2.5 py-1.5 text-[13px] text-slate-700 placeholder:text-slate-300 outline-none font-medium transition-all"
                                                    type="text" value={item.itemName}
                                                    onChange={e => handleItemChange(idx, 'itemName', e.target.value)}
                                                    placeholder="Enter product name..."
                                                />
                                            </td>

                                            {/* Batch */}
                                            <td className="p-1.5 border-r border-slate-100">
                                                <input className="w-full bg-transparent border-none rounded-lg px-2 py-1.5 text-[12px] text-slate-500 outline-none text-center"
                                                    type="text" value={item.batch || ''} readOnly placeholder="—" />
                                            </td>

                                            {/* Rate */}
                                            <td className="p-1.5 border-r border-slate-100 bg-slate-50/20">
                                                <input className="w-full bg-transparent border-none rounded-lg px-2 py-1.5 text-right text-[13px] text-slate-600 outline-none font-medium"
                                                    type="text" value={item.rate === 0 ? '' : item.rate} readOnly />
                                            </td>

                                            {/* Qty */}
                                            <td className="p-1.5 border-r border-slate-100 bg-slate-50/20">
                                                <input className="w-full bg-transparent border-none rounded-lg px-2 py-1.5 text-right text-[13px] font-bold text-slate-600 outline-none"
                                                    type="text" value={item.qty === 0 ? '' : item.qty} readOnly />
                                            </td>

                                            {/* Available */}
                                            <td className="px-3 py-2 text-right font-bold text-blue-600 text-[12px] border-r border-slate-100 bg-blue-50/20">
                                                {availQty}
                                            </td>

                                            {/* Return Qty — editable only when toggled */}
                                            <td className="p-1.5 border-r border-slate-100 bg-rose-50/20">
                                                <input
                                                    className={`w-full border-none rounded-lg px-2 py-1.5 text-right text-[13px] font-black outline-none transition-all ${isEditing
                                                        ? 'bg-rose-50 text-rose-700 ring-2 ring-rose-300/40'
                                                        : 'bg-transparent text-slate-400 cursor-not-allowed'
                                                        }`}
                                                    type="number" min="0"
                                                    disabled={!isEditing}
                                                    value={item.returnQty === 0 ? '' : item.returnQty}
                                                    onChange={e => {
                                                        let v = Number(e.target.value);
                                                        if (v < 0) v = 0;
                                                        if (v > availQty) v = availQty;
                                                        handleItemChange(idx, 'returnQty', v);
                                                    }}
                                                    placeholder={isEditing ? '0' : '—'}
                                                />
                                            </td>

                                            {/* Gross */}
                                            <td className="px-3 py-2 text-right text-slate-400 font-medium text-[11px] border-r border-slate-100">
                                                {(item.grossAmount || 0).toFixed(2)}
                                            </td>

                                            {/* Disc % */}
                                            <td className="p-1.5 border-r border-slate-100">
                                                <input className="w-full bg-transparent border-none rounded-lg px-2 py-1.5 text-right text-[13px] text-slate-500 outline-none"
                                                    type="text" value={item.discP || '0'} readOnly />
                                            </td>

                                            {/* Taxable */}
                                            <td className="px-3 py-2 text-right font-semibold text-slate-700 text-[12px] border-r border-slate-100 bg-slate-50/50">
                                                {(item.taxableAmt || 0).toFixed(2)}
                                            </td>

                                            {/* GST % */}
                                            <td className="p-1.5 border-r border-slate-100">
                                                <div className="w-full bg-rose-50/60 rounded-lg px-2 py-1.5 text-right text-[13px] font-black text-rose-600">
                                                    {item.gstP}
                                                </div>
                                            </td>

                                            {/* Line Total */}
                                            <td className={`px-3 py-2 text-right font-black text-[13px] border-r border-slate-100 ${hasReturn ? 'text-rose-700 bg-rose-50/30' : 'text-slate-900 bg-emerald-50/20'}`}>
                                                ₹{(item.lineTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </td>

                                            {/* Toggle Edit */}
                                            <td className="p-2 text-center">
                                                <button
                                                    onClick={() => toggleEdit(item.id)}
                                                    className={`w-8 h-8 rounded-xl flex items-center justify-center mx-auto transition-all duration-200 ${isEditing
                                                        ? 'bg-emerald-50 text-emerald-600 shadow-sm ring-1 ring-emerald-200 scale-110'
                                                        : 'bg-slate-100 text-slate-400 hover:bg-rose-50 hover:text-rose-600'
                                                        }`}
                                                    title={isEditing ? 'Confirm' : 'Enable Return'}
                                                >
                                                    {isEditing ? <CheckCircle size={15} strokeWidth={2.5} /> : <RotateCcw size={15} />}
                                                </button>
                                            </td>
                                        </tr>

                                        {/* Tax sub-row */}
                                        <tr className="bg-gradient-to-r from-slate-50/60 to-transparent text-[9.5px] text-slate-400 border-b border-slate-100/60">
                                            <td colSpan={3} className="py-1.5 px-4 text-right text-[9px] font-bold text-slate-300 uppercase tracking-widest border-r border-slate-100/60">
                                                {hasReturn ? 'Return Detail' : 'Tax Detail'}
                                            </td>
                                            <td colSpan={2} className="py-1.5 px-3 border-r border-slate-100/60">
                                                <span className="text-rose-400 font-semibold uppercase text-[9px]">Disc</span>
                                                <span className="text-slate-700 font-bold ml-1.5 text-[10px]">
                                                    ₹{((parseFloat(item.discP) || 0) / 100 * (item.rate * (item.returnQty || item.qty))).toFixed(2)}
                                                </span>
                                            </td>
                                            {(() => {
                                                const aq = item.returnQty > 0 ? item.returnQty : item.qty;
                                                const taxable = item.rate * aq * (1 - (item.discP || 0) / 100);
                                                const split = (taxable * (item.gstP || 0) / 100 / 2).toFixed(2);
                                                return (
                                                    <>
                                                        <td colSpan={2} className="py-1.5 px-3 border-r border-slate-100/60">
                                                            <span className="text-slate-400">CGST</span>
                                                            <span className={`font-bold ml-1.5 text-[10px] ${hasReturn ? 'text-rose-600' : 'text-slate-700'}`}>₹{split}</span>
                                                        </td>
                                                        <td colSpan={2} className="py-1.5 px-3 border-r border-slate-100/60">
                                                            <span className="text-slate-400">SGST</span>
                                                            <span className={`font-bold ml-1.5 text-[10px] ${hasReturn ? 'text-rose-600' : 'text-slate-700'}`}>₹{split}</span>
                                                        </td>
                                                    </>
                                                );
                                            })()}
                                            <td colSpan={4} />
                                        </tr>
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* ── SUMMARY ──────────────────────────────────────── */}
                <div className="border-t border-slate-200 bg-white">
                    <div className="p-6 space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                            {/* Tax Box */}
                            <div className={`rounded-2xl border p-5 space-y-4 transition-all duration-300 ${isReturnActive ? 'bg-rose-50/50 border-rose-200' : 'bg-slate-50 border-slate-200'}`}>
                                <div className="flex items-center gap-2 pb-3 border-b border-inherit">
                                    <div className={`w-1.5 h-4 rounded-full ${isReturnActive ? 'bg-rose-500' : 'bg-blue-500'}`} />
                                    <h4 className={`text-[10px] font-black uppercase tracking-[0.15em] ${isReturnActive ? 'text-rose-600' : 'text-blue-600'}`}>
                                        {isReturnActive ? 'Return Tax Adjustments' : 'Taxes & Adjustments'}
                                    </h4>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { label: 'Total CGST', value: (isReturnActive ? returnTotals.gst / 2 : totals.totalGST / 2).toFixed(2) },
                                        { label: 'Total SGST', value: (isReturnActive ? returnTotals.gst / 2 : totals.totalGST / 2).toFixed(2) },
                                        { label: 'Total IGST', value: '0.00' },
                                        { label: 'Round Off', value: totals.roundOff, accent: true },
                                    ].map(({ label, value, accent }) => (
                                        <div key={label} className="flex flex-col gap-0.5">
                                            <span className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider">{label}</span>
                                            <span className={`font-black text-lg ${accent ? 'text-rose-600' : isReturnActive ? 'text-rose-700' : 'text-black'}`}>₹ {value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Financial Box */}
                            <div className={`rounded-2xl border p-5 space-y-4 transition-all duration-300 ${isReturnActive ? 'bg-rose-50/30 border-rose-100' : 'bg-blue-50/20 border-blue-100'}`}>
                                <div className="flex items-center gap-2 pb-3 border-b border-inherit">
                                    <div className={`w-1.5 h-4 rounded-full ${isReturnActive ? 'bg-rose-400' : 'bg-blue-400'}`} />
                                    <h4 className={`text-[10px] font-black uppercase tracking-[0.15em] ${isReturnActive ? 'text-rose-600' : 'text-blue-600'}`}>
                                        {isReturnActive ? 'Return Financials' : 'Invoice Totals'}
                                    </h4>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { label: 'Total Gross', value: `₹ ${(isReturnActive ? returnTotals.gross : totals.totalGross).toFixed(2)}`, color: 'text-slate-900' },
                                        { label: 'Total Disc', value: `−₹ ${(isReturnActive ? returnTotals.disc : totals.totalDisc).toFixed(2)}`, color: 'text-green-700' },
                                        { label: 'Taxable Amt', value: `₹ ${(isReturnActive ? returnTotals.taxable : totals.totalTaxable).toFixed(2)}`, color: 'text-slate-700' },
                                        { label: 'Total GST', value: `+₹ ${(isReturnActive ? returnTotals.gst : totals.totalGST).toFixed(2)}`, color: isReturnActive ? 'text-rose-600' : 'text-blue-600' },
                                    ].map(({ label, value, color }) => (
                                        <div key={label} className="flex flex-col gap-0.5">
                                            <span className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider">{label}</span>
                                            <span className={`font-black text-lg ${color}`}>{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Grand Total / Refund CTA */}
                        <div
                            onClick={() => { localStorage.setItem('activePaymentScreen', screenKey); setShowPaymentModal(true); }}
                            className="w-full text-white p-6 rounded-2xl relative overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-300 active:scale-[0.99] group"
                            style={{ background: isReturnActive ? 'linear-gradient(135deg, #881337 0%, #be123c 50%, #9f1239 100%)' : 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #059669 100%)' }}
                        >
                            <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
                            <div className="relative z-10 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-3.5 bg-white/10 rounded-xl border border-white/15 group-hover:bg-white/15 transition-colors backdrop-blur-sm">
                                        {isReturnActive ? <RotateCcw size={28} /> : <CreditCard size={28} />}
                                    </div>
                                    <div>
                                        <p className="text-[9.5px] font-black uppercase tracking-[0.3em] text-white/80">
                                            {isReturnActive ? 'Total Refund / Credit Amount' : 'Invoice Payable Amount'}
                                        </p>
                                        <p className="text-white/50 text-[10px] font-medium mt-0.5">
                                            {isReturnActive ? 'Click to process Credit Note' : 'Click to proceed with payment'}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right flex items-end gap-0.5">
                                    <span className="text-xl font-light text-white/70 mb-1">₹</span>
                                    <span className="text-5xl font-black tracking-tight">
                                        {(isReturnActive ? (returnTotals.taxable + returnTotals.gst) : totals.invoiceTotal).toLocaleString('en-IN')}
                                    </span>
                                    <span className="text-xl font-black mb-1 opacity-70">.00</span>
                                </div>
                            </div>
                            <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* ── CREDIT NOTE ADJUSTMENT TABLE ─────────────────── */}
                {isAdjustmentActive && (
                    <div className="border-t border-slate-200 p-6 space-y-4 bg-slate-50/40">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-8 bg-rose-600 rounded-full shadow-[0_0_10px_rgba(225,29,72,0.4)]" />
                                <div>
                                    <h3 className="text-base font-black text-slate-800 tracking-tight">Credit Note Summary</h3>
                                    <p className="text-[9.5px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Adjustment ledger for returned stock</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 border border-rose-100 rounded-lg">
                                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                                <span className="text-rose-700 text-[10px] font-black uppercase tracking-tight">
                                    {adjustmentList.length} Reversal {adjustmentList.length === 1 ? 'Line' : 'Lines'}
                                </span>
                            </div>
                        </div>

                        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/80">
                                        <th className="py-3 px-5 text-[9.5px] font-bold text-slate-400 uppercase tracking-wider text-center w-16">#</th>
                                        <th className="py-3 px-5 text-[9.5px] font-bold text-slate-400 uppercase tracking-wider text-left">Particulars</th>
                                        <th className="py-3 px-5 text-[9.5px] font-bold text-slate-400 uppercase tracking-wider text-center">Qty</th>
                                        <th className="py-3 px-5 text-[9.5px] font-bold text-slate-400 uppercase tracking-wider text-right">Taxable Value</th>
                                        <th className="py-3 px-5 text-[9.5px] font-bold text-rose-400/80 uppercase tracking-wider text-right">GST Credit</th>
                                        <th className="py-3 px-5 text-right w-36">
                                            <span className="px-3 py-1 bg-rose-600 text-white text-[9.5px] font-bold uppercase tracking-wider rounded-full">Sub-Total</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {adjustmentList.map((entry, i) => {
                                        const taxable = entry.rate * entry.returnQty * (1 - (entry.discP || 0) / 100);
                                        const gstCredit = taxable * (entry.gstP || 0) / 100;
                                        const total = taxable + gstCredit;
                                        return (
                                            <tr key={entry.id} className="hover:bg-rose-50/20 transition-colors">
                                                <td className="py-2 px-5 text-center font-mono text-[10px] text-slate-400">{String(i + 1).padStart(2, '0')}</td>
                                                <td className="py-2 px-5">
                                                    <div className="font-bold text-slate-700 text-[12px]">{entry.itemName}</div>
                                                    <div className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Batch: {entry.batch || 'N/A'}</div>
                                                </td>
                                                <td className="py-2 px-5 text-center">
                                                    <span className="text-[11px] font-black text-rose-700 bg-rose-50 w-8 h-8 flex items-center justify-center rounded-lg mx-auto border border-rose-100">
                                                        {entry.returnQty}
                                                    </span>
                                                </td>
                                                <td className="py-2 px-5 text-right font-mono text-[11px] text-slate-600">₹{taxable.toFixed(2)}</td>
                                                <td className="py-2 px-5 text-right font-mono text-[11px] text-rose-600 font-semibold">+₹{gstCredit.toFixed(2)}</td>
                                                <td className="py-2 px-5 text-right font-bold text-[12px] text-slate-800">
                                                    ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                <tfoot className="border-t-2 border-slate-100">
                                    <tr className="bg-rose-50/30">
                                        <td colSpan={5} className="py-3 px-5 text-right text-[10px] font-bold text-rose-900/60 uppercase tracking-widest">Net Credit Value</td>
                                        <td className="py-3 px-5 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="text-base font-black text-rose-700">
                                                    ₹{adjustmentList.reduce((sum, e) => {
                                                        const t = e.rate * e.returnQty * (1 - (e.discP || 0) / 100);
                                                        return sum + t * (1 + (e.gstP || 0) / 100);
                                                    }, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </span>
                                                <div className="w-10 h-0.5 bg-rose-600 mt-0.5 rounded-full" />
                                            </div>
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                )}

                {/* ── RETURN REASON ─────────────────────────────────── */}
                <div className="border-t border-rose-200/50">
                    <div className="flex items-center gap-2 px-5 py-2.5 bg-rose-100/30 border-b border-rose-200/40">
                        <div className="w-1 h-3.5 rounded-full bg-rose-400" />
                        <span className="text-[10px] font-black text-rose-800 uppercase tracking-[0.15em]">Return Reason & Remarks</span>
                    </div>
                    <div className="grid grid-cols-12 divide-x divide-rose-200/40">
                        <div className="col-span-12 md:col-span-3 p-4 border-b border-rose-200/40">
                            <Field label="Reason Code">
                                <select className={inputCls} value={returnReasonCode} onChange={e => setReturnReasonCode(e.target.value)}>
                                    <option value="DEFECT">Defect</option>
                                    <option value="DAMAGE">Damage</option>
                                    <option value="EXPIRY">Expiry</option>
                                    <option value="QUALITY">Quality Issue</option>
                                    <option value="EXCESS">Excess Stock</option>
                                    <option value="WRONG_ITEM">Wrong Item</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </Field>
                        </div>
                        <div className="col-span-12 md:col-span-4 p-4 border-b border-rose-200/40">
                            <Field label="Reason Description">
                                <input className={inputCls} placeholder="Detailed reason for return..." value={returnReasonText} onChange={e => setReturnReasonText(e.target.value)} />
                            </Field>
                        </div>
                        <div className="col-span-12 md:col-span-5 p-4 border-b border-rose-200/40">
                            <Field label="Remarks">
                                <input className={inputCls} placeholder="Additional remarks..." value={returnRemarks} onChange={e => setReturnRemarks(e.target.value)} />
                            </Field>
                        </div>
                    </div>
                </div>

                {/* ── RETURN HISTORY ───────────────────────────────── */}
                {returnHistory && returnHistory.length > 0 && (
                    <div className="border-t border-slate-200 p-5 bg-blue-50/20">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-1 h-4 rounded-full bg-blue-400" />
                            <h3 className="text-[10px] font-black text-blue-700 uppercase tracking-[0.15em]">Return History</h3>
                            {isLoadingReturns && <span className="text-[10px] text-slate-400 animate-pulse">Loading...</span>}
                        </div>
                        <div className="space-y-2 max-h-36 overflow-y-auto">
                            {returnHistory.map((ret, i) => (
                                <div key={i} className="bg-white px-4 py-2.5 rounded-xl border border-blue-100 flex items-start justify-between gap-3">
                                    <div>
                                        <span className="font-bold text-slate-700 text-[11px]">{ret.returnNo}</span>
                                        <span className="text-slate-400 text-[10px] ml-2">{ret.returnDate}</span>
                                        <p className="text-[10px] text-slate-500 mt-0.5">{ret.reasonText}</p>
                                    </div>
                                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[9px] font-bold uppercase">{ret.reasonCode}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── SHIPPING & NARRATION ──────────────────────────── */}
                <div className="grid grid-cols-12 border-t border-rose-200/50 divide-x divide-rose-200/40">
                    <div className="col-span-12 md:col-span-4 p-4 border-b border-rose-200/40">
                        <Field label="Contact Person">
                            <div className="relative">
                                <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input className={`${inputCls} pl-9`} placeholder="In-charge name" />
                            </div>
                        </Field>
                    </div>
                    <div className="col-span-12 md:col-span-5 p-4 border-b border-rose-200/40">
                        <Field label="Shipping Address">
                            <div className="relative">
                                <Truck size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input className={`${inputCls} pl-9`} placeholder="Same as billing or other..." />
                            </div>
                        </Field>
                    </div>
                    <div className="col-span-12 md:col-span-3 p-4 border-b border-rose-200/40 bg-slate-50/30">
                        <Field label="Shipping State">
                            <input className={inputCls} placeholder="Maharashtra" />
                        </Field>
                    </div>
                </div>

                <div className="p-5 bg-slate-50/60 border-t border-slate-200">
                    <Field label="Narration / Return Notes">
                        <textarea
                            className="w-full bg-white border border-rose-200 rounded-xl px-4 py-3 h-20 focus:ring-2 focus:ring-rose-200 focus:border-rose-300 outline-none text-slate-600 text-[12px] resize-none transition-all"
                            placeholder="Enter any additional notes..."
                            value={narration} onChange={e => setNarration(e.target.value)}
                        />
                    </Field>
                </div>

                {/* ── ACTION BAR ───────────────────────────────────── */}
                <div
                    className="flex items-center gap-2.5 text-white px-5 py-3.5 border-t flex-wrap"
                    style={{ background: 'linear-gradient(90deg, #1c0a0a 0%, #3b0d0d 50%, #1c0a0a 100%)', borderColor: '#3b0d0d' }}
                >
                    {/* Submit Return */}
                    <button
                        onClick={submitReturn}
                        disabled={isSubmittingReturn || !isReturnActive}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[10.5px] uppercase tracking-widest transition-all shadow-lg active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ background: isReturnActive ? 'linear-gradient(180deg, #e11d48 0%, #be123c 100%)' : '#4b1c1c', boxShadow: isReturnActive ? '0 4px 14px rgba(225,29,72,0.4)' : 'none' }}
                    >
                        <Save size={15} strokeWidth={2.5} />
                        {isSubmittingReturn ? 'Submitting...' : 'Submit Return'}
                    </button>

                    {/* Print */}
                    <button className="flex items-center gap-2 bg-rose-900/40 hover:bg-rose-800 px-4 py-2.5 rounded-xl font-bold text-[10.5px] uppercase tracking-wider border border-rose-700/50 transition-all">
                        <Printer size={15} className="text-rose-400" />
                        Save & Print
                    </button>

                    {/* Email */}
                    <button className="flex items-center gap-2 bg-rose-900/40 hover:bg-rose-800 px-4 py-2.5 rounded-xl font-bold text-[10.5px] uppercase tracking-wider border border-rose-700/50 transition-all">
                        <Mail size={15} className="text-rose-400" />
                        Email
                    </button>

                    <div className="h-5 w-px bg-rose-900 mx-1" />

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
                    <button className="flex items-center gap-2 text-rose-700/60 hover:text-red-400 hover:bg-red-500/10 px-4 py-2.5 rounded-xl font-bold text-[10.5px] uppercase tracking-wider ml-auto transition-all group">
                        <XCircle size={15} className="group-hover:rotate-90 transition-transform duration-300" />
                        Cancel
                    </button>
                </div>
            </div>

            {showPaymentModal && (
                <MultiTransaction
                    totals={isReturnActive ? { invoiceTotal: returnTotals.taxable + returnTotals.gst } : totals}
                />
            )}
        </div>
    );
};

export default BillingReturnV4;