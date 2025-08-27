import React, { useEffect, useState } from 'react';
import AddProductModal from './AddProductModal';
import Notification from '../components/Notification';
import { ClipLoader } from 'react-spinners';
import { useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";

export default function Bags() {
  // Notification state
  const [notification, setNotification] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [bags, setBags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const [editId, setEditId] = useState(null);
    const handleBack = () => window.history.back();
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetch('https://inventory-backend-gpon.onrender.com/api/bags')
      .then(res => res.json())
      .then(result => {
        // If paginated response, use result.data
        if (Array.isArray(result)) {
          setBags(result);
        } else if (result && Array.isArray(result.data)) {
          setBags(result.data);
        } else {
          setBags([]);
        }
        setLoading(false);
      });
  }, []);
        {/* Back Arrow for mobile */}
        <div className="flex items-center gap-2 mb-2 lg:hidden">
          <button type="button" onClick={handleBack} className="flex items-center text-blue-600 hover:text-blue-800 focus:outline-none">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-semibold text-base">Back</span>
          </button>
        </div>

  const handleDeductStock = async (bag) => {
    const quantityStr = prompt(`How many units to deduct from ${bag.name}? (Current stock: ${bag.stock})`);
    const quantity = parseInt(quantityStr, 10);
    if (!quantity || quantity <= 0) {
      setNotification({ type: 'warning', message: 'Enter a valid quantity' });
      return;
    }
    try {
      const res = await fetch(`https://inventory-backend-gpon.onrender.com/api/bags/${bag._id}/deduct`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });
      if (res.ok) {
        const updated = await res.json();
        setBags((prev) => prev.map((b) => b._id === bag._id ? { ...b, stock: updated.stock } : b));
        setNotification({ type: 'success', message: 'Stock deducted successfully!' });
        if (updated.stock <= 5) {
          setNotification({ type: 'warning', message: `Low stock for ${bag.name}: ${updated.stock} left!` });
        }
      } else {
        const err = await res.json();
        setNotification({ type: 'error', message: 'Error: ' + (err.error || 'Failed to deduct stock') });
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Error: ' + err.message });
    }
  };

  const handleAddStock = async (bag) => {
    const quantityStr = prompt(`How many units to add to ${bag.name}? (Current stock: ${bag.stock})`);
    const quantity = parseInt(quantityStr, 10);
    if (!quantity || quantity <= 0) {
      setNotification({ show: true, message: 'Enter a valid quantity', type: 'error' });
      return;
    }
    try {
      const res = await fetch(`https://inventory-backend-gpon.onrender.com/api/bags/${bag._id}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });
      if (res.ok) {
        const updated = await res.json();
        setBags((prev) => prev.map((b) => b._id === bag._id ? { ...b, stock: updated.stock } : b));
        setNotification({ show: true, message: 'Stock added successfully!', type: 'success' });
      } else {
        const err = await res.json();
        setNotification({ show: true, message: 'Error: ' + (err.error || 'Failed to add stock'), type: 'error' });
      }
    } catch (err) {
      setNotification({ show: true, message: 'Error: ' + err.message, type: 'error' });
    }
  };

  const filteredBags = bags.filter(
    (bag) =>
      bag.name.toLowerCase().includes(search.toLowerCase()) ||
      bag.size.toLowerCase().includes(search.toLowerCase()) ||
      bag.color.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
      <div className="max-w-6xl mx-auto mt-10 p-8 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-center tracking-tight">Bags</h2>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow"
            onClick={() => setShowAddModal(true)}
          >
            + Add Bag
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
            {filteredBags.map((bag) => (
              <div
                key={bag._id}
                className="bg-white p-5 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 cursor-pointer flex flex-col items-center group min-h-[420px]"
                onClick={() => navigate(`/bags/${bag._id}/logs`)}
              >
                <div className="w-full flex justify-center mb-4">
                  <img
                    src={bag.image_url}
                    alt={bag.name}
                    className="h-56 w-56 object-cover rounded-xl border-2 border-blue-100 group-hover:scale-105 transition-transform duration-300 bg-gray-50"
                    style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
                  />
                </div>
                <div>
                  <div className="font-bold text-lg mb-1 text-gray-800">{bag.name}</div>
                  <div className="text-sm text-gray-600 mb-1">Brand: <span className="font-semibold">{bag.brand}</span></div>
                  <div className="text-sm text-gray-600 mb-1">Color: <span className="font-semibold">{bag.color}</span></div>
                  <div className="text-sm text-gray-600 mb-1">Stock: <span className="font-semibold">{bag.stock}</span></div>
                  <div className="text-sm text-gray-600 mb-1">Price: <span className="font-semibold">${bag.price}</span></div>
                  <div className="text-xs text-gray-500 mb-2 text-center">{bag.description}</div>
                  <div className="flex gap-2 mt-2">
                    <button className="bg-blue-600 text-white px-2 py-1 rounded-md text-xs" onClick={e => { e.stopPropagation(); handleDeductStock(bag); }}>Deduct</button>
                    <button className="bg-green-600 text-white px-4 py-2 sm:px-2 sm:py-1 rounded-xl font-semibold shadow hover:bg-green-700 transition text-xs" onClick={e => { e.stopPropagation(); handleAddStock(bag); }}>
                      Add Stock
                    </button>
                    <button className="bg-yellow-500 text-white px-2 py-1 rounded-md text-xs" onClick={e => { e.stopPropagation(); setEditId(bag._id); setEditForm({ ...bag }); setShowModal(true); }}>Edit</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Modal outside the grid and map */}
          {showAddModal && (
            <div className="fixed inset-0 bg-white bg-opacity-30 flex justify-center items-center z-50" style={{ backdropFilter: 'blur(8px)' }}>
              <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                <AddProductModal category="Bags" onClose={() => setShowAddModal(false)} />
              </div>
            </div>
          )}
      </div>
      {showModal && (
  <div className="fixed inset-0 bg-white bg-opacity-30 flex justify-center items-center z-50" style={{ backdropFilter: 'blur(8px)' }}>
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Edit Bag</h3>
            <form className="space-y-2" onSubmit={async e => {
              e.preventDefault();
              try {
                const res = await fetch(`https://inventory-backend-gpon.onrender.com/api/bags/${editId}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(editForm),
                });
                if (res.ok) {
                  const updated = await res.json();
                  setBags(prev => prev.map(b => b._id === updated._id ? updated : b));
                  setEditId(null);
                  setShowModal(false);
                  alert('Product updated!');
                } else {
                  alert('Failed to update product.');
                }
              } catch (err) {
                alert('Error: ' + err.message);
              }
            }}>
              <input name="name" value={editForm.name || ''} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} className="w-full px-2 py-1 border rounded" required />
              <input name="brand" value={editForm.brand || ''} onChange={e => setEditForm(f => ({ ...f, brand: e.target.value }))} className="w-full px-2 py-1 border rounded" />
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
    </>
  );
}
