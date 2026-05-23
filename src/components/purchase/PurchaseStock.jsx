import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Save, Printer, Mail, Send, Truck, XCircle, X, Plus,
  MapPin, FileText, Search, Hash, User, CreditCard,
  Landmark, ShoppingCart, Package, CheckCircle, ArrowLeft,
  BarChart2, ClipboardList
} from 'lucide-react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from 'axios';

/* ─────────────────────────────────────────────
   COLOR PALETTE (emerald-dominant + teal accents)
   Header:    #064e3b → #065f46 → #047857  (deep emerald gradient)
   Section:   emerald-100/200 tints
   Table:     slate-900 header with emerald accents
   Totals:    teal-700 CTA block
   Action bar: #022c22 deep forest green
   ───────────────────────────────────────────── */

const StockPurchase = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // ── State ──────────────────────────────────────────
  const [purchaseDate, setPurchaseDate]       = useState(new Date());
  const [purchaseTime, setPurchaseTime]       = useState(new Date());
  const [purchaseNo, setPurchaseNo]           = useState('');
  const [supplierSearch, setSupplierSearch]   = useState('');
  const [supplierSuggestions, setSupplierSuggestions] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const [itemSuggestions, setItemSuggestions] = useState([]);
  const [showItemDropdown, setShowItemDropdown] = useState(false);
  const [activeRowIndex, setActiveRowIndex]   = useState(null);
  const [dropdownCoords, setDropdownCoords]   = useState(null);
  const [placeOfSupply, setPlaceOfSupply]     = useState('Maharashtra');
  const [reverseCharge, setReverseCharge]     = useState(false);
  const [transporterName, setTransporterName] = useState('');
  const [vehicleNumber, setVehicleNumber]     = useState('');
  const [narration, setNarration]             = useState('');
  const [poReference, setPoReference]         = useState('');
  const [billReference, setBillReference]     = useState('');
  const [isLoadingPrint, setIsLoadingPrint]   = useState(false);
  const [printError, setPrintError]           = useState(null);

  const itemInputRefs = useRef({});

  // ── Helpers ─────────────────────────────────────────
  const PURCHASE_STATE_CODE = "27";

  const isSameState = String(selectedSupplier?.stateCode || '') === PURCHASE_STATE_CODE;

  const createEmptyRow = () => ({
    id: Date.now() + Math.random(),
    itemId: null,
    itemCode: '',
    itemName: '',
    hsn: '',
    batch: '',
    expiry: '',
    rate: 0,
    mrp: 0,
    qty: 0,
    freeQty: 0,
    grossAmount: 0,
    discP: 0,
    discA: 0,
    taxableAmt: 0,
    gstP: 18,
    gstA: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    lineTotal: 0
  });

  const [items, setItems] = useState([createEmptyRow()]);
  const [totals, setTotals] = useState({
    totalGross: 0, totalDisc: 0, totalTaxable: 0,
    totalGST: 0, invoiceTotal: 0, roundOff: 0
  });

  // ── Calculations ────────────────────────────────────
  const calculateTotals = useCallback((currentItems) => {
    let tGross = 0, tDisc = 0, tGST = 0;
    const updated = currentItems.map(item => {
      const gross   = (parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0);
      const discount= (gross * (parseFloat(item.discP) || 0)) / 100;
      const taxable = gross - discount;
      const taxAmt  = (taxable * (parseFloat(item.gstP) || 0)) / 100;
      const cgst    = isSameState ? taxAmt / 2 : 0;
      const sgst    = isSameState ? taxAmt / 2 : 0;
      const igst    = !isSameState ? taxAmt : 0;
      tGross += gross; tDisc += discount; tGST += taxAmt;
      return { ...item, grossAmount: gross, discA: discount, taxableAmt: taxable, gstA: taxAmt, cgst, sgst, igst, lineTotal: taxable + taxAmt };
    });
    const raw     = tGross - tDisc + tGST;
    const rounded = Math.round(raw);
    setTotals({ totalGross: tGross, totalDisc: tDisc, totalTaxable: tGross - tDisc, totalGST: tGST, invoiceTotal: rounded, roundOff: (rounded - raw).toFixed(2) });
    return updated;
  }, [isSameState]);

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(calculateTotals(updated));
  };

  const addNewRow  = () => setItems([...items, createEmptyRow()]);
  const removeRow  = (id) => { if (items.length > 1) setItems(calculateTotals(items.filter(i => i.id !== id))); };
  const handleKeyDown = (e, index) => { if (e.key === 'Tab' && !e.shiftKey && index === items.length - 1) addNewRow(); };

  // ── Dropdown position ───────────────────────────────
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

  // ── API stubs ───────────────────────────────────────
  const searchSuppliers = async (q) => {
    if (q.length < 3) { setSupplierSuggestions([]); return; }
    try {
      const res = await axios.get(`/api/supplier-master/search?q=${encodeURIComponent(q)}`);
      setSupplierSuggestions(res.data);
      setShowSupplierDropdown(true);
    } catch { setSupplierSuggestions([]); }
  };

  const searchItems = async (q) => {
    if (q.length < 3) { setItemSuggestions([]); setShowItemDropdown(false); return; }
    try {
      const res = await axios.get(`/api/item-master/search?q=${encodeURIComponent(q)}`);
      setItemSuggestions(res.data);
      setShowItemDropdown(true);
    } catch { setItemSuggestions([]); setShowItemDropdown(false); }
  };

  const selectSupplier = (s) => {
    setSelectedSupplier(s);
    setSupplierSearch(s.supplierName);
    setShowSupplierDropdown(false);
  };

  const selectItem = (index, item) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      itemId: item.itemId,
      itemCode: item.itemCode,
      itemName: item.itemName,
      hsn: item.hsnCode,
      gstP: item.gstRate,
      rate: item.purchasePrice || item.salePrice,
      mrp: item.mrp || 0,
      batch: item.batchCode || '',
    };
    setItems(calculateTotals(updated));
    setItemSuggestions([]);
    setShowItemDropdown(false);
  };

  const savePurchase = async () => {
    if (!selectedSupplier) { alert('Please select a supplier'); return; }
    const purchaseData = {
      purchaseNo: purchaseNo || `PUR/${new Date().getFullYear()}/${Date.now()}`,
      purchaseDate: purchaseDate.toISOString().split('T')[0],
      supplierId: selectedSupplier.supplierId,
      billReference, poReference,
      placeOfSupply, reverseCharge,
      totalGrossAmount: totals.totalGross,
      totalDiscount: totals.totalDisc,
      taxableAmount: totals.totalTaxable,
      totalCgst: isSameState ? totals.totalGST / 2 : 0,
      totalSgst: isSameState ? totals.totalGST / 2 : 0,
      totalIgst: !isSameState ? totals.totalGST : 0,
      roundOff: parseFloat(totals.roundOff),
      finalAmount: totals.invoiceTotal,
      narration,
      items: items.map(item => ({
        itemId: item.itemId,
        batchCode: item.batch || 'BATCH01',
        expiryDate: item.expiry,
        hsnCode: item.hsn,
        quantity: item.qty,
        freeQty: item.freeQty,
        mrp: item.mrp,
        rate: item.rate,
        grossAmount: item.grossAmount,
        discountPct: item.discP,
        discountAmt: item.discA,
        taxableAmount: item.taxableAmt,
        gstRate: item.gstP,
        cgstAmt: item.cgst || 0,
        sgstAmt: item.sgst || 0,
        igstAmt: item.igst || 0,
        lineTotal: item.lineTotal
      }))
    };
    try {
      await axios.post('/api/purchase', purchaseData);
      alert('Purchase saved successfully!');
      navigate('/purchase-list');
    } catch (err) {
      alert('Error saving purchase. Please try again.');
    }
  };

  // ── numberToWords (for display) ─────────────────────
  const numberToWords = (num) => {
    const a = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
    const b = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
    const mg = (n) => {
      let s = '';
      if (n > 99) { s += a[Math.floor(n/100)] + ' Hundred '; n %= 100; }
      if (n > 19) s += b[Math.floor(n/10)] + ' ' + a[n%10];
      else s += a[n];
      return s;
    };
    if (!num || num === 0) return 'Zero';
    let w = '', n = Math.floor(num);
    const cr = Math.floor(n/10000000); n %= 10000000;
    const lk = Math.floor(n/100000);   n %= 100000;
    const th = Math.floor(n/1000);     n %= 1000;
    if (cr) w += mg(cr) + ' Crore ';
    if (lk) w += mg(lk) + ' Lakh ';
    if (th) w += mg(th) + ' Thousand ';
    if (n)  w += mg(n);
    return w.trim() + ' Rupees Only';
  };

  // ───────────────────────────────────────────────────
  //  RENDER
  // ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen p-2 sm:p-4 text-[12px] font-sans text-slate-700 bg-emerald-50/30">
      <div className="max-w-[1500px] mx-auto bg-white rounded-xl overflow-hidden border border-emerald-200 shadow-lg shadow-emerald-900/5">

        {/* ERROR BANNER */}
        {printError && (
          <div className="bg-red-50 border-b border-red-200 p-4 flex items-center gap-3">
            <XCircle size={18} className="text-red-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-800">Error</p>
              <p className="text-xs text-red-700">{printError}</p>
            </div>
            <button onClick={() => setPrintError(null)} className="ml-auto text-red-500 hover:text-red-700">
              <X size={16} />
            </button>
          </div>
        )}

        {/* ── TOP ACTION BAR ─────────────────────────────── */}
        <div
          className="flex items-center gap-3 p-3 text-white border-b border-emerald-900/30 shadow-lg"
          style={{ background: 'linear-gradient(135deg, #064e3b 0%, #065f46 40%, #047857 70%, #059669 100%)' }}
        >
          <div className="flex items-center gap-3 pr-4 border-r border-emerald-400/30 mr-2">
            <div className="bg-gradient-to-br from-emerald-300 to-teal-500 p-2 rounded-xl shadow-inner ring-1 ring-white/20">
              <ShoppingCart size={20} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-white">STOCK PURCHASE</span>
              <p className="text-[9px] text-emerald-200/70 uppercase tracking-widest">Purchase Entry</p>
            </div>
          </div>

          {/* Reverse Charge Toggle */}
          <label className="flex items-center gap-2 ml-2 cursor-pointer select-none">
            <div
              onClick={() => setReverseCharge(!reverseCharge)}
              className={`w-9 h-5 rounded-full relative transition-colors ${reverseCharge ? 'bg-teal-400' : 'bg-emerald-900/60'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${reverseCharge ? 'translate-x-4' : ''}`} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">Reverse Charge</span>
          </label>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => navigate('/purchase-stock-list')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-emerald-700/60 hover:bg-emerald-600 text-white border border-emerald-500/30 transition-all"
            >
              <ClipboardList size={13} />
              VIEW LIST
            </button>
          </div>
        </div>

        {/* ── HEADER SECTION ──────────────────────────────── */}
        <div className="grid grid-cols-12 bg-emerald-50/40">
          <div className="col-span-12 p-3 bg-emerald-100/60 flex items-center gap-2 border-b border-emerald-200">
            <FileText size={14} className="text-emerald-800" />
            <span className="font-bold text-emerald-800 uppercase tracking-wider text-[10px]">Purchase Header & Reference</span>
          </div>

          {/* Purchase No */}
          <div className="col-span-12 md:col-span-3 p-4 border-r border-b border-emerald-200/60">
            <label className="text-slate-500 font-bold uppercase block mb-1.5 text-[10px]">Purchase No</label>
            <input
              type="text"
              className="w-full border border-emerald-200 rounded-md p-2 bg-white font-bold outline-none shadow-sm focus:ring-2 focus:ring-emerald-400"
              placeholder="PUR/2024/0001"
              value={purchaseNo}
              onChange={(e) => setPurchaseNo(e.target.value)}
            />
          </div>

          {/* Purchase Date */}
          <div className="col-span-12 md:col-span-3 p-4 border-r border-b border-emerald-200/60">
            <label className="text-slate-500 font-bold uppercase block mb-1.5 text-[10px]">Purchase Date</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <DatePicker
                selected={purchaseDate}
                onChange={(d) => setPurchaseDate(d)}
                dateFormat="dd MMM yyyy"
                showYearDropdown showMonthDropdown dropdownMode="select"
                className="w-full border border-emerald-200 rounded-md p-2 pl-10 bg-white font-bold shadow-sm focus:ring-2 focus:ring-emerald-400 outline-none h-[38px]"
              />
            </div>
          </div>

          {/* Time */}
          <div className="col-span-12 md:col-span-3 p-4 border-r border-b border-emerald-200/60">
            <label className="text-slate-500 font-bold uppercase block mb-1.5 text-[10px]">Time</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <DatePicker
                selected={purchaseTime}
                onChange={(t) => setPurchaseTime(t)}
                showTimeSelect showTimeSelectOnly timeIntervals={5}
                timeCaption="Time" dateFormat="hh:mm aa"
                className="w-full border border-emerald-200 rounded-md p-2 pl-10 bg-white font-bold shadow-sm focus:ring-2 focus:ring-emerald-400 outline-none h-[38px]"
              />
            </div>
          </div>

          {/* Supplier Bill Ref */}
          <div className="col-span-12 md:col-span-3 p-4 border-b border-emerald-200/60 bg-teal-50/30">
            <label className="text-slate-500 font-bold uppercase block mb-1.5 text-[10px]">Supplier Bill Ref</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={14} className="text-teal-500" />
              </div>
              <input
                type="text"
                className="w-full border border-emerald-200 rounded-md p-2 pl-9 bg-white font-bold outline-none shadow-sm focus:ring-2 focus:ring-teal-400 transition-all placeholder:font-normal placeholder:text-slate-300"
                placeholder="Supplier bill no..."
                value={billReference}
                onChange={(e) => setBillReference(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ── SUPPLIER SECTION ─────────────────────────────── */}
        <div className="border-t border-emerald-200">
          <div className="p-3 bg-emerald-100/30 flex items-center gap-2 border-b border-emerald-200">
            <Package size={14} className="text-emerald-700" />
            <span className="font-bold text-emerald-800 uppercase tracking-wider text-[10px]">Supplier & Billing Details</span>
          </div>

          <div className="grid grid-cols-12 gap-0">
            {/* Supplier ID */}
            <div className="col-span-12 md:col-span-2 p-4 border-r border-b border-emerald-200/50 bg-slate-50/30">
              <label className="text-slate-500 font-bold uppercase block mb-1.5 text-[10px]">Supplier ID</label>
              <div className="relative">
                <input type="text" className="w-full border border-emerald-200 rounded-md p-2 pl-8 bg-white outline-none shadow-sm" placeholder="SUPP-001" />
                <Hash size={14} className="absolute left-2.5 top-3 text-slate-400" />
              </div>
            </div>

            {/* Supplier Name */}
            <div className="col-span-12 md:col-span-4 p-4 border-r border-b border-emerald-200/50">
              <label className="text-slate-500 font-bold uppercase block mb-1.5 text-[10px]">Supplier Name</label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full border border-emerald-200 rounded-md p-2 pl-8 bg-white focus:ring-2 focus:ring-emerald-400 outline-none shadow-sm font-bold"
                  placeholder="Search supplier..."
                  value={supplierSearch}
                  onChange={(e) => { setSupplierSearch(e.target.value); searchSuppliers(e.target.value); }}
                  onFocus={() => supplierSuggestions.length > 0 && setShowSupplierDropdown(true)}
                  onBlur={() => setTimeout(() => setShowSupplierDropdown(false), 200)}
                />
                <User size={14} className="absolute left-2.5 top-3 text-slate-400" />
                {showSupplierDropdown && supplierSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border border-emerald-200 rounded-md shadow-lg max-h-40 overflow-y-auto mt-1">
                    {supplierSuggestions.map((s, i) => (
                      <div key={i} className="p-2 hover:bg-emerald-50 cursor-pointer border-b border-emerald-100 last:border-b-0" onClick={() => selectSupplier(s)}>
                        <div className="font-bold">{s.supplierName}</div>
                        <div className="text-xs text-slate-500">{s.gstin} - {s.state}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* GSTIN */}
            <div className="col-span-12 md:col-span-3 p-4 border-r border-b border-emerald-200/50 bg-teal-50/20">
              <label className="text-slate-500 font-bold uppercase block mb-1.5 text-[10px]">GST Number</label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full border border-emerald-200 rounded-md p-2 pl-8 bg-white outline-none shadow-sm uppercase"
                  placeholder="27AAAAA0000A1Z5"
                  value={selectedSupplier?.gstin || ''}
                  onChange={(e) => setSelectedSupplier(p => p ? { ...p, gstin: e.target.value } : null)}
                />
                <Landmark size={14} className="absolute left-2.5 top-3 text-slate-400" />
              </div>
            </div>

            {/* PAN */}
            <div className="col-span-12 md:col-span-3 p-4 border-b border-emerald-200/50 bg-teal-50/20">
              <label className="text-slate-500 font-bold uppercase block mb-1.5 text-[10px]">PAN</label>
              <div className="relative">
                <input type="text" className="w-full border border-emerald-200 rounded-md p-2 pl-8 bg-white outline-none shadow-sm uppercase" placeholder="ABCDE1234F" />
                <CreditCard size={14} className="absolute left-2.5 top-3 text-slate-400" />
              </div>
            </div>

            {/* Mobile */}
            <div className="col-span-12 md:col-span-3 p-4 border-r border-b border-emerald-200/50">
              <label className="text-slate-500 font-bold uppercase block mb-1.5 text-[10px]">Mobile Number</label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full border border-emerald-200 rounded-md p-2 pl-8 bg-white outline-none shadow-sm"
                  placeholder="98XXXXXXXX"
                  value={selectedSupplier?.mobileNo || ''}
                  onChange={(e) => setSelectedSupplier(p => p ? { ...p, mobileNo: e.target.value } : null)}
                />
                <Send size={14} className="absolute left-2.5 top-3 text-slate-400" />
              </div>
            </div>

            {/* Email */}
            <div className="col-span-12 md:col-span-3 p-4 border-r border-b border-emerald-200/50">
              <label className="text-slate-500 font-bold uppercase block mb-1.5 text-[10px]">Email ID</label>
              <div className="relative">
                <input
                  type="email"
                  className="w-full border border-emerald-200 rounded-md p-2 pl-8 bg-white outline-none shadow-sm"
                  placeholder="supplier@email.com"
                  value={selectedSupplier?.email || ''}
                  onChange={(e) => setSelectedSupplier(p => p ? { ...p, email: e.target.value } : null)}
                />
                <Mail size={14} className="absolute left-2.5 top-3 text-slate-400" />
              </div>
            </div>

            {/* Billing Address */}
            <div className="col-span-12 md:col-span-4 p-4 border-r border-b border-emerald-200/50">
              <label className="text-slate-500 font-bold uppercase block mb-1.5 text-[10px]">Billing Address</label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full border border-emerald-200 rounded-md p-2 pl-8 bg-white outline-none shadow-sm"
                  placeholder="Street, City, Zip..."
                  value={selectedSupplier?.billingAddress || ''}
                  onChange={(e) => setSelectedSupplier(p => p ? { ...p, billingAddress: e.target.value } : null)}
                />
                <MapPin size={14} className="absolute left-2.5 top-3 text-slate-400" />
              </div>
            </div>

            {/* Billing State */}
            <div className="col-span-12 md:col-span-2 p-4 border-b border-emerald-200/50 bg-slate-50/30">
              <label className="text-slate-500 font-bold uppercase block mb-1.5 text-[10px]">Billing State</label>
              <input
                type="text"
                className="w-full border border-emerald-200 rounded-md p-2 bg-white outline-none shadow-sm"
                placeholder="Maharashtra"
                value={selectedSupplier?.state || ''}
                onChange={(e) => setSelectedSupplier(p => p ? { ...p, state: e.target.value } : null)}
              />
            </div>
          </div>
        </div>

        {/* ── ITEM GRID ─────────────────────────────────────── */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead
              className="text-slate-400 text-[10px] text-left uppercase tracking-widest font-semibold border-y border-emerald-900/20"
              style={{ background: 'linear-gradient(180deg, #0f2a1e 0%, #111111 100%)' }}
            >
              <tr className="divide-x divide-white/5">
                <th className="p-4 w-14 text-center text-slate-500">Sr.</th>
                <th className="p-4 min-w-[250px] text-emerald-100/90 bg-white/[0.02]">Item Description</th>
                <th className="p-4 w-24 text-center">HSN/SAC</th>
                <th className="p-4 w-24 text-center">Batch</th>
                <th className="p-4 w-24 text-center">Expiry</th>
                <th className="p-4 w-24 text-center text-teal-200/80 bg-teal-400/[0.04]">MRP</th>
                <th className="p-4 w-28 text-center text-emerald-100/90 bg-emerald-400/[0.03]">Rate</th>
                <th className="p-4 w-20 text-center text-emerald-100/90 bg-emerald-400/[0.03]">Qty</th>
                <th className="p-4 w-20 text-center text-slate-400/60">Free</th>
                <th className="p-4 w-28 text-center opacity-40 font-medium">Gross Amt</th>
                <th className="p-4 w-20 text-center text-rose-400/70 bg-rose-400/[0.02]">Disc %</th>
                <th className="p-4 w-28 text-center text-slate-200 bg-[#1a1a1a]">Taxable</th>
                <th className="p-4 w-20 text-center">GST %</th>
                <th className="p-4 w-32 text-center bg-emerald-500/[0.10] text-emerald-300 font-bold shadow-[inset_0_-2px_0_rgba(16,185,129,0.25)]">Total</th>
                <th className="p-4 w-20 text-center">Act.</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-slate-100">
              {items.map((item, idx) => (
                <React.Fragment key={item.id}>
                  <tr className="group hover:bg-emerald-50/20 transition-colors">
                    {/* Sr */}
                    <td className="p-3 text-center text-slate-400 font-medium text-[11px] border-r border-slate-50">{idx + 1}</td>

                    {/* Item Name */}
                    <td className="p-1 border-r border-slate-100 overflow-visible">
                      <div className="relative overflow-visible">
                        <input
                          ref={(el) => { itemInputRefs.current[idx] = el; }}
                          className="w-full bg-transparent border-none focus:ring-2 focus:ring-emerald-500/20 rounded px-2 py-1.5 text-[13px] text-slate-700 placeholder:text-slate-300 outline-none font-medium hover:bg-slate-50/50"
                          type="text"
                          value={item.itemName}
                          onChange={(e) => {
                            handleItemChange(idx, 'itemName', e.target.value);
                            searchItems(e.target.value);
                            updateItemDropdownPosition(idx);
                          }}
                          onFocus={() => { setActiveRowIndex(idx); if (itemSuggestions.length > 0) setShowItemDropdown(true); updateItemDropdownPosition(idx); }}
                          onBlur={() => setTimeout(() => { setShowItemDropdown(false); setActiveRowIndex(null); }, 200)}
                          placeholder="Search or enter item..."
                        />
                      </div>
                    </td>

                    {/* HSN */}
                    <td className="p-1 border-r border-slate-50">
                      <input className="w-full bg-transparent border-none focus:ring-1 focus:ring-slate-200 rounded px-1 py-1 text-[12px] text-slate-500 outline-none" type="text" value={item.hsn} onChange={(e) => handleItemChange(idx, 'hsn', e.target.value)} placeholder="HSN" />
                    </td>

                    {/* Batch */}
                    <td className="p-1 border-r border-slate-50">
                      <input className="w-full bg-transparent border-none focus:ring-1 focus:ring-slate-200 rounded px-1 py-1 text-[12px] text-slate-500 outline-none" type="text" value={item.batch || ''} onChange={(e) => handleItemChange(idx, 'batch', e.target.value)} placeholder="Batch" />
                    </td>

                    {/* Expiry */}
                    <td className="p-1 border-r border-slate-50">
                      <input className="w-full bg-transparent border-none focus:ring-1 focus:ring-slate-200 rounded px-1 py-1 text-[12px] text-slate-500 outline-none" type="text" value={item.expiry || ''} onChange={(e) => handleItemChange(idx, 'expiry', e.target.value)} placeholder="MM/YY" />
                    </td>

                    {/* MRP */}
                    <td className="p-1 border-r border-slate-50 bg-teal-50/10">
                      <input
                        className="w-full bg-transparent border-none focus:ring-2 focus:ring-teal-500/10 rounded px-1 py-1 text-right text-[13px] text-teal-700 outline-none"
                        type="text" inputMode="decimal"
                        value={item.mrp === 0 ? '' : item.mrp}
                        onBlur={(e) => handleItemChange(idx, 'mrp', parseFloat(e.target.value) || 0)}
                        onChange={(e) => { const v = e.target.value; if (v === '' || /^\d*\.?\d*$/.test(v)) handleItemChange(idx, 'mrp', v); }}
                      />
                    </td>

                    {/* Rate */}
                    <td className="p-1 border-r border-slate-50">
                      <input
                        className="w-full bg-transparent border-none focus:ring-2 focus:ring-emerald-500/10 rounded px-1 py-1 text-right text-[13px] text-slate-700 outline-none font-medium"
                        type="text" inputMode="decimal"
                        value={item.rate === 0 ? '' : item.rate}
                        onBlur={(e) => handleItemChange(idx, 'rate', parseFloat(e.target.value) || 0)}
                        onChange={(e) => { const v = e.target.value; if (v === '' || /^\d*\.?\d*$/.test(v)) handleItemChange(idx, 'rate', v); }}
                      />
                    </td>

                    {/* Qty */}
                    <td className="p-1 border-r border-slate-50">
                      <input
                        className="w-full bg-transparent border-none focus:ring-2 focus:ring-emerald-500/10 rounded px-1 py-1 text-right text-[13px] font-bold text-slate-800 outline-none"
                        type="text" inputMode="numeric"
                        value={item.qty === 0 ? '' : item.qty}
                        onBlur={(e) => e.target.value === '' && handleItemChange(idx, 'qty', 0)}
                        onChange={(e) => { const v = e.target.value; if (v === '' || /^\d*$/.test(v)) handleItemChange(idx, 'qty', v === '' ? 0 : parseInt(v)); }}
                      />
                    </td>

                    {/* Free Qty */}
                    <td className="p-1 border-r border-slate-50 bg-slate-50/20">
                      <input
                        className="w-full bg-transparent border-none focus:ring-1 focus:ring-slate-200 rounded px-1 py-1 text-right text-[12px] text-slate-400 outline-none"
                        type="text" inputMode="numeric" placeholder="0"
                        value={item.freeQty === 0 ? '' : item.freeQty}
                        onChange={(e) => { const v = e.target.value; if (v === '' || /^\d*$/.test(v)) handleItemChange(idx, 'freeQty', v === '' ? 0 : parseInt(v)); }}
                      />
                    </td>

                    {/* Gross */}
                    <td className="p-3 text-right text-slate-400 font-medium text-[12px] border-r border-slate-50">
                      {(item.grossAmount || 0).toFixed(2)}
                    </td>

                    {/* Disc % */}
                    <td className="p-1 border-r border-slate-50">
                      <input
                        className="w-full bg-transparent border-none focus:ring-1 focus:ring-slate-200 rounded px-1 py-1 text-right text-[13px] text-slate-500 outline-none"
                        type="text" inputMode="decimal" placeholder="0%"
                        value={item.discP === 0 ? '' : item.discP}
                        onBlur={(e) => handleItemChange(idx, 'discP', parseFloat(e.target.value) || 0)}
                        onChange={(e) => { const v = e.target.value; if (v === '' || /^\d*\.?\d*$/.test(v)) handleItemChange(idx, 'discP', v === '' ? 0 : v); }}
                      />
                    </td>

                    {/* Taxable */}
                    <td className="p-3 text-right font-semibold text-slate-700 text-[12px] border-r border-slate-50 bg-slate-50/30">
                      {(item.taxableAmt || 0).toFixed(2)}
                    </td>

                    {/* GST % */}
                    <td className="p-1 border-r border-emerald-100">
                      <input
                        className="w-full bg-emerald-50/60 border-none focus:ring-2 focus:ring-emerald-400/20 rounded px-1 py-1 text-right text-[13px] font-bold text-emerald-700 outline-none"
                        type="number"
                        value={item.gstP}
                        onKeyDown={(e) => handleKeyDown(e, idx)}
                        onChange={(e) => { const v = parseFloat(e.target.value); handleItemChange(idx, 'gstP', isNaN(v) ? 0 : v); }}
                      />
                    </td>

                    {/* Line Total */}
                    <td className="p-3 text-right font-bold text-slate-900 text-[13px] bg-emerald-50/20">
                      {(item.lineTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Actions */}
                    <td className="p-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => removeRow(item.id)} className="p-1.5 text-slate-300 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors">
                          <XCircle size={18} strokeWidth={2.5} />
                        </button>
                        {idx === items.length - 1 && (
                          <button onClick={addNewRow} className="p-1.5 bg-emerald-600 text-white rounded shadow-sm hover:bg-emerald-700 transition-all">
                            <Plus size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Tax Sub-row */}
                  <tr className="bg-slate-50/40 text-[9px] text-slate-500 border-b border-slate-100">
                    <td colSpan={3} className="py-1 px-4 text-right font-semibold border-r border-slate-200/60">
                      <span className="text-slate-400">Details:</span>
                    </td>
                    <td colSpan={2} className="py-1 px-2 border-r border-slate-200/60 bg-rose-50/30">
                      <span className="text-rose-600 font-medium text-[10px] uppercase">Disc.</span>
                      <span className="text-slate-900 font-bold ml-1">
                        ₹{((parseFloat(item.rate)||0)*(parseFloat(item.qty)||0)*(parseFloat(item.discP)||0)/100).toFixed(2)}
                      </span>
                    </td>
                    <td colSpan={2} className="py-1 px-2 border-r border-slate-200/60">
                      CGST <span className="text-slate-900 font-bold ml-1">₹{Number(item.cgst || 0).toFixed(2)}</span>
                    </td>
                    <td colSpan={2} className="py-1 px-2 border-r border-slate-200/60">
                      SGST <span className="text-slate-900 font-bold ml-1">₹{Number(item.sgst || 0).toFixed(2)}</span>
                    </td>
                    <td colSpan={2} className="py-1 px-2 border-r border-slate-200/60">
                      IGST <span className="text-slate-900 font-bold ml-1">₹{Number(item.igst || 0).toFixed(2)}</span>
                    </td>
                    <td colSpan={2} className="bg-slate-100/20"></td>
                    <td className="bg-slate-100/20"></td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Item Dropdown Portal */}
        {showItemDropdown && activeRowIndex !== null && itemSuggestions.length > 0 && dropdownCoords && typeof document !== 'undefined' && createPortal(
          <div style={{ position: 'absolute', top: dropdownCoords.top, left: dropdownCoords.left, width: dropdownCoords.width, zIndex: 99999 }}>
            <div className="bg-white/95 backdrop-blur-sm border border-emerald-200 rounded-xl shadow-2xl shadow-emerald-900/10 overflow-hidden">
              <div className="max-h-[280px] overflow-y-auto">
                {itemSuggestions.map((s, i) => (
                  <div key={i} className="px-4 py-3 hover:bg-emerald-600 group/item cursor-pointer border-b border-slate-50 last:border-b-0 transition-colors" onMouseDown={() => selectItem(activeRowIndex, s)}>
                    <div className="flex justify-between items-center">
                      <div className="font-semibold text-slate-700 group-hover/item:text-white transition-colors">{s.itemName}</div>
                      <span className="text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 group-hover/item:bg-emerald-400 group-hover/item:text-white">{s.itemCode}</span>
                    </div>
                    <div className="text-xs text-slate-400 group-hover/item:text-emerald-100 mt-0.5">HSN: {s.hsnCode}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* ── SUMMARY FOOTER ──────────────────────────────── */}
        <div className="grid grid-cols-12 border-t border-slate-200 w-full bg-white">
          <div className="col-span-12 p-6 space-y-6">

            {/* Tax + Billing boxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Box 1: Tax */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
                <h4 className="text-[11px] font-black text-emerald-700 uppercase tracking-widest mb-2 border-b border-slate-200 pb-2">Taxes & Adjustments</h4>
                <div className="flex gap-4">
                  <div className="flex-1 flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Total CGST</span>
                    <span className="font-bold text-black text-base">₹ {isSameState ? (totals.totalGST/2).toFixed(2) : "0.00"}</span>
                  </div>
                  <div className="flex-1 flex flex-col border-l border-slate-200 pl-4">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Total SGST</span>
                    <span className="font-bold text-black text-base">₹ {isSameState ? (totals.totalGST/2).toFixed(2) : "0.00"}</span>
                  </div>
                </div>
                <div className="flex gap-4 pt-2 border-t border-slate-200/60">
                  <div className="flex-1 flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Total IGST</span>
                    <span className="font-bold text-black text-base">₹ {!isSameState ? totals.totalGST.toFixed(2) : "0.00"}</span>
                  </div>
                  <div className="flex-1 flex flex-col border-l border-slate-200 pl-4">
                    <span className="text-[10px] text-rose-500 font-bold uppercase">Round Off</span>
                    <span className="font-bold text-black text-base">{totals.roundOff}</span>
                  </div>
                </div>
              </div>

              {/* Box 2: Billing Totals */}
              <div className="bg-emerald-50/30 p-5 rounded-xl border border-emerald-100 space-y-4">
                <h4 className="text-[11px] font-black text-emerald-700 uppercase tracking-widest mb-2 border-b border-emerald-100 pb-2">Purchase Totals</h4>
                <div className="flex gap-4">
                  <div className="flex-1 flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Total Gross</span>
                    <span className="font-bold text-slate-900 text-base">₹ {totals.totalGross.toFixed(2)}</span>
                  </div>
                  <div className="flex-1 flex flex-col border-l border-emerald-100 pl-4">
                    <span className="text-[10px] text-green-600 font-bold uppercase">Total Disc</span>
                    <span className="font-bold text-green-700 text-base">−₹ {totals.totalDisc.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex gap-4 pt-2 border-t border-emerald-100">
                  <div className="flex-1 flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Taxable Amt</span>
                    <span className="font-bold text-slate-700 text-base">₹ {totals.totalTaxable.toFixed(2)}</span>
                  </div>
                  <div className="flex-1 flex flex-col border-l border-emerald-100 pl-4">
                    <span className="text-[10px] text-emerald-600 font-bold uppercase">Total GST</span>
                    <span className="font-bold text-emerald-700 text-base">+₹ {totals.totalGST.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Grand Total Block */}
            <div
              className="w-full text-white p-6 rounded-2xl relative overflow-hidden cursor-default"
              style={{ background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #0d9488 100%)' }}
            >
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-white/10 rounded-xl backdrop-blur-md border border-white/20">
                    <BarChart2 size={32} />
                  </div>
                  <div>
                    <span className="block text-[11px] font-black uppercase tracking-[0.3em] text-emerald-100 opacity-80">
                      Purchase Payable Amount
                    </span>
                    <p className="text-emerald-50/60 text-[10px] font-medium capitalize">
                      {numberToWords(totals.invoiceTotal)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-end justify-end gap-1">
                    <span className="text-2xl font-light text-emerald-200 mb-1.5">₹</span>
                    <span className="text-5xl font-black tracking-tighter">
                      {totals.invoiceTotal.toLocaleString('en-IN')}
                    </span>
                    <span className="text-2xl font-black mb-1.5 opacity-90">.00</span>
                  </div>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
            </div>
          </div>
        </div>

        {/* ── SHIPPING & TRANSPORT ─────────────────────────── */}
        <div className="grid grid-cols-12 border-b border-emerald-200/50">
          <div className="col-span-12 md:col-span-3 p-4 border-r border-emerald-200/50">
            <label className="text-slate-500 font-bold uppercase block mb-1.5 text-[10px]">Transporter Name</label>
            <div className="relative">
              <input type="text" className="w-full border border-emerald-200 rounded-md p-2 pl-8 bg-white outline-none shadow-sm" placeholder="Transporter..." value={transporterName} onChange={(e) => setTransporterName(e.target.value)} />
              <Truck size={14} className="absolute left-2.5 top-3 text-slate-400" />
            </div>
          </div>

          <div className="col-span-12 md:col-span-3 p-4 border-r border-emerald-200/50">
            <label className="text-slate-500 font-bold uppercase block mb-1.5 text-[10px]">Vehicle Number</label>
            <div className="relative">
              <input type="text" className="w-full border border-emerald-200 rounded-md p-2 pl-8 bg-white outline-none shadow-sm uppercase" placeholder="MH 01 AB 1234" value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} />
              <MapPin size={14} className="absolute left-2.5 top-3 text-slate-400" />
            </div>
          </div>

          <div className="col-span-12 md:col-span-3 p-4 border-r border-emerald-200/50">
            <label className="text-slate-500 font-bold uppercase block mb-1.5 text-[10px]">Shipping Address</label>
            <div className="relative">
              <input type="text" className="w-full border border-emerald-200 rounded-md p-2 pl-8 bg-white outline-none shadow-sm" placeholder="Same as billing or other..." />
              <Truck size={14} className="absolute left-2.5 top-3 text-slate-400" />
            </div>
          </div>

          <div className="col-span-12 md:col-span-3 p-4 bg-slate-50/30">
            <label className="text-slate-500 font-bold uppercase block mb-1.5 text-[10px]">PO Reference</label>
            <input type="text" className="w-full border border-emerald-200 rounded-md p-2 bg-white outline-none shadow-sm" placeholder="PO-2024-XXXX" value={poReference} onChange={(e) => setPoReference(e.target.value)} />
          </div>
        </div>

        {/* ── NARRATION ────────────────────────────────────── */}
        <div className="p-6 bg-slate-50 border-b border-slate-200">
          <span className="text-slate-700 font-bold uppercase text-[11px] block mb-2">Narration</span>
          <textarea
            className="w-full bg-white border border-emerald-200 rounded-lg p-3 h-20 focus:ring-2 focus:ring-emerald-400 outline-none text-slate-600"
            placeholder="Enter any additional information here..."
            value={narration}
            onChange={(e) => setNarration(e.target.value)}
          />
        </div>

        {/* ── FINAL ACTION BAR ─────────────────────────────── */}
        <div
          className="flex items-center gap-3 p-3 text-white border-t border-emerald-950 bottom-0 z-[100]"
          style={{ background: 'linear-gradient(90deg, #022c22 0%, #064e3b 50%, #022c22 100%)' }}
        >
          {/* Save */}
          <button
            className="flex items-center gap-2.5 px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all shadow-lg active:scale-95 border-t border-emerald-400/30 text-white"
            style={{ background: 'linear-gradient(180deg, #059669 0%, #047857 100%)' }}
            onClick={savePurchase}
          >
            <Save size={16} strokeWidth={2.5} />
            Save Purchase
          </button>

          {/* Save & Print */}
          <button
            disabled={isLoadingPrint}
            className="flex items-center gap-2.5 bg-emerald-900/50 hover:bg-emerald-800 disabled:opacity-60 px-4 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-wider border border-emerald-700/50 transition-all active:bg-emerald-950"
          >
            <Printer size={16} className={`text-emerald-400 ${isLoadingPrint ? 'animate-spin' : ''}`} />
            {isLoadingPrint ? 'Processing...' : 'Save & Print'}
          </button>

          {/* Email */}
          <button className="flex items-center gap-2.5 bg-emerald-900/50 hover:bg-emerald-800 px-4 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-wider border border-emerald-700/50 transition-all">
            <Mail size={16} className="text-emerald-400" />
            Email
          </button>

          <div className="h-6 w-[1px] bg-emerald-800 mx-2" />

          {/* e-Invoice */}
          <button className="flex items-center gap-2.5 bg-teal-600/10 hover:bg-teal-600 text-teal-300 hover:text-white px-4 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest border border-teal-500/30 transition-all">
            <Send size={16} />
            e-Invoice
          </button>

          {/* e-Way Bill */}
          <button className="flex items-center gap-2.5 bg-cyan-600/10 hover:bg-cyan-600 text-cyan-400 hover:text-white px-4 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest border border-cyan-500/30 transition-all">
            <Truck size={16} />
            e-Way Bill
          </button>

          {/* Cancel */}
          <button className="flex items-center gap-2.5 text-emerald-600 hover:text-red-400 hover:bg-red-500/10 px-4 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-wider ml-auto transition-all group">
            <XCircle size={16} className="group-hover:rotate-90 transition-transform duration-300" />
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};

export default StockPurchase;