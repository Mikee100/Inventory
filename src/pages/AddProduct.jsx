

import React, { useState } from 'react';

export default function AddProduct() {
  const [form, setForm] = useState({
    name: '',
    category: '',
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

  // Convert size when input changes
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
      // 1. Upload image to Cloudinary
      let imageUrl = '';

      if (form.image) {
        const cloudData = new FormData();
        cloudData.append('file', form.image);
        cloudData.append('upload_preset', 'aunty-inventory'); // your preset
        const cloudRes = await fetch('https://api.cloudinary.com/v1_1/dh9jadlh2/image/upload', {
          method: 'POST',
          body: cloudData,
        });
        const cloudJson = await cloudRes.json();
        imageUrl = cloudJson.secure_url;
      }

      // 2. Send product data to backend
      let endpoint = '';
      if (form.category === 'Shoes') endpoint = 'shoes';
      else if (form.category === 'Bags') endpoint = 'bags';
      else if (form.category === 'Dresses') endpoint = 'dresses';
      else throw new Error('Please select a valid category.');

      let payload = {
        name: form.name,
        category: form.category,
        color: form.color,
        stock: form.stock,
        price: form.price,
        description: form.description,
        image_url: imageUrl,
      };
      if (form.category === 'Shoes') {
        payload.gender = form.gender;
        payload.ageGroup = form.ageGroup;
        // Use converted sizes
        payload.sizes = convertedSizes;
      }

      const res = await fetch(`http://https://inventory-backend-gpon.onrender.com/api/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        alert('Product added successfully!');
        setForm({
          name: '',
          category: '',
          color: '',
          stock: '',
          price: '',
          description: '',
          image: null,
          gender: '',
          ageGroup: '',
          sizes: { US: '', UK: '', EU: '', CM: '' },
        });
        setSizeInputValue('');
        setConvertedSizes({ US: '', UK: '', EU: '', CM: '' });
      } else {
        alert('Failed to add product.');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Add Product</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Product Name" className="w-full px-3 py-2 border rounded" required />
        <select name="category" value={form.category} onChange={handleChange} className="w-full px-3 py-2 border rounded" required>
          <option value="">Select Category</option>
          <option value="Shoes">Shoes</option>
          <option value="Bags">Bags</option>
          <option value="Dresses">Dresses</option>
        </select>
        {form.category === 'Shoes' ? (
          <>
            <div className="flex gap-4">
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
            {/* Size Conversion Section */}
            <div className="mt-4 p-4 rounded-lg bg-blue-50 shadow">
              <div className="flex items-center gap-2 mb-2">
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
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded shadow text-center text-blue-700 font-semibold">US: {convertedSizes.US}</div>
                <div className="bg-white p-3 rounded shadow text-center text-blue-700 font-semibold">UK: {convertedSizes.UK}</div>
                <div className="bg-white p-3 rounded shadow text-center text-blue-700 font-semibold">EU: {convertedSizes.EU}</div>
                <div className="bg-white p-3 rounded shadow text-center text-blue-700 font-semibold">CM: {convertedSizes.CM}</div>
              </div>
            </div>
          </>
        ) : (
          <input name="size" value={form.size} onChange={handleChange} placeholder="Size (e.g. 20, M, L)" className="w-full px-3 py-2 border rounded" required />
        )}
        <input name="color" value={form.color} onChange={handleChange} placeholder="Color (e.g. Black/White)" className="w-full px-3 py-2 border rounded" required />
        <input name="stock" type="number" value={form.stock} onChange={handleChange} placeholder="Stock Quantity" className="w-full px-3 py-2 border rounded" required />
        <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="Price" className="w-full px-3 py-2 border rounded" required />
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="w-full px-3 py-2 border rounded" required />
        <input name="image" type="file" accept="image/*" onChange={handleChange} className="w-full" required />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Add Product</button>
      </form>
    </div>
  );
}
