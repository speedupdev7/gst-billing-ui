import React, { useState, useEffect, useCallback } from 'react';
import { Save, Printer, Mail, Send, Truck, XCircle, Plus, Trash2, MapPin, FileText, Search, Clock, Calendar, Hash, RefreshCcw, User, CreditCard, Landmark, ChevronDown, CheckCircleIcon, RotateCcw } from 'lucide-react';
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
    // Add this at the top of your component
    const [editingId, setEditingId] = useState(null);

    const toggleEdit = (id) => {
        // If clicking the same button twice, it closes (disables) the row
        setEditingId(prevId => prevId === id ? null : id);
    };
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
        const updatedItems = items.map((item, i) => {
            if (i === index) {
                return {
                    ...item,
                    [field]: value
                };
            }
            return item;
        });

        setItems(updatedItems);
    };

    const addNewRow = () => setItems([...items, createEmptyRow()]);
    const removeRow = (id) => { if (items.length > 1) setItems(calculateTotals(items.filter(item => item.id !== id))); };
    const handleKeyDown = (e, index) => { if (e.key === 'Tab' && !e.shiftKey && index === items.length - 1) addNewRow(); };

    // Calculate total values for the items being returned
    const returnTotals = items.reduce((acc, item) => {
        const qty = Number(item.returnQty) || 0;
        const gross = item.rate * qty;
        const disc = gross * (Number(item.discP) / 100);
        const taxable = gross - disc;
        const gst = taxable * (Number(item.gstP) / 100);

        return {
            gross: acc.gross + gross,
            disc: acc.disc + disc,
            taxable: acc.taxable + taxable,
            gst: acc.gst + gst,
        };
    }, { gross: 0, disc: 0, taxable: 0, gst: 0 });

    const isReturnActive = returnTotals.gross > 0;
    // Get API calling  
    const getInvoiceByNumber = async (invNo) => {
        try {
            if (!invNo || invNo.length < 3) return;

            const response = await axios.get('/api/invoice/search-by-number', {
                params: { invoiceNo: invNo }
            });

            const data = response.data;
            if (!data) return;

            // 🔥 CUSTOMER AUTO FILL
            setSelectedCustomer(data.customer);

            const customerName =
                data.customer?.customerName ||
                data.customer?.name ||
                "";

            setCustomerSearch(customerName);

            // 🔥 dropdown close kar
            setShowCustomerDropdown(false);

            // 🔥 ITEMS
            const mappedItems = data.items.map((item) => ({
                id: Date.now() + Math.random(),
                itemId: item.itemId,
                itemName: item.itemName || item.item?.itemName || "",
                batch: item.batchCode || item.batch || "",
                rate: item.rate ?? 0,
                qty: item.quantity ?? 0,
                returnQty: 0,
                grossAmount: item.grossAmount ?? 0,
                discP: item.discountPct ?? 0,
                discA: item.discountAmt ?? 0,
                taxableAmt: item.taxableAmount ?? 0,
                gstP: item.gstRate ?? 0,
                gstA: (item.cgstAmt ?? 0) + (item.sgstAmt ?? 0),
                lineTotal: item.lineTotal ?? 0,
            }));

            setItems(mappedItems);

        } catch (err) {
            console.log("ERROR:", err.response?.data);
        }
    };
    // Return QTY table logic
    const adjustmentList = items.filter(item => item.returnQty > 0);
    const isAdjustmentActive = adjustmentList.length > 0;


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
                        <label className="text-slate-500 font-bold uppercase block mb-1.5 text-[10px]">Search Invoice</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search size={14} className="text-amber-500" />
                            </div>
                            <input
                                type="text"
                                className="w-full border border-amber-200 rounded-md p-2 pl-9 bg-white font-bold outline-none shadow-sm focus:ring-2 focus:ring-amber-400 transition-all placeholder:font-normal placeholder:text-slate-300"
                                placeholder="Find invoice..."
                                onChange={(e) => {
                                    setInvoiceNo(e.target.value);
                                    getInvoiceByNumber(e.target.value);
                                }}
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
                                        <td className="p-1 border-r border-slate-200/50 bg-slate-100/30 font-poppins">
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

                                        <td className="p-1 border-r border-slate-200/50 bg-rose-50/20">
                                            <input
                                                className={`w-full bg-transparent border-none text-right text-[14px] font-mono font-black transition-all outline-none pr-3 
            ${editingId === item.id ? 'text-rose-600' : 'text-slate-400 cursor-not-allowed'}`}
                                                type="number"
                                                min="0"
                                                // THIS IS THE KEY PART
                                                disabled={editingId !== item.id}
                                                value={item.returnQty === 0 ? '' : item.returnQty}
                                                onChange={(e) => {
                                                    let val = Number(e.target.value);
                                                    if (val < 0) val = 0;
                                                    if (val > item.qty) val = item.qty;
                                                    handleItemChange(idx, 'returnQty', val);
                                                }}
                                            />
                                        </td>

                                        {/* Gross (Read Only) */}

                                        <td className="p-3 text-right text-slate-400 font-poppins text-[12px] border-r border-slate-200/50">
                                            {item.grossAmount ? item.grossAmount.toFixed(2) : "0.00"}
                                        </td>
                                        <td className="p-3 text-right text-slate-400 font-mono text-[12px] border-r border-slate-200/50">
                                            {Number(item.grossAmount ?? 0).toFixed(2)}

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
                                            {Number(item.taxableAmt ?? 0).toFixed(2)}
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
                                            <button
                                                onClick={() => toggleEdit(item.id)}
                                                className={`p-2 rounded-xl transition-all duration-200 ${editingId === item.id
                                                    ? 'text-emerald-600 bg-emerald-50 shadow-sm scale-110'
                                                    : 'text-slate-300 hover:text-rose-500 hover:bg-rose-50'
                                                    }`}
                                            >
                                                {/* Change icon based on state */}
                                                {editingId === item.id ? (
                                                    <CheckCircleIcon size={18} /> // Show "Done" icon when editing
                                                ) : (
                                                    <RotateCcw size={18} /> // Show "Return" icon normally
                                                )}
                                            </button>
                                        </td>
                                    </tr>

                                    {/* Detailed Tax Breakdown Row */}
                                    <tr className="bg-white/50 text-[10px] text-slate-400 border-b border-slate-200/60">
                                        <td colSpan={3} className="py-2 px-6 text-right font-bold tracking-tight border-r border-slate-100 uppercase italic">
                                            {item.returnQty > 0 ? "Return Breakdown" : "Tax Breakdown"}
                                        </td>

                                        {/* Dynamic Discount (Adjust if you have a discount per unit logic) */}
                                        <td colSpan={2} className="py-2 px-4 border-r border-slate-100">
                                            Disc: <span className="text-slate-900 font-bold ml-1">
                                                ₹{((item.discP / 100) * (item.rate * (item.returnQty || item.qty))).toFixed(2)}
                                            </span>
                                        </td>

                                        {/* CGST & SGST Logic */}
                                        {(() => {
                                            // Calculate taxable amount based on Return Qty (fallback to original Qty if 0)
                                            const activeQty = item.returnQty > 0 ? item.returnQty : item.qty;
                                            const taxable = (item.rate * activeQty) * (1 - (item.discP / 100));
                                            const totalGst = taxable * (item.gstP / 100);
                                            const splitGst = (totalGst / 2).toFixed(2);

                                            return (
                                                <>
                                                    <td colSpan={2} className="py-2 px-4 border-r border-slate-100">
                                                        CGST <span className={`${item.returnQty > 0 ? 'text-rose-600' : 'text-slate-900'} font-bold ml-1`}>
                                                            ₹{splitGst}
                                                        </span>
                                                    </td>
                                                    <td colSpan={2} className="py-2 px-4 border-r border-slate-100">
                                                        SGST <span className={`${item.returnQty > 0 ? 'text-rose-600' : 'text-slate-900'} font-bold ml-1`}>
                                                            ₹{splitGst}
                                                        </span>
                                                    </td>

                                                </>
                                            );
                                        })()}
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

                        {/* TOP ROW: Breakdown Boxes */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Box 1: Tax breakdown */}
                            <div className={`p-5 rounded-xl border transition-all duration-300 space-y-4 ${isReturnActive ? 'bg-rose-50/50 border-rose-200' : 'bg-slate-50 border-slate-200'}`}>
                                <h4 className={`text-[11px] font-black uppercase tracking-widest mb-2 border-b pb-2 ${isReturnActive ? 'text-rose-600 border-rose-200' : 'text-blue-600 border-slate-200'}`}>
                                    {isReturnActive ? 'Return Tax Adjustments' : 'Taxes & Adjustments'}
                                </h4>

                                <div className="flex gap-4">
                                    <div className="flex-1 flex flex-col">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase">Total CGST</span>
                                        <span className={`font-bold text-base ${isReturnActive ? 'text-rose-700' : 'text-black'}`}>
                                            ₹ {(isReturnActive ? returnTotals.gst / 2 : totals.totalGST / 2).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex-1 flex flex-col border-l border-slate-200 pl-4">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase">Total SGST</span>
                                        <span className={`font-bold text-base ${isReturnActive ? 'text-rose-700' : 'text-black'}`}>
                                            ₹ {(isReturnActive ? returnTotals.gst / 2 : totals.totalGST / 2).toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-2 border-t border-slate-200/60">
                                    <div className="flex-1 flex flex-col">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase">Total IGST</span>
                                        <span className="font-bold text-black text-base">₹ 0.00</span>
                                    </div>
                                    <div className="flex-1 flex flex-col border-l border-slate-200 pl-4">
                                        <span className={`text-[10px] font-bold uppercase ${isReturnActive ? 'text-rose-400' : 'text-rose-500'}`}>Round Off</span>
                                        <span className="font-bold text-black text-base">{totals.roundOff}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Box 2: Billing Totals */}
                            <div className={`p-5 rounded-xl border transition-all duration-300 space-y-4 ${isReturnActive ? 'bg-rose-50/30 border-rose-100' : 'bg-blue-50/30 border-blue-100'}`}>
                                <h4 className={`text-[11px] font-black uppercase tracking-widest mb-2 border-b pb-2 ${isReturnActive ? 'text-rose-600 border-rose-100' : 'text-blue-600 border-blue-100'}`}>
                                    {isReturnActive ? 'Return Financials' : 'Billing Totals'}
                                </h4>

                                <div className="flex gap-4">
                                    <div className="flex-1 flex flex-col">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase">Total Gross</span>
                                        <span className="font-bold text-slate-900 text-base">
                                            ₹ {(isReturnActive ? returnTotals.gross : totals.totalGross).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className={`flex-1 flex flex-col border-l pl-4 ${isReturnActive ? 'border-rose-100' : 'border-blue-100'}`}>
                                        <span className="text-[10px] text-green-600 font-bold uppercase">Total Disc</span>
                                        <span className="font-bold text-green-700 text-base">
                                            −₹ {(isReturnActive ? returnTotals.disc : totals.totalDisc).toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                <div className={`flex gap-4 pt-2 border-t ${isReturnActive ? 'border-rose-100' : 'border-blue-100'}`}>
                                    <div className="flex-1 flex flex-col">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase">Taxable Amt</span>
                                        <span className="font-bold text-slate-700 text-base">
                                            ₹ {(isReturnActive ? returnTotals.taxable : totals.totalTaxable).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className={`flex-1 flex flex-col border-l pl-4 ${isReturnActive ? 'border-rose-100' : 'border-blue-100'}`}>
                                        <span className="text-[10px] text-blue-500 font-bold uppercase">Total GST</span>
                                        <span className="font-bold text-blue-600 text-base">
                                            +₹ {(isReturnActive ? returnTotals.gst : totals.totalGST).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* BOTTOM ROW: Final Amount Section */}
                        <div
                            onClick={() => setShowPaymentModal(true)}
                            className={`w-full p-6 rounded-2xl relative overflow-hidden cursor-pointer hover:shadow-xl transition-all active:scale-[0.99] group ${isReturnActive
                                ? 'bg-gradient-to-r from-rose-800 via-rose-700 to-rose-900 shadow-rose-900/20'
                                : 'bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-900 shadow-emerald-900/20'
                                }`}
                        >
                            <div className="relative z-10 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-white/10 rounded-xl backdrop-blur-md border border-white/20 group-hover:bg-white/20 transition-colors">
                                        {isReturnActive ? <RotateCcw size={32} /> : <CreditCard size={32} />}
                                    </div>
                                    <div>
                                        <span className="block text-[11px] font-black uppercase tracking-[0.3em] text-white opacity-80">
                                            {isReturnActive ? 'Total Refund Amount' : 'Invoice Payable Amount'}
                                        </span>
                                        <p className="text-white/60 text-[10px] font-medium">
                                            {isReturnActive ? 'Click to process Credit Note' : 'Click to proceed with payment splitting'}
                                        </p>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="flex items-end justify-end gap-1 text-white">
                                        <span className="text-2xl font-light text-white/70 mb-1.5">₹</span>
                                        <span className="text-5xl font-black tracking-tighter">
                                            {(isReturnActive ? (returnTotals.taxable + returnTotals.gst) : totals.invoiceTotal).toLocaleString('en-IN')}
                                        </span>
                                        <span className="text-2xl font-black mb-1.5 opacity-90">.00</span>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                        </div>
                    </div>
                </div>

                {/* PLACE THIS BELOW YOUR FINAL AMOUNT SECTION */}
                {isAdjustmentActive && (
                    <div className="mt-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-8 bg-rose-600 rounded-full shadow-[0_0_10px_rgba(225,29,72,0.5)]"></div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Credit Note Details</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Adjustment for returned stock</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 border border-rose-100 rounded-lg">
                                <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
                                <span className="text-rose-700 text-[11px] font-black uppercase tracking-tighter">
                                    {adjustmentList.length} Reversal {adjustmentList.length === 1 ? 'Line' : 'Lines'}
                                </span>
                            </div>
                        </div>

                        {/* Soft & Modern Adjustment Table */}
                        <div className="mt-12 group animate-in fade-in zoom-in-95 duration-500">
                            <div className="flex items-end justify-between mb-5 px-2">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded">
                                        Adjustment Ledger
                                    </span>
                                    <h3 className="text-2xl font-light text-slate-800 font-poppins">
                                        Credit <span className="font-bold text-indigo-600"></span> Summary
                                    </h3>
                                </div>

                            </div>

                            <div className="relative overflow-hidden rounded-3xl bg-white/50 backdrop-blur-sm border border-slate-200 shadow-xl shadow-slate-200/50">
                                {/* Subtle Decorative Gradient Flare */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100/50 blur-3xl -mr-16 -mt-16 rounded-full"></div>

                                <table className="w-full border-collapse relative z-10">
                                    <thead>
                                        <tr className="border-b border-slate-100">
                                            <th className="p-6 text-center w-20">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Index</span>
                                            </th>
                                            <th className="p-6 text-left">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Particulars</span>
                                            </th>
                                            <th className="p-6 text-center">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Qty</span>
                                            </th>
                                            <th className="p-6 text-right">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Taxable Value</span>
                                            </th>
                                            <th className="p-6 text-right">
                                                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter">GST Credit</span>
                                            </th>
                                            <th className="p-6 text-right">
                                                <div className="inline-block px-4 py-1 bg-indigo-600 rounded-full">
                                                    <span className="text-[10px] font-bold text-white uppercase tracking-widest text-center block">Sub-Total</span>
                                                </div>
                                            </th>
                                        </tr>
                                    </thead>

                                    {/* Adjustment Rows */}
                                    <tbody className="divide-y divide-slate-50">
                                        {adjustmentList.map((entry, index) => {
                                            const taxableCredit = (entry.rate * entry.returnQty) * (1 - (entry.discP / 100));
                                            const gstCredit = taxableCredit * (entry.gstP / 100);
                                            const rowTotal = taxableCredit + gstCredit;

                                            return (
                                                <tr key={`adj-${entry.id}`} className="hover:bg-indigo-50/30 transition-colors">
                                                    {/* Reduced padding from p-6 to py-1 px-6 */}
                                                    <td className="py-1 px-6 text-center font-mono text-[10px] text-slate-400">
                                                        {String(index + 1).padStart(2, '0')}
                                                    </td>

                                                    <td className="py-1 px-6">
                                                        {/* Shrunk text sizes to keep row height small */}
                                                        <div className="font-bold text-slate-700 text-xs leading-tight">{entry.itemName}</div>
                                                        <div className="flex gap-2 mt-0.5">
                                                            <span className="text-[8px] text-slate-400 font-bold uppercase">
                                                                BATCH: {entry.batch || 'N/A'}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    <td className="py-1 px-6 text-center">
                                                        {/* Shrunk the Qty box size */}
                                                        <div className="text-[10px] font-black text-slate-600 bg-white border border-slate-100 w-7 h-7 flex items-center justify-center rounded-lg mx-auto shadow-sm">
                                                            {entry.returnQty}
                                                        </div>
                                                    </td>

                                                    <td className="py-1 px-6 text-right font-mono text-[10px] text-slate-500">
                                                        ₹{taxableCredit.toFixed(2)}
                                                    </td>

                                                    <td className="py-1 px-6 text-right font-mono text-[10px] text-indigo-500 font-semibold">
                                                        + ₹{gstCredit.toFixed(2)}
                                                    </td>

                                                    <td className="py-1 px-6 text-right">
                                                        {/* Shrunk total text size */}
                                                        <span className="text-xs font-bold text-slate-800 tracking-tight">
                                                            ₹{rowTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                    <tfoot className="border-t-2 border-slate-100">
                                        <tr className="bg-indigo-50/30">
                                            {/* Reduced padding from p-8 to py-2 px-6 */}
                                            <td colSpan={5} className="py-2 px-6 text-right">
                                                <span className="text-[10px] font-bold text-indigo-900/60 uppercase tracking-widest">
                                                    Net Credit Value
                                                </span>
                                            </td>
                                            <td className="py-2 px-6 text-right">
                                                <div className="flex flex-col items-end">
                                                    {/* Reduced font size from text-3xl to text-sm */}
                                                    <span className="text-sm font-black text-indigo-700 tabular-nums">
                                                        ₹{adjustmentList.reduce((sum, entry) => {
                                                            const tax = (entry.rate * entry.returnQty) * (1 - (entry.discP / 100));
                                                            return sum + (tax * (1 + entry.gstP / 100));
                                                        }, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                    </span>
                                                    {/* Shrunk the accent line to match the smaller text */}
                                                    <div className="w-12 h-0.5 bg-indigo-600 mt-0.5 rounded-full shadow-[0_1px_4px_rgba(79,70,229,0.3)]"></div>
                                                </div>
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            <div className="mt-6 flex justify-center">

                            </div>
                        </div>
                    </div>
                )}
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

            {showPaymentModal && (
                <MultiTransaction
                    totals={isReturnActive
                        ? {
                            invoiceTotal: returnTotals.taxable + returnTotals.gst
                        }
                        : totals
                    }
                />
            )}
        </div>
    );
};

export default BillingReturnV4;