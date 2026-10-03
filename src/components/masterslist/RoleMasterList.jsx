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
  Briefcase,
  ShieldCheck,
  AlignLeft,
} from "lucide-react";
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ModeEditIcon from '@mui/icons-material/ModeEdit';

// Custom Context Hooks
import { useToast } from "../contextapi/ToastContext";
import { useExport } from "../contextapi/ExportContext";
import { useActions } from "../contextapi/ActionsContext";
import ReusableDialogueBox from "../contextapi/ReusableDialogueBox";

const RoleMasterList = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { exportExcel, exportPDF, printTable } = useExport();
  const { onView } = useActions();

  // States
  const [query, setQuery] = useState("");
  const [perPage] = useState(10);
  const [page, setPage] = useState(1);
  const [role, setRoles] = useState([]);

  // --- VIEW & DIALOGUE STATES ---
  const [viewMode, setViewMode] = useState("list"); // "list" or "details"
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);

  // FETCH DATA
  const fetchRoles = () => {
    axios.get("/api/v1/roles")
      .then((res) => {
        // Extract content from paginated response, preserving backend order
        const actualData = res.data.content || (Array.isArray(res.data) ? res.data : res.data.roles || []);
        setRoles(actualData);
      })
      .catch((err) => {
        console.error("GET ERROR:", err);
        toast.error("Failed to load Role data");
        setRoles([]);
      });
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // DELETE HANDLER (Works regardless of isSystemRole status)
  const openDeleteModal = (roleId) => {
    setRoleToDelete(roleId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!roleToDelete) return;
    try {
      const response = await axios.delete(`/api/v1/roles/${roleToDelete}`);

      setRoles(prev => prev.filter(item => item.roleId !== roleToDelete));
      console.log(response.data);

      toast.success("Role deleted successfully!");
    } catch (err) {
      console.error("Delete Error:", err);
      // If you get a 400 error here, it is because the BACKEND is protecting the system role
      const msg = err.response?.data?.message || "Delete failed. Role might be in use or protected by system.";
      toast.error(msg);
    } finally {
      setIsDeleteDialogOpen(false);
      setRoleToDelete(null);
    }
  };

  const handleView = (roleData) => {
    setSelectedRole(roleData);
    setViewMode("details");
    if (onView) onView("Role", roleData);
  };

  // FILTER LOGIC - Preserves original backend order
  const filtered = useMemo(() => {
    if (!Array.isArray(role)) return [];
    const q = query.trim().toLowerCase();
    if (!q) return role; // Return in original backend order
    return role.filter(c =>
      (c.roleName || "").toLowerCase().includes(q) ||
      (c.roleCode || "").toLowerCase().includes(q) ||
      (c.description || "").toLowerCase().includes(q)
    );
  }, [role, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);

  const exportColumns = [
    { key: "roleCode", header: "Role Code" },
    { key: "roleName", header: "Role Name" },
    { key: "description", header: "Description" },
    { key: "isSystemRole", header: "Is System Role" },
  ];

  // --- RENDER VIEW: DETAILS PAGE ---
  if (viewMode === "details" && selectedRole) {
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
                onClick={() => navigate(`/role-master?id=${selectedRole.roleId}`)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-indigo-700 transition"
              >
                <ModeEditIcon sx={{ fontSize: 18 }} /> Edit Role
              </button>
            </div>
          </div>

          {/* Main Content Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            {/* Banner */}
            <div className="bg-blue-900 p-8 text-white flex items-center gap-6">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-3xl font-black border border-white/30 uppercase">
                {selectedRole.roleName?.charAt(0) || "R"}
              </div>
              <div>
                <h1 className="text-3xl font-bold uppercase">{selectedRole.roleName}</h1>
                <p className="text-blue-200 flex items-center gap-2 mt-1">
                  <Briefcase className="w-4 h-4" /> Role Profile ID: {selectedRole.roleId}
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">

              {/* Main Sections */}
              <div className="md:col-span-2 space-y-8">
                <section>
                  <h3 className="text-indigo-900 font-bold text-lg mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-indigo-600 rounded-full"></div> Role Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Role Code</p>
                      <p className="text-base font-mono font-bold text-slate-700">{selectedRole.roleCode || "Not Available"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Role Type</p>
                      <p className={`text-base font-bold ${selectedRole.isSystemRole ? "text-amber-600" : "text-emerald-600"}`}>
                        {selectedRole.isSystemRole ? "System Role" : "Custom Role"}
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-indigo-900 font-bold text-lg mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-indigo-600 rounded-full"></div> Description
                  </h3>
                  <div className="flex gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <AlignLeft className="w-6 h-6 text-rose-500 mt-1" />
                    <div>
                      <p className="text-slate-700 leading-relaxed font-medium">
                        {selectedRole.description || "No description available."}
                      </p>
                    </div>
                  </div>
                </section>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl text-white shadow-lg shadow-indigo-200">
                  <ShieldCheck className="w-10 h-10 text-indigo-300 mb-6" />
                  <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-1">Role Type</h4>
                  <p className="text-xl font-bold mb-6">{selectedRole.isSystemRole ? "System" : "Custom"}</p>

                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] text-indigo-300 uppercase">Role Code</p>
                      <p className="font-mono text-sm tracking-widest bg-white/10 p-2 rounded-lg">{selectedRole.roleCode || "N/A"}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 border border-slate-100 rounded-2xl bg-white">
                  <h4 className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-tighter">System Info</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Role ID</span>
                      <span className="text-slate-600 font-medium">{selectedRole.roleId}</span>
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
          title="Delete Role"
          message="Are you sure you want to delete this role? This action cannot be undone."
          onConfirm={handleConfirmDelete}
          onCancel={() => setIsDeleteDialogOpen(false)}
        />

        {/* --- MAIN PAGE HEADER --- */}
        <div className="p-6 md:p-8 border-b border-slate-900">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Role Master List</h1>
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
                    placeholder="Search by name, code..."
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
                to="/role-master"
                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-900 text-white rounded-lg text-xs font-semibold hover:bg-blue-800 transition-all shadow-md active:scale-95"
              >
                <Plus className="w-4 h-4" /> Add Role
              </Link>
            </div>
          </div>

          {/* Export Bar */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-end gap-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-auto">Export Options</span>

            <button
              onClick={() => exportExcel({ fileName: "Roles", sheetName: "Roles", columns: exportColumns, rows: filtered })}
              className="flex items-center gap-2 px-3 py-1.5 bg-white text-emerald-700 border border-emerald-200 rounded-md text-xs font-bold hover:bg-emerald-50 hover:border-emerald-400 transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5" /> Excel
            </button>

            <button
              onClick={() => exportPDF({ fileName: "Roles", title: "Role List", columns: exportColumns, rows: filtered })}
              className="flex items-center gap-2 px-3 py-1.5 bg-white text-rose-700 border border-rose-200 rounded-md text-xs font-bold hover:bg-rose-50 hover:border-rose-400 transition shadow-sm"
            >
              <FileText className="w-3.5 h-3.5" /> PDF
            </button>

            <button
              onClick={() => printTable({ title: "Role List", columns: exportColumns, rows: filtered })}
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
                <th className="px-6 py-4">Role Details</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4 text-center">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {pageItems.length > 0 ? (
                pageItems.map((c, index) => (
                  <tr key={c.roleId} className="group hover:bg-teal-300/50 transition-colors border-b border-slate-300">
                    <td className="px-6 py-4 text-center text-slate-900 font-medium">
                      {(page - 1) * perPage + index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleView(c)} className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-indigo-600 transition" title="View Details">
                          <VisibilityIcon sx={{ fontSize: 18 }} />
                        </button>
                        <button onClick={() => navigate(`/role-master?id=${c.roleId}`)} className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-sky-600 transition" title="Edit">
                          <ModeEditIcon sx={{ fontSize: 18 }} />
                        </button>
                        <button onClick={() => openDeleteModal(c.roleId)} className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-rose-500 transition" title="Delete">
                          <DeleteIcon sx={{ fontSize: 18 }} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800 font-poppins uppercase">{c.roleName}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">Code: {c.roleCode}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-poppins">
                      {c.description || "No description"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${c.isSystemRole ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                        {c.isSystemRole ? "SYSTEM" : "CUSTOM"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-poppins">No roles found matching your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* --- PAGINATION --- */}
        <div className="px-6 py-4 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            Showing <span className="font-bold text-slate-700">{filtered.length > 0 ? (page - 1) * perPage + 1 : 0}</span> to <span className="font-bold text-slate-700">{Math.min(page * perPage, filtered.length)}</span> of <span className="font-bold text-slate-700">{filtered.length}</span> roles
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

export default RoleMasterList;