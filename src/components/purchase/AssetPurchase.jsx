import React from 'react';
import { Save, RotateCcw, Plus, Trash2 } from 'lucide-react';

const AssetPurchaseForm = () => {
  return (
    <div className="w-full max-w-6xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Form Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Asset Purchase Entry</h2>
          <p className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">Add new asset/inventory details</p>
        </div>
        <button className="bg-indigo-600 text-white px-4 py-1.5 rounded text-xs font-bold hover:bg-indigo-700 transition-all">
          VIEW LIST
        </button>
      </div>

      <div className="p-8">
        <form className="space-y-10">
          
          {/* Section: General Information */}
          <section>
            <h3 className="text-sm font-bold text-indigo-900 mb-4 border-b border-slate-50 pb-2">General & Legal Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Asset/Unit Name *</label>
                <input 
                  type="text" 
                  placeholder="Enter asset or unit name" 
                  className="w-full p-2.5 text-sm border border-gray-300 rounded focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none placeholder:text-slate-300 transition-all" 
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">GSTIN</label>
                <input type="text" placeholder="22AAAAA0000A1Z5" className="w-full p-2.5 text-sm border border-gray-300 rounded outline-none bg-slate-50/50" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">PAN</label>
                <input type="text" placeholder="ABCDE1234F" className="w-full p-2.5 text-sm border border-gray-300 rounded outline-none bg-slate-50/50" />
              </div>
            </div>
          </section>

          {/* Section: Contact Details */}
          <section>
            <h3 className="text-sm font-bold text-indigo-900 mb-4 border-b border-slate-50 pb-2">Contact Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1 text-slate-500 relative">
                <label className="text-xs font-bold text-slate-600">Email *</label>
                <input type="email" placeholder="name@company.com" className="w-full p-2.5 pl-4 text-sm border border-gray-300 rounded outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Phone *</label>
                <input type="text" placeholder="+91 98765 43210" className="w-full p-2.5 text-sm border border-gray-300 rounded outline-none" />
              </div>
            </div>
          </section>

          {/* Section: Registered Address */}
          <section>
            <h3 className="text-sm font-bold text-indigo-900 mb-4 border-b border-slate-50 pb-2">Registered Address</h3>
            <div className="grid grid-cols-1 gap-6 mb-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Address line</label>
                <input type="text" placeholder="Address line" className="w-full p-2.5 text-sm border border-gray-300 rounded outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">City *</label>
                <input type="text" placeholder="City" className="w-full p-2.5 text-sm border border-gray-300 rounded outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Pincode *</label>
                <input type="text" placeholder="Pincode" className="w-full p-2.5 text-sm border border-gray-300 rounded outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">State *</label>
                <input type="text" placeholder="State" className="w-full p-2.5 text-sm border border-gray-300 rounded outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">State Code *</label>
                <input type="text" placeholder="State Code" className="w-full p-2.5 text-sm border border-gray-300 rounded outline-none" />
              </div>
            </div>
          </section>

          {/* Section: Bank Details */}
          <section>
            <h3 className="text-sm font-bold text-indigo-900 mb-4 border-b border-slate-50 pb-2">Bank Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Bank Name *</label>
                <input type="text" placeholder="Bank Name" className="w-full p-2.5 text-sm border border-gray-300 rounded outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Account Number *</label>
                <input type="text" placeholder="Account Number" className="w-full p-2.5 text-sm border border-gray-300 rounded outline-none" />
              </div>
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-6 border-t border-gray-100">
            <button 
              type="submit" 
              className="flex items-center gap-2 bg-[#00A985] text-white px-8 py-2 rounded text-sm font-bold hover:bg-[#008f70] shadow-sm transition-all active:scale-95"
            >
              <Save size={16} /> SAVE
            </button>
            <button 
              type="reset" 
              className="flex items-center gap-2 bg-slate-50 text-slate-500 border border-slate-200 px-6 py-2 rounded text-sm font-bold hover:bg-slate-100 transition-all active:scale-95"
            >
              <RotateCcw size={16} /> RESET FORM
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AssetPurchaseForm;