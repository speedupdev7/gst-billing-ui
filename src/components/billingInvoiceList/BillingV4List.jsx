import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Plus, CheckCircle2, Clock, AlertCircle, ChevronLeft, ChevronRight, X, FileText, User, Calendar, ShoppingBag, Trash2, RotateCcw } from 'lucide-react';
import DeleteIcon from '@mui/icons-material/Delete';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import { useNavigate } from 'react-router-dom';
import ReusableDialogueBox from "../contextapi/ReusableDialogueBox";
// Custom Context Hooks
import { useToast } from "../contextapi/ToastContext";

const BillingV4List = () => {
    const [invoices, setInvoices] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);

    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    const navigate = useNavigate();
    const toast = useToast();

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [unitToDelete, setUnitToDelete] = useState(null);

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
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, [page, pageSize]);

    useEffect(() => {
        setPage(0);
    }, [searchTerm, fromDate, toDate]);

    // RESET ALL FILTERS
    const handleReset = () => {
        setSearchTerm("");
        setFromDate(null);
        setToDate(null);
        setPage(0);
    };

    const handleViewDetails = async (invoice) => {
        const invoiceNumber = invoice?.invoiceNo;
        if (!invoiceNumber) {
            toast.error("Invoice number not available for detail view.");
            return;
        }

        setIsLoadingDetails(true);
        try {
            const res = await axios.get(`/api/invoice/search-by-number?invoiceNo=${encodeURIComponent(invoiceNumber)}`);
            const payload = res?.data?.data || res?.data || invoice;
            setSelectedInvoice(payload);
            setIsModalOpen(true);
        } catch (err) {
            console.error("Error fetching invoice details:", err);
            toast.error("Unable to load invoice details. Please try again.");
        } finally {
            setIsLoadingDetails(false);
        }
    };

    const openDeleteModal = (invoiceId) => {
        setUnitToDelete(invoiceId);
        setIsDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        try {
            await axios.delete(`/api/invoice/${unitToDelete}`);
            setInvoices(prev => prev.filter(item => (item.balanceId || item.invoiceId) !== unitToDelete));
            toast.success("Record deleted successfully!");
        } catch (err) {
            toast.error("Delete failed.");
        } finally {
            setIsDeleteDialogOpen(false);
            setUnitToDelete(null);
        }
    };

    const renderStatus = (status, invoice) => {

        const s = status?.toString().trim().toLowerCase();

        const baseClass =
            "px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 border transition-all min-w-[100px]";

        // PAID
        if (s === "completed" || s === "paid" || s === "full") {

            return (
                <span
                    className={`${baseClass} bg-emerald-50 text-emerald-600 border-emerald-100`}
                >
                    <CheckCircle2 size={10} strokeWidth={3} />
                    Paid
                </span>
            );
        }

        // PARTIAL
        if (s === "partial pending" || s === "partial") {

            return (
                <button
                    onClick={() =>
                        navigate(
                            `/billing-settlement-v4?invoiceId=${invoice.invoiceId || invoice.balanceId}`
                        )
                    }
                    className={`${baseClass} bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100 cursor-pointer`}
                >
                    <Clock size={10} strokeWidth={3} />
                    Partial
                </button>
            );
        }

        // PENDING
        if (s === "pending" || s === "unpaid" || s === "due") {

            return (
                <button
                    onClick={() =>
                        navigate(
                            `/billing-settlement-v4?invoiceId=${invoice.invoiceId || invoice.balanceId}`
                        )
                    }
                    className={`${baseClass} bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100 cursor-pointer`}
                >
                    <AlertCircle size={10} strokeWidth={3} />
                    Pending
                </button>
            );
        }

        return (
            <span
                className={`${baseClass} bg-slate-50 text-slate-400 border-slate-200`}
            >
                {status || "N/A"}
            </span>
        );
    };

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

    const indexOfFirstRecord = page * pageSize;
    const selectedBalance = selectedInvoice?.balance || selectedInvoice;
    const netPayableAmount = selectedBalance?.invoiceAmount ?? selectedInvoice?.invoiceAmount ?? 0;
    const paidAmount = selectedBalance?.paidAmount ?? (netPayableAmount - (selectedBalance?.balanceAmount ?? selectedInvoice?.balanceAmount ?? 0));
    const dueBalanceAmount = selectedBalance?.balanceAmount ?? selectedInvoice?.balanceAmount ?? 0;

    return (
        <div className="min-h-screen bg-slate-50 p-6 font-poppins text-slate-600" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <div className="max-w-[1400px] mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {/* DELETE DIALOGUE */}
                <ReusableDialogueBox
                    isOpen={isDeleteDialogOpen}
                    title="Delete Record"
                    message="Are you sure you want to permanently delete this company?"
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setIsDeleteDialogOpen(false)}
                />
                {/* --- Header --- */}
                <div className="px-6 py-5 border-b border-indigo-50 bg-white">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-5">
                            <h2 className="text-xl font-semibold text-indigo-950 tracking-tight">Invoice List</h2>
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

                                {/* RESET BUTTON - Visible only when filters are active */}
                                {(searchTerm || fromDate || toDate) && (
                                    <button
                                        onClick={handleReset}
                                        className="ml-2 px-3 py-1.5 text-[10px] font-bold text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-lg transition-all flex items-center gap-1 uppercase tracking-wider border border-rose-100"
                                    >
                                        <RotateCcw size={12} /> Reset
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search invoice or client..."
                                    className="pl-4 pr-4 py-1.5 w-64 border border-slate-200 rounded-lg text-xs bg-slate-50/50 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button onClick={() => navigate('/billing_v4')} className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 shadow-md transition-all active:scale-95 cursor-pointer">
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

                                {/* SR NO */}



                                {/* ACTIONS */}

                                <th className="px-6 py-3 text-[10px] font-semibold text-indigo-900/50 uppercase w-40 text-center">
                                    Actions
                                </th>

                                {/* INVOICE NO */}

                                <th className="px-6 py-3 text-[10px] font-semibold text-indigo-900/50 uppercase text-center">
                                    Inv No
                                </th>

                                {/* INVOICE DATE */}

                                <th className="px-6 py-3 text-[10px] font-semibold text-indigo-900/50 uppercase text-center">
                                    Inv Date
                                </th>

                                {/* CUSTOMER NAME */}

                                <th className="px-6 py-3 text-[10px] font-semibold text-indigo-900/50 uppercase">
                                    Customer Name
                                </th>

                                {/* INVOICE AMOUNT */}

                                <th className="px-6 py-3 text-[10px] font-semibold text-indigo-900/50 uppercase text-right">
                                    Invoice Amount
                                </th>

                                {/* TOTAL PAID */}

                                <th className="px-6 py-3 text-[10px] font-semibold text-indigo-900/50 uppercase text-right">
                                    Total Paid
                                </th>

                                {/* PENDING AMOUNT */}

                                <th className="px-6 py-3 text-[10px] font-semibold text-indigo-900/50 uppercase text-right">
                                    Pending Amount
                                </th>

                                {/* STATUS */}

                                <th className="px-6 py-3 text-[10px] font-semibold text-indigo-900/50 uppercase text-center">
                                    Status
                                </th>

                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">

                            {
                                filteredInvoices.length > 0 ? (

                                    filteredInvoices.map((inv, index) => {

                                        const billAmount = Number(inv.invoiceAmount || 0);
                                        const totalPaid = Number(inv.paidAmount ?? 0);
                                        const pendingAmount = Number(inv.pendingAmount ?? 0);

                                        const displayPaid = totalPaid || (inv.status?.toLowerCase() === "paid" ? billAmount : 0);
                                        const displayPending = pendingAmount || (inv.status?.toLowerCase() === "paid" ? 0 : billAmount);

                                        return (

                                            <tr
                                                key={inv.balanceId || inv.invoiceId || index}
                                                className="hover:bg-indigo-50/10 transition-colors"
                                            >



                                                {/* ACTIONS */}

                                                <td className="px-6 py-2.5">

                                                    <div className="flex items-center justify-center gap-2.5">

                                                        <button
                                                            onClick={() => handleViewDetails(inv)}
                                                            title="View Details"
                                                            className="w-7 h-7 flex items-center justify-center text-indigo-500 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-md transition-all cursor-pointer"
                                                        >

                                                            <VisibilityIcon sx={{ fontSize: 15 }} />

                                                        </button>

                                                        <button
                                                            title="Return Invoice"
                                                            onClick={() =>
                                                                navigate("/billing-return-v4")
                                                            }
                                                            className="w-7 h-7 flex items-center justify-center text-sky-500 bg-sky-50 hover:bg-sky-500 hover:text-white rounded-md transition-all cursor-pointer"
                                                        >

                                                            <ChangeCircleIcon sx={{ fontSize: 20 }} />

                                                        </button>

                                                        <button
                                                            onClick={() =>
                                                                openDeleteModal(
                                                                    inv.invoiceId || inv.balanceId
                                                                )
                                                            }
                                                            title="Delete Invoice"
                                                            className="w-7 h-7 flex items-center justify-center text-rose-500 bg-rose-50 hover:bg-rose-500 hover:text-white rounded-md transition-all cursor-pointer"
                                                        >

                                                            <DeleteIcon sx={{ fontSize: 15 }} />

                                                        </button>

                                                    </div>

                                                </td>

                                                {/* INVOICE NO */}

                                                <td className="px-6 py-2.5 text-xs font-bold text-indigo-700 text-center">

                                                    {inv.invoiceNo || "N/A"}

                                                </td>

                                                {/* INVOICE DATE */}

                                                <td className="px-6 py-2.5 text-xs font-medium text-slate-500 text-center">

                                                    {
                                                        inv.invoiceDate
                                                            ? inv.invoiceDate
                                                                .split("-")
                                                                .reverse()
                                                                .join("-")
                                                            : "N/A"
                                                    }

                                                </td>

                                                {/* CUSTOMER NAME */}

                                                <td className="px-6 py-2.5 text-xs font-semibold text-slate-700">

                                                    {inv.unitName || "N/A"}

                                                </td>

                                                {/* INVOICE AMOUNT */}

                                                <td className="px-6 py-2.5 text-right text-xs font-bold text-slate-700">

                                                    ₹{Number(inv.invoiceAmount ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}

                                                </td>

                                                {/* TOTAL PAID */}

                                                <td className="px-6 py-2.5 text-right text-xs font-bold text-emerald-600">

                                                    ₹{
                                                        displayPaid.toLocaleString(
                                                            "en-IN",
                                                            {
                                                                minimumFractionDigits: 2
                                                            }
                                                        )
                                                    }

                                                </td>

                                                {/* PENDING AMOUNT */}

                                                <td className="px-6 py-2.5 text-right text-xs font-bold text-rose-500">

                                                    ₹{
                                                        displayPending.toLocaleString(
                                                            "en-IN",
                                                            {
                                                                minimumFractionDigits: 2
                                                            }
                                                        )
                                                    }

                                                </td>

                                                {/* STATUS */}

                                                <td className="px-6 py-2.5 text-center">

                                                    <div className="flex justify-center">

                                                        {renderStatus(inv.status, inv)}

                                                    </div>

                                                </td>

                                            </tr>
                                        );
                                    })

                                ) : (

                                    <tr>

                                        <td
                                            colSpan="8"
                                            className="px-6 py-10 text-center text-slate-400 text-xs italic"
                                        >

                                            No invoices found. Try adjusting your filters.

                                        </td>

                                    </tr>
                                )
                            }

                        </tbody>
                    </table>
                </div>

                {/* --- Pagination Footer --- */}
                <div className="px-6 py-4 bg-white border-t border-slate-100 flex items-center justify-between">
                    <p className="text-xs text-slate-500 font-medium">
                        Showing <span className="text-indigo-600">{filteredInvoices.length}</span> of {totalElements} records
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
                                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${page === i
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

            {/* --- VIEW MODAL COMPONENT --- */}
            {isModalOpen && selectedInvoice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm transition-opacity">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 bg-indigo-600 flex justify-between items-center shrink-0">
                            <h3 className="text-white font-semibold flex items-center gap-2">
                                <FileText size={18} /> Invoice Preview
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white"><X size={20} /></button>
                        </div>

                        <div className="p-6 space-y-6 overflow-y-auto">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-slate-400">Client Name</label>
                                    <p className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                                        <User size={14} className="text-indigo-500" /> {selectedInvoice.unitName}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-slate-400">Invoice No</label>
                                    <p className="text-xs font-mono text-slate-700 font-bold">#{selectedInvoice.invoiceNo || 'N/A'}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-slate-400">Billing Date</label>
                                    <p className="text-xs text-slate-700 flex items-center gap-2 font-medium">
                                        <Calendar size={14} className="text-indigo-500" /> {selectedInvoice.invoiceDate}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-slate-400">Current Status</label>
                                    <div className="scale-90 origin-left">{renderStatus(selectedInvoice.status)}</div>
                                </div>
                            </div>

                            <hr className="border-slate-100" />

                            <div className="space-y-3">
                                <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-2 tracking-widest">
                                    <ShoppingBag size={14} className="text-indigo-500" /> Itemized Breakdown
                                </label>
                                <div className="border border-slate-100 rounded-xl overflow-hidden">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-slate-50">
                                            <tr className="border-b border-slate-100">
                                                <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase">Description</th>
                                                <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase text-center">Qty</th>
                                                <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase text-right">Rate</th>
                                                <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {(selectedInvoice.invoiceItems || selectedInvoice.items || []).length > 0 ? (
                                                (selectedInvoice.invoiceItems || selectedInvoice.items).map((item, idx) => (
                                                    <tr key={idx} className="hover:bg-slate-50/50">
                                                        <td className="px-4 py-3 text-xs font-medium text-slate-700">{item.itemName || item.productName || 'Standard Service'}</td>
                                                        <td className="px-4 py-3 text-xs text-slate-600 text-center font-medium">{item.quantity || 1}</td>
                                                        <td className="px-4 py-3 text-xs text-slate-600 text-right font-medium">₹{(item.rate || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                        <td className="px-4 py-3 text-xs font-bold text-slate-800 text-right">₹{((item.quantity || 1) * (item.rate || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="4" className="px-4 py-8 text-center text-xs text-slate-400 italic">No detailed items recorded</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-center gap-4 border border-slate-100">
                                <div className="text-center md:text-left">
                                    <label className="text-[10px] uppercase font-bold text-indigo-400 tracking-widest">Net Payable</label>
                                    <p className="text-3xl font-bold text-indigo-700">₹{netPayableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                                </div>
                                <div className="flex gap-8">
                                    <div className="text-right border-r border-slate-200 pr-8">
                                        <label className="text-[10px] uppercase font-bold text-emerald-500">Paid</label>
                                        <p className="text-sm font-bold text-slate-700">₹{paidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                                    </div>
                                    <div className="text-right">
                                        <label className="text-[10px] uppercase font-bold text-rose-400">Due Balance</label>
                                        <p className="text-sm font-bold text-rose-500">₹{dueBalanceAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
                            <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100">Close Preview</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- DELETE CONFIRMATION MODAL --- */}
            {isDeleteDialogOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl text-center">
                        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Confirm Delete</h3>
                        <p className="text-sm text-slate-500 mb-6">Are you sure you want to delete this invoice? This action cannot be undone.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsDeleteDialogOpen(false)}
                                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="flex-1 px-4 py-2.5 bg-rose-500 text-white rounded-xl text-xs font-bold hover:bg-rose-600 shadow-md shadow-rose-100"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BillingV4List;