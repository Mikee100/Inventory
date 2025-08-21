import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  FaBars,
  FaTimes,
  FaBox,
  FaPlusCircle,
  FaList,
  FaCog,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
  FaChartLine,
  FaShoePrints,
  FaShoppingBag,
  FaTshirt,
  FaHome
} from 'react-icons/fa';

// Navigation Item Component
function NavItem({ to, icon, text, collapsed, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      title={collapsed ? text : ''}
      className={({ isActive }) => `
        flex items-center p-3 text-gray-700 rounded-lg transition-all duration-200
        ${collapsed ? 'justify-center' : 'pl-4'}
        ${isActive
          ? 'bg-blue-100 text-blue-700 font-medium'
          : 'hover:bg-blue-50 hover:text-blue-700'}
      `}
    >
      {({ isActive }) => (
        <>
          <span className={`${collapsed ? 'text-xl' : 'text-lg'} ${isActive ? 'text-blue-500' : 'text-gray-500'}`}>
            {icon}
          </span>
          {!collapsed && <span className="ml-3">{text}</span>}
        </>
      )}
    </NavLink>
  );
}

// Sidebar Component
function Sidebar({ isOpen, onClose, isMobile, collapsed, toggleCollapse }) {
  const location = useLocation();

  // Close mobile sidebar when a nav item is clicked
  const handleNavClick = () => {
    if (isMobile) {
      onClose();
    }
  };

  const navLinks = [
    { to: "/", label: "Dashboard", icon: <FaHome /> },
    { to: "/add-product", label: "Add Product", icon: <FaPlusCircle /> },
    { to: "/products", label: "All Products", icon: <FaList /> },
    { to: "/bags", label: "Bags", icon: <FaShoppingBag /> },
    { to: "/shoes", label: "Shoes", icon: <FaShoePrints /> },
    { to: "/dresses", label: "Dresses", icon: <FaTshirt /> },
    { to: "/logs", label: "Inventory Logs", icon: <FaChartLine /> },
    { to: "/settings", label: "Settings", icon: <FaCog /> },
  ];

  return (
    <div
      className={`fixed lg:static z-30 ${collapsed ? 'w-16' : 'w-64'} bg-white shadow-lg border-r border-blue-100 transform transition-all duration-300 ease-in-out h-full`}
    >
      <div className="flex flex-col h-full">
        <div className={`p-4 border-b flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && <h1 className="text-xl font-bold text-blue-700">Inventory</h1>}
          <button
            onClick={toggleCollapse}
            className="p-1 rounded-md text-blue-500 hover:bg-blue-100"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
          </button>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {navLinks.map(link => (
            <NavItem
              key={link.to}
              to={link.to}
              icon={link.icon}
              text={link.label}
              collapsed={collapsed}
              onClick={handleNavClick}
            />
          ))}
        </nav>
        <div className="p-2 border-t">
          <button
            className={`flex items-center w-full p-2 text-red-600 rounded-lg hover:bg-red-50 ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? 'Logout' : ''}
          >
            <FaSignOutAlt size={20} />
            {!collapsed && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Layout Component
export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleMobileSidebar = () => setMobileSidebarOpen(!mobileSidebarOpen);
  const toggleCollapse = () => setCollapsed(!collapsed);

  // Close mobile sidebar when route changes
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-100 to-gray-200 relative">
      {/* Mobile Top Nav */}
      <div className="lg:hidden w-full fixed top-0 left-0 z-50 bg-white shadow flex items-center justify-between px-4 py-2">
        <button onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)} className="text-blue-700 p-2">
          {mobileSidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
        <span className="font-bold text-lg text-blue-700">Inventory</span>
      </div>

      {/* Sidebar: only show on desktop/tablet */}
      <div className="hidden lg:block">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
          isMobile={false}
          collapsed={collapsed}
          toggleCollapse={toggleCollapse}
        />
      </div>

      {/* Mobile Sidebar Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="w-64 bg-white shadow-lg h-full border-r border-blue-100">
            <Sidebar
              isOpen={true}
              onClose={() => setMobileSidebarOpen(false)}
              isMobile={true}
              collapsed={false}
              toggleCollapse={() => {}}
            />
          </div>
          {/* Translucent/blurred overlay, not black */}
          <div
            className="flex-1 bg-white bg-opacity-40 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden transition-all duration-300 ease-in-out pt-12 lg:pt-0" style={{ marginLeft: '16px', marginRight: '16px' }}>
        <main className="flex-1 overflow-y-auto px-2 sm:px-8 py-6 rounded-t-2xl shadow-lg mt-2">
          <Outlet />
        </main>
      </div>
    </div>
  );
}