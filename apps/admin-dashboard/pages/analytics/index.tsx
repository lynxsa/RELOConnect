import React from 'react';
import Head from 'next/head';
import AdminLayout from '../../components/AdminLayout';
import { 
  BarChart3, 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Package,
  Clock,
  Map
} from 'lucide-react';
export default function AnalyticsPage() {
  return (
    <AdminLayout title="Analytics">
      <Head>
        <title>Analytics - RELOConnect Admin</title>
        <meta name="description" content="Business analytics and insights" />
      </Head>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics & Insights</h1>
            <p className="text-gray-600">Business performance metrics and analytics</p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">R 2.4M</p>
                <div className="flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600">+12.5%</span>
                </div>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">1,247</p>
                <div className="flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600">+8.3%</span>
                </div>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">2,156</p>
                <div className="flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600">+22.3%</span>
                </div>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Delivery Time</p>
                <p className="text-2xl font-bold text-gray-900">2.3 days</p>
                <div className="flex items-center text-sm">
                  <TrendingDown className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600">-5.2%</span>
                </div>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Popular Routes */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Popular Routes</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[
                { route: 'Cape Town → Johannesburg', bookings: 156, revenue: 'R 780K', growth: '+23%' },
                { route: 'Johannesburg → Durban', bookings: 134, revenue: 'R 670K', growth: '+18%' },
                { route: 'Durban → Cape Town', bookings: 98, revenue: 'R 490K', growth: '+12%' },
                { route: 'Pretoria → Port Elizabeth', bookings: 76, revenue: 'R 380K', growth: '+8%' },
              ].map((route) => (
                <div key={route.route} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <Map className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <h4 className="font-medium text-gray-900">{route.route}</h4>
                      <p className="text-sm text-gray-500">{route.bookings} bookings</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{route.revenue}</p>
                    <p className="text-sm text-green-600">{route.growth}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
            </div>
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Revenue chart would be displayed here</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Customer Growth</h3>
            </div>
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Customer growth chart would be displayed here</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
