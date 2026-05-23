import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import { Save, Printer, Mail, Send, Truck, XCircle, Plus, Trash2, MapPin, FileText, Search, Clock, Calendar, Hash, RefreshCcw, User, CreditCard, Landmark, ChevronDown, CheckCircleIcon, RotateCcw } from 'lucide-react';
import DatePicker from "react-datepicker";
import { usePayment } from "../contextapi/PaymentContext";
import { useToast } from "../contextapi/ToastContext";
import MultiTransaction from "../contextapi/MultiTransaction";
import { useLocation } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";
import axios from 'axios';

const PurchaseReturnV1 = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const invoiceFromList = location.state?.invoice;

    const [paymentMode, setPaymentMode] = useState('');
    const toast = useToast();
    const [invoiceDate, setInvoiceDate] = useState(new Date());
    const [invoiceTime, setInvoiceTime] = useState(new Date());
    const [supplierSearch, setSupplierSearch] = useState('');
    const [supplierSuggestions, setSupplierSuggestions] = useState([]);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [itemSearch, setItemSearch] = useState('');
    const [itemSuggestions, setItemSuggestions] = useState([]);
    const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
    const [showItemDropdown, setShowItemDropdown] = useState(false);
    const [invoiceNo, setInvoiceNo] = useState('');
    const [placeOfSupply, setPlaceOfSupply] = useState('Maharashtra');
    const [reverseCharge, setReverseCharge] = useState(false);
    const [transporterName, setTransporterName] = useState('');
    const [vehicleNumber, setVehicleNumber] = useState('');
    const [narration, setNarration] = useState('');
    const [returnAll, setReturnAll] = useState(false);
    const [clearAll, setClearAll] = useState(false);
    const screenKey = "purchase-return";
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

    const toggleEdit = (id) => {
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

    const numberToWords = (num) => {
        const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
        const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        const makeGroup = (n) => {
            let str = '';
            if (n > 99) { str += a[Math.floor(n / 100)] + 'Hundred '; n %= 100; }
            if (n > 19) { str += b[Math.floor(n / 10)] + ' ' + a[n % 10]; } else { str += a[n]; }
            return str;
        };
        if (num === 0) return 'Zero';
        let words = '';
        let crore = Math.floor(num / 10000000); num %= 10000000;
        let lakh = Math.floor(num / 100000); num %= 100000;
        let thousand = Math.floor(num / 1000); num %= 1000;
        let remaining = num;
        if (crore > 0) words += makeGroup(crore) + 'Crore ';
        if (lakh > 0) words += makeGroup(lakh) + 'Lakh ';
        if (thousand > 0) words += makeGroup(thousand) + 'Thousand ';
        if (remaining > 0) words += makeGroup(remaining);
        return words.trim();
    };

    const searchSuppliers = async (query) => {
        if (query.length < 3) { setSupplierSuggestions([]); return; }
        try {
            const response = await axios.get(`/api/supplier-master/search?q=${encodeURIComponent(query)}`);
            setSupplierSuggestions(response.data);
            setShowSupplierDropdown(true);
        } catch (error) {
            console.error('Error searching suppliers:', error);
            setSupplierSuggestions([]);
        }
    };

    const searchItems = async (query) => {
        if (query.length < 3) { setItemSuggestions([]); return; }
        try {
            const response = await axios.get(`/api/item-master/search?q=${encodeURIComponent(query)}`);
            setItemSuggestions(response.data);
            setShowItemDropdown(true);
        } catch (error) {
            console.error('Error searching items:', error);
            setItemSuggestions([]);
        }
    };

    const selectSupplier = (supplier) => {
        setSelectedSupplier(supplier);
        setSupplierSearch(supplier.supplierName || supplier.vendorName);
        setShowSupplierDropdown(false);
    };

    const selectItem = (index, item) => {
        const updatedItems = [...items];
        updatedItems[index] = {
            ...updatedItems[index],
            itemId: item.itemId,
            itemCode: item.itemCode,
            itemName: item.itemName,
            itemNameDetails: item.itemNameDetails,
            hsn: item.hsnCode,
            gstP: item.gstRate,
            rate: item.purchasePrice,
            batch: updatedItems[index].batch || 'BATCH01'
        };
        setItems(calculateTotals(updatedItems));
        setItemSearch('');
        setShowItemDropdown(false);
    };

    const [items, setItems] = useState([createEmptyRow()]);
    const [totals, setTotals] = useState({
        totalGross: 0, totalDisc: 0, totalTaxable: 0, totalGST: 0, invoiceTotal: 0, roundOff: 0
    });

    const calculateTotals = useCallback((currentItems) => {
        let tGross = 0, tDisc = 0, tGST = 0;
        const updatedItems = currentItems.map(item => {
            const gross = item.qty * item.rate;
            const discount = (gross * item.discP) / 100;
            const taxable = gross - discount;
            const taxAmount = (taxable * item.gstP) / 100;
            const total = taxable + taxAmount;
            tGross += gross; tDisc += discount; tGST += taxAmount;
            return { ...item, grossAmount: gross, discA: discount, taxableAmt: taxable, gstA: taxAmount, lineTotal: total };
        });
        const finalTotal = tGross - tDisc + tGST;
        const rounded = Math.round(finalTotal);
        setTotals({
            totalGross: tGross, totalDisc: tDisc, totalTaxable: tGross - tDisc,
            totalGST: tGST, invoiceTotal: rounded, roundOff: (rounded - finalTotal).toFixed(2)
        });
        return updatedItems;
    }, []);

    const handleItemChange = (index, field, value) => {
        const updatedItems = items.map((item, i) => i === index ? { ...item, [field]: value } : item);
        setItems(updatedItems);
    };

    const addNewRow = () => setItems([...items, createEmptyRow()]);
    const removeRow = (id) => { if (items.length > 1) setItems(calculateTotals(items.filter(item => item.id !== id))); };
    const handleKeyDown = (e, index) => { if (e.key === 'Tab' && !e.shiftKey && index === items.length - 1) addNewRow(); };

    const returnTotals = items.reduce((acc, item) => {
        const qty = Number(item.returnQty) || 0;
        const gross = item.rate * qty;
        const disc = gross * (Number(item.discP) / 100);
        const taxable = gross - disc;
        const gst = taxable * (Number(item.gstP) / 100);
        return { gross: acc.gross + gross, disc: acc.disc + disc, taxable: acc.taxable + taxable, gst: acc.gst + gst };
    }, { gross: 0, disc: 0, taxable: 0, gst: 0 });

    const isReturnActive = returnTotals.gross > 0;

    const getInvoicePurchaseByNumber = async (invNo) => {
        try {
            if (!invNo || invNo.length < 3) return;
            const response = await axios.get('/api/purchase-invoice/search-by-number', { params: { invoiceNo: invNo } });
            const data = response.data?.data || response.data;
            if (!data) return;

            const supplier = data.supplier || data.vendorMaster || null;
            setSelectedSupplier(supplier);
            const supplierName = supplier?.supplierName || supplier?.vendorName || data.supplierName || "";
            setSupplierSearch(supplierName);
            setShowSupplierDropdown(false);

            const apiInvoiceNo = data.invoiceNo || invNo;
            setInvoiceNo(apiInvoiceNo);
            setLoadedInvoiceNo(apiInvoiceNo);

            if (data.invoiceDate) setInvoiceDate(new Date(data.invoiceDate));
            if (data.placeOfSupply) setPlaceOfSupply(data.placeOfSupply);
            setReverseCharge(Boolean(data.reverseCharge));
            setTransporterName(data.transporterName || '');
            setVehicleNumber(data.vehicleNumber || '');
            setNarration(data.narration || '');

            const invoiceItems = data.invoiceItems || data.items || [];
            const mappedItems = invoiceItems.map((item) => ({
                id: Date.now() + Math.random(),
                invoiceItemId: item.invoiceItemId || item.id,
                itemId: item.itemId,
                itemName: item.itemName || item.item?.itemName || "",
                itemNameDetails: item.itemNameDetails || "",
                batch: item.batchCode || item.batch || "",
                hsn: item.hsnCode || item.hsn || "0000",
                rate: item.rate ?? 0,
                qty: item.quantity ?? item.qty ?? 0,
                returnQty: 0,
                grossAmount: item.grossAmount ?? 0,
                discP: item.discountPct ?? item.discP ?? 0,
                discA: item.discountAmt ?? item.discA ?? 0,
                taxableAmt: item.taxableAmount ?? item.taxableAmt ?? 0,
                gstP: item.gstRate ?? item.gstP ?? 0,
                gstA: (item.cgstAmt ?? 0) + (item.sgstAmt ?? 0),
                lineTotal: item.lineTotal ?? 0,
            }));

            const updatedItems = calculateTotals(mappedItems);
            setItems(updatedItems);
            if (data.balance) {
                setTotals(prev => ({
                    ...prev,
                    invoiceTotal: data.balance.invoiceAmount ?? prev.invoiceTotal,
                    roundOff: data.balance.roundOff?.toFixed(2) ?? prev.roundOff,
                }));
            }
            setOriginalInvoiceData(data);
            fetchReturnHistory(apiInvoiceNo);
        } catch (err) {
            console.log("ERROR:", err.response?.data || err.message);
        }
    };

    const fetchReturnHistory = async (invNo) => {
        try {
            setIsLoadingReturns(true);
            const response = await axios.get(`/api/purchase-invoice/${encodeURIComponent(invNo)}/returns`);
            const returns = response.data?.data || response.data || [];
            setReturnHistory(Array.isArray(returns) ? returns : []);
        } catch (err) {
            console.log("ERROR fetching return history:", err.response?.data || err.message);
            setReturnHistory([]);
        } finally {
            setIsLoadingReturns(false);
        }
    };

    useEffect(() => {
        if (invoiceFromList?.invoiceNo) {
            getInvoicePurchaseByNumber(invoiceFromList.invoiceNo);
        }
    }, [invoiceFromList]);

    const submitReturn = async () => {
        try {
            const invoiceNumberToUse = loadedInvoiceNo || invoiceNo;
            if (!invoiceNumberToUse) {
                toast.error('Invoice number is required. Please load a purchase invoice first.');
                return;
            }
            const returnItemLines = items
                .filter(item => item.returnQty > 0)
                .map(item => ({
                    invoiceItemId: item.invoiceItemId || item.itemId,
                    itemId: item.itemId,
                    batchCode: item.batch || 'BATCH01',
                    hsnCode: item.hsn || '0000',
                    quantity: item.returnQty,
                    rate: item.rate,
                    grossAmount: item.rate * item.returnQty,
                    discountPct: item.discP,
                    discountAmt: (item.rate * item.returnQty * item.discP) / 100,
                    taxableAmount: ((item.rate * item.returnQty) * (1 - item.discP / 100)),
                    gstRate: item.gstP,
                    cgstAmt: (((item.rate * item.returnQty) * (1 - item.discP / 100)) * item.gstP / 100) / 2,
                    sgstAmt: (((item.rate * item.returnQty) * (1 - item.discP / 100)) * item.gstP / 100) / 2,
                    igstAmt: 0,
                    lineTotal: ((item.rate * item.returnQty) * (1 - item.discP / 100)) * (1 + item.gstP / 100),
                }));

            if (returnItemLines.length === 0) {
                toast.error('Please select items to return');
                return;
            }

            const returnPayload = {
                invoiceNo: invoiceNumberToUse,
                returnNo: `PRTN-${new Date().getFullYear()}-${Date.now()}`,
                returnDate: new Date().toISOString().split('T')[0],
                returnType: 'PURCHASE_RETURN',
                reasonCode: returnReasonCode,
                reasonText: returnReasonText,
                remarks: returnRemarks,
                items: returnItemLines,
            };

            setIsSubmittingReturn(true);
            const response = await axios.post('/api/purchase-invoice/returns', returnPayload);

            if (response.status === 200 || response.status === 201) {
                toast.success('Purchase return submitted successfully!');
                setReturnReasonCode('DEFECT');
                setReturnReasonText('');
                setReturnRemarks('');
                const resetItems = items.map(item => ({ ...item, returnQty: 0 }));
                setItems(calculateTotals(resetItems));
                setReturnAll(false);
                fetchReturnHistory(invoiceNumberToUse);
            }
        } catch (err) {
            console.error('Error submitting purchase return:', err);
            toast.error(`Error submitting return: ${err.response?.data?.message || err.message}`);
        } finally {
            setIsSubmittingReturn(false);
        }
    };

    const getAvailableQuantity = (itemId) => {
        if (!originalInvoiceData?.items) return 0;
        const origItem = originalInvoiceData.items.find(i => i.itemId === itemId);
        if (!origItem) return 0;
        const totalReturned = (returnHistory || []).reduce((sum, ret) => {
            const returnedItem = ret.items?.find(i => i.itemId === itemId);
            return sum + (returnedItem?.quantity || 0);
        }, 0);
        return (origItem.quantity || 0) - totalReturned;
    };

    const adjustmentList = items.filter(item => item.returnQty > 0);
    const isAdjustmentActive = adjustmentList.length > 0;

    return (
        <div className="min-h-screen p-2 sm:p-4 md:p-3 text-[12px] font-poppins text-slate-700"
            style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 30%, #f1f5f9 100%)' }}>
            <div className="max-w-[1500px] mx-auto bg-white rounded-xl overflow-hidden border border-teal-200 shadow-xl shadow-teal-100/50">

                {/* ─── STICKY ACTION BAR ─── */}
                <div className="flex bg-gradient-to-r from-teal-900 via-teal-800 to-cyan-900 text-white p-3 gap-3 items-center top-0 z-50 border-b border-white/10 shadow-lg backdrop-blur-md">
                    <div className="flex items-center gap-3 pr-4 border-r border-teal-400/30 mr-2">
                        <div className="bg-gradient-to-br from-teal-400 to-cyan-600 p-2 rounded-xl shadow-inner ring-1 ring-white/20">
                            <RotateCcw size={20} className="text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold text-sm tracking-tight text-white uppercase font-poppins">
                                Purchase Return V1
                            </span>
                            <span className="text-[10px] text-teal-300 font-medium tracking-widest">Debit Note / Vendor Return</span>
                        </div>
                    </div>

                    {/* Badge */}
                    <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-teal-700/40 rounded-lg border border-teal-500/30">
                        {/* <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span> */}
                        {/* <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-widest">Purchase Module</span> */}
                        <button onClick={() => navigate("/purchase-return-list")}>
                            View List
                        </button>
                    </div>

                </div>

                {/* ─── HEADER SECTION ─── */}
                <div className="grid grid-cols-12 bg-gradient-to-br from-teal-50 via-cyan-50 to-white border border-teal-200 rounded-t-none overflow-hidden">
                    <div className="col-span-12 p-3 bg-teal-100/50 flex items-center justify-between border-b border-teal-200">
                        <div className="flex items-center gap-2">
                            <FileText size={14} className="text-teal-800" />
                            <span className="font-bold text-teal-800 uppercase tracking-wider text-[10px]">Purchase Invoice Header & Settings</span>
                        </div>
                    </div>

                    {/* 1. SEARCH PURCHASE INVOICE */}
                    <div className="col-span-12 md:col-span-3 p-4 border-r border-b border-teal-200/50 bg-white/40">
                        <label className="text-slate-500 font-bold uppercase block mb-1.5 text-[10px]">Search Purchase Invoice</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search size={14} className="text-teal-500" />
                            </div>
                            <input
                                type="text"
                                className="w-full border border-teal-200 rounded-md p-2 pl-9 bg-white font-bold outline-none shadow-sm focus:ring-2 focus:ring-teal-400 transition-all placeholder:font-normal placeholder:text-slate-300"
                                placeholder="Find purchase bill..."
                                onChange={(e) => {
                                    setInvoiceNo(e.target.value);
                                    getInvoicePurchaseByNumber(e.target.value);
                                }}
                            />
                        </div>
                    </div>

                    {/* 2. Invoice / Bill No */}
                    <div className="col-span-12 md:col-span-3 p-4 border-r border-b border-teal-200/50">
                        <label className="text-slate-500 font-bold uppercase block mb-1.5 text-[10px]">Bill No</label>
                        <input
                            type="text"
                            className="w-full border border-teal-200 rounded-md p-2 bg-white font-bold outline-none shadow-sm focus:ring-2 focus:ring-teal-400"
                            placeholder="BILL/2024/0001"
                            value={invoiceNo}
                            onChange={(e) => setInvoiceNo(e.target.value)}
                        />
                    </div>

                    {/* 3. Invoice Date */}
                    <div className="col-span-12 md:col-span-3 p-4 border-r border-b border-teal-200/50">
                        <label className="text-slate-500 font-bold uppercase block mb-1.5 text-[10px]">Bill Date</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                <Calendar size={16} className="text-slate-400" />
                            </div>
                            <DatePicker
                                selected={invoiceDate}
                                onChange={(date) => setInvoiceDate(date)}
                                dateFormat="dd MMM yyyy"
                                showYearDropdown showMonthDropdown dropdownMode="select"
                                className="w-full border border-teal-200 rounded-md p-2 pl-10 bg-white font-bold shadow-sm focus:ring-2 focus:ring-teal-400 outline-none h-[38px]"
                                calendarClassName="!rounded-xl !border !border-slate-200 shadow-xl"
                            />
                        </div>
                    </div>

                    {/* 4. Time */}
                    <div className="col-span-12 md:col-span-3 p-4 border-b border-teal-200/50">
                        <label className="text-slate-500 font-bold uppercase block mb-1.5 text-[10px]">Time</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                <Clock size={16} className="text-slate-400" />
                            </div>
                            <DatePicker
                                selected={invoiceTime}
                                onChange={(time) => setInvoiceTime(time)}
                                showTimeSelect showTimeSelectOnly timeIntervals={5}
                                timeCaption="Time" dateFormat="hh:mm aa"
                                className="w-full border border-teal-200 rounded-md p-2 pl-10 bg-white font-bold shadow-sm focus:ring-2 focus:ring-teal-400 outline-none h-[38px]"
                            />
                        </div>
                    </div>
                </div>

                {/* ─── SUPPLIER SECTION ─── */}
                <div className="border-t border-teal-200">
                    <div className="p-3 bg-teal-100/30 flex items-center justify-between border-b border-teal-200">
                        <div className="flex items-center gap-2">
                            <Landmark size={14} className="text-teal-600" />
                            <span className="font-bold text-teal-800 uppercase tracking-wider text-[10px]">
                                Supplier / Vendor Details
                            </span>
                        </div>

                        {/* RETURN ALL */}
                        <label className="ml-auto flex items-center gap-2 cursor-pointer justify-end">
                            <input
                                type="checkbox"
                                checked={returnAll}
                                onChange={(e) => {
                                    const checked = e.target.checked;
                                    setReturnAll(checked);
                                    if (checked) {
                                        setItems(items.map(item => ({ ...item, returnQty: item.qty })));
                                    }
                                }}
                                className="w-3.5 h-3.5 accent-teal-600"
                            />
                            <span className="text-[10px] font-bold uppercase text-teal-700 tracking-wide">Return All</span>
                        </label>

                        {/* CLEAR ALL */}
                        <label className="flex items-center gap-2 cursor-pointer ml-4">
                            <input
                                type="checkbox"
                                checked={clearAll}
                                onChange={(e) => {
                                    const checked = e.target.checked;
                                    setClearAll(checked);
                                    if (checked) {
                                        setItems(items.map(item => ({ ...item, returnQty: 0 })));
                                        setReturnAll(false);
                                        setTimeout(() => setClearAll(false), 300);
                                    }
                                }}
                                className="w-3.5 h-3.5 accent-red-500"
                            />
                            <span className="text-[10px] font-bold uppercase text-red-600 tracking-wide">Clear All</span>
                        </label>
                    </div>

                    <div className="grid grid-cols-12 gap-0">
                        {/* Supplier ID */}
                        <div className="col-span-12 md:col-span-2 p-4 border-r border-b border-teal-200/50 bg-slate-50/30">
                            <label className="text-slate-500 font-bold uppercase block mb-1.5 text-[10px]">Supplier ID</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    className="w-full border border-teal-200 rounded-md p-2 pl-8 bg-white outline-none shadow-sm transition-all focus:ring-2 focus:ring-teal-400"
                                    placeholder="VEND-001"
                                />
                                <Hash size={14} className="absolute left-2.5 top-3 text-slate-400" />
                            </div>
                        </div>

                        {/* Supplier Name */}
                        <div className="col-span-12 md:col-span-4 p-4 border-r border-b border-teal-200/50">
                            <label className="text-slate-500 font-bold uppercase block mb-1.5 text-[10px]">Supplier / Vendor Name</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    className="w-full border border-teal-200 rounded-md p-2 pl-8 bg-white focus:ring-2 focus:ring-teal-400 outline-none shadow-sm transition-all font-bold"
                                    placeholder="Search or enter vendor..."
                                    value={supplierSearch}
                                    onChange={(e) => { setSupplierSearch(e.target.value); searchSuppliers(e.target.value); }}
                                    onFocus={() => supplierSuggestions.length > 0 && setShowSupplierDropdown(true)}
                                    onBlur={() => setTimeout(() => setShowSupplierDropdown(false), 200)}
                                />
                                <Landmark size={14} className="absolute left-2.5 top-3 text-slate-400" />
                                {showSupplierDropdown && supplierSuggestions.length > 0 && (
                                    <div className="absolute z-10 w-full bg-white border border-teal-200 rounded-md shadow-lg max-h-40 overflow-y-auto mt-1">
                                        {supplierSuggestions.map((supplier, index) => (
                                            <div
                                                key={index}
                                                className="p-2 hover:bg-teal-50 cursor-pointer border-b border-teal-100 last:border-b-0"
                                                onClick={() => selectSupplier(supplier)}
                                            >
                                                <div className="font-bold">{supplier.supplierName || supplier.vendorName}</div>
                                                <div className="text-sm text-slate-500">{supplier.gstin} - {supplier.state}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Place of Supply */}
                        <div className="col-span-12 md:col-span-3 p-4 border-r border-b border-teal-200/50">
                            <label className="text-slate-500 font-bold uppercase block mb-1.5 text-[10px]">Place of Supply</label>
                            <input
                                type="text"
                                className="w-full border border-teal-200 rounded-md p-2 bg-white outline-none shadow-sm focus:ring-2 focus:ring-teal-400"
                                value={placeOfSupply}
                                onChange={(e) => setPlaceOfSupply(e.target.value)}
                            />
                        </div>

                        {/* Reverse Charge */}
                        <div className="col-span-12 md:col-span-3 p-4 border-b border-teal-200/50 flex items-center gap-3 bg-teal-50/20">
                            <input
                                type="checkbox"
                                checked={reverseCharge}
                                onChange={(e) => setReverseCharge(e.target.checked)}
                                className="w-4 h-4 accent-teal-600"
                            />
                            <div>
                                <label className="text-slate-700 font-bold uppercase block text-[10px]">Reverse Charge</label>
                                <span className="text-[9px] text-slate-400">Applicable under GST</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── ITEM GRID SECTION ─── */}
                <div className="overflow-x-auto rounded-none border-t border-teal-200 shadow-sm bg-white">
                    <table className="w-full border-collapse">
                        <thead className="bg-gradient-to-r from-teal-950 via-teal-900 to-cyan-950 text-teal-400 text-[10px] text-left uppercase tracking-[0.15em] font-bold antialiased border-b border-teal-800">
                            <tr className="divide-x divide-teal-800/50">
                                <th className="p-4 w-14 text-center">Sr.</th>
                                <th className="p-4 min-w-[280px] text-white">Item Description / Barcode</th>
                                <th className="p-4 w-28 text-center">Batch</th>
                                <th className="p-4 w-32 text-center text-teal-200 bg-teal-900/40">Rate</th>
                                <th className="p-4 w-20 text-center text-teal-200 bg-teal-900/40">Qty</th>
                                <th className="p-4 w-20 text-center text-cyan-300">Avail Qty</th>
                                <th className="p-4 w-28 text-center text-orange-300">Return QTY</th>
                                <th className="p-4 w-32 text-center opacity-60">Gross Amt</th>
                                <th className="p-4 w-24 text-center text-teal-400">Disc %</th>
                                <th className="p-4 w-32 text-center text-teal-200 bg-teal-900/60">Taxable Val</th>
                                <th className="p-4 w-24 text-center">GST %</th>
                                <th className="p-4 w-36 text-center bg-cyan-500/10 text-cyan-400 font-black border-l border-cyan-500/20">Total Amount</th>
                                <th className="p-4 w-28 text-center">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="bg-[#f8fffe] divide-y divide-teal-100">
                            {items.map((item, idx) => (
                                <React.Fragment key={item.id}>
                                    <tr className="group hover:bg-teal-50/40 transition-all duration-200 ease-in-out">
                                        <td className="p-3 text-center text-slate-400 font-mono text-[11px] border-r border-teal-100/50">{idx + 1}</td>

                                        <td className="p-1 border-r border-teal-100/50 group-hover:bg-teal-50/30">
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

                                        <td className="p-1 border-r border-teal-100/50">
                                            <input
                                                className="w-full bg-transparent border-none text-center text-[12px] text-slate-500 font-medium outline-none"
                                                type="text"
                                                value={item.batch || ''}
                                                placeholder="-"
                                            />
                                        </td>

                                        <td className="p-1 border-r border-teal-100/50 bg-teal-50/20 font-poppins">
                                            <input
                                                className="w-full bg-transparent border-none text-right text-[14px] text-slate-900 font-mono font-medium focus:bg-white focus:shadow-inner rounded transition-all outline-none pr-3"
                                                type="text"
                                                value={item.rate === 0 ? '' : item.rate}
                                            />
                                        </td>

                                        <td className="p-1 border-r border-teal-100/50 bg-teal-50/20">
                                            <input
                                                className="w-full bg-transparent border-none text-right text-[14px] text-slate-900 font-mono font-bold focus:bg-white focus:shadow-inner rounded transition-all outline-none pr-3"
                                                type="text"
                                                value={item.qty === 0 ? '' : item.qty}
                                            />
                                        </td>

                                        <td className="p-3 text-right font-mono font-bold text-cyan-600 text-[12px] border-r border-teal-100/50 bg-cyan-50/20">
                                            {getAvailableQuantity(item.itemId) || item.qty}
                                        </td>

                                        <td className="p-1 border-r border-teal-100/50 bg-orange-50/20">
                                            <input
                                                className={`w-full bg-transparent border-none text-right text-[14px] font-mono font-black transition-all outline-none pr-3 
                                                    ${editingId === item.id ? 'text-orange-600' : 'text-slate-400 cursor-not-allowed'}`}
                                                type="number"
                                                min="0"
                                                disabled={editingId !== item.id}
                                                value={item.returnQty === 0 ? '' : item.returnQty}
                                                onChange={(e) => {
                                                    let val = Number(e.target.value);
                                                    const availableQty = getAvailableQuantity(item.itemId);
                                                    if (val < 0) val = 0;
                                                    if (val > availableQty) val = availableQty;
                                                    handleItemChange(idx, 'returnQty', val);
                                                }}
                                            />
                                        </td>

                                        <td className="p-3 text-right text-slate-400 font-poppins text-[12px] border-r border-teal-100/50">
                                            {item.grossAmount ? item.grossAmount.toFixed(2) : "0.00"}
                                        </td>

                                        <td className="p-1 border-r border-teal-100/50">
                                            <input
                                                className="w-full bg-transparent border-none text-right text-[13px] text-slate-500 font-mono outline-none pr-3"
                                                placeholder="0.00"
                                                value={item.discP}
                                            />
                                        </td>

                                        <td className="p-3 text-right font-bold text-slate-600 text-[12px] border-r border-teal-100/50 bg-teal-100/20">
                                            {Number(item.taxableAmt ?? 0).toFixed(2)}
                                        </td>

                                        <td className="p-1 border-r border-teal-100/50">
                                            <input
                                                className="w-full bg-transparent border-none text-right text-[14px] font-bold text-slate-700 outline-none pr-3"
                                                value={item.gstP}
                                            />
                                        </td>

                                        <td className="p-3 text-right font-mono font-black text-cyan-700 text-[14px] bg-cyan-50/30 border-l border-cyan-100">
                                            {item.lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </td>

                                        <td className="p-2 text-center">
                                            <button
                                                onClick={() => toggleEdit(item.id)}
                                                className={`p-2 rounded-xl transition-all duration-200 ${editingId === item.id
                                                    ? 'text-teal-600 bg-teal-50 shadow-sm scale-110'
                                                    : 'text-slate-300 hover:text-orange-500 hover:bg-orange-50'
                                                    }`}
                                            >
                                                {editingId === item.id ? (
                                                    <CheckCircleIcon size={18} />
                                                ) : (
                                                    <RotateCcw size={18} />
                                                )}
                                            </button>
                                        </td>
                                    </tr>

                                    {/* Tax Breakdown Sub-row */}
                                    <tr className="bg-white/50 text-[10px] text-slate-400 border-b border-teal-100/60">
                                        <td colSpan={3} className="py-2 px-6 text-right font-bold tracking-tight border-r border-teal-50 uppercase italic">
                                            {item.returnQty > 0 ? "Return Breakdown" : "Tax Breakdown"}
                                        </td>
                                        <td colSpan={2} className="py-2 px-4 border-r border-teal-50">
                                            Disc: <span className="text-slate-900 font-bold ml-1">
                                                ₹{((item.discP / 100) * (item.rate * (item.returnQty || item.qty))).toFixed(2)}
                                            </span>
                                        </td>
                                        {(() => {
                                            const activeQty = item.returnQty > 0 ? item.returnQty : item.qty;
                                            const taxable = (item.rate * activeQty) * (1 - (item.discP / 100));
                                            const totalGst = taxable * (item.gstP / 100);
                                            const splitGst = (totalGst / 2).toFixed(2);
                                            return (
                                                <>
                                                    <td colSpan={2} className="py-2 px-4 border-r border-teal-50">
                                                        CGST <span className={`${item.returnQty > 0 ? 'text-orange-600' : 'text-slate-900'} font-bold ml-1`}>
                                                            ₹{splitGst}
                                                        </span>
                                                    </td>
                                                    <td colSpan={2} className="py-2 px-4 border-r border-teal-50">
                                                        SGST <span className={`${item.returnQty > 0 ? 'text-orange-600' : 'text-slate-900'} font-bold ml-1`}>
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

                {/* ─── SUMMARY FOOTER ─── */}
                <div className="grid grid-cols-12 border-t border-teal-200 w-full bg-white">
                    <div className="col-span-12 p-6 font-poppins space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Box 1: Tax Breakdown */}
                            <div className={`p-5 rounded-xl border transition-all duration-300 space-y-4 ${isReturnActive ? 'bg-orange-50/50 border-orange-200' : 'bg-teal-50 border-teal-200'}`}>
                                <h4 className={`text-[11px] font-black uppercase tracking-widest mb-2 border-b pb-2 ${isReturnActive ? 'text-orange-600 border-orange-200' : 'text-teal-600 border-teal-200'}`}>
                                    {isReturnActive ? 'Return Tax Adjustments (Debit Note)' : 'Taxes & Adjustments'}
                                </h4>
                                <div className="flex gap-4">
                                    <div className="flex-1 flex flex-col">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase">Total CGST</span>
                                        <span className={`font-bold text-base ${isReturnActive ? 'text-orange-700' : 'text-black'}`}>
                                            ₹ {(isReturnActive ? returnTotals.gst / 2 : totals.totalGST / 2).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex-1 flex flex-col border-l border-slate-200 pl-4">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase">Total SGST</span>
                                        <span className={`font-bold text-base ${isReturnActive ? 'text-orange-700' : 'text-black'}`}>
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
                                        <span className={`text-[10px] font-bold uppercase ${isReturnActive ? 'text-orange-400' : 'text-teal-500'}`}>Round Off</span>
                                        <span className="font-bold text-black text-base">{totals.roundOff}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Box 2: Billing Totals */}
                            <div className={`p-5 rounded-xl border transition-all duration-300 space-y-4 ${isReturnActive ? 'bg-orange-50/30 border-orange-100' : 'bg-teal-50/30 border-teal-100'}`}>
                                <h4 className={`text-[11px] font-black uppercase tracking-widest mb-2 border-b pb-2 ${isReturnActive ? 'text-orange-600 border-orange-100' : 'text-teal-600 border-teal-100'}`}>
                                    {isReturnActive ? 'Debit Note Financials' : 'Purchase Totals'}
                                </h4>
                                <div className="flex gap-4">
                                    <div className="flex-1 flex flex-col">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase">Total Gross</span>
                                        <span className="font-bold text-slate-900 text-base">
                                            ₹ {(isReturnActive ? returnTotals.gross : totals.totalGross).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className={`flex-1 flex flex-col border-l pl-4 ${isReturnActive ? 'border-orange-100' : 'border-teal-100'}`}>
                                        <span className="text-[10px] text-green-600 font-bold uppercase">Total Disc</span>
                                        <span className="font-bold text-green-700 text-base">
                                            −₹ {(isReturnActive ? returnTotals.disc : totals.totalDisc).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                                <div className={`flex gap-4 pt-2 border-t ${isReturnActive ? 'border-orange-100' : 'border-teal-100'}`}>
                                    <div className="flex-1 flex flex-col">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase">Taxable Amt</span>
                                        <span className="font-bold text-slate-700 text-base">
                                            ₹ {(isReturnActive ? returnTotals.taxable : totals.totalTaxable).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className={`flex-1 flex flex-col border-l pl-4 ${isReturnActive ? 'border-orange-100' : 'border-teal-100'}`}>
                                        <span className="text-[10px] text-teal-500 font-bold uppercase">Total GST</span>
                                        <span className="font-bold text-teal-600 text-base">
                                            +₹ {(isReturnActive ? returnTotals.gst : totals.totalGST).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Final Amount Bar */}
                        <div
                            onClick={() => {
                                localStorage.setItem("activePaymentScreen", screenKey);
                                setShowPaymentModal(true);
                            }}
                            className={`w-full p-6 rounded-2xl relative overflow-hidden cursor-pointer hover:shadow-xl transition-all active:scale-[0.99] group ${isReturnActive
                                ? 'bg-gradient-to-r from-orange-800 via-orange-700 to-amber-800 shadow-orange-900/20'
                                : 'bg-gradient-to-r from-teal-800 via-teal-700 to-cyan-800 shadow-teal-900/20'
                                }`}
                        >
                            <div className="relative z-10 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-white/10 rounded-xl backdrop-blur-md border border-white/20 group-hover:bg-white/20 transition-colors">
                                        {isReturnActive ? <RotateCcw size={32} className="text-white" /> : <CreditCard size={32} className="text-white" />}
                                    </div>
                                    <div>
                                        <span className="block text-[11px] font-black uppercase tracking-[0.3em] text-white opacity-80">
                                            {isReturnActive ? 'Total Debit Note Amount' : 'Purchase Bill Payable'}
                                        </span>
                                        <p className="text-white/60 text-[10px] font-medium">
                                            {isReturnActive ? 'Click to process Debit Note to vendor' : 'Click to proceed with payment'}
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

                {/* ─── ADJUSTMENT / DEBIT NOTE SUMMARY ─── */}
                {isAdjustmentActive && (
                    <div className="mt-10 px-6 pb-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-8 bg-teal-600 rounded-full shadow-[0_0_10px_rgba(13,148,136,0.5)]"></div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Debit Note Details</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Adjustment for returned purchase stock</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-teal-50 border border-teal-100 rounded-lg">
                                <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></span>
                                <span className="text-teal-700 text-[11px] font-black uppercase tracking-tighter">
                                    {adjustmentList.length} Reversal {adjustmentList.length === 1 ? 'Line' : 'Lines'}
                                </span>
                            </div>
                        </div>

                        <div className="relative overflow-hidden rounded-3xl bg-white/50 backdrop-blur-sm border border-teal-200 shadow-xl shadow-teal-100/50">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-100/50 blur-3xl -mr-16 -mt-16 rounded-full"></div>

                            <table className="w-full border-collapse relative z-10">
                                <thead>
                                    <tr className="border-b border-teal-100">
                                        <th className="p-6 text-center w-20"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Index</span></th>
                                        <th className="p-6 text-left"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Particulars</span></th>
                                        <th className="p-6 text-center"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Qty</span></th>
                                        <th className="p-6 text-right"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Taxable Value</span></th>
                                        <th className="p-6 text-right"><span className="text-[10px] font-bold text-teal-400 uppercase tracking-tighter">GST Reversal</span></th>
                                        <th className="p-6 text-right">
                                            <div className="inline-block px-4 py-1 bg-teal-600 rounded-full">
                                                <span className="text-[10px] font-bold text-white uppercase tracking-widest text-center block">Sub-Total</span>
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-teal-50">
                                    {adjustmentList.map((entry, index) => {
                                        const taxableCredit = (entry.rate * entry.returnQty) * (1 - (entry.discP / 100));
                                        const gstCredit = taxableCredit * (entry.gstP / 100);
                                        const rowTotal = taxableCredit + gstCredit;
                                        return (
                                            <tr key={`adj-${entry.id}`} className="hover:bg-teal-50/30 transition-colors">
                                                <td className="py-1 px-6 text-center font-mono text-[10px] text-slate-400">{String(index + 1).padStart(2, '0')}</td>
                                                <td className="py-1 px-6">
                                                    <div className="font-bold text-slate-700 text-xs leading-tight">{entry.itemName}</div>
                                                    <div className="flex gap-2 mt-0.5">
                                                        <span className="text-[8px] text-slate-400 font-bold uppercase">BATCH: {entry.batch || 'N/A'}</span>
                                                    </div>
                                                </td>
                                                <td className="py-1 px-6 text-center">
                                                    <div className="text-[10px] font-black text-slate-600 bg-white border border-teal-100 w-7 h-7 flex items-center justify-center rounded-lg mx-auto shadow-sm">
                                                        {entry.returnQty}
                                                    </div>
                                                </td>
                                                <td className="py-1 px-6 text-right font-mono text-[10px] text-slate-500">₹{taxableCredit.toFixed(2)}</td>
                                                <td className="py-1 px-6 text-right font-mono text-[10px] text-teal-500 font-semibold">+ ₹{gstCredit.toFixed(2)}</td>
                                                <td className="py-1 px-6 text-right">
                                                    <span className="text-xs font-bold text-slate-800 tracking-tight">
                                                        ₹{rowTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                <tfoot className="border-t-2 border-teal-100">
                                    <tr className="bg-teal-50/30">
                                        <td colSpan={5} className="py-2 px-6 text-right">
                                            <span className="text-[10px] font-bold text-teal-900/60 uppercase tracking-widest">Net Debit Value</span>
                                        </td>
                                        <td className="py-2 px-6 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="text-sm font-black text-teal-700 tabular-nums">
                                                    ₹{adjustmentList.reduce((sum, entry) => {
                                                        const tax = (entry.rate * entry.returnQty) * (1 - (entry.discP / 100));
                                                        return sum + (tax * (1 + entry.gstP / 100));
                                                    }, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </span>
                                                <div className="w-12 h-0.5 bg-teal-600 mt-0.5 rounded-full shadow-[0_1px_4px_rgba(13,148,136,0.3)]"></div>
                                            </div>
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                )}

                {/* ─── RETURN REASON SECTION ─── */}
                <div className="grid grid-cols-12 border-b border-teal-200/50 bg-teal-50/20">
                    <div className="col-span-12 md:col-span-3 p-4 border-r border-teal-200/50">
                        <label className="text-slate-500 font-bold uppercase block mb-1.5 text-[10px]">Return Reason Code</label>
                        <select
                            className="w-full border border-teal-200 rounded-md p-2 bg-white outline-none shadow-sm focus:ring-2 focus:ring-teal-400"
                            value={returnReasonCode}
                            onChange={(e) => setReturnReasonCode(e.target.value)}
                        >
                            <option value="DEFECT">Defect</option>
                            <option value="DAMAGE">Damage</option>
                            <option value="EXPIRY">Expiry</option>
                            <option value="QUALITY">Quality Issue</option>
                            <option value="EXCESS">Excess Stock</option>
                            <option value="WRONG_ITEM">Wrong Item</option>
                            <option value="SHORT_SUPPLY">Short Supply</option>
                            <option value="PRICE_DIFF">Price Difference</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>
                    <div className="col-span-12 md:col-span-4 p-4 border-r border-teal-200/50">
                        <label className="text-slate-500 font-bold uppercase block mb-1.5 text-[10px]">Return Reason Description</label>
                        <input
                            type="text"
                            className="w-full border border-teal-200 rounded-md p-2 bg-white outline-none shadow-sm focus:ring-2 focus:ring-teal-400"
                            placeholder="Detailed reason for purchase return..."
                            value={returnReasonText}
                            onChange={(e) => setReturnReasonText(e.target.value)}
                        />
                    </div>
                    <div className="col-span-12 md:col-span-5 p-4">
                        <label className="text-slate-500 font-bold uppercase block mb-1.5 text-[10px]">Return Remarks / Debit Note Remarks</label>
                        <input
                            type="text"
                            className="w-full border border-teal-200 rounded-md p-2 bg-white outline-none shadow-sm focus:ring-2 focus:ring-teal-400"
                            placeholder="Additional remarks..."
                            value={returnRemarks}
                            onChange={(e) => setReturnRemarks(e.target.value)}
                        />
                    </div>
                </div>

                {/* ─── RETURN HISTORY ─── */}
                {returnHistory && returnHistory.length > 0 && (
                    <div className="grid grid-cols-12 border-b border-teal-200 bg-teal-50/30">
                        <div className="col-span-12 p-4">
                            <h3 className="font-bold text-teal-800 mb-3 text-sm uppercase flex items-center gap-2">
                                <RefreshCcw size={14} />
                                Purchase Return History
                            </h3>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {returnHistory.map((ret, idx) => (
                                    <div key={idx} className="bg-white p-3 rounded-lg border border-teal-100 text-xs">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className="font-bold text-teal-700">{ret.returnNo}</span>
                                                <span className="text-slate-500 ml-2">{ret.returnDate}</span>
                                            </div>
                                            <span className="text-teal-600 font-bold bg-teal-50 px-2 py-0.5 rounded">{ret.reasonCode}</span>
                                        </div>
                                        <div className="text-slate-600 mt-1">{ret.reasonText}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── SHIPPING & LOGISTICS ─── */}
                <div className="grid grid-cols-12 border-b border-teal-200/50">
                    <div className="col-span-12 md:col-span-3 p-4 border-r border-teal-200/50">
                        <label className="text-slate-500 font-bold uppercase block mb-1.5 text-[10px]">Transporter Name</label>
                        <div className="relative">
                            <input
                                type="text"
                                className="w-full border border-teal-200 rounded-md p-2 pl-8 bg-white outline-none shadow-sm focus:ring-2 focus:ring-teal-400"
                                placeholder="Transporter..."
                                value={transporterName}
                                onChange={(e) => setTransporterName(e.target.value)}
                            />
                            <Truck size={14} className="absolute left-2.5 top-3 text-slate-400" />
                        </div>
                    </div>
                    <div className="col-span-12 md:col-span-3 p-4 border-r border-teal-200/50">
                        <label className="text-slate-500 font-bold uppercase block mb-1.5 text-[10px]">Vehicle Number</label>
                        <input
                            type="text"
                            className="w-full border border-teal-200 rounded-md p-2 bg-white outline-none shadow-sm focus:ring-2 focus:ring-teal-400"
                            placeholder="MH-12-AB-1234"
                            value={vehicleNumber}
                            onChange={(e) => setVehicleNumber(e.target.value)}
                        />
                    </div>
                    <div className="col-span-12 md:col-span-3 p-4 border-r border-teal-200/50">
                        <label className="text-slate-500 font-bold uppercase block mb-1.5 text-[10px]">Contact Person</label>
                        <div className="relative">
                            <input type="text" className="w-full border border-teal-200 rounded-md p-2 pl-8 bg-white outline-none shadow-sm focus:ring-2 focus:ring-teal-400" placeholder="In-charge name" />
                            <User size={14} className="absolute left-2.5 top-3 text-slate-400" />
                        </div>
                    </div>
                    <div className="col-span-12 md:col-span-3 p-4 bg-teal-50/20">
                        <label className="text-slate-500 font-bold uppercase block mb-1.5 text-[10px]">Shipping State</label>
                        <input type="text" className="w-full border border-teal-200 rounded-md p-2 bg-white outline-none shadow-sm focus:ring-2 focus:ring-teal-400" placeholder="Maharashtra" />
                    </div>
                </div>

                {/* ─── NARRATION ─── */}
                <div className="col-span-7 sm:col-span-12 p-6 bg-teal-50/30 border-t border-teal-100">
                    <div className="h-full flex flex-col justify-end">
                        <span className="text-slate-700 font-bold uppercase text-[11px] mb-2 tracking-widest">Narration / Internal Notes</span>
                        <textarea
                            className="w-full bg-white border border-teal-200 rounded-lg p-3 h-24 focus:ring-2 focus:ring-teal-400 outline-none text-slate-600"
                            placeholder="Enter any additional information about this purchase return..."
                            value={narration}
                            onChange={(e) => setNarration(e.target.value)}
                        ></textarea>
                    </div>
                </div>

                {/* ─── FINAL ACTION BAR ─── */}
                <div className="col-span-12 flex bg-teal-950/95 backdrop-blur-md text-white p-3 gap-3 items-center border-t border-teal-800 bottom-0 z-[100]">

                    {/* PRIMARY: SUBMIT RETURN */}
                    <button
                        className="flex items-center gap-2.5 bg-gradient-to-b from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all shadow-lg shadow-teal-900/40 active:scale-95 border-t border-teal-400/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={submitReturn}
                        disabled={isSubmittingReturn}
                    >
                        <Save size={16} strokeWidth={2.5} />
                        {isSubmittingReturn ? 'Submitting...' : 'Submit Purchase Return'}
                    </button>

                    <button className="flex items-center gap-2.5 bg-teal-900 hover:bg-teal-800 px-4 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-wider border border-teal-700 transition-all active:bg-teal-950">
                        <Printer size={16} className="text-teal-400" />
                        Save & Print
                    </button>

                    <button className="flex items-center gap-2.5 bg-teal-900 hover:bg-teal-800 px-4 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-wider border border-teal-700 transition-all">
                        <Mail size={16} className="text-teal-400" />
                        Email to Vendor
                    </button>

                    <div className="h-6 w-[1px] bg-teal-700 mx-2" />

                    <button className="flex items-center gap-2.5 bg-cyan-600/10 hover:bg-cyan-600 text-cyan-400 hover:text-white px-4 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest border border-cyan-500/30 transition-all shadow-xl shadow-cyan-900/10">
                        <Send size={16} />
                        e-Invoice
                    </button>

                    <button className="flex items-center gap-2.5 bg-amber-600/10 hover:bg-amber-600 text-amber-500 hover:text-white px-4 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest border border-amber-500/30 transition-all shadow-xl shadow-amber-900/10">
                        <Truck size={16} />
                        e-Way Bill
                    </button>

                    <button className="flex items-center gap-2.5 text-teal-500 hover:text-red-400 hover:bg-red-500/10 px-4 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-wider ml-auto transition-all group">
                        <XCircle size={16} className="group-hover:rotate-90 transition-transform duration-300" />
                        Cancel
                    </button>
                </div>
            </div>

            {showPaymentModal && (
                <MultiTransaction
                    totals={isReturnActive
                        ? { invoiceTotal: returnTotals.taxable + returnTotals.gst }
                        : totals
                    }
                />
            )}
        </div>
    );
};

export default PurchaseReturnV1;