import React, { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Search,
  Plus,
  FileText,
  Download,
  Printer,
  X,
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

  // --- DIALOGUE & VIEW STATES ---
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

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
    setIsViewModalOpen(true);
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

  const handleExport = (type) => {
    const sourceData = filtered;

    if (sourceData.length === 0) {
      toast.error("No data to export.");
      return;
    }

    const config = {
      fileName: `Item_List`,
      title: "Item Master Report",
      columns: exportColumns,
      rows: sourceData
    };

    if (type === "excel") {
      exportExcel(config);
      toast.success("Exported to Excel");
    }
    if (type === "pdf") {
      exportPDF(config);
      toast.success("Exported to PDF");
    }
    if (type === "print") {
      printTable(config);
      toast.success("Print dialog opened");
    }
  };

  return (
    <div className="font-poppins bg-white p-6 md:p-8 rounded-xl shadow-2xl border border-slate-100 min-h-full">

      <ReusableDialogueBox
        isOpen={isDeleteDialogOpen}
        title="Delete Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />

      {/* --- SIDE VIEW PANEL --- */}
      <div className={`fixed inset-0 z-[999] overflow-hidden transition-opacity duration-500 ${isViewModalOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsViewModalOpen(false)} />
        <div className={`absolute inset-y-0 right-0 max-w-lg w-full bg-white shadow-2xl transform transition-transform duration-500 ease-in-out ${isViewModalOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="h-full flex flex-col">
            <div className="p-6 border-b bg-indigo-50 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-indigo-900">Item Profile</h2>
                <p className="text-xs text-indigo-600 mt-1">Detailed information</p>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} className="p-2 hover:bg-white rounded-full transition">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              <div className="space-y-8">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Item Code</p>
                  <p className="text-sm font-mono text-slate-700">{selectedItem?.itemCode || "N/A"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl uppercase">
                    {selectedItem?.itemName?.charAt(0) || "I"}
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 uppercase">{selectedItem?.itemName}</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">HSN Code</p>
                    <p className="text-sm text-slate-700">{selectedItem?.hsnCode || "N/A"}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Unit</p>
                    <p className="text-sm font-bold text-emerald-600">{selectedItem?.unit || "N/A"}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">GST Rate</p>
                    <p className="text-sm text-slate-700">{selectedItem?.gstRate}%</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Purchase Price</p>
                    <p className="text-sm text-slate-700">₹{selectedItem?.purchasePrice || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-slate-50 flex gap-3">
              <button
                onClick={() => navigate(`/item-master?id=${selectedItem?.itemId}`)}
                className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition shadow-md"
              >
                Edit Item
              </button>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b">
        <h1 className="text-xl font-semibold text-indigo-700">Item Master List</h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 border w-full sm:w-80 shadow-inner">
            <Search className="text-slate-400 w-5 h-5" />
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              placeholder="Search Items..."
              className="bg-transparent outline-none text-sm w-full"
            />
          </div>
          <Link to="/item-master" className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition">
            <Plus className="w-4 h-4" /> Add Item
          </Link>
        </div>
      </div>

      {/* EXPORT OPTIONS */}
      <div className="flex flex-wrap items-center justify-end gap-3 mb-6 p-2 bg-slate-50 rounded-xl border border-slate-200">
        <button onClick={() => exportExcel({ fileName: "Items", sheetName: "Items", columns: exportColumns, rows: filtered })} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition">
          <Download className="w-4 h-4" /> Excel
        </button>
        <button onClick={() => exportPDF({ fileName: "Items", title: "Item List", columns: exportColumns, rows: filtered })} className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-semibold hover:bg-rose-700 transition">
          <FileText className="w-4 h-4" /> PDF
        </button>
        <button onClick={() => printTable({ title: "Item List", columns: exportColumns, rows: filtered })} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm hover:bg-slate-100 transition">
          <Printer className="w-4 h-4" /> Print
        </button>
      </div>

      {/* DATA TABLE */}
      <div className="overflow-hidden border rounded-xl shadow-lg">
        <table className="min-w-full text-sm table-auto">
          <thead className="bg-indigo-900 text-white">
            <tr>
              <th className="px-4 py-3 text-center w-16">Sr No.</th>
              <th className="px-4 py-3 text-center w-32">Actions</th>
              <th className="px-4 py-3 text-left">Item Code</th>
              <th className="px-4 py-3 text-left">Item Name</th>
              <th className="px-4 py-3 text-left">HSN Code</th>
              <th className="px-4 py-3 text-center">Unit</th>
              <th className="px-4 py-3 text-center">GST Rate</th>
              <th className="px-4 py-3 text-right">Purchase Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pageItems.length > 0 ? (
              pageItems.map((item, index) => (
                <tr key={item.itemId} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 text-center font-medium text-slate-500">
                    {(page - 1) * perPage + index + 1}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => handleView(item)} className="p-2 rounded-full hover:bg-indigo-100 text-indigo-600 transition">
                        <VisibilityIcon sx={{ fontSize: 18 }} />
                      </button>
                      <button onClick={() => navigate(`/item-master?id=${item.itemId}`)} className="p-2 rounded-full hover:bg-sky-100 text-sky-600 transition">
                        <ModeEditIcon sx={{ fontSize: 18 }} />
                      </button>
                      <button onClick={() => openDeleteModal(item.itemId)} className="p-2 rounded-full hover:bg-rose-100 text-rose-600 transition">
                        <DeleteIcon sx={{ fontSize: 18 }} />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-700">{item.itemCode}</td>
                  <td className="px-4 py-3 font-medium text-slate-700 uppercase">{item.itemName}</td>
                  <td className="px-4 py-3 text-slate-500">{item.hsnCode}</td>
                  <td className="px-4 py-3 text-center font-medium text-slate-700">{item.unit}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-1 rounded text-xs font-bold bg-blue-100 text-blue-700">
                      {item.gstRate}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-700">₹{item.purchasePrice}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="px-4 py-10 text-center text-slate-400 italic">No Items found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 p-4 border-t">
        <div className="text-sm text-slate-600">
          Showing <b>{filtered.length > 0 ? (page - 1) * perPage + 1 : 0}</b> to <b>{Math.min(page * perPage, filtered.length)}</b> of <b>{filtered.length}</b>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 border rounded-lg hover:bg-slate-50 disabled:opacity-50 transition">Prev</button>
          <div className="px-4 py-2 border border-indigo-500 bg-indigo-50 text-indigo-700 rounded-lg font-bold">{page} / {totalPages}</div>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 border rounded-lg hover:bg-slate-50 disabled:opacity-50 transition">Next</button>
        </div>
      </div>
    </div>
  );
};

export default ItemMasterList;
