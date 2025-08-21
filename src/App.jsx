import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AddProduct from './pages/AddProduct';
import ProductList from './pages/ProductList';
import Settings from './pages/Settings';
import Bags from './pages/Bags';
import Shoes from './pages/Shoes';
import Dresses from './pages/Dresses';
import InventoryLogs from './pages/InventoryLogs';
import ShoeLogs from './pages/ShoeLogs';
import CategoryLogs from './pages/CategoryLogs';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}> 
          <Route index element={<Dashboard />} />
          <Route path="add-product" element={<AddProduct />} />
          <Route path="products" element={<ProductList />} />
          <Route path="bags" element={<Bags />} />
          <Route path="shoes" element={<Shoes />} />
          <Route path=":category/:id/logs" element={<CategoryLogs />} />
          <Route path="dresses" element={<Dresses />} />
          <Route path="settings" element={<Settings />} />
          <Route path="logs" element={<InventoryLogs />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
