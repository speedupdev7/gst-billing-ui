import React from "react";
import { useNavigate } from "react-router-dom";

import {
  Search,
  ArrowRightLeft,
  Plus,
  CheckCircle,
  Clock,
  Truck,
} from "lucide-react";

const StockTransfer = () => {
    const navigate = useNavigate();
  
  const transferData = [
    {
      id: 1,
      transferNo: "TRF-1001",
      from: "Main Store",
      to: "Branch Store",
      items: 12,
      date: "10/05/2026",
      status: "Pending",
    },
    {
      id: 2,
      transferNo: "TRF-1002",
      from: "Warehouse",
      to: "Medical Store",
      items: 8,
      date: "09/05/2026",
      status: "In Transit",
    },
    {
      id: 3,
      transferNo: "TRF-1003",
      from: "Main Store",
      to: "City Branch",
      items: 15,
      date: "08/05/2026",
      status: "Completed",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-3 md:p-4">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-3 border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-gray-800">
              Stock Transfer
            </h1>

            <p className="text-xs text-gray-500 mt-1">
              Transfer stock between stores and warehouses
            </p>
          </div>

         <button
                       onClick={() => navigate("/stock-transfer-form")}
                       className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700"
                     >
                       <Plus size={14} />
                       New Transfer
                     </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500">
                Total Transfers
              </p>

              <h2 className="text-lg font-bold mt-1">86</h2>
            </div>

            <div className="bg-blue-100 p-2 rounded-lg">
              <ArrowRightLeft
                className="text-blue-600"
                size={18}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500">
                Pending
              </p>

              <h2 className="text-lg font-bold mt-1 text-red-500">
                7
              </h2>
            </div>

            <div className="bg-red-100 p-2 rounded-lg">
              <Clock className="text-red-600" size={18} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500">
                In Transit
              </p>

              <h2 className="text-lg font-bold mt-1 text-orange-500">
                5
              </h2>
            </div>

            <div className="bg-orange-100 p-2 rounded-lg">
              <Truck
                className="text-orange-600"
                size={18}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500">
                Completed
              </p>

              <h2 className="text-lg font-bold mt-1 text-green-600">
                74
              </h2>
            </div>

            <div className="bg-green-100 p-2 rounded-lg">
              <CheckCircle
                className="text-green-600"
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
              placeholder="Search transfer..."
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
              <option>Pending</option>
              <option>In Transit</option>
              <option>Completed</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs text-gray-600">
                <th className="px-3 py-2 font-semibold">#</th>

                <th className="px-3 py-2 font-semibold">
                  Transfer No
                </th>

                <th className="px-3 py-2 font-semibold">
                  From
                </th>

                <th className="px-3 py-2 font-semibold">
                  To
                </th>

                <th className="px-3 py-2 font-semibold">
                  Items
                </th>

                <th className="px-3 py-2 font-semibold">
                  Transfer Date
                </th>

                <th className="px-3 py-2 font-semibold">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {transferData.map((transfer, index) => (
                <tr
                  key={transfer.id}
                  className="border-t border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-3 py-2 text-xs">
                    {index + 1}
                  </td>

                  <td className="px-3 py-2 text-xs font-medium">
                    {transfer.transferNo}
                  </td>

                  <td className="px-3 py-2 text-xs text-gray-700">
                    {transfer.from}
                  </td>

                  <td className="px-3 py-2 text-xs text-gray-700">
                    {transfer.to}
                  </td>

                  <td className="px-3 py-2 text-xs">
                    {transfer.items}
                  </td>

                  <td className="px-3 py-2 text-xs">
                    {transfer.date}
                  </td>

                  <td className="px-3 py-2">
                    <span
                      className={`text-[10px] font-medium px-2 py-1 rounded-full
                        ${
                          transfer.status === "Pending"
                            ? "bg-red-100 text-red-600"
                            : transfer.status === "In Transit"
                            ? "bg-orange-100 text-orange-600"
                            : "bg-green-100 text-green-600"
                        }`}
                    >
                      {transfer.status}
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
            Showing 1 to 3 of 86 entries
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

export default StockTransfer;