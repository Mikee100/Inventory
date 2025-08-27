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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});

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
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    if (name === 'sizeInputRegion') {
      setSizeInputRegion(value);
      setSizeInputValue('');
    } else if (name === 'sizeInputValue') {
      setSizeInputValue(value);
    } else if (name === 'image' && files && files[0]) {
      // Validate file type
      if (!files[0].type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, image: 'Please select an image file' }));
        return;
      }
      
      // Validate file size (max 5MB)
      if (files[0].size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'Image must be less than 5MB' }));
        return;
      }
      
      setForm((prev) => ({
        ...prev,
        image: files[0]
      }));
      
      // Create image preview
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(files[0]);
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.name.trim()) newErrors.name = 'Product name is required';
    if (!form.category) newErrors.category = 'Category is required';
    if (!form.color.trim()) newErrors.color = 'Color is required';
    if (!form.stock || form.stock < 0) newErrors.stock = 'Valid stock quantity is required';
    if (!form.price || form.price <= 0) newErrors.price = 'Valid price is required';
    if (!form.description.trim()) newErrors.description = 'Description is required';
    if (!form.image) newErrors.image = 'Product image is required';
    
    if (form.category === 'Shoes') {
      if (!form.gender) newErrors.gender = 'Gender is required';
      if (!form.ageGroup) newErrors.ageGroup = 'Age group is required';
      if (!sizeInputValue) newErrors.size = 'Size is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      // 1. Upload image to Cloudinary
      let imageUrl = '';

      if (form.image) {
        const cloudData = new FormData();
        cloudData.append('file', form.image);
        cloudData.append('upload_preset', 'aunty-inventory');
        const cloudRes = await fetch('https://api.cloudinary.com/v1_1/dh9jadlh2/image/upload', {
          method: 'POST',
          body: cloudData,
        });
        
        if (!cloudRes.ok) throw new Error('Image upload failed');
        
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
        stock: parseInt(form.stock),
        price: parseFloat(form.price),
        description: form.description,
        image_url: imageUrl,
      };
      
      if (form.category === 'Shoes') {
        payload.gender = form.gender;
        payload.ageGroup = form.ageGroup;
        payload.sizes = convertedSizes;
      }

      const res = await fetch(`https://inventory-backend-gpon.onrender.com/api/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (res.ok) {
        // Success notification
        alert('Product added successfully!');
        
        // Reset form
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
        setImagePreview(null);
        setErrors({});
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to add product');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="px-6 py-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
            <h2 className="text-2xl font-bold">Add New Product</h2>
            <p className="text-blue-100 mt-1">Fill in the details below to add a product to inventory</p>
          </div>
          
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
            {/* Basic Information Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">Basic Information</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                  <input 
                    id="name"
                    name="name" 
                    value={form.name} 
                    onChange={handleChange} 
                    placeholder="e.g. Nike Air Max" 
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required 
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>
                
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select 
                    id="category"
                    name="category" 
                    value={form.category} 
                    onChange={handleChange} 
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.category ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Shoes">Shoes</option>
                    <option value="Bags">Bags</option>
                    <option value="Dresses">Dresses</option>
                  </select>
                  {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
                </div>
                
                <div>
                  <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">Color *</label>
                  <input 
                    id="color"
                    name="color" 
                    value={form.color} 
                    onChange={handleChange} 
                    placeholder="e.g. Black/White" 
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.color ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required 
                  />
                  {errors.color && <p className="mt-1 text-sm text-red-600">{errors.color}</p>}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label>
                    <input 
                      id="stock"
                      name="stock" 
                      type="number" 
                      value={form.stock} 
                      onChange={handleChange} 
                      placeholder="0" 
                      min="0"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.stock ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required 
                    />
                    {errors.stock && <p className="mt-1 text-sm text-red-600">{errors.stock}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price ($) *</label>
                    <input 
                      id="price"
                      name="price" 
                      type="number" 
                      value={form.price} 
                      onChange={handleChange} 
                      placeholder="0.00" 
                      min="0"
                      step="0.01"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.price ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required 
                    />
                    {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea 
                    id="description"
                    name="description" 
                    value={form.description} 
                    onChange={handleChange} 
                    placeholder="Product description..." 
                    rows="3"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required 
                  />
                  {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                </div>
              </div>
            </div>
            
            {/* Shoes-specific fields */}
            {form.category === 'Shoes' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">Shoe Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                    <select 
                      id="gender"
                      name="gender" 
                      value={form.gender} 
                      onChange={handleChange} 
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.gender ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="unisex">Unisex</option>
                    </select>
                    {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="ageGroup" className="block text-sm font-medium text-gray-700 mb-1">Age Group *</label>
                    <select 
                      id="ageGroup"
                      name="ageGroup" 
                      value={form.ageGroup} 
                      onChange={handleChange} 
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.ageGroup ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    >
                      <option value="">Select Age Group</option>
                      <option value="adult">Adult</option>
                      <option value="child">Child</option>
                    </select>
                    {errors.ageGroup && <p className="mt-1 text-sm text-red-600">{errors.ageGroup}</p>}
                  </div>
                </div>
                
                {/* Size Conversion Section */}
                <div className="mt-6 p-5 rounded-lg bg-blue-50 border border-blue-100">
                  <h4 className="font-semibold text-blue-800 mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                    Size Conversion *
                  </h4>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
                    <div className="w-full sm:w-auto">
                      <label className="block text-sm font-medium text-blue-700 mb-1">Input Region</label>
                      <select 
                        name="sizeInputRegion" 
                        value={sizeInputRegion} 
                        onChange={handleChange} 
                        className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="US">US</option>
                        <option value="UK">UK</option>
                        <option value="EU">EU</option>
                        <option value="CM">CM</option>
                      </select>
                    </div>
                    
                    <div className="w-full sm:w-auto">
                      <label className="block text-sm font-medium text-blue-700 mb-1">Size Value</label>
                      <input
                        type="text"
                        name="sizeInputValue"
                        value={sizeInputValue}
                        onChange={handleChange}
                        placeholder={`Enter ${sizeInputRegion} size`}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.size ? 'border-red-500' : 'border-blue-200'
                        }`}
                        required
                      />
                      {errors.size && <p className="mt-1 text-sm text-red-600">{errors.size}</p>}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {['US', 'UK', 'EU', 'CM'].map(region => (
                      <div key={region} className="bg-white p-3 rounded-lg shadow-sm text-center border border-blue-100">
                        <div className="text-xs text-blue-600 font-medium uppercase">{region}</div>
                        <div className="text-lg font-bold text-blue-800 mt-1">{convertedSizes[region] || '-'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* For non-shoe products */}
            {form.category && form.category !== 'Shoes' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">Product Specifications</h3>
                <div>
                  <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                  <input 
                    id="size"
                    name="size" 
                    value={form.size || ''} 
                    onChange={handleChange} 
                    placeholder="Size (e.g. 20, M, L)" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            )}
            
            {/* Image Upload Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">Product Image *</h3>
              <div className={`flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg transition-colors ${
                errors.image ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-blue-400'
              }`}>
                {imagePreview ? (
                  <div className="text-center">
                    <img src={imagePreview} alt="Preview" className="h-40 mx-auto mb-4 rounded-lg object-contain" />
                    <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Change Image
                      <input 
                        name="image" 
                        type="file" 
                        accept="image/*" 
                        onChange={handleChange} 
                        className="hidden" 
                        required 
                      />
                    </label>
                  </div>
                ) : (
                  <label className="cursor-pointer text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div className="text-blue-600 font-medium">Upload product image</div>
                    <div className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</div>
                    <input 
                      name="image" 
                      type="file" 
                      accept="image/*" 
                      onChange={handleChange} 
                      className="hidden" 
                      required 
                    />
                  </label>
                )}
              </div>
              {errors.image && <p className="mt-2 text-sm text-red-600 text-center">{errors.image}</p>}
            </div>
            
            {/* Submit Button */}
            <div className="pt-4">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding Product...
                  </>
                ) : (
                  'Add Product'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}