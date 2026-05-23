import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Plus, CheckCircle2, Clock, AlertCircle,
  ChevronLeft, ChevronRight, FileText, User,
  Calendar, Package, Trash2, RotateCcw,
  Search, Warehouse, AlertTriangle,
  Boxes, TrendingUp, ArrowDownToLine
} from 'lucide-react';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';
import ReusableDialogueBox from "../contextapi/ReusableDialogueBox";
import { useToast } from "../contextapi/ToastContext";

/* ─── Inline CSS ─────────────────────────────────────────────── */
const injectStyles = () => {
  if (document.getElementById('psl1-styles')) return;
  const style = document.createElement('style');
  style.id = 'psl1-styles';
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');

    .psl1-root {
      --ink:            #0f172a;
      --ink-2:          #1e293b;
      --ink-3:          #475569;
      --ink-4:          #94a3b8;
      --surface:        #ffffff;
      --surface-2:      #f0fdf4;
      --surface-3:      #dcfce7;
      --border:         #86efac;
      --border-d:       #4ade80;
      --accent:         #16a34a;
      --accent-d:       #15803d;
      --accent-light:   #f0fdf4;
      --accent-mid:     #bbf7d0;
      --accent-dim:     #22c55e;
      --cyan:           #0891b2;
      --cyan-bg:        #ecfeff;
      --teal:           #0f766e;
      --teal-bg:        #f0fdfa;
      --emerald:        #059669;
      --emerald-bg:     #ecfdf5;
      --amber:          #d97706;
      --amber-bg:       #fffbeb;
      --orange:         #ea580c;
      --orange-bg:      #fff7ed;
      --rose:           #e11d48;
      --rose-bg:        #fff1f2;
      --shadow-sm:      0 1px 3px rgba(22,163,74,.06), 0 1px 2px rgba(15,23,42,.04);
      --shadow-md:      0 4px 16px rgba(22,163,74,.09), 0 2px 6px rgba(15,23,42,.04);
      --shadow-lg:      0 20px 48px rgba(15,23,42,.12), 0 8px 16px rgba(15,23,42,.06);
      font-family: 'Poppins', sans-serif;
      color: var(--ink);
      background: var(--surface-2);
      min-height: 100vh;
      padding: 28px 32px;
      box-sizing: border-box;
    }

    .psl1-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 18px;
      box-shadow: var(--shadow-md);
      overflow: hidden;
    }

    .psl1-header {
      padding: 20px 28px;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 14px;
      background: var(--surface);
    }

    .psl1-title-row { display: flex; align-items: center; gap: 14px; }

    .psl1-icon-box {
      width: 40px; height: 40px; border-radius: 12px;
      background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 12px rgba(22,163,74,.35); flex-shrink: 0;
    }

    .psl1-title { font-size: 16px; font-weight: 700; color: var(--ink); letter-spacing: -0.3px; margin: 0; }
    .psl1-subtitle { font-size: 11px; color: var(--ink-4); font-weight: 400; margin: 1px 0 0; }

    .psl1-controls {
      padding: 14px 28px;
      border-bottom: 1px solid var(--border);
      background: var(--surface-2);
      display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
    }

    .psl1-date-wrap {
      position: relative; display: flex; align-items: center;
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 10px; overflow: hidden; height: 36px;
      transition: border-color .15s, box-shadow .15s;
    }
    .psl1-date-wrap:focus-within { border-color: var(--accent-dim); box-shadow: 0 0 0 3px rgba(34,197,94,.12); }

    .psl1-date-label {
      font-size: 10px; font-weight: 600; color: var(--ink-4);
      padding: 0 8px 0 12px; text-transform: uppercase; letter-spacing: .5px; white-space: nowrap;
    }

    .psl1-date-wrap .react-datepicker-wrapper,
    .psl1-date-wrap .react-datepicker__input-container { display: flex; align-items: center; height: 100%; }

    .psl1-date-wrap input {
      border: none; background: transparent; font-family: 'Poppins', sans-serif;
      font-size: 12px; font-weight: 500; color: var(--ink); outline: none; width: 96px; padding-right: 12px;
    }

    .psl1-search-wrap { position: relative; flex: 1; min-width: 200px; max-width: 260px; }
    .psl1-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--ink-4); pointer-events: none; }
    .psl1-search {
      width: 100%; padding: 8px 14px 8px 36px; border: 1px solid var(--border);
      border-radius: 10px; font-family: 'Poppins', sans-serif; font-size: 12px; color: var(--ink);
      background: var(--surface); outline: none; transition: border-color .15s, box-shadow .15s; box-sizing: border-box;
    }
    .psl1-search:focus { border-color: var(--accent-dim); box-shadow: 0 0 0 3px rgba(34,197,94,.12); }

    .psl1-chip-wrap { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
    .psl1-chip {
      padding: 5px 12px; border-radius: 20px; font-family: 'Poppins', sans-serif;
      font-size: 10px; font-weight: 700; letter-spacing: .3px; text-transform: uppercase;
      cursor: pointer; border: 1px solid var(--border); background: var(--surface);
      color: var(--ink-3); transition: all .15s; white-space: nowrap;
    }
    .psl1-chip:hover { background: var(--surface-2); border-color: var(--border-d); }
    .psl1-chip.active-all      { background: var(--accent); color: #fff; border-color: var(--accent); box-shadow: 0 2px 8px rgba(22,163,74,.25); }
    .psl1-chip.active-good     { background: var(--emerald-bg); color: var(--emerald); border-color: #6ee7b7; }
    .psl1-chip.active-low      { background: var(--amber-bg); color: var(--amber); border-color: #fcd34d; }
    .psl1-chip.active-out      { background: var(--rose-bg); color: var(--rose); border-color: #fda4af; }
    .psl1-chip.active-received { background: var(--teal-bg); color: var(--teal); border-color: #5eead4; }

    .psl1-btn {
      display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px;
      border-radius: 10px; font-family: 'Poppins', sans-serif; font-size: 12px; font-weight: 600;
      cursor: pointer; border: none; transition: all .15s; white-space: nowrap; line-height: 1;
    }
    .psl1-btn-primary {
      background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
      color: #fff; box-shadow: 0 3px 10px rgba(22,163,74,.30);
    }
    .psl1-btn-primary:hover { background: linear-gradient(135deg, #15803d 0%, #14532d 100%); transform: translateY(-1px); }
    .psl1-btn-primary:active { transform: none; }
    .psl1-btn-ghost { background: var(--surface); color: var(--accent); border: 1px solid var(--border-d); }
    .psl1-btn-ghost:hover { background: var(--accent-light); }

    .psl1-select {
      padding: 7px 10px; border: 1px solid var(--border); border-radius: 10px;
      font-family: 'Poppins', sans-serif; font-size: 12px; color: var(--ink);
      background: var(--surface); outline: none; cursor: pointer;
    }

    .psl1-table-wrap { width: 100%; overflow-x: auto; }
    .psl1-table { width: 100%; border-collapse: collapse; }

    .psl1-table thead tr {
      background: linear-gradient(90deg, var(--surface-2), #f0fdf4);
      border-bottom: 2px solid var(--border);
    }
    .psl1-table th {
      padding: 11px 16px; font-size: 10px; font-weight: 700; color: var(--accent);
      text-transform: uppercase; letter-spacing: .7px; white-space: nowrap;
    }
    .psl1-table th.r { text-align: right; }
    .psl1-table th.c { text-align: center; }

    .psl1-table tbody tr { border-bottom: 1px solid var(--border); transition: background .12s; }
    .psl1-table tbody tr:last-child { border-bottom: none; }
    .psl1-table tbody tr:hover { background: #f0fdf4; }

    .psl1-table td { padding: 12px 16px; font-size: 12px; color: var(--ink-2); vertical-align: middle; }
    .psl1-table td.r { text-align: right; }
    .psl1-table td.c { text-align: center; }

    .psl1-po-no {
      font-size: 11px; font-weight: 600; color: var(--accent); background: var(--accent-light);
      padding: 3px 8px; border-radius: 6px; white-space: nowrap;
      font-family: monospace; border: 1px solid var(--accent-mid);
    }

    .psl1-item-name { font-weight: 600; color: var(--ink); font-size: 12px; }
    .psl1-item-code { font-size: 10px; color: var(--ink-4); font-family: monospace; font-weight: 500; margin-top: 1px; }

    .psl1-cat {
      display: inline-block; padding: 2px 8px; border-radius: 5px;
      font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: .4px;
      background: var(--cyan-bg); color: var(--cyan); border: 1px solid #a5f3fc;
    }

    .psl1-supplier { font-weight: 600; color: var(--ink); }
    .psl1-supplier-sub { font-size: 10px; color: var(--ink-4); margin-top: 1px; }

    .psl1-amount { font-weight: 600; font-size: 12px; font-family: monospace; }
    .psl1-amount.normal { color: var(--ink-2); }
    .psl1-amount.total  { color: var(--accent); font-weight: 700; }

    .psl1-qty { font-weight: 700; font-size: 13px; font-family: monospace; }
    .psl1-qty.good { color: var(--emerald); }
    .psl1-qty.low  { color: var(--amber); }
    .psl1-qty.out  { color: var(--rose); }

    .psl1-bar-wrap { height: 5px; border-radius: 3px; background: #e2e8f0; margin-top: 4px; overflow: hidden; width: 80px; }
    .psl1-bar-fill { height: 100%; border-radius: 3px; transition: width .3s; }
    .psl1-bar-fill.good { background: linear-gradient(90deg, #22c55e, #16a34a); }
    .psl1-bar-fill.low  { background: linear-gradient(90deg, #f59e0b, #d97706); }
    .psl1-bar-fill.out  { background: #e11d48; }

    .psl1-badge {
      display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px;
      border-radius: 20px; font-size: 10px; font-weight: 700; text-transform: uppercase;
      letter-spacing: .5px; white-space: nowrap; border: none; cursor: default;
    }
    .psl1-badge.received  { background: var(--emerald-bg); color: var(--emerald); }
    .psl1-badge.transit   { background: var(--cyan-bg);    color: var(--cyan); }
    .psl1-badge.pending   { background: var(--amber-bg);   color: var(--amber); }
    .psl1-badge.cancelled { background: var(--rose-bg);    color: var(--rose); }

    .psl1-action-btn {
      width: 30px; height: 30px; border-radius: 8px; border: none;
      display: inline-flex; align-items: center; justify-content: center;
      cursor: pointer; transition: all .15s;
    }
    .psl1-action-btn.view { background: var(--accent-light); color: var(--accent); border: 1px solid var(--accent-mid); }
    .psl1-action-btn.view:hover { background: var(--accent); color: #fff; border-color: var(--accent); }
    .psl1-action-btn.edit { background: var(--cyan-bg); color: var(--cyan); border: 1px solid #a5f3fc; }
    .psl1-action-btn.edit:hover { background: var(--cyan); color: #fff; border-color: var(--cyan); }
    .psl1-action-btn.del  { background: var(--rose-bg); color: var(--rose); }
    .psl1-action-btn.del:hover  { background: var(--rose); color: #fff; }

    .psl1-footer {
      padding: 16px 28px; display: flex; align-items: center; justify-content: space-between;
      border-top: 1px solid var(--border); background: var(--surface-2); flex-wrap: wrap; gap: 12px;
    }
    .psl1-footer-info { font-size: 11px; color: var(--ink-4); }
    .psl1-footer-info span { color: var(--accent); font-weight: 700; }

    .psl1-page-btns { display: flex; align-items: center; gap: 5px; }
    .psl1-page-btn {
      width: 32px; height: 32px; border-radius: 9px; border: 1px solid var(--border);
      background: var(--surface); color: var(--ink-3); font-size: 12px; font-weight: 600;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: all .12s; font-family: 'Poppins', sans-serif;
    }
    .psl1-page-btn:hover:not(:disabled) { background: var(--accent-light); color: var(--accent); border-color: var(--border-d); }
    .psl1-page-btn.active { background: var(--accent); color: #fff; border-color: var(--accent); box-shadow: 0 3px 8px rgba(22,163,74,.3); }
    .psl1-page-btn:disabled { opacity: .4; cursor: not-allowed; }

    .psl1-overlay {
      position: fixed; inset: 0; z-index: 50; background: rgba(15,23,42,.5);
      backdrop-filter: blur(6px); display: flex; align-items: center;
      justify-content: center; padding: 20px;
    }

    .psl1-modal {
      background: var(--surface); border-radius: 20px; box-shadow: var(--shadow-lg);
      width: 100%; max-width: 740px; max-height: 90vh;
      display: flex; flex-direction: column; overflow: hidden;
    }

    .psl1-modal-header {
      padding: 20px 24px;
      background: linear-gradient(135deg, #16a34a 0%, #0f766e 100%);
      display: flex; align-items: center; justify-content: space-between;
    }

    .psl1-modal-title { display: flex; align-items: center; gap: 8px; color: #fff; font-size: 14px; font-weight: 700; }

    .psl1-modal-body { padding: 24px; overflow-y: auto; display: flex; flex-direction: column; gap: 20px; }

    .psl1-meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
    @media(min-width:540px) { .psl1-meta-grid { grid-template-columns: repeat(4, 1fr); } }

    .psl1-meta-item label {
      display: block; font-size: 9px; font-weight: 700; text-transform: uppercase;
      letter-spacing: .8px; color: var(--ink-4); margin-bottom: 5px;
    }
    .psl1-meta-item p {
      font-size: 12px; font-weight: 600; color: var(--ink);
      display: flex; align-items: center; gap: 5px; margin: 0;
    }

    .psl1-divider { border: none; border-top: 1px solid var(--border); margin: 0; }

    .psl1-inner-table-wrap { border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
    .psl1-inner-table { width: 100%; border-collapse: collapse; }
    .psl1-inner-table thead tr { background: var(--surface-2); }
    .psl1-inner-table th { padding: 9px 14px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; color: var(--accent); }
    .psl1-inner-table th.r { text-align: right; }
    .psl1-inner-table th.c { text-align: center; }
    .psl1-inner-table tbody tr { border-top: 1px solid var(--border); }
    .psl1-inner-table tbody tr:hover { background: #f0fdf4; }
    .psl1-inner-table td { padding: 10px 14px; font-size: 12px; color: var(--ink-2); }
    .psl1-inner-table td.r { text-align: right; }
    .psl1-inner-table td.c { text-align: center; }

    .psl1-summary {
      background: linear-gradient(135deg, #f0fdf4 0%, #f0fdfa 100%);
      border: 1px solid var(--border-d); border-radius: 14px; padding: 18px 22px;
      display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;
    }
    .psl1-summary-big label {
      font-size: 9px; font-weight: 700; text-transform: uppercase;
      letter-spacing: .8px; color: var(--accent); display: block; margin-bottom: 4px;
    }
    .psl1-summary-big p {
      font-size: 28px; font-weight: 800; color: var(--accent-d);
      margin: 0; line-height: 1; font-family: monospace;
    }
    .psl1-summary-stats { display: flex; gap: 24px; }
    .psl1-stat-item { text-align: right; }
    .psl1-stat-item:not(:last-child) { border-right: 1px solid var(--border-d); padding-right: 24px; }
    .psl1-stat-item label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: .6px; display: block; margin-bottom: 3px; }
    .psl1-stat-item p { font-size: 13px; font-weight: 700; margin: 0; font-family: monospace; }
    .psl1-stat-item.green label { color: var(--emerald); } .psl1-stat-item.green p { color: var(--emerald); }
    .psl1-stat-item.amber label { color: var(--amber); }   .psl1-stat-item.amber p { color: var(--amber); }
    .psl1-stat-item.teal  label { color: var(--teal); }    .psl1-stat-item.teal  p { color: var(--teal); }

    .psl1-modal-footer {
      padding: 14px 24px; border-top: 1px solid var(--border);
      background: var(--surface-2); display: flex; justify-content: flex-end; gap: 10px;
    }
    .psl1-btn-outline { background: var(--surface); color: var(--ink-3); border: 1px solid var(--border); }
    .psl1-btn-outline:hover { background: var(--surface-3); }

    .psl1-del-modal {
      background: var(--surface); border-radius: 20px; box-shadow: var(--shadow-lg);
      width: 100%; max-width: 380px; padding: 32px 28px; text-align: center;
    }
    .psl1-del-icon {
      width: 60px; height: 60px; border-radius: 50%; background: var(--rose-bg); color: var(--rose);
      display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;
    }
    .psl1-del-modal h3 { font-size: 16px; font-weight: 700; color: var(--ink); margin: 0 0 8px; }
    .psl1-del-modal p  { font-size: 12px; color: var(--ink-4); line-height: 1.6; margin: 0 0 22px; }
    .psl1-del-btns { display: flex; gap: 10px; }
    .psl1-del-btns button {
      flex: 1; padding: 11px; border-radius: 12px; font-family: 'Poppins', sans-serif;
      font-size: 12px; font-weight: 700; cursor: pointer; border: none; transition: all .15s;
    }
    .psl1-del-cancel  { background: var(--surface-3); color: var(--ink-2); border: 1px solid var(--border) !important; }
    .psl1-del-cancel:hover { background: #bbf7d0; }
    .psl1-del-confirm { background: var(--rose); color: #fff; box-shadow: 0 3px 10px rgba(225,29,72,.25); }
    .psl1-del-confirm:hover { background: #be123c; }

    .psl1-empty { padding: 64px 20px; text-align: center; color: var(--ink-4); font-size: 13px; }
    .psl1-empty-icon {
      width: 56px; height: 56px; border-radius: 16px; background: var(--surface-3);
      display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; color: var(--accent);
    }
    .psl1-sep { width: 1px; height: 20px; background: var(--border); flex-shrink: 0; }
    .psl1-show-label { font-size: 11px; color: var(--ink-4); white-space: nowrap; }
  `;
  document.head.appendChild(style);
};

/* ─── Helpers ── */
const fmtINR  = n => Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
const fmtDate = d => d ? new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—';
const stockClass = (curr, max) => { if (!curr || curr === 0) return 'out'; const p = max ? (curr/max)*100 : 100; return p < 30 ? 'low' : 'good'; };
const stockPct   = (curr, max) => max ? Math.min(100, Math.round((curr / max) * 100)) : 100;

/* ─── Component ─────────────────────────────────────────────── */
const PurchaseStockList = () => {
  const [stocks, setStocks]                 = useState([]);
  const [searchTerm, setSearchTerm]         = useState('');
  const [fromDate, setFromDate]             = useState(null);
  const [toDate, setToDate]                 = useState(null);
  const [page, setPage]                     = useState(0);
  const [pageSize, setPageSize]             = useState(10);
  const [totalPages, setTotalPages]         = useState(0);
  const [totalElements, setTotalElements]   = useState(0);
  const [activeFilter, setActiveFilter]     = useState('all');
  const [selectedStock, setSelectedStock]   = useState(null);
  const [isModalOpen, setIsModalOpen]       = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete]     = useState(null);

  const navigate = useNavigate();
  const toast    = useToast();

  useEffect(() => { injectStyles(); }, []);

  const fetchStocks = async () => {
    try {
      const res = await axios.get(`/api/purchase/stock/all-paginated?page=${page}&size=${pageSize}`);
      const payload = res.data;
      setStocks(payload?.content || payload || []);
      setTotalPages(payload?.totalPages ?? 0);
      setTotalElements(payload?.totalElements ?? 0);
    } catch (err) {
      console.error('Error fetching purchase stock:', err);
      setStocks([]);
    }
  };

  useEffect(() => { fetchStocks(); }, [page, pageSize]);
  useEffect(() => { setPage(0); }, [searchTerm, fromDate, toDate, activeFilter]);

  const handleReset = () => { setSearchTerm(''); setFromDate(null); setToDate(null); setActiveFilter('all'); setPage(0); };

  const handleViewDetails = async (stock) => {
    const id = stock?.stockId || stock?.itemId;
    if (!id) { toast.error('Stock ID not available.'); return; }
    setIsLoadingDetails(true);
    try {
      const res = await axios.get(`/api/purchase/stock/${id}`);
      setSelectedStock(res?.data?.data || res?.data || stock);
      setIsModalOpen(true);
    } catch {
      setSelectedStock(stock);
      setIsModalOpen(true);
    } finally { setIsLoadingDetails(false); }
  };

  const openDeleteModal     = (id) => { setItemToDelete(id); setIsDeleteDialogOpen(true); };
  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`/api/purchase/stock/${itemToDelete}`);
      setStocks(prev => prev.filter(s => (s.stockId || s.itemId) !== itemToDelete));
      toast.success('Stock record deleted successfully!');
    } catch { toast.error('Delete failed.'); }
    finally { setIsDeleteDialogOpen(false); setItemToDelete(null); }
  };

  const renderStatus = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'received')  return <span className="psl1-badge received"><CheckCircle2 size={9} strokeWidth={3} />Received</span>;
    if (s === 'transit')   return <span className="psl1-badge transit"><ArrowDownToLine size={9} strokeWidth={3} />In Transit</span>;
    if (s === 'cancelled') return <span className="psl1-badge cancelled"><AlertCircle size={9} strokeWidth={3} />Cancelled</span>;
    return                        <span className="psl1-badge pending"><Clock size={9} strokeWidth={3} />Pending</span>;
  };

  const filteredStocks = stocks.filter(s => {
    const name = (s.itemName || s.productName || '').toLowerCase();
    const code = (s.itemCode || s.sku || '').toLowerCase();
    const po   = (s.poNumber || s.purchaseOrderNo || '').toLowerCase();
    const sup  = (s.supplierName || s.vendorName || '').toLowerCase();
    const matchSearch = name.includes(searchTerm.toLowerCase()) || code.includes(searchTerm.toLowerCase()) ||
      po.includes(searchTerm.toLowerCase()) || sup.includes(searchTerm.toLowerCase());

    const curr = s.currentStock || s.quantity || 0;
    const max  = s.maxStock || s.orderedQty || 0;
    const cls  = stockClass(curr, max);
    let matchFilter = true;
    if (activeFilter === 'good')     matchFilter = cls === 'good';
    if (activeFilter === 'low')      matchFilter = cls === 'low';
    if (activeFilter === 'out')      matchFilter = cls === 'out';
    if (activeFilter === 'received') matchFilter = (s.status || '').toLowerCase() === 'received';

    const sDate = s.receivedDate || s.purchaseDate ? new Date(s.receivedDate || s.purchaseDate) : null;
    let matchDate = true;
    if (fromDate && sDate && sDate < fromDate) matchDate = false;
    if (toDate && sDate) { const end = new Date(toDate); end.setHours(23,59,59); if (sDate > end) matchDate = false; }
    return matchSearch && matchFilter && matchDate;
  });

  const hasFilter = searchTerm || fromDate || toDate || activeFilter !== 'all';

  return (
    <div className="psl1-root">
      <ReusableDialogueBox
        isOpen={isDeleteDialogOpen}
        title="Delete Stock Record"
        message="Are you sure you want to permanently delete this stock record?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />

      <div className="psl1-card">

        {/* ── Header ── */}
        <div className="psl1-header">
          <div className="psl1-title-row">
            <div className="psl1-icon-box">
              <Warehouse size={18} color="#fff" strokeWidth={2} />
            </div>
            <div>
              <h2 className="psl1-title">Purchase Stock List</h2>
              <p className="psl1-subtitle">Inventory levels · Purchase orders · Batch tracking</p>
            </div>
          </div>
          <button onClick={() => navigate('/purchase-stock')} className="psl1-btn psl1-btn-primary">
            <Plus size={14} /> New Purchase
          </button>
        </div>

        {/* ── Controls ── */}
        <div className="psl1-controls">
          <div className="psl1-date-wrap">
            <span className="psl1-date-label">From</span>
            <DatePicker selected={fromDate} onChange={d => setFromDate(d)} placeholderText="dd-mm-yyyy" dateFormat="dd-MM-yyyy" />
          </div>
          <div className="psl1-date-wrap">
            <span className="psl1-date-label">To</span>
            <DatePicker selected={toDate} onChange={d => setToDate(d)} placeholderText="dd-mm-yyyy" dateFormat="dd-MM-yyyy" />
          </div>
          {hasFilter && (
            <button onClick={handleReset} className="psl1-btn psl1-btn-ghost" style={{ height: 36, padding: '0 12px' }}>
              <RotateCcw size={12} /> Reset
            </button>
          )}
          <div className="psl1-sep" />
        
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="psl1-search-wrap">
              <Search size={13} className="psl1-search-icon" />
              <input type="text" className="psl1-search" placeholder="Item, code, PO, supplier…"
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <span className="psl1-show-label">Show</span>
            <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(0); }} className="psl1-select">
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="psl1-table-wrap">
          <table className="psl1-table">
            <thead>
              <tr>
                <th className="c" style={{ width: 110 }}>Actions</th>
                <th>PO Number</th>
                <th>Item / Product</th>
                <th>Category</th>
                <th>Supplier</th>
                <th className="r">Purchase Rate</th>
                <th className="c">Ordered Qty</th>
                <th className="c">Current Stock</th>
                <th>Stock Level</th>
                <th className="r">Total Value</th>
                <th className="c">Received Date</th>
                <th className="c">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredStocks.length > 0 ? (
                filteredStocks.map((stock, index) => {
                  const curr = stock.currentStock || stock.quantity || 0;
                  const max  = stock.maxStock || stock.orderedQty || 0;
                  const cls  = stockClass(curr, max);
                  const pct  = stockPct(curr, max);
                  return (
                    <tr key={stock.stockId || stock.itemId || index}>
                      {/* Actions */}
                      <td className="c">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                          <button className="psl1-action-btn view" title="View Details"
                            onClick={() => handleViewDetails(stock)} disabled={isLoadingDetails}>
                            <VisibilityIcon sx={{ fontSize: 14 }} />
                          </button>
                          <button className="psl1-action-btn edit" title="Edit Stock"
                            onClick={() => navigate('/purchase-v1', { state: { stock } })}>
                            <EditIcon sx={{ fontSize: 14 }} />
                          </button>
                          <button className="psl1-action-btn del" title="Delete Record"
                            onClick={() => openDeleteModal(stock.stockId || stock.itemId)}>
                            <DeleteIcon sx={{ fontSize: 14 }} />
                          </button>
                        </div>
                      </td>
                      {/* PO Number */}
                      <td><span className="psl1-po-no">{stock.poNumber || stock.purchaseOrderNo || '—'}</span></td>
                      {/* Item */}
                      <td>
                        <div className="psl1-item-name">{stock.itemName || stock.productName || '—'}</div>
                        <div className="psl1-item-code">{stock.itemCode || stock.sku || ''}</div>
                      </td>
                      {/* Category */}
                      <td><span className="psl1-cat">{stock.category || stock.categoryName || 'General'}</span></td>
                      {/* Supplier */}
                      <td>
                        <div className="psl1-supplier">{stock.supplierName || stock.vendorName || '—'}</div>
                        {(stock.supplierGstin || stock.gstin) && (
                          <div className="psl1-supplier-sub">{stock.supplierGstin || stock.gstin}</div>
                        )}
                      </td>
                      {/* Rate */}
                      <td className="r">
                        <span className="psl1-amount normal">₹{fmtINR(stock.purchaseRate || stock.rate || 0)}</span>
                      </td>
                      {/* Ordered Qty */}
                      <td className="c" style={{ fontWeight: 600, color: 'var(--ink-3)', fontFamily: 'monospace' }}>
                        {max || '—'}
                      </td>
                      {/* Current Stock */}
                      <td className="c"><span className={`psl1-qty ${cls}`}>{curr}</span></td>
                      {/* Stock Level */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--ink-4)', marginBottom: 3 }}>{pct}%</div>
                            <div className="psl1-bar-wrap">
                              <div className={`psl1-bar-fill ${cls}`} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                          {cls === 'low' && <AlertTriangle size={13} color="var(--amber)" />}
                          {cls === 'out' && <AlertCircle  size={13} color="var(--rose)" />}
                        </div>
                      </td>
                      {/* Total Value */}
                      <td className="r">
                        <span className="psl1-amount total">
                          ₹{fmtINR(stock.totalValue || stock.purchaseValue || (curr * (stock.purchaseRate || stock.rate || 0)))}
                        </span>
                      </td>
                      {/* Received Date */}
                      <td className="c" style={{ color: 'var(--ink-3)', fontWeight: 500, fontSize: 11 }}>
                        {fmtDate(stock.receivedDate || stock.purchaseDate)}
                      </td>
                      {/* Status */}
                      <td className="c">{renderStatus(stock.status)}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="12">
                    <div className="psl1-empty">
                      <div className="psl1-empty-icon"><Boxes size={24} /></div>
                      <p style={{ margin: '0 0 6px', fontWeight: 600, color: 'var(--ink-3)' }}>No stock records found</p>
                      <p style={{ margin: 0, fontSize: 11 }}>Try adjusting your filters or add a new purchase entry.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        <div className="psl1-footer">
          <p className="psl1-footer-info">
            Showing <span>{filteredStocks.length}</span> of {totalElements} records
          </p>
          <div className="psl1-page-btns">
            <button className="psl1-page-btn" disabled={page === 0} onClick={() => setPage(p => Math.max(p-1, 0))}>
              <ChevronLeft size={15} />
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button key={i} className={`psl1-page-btn${page === i ? ' active' : ''}`} onClick={() => setPage(i)}>
                {i + 1}
              </button>
            ))}
            <button className="psl1-page-btn" disabled={page >= totalPages-1 || totalPages === 0}
              onClick={() => setPage(p => Math.min(p+1, totalPages-1))}>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* ── VIEW MODAL ── */}
      {isModalOpen && selectedStock && (
        <div className="psl1-overlay">
          <div className="psl1-modal">
            <div className="psl1-modal-header">
              <div className="psl1-modal-title">
                <Package size={16} />
                Stock Details — {selectedStock.itemName || selectedStock.productName || 'Item'}
              </div>
              <button onClick={() => setIsModalOpen(false)}
                style={{ background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.25)', color: '#fff',
                  borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                Close
              </button>
            </div>
            <div className="psl1-modal-body">
              <div className="psl1-meta-grid">
                <div className="psl1-meta-item">
                  <label>PO Number</label>
                  <p style={{ fontFamily: 'monospace' }}>{selectedStock.poNumber || selectedStock.purchaseOrderNo || '—'}</p>
                </div>
                <div className="psl1-meta-item">
                  <label>Item Code / SKU</label>
                  <p style={{ fontFamily: 'monospace' }}>{selectedStock.itemCode || selectedStock.sku || '—'}</p>
                </div>
                <div className="psl1-meta-item">
                  <label>HSN Code</label>
                  <p style={{ fontFamily: 'monospace' }}>{selectedStock.hsnCode || '—'}</p>
                </div>
                <div className="psl1-meta-item">
                  <label>Status</label>
                  <div>{renderStatus(selectedStock.status)}</div>
                </div>
                <div className="psl1-meta-item">
                  <label>Supplier</label>
                  <p><User size={12} color="var(--accent)" />{selectedStock.supplierName || selectedStock.vendorName || '—'}</p>
                </div>
                <div className="psl1-meta-item">
                  <label>Category</label>
                  <p>{selectedStock.category || selectedStock.categoryName || '—'}</p>
                </div>
                <div className="psl1-meta-item">
                  <label>Received Date</label>
                  <p><Calendar size={12} color="var(--accent)" />{fmtDate(selectedStock.receivedDate || selectedStock.purchaseDate)}</p>
                </div>
                <div className="psl1-meta-item">
                  <label>GST Rate</label>
                  <p>{selectedStock.gstRate || 0}%</p>
                </div>
              </div>

              <hr className="psl1-divider" />

              <div>
                <p style={{ margin: '0 0 10px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '.8px', color: 'var(--ink-4)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FileText size={12} color="var(--accent)" /> Batch / Lot Details
                </p>
                <div className="psl1-inner-table-wrap">
                  <table className="psl1-inner-table">
                    <thead>
                      <tr>
                        <th>Batch Code</th>
                        <th className="c">Mfg Date</th>
                        <th className="c">Expiry Date</th>
                        <th className="c">Qty</th>
                        <th className="r">Rate</th>
                        <th className="r">Batch Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedStock.batches || selectedStock.batchDetails || []).length > 0
                        ? (selectedStock.batches || selectedStock.batchDetails).map((b, i) => (
                          <tr key={i}>
                            <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{b.batchCode || '—'}</td>
                            <td className="c" style={{ fontSize: 11 }}>{fmtDate(b.mfgDate)}</td>
                            <td className="c" style={{ fontSize: 11, color: 'var(--amber)', fontWeight: 600 }}>{fmtDate(b.expiryDate)}</td>
                            <td className="c" style={{ fontWeight: 700 }}>{b.quantity || 0}</td>
                            <td className="r">₹{fmtINR(b.rate)}</td>
                            <td className="r" style={{ fontWeight: 700, color: 'var(--accent)' }}>
                              ₹{fmtINR((b.quantity || 0) * (b.rate || 0))}
                            </td>
                          </tr>
                        ))
                        : (
                          <tr>
                            <td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: 'var(--ink-4)', fontStyle: 'italic', fontSize: 12 }}>
                              No batch records found for this item.
                            </td>
                          </tr>
                        )
                      }
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="psl1-summary">
                <div className="psl1-summary-big">
                  <label>Total Stock Value</label>
                  <p>₹{fmtINR(selectedStock.totalValue || selectedStock.purchaseValue ||
                    ((selectedStock.currentStock || 0) * (selectedStock.purchaseRate || selectedStock.rate || 0)))}</p>
                </div>
                <div className="psl1-summary-stats">
                  <div className="psl1-stat-item green">
                    <label>Current Stock</label>
                    <p>{selectedStock.currentStock || selectedStock.quantity || 0} units</p>
                  </div>
                  <div className="psl1-stat-item amber">
                    <label>Reorder Level</label>
                    <p>{selectedStock.reorderLevel || selectedStock.minStock || '—'}</p>
                  </div>
                  <div className="psl1-stat-item teal">
                    <label>Unit Rate</label>
                    <p>₹{fmtINR(selectedStock.purchaseRate || selectedStock.rate || 0)}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="psl1-modal-footer">
              <button onClick={() => setIsModalOpen(false)} className="psl1-btn psl1-btn-outline">Close Preview</button>
              <button onClick={() => { setIsModalOpen(false); navigate('/purchase-v1', { state: { stock: selectedStock } }); }}
                className="psl1-btn psl1-btn-primary">
                <EditIcon sx={{ fontSize: 14, marginRight: '4px' }} /> Edit Stock Entry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE MODAL ── */}
      {isDeleteDialogOpen && (
        <div className="psl1-overlay" style={{ zIndex: 60 }}>
          <div className="psl1-del-modal">
            <div className="psl1-del-icon"><Trash2 size={28} /></div>
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to permanently delete this stock record? This action cannot be undone.</p>
            <div className="psl1-del-btns">
              <button className="psl1-del-cancel" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</button>
              <button className="psl1-del-confirm" onClick={handleConfirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseStockList;