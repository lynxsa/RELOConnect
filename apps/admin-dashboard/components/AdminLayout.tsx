/* eslint-disable */
// @ts-nocheck
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const { useState } = React;
import {
  LayoutDashboard,
  Users,
  MapPin,
  Package,
  CreditCard,
  TrendingUp,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  Calendar,
  Heart,
  Newspaper,
  Anchor,
  Shield,
  BarChart3,
  MessageSquare,
  Clock,
  UserCheck,
  Truck,
  DollarSign,
  FileText,
  Globe,
  Smartphone,
  Monitor,
  Database,
  Zap,
  Lock,
  AlertTriangle,
  CheckCircle,
  Eye,
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const AdminLayout: React.FC<LayoutProps> = ({ children, title = 'Admin Dashboard' }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();

  const menuSections = [
    {
      title: 'DASHBOARD',
      items: [
        { href: '/', icon: LayoutDashboard, label: 'Overview', badge: null },
        { href: '/analytics', icon: BarChart3, label: 'Analytics', badge: null },
        { href: '/real-time', icon: Zap, label: 'Real-time Monitor', badge: '🔴 LIVE' },
      ]
    },
    {
      title: 'USER MANAGEMENT',
      items: [
        { href: '/users', icon: Users, label: 'All Users', badge: null },
        { href: '/users/customers', icon: UserCheck, label: 'Customers', badge: null },
        { href: '/users/drivers', icon: Truck, label: 'Drivers', badge: null },
        { href: '/users/admins', icon: Shield, label: 'Administrators', badge: null },
      ]
    },
    {
      title: 'RELOCATION SERVICES',
      items: [
        { href: '/bookings', icon: Calendar, label: 'All Bookings', badge: null },
        { href: '/bookings/active', icon: CheckCircle, label: 'Active Jobs', badge: null },
        { href: '/bookings/pending', icon: Clock, label: 'Pending Requests', badge: null },
        { href: '/tracking', icon: MapPin, label: 'Live Tracking', badge: '📍 GPS' },
        { href: '/pricing', icon: DollarSign, label: 'Pricing Management', badge: null },
        { href: '/items', icon: Package, label: 'Items Inventory', badge: null },
      ]
    },
    {
      title: 'RELO MODULES',
      items: [
        { href: '/relocare', icon: Heart, label: 'RELOCare (Donations)', badge: null },
        { href: '/relonews', icon: Newspaper, label: 'RELONews', badge: null },
        { href: '/reloports', icon: Anchor, label: 'RELOPorts', badge: null },
      ]
    },
    {
      title: 'FINANCIAL',
      items: [
        { href: '/payments', icon: CreditCard, label: 'Payments', badge: null },
        { href: '/revenue', icon: TrendingUp, label: 'Revenue Analysis', badge: null },
        { href: '/transactions', icon: FileText, label: 'Transactions', badge: null },
        { href: '/pricing-ai', icon: BarChart3, label: 'AI Pricing Engine', badge: '🤖 AI' },
      ]
    },
    {
      title: 'COMMUNICATION',
      items: [
        { href: '/notifications', icon: Bell, label: 'Notifications', badge: null },
        { href: '/chat', icon: MessageSquare, label: 'Support Chat', badge: null },
        { href: '/alerts', icon: AlertTriangle, label: 'System Alerts', badge: null },
      ]
    },
    {
      title: 'PLATFORM MONITORING',
      items: [
        { href: '/mobile-apps', icon: Smartphone, label: 'Mobile Apps Status', badge: null },
        { href: '/web-dashboard', icon: Monitor, label: 'Web Dashboard', badge: null },
        { href: '/api-health', icon: Database, label: 'API Health', badge: null },
        { href: '/performance', icon: TrendingUp, label: 'Performance Metrics', badge: null },
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { href: '/settings', icon: Settings, label: 'System Settings', badge: null },
        { href: '/security', icon: Lock, label: 'Security Center', badge: null },
        { href: '/logs', icon: FileText, label: 'System Logs', badge: null },
        { href: '/integrations', icon: Globe, label: 'Integrations', badge: null },
      ]
    },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return router.pathname === '/';
    }
    return router.pathname.startsWith(href);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-20'} transition-all duration-300 bg-white shadow-lg border-r border-gray-200 flex flex-col`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg flex items-center justify-center">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                    RELOConnect
                  </h1>
                  <p className="text-xs text-gray-500">Admin Dashboard</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {menuSections.map((section) => (
            <div key={section.title}>
              {sidebarOpen && (
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  {section.title}
                </h3>
              )}
              <div className="space-y-1">
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                      isActive(item.href)
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${isActive(item.href) ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                    {sidebarOpen && (
                      <>
                        <span className="font-medium flex-1">{item.label}</span>
                        {item.badge && (
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-gray-600" />
            </div>
            {sidebarOpen && (
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Admin User</p>
                <p className="text-xs text-gray-500">admin@reloconnect.com</p>
              </div>
            )}
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              <p className="text-sm text-gray-500">Welcome to RELOConnect Admin Dashboard</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Eye className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>
              
              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
              </button>
              
              {/* Settings */}
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
