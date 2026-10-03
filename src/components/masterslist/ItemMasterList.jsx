import React, { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Search,
  Plus,
  FileText,
  Download,
  Printer,
  ArrowLeft,
  Package,
  Hash,
  Percent,
  IndianRupee,
  Boxes,
  Briefcase,
} from "lucide-react";
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ModeEditIcon from '@mui/icons-material/ModeEdit';

// Custom Context Hooks
import { useToast } from "../contextapi/ToastContext";
import { useExport } from "../contextapi/ExportContext";
import { useActions } from "../contextapi/ActionsContext";
import ReusableDialogueBox from "../contextapi/ReusableDialogueBox";

const ItemMasterList = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { exportExcel, exportPDF, printTable } = useExport();
  const { onView } = useActions();

  // States
  const [query, setQuery] = useState("");
  const [perPage] = useState(10);
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);

  // --- VIEW & DIALOGUE STATES ---
  const [viewMode, setViewMode] = useState("list"); // "list" or "details"
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  // FETCH DATA
  const fetchItems = () => {
    axios.get("/api/item-master")
      .then((res) => {
        // Response is an array, not paginated
        setItems(res.data);
      })
      .catch((err) => {
        console.error("GET ERROR:", err);
        toast.error("Failed to load Item data");
        setItems([]);
      });
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // DELETE HANDLER
  const openDeleteModal = (itemId) => {
    setItemToDelete(itemId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      const response = await axios.delete(`/api/item-master/${itemToDelete}`);
      setItems(prev => prev.filter(item => item.itemId !== itemToDelete));
      console.log(response.data);
      toast.success("Item deleted successfully!");
    } catch (err) {
      console.error("Delete Error:", err);
      const msg = err.response?.data?.message || "Delete failed. Item might be in use or protected.";
      toast.error(msg);
    } finally {
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleView = (itemData) => {
    setSelectedItem(itemData);
    setViewMode("details");
    if (onView) onView("Item", itemData);
  };

  /* ---------------- FILTER + PAGINATION ---------------- */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      (item.itemName || "").toLowerCase().includes(q) ||
      (item.itemCode || "").toLowerCase().includes(q) ||
      (item.hsnCode || "").toLowerCase().includes(q) ||
      (item.unit || "").toLowerCase().includes(q)
    );
  }, [items, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);

  /* ---------------- EXPORT BRIDGE ---------------- */
  const exportColumns = [
    { key: "itemCode", header: "Item Code" },
    { key: "itemName", header: "Item Name" },
    { key: "hsnCode", header: "HSN Code" },
    { key: "unit", header: "Unit" },
    { key: "gstRate", header: "GST Rate (%)" },
    { key: "purchasePrice", header: "Purchase Price" },
    { key: "salePrice", header: "Sale Price" },
    { key: "mrp", header: "MRP" },
    { key: "openingStock", header: "Opening Stock" },
  ];

  // --- RENDER VIEW: DETAILS PAGE ---
  if (viewMode === "details" && selectedItem) {
    return (
      <div className="font-poppins bg-slate-50 min-h-screen p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header Controls */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setViewMode("list")}
              className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition font-semibold"
            >
              <ArrowLeft className="w-5 h-5" /> Back to List
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/item-master?id=${selectedItem.itemId}`)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-indigo-700 transition"
              >
                <ModeEditIcon sx={{ fontSize: 18 }} /> Edit Item
              </button>
            </div>
          </div>

          {/* Main Content Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            {/* Banner */}
            <div className="bg-blue-900 p-8 text-white flex items-center gap-6">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-3xl font-black border border-white/30 uppercase">
                {selectedItem.itemName?.charAt(0) || "I"}
              </div>
              <div>
                <h1 className="text-3xl font-bold uppercase">{selectedItem.itemName}</h1>
                <p className="text-blue-200 flex items-center gap-2 mt-1">
                  <Briefcase className="w-4 h-4" /> Item Profile ID: {selectedItem.itemId}
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">

              {/* Main Sections */}
              <div className="md:col-span-2 space-y-8">
                <section>
                  <h3 className="text-indigo-900 font-bold text-lg mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-indigo-600 rounded-full"></div> Item Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Item Code</p>
                      <p className="text-base font-mono font-bold text-slate-700">{selectedItem.itemCode || "Not Available"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">HSN Code</p>
                      <p className="text-base font-mono font-bold text-slate-700">{selectedItem.hsnCode || "Not Available"}</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-indigo-900 font-bold text-lg mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-indigo-600 rounded-full"></div> Unit & Tax
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-100">
                      <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg"><Package className="w-5 h-5" /></div>
                      <div>
                        <p className="text-xs text-slate-400">Unit</p>
                        <p className="font-bold text-slate-700">{selectedItem.unit || "N/A"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-100">
                      <div className="p-3 bg-amber-50 text-amber-600 rounded-lg"><Percent className="w-5 h-5" /></div>
                      <div>
                        <p className="text-xs text-slate-400">GST Rate</p>
                        <p className="font-bold text-slate-700">{selectedItem.gstRate ?? "N/A"}%</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-indigo-900 font-bold text-lg mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-indigo-600 rounded-full"></div> Stock Information
                  </h3>
                  <div className="flex gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <Boxes className="w-6 h-6 text-rose-500 mt-1" />
                    <div>
                      <p className="text-xs text-slate-400">Opening Stock</p>
                      <p className="text-slate-700 leading-relaxed font-bold">
                        {selectedItem.openingStock ?? "N/A"} {selectedItem.unit || ""}
                      </p>
                    </div>
                  </div>
                </section>
              </div>

              {/* Sidebar: Pricing */}
              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl text-white shadow-lg shadow-indigo-200">
                  <IndianRupee className="w-10 h-10 text-indigo-300 mb-6" />
                  <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-1">Purchase Price</h4>
                  <p className="text-xl font-bold mb-6">₹{selectedItem.purchasePrice ?? "N/A"}</p>

                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] text-indigo-300 uppercase">Sale Price</p>
                      <p className="font-mono text-sm tracking-widest bg-white/10 p-2 rounded-lg">₹{selectedItem.salePrice ?? "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-indigo-300 uppercase">MRP</p>
                      <p className="font-mono text-sm tracking-widest bg-white/10 p-2 rounded-lg">₹{selectedItem.mrp ?? "N/A"}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 border border-slate-100 rounded-2xl bg-white">
                  <h4 className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-tighter">System Info</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Item ID</span>
                      <span className="text-slate-600 font-medium">{selectedItem.itemId}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Data Status</span>
                      <span className="text-emerald-600 font-bold uppercase">Active</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER VIEW: MAIN LIST ---
  return (
    <div className="font-poppins bg-slate-50 min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">

        {/* DELETE DIALOGUE */}
        <ReusableDialogueBox
          isOpen={isDeleteDialogOpen}
          title="Delete Item"
          message="Are you sure you want to delete this item? This action cannot be undone."
          onConfirm={handleConfirmDelete}
          onCancel={() => setIsDeleteDialogOpen(false)}
        />

        {/* --- MAIN PAGE HEADER --- */}
        <div className="p-6 md:p-8 border-b border-slate-900">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Item Master List</h1>
              {/* Divider line for title */}
              <div className="h-1 w-12 bg-blue-900 mt-2 rounded-full"></div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Search by name, code, HSN..."
                    className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-l-lg text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                  />
                </div>
                <button
                  className="bg-blue-900 text-white px-4 py-2 rounded-r-lg text-sm font-semibold transition-colors border border-blue-600 shadow-sm flex items-center gap-2"
                  onClick={() => {/* Your search logic here */ }}
                >
                  Search
                </button>
              </div>
              <Link
                to="/item-master"
                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-900 text-white rounded-lg text-xs font-semibold hover:bg-blue-800 transition-all shadow-md active:scale-95"
              >
                <Plus className="w-4 h-4" /> Add Item
              </Link>
            </div>
          </div>

          {/* Export Bar */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-end gap-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-auto">Export Options</span>

            <button
              onClick={() => exportExcel({ fileName: "Items", sheetName: "Items", columns: exportColumns, rows: filtered })}
              className="flex items-center gap-2 px-3 py-1.5 bg-white text-emerald-700 border border-emerald-200 rounded-md text-xs font-bold hover:bg-emerald-50 hover:border-emerald-400 transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5" /> Excel
            </button>

            <button
              onClick={() => exportPDF({ fileName: "Items", title: "Item List", columns: exportColumns, rows: filtered })}
              className="flex items-center gap-2 px-3 py-1.5 bg-white text-rose-700 border border-rose-200 rounded-md text-xs font-bold hover:bg-rose-50 hover:border-rose-400 transition shadow-sm"
            >
              <FileText className="w-3.5 h-3.5" /> PDF
            </button>

            <button
              onClick={() => printTable({ title: "Item List", columns: exportColumns, rows: filtered })}
              className="flex items-center gap-2 px-3 py-1.5 bg-white text-slate-700 border border-slate-200 rounded-md text-xs font-bold hover:bg-slate-50 hover:border-slate-400 transition shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
          </div>
        </div>

        {/* --- DATA TABLE --- */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-gray-200 border-b border-slate-300 text-black uppercase text-[11px] font-semibold tracking-wider">
                <th className="px-6 py-4 text-center w-20">Sr No</th>
                <th className="px-6 py-4 text-center w-36">Actions</th>
                <th className="px-6 py-4">Item Details</th>
                <th className="px-6 py-4">Taxation</th>
                <th className="px-6 py-4">Unit & Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {pageItems.length > 0 ? (
                pageItems.map((item, index) => (
                  <tr key={item.itemId} className="group hover:bg-teal-300/50 transition-colors border-b border-slate-300">
                    <td className="px-6 py-4 text-center text-slate-900 font-medium">
                      {(page - 1) * perPage + index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleView(item)} className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-indigo-600 transition" title="View Details">
                          <VisibilityIcon sx={{ fontSize: 18 }} />
                        </button>
                        <button onClick={() => navigate(`/item-master?id=${item.itemId}`)} className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-sky-600 transition" title="Edit">
                          <ModeEditIcon sx={{ fontSize: 18 }} />
                        </button>
                        <button onClick={() => openDeleteModal(item.itemId)} className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-rose-500 transition" title="Delete">
                          <DeleteIcon sx={{ fontSize: 18 }} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800 font-poppins uppercase">{item.itemName}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">Code: {item.itemCode}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-indigo-900 font-semibold font-poppins text-xs">HSN: {item.hsnCode || "N/A"}</span>
                        <span className="text-slate-900 font-poppins text-[10px]">GST: {item.gstRate}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-700 font-medium">₹{item.purchasePrice}</div>
                      <div className="text-xs text-slate-400 font-poppins">Unit: {item.unit}</div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-poppins">No items found matching your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* --- PAGINATION --- */}
        <div className="px-6 py-4 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            Showing <span className="font-bold text-slate-700">{filtered.length > 0 ? (page - 1) * perPage + 1 : 0}</span> to <span className="font-bold text-slate-700">{Math.min(page * perPage, filtered.length)}</span> of <span className="font-bold text-slate-700">{filtered.length}</span> items
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 border border-slate-200 rounded-md text-xs font-semibold bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Prev
            </button>
            <div className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-xs font-bold">
              {page} / {totalPages}
            </div>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 border border-slate-200 rounded-md text-xs font-semibold bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemMasterList;