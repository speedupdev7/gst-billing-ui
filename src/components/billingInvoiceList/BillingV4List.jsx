import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Plus, CheckCircle2, Clock, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import { useNavigate } from 'react-router-dom';

const BillingV4List = () => {
    const [invoices, setInvoices] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    
    // --- Pagination State ---
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const navigate = useNavigate();

    const fetchInvoices = async () => {
        try {
            const res = await axios.get(`/api/invoice/balance/all-paginated?page=${page}&size=${pageSize}`);
            const payload = res.data;
            setInvoices(payload?.content || payload || []);
            setTotalPages(payload?.totalPages ?? 0);
            setTotalElements(payload?.totalElements ?? 0);
        } catch (err) {
            console.error("Error fetching invoices:", err);
            setInvoices([]);
            setTotalPages(0);
            setTotalElements(0);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, [page, pageSize]);

    // Reset to first page when searching or filtering
    useEffect(() => {
        setPage(0);
    }, [searchTerm, fromDate, toDate]);

    const renderStatus = (status) => {
        const s = status?.toString().trim().toLowerCase();
        const baseClass = "px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 border transition-all min-w-[100px]";

        if (s === 'completed' || s === 'paid' || s === 'full') {
            return <span className={`${baseClass} bg-emerald-50 text-emerald-600 border-emerald-100`}><CheckCircle2 size={10} strokeWidth={3} /> Paid</span>;
        }
        if (s === 'partial pending' || s === 'partial') {
            return <span className={`${baseClass} bg-amber-50 text-amber-600 border-amber-100`}><Clock size={10} strokeWidth={3} /> Partial</span>;
        }
        if (s === 'pending' || s === 'unpaid' || s === 'due') {
            return <span className={`${baseClass} bg-rose-50 text-rose-600 border-rose-200`}><AlertCircle size={10} strokeWidth={3} /> Pending</span>;
        }
        return <span className={`${baseClass} bg-slate-50 text-slate-400 border-slate-200`}>{status || 'N/A'}</span>;
    };

    // 1. Filter Logic
    const filteredInvoices = invoices.filter(inv => {
        const name = (inv.unitName || inv.customer?.customerName || inv.customerName || "").toLowerCase();
        const invNo = (inv.invoiceNo || "").toLowerCase();
        const matchesSearch = invNo.includes(searchTerm.toLowerCase()) || name.includes(searchTerm.toLowerCase());

        const invDate = inv.invoiceDate ? new Date(inv.invoiceDate) : null;
        let matchesDate = true;
        if (fromDate && invDate && invDate < fromDate) matchesDate = false;
        if (toDate && invDate) {
            const end = new Date(toDate);
            end.setHours(23, 59, 59);
            if (invDate > end) matchesDate = false;
        }
        return matchesSearch && matchesDate;
    });

    // 2. Use server-provided page data
    const indexOfFirstRecord = page * pageSize;
    const currentRecords = filteredInvoices;

    return (
        <div className="min-h-screen bg-slate-50 p-6 font-poppins text-slate-600" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <div className="max-w-[1400px] mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">

                {/* --- Header --- */}
                <div className="px-6 py-5 border-b border-indigo-50 bg-white">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-5">
                            <h2 className="text-xl font-semibold text-indigo-950 tracking-tight">Invoice Master</h2>
                            <div className="flex items-center gap-2">
                                <DatePicker
                                    selected={fromDate}
                                    onChange={(date) => setFromDate(date)}
                                    placeholderText="From"
                                    className="pl-4 pr-2 py-1.5 w-32 border border-slate-200 rounded-lg text-xs outline-none bg-slate-50/50"
                                    dateFormat="dd-MM-yyyy"
                                />
                                <DatePicker
                                    selected={toDate}
                                    onChange={(date) => setToDate(date)}
                                    placeholderText="To"
                                    className="pl-4 pr-2 py-1.5 w-32 border border-slate-200 rounded-lg text-xs outline-none bg-slate-50/50"
                                    dateFormat="dd-MM-yyyy"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-4 pr-4 py-1.5 w-64 border border-slate-200 rounded-lg text-xs bg-slate-50/50"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button onClick={() => navigate('/billing_v4')} className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 shadow-md">
                                <Plus size={16} className="inline mr-1" /> New Entry
                            </button>
                            <div className="flex items-center gap-2">
                                <label className="text-xs text-slate-500">Show</label>
                                <select
                                    value={pageSize}
                                    onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
                                    className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50/50"
                                >
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Table --- */}
                <div className="w-full overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-indigo-50/20 border-b border-indigo-100">
                                <th className="px-6 py-3 text-[10px] font-semibold text-indigo-900/50 uppercase w-16 text-center">Sr. No</th>
                                <th className="px-6 py-3 text-[10px] font-semibold text-indigo-900/50 uppercase w-40 text-center">Actions</th>
                                <th className="px-6 py-3 text-[10px] font-semibold text-indigo-900/50 uppercase">Client Name</th>
                                <th className="px-6 py-3 text-[10px] font-semibold text-indigo-900/50 uppercase">Date</th>
                                <th className="px-6 py-3 text-[10px] font-semibold text-indigo-900/50 uppercase text-right">Net Amount</th>
                                <th className="px-6 py-3 text-[10px] font-semibold text-indigo-900/50 uppercase text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {currentRecords.map((inv, index) => (
                                <tr key={inv.balanceId || inv.invoiceNo || index} className="hover:bg-indigo-50/10 transition-colors">
                                    <td className="px-6 py-2.5 text-xs font-medium text-slate-400 text-center">
                                        {indexOfFirstRecord + index + 1}
                                    </td>
                                    <td className="px-6 py-2.5">
                                        <div className="flex items-center justify-center gap-2.5">
                                            <button className="w-7 h-7 flex items-center justify-center text-indigo-500 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-md"><VisibilityIcon sx={{ fontSize: 15 }} /></button>
                                            <button className="w-7 h-7 flex items-center justify-center text-sky-500 bg-sky-50 hover:bg-sky-500 hover:text-white rounded-md"><ModeEditIcon sx={{ fontSize: 15 }} /></button>
                                            <button className="w-7 h-7 flex items-center justify-center text-rose-500 bg-rose-50 hover:bg-rose-500 hover:text-white rounded-md"><DeleteIcon sx={{ fontSize: 15 }} /></button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-2.5 text-xs font-semibold text-slate-700">
                                        {inv.unitName || 'N/A'}
                                    </td>
                                    <td className="px-6 py-2.5 text-xs font-medium text-slate-500">
                                        {inv.invoiceDate ? inv.invoiceDate.split('-').reverse().join('-') : 'N/A'}
                                    </td>
                                    <td className="px-6 py-2.5 text-right text-xs font-semibold text-indigo-950">
                                        ₹{typeof inv.invoiceAmount === 'number' ? inv.invoiceAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : parseFloat(inv.invoiceAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-6 py-2.5 text-center">
                                        <div className="flex justify-center">{renderStatus(inv.status)}</div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* --- Pagination Footer --- */}
                <div className="px-6 py-4 bg-white border-t border-slate-100 flex items-center justify-between">
                    <p className="text-xs text-slate-500 font-medium">
                        Showing <span className="text-indigo-600">{currentRecords.length}</span> of {totalElements} records
                    </p>
                    
                    <div className="flex items-center gap-2">
                        <button 
                            disabled={page === 0}
                            onClick={() => setPage(prev => Math.max(prev - 1, 0))}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft size={18} />
                        </button>

                        <div className="flex items-center gap-1">
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i)}
                                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                                        page === i 
                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' 
                                        : 'text-slate-500 hover:bg-slate-50'
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>

                        <button 
                            disabled={page >= totalPages - 1 || totalPages === 0}
                            onClick={() => setPage(prev => Math.min(prev + 1, totalPages - 1))}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BillingV4List;