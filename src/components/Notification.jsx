import React from 'react';

export default function Notification({ type = 'info', message, onClose }) {
  const colors = {
    success: 'bg-green-100 text-green-800 border-green-300',
    error: 'bg-red-100 text-red-800 border-red-300',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    info: 'bg-blue-100 text-blue-800 border-blue-300',
  };
  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-3 rounded-xl shadow-lg border ${colors[type]} flex items-center gap-2 min-w-[220px] max-w-xs`}>
      <span className="font-semibold flex-1">{message}</span>
      <button onClick={onClose} className="ml-2 text-lg font-bold focus:outline-none">×</button>
    </div>
  );
}
