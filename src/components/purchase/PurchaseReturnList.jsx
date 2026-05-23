import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Plus, CheckCircle2, Clock, AlertCircle,
  ChevronLeft, ChevronRight, FileText, User,
  Calendar, ShoppingBag, Trash2, RotateCcw,
  Search, RefreshCw, Landmark, Package,
  RefreshCcw
} from 'lucide-react';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PrintIcon from '@mui/icons-material/Print';
import { useNavigate } from 'react-router-dom';
import ReusableDialogueBox from "../contextapi/ReusableDialogueBox";
import { useToast } from "../contextapi/ToastContext";

/* ─── Inline CSS ─────────────────────────────────────────────── */
const injectStyles = () => {
  if (document.getElementById('prl1-styles')) return;
  const style = document.createElement('style');
  style.id = 'prl1-styles';
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');

    .prl1-root {
      --ink:          #0f172a;
      --ink-2:        #1e293b;
      --ink-3:        #475569;
      --ink-4:        #94a3b8;
      --surface:      #ffffff;
      --surface-2:    #f0fdfa;
      --surface-3:    #ccfbf1;
      --border:       #99f6e4;
      --border-d:     #5eead4;
      --accent:       #0f766e;
      --accent-d:     #0d5e57;
      --accent-light: #f0fdfa;
      --accent-mid:   #99f6e4;
      --accent-dim:   #14b8a6;
      --cyan:         #0891b2;
      --cyan-bg:      #ecfeff;
      --emerald:      #059669;
      --emerald-bg:   #ecfdf5;
      --amber:        #d97706;
      --amber-bg:     #fffbeb;
      --orange:       #ea580c;
      --orange-bg:    #fff7ed;
      --rose:         #e11d48;
      --rose-bg:      #fff1f2;
      --indigo:       #4f46e5;
      --indigo-bg:    #ede9fe;
      --shadow-sm:    0 1px 3px rgba(15,118,110,.06), 0 1px 2px rgba(15,118,110,.04);
      --shadow-md:    0 4px 16px rgba(15,118,110,.10), 0 2px 6px rgba(15,118,110,.05);
      --shadow-lg:    0 20px 48px rgba(15,23,42,.12), 0 8px 16px rgba(15,23,42,.06);
      font-family: 'Poppins', sans-serif;
      color: var(--ink);
      background: var(--surface-2);
      min-height: 100vh;
      padding: 28px 32px;
      box-sizing: border-box;
    }

    /* ── Card ── */
    .prl1-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 18px;
      box-shadow: var(--shadow-md);
      overflow: hidden;
    }

    /* ── Header ── */
    .prl1-header {
      padding: 20px 28px;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 14px;
      background: var(--surface);
    }

    .prl1-title-row {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .prl1-icon-box {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: linear-gradient(135deg, #0f766e 0%, #0d5e57 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(15,118,110,.35);
      flex-shrink: 0;
    }

    .prl1-title {
      font-size: 16px;
      font-weight: 700;
      color: var(--ink);
      letter-spacing: -0.3px;
      margin: 0;
    }

    .prl1-subtitle {
      font-size: 11px;
      color: var(--ink-4);
      font-weight: 400;
      margin: 1px 0 0;
    }

    /* ── Controls ── */
    .prl1-controls {
      padding: 14px 28px;
      border-bottom: 1px solid var(--border);
      background: var(--surface-2);
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    .prl1-date-wrap {
      position: relative;
      display: flex;
      align-items: center;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      overflow: hidden;
      height: 36px;
      transition: border-color .15s, box-shadow .15s;
    }
    .prl1-date-wrap:focus-within {
      border-color: var(--accent-dim);
      box-shadow: 0 0 0 3px rgba(20,184,166,.12);
    }

    .prl1-date-label {
      font-size: 10px;
      font-weight: 600;
      color: var(--ink-4);
      padding: 0 8px 0 12px;
      text-transform: uppercase;
      letter-spacing: .5px;
      white-space: nowrap;
    }

    .prl1-date-wrap .react-datepicker-wrapper,
    .prl1-date-wrap .react-datepicker__input-container {
      display: flex; align-items: center; height: 100%;
    }

    .prl1-date-wrap input {
      border: none;
      background: transparent;
      font-family: 'Poppins', sans-serif;
      font-size: 12px;
      font-weight: 500;
      color: var(--ink);
      outline: none;
      width: 96px;
      padding-right: 12px;
    }

    .prl1-search-wrap {
      position: relative;
      flex: 1;
      min-width: 200px;
      max-width: 320px;
    }

    .prl1-search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--ink-4);
      pointer-events: none;
    }

    .prl1-search {
      width: 100%;
      padding: 8px 14px 8px 36px;
      border: 1px solid var(--border);
      border-radius: 10px;
      font-family: 'Poppins', sans-serif;
      font-size: 12px;
      color: var(--ink);
      background: var(--surface);
      outline: none;
      transition: border-color .15s, box-shadow .15s;
      box-sizing: border-box;
    }

    .prl1-search:focus {
      border-color: var(--accent-dim);
      box-shadow: 0 0 0 3px rgba(20,184,166,.12);
    }

    .prl1-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 10px;
      font-family: 'Poppins', sans-serif;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all .15s;
      white-space: nowrap;
      line-height: 1;
    }

    .prl1-btn-primary {
      background: linear-gradient(135deg, #0f766e 0%, #0d5e57 100%);
      color: #fff;
      box-shadow: 0 3px 10px rgba(15,118,110,.32);
    }
    .prl1-btn-primary:hover {
      background: linear-gradient(135deg, #0d5e57 0%, #0a4b45 100%);
      transform: translateY(-1px);
      box-shadow: 0 5px 14px rgba(15,118,110,.38);
    }
    .prl1-btn-primary:active { transform: none; }

    .prl1-btn-ghost {
      background: var(--surface);
      color: var(--accent);
      border: 1px solid var(--border-d);
    }
    .prl1-btn-ghost:hover { background: var(--accent-light); }

    .prl1-select {
      padding: 7px 10px;
      border: 1px solid var(--border);
      border-radius: 10px;
      font-family: 'Poppins', sans-serif;
      font-size: 12px;
      color: var(--ink);
      background: var(--surface);
      outline: none;
      cursor: pointer;
    }

    /* ── Table ── */
    .prl1-table-wrap { width: 100%; overflow-x: auto; }

    .prl1-table { width: 100%; border-collapse: collapse; }

    .prl1-table thead tr {
      background: linear-gradient(90deg, var(--surface-2), #e0fdf4);
      border-bottom: 2px solid var(--border);
    }

    .prl1-table th {
      padding: 11px 18px;
      font-size: 10px;
      font-weight: 700;
      color: var(--accent);
      text-transform: uppercase;
      letter-spacing: .7px;
      white-space: nowrap;
    }

    .prl1-table th.r { text-align: right; }
    .prl1-table th.c { text-align: center; }

    .prl1-table tbody tr {
      border-bottom: 1px solid var(--border);
      transition: background .12s;
    }
    .prl1-table tbody tr:last-child { border-bottom: none; }
    .prl1-table tbody tr:hover { background: #f0fdfa; }

    .prl1-table td {
      padding: 12px 18px;
      font-size: 12px;
      color: var(--ink-2);
      vertical-align: middle;
    }
    .prl1-table td.r { text-align: right; }
    .prl1-table td.c { text-align: center; }

    /* Return No chip */
    .prl1-ret-no {
      font-size: 11px;
      font-weight: 600;
      color: var(--accent);
      background: var(--accent-light);
      padding: 3px 8px;
      border-radius: 6px;
      white-space: nowrap;
      font-family: monospace;
      border: 1px solid var(--accent-mid);
    }

    /* PO / Bill No chip */
    .prl1-inv-no {
      font-size: 10px;
      font-weight: 600;
      color: var(--cyan);
      background: var(--cyan-bg);
      padding: 2px 7px;
      border-radius: 5px;
      white-space: nowrap;
      font-family: monospace;
    }

    /* Vendor name */
    .prl1-vendor { font-weight: 600; color: var(--ink); }
    .prl1-vendor-sub { font-size: 10px; color: var(--ink-4); margin-top: 1px; }

    /* Amount */
    .prl1-amount { font-weight: 600; font-size: 12px; color: var(--ink); font-family: monospace; }
    .prl1-amount.green  { color: var(--emerald); }
    .prl1-amount.orange { color: var(--orange); }
    .prl1-amount.teal   { color: var(--accent); }

    /* Action buttons */
    .prl1-action-btn {
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

    .prl1-action-btn.view { background: var(--accent-light); color: var(--accent); border: 1px solid var(--accent-mid); }
    .prl1-action-btn.view:hover { background: var(--accent); color: #fff; border-color: var(--accent); }
    .prl1-action-btn.del  { background: var(--rose-bg); color: var(--rose); }
    .prl1-action-btn.del:hover  { background: var(--rose); color: #fff; }

    /* Status badges */
    .prl1-badge {
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

    .prl1-badge.processed { background: var(--emerald-bg); color: var(--emerald); }
    .prl1-badge.partial   { background: var(--amber-bg);   color: var(--amber);   cursor: pointer; }
    .prl1-badge.partial:hover { filter: brightness(.95); }
    .prl1-badge.pending   { background: var(--orange-bg);  color: var(--orange);  cursor: pointer; }
    .prl1-badge.pending:hover { filter: brightness(.95); }
    .prl1-badge.unknown   { background: var(--surface-3);  color: var(--ink-4); }

    /* Reason badge */
    .prl1-reason {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .6px;
      padding: 2px 7px;
      border-radius: 4px;
      background: var(--surface-2);
      color: var(--accent);
      white-space: nowrap;
      border: 1px solid var(--border);
    }

    /* Return Type badge */
    .prl1-type {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .5px;
      padding: 2px 8px;
      border-radius: 4px;
      background: var(--cyan-bg);
      color: var(--cyan);
      white-space: nowrap;
    }

    /* ── Pagination ── */
    .prl1-footer {
      padding: 16px 28px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid var(--border);
      background: var(--surface-2);
      flex-wrap: wrap;
      gap: 12px;
    }

    .prl1-footer-info { font-size: 11px; color: var(--ink-4); }
    .prl1-footer-info span { color: var(--accent); font-weight: 700; }

    .prl1-page-btns { display: flex; align-items: center; gap: 5px; }

    .prl1-page-btn {
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
      font-family: 'Poppins', sans-serif;
    }
    .prl1-page-btn:hover:not(:disabled) { background: var(--accent-light); color: var(--accent); border-color: var(--border-d); }
    .prl1-page-btn.active { background: var(--accent); color: #fff; border-color: var(--accent); box-shadow: 0 3px 8px rgba(15,118,110,.3); }
    .prl1-page-btn:disabled { opacity: .4; cursor: not-allowed; }

    /* ── Modal ── */
    .prl1-overlay {
      position: fixed;
      inset: 0;
      z-index: 50;
      background: rgba(15,23,42,.5);
      backdrop-filter: blur(6px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .prl1-modal {
      background: var(--surface);
      border-radius: 20px;
      box-shadow: var(--shadow-lg);
      width: 100%;
      max-width: 720px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .prl1-modal-header {
      padding: 20px 24px;
      background: linear-gradient(135deg, #0f766e 0%, #0891b2 100%);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .prl1-modal-title {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #fff;
      font-size: 14px;
      font-weight: 700;
    }

    .prl1-modal-body {
      padding: 24px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .prl1-meta-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 14px;
    }
    @media(min-width:540px) { .prl1-meta-grid { grid-template-columns: repeat(4, 1fr); } }

    .prl1-meta-item label {
      display: block;
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .8px;
      color: var(--ink-4);
      margin-bottom: 5px;
    }

    .prl1-meta-item p {
      font-size: 12px;
      font-weight: 600;
      color: var(--ink);
      display: flex;
      align-items: center;
      gap: 5px;
      margin: 0;
    }

    .prl1-divider { border: none; border-top: 1px solid var(--border); margin: 0; }

    /* Inner items table */
    .prl1-inner-table-wrap {
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
    }

    .prl1-inner-table { width: 100%; border-collapse: collapse; }
    .prl1-inner-table thead tr { background: var(--surface-2); }
    .prl1-inner-table th {
      padding: 9px 14px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .5px;
      color: var(--accent);
    }
    .prl1-inner-table th.r { text-align: right; }
    .prl1-inner-table th.c { text-align: center; }
    .prl1-inner-table tbody tr { border-top: 1px solid var(--border); }
    .prl1-inner-table tbody tr:hover { background: #f0fdfa; }
    .prl1-inner-table td { padding: 10px 14px; font-size: 12px; color: var(--ink-2); }
    .prl1-inner-table td.r { text-align: right; }
    .prl1-inner-table td.c { text-align: center; }

    /* Summary strip */
    .prl1-summary {
      background: linear-gradient(135deg, #f0fdfa 0%, #ecfeff 100%);
      border: 1px solid var(--border-d);
      border-radius: 14px;
      padding: 18px 22px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 16px;
    }

    .prl1-summary-big label {
      font-size: 9px; font-weight: 700; text-transform: uppercase;
      letter-spacing: .8px; color: var(--accent); display: block; margin-bottom: 4px;
    }

    .prl1-summary-big p {
      font-size: 28px; font-weight: 800; color: var(--accent-d);
      margin: 0; line-height: 1; font-family: monospace;
    }

    .prl1-summary-stats { display: flex; gap: 24px; }

    .prl1-stat-item { text-align: right; }
    .prl1-stat-item:not(:last-child) { border-right: 1px solid var(--border-d); padding-right: 24px; }

    .prl1-stat-item label {
      font-size: 9px; font-weight: 700; text-transform: uppercase;
      letter-spacing: .6px; display: block; margin-bottom: 3px;
    }

    .prl1-stat-item p { font-size: 13px; font-weight: 700; margin: 0; font-family: monospace; }

    .prl1-stat-item.green label { color: var(--emerald); }
    .prl1-stat-item.green p    { color: var(--emerald); }
    .prl1-stat-item.orange label { color: var(--orange); }
    .prl1-stat-item.orange p   { color: var(--orange); }

    .prl1-modal-footer {
      padding: 14px 24px;
      border-top: 1px solid var(--border);
      background: var(--surface-2);
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }

    .prl1-btn-outline {
      background: var(--surface); color: var(--ink-3); border: 1px solid var(--border);
    }
    .prl1-btn-outline:hover { background: var(--surface-3); }

    /* Delete modal */
    .prl1-del-modal {
      background: var(--surface);
      border-radius: 20px;
      box-shadow: var(--shadow-lg);
      width: 100%;
      max-width: 380px;
      padding: 32px 28px;
      text-align: center;
    }

    .prl1-del-icon {
      width: 60px; height: 60px; border-radius: 50%;
      background: var(--rose-bg); color: var(--rose);
      display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;
    }

    .prl1-del-modal h3 { font-size: 16px; font-weight: 700; color: var(--ink); margin: 0 0 8px; }
    .prl1-del-modal p  { font-size: 12px; color: var(--ink-4); line-height: 1.6; margin: 0 0 22px; }
    .prl1-del-btns { display: flex; gap: 10px; }

    .prl1-del-btns button {
      flex: 1; padding: 11px; border-radius: 12px;
      font-family: 'Poppins', sans-serif;
      font-size: 12px; font-weight: 700; cursor: pointer; border: none; transition: all .15s;
    }

    .prl1-del-cancel  { background: var(--surface-3); color: var(--ink-2); border: 1px solid var(--border) !important; }
    .prl1-del-cancel:hover { background: #ccfbf1; }
    .prl1-del-confirm { background: var(--rose); color: #fff; box-shadow: 0 3px 10px rgba(225,29,72,.25); }
    .prl1-del-confirm:hover { background: #be123c; }

    /* Empty state */
    .prl1-empty { padding: 64px 20px; text-align: center; color: var(--ink-4); font-size: 13px; }
    .prl1-empty-icon {
      width: 56px; height: 56px; border-radius: 16px;
      background: var(--surface-3); display: flex; align-items: center; justify-content: center;
      margin: 0 auto 16px; color: var(--accent);
    }

    .prl1-sep { width: 1px; height: 20px; background: var(--border); flex-shrink: 0; }
    .prl1-show-label { font-size: 11px; color: var(--ink-4); white-space: nowrap; }
  `;
  document.head.appendChild(style);
};

/* ─── Component ─────────────────────────────────────────────── */
const PurchaseReturnV1List = () => {
  const [returns, setReturns]               = useState([]);
  const [searchTerm, setSearchTerm]         = useState('');
  const [fromDate, setFromDate]             = useState(null);
  const [toDate, setToDate]                 = useState(null);
  const [page, setPage]                     = useState(0);
  const [pageSize, setPageSize]             = useState(10);
  const [totalPages, setTotalPages]         = useState(0);
  const [totalElements, setTotalElements]   = useState(0);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [isModalOpen, setIsModalOpen]       = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete]     = useState(null);

  const navigate = useNavigate();
  const toast    = useToast();

  useEffect(() => { injectStyles(); }, []);

  /* ── Fetch ── */
  const fetchReturns = async () => {
    try {
      const res = await axios.get(`/api/purchase-invoice/returns/all-paginated?page=${page}&size=${pageSize}`);
      const payload = res.data;
      setReturns(payload?.content || payload || []);
      setTotalPages(payload?.totalPages ?? 0);
      setTotalElements(payload?.totalElements ?? 0);
    } catch (err) {
      console.error('Error fetching purchase returns:', err);
      setReturns([]);
    }
  };

  useEffect(() => { fetchReturns(); }, [page, pageSize]);
  useEffect(() => { setPage(0); }, [searchTerm, fromDate, toDate]);

  const handleReset = () => {
    setSearchTerm('');
    setFromDate(null);
    setToDate(null);
    setPage(0);
  };

  /* ── View details ── */
  const handleViewDetails = async (ret) => {
    const retNo = ret?.returnNo;
    if (!retNo) { toast.error('Return number not available.'); return; }
    setIsLoadingDetails(true);
    try {
      const res = await axios.get(`/api/purchase-invoice/returns/${encodeURIComponent(retNo)}`);
      setSelectedReturn(res?.data?.data || res?.data || ret);
      setIsModalOpen(true);
    } catch {
      toast.error('Unable to load return details.');
      setSelectedReturn(ret);
      setIsModalOpen(true);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  /* ── Delete ── */
  const openDeleteModal     = (id) => { setItemToDelete(id); setIsDeleteDialogOpen(true); };
  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`/api/purchase-invoice/returns/${itemToDelete}`);
      setReturns(prev => prev.filter(r => r.returnId !== itemToDelete));
      toast.success('Purchase return deleted successfully!');
    } catch {
      toast.error('Delete failed.');
    } finally {
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  /* ── Status badge ── */
  const renderStatus = (status) => {
    const s = status?.toString().trim().toLowerCase();
    if (s === 'processed' || s === 'completed' || s === 'approved')
      return <span className="prl1-badge processed"><CheckCircle2 size={9} strokeWidth={3} />Processed</span>;
    if (s === 'partial')
      return <span className="prl1-badge partial"><Clock size={9} strokeWidth={3} />Partial</span>;
    if (s === 'pending' || s === 'submitted')
      return <span className="prl1-badge pending"><AlertCircle size={9} strokeWidth={3} />Pending</span>;
    return <span className="prl1-badge unknown">{status || 'N/A'}</span>;
  };

  /* ── Filter ── */
  const filteredReturns = returns.filter(r => {
    const name    = (r.supplierName || r.vendorName || r.unitName || '').toLowerCase();
    const retNo   = (r.returnNo || '').toLowerCase();
    const billNo  = (r.invoiceNo || r.billNo || '').toLowerCase();
    const matchSearch =
      retNo.includes(searchTerm.toLowerCase()) ||
      billNo.includes(searchTerm.toLowerCase()) ||
      name.includes(searchTerm.toLowerCase());

    const retDate = r.returnDate ? new Date(r.returnDate) : null;
    let matchDate = true;
    if (fromDate && retDate && retDate < fromDate) matchDate = false;
    if (toDate && retDate) {
      const end = new Date(toDate);
      end.setHours(23, 59, 59);
      if (retDate > end) matchDate = false;
    }
    return matchSearch && matchDate;
  });

  const fmtINR    = n => Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  const fmtDate   = d => d ? new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—';
  const hasFilter = searchTerm || fromDate || toDate;

  /* ── JSX ── */
  return (
    <div className="prl1-root">

      <ReusableDialogueBox
        isOpen={isDeleteDialogOpen}
        title="Delete Purchase Return"
        message="Are you sure you want to permanently delete this purchase return record?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />

      <div className="prl1-card">

        {/* ── Header ── */}
        <div className="prl1-header">
          <div className="prl1-title-row">
            <div className="prl1-icon-box">
              <RefreshCcw size={18} color="#fff" strokeWidth={2} />
            </div>
            <div>
              <h2 className="prl1-title">Purchase Return / Debit Note List</h2>
              <p className="prl1-subtitle">Manage all purchase returns and vendor debit notes</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/purchase-return')}
            className="prl1-btn prl1-btn-primary"
          >
            <Plus size={14} /> New Return
          </button>
        </div>

        {/* ── Controls ── */}
        <div className="prl1-controls">
          {/* From Date */}
          <div className="prl1-date-wrap">
            <span className="prl1-date-label">From</span>
            <DatePicker
              selected={fromDate}
              onChange={d => setFromDate(d)}
              placeholderText="dd-mm-yyyy"
              dateFormat="dd-MM-yyyy"
            />
          </div>

          {/* To Date */}
          <div className="prl1-date-wrap">
            <span className="prl1-date-label">To</span>
            <DatePicker
              selected={toDate}
              onChange={d => setToDate(d)}
              placeholderText="dd-mm-yyyy"
              dateFormat="dd-MM-yyyy"
            />
          </div>

          {hasFilter && (
            <button
              onClick={handleReset}
              className="prl1-btn prl1-btn-ghost"
              style={{ height: 36, padding: '0 12px' }}
            >
              <RotateCcw size={12} /> Reset
            </button>
          )}

          <div className="prl1-sep" />

          {/* Search */}
          <div className="prl1-search-wrap">
            <Search size={13} className="prl1-search-icon" />
            <input
              type="text"
              className="prl1-search"
              placeholder="Search return no, bill no, or vendor…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="prl1-show-label">Show</span>
            <select
              value={pageSize}
              onChange={e => { setPageSize(Number(e.target.value)); setPage(0); }}
              className="prl1-select"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="prl1-table-wrap">
          <table className="prl1-table">
            <thead>
              <tr>
                <th className="c" style={{ width: 110 }}>Actions</th>
                <th>Return No</th>
                <th>Bill / PO Ref</th>
                <th className="c">Return Date</th>
                <th>Supplier / Vendor</th>
                <th>Reason</th>
                <th className="c">Type</th>
                <th className="r">Debit Amount</th>
                <th className="r">Settled Amt</th>
                <th className="c">Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredReturns.length > 0 ? (
                filteredReturns.map((ret, index) => {
                  const debitAmt    = Number(ret.debitAmount || ret.creditAmount || ret.totalAmount || 0);
                  const settledAmt  = Number(ret.settledAmount || ret.refundAmount || 0);

                  return (
                    <tr key={ret.returnId || ret.id || index}>

                      {/* Actions */}
                      <td className="c">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                          <button
                            className="prl1-action-btn view"
                            title="View Details"
                            onClick={() => handleViewDetails(ret)}
                            disabled={isLoadingDetails}
                          >
                            <VisibilityIcon sx={{ fontSize: 14 }} />
                          </button>

                          <button
                            className="prl1-action-btn del"
                            title="Delete Return"
                            onClick={() => openDeleteModal(ret.returnId || ret.id)}
                          >
                            <DeleteIcon sx={{ fontSize: 14 }} />
                          </button>
                        </div>
                      </td>

                      {/* Return No */}
                      <td>
                        <span className="prl1-ret-no">#{ret.returnNo || 'N/A'}</span>
                      </td>

                      {/* Bill / PO Ref */}
                      <td>
                        <span className="prl1-inv-no">{ret.invoiceNo || ret.billNo || ret.poNumber || '—'}</span>
                      </td>

                      {/* Return Date */}
                      <td className="c" style={{ color: 'var(--ink-3)', fontWeight: 500 }}>
                        {ret.returnDate ? new Date(ret.returnDate).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—'}
                      </td>

                      {/* Supplier */}
                      <td>
                        <div className="prl1-vendor">
                          {ret.supplierName || ret.vendorName || ret.unitName || '—'}
                        </div>
                        {(ret.supplierGstin || ret.gstin) && (
                          <div className="prl1-vendor-sub">{ret.supplierGstin || ret.gstin}</div>
                        )}
                      </td>

                      {/* Reason */}
                      <td>
                        <span className="prl1-reason">{ret.reasonCode || ret.returnReason || '—'}</span>
                        {ret.reasonText && (
                          <div style={{ fontSize: 10, color: 'var(--ink-4)', marginTop: 2 }}>
                            {ret.reasonText}
                          </div>
                        )}
                      </td>

                      {/* Return Type */}
                      <td className="c">
                        <span className="prl1-type">
                          {ret.returnType === 'PURCHASE_RETURN' ? 'Debit Note' : (ret.returnType || 'Return')}
                        </span>
                      </td>

                      {/* Debit Amount */}
                      <td className="r">
                        <span className="prl1-amount orange">
                          ₹{debitAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </td>

                      {/* Settled Amount */}
                      <td className="r">
                        <span className="prl1-amount green">
                          ₹{settledAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="c">{renderStatus(ret.status)}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="10">
                    <div className="prl1-empty">
                      <div className="prl1-empty-icon">
                        <RefreshCcw size={24} />
                      </div>
                      <p style={{ margin: '0 0 6px', fontWeight: 600, color: 'var(--ink-3)' }}>
                        No purchase return records found
                      </p>
                      <p style={{ margin: 0, fontSize: 11 }}>
                        Try adjusting your search or date filters.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        <div className="prl1-footer">
          <p className="prl1-footer-info">
            Showing <span>{filteredReturns.length}</span> of {totalElements} records
          </p>

          <div className="prl1-page-btns">
            <button
              className="prl1-page-btn"
              disabled={page === 0}
              onClick={() => setPage(p => Math.max(p - 1, 0))}
            >
              <ChevronLeft size={15} />
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                className={`prl1-page-btn${page === i ? ' active' : ''}`}
                onClick={() => setPage(i)}
              >
                {i + 1}
              </button>
            ))}

            <button
              className="prl1-page-btn"
              disabled={page >= totalPages - 1 || totalPages === 0}
              onClick={() => setPage(p => Math.min(p + 1, totalPages - 1))}
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* ── VIEW MODAL ── */}
      {isModalOpen && selectedReturn && (
        <div className="prl1-overlay">
          <div className="prl1-modal">

            {/* Header */}
            <div className="prl1-modal-header">
              <div className="prl1-modal-title">
                <RefreshCcw size={16} />
                Purchase Return / Debit Note Preview
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.25)',
                  color: '#fff', borderRadius: 8, padding: '6px 14px',
                  cursor: 'pointer', fontSize: 11, fontWeight: 600,
                  fontFamily: 'Poppins, sans-serif'
                }}
              >
                Close
              </button>
            </div>

            {/* Body */}
            <div className="prl1-modal-body">

              {/* Meta */}
              <div className="prl1-meta-grid">
                <div className="prl1-meta-item">
                  <label>Supplier / Vendor</label>
                  <p>
                    <Landmark size={12} color="var(--accent)" />
                    {selectedReturn.supplierName || selectedReturn.vendorName || selectedReturn.unitName || '—'}
                  </p>
                </div>
                <div className="prl1-meta-item">
                  <label>Return No</label>
                  <p style={{ fontFamily: 'monospace' }}>#{selectedReturn.returnNo || 'N/A'}</p>
                </div>
                <div className="prl1-meta-item">
                  <label>Bill / PO Ref</label>
                  <p style={{ fontFamily: 'monospace', color: 'var(--cyan)' }}>
                    {selectedReturn.invoiceNo || selectedReturn.billNo || selectedReturn.poNumber || '—'}
                  </p>
                </div>
                <div className="prl1-meta-item">
                  <label>Status</label>
                  <div>{renderStatus(selectedReturn.status)}</div>
                </div>
                <div className="prl1-meta-item">
                  <label>Return Date</label>
                  <p>
                    <Calendar size={12} color="var(--accent)" />
                    {fmtDate(selectedReturn.returnDate)}
                  </p>
                </div>
                <div className="prl1-meta-item">
                  <label>Reason Code</label>
                  <p><span className="prl1-reason">{selectedReturn.reasonCode || '—'}</span></p>
                </div>
                <div className="prl1-meta-item">
                  <label>Return Type</label>
                  <p>
                    <span className="prl1-type">
                      {selectedReturn.returnType === 'PURCHASE_RETURN' ? 'Debit Note' : (selectedReturn.returnType || 'Return')}
                    </span>
                  </p>
                </div>
                <div className="prl1-meta-item">
                  <label>GSTIN</label>
                  <p style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                    {selectedReturn.supplierGstin || selectedReturn.gstin || '—'}
                  </p>
                </div>
                {(selectedReturn.reasonText || selectedReturn.remarks) && (
                  <div className="prl1-meta-item" style={{ gridColumn: 'span 2' }}>
                    <label>Reason Text / Remarks</label>
                    <p style={{ fontSize: 11 }}>
                      {selectedReturn.reasonText || selectedReturn.remarks || '—'}
                    </p>
                  </div>
                )}
              </div>

              <hr className="prl1-divider" />

              {/* Items */}
              <div>
                <p style={{
                  margin: '0 0 10px', fontSize: 10, fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '.8px', color: 'var(--ink-4)',
                  display: 'flex', alignItems: 'center', gap: 6
                }}>
                  <Package size={12} color="var(--accent)" /> Returned Items
                </p>
                <div className="prl1-inner-table-wrap">
                  <table className="prl1-inner-table">
                    <thead>
                      <tr>
                        <th>Item Name</th>
                        <th className="c">Batch</th>
                        <th className="c">Qty</th>
                        <th className="r">Rate</th>
                        <th className="r">GST %</th>
                        <th className="r">Debit Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedReturn.items || selectedReturn.returnItems || []).length > 0
                        ? (selectedReturn.items || selectedReturn.returnItems).map((item, i) => (
                          <tr key={i}>
                            <td style={{ fontWeight: 500 }}>{item.itemName || '—'}</td>
                            <td className="c" style={{ fontSize: 10, color: 'var(--ink-4)' }}>
                              {item.batchCode || '—'}
                            </td>
                            <td className="c" style={{ fontWeight: 700, color: 'var(--orange)' }}>
                              {item.quantity || 0}
                            </td>
                            <td className="r">₹{fmtINR(item.rate || 0)}</td>
                            <td className="r">{item.gstRate || 0}%</td>
                            <td className="r" style={{ fontWeight: 700, color: 'var(--accent)' }}>
                              ₹{fmtINR(item.lineTotal || 0)}
                            </td>
                          </tr>
                        ))
                        : (
                          <tr>
                            <td colSpan="6" style={{
                              padding: '24px', textAlign: 'center',
                              color: 'var(--ink-4)', fontStyle: 'italic', fontSize: 12
                            }}>
                              No items recorded
                            </td>
                          </tr>
                        )
                      }
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary */}
              <div className="prl1-summary">
                <div className="prl1-summary-big">
                  <label>Net Debit Value</label>
                  <p>₹{fmtINR(selectedReturn.debitAmount || selectedReturn.creditAmount || selectedReturn.totalAmount || 0)}</p>
                </div>
                <div className="prl1-summary-stats">
                  <div className="prl1-stat-item green">
                    <label>Settled Amount</label>
                    <p>₹{fmtINR(selectedReturn.settledAmount || selectedReturn.refundAmount || 0)}</p>
                  </div>
                  <div className="prl1-stat-item orange">
                    <label>Pending Debit</label>
                    <p>₹{fmtINR(
                      (selectedReturn.debitAmount || selectedReturn.creditAmount || selectedReturn.totalAmount || 0) -
                      (selectedReturn.settledAmount || selectedReturn.refundAmount || 0)
                    )}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="prl1-modal-footer">
              <button onClick={() => setIsModalOpen(false)} className="prl1-btn prl1-btn-outline">
                Close Preview
              </button>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  navigate('/purchase-return-v1', {
                    state: { invoice: { invoiceNo: selectedReturn.invoiceNo || selectedReturn.billNo } }
                  });
                }}
                className="prl1-btn prl1-btn-primary"
              >
                <RefreshCcw size={13} /> View Return Form
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE MODAL ── */}
      {isDeleteDialogOpen && (
        <div className="prl1-overlay" style={{ zIndex: 60 }}>
          <div className="prl1-del-modal">
            <div className="prl1-del-icon"><Trash2 size={28} /></div>
            <h3>Confirm Deletion</h3>
            <p>
              Are you sure you want to permanently delete this purchase return record?
              This action cannot be undone.
            </p>
            <div className="prl1-del-btns">
              <button className="prl1-del-cancel" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </button>
              <button className="prl1-del-confirm" onClick={handleConfirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseReturnV1List;