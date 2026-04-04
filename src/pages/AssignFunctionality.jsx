import React, { useState } from 'react';
import { 
  FiPlus, FiCheck, FiShield, FiBriefcase, FiShoppingCart, 
  FiBarChart, FiSettings, FiSearch, FiInfo, FiChevronRight 
} from 'react-icons/fi';

const AssignFunctionalityV4 = () => {
  const [selectedRole, setSelectedRole] = useState("Accountant");
  const [activeModule, setActiveModule] = useState('masters');

  const roles = ["Administrator", "Accountant", "Store Manager", "Salesman"];

  const modules = [
    { id: 'masters', title: 'Masters', icon: <FiBriefcase />, color: 'bg-blue-500' },
    { id: 'purchase', title: 'Purchase', icon: <FiShoppingCart />, color: 'bg-purple-500' },
    { id: 'billing', title: 'Billing', icon: <FiCheck />, color: 'bg-emerald-500' },
    { id: 'reports', title: 'Reports', icon: <FiBarChart />, color: 'bg-orange-500' },
    { id: 'settings', title: 'Settings', icon: <FiSettings />, color: 'bg-rose-500' },
  ];

  const currentModule = modules.find(m => m.id === activeModule);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* 1. TOP NAV - ROLE SELECTOR */}
      <header className="h-20 border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 bg-white z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
            <FiShield size={20} />
          </div>
          <h1 className="text-xl font-black tracking-tight">Access Control</h1>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl">
          {roles.map(role => (
            <button 
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedRole === role ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {role}
            </button>
          ))}
        </div>

        <button className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
          Save Layout
        </button>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* 2. LEFT RAIL - MODULES */}
        <aside className="w-72 border-r border-slate-100 p-6 flex flex-col gap-2 overflow-y-auto">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-2">Modules</p>
          {modules.map((mod) => (
            <button
              key={mod.id}
              onClick={() => setActiveModule(mod.id)}
              className={`group flex items-center justify-between p-4 rounded-2xl transition-all ${
                activeModule === mod.id ? 'bg-slate-50 border-slate-100' : 'hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${mod.color} shadow-lg shadow-slate-100`}>
                  {mod.icon}
                </div>
                <span className={`font-bold text-sm ${activeModule === mod.id ? 'text-slate-900' : 'text-slate-500'}`}>
                  {mod.title}
                </span>
              </div>
              <FiChevronRight className={`${activeModule === mod.id ? 'text-slate-900' : 'text-slate-200'}`} />
            </button>
          ))}
        </aside>

        {/* 3. MAIN WORKSPACE - PERMISSIONS */}
        <main className="flex-1 bg-slate-50/30 p-10 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {/* Context Header */}
            <div className="mb-10">
              <div className="flex items-center gap-3 text-blue-600 mb-2">
                <span className="p-2 bg-blue-50 rounded-lg">{currentModule.icon}</span>
                <span className="text-xs font-black uppercase tracking-widest">{currentModule.title} Module</span>
              </div>
              <h2 className="text-3xl font-black text-slate-900">Configure Permissions</h2>
              <p className="text-slate-500 font-medium">Define what an <span className="text-slate-900 underline decoration-blue-500">{selectedRole}</span> can do within this module.</p>
            </div>

            {/* Permission List */}
            <div className="space-y-4">
              {[
                { title: 'Create Entries', desc: 'Allows the user to add new data rows.' },
                { title: 'Full Edit Access', desc: 'Allows modifying existing master records.' },
                { title: 'Delete Documents', desc: 'Permanent removal of records (High Risk).' },
                { title: 'Export PDF/Excel', desc: 'Allows downloading of system data.' },
                { title: 'System Logs', desc: 'View activity history for this module.' },
              ].map((perm, i) => (
                <div key={i} className="group bg-white border border-slate-100 p-6 rounded-[2rem] flex items-center justify-between hover:shadow-xl hover:shadow-slate-200/50 transition-all">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      <FiPlus size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{perm.title}</h4>
                      <p className="text-xs text-slate-400 font-medium">{perm.desc}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                     {/* Dynamic Toggle */}
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked={i < 2} />
                      <div className="w-12 h-6 bg-slate-100 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-6"></div>
                    </label>
                  </div>
                </div>
              ))}
            </div>

            {/* Hint Box */}
            <div className="mt-12 p-6 bg-slate-900 rounded-[2rem] flex items-center gap-6 text-white">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-blue-400">
                <FiInfo size={24} />
              </div>
              <div>
                <p className="font-bold text-sm">Inherited Permissions</p>
                <p className="text-xs text-slate-400">Some settings might be locked if the {selectedRole} role inherits from a higher group.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AssignFunctionalityV4;
