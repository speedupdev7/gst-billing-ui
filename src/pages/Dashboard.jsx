import React, { useState } from 'react'; // Added useState
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell ,
} from 'recharts';
import { 
  FiTrendingUp, FiBox, FiUsers, FiFileText, 
  FiArrowUpRight, FiArrowDownRight,FiPieChart,
} from 'react-icons/fi';

/* --- Mock Data for Charts --- */
const salesData = [
  { name: 'Apr', sales: 4000, tax: 720 },
  { name: 'May', sales: 3000, tax: 540 },
  { name: 'Jun', sales: 2000, tax: 360 },
  { name: 'Jul', sales: 2780, tax: 500 },
  { name: 'Aug', sales: 1890, tax: 340 },
  { name: 'Sep', sales: 2390, tax: 430 },
];

const categoryData = [
  { name: 'Electronics', value: 400 },
  { name: 'Services', value: 300 },
  { name: 'Hardware', value: 300 },
];

const COLORS = ['#3B82F6', '#8B5CF6', '#F59E0B'];

const FullReportView = () => {
  // 1. Add state to toggle between 'wave' (AreaChart) and 'bars' (BarChart)
  const [viewMode, setViewMode] = useState('wave'); 

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8 font-poppins">
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* --- Header Section --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">APPLICATION INSIGHTS</h1>
            <p className="text-slate-500 font-medium">Consolidated report for all masters, transactions, and GST filings.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 shadow-sm">
              Fiscal Year: 2025-26
            </span>
            <button className="px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-black shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">
              EXPORT MASTER REPORT
            </button>
          </div>
        </div>

        {/* --- KPI Stats Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Revenue" value="₹24,85,200" change="+12.5%" icon={<FiTrendingUp />} color="blue" />
          <StatCard title="GST Liability" value="₹4,47,336" change="+8.2%" icon={<FiFileText />} color="orange" />
          <StatCard title="Active Customers" value="1,284" change="+4.1%" icon={<FiUsers />} color="purple" />
          <StatCard title="Stock Value" value="₹18,20,000" change="-2.4%" icon={<FiBox />} color="emerald" />
        </div>

        {/* --- Charts Row --- */}
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
  
  {/* Main Analytics Card (Now Pie Chart) */}
  <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
    <div className="flex items-center justify-between mb-8">
      <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm flex items-center gap-2">
        <FiPieChart className="text-blue-600" /> Revenue Segmentation
      </h3>

      {/* Toggle between Donut and Solid */}
      <div className="flex bg-slate-100 p-1 rounded-xl">
        <button 
          onClick={() => setViewMode('wave')} // Using your existing state 'wave' for Donut
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'wave' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Donut
        </button>
        <button 
          onClick={() => setViewMode('bars')} // Using your existing state 'bars' for Solid
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'bars' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Solid
        </button>
      </div>
    </div>

    <div className="h-[350px] w-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={salesData}
            cx="50%"
            cy="50%"
            innerRadius={viewMode === 'wave' ? 90 : 0} // Donut if 'wave' is selected
            outerRadius={130}
            paddingAngle={5}
            dataKey="sales"
            stroke="none"
          >
            {salesData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'}} 
          />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Optional: Center Text for Donut Mode */}
      {viewMode === 'wave' && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Revenue</p>
          <p className="text-2xl font-black text-slate-800">
            ${salesData.reduce((acc, curr) => acc + curr.sales, 0).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  </div>

  {/* Distribution Pie (Small Sidebar Chart) */}
  <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col">
    <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm mb-8">Sales by Category</h3>
    <div className="flex-1">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={categoryData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
            {categoryData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      
      <div className="space-y-3 mt-6">
        {categoryData.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[idx]}}></div>
              <span className="text-xs font-bold text-slate-600">{item.name}</span>
            </div>
            <span className="text-xs font-black text-slate-900">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  </div>

</div>

        {/* --- Detailed Information Table --- */}
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">Recent Ledger Activity</h3>
            <div className="flex gap-2">
              <span className="bg-slate-100 text-slate-600 text-[10px] font-black px-3 py-1 rounded-full uppercase">All Branches</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider">Transaction ID</th>
                  <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider">Entity Name</th>
                  <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider">Type</th>
                  <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider">Amount</th>
                  <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider">Tax Component</th>
                  <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <DataRow id="TXN-55201" name="Reliance Industries" type="B2B Sale" amt="₹1,45,000" tax="₹26,100" status="Verified" />
                <DataRow id="TXN-55202" name="Tata Steel" type="Purchase" amt="₹82,400" tax="₹14,832" status="Verified" />
                <DataRow id="TXN-55203" name="Adani Group" type="B2B Sale" amt="₹2,10,000" tax="₹37,800" status="Pending" />
                <DataRow id="TXN-55204" name="Local Supplier" type="Expenses" amt="₹12,000" tax="₹2,160" status="Rejected" />
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

/* --- Helper Components --- */

const StatCard = ({ title, value, change, icon, color }) => {
  const isPositive = change.startsWith('+');
  const colorMap = {
    blue: "text-blue-600 bg-blue-50",
    orange: "text-orange-600 bg-orange-50",
    purple: "text-purple-600 bg-purple-50",
    emerald: "text-emerald-600 bg-emerald-50",
  };

  return (
    <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorMap[color]}`}>
          {icon}
        </div>
        <div className={`flex items-center text-[11px] font-black px-2 py-1 rounded-lg ${isPositive ? 'bg-green-50 text-green-600' : 'bg-rose-50 text-rose-600'}`}>
          {isPositive ? <FiArrowUpRight className="mr-1" /> : <FiArrowDownRight className="mr-1" />}
          {change}
        </div>
      </div>
      <div>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{title}</p>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h2>
      </div>
    </div>
  );
};

const DataRow = ({ id, name, type, amt, tax, status }) => (
  <tr className="hover:bg-slate-50/50 transition-colors group">
    <td className="px-8 py-5 text-sm font-black text-blue-600 tracking-tight">{id}</td>
    <td className="px-8 py-5 text-sm font-bold text-slate-700">{name}</td>
    <td className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">{type}</td>
    <td className="px-8 py-5 text-sm font-black text-slate-900">{amt}</td>
    <td className="px-8 py-5 text-sm font-medium text-slate-500">{tax}</td>
    <td className="px-8 py-5">
      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest 
        ${status === 'Verified' ? 'bg-green-100 text-green-700' : status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
        {status}
      </span>
    </td>
  </tr>
);

export default FullReportView;
