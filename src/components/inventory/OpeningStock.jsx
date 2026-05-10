import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Download,
  Filter,
  Package,
} from "lucide-react";

const OpeningStock = () => {
  const navigate = useNavigate();
  const stockData = [
    {
      id: 1,
      item: "Paracetamol 500mg",
      category: "Tablet",
      batch: "BT1023",
      qty: 120,
      rate: 12,
      amount: 1440,
      expiry: "12/2027",
    },
    {
      id: 2,
      item: "Cough Syrup",
      category: "Syrup",
      batch: "SY2201",
      qty: 45,
      rate: 85,
      amount: 3825,
      expiry: "08/2026",
    },
    {
      id: 3,
      item: "Vitamin Capsules",
      category: "Capsule",
      batch: "VC9088",
      qty: 75,
      rate: 35,
      amount: 2625,
      expiry: "03/2028",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-3 md:p-4">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-3 border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-gray-800">
              Opening Stock
            </h1>

            <p className="text-xs text-gray-500 mt-1">
              Manage and view all opening stock entries
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button className="flex items-center gap-2 bg-white border border-gray-300 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-50">
              <Filter size={14} />
              Filter
            </button>

            <button className="flex items-center gap-2 bg-white border border-gray-300 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-50">
              <Download size={14} />
              Export
            </button>

            <button
              onClick={() => navigate("/opening-stock-form")}
              className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700"
            >
              <Plus size={14} />
              Add Stock
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500">Total Items</p>

              <h2 className="text-lg font-bold mt-1">240</h2>
            </div>

            <div className="bg-blue-100 p-2 rounded-lg">
              <Package className="text-blue-600" size={18} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-200">
          <p className="text-xs text-gray-500">Total Quantity</p>

          <h2 className="text-lg font-bold mt-1">1,540</h2>
        </div>

        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-200">
          <p className="text-xs text-gray-500">Stock Value</p>

          <h2 className="text-lg font-bold mt-1">₹85,400</h2>
        </div>

        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-200">
          <p className="text-xs text-gray-500">Low Stock</p>

          <h2 className="text-lg font-bold mt-1 text-red-500">
            12
          </h2>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-4 overflow-hidden">
        {/* Search */}
        <div className="p-3 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="relative w-full md:w-72">
            <Search
              size={16}
              className="absolute left-3 top-2.5 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search stock..."
              className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-blue-200"
            />
          </div>

          <div className="flex gap-2">
            <input
              type="date"
              className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs"
            />

            <select className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs">
              <option>All Category</option>
              <option>Tablet</option>
              <option>Syrup</option>
              <option>Capsule</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs text-gray-600">
                <th className="px-3 py-2 font-semibold">#</th>

                <th className="px-3 py-2 font-semibold">
                  Item Name
                </th>

                <th className="px-3 py-2 font-semibold">
                  Category
                </th>

                <th className="px-3 py-2 font-semibold">
                  Batch No
                </th>

                <th className="px-3 py-2 font-semibold">Qty</th>

                <th className="px-3 py-2 font-semibold">Rate</th>

                <th className="px-3 py-2 font-semibold">
                  Amount
                </th>

                <th className="px-3 py-2 font-semibold">
                  Expiry
                </th>

                <th className="px-3 py-2 font-semibold">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {stockData.map((stock, index) => (
                <tr
                  key={stock.id}
                  className="border-t border-gray-100 hover:bg-gray-50 transition"
                >
                  <td className="px-3 py-2 text-xs">
                    {index + 1}
                  </td>

                  <td className="px-3 py-2">
                    <div className="font-medium text-gray-800 text-xs">
                      {stock.item}
                    </div>
                  </td>

                  <td className="px-3 py-2 text-xs text-gray-600">
                    {stock.category}
                  </td>

                  <td className="px-3 py-2 text-xs text-gray-600">
                    {stock.batch}
                  </td>

                  <td className="px-3 py-2 text-xs font-medium">
                    {stock.qty}
                  </td>

                  <td className="px-3 py-2 text-xs">
                    ₹{stock.rate}
                  </td>

                  <td className="px-3 py-2 text-xs font-semibold">
                    ₹{stock.amount}
                  </td>

                  <td className="px-3 py-2 text-xs">
                    {stock.expiry}
                  </td>

                  <td className="px-3 py-2">
                    <span className="bg-green-100 text-green-700 text-[10px] font-medium px-2 py-1 rounded-full">
                      In Stock
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-500">
            Showing 1 to 3 of 240 entries
          </p>

          <div className="flex gap-2">
            <button className="border border-gray-300 px-3 py-1 rounded-md text-xs hover:bg-gray-50">
              Previous
            </button>

            <button className="bg-blue-600 text-white px-3 py-1 rounded-md text-xs">
              1
            </button>

            <button className="border border-gray-300 px-3 py-1 rounded-md text-xs hover:bg-gray-50">
              2
            </button>

            <button className="border border-gray-300 px-3 py-1 rounded-md text-xs hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpeningStock;