import React, { useState } from 'react';

export default function AddProductModal({ category, onClose }) {
  const [form, setForm] = useState({
    name: '',
    category: category || '',
    color: '',
    stock: '',
    price: '',
    description: '',
    image: null,
    gender: '',
    ageGroup: '',
    sizes: { US: '', UK: '', EU: '', CM: '' },
  });

  // Size conversion logic
  const sizeConversionTable = [
    { US: '7', UK: '6', EU: '40', CM: '25' },
    { US: '8', UK: '7', EU: '41', CM: '26' },
    { US: '9', UK: '8', EU: '42', CM: '27' },
    { US: '10', UK: '9', EU: '43', CM: '28' },
    { US: '11', UK: '10', EU: '44', CM: '29' },
    // ...add more as needed
  ];
  const [sizeInputRegion, setSizeInputRegion] = useState('US');
  const [sizeInputValue, setSizeInputValue] = useState('');
  const [convertedSizes, setConvertedSizes] = useState({ US: '', UK: '', EU: '', CM: '' });

  React.useEffect(() => {
    if (!sizeInputValue) {
      setConvertedSizes({ US: '', UK: '', EU: '', CM: '' });
      return;
    }
    const row = sizeConversionTable.find(r => r[sizeInputRegion] === sizeInputValue);
    if (row) {
      setConvertedSizes(row);
    } else {
      setConvertedSizes({ US: '', UK: '', EU: '', CM: '', [sizeInputRegion]: sizeInputValue });
    }
  }, [sizeInputRegion, sizeInputValue]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'sizeInputRegion') {
      setSizeInputRegion(value);
      setSizeInputValue('');
    } else if (name === 'sizeInputValue') {
      setSizeInputValue(value);
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: files ? files[0] : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = '';
      if (form.image) {
        const cloudData = new FormData();
        cloudData.append('file', form.image);
        cloudData.append('upload_preset', 'aunty-inventory');
        const cloudRes = await fetch('https://api.cloudinary.com/v1_1/dh9jadlh2/image/upload', {
          method: 'POST',
          body: cloudData,
        });
        const cloudJson = await cloudRes.json();
        imageUrl = cloudJson.secure_url;
      }
      let payload = {
        name: form.name,
        category: category,
        color: form.color,
        stock: form.stock,
        price: form.price,
        description: form.description,
        image_url: imageUrl,
      };
      if (category === 'Shoes') {
        payload.gender = form.gender;
        payload.ageGroup = form.ageGroup;
        payload.sizes = convertedSizes;
      }
      const res = await fetch(`http://https://inventory-backend-gpon.onrender.com/api/${category.toLowerCase()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        alert('Product added successfully!');
        onClose();
      } else {
        alert('Failed to add product.');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto p-2 sm:p-6 bg-white rounded-xl shadow-lg">
      {/* Back Arrow and Wording */}
      <div className="flex items-center gap-2 mb-2">
        <button type="button" onClick={onClose} className="flex items-center text-blue-600 hover:text-blue-800 focus:outline-none">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 mr-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-semibold text-base sm:text-lg">Back to {category}</span>
        </button>
      </div>
      <h3 className="text-xl font-bold mb-4">Add {category}</h3>
      <input name="name" value={form.name} onChange={handleChange} placeholder="Product Name" className="w-full px-3 py-2 border rounded" required />
      {category === 'Shoes' && (
        <>
          <div className="flex flex-col sm:flex-row gap-4">
            <select name="gender" value={form.gender} onChange={handleChange} className="w-full px-3 py-2 border rounded" required>
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="unisex">Unisex</option>
            </select>
            <select name="ageGroup" value={form.ageGroup} onChange={handleChange} className="w-full px-3 py-2 border rounded" required>
              <option value="">Select Age Group</option>
              <option value="adult">Adult</option>
              <option value="child">Child</option>
            </select>
          </div>
          <div className="mt-4 p-2 sm:p-4 rounded-lg bg-blue-50 shadow">
            <div className="flex flex-col sm:flex-row items-center gap-2 mb-2">
              <label htmlFor="region" className="font-semibold text-blue-700">Choose Region:</label>
              <select id="region" name="sizeInputRegion" value={sizeInputRegion} onChange={handleChange} className="px-2 py-1 border rounded">
                <option value="US">US</option>
                <option value="UK">UK</option>
                <option value="EU">EU</option>
                <option value="CM">CM</option>
              </select>
              <input
                type="text"
                name="sizeInputValue"
                value={sizeInputValue}
                onChange={handleChange}
                placeholder={`Enter ${sizeInputRegion} size`}
                className="w-32 px-2 py-1 border rounded"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <div className="bg-white p-2 sm:p-3 rounded shadow text-center text-blue-700 font-semibold">US: {convertedSizes.US}</div>
              <div className="bg-white p-2 sm:p-3 rounded shadow text-center text-blue-700 font-semibold">UK: {convertedSizes.UK}</div>
              <div className="bg-white p-2 sm:p-3 rounded shadow text-center text-blue-700 font-semibold">EU: {convertedSizes.EU}</div>
              <div className="bg-white p-2 sm:p-3 rounded shadow text-center text-blue-700 font-semibold">CM: {convertedSizes.CM}</div>
            </div>
          </div>
        </>
      )}
      {category !== 'Shoes' && (
        <input name="size" value={form.size || ''} onChange={handleChange} placeholder="Size (e.g. 20, M, L)" className="w-full px-3 py-2 border rounded" required />
      )}
      <input name="color" value={form.color} onChange={handleChange} placeholder="Color (e.g. Black/White)" className="w-full px-3 py-2 border rounded" required />
      <input name="stock" type="number" value={form.stock} onChange={handleChange} placeholder="Stock Quantity" className="w-full px-3 py-2 border rounded" required />
      <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="Price" className="w-full px-3 py-2 border rounded" required />
      <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="w-full px-3 py-2 border rounded" required />
      <input name="image" type="file" accept="image/*" onChange={handleChange} className="w-full" required />
      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 mt-6">
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold shadow">Add</button>
        <button type="button" className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-lg font-semibold shadow" onClick={onClose}>Cancel</button>
      </div>
    </form>
  );
}
