import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Search, Plus, Calendar, X, CheckCircle2, Clock, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
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
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 10;

    const navigate = useNavigate();

    const fetchInvoices = async () => {
        try {
            const res = await axios.get('/api/invoice');
            setInvoices(res.data);
        } catch (err) {
            console.error("Error fetching invoices:", err);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, []);

    // Reset to page 1 when searching or filtering
    useEffect(() => {
        setCurrentPage(1);
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
        const name = (inv.customer?.customerName || inv.customerName || "").toLowerCase();
        const invNo = (inv.invoiceNo || "").toLowerCase();
        const matchesSearch = invNo.includes(searchTerm.toLowerCase()) || name.includes(searchTerm.toLowerCase());

        const invDate = new Date(inv.invoiceDate);
        let matchesDate = true;
        if (fromDate && invDate < fromDate) matchesDate = false;
        if (toDate) {
            const end = new Date(toDate);
            end.setHours(23, 59, 59);
            if (invDate > end) matchesDate = false;
        }
        return matchesSearch && matchesDate;
    });

    // 2. Pagination Calculations
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = filteredInvoices.slice(indexOfFirstRecord, indexOfLastRecord);
    const totalPages = Math.ceil(filteredInvoices.length / recordsPerPage);

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
                                <tr key={inv.id || index} className="hover:bg-indigo-50/10 transition-colors">
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
                                        {inv.customer?.customerName || inv.customerName}
                                    </td>
                                    <td className="px-6 py-2.5 text-xs font-medium text-slate-500">
                                        {inv.invoiceDate ? inv.invoiceDate.split('-').reverse().join('-') : 'N/A'}
                                    </td>
                                    <td className="px-6 py-2.5 text-right text-xs font-semibold text-indigo-950">
                                        ₹{inv.finalAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-6 py-2.5 text-center">
                                        <div className="flex justify-center">{renderStatus(inv.paymentStatus)}</div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* --- Pagination Footer --- */}
                <div className="px-6 py-4 bg-white border-t border-slate-100 flex items-center justify-between">
                    <p className="text-xs text-slate-500 font-medium">
                        Showing <span className="text-indigo-600">{currentRecords.length}</span> of {filteredInvoices.length} records
                    </p>
                    
                    <div className="flex items-center gap-2">
                        <button 
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft size={18} />
                        </button>

                        <div className="flex items-center gap-1">
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                                        currentPage === i + 1 
                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' 
                                        : 'text-slate-500 hover:bg-slate-50'
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>

                        <button 
                            disabled={currentPage === totalPages || totalPages === 0}
                            onClick={() => setCurrentPage(prev => prev + 1)}
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