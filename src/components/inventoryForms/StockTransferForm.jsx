import React, { useState } from "react";
import {
  ArrowRightLeft,
  Save,
  RotateCcw,
  Plus,
  Trash2,
} from "lucide-react";

const StockTransferForm = () => {
  const [items, setItems] = useState([
    {
      itemName: "",
      quantity: "",
      remarks: "",
    },
  ]);

  const [formData, setFormData] = useState({
    transferNo: "",
    fromStore: "",
    toStore: "",
    transferDate: "",
    status: "",
    notes: "",
  });

  // Handle Top Form
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle Item Change
  const handleItemChange = (index, e) => {
    const values = [...items];

    values[index][e.target.name] = e.target.value;

    setItems(values);
  };

  // Add Row
  const addItem = () => {
    setItems([
      ...items,
      {
        itemName: "",
        quantity: "",
        remarks: "",
      },
    ]);
  };

  // Remove Row
  const removeItem = (index) => {
    const values = [...items];

    values.splice(index, 1);

    setItems(values);
  };

  // Submit
  const handleSubmit = (e) => {
    e.preventDefault();

    const finalData = {
      ...formData,
      items,
    };

    console.log(finalData);

    alert("Stock Transfer Saved Successfully");
  };

  // Reset
  const handleReset = () => {
    setFormData({
      transferNo: "",
      fromStore: "",
      toStore: "",
      transferDate: "",
      status: "",
      notes: "",
    });

    setItems([
      {
        itemName: "",
        quantity: "",
        remarks: "",
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-3 md:p-4">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
        <div className="flex items-center gap-2">
          <div className="bg-blue-100 p-2 rounded-lg">
            <ArrowRightLeft
              className="text-blue-600"
              size={18}
            />
          </div>

          <div>
            <h1 className="text-lg font-bold text-gray-800">
              Stock Transfer Form
            </h1>

            <p className="text-xs text-gray-500 mt-1">
              Transfer stock between stores and warehouses
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm border border-gray-200 mt-4 p-4"
      >
        {/* Top Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Transfer No */}
          <div>
            <label className="text-xs font-medium text-gray-700">
              Transfer No
            </label>

            <input
              type="text"
              name="transferNo"
              value={formData.transferNo}
              onChange={handleChange}
              placeholder="Enter transfer number"
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-200"
            />
          </div>

          {/* From Store */}
          <div>
            <label className="text-xs font-medium text-gray-700">
              From Store
            </label>

            <select
              name="fromStore"
              value={formData.fromStore}
              onChange={handleChange}
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-200"
            >
              <option value="">Select Store</option>
              <option>Main Store</option>
              <option>Warehouse</option>
              <option>Branch Store</option>
            </select>
          </div>

          {/* To Store */}
          <div>
            <label className="text-xs font-medium text-gray-700">
              To Store
            </label>

            <select
              name="toStore"
              value={formData.toStore}
              onChange={handleChange}
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-200"
            >
              <option value="">Select Store</option>
              <option>Main Store</option>
              <option>Warehouse</option>
              <option>Branch Store</option>
            </select>
          </div>

          {/* Transfer Date */}
          <div>
            <label className="text-xs font-medium text-gray-700">
              Transfer Date
            </label>

            <input
              type="date"
              name="transferDate"
              value={formData.transferDate}
              onChange={handleChange}
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-200"
            />
          </div>

          {/* Status */}
          <div>
            <label className="text-xs font-medium text-gray-700">
              Transfer Status
            </label>

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-200"
            >
              <option value="">Select Status</option>
              <option>Pending</option>
              <option>In Transit</option>
              <option>Completed</option>
            </select>
          </div>
        </div>

        {/* Items Table */}
        <div className="mt-5 overflow-x-auto">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">
              Transfer Items
            </h2>

            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-blue-700"
            >
              <Plus size={14} />
              Add Item
            </button>
          </div>

          <table className="w-full min-w-[750px] border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs text-gray-600">
                <th className="px-3 py-2">Item Name</th>

                <th className="px-3 py-2">Quantity</th>

                <th className="px-3 py-2">Remarks</th>

                <th className="px-3 py-2 text-center">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {items.map((item, index) => (
                <tr
                  key={index}
                  className="border-t border-gray-100"
                >
                  {/* Item Name */}
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      name="itemName"
                      value={item.itemName}
                      onChange={(e) =>
                        handleItemChange(index, e)
                      }
                      placeholder="Enter item name"
                      className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-200"
                    />
                  </td>

                  {/* Quantity */}
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      name="quantity"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(index, e)
                      }
                      placeholder="Enter quantity"
                      className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-200"
                    />
                  </td>

                  {/* Remarks */}
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      name="remarks"
                      value={item.remarks}
                      onChange={(e) =>
                        handleItemChange(index, e)
                      }
                      placeholder="Remarks"
                      className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-200"
                    />
                  </td>

                  {/* Delete */}
                  <td className="px-3 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Notes */}
        <div className="mt-4">
          <label className="text-xs font-medium text-gray-700">
            Notes
          </label>

          <textarea
            rows="3"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Enter notes..."
            className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-200 resize-none"
          ></textarea>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-3 mt-5">
          <button
            type="submit"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            <Save size={16} />
            Save Transfer
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

export default StockTransferForm;