import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import Loader from '../components/Loader';
import { getAllUsers, getSignupStats, getAnalyticsOverview, getHealthStatus } from '../services/adminService';
import { getBanner, updateBanner } from '../services/bannerService';
import { getSettings, updateSettings } from '../services/settingsService';
import { getErrorLogs, deleteErrorLog, clearErrorLogs } from '../services/errorLogService';
import { timeAgo } from '../utils/format';

const DEVICE_COLORS = { Desktop: '#16a34a', Mobile: '#3b82f6', Tablet: '#f59e0b' };

// Small reusable stat card used across the performance section
function StatCard({ label, value }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

// Small status row used in the Website Health card
function HealthRow({ label, healthy }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm">{label}</span>
      <span className="flex items-center gap-1.5 text-sm font-medium">
        <span className={`h-2.5 w-2.5 rounded-full ${healthy ? 'bg-green-500' : 'bg-red-500'}`} />
        {healthy ? 'Online' : 'Offline'}
      </span>
    </div>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const [users, setUsers] = useState([]);
  const [usersPage, setUsersPage] = useState(1);
  const [totalUserPages, setTotalUserPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [stats, setStats] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [health, setHealth] = useState(null);
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

  const [siteSettings, setSiteSettings] = useState({
    maintenanceMode: false,
    maintenanceMessage: '',
    contactEmail: '',
  });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState('');

  const [errorLogs, setErrorLogs] = useState([]);
  const [errorLogsMessage, setErrorLogsMessage] = useState('');

  // Users are paginated (20 per page), so this refetches whenever the
  // admin clicks Previous/Next - kept separate from the one-time effect
  // below so switching pages doesn't re-fetch signups/analytics/health.
  useEffect(() => {
    getAllUsers({ page: usersPage, limit: 20 })
      .then((data) => {
        setUsers(data.users);
        setTotalUserPages(data.totalPages);
        setTotalUsers(data.totalUsers);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to load dashboard data.');
      })
      .finally(() => setLoading(false));
  }, [usersPage]);

  useEffect(() => {
    getSignupStats()
      .then(setStats)
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to load dashboard data.');
      });

    // Analytics and health are loaded separately - if either fails, the
    // rest of the dashboard (users, signups, banner) still works fine.
    getAnalyticsOverview().then(setAnalytics).catch(() => setAnalytics(null));
    getHealthStatus().then(setHealth).catch(() => setHealth(null));

    // Loaded separately - the banner form pre-fills with whatever is
    // currently saved, but shouldn't block the rest of the dashboard.
    getBanner()
      .then((data) => {
        if (data && Object.keys(data).length > 0) {
          setBannerForm((prev) => ({ ...prev, ...data }));
        }
      })
      .catch(() => {});

    // Same for site settings
    getSettings()
      .then((data) => {
        if (data) {
          setSiteSettings((prev) => ({ ...prev, ...data }));
        }
      })
      .catch(() => {});

    // Error/security log for the Health tab
    getErrorLogs()
      .then((data) => setErrorLogs(data.logs))
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

  const handleSettingsChange = (e) => {
    const { name, type, checked, value } = e.target;
    setSiteSettings((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSettingsSave = async (e) => {
    e.preventDefault();
    setSettingsSaving(true);
    setSettingsMessage('');
    try {
      await updateSettings(siteSettings);
      setSettingsMessage('Settings saved successfully.');
    } catch (err) {
      setSettingsMessage(err.response?.data?.message || 'Failed to save settings.');
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleResolveErrorLog = async (id) => {
    try {
      await deleteErrorLog(id);
      setErrorLogs((prev) => prev.filter((log) => log._id !== id));
    } catch (err) {
      setErrorLogsMessage(err.response?.data?.message || 'Failed to remove that entry.');
    }
  };

  const handleClearAllErrorLogs = async () => {
    try {
      await clearErrorLogs();
      setErrorLogs([]);
    } catch (err) {
      setErrorLogsMessage(err.response?.data?.message || 'Failed to clear the log.');
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

  const performance = analytics?.performance;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* Tab switcher */}
      <div className="flex gap-2 mb-6 border-b dark:border-gray-700">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            activeTab === 'overview'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('health')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            activeTab === 'health'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Health
          {errorLogs.length > 0 && (
            <span className="ml-1.5 inline-flex items-center justify-center h-5 min-w-[1.25rem] px-1 rounded-full bg-red-500 text-white text-xs font-bold">
              {errorLogs.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            activeTab === 'settings'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Settings
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
      {/* Performance stat cards */}
      <h2 className="text-lg font-semibold mb-3">Website Performance</h2>
      {performance ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <StatCard label="Visitors Today" value={performance.visitorsToday} />
          <StatCard label="Visitors This Week" value={performance.visitorsThisWeek} />
          <StatCard label="Visitors This Month" value={performance.visitorsThisMonth} />
          <StatCard label="Page Views (This Month)" value={performance.totalPageViews} />
          <StatCard label="Avg Pages / Session" value={performance.avgPagesPerSession} />
          <StatCard label="Bounce Rate" value={`${performance.bounceRate}%`} />
        </div>
      ) : (
        <p className="text-gray-500 text-sm mb-8">Performance data unavailable right now.</p>
      )}

      {/* Daily visitors trend */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-8">
        <h2 className="text-lg font-semibold mb-4">Daily Visitors (Last 14 Days)</h2>
        {analytics?.dailyTrend?.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={analytics.dailyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="visitors" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-sm">No visitor data yet.</p>
        )}
      </div>

      {/* Most visited pages + device usage, side by side on larger screens */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Most Visited Pages</h2>
          {analytics?.topPages?.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={analytics.topPages}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="page" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="views" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-sm">No page view data yet.</p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Device Usage</h2>
          {analytics?.devices?.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={analytics.devices}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                >
                  {analytics.devices.map((entry) => (
                    <Cell key={entry.name} fill={DEVICE_COLORS[entry.name] || '#9ca3af'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-sm">No device data yet.</p>
          )}
        </div>
      </div>

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
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 overflow-x-auto mb-8">
        <h2 className="text-lg font-semibold mb-4">Registered Users ({totalUsers})</h2>
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

        {totalUserPages > 1 && (
          <div className="flex items-center justify-between mt-4 text-sm">
            <button
              onClick={() => setUsersPage((p) => Math.max(1, p - 1))}
              disabled={usersPage === 1}
              className="px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-gray-500 dark:text-gray-400">
              Page {usersPage} of {totalUserPages}
            </span>
            <button
              onClick={() => setUsersPage((p) => Math.min(totalUserPages, p + 1))}
              disabled={usersPage === totalUserPages}
              className="px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
        </>
      )}

      {activeTab === 'health' && (
        <>
      {/* Service status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-8">
        <h2 className="text-lg font-semibold mb-2">Website Health</h2>
        {health ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            <HealthRow label="Backend Status" healthy={health.backend} />
            <HealthRow label="Database" healthy={health.database} />
            <HealthRow label="Cloudinary" healthy={health.cloudinary} />
            <HealthRow label="Email Service" healthy={health.email} />
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Health status unavailable right now.</p>
        )}
      </div>

      {/* Error / security log */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Errors & Security Threats ({errorLogs.length})</h2>
          {errorLogs.length > 0 && (
            <button
              onClick={handleClearAllErrorLogs}
              className="text-sm text-red-600 hover:underline"
            >
              Clear all
            </button>
          )}
        </div>

        {errorLogsMessage && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3">
            {errorLogsMessage}
          </div>
        )}

        {errorLogs.length === 0 ? (
          <p className="text-gray-500 text-sm">No errors or security threats logged. All clear.</p>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {errorLogs.map((log, index) => (
              <li key={log._id} className="py-3 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-gray-400">#{errorLogs.length - index}</span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        log.severity === 'security'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {log.severity === 'security' ? 'Security' : 'Error'}
                    </span>
                    <span className="text-xs text-gray-400 uppercase">{log.source}</span>
                  </div>
                  <p className="text-sm break-words">{log.message}</p>
                  {log.path && <p className="text-xs text-gray-400 mt-0.5">{log.path}</p>}
                  <p className="text-xs text-gray-400 mt-0.5">{timeAgo(log.createdAt)}</p>
                </div>
                <button
                  onClick={() => handleResolveErrorLog(log._id)}
                  className="flex-shrink-0 text-xs px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Mark Resolved
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
        </>
      )}

      {activeTab === 'settings' && (
        <>
      {/* General site settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-8">
        <h2 className="text-lg font-semibold mb-4">General Settings</h2>

        {settingsMessage && (
          <div className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md p-3">
            {settingsMessage}
          </div>
        )}

        <form onSubmit={handleSettingsSave} className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="maintenanceMode"
              name="maintenanceMode"
              checked={siteSettings.maintenanceMode}
              onChange={handleSettingsChange}
              className="h-4 w-4"
            />
            <label htmlFor="maintenanceMode" className="text-sm font-medium">
              Maintenance mode (shows a notice to every visitor)
            </label>
          </div>

          <div>
            <label className="text-sm font-medium">Maintenance Message</label>
            <textarea
              name="maintenanceMessage"
              value={siteSettings.maintenanceMessage}
              onChange={handleSettingsChange}
              rows={2}
              maxLength={300}
              className="mt-1 w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-900 dark:border-gray-600"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Contact Form Email</label>
            <input
              type="email"
              name="contactEmail"
              value={siteSettings.contactEmail}
              onChange={handleSettingsChange}
              placeholder="you@example.com"
              className="mt-1 w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-900 dark:border-gray-600"
            />
            <p className="text-xs text-gray-400 mt-1">Where messages from the Contact Us page get sent.</p>
          </div>

          <button
            type="submit"
            disabled={settingsSaving}
            className="bg-primary-600 text-white font-semibold px-5 py-2.5 rounded-md hover:bg-primary-700 disabled:opacity-60"
          >
            {settingsSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </div>

      {/* Banner settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
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
        </>
      )}
    </div>
  );
}