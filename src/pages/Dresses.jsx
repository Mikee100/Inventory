import React, { useEffect, useState } from "react";
import Notification from "../components/Notification";
import AddProductModal from "./AddProductModal";
import { FaTrash } from "react-icons/fa";
import { ClipLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function Dresses() {
  const [notification, setNotification] = useState({ show: false, message: '', type: 'info' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [dresses, setDresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/api/dresses`)
      .then((res) => res.json())
      .then((result) => {
        setDresses(Array.isArray(result) ? result : result.data || []);
        setLoading(false);
      });
  }, []);

  // Add stock handler
  const handleAddStock = async (dress) => {
    const quantityStr = prompt(`How many units to add to ${dress.name}? (Current stock: ${dress.stock})`);
    const quantity = parseInt(quantityStr, 10);
    if (!quantity || quantity <= 0) {
      setNotification({ show: true, message: "Enter a valid quantity", type: "error" });
      return;
    }
    try {
      const res = await fetch(
        `${API_URL}/api/dresses/${dress._id}/add`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity }),
        }
      );
      if (res.ok) {
        const updated = await res.json();
        setDresses((prev) =>
          prev.map((d) => (d._id === dress._id ? { ...d, stock: updated.stock } : d))
        );
        setNotification({ show: true, message: "Stock added successfully!", type: "success" });
      } else {
        const err = await res.json();
        setNotification({ show: true, message: "Error: " + (err.error || "Failed to add stock"), type: "error" });
      }
    } catch (err) {
      setNotification({ show: true, message: "Error: " + err.message, type: "error" });
    }
  };

  // Deduct stock handler
  const handleDeductStock = async (dress) => {
    const quantityStr = prompt(`How many units to deduct from ${dress.name}? (Current stock: ${dress.stock})`);
    const quantity = parseInt(quantityStr, 10);
    if (!quantity || quantity <= 0) {
      setNotification({ show: true, message: "Enter a valid quantity", type: "error" });
      return;
    }
    try {
      const res = await fetch(
        `${API_URL}/api/dresses/${dress._id}/deduct`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity }),
        }
      );
      if (res.ok) {
        const updated = await res.json();
        setDresses((prev) =>
          prev.map((d) => (d._id === dress._id ? { ...d, stock: updated.stock } : d))
        );
        setNotification({ show: true, message: "Stock deducted successfully!", type: "success" });
        if (updated.stock <= 3) {
          setNotification({ show: true, message: `Low stock for ${dress.name}: ${updated.stock} left!`, type: "warning" });
        }
      } else {
        const err = await res.json();
        setNotification({ show: true, message: "Error: " + (err.error || "Failed to deduct stock"), type: "error" });
      }
    } catch (err) {
      setNotification({ show: true, message: "Error: " + err.message, type: "error" });
    }
  };

  // Edit dress handler
  const handleEditDress = (dress) => {
    setEditId(dress._id);
    setEditForm({ ...dress });
    setShowModal(true);
  };

  // Delete dress handler
  const handleDeleteDress = async (dressId) => {
    if (!window.confirm("Are you sure you want to delete this dress?")) return;
    try {
      const res = await fetch(
        `${API_URL}/api/dresses/${dressId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setDresses((prev) => prev.filter((d) => d._id !== dressId));
        setNotification({ show: true, message: "Dress deleted!", type: "success" });
      } else {
        setNotification({ show: true, message: "Failed to delete dress.", type: "error" });
      }
    } catch (err) {
      setNotification({ show: true, message: "Error: " + err.message, type: "error" });
    }
  };

  // Routing to CategoryLogs page when a dress is clicked
  const handleViewLogs = (id) => {
    navigate(`/dresses/${id}/logs`);
  };

  const filteredDresses = dresses.filter(
    (dress) =>
      (dress.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (dress.size || "").toLowerCase().includes(search.toLowerCase()) ||
      (dress.color || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {notification.show && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(n => ({ ...n, show: false }))}
        />
      )}
      <div className="max-w-6xl mx-auto mt-10 p-2 sm:p-6 rounded-2xl shadow-lg bg-white">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-center tracking-tight">
            Dresses
          </h2>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg text-base"
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
          <div className="flex justify-center items-center h-40">
            <ClipLoader color="#2563eb" size={48} />
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {filteredDresses.map((dress) => (
              <div
                key={dress._id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-row group p-0 overflow-hidden border border-blue-100 min-w-[340px] max-w-2xl w-full mb-2"
                style={{ height: "180px" }}
                onClick={() => handleViewLogs(dress._id)}
              >
                {/* Image section */}
                <div className="flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 h-full w-40">
                  <img
                    src={dress.image_url}
                    alt={dress.name}
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
                      {dress.name}
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-1">
                      <span>Size: <span className="font-semibold">{dress.size}</span></span>
                      <span>Color: <span className="font-semibold">{dress.color}</span></span>
                      <span>Stock: <span className="font-semibold">{dress.stock}</span></span>
                    </div>
                    <div className="text-sm text-gray-600 mb-1">
                      Price: <span className="font-semibold">${dress.price}</span>
                    </div>
                    <div className="text-xs text-gray-500 mb-2 text-left line-clamp-2">
                      {dress.description}
                    </div>
                  </div>
                  <div className="flex gap-2 items-center justify-end">
                    <button
                      className="bg-green-600 text-white px-3 py-1 rounded-xl font-semibold shadow hover:bg-green-700 transition text-xs"
                      onClick={(e) => { e.stopPropagation(); handleAddStock(dress); }}
                    >
                      Add Stock
                    </button>
                    <button
                      className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-3 py-1 rounded-xl font-semibold shadow hover:from-blue-600 hover:to-blue-800 transition text-xs"
                      onClick={(e) => { e.stopPropagation(); handleDeductStock(dress); }}
                    >
                      Deduct
                    </button>
                    <button
                      className="bg-yellow-500 text-white px-3 py-1 rounded-xl font-semibold shadow hover:bg-yellow-600 transition text-xs"
                      onClick={(e) => { e.stopPropagation(); handleEditDress(dress); }}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-500 hover:text-red-700 p-2 rounded-full"
                      title="Delete"
                      onClick={(e) => { e.stopPropagation(); handleDeleteDress(dress._id); }}
                    >
                      <FaTrash size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {showAddModal && (
          <div
            className="fixed inset-0 bg-white bg-opacity-30 flex justify-center items-center z-50"
            style={{ backdropFilter: "blur(8px)" }}
          >
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full"
              style={{
                maxHeight: "80vh",
                overflowY: "auto",
              }}
            >
              <AddProductModal
                category="Dresses"
                editId={editId}
                editForm={editForm}
                onClose={() => {
                  setShowAddModal(false);
                  setEditId(null);
                  setEditForm({});
                }}
              />
            </div>
          </div>
        )}
        {showModal && (
          <div className="fixed inset-0 bg-white bg-opacity-30 flex justify-center items-center z-50" style={{ backdropFilter: 'blur(8px)' }}>
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full" onClick={e => e.stopPropagation()}>
              <h3 className="text-xl font-bold mb-4">Edit Dress</h3>
              <form className="space-y-2" onSubmit={async e => {
                e.preventDefault();
                try {
                  const res = await fetch(`${API_URL}/api/dresses/${editId}`, {
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
      </div>
    </>
  );
}