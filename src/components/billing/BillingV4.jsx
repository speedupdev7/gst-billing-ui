import React, { useState, useEffect, useCallback } from 'react';
import { Save, Printer, Mail, Send, Truck, XCircle, Plus, Trash2, MapPin, FileText, Hash, User, CreditCard, Landmark, ChevronDown } from 'lucide-react';
import DatePicker from "react-datepicker";
import {
  X,
  Banknote,
  QrCode,
  ArrowRight,
  Wallet,
  Check,
  ReceiptText, ArrowLeft, ChevronRight, Percent, ShieldCheck, HandCoins
} from 'lucide-react';
import "react-datepicker/dist/react-datepicker.css";
import axios from 'axios';
const BillingV4 = () => {
  const [paymentMode, setPaymentMode] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date());
  const [invoiceTime, setInvoiceTime] = useState(new Date());
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerSuggestions, setCustomerSuggestions] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [itemSearch, setItemSearch] = useState('');
  const [itemSuggestions, setItemSuggestions] = useState([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showItemDropdown, setShowItemDropdown] = useState(false);
  const [invoiceNo, setInvoiceNo] = useState('');
  const [placeOfSupply, setPlaceOfSupply] = useState('Maharashtra');
  const [reverseCharge, setReverseCharge] = useState(false);
  const [transporterName, setTransporterName] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [narration, setNarration] = useState('');
  // Each entry in activeMethods will look like: { id: 'UPI-171234', type: 'UPI' }
  const [activeMethods, setActiveMethods] = useState([{ type: 'Cash', id: 'initial-cash' }]);
  const [paymentSplit, setPaymentSplit] = useState({});
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentRefs, setPaymentRefs] = useState({}); // Stores { [methodId]: 'REF123' }
  const [discountMode, setDiscountMode] = useState({}); // Stores { [method.id]: 'rupee' | 'percent' }
  const createEmptyRow = () => ({
    id: Date.now() + Math.random(),
    itemId: null,
    itemCode: '',
    itemName: '',
    itemNameDetails: '',
    hsn: '',
    batch: '',
    rate: 0,
    qty: 0,
    grossAmount: 0,
    discP: 0,
    discA: 0,
    taxableAmt: 0,
    gstP: 18,
    gstA: 0,
    lineTotal: 0
  });

  // Amount In Words

  const numberToWords = (num) => {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const makeGroup = (n) => {
      let str = '';
      if (n > 99) {
        str += a[Math.floor(n / 100)] + 'Hundred ';
        n %= 100;
      }
      if (n > 19) {
        str += b[Math.floor(n / 10)] + ' ' + a[n % 10];
      } else {
        str += a[n];
      }
      return str;
    };

    if (num === 0) return 'Zero';

    let words = '';
    let crore = Math.floor(num / 10000000);
    num %= 10000000;
    let lakh = Math.floor(num / 100000);
    num %= 100000;
    let thousand = Math.floor(num / 1000);
    num %= 1000;
    let remaining = num;

    if (crore > 0) words += makeGroup(crore) + 'Crore ';
    if (lakh > 0) words += makeGroup(lakh) + 'Lakh ';
    if (thousand > 0) words += makeGroup(thousand) + 'Thousand ';
    if (remaining > 0) words += makeGroup(remaining);

    return words.trim();
  };

  // End Of Amount In Words Logic
  // -----------------------------------------------------

  // API Functions
  const searchCustomers = async (query) => {
    if (query.length < 3) {
      setCustomerSuggestions([]);
      return;
    }
    try {
      const response = await axios.get(`/api/customer-master/search?q=${encodeURIComponent(query)}`);
      setCustomerSuggestions(response.data);
      setShowCustomerDropdown(true);
    } catch (error) {
      console.error('Error searching customers:', error);
      setCustomerSuggestions([]);
    }
  };

  const searchItems = async (query) => {
    if (query.length < 3) {
      setItemSuggestions([]);
      return;
    }
    try {
      const response = await axios.get(`/api/item-master/search?q=${encodeURIComponent(query)}`);
      setItemSuggestions(response.data);
      setShowItemDropdown(true);
    } catch (error) {
      console.error('Error searching items:', error);
      setItemSuggestions([]);
    }
  };

  const selectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setCustomerSearch(customer.customerName);
    setShowCustomerDropdown(false);
  };

  const selectItem = (index, item) => {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      itemId: item.itemId,
      itemCode: item.itemCode,
      itemName: item.itemName, // for display
      itemNameDetails: item.itemNameDetails,
      hsn: item.hsnCode,
      gstP: item.gstRate,
      rate: item.salePrice,
      batch: updatedItems[index].batch || 'BATCH01' // keep existing batch if set
    };
    setItems(calculateTotals(updatedItems));
    setItemSearch('');
    setShowItemDropdown(false);
  };

  const saveInvoice = async () => {
    if (!selectedCustomer) {
      alert('Please select a customer');
      return;
    }

    const invoiceData = {
      invoiceNo: invoiceNo || `INV/${new Date().getFullYear()}/${Date.now()}`,
      invoiceDate: invoiceDate.toISOString().split('T')[0],
      unitId: 1, // Assuming default unit
      customerId: selectedCustomer.customerId,
      placeOfSupply: placeOfSupply,
      stateCode: selectedCustomer.stateCode,
      reverseCharge: reverseCharge,
      totalGrossAmount: totals.totalGross,
      totalDiscount: totals.totalDisc,
      taxableAmount: totals.totalTaxable,
      totalCgst: totals.totalGST / 2,
      totalSgst: totals.totalGST / 2,
      totalIgst: 0,
      roundOff: parseFloat(totals.roundOff),
      finalAmount: totals.invoiceTotal,
      transporterName: transporterName,
      vehicleNumber: vehicleNumber,
      narration: narration,
      items: items.map(item => ({
        itemId: item.itemId,
        batchCode: item.batch || 'BATCH01',
        hsnCode: item.hsn,
        quantity: item.qty,
        rate: item.rate,
        grossAmount: item.grossAmount,
        discountPct: item.discP,
        discountAmt: item.discA,
        taxableAmount: item.taxableAmt,
        gstRate: item.gstP,
        cgstAmt: item.gstA / 2,
        sgstAmt: item.gstA / 2,
        igstAmt: 0,
        lineTotal: item.lineTotal
      })),
      balance: {
        invoiceAmount: totals.invoiceTotal,
        paidAmount: 0,
        balanceAmount: totals.invoiceTotal,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days
        status: 'UNPAID'
      },
      payments: []
    };

    try {
      const response = await axios.post('/api/invoice', invoiceData);
      alert('Invoice saved successfully!');
      console.log('Saved invoice:', response.data);
    } catch (error) {
      console.error('Error saving invoice:', error);
      alert('Error saving invoice. Please try again.');
    }
  };
  const [items, setItems] = useState([createEmptyRow()]);
  const [totals, setTotals] = useState({
    totalGross: 0,
    totalDisc: 0,
    totalTaxable: 0,
    totalGST: 0,
    invoiceTotal: 0,
    roundOff: 0
  });

  const calculateTotals = useCallback((currentItems) => {
    let tGross = 0;
    let tDisc = 0;
    let tGST = 0;

    const updatedItems = currentItems.map(item => {
      const gross = item.qty * item.rate;
      const discount = (gross * item.discP) / 100;
      const taxable = gross - discount;
      const taxAmount = (taxable * item.gstP) / 100;
      const total = taxable + taxAmount;
      tGross += gross;
      tDisc += discount;
      tGST += taxAmount;
      return { ...item, grossAmount: gross, discA: discount, taxableAmt: taxable, gstA: taxAmount, lineTotal: total };
    });

    const finalTotal = tGross - tDisc + tGST;
    const rounded = Math.round(finalTotal);
    setTotals({
      totalGross: tGross,
      totalDisc: tDisc,
      totalTaxable: tGross - tDisc,
      totalGST: tGST,
      invoiceTotal: rounded,
      roundOff: (rounded - finalTotal).toFixed(2)
    });
    return updatedItems;
  }, []);

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;
    setItems(calculateTotals(updatedItems));
  };

  const addNewRow = () => setItems([...items, createEmptyRow()]);
  const removeRow = (id) => { if (items.length > 1) setItems(calculateTotals(items.filter(item => item.id !== id))); };
  const handleKeyDown = (e, index) => { if (e.key === 'Tab' && !e.shiftKey && index === items.length - 1) addNewRow(); };

  return (
    <div className="min-h-screen p-2 sm:p-4 md:p-3 text-[12px] font-poppins text-slate-700">
      <div className="max-w-[1500px] mx-auto bg-white  rounded-xl overflow-hidden border border-slate-200">

        {/* STICKY ACTION BAR */}
        <div className="flex bg-gradient-to-r from-[#061a4c] via-[#1e3a8a] to-[#061a4c] text-white p-3 gap-3 items-center sticky top-0 z-50 border-b border-white/10 shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-3 pr-4 border-r border-blue-400/30 mr-2">
            <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-2 rounded-xl shadow-inner ring-1 ring-white/20">
              <FileText size={20} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-tight text-white">TAX INVOICE</span>
            </div>
          </div>
        </div>

        {/* HEADER SECTION */}
        <div className="grid grid-cols-12 bg-amber-50/50">
          <div className="col-span-12 p-3 bg-amber-100/50 flex items-center gap-2 border-b border-amber-200">
            <FileText size={14} className="text-amber-800" />
            <span className="font-bold text-amber-800 uppercase tracking-wider text-[10px]">Invoice Header & Settings</span>
          </div>

          {/* 1. Invoice No (3/12) */}
          <div className="col-span-12 md:col-span-3 p-4 border-r border-b border-amber-200/50">
            <label className="text-slate-500 font-bold uppercase block mb-1.5 text-[10px]">Invoice No</label>
            <input
              type="text"
              className="w-full border border-amber-200 rounded-md p-2 bg-white font-bold outline-none shadow-sm"
              placeholder="INV/2024/0001"
              value={invoiceNo}
              onChange={(e) => setInvoiceNo(e.target.value)}
            />
          </div>

          {/* 2. Invoice Date (3/12) */}
          <div className="col-span-12 md:col-span-3 p-4 border-r border-b border-amber-200/50">
            <label className="text-slate-500 font-bold uppercase block mb-1.5 text-[10px]">Invoice Date</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <DatePicker
                selected={invoiceDate}
                onChange={(date) => setInvoiceDate(date)}
                dateFormat="dd MMM yyyy"
                showYearDropdown
                showMonthDropdown
                dropdownMode="select"
                className="w-full border border-amber-200 rounded-md p-2 pl-10 bg-white font-bold shadow-sm focus:ring-2 focus:ring-blue-400 outline-none h-[38px]"
                calendarClassName="!rounded-xl !border !border-slate-200 shadow-xl"
              />
            </div>
          </div>

          {/* 3. Time (3/12) */}
          <div className="col-span-12 md:col-span-3 p-4 border-r border-b border-amber-200/50">
            <label className="text-slate-500 font-bold uppercase block mb-1.5 text-[10px]">Time</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <DatePicker
                selected={invoiceTime}
                onChange={(time) => setInvoiceTime(time)}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={5}
                timeCaption="Time"
                dateFormat="hh:mm aa"
                className="w-full border border-amber-200 rounded-md p-2 pl-10 bg-white font-bold shadow-sm focus:ring-2 focus:ring-blue-400 outline-none h-[38px]"
              />
            </div>
          </div>

          {/* 4. Extra Field / Settings (3/12) to fill the row */}
          {/* <div className="col-span-12 md:col-span-3 p-4 border-b border-amber-200/50">
            <label className="text-slate-500 font-bold uppercase block mb-1.5 text-[10px]">Reference</label>
            <input
              type="text"
              className="w-full border border-amber-200 rounded-md p-2 bg-white outline-none shadow-sm"
              placeholder="Optional"
            />
          </div> */}
        </div>
        {/* CUSTOMER SECTION */}
        <div className="border-t border-amber-200">
          <div className="p-3 bg-amber-100/30 flex items-center gap-2 border-b border-amber-200">
            <User size={14} className="text-amber-600" />
            <span className="font-bold text-amber-800 uppercase tracking-wider text-[10px]">Customer & Billing Details</span>
          </div>

          <div className="grid grid-cols-12 gap-0">
            {/* ROW 1: Identity */}
            <div className="col-span-12 md:col-span-2 p-4 border-r border-b border-amber-200/50 bg-slate-50/30">
              <label className="text-slate-500 font-bold uppercase block mb-1.5 text-[10px]">Customer ID</label>
              <div className="relative">
                <input type="text" className="w-full border border-amber-200 rounded-md p-2 pl-8 bg-white outline-none shadow-sm transition-all" placeholder="CUST-001" />
                <Hash size={14} className="absolute left-2.5 top-3 text-slate-400" />
              </div>
            </div>

            <div className="col-span-12 md:col-span-4 p-4 border-r border-b border-amber-200/50">
              <label className="text-slate-500 font-bold uppercase block mb-1.5 text-[10px]">Customer Name</label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full border border-amber-200 rounded-md p-2 pl-8 bg-white focus:ring-2 focus:ring-blue-400 outline-none shadow-sm transition-all font-bold"
                  placeholder="Search or enter name..."
                  value={customerSearch}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value);
                    searchCustomers(e.target.value);
                  }}
                  onFocus={() => customerSuggestions.length > 0 && setShowCustomerDropdown(true)}
                  onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 200)}
                />
                <User size={14} className="absolute left-2.5 top-3 text-slate-400" />
                {showCustomerDropdown && customerSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border border-amber-200 rounded-md shadow-lg max-h-40 overflow-y-auto mt-1">
                    {customerSuggestions.map((customer, index) => (
                      <div
                        key={index}
                        className="p-2 hover:bg-amber-50 cursor-pointer border-b border-amber-100 last:border-b-0"
                        onClick={() => selectCustomer(customer)}
                      >
                        <div className="font-bold">{customer.customerName}</div>
                        <div className="text-sm text-slate-500">{customer.gstin} - {customer.state}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>


            {/* ROW 2: Tax & Contact */}
            <div className="col-span-12 md:col-span-3 p-4 border-r border-b border-amber-200/50 bg-blue-50/20">
              <label className="text-slate-500 font-bold uppercase block mb-1.5 text-[10px]">GST Number</label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full border border-amber-200 rounded-md p-2 pl-8 bg-white outline-none shadow-sm uppercase"
                  placeholder="27AAAAA0000A1Z5"
                  value={selectedCustomer?.gstin || ''}
                  onChange={(e) => setSelectedCustomer(prev => prev ? { ...prev, gstin: e.target.value } : null)}
                />
                <Landmark size={14} className="absolute left-2.5 top-3 text-slate-400" />
              </div>
            </div>

            <div className="col-span-12 md:col-span-3 p-4 border-r border-b border-amber-200/50 bg-blue-50/20">
              <label className="text-slate-500 font-bold uppercase block mb-1.5 text-[10px]">PAN</label>
              <div className="relative">
                <input type="text" className="w-full border border-amber-200 rounded-md p-2 pl-8 bg-white outline-none shadow-sm uppercase" placeholder="ABCDE1234F" />
                <CreditCard size={14} className="absolute left-2.5 top-3 text-slate-400" />
              </div>
            </div>

            <div className="col-span-12 md:col-span-3 p-4 border-r border-b border-amber-200/50">
              <label className="text-slate-500 font-bold uppercase block mb-1.5 text-[10px]">Mobile Number</label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full border border-amber-200 rounded-md p-2 pl-8 bg-white outline-none shadow-sm transition-all"
                  placeholder="98XXXXXXXX"
                  value={selectedCustomer?.mobileNo || ''}
                  onChange={(e) => setSelectedCustomer(prev => prev ? { ...prev, mobileNo: e.target.value } : null)}
                />
                <Send size={14} className="absolute left-2.5 top-3 text-slate-400" />
              </div>
            </div>

            <div className="col-span-12 md:col-span-3 p-4 border-b border-amber-200/50">
              <label className="text-slate-500 font-bold uppercase block mb-1.5 text-[10px]">Email ID</label>
              <div className="relative">
                <input
                  type="email"
                  className="w-full border border-amber-200 rounded-md p-2 pl-8 bg-white outline-none shadow-sm transition-all"
                  placeholder="customer@email.com"
                  value={selectedCustomer?.email || ''}
                  onChange={(e) => setSelectedCustomer(prev => prev ? { ...prev, email: e.target.value } : null)}
                />
                <Mail size={14} className="absolute left-2.5 top-3 text-slate-400" />
              </div>
            </div>

            {/* ROW 3: Address Details */}
            <div className="col-span-12 md:col-span-4 p-4 border-r border-b border-amber-200/50">
              <label className="text-slate-500 font-bold uppercase block mb-1.5 text-[10px]">Billing Address</label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full border border-amber-200 rounded-md p-2 pl-8 bg-white outline-none shadow-sm"
                  placeholder="Street, City, Zip..."
                  value={selectedCustomer?.billingAddress || ''}
                  onChange={(e) => setSelectedCustomer(prev => prev ? { ...prev, billingAddress: e.target.value } : null)}
                />
                <MapPin size={14} className="absolute left-2.5 top-3 text-slate-400" />
              </div>
            </div>

            <div className="col-span-12 md:col-span-2 p-4 border-r border-b border-amber-200/50 bg-slate-50/30">
              <label className="text-slate-500 font-bold uppercase block mb-1.5 text-[10px]">Billing State</label>
              <input
                type="text"
                className="w-full border border-amber-200 rounded-md p-2 bg-white outline-none shadow-sm"
                placeholder="27"
                value={selectedCustomer?.stateCode || ''}
                onChange={(e) => setSelectedCustomer(prev => prev ? { ...prev, stateCode: e.target.value } : null)}
              />
            </div>
          </div>
        </div>

        {/* ITEM GRID SECTION */}
        <div className="overflow-x-auto">

          <table className="w-full border-collapse">
            {/* THEAD SECTION */}
            <thead className="bg-[#111111] text-slate-400 text-[10px] text-left uppercase tracking-widest font-semibold antialiased border-y border-amber-900/30">
              <tr className="divide-x divide-white/5">
                <th className="p-4 w-14 text-center text-slate-500">Sr.</th>

                {/* Description: High contrast white with a subtle glow */}
                <th className="p-4 min-w-[280px] text-slate-100 bg-white/[0.02]">
                  Item Description/Barcode
                </th>

                <th className="p-4 w-28 text-center">HSN/SAC</th>
                <th className="p-4 w-28 text-center">Batch</th>

                {/* Editable Fields: Tinted with subtle Amber to match your UI */}
                <th className="p-4 w-32 text-center text-amber-100/90 bg-amber-400/[0.03]">Rate</th>
                <th className="p-4 w-20 text-center text-amber-100/90 bg-amber-400/[0.03]">Qty</th>

                <th className="p-4 w-32 text-center opacity-40 font-medium">Gross Amt</th>

                {/* Deduction: Muted Crimson */}
                <th className="p-4 w-24 text-center text-rose-400/70 bg-rose-400/[0.02]">Disc %</th>

                {/* Taxable: Solid Dark Grey to ground the data */}
                <th className="p-4 w-32 text-center text-slate-200 bg-[#1a1a1a]">Taxable Val</th>

                <th className="p-4 w-24 text-center">GST %</th>

                {/* Final Result: Gold/Emerald Success State */}
                <th className="p-4 w-36 text-center bg-emerald-500/[0.08] text-emerald-400 font-bold shadow-[inset_0_-2px_0_rgba(16,185,129,0.2)]">
                  Total Amount
                </th>

                <th className="p-4 w-28 text-center hover:text-white transition-colors">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {items.map((item, idx) => (
                <React.Fragment key={item.id}>
                  <tr className="group hover:bg-slate-50/40 transition-colors">
                    {/* Index Column */}
                    <td className="p-3 text-center text-slate-400 font-medium text-[11px] border-r border-slate-50">{idx + 1}</td>

                    {/* Item Name */}
                    <td className="p-1 border-r border-slate-50">
                      <div className="relative">
                        <input
                          className="w-full bg-transparent border-none focus:ring-2 focus:ring-blue-500/10 rounded px-1 py-1 text-[14px] text-slate-700 placeholder:text-slate-300 transition-all outline-none font-medium"
                          type="text"
                          value={item.itemName}
                          onChange={(e) => {
                            handleItemChange(idx, 'itemName', e.target.value);
                            setItemSearch(e.target.value);
                            searchItems(e.target.value);
                          }}
                          onFocus={() => itemSuggestions.length > 0 && setShowItemDropdown(true)}
                          onBlur={() => setTimeout(() => setShowItemDropdown(false), 200)}
                          placeholder="Item description..."
                        />
                        {showItemDropdown && itemSuggestions.length > 0 && (
                          <div className="absolute z-20 w-full bg-white border border-slate-200 rounded-md shadow-lg max-h-40 overflow-y-auto mt-1">
                            {itemSuggestions.map((suggestion, sIndex) => (
                              <div
                                key={sIndex}
                                className="p-2 hover:bg-blue-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                                onClick={() => selectItem(idx, suggestion)}
                              >
                                <div className="font-bold">{suggestion.itemName}</div>
                                <div className="text-sm text-slate-500">Code: {suggestion.itemCode} | HSN: {suggestion.hsnCode}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>


                    {/* HSN */}
                    <td className="p-1 border-r border-slate-50">
                      <input
                        className="w-full bg-transparent border-none focus:ring-1 focus:ring-slate-200 rounded px-1 py-1 text-[14px] text-slate-500 outline-none"
                        type="text"
                        value={item.hsn}
                        onChange={(e) => handleItemChange(idx, 'hsn', e.target.value)}
                        placeholder="HSN"
                      />
                    </td>

                    {/* Batch */}
                    <td className="p-1 border-r border-slate-50">
                      <input
                        className="w-full bg-transparent border-none focus:ring-1 focus:ring-slate-200 rounded px-1 py-1 text-[14px] text-slate-500 outline-none"
                        type="text"
                        value={item.batch || ''}
                        onChange={(e) => handleItemChange(idx, 'batch', e.target.value)}
                        placeholder="Batch"
                      />
                    </td>

                    <td className="p-1 border-r border-slate-50">
                      <input
                        className="w-full bg-transparent border-none focus:ring-2 focus:ring-blue-500/10 rounded px-1 py-1 text-right text-[14px] text-slate-700 outline-none font-medium"
                        type="text"
                        inputMode="decimal"
                        // Use the raw value from state to allow trailing dots (e.g., "9.")
                        value={item.rate === 0 ? '' : item.rate}
                        onBlur={(e) => {
                          // Clean up the value on blur (e.g., convert "9." to 9)
                          const val = parseFloat(e.target.value) || 0;
                          handleItemChange(idx, 'rate', val);
                        }}
                        onChange={(e) => {
                          const val = e.target.value;
                          // Regex allows: empty string, numbers, and a single decimal point
                          if (val === '' || /^\d*\.?\d*$/.test(val)) {
                            handleItemChange(idx, 'rate', val);
                          }
                        }}
                      />
                    </td>

                    {/* Qty - Zero Handling Added */}
                    <td className="p-1 border-r border-slate-50">
                      <input
                        className="w-full bg-transparent border-none focus:ring-2 focus:ring-blue-500/10 rounded px-1 py-1 text-right text-[14px] font-bold text-slate-800 outline-none"
                        type="text"
                        inputMode="numeric"
                        value={item.qty === 0 ? '' : item.qty}
                        onBlur={(e) => e.target.value === '' && handleItemChange(idx, 'qty', 0)}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '' || /^\d*$/.test(val)) {
                            handleItemChange(idx, 'qty', val === '' ? 0 : parseInt(val));
                          }
                        }}
                      />
                    </td>

                    {/* Gross (Read Only) */}
                    <td className="p-3 text-right text-slate-400 font-medium text-[12px] border-r border-slate-50">
                      {item.grossAmount.toFixed(2)}
                    </td>

                    {/* Discount % Input */}
                    <td className="p-1 border-r border-slate-50">
                      <input
                        className="w-full bg-transparent border-none focus:ring-1 focus:ring-slate-200 rounded px-1 py-1 text-right text-[14px] text-slate-500 outline-none"
                        type="text"
                        inputMode="decimal"
                        placeholder="0%"
                        value={item.discP === 0 ? '' : item.discP}
                        onBlur={(e) => e.target.value === '' && handleItemChange(idx, 'discP', 0)}
                        onChange={(e) => {
                          // Allow only numbers and decimals
                          const val = e.target.value.replace(/[^0-9.]/g, '');
                          if ((val.match(/\./g) || []).length > 1) return;
                          handleItemChange(idx, 'discP', parseFloat(val) || 0);
                        }}
                      />
                    </td>
                    {/* Taxable (Read Only) */}
                    <td className="p-3 text-right font-semibold text-slate-700 text-[12px] border-r border-slate-50 bg-slate-50/30">
                      {item.taxableAmt.toFixed(2)}
                    </td>

                    {/* GST % */}
                    <td className="p-1 border-r border-gray-100">
                      <input
                        className="w-full bg-blue-50/50 border-none focus:ring-2 focus:ring-blue-400/20 rounded px-1 py-1 text-right text-[14px] font-bold text-blue-600 outline-none"
                        type="number" // Changed to number for better handling
                        value={item.gstP}
                        onKeyDown={(e) => handleKeyDown(e, idx)}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          handleItemChange(idx, 'gstP', isNaN(val) ? 0 : val);
                        }}
                      />
                    </td>

                    {/* Line Total */}
                    <td className="p-3 text-right font-bold text-slate-900 text-[13px] bg-blue-50/20">
                      {item.lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Actions */}
                    <td className="p-2 text-center min-w-[80px]">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => removeRow(item.id)}
                          className="p-1.5 text-slate-300 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                        >
                          <XCircle size={20} strokeWidth={2.5} />
                        </button>
                        {idx === items.length - 1 && (
                          <button onClick={addNewRow} className="p-1.5 bg-blue-600 text-white rounded shadow-sm hover:bg-blue-700 transition-all">
                            <Plus size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Modern Tax Breakdown Row */}
                  <tr className="bg-slate-50/40 text-[9px] text-slate-500 border-b border-slate-100">
                    {/* 1. Label/Spacer (Reduced to 3 to make room) */}
                    <td colSpan={3} className="py-1 px-4 text-right font-semibold border-r border-slate-200/60">
                      <span className="text-slate-400">Details:</span>
                    </td>

                    <td colSpan={2} className="py-1 px-2 border-r border-slate-200/60 bg-rose-50/30">
                      <span className="text-rose-600 font-medium text-[10px] uppercase">Disc.</span>
                      <span className="text-slate-900 font-bold ml-1">
                        ₹{(() => {
                          const p = parseFloat(item.rate) || 0;
                          const q = parseFloat(item.qty) || 0;
                          const d = parseFloat(item.discP) || 0;

                          const result = (p * q * d) / 100;

                          return result.toFixed(2);
                        })()}
                      </span>
                    </td>
                    {/* 3. CGST */}
                    <td colSpan={2} className="py-1 px-2 border-r border-slate-200/60">
                      CGST <span className="text-slate-900 font-bold ml-1">₹{(item.gstA / 2).toFixed(2)}</span>
                    </td>

                    {/* 4. SGST */}
                    <td colSpan={2} className="py-1 px-2 border-r border-slate-200/60">
                      SGST <span className="text-slate-900 font-bold ml-1">₹{(item.gstA / 2).toFixed(2)}</span>
                    </td>

                    {/* 5. IGST */}
                    <td colSpan={2} className="py-1 px-2 border-r border-slate-200/60">
                      IGST <span className="text-slate-900 font-bold ml-1">₹{item.igst?.toFixed(2) || "0.00"}</span>
                    </td>

                    {/* 6. Final Spacer (Aligned with Total Amount column) */}
                    <td colSpan={1} className="bg-slate-100/20"></td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* SUMMARY FOOTER */}
        <div className="grid grid-cols-12 border-t border-slate-200">
          {/* LEFT SECTION (Empty/Notes Area) */}


          {/* RIGHT SECTION - TWO BOX SUMMARY */}
          <div className="col-span-5 sm:col-span-12 bg-white p-6 space-y-4 font-poppins">
            <div className="grid grid-cols-2 gap-4">

              {/* Box 1: Tax breakdown & Round Off */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <h4 className="text-[15px] font-black text-blue-600 uppercase tracking-wider mb-2">Taxes & Adjustments</h4>
                <div className="flex justify-between items-center text-black">
                  <span className="font-bold">Total CGST</span>
                  <span className="font-bold">₹ {(totals.totalGST / 2).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-black">
                  <span className="font-bold">SGST</span>
                  <span className="font-bold">₹ {(totals.totalGST / 2).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-black">
                  <span className="font-bold">IGST</span>
                  <span className="font-bold">₹ 0.00</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-slate-500">
                  <span className="font-bold text-[9px] uppercase">Round Off</span>
                  <span className="font-bold">{totals.roundOff}</span>
                </div>
              </div>

              {/* Box 2: Core Financial Totals */}
              <div className="bg-blue-50/30 p-4 rounded-xl border border-blue-100 space-y-2">
                <h4 className="text-[15px] font-black text-blue-600 uppercase tracking-wider mb-2">Billing Totals</h4>
                <div className="flex justify-between items-center text-slate-900">
                  <span className="font-bold">Total Gross</span>
                  <span className="font-bold">₹ {totals.totalGross.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-green-700">
                  <span className="font-bold">Total Disc</span>
                  <span className="font-bold">− ₹ {totals.totalDisc.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-700 py-1 border-y border-blue-100/50">
                  <span className="font-bold">Taxable Amt</span>
                  <span className="font-bold font-bold">₹ {totals.totalTaxable.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-blue-600">
                  <span className="font-bold">Total GST</span>
                  <span className="font-bold font-bold">+ ₹ {totals.totalGST.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Final Totals Area */}
            <div className="space-y-3">
              <div
                onClick={() => setShowPaymentModal(true)}
                className="bg-gradient-to-br from-emerald-700 to-emerald-900 text-white p-6 rounded-xl relative overflow-hidden cursor-pointer hover:scale-[1.01] transition"
              >

                {/* Main Flex Container */}
                <div className="relative z-10 flex items-center justify-between">

                  {/* LEFT: ICON */}
                  <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10">
                    <CreditCard size={32} />
                  </div>

                  {/* RIGHT: AMOUNT DETAILS */}
                  <div className="text-right">
                    <span className="block text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-1">
                      Final Invoice Amount
                    </span>
                    <div className="flex items-end justify-end gap-1">
                      <span className="text-xl font-light opacity-80">₹</span>
                      <span className="text-4xl font-black tracking-tighter">
                        {totals.invoiceTotal.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xl font-black mb-1">.00</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-12 border-b border-amber-200/50">

          <div class="col-span-12 md:col-span-6 p-4 border-r border-amber-200/50">
            <label class="text-slate-500 font-bold uppercase block mb-1.5 text-[10px]">Contact Person</label>
            <div class="relative">
              <input type="text" class="w-full border border-amber-200 rounded-md p-2 pl-8 bg-white outline-none shadow-sm" placeholder="In-charge name" />
              <User size={14} class="absolute left-2.5 top-3 text-slate-400" />
            </div>
          </div>

          <div class="col-span-12 md:col-span-4 p-4 border-r border-amber-200/50">
            <label class="text-slate-500 font-bold uppercase block mb-1.5 text-[10px]">Shipping Address</label>
            <div class="relative">
              <input type="text" class="w-full border border-amber-200 rounded-md p-2 pl-8 bg-white outline-none shadow-sm" placeholder="Same as billing or other..." />
              <Truck size={14} class="absolute left-2.5 top-3 text-slate-400" />
            </div>
          </div>

          <div class="col-span-12 md:col-span-2 p-4 bg-slate-50/30">
            <label class="text-slate-500 font-bold uppercase block mb-1.5 text-[10px]">Shipping State</label>
            <input type="text" class="w-full border border-amber-200 rounded-md p-2 bg-white outline-none shadow-sm" placeholder="27" />
          </div>

        </div>
        {/* LEFT SECTION (Narration Area) */}
        <div className="col-span-7 sm:col-span-12 p-6 bg-slate-50 border-r border-slate-200">
          <div className="h-full flex flex-col justify-end">
            <span className="text-slate-900 font-bold uppercase text-[15x] mb-2">Narration</span>
            <textarea
              className="w-full bg-white border border-slate-200 rounded-lg p-3 h-24 focus:ring-2 focus:ring-blue-400 outline-none text-slate-600"
              placeholder="Enter any additional information here..."
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
            ></textarea>
          </div>
        </div>

        {/* FINAL ACTION BAR */}
        <div className="col-span-12 flex bg-slate-900/95 backdrop-blur-md text-white p-3 gap-3 items-center border-t border-slate-800 bottom-0 z-[100]">

          {/* PRIMARY ACTION: SAVE */}
          <button
            className="flex items-center gap-2.5 bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all shadow-lg shadow-blue-900/40 active:scale-95 border-t border-blue-400/30"
            onClick={saveInvoice}
          >
            <Save size={16} strokeWidth={2.5} />
            Save Invoice
          </button>

          {/* SECONDARY ACTION: PRINT */}
          <button className="flex items-center gap-2.5 bg-slate-800 hover:bg-slate-700 px-4 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-wider border border-slate-700 transition-all active:bg-slate-900">
            <Printer size={16} className="text-slate-400" />
            Save & Print
          </button>

          {/* COMMUNICATION */}
          <button className="flex items-center gap-2.5 bg-slate-800 hover:bg-slate-700 px-4 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-wider border border-slate-700 transition-all">
            <Mail size={16} className="text-slate-400" />
            Email
          </button>

          {/* SEPARATOR */}
          <div className="h-6 w-[1px] bg-slate-700 mx-2" />

          {/* COMPLIANCE ACTIONS */}
          <button className="flex items-center gap-2.5 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white px-4 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest border border-indigo-500/30 transition-all shadow-xl shadow-indigo-900/10">
            <Send size={16} />
            e-Invoice
          </button>

          <button className="flex items-center gap-2.5 bg-orange-600/10 hover:bg-orange-600 text-orange-500 hover:text-white px-4 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest border border-orange-500/30 transition-all shadow-xl shadow-orange-900/10">
            <Truck size={16} />
            e-Way Bill
          </button>

          {/* DANGER ACTION */}
          <button className="flex items-center gap-2.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 px-4 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-wider ml-auto transition-all group">
            <XCircle size={16} className="group-hover:rotate-90 transition-transform duration-300" />
            Cancel
          </button>
        </div>
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-sm flex justify-center sm:justify-end overflow-hidden font-poppins">
          <div className="absolute inset-0" onClick={() => setShowPaymentModal(false)} />

          {/* Main Container */}
          <div className="relative w-full md:w-[80%] lg:w-[50%] h-full bg-white shadow-xl flex flex-col animate-in slide-in-from-right duration-500">

            {/* 1. Header */}
            <div className="h-16 px-4 sm:px-6 flex items-center justify-between bg-emerald-500 border-b border-slate-200 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <ReceiptText className="text-emerald-700" size={20} />
                </div>
                <h2 className="text-base sm:text-lg font-semibold font-poppins text-slate-800 tracking-tight">Finalize Transaction</h2>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-900">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

              {/* LEFT: Payment Selection */}
              <div className="w-full lg:w-[260px] border-b lg:border-b-0 lg:border-r border-slate-200 bg-white p-4 flex flex-col gap-4 overflow-y-auto shrink-0">
                <section>
                  <h4 className="text-[10px] font-semibold text-slate-700 uppercase tracking-wider mb-3">Select Method</h4>
                  <div className="grid grid-cols-3 lg:grid-cols-2 gap-6">
                    {[
                      { type: 'Cash', icon: <Banknote size={18} />, color: 'emerald' },
                      { type: 'UPI', icon: <QrCode size={18} />, color: 'indigo' },
                      { type: 'Credit Card', icon: <CreditCard size={18} />, color: 'blue' },
                      { type: 'Debit Card', icon: <CreditCard size={18} />, color: 'cyan' },
                      { type: 'Cheque', icon: <FileText size={18} />, color: 'slate' },
                      { type: 'Discount', icon: <Percent size={18} />, color: 'rose' }
                    ].map((m) => {
                      const isCashAlreadyAdded = m.type === 'Cash' && activeMethods.some(method => method.type === 'Cash');
                      return (
                        <button
                          key={m.type}
                          disabled={isCashAlreadyAdded}
                          onClick={() => {
                            if (isCashAlreadyAdded) return;
                            const id = `${m.type}-${Date.now()}`;
                            setActiveMethods([...activeMethods, { type: m.type, id }]);
                            if (m.type === 'Discount') setDiscountMode(prev => ({ ...prev, [id]: 'rupee' }));
                          }}
                          className={`flex flex-col items-center justify-center gap-1 p-2.5 border rounded-xl transition-all shadow-sm relative
                      ${isCashAlreadyAdded
                              ? 'opacity-40 bg-slate-100 border-slate-200 cursor-not-allowed filter grayscale'
                              : 'bg-slate-50 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 active:scale-95 text-slate-700'
                            }`}
                        >
                          <span className={`text-${m.color}-600`}>{m.icon}</span>
                          <span className="text-[10px] font-bold">{m.type}</span>
                          {isCashAlreadyAdded && (
                            <span className="absolute text-[8px] bg-slate-800 text-white px-1 rounded bottom-1">Added</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </section>
              </div>

              {/* RIGHT: Active Inputs Area */}
              <div className="flex-1 overflow-y-auto p-4 lg:p-5 bg-slate-50/50">
                <div className="space-y-3">
                  {activeMethods.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                      <HandCoins size={48} className="mb-4 opacity-20" />
                      <p className="text-sm font-medium">No payment methods added</p>
                    </div>
                  ) : (
                    activeMethods.map((method) => {
                      const isDiscount = method.type === 'Discount';
                      const needsRef = ['UPI', 'Cheque', 'Credit Card', 'Debit Card'].includes(method.type);
                      const isPercent = isDiscount && discountMode[method.id] === 'percent';

                      return (
                        <div key={method.id} className="bg-white border border-slate-200 rounded-xl p-3 lg:p-4 shadow-sm relative group animate-in zoom-in-95 duration-200">
                          <button
                            onClick={() => {
                              setActiveMethods(activeMethods.filter(m => m.id !== method.id));
                              setPaymentSplit(prev => { const n = { ...prev }; delete n[method.id]; return n; });
                            }}
                            className="absolute -top-2 -right-2 p-1.5 bg-slate-800 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                          >
                            <X size={10} />
                          </button>

                          <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 items-stretch">
                            <div className="flex-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase mb-1 block ml-1">
                                {method.type} {isPercent ? '(%)' : '(Amount)'}
                              </label>
                              <div className="relative">
                                {!isPercent ? (
                                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-base">₹</div>
                                ) : (
                                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-base">%</div>
                                )}
                                <input
                                  type="text"
                                  inputMode="decimal"
                                  className={`w-full py-2 bg-slate-50 border border-slate-100 rounded-lg font-bold text-lg text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all 
                              ${!isPercent ? 'pl-8 pr-3' : 'pr-8 pl-3'}`}
                                  placeholder="0.00"
                                  value={paymentSplit[method.id] || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === '' || /^\d*\.?\d*$/.test(val)) {
                                      // Logic: Calculate current total excluding this field
                                      const currentTotalOthers = Object.entries(paymentSplit)
                                        .filter(([id]) => id !== method.id)
                                        .reduce((sum, [id, v]) => {
                                          const m = activeMethods.find(x => x.id === id);
                                          const numV = parseFloat(v) || 0;
                                          return sum + (m?.type === 'Discount' && discountMode[id] === 'percent' ? (totals.invoiceTotal * (numV / 100)) : numV);
                                        }, 0);

                                      const newVal = parseFloat(val) || 0;
                                      const newValInRupees = isPercent ? (totals.invoiceTotal * (newVal / 100)) : newVal;

                                      // Only update if it doesn't exceed total
                                      if (currentTotalOthers + newValInRupees <= totals.invoiceTotal) {
                                        setPaymentSplit(prev => ({ ...prev, [method.id]: val }));
                                      }
                                    }
                                  }}
                                />
                              </div>
                            </div>

                            <div className="w-full sm:w-[150px] lg:w-[100px]">
                              <label className="text-[9px] font-bold text-slate-400 uppercase mb-1 block ml-1">
                                {isDiscount ? 'Mode' : needsRef ? 'Reference' : 'Note'}
                              </label>
                              {isDiscount ? (
                                <div className="flex bg-slate-100 p-1 rounded-lg h-[42px] border border-slate-200">
                                  <button
                                    onClick={() => {
                                      setDiscountMode(prev => ({ ...prev, [method.id]: 'rupee' }));
                                      setPaymentSplit(prev => ({ ...prev, [method.id]: '' })); // Clear on mode change to prevent overflow
                                    }}
                                    className={`flex-1 text-[9px] font-bold rounded-md transition-all ${discountMode[method.id] !== 'percent' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500'}`}
                                  >RUPEES</button>
                                  <button
                                    onClick={() => {
                                      setDiscountMode(prev => ({ ...prev, [method.id]: 'percent' }));
                                      setPaymentSplit(prev => ({ ...prev, [method.id]: '' }));
                                    }}
                                    className={`flex-1 text-[9px] font-bold rounded-md transition-all ${discountMode[method.id] === 'percent' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500'}`}
                                  >PERC %</button>
                                </div>
                              ) : needsRef ? (
                                <input
                                  type="text"
                                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 h-[42px] focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                  placeholder="Ref ID..."
                                  value={paymentRefs[method.id] || ''}
                                  onChange={(e) => setPaymentRefs(prev => ({ ...prev, [method.id]: e.target.value }))}
                                />
                              ) : (
                                <div className="h-[42px] flex items-center px-3 bg-slate-100/30 border border-slate-200 border-dashed rounded-lg">
                                  <span className="text-[9px] font-bold text-slate-400 uppercase italic">Direct</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* 3. Footer Section */}
            {(() => {
              const totalPaid = Object.entries(paymentSplit).reduce((sum, [id, val]) => {
                const method = activeMethods.find(m => m.id === id);
                const numVal = parseFloat(val) || 0;
                if (method?.type === 'Discount' && discountMode[id] === 'percent') {
                  return sum + (totals.invoiceTotal * (numVal / 100));
                }
                return sum + numVal;
              }, 0);
              const remaining = totals.invoiceTotal - totalPaid;

              return (
                <div className="p-6 bg-white border-t border-slate-200 shrink-0">
                  <div className="max-w-4xl mx-auto w-full">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-8 lg:gap-12">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Total Paid</p>
                          <p className="text-xl lg:text-2xl font-black text-slate-900 tabular-nums">₹{totalPaid.toLocaleString('en-IN')}</p>
                        </div>
                        <div className="h-10 w-px bg-slate-200 hidden sm:block" />
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Remaining</p>
                          <p className={`text-xl lg:text-2xl font-black tabular-nums ${remaining <= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                            ₹{Math.max(0, remaining).toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button
                          onClick={() => {
                            const lastId = activeMethods[activeMethods.length - 1]?.id;
                            if (lastId) {
                              const m = activeMethods.find(x => x.id === lastId);
                              const isPerc = m?.type === 'Discount' && discountMode[lastId] === 'percent';

                              // Settle balance is tricky for percentages, usually settled as a Rupee amount.
                              // We force Rupee mode for settlement or calculate the required %
                              let settlementValue = (parseFloat(paymentSplit[lastId] || 0) + Math.max(0, remaining)).toFixed(2);
                              if (isPerc) {
                                settlementValue = (((parseFloat(paymentSplit[lastId] || 0) / 100 * totals.invoiceTotal) + remaining) / totals.invoiceTotal * 100).toFixed(2);
                              }
                              setPaymentSplit(prev => ({ ...prev, [lastId]: settlementValue }));
                            }
                          }}
                          className="flex-1 sm:px-6 h-12 bg-white text-slate-600 border border-slate-200 rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95"
                        >
                          Settle Balance
                        </button>
                        <button
                          onClick={() => setShowPaymentModal(false)}
                          disabled={remaining > 0.01 || totalPaid === 0} // Allowance for float precision
                          className="flex-[2] sm:flex-none sm:px-10 h-12 bg-slate-900 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 active:scale-95"
                        >
                          Proceed <ArrowRight size={16} strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingV4;