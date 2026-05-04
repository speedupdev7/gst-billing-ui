import React from 'react'
import { usePayment } from "./PaymentContext";
import {
    X,
    Banknote,
    QrCode,
    ArrowRight,
    ReceiptText,
    Percent,
    HandCoins,
    CreditCard,
    FileText
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
    return (
        <div>
            {showPaymentModal && (
                <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-sm flex justify-center sm:justify-end overflow-hidden font-poppins">
                    <div className="absolute inset-0" onClick={() => setShowPaymentModal(false)} />

                    {/* Main Container */}
                    <div className="relative w-full md:w-[80%] lg:w-[50%] h-full bg-white shadow-xl flex flex-col animate-in slide-in-from-right duration-500">

                        {/* 1. Header */}
                        <div className="h-16 px-4 sm:px-6 flex items-center justify-between bg-emerald-800 border-b border-slate-200 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-100 rounded-lg">
                                    <ReceiptText className="text-emerald-700" size={20} />
                                </div>
                                <h2 className="text-base text-white sm:text-lg font-semibold font-poppins text-slate-800 tracking-tight">Finalize Transaction</h2>
                            </div>
                            <button onClick={() => setShowPaymentModal(false)} className="p-2 hover:bg-slate-900 rounded-full text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

                            {/* LEFT: Payment Selection */}
                            <div className="w-full lg:w-[260px] border-b lg:border-b-0 lg:border-r border-slate-200 bg-white p-4 flex flex-col gap-4 overflow-y-auto shrink-0">

                                {/* 1. Select Method Section (Now at the top) */}
                                <section>
                                    <h4 className="text-[10px] font-semibold text-slate-700 uppercase tracking-wider mb-3">Select Method</h4>
                                    <div className="grid grid-cols-3 lg:grid-cols-2 gap-3">
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

                                {/* 2. Quick Balance Section (Now at the bottom) */}
                                <section className="mt-auto p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Bill Summary</h4>
                                    <div className="space-y-1.5">
                                        {(() => {
                                            const invoiceTotal = totals.invoiceTotal || 0;
                                            const totalPaid = Object.entries(paymentSplit).reduce((sum, [id, val]) => {
                                                const method = activeMethods.find(m => m.id === id);
                                                const numVal = parseFloat(val) || 0;
                                                if (method?.type === 'Discount' && discountMode[id] === 'percent') {
                                                    return sum + (invoiceTotal * (numVal / 100));
                                                }
                                                return sum + numVal;
                                            }, 0);
                                            const outstanding = Math.max(0, invoiceTotal - totalPaid);

                                            return (
                                                <>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[10px] font-medium text-slate-500">Total Invoice</span>
                                                        <span className="text-[11px] font-bold text-slate-700">₹{invoiceTotal.toLocaleString('en-IN')}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[10px] font-medium text-slate-500">Total Paid</span>
                                                        <span className="text-[11px] font-bold text-emerald-600">₹{totalPaid.toLocaleString('en-IN')}</span>
                                                    </div>
                                                    <div className="pt-2 mt-1 border-t border-slate-200 flex justify-between items-center">
                                                        <span className="text-[10px] font-bold text-slate-600 uppercase">Outstanding</span>
                                                        <span className={`text-sm font-black ${outstanding > 0.01 ? 'text-rose-600' : 'text-emerald-700'}`}>
                                                            ₹{outstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                        </span>
                                                    </div>
                                                </>
                                            );
                                        })()}
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
                                                {/* <div className="space-y-1">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Total Paid</p>
                                                    <p className="text-xl lg:text-2xl font-black text-slate-900 tabular-nums">₹{totalPaid.toLocaleString('en-IN')}</p>
                                                </div> */}
                                                <div className="h-10 w-px bg-slate-200 hidden sm:block" />
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Remaining</p>
                                                    <p className={`text-xl lg:text-2xl font-black tabular-nums ${remaining <= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                                                        ₹{Math.max(0, remaining).toLocaleString('en-IN', {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2
                                                        })}
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
    )
}

export default MultiTransaction
