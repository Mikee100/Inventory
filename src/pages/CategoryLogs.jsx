import { useState, useEffect } from "react";
import { ClipLoader } from 'react-spinners';
import { useParams, Link, useNavigate } from "react-router-dom";

const categoryMap = {
  shoes: "Shoes",
  bags: "Bags",
  dresses: "Dresses"
};

function CategoryLogs() {
  const { category, id } = useParams();
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // "all", "sales", "restocks"

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`https://inventory-backend-gpon.onrender.com/api/${category}/${id}`);
        if (!res.ok) throw new Error("Product not found");
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        setError(err.message);
      }
    }
    
    async function fetchLogs() {
      try {
        const res = await fetch(`https://inventory-backend-gpon.onrender.com/api/sales/logs?productId=${id}`);
        if (!res.ok) throw new Error("Logs not found");
        const data = await res.json();
        setLogs(data);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    }
    
    if (category && id) {
      fetchProduct();
      fetchLogs();
    }
  }, [category, id]);

  // Filter logs based on action type
  const filteredLogs = logs.filter(log => {
    if (filter === "all") return true;
    if (filter === "sales") return log.action === "sale";
    if (filter === "restocks") return log.action === "restock";
    return true;
  });

  // Calculate totals
  const totalSales = logs.filter(log => log.action === "sale").reduce((sum, log) => sum + (log.revenue || 0), 0);
  const totalRestocks = logs.filter(log => log.action === "restock").reduce((sum, log) => sum + log.quantity, 0);
  const totalItemsSold = logs.filter(log => log.action === "sale").reduce((sum, log) => sum + log.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ClipLoader color="#4F46E5" size={60} />
          <p className="mt-4 text-gray-600">Loading product logs...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-sm max-w-md w-full text-center">
          <div className="text-red-500 bg-red-50 p-3 rounded-full inline-flex mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-sm max-w-md w-full text-center">
          <div className="text-gray-500 bg-gray-50 p-3 rounded-full inline-flex mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Product Not Found</h3>
          <p className="text-gray-600 mb-6">The requested product could not be found.</p>
          <button 
            onClick={() => navigate(-1)} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors p-2 rounded-lg hover:bg-blue-50 mr-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-semibold ml-1 hidden sm:block">Back</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Inventory Logs</h1>
        </div>

        {/* Product Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
          <div className="flex flex-col md:flex-row gap-6">
            {product.image_url && (
              <div className="flex-shrink-0">
                <img 
                  src={product.image_url} 
                  alt={product.name} 
                  className="h-48 w-48 object-cover rounded-xl border-2 border-gray-100 shadow-sm" 
                />
              </div>
            )}
            
            <div className="flex-grow">
              <div className="flex flex-wrap items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{product.name}</h2>
                  <p className="text-sm text-gray-500 capitalize">{categoryMap[category]} • {product.color}</p>
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {product.stock} in stock
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="font-medium text-gray-900">${product.price}</p>
                </div>
                
                {product.size && (
                  <div>
                    <p className="text-sm text-gray-500">Size</p>
                    <p className="font-medium text-gray-900">{product.size}</p>
                  </div>
                )}
                
                {product.brand && (
                  <div>
                    <p className="text-sm text-gray-500">Brand</p>
                    <p className="font-medium text-gray-900">{product.brand}</p>
                  </div>
                )}
                
                {product.gender && (
                  <div>
                    <p className="text-sm text-gray-500">Gender</p>
                    <p className="font-medium text-gray-900 capitalize">{product.gender}</p>
                  </div>
                )}
              </div>
              
              {product.description && (
                <div>
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="text-gray-700">{product.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
            <div className="flex items-center">
              <div className="rounded-lg bg-green-100 p-3 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-xl font-bold text-gray-900">${totalSales.toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
            <div className="flex items-center">
              <div className="rounded-lg bg-blue-100 p-3 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Items Sold</p>
                <p className="text-xl font-bold text-gray-900">{totalItemsSold}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
            <div className="flex items-center">
              <div className="rounded-lg bg-purple-100 p-3 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Items Restocked</p>
                <p className="text-xl font-bold text-gray-900">{totalRestocks}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Logs Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Activity Logs</h3>
              
              <div className="flex mt-4 md:mt-0">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-3 py-1.5 text-sm font-medium rounded-l-lg ${filter === "all" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter("sales")}
                  className={`px-3 py-1.5 text-sm font-medium border-l border-white ${filter === "sales" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                >
                  Sales
                </button>
                <button
                  onClick={() => setFilter("restocks")}
                  className={`px-3 py-1.5 text-sm font-medium rounded-r-lg border-l border-white ${filter === "restocks" ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                >
                  Restocks
                </button>
              </div>
            </div>
          </div>
          
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-700 mb-2">No logs found</h3>
              <p className="text-gray-500">No activity logs match your current filter</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {new Date(log.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          log.action === 'sale' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {log.action === 'sale' ? 'Sale' : 'Restock'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{log.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {log.revenue ? `$${log.revenue.toFixed(2)}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CategoryLogs;