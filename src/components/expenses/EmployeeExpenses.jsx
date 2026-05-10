import React, { useState } from "react";
import {
    Users,
    Search,
    CalendarDays,
    Plus,
    Trash2,
    Save,
    Printer,
    Receipt,
    ChevronDown,
    Wallet
} from "lucide-react";

const EmployeeExpenseV1 = () => {

    const createRow = () => ({
        id: Date.now() + Math.random(),
        employeeName: "",
        department: "",
        expenseType: "",
        paymentMode: "Cash",
        amount: "",
        remark: ""
    });

    const [voucherNo, setVoucherNo] =
        useState("EMP-EXP-2026-0001");

    const [expenseDate, setExpenseDate] =
        useState(
            new Date().toISOString().split("T")[0]
        );

    const [items, setItems] = useState([
        createRow()
    ]);

    const handleChange = (
        index,
        field,
        value
    ) => {

        const updated = [...items];

        updated[index][field] = value;

        setItems(updated);
    };

    const addRow = () => {

        setItems([
            ...items,
            createRow()
        ]);
    };

    const removeRow = (id) => {

        if (items.length === 1) return;

        setItems(
            items.filter((item) =>
                item.id !== id
            )
        );
    };

    const totals = {

        totalExpense:

            items.reduce(
                (sum, item) =>
                    sum +
                    Number(item.amount || 0),
                0
            )
    };

    return (

        <div className="min-h-screen bg-slate-100 p-2 antialiased">

            <div className="max-w-[1700px] mx-auto bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200">

                {/* HEADER */}
{/* HEADER */}

<div className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 p-3 text-white flex items-center gap-3 shadow-sm">

    <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm border border-white/20">

        <Users size={20} />

    </div>

    <div>

        <h1 className="text-lg font-black uppercase tracking-tight">
            Employee Expenses
        </h1>

        <p className="text-emerald-50 text-[9px] uppercase tracking-widest leading-none">
            Staff Expense Management
        </p>

    </div>

</div>

{/* FILTERS */}

<div className="grid grid-cols-1 md:grid-cols-5 border-b border-slate-200 bg-white">

    {/* Voucher No */}

    <div className="p-2 border-r border-slate-100">

        <label className="text-[9px] font-bold uppercase text-slate-400 mb-1 block">
            Voucher No
        </label>

        <input
            type="text"
            value={voucherNo}
            onChange={(e) =>
                setVoucherNo(e.target.value)
            }
            className="w-full border border-slate-200 rounded-md px-2 text-[10px] outline-none focus:border-emerald-400 h-7"
        />

    </div>

    {/* Expense Date */}

    <div className="p-2 border-r border-slate-100">

        <label className="text-[9px] font-bold uppercase text-slate-400 mb-1 block">
            Expense Date
        </label>

        <div className="relative">

            <CalendarDays
                size={12}
                className="absolute left-2 top-2 text-slate-400"
            />

            <input
                type="date"
                value={expenseDate}
                onChange={(e) =>
                    setExpenseDate(e.target.value)
                }
                className="w-full border border-slate-200 rounded-md pl-7 text-[10px] outline-none focus:border-emerald-400 h-7"
            />

        </div>

    </div>

    {/* Search */}

    <div className="p-2 border-r border-slate-100">

        <label className="text-[9px] font-bold uppercase text-slate-400 mb-1 block">
            Search Employee
        </label>

        <div className="relative">

            <Search
                size={12}
                className="absolute left-2 top-2 text-slate-400"
            />

            <input
                type="text"
                placeholder="Search employee..."
                className="w-full border border-slate-200 rounded-md pl-7 text-[10px] outline-none focus:border-emerald-400 h-7"
            />

        </div>

    </div>

    {/* Payment Mode */}

    <div className="p-2 border-r border-slate-100">

        <label className="text-[9px] font-bold uppercase text-slate-400 mb-1 block">
            Payment Mode
        </label>

        <div className="relative">

            <select className="w-full appearance-none border border-slate-200 rounded-md px-2 text-[10px] outline-none focus:border-emerald-400 h-7 bg-transparent">

                <option>
                    Cash
                </option>

                <option>
                    UPI
                </option>

                <option>
                    Bank
                </option>

                <option>
                    Card
                </option>

            </select>

            <ChevronDown
                size={12}
                className="absolute right-2 top-2 text-slate-400 pointer-events-none"
            />

        </div>

    </div>

    {/* Total */}

    <div className="p-2">

        <label className="text-[9px] font-bold uppercase text-slate-400 mb-1 block">
            Total Expense
        </label>

        <div className="h-7 bg-emerald-50 border border-emerald-100 rounded-md flex items-center justify-center font-black text-emerald-700 text-[11px] shadow-sm">

            ₹{
                totals.totalExpense.toLocaleString("en-IN")
            }

        </div>

    </div>

</div>

{/* TABLE */}

<div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">

    <table className="w-full min-w-[1300px]">

        <thead className="bg-slate-50 sticky top-0 z-20 text-slate-500 text-[10px] uppercase font-bold border-b border-slate-200">

            <tr>

                <th className="px-3 py-2 text-center w-10">
                    Sr
                </th>

                <th className="px-3 py-2 text-left">
                    Employee Name
                </th>

                <th className="px-3 py-2 text-left">
                    Department
                </th>

                <th className="px-3 py-2 text-left">
                    Expense Type
                </th>

                <th className="px-3 py-2">
                    Payment
                </th>

                <th className="px-3 py-2 text-right">
                    Amount
                </th>

                <th className="px-3 py-2 text-left">
                    Remark
                </th>

                <th className="px-3 py-2 text-center">
                    Action
                </th>

            </tr>

        </thead>

        <tbody className="text-[11px]">

            {
                items.map((item, index) => (

                    <tr
                        key={item.id}
                        className="border-b border-slate-100 hover:bg-emerald-50/50 transition-colors"
                    >

                        <td className="px-3 py-1 text-center text-slate-400">

                            {index + 1}

                        </td>

                        {/* Employee Name */}

                        <td className="px-2 py-0.5">

                            <input
                                type="text"
                                value={item.employeeName}
                                onChange={(e) =>
                                    handleChange(
                                        index,
                                        "employeeName",
                                        e.target.value
                                    )
                                }
                                placeholder="Employee name..."
                                className="w-full border border-slate-200 rounded-md px-2 text-[10px] outline-none focus:border-emerald-400 h-7"
                            />

                        </td>

                        {/* Department */}

                        <td className="px-2 py-0.5">

                            <select
                                value={item.department}
                                onChange={(e) =>
                                    handleChange(
                                        index,
                                        "department",
                                        e.target.value
                                    )
                                }
                                className="w-full border border-slate-200 rounded-md px-2 text-[10px] outline-none focus:border-emerald-400 h-7"
                            >

                                <option value="">
                                    Select
                                </option>

                                <option>
                                    Sales
                                </option>

                                <option>
                                    Accounts
                                </option>

                                <option>
                                    Warehouse
                                </option>

                                <option>
                                    HR
                                </option>

                            </select>

                        </td>

                        {/* Expense Type */}

                        <td className="px-2 py-0.5">

                            <select
                                value={item.expenseType}
                                onChange={(e) =>
                                    handleChange(
                                        index,
                                        "expenseType",
                                        e.target.value
                                    )
                                }
                                className="w-full border border-slate-200 rounded-md px-2 text-[10px] outline-none focus:border-emerald-400 h-7"
                            >

                                <option value="">
                                    Select
                                </option>

                                <option>
                                    Travel
                                </option>

                                <option>
                                    Food
                                </option>

                                <option>
                                    Petrol
                                </option>

                                <option>
                                    Hotel
                                </option>

                                <option>
                                    Miscellaneous
                                </option>

                            </select>

                        </td>

                        {/* Payment */}

                        <td className="px-2 py-0.5">

                            <select
                                value={item.paymentMode}
                                onChange={(e) =>
                                    handleChange(
                                        index,
                                        "paymentMode",
                                        e.target.value
                                    )
                                }
                                className="w-full border border-slate-200 rounded-md px-2 text-[10px] outline-none focus:border-emerald-400 h-7"
                            >

                                <option>
                                    Cash
                                </option>

                                <option>
                                    UPI
                                </option>

                                <option>
                                    Bank
                                </option>

                                <option>
                                    Card
                                </option>

                            </select>

                        </td>

                        {/* Amount */}

                        <td className="px-2 py-0.5">

                            <input
                                type="number"
                                value={item.amount}
                                onChange={(e) =>
                                    handleChange(
                                        index,
                                        "amount",
                                        e.target.value
                                    )
                                }
                                placeholder="0.00"
                                className="w-full border border-emerald-100 bg-emerald-50 rounded-md px-2 text-[10px] text-right font-bold text-emerald-700 outline-none focus:border-emerald-400 h-7"
                            />

                        </td>

                        {/* Remark */}

                        <td className="px-2 py-0.5">

                            <input
                                type="text"
                                value={item.remark}
                                onChange={(e) =>
                                    handleChange(
                                        index,
                                        "remark",
                                        e.target.value
                                    )
                                }
                                placeholder="Remark..."
                                className="w-full border border-slate-200 rounded-md px-2 text-[10px] outline-none focus:border-emerald-400 h-7"
                            />

                        </td>

                        {/* Action */}

                        <td className="px-2 py-0.5">

                            <div className="flex items-center justify-center gap-1">

                                <button
                                    onClick={() =>
                                        removeRow(item.id)
                                    }
                                    className="w-7 h-7 rounded bg-slate-100 text-slate-600 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center"
                                >

                                    <Trash2 size={14} />

                                </button>

                                {
                                    index === items.length - 1 && (

                                        <button
                                            onClick={addRow}
                                            className="w-7 h-7 rounded bg-emerald-500 text-white hover:bg-emerald-600 transition-all flex items-center justify-center shadow-sm"
                                        >

                                            <Plus size={14} />

                                        </button>
                                    )
                                }

                            </div>

                        </td>

                    </tr>
                ))
            }

        </tbody>

    </table>

</div>

{/* SUMMARY */}

<div className="p-3 border-t border-slate-200 bg-slate-50">

    <div className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 rounded-xl p-4 text-white flex items-center justify-between shadow-sm">

        <div className="flex items-center gap-3">

            <div className="bg-white/20 p-3 rounded-xl">

                <Wallet size={22} />

            </div>

            <div>

                <p className="text-[10px] uppercase tracking-widest text-emerald-50">
                    Total Employee Expense
                </p>

                <h2 className="text-3xl font-black tracking-tight">

                    ₹{
                        totals.totalExpense.toLocaleString("en-IN")
                    }

                </h2>

            </div>

        </div>

    </div>

</div>
                {/* FOOTER */}

                <div className="bg-slate-900 p-3 flex flex-wrap gap-2">

                    <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg font-bold uppercase text-[10px] tracking-widest">

                        <Save size={14} />

                        Save Expense

                    </button>

                    <button className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-5 py-2 rounded-lg font-bold uppercase text-[10px] tracking-widest">

                        <Printer size={14} />

                        Print

                    </button>

                </div>

            </div>

        </div>
    );
};

export default EmployeeExpenseV1;