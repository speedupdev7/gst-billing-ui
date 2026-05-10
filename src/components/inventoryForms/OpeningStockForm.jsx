import React, { useState } from "react";
import {
  Save,
  RotateCcw,
  Package,
} from "lucide-react";

const OpeningStockForm = () => {
  const [formData, setFormData] = useState({
    itemName: "",
    category: "",
    batchNo: "",
    quantity: "",
    purchaseRate: "",
    sellingRate: "",
    mrp: "",
    gst: "",
    expiryDate: "",
    supplier: "",
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

    alert("Opening Stock Saved Successfully");
  };

  const handleReset = () => {
    setFormData({
      itemName: "",
      category: "",
      batchNo: "",
      quantity: "",
      purchaseRate: "",
      sellingRate: "",
      mrp: "",
      gst: "",
      expiryDate: "",
      supplier: "",
      remarks: "",
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-3 md:p-4">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
        <div className="flex items-center gap-2">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Package className="text-blue-600" size={18} />
          </div>

          <div>
            <h1 className="text-lg font-bold text-gray-800">
              Opening Stock Form
            </h1>

            <p className="text-xs text-gray-500 mt-1">
              Add medicine opening stock details
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
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-200"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-medium text-gray-700">
              Category
            </label>

            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-200"
            >
              <option value="">Select Category</option>
              <option>Tablet</option>
              <option>Syrup</option>
              <option>Capsule</option>
              <option>Injection</option>
            </select>
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
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-200"
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
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-200"
            />
          </div>

          {/* Purchase Rate */}
          <div>
            <label className="text-xs font-medium text-gray-700">
              Purchase Rate
            </label>

            <input
              type="number"
              name="purchaseRate"
              value={formData.purchaseRate}
              onChange={handleChange}
              placeholder="Enter purchase rate"
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-200"
            />
          </div>

          {/* Selling Rate */}
          <div>
            <label className="text-xs font-medium text-gray-700">
              Selling Rate
            </label>

            <input
              type="number"
              name="sellingRate"
              value={formData.sellingRate}
              onChange={handleChange}
              placeholder="Enter selling rate"
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-200"
            />
          </div>

          {/* MRP */}
          <div>
            <label className="text-xs font-medium text-gray-700">
              MRP
            </label>

            <input
              type="number"
              name="mrp"
              value={formData.mrp}
              onChange={handleChange}
              placeholder="Enter MRP"
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-200"
            />
          </div>

          {/* GST */}
          <div>
            <label className="text-xs font-medium text-gray-700">
              GST %
            </label>

            <input
              type="number"
              name="gst"
              value={formData.gst}
              onChange={handleChange}
              placeholder="Enter GST"
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-200"
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
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-200"
            />
          </div>

          {/* Supplier */}
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-gray-700">
              Supplier Name
            </label>

            <input
              type="text"
              name="supplier"
              value={formData.supplier}
              onChange={handleChange}
              placeholder="Enter supplier name"
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-200"
            />
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
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-200 resize-none"
            ></textarea>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-3 mt-5">
          <button
            type="submit"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            <Save size={16} />
            Save Stock
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

export default OpeningStockForm;