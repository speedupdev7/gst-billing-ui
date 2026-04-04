import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
/* ---------------- react-icons imports ---------------- */
import { FiFileText, FiSearch, FiChevronDown, FiChevronRight, FiChevronLeft, FiLogOut,FiMenu, FiBell } from "react-icons/fi";

/* ---------------- Asset Imports ---------------- */
import logoImage from "../assets/logoImage.png";
import HomeImage from "../assets/HomeImage.png";
import DashboardImage from "../assets/DashboardImage.png";
import MastersImage from "../assets/MastersImage.png";
import PurchaseImage from "../assets/PurchaseImage.png";
import BillingImage from "../assets/billingImage.png";
import TransactionImage from "../assets/TransactionImage.png";
import ExpensesImage from "../assets/ExpensesImage.png";
import ReportsImage from "../assets/ReportsImage.png";
import SettingImage from "../assets/SettingImage.png";
import AssignFunctionalityImage from "../assets/AssignFunctionalityImage.png";

const ICON_MAP = {
  home: HomeImage,
  dashboard: DashboardImage,
  masters: MastersImage,
  purchase: PurchaseImage,
  billing: BillingImage,
  transactions: TransactionImage,
  expenses: ExpensesImage,
  reports: ReportsImage,
  setting: SettingImage,
  assign: AssignFunctionalityImage,
};

/* ---------------- initialMenu ---------------- */
const initialMenu = [
  { key: "home", title: "Home", icon: "home", path: "/" },
  { key: "dashboard", title: "Dashboard", icon: "dashboard", path: "/dashboard" },
  {
    key: "masters",
    title: "Masters",
    icon: "masters",
    children: [
      { key: "unit-company", title: "Unit Company Master", path: "/unit-company" },
      { key: "item-master", title: "Item Master", path: "/item-master" },
      { key: "customer-master", title: "Customer Master", path: "/customer-master" },
      { key: "supplier-master", title: "Supplier Master", path: "/supplier-master" },
      { key: "employee-master", title: "Employee Master", path: "/employee-master" },
      { key: "designation-master", title: "Designation Master", path: "/designation-master" },
      { key: "qualification-master", title: "Qualification Master", path: "/qualification-master" },
      { key: "city-master", title: "City Master", path: "/city-master" },
      { key: "expenses-master", title: "Expenses Master", path: "/expenses-master" },
      { key: "role-master", title: "Role Master", path: "/role-master" },
      { key: "user-master", title: "User Master", path: "/user-master" },
      { key: "functionality-master", title: "Functionality Master", path: "/functionality-master" },
      { key: "department-master", title: "Department Master", path: "/department-master" },
      { key: "dashboard-master", title: "Dashboard Master", path: "/dashboard-master" },
      { key: "gst-master", title: "GST Master", path: "/gst-master" },
      { key: "itemunit-master", title: "Item Unit Master", path: "/itemunit-master" },
      { key: "hsn-master", title: "HSN Master", path: "/hsn-master" },
      { key: "transport-master", title: "Transport Master", path: "/transport-master" },
      { key: "bank-master", title: "Bank Master", path: "/bank-master" },
      { key: "financialyear-master", title: "Financial Year Master", path: "/financialyear-master" },
      { key: "paymentmode-master", title: "Payment Mode Master", path: "/paymentmode-master" },
      { key: "state-master", title: "State Master", path: "/state-master" },
      { key: "termsandcondition-master", title: "Terms & Condition Master", path: "/termsandcondition-master" },
      { key: "country-master", title: "Country Master", path: "/country-master" }
    ],
  },
  {
    key: "purchase",
    title: "Purchase",
    icon: "purchase",
    children: [
      { key: "asset-purchase", title: "Asset Purchase", path: "/asset-purchase" },
      { key: "purchase-return", title: "Purchase Return", path: "/purchase-return" },
      { key: "purchase-stock", title: "Purchase Stock", path: "/purchase-stock" },
    ],
  },
  {
    key: "billing",
    title: "Billing",
    icon: "billing",
    children: [
      // { key: "billing", title: "Billing", path: "/billing" },
      { key: "billing_v1", title: "Billing V1", path: "/billing_v1" },
      { key: "billing_v2", title: "Billing V2", path: "/billing_v2" },
      { key: "billing_v3", title: "Billing V3", path: "/billing_v3" },
      { key: "billing_v4", title: "Billing V4", path: "/billing_v4" },
      { key: "return-billing", title: "Billing Return", path: "/return-billing" },
    ],
  },
  {
    key: "transactions",
    title: "Transactions",
    icon: "transactions",
    children: [
      { key: "bill-transaction", title: "Billing Transaction", path: "/bill-transaction" },
      { key: "purchase-transaction", title: "Purchase Transaction", path: "/purchase-transaction" },
    ],
  },
  {
    key: "expenses",
    title: "Expenses",
    icon: "expenses",
    children: [
      { key: "daily-expenses", title: "Daily Expenses", path: "/daily-expenses" },
      { key: "employee-expenses", title: "Employee Expenses", path: "/employee-expenses" },
    ],
  },

  {
    key: "reports",
    title: "Reports",
    icon: "reports",
    children: [
      {
        key: "reports-purchase",
        title: "Purchase Report",
        children: [
          { key: "assetpurchase-report", title: "Asset Purchase Report", path: "assetpurchase-report" },
          { key: "purchase-report", title: "Purchase Report", path: "purchase-report" },
          { key: "purchasereturn-report", title: "Purchase Return Report", path: "purchasereturn-report" },
        ],
      },
      {
        key: "reports-stock",
        title: "Stock Report",
        children: [
          { key: "stock-report", title: "Stock Report", path: "stock-report" },
          { key: "finalstock-report", title: "Final Stock Report", path: "finalstock-report" },
        ],
      },
      {
        key: "bill-report",
        title: "Billing Report",
        children: [
          { key: "bill-report", title: "Billing Report", path: "bill-report" },
          { key: "billreturn-report", title: "Bill Return Report", path: "billreturn-report" },
        ],
      },
    ],
  },
  { key: "setting", title: "Setting", icon: "setting", path: "/setting-functionality" },
  { key: "assign", title: "Assign Functionality", icon: "assign", path: "/assign-functionality" },
];

/* ---------------- Icon Renderer ---------------- */
const ThreeDIcon = ({ iconKey, active, open }) => {
  const IconSource = ICON_MAP[iconKey] || FiFileText;
  const isImage = typeof IconSource === 'string' || (typeof IconSource === 'object' && !IconSource.render);

  return (
    <div className={`relative shrink-0 ${open ? 'w-9 h-9' : 'w-10 h-10'}`}>
      <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-[70%] h-1 bg-black/10 blur-md rounded-full`} />
      <div className={`relative w-full h-full flex items-center justify-center rounded-xl
        ${!isImage && active ? 'bg-gradient-to-br from-blue-600 to-indigo-700' : ''}
        ${!isImage && !active ? 'bg-slate-100 text-slate-400' : ''}`}>
        {isImage ? (
          <img
            src={IconSource}
            alt="icon"
            className={`w-full h-full object-contain ${active ? '' : 'grayscale-[20%]'}`}
          />
        ) : (
          <IconSource className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
        )}
      </div>
    </div>
  );
};

const DashboardLayout = () => {
  const [open, setOpen] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState(() => new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [menu] = useState(initialMenu);
  const location = useLocation();
  const navigate = useNavigate();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const logoutRef = useRef(null);
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  const userName = "Mubin Mutwalli";
  const userRole = "Administrator";
  const userInitial = userName.charAt(0).toUpperCase();

  /* ---------------- NEW THEME LOGIC ADDED HERE ---------------- */
  useEffect(() => {
    const applyTheme = (settings) => {
      if (!settings) return;
      const root = document.documentElement;
      root.style.setProperty('--primary-color', settings.themeColor);
      root.style.setProperty('--drawer-bg', settings.drawerColor);
      root.style.setProperty('--nav-bg', settings.navbarUseGradient
        ? `linear-gradient(90deg, ${settings.navbarGradientStart}, ${settings.navbarGradientEnd})`
        : settings.navbarColor);
    };

    // Load initial theme
    const saved = localStorage.getItem("app-settings");
    if (saved) applyTheme(JSON.parse(saved));

    // Listener for live updates from ThemeControls
    const handleUpdate = (e) => applyTheme(e.detail);
    window.addEventListener("app-theme-updated", handleUpdate);
    return () => window.removeEventListener("app-theme-updated", handleUpdate);
  }, []);
  /* ----------------------------------------------------------- */

  const toggleGroup = useCallback((key) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const isExpanded = useCallback((key) => expandedGroups.has(key), [expandedGroups]);

  const isActive = useCallback((path) => {
    if (!path) return false;
    if (path === "/") return location.pathname === "/";
    return location.pathname === path || location.pathname.startsWith(path + "/");
  }, [location.pathname]);

  useEffect(() => {
    const onDocClick = (e) => { if (logoutRef.current && !logoutRef.current.contains(e.target)) setLogoutOpen(false); };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true }));
      setCurrentDate(now.toLocaleDateString("en-UK", { weekday: "short", month: "short", day: "2-digit", year: "numeric" }));
    };
    update();
    const t = setInterval(update, 60000);
    return () => clearInterval(t);
  }, []);

  const activePageTitle = useMemo(() => {
    let title = "GST App";
    const walk = (arr) => {
      for (const it of arr) {
        if (it.path && location.pathname === it.path) { title = it.title; return true; }
        if (it.children && walk(it.children)) return true;
      }
      return false;
    };
    walk(menu);
    return title;
  }, [location.pathname, menu]);

  const filteredMenu = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return menu;
    return menu.map((item) => {
      if (!item.children) return item.title.toLowerCase().includes(q) ? item : null;
      const matchedChildren = item.children.filter((child) => {
        if (child.title.toLowerCase().includes(q)) return true;
        if (child.children) return child.children.some(g => g.title.toLowerCase().includes(q));
        return false;
      });
      return item.title.toLowerCase().includes(q) || matchedChildren.length > 0 ? { ...item, children: matchedChildren } : null;
    }).filter(Boolean);
  }, [searchTerm, menu]);

  const renderMenuItemRecursive = (item, depth = 0) => {
    const isSearching = searchTerm.trim().length > 0;
    const isGroup = !!(item.children && item.children.length > 0);

    const subtreeHasActive = (node) => {
      if (!node) return false;
      if (node.path && isActive(node.path)) return true;
      if (node.children) return node.children.some(c => subtreeHasActive(c));
      return false;
    };

    const groupActive = isGroup ? subtreeHasActive(item) : isActive(item.path);
    const expanded = isGroup ? (isSearching ? true : isExpanded(item.key)) : false;

    const content = (
      <div className={`
        flex items-center cursor-pointer my-0 
        ${open ? 'px-3 py-1 gap-4 rounded-xl' : 'justify-center py-0.5'}
        ${groupActive && open ? 'bg-gray-100 ring-1 ring-slate-200' : 'hover:bg-slate-50'}
      `}>
        <div className="scale-60 origin-center shrink-0">
          <ThreeDIcon iconKey={item.key} active={groupActive} open={open} />
        </div>

        {open && (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex justify-between items-center">
              <span className={`text-[13px] font-poppins truncate tracking-tight
                ${groupActive ? 'text-black font-bold' : 'text-slate-900'}`}>
                {item.title}
              </span>
              {isGroup && (
                <FiChevronRight
                  className={`transition-transform duration-300 ${expanded ? 'rotate-90' : ''}`}
                  style={{ color: expanded ? 'var(--primary-color)' : 'black' }}
                  size={16}
                />
              )}
            </div>
          </div>
        )}
      </div>
    );

    return (
      <div key={item.key}>
        {isGroup ? (
          <div onClick={() => !isSearching && open && toggleGroup(item.key)}>
            {content}
          </div>
        ) : (
          <Link to={item.path}>{content}</Link>
        )}

        {open && expanded && isGroup && (
          <div className="ml-8 mt-1 mb-3 border-l-2 border-slate-100 space-y-1 pl-3 ">
            {item.children.map((child) => renderMenuItemRecursive(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-[#F0F2F5] text-slate-800 font-poppins">
      <style>{`
        .drawer-scrollbar::-webkit-scrollbar { width: 4px; }
        .drawer-scrollbar::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; }
      `}</style>

      {/* SIDEBAR */}
      <aside
        style={{ backgroundColor: 'var(--drawer-bg, #ffffff)' }}
        className={`relative transition-all duration-500 border-r border-slate-200 flex flex-col z-30 h-full ${open ? "w-72" : "w-20"} shrink-0 shadow-xl`}
      >
        <div className="flex items-center h-14 px-5 border-b border-slate-100 shrink-0">
          <div className={`flex items-center gap-3 transition-all duration-300 ${!open && "opacity-0 invisible w-0"}`}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black ">
              <img src={logoImage} alt="logo" />
            </div>
            <span className="text-xl font-black text-black tracking-tighter uppercase font-semibold font-poppins">abc<span className="text-orange-500">123</span></span>
          </div>
          <button
            onClick={() => setOpen(!open)}
            style={{ backgroundColor: 'var(--primary-color, #3515d8)' }}
            className={`p-2 rounded-xl text-white shadow-lg transition-all ${!open ? "mx-auto" : "ml-auto"}`}
          >
            {open ? <FiChevronLeft size={18} /> : <FiMenu size={18} />}
          </button>
        </div>

        {open && (
          <div className="px-3 pt-4 pb-2">
            <div className="relative w-full">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                <FiSearch className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="block w-full h-10 bg-slate-50 border border-slate-200 pl-9 pr-4 rounded-xl text-[13px] text-slate-900 outline-none focus:bg-white focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        )}

        <nav className="flex-1 drawer-scrollbar overflow-y-auto px-3 py-1 space-y-0 overflow-x-hidden pr-1">
          {filteredMenu.map((item) => renderMenuItemRecursive(item))}
        </nav>
      </aside>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header
          style={{ background: 'var(--nav-bg, linear-gradient(90deg, #0F172A, #3B82F6))' }}
          className="flex items-center justify-between px-8 h-14 shrink-0 z-20 shadow-xl"
        >
          <div className="flex items-center gap-4 text-white">
            <div className="h-10 w-1 bg-white/20 rounded-full hidden md:block" />
            <h1 className="font-black tracking-tight text-lg uppercase">{activePageTitle}</h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-3 text-right">
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-white uppercase font-black">Date</span>
                <span className="text-sm font-semibold text-white">{currentDate}</span>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-white uppercase font-black">Time</span>
                <span className="text-sm font-semibold text-white">{currentTime}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 pl-4 border-l border-white/10">
              <button className="p-2.5 bg-white/5 rounded-xl text-white hover:bg-white/10 relative transition-all">
                <FiBell size={20} />
                <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-slate-800"></span>
              </button>

              <div ref={logoutRef} className="relative">
                <button
                  onClick={() => setLogoutOpen(!logoutOpen)}
                  className="flex items-center gap-3 p-1.5 pr-4 rounded-xl bg-white text-blue-900 transition-all"
                >
                  <div
                    style={{ background: 'var(--primary-color, #2563EB)' }}
                    className="w-8 h-8 rounded-lg text-white flex items-center justify-center text-xs font-black"
                  >
                    {userInitial}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-[9px] font-black text-blue-600/60 leading-none mb-1 uppercase tracking-tighter">Authorized</p>
                    <p className="text-xs font-black text-slate-800 leading-none truncate w-20">MUBIN_M</p>
                  </div>
                  <FiChevronDown className={`text-slate-400 transition-transform ${logoutOpen ? 'rotate-180' : ''}`} size={14} />
                </button>

                {logoutOpen && (
                  <div className="absolute right-0 mt-4 w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 py-2">
                    <div className="px-6 py-5 border-b border-slate-50 bg-slate-50/50">
                      <p className="font-black text-slate-900 text-sm">{userName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        <p className="text-[10px] text-blue-600 font-semibold uppercase tracking-widest">{userRole}</p>
                      </div>
                    </div>
                    <div className="p-2">
                      <button onClick={() => navigate("/login")} className="w-full mt-2 flex items-center gap-4 px-4 py-3 text-sm font-black text-rose-500 hover:bg-rose-50 rounded-xl transition-all border-t border-slate-100 uppercase tracking-widest"><FiLogOut /> Log Out</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 bg-[#F0F2F5] overflow-y-auto">
          <div className="max-w-[1800px] mx-auto min-h-full">
            <div >
              <Outlet/>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
