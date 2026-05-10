import React, { useState } from "react";
import {
  ShoppingCart,
  Save,
  RotateCcw,
  Plus,
  Trash2,
} from "lucide-react";

const StockOrderForm = () => {
  const [items, setItems] = useState([
    {
      itemName: "",
      quantity: "",
      rate: "",
      amount: "",
    },
  ]);

  const [formData, setFormData] = useState({
    supplier: "",
    orderDate: "",
    status: "",
    remarks: "",
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

    // Auto Amount Calculate
    if (
      e.target.name === "quantity" ||
      e.target.name === "rate"
    ) {
      const qty =
        e.target.name === "quantity"
          ? e.target.value
          : values[index].quantity;

      const rate =
        e.target.name === "rate"
          ? e.target.value
          : values[index].rate;

      values[index].amount = qty * rate;
    }

    setItems(values);
  };

  // Add Item Row
  const addItem = () => {
    setItems([
      ...items,
      {
        itemName: "",
        quantity: "",
        rate: "",
        amount: "",
      },
    ]);
  };

  // Remove Item Row
  const removeItem = (index) => {
    const values = [...items];

    values.splice(index, 1);

    setItems(values);
  };

  // Total Amount
  const totalAmount = items.reduce(
    (acc, item) => acc + Number(item.amount || 0),
    0
  );

  // Submit
  const handleSubmit = (e) => {
    e.preventDefault();

    const finalData = {
      ...formData,
      items,
      totalAmount,
    };

    console.log(finalData);

    alert("Stock Order Saved Successfully");
  };

  // Reset
  const handleReset = () => {
    setFormData({
      supplier: "",
      orderDate: "",
      status: "",
      remarks: "",
    });

    setItems([
      {
        itemName: "",
        quantity: "",
        rate: "",
        amount: "",
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-3 md:p-4">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
        <div className="flex items-center gap-2">
          <div className="bg-blue-100 p-2 rounded-lg">
            <ShoppingCart
              className="text-blue-600"
              size={18}
            />
          </div>

          <div>
            <h1 className="text-lg font-bold text-gray-800">
              Stock Order Form
            </h1>

            <p className="text-xs text-gray-500 mt-1">
              Create and manage medicine stock orders
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              placeholder="Enter supplier name"
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-200"
            />
          </div>

          {/* Order Date */}
          <div>
            <label className="text-xs font-medium text-gray-700">
              Order Date
            </label>

            <input
              type="date"
              name="orderDate"
              value={formData.orderDate}
              onChange={handleChange}
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-200"
            />
          </div>

          {/* Status */}
          <div>
            <label className="text-xs font-medium text-gray-700">
              Order Status
            </label>

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-200"
            >
              <option value="">Select Status</option>
              <option>Pending</option>
              <option>Processing</option>
              <option>Completed</option>
            </select>
          </div>
        </div>

        {/* Items Table */}
        <div className="mt-5 overflow-x-auto">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">
              Order Items
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

                <th className="px-3 py-2">Qty</th>

                <th className="px-3 py-2">Rate</th>

                <th className="px-3 py-2">Amount</th>

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
                      placeholder="Enter item"
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
                      placeholder="Qty"
                      className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-200"
                    />
                  </td>

                  {/* Rate */}
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      name="rate"
                      value={item.rate}
                      onChange={(e) =>
                        handleItemChange(index, e)
                      }
                      placeholder="Rate"
                      className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-200"
                    />
                  </td>

                  {/* Amount */}
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={item.amount}
                      readOnly
                      className="w-full bg-gray-100 border border-gray-300 rounded-lg px-2 py-1.5 text-xs"
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

        {/* Total */}
        <div className="flex justify-end mt-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
            <h2 className="text-sm font-semibold text-gray-700">
              Total Amount :
              <span className="text-blue-600 ml-2">
                ₹{totalAmount}
              </span>
            </h2>
          </div>
        </div>

        {/* Remarks */}
        <div className="mt-4">
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

        {/* Buttons */}
        <div className="flex flex-wrap gap-3 mt-5">
          <button
            type="submit"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            <Save size={16} />
            Save Order
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

export default StockOrderForm;