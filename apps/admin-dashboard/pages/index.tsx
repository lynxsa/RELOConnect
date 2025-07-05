import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Activity,
  Users,
  DollarSign,
  Package,
  TrendingUp,
  TrendingDown,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  Zap,
  Brain,
  BarChart3,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Settings,
  Bell,
  Search,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';
import { ReloAI } from '../lib/reloai';
import ReloAIChat from '../components/ReloAIChat';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface DashboardStats {
  totalBookings: number;
  activeBookings: number;
  totalRevenue: number;
  totalUsers: number;
  bookingsTrend: number;
  revenueTrend: number;
  usersTrend: number;
  completionRate: number;
}

interface BookingData {
  id: string;
  customer: string;
  origin: string;
  destination: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  value: number;
  date: string;
  driver?: string;
}

interface ServiceStatus {
  name: string;
  status: 'healthy' | 'warning' | 'error';
  uptime: number;
  responseTime: number;
  lastChecked: string;
}

export default function Home() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 3847,
    activeBookings: 127,
    totalRevenue: 58420000, // R58.42M
    totalUsers: 2156,
    bookingsTrend: 18.7,
    revenueTrend: 12.4,
    usersTrend: 22.3,
    completionRate: 96.2,
  });

  const [recentBookings, setRecentBookings] = useState<BookingData[]>([
    {
      id: 'RELO001',
      customer: 'Thabo Mthembu',
      origin: 'Cape Town, Western Cape',
      destination: 'Johannesburg, Gauteng',
      status: 'in-progress',
      value: 15000,
      date: '2025-07-04',
      driver: 'Sipho Ndlovu',
    },
    {
      id: 'RELO002',
      customer: 'Nomsa Khumalo',
      origin: 'Durban, KwaZulu-Natal',
      destination: 'Pretoria, Gauteng',
      status: 'confirmed',
      value: 12500,
      date: '2025-07-04',
    },
    {
      id: 'RELO003',
      customer: 'Pieter van der Merwe',
      origin: 'Port Elizabeth, Eastern Cape',
      destination: 'Bloemfontein, Free State',
      status: 'completed',
      value: 8900,
      date: '2025-07-03',
      driver: 'Lungile Mbeki',
    },
    {
      id: 'RELO004',
      customer: 'Fatima Hassan',
      origin: 'East London, Eastern Cape',
      destination: 'Cape Town, Western Cape',
      status: 'pending',
      value: 11200,
      date: '2025-07-05',
    },
    {
      id: 'RELO005',
      customer: 'Johan Kruger',
      origin: 'Polokwane, Limpopo',
      destination: 'Nelspruit, Mpumalanga',
      status: 'in-progress',
      value: 7800,
      date: '2025-07-04',
      driver: 'Busisiwe Dlamini',
    },
  ]);

  const [serviceStatus, setServiceStatus] = useState<ServiceStatus[]>([
    {
      name: 'Auth Service',
      status: 'healthy',
      uptime: 99.8,
      responseTime: 32,
      lastChecked: '2025-07-05T10:30:00Z',
    },
    {
      name: 'Booking Service',
      status: 'healthy',
      uptime: 99.9,
      responseTime: 85,
      lastChecked: '2025-07-05T10:30:00Z',
    },
    {
      name: 'Payment Service',
      status: 'healthy',
      uptime: 99.6,
      responseTime: 156,
      lastChecked: '2025-07-05T10:30:00Z',
    },
    {
      name: 'Vehicle Tracking',
      status: 'healthy',
      uptime: 99.9,
      responseTime: 67,
      lastChecked: '2025-07-05T10:30:00Z',
    },
    {
      name: 'Route Optimization',
      status: 'warning',
      uptime: 98.2,
      responseTime: 289,
      lastChecked: '2025-07-05T10:30:00Z',
    },
  ]);

  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [refreshing, setRefreshing] = useState(false);
  const [reloAIInsight, setReloAIInsight] = useState<string>('');

  useEffect(() => {
    // Generate initial ReloAI insight
    setReloAIInsight(ReloAI.generateInsight('dashboard_overview'));
  }, []);

  // Chart data
  const revenueChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Revenue (R)',
        data: [4200000, 5100000, 4800000, 6300000, 7200000, 8100000, 8800000],
        borderColor: '#0057FF',
        backgroundColor: 'rgba(0, 87, 255, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const bookingsChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Bookings',
        data: [78, 92, 65, 110, 125, 89, 67],
        backgroundColor: '#00B2FF',
      },
    ],
  };

  const statusChartData = {
    labels: ['Completed', 'In Progress', 'Pending', 'Cancelled'],
    datasets: [
      {
        data: [67, 15, 12, 6],
        backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'],
      },
    ],
  };

  const refreshData = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getBookingStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-700 bg-green-100';
      case 'in-progress': return 'text-blue-700 bg-blue-100';
      case 'confirmed': return 'text-yellow-700 bg-yellow-100';
      case 'pending': return 'text-gray-700 bg-gray-100';
      case 'cancelled': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  return (
    <>
      <Head>
        <title>RELOConnect Admin Dashboard</title>
        <meta name="description" content="RELOConnect Administration Dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-400 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="text-xl font-bold text-gray-900">RELOConnect Admin</h1>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Bell className="w-5 h-5" />
                </button>
                
                <button onClick={refreshData} className="p-2 text-gray-400 hover:text-gray-600">
                  <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
                
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* ReloAI Insights Banner */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Brain className="w-8 h-8" />
                <div>
                  <h2 className="text-xl font-bold">ReloAI Insights</h2>
                  <p className="text-blue-100">{reloAIInsight || 'Cape Town to Johannesburg route showing 23% increase in bookings. Recommend adding 2 more trucks for this high-demand corridor during weekends.'}</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={() => setReloAIInsight(ReloAI.generateInsight('user_request'))}
                  className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>New Insight</span>
                </button>
                <button 
                  onClick={() => setIsChatOpen(true)}
                  className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Brain className="w-4 h-4" />
                  <span>Chat with ReloAI</span>
                </button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalBookings.toLocaleString()}</p>
                  <div className="flex items-center text-sm">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-green-600">+{stats.bookingsTrend}%</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">R{(stats.totalRevenue / 1000000).toFixed(1)}M</p>
                  <div className="flex items-center text-sm">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-green-600">+{stats.revenueTrend}%</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
                  <div className="flex items-center text-sm">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-green-600">+{stats.usersTrend}%</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completionRate}%</p>
                  <div className="flex items-center text-sm">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-green-600">+2.1%</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
                <select
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
                >
                  <option value="7d">7 Days</option>
                  <option value="30d">30 Days</option>
                  <option value="90d">90 Days</option>
                </select>
              </div>
              <div className="h-64">
                <Line
                  data={revenueChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function(value) {
                            return 'R' + (Number(value) / 1000000).toFixed(1) + 'M';
                          },
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Weekly Bookings</h3>
              <div className="h-64">
                <Bar
                  data={bookingsChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>

          {/* Service Status & Booking Status */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Service Health</h3>
              <div className="space-y-4">
                {serviceStatus.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getStatusColor(service.status)}`}>
                        {getStatusIcon(service.status)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{service.name}</p>
                        <p className="text-sm text-gray-500">
                          Uptime: {service.uptime}% | Response: {service.responseTime}ms
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                        {service.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Booking Status</h3>
              <div className="h-64">
                <Doughnut
                  data={statusChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
                <div className="flex items-center space-x-2">
                  <button className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm">
                    <Filter className="w-4 h-4 mr-1" />
                    Filter
                  </button>
                  <button className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm">
                    <Download className="w-4 h-4 mr-1" />
                    Export
                  </button>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Booking ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Route
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {booking.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {booking.customer}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {booking.origin} → {booking.destination}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBookingStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        R{booking.value.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(booking.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-900">
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ReloAI Chat Interface */}
      <ReloAIChat 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />
    </>
  );
}
