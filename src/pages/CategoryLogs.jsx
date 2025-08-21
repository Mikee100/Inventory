import { useState, useEffect } from "react";
import { ClipLoader } from 'react-spinners';
import { useParams, useLocation } from "react-router-dom";

const categoryMap = {
  shoes: "Shoes",
  bags: "Bags",
  dresses: "Dresses"
};

function CategoryLogs() {
  const { category, id } = useParams();
  const [logs, setLogs] = useState([]);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`http://https://inventory-backend-gpon.onrender.com/api/${category}/${id}`);
        if (!res.ok) throw new Error("Product not found");
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        setError(err.message);
      }
    }
    async function fetchLogs() {
      try {
        const res = await fetch(`http://https://inventory-backend-gpon.onrender.com/api/sales/logs?productId=${id}`);
        if (!res.ok) throw new Error("Logs not found");
        const data = await res.json();
        setLogs(data);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    }
    if (category && id) {
      fetchProduct();
      fetchLogs();
    }
  }, [category, id]);

  if (loading) return <div className="flex justify-center items-center h-40"><ClipLoader color="#2563eb" size={48} /></div>;
  if (error) return <div>Error: {error}</div>;
  if (!product) return <div>Product not found</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">{categoryMap[category]} Logs for {product.name}</h2>
      {product.image_url && (
        <div className="flex justify-center mb-4">
          <img src={product.image_url} alt={product.name} className="h-56 w-56 object-cover rounded-xl border-2 border-blue-100 shadow" />
        </div>
      )}
      <div className="mb-4">
        <strong>Product Details:</strong>
        <div>Name: {product.name}</div>
        {product.size && <div>Size: {product.size}</div>}
        {product.color && <div>Color: {product.color}</div>}
        {product.brand && <div>Brand: {product.brand}</div>}
        <div>Stock: {product.stock}</div>
        <div>Price: ${product.price}</div>
      </div>
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="border px-2 py-1">Date</th>
            <th className="border px-2 py-1">Action</th>
            <th className="border px-2 py-1">Quantity</th>
            <th className="border px-2 py-1">Revenue</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log._id}>
              <td className="border px-2 py-1">{new Date(log.date).toLocaleString()}</td>
              <td className="border px-2 py-1">{log.action}</td>
              <td className="border px-2 py-1">{log.quantity}</td>
              <td className="border px-2 py-1">${log.revenue || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CategoryLogs;
