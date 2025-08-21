
import React, { useEffect, useState } from 'react';
import Notification from '../components/Notification';
import AddProductModal from './AddProductModal';
import { FaTrash } from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';
import { useNavigate } from "react-router-dom";

export default function Shoes() {
  // Notification state
  const [notification, setNotification] = useState(null);
  // Back navigation for mobile
  const handleBack = () => window.history.back();
  const [showAddModal, setShowAddModal] = useState(false);
  // Filter states
  const [filterGender, setFilterGender] = useState('');
  const [filterAge, setFilterAge] = useState('');
  const [filterColor, setFilterColor] = useState('');
  const [filterSizeUS, setFilterSizeUS] = useState('');
  const [filterSizeUK, setFilterSizeUK] = useState('');
  const [filterSizeEU, setFilterSizeEU] = useState('');
  const [filterSizeCM, setFilterSizeCM] = useState('');
  // ...existing code...
  // Delete shoe handler
  const handleDeleteShoe = async (shoeId) => {
    if (!window.confirm('Are you sure you want to delete this shoe?')) return;
    try {
      const res = await fetch(`http://https://inventory-backend-gpon.onrender.com/api/shoes/${shoeId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setShoes(prev => prev.filter(s => s._id !== shoeId));
        setNotification({ type: 'success', message: 'Shoe deleted!' });
      } else {
        setNotification({ type: 'error', message: 'Failed to delete shoe.' });
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Error: ' + err.message });
    }
  };
  const [showModal, setShowModal] = useState(false);
  const [shoes, setShoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});

    // Basic shoe size conversion table (example, can be expanded)
    const sizeConversionTable = [
      { US: '7', UK: '6', EU: '40', CM: '25' },
      { US: '8', UK: '7', EU: '41', CM: '26' },
      { US: '9', UK: '8', EU: '42', CM: '27' },
      { US: '10', UK: '9', EU: '43', CM: '28' },
      { US: '11', UK: '10', EU: '44', CM: '29' },
      // ...add more as needed
    ];
    // For size conversion
    const [sizeInputRegion, setSizeInputRegion] = useState('US');
    const [sizeInputValue, setSizeInputValue] = useState('');
    const [convertedSizes, setConvertedSizes] = useState({ US: '', UK: '', EU: '', CM: '' });

    // Convert size when input changes
    useEffect(() => {
      if (!sizeInputValue) {
        setConvertedSizes({ US: '', UK: '', EU: '', CM: '' });
        return;
      }
      // Find the conversion row
      const row = sizeConversionTable.find(r => r[sizeInputRegion] === sizeInputValue);
      if (row) {
        setConvertedSizes(row);
      } else {
        // If not found, just set the entered value for the selected region
        setConvertedSizes({ US: '', UK: '', EU: '', CM: '', [sizeInputRegion]: sizeInputValue });
      }
    }, [sizeInputRegion, sizeInputValue]);
  useEffect(() => {
    fetch('http://https://inventory-backend-gpon.onrender.com/api/shoes')
      .then(res => res.json())
      .then(result => {
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

  // Deduct stock handler
  const handleDeductStock = async (shoe) => {
    const quantityStr = prompt(`How many units to deduct from ${shoe.name}? (Current stock: ${shoe.stock})`);
    const quantity = parseInt(quantityStr, 10);
    if (!quantity || quantity <= 0) {
      setNotification({ type: 'warning', message: 'Enter a valid quantity' });
      return;
    }
    try {
      const res = await fetch(`http://https://inventory-backend-gpon.onrender.com/api/shoes/${shoe._id}/deduct`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });
      if (res.ok) {
        const updated = await res.json();
        setShoes((prev) => prev.map((s) => s._id === shoe._id ? { ...s, stock: updated.stock } : s));
        setNotification({ type: 'success', message: 'Stock deducted successfully!' });
        if (updated.stock <= 5) {
          setNotification({ type: 'warning', message: `Low stock for ${shoe.name}: ${updated.stock} left!` });
        }
      } else {
        const err = await res.json();
        setNotification({ type: 'error', message: 'Error: ' + (err.error || 'Failed to deduct stock') });
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Error: ' + err.message });
    }
  };
  // Add stock handler
  const handleAddStock = async (shoe) => {
    const quantityStr = prompt(`How many units to add to ${shoe.name}? (Current stock: ${shoe.stock})`);
    const quantity = parseInt(quantityStr, 10);
    if (!quantity || quantity <= 0) {
      setNotification({ type: 'warning', message: 'Enter a valid quantity' });
      return;
    }
    try {
      const res = await fetch(`http://https://inventory-backend-gpon.onrender.com/api/shoes/${shoe._id}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });
      if (res.ok) {
        const updated = await res.json();
        setShoes((prev) => prev.map((s) => s._id === shoe._id ? { ...s, stock: updated.stock } : s));
        setNotification({ type: 'success', message: 'Stock added successfully!' });
      } else {
        const err = await res.json();
        setNotification({ type: 'error', message: 'Error: ' + (err.error || 'Failed to add stock') });
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Error: ' + err.message });
    }
  };

  const filteredShoes = shoes.filter((shoe) => {
    // Text search
    const matchesSearch =
      shoe.name.toLowerCase().includes(search.toLowerCase()) ||
      (shoe.sizes?.US || '').toLowerCase().includes(search.toLowerCase()) ||
      (shoe.sizes?.UK || '').toLowerCase().includes(search.toLowerCase()) ||
      (shoe.sizes?.EU || '').toLowerCase().includes(search.toLowerCase()) ||
      (shoe.sizes?.CM || '').toLowerCase().includes(search.toLowerCase()) ||
      (shoe.color || '').toLowerCase().includes(search.toLowerCase());

    // Gender filter
    const matchesGender = filterGender ? shoe.gender === filterGender : true;
    // Age group filter
    const matchesAge = filterAge ? shoe.ageGroup === filterAge : true;
    // Color filter
    const matchesColor = filterColor ? (shoe.color || '').toLowerCase() === filterColor.toLowerCase() : true;
  // Size filters
  const matchesSizeUS = filterSizeUS ? (shoe.sizes?.US || '').toLowerCase() === filterSizeUS.toLowerCase() : true;
  const matchesSizeUK = filterSizeUK ? (shoe.sizes?.UK || '').toLowerCase() === filterSizeUK.toLowerCase() : true;
  const matchesSizeEU = filterSizeEU ? (shoe.sizes?.EU || '').toLowerCase() === filterSizeEU.toLowerCase() : true;
  const matchesSizeCM = filterSizeCM ? (shoe.sizes?.CM || '').toLowerCase() === filterSizeCM.toLowerCase() : true;

  return matchesSearch && matchesGender && matchesAge && matchesColor && matchesSizeUS && matchesSizeUK && matchesSizeEU && matchesSizeCM;
  });
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
          <button type="button" onClick={handleBack} className="flex items-center text-blue-600 hover:text-blue-800 focus:outline-none">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-semibold text-base">Back</span>
          </button>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-center tracking-tight">Shoes</h2>
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
            <summary className="cursor-pointer px-4 py-2 bg-blue-100 rounded-lg font-semibold text-blue-700 shadow">Show Filters</summary>
            <div className="flex flex-col gap-3 mt-2 p-2">
              <input type="text" placeholder="Search name, size, color..." value={search} onChange={e => setSearch(e.target.value)} className="px-3 py-2 border border-blue-300 rounded-lg w-full focus:outline-none focus:border-blue-500 transition shadow-sm" />
              <select value={filterGender} onChange={e => setFilterGender(e.target.value)} className="px-3 py-2 border border-blue-300 rounded-lg w-full focus:outline-none focus:border-blue-500 transition shadow-sm">
                <option value="">Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="unisex">Unisex</option>
              </select>
              <select value={filterAge} onChange={e => setFilterAge(e.target.value)} className="px-3 py-2 border border-blue-300 rounded-lg w-full focus:outline-none focus:border-blue-500 transition shadow-sm">
                <option value="">Age Group</option>
                <option value="adult">Adult</option>
                <option value="child">Child</option>
              </select>
              <input type="text" placeholder="Color" value={filterColor} onChange={e => setFilterColor(e.target.value)} className="px-3 py-2 border border-blue-300 rounded-lg w-full focus:outline-none focus:border-blue-500 transition shadow-sm" />
              <input type="text" placeholder="US Size" value={filterSizeUS} onChange={e => setFilterSizeUS(e.target.value)} className="px-3 py-2 border border-blue-300 rounded-lg w-full focus:outline-none focus:border-blue-500 transition shadow-sm" />
              <input type="text" placeholder="UK Size" value={filterSizeUK} onChange={e => setFilterSizeUK(e.target.value)} className="px-3 py-2 border border-blue-300 rounded-lg w-full focus:outline-none focus:border-blue-500 transition shadow-sm" />
              <input type="text" placeholder="EU Size" value={filterSizeEU} onChange={e => setFilterSizeEU(e.target.value)} className="px-3 py-2 border border-blue-300 rounded-lg w-full focus:outline-none focus:border-blue-500 transition shadow-sm" />
              <input type="text" placeholder="CM Size" value={filterSizeCM} onChange={e => setFilterSizeCM(e.target.value)} className="px-3 py-2 border border-blue-300 rounded-lg w-full focus:outline-none focus:border-blue-500 transition shadow-sm" />
            </div>
          </details>
          <div className="hidden sm:flex bg-blue-50/80 backdrop-blur-md rounded-xl shadow flex-col md:flex-row items-center justify-between gap-4 p-4 border border-blue-200">
            <div className="flex flex-col md:flex-row gap-4 w-full">
              <div className="flex flex-col items-start w-full md:w-48">
                <label className="text-xs font-semibold text-blue-700 mb-1 flex items-center gap-1"><span role="img" aria-label="search">🔍</span>Search</label>
                <input type="text" placeholder="Name, size, color..." value={search} onChange={e => setSearch(e.target.value)} className="px-3 py-2 border border-blue-300 rounded-lg w-full focus:outline-none focus:border-blue-500 transition shadow-sm" />
              </div>
              <div className="flex flex-col items-start w-full md:w-40">
                <label className="text-xs font-semibold text-blue-700 mb-1 flex items-center gap-1"><span role="img" aria-label="gender">🧑‍🤝‍🧑</span>Gender</label>
                <select value={filterGender} onChange={e => setFilterGender(e.target.value)} className="px-3 py-2 border border-blue-300 rounded-lg w-full focus:outline-none focus:border-blue-500 transition shadow-sm">
                  <option value="">All</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="unisex">Unisex</option>
                </select>
              </div>
              <div className="flex flex-col items-start w-full md:w-40">
                <label className="text-xs font-semibold text-blue-700 mb-1 flex items-center gap-1"><span role="img" aria-label="age">🎂</span>Age Group</label>
                <select value={filterAge} onChange={e => setFilterAge(e.target.value)} className="px-3 py-2 border border-blue-300 rounded-lg w-full focus:outline-none focus:border-blue-500 transition shadow-sm">
                  <option value="">All</option>
                  <option value="adult">Adult</option>
                  <option value="child">Child</option>
                </select>
              </div>
              <div className="flex flex-col items-start w-full md:w-40">
                <label className="text-xs font-semibold text-blue-700 mb-1 flex items-center gap-1"><span role="img" aria-label="color">🎨</span>Color</label>
                <input type="text" placeholder="Color" value={filterColor} onChange={e => setFilterColor(e.target.value)} className="px-3 py-2 border border-blue-300 rounded-lg w-full focus:outline-none focus:border-blue-500 transition shadow-sm" />
              </div>
              {/* Size Filters */}
              <div className="flex flex-col items-start w-full md:w-32">
                <label className="text-xs font-semibold text-blue-700 mb-1 flex items-center gap-1">US Size</label>
                <input type="text" placeholder="US" value={filterSizeUS} onChange={e => setFilterSizeUS(e.target.value)} className="px-3 py-2 border border-blue-300 rounded-lg w-full focus:outline-none focus:border-blue-500 transition shadow-sm" />
              </div>
              <div className="flex flex-col items-start w-full md:w-32">
                <label className="text-xs font-semibold text-blue-700 mb-1 flex items-center gap-1">UK Size</label>
                <input type="text" placeholder="UK" value={filterSizeUK} onChange={e => setFilterSizeUK(e.target.value)} className="px-3 py-2 border border-blue-300 rounded-lg w-full focus:outline-none focus:border-blue-500 transition shadow-sm" />
              </div>
              <div className="flex flex-col items-start w-full md:w-32">
                <label className="text-xs font-semibold text-blue-700 mb-1 flex items-center gap-1">EU Size</label>
                <input type="text" placeholder="EU" value={filterSizeEU} onChange={e => setFilterSizeEU(e.target.value)} className="px-3 py-2 border border-blue-300 rounded-lg w-full focus:outline-none focus:border-blue-500 transition shadow-sm" />
              </div>
              <div className="flex flex-col items-start w-full md:w-32">
                <label className="text-xs font-semibold text-blue-700 mb-1 flex items-center gap-1">CM Size</label>
                <input type="text" placeholder="CM" value={filterSizeCM} onChange={e => setFilterSizeCM(e.target.value)} className="px-3 py-2 border border-blue-300 rounded-lg w-full focus:outline-none focus:border-blue-500 transition shadow-sm" />
              </div>
            </div>
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-40"><ClipLoader color="#2563eb" size={48} /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {filteredShoes.map((shoe) => (
              <div
                key={shoe._id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 cursor-pointer flex flex-col group p-0 overflow-hidden border border-blue-100 min-h-[340px] sm:min-h-[480px]"
                onClick={() => handleViewLogs(shoe._id)}
              >
                <div className="w-full flex justify-center items-center bg-gradient-to-br from-blue-50 to-blue-100 p-4 sm:p-6">
                  <img
                    src={shoe.image_url}
                    alt={shoe.name}
                    className="h-28 w-28 sm:h-44 sm:w-44 object-cover rounded-xl border-2 border-blue-200 group-hover:scale-105 transition-transform duration-300 bg-gray-50"
                    style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
                  />
                </div>
                <div className="flex flex-col gap-2 px-3 sm:px-6 pt-2 sm:pt-4 pb-2">
                  <div className="font-bold text-lg sm:text-xl mb-1 text-blue-900 truncate">{shoe.name}</div>
                  <div className="flex flex-wrap gap-2 sm:gap-4 text-sm text-gray-600 mb-1">
                    <span>Gender: <span className="font-semibold">{shoe.gender || 'Unisex'}</span></span>
                    <span>Age: <span className="font-semibold">{shoe.ageGroup || 'Adult'}</span></span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm text-gray-600 mb-1">
                    <span className="font-semibold">Sizes:</span>
                    <span className="ml-1">US: <span className="font-semibold">{shoe.sizes?.US || '-'}</span></span>
                    <span>UK: <span className="font-semibold">{shoe.sizes?.UK || '-'}</span></span>
                    <span>EU: <span className="font-semibold">{shoe.sizes?.EU || '-'}</span></span>
                    <span>CM: <span className="font-semibold">{shoe.sizes?.CM || '-'}</span></span>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:gap-4 text-sm text-gray-600 mb-1">
                    <span>Color: <span className="font-semibold">{shoe.color}</span></span>
                    <span>Stock: <span className="font-semibold">{shoe.stock}</span></span>
                  </div>
                  <div className="text-sm text-gray-600 mb-1">Price: <span className="font-semibold">${shoe.price}</span></div>
                  <div className="text-xs text-gray-500 mb-2 text-left">{shoe.description}</div>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-3 px-3 sm:px-6 pb-4 mt-auto items-center justify-end">
                  <button
                    className="bg-green-600 text-white px-4 py-2 sm:px-2 sm:py-1 rounded-xl font-semibold shadow hover:bg-green-700 transition text-xs"
                    onClick={e => { e.stopPropagation(); handleAddStock(shoe); }}
                  >
                    Add Stock
                  </button>
                  <button
                    className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-2 sm:px-2 sm:py-1 rounded-xl font-semibold shadow hover:from-blue-600 hover:to-blue-800 transition text-xs"
                    onClick={e => { e.stopPropagation(); handleDeductStock(shoe); }}
                  >
                    Deduct
                  </button>
                  <button
                    className="bg-yellow-500 text-white px-4 py-2 sm:px-2 sm:py-1 rounded-xl font-semibold shadow hover:bg-yellow-600 transition text-xs"
                    onClick={e => { e.stopPropagation(); setEditId(shoe._id); setEditForm({ ...shoe }); setShowModal(true); }}
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-500 hover:text-red-700 p-2 rounded-full"
                    title="Delete"
                    onClick={e => { e.stopPropagation(); handleDeleteShoe(shoe._id); }}
                  >
                    <FaTrash size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Modal for editing shoe - moved outside grid */}
          {showAddModal && (
            <div className="fixed inset-0 bg-white bg-opacity-30 flex justify-center items-center z-50" style={{ backdropFilter: 'blur(8px)' }}>
              <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                <AddProductModal category="Shoes" onClose={() => setShowAddModal(false)} />
              </div>
            </div>
          )}
      </div>
      {showModal && (
  <div className="fixed inset-0 bg-white bg-opacity-30 flex justify-center items-center z-50" style={{ backdropFilter: 'blur(8px)' }}>
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
            <h3 className="text-xl font-bold mb-4">Edit Shoe</h3>
            <form className="space-y-2" onSubmit={async e => {
              e.preventDefault();
              // Save converted sizes to editForm
              const updatedForm = {
                ...editForm,
                sizes: { ...convertedSizes }
              };
              try {
                const res = await fetch(`http://https://inventory-backend-gpon.onrender.com/api/shoes/${editId}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(updatedForm),
                });
                if (res.ok) {
                  const updated = await res.json();
                  setShoes(prev => prev.map(s => s._id === updated._id ? updated : s));
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
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Name</label>
                <input name="name" value={editForm.name || ''} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-200" required />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Color</label>
                <input name="color" value={editForm.color || ''} onChange={e => setEditForm(f => ({ ...f, color: e.target.value }))} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-200" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Stock</label>
                  <input name="stock" type="number" value={editForm.stock || ''} onChange={e => setEditForm(f => ({ ...f, stock: e.target.value }))} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-200" required />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Price</label>
                  <input name="price" type="number" value={editForm.price || ''} onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-200" required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Description</label>
                <textarea name="description" value={editForm.description || ''} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-200" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Gender</label>
                  <select name="gender" value={editForm.gender || ''} onChange={e => setEditForm(f => ({ ...f, gender: e.target.value }))} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-200" required>
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Age Group</label>
                  <select name="ageGroup" value={editForm.ageGroup || ''} onChange={e => setEditForm(f => ({ ...f, ageGroup: e.target.value }))} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-200" required>
                    <option value="">Select Age Group</option>
                    <option value="adult">Adult</option>
                    <option value="child">Child</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 p-4 rounded-lg bg-blue-50 shadow">
                <div className="flex items-center gap-2 mb-2">
                  <label htmlFor="region" className="font-semibold text-blue-700">Choose Region:</label>
                  <select id="region" value={sizeInputRegion} onChange={e => { setSizeInputRegion(e.target.value); setSizeInputValue(''); }} className="px-2 py-1 border rounded">
                    <option value="US">US</option>
                    <option value="UK">UK</option>
                    <option value="EU">EU</option>
                    <option value="CM">CM</option>
                  </select>
                  <input
                    type="text"
                    value={sizeInputValue}
                    onChange={e => setSizeInputValue(e.target.value)}
                    placeholder={`Enter ${sizeInputRegion} size`}
                    className="w-32 px-2 py-1 border rounded"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded shadow text-center text-blue-700 font-semibold">US: {convertedSizes.US}</div>
                  <div className="bg-white p-3 rounded shadow text-center text-blue-700 font-semibold">UK: {convertedSizes.UK}</div>
                  <div className="bg-white p-3 rounded shadow text-center text-blue-700 font-semibold">EU: {convertedSizes.EU}</div>
                  <div className="bg-white p-3 rounded shadow text-center text-blue-700 font-semibold">CM: {convertedSizes.CM}</div>
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold shadow">Save</button>
                <button type="button" className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-lg font-semibold shadow" onClick={() => { setEditId(null); setShowModal(false); }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
