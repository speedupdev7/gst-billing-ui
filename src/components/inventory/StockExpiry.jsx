import React from "react";
import { useNavigate } from "react-router-dom";

import {
  Search,
   Plus,
  AlertTriangle,
  Calendar,
  Download,
} from "lucide-react";

const StockExpiry = () => {
    const navigate = useNavigate();
  
  const expiryData = [
    {
      id: 1,
      item: "Paracetamol 500mg",
      batch: "BT1023",
      qty: 120,
      expiry: "12/05/2026",
      daysLeft: 2,
      status: "Critical",
    },
    {
      id: 2,
      item: "Cough Syrup",
      batch: "SY2201",
      qty: 45,
      expiry: "25/05/2026",
      daysLeft: 15,
      status: "Warning",
    },
    {
      id: 3,
      item: "Vitamin Capsules",
      batch: "VC9088",
      qty: 75,
      expiry: "10/08/2026",
      daysLeft: 92,
      status: "Safe",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-3 md:p-4">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-3 border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-gray-800">
              Stock Expiry
            </h1>

            <p className="text-xs text-gray-500 mt-1">
              Track all expiring stock items
            </p>
          </div>

          <button className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700 w-fit">
            <Download size={14} />
            Export Report
          </button>

           <button
                        onClick={() => navigate("/stock-expiry-form")}
                        className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700"
                      >
                        <Plus size={14} />
                        Add Stock
                      </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-200">
          <p className="text-xs text-gray-500">
            Total Expiry Items
          </p>

          <h2 className="text-lg font-bold mt-1">34</h2>
        </div>

        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-200">
          <p className="text-xs text-gray-500">
            Critical Expiry
          </p>

          <h2 className="text-lg font-bold mt-1 text-red-500">
            5
          </h2>
        </div>

        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-200">
          <p className="text-xs text-gray-500">
            Expiring This Month
          </p>

          <h2 className="text-lg font-bold mt-1 text-orange-500">
            12
          </h2>
        </div>

        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500">
                Safe Stock
              </p>

              <h2 className="text-lg font-bold mt-1 text-green-600">
                17
              </h2>
            </div>

            <div className="bg-red-100 p-2 rounded-lg">
              <AlertTriangle
                className="text-red-600"
                size={18}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-4 overflow-hidden">
        {/* Search & Filter */}
        <div className="p-3 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="relative w-full md:w-72">
            <Search
              size={16}
              className="absolute left-3 top-2.5 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search medicine..."
              className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-blue-200"
            />
          </div>

          <div className="flex gap-2">
            <input
              type="date"
              className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs"
            />

            <select className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs">
              <option>All Status</option>
              <option>Critical</option>
              <option>Warning</option>
              <option>Safe</option>
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
                  Batch No
                </th>

                <th className="px-3 py-2 font-semibold">Qty</th>

                <th className="px-3 py-2 font-semibold">
                  Expiry Date
                </th>

                <th className="px-3 py-2 font-semibold">
                  Days Left
                </th>

                <th className="px-3 py-2 font-semibold">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {expiryData.map((stock, index) => (
                <tr
                  key={stock.id}
                  className="border-t border-gray-100 hover:bg-gray-50"
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
                    {stock.batch}
                  </td>

                  <td className="px-3 py-2 text-xs">
                    {stock.qty}
                  </td>

                  <td className="px-3 py-2 text-xs">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      {stock.expiry}
                    </div>
                  </td>

                  <td className="px-3 py-2 text-xs font-medium">
                    {stock.daysLeft} Days
                  </td>

                  <td className="px-3 py-2">
                    <span
                      className={`text-[10px] font-medium px-2 py-1 rounded-full
                      ${
                        stock.status === "Critical"
                          ? "bg-red-100 text-red-600"
                          : stock.status === "Warning"
                          ? "bg-orange-100 text-orange-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {stock.status}
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
            Showing 1 to 3 of 34 entries
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

export default StockExpiry;