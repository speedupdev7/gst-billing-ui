// src/components/masterslist/CustomerMasterList.jsx  (ya jahan tum rakhe ho)
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Eye,
  Edit,
  Trash2,
  Search,
  FileSpreadsheet,
  FileText,
  Printer,
  Plus,
  X,
} from "lucide-react";
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ModeEditIcon from '@mui/icons-material/ModeEdit';


import { useToast } from "../contextapi/ToastContext";
import { useExport } from "../contextapi/ExportContext";
import { useActions } from "../contextapi/ActionsContext";
import ReusableDialogueBox from "../contextapi/ReusableDialogueBox";

export default function CustomerList() {
  const navigate = useNavigate();

  const { error } = useToast();
  const { exportExcel, exportPDF, printTable } = useExport();
  const { onView, onEdit, onDelete } = useActions();

  const [query, setQuery] = useState("");
  const [perPage] = useState(10);
  const [page, setPage] = useState(1);
  const [customers, setCustomers] = useState([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    axios
      .get("/api/customer-master")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        const normalized = data.map((c) => ({
          id: c.customerId,
          CustomerName: c.customerName || "",
          AddressLine1: c.billingAddress || "",
          City: c.district || "",
          PinCode: c.pinCode || "",
          Phone: c.mobileNo || "",
          Email: c.email || "",
          isActive: c.isActive ?? true,
          isDeleted: c.isDeleted ?? false,
        }));
        setCustomers(normalized);
      })
      .catch((err) => {
        console.error("Customer fetch error:", err);
        error("Failed to load customer records.");
      });
  }, [error]);

  /* ---------------- FILTER + PAGINATION ---------------- */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        String(c.id).includes(q) ||
        (c.CustomerName || "").toLowerCase().includes(q) ||
        (c.AddressLine1 || "").toLowerCase().includes(q) ||
        (c.City || "").toLowerCase().includes(q) ||
        (c.PinCode || "").toLowerCase().includes(q) ||
        (c.Phone || "").toLowerCase().includes(q) ||
        (c.Email || "").toLowerCase().includes(q)
    );
  }, [customers, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);

  /* ---------------- SELECT ROWS ---------------- */

  /* ---------------- EXPORT HELPERS (context based) ---------------- */
  const getRowsForExport = () => customers;

  const exportColumns = [
    { key: "id", header: "ID" },
    { key: "CustomerName", header: "Customer Name" },
    { key: "AddressLine1", header: "Address Line 1" },
    { key: "City", header: "City" },
    { key: "PinCode", header: "Pin Code" },
    { key: "Phone", header: "Phone" },
    { key: "Email", header: "Email" },
    { key: "isActive", header: "Is Active" },
    { key: "isDeleted", header: "Is Deleted" },
  ];

  const handleExportExcel = () => {
    const rows = getRowsForExport();
    if (!rows.length) return;

    exportExcel({
      fileName: "CustomerList",
      sheetName: "Customers",
      columns: exportColumns,
      rows,
    });
  };

  const handleExportPDF = () => {
    const rows = getRowsForExport();
    if (!rows.length) return;

    exportPDF({
      fileName: "CustomerList",
      title: "Customer List",
      columns: exportColumns,
      rows,
    });
  };

  const handlePrint = () => {
    const rows = getRowsForExport();
    if (!rows.length) return;

    printTable({
      title: "Customer List",
      columns: exportColumns,
      rows,
    });
  };

  /* ---------------- ROW ACTIONS (context) ---------------- */
  const openDeleteModal = (customerId) => {
    setCustomerToDelete(customerId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!customerToDelete) return;
    try {
      await axios.delete(`/api/customer-master/${customerToDelete}`);
      setCustomers((prev) => prev.filter((cust) => cust.id !== customerToDelete));
      setIsDeleteDialogOpen(false);
      setCustomerToDelete(null);
      error("Customer deleted successfully.");
    } catch (err) {
      console.error("Customer delete failed:", err);
      error(err.response?.data?.message || "Failed to delete customer.");
      setIsDeleteDialogOpen(false);
      setCustomerToDelete(null);
    }
  };

  const handleView = (customer) => {
    setSelectedCustomer(customer);
    setIsViewModalOpen(true);
    if (onView) onView("Customer", customer);
  };

  const handleEdit = (customer) => {
    onEdit("Customer", customer.id, () =>
      navigate(`/customer-master?id=${customer.id}`)
    );
  };

  const handleDelete = (id) => {
    openDeleteModal(id);
  };

  /* ---------------- RENDER ---------------- */
  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl border border-slate-100 min-h-full">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b">
        <h1 className="text-3xl font-bold text-indigo-700">
          Customer Master List
        </h1>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 border w-full sm:w-80 shadow-inner">
            <Search className="text-slate-400 w-5 h-5" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search id, name, address, city, pin, phone or email"
              className="bg-transparent outline-none text-sm w-full placeholder:text-slate-400"
            />
          </div>

          <Link
            to="/customer-master"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-900 text-white rounded-sm text-xs font-semibold transition"
            title="Add Customer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Customer
          </Link>
        </div>
      </div>

      {/* Export & selection */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5 p-2 rounded-lg bg-slate-50 border border-slate-200">
        <div className="flex items-center gap-4 text-sm text-slate-600">  
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportExcel}
            className="px-3 py-2 flex items-center gap-2 bg-green-600 text-white rounded-lg text-sm font-medium shadow-md hover:bg-green-700 transition transform hover:scale-[1.02]"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hidden sm:inline">Excel</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="px-3 py-2 flex items-center gap-2 bg-red-600 text-white rounded-lg text-sm font-medium shadow-md hover:bg-red-700 transition transform hover:scale-[1.02]"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">PDF</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-2 flex items-center gap-2 bg-slate-700 text-white rounded-lg text-sm font-medium shadow-md hover:bg-slate-800 transition transform hover:scale-[1.02]"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Print</span>
          </button>
        </div>
      </div>

      <ReusableDialogueBox
        isOpen={isDeleteDialogOpen}
        title="Delete Customer"
        message="Are you sure you want to delete this customer? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsDeleteDialogOpen(false);
          setCustomerToDelete(null);
        }}
      />

      <div className={`fixed inset-0 z-[999] overflow-hidden transition-opacity duration-500 ${isViewModalOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsViewModalOpen(false)} />
        <div className={`absolute inset-y-0 right-0 max-w-lg w-full bg-white shadow-2xl transform transition-transform duration-500 ease-in-out ${isViewModalOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="h-full flex flex-col">
            <div className="p-6 border-b bg-indigo-50 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-indigo-900">Customer Profile</h2>
                <p className="text-xs text-indigo-600 mt-1">Detailed information</p>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} className="p-2 hover:bg-white rounded-full transition">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              <div className="space-y-8">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Customer ID</p>
                  <p className="text-sm font-mono text-slate-700">{selectedCustomer?.id || "N/A"}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl uppercase">
                    {selectedCustomer?.CustomerName?.charAt(0) || "C"}
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 uppercase">{selectedCustomer?.CustomerName || "Unnamed Customer"}</h3>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Address</p>
                    <p className="text-sm text-slate-700">{selectedCustomer?.AddressLine1 || "-"}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">City</p>
                    <p className="text-sm text-slate-700">{selectedCustomer?.City || "-"}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Pin Code</p>
                    <p className="text-sm text-slate-700">{selectedCustomer?.PinCode || "-"}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Active Status</p>
                    <p className={`text-sm font-semibold ${selectedCustomer?.isActive ? "text-emerald-600" : "text-slate-500"}`}>
                      {selectedCustomer?.isActive ? "Active" : "Inactive"}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Phone</p>
                    <p className="text-sm text-slate-700">{selectedCustomer?.Phone || "-"}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Email</p>
                    <p className="text-sm text-slate-700">{selectedCustomer?.Email || "-"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-slate-50 flex gap-3">
              <button
                onClick={() => navigate(`/customer-master?id=${selectedCustomer?.id}`)}
                className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition shadow-md"
              >
                Edit Customer
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

    {/* Table / cards */}
      <div className="overflow-x-auto border rounded-xl shadow-lg">
        {/* Desktop table */}
        <table className="min-w-full text-sm table-auto hidden md:table">
          <thead className="bg-blue-900 sticky top-0 border-b border-indigo-200">
            <tr className="text-white text-left">
<th className="px-4 py-3">ID</th>
              <th className="px-4 py-3 text-center w-28 border-x border-gray-700">Actions</th>
              
              <th className="px-4 py-3">Customer Name</th>
              <th className="px-4 py-3">Address</th>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3">Pin</th>
              <th className="px-4 py-3">Phone / Email</th>
              <th className="px-4 py-3 text-center">Active</th>
              <th className="px-4 py-3 text-center">Deleted</th>
            </tr>
          </thead>

          <tbody>
            {pageItems.length === 0 ? (
              <tr>
                <td
                  colSpan="9"
                  className="text-center py-8 text-slate-500 italic"
                >
                  No customer records found.
                </td>
              </tr>
            ) : (
              pageItems.map((c) => {
                return (
                  <tr
                    key={c.id}
                    className="border-b border-slate-100 transition hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 font-mono text-slate-700">
                      {c.id}
                    </td>

                    {/* MOVED ACTIONS CELL HERE */}
                    <td className="px-4 py-3 text-center border-r border-slate-50">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => handleView(c)} className="p-2 rounded-full hover:bg-indigo-100 text-indigo-600 transition" title="View">
                          <VisibilityIcon sx={{ fontSize: 18 }} />
                        </button>
                        <button onClick={() => handleEdit(c)} className="p-2 rounded-full hover:bg-sky-100 text-sky-600 transition" title="Edit">
                          <ModeEditIcon sx={{ fontSize: 18 }} />
                        </button>
                        <button onClick={() => handleDelete(c.id)} className="p-2 rounded-full hover:bg-rose-100 text-rose-600 transition" title="Delete">
                          <DeleteIcon sx={{ fontSize: 18 }} />
                        </button>
                      </div>
                    </td>

                    <td className="px-4 py-3 font-medium text-slate-700">
                      {c.CustomerName}
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-xs truncate">
                      {c.AddressLine1}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{c.City}</td>
                    <td className="px-4 py-3 text-slate-600">{c.PinCode}</td>
                    <td className="px-4 py-3 text-slate-600">
                      <div className="font-medium">{c.Phone}</div>
                      <div className="text-xs text-slate-400">{c.Email}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {c.isActive ? (
                        <span className="text-emerald-600 font-semibold text-xs bg-emerald-50 px-2 py-1 rounded">Yes</span>
                      ) : (
                        <span className="text-slate-400 text-xs">No</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {c.isDeleted ? (
                        <span className="text-rose-600 font-semibold text-xs bg-rose-50 px-2 py-1 rounded">Yes</span>
                      ) : (
                        <span className="text-slate-400 text-xs">No</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Mobile card view (Actions kept at bottom for better thumb reach) */}
        <div className="md:hidden p-4 space-y-4">
          {pageItems.map((c) => (
            <div
              key={c.id}
              className="border rounded-xl p-4 shadow-md transition bg-white border-slate-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-500">#{c.id}</span>
                    <div className="font-semibold text-indigo-700 truncate">{c.CustomerName}</div>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">{c.City} - {c.PinCode}</div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4 pt-3 border-t">
                <button onClick={() => handleView(c)} className="p-2 bg-slate-50 rounded-full text-indigo-600"><Eye size={18} /></button>
                <button onClick={() => handleEdit(c)} className="p-2 bg-slate-50 rounded-full text-sky-600"><Edit size={18} /></button>
                <button onClick={() => handleDelete(c.id)} className="p-2 bg-slate-50 rounded-full text-rose-600"><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Footer / Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 p-4 border-t">
        <div className="text-sm text-slate-600">
          Showing{" "}
          {filtered.length === 0
            ? 0
            : Math.min((page - 1) * perPage + 1, filtered.length)}{" "}
          - {Math.min(page * perPage, filtered.length)} of {filtered.length}{" "}
          total
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 transition disabled:opacity-50"
            disabled={page === 1}
          >
            Prev
          </button>

          <div className="px-4 py-2 border border-indigo-500 bg-indigo-50 text-indigo-700 rounded-lg font-semibold">
            {page} / {totalPages}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 transition disabled:opacity-50"
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
