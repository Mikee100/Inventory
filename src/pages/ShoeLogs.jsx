import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function ShoeLogs() {
  const { id } = useParams();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://https://inventory-backend-gpon.onrender.com/api/sales/logs?productId=${id}`)
      .then(res => res.json())
      .then(data => {
        setLogs(data);
        setLoading(false);
      });
  }, [id]);

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Shoe Logs</h2>
      {loading ? (
        <div>Loading...</div>
      ) : logs.length === 0 ? (
        <div className="text-center text-gray-500">No logs found for this shoe.</div>
      ) : (
        <table className="min-w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">Date</th>
              <th className="p-2">Action</th>
              <th className="p-2">Quantity</th>
              <th className="p-2">Price</th>
              <th className="p-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log._id} className="border-t">
                <td className="p-2">{new Date(log.date).toLocaleString()}</td>
                <td className="p-2 font-semibold text-blue-600">{log.type === 'add' ? 'Added' : 'Deducted'}</td>
                <td className="p-2">{log.quantity}</td>
                <td className="p-2">${log.price}</td>
                <td className="p-2">${log.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
