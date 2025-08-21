

import React from 'react';

export default function Settings() {
  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Settings</h2>
      <form className="space-y-4">
        <div>
          <label className="block mb-1 font-semibold">Admin Email</label>
          <input type="email" className="w-full px-3 py-2 border rounded" placeholder="admin@example.com" />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Change Password</label>
          <input type="password" className="w-full px-3 py-2 border rounded" placeholder="New Password" />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Notification Settings</label>
          <select className="w-full px-3 py-2 border rounded">
            <option>Email Only</option>
            <option>SMS Only</option>
            <option>Email & SMS</option>
            <option>None</option>
          </select>
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Save Settings</button>
      </form>
    </div>
  );
}
