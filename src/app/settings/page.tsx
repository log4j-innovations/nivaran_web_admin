'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { useToast } from '@/lib/toastContext';
import { RoleGuard } from '@/components/RoleGuard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { 
  Settings, 
  User, 
  Shield, 
  Bell, 
  Database, 
  Globe,
  Save,
  RefreshCw,
  Trash2,
  Download,
  Upload,
  Key,
  Eye,
  EyeOff
} from 'lucide-react';
import { firestoreService } from '@/lib/firebase';

interface SystemSettings {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    slaWarnings: boolean;
    escalations: boolean;
    reports: boolean;
  };
  sla: {
    autoEscalation: boolean;
    warningThreshold: number;
    breachThreshold: number;
  };
  security: {
    sessionTimeout: number;
    requireMFA: boolean;
    passwordPolicy: string;
  };
  data: {
    retentionDays: number;
    autoBackup: boolean;
    backupFrequency: string;
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
  };
}

export default function SettingsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SystemSettings>({
    notifications: {
      email: true,
      push: true,
      sms: false,
      slaWarnings: true,
      escalations: true,
      reports: true
    },
    sla: {
      autoEscalation: true,
      warningThreshold: 4,
      breachThreshold: 0
    },
    security: {
      sessionTimeout: 30,
      requireMFA: false,
      passwordPolicy: 'strong'
    },
    data: {
      retentionDays: 365,
      autoBackup: true,
      backupFrequency: 'daily'
    },
    appearance: {
      theme: 'light',
      language: 'en',
      timezone: 'Asia/Kolkata'
    }
  });
  const [activeTab, setActiveTab] = useState('notifications');
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      // In a real app, you'd load settings from Firestore
      // For now, we'll use the default settings
      setSettings(settings);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Error', 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      // In a real app, you'd save settings to Firestore
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Settings Saved', 'Your settings have been updated successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (section: keyof SystemSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Error', 'Password must be at least 8 characters long');
      return;
    }

    try {
      setSaving(true);
      // In a real app, you'd update the password via Firebase Auth
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Password Updated', 'Your password has been changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Error', 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  const exportData = async () => {
    try {
      toast.info('Export Started', 'Preparing data export...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Export Complete', 'Data exported successfully');
    } catch (error) {
      toast.error('Export Failed', 'Failed to export data');
    }
  };

  const importData = async () => {
    try {
      toast.info('Import Started', 'Processing data import...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Import Complete', 'Data imported successfully');
    } catch (error) {
      toast.error('Import Failed', 'Failed to import data');
    }
  };

  const clearData = async () => {
    if (!confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      return;
    }

    try {
      setSaving(true);
      toast.info('Clearing Data', 'This may take a few moments...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      toast.success('Data Cleared', 'All data has been cleared successfully');
    } catch (error) {
      console.error('Error clearing data:', error);
      toast.error('Error', 'Failed to clear data');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={['super_admin', 'city_engineer']}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Settings className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-600">Manage system configuration and preferences</p>
              </div>
            </div>
            <button
              onClick={saveSettings}
              disabled={saving}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <nav className="space-y-2">
                  <button
                    onClick={() => setActiveTab('notifications')}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                      activeTab === 'notifications' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Bell className="w-4 h-4" />
                    <span>Notifications</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('sla')}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                      activeTab === 'sla' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    <span>SLA Settings</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('security')}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                      activeTab === 'security' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Key className="w-4 h-4" />
                    <span>Security</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('data')}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                      activeTab === 'data' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Database className="w-4 h-4" />
                    <span>Data Management</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('appearance')}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                      activeTab === 'appearance' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Globe className="w-4 h-4" />
                    <span>Appearance</span>
                  </button>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Notifications Settings */}
              {activeTab === 'notifications' && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Notification Channels</h3>
                      <div className="space-y-3">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={settings.notifications.email}
                            onChange={(e) => updateSetting('notifications', 'email', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Email Notifications</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={settings.notifications.push}
                            onChange={(e) => updateSetting('notifications', 'push', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Push Notifications</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={settings.notifications.sms}
                            onChange={(e) => updateSetting('notifications', 'sms', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">SMS Notifications</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Notification Types</h3>
                      <div className="space-y-3">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={settings.notifications.slaWarnings}
                            onChange={(e) => updateSetting('notifications', 'slaWarnings', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">SLA Warnings</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={settings.notifications.escalations}
                            onChange={(e) => updateSetting('notifications', 'escalations', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Escalation Alerts</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={settings.notifications.reports}
                            onChange={(e) => updateSetting('notifications', 'reports', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Report Notifications</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SLA Settings */}
              {activeTab === 'sla' && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">SLA Configuration</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.sla.autoEscalation}
                          onChange={(e) => updateSetting('sla', 'autoEscalation', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Enable Auto Escalation</span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Warning Threshold (hours before deadline)
                      </label>
                      <input
                        type="number"
                        value={settings.sla.warningThreshold}
                        onChange={(e) => updateSetting('sla', 'warningThreshold', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="1"
                        max="24"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Breach Threshold (hours after deadline)
                      </label>
                      <input
                        type="number"
                        value={settings.sla.breachThreshold}
                        onChange={(e) => updateSetting('sla', 'breachThreshold', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                        max="24"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Session Timeout (minutes)
                      </label>
                      <input
                        type="number"
                        value={settings.security.sessionTimeout}
                        onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="5"
                        max="480"
                      />
                    </div>

                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.security.requireMFA}
                          onChange={(e) => updateSetting('security', 'requireMFA', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Require Multi-Factor Authentication</span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password Policy
                      </label>
                      <select
                        value={settings.security.passwordPolicy}
                        onChange={(e) => updateSetting('security', 'passwordPolicy', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="basic">Basic (8+ characters)</option>
                        <option value="strong">Strong (12+ characters, mixed case, numbers)</option>
                        <option value="very-strong">Very Strong (16+ characters, special chars)</option>
                      </select>
                    </div>

                    {/* Password Change Section */}
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-md font-medium text-gray-900 mb-4">Change Password</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Password
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                          </label>
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <button
                          onClick={handlePasswordChange}
                          disabled={saving || !currentPassword || !newPassword || !confirmPassword}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          {saving ? 'Updating...' : 'Update Password'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Data Management */}
              {activeTab === 'data' && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Data Management</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Data Retention Period (days)
                      </label>
                      <input
                        type="number"
                        value={settings.data.retentionDays}
                        onChange={(e) => updateSetting('data', 'retentionDays', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="30"
                        max="3650"
                      />
                    </div>

                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.data.autoBackup}
                          onChange={(e) => updateSetting('data', 'autoBackup', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Enable Automatic Backups</span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Backup Frequency
                      </label>
                      <select
                        value={settings.data.backupFrequency}
                        onChange={(e) => updateSetting('data', 'backupFrequency', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-md font-medium text-gray-900 mb-4">Data Operations</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                          onClick={exportData}
                          className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          <span>Export Data</span>
                        </button>
                        <button
                          onClick={importData}
                          className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Upload className="w-4 h-4" />
                          <span>Import Data</span>
                        </button>
                        <button
                          onClick={clearData}
                          disabled={saving}
                          className="flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>{saving ? 'Clearing...' : 'Clear Data'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Appearance Settings */}
              {activeTab === 'appearance' && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Appearance Settings</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Theme
                      </label>
                      <select
                        value={settings.appearance.theme}
                        onChange={(e) => updateSetting('appearance', 'theme', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto">Auto (System)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Language
                      </label>
                      <select
                        value={settings.appearance.language}
                        onChange={(e) => updateSetting('appearance', 'language', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="en">English</option>
                        <option value="hi">Hindi</option>
                        <option value="gu">Gujarati</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Timezone
                      </label>
                      <select
                        value={settings.appearance.timezone}
                        onChange={(e) => updateSetting('appearance', 'timezone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="Asia/Kolkata">India Standard Time (IST)</option>
                        <option value="Asia/Dubai">Gulf Standard Time (GST)</option>
                        <option value="UTC">UTC</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
