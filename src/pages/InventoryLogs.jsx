import React, { useEffect, useState } from 'react';
import { ClipLoader } from 'react-spinners';

export default function InventoryLogs() {
  // Back navigation for mobile
  const handleBack = () => window.history.back();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/sales/logs')
      .then(res => res.json())
      .then(data => {
        setLogs(data);
        setLoading(false);
      });
  }, []);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchLogs = () => {
    setLoading(true);
    let url = 'http://localhost:8000/api/sales/logs';
    const params = [];
    if (startDate) params.push(`start=${startDate}`);
    if (endDate) params.push(`end=${endDate}`);
    if (params.length) url += '?' + params.join('&');
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setLogs(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-6 sm:mt-10 p-2 sm:p-6 bg-white rounded-lg shadow-md">
      {/* Back Arrow for mobile */}
      <div className="flex items-center gap-2 mb-2 lg:hidden">
        <button type="button" onClick={handleBack} className="flex items-center text-blue-600 hover:text-blue-800 focus:outline-none">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 mr-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-semibold text-base">Back</span>
        </button>
      </div>
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">Inventory Logs</h2>
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 sm:mb-6 items-center">
        <div className="w-full sm:w-auto">
          <label className="block text-xs sm:text-sm font-medium mb-1">Start Date</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border rounded px-2 py-1 w-full sm:w-auto" />
        </div>
        <div className="w-full sm:w-auto">
          <label className="block text-xs sm:text-sm font-medium mb-1">End Date</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border rounded px-2 py-1 w-full sm:w-auto" />
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded w-full sm:w-auto" onClick={fetchLogs}>Filter</button>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-40"><ClipLoader color="#2563eb" size={48} /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-[600px] w-full border text-xs sm:text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2">Date</th>
                <th className="p-2">Action</th>
                <th className="p-2">Product</th>
                <th className="p-2">Category</th>
                <th className="p-2">Quantity</th>
                <th className="p-2">Price</th>
                <th className="p-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id} className="border-t">
                  <td className="p-2 whitespace-nowrap">{new Date(log.date).toLocaleString()}</td>
                  <td className="p-2 font-semibold text-blue-600 whitespace-nowrap">{log.type === 'add' ? 'Added' : 'Deducted'}</td>
                  <td className="p-2 whitespace-nowrap">{log.name}</td>
                  <td className="p-2 whitespace-nowrap">{log.category}</td>
                  <td className="p-2 whitespace-nowrap">{log.quantity}</td>
                  <td className="p-2 whitespace-nowrap">${log.price}</td>
                  <td className="p-2 whitespace-nowrap">${log.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
