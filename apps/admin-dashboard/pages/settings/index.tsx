import React, { useState } from 'react';
import Head from 'next/head';
import AdminLayout from '../../components/AdminLayout';
import { 
  Settings, 
  Save, 
  Bell, 
  Shield, 
  Globe, 
  Monitor,
  Database
} from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'security' | 'integrations' | 'system'>('general');
  
  const [settings, setSettings] = useState({
    general: {
      companyName: 'RELOConnect',
      companyEmail: 'admin@reloconnect.com',
      supportEmail: 'support@reloconnect.com',
      timezone: 'Africa/Johannesburg',
      currency: 'ZAR',
      language: 'en',
      maintenanceMode: false,
      debugMode: false
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: true,
      bookingAlerts: true,
      paymentAlerts: true,
      systemAlerts: true,
      marketingEmails: false
    },
    security: {
      twoFactorAuth: true,
      sessionTimeout: 30,
      passwordComplexity: 'high',
      maxLoginAttempts: 5,
      ipWhitelist: '',
      auditLogging: true
    },
    integrations: {
      googleMaps: {
        enabled: true,
        apiKey: 'AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
      },
      stripe: {
        enabled: true,
        publishableKey: 'pk_test_xxxxxxxxxxxxxxxxxxxxx',
        secretKey: 'sk_test_xxxxxxxxxxxxxxxxxxxxx'
      },
      sms: {
        enabled: true,
        provider: 'twilio',
        apiKey: 'AC5xxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
      }
    },
    system: {
      autoBackup: true,
      backupFrequency: 'daily',
      logRetention: 90,
      cacheExpiry: 3600,
      maxFileSize: 10,
      allowedFileTypes: 'jpg,jpeg,png,pdf,doc,docx'
    }
  });

  const handleSave = () => {
    // Save settings logic here
    // Settings saved successfully
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Company Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={settings.general.companyName}
              onChange={(e) => setSettings({
                ...settings,
                general: { ...settings.general, companyName: e.target.value }
              })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={settings.general.companyEmail}
              onChange={(e) => setSettings({
                ...settings,
                general: { ...settings.general, companyEmail: e.target.value }
              })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Support Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={settings.general.supportEmail}
              onChange={(e) => setSettings({
                ...settings,
                general: { ...settings.general, supportEmail: e.target.value }
              })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={settings.general.timezone}
              onChange={(e) => setSettings({
                ...settings,
                general: { ...settings.general, timezone: e.target.value }
              })}
            >
              <option value="Africa/Johannesburg">Africa/Johannesburg</option>
              <option value="Africa/Cape_Town">Africa/Cape_Town</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">System Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Maintenance Mode</label>
              <p className="text-sm text-gray-500">Enable to prevent new bookings during maintenance</p>
            </div>
            <button
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.general.maintenanceMode ? 'bg-blue-600' : 'bg-gray-200'
              }`}
              onClick={() => setSettings({
                ...settings,
                general: { ...settings.general, maintenanceMode: !settings.general.maintenanceMode }
              })}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.general.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Debug Mode</label>
              <p className="text-sm text-gray-500">Enable detailed logging for troubleshooting</p>
            </div>
            <button
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.general.debugMode ? 'bg-blue-600' : 'bg-gray-200'
              }`}
              onClick={() => setSettings({
                ...settings,
                general: { ...settings.general, debugMode: !settings.general.debugMode }
              })}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.general.debugMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          {Object.entries(settings.notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <p className="text-sm text-gray-500">
                  {key === 'emailNotifications' && 'Receive email notifications for important events'}
                  {key === 'smsNotifications' && 'Receive SMS notifications for urgent updates'}
                  {key === 'pushNotifications' && 'Receive push notifications in the app'}
                  {key === 'bookingAlerts' && 'Get notified about new bookings and updates'}
                  {key === 'paymentAlerts' && 'Get notified about payment transactions'}
                  {key === 'systemAlerts' && 'Get notified about system issues'}
                  {key === 'marketingEmails' && 'Receive promotional emails and newsletters'}
                </p>
              </div>
              <button
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  value ? 'bg-blue-600' : 'bg-gray-200'
                }`}
                onClick={() => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, [key]: !value }
                })}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    value ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Two-Factor Authentication</label>
              <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
            </div>
            <button
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.security.twoFactorAuth ? 'bg-blue-600' : 'bg-gray-200'
              }`}
              onClick={() => setSettings({
                ...settings,
                security: { ...settings.security, twoFactorAuth: !settings.security.twoFactorAuth }
              })}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.security.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={settings.security.sessionTimeout}
              onChange={(e) => setSettings({
                ...settings,
                security: { ...settings.security, sessionTimeout: parseInt(e.target.value) }
              })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password Complexity</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={settings.security.passwordComplexity}
              onChange={(e) => setSettings({
                ...settings,
                security: { ...settings.security, passwordComplexity: e.target.value }
              })}
            >
              <option value="low">Low - Minimum 6 characters</option>
              <option value="medium">Medium - 8+ characters, mixed case</option>
              <option value="high">High - 12+ characters, mixed case, numbers, symbols</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderIntegrationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Third-Party Integrations</h3>
        <div className="space-y-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Globe className="w-5 h-5 text-blue-600 mr-2" />
                <h4 className="font-medium">Google Maps</h4>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${
                settings.integrations.googleMaps.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {settings.integrations.googleMaps.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={settings.integrations.googleMaps.apiKey}
                onChange={(e) => setSettings({
                  ...settings,
                  integrations: {
                    ...settings.integrations,
                    googleMaps: { ...settings.integrations.googleMaps, apiKey: e.target.value }
                  }
                })}
              />
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Monitor className="w-5 h-5 text-purple-600 mr-2" />
                <h4 className="font-medium">Stripe Payments</h4>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${
                settings.integrations.stripe.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {settings.integrations.stripe.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Publishable Key</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={settings.integrations.stripe.publishableKey}
                  onChange={(e) => setSettings({
                    ...settings,
                    integrations: {
                      ...settings.integrations,
                      stripe: { ...settings.integrations.stripe, publishableKey: e.target.value }
                    }
                  })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Secret Key</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={settings.integrations.stripe.secretKey}
                  onChange={(e) => setSettings({
                    ...settings,
                    integrations: {
                      ...settings.integrations,
                      stripe: { ...settings.integrations.stripe, secretKey: e.target.value }
                    }
                  })}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">System Configuration</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Auto Backup</label>
              <p className="text-sm text-gray-500">Automatically backup system data</p>
            </div>
            <button
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.system.autoBackup ? 'bg-blue-600' : 'bg-gray-200'
              }`}
              onClick={() => setSettings({
                ...settings,
                system: { ...settings.system, autoBackup: !settings.system.autoBackup }
              })}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.system.autoBackup ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={settings.system.backupFrequency}
              onChange={(e) => setSettings({
                ...settings,
                system: { ...settings.system, backupFrequency: e.target.value }
              })}
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Log Retention (days)</label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={settings.system.logRetention}
              onChange={(e) => setSettings({
                ...settings,
                system: { ...settings.system, logRetention: parseInt(e.target.value) }
              })}
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <AdminLayout title="Settings">
      <Head>
        <title>Settings - RELOConnect Admin</title>
        <meta name="description" content="System settings and configuration" />
      </Head>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">Configure system settings and preferences</p>
          </div>
          <button 
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'general', label: 'General', icon: Settings },
                { id: 'notifications', label: 'Notifications', icon: Bell },
                { id: 'security', label: 'Security', icon: Shield },
                { id: 'integrations', label: 'Integrations', icon: Globe },
                { id: 'system', label: 'System', icon: Database },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'general' && renderGeneralSettings()}
            {activeTab === 'notifications' && renderNotificationSettings()}
            {activeTab === 'security' && renderSecuritySettings()}
            {activeTab === 'integrations' && renderIntegrationSettings()}
            {activeTab === 'system' && renderSystemSettings()}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
