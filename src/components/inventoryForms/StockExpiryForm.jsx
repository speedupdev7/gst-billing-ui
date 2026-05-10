import React, { useState } from "react";
import {
  AlertTriangle,
  Save,
  RotateCcw,
} from "lucide-react";

const StockExpiryForm = () => {
  const [formData, setFormData] = useState({
    itemName: "",
    batchNo: "",
    quantity: "",
    expiryDate: "",
    supplier: "",
    actionType: "",
    remarks: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log(formData);

    alert("Expiry Stock Saved Successfully");
  };

  const handleReset = () => {
    setFormData({
      itemName: "",
      batchNo: "",
      quantity: "",
      expiryDate: "",
      supplier: "",
      actionType: "",
      remarks: "",
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-3 md:p-4">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
        <div className="flex items-center gap-2">
          <div className="bg-red-100 p-2 rounded-lg">
            <AlertTriangle
              className="text-red-600"
              size={18}
            />
          </div>

          <div>
            <h1 className="text-lg font-bold text-gray-800">
              Stock Expiry Form
            </h1>

            <p className="text-xs text-gray-500 mt-1">
              Manage expired and near expiry medicines
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm border border-gray-200 mt-4 p-4"
      >
        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Item Name */}
          <div>
            <label className="text-xs font-medium text-gray-700">
              Item Name
            </label>

            <input
              type="text"
              name="itemName"
              value={formData.itemName}
              onChange={handleChange}
              placeholder="Enter item name"
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-red-200"
            />
          </div>

          {/* Batch No */}
          <div>
            <label className="text-xs font-medium text-gray-700">
              Batch No
            </label>

            <input
              type="text"
              name="batchNo"
              value={formData.batchNo}
              onChange={handleChange}
              placeholder="Enter batch number"
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-red-200"
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="text-xs font-medium text-gray-700">
              Quantity
            </label>

            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="Enter quantity"
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-red-200"
            />
          </div>

          {/* Expiry Date */}
          <div>
            <label className="text-xs font-medium text-gray-700">
              Expiry Date
            </label>

            <input
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-red-200"
            />
          </div>

          {/* Supplier */}
          <div>
            <label className="text-xs font-medium text-gray-700">
              Supplier Name
            </label>

            <input
              type="text"
              name="supplier"
              value={formData.supplier}
              onChange={handleChange}
              placeholder="Enter supplier"
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-red-200"
            />
          </div>

          {/* Action Type */}
          <div>
            <label className="text-xs font-medium text-gray-700">
              Action Type
            </label>

            <select
              name="actionType"
              value={formData.actionType}
              onChange={handleChange}
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-red-200"
            >
              <option value="">Select Action</option>
              <option>Return To Supplier</option>
              <option>Damage Entry</option>
              <option>Dispose</option>
            </select>
          </div>

          {/* Remarks */}
          <div className="md:col-span-2 lg:col-span-3">
            <label className="text-xs font-medium text-gray-700">
              Remarks
            </label>

            <textarea
              rows="3"
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              placeholder="Enter remarks..."
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-red-200 resize-none"
            ></textarea>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-3 mt-5">
          <button
            type="submit"
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700"
          >
            <Save size={16} />
            Save Entry
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 border border-gray-300 bg-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            <RotateCcw size={16} />
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};

export default StockExpiryForm;