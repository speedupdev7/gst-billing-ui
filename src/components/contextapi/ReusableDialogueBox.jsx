import React from 'react';
import { Trash2, AlertCircle, Save, CheckCircle } from 'lucide-react';

const ReusableDialogueBox = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  // 1. Determine the mode (Delete vs Save/Update)
  const isDelete = title?.toLowerCase().includes('delete');
  
  // 2. Pick the right Icon and Color scheme
  const Icon = isDelete ? Trash2 : (title?.toLowerCase().includes('update') ? CheckCircle : Save);
  const colorClass = isDelete ? "rose" : "indigo";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 transform animate-in zoom-in-95 duration-200">
        
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            {/* Dynamic Icon Background */}
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-inner 
              ${isDelete ? "bg-rose-50 text-rose-600" : "bg-indigo-50 text-indigo-600"}`}>
              <Icon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">
              {title}
            </h3>
          </div>
          
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
            <p className="text-slate-600 leading-relaxed text-sm">
              {message}
            </p>
          </div>
        </div>

        <div className="bg-slate-50/80 px-6 py-4 flex flex-col sm:flex-row justify-end gap-3 border-t border-slate-100">
          <button 
            onClick={onCancel}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-all"
          >
            Cancel
          </button>
          
          {/* Dynamic Action Button */}
          <button 
            onClick={onConfirm}
            className={`px-5 py-2.5 text-sm font-semibold text-white rounded-xl shadow-lg transition-all active:scale-95
              ${isDelete ? "bg-rose-600 hover:bg-rose-700 shadow-rose-200" : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200"}`}
          >
            {isDelete ? "Yes, Delete" : (title?.toLowerCase().includes('update') ? "Confirm Update" : "Confirm Save")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReusableDialogueBox;
