import React, { useState } from "react";
import {
    ShoppingCart,
    Search,
    CalendarDays,
    Receipt,
    Eye,
    Printer,
    ChevronDown,
    Truck,
    PieChart as PieIcon // Added missing icon import
} from "lucide-react";

// Added missing Recharts imports
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

const StatCard = ({ label, value, color, icon }) => {
    const [summaryView, setSummaryView] = useState("chart");
   const colors = {

    violet: {
        border: "border-violet-100",
        text: "text-violet-500",
        bg: "bg-violet-50",
        icon: "text-violet-600"
    },

    emerald: {
        border: "border-emerald-100",
        text: "text-emerald-500",
        bg: "bg-emerald-50",
        icon: "text-emerald-600"
    },

    rose: {
        border: "border-rose-100",
        text: "text-rose-500",
        bg: "bg-rose-50",
        icon: "text-rose-600"
    },

    blue: {
        border: "border-blue-100",
        text: "text-blue-500",
        bg: "bg-blue-50",
        icon: "text-blue-600"
    }

};

    return (
        <div className={`bg-white border rounded-lg p-3 shadow-sm flex justify-between items-center ${colors[color].border}`}>
            <div>
                <p className={`text-[9px] uppercase font-bold ${colors[color].text}`}>
                    {label}
                </p>
                <h2 className="text-lg font-black text-slate-800">
                    ₹{value.toLocaleString("en-IN")}
                </h2>
            </div>
            <div className={`p-2 rounded-md ${colors[color].bg} ${colors[color].icon}`}>
                {icon}
            </div>
        </div>
    );
};

const PurchaseTransactionV1 = () => {
    const [transactions] = useState([
        {
            id: 1,
            purchaseNo: "PUR-2026-0001",
            supplier: "Global Textile",
            date: "2026-05-09",
            paymentMode: "Cash",
            items: 12,
            totalAmount: 45200,
            paidAmount: 30000,
            balance: 15200,
            status: "Pending"
        },
        {
            id: 2,
            purchaseNo: "PUR-2026-0002",
            supplier: "Fashion Hub",
            date: "2026-05-09",
            paymentMode: "UPI",
            items: 5,
            totalAmount: 12800,
            paidAmount: 12800,
            balance: 0,
            status: "Paid"
        },
        {
            id: 3,
            purchaseNo: "PUR-2026-0003",
            supplier: "Denim World",
            date: "2026-05-09",
            paymentMode: "Bank",
            items: 18,
            totalAmount: 98500,
            paidAmount: 70000,
            balance: 28500,
            status: "Partial"
        }
    ]);

    const totals = {
        totalPurchase: transactions.reduce((sum, t) => sum + t.totalAmount, 0),
        totalPaid: transactions.reduce((sum, t) => sum + t.paidAmount, 0),
        totalPending: transactions.reduce((sum, t) => sum + t.balance, 0)
    };

    const chartData = [
        { name: "Paid", value: totals.totalPaid, color: "#10b981" },
        { name: "Pending", value: totals.totalPending, color: "#f43f5e" }
    ];

    return (
        <div className="min-h-screen bg-slate-100 p-2 antialiased font-sans">
            <div className="max-w-[1700px] mx-auto bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200">

                {/* HEADER */}
                <div className="bg-gradient-to-r from-violet-700 via-violet-600 to-slate-900 p-3 text-white flex items-center gap-3">
                    <div className="bg-white/10 p-2 rounded-lg">
                        <ShoppingCart size={20} />
                    </div>
                    <div>
                        <h1 className="text-lg font-black uppercase tracking-tight">
                            Purchase Transactions
                        </h1>
                        <p className="text-violet-100/60 text-[9px] uppercase tracking-widest leading-none">
                            Supplier Purchase Records
                        </p>
                    </div>
                </div>

             
                {/* SUMMARY SECTION */}
                {/* DASHBOARD TOP SECTION (Cards + Chart) */}

                <div className="flex flex-col lg:flex-row gap-4 p-4 bg-slate-50 border-b border-slate-200">

                    {/* STATS GRID */}

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-2 gap-3 flex-grow">

                        <StatCard
                            label="Total Purchase"
                            value={totals.totalPurchase}
                            color="violet"
                            icon={<ShoppingCart size={16} />}
                        />

                        <StatCard
                            label="Total Paid"
                            value={totals.totalPaid}
                            color="emerald"
                            icon={<Truck size={16} />}
                        />

                        <StatCard
                            label="Total Pending"
                            value={totals.totalPending}
                            color="rose"
                            icon={<CalendarDays size={16} />}
                        />

                        <StatCard
                            label="Total Orders"
                            value={transactions.length}
                            color="blue"
                            icon={<Receipt size={16} />}
                        />

                    </div>

                    {/* PIE CHART CARD */}

                    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm min-w-[320px] h-[200px] flex flex-col">

                        <div className="flex items-center gap-2 mb-1">

                            <PieIcon size={14} className="text-slate-400" />

                            <p className="text-[10px] uppercase font-bold text-slate-500">
                                Purchase Summary
                            </p>

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

                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.color}
                                            />

                                        ))}

                                    </Pie>

                                    <Tooltip
                                        contentStyle={{
                                            fontSize: '12px',
                                            borderRadius: '8px'
                                        }}
                                        formatter={(value) =>
                                            `₹${value.toLocaleString('en-IN')}`
                                        }
                                    />

                                    <Legend
                                        verticalAlign="middle"
                                        align="right"
                                        layout="vertical"
                                        iconType="circle"
                                        wrapperStyle={{
                                            fontSize: '11px',
                                            fontWeight: 'bold'
                                        }}
                                    />

                                </PieChart>

                            </ResponsiveContainer>

                        </div>

                    </div>

                </div>
                   {/* FILTERS */}
                <div className="grid grid-cols-1 md:grid-cols-5 border-b border-slate-200 bg-white">
                    {[
                        { label: "Search Purchase", type: "text", placeholder: "Purchase no...", icon: <Search size={12} /> },
                        { label: "Supplier", type: "text", placeholder: "Supplier name..." },
                        { label: "From Date", type: "date", icon: <CalendarDays size={12} /> },
                        { label: "To Date", type: "date", icon: <CalendarDays size={12} /> }
                    ].map((f, i) => (
                        <div key={i} className="p-2 border-r border-slate-100">
                            <label className="text-[9px] font-bold uppercase text-slate-400 mb-1 block">
                                {f.label}
                            </label>
                            <div className="relative">
                                {f.icon && (
                                    <div className="absolute left-2 top-2 text-slate-400">
                                        {f.icon}
                                    </div>
                                )}
                                <input
                                    type={f.type}
                                    placeholder={f.placeholder}
                                    className={`w-full border border-slate-200 rounded-md ${f.icon ? 'pl-7' : 'px-2'} py-1 text-[11px] outline-none focus:border-violet-500 h-8`}
                                />
                            </div>
                        </div>
                    ))}
                    <div className="p-2">
                        <label className="text-[9px] font-bold uppercase text-slate-400 mb-1 block">
                            Status
                        </label>
                        <div className="relative">
                            <select className="w-full appearance-none border border-slate-200 rounded-md px-2 py-1 text-[11px] outline-none focus:border-violet-500 h-8 bg-transparent">
                                <option>All Status</option>
                                <option>Paid</option>
                                <option>Pending</option>
                                <option>Partial</option>
                            </select>
                            <ChevronDown size={12} className="absolute right-2 top-2.5 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* TABLE SECTION */}
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1000px]">
                        <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold border-b border-slate-200">
                            <tr>
                                <th className="px-3 py-3 text-center w-10">Sr</th>
                                <th className="px-3 py-3 text-left">Purchase No</th>
                                <th className="px-3 py-3 text-center">Date</th>
                                <th className="px-3 py-3 text-left">Supplier</th>
                                <th className="px-3 py-3 text-right">Purchase Amount</th>
                                <th className="px-3 py-3 text-right">Paid</th>
                                <th className="px-3 py-3 text-right">Pending</th>
                                <th className="px-3 py-3 text-center">Status</th>
                                <th className="px-3 py-3 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="text-[11px]">
                            {transactions.map((trx, index) => (
                                <tr key={trx.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                                    <td className="px-3 py-2 text-center text-slate-400">{index + 1}</td>
                                    <td className="px-3 py-2 font-bold text-violet-700">{trx.purchaseNo}</td>
                                    <td className="px-3 py-2 text-center text-slate-500">{trx.date}</td>
                                    <td className="px-3 py-2 font-medium">{trx.supplier}</td>
                                    <td className="px-3 py-2 text-right font-bold text-violet-700">₹{trx.totalAmount.toLocaleString("en-IN")}</td>
                                    <td className="px-3 py-2 text-right font-bold text-emerald-600">₹{trx.paidAmount.toLocaleString("en-IN")}</td>
                                    <td className="px-3 py-2 text-right font-bold text-rose-600">₹{trx.balance.toLocaleString("en-IN")}</td>
                                    <td className="px-3 py-2 text-center">
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${trx.status === "Paid" ? "bg-emerald-100 text-emerald-700" :
                                            trx.status === "Pending" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                                            }`}>
                                            {trx.status}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2">
                                        <div className="flex items-center justify-center gap-1">
                                            <button className="w-7 h-7 rounded bg-slate-100 text-slate-600 hover:bg-violet-600 hover:text-white flex items-center justify-center transition-colors">
                                                <Eye size={14} />
                                            </button>
                                            <button className="w-7 h-7 rounded bg-slate-100 text-slate-600 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition-colors">
                                                <Printer size={14} />
                                            </button>
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

export default PurchaseTransactionV1;