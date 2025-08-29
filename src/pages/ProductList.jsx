import React, { useState, useEffect } from 'react';
import Notification from '../components/Notification';
import Modal from 'react-modal';
import { ClipLoader } from 'react-spinners';
import { FaTrash } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL;

export default function ProductList() {
  // Back navigation for mobile
  const handleBack = () => window.history.back();
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'info' });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [editProduct, setEditProduct] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      const endpoints = [
        { url: `${API_URL}/api/shoes?page=${page}&limit=${limit}`, category: 'Shoes' },
        { url: `${API_URL}/api/bags?page=${page}&limit=${limit}`, category: 'Bags' },
        { url: `${API_URL}/api/dresses?page=${page}&limit=${limit}`, category: 'Dresses' },
      ];
      let all = [];
      let total = 0;
      let maxPages = 1;
      for (const ep of endpoints) {
        const res = await fetch(ep.url);
        if (res.ok) {
          const result = await res.json();
          all = all.concat(result.data.map(item => ({ ...item, category: ep.category })));
          total += result.total;
          if (result.totalPages > maxPages) maxPages = result.totalPages;
        }
      }
      setProducts(all);
      setTotalProducts(total);
      setTotalPages(maxPages);
      setLoading(false);
    }
    fetchAll();
  }, [page, limit]);

  const filteredProducts = products.filter(
    (p) =>
      (p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.size && p.size.toLowerCase().includes(search.toLowerCase())) ||
        p.color.toLowerCase().includes(search.toLowerCase())) &&
      (category ? p.category === category : true)
  );

  // Deduct stock handler
  const handleDeductStock = async (product) => {
    const quantityStr = prompt(`How many units to deduct from ${product.name}? (Current stock: ${product.stock})`);
    const quantity = parseInt(quantityStr, 10);
    if (!quantity || quantity <= 0) {
      setNotification({ show: true, message: 'Enter a valid quantity', type: 'error' });
      return;
    }
    let endpoint = '';
    if (product.category === 'Shoes') endpoint = 'shoes';
    else if (product.category === 'Bags') endpoint = 'bags';
    else if (product.category === 'Dresses') endpoint = 'dresses';
    else {
      setNotification({ show: true, message: 'Unknown category', type: 'error' });
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/${endpoint}/${product._id}/deduct`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProducts((prev) => prev.map((p) => p._id === product._id ? { ...p, stock: updated.stock } : p));
        setNotification({ show: true, message: 'Stock deducted successfully!', type: 'success' });
        if (updated.stock <= 5) {
          setNotification({ show: true, message: `Low stock for ${product.name}: ${updated.stock} left!`, type: 'warning' });
        }
      } else {
        const err = await res.json();
        setNotification({ show: true, message: 'Error: ' + (err.error || 'Failed to deduct stock'), type: 'error' });
      }
    } catch (err) {
      setNotification({ show: true, message: 'Error: ' + err.message, type: 'error' });
    }
  };

  // Edit product logic
  const handleEditClick = (product) => {
    setEditProduct(product);
    setEditForm({
      ...product,
      sizes: product.sizes || { US: '', UK: '', EU: '', CM: '' },
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('size_')) {
      const key = name.split('_')[1];
      setEditForm((prev) => ({ ...prev, sizes: { ...prev.sizes, [key]: value } }));
    } else {
      setEditForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    let endpoint = '';
    if (editProduct.category === 'Shoes') endpoint = 'shoes';
    else if (editProduct.category === 'Bags') endpoint = 'bags';
    else if (editProduct.category === 'Dresses') endpoint = 'dresses';
  else return setNotification({ show: true, message: 'Unknown category', type: 'error' });
    const payload = { ...editForm };
    try {
      const res = await fetch(`${API_URL}/api/${endpoint}/${editProduct._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const updated = await res.json();
        setProducts((prev) => prev.map((p) => p._id === updated._id ? updated : p));
        setEditProduct(null);
        setNotification({ show: true, message: 'Product updated!', type: 'success' });
      } else {
        setNotification({ show: true, message: 'Failed to update product.', type: 'error' });
      }
    } catch (err) {
      setNotification({ show: true, message: 'Error: ' + err.message, type: 'error' });
    }
  };

  // New handlers for stock management
  const handleAddStock = async (product) => {
    const quantityStr = prompt(`How many units to add to ${product.name}?`);
    const quantity = parseInt(quantityStr, 10);
    if (!quantity || quantity <= 0) {
      setNotification({ show: true, message: 'Enter a valid quantity', type: 'error' });
      return;
    }
    let endpoint = '';
    if (product.category === 'Shoes') endpoint = 'shoes';
    else if (product.category === 'Bags') endpoint = 'bags';
    else if (product.category === 'Dresses') endpoint = 'dresses';
    else {
      setNotification({ show: true, message: 'Unknown category', type: 'error' });
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/${endpoint}/${product._id}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProducts((prev) => prev.map((p) => p._id === product._id ? { ...p, stock: updated.stock } : p));
        setNotification({ show: true, message: 'Stock added successfully!', type: 'success' });
      } else {
        const err = await res.json();
        setNotification({ show: true, message: 'Error: ' + (err.error || 'Failed to add stock'), type: 'error' });
      }
    } catch (err) {
      setNotification({ show: true, message: 'Error: ' + err.message, type: 'error' });
    }
  };

  const handleRemoveStock = async (product) => {
    const confirm = window.confirm(`Are you sure you want to remove ${product.name} from the list?`);
    if (!confirm) return;
    let endpoint = '';
    if (product.category === 'Shoes') endpoint = 'shoes';
    else if (product.category === 'Bags') endpoint = 'bags';
    else if (product.category === 'Dresses') endpoint = 'dresses';
    else {
      setNotification({ show: true, message: 'Unknown category', type: 'error' });
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/${endpoint}/${product._id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p._id !== product._id));
        setNotification({ show: true, message: 'Product removed successfully!', type: 'success' });
      } else {
        const err = await res.json();
        setNotification({ show: true, message: 'Error: ' + (err.error || 'Failed to remove product'), type: 'error' });
      }
    } catch (err) {
      setNotification({ show: true, message: 'Error: ' + err.message, type: 'error' });
    }
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
      <div className="max-w-6xl mx-auto mt-10 p-8 bg-white rounded-lg shadow-md">
      {/* Back Arrow for mobile */}
      <div className="flex items-center gap-2 mb-2 lg:hidden">
        <button type="button" onClick={handleBack} className="flex items-center text-blue-600 hover:text-blue-800 focus:outline-none">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 mr-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-semibold text-base">Back</span>
        </button>
      </div>
      <h2 className="text-3xl font-bold mb-8 text-center tracking-tight">Product List</h2>
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name or size"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border-2 border-blue-200 rounded-lg w-full focus:outline-none focus:border-blue-500 transition"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
        >
          <option value="">All Categories</option>
          <option value="Shoes">Shoes</option>
          <option value="Bags">Bags</option>
          <option value="Dresses">Dresses</option>
        </select>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-40"><ClipLoader color="#2563eb" size={48} /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 cursor-pointer flex flex-row group p-0 overflow-hidden border border-blue-100 min-w-[340px] max-w-2xl w-full mb-6"
                
                onClick={() => handleViewLogs(product._id)}
              >
                {/* Image section */}
                <div className="flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 h-full w-40">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="object-cover rounded-xl border-2 border-blue-200 group-hover:scale-105 transition-transform duration-300 bg-gray-50"
                    style={{
                      height: "140px",
                      width: "140px",
                      boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                    }}
                  />
                </div>
                {/* Details section */}
                <div className="flex flex-col justify-between px-4 py-3 flex-1">
                  <div>
                    <div className="font-bold text-lg mb-1 text-blue-900 truncate">
                      {product.name}
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-1">
                      <span>Category: <span className="font-semibold">{product.category}</span></span>
                      <span>Color: <span className="font-semibold">{product.color}</span></span>
                      <span>Stock: <span className="font-semibold">{product.stock}</span></span>
                    </div>
                    <div className="text-sm text-gray-600 mb-1">
                      Price: <span className="font-semibold">${product.price}</span>
                    </div>
                    <div className="text-xs text-gray-500 mb-2 text-left line-clamp-2">
                      {product.description}
                    </div>
                  </div>
                  <div className="flex gap-2 items-center justify-end">
                    <button
                      className="bg-green-600 text-white px-3 py-1 rounded-xl font-semibold shadow hover:bg-green-700 transition text-xs"
                      onClick={(e) => { e.stopPropagation(); handleAddStock(product); }}
                    >
                      Add Stock
                    </button>
                    <button
                      className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-3 py-1 rounded-xl font-semibold shadow hover:from-blue-600 hover:to-blue-800 transition text-xs"
                      onClick={(e) => { e.stopPropagation(); handleRemoveStock(product); }}
                    >
                      Remove
                    </button>
                    <button
                      className="bg-yellow-500 text-white px-3 py-1 rounded-xl font-semibold shadow hover:bg-yellow-600 transition text-xs"
                      onClick={(e) => { e.stopPropagation(); handleEditProduct(product); }}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-500 hover:text-red-700 p-2 rounded-full"
                      title="Delete"
                      onClick={(e) => { e.stopPropagation(); handleDeleteProduct(product._id); }}
                    >
                      <FaTrash size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Pagination Controls */}
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              className="px-4 py-2 rounded bg-blue-100 text-blue-700 font-semibold disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </button>
            <span className="font-bold">Page {page} of {totalPages}</span>
            <button
              className="px-4 py-2 rounded bg-blue-100 text-blue-700 font-semibold disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
            <select
              value={limit}
              onChange={e => { setLimit(Number(e.target.value)); setPage(1); }}
              className="ml-4 px-2 py-1 border rounded"
            >
              <option value={6}>6</option>
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
            </select>
            <span className="ml-2 text-sm text-gray-500">Products per page</span>
          </div>
        </>
      )}
      <Modal
        isOpen={!!editProduct}
        onRequestClose={() => setEditProduct(null)}
        className="bg-white p-8 rounded-lg shadow-lg max-w-lg mx-auto mt-20"
        overlayClassName="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center"
        ariaHideApp={false}
      >
        {editProduct && (
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <h3 className="text-xl font-bold mb-4">Edit {editProduct.name}</h3>
            <input name="name" value={editForm.name} onChange={handleEditFormChange} placeholder="Product Name" className="w-full px-3 py-2 border rounded" required />
            <input name="color" value={editForm.color} onChange={handleEditFormChange} placeholder="Color" className="w-full px-3 py-2 border rounded" required />
            <input name="stock" type="number" value={editForm.stock} onChange={handleEditFormChange} placeholder="Stock Quantity" className="w-full px-3 py-2 border rounded" required />
            <input name="price" type="number" value={editForm.price} onChange={handleEditFormChange} placeholder="Price" className="w-full px-3 py-2 border rounded" required />
            <textarea name="description" value={editForm.description} onChange={handleEditFormChange} placeholder="Description" className="w-full px-3 py-2 border rounded" required />
            {editProduct.category === 'Shoes' && (
              <>
                <div className="flex gap-4">
                  <select name="gender" value={editForm.gender} onChange={handleEditFormChange} className="w-full px-3 py-2 border rounded" required>
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="unisex">Unisex</option>
                  </select>
                  <select name="ageGroup" value={editForm.ageGroup} onChange={handleEditFormChange} className="w-full px-3 py-2 border rounded" required>
                    <option value="">Select Age Group</option>
                    <option value="adult">Adult</option>
                    <option value="child">Child</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input name="size_US" value={editForm.sizes.US} onChange={handleEditFormChange} placeholder="US Size" className="w-full px-3 py-2 border rounded" required />
                  <input name="size_UK" value={editForm.sizes.UK} onChange={handleEditFormChange} placeholder="UK Size" className="w-full px-3 py-2 border rounded" required />
                  <input name="size_EU" value={editForm.sizes.EU} onChange={handleEditFormChange} placeholder="EU Size" className="w-full px-3 py-2 border rounded" required />
                  <input name="size_CM" value={editForm.sizes.CM} onChange={handleEditFormChange} placeholder="CM Size" className="w-full px-3 py-2 border rounded" required />
                </div>
              </>
            )}
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Save Changes</button>
          </form>
        )}
      </Modal>
    </div>
    </>
  );
}
