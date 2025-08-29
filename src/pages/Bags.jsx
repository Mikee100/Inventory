import React, { useEffect, useState } from "react";
import Notification from "../components/Notification";
import AddProductModal from "./AddProductModal";
import { FaTrash } from "react-icons/fa";
import { ClipLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function Bags() {
  const [notification, setNotification] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [bags, setBags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/bags`)
      .then((res) => res.json())
      .then((result) => {
        setBags(Array.isArray(result) ? result : result.data || []);
        setLoading(false);
      });
  }, []);

  // Add stock handler
  const handleAddStock = async (bag) => {
    const quantityStr = prompt(
      `How many units to add to ${bag.name}? (Current stock: ${bag.stock})`
    );
    const quantity = parseInt(quantityStr, 10);
    if (!quantity || quantity <= 0) {
      setNotification({ type: "warning", message: "Enter a valid quantity" });
      return;
    }
    try {
      const res = await fetch(
        `${API_URL}/api/bags/${bag._id}/add`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity }),
        }
      );
      if (res.ok) {
        const updated = await res.json();
        setBags((prev) =>
          prev.map((b) =>
            b._id === bag._id ? { ...b, stock: updated.stock } : b
          )
        );
        setNotification({ type: "success", message: "Stock added successfully!" });
      } else {
        const err = await res.json();
        setNotification({
          type: "error",
          message: "Error: " + (err.error || "Failed to add stock"),
        });
      }
    } catch (err) {
      setNotification({ type: "error", message: "Error: " + err.message });
    }
  };

  // Remove stock handler
  const handleRemoveStock = async (bag) => {
    const quantityStr = prompt(
      `How many units to remove from ${bag.name}? (Current stock: ${bag.stock})`
    );
    const quantity = parseInt(quantityStr, 10);
    if (!quantity || quantity <= 0) {
      setNotification({ type: "warning", message: "Enter a valid quantity" });
      return;
    }
    try {
      const res = await fetch(
        `${API_URL}/api/bags/${bag._id}/deduct`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity }),
        }
      );
      if (res.ok) {
        const updated = await res.json();
        setBags((prev) =>
          prev.map((b) =>
            b._id === bag._id ? { ...b, stock: updated.stock } : b
          )
        );
        setNotification({ type: "success", message: "Stock removed successfully!" });
      } else {
        const err = await res.json();
        setNotification({
          type: "error",
          message: "Error: " + (err.error || "Failed to remove stock"),
        });
      }
    } catch (err) {
      setNotification({ type: "error", message: "Error: " + err.message });
    }
  };

  // Edit bag handler
  const handleEditBag = (bag) => {
    setEditId(bag._id);
    setEditForm({ ...bag });
    setShowAddModal(true);
  };

  // Delete bag handler
  const handleDeleteBag = async (bagId) => {
    if (!window.confirm("Are you sure you want to delete this bag?")) return;
    try {
      const res = await fetch(
        `${API_URL}/api/bags/${bagId}`,
        {
          method: "DELETE",
        }
      );
      if (res.ok) {
        setBags((prev) => prev.filter((b) => b._id !== bagId));
        setNotification({ type: "success", message: "Bag deleted!" });
      } else {
        setNotification({ type: "error", message: "Failed to delete bag." });
      }
    } catch (err) {
      setNotification({ type: "error", message: "Error: " + err.message });
    }
  };

  // Routing to CategoryLogs page when a bag is clicked
  const handleViewLogs = (id) => {
    navigate(`/bags/${id}/logs`);
  };

  return (
    <>
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
      <div className="max-w-6xl mx-auto mt-10 p-2 sm:p-6 rounded-2xl shadow-lg bg-white">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-center tracking-tight">
            Bags
          </h2>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg text-base"
            onClick={() => setShowAddModal(true)}
          >
            + Add Bag
          </button>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <ClipLoader color="#2563eb" size={48} />
          </div>
        ) : (
          <div>
            <div className="mb-8">
              <div className="flex flex-row gap-3 sm:gap-4 overflow-x-auto pb-4 px-2 sm:px-0 -mx-2 sm:mx-0">
                {bags
  .filter(
    (bag) =>
      (bag.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (bag.color || "").toLowerCase().includes(search.toLowerCase())
  )
  .map((bag) => (
    <div
      key={bag._id}
      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-row group p-0 overflow-hidden border border-blue-100 w-full min-w-[300px] sm:min-w-0 sm:max-w-xl h-44 sm:h-48 flex-shrink-0"
      onClick={() => handleViewLogs(bag._id)}
    >
      <div className="w-36 sm:w-40 bg-gradient-to-br from-blue-50 to-blue-100 p-2 flex-shrink-0 flex items-center justify-center">
        <img
          src={bag.image_url}
          alt={bag.name}
          className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
          style={{
            filter: "drop-shadow(0 2px 10px rgba(0,0,0,0.1))"
          }}
          loading="lazy"
        />
      </div>
      <div className="p-2 sm:p-3 flex-1 flex flex-col overflow-hidden">
        <h3 className="font-bold text-gray-900 text-sm sm:text-base truncate">{bag.name}</h3>
        <div className="grid grid-cols-2 gap-1 text-xs sm:text-sm text-gray-600 mt-1">
          <div className="truncate">
            <span className="text-gray-500 text-[11px] sm:text-xs">Color: </span>
            <span className="font-medium text-xs sm:text-sm">{bag.color}</span>
          </div>
          <div className="truncate">
            <span className="text-gray-500 text-[11px] sm:text-xs">Stock: </span>
            <span className="font-medium text-xs sm:text-sm">{bag.stock}</span>
          </div>
          <div className="truncate">
            <span className="text-gray-500 text-[11px] sm:text-xs">Price: </span>
            <span className="font-medium text-xs sm:text-sm">${bag.price}</span>
          </div>
        </div>
        <div className="mt-1 text-[11px] sm:text-xs text-gray-500 line-clamp-2">
          {bag.description}
        </div>
        <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
          <button
            className="bg-green-500 text-white px-2 py-1 sm:py-0.5 rounded-lg text-[11px] sm:text-xs font-medium hover:bg-green-600 transition-colors"
            onClick={(e) => { e.stopPropagation(); handleAddStock(bag); }}
          >
            + Stock
          </button>
          <button
            className="bg-blue-500 text-white px-2 py-1 sm:py-0.5 rounded-lg text-[11px] sm:text-xs font-medium hover:bg-blue-600 transition-colors"
            onClick={(e) => { e.stopPropagation(); handleRemoveStock(bag); }}
          >
            - Stock
          </button>
          <button
            className="bg-yellow-500 text-white px-2 py-1 sm:py-0.5 rounded-lg text-[11px] sm:text-xs font-medium hover:bg-yellow-600 transition-colors"
            onClick={(e) => { e.stopPropagation(); handleEditBag(bag); }}
          >
            Edit
          </button>
          <button
            className="text-red-500 hover:text-red-700 p-1 rounded-full ml-auto"
            title="Delete"
            onClick={(e) => { e.stopPropagation(); handleDeleteBag(bag._id); }}
          >
            <FaTrash size={14} className="sm:w-4 sm:h-4 w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  ))}
              </div>
            </div>
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
                category="Bags"
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
      </div>
    </>
  );
}