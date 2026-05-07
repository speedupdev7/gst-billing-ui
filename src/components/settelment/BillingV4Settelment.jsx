import React, { useState } from "react";
import {
    Save,
    Printer,
    Mail,
    Send,
    XCircle,
    Plus,
    FileText,
    Search,
    User,
    CreditCard,
    CalendarDays,
} from "lucide-react";
import DatePicker from "react-datepicker";
import MultiTransaction from "../contextapi/MultiTransaction";
import { usePayment } from "../contextapi/PaymentContext";

const SettlementV1 = () => {
    const { setShowPaymentModal } = usePayment();
    const [settlementNo, setSettlementNo] = useState("SET-2026-001");
    const [settlementDate, setSettlementDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [customerSearch, setCustomerSearch] = useState("");
    const [narration, setNarration] = useState("");

    const createEmptyRow = () => ({
        id: Date.now() + Math.random(),
        invoiceNo: "",
        invoiceDate: "",
        billAmount: "",
        paidAmount: "",
        balanceAmount: "",
        settlementAmount: "",
        paymentMode: "Cash",
    });

    const [items, setItems] = useState([
        {
            id: 1,
            invoiceNo: "INV-1001",
            invoiceDate: "2026-05-07",
            billAmount: 15000,
            paidAmount: 10000,
            balanceAmount: 5000,
            settlementAmount: 5000,
            paymentMode: "Cash",
        },
    ]);

    const handleItemChange = (index, field, value) => {
        const updated = [...items];
        updated[index][field] = value;
        setItems(updated);
    };

    const addNewRow = () => {
        setItems([...items, createEmptyRow()]);
    };

    const removeRow = (id) => {
        if (items.length === 1) return;
        setItems(items.filter((item) => item.id !== id));
    };

    const totals = {
        totalInvoice: items.reduce((sum, item) => sum + Number(item.billAmount || 0), 0),
        totalPaid: items.reduce((sum, item) => sum + Number(item.paidAmount || 0), 0),
        totalBalance: items.reduce((sum, item) => sum + Number(item.balanceAmount || 0), 0),
        totalSettlement: items.reduce((sum, item) => sum + Number(item.settlementAmount || 0), 0),
    };

    return (
        /* Added min-w-fit to prevent content crushing on tablet-sized drawer overlaps */
        <div className="min-h-screen p-3 md:p-4 text-[12px] font-sans text-slate-700 bg-slate-100 antialiased">
            <div className="max-w-[1600px] mx-auto bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm flex flex-col">

                {/* HEADER */}
                <div className="flex bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-white p-4 gap-3 items-center border-b border-white/10 shadow-lg">
                    <div className="flex items-center gap-3 pr-4 border-r border-white/20 mr-2">
                        <div className="bg-amber-900/40 p-2 rounded-xl backdrop-blur-sm border border-white/10">
                            <FileText size={20} className="text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-sm tracking-tight uppercase">Customer Settlement</span>
                            <span className="text-[10px] text-amber-100 uppercase font-medium">Adjustment Entry</span>
                        </div>
                    </div>
                </div>

                {/* FORM HEADER SECTION - Optimized for Tablet (2x2 Grid on md) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 bg-amber-50/30">
                    <div className="col-span-full p-3 bg-amber-100/50 flex items-center gap-2 border-b border-amber-200">
                        <FileText size={14} className="text-amber-800" />
                        <span className="font-bold text-amber-800 uppercase tracking-wider text-[10px]">Settlement Header & Settings</span>
                    </div>

                    <div className="p-4 border-r border-b border-amber-200/50">
                        <label className="text-slate-500 font-bold uppercase block mb-1.5 text-[10px]">Settlement No</label>
                        <input
                            type="text"
                            value={settlementNo}
                            onChange={(e) => setSettlementNo(e.target.value)}
                            className="w-full border border-amber-200 rounded-md p-2 bg-white font-bold outline-none focus:border-amber-500 transition-all shadow-sm"
                        />
                    </div>

                    <div className="p-4 border-r border-b border-amber-200/50">
                        <label className="text-slate-500 font-bold uppercase block mb-1.5 text-[10px]">Settlement Date</label>
                        <div className="relative">
                            <CalendarDays size={16} className="absolute left-3 top-2.5 text-slate-400" />
                            <DatePicker
                                type="date"
                                value={settlementDate}
                                onChange={(e) => setSettlementDate(e.target.value)}
                                className="w-full border border-amber-200 rounded-md p-2 pl-10 bg-white font-bold shadow-sm outline-none focus:border-amber-500 transition-all"
                            />
                        </div>
                    </div>

                    <div className="p-4 border-r border-b border-amber-200/50">
                        <label className="text-slate-500 font-bold uppercase block mb-1.5 text-[10px]">Customer Search</label>
                        <div className="relative">
                            <User size={14} className="absolute left-3 top-2.5 text-slate-400" />
                            <input
                                type="text"
                                value={customerSearch}
                                onChange={(e) => setCustomerSearch(e.target.value)}
                                placeholder="Search customer..."
                                className="w-full border border-amber-200 rounded-md p-2 pl-9 bg-white font-bold outline-none shadow-sm focus:border-amber-500"
                            />
                        </div>
                    </div>

                    <div className="p-4 border-b border-amber-200/50 lg:border-r-0">
                        <label className="text-slate-500 font-bold uppercase block mb-1.5 text-[10px]">Search Pending Invoice</label>
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-2.5 text-amber-500" />
                            <input
                                type="text"
                                placeholder="Find pending invoice..."
                                className="w-full border border-amber-200 rounded-md p-2 pl-9 bg-white font-bold outline-none shadow-sm focus:border-amber-500 text-slate-900"
                            />
                        </div>
                    </div>
                </div>

                {/* TABLE SECTION - Added horizontal scrolling with custom scrollbar */}
                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300">
                    <table className="w-full min-w-[900px]">
                        <thead className="bg-[#111111] text-slate-300 text-[11px] uppercase tracking-wider sticky top-0 z-10">
                            <tr>
                                <th className="p-4 text-center w-12">Sr.</th>
                                <th className="p-4 text-left">Invoice No</th>
                                <th className="p-4 text-center">Invoice Date</th>
                                <th className="p-4 text-center text-blue-300">Bill Amount</th>
                                <th className="p-4 text-center text-emerald-300">Paid Amount</th>
                                <th className="p-4 text-center text-red-300">Balance</th>
                                <th className="p-4 text-center text-yellow-300">Settlement</th>
                                <th className="p-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {items.map((item, idx) => (
                                <tr key={item.id} className="hover:bg-slate-50 transition-all">
                                    <td className="p-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                                    <td className="p-2">
                                        <input
                                            className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none font-semibold focus:border-amber-400"
                                            value={item.invoiceNo}
                                            onChange={(e) => handleItemChange(idx, "invoiceNo", e.target.value)}
                                        />
                                    </td>
                                    <td className="p-2">
                                        <input
                                            type="date"
                                            className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-amber-400"
                                            value={item.invoiceDate}
                                            onChange={(e) => handleItemChange(idx, "invoiceDate", e.target.value)}
                                        />
                                    </td>
                                    <td className="p-2">
                                        <input
                                            type="number"
                                            className="w-full bg-blue-50/50 border border-blue-100 rounded-lg py-2 text-center font-bold outline-none"
                                            value={item.billAmount}
                                            onChange={(e) => handleItemChange(idx, "billAmount", e.target.value)}
                                        />
                                    </td>
                                    <td className="p-2">
                                        <input
                                            type="number"
                                            className="w-full bg-emerald-50/50 border border-emerald-100 rounded-lg py-2 text-center font-bold text-emerald-700 outline-none"
                                            value={item.paidAmount}
                                            onChange={(e) => handleItemChange(idx, "paidAmount", e.target.value)}
                                        />
                                    </td>
                                    <td className="p-2">
                                        <input
                                            type="number"
                                            className="w-full bg-red-50/50 border border-red-100 rounded-lg py-2 text-center font-bold text-red-600 outline-none"
                                            value={item.balanceAmount}
                                            onChange={(e) => handleItemChange(idx, "balanceAmount", e.target.value)}
                                        />
                                    </td>
                                    <td className="p-2">
                                        <input
                                            type="number"
                                            className="w-full bg-yellow-50/50 border border-yellow-100 rounded-lg py-2 text-center font-bold text-yellow-700 outline-none"
                                            value={item.settlementAmount}
                                            onChange={(e) => handleItemChange(idx, "settlementAmount", e.target.value)}
                                        />
                                    </td>
                                    <td className="p-2 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => removeRow(item.id)}
                                                className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
                                            >
                                                <XCircle size={18} />
                                            </button>
                                            {idx === items.length - 1 && (
                                                <button
                                                    onClick={addNewRow}
                                                    className="p-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition-all shadow-md active:scale-95"
                                                >
                                                    <Plus size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* SETTLEMENT CARD (MODAL TRIGGER) - Responsive sizing for Tablet */}
                <div className="p-4 md:p-6">
                    <div
                        onClick={() => setShowPaymentModal(true)}
                        className="w-full bg-gradient-to-br from-amber-600 to-amber-800 text-white p-5 md:p-8 rounded-2xl relative overflow-hidden cursor-pointer hover:shadow-2xl hover:shadow-amber-900/30 transition-all active:scale-[0.98] group"
                    >
                        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-white/20 transition-all" />

                        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 group-hover:bg-white/20 transition-colors">
                                    <CreditCard size={32} className="text-white" />
                                </div>
                                <div>
                                    <span className="block text-[11px] font-black uppercase tracking-[0.2em] text-amber-50">Total Settlement Amount</span>
                                    <p className="text-amber-100/60 text-[10px] font-medium uppercase tracking-widest mt-0.5">Click to process payment methods</p>
                                </div>
                            </div>

                            <div className="text-left md:text-right w-full md:w-auto">
                                <div className="flex items-baseline md:justify-end gap-1">
                                    <span className="text-xl md:text-2xl font-light text-amber-200">₹</span>
                                    <span className="text-4xl md:text-6xl font-black tracking-tighter">
                                        {totals.totalSettlement.toLocaleString('en-IN')}
                                    </span>
                                    <span className="text-xl md:text-2xl font-black opacity-60">.00</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* NARRATION SECTION */}
                <div className="p-4 md:p-6 bg-slate-50 border-t border-slate-200">
                    <label className="text-slate-500 font-bold uppercase mb-2 block text-[10px] tracking-widest">Adjustment Remarks</label>
                    <textarea
                        className="w-full bg-white border border-slate-200 rounded-xl p-3 h-20 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-500/5 transition-all text-sm"
                        placeholder="Type narration here..."
                        value={narration}
                        onChange={(e) => setNarration(e.target.value)}
                    />
                </div>

                {/* ACTION FOOTER - Flex-wrap for Tablet overlap */}
                <div className="flex flex-wrap bg-slate-900 text-white p-4 gap-3 items-center border-t border-slate-800">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gradient-to-b from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 px-8 py-3.5 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all shadow-lg text-white active:scale-95">
                        <Save size={16} />
                        Save Settlement
                    </button>

                    <div className="flex flex-1 md:flex-none gap-2">
                        <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 px-5 py-3.5 rounded-xl font-bold text-[11px] uppercase tracking-wider border border-slate-700 transition-all">
                            <Printer size={16} />
                            Print
                        </button>
                        <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 px-5 py-3.5 rounded-xl font-bold text-[11px] uppercase tracking-wider border border-slate-700 transition-all">
                            <Mail size={16} />
                        </button>
                    </div>

                    <button className="hidden md:flex items-center gap-2 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white px-5 py-3.5 rounded-xl font-black text-[11px] uppercase tracking-widest border border-indigo-500/30 transition-all ml-auto">
                        <Send size={16} />
                        Share
                    </button>
                </div>
            </div>

            <MultiTransaction
                totals={{
                    invoiceTotal: totals.totalSettlement
                }}
            />
        </div>
    );
};

export default SettlementV1;