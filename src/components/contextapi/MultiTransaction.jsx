import React from 'react';
import { usePayment } from "./PaymentContext";
import {
    X, Banknote, QrCode, ArrowRight, ReceiptText, Percent, HandCoins, CreditCard, FileText, ChevronRight
} from "lucide-react";

const MultiTransaction = ({ totals }) => {
    const {
        activeMethods,
        setActiveMethods,
        paymentSplit,
        setPaymentSplit,
        showPaymentModal,
        setShowPaymentModal,
        paymentRefs,
        setPaymentRefs,
        discountMode,
        setDiscountMode,
    } = usePayment();

    // Logic: Calculate total paid including percentage-based discounts
    const totalPaid = Object.entries(paymentSplit).reduce((sum, [id, val]) => {
        const method = activeMethods.find(m => m.id === id);
        const numVal = parseFloat(val) || 0;
        if (method?.type === 'Discount' && discountMode[id] === 'percent') {
            return sum + (totals.invoiceTotal * (numVal / 100));
        }
        return sum + numVal;
    }, 0);

    const remaining = totals.invoiceTotal - totalPaid;
    const isFullyPaid = remaining <= 0.01 && totalPaid > 0;

    if (!showPaymentModal) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-0 sm:p-6 font-sans">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={() => setShowPaymentModal(false)}
            />

            {/* Main Modal */}
            <div className="relative w-full max-w-5xl h-full sm:h-[85vh] bg-white sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300 font-poppins font-semibold">

                {/* Header */}
                <header className="h-20 px-8 flex items-center justify-between border-b border-slate-100 bg-white shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
                            <ReceiptText className="text-white" size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Finalize Transaction</h2>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowPaymentModal(false)}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                    >
                        <X size={20} />
                    </button>
                </header>

                <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar: 3 Rows, 2 Columns Grid */}
                    <aside className="w-72 border-r border-slate-50 bg-slate-50/30 p-5 overflow-y-auto hidden md:block shrink-0">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5 ml-1">
                            Methods
                        </h4>

                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { type: 'Cash', icon: <Banknote size={18} />, color: 'text-emerald-600', bg: 'hover:bg-emerald-50/50' },
                                { type: 'UPI', icon: <QrCode size={18} />, color: 'text-indigo-600', bg: 'hover:bg-indigo-50/50' },
                                { type: 'Credit Card', icon: <CreditCard size={18} />, color: 'text-blue-600', bg: 'hover:bg-blue-50/50' },
                                { type: 'Debit Card', icon: <CreditCard size={18} />, color: 'text-cyan-600', bg: 'hover:bg-cyan-50/50' },
                                { type: 'Cheque', icon: <FileText size={18} />, color: 'text-slate-600', bg: 'hover:bg-slate-50/50' },
                                { type: 'Discount', icon: <Percent size={18} />, color: 'text-rose-600', bg: 'hover:bg-rose-50/50' }
                            ].map((m) => {
                                // Cash is usually always available to add multiple times or as primary
                                const isAdded = m.type === 'Cash' && activeMethods.some(method => method.type === 'Cash');

                                return (
                                    <button
                                        key={m.type}
                                        disabled={isAdded}
                                        onClick={() => {
                                            if (isAdded) return;
                                            const newId = `${m.type}-${Date.now()}`;

                                            // Logic: If there is an empty box, replace it; else add new.
                                            const emptyIndex = activeMethods.findIndex(met => !paymentSplit[met.id]);

                                            if (emptyIndex !== -1) {
                                                const updated = [...activeMethods];
                                                updated[emptyIndex] = { type: m.type, id: newId };
                                                setActiveMethods(updated);
                                            } else {
                                                setActiveMethods([...activeMethods, { type: m.type, id: newId }]);
                                            }

                                            if (m.type === 'Discount') setDiscountMode(prev => ({ ...prev, [newId]: 'rupee' }));
                                        }}
                                        className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl transition-all border text-center ${isAdded
                                            ? 'opacity-30 bg-transparent border-transparent cursor-not-allowed'
                                            : `bg-white border-slate-100 shadow-sm ${m.bg} hover:border-indigo-300 active:scale-95`
                                            }`}
                                    >
                                        <div className={`${m.color} bg-slate-50 p-2 rounded-xl transition-colors`}>
                                            {m.icon}
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-700 whitespace-nowrap tracking-tight uppercase">
                                            {m.type}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </aside>

                    {/* Content Area */}
                    <main className="flex-1 overflow-y-auto p-4 bg-white">
                        <div className="max-w-2xl mx-auto space-y-4">
                            {activeMethods.length === 0 ? (
                                <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-[2rem] text-slate-300">
                                    <HandCoins size={40} className="mb-4 opacity-20" />
                                    <p className="text-[10px] font-black tracking-widest uppercase text-slate-400">Select a payment method</p>
                                </div>
                            ) : (
                                activeMethods.map((method) => {
                                    const isDiscount = method.type === 'Discount';
                                    const needsRef = ['UPI', 'Cheque', 'Credit Card', 'Debit Card'].includes(method.type);
                                    const isPercent = isDiscount && discountMode[method.id] === 'percent';

                                    return (
                                        <div key={method.id} className="group relative bg-slate-50/50 border border-slate-200 rounded-2xl p-5 hover:border-indigo-500 hover:bg-white hover:shadow-xl transition-all duration-300 animate-in slide-in-from-bottom-2">
                                            <button
                                                onClick={() => {
                                                    setActiveMethods(activeMethods.filter(m => m.id !== method.id));
                                                    setPaymentSplit(prev => { const n = { ...prev }; delete n[method.id]; return n; });
                                                }}
                                                className="absolute -top-2 -right-2 p-1.5 bg-white border border-slate-200 text-slate-400 hover:text-rose-500 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                            >
                                                <X size={12} />
                                            </button>

                                            <div className="grid grid-cols-12 gap-4 items-end">
                                                {/* Left Input */}
                                                <div className="col-span-8">
                                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">
                                                        {method.type} Amount {isPercent ? '(%)' : ''}
                                                    </label>
                                                    <div className="relative">
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                                                            {isPercent ? '%' : '₹'}
                                                        </span>
                                                        <input
                                                            type="text"
                                                            inputMode="decimal"
                                                            placeholder="0.00"
                                                            autoFocus
                                                            value={paymentSplit[method.id] || ''}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                if (val === '' || /^\d*\.?\d*$/.test(val)) {
                                                                    setPaymentSplit(prev => ({ ...prev, [method.id]: val }));
                                                                }
                                                            }}
                                                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl font-mono text-lg font-black text-slate-800 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Right Detail (Ref or Mode) */}
                                                <div className="col-span-4">
                                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">
                                                        {isDiscount ? 'Type' : 'Reference'}
                                                    </label>
                                                    {isDiscount ? (
                                                        <div className="flex bg-slate-100 p-1 rounded-xl h-[50px]">
                                                            {['rupee', 'percent'].map((mode) => (
                                                                <button
                                                                    key={mode}
                                                                    onClick={() => {
                                                                        setDiscountMode(prev => ({ ...prev, [method.id]: mode }));
                                                                        setPaymentSplit(prev => ({ ...prev, [method.id]: '' }));
                                                                    }}
                                                                    className={`flex-1 text-[15px] font-black rounded-lg transition-all ${discountMode[method.id] === mode
                                                                        ? 'bg-white text-indigo-600 shadow-sm'
                                                                        : 'text-slate-400 hover:text-slate-600'
                                                                        }`}
                                                                >
                                                                    {mode === 'rupee' ? '₹' : '%'}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <input
                                                            type="text"
                                                            placeholder={needsRef ? "ID/No..." : "Note"}
                                                            value={paymentRefs[method.id] || ''}
                                                            onChange={(e) => setPaymentRefs(prev => ({ ...prev, [method.id]: e.target.value }))}
                                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 h-[50px] focus:border-indigo-500 outline-none transition-all"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </main>
                </div>

                {/* Footer */}
                <footer className="px-8 py-6 border-t border-slate-100 bg-white shrink-0">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-10">
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Payable</p>
                                <p className="text-xl font-mono font-black text-slate-900 tracking-tighter">₹{totals.invoiceTotal.toLocaleString('en-IN')}</p>
                            </div>
                            <div className="w-px h-10 bg-slate-100" />
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Paid</p>
                                <p className="text-xl font-mono font-black text-emerald-600 tracking-tighter">₹{totalPaid.toLocaleString('en-IN')}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <button
                                onClick={() => {
                                    const lastId = activeMethods[activeMethods.length - 1]?.id;
                                    if (lastId) {
                                        const m = activeMethods.find(x => x.id === lastId);
                                        const isPerc = m?.type === 'Discount' && discountMode[lastId] === 'percent';
                                        let settlementValue = (parseFloat(paymentSplit[lastId] || 0) + Math.max(0, remaining)).toFixed(2);
                                        if (isPerc) {
                                            settlementValue = (((parseFloat(paymentSplit[lastId] || 0) / 100 * totals.invoiceTotal) + remaining) / totals.invoiceTotal * 100).toFixed(2);
                                        }
                                        setPaymentSplit(prev => ({ ...prev, [lastId]: settlementValue }));
                                    }
                                }}
                                className="flex-1 md:px-8 h-14 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:border-indigo-300 hover:text-indigo-600 transition-all active:scale-95"
                            >
                                Settle Balance
                            </button>

                            <button
                                onClick={() => setShowPaymentModal(false)}
                                disabled={!isFullyPaid}
                                className="flex-[1.5] md:px-12 h-14 bg-indigo-600 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 active:scale-95"
                            >
                                Complete <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default MultiTransaction;