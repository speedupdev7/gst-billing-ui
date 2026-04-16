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

export default function BankMasterList() {
  const navigate = useNavigate();

  const { error } = useToast();
  const { exportExcel, exportPDF, printTable } = useExport();
  const { onView, onEdit, onDelete } = useActions();

  const [query, setQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState([]); // AccountNumber
  const [onlySelectedExport, setOnlySelectedExport] = useState(false);
  const [perPage] = useState(10);
  const [page, setPage] = useState(1);

  /* ---------------- SAMPLE DATA ---------------- */
  const bankList = useMemo(
    () => [
      {
        BankName: "HDFC Bank",
        BranchName: "Andheri East",
        AccountHolderName: "ABC Traders",
        AccountNumber: "1234567890",
        AccountType: "Current",
        IFSCCode: "HDFC0000123",
        City: "Mumbai",
        State: "MH",
        Pincode: "400069",
      },
      {
        BankName: "ICICI Bank",
        BranchName: "Shivaji Nagar",
        AccountHolderName: "XYZ Enterprises",
        AccountNumber: "9876543210",
        AccountType: "Savings",
        IFSCCode: "ICIC0000456",
        City: "Pune",
        State: "MH",
        Pincode: "411005",
      },
    ],
    []
  );

  /* ---------------- FILTER ---------------- */
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return bankList;
    return bankList.filter(
      (b) =>
        b.BankName.toLowerCase().includes(q) ||
        b.BranchName.toLowerCase().includes(q) ||
        b.AccountHolderName.toLowerCase().includes(q) ||
        b.AccountNumber.includes(q) ||
        b.IFSCCode.toLowerCase().includes(q) ||
        b.City.toLowerCase().includes(q)
    );
  }, [bankList, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);

  /* ---------------- SELECTION ---------------- */
  const toggleRow = (accNo) => {
    setSelectedRows((p) =>
      p.includes(accNo) ? p.filter((x) => x !== accNo) : [...p, accNo]
    );
  };

  const toggleAll = () => {
    const visible = pageItems.map((b) => b.AccountNumber);
    const allSelected = visible.every((v) => selectedRows.includes(v));
    setSelectedRows(allSelected ? [] : visible);
  };

  /* ---------------- EXPORT ---------------- */
  const getRowsForExport = (selectedOnly) => {
    if (selectedOnly && selectedRows.length === 0) {
      error("No bank selected");
      return [];
    }
    return selectedOnly
      ? bankList.filter((b) => selectedRows.includes(b.AccountNumber))
      : bankList;
  };

  const exportColumns = [
    { key: "BankName", header: "Bank Name" },
    { key: "BranchName", header: "Branch Name" },
    { key: "AccountHolderName", header: "Account Holder" },
    { key: "AccountNumber", header: "Account Number" },
    { key: "AccountType", header: "Account Type" },
    { key: "IFSCCode", header: "IFSC Code" },
    { key: "City", header: "City" },
    { key: "State", header: "State" },
    { key: "Pincode", header: "Pincode" },
  ];

  /* ---------------- RENDER ---------------- */
  return (
    <div className="bg-white p-6 rounded-xl shadow-2xl border">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-5 border-b pb-4">
        <h1 className="text-3xl font-bold text-indigo-700">
          Bank Master List
        </h1>

        <div className="flex gap-3">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 border rounded-lg w-72">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search bank..."
              className="bg-transparent outline-none text-sm w-full"
            />
          </div>

          <Link
            to="/bank-master"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-900 text-white rounded-sm text-xs font-semibold transition"
          >
            <Plus className="w-3.5 h-3.5" /> Add Bank
          </Link>
        </div>
      </div>

      {/* EXPORT */}
      <div className="flex justify-between items-center mb-4 bg-slate-50 p-3 rounded-lg border">
       

        <div className="flex gap-2">
          <button
            onClick={() =>
              exportExcel({
                fileName: "BankList",
                sheetName: "Banks",
                columns: exportColumns,
                rows: getRowsForExport(onlySelectedExport),
              })
            }
            className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" /> Excel
          </button>

          <button
            onClick={() =>
              exportPDF({
                fileName: "BankList",
                title: "Bank List",
                columns: exportColumns,
                rows: getRowsForExport(onlySelectedExport),
              })
            }
            className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm flex items-center gap-2"
          >
            <FileText className="w-4 h-4" /> PDF
          </button>

          <button
            onClick={() =>
              printTable({
                title: "Bank List",
                columns: exportColumns,
                rows: getRowsForExport(onlySelectedExport),
              })
            }
            className="px-3 py-2 bg-slate-700 text-white rounded-lg text-sm flex items-center gap-2"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full text-sm table-fixed">
          <thead className="bg-blue-900 text-white">
            <tr>
              <th className="w-10 px-3 py-3 text-center">
                <input type="checkbox" onChange={toggleAll} />
              </th>
              <th className="px-3 py-3 text-left">Bank Name</th>
              <th className="px-3 py-3 text-left">Branch</th>
              <th className="px-3 py-3 text-left">Account Holder</th>
              <th className="px-3 py-3 text-left">Account No</th>
              <th className="px-3 py-3 text-left">Type</th>
              <th className="px-3 py-3 text-left">IFSC</th>
              <th className="px-3 py-3 text-left">City</th>
              <th className="px-3 py-3 text-left">State</th>
              <th className="px-3 py-3 text-left">Pincode</th>
              <th className="w-28 px-3 py-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {pageItems.map((b) => (
              <tr
                key={b.AccountNumber}
                className="border-b hover:bg-slate-50"
              >
                <td className="px-3 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(b.AccountNumber)}
                    onChange={() => toggleRow(b.AccountNumber)}
                  />
                </td>

                <td className="px-3 py-2 font-medium">{b.BankName}</td>
                <td className="px-3 py-2">{b.BranchName}</td>
                <td className="px-3 py-2">{b.AccountHolderName}</td>
                <td className="px-3 py-2 font-mono text-xs">{b.AccountNumber}</td>
                <td className="px-3 py-2">{b.AccountType}</td>
                <td className="px-3 py-2 font-mono text-xs">{b.IFSCCode}</td>
                <td className="px-3 py-2">{b.City}</td>
                <td className="px-3 py-2">{b.State}</td>
                <td className="px-3 py-2">{b.Pincode}</td>

                <td className="px-3 py-2">
                  <div className="flex justify-center gap-2">
                    <Eye className="w-4 h-4 cursor-pointer" />
                    <Edit className="w-4 h-4 text-sky-600 cursor-pointer" />
                    <Trash2 className="w-4 h-4 text-rose-600 cursor-pointer" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
