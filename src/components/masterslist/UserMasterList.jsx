import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  Edit,
  Trash2,
  Search,
  FileSpreadsheet,
  FileText,
  Printer,
  Plus,
} from "lucide-react";

import { useToast } from "../contextapi/ToastContext";
import { useExport } from "../contextapi/ExportContext";
import { useActions } from "../contextapi/ActionsContext";

export default function UnitCompanyList() {
  const navigate = useNavigate();

  const { error } = useToast();
  const { exportExcel, exportPDF, printTable } = useExport();
  const { onView, onEdit, onDelete } = useActions();

  const [query, setQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [onlySelectedExport, setOnlySelectedExport] = useState(false);
  const [perPage] = useState(10);
  const [page, setPage] = useState(1);

  /* ---------------- SAMPLE DATA ---------------- */
  const companies = useMemo(
    () => [
      {
        id: 1,
        unitName: "ABC Enterprises Pvt. Ltd.",
        gstin: "27ABCDE1234F1Z5",
        pan: "ABCDE1234F",
        city: "Mumbai",
        phone: "9876543210",
        email: "abc@enterprises.com",
      },
      {
        id: 2,
        unitName: "XYZ Solutions & Services",
        gstin: "24XYZAB9876K1Z2",
        pan: "XYZAB9876K",
        city: "Pune",
        phone: "9988776655",
        email: "contact@xyzsolutions.in",
      },
    ],
    []
  );

  /* ---------------- FILTER (FIXED) ---------------- */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return companies;

    return companies.filter(
      (c) =>
        c.unitName.toLowerCase().includes(q) ||
        c.gstin.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q)
    );
  }, [companies, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);

  /* ---------------- SELECT ---------------- */
  const toggleRow = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    const ids = pageItems.map((c) => c.id);
    const allSelected = ids.every((id) => selectedRows.includes(id));
    setSelectedRows(allSelected ? [] : ids);
  };

  /* ---------------- EXPORT ---------------- */
  const exportColumns = [
    { key: "unitName", header: "Unit Name" },
    { key: "gstin", header: "GSTIN" },
    { key: "pan", header: "PAN" },
    { key: "phone", header: "Phone" },
    { key: "email", header: "Email" },
    { key: "city", header: "City" },
  ];

  const getRowsForExport = (selectedOnly) => {
    if (selectedOnly && selectedRows.length === 0) {
      error("No company selected");
      return [];
    }
    return selectedOnly
      ? companies.filter((c) => selectedRows.includes(c.id))
      : companies;
  };

  /* ---------------- ACTIONS ---------------- */
  const handleView = (company) => onView("Company", company);
  const handleEdit = (company) =>
    onEdit("Company", company.id, () =>
      navigate(`/unit-company?id=${company.id}`)
    );
  const handleDelete = (id) => onDelete("Company", id);

  /* ---------------- RENDER ---------------- */
  return (
    <div className="font-poppins bg-white p-6 rounded-xl shadow border">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-indigo-700">
          Unit Company List
        </h1>

        <div className="flex gap-3">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search..."
              className="bg-transparent outline-none text-sm"
            />
          </div>

          <Link
            to="/user-master"
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-900 text-white rounded-sm text-xs font-semibold transition"
          >
            <Plus className="w-3.5 h-3.5" /> Add User
          </Link>
        </div>
      </div>

      {/* EXPORT RIGHT SIDE (UNCHANGED) */}
      <div className="flex justify-between items-center mb-4 bg-slate-50 p-3 rounded-lg border">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={onlySelectedExport}
            onChange={(e) => setOnlySelectedExport(e.target.checked)}
          />
          Export selected only
        </label>

        <div className="flex gap-3">
          <button
            onClick={() =>
              exportExcel({
                fileName: "UnitCompanyList",
                sheetName: "Companies",
                columns: exportColumns,
                rows: getRowsForExport(onlySelectedExport),
              })
            }
            className="px-3 py-2 flex items-center gap-2 bg-green-600 text-white rounded-lg text-sm"
          >
            <FileSpreadsheet className="w-4 h-4" /> Excel
          </button>

          <button
            onClick={() =>
              exportPDF({
                fileName: "UnitCompanyList",
                title: "Unit Company List",
                columns: exportColumns,
                rows: getRowsForExport(onlySelectedExport),
              })
            }
            className="px-3 py-2 flex items-center gap-2 bg-red-600 text-white rounded-lg text-sm"
          >
            <FileText className="w-4 h-4" /> PDF
          </button>

          <button
            onClick={() =>
              printTable({
                title: "Unit Company List",
                columns: exportColumns,
                rows: getRowsForExport(onlySelectedExport),
              })
            }
            className="px-3 py-2 flex items-center gap-2 bg-slate-700 text-white rounded-lg text-sm"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </div>

      {/* TABLE (ACTION BUTTON SIZE SAME) */}
      <table className="w-full text-sm border">
        <thead className="bg-blue-900 text-white">
          <tr>
            <th className="p-3">
              <input
                type="checkbox"
                checked={
                  pageItems.length &&
                  pageItems.every((c) => selectedRows.includes(c.id))
                }
                onChange={toggleAll}
              />
            </th>
            <th className="p-3 text-left">Company</th>
            <th className="p-3">GST / PAN</th>
            <th className="p-3">Contact</th>
            <th className="p-3">City</th>
            <th className="p-3">Action</th>
          </tr>
        </thead>

        <tbody>
          {pageItems.map((c) => {
            const selected = selectedRows.includes(c.id);
            return (
              <tr
                key={c.id}
                className={`border-b ${
                  selected ? "bg-indigo-100/50" : "hover:bg-slate-50"
                }`}
              >
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleRow(c.id)}
                  />
                </td>

                <td className="p-3 font-medium">
                  {c.unitName}
                </td>

                <td className="p-3">
                  {c.gstin}
                  <div className="text-xs text-slate-400">{c.pan}</div>
                </td>

                <td className="p-3">
                  {c.phone}
                  <div className="text-xs text-slate-400">{c.email}</div>
                </td>

                <td className="p-3">{c.city}</td>

                <td className="p-3">
                  <div className="flex gap-1 justify-center">
                    <button
                      onClick={() => handleView(c)}
                      className="p-2 rounded-full hover:bg-slate-200"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleEdit(c)}
                      className="p-2 rounded-full hover:bg-slate-200 text-sky-600"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(c.id)}
                      className="p-2 rounded-full hover:bg-slate-200 text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
