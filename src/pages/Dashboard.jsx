import React, { useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";
import Notification from "../components/Notification";


const API_URL = import.meta.env.VITE_API_URL;

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "info",
  });

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [statsRes, inventoryRes] = await Promise.all([
          fetch(`${API_URL}/api/dashboard/stats`),
          fetch(`${API_URL}/api/dashboard/inventory-status`),
        ]);

        const [stats, inventory] = await Promise.all([
          statsRes.json(),
          inventoryRes.json(),
        ]);

        setStats(stats);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setNotification({
          show: true,
          message: "Failed to load dashboard data",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <ClipLoader color="#4F46E5" size={50} />
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
    
  if (!stats)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-red-50 rounded-lg max-w-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-red-800 mb-2">Failed to load dashboard</h3>
          <p className="text-red-600">Please check your connection and try again.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );

  const {
    summary,
    salesByCategory,
    salesTrend,
    lowStockItems,
    topSelling,
    stockValueByCategory,
  } = stats;

  // Color palette for consistent styling
  const colorMap = {
    blue: { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200", darkBg: "bg-blue-500" },
    green: { bg: "bg-green-100", text: "text-green-800", border: "border-green-200", darkBg: "bg-green-500" },
    purple: { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-200", darkBg: "bg-purple-500" },
    yellow: { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-200", darkBg: "bg-yellow-500" },
    pink: { bg: "bg-pink-100", text: "text-pink-800", border: "border-pink-200", darkBg: "bg-pink-500" },
    indigo: { bg: "bg-indigo-100", text: "text-indigo-800", border: "border-indigo-200", darkBg: "bg-indigo-500" },
    orange: { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-200", darkBg: "bg-orange-500" },
  };

  const statColors = [
    colorMap.blue,
    colorMap.green,
    colorMap.purple,
    colorMap.yellow,
    colorMap.pink,
    colorMap.indigo
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Notification */}
      {notification.show && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ ...notification, show: false })}
        />
      )}

      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Welcome to your inventory management dashboard</p>
        </div>

        {/* Summary Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {[
            { title: "Total Products", value: summary.totalProducts, icon: "📦" },
            { title: "Total Stock", value: summary.totalStock, icon: "📊" },
            { title: "Inventory Value", value: `$${summary.totalValue}`, icon: "💰" },
            { title: "Total Sales", value: summary.totalSales, icon: "🛒" },
            { title: "Total Revenue", value: `$${summary.totalRevenue}`, icon: "💹" },
            { title: "Total Restocked", value: summary.totalRestocked, icon: "🔄" },
          ].map((stat, index) => (
            <div 
              key={index} 
              className={`rounded-xl shadow-sm p-5 ${statColors[index].bg} ${statColors[index].border} border`}
            >
              <div className="flex items-center">
                <div className="text-2xl mr-3">{stat.icon}</div>
                <div>
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm font-medium text-gray-600">{stat.title}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sales by Category Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg text-gray-800">Sales by Category</h3>
              <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded-md text-sm">Last 30 days</span>
            </div>
            <div className="space-y-4">
              {Object.entries(salesByCategory).map(([cat, qty]) => (
                <div key={cat} className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">{cat}</span>
                  <span className="font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full text-sm">
                    {qty} units
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Stock Value by Category Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg text-gray-800">Stock Value by Category</h3>
              <span className="text-green-600 bg-green-50 px-2 py-1 rounded-md text-sm">Current</span>
            </div>
            <div className="space-y-4">
              {Object.entries(stockValueByCategory).map(([cat, value]) => (
                <div key={cat} className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">{cat}</span>
                  <span className="font-semibold text-green-700 bg-green-50 px-3 py-1 rounded-full text-sm">
                    ${value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Low Stock Items Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg text-gray-800">Low Stock Alert</h3>
              <span className="text-red-600 bg-red-50 px-2 py-1 rounded-md text-sm">
                {lowStockItems.length} items
              </span>
            </div>
            <div className="space-y-4">
              {lowStockItems.map((item) => (
                <div key={item.name + item.category} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-800">{item.name}</div>
                    <div className="text-sm text-gray-600">{item.category}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-red-600">Stock: {item.stock}</div>
                    <div className="text-sm text-gray-600">Price: ${item.price}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Selling Products Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg text-gray-800">Top Selling Products</h3>
              <span className="text-orange-600 bg-orange-50 px-2 py-1 rounded-md text-sm">Best performers</span>
            </div>
            <div className="space-y-4">
              {topSelling.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-orange-600 bg-orange-100 h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                      {index + 1}
                    </span>
                    <div>
                      <div className="font-medium text-gray-800">{item.name}</div>
                      <div className="text-sm text-gray-600">Sold: {item.quantity}</div>
                    </div>
                  </div>
                  <div className="font-semibold text-green-600">${item.revenue}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sales Trend Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-lg text-gray-800">Sales Trend (Last 7 Days)</h3>
            <span className="text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md text-sm">Daily</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
            {salesTrend.map((day) => (
              <div key={day.date} className="bg-indigo-50 p-3 rounded-lg text-center">
                <div className="text-xs text-indigo-600 font-medium mb-1">{day.date}</div>
                <div className="text-sm font-bold text-indigo-800 mb-1">{day.sales} sales</div>
                <div className="text-xs text-indigo-600">${day.revenue}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}