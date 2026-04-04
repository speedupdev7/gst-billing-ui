import React, { useState, useEffect, useCallback } from 'react';
import { Save, Printer, Mail, Send, Truck, XCircle, Plus, Trash2, FileText, User, CreditCard, Landmark, ChevronDown } from 'lucide-react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
const Billing = () => {
  const [paymentMode, setPaymentMode] = useState('');
 const [invoiceDate, setInvoiceDate] = useState(new Date());
  const createEmptyRow = () => ({
    id: Date.now() + Math.random(),
    itemName: '',
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
            <span className="font-bold text-amber-800 uppercase tracking-wider text-[10px]">Invoice Header & Settings</span>
          </div>
          <div className="col-span-3 p-4 border-r border-amber-200/50">
            <label className="text-slate-500 font-bold uppercase block mb-1.5">Invoice No</label>
            <input type="text" className="w-full border border-amber-200 rounded-md p-2 bg-white focus:ring-2 focus:ring-blue-400 outline-none shadow-sm" placeholder="INV/2024/0001" />
          </div>
          {/* Date Section - Fixed wrapping div and label */}
          <div className="col-span-6 md:col-span-2 p-4 border-r border-b border-amber-200/50">
            <label className="text-slate-500 font-bold uppercase block mb-1.5 text-[10px]">Invoice Date</label>
            <DatePicker
              selected={invoiceDate}
              onChange={(date) => setInvoiceDate(date)}
              dateFormat="dd MMM yyyy"
              showYearDropdown
              showMonthDropdown
              dropdownMode="select"
              className="w-full border border-amber-200 rounded-md p-2 bg-white font-bold shadow-sm focus:ring-2 focus:ring-blue-400 outline-none h-[38px]"
              calendarClassName="!rounded-xl !border !border-slate-200 shadow-xl"
            />
          </div>
          <div className="col-span-3 p-4 border-r border-amber-200/50">
            <label className="text-slate-500 font-bold uppercase block mb-1.5">Place of Supply</label>
            <select className="w-full border border-amber-200 rounded-md p-2 bg-white focus:ring-2 focus:ring-blue-400 outline-none shadow-sm appearance-none">
              <option>Maharashtra (27)</option>
              <option>Gujarat (24)</option>
              <option>Karnataka (29)</option>
            </select>
          </div>
          <div className="col-span-3 p-4 space-y-2 bg-amber-100/20">
            <div className="flex justify-between items-center bg-white/60 p-1.5 rounded border border-amber-200/50">
              <span className="font-medium">Reverse Charge</span>
              <input type="checkbox" className="w-4 h-4 rounded border-amber-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
            </div>
            <div className="flex justify-between items-center bg-white/60 p-1.5 rounded border border-amber-200/50">
              <span className="font-medium">E-Invoice Required</span>
              <input type="checkbox" className="w-4 h-4 rounded border-amber-300 text-blue-600 focus:ring-blue-500 cursor-pointer" defaultChecked />
            </div>
          </div>
        </div>

        {/* CUSTOMER SECTION */}
        {/* CUSTOMER SECTION */}
        <div className="border-t border-amber-200">
          <div className="p-3 bg-amber-100/30 flex items-center gap-2 border-b border-amber-200">
            <User size={14} className="text-amber-600" />
            <span className="font-bold text-amber-800 uppercase tracking-wider text-[10px]">Customer & Billing Details</span>
          </div>

          <div className="grid grid-cols-12 gap-0">
            {/* Row 1: Primary Info */}
            <div className="col-span-12 md:col-span-5 p-4 border-r border-b border-amber-200/50">
              <label className="text-slate-500 font-bold uppercase block mb-1.5 text-[10px]">Customer Name</label>
              <div className="relative">
                <input type="text" className="w-full border border-amber-200 rounded-md p-2 pl-8 bg-white focus:ring-2 focus:ring-blue-400 outline-none shadow-sm transition-all" placeholder="Search or enter customer name..." />
                <User size={14} className="absolute left-2.5 top-3 text-slate-400" />
              </div>
            </div>

            <div className="col-span-6 md:col-span-4 p-4 border-r border-b border-amber-200/50">
              <label className="text-slate-500 font-bold uppercase block mb-1.5 text-[10px]">GSTIN / UIN</label>
              <div className="relative">
                <input type="text" className="w-full border border-amber-200 rounded-md p-2 pl-8 bg-white focus:ring-2 focus:ring-blue-400 outline-none uppercase shadow-sm" placeholder="27XXXXX0000X1Z1" />
                <Landmark size={14} className="absolute left-2.5 top-3 text-slate-400" />
              </div>
            </div>

            <div className="col-span-6 md:col-span-3 p-4 border-b border-amber-200/50">
              <label className="text-slate-500 font-bold uppercase block mb-1.5 text-[10px]">Registration Type</label>
              <select className="w-full border border-amber-200 rounded-md p-2 bg-white focus:ring-2 focus:ring-blue-400 outline-none shadow-sm">
                <option>B2B - Regular</option>
                <option>B2B - Composition</option>
                <option>B2C - Consumer</option>
                <option>Export / SEZ</option>
              </select>
            </div>

            {/* Row 2: Address & Location */}


            <div className="col-span-4 md:col-span-2 p-4 border-r border-amber-200/50">
              <label className="text-slate-500 font-bold uppercase block mb-1.5 text-[10px]">Pincode</label>
              <input type="text" className="w-full border border-amber-200 rounded-md p-2 bg-white focus:ring-2 focus:ring-blue-400 outline-none shadow-sm" placeholder="400001" />
            </div>

            <div className="col-span-4 md:col-span-2 p-4 border-r border-amber-200/50">
              <label className="text-slate-500 font-bold uppercase block mb-1.5 text-[10px]">District</label>
              <input type="text" className="w-full border border-amber-200 rounded-md p-2 bg-white focus:ring-2 focus:ring-blue-400 outline-none shadow-sm" placeholder="Mumbai" />
            </div>

            <div className="col-span-4 md:col-span-3 p-4">
              <label className="text-slate-500 font-bold uppercase block mb-1.5 text-[10px]">State / Union Territory</label>
              <input type="text" className="w-full border border-amber-200 rounded-md p-2 bg-white focus:ring-2 focus:ring-blue-400 outline-none shadow-sm" placeholder="Maharashtra" />
            </div>

            <div className="col-span-12 md:col-span-5 p-4 border-r border-amber-200/50">
              <label className="text-slate-500 font-bold uppercase block mb-1.5 text-[10px]">Billing Address</label>
              <textarea
                rows="1"
                className="w-full border border-amber-200 rounded-md p-2 bg-white focus:ring-2 focus:ring-blue-400 outline-none shadow-sm resize-none"
                placeholder="Building, Street, Area..."
              ></textarea>
            </div>
          </div>
        </div>

        {/* ITEM GRID SECTION */}
        <div className="overflow-x-auto">

          <table className="w-full border-collapse">
            {/* THEAD SECTION */}
            <thead className="bg-[#0f172a] text-slate-200 text-[11px] text-left uppercase tracking-[0.15em] font-bold antialiased border-y border-slate-800">
              <tr className="divide-x divide-slate-700/50">
                <th className="p-4 w-14 text-center">Sr.</th>

                {/* Description: Blue tint to show it's the primary field */}
                <th className="p-4 min-w-[280px] text-blue-400">Item Description</th>

                <th className="p-4 w-28 text-center">HSN/SAC</th>
                <th className="p-4 w-28 text-center">Batch</th>

                {/* Editable Fields: Subtle Amber/White */}
                <th className="p-4 w-32 text-center text-white">Rate</th>
                <th className="p-4 w-20 text-center text-white">Qty</th>

                <th className="p-4 w-32 text-center opacity-60">Gross Amt</th>

                {/* Deduction: Rose/Red tint */}
                <th className="p-4 w-24 text-center text-rose-400">Disc %</th>

                {/* Taxable: Strong focus */}
                <th className="p-4 w-32 text-center font-black bg-slate-800/40">Taxable Val</th>

                <th className="p-4 w-24 text-center">GST %</th>

                {/* Final Result: Emerald/Green tint for success/total */}
                <th className="p-4 w-36 text-center bg-emerald-900/20 text-emerald-400 font-black">
                  Total Amount
                </th>

                <th className="p-4 w-28 text-center">Actions</th>
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
                      <input
                        className="w-full bg-transparent border-none focus:ring-2 focus:ring-blue-500/10 rounded px-1 py-1 text-[14px] text-slate-700 placeholder:text-slate-300 transition-all outline-none font-medium"
                        type="text"
                        value={item.itemName}
                        onChange={(e) => handleItemChange(idx, 'itemName', e.target.value)}
                        placeholder="Item description..."
                      />
                    </td>


                    {/* HSN */}
                    <td className="p-1 border-r border-slate-50">
                      <input
                        className="w-full bg-transparent border-none focus:ring-1 focus:ring-slate-200 rounded px-1 py-1 text-[14px] text-slate-500 outline-none"
                        type="text"
                        placeholder="HSN"
                      />
                    </td>

                    {/* Batch */}
                    <td className="p-1 border-r border-slate-50">
                      <input
                        className="w-full bg-transparent border-none focus:ring-1 focus:ring-slate-200 rounded px-1 py-1 text-[14px] text-slate-500 outline-none"
                        type="text"
                        placeholder="Batch"
                      />
                    </td>

                    {/* Rate - Zero Handling Added */}
                    <td className="p-1 border-r border-slate-50">
                      <input
                        className="w-full bg-transparent border-none focus:ring-2 focus:ring-blue-500/10 rounded px-1 py-1 text-right text-[14px] text-slate-700 outline-none font-medium"
                        type="text"
                        inputMode="decimal"
                        value={item.rate === 0 ? '' : item.rate}
                        onBlur={(e) => e.target.value === '' && handleItemChange(idx, 'rate', 0)}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '' || /^\d*\.?\d*$/.test(val)) {
                            handleItemChange(idx, 'rate', val === '' ? 0 : parseFloat(val));
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

                    {/* Discount % */}
                    <td className="p-1 border-r border-slate-50">
                      <input
                        className="w-full bg-transparent border-none focus:ring-1 focus:ring-slate-200 rounded px-1 py-1 text-right text-[14px] text-slate-500 outline-none"
                        type="text"
                        value={item.discP === 0 ? '' : item.discP}
                        onBlur={(e) => e.target.value === '' && handleItemChange(idx, 'discP', 0)}
                        onChange={(e) => handleItemChange(idx, 'discP', parseFloat(e.target.value) || 0)}
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
                  <tr className="bg-slate-50/20 text-[10px] text-slate-400">
                    <td colSpan={7} className="py-1 px-4 text-right italic border-r border-slate-50">Tax Details —&gt;</td>
                    <td colSpan={2} className="py-1 px-4 border-r border-slate-50">CGST <span className="text-slate-600 font-bold ml-1">₹{(item.gstA / 2).toFixed(2)}</span></td>
                    <td colSpan={2} className="py-1 px-4 border-r border-slate-50">SGST <span className="text-slate-600 font-bold ml-1">₹{(item.gstA / 2).toFixed(2)}</span></td>
                    <td className="bg-slate-100/10"></td>
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
          <div className="col-span-5 sm:col-span-12 bg-white p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">

              {/* Box 1: Tax breakdown & Round Off */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <h4 className="text-[15px] font-black text-blue-600 uppercase tracking-wider mb-2">Taxes & Adjustments</h4>
                <div className="flex justify-between items-center text-black">
                  <span className="font-bold">CGST</span>
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
                <div className="flex justify-between items-center text-slate-500">
                  <span className="font-bold">Total Gross</span>
                  <span className="font-bold">₹ {totals.totalGross.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-red-500">
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
              <label className="text-slate-500 font-black uppercase text-[10px] flex items-center gap-2">
                <CreditCard size={14} className="text-blue-600" /> Amount In Words
              </label>
              <div className="p-3 bg-white border-2 border-blue-100 text-blue-900 rounded-xl font-black uppercase text-[11px] tracking-wide shadow-inner text-center">
                Rupees {numberToWords(totals.invoiceTotal)} Only
              </div>

              <div className="bg-gradient-to-br from-emerald-700 to-emerald-900 text-white p-6 rounded-xl relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute left-[-10px] top-[-10px] opacity-10">
                  <CreditCard size={100} />
                </div>

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
      </div>

      <br />
      {/* SECONDARY INFO CARDS */}
      {/* --- UPDATED SECONDARY INFO CARDS SECTION --- */}
      <div className="grid grid-cols-2 gap-6">
        {/* UPDATED BANK & PAYMENT SETUP */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="font-black text-slate-800 uppercase tracking-tighter text-[11px] flex items-center gap-2">
              <Landmark size={14} className="text-indigo-600" /> Financial Settlement
            </h4>
            <span className="text-[8px] font-black px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full tracking-widest uppercase">Verified Gateway</span>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <span className="text-slate-400 font-bold uppercase text-[9px] tracking-widest block">Payment Mode</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'NEFT', icon: <Landmark size={16} />, label: 'Bank/NEFT' },
                  { id: 'CASH', icon: <CreditCard size={16} />, label: 'Cash' },
                  { id: 'UPI', icon: <Send size={16} />, label: 'UPI / QR' }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setPaymentMode(mode.id)}
                    className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border-2 transition-all active:scale-95 ${paymentMode === mode.id
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                      : 'border-slate-50 bg-slate-50/50 hover:border-slate-200 hover:bg-white'
                      }`}
                  >
                    <div className={paymentMode === mode.id ? 'text-indigo-600' : 'text-slate-400'}>{mode.icon}</div>
                    <span className={`text-[9px] font-black uppercase ${paymentMode === mode.id ? 'text-indigo-700' : 'text-slate-500'}`}>{mode.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="relative group overflow-hidden rounded-xl">
              <div className="flex items-center gap-3 bg-slate-900 p-3 border border-slate-800 group-hover:border-indigo-500 transition-all cursor-pointer">
                <div className="bg-slate-800 p-2 rounded-lg text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <Landmark size={16} />
                </div>
                <div className="flex-1">
                  <span className="text-slate-500 font-black uppercase text-[8px] tracking-[0.2em] block leading-none mb-1">Due Date (Deadline)</span>
                  <input type="date" className="w-full bg-transparent border-none p-0 focus:ring-0 font-black text-white text-[12px] cursor-pointer color-scheme-dark invert-[0.8]" defaultValue={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-indigo-500 group-hover:w-full transition-all duration-300"></div>
            </div>
          </div>
        </div>

        {/* UPDATED LOGISTICS SECTION */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="font-black text-slate-800 uppercase tracking-tighter text-[11px] flex items-center gap-2">
              <Truck size={14} className="text-orange-500" /> Logistics Intelligence
            </h4>
            <span className="text-[8px] font-black px-2 py-0.5 bg-orange-50 text-orange-600 rounded-full tracking-widest uppercase">Live Tracking</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-orange-500 transition-colors">
                <Truck size={16} />
              </div>
              <input className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-10 pr-4 font-bold text-slate-700 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 focus:bg-white outline-none transition-all text-[12px] placeholder:text-transparent" placeholder="Vehicle" />
              <label className="absolute left-10 top-2 text-[8px] font-black text-slate-400 uppercase tracking-widest pointer-events-none group-focus-within:text-orange-500 transition-all">Vehicle Number</label>
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-orange-500 transition-colors">
                <User size={16} />
              </div>
              <input className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-10 pr-4 font-bold text-slate-700 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 focus:bg-white outline-none transition-all text-[12px] placeholder:text-transparent" placeholder="Transporter" />
              <label className="absolute left-10 top-2 text-[8px] font-black text-slate-400 uppercase tracking-widest pointer-events-none group-focus-within:text-orange-500 transition-all">Transporter Name</label>
            </div>
          </div>
        </div>
      </div>
      <br />
      <div className="col-span-7 sm:col-span-12 p-6 bg-slate-50 border-r border-slate-200">
        <div className="h-full flex flex-col justify-end">
          <span className="text-slate-900 font-bold uppercase text-[15x] mb-2">Narration</span>
          <textarea className="w-full bg-white border border-slate-200 rounded-lg p-3 h-24 focus:ring-2 focus:ring-blue-400 outline-none text-slate-600" placeholder="Enter any additional information here..."></textarea>
        </div>
      </div>

      {/* FINAL ACTION BAR */}
      <div className="flex bg-slate-900/95 backdrop-blur-md text-white p-3 gap-3 items-center border-t border-slate-800  bottom-0 z-[100]">

        {/* PRIMARY ACTION: SAVE */}
        <button className="flex items-center gap-2.5 bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all shadow-lg shadow-blue-900/40 active:scale-95 border-t border-blue-400/30">
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
  );
};

export default Billing;
