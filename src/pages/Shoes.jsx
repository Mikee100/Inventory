import React, { useEffect, useState } from "react";
import Notification from "../components/Notification";
import AddProductModal from "./AddProductModal";
import { FaTrash } from "react-icons/fa";
import { ClipLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";

export default function Shoes() {
  // Notification state
  const [notification, setNotification] = useState(null);
  // Back navigation for mobile
  const handleBack = () => window.history.back();
  const [showAddModal, setShowAddModal] = useState(false);
  // Filter states
  const [filterGender, setFilterGender] = useState("");
  const [filterAge, setFilterAge] = useState("");
  const [filterColor, setFilterColor] = useState("");
  const [filterSizeUS, setFilterSizeUS] = useState("");
  const [filterSizeUK, setFilterSizeUK] = useState("");
  const [filterSizeEU, setFilterSizeEU] = useState("");
  const [filterSizeCM, setFilterSizeCM] = useState("");
  // Delete shoe handler
  const handleDeleteShoe = async (shoeId) => {
    if (!window.confirm("Are you sure you want to delete this shoe?")) return;
    try {
      const res = await fetch(
        `https://inventory-backend-gpon.onrender.com/api/shoes/${shoeId}`,
        {
          method: "DELETE",
        }
      );
      if (res.ok) {
        setShoes((prev) => prev.filter((s) => s._id !== shoeId));
        setNotification({ type: "success", message: "Shoe deleted!" });
      } else {
        setNotification({ type: "error", message: "Failed to delete shoe." });
      }
    } catch (err) {
      setNotification({ type: "error", message: "Error: " + err.message });
    }
  };
  const [showModal, setShowModal] = useState(false);
  const [shoes, setShoes] = useState([]);
  const [groupedShoes, setGroupedShoes] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Basic shoe size conversion table (example, can be expanded)
  const sizeConversionTable = [
    { US: "7", UK: "6", EU: "40", CM: "25" },
    { US: "8", UK: "7", EU: "41", CM: "26" },
    { US: "9", UK: "8", EU: "42", CM: "27" },
    { US: "10", UK: "9", EU: "43", CM: "28" },
    { US: "11", UK: "10", EU: "44", CM: "29" },
    // ...add more as needed
  ];
  // For size conversion
  const [sizeInputRegion, setSizeInputRegion] = useState("US");
  const [sizeInputValue, setSizeInputValue] = useState("");
  const [convertedSizes, setConvertedSizes] = useState({
    US: "",
    UK: "",
    EU: "",
    CM: "",
  });

  // Convert size when input changes
  useEffect(() => {
    if (!sizeInputValue) {
      setConvertedSizes({ US: "", UK: "", EU: "", CM: "" });
      return;
    }
    // Find the conversion row
    const row = sizeConversionTable.find(
      (r) => r[sizeInputRegion] === sizeInputValue
    );
    if (row) {
      setConvertedSizes(row);
    } else {
      // If not found, just set the entered value for the selected region
      setConvertedSizes({
        US: "",
        UK: "",
        EU: "",
        CM: "",
        [sizeInputRegion]: sizeInputValue,
      });
    }
  }, [sizeInputRegion, sizeInputValue]);
  useEffect(() => {
    fetch("https://inventory-backend-gpon.onrender.com/api/shoes")
      .then((res) => res.json())
      .then((result) => {
        // If paginated response, use result.data
        if (Array.isArray(result)) {
          setShoes(result);
        } else if (result && Array.isArray(result.data)) {
          setShoes(result.data);
        } else {
          setShoes([]);
        }
        setLoading(false);
      });
  }, []);
  useEffect(() => {
    fetch("https://inventory-backend-gpon.onrender.com/api/shoes/grouped")
      .then((res) => res.json())
      .then((data) => {
        setGroupedShoes(data);
        setLoading(false);
      });
  }, []);

  // Deduct stock handler
  const handleDeductStock = async (shoe) => {
    const quantityStr = prompt(
      `How many units to deduct from ${shoe.name}? (Current stock: ${shoe.stock})`
    );
    const quantity = parseInt(quantityStr, 10);
    if (!quantity || quantity <= 0) {
      setNotification({ type: "warning", message: "Enter a valid quantity" });
      return;
    }
    try {
      const res = await fetch(
        `https://inventory-backend-gpon.onrender.com/api/shoes/${shoe._id}/deduct`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity }),
        }
      );
      if (res.ok) {
        const updated = await res.json();
        setShoes((prev) =>
          prev.map((s) =>
            s._id === shoe._id ? { ...s, stock: updated.stock } : s
          )
        );
        setNotification({ type: "success", message: "Stock deducted successfully!" });
        if (updated.stock <= 5) {
          setNotification({
            type: "warning",
            message: `Low stock for ${shoe.name}: ${updated.stock} left!`,
          });
        }
      } else {
        const err = await res.json();
        setNotification({
          type: "error",
          message: "Error: " + (err.error || "Failed to deduct stock"),
        });
      }
    } catch (err) {
      setNotification({ type: "error", message: "Error: " + err.message });
    }
  };
  // Add stock handler
  const handleAddStock = async (shoe) => {
    const quantityStr = prompt(
      `How many units to add to ${shoe.name}? (Current stock: ${shoe.stock})`
    );
    const quantity = parseInt(quantityStr, 10);
    if (!quantity || quantity <= 0) {
      setNotification({ type: "warning", message: "Enter a valid quantity" });
      return;
    }
    try {
      const res = await fetch(
        `https://inventory-backend-gpon.onrender.com/api/shoes/${shoe._id}/add`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity }),
        }
      );
      if (res.ok) {
        const updated = await res.json();
        setShoes((prev) =>
          prev.map((s) =>
            s._id === shoe._id ? { ...s, stock: updated.stock } : s
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

  // Filtering logic for grouped shoes
  function getFilteredGroupedShoes() {
    const grouped = groupedShoes || {};
    const filtered = {};
    Object.entries(grouped).forEach(([name, shoes]) => {
      filtered[name] = shoes.filter((shoe) => {
        // Use fallback empty string for .toLowerCase()
        const shoeName = (shoe.name || "").toLowerCase();
        const shoeColor = (shoe.color || "").toLowerCase();
        // Example: search filter
        return shoeName.includes(search.toLowerCase()) ||
               shoeColor.includes(search.toLowerCase());
        // Add other filter conditions as needed
      });
    });
    return filtered;
  }

  const handleViewLogs = (id) => {
    navigate(`/shoes/${id}/logs`);
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
        {/* Back Arrow for mobile */}
        <div className="flex items-center gap-2 mb-2 lg:hidden">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center text-blue-600 hover:text-blue-800 focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6 mr-1"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="font-semibold text-base">Back</span>
          </button>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-center tracking-tight">
            Shoes
          </h2>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg text-base"
            onClick={() => setShowAddModal(true)}
          >
            + Add Shoe
          </button>
        </div>
        {/* Filter Section - Redesigned for mobile */}
        <div className="mb-6">
          <details className="block sm:hidden mb-2">
            <summary className="cursor-pointer px-4 py-2 bg-blue-100 rounded-lg font-semibold text-blue-700 shadow">
              Show Filters
            </summary>
            <div className="flex flex-col gap-3 mt-2 p-2">
              <input
                type="text"
                placeholder="Search name, size, color..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-3 py-2 border border-blue-300 rounded-lg w-full focus:outline-none focus:border-blue-500 transition shadow-sm"
              />
              <select
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
                className="px-3 py-2 border border-blue-300 rounded-lg w-full focus:outline-none focus:border-blue-500 transition shadow-sm"
              >
                <option value="">Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="unisex">Unisex</option>
              </select>
              <select
                value={filterAge}
                onChange={(e) => setFilterAge(e.target.value)}
                className="px-3 py-2 border border-blue-300 rounded-lg w-full focus:outline-none focus:border-blue-500 transition shadow-sm"
              >
                <option value="">Age Group</option>
                <option value="adult">Adult</option>
                <option value="child">Child</option>
              </select>
              <input
                type="text"
                placeholder="Color"
                value={filterColor}
                onChange={(e) => setFilterColor(e.target.value)}
                className="px-3 py-2 border border-blue-300 rounded-lg w-full focus:outline-none focus:border-blue-500 transition shadow-sm"
              />
              <input
                type="text"
                placeholder="US Size"
                value={filterSizeUS}
                onChange={(e) => setFilterSizeUS(e.target.value)}
                className="px-3 py-2 border border-blue-300 rounded-lg w-full focus:outline-none focus:border-blue-500 transition shadow-sm"
              />
              <input
                type="text"
                placeholder="UK Size"
                value={filterSizeUK}
                onChange={(e) => setFilterSizeUK(e.target.value)}
                className="px-3 py-2 border border-blue-300 rounded-lg w-full focus:outline-none focus:border-blue-500 transition shadow-sm"
              />
              <input
                type="text"
                placeholder="EU Size"
                value={filterSizeEU}
                onChange={(e) => setFilterSizeEU(e.target.value)}
                className="px-3 py-2 border border-blue-300 rounded-lg w-full focus:outline-none focus:border-blue-500 transition shadow-sm"
              />
              <input
                type="text"
                placeholder="CM Size"
                value={filterSizeCM}
                onChange={(e) => setFilterSizeCM(e.target.value)}
                className="px-3 py-2 border border-blue-300 rounded-lg w-full focus:outline-none focus:border-blue-500 transition shadow-sm"
              />
            </div>
          </details>
          <div className="hidden sm:flex bg-blue-50/80 backdrop-blur-md rounded-xl shadow flex-col md:flex-row items-center justify-between gap-4 p-4 border border-blue-200">
            <div className="flex flex-col md:flex-row gap-4 w-full">
              <div className="flex flex-col items-start w-full md:w-48">
                <label className="text-xs font-semibold text-blue-700 mb-1 flex items-center gap-1">
                  <span role="img" aria-label="search">
                    🔍
                  </span>
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Name, size, color..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="px-3 py-2 border border-blue-300 rounded-lg w-full focus:outline-none focus:border-blue-500 transition shadow-sm"
                />
              </div>
              <div className="flex flex-col items-start w-full md:w-40">
                <label className="text-xs font-semibold text-blue-700 mb-1 flex items-center gap-1">
                  <span role="img" aria-label="gender">
                    🧑‍🤝‍🧑
                  </span>
                  Gender
                </label>
                <select
                  value={filterGender}
                  onChange={(e) => setFilterGender(e.target.value)}
                  className="px-3 py-2 border border-blue-300 rounded-lg w-full focus:outline-none focus:border-blue-500 transition shadow-sm"
                >
                  <option value="">All</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="unisex">Unisex</option>
                </select>
              </div>
              <div className="flex flex-col items-start w-full md:w-40">
                <label className="text-xs font-semibold text-blue-700 mb-1 flex items-center gap-1">
                  <span role="img" aria-label="age">
                    🎂
                  </span>
                  Age Group
                </label>
                <select
                  value={filterAge}
                  onChange={(e) => setFilterAge(e.target.value)}
                  className="px-3 py-2 border border-blue-300 rounded-lg w-full focus:outline-none focus:border-blue-500 transition shadow-sm"
                >
                  <option value="">All</option>
                  <option value="adult">Adult</option>
                  <option value="child">Child</option>
                </select>
              </div>
              <div className="flex flex-col items-start w-full md:w-40">
                <label className="text-xs font-semibold text-blue-700 mb-1 flex items-center gap-1">
                  <span role="img" aria-label="color">
                    🎨
                  </span>
                  Color
                </label>
                <input
                  type="text"
                  placeholder="Color"
                  value={filterColor}
                  onChange={(e) => setFilterColor(e.target.value)}
                  className="px-3 py-2 border border-blue-300 rounded-lg w-full focus:outline-none focus:border-blue-500 transition shadow-sm"
                />
              </div>
              {/* Size Filters */}
              <div className="flex flex-col items-start w-full md:w-32">
                <label className="text-xs font-semibold text-blue-700 mb-1 flex items-center gap-1">
                  US Size
                </label>
                <input
                  type="text"
                  placeholder="US"
                  value={filterSizeUS}
                  onChange={(e) => setFilterSizeUS(e.target.value)}
                  className="px-3 py-2 border border-blue-300 rounded-lg w-full focus:outline-none focus:border-blue-500 transition shadow-sm"
                />
              </div>
              <div className="flex flex-col items-start w-full md:w-32">
                <label className="text-xs font-semibold text-blue-700 mb-1 flex items-center gap-1">
                  UK Size
                </label>
                <input
                  type="text"
                  placeholder="UK"
                  value={filterSizeUK}
                  onChange={(e) => setFilterSizeUK(e.target.value)}
                  className="px-3 py-2 border border-blue-300 rounded-lg w-full focus:outline-none focus:border-blue-500 transition shadow-sm"
                />
              </div>
              <div className="flex flex-col items-start w-full md:w-32">
                <label className="text-xs font-semibold text-blue-700 mb-1 flex items-center gap-1">
                  EU Size
                </label>
                <input
                  type="text"
                  placeholder="EU"
                  value={filterSizeEU}
                  onChange={(e) => setFilterSizeEU(e.target.value)}
                  className="px-3 py-2 border border-blue-300 rounded-lg w-full focus:outline-none focus:border-blue-500 transition shadow-sm"
                />
              </div>
              <div className="flex flex-col items-start w-full md:w-32">
                <label className="text-xs font-semibold text-blue-700 mb-1 flex items-center gap-1">
                  CM Size
                </label>
                <input
                  type="text"
                  placeholder="CM"
                  value={filterSizeCM}
                  onChange={(e) => setFilterSizeCM(e.target.value)}
                  className="px-3 py-2 border border-blue-300 rounded-lg w-full focus:outline-none focus:border-blue-500 transition shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <ClipLoader color="#2563eb" size={48} />
          </div>
        ) : (
          <div>
            {Object.entries(getFilteredGroupedShoes()).map(([name, shoes], idx, arr) => (
              <React.Fragment key={name}>
                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-3 text-blue-700 px-2 sm:px-0">{name}</h2>
                  <div className="flex flex-row gap-3 sm:gap-4 overflow-x-auto pb-4 px-2 sm:px-0 -mx-2 sm:mx-0">
                    {shoes.map((shoe) => (
                      <div
                        key={shoe._id}
                        className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-row group p-0 overflow-hidden border border-blue-100 w-full min-w-[300px] sm:min-w-0 sm:max-w-xl h-44 sm:h-48 flex-shrink-0"
                        onClick={() => handleViewLogs(shoe._id)}
                      >
                        <div className="w-36 sm:w-40 bg-gradient-to-br from-blue-50 to-blue-100 p-2 flex-shrink-0 flex items-center justify-center">
                          <img
                            src={shoe.image_url}
                            alt={shoe.name}
                            className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
                            style={{
                              filter: "drop-shadow(0 2px 10px rgba(0,0,0,0.1))"
                            }}
                            loading="lazy"
                          />
                        </div>
                        <div className="p-2 sm:p-3 flex-1 flex flex-col overflow-hidden">
                          <h3 className="font-bold text-gray-900 text-sm sm:text-base truncate">{shoe.name}</h3>
                          <div className="grid grid-cols-2 gap-1 text-xs sm:text-sm text-gray-600 mt-1">
                            <div className="truncate">
                              <span className="text-gray-500 text-[11px] sm:text-xs">Size: </span>
                              <span className="font-medium text-xs sm:text-sm">
                                {[shoe.sizes?.US, shoe.sizes?.UK, shoe.sizes?.EU, shoe.sizes?.CM]
                                  .filter(Boolean)
                                  .join(' / ') || '-'}
                              </span>
                            </div>
                            <div className="truncate">
                              <span className="text-gray-500 text-[11px] sm:text-xs">Color: </span>
                              <span className="font-medium text-xs sm:text-sm">{shoe.color}</span>
                            </div>
                            <div className="truncate">
                              <span className="text-gray-500 text-[11px] sm:text-xs">Stock: </span>
                              <span className="font-medium text-xs sm:text-sm">{shoe.stock}</span>
                            </div>
                            <div className="truncate">
                              <span className="text-gray-500 text-[11px] sm:text-xs">Price: </span>
                              <span className="font-medium text-xs sm:text-sm">${shoe.price}</span>
                            </div>
                          </div>
                          <div className="mt-1 text-[11px] sm:text-xs text-gray-500 line-clamp-2">
                            {shoe.description}
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
                            <button
                              className="bg-green-500 text-white px-2 py-1 sm:py-0.5 rounded-lg text-[11px] sm:text-xs font-medium hover:bg-green-600 transition-colors"
                              onClick={(e) => { e.stopPropagation(); handleAddStock(shoe); }}
                            >
                              + Stock
                            </button>
                            <button
                              className="bg-blue-500 text-white px-2 py-1 sm:py-0.5 rounded-lg text-[11px] sm:text-xs font-medium hover:bg-blue-600 transition-colors"
                              onClick={(e) => { e.stopPropagation(); handleDeductStock(shoe); }}
                            >
                              - Stock
                            </button>
                            <button
                              className="bg-yellow-500 text-white px-2 py-1 sm:py-0.5 rounded-lg text-[11px] sm:text-xs font-medium hover:bg-yellow-600 transition-colors"
                              onClick={(e) => { e.stopPropagation(); setEditId(shoe._id); setEditForm({ ...shoe }); setShowModal(true); }}
                            >
                              Edit
                            </button>
                            <button
                              className="text-red-500 hover:text-red-700 p-1 rounded-full ml-auto"
                              title="Delete"
                              onClick={(e) => { e.stopPropagation(); handleDeleteShoe(shoe._id); }}
                            >
                              <FaTrash size={14} className="sm:w-4 sm:h-4 w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {idx < arr.length - 1 && (
                  <hr className="my-6 border-blue-200" />
                )}
              </React.Fragment>
            ))}
          </div>
        )}
        {/* Modal for editing shoe - moved outside grid */}
        {showAddModal && (
          <div
            className="fixed inset-0 bg-white bg-opacity-30 flex justify-center items-center z-50"
            style={{ backdropFilter: "blur(8px)" }}
          >
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
              <AddProductModal
                category="Shoes"
                onClose={() => setShowAddModal(false)}
              />
            </div>
          </div>
        )}
      </div>
    {showAddModal && (
  <div
    className="fixed inset-0 bg-white bg-opacity-30 flex justify-center items-center z-50"
    style={{ backdropFilter: "blur(8px)" }}
  >
    <div
      className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full"
      style={{
        maxHeight: "80vh", // Limit height to 80% of viewport
        overflowY: "auto", // Enable vertical scrolling
      }}
    >
      <AddProductModal
        category="Shoes"
        onClose={() => setShowAddModal(false)}
      />
    </div>
  </div>
)}{shoes.map((shoe) => (
  <div
    key={shoe._id}
    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-row group p-0 overflow-hidden border border-blue-100 w-full max-w-xl h-48"
    onClick={() => handleViewLogs(shoe._id)}
  >
    <div className="w-48 bg-gradient-to-br from-blue-50 to-blue-100 p-2 flex-shrink-0 flex items-center justify-center">
      <img
        src={shoe.image_url}
        alt={shoe.name}
        className="h-full w-full object-contain group-hover:scale-110 transition-transform duration-300"
        style={{
          filter: "drop-shadow(0 2px 10px rgba(0,0,0,0.1))"
        }}
      />
    </div>
    <div className="p-3 flex-1 flex flex-col overflow-hidden">
      <h3 className="font-bold text-gray-900 text-sm truncate">{shoe.name}</h3>
      <div className="grid grid-cols-2 gap-1 text-xs text-gray-600 mt-1">
        <div className="truncate">
          <span className="text-gray-500">Size: </span>
          <span className="font-medium">
            {[shoe.sizes?.US, shoe.sizes?.UK, shoe.sizes?.EU, shoe.sizes?.CM]
              .filter(Boolean)
              .join(' / ') || '-'}
          </span>
        </div>
        <div className="truncate">
          <span className="text-gray-500">Color: </span>
          <span className="font-medium">{shoe.color}</span>
        </div>
        <div className="truncate">
          <span className="text-gray-500">Stock: </span>
          <span className="font-medium">{shoe.stock}</span>
        </div>
        <div className="truncate">
          <span className="text-gray-500">Price: </span>
          <span className="font-medium">${shoe.price}</span>
        </div>
      </div>
      <div className="mt-1 text-xs text-gray-500 line-clamp-2">
        {shoe.description}
      </div>
      <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
        <button
          className="bg-green-500 text-white px-2 py-0.5 rounded text-xs font-medium hover:bg-green-600 transition-colors"
          onClick={(e) => { e.stopPropagation(); handleAddStock(shoe); }}
        >
          + Stock
        </button>
        <button
          className="bg-blue-500 text-white px-2 py-0.5 rounded text-xs font-medium hover:bg-blue-600 transition-colors"
          onClick={(e) => { e.stopPropagation(); handleDeductStock(shoe); }}
        >
          - Stock
        </button>
        <button
          className="bg-yellow-500 text-white px-2 py-0.5 rounded text-xs font-medium hover:bg-yellow-600 transition-colors"
          onClick={(e) => { e.stopPropagation(); setEditId(shoe._id); setEditForm({ ...shoe }); setShowModal(true); }}
        >
          Edit
        </button>
        <button
          className="text-red-500 hover:text-red-700 p-1 rounded-full ml-auto"
          title="Delete"
          onClick={(e) => { e.stopPropagation(); handleDeleteShoe(shoe._id); }}
        >
          <FaTrash size={12} />
        </button>
      </div>
    </div>
  </div>
))}
    </>
  );
}
