import React, { useEffect, useState } from 'react';
import { CSVLink } from 'react-csv';
import { FaBox, FaDollarSign, FaChartLine, FaExclamationTriangle } from 'react-icons/fa';
import Notification from '../components/Notification';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement
} from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, ArcElement);

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'info' });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [drillProduct, setDrillProduct] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const shoesRes = await fetch('http://localhost:8000/api/shoes');
      const bagsRes = await fetch('http://localhost:8000/api/bags');
      const dressesRes = await fetch('http://localhost:8000/api/dresses');
      let logsUrl = 'http://localhost:8000/api/sales/logs';
      if (startDate || endDate) {
        const params = [];
        if (startDate) params.push(`start=${startDate}`);
        if (endDate) params.push(`end=${endDate}`);
        logsUrl += '?' + params.join('&');
      }
      const logsRes = await fetch(logsUrl);
      const shoes = shoesRes.ok ? await shoesRes.json() : [];
      const bags = bagsRes.ok ? await bagsRes.json() : [];
      const dresses = dressesRes.ok ? await dressesRes.json() : [];
      const logs = logsRes.ok ? await logsRes.json() : [];
      setProducts([...shoes, ...bags, ...dresses]);
      setLogs(logs);
      setFilteredLogs(logs);
      setLoading(false);
      // Low stock notification
      const lowStock = [...shoes, ...bags, ...dresses].filter(p => p.stock <= 5);
      if (lowStock.length > 0) {
        setNotification({ show: true, message: `Low stock: ${lowStock.map(p => p.name + ' (' + p.stock + ')').join(', ')}`, type: 'warning' });
      }
    }
    fetchData();
  }, [startDate, endDate]);

  // Back navigation for mobile
  const handleBack = () => window.history.back();
  // Chart Data Preparation from real data
  // Sales Trends (group logs by date)
  const salesByDate = {};
  filteredLogs.forEach(log => {
    const date = new Date(log.date).toISOString().slice(0, 10);
    if (!salesByDate[date]) salesByDate[date] = { sales: 0, revenue: 0 };
    if (log.type === 'add') {
      salesByDate[date].sales += log.quantity;
      salesByDate[date].revenue += log.total;
    }
  });
  const salesData = Object.keys(salesByDate).map(date => ({ date, sales: salesByDate[date].sales, revenue: salesByDate[date].revenue }));

  // Moving averages (7-day)
  function movingAverage(data, key, windowSize = 7) {
    return data.map((d, i) => {
      const start = Math.max(0, i - windowSize + 1);
      const window = data.slice(start, i + 1);
      const avg = window.reduce((sum, w) => sum + w[key], 0) / window.length;
      return avg;
    });
  }
  const salesMA = movingAverage(salesData, 'sales');
  const revenueMA = movingAverage(salesData, 'revenue');

  // Growth rates
  function growthRate(data, key) {
    if (data.length < 2) return 0;
    const prev = data[data.length - 2][key];
    const curr = data[data.length - 1][key];
    return prev ? (((curr - prev) / prev) * 100).toFixed(2) : 0;
  }
  const salesGrowth = growthRate(salesData, 'sales');
  const revenueGrowth = growthRate(salesData, 'revenue');

  // Inventory turnover rate (total sales / avg inventory)
  const totalSales = filteredLogs.filter(l => l.type === 'add').reduce((sum, l) => sum + l.quantity, 0);
  const avgInventory = products.length ? (products.reduce((sum, p) => sum + p.stock, 0) / products.length) : 1;
  const turnoverRate = avgInventory ? (totalSales / avgInventory).toFixed(2) : 0;

  // Sell-through rate (total sales / (total sales + current stock))
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const sellThroughRate = (totalSales / (totalSales + totalStock) * 100).toFixed(2);

  // Stock Data
  const stockData = products.map(p => ({ name: p.name, stock: p.stock, category: p.category || (p.gender ? 'Shoes' : p.size ? 'Dresses' : 'Bags') }));

  // Top Products (by total sales in logs)
  const productSales = {};
  filteredLogs.forEach(log => {
    if (!productSales[log.name]) productSales[log.name] = 0;
    productSales[log.name] += log.quantity;
  });
  const topProducts = Object.entries(productSales)
    .map(([name, sales]) => ({ name, sales }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5);

  // Category Distribution
  const categoryCount = {};
  products.forEach(p => {
    const cat = p.category || (p.gender ? 'Shoes' : p.size ? 'Dresses' : 'Bags');
    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
  });
  const categoryDistribution = Object.entries(categoryCount).map(([category, count]) => ({ category, count }));

  // Low Stock
  const lowStockProducts = stockData.filter(d => d.stock <= 5);

  // Advanced Analytics
  // Best Selling Day
  const bestDay = salesData.reduce((max, d) => d.sales > max.sales ? d : max, { sales: 0 });
  // Average Sales/Revenue
  const avgSales = salesData.length ? (salesData.reduce((sum, d) => sum + d.sales, 0) / salesData.length).toFixed(2) : 0;
  const avgRevenue = salesData.length ? (salesData.reduce((sum, d) => sum + d.revenue, 0) / salesData.length).toFixed(2) : 0;
  // Most/Least Stocked Product
  const mostStocked = stockData.reduce((max, p) => p.stock > max.stock ? p : max, { stock: -Infinity });
  const leastStocked = stockData.reduce((min, p) => p.stock < min.stock ? p : min, { stock: Infinity });
  // Sales by Category
  const salesByCategory = {};
  filteredLogs.forEach(log => {
    const cat = log.category;
    if (!salesByCategory[cat]) salesByCategory[cat] = 0;
    if (log.type === 'add') salesByCategory[cat] += log.quantity;
  });
  const salesByCategoryData = {
    labels: Object.keys(salesByCategory),
    datasets: [
      {
        label: 'Sales by Category',
        data: Object.values(salesByCategory),
        backgroundColor: [
          'rgba(59,130,246,0.6)',
          'rgba(234,179,8,0.6)',
          'rgba(16,185,129,0.6)'
        ],
        borderColor: [
          'rgba(59,130,246,1)',
          'rgba(234,179,8,1)',
          'rgba(16,185,129,1)'
        ],
        borderWidth: 2,
      },
    ],
  };

  const salesChartData = {
    labels: salesData.map(d => d.date),
    datasets: [
      {
        label: 'Sales',
        data: salesData.map(d => d.sales),
        backgroundColor: 'rgba(37,99,235,0.6)',
        borderColor: 'rgba(37,99,235,1)',
        borderWidth: 2,
      },
      {
        label: 'Sales (7-day MA)',
        data: salesMA,
        backgroundColor: 'rgba(59,130,246,0.3)',
        borderColor: 'rgba(59,130,246,0.7)',
        borderWidth: 2,
        type: 'line',
        fill: false,
      },
    ],
  };
  const revenueChartData = {
    labels: salesData.map(d => d.date),
    datasets: [
      {
        label: 'Revenue',
        data: salesData.map(d => d.revenue),
        backgroundColor: 'rgba(16,185,129,0.6)',
        borderColor: 'rgba(16,185,129,1)',
        borderWidth: 2,
      },
      {
        label: 'Revenue (7-day MA)',
        data: revenueMA,
        backgroundColor: 'rgba(234,179,8,0.3)',
        borderColor: 'rgba(234,179,8,0.7)',
        borderWidth: 2,
        type: 'line',
        fill: false,
      },
    ],
  };
  const categoryChartData = {
    labels: categoryDistribution.map(d => d.category),
    datasets: [
      {
        label: 'Category Distribution',
        data: categoryDistribution.map(d => d.count),
        backgroundColor: [
          'rgba(59,130,246,0.6)',
          'rgba(234,179,8,0.6)',
          'rgba(16,185,129,0.6)'
        ],
        borderColor: [
          'rgba(59,130,246,1)',
          'rgba(234,179,8,1)',
          'rgba(16,185,129,1)'
        ],
        borderWidth: 2,
      },
    ],
  };
  const lowStockChartData = {
    labels: lowStockProducts.map(d => d.name),
    datasets: [
      {
        label: 'Low Stock',
        data: lowStockProducts.map(d => d.stock),
        backgroundColor: 'rgba(239,68,68,0.6)',
        borderColor: 'rgba(239,68,68,1)',
        borderWidth: 2,
      },
    ],
  };
  const stockChartData = {
    labels: stockData.map(d => d.name),
    datasets: [
      {
        label: 'Stock',
        data: stockData.map(d => d.stock),
        backgroundColor: [
          'rgba(16,185,129,0.6)',
          'rgba(59,130,246,0.6)',
          'rgba(234,179,8,0.6)'
        ],
        borderColor: [
          'rgba(16,185,129,1)',
          'rgba(59,130,246,1)',
          'rgba(234,179,8,1)'
        ],
        borderWidth: 2,
      },
    ],
  };
  const topProductsChartData = {
    labels: topProducts.map(d => d.name),
    datasets: [
      {
        label: 'Top Products',
        data: topProducts.map(d => d.sales),
        backgroundColor: [
          'rgba(59,130,246,0.6)',
          'rgba(234,179,8,0.6)',
          'rgba(16,185,129,0.6)'
        ],
        borderColor: [
          'rgba(59,130,246,1)',
          'rgba(234,179,8,1)',
          'rgba(16,185,129,1)'
        ],
        borderWidth: 2,
      },
    ],
  };

  return (
    <>
      {notification.show && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(n => ({ ...n, show: false }))}
        />
      )}
      <div className="space-y-6">
        {/* Back Arrow for mobile */}
        <div className="flex items-center gap-2 mb-2 lg:hidden">
          <button type="button" onClick={handleBack} className="flex items-center text-blue-600 hover:text-blue-800 focus:outline-none">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-semibold text-base">Back</span>
          </button>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>
        {/* Analytics & Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Time Range Filters & Export */}
          <div className="bg-white rounded-lg shadow p-6 md:col-span-2 mb-4 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex gap-2 items-center">
              <label className="font-semibold">Start Date:</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border rounded px-2 py-1" />
              <label className="font-semibold ml-4">End Date:</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border rounded px-2 py-1" />
              <button className="ml-4 px-3 py-1 bg-blue-600 text-white rounded" onClick={() => { setStartDate(''); setEndDate(''); }}>Reset</button>
            </div>
            <div className="flex gap-2 items-center">
              <CSVLink data={filteredLogs} filename={`sales-logs.csv`} className="px-3 py-1 bg-green-600 text-white rounded">Export CSV</CSVLink>
            </div>
          </div>
          {/* Summary Section */}
          <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
            <h2 className="text-lg font-bold mb-4">Key Metrics</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-700">{bestDay.date || '-'}</div>
                <div className="text-sm text-gray-600">Best Selling Day</div>
                <div className="text-xs text-blue-500 mt-2">Sales Growth: {salesGrowth}%</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-700">{avgSales}</div>
                <div className="text-sm text-gray-600">Avg Sales/Day</div>
                <div className="text-xs text-green-500 mt-2">Turnover Rate: {turnoverRate}</div>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-700">${avgRevenue}</div>
                <div className="text-sm text-gray-600">Avg Revenue/Day</div>
                <div className="text-xs text-yellow-500 mt-2">Revenue Growth: {revenueGrowth}%</div>
              </div>
              <div className="p-4 bg-red-50 rounded-lg text-center">
                <div className="text-lg font-bold text-red-700">{mostStocked.name || '-'}</div>
                <div className="text-xs text-gray-600">Most Stocked: {mostStocked.stock || '-'}</div>
                <div className="text-lg font-bold text-red-700 mt-2">{leastStocked.name || '-'}</div>
                <div className="text-xs text-gray-600">Least Stocked: {leastStocked.stock || '-'}</div>
                <div className="text-xs text-red-500 mt-2">Sell-Through Rate: {sellThroughRate}%</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold mb-4">Sales Trends</h2>
            <Line
              data={salesChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: true },
                  tooltip: { enabled: true }
                },
                onClick: (evt, elements) => {
                  if (elements.length > 0) {
                    const idx = elements[0].index;
                    const date = salesChartData.labels[idx];
                    setDrillProduct(date);
                  }
                }
              }}
            />
            {drillProduct && (
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <h3 className="font-bold mb-2">Details for {drillProduct}</h3>
                <ul className="text-sm">
                  {filteredLogs.filter(l => new Date(l.date).toISOString().slice(0, 10) === drillProduct).map((l, i) => (
                    <li key={i}>{l.name} ({l.category}) - Qty: {l.quantity}, Revenue: ${l.total}, Type: {l.type}</li>
                  ))}
                </ul>
                <button className="mt-2 px-3 py-1 bg-red-600 text-white rounded" onClick={() => setDrillProduct(null)}>Close</button>
              </div>
            )}
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold mb-4">Revenue Trends</h2>
            <Line data={revenueChartData} options={{ responsive: true, plugins: { legend: { display: true } } }} />
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold mb-4">Category Distribution</h2>
            <Pie data={categoryChartData} options={{ responsive: true, plugins: { legend: { display: true } } }} />
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold mb-4">Sales by Category</h2>
            <Bar data={salesByCategoryData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold mb-4">Low Stock Breakdown</h2>
            <Bar data={lowStockChartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
          </div>
          <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
            <h2 className="text-lg font-bold mb-4">Top Products</h2>
            <Pie
              data={topProductsChartData}
              options={{
                responsive: true,
                plugins: { legend: { display: true }, tooltip: { enabled: true } },
                onClick: (evt, elements) => {
                  if (elements.length > 0) {
                    const idx = elements[0].index;
                    const prod = topProductsChartData.labels[idx];
                    setDrillProduct(prod);
                  }
                }
              }}
            />
            {drillProduct && (
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <h3 className="font-bold mb-2">Details for {drillProduct}</h3>
                <ul className="text-sm">
                  {filteredLogs.filter(l => l.name === drillProduct).map((l, i) => (
                    <li key={i}>{l.date.slice(0,10)} - Qty: {l.quantity}, Revenue: ${l.total}, Type: {l.type}</li>
                  ))}
                </ul>
                <button className="mt-2 px-3 py-1 bg-red-600 text-white rounded" onClick={() => setDrillProduct(null)}>Close</button>
              </div>
            )}
          </div>
        </div>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* ...existing code... */}
        </div>

        {/* Recent Products */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* ...existing code... */}
        </div>
      </div>
    </>
  );
}
