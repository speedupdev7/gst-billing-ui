import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
    Plus, CheckCircle2, Clock, AlertCircle,
    ChevronLeft, ChevronRight, FileText, User,
    Calendar, ShoppingBag, Trash2, RotateCcw,
    Search, Eye, RefreshCw, TrendingUp, IndianRupee
} from 'lucide-react';
import DeleteIcon from '@mui/icons-material/Delete';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PrintIcon from '@mui/icons-material/Print';
import { useNavigate } from 'react-router-dom';
import ReusableDialogueBox from "../contextapi/ReusableDialogueBox";
import { useToast } from "../contextapi/ToastContext";
import InvoicePrint from "../contextapi/print/InvoicePrint";
import { useExport } from "../contextapi/ExportContext";

/* ─── Inline styles / CSS variables ─────────────────────────── */
const injectStyles = () => {
    if (document.getElementById('billing-v4-styles')) return;
    const style = document.createElement('style');
    style.id = 'billing-v4-styles';
    style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

    .bv4-root {
      --ink: #0f1117;
      --ink-2: #2d3142;
      --ink-3: #5a5f7a;
      --ink-4: #9499b8;
      --surface: #ffffff;
      --surface-2: #f5f6fa;
      --surface-3: #eceef7;
      --border: #e2e4f0;
      --accent: #4f46e5;
      --accent-light: #ede9fe;
      --accent-dim: #6366f1;
      --emerald: #059669;
      --emerald-bg: #ecfdf5;
      --amber: #d97706;
      --amber-bg: #fffbeb;
      --rose: #e11d48;
      --rose-bg: #fff1f2;
      --shadow-sm: 0 1px 3px rgba(15,17,23,.06), 0 1px 2px rgba(15,17,23,.04);
      --shadow-md: 0 4px 16px rgba(15,17,23,.08), 0 2px 6px rgba(15,17,23,.04);
      --shadow-lg: 0 20px 48px rgba(15,17,23,.12), 0 8px 16px rgba(15,17,23,.06);
      font-family:poppins;
      color: var(--ink);
      background: var(--surface-2);
      min-height: 100vh;
      padding: 28px 32px;
      box-sizing: border-box;
    }

    /* ── Card ── */
    .bv4-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 18px;
      box-shadow: var(--shadow-md);
      overflow: hidden;
    }

    /* ── Header ── */
    .bv4-header {
      padding: 20px 28px;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 14px;
      background: var(--surface);
    }

    .bv4-title-row {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .bv4-icon-box {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: var(--accent);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(79,70,229,.3);
      flex-shrink: 0;
    }

    .bv4-title {
      font-size: 16px;
      font-weight: 700;
      color: var(--ink);
      letter-spacing: -0.3px;
      margin: 0;
    }

    .bv4-subtitle {
      font-size: 11px;
      color: var(--ink-4);
      font-weight: 400;
      margin: 1px 0 0;
    }

    /* ── Controls Row ── */
    .bv4-controls {
      padding: 14px 28px;
      border-bottom: 1px solid var(--border);
      background: var(--surface-2);
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    .bv4-date-wrap {
      position: relative;
      display: flex;
      align-items: center;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      overflow: hidden;
      height: 36px;
    }

    .bv4-date-label {
      font-size: 10px;
      font-weight: 600;
      color: var(--ink-4);
      padding: 0 8px 0 12px;
      text-transform: uppercase;
      letter-spacing: .5px;
      white-space: nowrap;
    }

    .bv4-date-wrap .react-datepicker-wrapper,
    .bv4-date-wrap .react-datepicker__input-container {
      display: flex;
      align-items: center;
      height: 100%;
    }

    .bv4-date-wrap input {
      border: none;
      background: transparent;
      font-family: poppins;
      font-size: 12px;
      font-weight: 500;
      color: var(--ink);
      outline: none;
      width: 96px;
      padding-right: 12px;
    }

    .bv4-search-wrap {
      position: relative;
      flex: 1;
      min-width: 200px;
      max-width: 300px;
    }

    .bv4-search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--ink-4);
      pointer-events: none;
    }

    .bv4-search {
      width: 100%;
      padding: 8px 14px 8px 36px;
      border: 1px solid var(--border);
      border-radius: 10px;
      font-family: poppins;
      font-size: 12px;
      color: var(--ink);
      background: var(--surface);
      outline: none;
      transition: border-color .15s, box-shadow .15s;
      box-sizing: border-box;
    }

    .bv4-search:focus {
      border-color: var(--accent-dim);
      box-shadow: 0 0 0 3px rgba(99,102,241,.12);
    }

    .bv4-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 10px;
      font-family: poppins;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all .15s;
      white-space: nowrap;
      line-height: 1;
    }

    .bv4-btn-primary {
      background: var(--accent);
      color: #fff;
      box-shadow: 0 3px 10px rgba(79,70,229,.28);
    }
    .bv4-btn-primary:hover { background: #4338ca; transform: translateY(-1px); box-shadow: 0 5px 14px rgba(79,70,229,.35); }
    .bv4-btn-primary:active { transform: none; }

    .bv4-btn-ghost {
      background: var(--surface);
      color: var(--rose);
      border: 1px solid #fecdd3;
    }
    .bv4-btn-ghost:hover { background: var(--rose-bg); }

    .bv4-select {
      padding: 7px 10px;
      border: 1px solid var(--border);
      border-radius: 10px;
      font-family: poppins;
      font-size: 12px;
      color: var(--ink);
      background: var(--surface);
      outline: none;
      cursor: pointer;
    }

    /* ── Table ── */
    .bv4-table-wrap { width: 100%; overflow-x: auto; }

    .bv4-table {
      width: 100%;
      border-collapse: collapse;
    }

    .bv4-table thead tr {
      background: var(--surface-2);
      border-bottom: 1px solid var(--border);
    }

    .bv4-table th {
      padding: 11px 18px;
      font-size: 10px;
      font-weight: 700;
      color: var(--ink-4);
      text-transform: uppercase;
      letter-spacing: .7px;
      white-space: nowrap;
    }

    .bv4-table th.r { text-align: right; }
    .bv4-table th.c { text-align: center; }

    .bv4-table tbody tr {
      border-bottom: 1px solid var(--border);
      transition: background .12s;
    }
    .bv4-table tbody tr:last-child { border-bottom: none; }
    .bv4-table tbody tr:hover { background: #f8f9ff; }

    .bv4-table td {
      padding: 13px 18px;
      font-size: 12px;
      color: var(--ink-2);
      vertical-align: middle;
    }

    .bv4-table td.r { text-align: right; }
    .bv4-table td.c { text-align: center; }

    /* Sr No chip */
    .bv4-sr {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 26px;
      height: 26px;
      border-radius: 8px;
      background: var(--surface-3);
      color: var(--ink-3);
      font-size: 10px;
      font-weight: 700;
      font-family: poppins;
    }

    /* Invoice No */
    .bv4-inv-no {
      font-family: poppins;
      font-size: 11px;
      font-weight: 500;
      color: var(--accent);
      background: var(--accent-light);
      padding: 3px 8px;
      border-radius: 6px;
      white-space: nowrap;
    }

    /* Customer name */
    .bv4-customer {
      font-weight: 600;
      color: var(--ink);
    }
    .bv4-customer-sub {
      font-size: 10px;
      color: var(--ink-4);
      margin-top: 1px;
    }

    /* Amount */
    .bv4-amount {
      font-family: poppins;
      font-weight: 600;
      font-size: 12px;
      color: var(--ink);
    }
    .bv4-amount.green { color: var(--emerald); }
    .bv4-amount.red   { color: var(--rose); }

    /* Action buttons */
    .bv4-action-btn {
      width: 30px;
      height: 30px;
      border-radius: 8px;
      border: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all .15s;
    }

    .bv4-action-btn.view  { background: var(--accent-light); color: var(--accent); }
    .bv4-action-btn.view:hover  { background: var(--accent); color: #fff; }
    .bv4-action-btn.ret   { background: #e0f2fe; color: #0284c7; }
    .bv4-action-btn.ret:hover   { background: #0284c7; color: #fff; }
    .bv4-action-btn.del   { background: var(--rose-bg); color: var(--rose); }
    .bv4-action-btn.del:hover   { background: var(--rose); color: #fff; }

    /* Status badges */
    .bv4-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .5px;
      white-space: nowrap;
      border: none;
      cursor: default;
      font-family: poppins;
    }

    .bv4-badge.paid    { background: var(--emerald-bg); color: var(--emerald); }
    .bv4-badge.partial { background: var(--amber-bg);   color: var(--amber);   cursor: pointer; }
    .bv4-badge.partial:hover { filter: brightness(.95); }
    .bv4-badge.pending { background: var(--rose-bg);    color: var(--rose);    cursor: pointer; }
    .bv4-badge.pending:hover { filter: brightness(.95); }
    .bv4-badge.unknown { background: var(--surface-3); color: var(--ink-4); }

    /* ── Pagination ── */
    .bv4-footer {
      padding: 16px 28px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid var(--border);
      background: var(--surface-2);
      flex-wrap: wrap;
      gap: 12px;
    }

    .bv4-footer-info {
      font-size: 11px;
      color: var(--ink-4);
    }
    .bv4-footer-info span { color: var(--accent); font-weight: 700; }

    .bv4-page-btns { display: flex; align-items: center; gap: 5px; }

    .bv4-page-btn {
      width: 32px;
      height: 32px;
      border-radius: 9px;
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--ink-3);
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all .12s;
      font-family: poppins;
    }
    .bv4-page-btn:hover:not(:disabled) { background: var(--accent-light); color: var(--accent); border-color: var(--accent-light); }
    .bv4-page-btn.active { background: var(--accent); color: #fff; border-color: var(--accent); box-shadow: 0 3px 8px rgba(79,70,229,.3); }
    .bv4-page-btn:disabled { opacity: .4; cursor: not-allowed; }

    /* ── Modal ── */
    .bv4-overlay {
      position: fixed;
      inset: 0;
      z-index: 50;
      background: rgba(15,17,23,.45);
      backdrop-filter: blur(6px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .bv4-modal {
      background: var(--surface);
      border-radius: 20px;
      box-shadow: var(--shadow-lg);
      width: 100%;
      max-width: 680px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .bv4-modal-header {
      padding: 20px 24px;
      background: var(--accent);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .bv4-modal-title {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #fff;
      font-size: 14px;
      font-weight: 700;
    }

    .bv4-modal-body {
      padding: 24px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .bv4-meta-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 14px;
    }
    @media(min-width:540px) {
      .bv4-meta-grid { grid-template-columns: repeat(4, 1fr); }
    }

    .bv4-meta-item label {
      display: block;
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .8px;
      color: var(--ink-4);
      margin-bottom: 5px;
    }

    .bv4-meta-item p {
      font-size: 12px;
      font-weight: 600;
      color: var(--ink);
      display: flex;
      align-items: center;
      gap: 5px;
      margin: 0;
    }

    .bv4-divider {
      border: none;
      border-top: 1px solid var(--border);
      margin: 0;
    }

    /* Inner table */
    .bv4-inner-table-wrap {
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
    }

    .bv4-inner-table { width: 100%; border-collapse: collapse; }
    .bv4-inner-table thead tr { background: var(--surface-2); }
    .bv4-inner-table th {
      padding: 9px 14px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .5px;
      color: var(--ink-4);
    }
    .bv4-inner-table th.r { text-align: right; }
    .bv4-inner-table th.c { text-align: center; }
    .bv4-inner-table tbody tr { border-top: 1px solid var(--border); }
    .bv4-inner-table tbody tr:hover { background: #f8f9ff; }
    .bv4-inner-table td { padding: 10px 14px; font-size: 12px; color: var(--ink-2); }
    .bv4-inner-table td.r { text-align: right; }
    .bv4-inner-table td.c { text-align: center; }

    /* Summary strip */
    .bv4-summary {
      background: linear-gradient(135deg, #eef2ff 0%, #f0fdf4 100%);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 18px 22px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 16px;
    }

    .bv4-summary-big label {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .8px;
      color: var(--accent-dim);
      display: block;
      margin-bottom: 4px;
    }

    .bv4-summary-big p {
      font-size: 28px;
      font-weight: 800;
      color: var(--accent);
      margin: 0;
      line-height: 1;
      font-family: 'DM Mono', monospace;
    }

    .bv4-summary-stats {
      display: flex;
      gap: 24px;
    }

    .bv4-stat-item { text-align: right; }
    .bv4-stat-item:not(:last-child) {
      border-right: 1px solid var(--border);
      padding-right: 24px;
    }

    .bv4-stat-item label {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .6px;
      display: block;
      margin-bottom: 3px;
    }

    .bv4-stat-item p {
      font-size: 13px;
      font-weight: 700;
      margin: 0;
      font-family: 'DM Mono', monospace;
    }

    .bv4-stat-item.green label { color: var(--emerald); }
    .bv4-stat-item.green p { color: var(--emerald); }
    .bv4-stat-item.red   label { color: var(--rose); }
    .bv4-stat-item.red   p { color: var(--rose); }

    .bv4-modal-footer {
      padding: 14px 24px;
      border-top: 1px solid var(--border);
      background: var(--surface-2);
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }

    .bv4-btn-outline {
      background: var(--surface);
      color: var(--ink-3);
      border: 1px solid var(--border);
    }
    .bv4-btn-outline:hover { background: var(--surface-3); }

    .bv4-btn-yellow {
      background: #f59e0b;
      color: #fff;
      box-shadow: 0 3px 10px rgba(245,158,11,.28);
    }
    .bv4-btn-yellow:hover { background: #d97706; }

    /* Delete modal */
    .bv4-del-modal {
      background: var(--surface);
      border-radius: 20px;
      box-shadow: var(--shadow-lg);
      width: 100%;
      max-width: 380px;
      padding: 32px 28px;
      text-align: center;
    }

    .bv4-del-icon {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: var(--rose-bg);
      color: var(--rose);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
    }

    .bv4-del-modal h3 {
      font-size: 16px;
      font-weight: 700;
      color: var(--ink);
      margin: 0 0 8px;
    }

    .bv4-del-modal p {
      font-size: 12px;
      color: var(--ink-4);
      line-height: 1.6;
      margin: 0 0 22px;
    }

    .bv4-del-btns { display: flex; gap: 10px; }

    .bv4-del-btns button {
      flex: 1;
      padding: 11px;
      border-radius: 12px;
      font-family: poppins;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      border: none;
      transition: all .15s;
    }

    .bv4-del-cancel { background: var(--surface-3); color: var(--ink-2); border: 1px solid var(--border) !important; }
    .bv4-del-cancel:hover { background: var(--surface-2); }
    .bv4-del-confirm { background: var(--rose); color: #fff; box-shadow: 0 3px 10px rgba(225,29,72,.25); }
    .bv4-del-confirm:hover { background: #be123c; }

    /* empty state */
    .bv4-empty {
      padding: 64px 20px;
      text-align: center;
      color: var(--ink-4);
      font-size: 13px;
    }
    .bv4-empty-icon {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      background: var(--surface-3);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      color: var(--ink-4);
    }

    /* Separator label in controls */
    .bv4-sep {
      width: 1px;
      height: 20px;
      background: var(--border);
      flex-shrink: 0;
    }

    .bv4-show-label {
      font-size: 11px;
      color: var(--ink-4);
      white-space: nowrap;
    }
    `;
    document.head.appendChild(style);
};

/* ─── Component ─────────────────────────────────────────────── */
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
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [unitToDelete, setUnitToDelete] = useState(null);

    const navigate = useNavigate();
    const toast = useToast();
    const { printComponent } = useExport();

    useEffect(() => { injectStyles(); }, []);

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

    useEffect(() => { fetchInvoices(); }, [page, pageSize]);
    useEffect(() => { setPage(0); }, [searchTerm, fromDate, toDate]);

    const handleReset = () => { setSearchTerm(""); setFromDate(null); setToDate(null); setPage(0); };

    const handleViewDetails = async (invoice) => {
        const invoiceNumber = invoice?.invoiceNo;
        if (!invoiceNumber) { toast.error("Invoice number not available."); return; }
        setIsLoadingDetails(true);
        try {
            const res = await axios.get(`/api/invoice/search-by-number?invoiceNo=${encodeURIComponent(invoiceNumber)}`);
            setSelectedInvoice(res?.data?.data || res?.data || invoice);
            setIsModalOpen(true);
        } catch {
            toast.error("Unable to load invoice details.");
        } finally {
            setIsLoadingDetails(false);
        }
    };

    const openDeleteModal = (id) => { setUnitToDelete(id); setIsDeleteDialogOpen(true); };

    const handleConfirmDelete = async () => {
        try {
            await axios.delete(`/api/invoice/${unitToDelete}`);
            setInvoices(prev => prev.filter(item => (item.balanceId || item.invoiceId) !== unitToDelete));
            toast.success("Record deleted successfully!");
        } catch { toast.error("Delete failed."); }
        finally { setIsDeleteDialogOpen(false); setUnitToDelete(null); }
    };

    /* ── Status Badge ── */
    const renderStatus = (status, invoice) => {
        const s = status?.toString().trim().toLowerCase();
        if (s === "completed" || s === "paid" || s === "full")
            return <span className="bv4-badge paid"><CheckCircle2 size={9} strokeWidth={3} />Paid</span>;

        if (s === "partial pending" || s === "partial")
            return (
                <button className="bv4-badge partial"
                    onClick={() => invoice && navigate(`/billing-settlement-v4?invoiceId=${invoice.invoiceId || invoice.balanceId}`)}>
                    <Clock size={9} strokeWidth={3} />Partial
                </button>
            );

        if (s === "pending" || s === "unpaid" || s === "due")
            return (
                <button className="bv4-badge pending"
                    onClick={() => invoice && navigate(`/billing-settlement-v4?invoiceId=${invoice.invoiceId || invoice.balanceId}`)}>
                    <AlertCircle size={9} strokeWidth={3} />Pending
                </button>
            );

        return <span className="bv4-badge unknown">{status || "N/A"}</span>;
    };

    /* ── Print ── */
    const handlePrintInvoice = () => {
        if (!selectedInvoice) { toast.error("Invoice data not found"); return; }
        const seller = {
            name: selectedInvoice?.sellerName || "NextByte",
            address: selectedInvoice?.sellerAddress || "Nashik",
            city: selectedInvoice?.sellerCity || "Nashik",
            state: selectedInvoice?.sellerState || "Maharashtra",
            pincode: selectedInvoice?.sellerPincode || "422001",
            gstin: selectedInvoice?.sellerGstin || "27ABCDE1234F1Z5",
            contact: selectedInvoice?.sellerContact || "9876543210",
            email: selectedInvoice?.sellerEmail || "nextbyte@gmail.com",
        };
        const buyerData = selectedInvoice?.customer || {
            name: selectedInvoice?.unitName || "Customer",
            address: selectedInvoice?.address || "",
            city: selectedInvoice?.placeOfSupply || "",
            state: selectedInvoice?.state || selectedInvoice?.placeOfSupply || "",
            pincode: selectedInvoice?.pincode || "",
            gstin: selectedInvoice?.customerGstin || "",
        };
        const itemsForPrint = (selectedInvoice?.invoiceItems || selectedInvoice?.items || []).map((item, i) => {
            const qty = Number(item.quantity || item.qty || 0);
            const rate = Number(item.rate || item.salePrice || 0);
            const grossAmount = qty * rate;
            const discountAmt = Number(item.discountAmt ?? 0);
            const taxableAmount = Number(item.taxableAmount ?? Math.max(0, grossAmount - discountAmt));
            return {
                invoiceItemId: item.invoiceItemId || i,
                itemName: item.itemName || item.productName || "",
                batchCode: item.batchCode || "",
                hsnCode: item.hsnCode || "",
                quantity: qty, rate, grossAmount, discountAmt,
                discountPct: discountAmt > 0 && grossAmount > 0 ? (discountAmt / grossAmount) * 100 : 0,
                taxableAmount,
                gstRate: item.gstRate ?? 0,
                lineTotal: item.lineTotal ?? 0,
            };
        });
        printComponent({
            Component: InvoicePrint,
            props: {
                data: {
                    seller,
                    invoice: {
                        number: selectedInvoice?.invoiceNo || "",
                        date: selectedInvoice?.invoiceDate || "",
                        eWayBill: selectedInvoice?.vehicleNumber || "",
                        paymentMode: selectedInvoice?.paymentMode || "",
                        dispatchedThrough: selectedInvoice?.transporterName || "",
                        destination: selectedInvoice?.placeOfSupply || "",
                    },
                    consignee: buyerData, buyer: buyerData, items: itemsForPrint,
                    tax: { type: "CGST_SGST", cgstRate: 9, sgstRate: 9, igstRate: 18 },
                    declaration: "This is a computer generated invoice.",
                    bankDetails: { bankName: "State Bank Of India", accountNo: "123456789", ifsc: "SBIN00001", branch: "Nashik" },
                },
            },
            title: "Invoice Print",
        });
    };

    /* ── Filtered data ── */
    const filteredInvoices = invoices.filter(inv => {
        const name = (inv.unitName || inv.customer?.customerName || inv.customerName || "").toLowerCase();
        const invNo = (inv.invoiceNo || "").toLowerCase();
        const matchesSearch = invNo.includes(searchTerm.toLowerCase()) || name.includes(searchTerm.toLowerCase());
        const invDate = inv.invoiceDate ? new Date(inv.invoiceDate) : null;
        let matchesDate = true;
        if (fromDate && invDate && invDate < fromDate) matchesDate = false;
        if (toDate && invDate) {
            const end = new Date(toDate); end.setHours(23, 59, 59);
            if (invDate > end) matchesDate = false;
        }
        return matchesSearch && matchesDate;
    });

    /* ── Modal amounts ── */
    const selectedBalance = selectedInvoice?.balance || selectedInvoice;
    const netPayableAmount = selectedBalance?.invoiceAmount ?? selectedInvoice?.invoiceAmount ?? 0;
    const paidAmount = selectedBalance?.paidAmount ?? (netPayableAmount - (selectedBalance?.balanceAmount ?? selectedInvoice?.balanceAmount ?? 0));
    const dueBalanceAmount = selectedBalance?.balanceAmount ?? selectedInvoice?.balanceAmount ?? 0;

    const fmtINR = (n) => Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 });
    const hasFilter = searchTerm || fromDate || toDate;

    /* ── JSX ── */
    return (
        <div className="bv4-root">
            <ReusableDialogueBox
                isOpen={isDeleteDialogOpen}
                title="Delete Record"
                message="Are you sure you want to permanently delete this invoice?"
                onConfirm={handleConfirmDelete}
                onCancel={() => setIsDeleteDialogOpen(false)}
            />

            <div className="bv4-card">

                {/* ─ Header ─ */}
                <div className="bv4-header">
                    <div className="bv4-title-row">
                        <div className="bv4-icon-box">
                            <FileText size={18} color="#fff" strokeWidth={2} />
                        </div>
                        <div>
                            <h2 className="bv4-title">Invoice List</h2>
                            <p className="bv4-subtitle">Manage and track all billing records</p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/billing_v4')}
                        className="bv4-btn bv4-btn-primary"
                    >
                        <Plus size={14} /> New Invoice
                    </button>
                </div>

                {/* ─ Controls ─ */}
                <div className="bv4-controls">
                    {/* From Date */}
                    <div className="bv4-date-wrap">
                        <span className="bv4-date-label">From</span>
                        <DatePicker
                            selected={fromDate}
                            onChange={(d) => setFromDate(d)}
                            placeholderText="dd-mm-yyyy"
                            dateFormat="dd-MM-yyyy"
                        />
                    </div>

                    {/* To Date */}
                    <div className="bv4-date-wrap">
                        <span className="bv4-date-label">To</span>
                        <DatePicker
                            selected={toDate}
                            onChange={(d) => setToDate(d)}
                            placeholderText="dd-mm-yyyy"
                            dateFormat="dd-MM-yyyy"
                        />
                    </div>

                    {hasFilter && (
                        <button onClick={handleReset} className="bv4-btn bv4-btn-ghost" style={{ height: 36, padding: '0 12px' }}>
                            <RotateCcw size={12} /> Reset
                        </button>
                    )}

                    <div className="bv4-sep" />

                    {/* Search */}
                    <div className="bv4-search-wrap">
                        <Search size={13} className="bv4-search-icon" />
                        <input
                            type="text"
                            className="bv4-search"
                            placeholder="Search invoice or client…"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="bv4-show-label">Show</span>
                        <select
                            value={pageSize}
                            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
                            className="bv4-select"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                </div>

                {/* ─ Table ─ */}
                <div className="bv4-table-wrap">
                    <table className="bv4-table">
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

                                        const billAmount =
                                            Number(inv.invoiceAmount || 0);

                                        let pendingAmount = 0;
                                        let totalPaid = 0;

                                        if (
                                            inv.status?.toLowerCase() === "paid"
                                        ) {

                                            totalPaid = billAmount;
                                            pendingAmount = 0;

                                        }
                                        else {

                                            pendingAmount = billAmount;
                                            totalPaid = 0;
                                        }

                                return (
                                    <tr key={inv.balanceId || inv.invoiceId || index}>
                                        {/* # */}
                                      

                                        {/* Actions */}
                                        <td className="c">
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                                <button
                                                    className="bv4-action-btn view"
                                                    title="View Details"
                                                    onClick={() => handleViewDetails(inv)}
                                                >
                                                    <VisibilityIcon sx={{ fontSize: 14 }} />
                                                </button>
                                                <button
                                                    className="bv4-action-btn ret"
                                                    title="Return Invoice"
                                                    onClick={() => navigate("/billing-return-v4", { state: { invoice: inv } })}
                                                >
                                                    <ChangeCircleIcon sx={{ fontSize: 16 }} />
                                                </button>
                                                <button
                                                    className="bv4-action-btn del"
                                                    title="Delete Invoice"
                                                    onClick={() => openDeleteModal(inv.invoiceId || inv.balanceId)}
                                                >
                                                    <DeleteIcon sx={{ fontSize: 14 }} />
                                                </button>
                                            </div>
                                        </td>

                                        {/* Invoice No */}
                                        <td>
                                            <span className="bv4-inv-no">#{inv.invoiceNo || "N/A"}</span>
                                        </td>

                                        {/* Date */}
                                        <td style={{ color: 'var(--ink-3)', fontWeight: 500 }}>
                                            {inv.invoiceDate ? inv.invoiceDate.split("-").reverse().join("-") : "—"}
                                        </td>

                                        {/* Customer */}
                                        <td>
                                            <div className="bv4-customer">{inv.unitName || "—"}</div>
                                        </td>

                                                {/* CUSTOMER NAME */}

                                                <td className="px-6 py-2.5 text-xs font-semibold text-slate-700">

                                                    {inv.unitName || "N/A"}

                                                </td>

                                                {/* TOTAL PAID */}

                                                <td className="px-6 py-2.5 text-right text-xs font-bold text-emerald-600">

                                                    ₹{
                                                        totalPaid.toLocaleString(
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
                                                        pendingAmount.toLocaleString(
                                                            "en-IN",
                                                            {
                                                                minimumFractionDigits: 2
                                                            }
                                                        )
                                                    }

                                                </td>

                                        {/* Status */}
                                        <td className="c">
                                            {renderStatus(inv.status, inv)}
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="9">
                                        <div className="bv4-empty">
                                            <div className="bv4-empty-icon">
                                                <FileText size={24} />
                                            </div>
                                            <p style={{ margin: '0 0 6px', fontWeight: 600, color: 'var(--ink-3)' }}>No invoices found</p>
                                            <p style={{ margin: 0, fontSize: 11 }}>Try adjusting your search or date filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ─ Pagination ─ */}
                <div className="bv4-footer">
                    <p className="bv4-footer-info">
                        Showing <span>{filteredInvoices.length}</span> of {totalElements} records
                    </p>

                    <div className="bv4-page-btns">
                        <button
                            className="bv4-page-btn"
                            disabled={page === 0}
                            onClick={() => setPage(p => Math.max(p - 1, 0))}
                        >
                            <ChevronLeft size={15} />
                        </button>

                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                className={`bv4-page-btn${page === i ? ' active' : ''}`}
                                onClick={() => setPage(i)}
                            >
                                {i + 1}
                            </button>
                        ))}

                        <button
                            className="bv4-page-btn"
                            disabled={page >= totalPages - 1 || totalPages === 0}
                            onClick={() => setPage(p => Math.min(p + 1, totalPages - 1))}
                        >
                            <ChevronRight size={15} />
                        </button>
                    </div>
                </div>
            </div>

            {/* ─── VIEW MODAL ─── */}
            {isModalOpen && selectedInvoice && (
                <div className="bv4-overlay">
                    <div className="bv4-modal">
                        {/* Header */}
                        <div className="bv4-modal-header">
                            <div className="bv4-modal-title">
                                <FileText size={16} />
                                Invoice Preview
                            </div>
                            <button
                                onClick={handlePrintInvoice}
                                className="bv4-btn bv4-btn-yellow"
                                style={{ fontSize: 11 }}
                            >
                                <PrintIcon sx={{ fontSize: 13 }} /> Print
                            </button>
                        </div>

                        {/* Body */}
                        <div className="bv4-modal-body">
                            {/* Meta */}
                            <div className="bv4-meta-grid">
                                <div className="bv4-meta-item">
                                    <label>Client</label>
                                    <p><User size={12} color="var(--accent)" />{selectedInvoice.unitName}</p>
                                </div>
                                <div className="bv4-meta-item">
                                    <label>Invoice No</label>
                                    <p style={{ fontFamily: "'DM Mono', monospace" }}>#{selectedInvoice.invoiceNo || "N/A"}</p>
                                </div>
                                <div className="bv4-meta-item">
                                    <label>Date</label>
                                    <p><Calendar size={12} color="var(--accent)" />{selectedInvoice.invoiceDate}</p>
                                </div>
                                <div className="bv4-meta-item">
                                    <label>Status</label>
                                    <div>{renderStatus(selectedInvoice.status)}</div>
                                </div>
                            </div>

                            <hr className="bv4-divider" />

                            {/* Items */}
                            <div>
                                <p style={{ margin: '0 0 10px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.8px', color: 'var(--ink-4)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <ShoppingBag size={12} color="var(--accent)" /> Itemized Breakdown
                                </p>
                                <div className="bv4-inner-table-wrap">
                                    <table className="bv4-inner-table">
                                        <thead>
                                            <tr>
                                                <th>Description</th>
                                                <th className="c">Qty</th>
                                                <th className="r">Rate</th>
                                                <th className="r">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(selectedInvoice.invoiceItems || selectedInvoice.items || []).length > 0
                                                ? (selectedInvoice.invoiceItems || selectedInvoice.items).map((item, idx) => (
                                                    <tr key={idx}>
                                                        <td style={{ fontWeight: 500 }}>{item.itemName || item.productName || "Standard Service"}</td>
                                                        <td className="c" style={{ fontWeight: 600 }}>{item.quantity || 1}</td>
                                                        <td className="r">₹{fmtINR(item.rate || 0)}</td>
                                                        <td className="r" style={{ fontWeight: 700 }}>₹{fmtINR((item.quantity || 1) * (item.rate || 0))}</td>
                                                    </tr>
                                                ))
                                                : (
                                                    <tr><td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: 'var(--ink-4)', fontStyle: 'italic', fontSize: 12 }}>No detailed items recorded</td></tr>
                                                )
                                            }
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="bv4-summary">
                                <div className="bv4-summary-big">
                                    <label>Net Payable</label>
                                    <p>₹{fmtINR(netPayableAmount)}</p>
                                </div>
                                <div className="bv4-summary-stats">
                                    <div className="bv4-stat-item green">
                                        <label>Paid</label>
                                        <p>₹{fmtINR(paidAmount)}</p>
                                    </div>
                                    <div className="bv4-stat-item red">
                                        <label>Due Balance</label>
                                        <p>₹{fmtINR(dueBalanceAmount)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bv4-modal-footer">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="bv4-btn bv4-btn-outline"
                            >
                                Close Preview
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── DELETE MODAL ─── */}
            {isDeleteDialogOpen && (
                <div className="bv4-overlay" style={{ zIndex: 60 }}>
                    <div className="bv4-del-modal">
                        <div className="bv4-del-icon">
                            <Trash2 size={28} />
                        </div>
                        <h3>Confirm Deletion</h3>
                        <p>Are you sure you want to permanently delete this invoice? This action cannot be undone.</p>
                        <div className="bv4-del-btns">
                            <button className="bv4-del-cancel" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</button>
                            <button className="bv4-del-confirm" onClick={handleConfirmDelete}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BillingV4List;