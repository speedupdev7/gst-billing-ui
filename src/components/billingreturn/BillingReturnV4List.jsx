import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Plus, CheckCircle2, Clock, AlertCircle,
  ChevronLeft, ChevronRight, FileText, User,
  Calendar, ShoppingBag, Trash2, RotateCcw,
  Search, RefreshCw, TrendingUp, IndianRupee,
  RefreshCcw, Eye
} from 'lucide-react';
import DeleteIcon from '@mui/icons-material/Delete';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PrintIcon from '@mui/icons-material/Print';
import { useNavigate } from 'react-router-dom';
import ReusableDialogueBox from "../contextapi/ReusableDialogueBox";
import { useToast } from "../contextapi/ToastContext";

/* ─── Inline CSS ─────────────────────────────────────────────── */
const injectStyles = () => {
  if (document.getElementById('brt4-styles')) return;
  const style = document.createElement('style');
  style.id = 'brt4-styles';
  style.textContent = `
    .brt4-root {
      --ink:       #0f1117;
      --ink-2:     #2d3142;
      --ink-3:     #5a5f7a;
      --ink-4:     #9499b8;
      --surface:   #ffffff;
      --surface-2: #fdf2f4;
      --surface-3: #fce7ea;
      --border:    #fecdd3;
      --accent:    #be123c;
      --accent-light: #ffe4e6;
      --accent-dim:   #e11d48;
      --emerald:   #059669;
      --emerald-bg:#ecfdf5;
      --amber:     #d97706;
      --amber-bg:  #fffbeb;
      --rose:      #e11d48;
      --rose-bg:   #fff1f2;
      --indigo:    #4f46e5;
      --shadow-sm: 0 1px 3px rgba(190,18,60,.06), 0 1px 2px rgba(190,18,60,.04);
      --shadow-md: 0 4px 16px rgba(190,18,60,.08), 0 2px 6px rgba(190,18,60,.03);
      --shadow-lg: 0 20px 48px rgba(15,17,23,.12), 0 8px 16px rgba(15,17,23,.06);
      font-family: system-ui, sans-serif;
      color: var(--ink);
      background: var(--surface-2);
      min-height: 100vh;
      padding: 28px 32px;
      box-sizing: border-box;
    }

    /* ── Card ── */
    .brt4-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 18px;
      box-shadow: var(--shadow-md);
      overflow: hidden;
    }

    /* ── Header ── */
    .brt4-header {
      padding: 20px 28px;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 14px;
      background: var(--surface);
    }

    .brt4-title-row {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .brt4-icon-box {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: linear-gradient(135deg, #be123c 0%, #881337 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(190,18,60,.35);
      flex-shrink: 0;
    }

    .brt4-title {
      font-size: 16px;
      font-weight: 700;
      color: var(--ink);
      letter-spacing: -0.3px;
      margin: 0;
    }

    .brt4-subtitle {
      font-size: 11px;
      color: var(--ink-4);
      font-weight: 400;
      margin: 1px 0 0;
    }

    /* ── Controls ── */
    .brt4-controls {
      padding: 14px 28px;
      border-bottom: 1px solid var(--border);
      background: var(--surface-2);
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    .brt4-date-wrap {
      position: relative;
      display: flex;
      align-items: center;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      overflow: hidden;
      height: 36px;
    }

    .brt4-date-label {
      font-size: 10px;
      font-weight: 600;
      color: var(--ink-4);
      padding: 0 8px 0 12px;
      text-transform: uppercase;
      letter-spacing: .5px;
      white-space: nowrap;
    }

    .brt4-date-wrap .react-datepicker-wrapper,
    .brt4-date-wrap .react-datepicker__input-container {
      display: flex; align-items: center; height: 100%;
    }

    .brt4-date-wrap input {
      border: none;
      background: transparent;
      font-size: 12px;
      font-weight: 500;
      color: var(--ink);
      outline: none;
      width: 96px;
      padding-right: 12px;
    }

    .brt4-search-wrap {
      position: relative;
      flex: 1;
      min-width: 200px;
      max-width: 300px;
    }

    .brt4-search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--ink-4);
      pointer-events: none;
    }

    .brt4-search {
      width: 100%;
      padding: 8px 14px 8px 36px;
      border: 1px solid var(--border);
      border-radius: 10px;
      font-size: 12px;
      color: var(--ink);
      background: var(--surface);
      outline: none;
      transition: border-color .15s, box-shadow .15s;
      box-sizing: border-box;
    }

    .brt4-search:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px rgba(190,18,60,.1);
    }

    .brt4-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all .15s;
      white-space: nowrap;
      line-height: 1;
    }

    .brt4-btn-primary {
      background: linear-gradient(135deg, #be123c 0%, #9f1239 100%);
      color: #fff;
      box-shadow: 0 3px 10px rgba(190,18,60,.30);
    }
    .brt4-btn-primary:hover { background: linear-gradient(135deg, #9f1239 0%, #881337 100%); transform: translateY(-1px); }
    .brt4-btn-primary:active { transform: none; }

    .brt4-btn-ghost {
      background: var(--surface);
      color: var(--rose);
      border: 1px solid #fecdd3;
    }
    .brt4-btn-ghost:hover { background: var(--rose-bg); }

    .brt4-select {
      padding: 7px 10px;
      border: 1px solid var(--border);
      border-radius: 10px;
      font-size: 12px;
      color: var(--ink);
      background: var(--surface);
      outline: none;
      cursor: pointer;
    }

    /* ── Table ── */
    .brt4-table-wrap { width: 100%; overflow-x: auto; }

    .brt4-table { width: 100%; border-collapse: collapse; }

    .brt4-table thead tr {
      background: var(--surface-2);
      border-bottom: 1px solid var(--border);
    }

    .brt4-table th {
      padding: 11px 18px;
      font-size: 10px;
      font-weight: 700;
      color: var(--ink-4);
      text-transform: uppercase;
      letter-spacing: .7px;
      white-space: nowrap;
    }

    .brt4-table th.r { text-align: right; }
    .brt4-table th.c { text-align: center; }

    .brt4-table tbody tr {
      border-bottom: 1px solid var(--border);
      transition: background .12s;
    }
    .brt4-table tbody tr:last-child { border-bottom: none; }
    .brt4-table tbody tr:hover { background: #fff5f5; }

    .brt4-table td {
      padding: 12px 18px;
      font-size: 12px;
      color: var(--ink-2);
      vertical-align: middle;
    }
    .brt4-table td.r { text-align: right; }
    .brt4-table td.c { text-align: center; }

    /* Return No chip */
    .brt4-ret-no {
      font-size: 11px;
      font-weight: 600;
      color: var(--accent);
      background: var(--accent-light);
      padding: 3px 8px;
      border-radius: 6px;
      white-space: nowrap;
      font-family: monospace;
    }

    .brt4-inv-no {
      font-size: 10px;
      font-weight: 500;
      color: var(--indigo);
      background: #ede9fe;
      padding: 2px 6px;
      border-radius: 5px;
      white-space: nowrap;
      font-family: monospace;
    }

    .brt4-customer { font-weight: 600; color: var(--ink); }
    .brt4-customer-sub { font-size: 10px; color: var(--ink-4); margin-top: 1px; }

    .brt4-amount { font-weight: 600; font-size: 12px; color: var(--ink); font-family: monospace; }
    .brt4-amount.green { color: var(--emerald); }
    .brt4-amount.red   { color: var(--rose); }

    /* Action buttons */
    .brt4-action-btn {
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

    .brt4-action-btn.view { background: #ede9fe; color: var(--indigo); }
    .brt4-action-btn.view:hover { background: var(--indigo); color: #fff; }
    .brt4-action-btn.del  { background: var(--rose-bg); color: var(--rose); }
    .brt4-action-btn.del:hover  { background: var(--rose); color: #fff; }

    /* Status badges */
    .brt4-badge {
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
    }

    .brt4-badge.processed  { background: var(--emerald-bg); color: var(--emerald); }
    .brt4-badge.partial    { background: var(--amber-bg);   color: var(--amber);   cursor: pointer; }
    .brt4-badge.partial:hover { filter: brightness(.95); }
    .brt4-badge.pending    { background: var(--rose-bg);    color: var(--rose);    cursor: pointer; }
    .brt4-badge.pending:hover { filter: brightness(.95); }
    .brt4-badge.unknown    { background: var(--surface-3);  color: var(--ink-4); }

    /* Reason badge */
    .brt4-reason {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .6px;
      padding: 2px 7px;
      border-radius: 4px;
      background: #fff1f2;
      color: #be123c;
      white-space: nowrap;
    }

    /* ── Pagination ── */
    .brt4-footer {
      padding: 16px 28px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid var(--border);
      background: var(--surface-2);
      flex-wrap: wrap;
      gap: 12px;
    }

    .brt4-footer-info { font-size: 11px; color: var(--ink-4); }
    .brt4-footer-info span { color: var(--accent); font-weight: 700; }

    .brt4-page-btns { display: flex; align-items: center; gap: 5px; }

    .brt4-page-btn {
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
    }
    .brt4-page-btn:hover:not(:disabled) { background: var(--accent-light); color: var(--accent); border-color: var(--accent-light); }
    .brt4-page-btn.active { background: var(--accent); color: #fff; border-color: var(--accent); box-shadow: 0 3px 8px rgba(190,18,60,.3); }
    .brt4-page-btn:disabled { opacity: .4; cursor: not-allowed; }

    /* ── Modal ── */
    .brt4-overlay {
      position: fixed;
      inset: 0;
      z-index: 50;
      background: rgba(15,17,23,.5);
      backdrop-filter: blur(6px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .brt4-modal {
      background: var(--surface);
      border-radius: 20px;
      box-shadow: var(--shadow-lg);
      width: 100%;
      max-width: 700px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .brt4-modal-header {
      padding: 20px 24px;
      background: linear-gradient(135deg, #be123c 0%, #881337 100%);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .brt4-modal-title {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #fff;
      font-size: 14px;
      font-weight: 700;
    }

    .brt4-modal-body {
      padding: 24px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .brt4-meta-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 14px;
    }
    @media(min-width:540px) { .brt4-meta-grid { grid-template-columns: repeat(4, 1fr); } }

    .brt4-meta-item label {
      display: block;
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .8px;
      color: var(--ink-4);
      margin-bottom: 5px;
    }

    .brt4-meta-item p {
      font-size: 12px;
      font-weight: 600;
      color: var(--ink);
      display: flex;
      align-items: center;
      gap: 5px;
      margin: 0;
    }

    .brt4-divider { border: none; border-top: 1px solid var(--border); margin: 0; }

    .brt4-inner-table-wrap { border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }

    .brt4-inner-table { width: 100%; border-collapse: collapse; }
    .brt4-inner-table thead tr { background: var(--surface-2); }
    .brt4-inner-table th { padding: 9px 14px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; color: var(--ink-4); }
    .brt4-inner-table th.r { text-align: right; }
    .brt4-inner-table th.c { text-align: center; }
    .brt4-inner-table tbody tr { border-top: 1px solid var(--border); }
    .brt4-inner-table tbody tr:hover { background: #fff5f5; }
    .brt4-inner-table td { padding: 10px 14px; font-size: 12px; color: var(--ink-2); }
    .brt4-inner-table td.r { text-align: right; }
    .brt4-inner-table td.c { text-align: center; }

    /* Summary strip */
    .brt4-summary {
      background: linear-gradient(135deg, #fff1f2 0%, #fdf2f4 100%);
      border: 1px solid #fecdd3;
      border-radius: 14px;
      padding: 18px 22px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 16px;
    }

    .brt4-summary-big label {
      font-size: 9px; font-weight: 700; text-transform: uppercase;
      letter-spacing: .8px; color: var(--accent); display: block; margin-bottom: 4px;
    }

    .brt4-summary-big p {
      font-size: 28px; font-weight: 800; color: var(--accent);
      margin: 0; line-height: 1; font-family: monospace;
    }

    .brt4-summary-stats { display: flex; gap: 24px; }

    .brt4-stat-item { text-align: right; }
    .brt4-stat-item:not(:last-child) { border-right: 1px solid var(--border); padding-right: 24px; }

    .brt4-stat-item label {
      font-size: 9px; font-weight: 700; text-transform: uppercase;
      letter-spacing: .6px; display: block; margin-bottom: 3px;
    }

    .brt4-stat-item p { font-size: 13px; font-weight: 700; margin: 0; font-family: monospace; }

    .brt4-stat-item.green label { color: var(--emerald); }
    .brt4-stat-item.green p { color: var(--emerald); }
    .brt4-stat-item.red   label { color: var(--rose); }
    .brt4-stat-item.red   p { color: var(--rose); }

    .brt4-modal-footer {
      padding: 14px 24px;
      border-top: 1px solid var(--border);
      background: var(--surface-2);
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }

    .brt4-btn-outline {
      background: var(--surface); color: var(--ink-3); border: 1px solid var(--border);
    }
    .brt4-btn-outline:hover { background: var(--surface-3); }

    /* Delete modal */
    .brt4-del-modal {
      background: var(--surface);
      border-radius: 20px;
      box-shadow: var(--shadow-lg);
      width: 100%;
      max-width: 380px;
      padding: 32px 28px;
      text-align: center;
    }

    .brt4-del-icon {
      width: 60px; height: 60px; border-radius: 50%;
      background: var(--rose-bg); color: var(--rose);
      display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;
    }

    .brt4-del-modal h3 { font-size: 16px; font-weight: 700; color: var(--ink); margin: 0 0 8px; }
    .brt4-del-modal p  { font-size: 12px; color: var(--ink-4); line-height: 1.6; margin: 0 0 22px; }
    .brt4-del-btns { display: flex; gap: 10px; }

    .brt4-del-btns button {
      flex: 1; padding: 11px; border-radius: 12px;
      font-size: 12px; font-weight: 700; cursor: pointer; border: none; transition: all .15s;
    }

    .brt4-del-cancel  { background: var(--surface-3); color: var(--ink-2); border: 1px solid var(--border) !important; }
    .brt4-del-cancel:hover { background: var(--surface-2); }
    .brt4-del-confirm { background: var(--rose); color: #fff; box-shadow: 0 3px 10px rgba(225,29,72,.25); }
    .brt4-del-confirm:hover { background: #be123c; }

    /* Empty state */
    .brt4-empty { padding: 64px 20px; text-align: center; color: var(--ink-4); font-size: 13px; }
    .brt4-empty-icon {
      width: 56px; height: 56px; border-radius: 16px;
      background: var(--surface-3); display: flex; align-items: center; justify-content: center;
      margin: 0 auto 16px; color: var(--ink-4);
    }

    .brt4-sep { width: 1px; height: 20px; background: var(--border); flex-shrink: 0; }
    .brt4-show-label { font-size: 11px; color: var(--ink-4); white-space: nowrap; }
  `;
  document.head.appendChild(style);
};

/* ─── Component ─────────────────────────────────────────────── */
const BillingReturnV4List = () => {
  const [returns, setReturns]           = useState([]);
  const [searchTerm, setSearchTerm]     = useState('');
  const [fromDate, setFromDate]         = useState(null);
  const [toDate, setToDate]             = useState(null);
  const [page, setPage]                 = useState(0);
  const [pageSize, setPageSize]         = useState(10);
  const [totalPages, setTotalPages]     = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const navigate = useNavigate();
  const toast    = useToast();

  useEffect(() => { injectStyles(); }, []);

  // ── Fetch ────────────────────────────────────────────────
  const fetchReturns = async () => {
    try {
      const res = await axios.get(`/api/invoice/returns/all-paginated?page=${page}&size=${pageSize}`);
      const payload = res.data;
      setReturns(payload?.content || payload || []);
      setTotalPages(payload?.totalPages ?? 0);
      setTotalElements(payload?.totalElements ?? 0);
    } catch (err) {
      console.error('Error fetching returns:', err);
      setReturns([]);
    }
  };

  useEffect(() => { fetchReturns(); }, [page, pageSize]);
  useEffect(() => { setPage(0); }, [searchTerm, fromDate, toDate]);

  const handleReset = () => { setSearchTerm(''); setFromDate(null); setToDate(null); setPage(0); };

  // ── View details ─────────────────────────────────────────
  const handleViewDetails = async (ret) => {
    const retNo = ret?.returnNo;
    if (!retNo) { toast.error('Return number not available.'); return; }
    setIsLoadingDetails(true);
    try {
      const res = await axios.get(`/api/invoice/returns/${encodeURIComponent(retNo)}`);
      setSelectedReturn(res?.data?.data || res?.data || ret);
      setIsModalOpen(true);
    } catch {
      toast.error('Unable to load return details.');
      setSelectedReturn(ret);
      setIsModalOpen(true);
    } finally { setIsLoadingDetails(false); }
  };

  // ── Delete ───────────────────────────────────────────────
  const openDeleteModal  = (id) => { setItemToDelete(id); setIsDeleteDialogOpen(true); };
  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`/api/invoice/returns/${itemToDelete}`);
      setReturns(prev => prev.filter(r => r.returnId !== itemToDelete));
      toast.success('Return deleted successfully!');
    } catch { toast.error('Delete failed.'); }
    finally { setIsDeleteDialogOpen(false); setItemToDelete(null); }
  };

  // ── Status badge ─────────────────────────────────────────
  const renderStatus = (status) => {
    const s = status?.toString().trim().toLowerCase();
    if (s === 'processed' || s === 'completed' || s === 'approved')
      return <span className="brt4-badge processed"><CheckCircle2 size={9} strokeWidth={3} />Processed</span>;
    if (s === 'partial')
      return <span className="brt4-badge partial"><Clock size={9} strokeWidth={3} />Partial</span>;
    if (s === 'pending' || s === 'submitted')
      return <span className="brt4-badge pending"><AlertCircle size={9} strokeWidth={3} />Pending</span>;
    return <span className="brt4-badge unknown">{status || 'N/A'}</span>;
  };

  // ── Filtered ─────────────────────────────────────────────
  const filteredReturns = returns.filter(r => {
    const name   = (r.customerName || r.customer?.customerName || r.unitName || '').toLowerCase();
    const retNo  = (r.returnNo || '').toLowerCase();
    const invNo  = (r.invoiceNo || '').toLowerCase();
    const matchSearch = retNo.includes(searchTerm.toLowerCase())
      || invNo.includes(searchTerm.toLowerCase())
      || name.includes(searchTerm.toLowerCase());
    const retDate = r.returnDate ? new Date(r.returnDate) : null;
    let matchDate = true;
    if (fromDate && retDate && retDate < fromDate) matchDate = false;
    if (toDate && retDate) {
      const end = new Date(toDate); end.setHours(23,59,59);
      if (retDate > end) matchDate = false;
    }
    return matchSearch && matchDate;
  });

  const fmtINR     = n => Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  const hasFilter  = searchTerm || fromDate || toDate;

  // ── JSX ──────────────────────────────────────────────────
  return (
    <div className="brt4-root">

      <ReusableDialogueBox
        isOpen={isDeleteDialogOpen}
        title="Delete Return"
        message="Are you sure you want to permanently delete this return record?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />

      <div className="brt4-card">

        {/* ── Header ── */}
        <div className="brt4-header">
          <div className="brt4-title-row">
            <div className="brt4-icon-box">
              <RefreshCcw size={18} color="#fff" strokeWidth={2} />
            </div>
            <div>
              <h2 className="brt4-title">Return / Credit Note List</h2>
              <p className="brt4-subtitle">Manage all billing returns and credit notes</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/billing-return-v4')}
            className="brt4-btn brt4-btn-primary"
          >
            <Plus size={14} /> New Return
          </button>
        </div>

        {/* ── Controls ── */}
        <div className="brt4-controls">
          {/* From Date */}
          <div className="brt4-date-wrap">
            <span className="brt4-date-label">From</span>
            <DatePicker selected={fromDate} onChange={d => setFromDate(d)} placeholderText="dd-mm-yyyy" dateFormat="dd-MM-yyyy" />
          </div>

          {/* To Date */}
          <div className="brt4-date-wrap">
            <span className="brt4-date-label">To</span>
            <DatePicker selected={toDate} onChange={d => setToDate(d)} placeholderText="dd-mm-yyyy" dateFormat="dd-MM-yyyy" />
          </div>

          {hasFilter && (
            <button onClick={handleReset} className="brt4-btn brt4-btn-ghost" style={{ height: 36, padding: '0 12px' }}>
              <RotateCcw size={12} /> Reset
            </button>
          )}

          <div className="brt4-sep" />

          {/* Search */}
          <div className="brt4-search-wrap">
            <Search size={13} className="brt4-search-icon" />
            <input
              type="text"
              className="brt4-search"
              placeholder="Search return no, invoice, or customer…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="brt4-show-label">Show</span>
            <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(0); }} className="brt4-select">
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="brt4-table-wrap">
          <table className="brt4-table">
            <thead>
              <tr>
                <th className="c" style={{ width: 130 }}>Actions</th>
                <th>Return No</th>
                <th>Orig. Invoice</th>
                <th className="c">Return Date</th>
                <th>Customer Name</th>
                <th>Reason</th>
                <th className="r">Credit Amount</th>
                <th className="r">Refund Issued</th>
                <th className="c">Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredReturns.length > 0 ? (
                filteredReturns.map((ret, index) => {
                  const creditAmt  = Number(ret.creditAmount || ret.totalAmount || 0);
                  const refundIssued = Number(ret.refundAmount || 0);

                  return (
                    <tr key={ret.returnId || ret.id || index}>

                      {/* Actions */}
                      <td className="c">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                          <button
                            className="brt4-action-btn view"
                            title="View Details"
                            onClick={() => handleViewDetails(ret)}
                            disabled={isLoadingDetails}
                          >
                            <VisibilityIcon sx={{ fontSize: 14 }} />
                          </button>

                          <button
                            className="brt4-action-btn del"
                            title="Delete Return"
                            onClick={() => openDeleteModal(ret.returnId || ret.id)}
                          >
                            <DeleteIcon sx={{ fontSize: 14 }} />
                          </button>
                        </div>
                      </td>

                      {/* Return No */}
                      <td>
                        <span className="brt4-ret-no">#{ret.returnNo || 'N/A'}</span>
                      </td>

                      {/* Orig Invoice */}
                      <td>
                        <span className="brt4-inv-no">{ret.invoiceNo || '—'}</span>
                      </td>

                      {/* Return Date */}
                      <td className="c" style={{ color: 'var(--ink-3)', fontWeight: 500 }}>
                        {ret.returnDate ? ret.returnDate.split('-').reverse().join('-') : '—'}
                      </td>

                      {/* Customer */}
                      <td>
                        <div className="brt4-customer">{ret.customerName || ret.unitName || '—'}</div>
                        {ret.customer?.gstin && (
                          <div className="brt4-customer-sub">{ret.customer.gstin}</div>
                        )}
                      </td>

                      {/* Reason */}
                      <td>
                        <span className="brt4-reason">{ret.reasonCode || ret.returnReason || '—'}</span>
                        {ret.reasonText && (
                          <div style={{ fontSize: 10, color: 'var(--ink-4)', marginTop: 2 }}>{ret.reasonText}</div>
                        )}
                      </td>

                      {/* Credit Amt */}
                      <td className="r">
                        <span className="brt4-amount red">₹{creditAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </td>

                      {/* Refund Issued */}
                      <td className="r">
                        <span className="brt4-amount green">₹{refundIssued.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </td>

                      {/* Status */}
                      <td className="c">{renderStatus(ret.status)}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9">
                    <div className="brt4-empty">
                      <div className="brt4-empty-icon">
                        <RefreshCcw size={24} />
                      </div>
                      <p style={{ margin: '0 0 6px', fontWeight: 600, color: 'var(--ink-3)' }}>No return records found</p>
                      <p style={{ margin: 0, fontSize: 11 }}>Try adjusting your search or date filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        <div className="brt4-footer">
          <p className="brt4-footer-info">
            Showing <span>{filteredReturns.length}</span> of {totalElements} records
          </p>

          <div className="brt4-page-btns">
            <button className="brt4-page-btn" disabled={page === 0} onClick={() => setPage(p => Math.max(p-1,0))}>
              <ChevronLeft size={15} />
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button key={i} className={`brt4-page-btn${page === i ? ' active' : ''}`} onClick={() => setPage(i)}>
                {i + 1}
              </button>
            ))}

            <button className="brt4-page-btn" disabled={page >= totalPages-1 || totalPages === 0} onClick={() => setPage(p => Math.min(p+1, totalPages-1))}>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* ── VIEW MODAL ─────────────────────────────────────── */}
      {isModalOpen && selectedReturn && (
        <div className="brt4-overlay">
          <div className="brt4-modal">

            {/* Header */}
            <div className="brt4-modal-header">
              <div className="brt4-modal-title">
                <RefreshCcw size={16} />
                Return / Credit Note Preview
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'rgba(255,255,255,.15)', border: 'none', color: '#fff', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}
              >
                Close
              </button>
            </div>

            {/* Body */}
            <div className="brt4-modal-body">
              {/* Meta */}
              <div className="brt4-meta-grid">
                <div className="brt4-meta-item">
                  <label>Customer</label>
                  <p><User size={12} color="var(--accent)" />{selectedReturn.customerName || selectedReturn.unitName || '—'}</p>
                </div>
                <div className="brt4-meta-item">
                  <label>Return No</label>
                  <p style={{ fontFamily: 'monospace' }}>#{selectedReturn.returnNo || 'N/A'}</p>
                </div>
                <div className="brt4-meta-item">
                  <label>Orig. Invoice</label>
                  <p style={{ fontFamily: 'monospace', color: 'var(--indigo)' }}>{selectedReturn.invoiceNo || '—'}</p>
                </div>
                <div className="brt4-meta-item">
                  <label>Status</label>
                  <div>{renderStatus(selectedReturn.status)}</div>
                </div>
                <div className="brt4-meta-item">
                  <label>Return Date</label>
                  <p><Calendar size={12} color="var(--accent)" />{selectedReturn.returnDate || '—'}</p>
                </div>
                <div className="brt4-meta-item">
                  <label>Reason Code</label>
                  <p><span className="brt4-reason">{selectedReturn.reasonCode || '—'}</span></p>
                </div>
                <div className="brt4-meta-item" style={{ gridColumn: 'span 2' }}>
                  <label>Reason Text</label>
                  <p style={{ fontSize: 11 }}>{selectedReturn.reasonText || selectedReturn.remarks || '—'}</p>
                </div>
              </div>

              <hr className="brt4-divider" />

              {/* Items */}
              <div>
                <p style={{ margin: '0 0 10px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.8px', color: 'var(--ink-4)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ShoppingBag size={12} color="var(--accent)" /> Returned Items
                </p>
                <div className="brt4-inner-table-wrap">
                  <table className="brt4-inner-table">
                    <thead>
                      <tr>
                        <th>Item Name</th>
                        <th className="c">Batch</th>
                        <th className="c">Qty</th>
                        <th className="r">Rate</th>
                        <th className="r">GST%</th>
                        <th className="r">Credit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedReturn.items || selectedReturn.returnItems || []).length > 0
                        ? (selectedReturn.items || selectedReturn.returnItems).map((item, i) => (
                          <tr key={i}>
                            <td style={{ fontWeight: 500 }}>{item.itemName || '—'}</td>
                            <td className="c" style={{ fontSize: 10, color: 'var(--ink-4)' }}>{item.batchCode || '—'}</td>
                            <td className="c" style={{ fontWeight: 700, color: 'var(--rose)' }}>{item.quantity || 0}</td>
                            <td className="r">₹{fmtINR(item.rate || 0)}</td>
                            <td className="r">{item.gstRate || 0}%</td>
                            <td className="r" style={{ fontWeight: 700, color: 'var(--rose)' }}>₹{fmtINR(item.lineTotal || 0)}</td>
                          </tr>
                        ))
                        : (
                          <tr><td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: 'var(--ink-4)', fontStyle: 'italic', fontSize: 12 }}>No items recorded</td></tr>
                        )
                      }
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary */}
              <div className="brt4-summary">
                <div className="brt4-summary-big">
                  <label>Net Credit Value</label>
                  <p>₹{fmtINR(selectedReturn.creditAmount || selectedReturn.totalAmount || 0)}</p>
                </div>
                <div className="brt4-summary-stats">
                  <div className="brt4-stat-item green">
                    <label>Refund Issued</label>
                    <p>₹{fmtINR(selectedReturn.refundAmount || 0)}</p>
                  </div>
                  <div className="brt4-stat-item red">
                    <label>Pending Credit</label>
                    <p>₹{fmtINR((selectedReturn.creditAmount || 0) - (selectedReturn.refundAmount || 0))}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="brt4-modal-footer">
              <button onClick={() => setIsModalOpen(false)} className="brt4-btn brt4-btn-outline">
                Close Preview
              </button>
              <button
                onClick={() => { setIsModalOpen(false); navigate('/billing-return-v4', { state: { invoice: { invoiceNo: selectedReturn.invoiceNo } } }); }}
                className="brt4-btn brt4-btn-primary"
              >
                <RefreshCcw size={13} /> View Return Form
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE MODAL ── */}
      {isDeleteDialogOpen && (
        <div className="brt4-overlay" style={{ zIndex: 60 }}>
          <div className="brt4-del-modal">
            <div className="brt4-del-icon"><Trash2 size={28} /></div>
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to permanently delete this return record? This action cannot be undone.</p>
            <div className="brt4-del-btns">
              <button className="brt4-del-cancel" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</button>
              <button className="brt4-del-confirm" onClick={handleConfirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingReturnV4List;