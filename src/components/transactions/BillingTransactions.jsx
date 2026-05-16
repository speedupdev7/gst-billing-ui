import React, { useState } from "react";
import {
    Receipt,
    Search,
    CalendarDays,
    Eye,
    Printer,
    RefreshCcw,
    ChevronDown,
    PieChart as PieIcon
} from "lucide-react";
// Import Recharts components
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const BillingTransactionV1 = () => {
    
    const [transactions] = useState([
        {
            id: 1,
            invoiceNo: "INV-2026-0001",
            customer: "Acme Industries",
            date: "2026-05-09",
            paymentMode: "Cash",
            items: 4,
            totalAmount: 12500,
            paidAmount: 12500,
            balance: 0,
            status: "Paid",
            discount: 0
        },
        {
            id: 2,
            invoiceNo: "INV-2026-0002",
            customer: "Star Fashion",
            date: "2026-05-09",
            paymentMode: "UPI",
            items: 2,
            totalAmount: 1533,
            paidAmount: 1500,
            balance: 33,
            status: "Pending",
            discount: 0
        },
        {
            id: 3,
            invoiceNo: "INV-2026-0003",
            customer: "Royal Traders",
            date: "2026-05-09",
            paymentMode: "Card",
            items: 8,
            totalAmount: 54279,
            paidAmount: 50000,
            balance: 4279,
            status: "Partial",
            discount: 500
        }
    ]);

    const totals = {
        totalSales: transactions.reduce((sum, t) => sum + t.totalAmount, 0),
        totalPaid: transactions.reduce((sum, t) => sum + t.paidAmount, 0),
        totalPending: transactions.reduce((sum, t) => sum + t.balance, 0),
        totalDiscount: transactions.reduce((sum, t) => sum + (t.discount || 0), 0)
    };

    // Data format for the Pie Chart
    const chartData = [
        { name: 'Paid Amount', value: totals.totalPaid, color: '#10b981' }, // Emerald-500
        { name: 'Pending Amount', value: totals.totalPending, color: '#f59e0b' }, // Amber-500
    ];

    return (
        <div className="min-h-screen bg-slate-100 p-4 antialiased">
            <div className="max-w-[1700px] mx-auto bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200">

                {/* HEADER */}
                <div className="bg-gradient-to-r from-violet-800 via-fuchsia-700 to-slate-900 p-3 text-white flex items-center gap-3">
                    <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm border border-white/10">
                        <Receipt size={20} />
                    </div>
                    <div>
                        <h1 className="text-lg font-black uppercase tracking-tight">Billing Transactions</h1>
                        <p className="text-fuchsia-100/70 text-[9px] uppercase tracking-widest leading-none">History & Records</p>
                    </div>
                </div>

                {/* DASHBOARD TOP SECTION (Cards + Chart) */}
                <div className="flex flex-col lg:flex-row gap-4 p-4 bg-slate-50 border-b border-slate-200">
                    
                    {/* STATS GRID */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-2 gap-3 flex-grow">
                        <StatCard label="Total Sales" value={totals.totalSales} color="blue" icon={<Receipt size={16} />} />
                        <StatCard label="Total Discount" value={totals.totalDiscount} color="rose" icon={<RefreshCcw size={16} />} />
                        <StatCard label="Total Paid" value={totals.totalPaid} color="emerald" icon={<RefreshCcw size={16} />} />
                        <StatCard label="Total Pending" value={totals.totalPending} color="amber" icon={<CalendarDays size={16} />} />
                    </div>

                    {/* PIE CHART CARD */}
                    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm min-w-[320px] h-[200px] flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                            <PieIcon size={14} className="text-slate-400" />
                            <p className="text-[10px] uppercase font-bold text-slate-500">Payment Summary</p>
                        </div>
                        <div className="flex-grow">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        innerRadius={40}
                                        outerRadius={60}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ fontSize: '12px', borderRadius: '8px' }}
                                        formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                                    />
                                    <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* FILTERS */}
                <div className="grid grid-cols-1 md:grid-cols-5 border-b border-slate-200 bg-white">
                    {[
                        { label: "Search Invoice", type: "text", placeholder: "Invoice no...", icon: <Search size={12} /> },
                        { label: "Customer", type: "text", placeholder: "Customer name..." },
                        { label: "From Date", type: "date", icon: <CalendarDays size={12} /> },
                        { label: "To Date", type: "date", icon: <CalendarDays size={12} /> }
                    ].map((f, i) => (
                        <div key={i} className="p-2 border-r border-slate-100">
                            <label className="text-[9px] font-bold uppercase text-slate-400 mb-1 block">{f.label}</label>
                            <div className="relative">
                                {f.icon && <div className="absolute left-2 top-2 text-slate-400">{f.icon}</div>}
                                <input
                                    type={f.type}
                                    className={`w-full border border-slate-200 rounded-md ${f.icon ? 'pl-7' : 'px-2'} py-1 text-[11px] h-8 outline-none focus:border-violet-500`}
                                />
                            </div>
                        </div>
                    ))}
                    <div className="p-2 flex items-end">
                        <select className="w-full border border-slate-200 rounded-md px-2 py-1 text-[11px] h-8 outline-none focus:border-violet-500 bg-transparent">
                            <option>All Status</option>
                        </select>
                    </div>
                </div>

                {/* TABLE */}
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1000px]">
                        <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold border-b border-slate-200">
                            <tr>
                                <th className="px-3 py-3 text-center w-10">Sr</th>
                                <th className="px-3 py-3 text-left">Invoice No</th>
                                <th className="px-3 py-3">Date</th>
                                <th className="px-3 py-3 text-left">Customer</th>
                                <th className="px-3 py-3 text-right">Total Sale</th>
                                <th className="px-3 py-3 text-right">Discount</th>
                                <th className="px-3 py-3 text-right">Paid</th>
                                <th className="px-3 py-3 text-right">Pending</th>
                                <th className="px-3 py-3">Status</th>
                                <th className="px-3 py-3 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="text-[11px]">
                            {transactions.map((trx, index) => (
                                <tr key={trx.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                                    <td className="px-3 py-2 text-center text-slate-400">{index + 1}</td>
                                    <td className="px-3 py-2 font-bold text-blue-600">{trx.invoiceNo}</td>
                                    <td className="px-3 py-2 text-center text-slate-500">{trx.date}</td>
                                    <td className="px-3 py-2 font-medium">{trx.customer}</td>
                                    <td className="px-3 py-2 text-right font-bold">₹{trx.totalAmount.toLocaleString("en-IN")}</td>
                                    <td className="px-3 py-2 text-right font-bold text-rose-600">₹{trx.discount.toLocaleString("en-IN")}</td>
                                    <td className="px-3 py-2 text-right font-bold text-emerald-600">₹{trx.paidAmount.toLocaleString("en-IN")}</td>
                                    <td className="px-3 py-2 text-right font-bold text-amber-600">₹{trx.balance.toLocaleString("en-IN")}</td>
                                    <td className="px-3 py-2 text-center">
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                            trx.status === "Paid" ? "bg-emerald-100 text-emerald-700" : 
                                            trx.status === "Pending" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                                        }`}>
                                            {trx.status}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2">
                                        <div className="flex items-center justify-center gap-1">
                                            <button className="w-7 h-7 rounded bg-slate-100 text-slate-600 hover:bg-blue-600 hover:text-white flex items-center justify-center"><Eye size={14} /></button>
                                            <button className="w-7 h-7 rounded bg-slate-100 text-slate-600 hover:bg-emerald-600 hover:text-white flex items-center justify-center"><Printer size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// Sub-component for the Stat Cards
const StatCard = ({ label, value, color, icon }) => {
    const colors = {
        blue: "border-blue-100 text-blue-500 bg-blue-50",
        rose: "border-rose-100 text-rose-500 bg-rose-50",
        emerald: "border-emerald-100 text-emerald-500 bg-emerald-50",
        amber: "border-amber-100 text-amber-500 bg-amber-50",
    };

    return (
        <div className={`bg-white border rounded-lg p-3 shadow-sm flex justify-between items-center ${colors[color].split(' ')[0]}`}>
            <div>
                <p className={`text-[9px] uppercase font-bold ${colors[color].split(' ')[1]}`}>{label}</p>
                <h2 className="text-lg font-black text-slate-800">₹{value.toLocaleString("en-IN")}</h2>
            </div>
            <div className={`p-2 rounded-md ${colors[color].split(' ')[2]} ${colors[color].split(' ')[1]}`}>
                {icon}
            </div>
        </div>
    );
};

export default BillingTransactionV1;