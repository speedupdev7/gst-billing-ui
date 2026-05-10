import React from "react";
import { useNavigate } from "react-router-dom";

import {
  Search,
  Plus,
  ShoppingCart,
  Truck,
  Clock,
  CheckCircle,
} from "lucide-react";

const StockOrder = () => {
  const navigate = useNavigate();
  const orderData = [
    {
      id: 1,
      orderNo: "ORD-1001",
      supplier: "ABC Pharma",
      items: 12,
      amount: 12500,
      orderDate: "10/05/2026",
      status: "Pending",
    },
    {
      id: 2,
      orderNo: "ORD-1002",
      supplier: "MediCare Ltd",
      items: 8,
      amount: 8450,
      orderDate: "09/05/2026",
      status: "Processing",
    },
    {
      id: 3,
      orderNo: "ORD-1003",
      supplier: "Health Plus",
      items: 15,
      amount: 18200,
      orderDate: "08/05/2026",
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
              Stock Orders
            </h1>

            <p className="text-xs text-gray-500 mt-1">
              Manage medicine and stock purchase orders
            </p>
          </div>

          <button 
            className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700 w-fit"
            onClick={() => navigate("/stock-order-form")}
          >
            <Plus size={14} />
            New Order
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500">
                Total Orders
              </p>

              <h2 className="text-lg font-bold mt-1">124</h2>
            </div>

            <div className="bg-blue-100 p-2 rounded-lg">
              <ShoppingCart
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
                14
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
                Processing
              </p>

              <h2 className="text-lg font-bold mt-1 text-orange-500">
                9
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
                101
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

      {/* Table */}
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
              placeholder="Search order..."
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
              <option>Processing</option>
              <option>Completed</option>
            </select>
          </div>
        </div>

        {/* Table Data */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs text-gray-600">
                <th className="px-3 py-2 font-semibold">#</th>

                <th className="px-3 py-2 font-semibold">
                  Order No
                </th>

                <th className="px-3 py-2 font-semibold">
                  Supplier
                </th>

                <th className="px-3 py-2 font-semibold">
                  Items
                </th>

                <th className="px-3 py-2 font-semibold">
                  Amount
                </th>

                <th className="px-3 py-2 font-semibold">
                  Order Date
                </th>

                <th className="px-3 py-2 font-semibold">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {orderData.map((order, index) => (
                <tr
                  key={order.id}
                  className="border-t border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-3 py-2 text-xs">
                    {index + 1}
                  </td>

                  <td className="px-3 py-2 text-xs font-medium">
                    {order.orderNo}
                  </td>

                  <td className="px-3 py-2 text-xs text-gray-700">
                    {order.supplier}
                  </td>

                  <td className="px-3 py-2 text-xs">
                    {order.items}
                  </td>

                  <td className="px-3 py-2 text-xs font-medium">
                    ₹{order.amount}
                  </td>

                  <td className="px-3 py-2 text-xs">
                    {order.orderDate}
                  </td>

                  <td className="px-3 py-2">
                    <span
                      className={`text-[10px] font-medium px-2 py-1 rounded-full
                        ${
                          order.status === "Pending"
                            ? "bg-red-100 text-red-600"
                            : order.status === "Processing"
                            ? "bg-orange-100 text-orange-600"
                            : "bg-green-100 text-green-600"
                        }`}
                    >
                      {order.status}
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
            Showing 1 to 3 of 124 entries
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

export default StockOrder;