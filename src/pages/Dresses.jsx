import React, { useEffect, useState } from 'react';
import Notification from '../components/Notification';
import AddProductModal from './AddProductModal';
import { ClipLoader } from 'react-spinners';
import { useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";

export default function Dresses() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'info' });
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [dresses, setDresses] = useState([]);
  const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('http://localhost:8000/api/dresses')
      .then(res => res.json())
      .then(result => {
        // If paginated response, use result.data
        if (Array.isArray(result)) {
          setDresses(result);
        } else if (result && Array.isArray(result.data)) {
          setDresses(result.data);
        } else {
          setDresses([]);
        }
        setLoading(false);
      });
  }, []);

  // Deduct stock handler
  const handleDeductStock = async (dress) => {
    const quantityStr = prompt(`How many units to deduct from ${dress.name}? (Current stock: ${dress.stock})`);
    const quantity = parseInt(quantityStr, 10);
    if (!quantity || quantity <= 0) {
      setNotification({ show: true, message: 'Enter a valid quantity', type: 'error' });
      return;
    }
    try {
      const res = await fetch(`http://localhost:8000/api/dresses/${dress._id}/deduct`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });
      if (res.ok) {
        const updated = await res.json();
        setDresses((prev) => prev.map((d) => d._id === dress._id ? { ...d, stock: updated.stock } : d));
        setNotification({ show: true, message: 'Stock deducted successfully!', type: 'success' });
        if (updated.stock <= 3) {
          setNotification({ show: true, message: `Low stock for ${dress.name}: ${updated.stock} left!`, type: 'warning' });
        }
      } else {
        const err = await res.json();
        setNotification({ show: true, message: 'Error: ' + (err.error || 'Failed to deduct stock'), type: 'error' });
      }
    } catch (err) {
      setNotification({ show: true, message: 'Error: ' + err.message, type: 'error' });
    }
  };

  const handleAddStock = async (dress) => {
    const quantityStr = prompt(`How many units to add to ${dress.name}? (Current stock: ${dress.stock})`);
    const quantity = parseInt(quantityStr, 10);
    if (!quantity || quantity <= 0) {
      setNotification({ show: true, message: 'Enter a valid quantity', type: 'error' });
      return;
    }
    try {
      const res = await fetch(`http://localhost:8000/api/dresses/${dress._id}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });
      if (res.ok) {
        const updated = await res.json();
        setDresses((prev) => prev.map((d) => d._id === dress._id ? { ...d, stock: updated.stock } : d));
        setNotification({ show: true, message: 'Stock added successfully!', type: 'success' });
      } else {
        const err = await res.json();
        setNotification({ show: true, message: 'Error: ' + (err.error || 'Failed to add stock'), type: 'error' });
      }
    } catch (err) {
      setNotification({ show: true, message: 'Error: ' + err.message, type: 'error' });
    }
  };

  const filteredDresses = dresses.filter(
    (dress) =>
      dress.name.toLowerCase().includes(search.toLowerCase()) ||
      dress.size.toLowerCase().includes(search.toLowerCase()) ||
      dress.color.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="max-w-6xl mx-auto mt-10 p-8 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-center tracking-tight">Dresses</h2>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow"
            onClick={() => setShowAddModal(true)}
          >
            + Add Dress
          </button>
        </div>
        <input
          type="text"
          placeholder="Search by name, size, or color"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-6 px-4 py-2 border-2 border-blue-200 rounded-lg w-full focus:outline-none focus:border-blue-500 transition"
        />
        {loading ? (
          <div className="flex justify-center items-center h-40"><ClipLoader color="#2563eb" size={48} /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDresses.map((dress) => (
              <div
                key={dress._id}
                className="bg-white p-5 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 cursor-pointer flex flex-col items-center group min-h-[420px]"
                onClick={() => navigate(`/dresses/${dress._id}/logs`)}
              >
                <div className="w-full flex justify-center mb-4">
                  <img
                    src={dress.image_url}
                    alt={dress.name}
                    className="h-56 w-56 object-cover rounded-xl border-2 border-blue-100 group-hover:scale-105 transition-transform duration-300 bg-gray-50"
                    style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
                  />
                </div>
                <div className="font-bold text-lg mb-1 text-gray-800">{dress.name}</div>
                <div className="text-sm text-gray-600 mb-1">Size: <span className="font-semibold">{dress.size}</span></div>
                <div className="text-sm text-gray-600 mb-1">Color: <span className="font-semibold">{dress.color}</span></div>
                <div className="text-sm text-gray-600 mb-1">Stock: <span className="font-semibold">{dress.stock}</span></div>
                <div className="text-sm text-gray-600 mb-1">Price: <span className="font-semibold">${dress.price}</span></div>
                <div className="text-xs text-gray-500 mb-2 text-center">{dress.description}</div>
                <div className="flex gap-2 mt-2">
                  <button
                    className="bg-blue-600 text-white px-2 py-1 rounded-md text-xs"
                    onClick={e => { e.stopPropagation(); handleDeductStock(dress); }}
                  >
                    Deduct
                  </button>
                  <button
                    className="bg-green-600 text-white px-4 py-2 sm:px-2 sm:py-1 rounded-xl font-semibold shadow hover:bg-green-700 transition text-xs"
                    onClick={e => { e.stopPropagation(); handleAddStock(dress); }}
                  >
                    Add Stock
                  </button>
                  <button
                    className="bg-yellow-500 text-white px-2 py-1 rounded-md text-xs"
                    onClick={e => { e.stopPropagation(); setEditId(dress._id); setEditForm({ ...dress }); setShowModal(true); }}
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Modal for editing dress - moved outside grid */}
          {showAddModal && (
            <div className="fixed inset-0 bg-white bg-opacity-30 flex justify-center items-center z-50" style={{ backdropFilter: 'blur(8px)' }}>
              <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                <AddProductModal category="Dresses" onClose={() => setShowAddModal(false)} />
              </div>
            </div>
          )}
      </div>
      {showModal && (
  <div className="fixed inset-0 bg-white bg-opacity-30 flex justify-center items-center z-50" style={{ backdropFilter: 'blur(8px)' }}>
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">Edit Dress</h3>
            <form className="space-y-2" onSubmit={async e => {
              e.preventDefault();
              try {
                const res = await fetch(`http://localhost:8000/api/dresses/${editId}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(editForm),
                });
                if (res.ok) {
                  const updated = await res.json();
                  setDresses(prev => prev.map(d => d._id === updated._id ? updated : d));
                  setEditId(null);
                  setShowModal(false);
                  setNotification({ show: true, message: 'Product updated!', type: 'success' });
                } else {
                  setNotification({ show: true, message: 'Failed to update product.', type: 'error' });
                }
              } catch (err) {
                setNotification({ show: true, message: 'Error: ' + err.message, type: 'error' });
              }
            }}>
              <input name="name" value={editForm.name || ''} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} className="w-full px-2 py-1 border rounded" required />
              <input name="size" value={editForm.size || ''} onChange={e => setEditForm(f => ({ ...f, size: e.target.value }))} className="w-full px-2 py-1 border rounded" required />
              <input name="color" value={editForm.color || ''} onChange={e => setEditForm(f => ({ ...f, color: e.target.value }))} className="w-full px-2 py-1 border rounded" required />
              <input name="stock" type="number" value={editForm.stock || ''} onChange={e => setEditForm(f => ({ ...f, stock: e.target.value }))} className="w-full px-2 py-1 border rounded" required />
              <input name="price" type="number" value={editForm.price || ''} onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))} className="w-full px-2 py-1 border rounded" required />
              <textarea name="description" value={editForm.description || ''} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} className="w-full px-2 py-1 border rounded" required />
              <div className="flex gap-2 mt-2">
                <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded">Save</button>
                <button type="button" className="bg-gray-400 text-white px-3 py-1 rounded" onClick={() => { setEditId(null); setShowModal(false); }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Notification */}
      {notification.show && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(n => ({ ...n, show: false }))}
        />
      )}
    </>
  );
}
