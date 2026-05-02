import React, { useState, useEffect, useCallback } from 'react';
import { Save, Printer, Mail, Send, Truck, XCircle, Plus, Trash2, MapPin, FileText, Search, Clock, Calendar, Hash, RefreshCcw, User, CreditCard, Landmark, ChevronDown } from 'lucide-react';
import DatePicker from "react-datepicker";
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import { usePayment } from "../contextapi/PaymentContext";
import MultiTransaction from "../contextapi/MultiTransaction";
import "react-datepicker/dist/react-datepicker.css";
import axios from 'axios';
const BillingReturnV4 = () => {
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
    // from MultiTransaction Context
    const { showPaymentModal, setShowPaymentModal } = usePayment();

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
                <div className="flex bg-gradient-to-r from-rose-800 via-rose-700 to-rose-900 text-white p-3 gap-3 items-center top-0 z-50 border-b border-white/10 shadow-lg backdrop-blur-md">                    {/* Left Section: Icon & Label */}
                    <div className="flex items-center gap-3 pr-4 border-r border-rose-400/30 mr-2">
                        <div className="bg-gradient-to-br from-rose-400 to-rose-600 p-2 rounded-xl shadow-inner ring-1 ring-white/20">
                            <RefreshCcw size={20} className="text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold text-sm tracking-tight text-white uppercase font-poppins">
                                Billing Return V4
                            </span>

                        </div>
                    </div>
                </div>

                {/* HEADER SECTION */}
                <div className="grid grid-cols-12 bg-gradient-to-br from-amber-50 via-yellow-50 to-white border border-amber-200 rounded-t-xl overflow-hidden">                    {/* Section Title with Global Search Visual */}
                    <div className="col-span-12 p-3 bg-amber-100/50 flex items-center justify-between border-b border-amber-200">
                        <div className="flex items-center gap-2">
                            <FileText size={14} className="text-amber-800" />
                            <span className="font-bold text-amber-800 uppercase tracking-wider text-[10px]">Invoice Header & Settings</span>
                        </div>

                    </div>

                    {/* 1. SEARCH / LINK INVOICE (New Section) */}
                    <div className="col-span-12 md:col-span-3 p-4 border-r border-b border-amber-200/50 bg-white/40">
                        <label className="text-slate-500 font-bold uppercase block mb-1.5 text-[10px]">Search Original Inv</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search size={14} className="text-amber-500" />
                            </div>
                            <input
                                type="text"
                                className="w-full border border-amber-200 rounded-md p-2 pl-9 bg-white font-bold outline-none shadow-sm focus:ring-2 focus:ring-amber-400 transition-all placeholder:font-normal placeholder:text-slate-300"
                                placeholder="Find invoice..."
                            // value={searchQuery}
                            // onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* 2. Invoice No */}
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

                    {/* 3. Invoice Date */}
                    <div className="col-span-12 md:col-span-3 p-4 border-r border-b border-amber-200/50">
                        <label className="text-slate-500 font-bold uppercase block mb-1.5 text-[10px]">Invoice Date</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                <Calendar size={16} className="text-slate-400" />
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

                    {/* 4. Time */}
                    <div className="col-span-12 md:col-span-3 p-4 border-b border-amber-200/50">
                        <label className="text-slate-500 font-bold uppercase block mb-1.5 text-[10px]">Time</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                <Clock size={16} className="text-slate-400" />
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

                    </div>
                </div>

                {/* ITEM GRID SECTION */}
                <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm bg-white">
                    <table className="w-full border-collapse">
                        {/* THEAD SECTION: Using a Professional Deep Slate */}
                        <thead className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-slate-400 text-[10px] text-left uppercase tracking-[0.15em] font-bold antialiased border-b border-slate-700">                            <tr className="divide-x divide-slate-700/50">
                            <th className="p-4 w-14 text-center">Sr.</th>

                            {/* Item Description: High contrast text */}
                            <th className="p-4 min-w-[280px] text-white">
                                Item Description / Barcode
                            </th>

                            <th className="p-4 w-28 text-center">Batch</th>

                            {/* Editable Sections: Muted Slate backgrounds to signify "Input Areas" */}
                            <th className="p-4 w-32 text-center text-slate-200 bg-slate-800/40">Rate</th>
                            <th className="p-4 w-20 text-center text-slate-200 bg-slate-800/40">Qty</th>
                            <th className="p-4 w-28 text-center text-rose-300">Return QTY</th>

                            <th className="p-4 w-32 text-center opacity-60">Gross Amt</th>

                            <th className="p-4 w-24 text-center text-slate-400">Disc %</th>

                            {/* Taxable: Subtle Indigo tint for technical data */}
                            <th className="p-4 w-32 text-center text-slate-200 bg-slate-800/60">Taxable Val</th>

                            <th className="p-4 w-24 text-center">GST %</th>

                            {/* Total: Emerald accent for finality */}
                            <th className="p-4 w-36 text-center bg-emerald-500/10 text-emerald-400 font-black border-l border-emerald-500/20">
                                Total Amount
                            </th>

                            <th className="p-4 w-28 text-center">Actions</th>
                        </tr>
                        </thead>

                        <tbody className="bg-[#f8fafc] divide-y divide-slate-200">
                            {items.map((item, idx) => (
                                <React.Fragment key={item.id}>
                                    <tr className="group hover:bg-white transition-all duration-200 ease-in-out">
                                        {/* Index Column */}
                                        <td className="p-3 text-center text-slate-400 font-mono text-[11px] border-r border-slate-200/50">{idx + 1}</td>

                                        {/* Item Name: Clean Typography */}
                                        <td className="p-1 border-r border-slate-200/50 group-hover:bg-blue-50/30">
                                            <div className="relative px-2">
                                                <input
                                                    className="w-full bg-transparent border-none focus:ring-0 rounded py-1 text-[13.5px] text-slate-700 placeholder:text-slate-300 font-semibold tracking-tight outline-none"
                                                    type="text"
                                                    value={item.itemName}
                                                    onChange={(e) => handleItemChange(idx, 'itemName', e.target.value)}
                                                    placeholder="Enter product name..."
                                                />
                                            </div>
                                        </td>

                                        {/* Batch */}
                                        <td className="p-1 border-r border-slate-200/50">
                                            <input
                                                className="w-full bg-transparent border-none text-center text-[12px] text-slate-500 font-medium outline-none"
                                                type="text"
                                                value={item.batch || ''}
                                                placeholder="-"
                                            />
                                        </td>

                                        {/* Rate & Qty: Premium Input Focus */}
                                        <td className="p-1 border-r border-slate-200/50 bg-slate-100/30">
                                            <input
                                                className="w-full bg-transparent border-none text-right text-[14px] text-slate-900 font-mono font-medium focus:bg-white focus:shadow-inner rounded transition-all outline-none pr-3"
                                                type="text"
                                                value={item.rate === 0 ? '' : item.rate}
                                            />
                                        </td>

                                        <td className="p-1 border-r border-slate-200/50 bg-slate-100/30">
                                            <input
                                                className="w-full bg-transparent border-none text-right text-[14px] text-slate-900 font-mono font-bold focus:bg-white focus:shadow-inner rounded transition-all outline-none pr-3"
                                                type="text"
                                                value={item.qty === 0 ? '' : item.qty}
                                            />
                                        </td>

                                        {/* Return Qty: Rose Highlight */}
                                        <td className="p-1 border-r border-slate-200/50 bg-rose-50/20">
                                            <input
                                                className="w-full bg-transparent border-none text-right text-[14px] text-rose-600 font-mono font-black focus:bg-white rounded transition-all outline-none pr-3"
                                                type="text"
                                                value={item.hsn}
                                            />
                                        </td>

                                        {/* Gross (Read Only) */}
                                        <td className="p-3 text-right text-slate-400 font-mono text-[12px] border-r border-slate-200/50">
                                            {item.grossAmount.toFixed(2)}
                                        </td>

                                        {/* Discount % */}
                                        <td className="p-1 border-r border-slate-200/50">
                                            <input
                                                className="w-full bg-transparent border-none text-right text-[13px] text-slate-500 font-mono outline-none pr-3"
                                                placeholder="0.00"
                                                value={item.discP}
                                            />
                                        </td>

                                        {/* Taxable */}
                                        <td className="p-3 text-right font-bold text-slate-600 text-[12px] border-r border-slate-200/50 bg-slate-200/20">
                                            {item.taxableAmt.toFixed(2)}
                                        </td>

                                        {/* GST % */}
                                        <td className="p-1 border-r border-slate-200/50">
                                            <input
                                                className="w-full bg-transparent border-none text-right text-[14px] font-bold text-slate-700 outline-none pr-3"
                                                value={item.gstP}
                                            />
                                        </td>

                                        {/* Line Total: Modern Emerald State */}
                                        <td className="p-3 text-right font-mono font-black text-emerald-600 text-[14px] bg-emerald-50/30 border-l border-emerald-100">
                                            {item.lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </td>

                                        {/* Actions */}
                                        <td className="p-2 text-center">
                                            <button className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all duration-200">
                                                <KeyboardReturnIcon size={18} />
                                            </button>
                                        </td>
                                    </tr>

                                    {/* Detailed Tax Breakdown Row: Muted "Ghost" Row */}
                                    <tr className="bg-white/50 text-[10px] text-slate-400 border-b border-slate-200/60">
                                        <td colSpan={3} className="py-2 px-6 text-right font-bold tracking-tight border-r border-slate-100">
                                            BREAKDOWN
                                        </td>
                                        <td colSpan={2} className="py-2 px-4 border-r border-slate-100 italic">
                                            Disc: <span className="text-slate-900 font-mono ml-1">₹120.00</span>
                                        </td>
                                        <td colSpan={2} className="py-2 px-4 border-r border-slate-100">
                                            CGST <span className="text-slate-900 font-bold ml-1">₹{(item.gstA / 2).toFixed(2)}</span>
                                        </td>
                                        <td colSpan={2} className="py-2 px-4 border-r border-slate-100">
                                            SGST <span className="text-slate-900 font-bold ml-1">₹{(item.gstA / 2).toFixed(2)}</span>
                                        </td>
                                        <td colSpan={3} className="bg-slate-50/50 px-4">
                                            <span className="text-[9px] uppercase tracking-tighter opacity-50">Invoice Ref: INV-2024-01</span>
                                        </td>
                                    </tr>
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* SUMMARY FOOTER */}
                {/* SUMMARY FOOTER - FULL WIDTH REFINED */}
                <div className="grid grid-cols-12 border-t border-slate-200 w-full bg-white">

                    <div className="col-span-12 p-6 font-poppins space-y-6">

                        {/* TOP ROW: Breakdown Boxes (Taxes & Billing) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Box 1: Tax breakdown & Round Off */}
                            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
                                <h4 className="text-[11px] font-black text-blue-600 uppercase tracking-widest mb-2 border-b border-slate-200 pb-2">Taxes & Adjustments</h4>

                                <div className="flex gap-4">
                                    <div className="flex-1 flex flex-col">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase">Total CGST</span>
                                        <span className="font-bold text-black text-base">₹ {(totals.totalGST / 2).toFixed(2)}</span>
                                    </div>
                                    <div className="flex-1 flex flex-col border-l border-slate-200 pl-4">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase">Total SGST</span>
                                        <span className="font-bold text-black text-base">₹ {(totals.totalGST / 2).toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-2 border-t border-slate-200/60">
                                    <div className="flex-1 flex flex-col">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase">Total IGST</span>
                                        <span className="font-bold text-black text-base">₹ 0.00</span>
                                    </div>
                                    <div className="flex-1 flex flex-col border-l border-slate-200 pl-4">
                                        <span className="text-[10px] text-rose-500 font-bold uppercase">Round Off</span>
                                        <span className="font-bold text-black text-base">{totals.roundOff}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Box 2: Core Financial Totals */}
                            <div className="bg-blue-50/30 p-5 rounded-xl border border-blue-100 space-y-4">
                                <h4 className="text-[11px] font-black text-blue-600 uppercase tracking-widest mb-2 border-b border-blue-100 pb-2">Billing Totals</h4>

                                <div className="flex gap-4">
                                    <div className="flex-1 flex flex-col">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase">Total Gross</span>
                                        <span className="font-bold text-slate-900 text-base">₹ {totals.totalGross.toFixed(2)}</span>
                                    </div>
                                    <div className="flex-1 flex flex-col border-l border-blue-100 pl-4">
                                        <span className="text-[10px] text-green-600 font-bold uppercase">Total Disc</span>
                                        <span className="font-bold text-green-700 text-base">−₹ {totals.totalDisc.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-2 border-t border-blue-100">
                                    <div className="flex-1 flex flex-col">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase">Taxable Amt</span>
                                        <span className="font-bold text-slate-700 text-base">₹ {totals.totalTaxable.toFixed(2)}</span>
                                    </div>
                                    <div className="flex-1 flex flex-col border-l border-blue-100 pl-4">
                                        <span className="text-[10px] text-blue-500 font-bold uppercase">Total GST</span>
                                        <span className="font-bold text-blue-600 text-base">+₹ {totals.totalGST.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* BOTTOM ROW: Full Width Final Amount Section */}
                        <div
                            onClick={() => setShowPaymentModal(true)}
                            className="w-full bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-900 text-white p-6 rounded-2xl relative overflow-hidden cursor-pointer hover:shadow-xl hover:shadow-emerald-900/20 transition-all active:scale-[0.99] group"
                        >
                            <div className="relative z-10 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-white/10 rounded-xl backdrop-blur-md border border-white/20 group-hover:bg-white/20 transition-colors">
                                        <CreditCard size={32} />
                                    </div>
                                    <div>
                                        <span className="block text-[11px] font-black uppercase tracking-[0.3em] text-emerald-100 opacity-80">
                                            Invoice Payable Amount
                                        </span>
                                        <p className="text-emerald-50/60 text-[10px] font-medium">Click to proceed with payment splitting</p>
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

                            {/* Subtle glass effect decor */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
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
                        <input type="text" class="w-full border border-amber-200 rounded-md p-2 bg-white outline-none shadow-sm" placeholder="Maharashtra" />
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

            {showPaymentModal && <MultiTransaction totals={totals} />}
        </div>
    );
};

export default BillingReturnV4;