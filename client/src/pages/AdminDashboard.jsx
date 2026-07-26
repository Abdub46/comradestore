import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import Loader from '../components/Loader';
import {
  getAllUsers,
  getSignupStats,
  getAnalyticsOverview,
  getHealthStatus,
} from '../services/adminService';
import { getBanner, updateBanner } from '../services/bannerService';
import { timeAgo } from '../utils/format';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [bannerForm, setBannerForm] = useState({
    text: '',
    linkUrl: '',
    linkText: '',
    backgroundColor: '#16a34a',
    textColor: '#ffffff',
    showLinkIcon: true,
    showCloseButton: true,
  });
  const [bannerSaving, setBannerSaving] = useState(false);
  const [bannerMessage, setBannerMessage] = useState('');
  const [analytics, setAnalytics] = useState(null);
const [health, setHealth] = useState(null);


  useEffect(() => {
   Promise.all([
    getAllUsers(),
    getSignupStats(),
    getAnalyticsOverview(),
    getHealthStatus(),
]).then(([usersData, statsData, analyticsData, healthData]) => {
    setUsers(usersData);
    setStats(statsData);
    setAnalytics(analyticsData);
    setHealth(healthData);
})
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to load dashboard data.');
      })
      .finally(() => setLoading(false));

    // Loaded separately - the banner form pre-fills with whatever is
    // currently saved, but shouldn't block the rest of the dashboard.
    getBanner()
      .then((data) => {
        if (data && Object.keys(data).length > 0) {
          setBannerForm((prev) => ({ ...prev, ...data }));
        }
      })
      .catch(() => {});
  }, []);

  const handleBannerChange = (e) => {
    const { name, type, checked, value } = e.target;
    setBannerForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleBannerSave = async (e) => {
    e.preventDefault();
    setBannerSaving(true);
    setBannerMessage('');
    try {
      await updateBanner(bannerForm);
      setBannerMessage('Banner settings saved successfully.');
    } catch (err) {
      setBannerMessage(err.response?.data?.message || 'Failed to save banner settings.');
    } finally {
      setBannerSaving(false);
    }
  };

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-4xl mb-4">🔒</p>
        <h1 className="text-xl font-semibold mb-2">Access Denied</h1>
        <p className="text-gray-500 dark:text-gray-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* Signup trend graph */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-8">
        <h2 className="text-lg font-semibold mb-4">Signups by Month</h2>
        {stats.length === 0 ? (
          <p className="text-gray-500 text-sm">No signup data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="signups" stroke="#16a34a" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Users table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 overflow-x-auto">
        <h2 className="text-lg font-semibold mb-4">Registered Users ({users.length})</h2>
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b dark:border-gray-700 text-gray-500 dark:text-gray-400">
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Email</th>
              <th className="py-2 pr-4">Phone</th>
              <th className="py-2 pr-4">Residence</th>
              <th className="py-2 pr-4">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-b dark:border-gray-700">
                <td className="py-2 pr-4">{u.firstName} {u.lastName}</td>
                <td className="py-2 pr-4">{u.email}</td>
                <td className="py-2 pr-4">{u.phone}</td>
                <td className="py-2 pr-4">{u.residence}</td>
                <td className="py-2 pr-4">{timeAgo(u.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Banner settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mt-8">
        <h2 className="text-lg font-semibold mb-4">Top Banner Settings</h2>

        {bannerMessage && (
          <div className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md p-3">
            {bannerMessage}
          </div>
        )}

        <form onSubmit={handleBannerSave} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Banner Text</label>
            <input
              name="text"
              value={bannerForm.text}
              onChange={handleBannerChange}
              placeholder="e.g. Courtesy of Softlife Wireless"
              className="mt-1 w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-900 dark:border-gray-600"
            />
            <p className="text-xs text-gray-400 mt-1">Leave this empty to hide the banner completely.</p>
          </div>

          <div>
            <label className="text-sm font-medium">Link URL (optional)</label>
            <input
              name="linkUrl"
              value={bannerForm.linkUrl}
              onChange={handleBannerChange}
              placeholder="https://example.com"
              className="mt-1 w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-900 dark:border-gray-600"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Link Text (optional)</label>
            <input
              name="linkText"
              value={bannerForm.linkText}
              onChange={handleBannerChange}
              placeholder="e.g. Learn more"
              className="mt-1 w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-900 dark:border-gray-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Banner Background Color</label>
              <input
                type="color"
                name="backgroundColor"
                value={bannerForm.backgroundColor}
                onChange={handleBannerChange}
                className="h-10 w-full rounded-md border dark:border-gray-600 cursor-pointer"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Text Color</label>
              <input
                type="color"
                name="textColor"
                value={bannerForm.textColor}
                onChange={handleBannerChange}
                className="h-10 w-full rounded-md border dark:border-gray-600 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showLinkIcon"
              name="showLinkIcon"
              checked={bannerForm.showLinkIcon}
              onChange={handleBannerChange}
              className="h-4 w-4"
            />
            <label htmlFor="showLinkIcon" className="text-sm font-medium">Show link icon</label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showCloseButton"
              name="showCloseButton"
              checked={bannerForm.showCloseButton}
              onChange={handleBannerChange}
              className="h-4 w-4"
            />
            <label htmlFor="showCloseButton" className="text-sm font-medium">Show close button</label>
          </div>

          <button
            type="submit"
            disabled={bannerSaving}
            className="bg-primary-600 text-white font-semibold px-5 py-2.5 rounded-md hover:bg-primary-700 disabled:opacity-60"
          >
            {bannerSaving ? 'Saving...' : 'Save Banner'}
          </button>
        </form>
      </div>
    </div>
  );
}