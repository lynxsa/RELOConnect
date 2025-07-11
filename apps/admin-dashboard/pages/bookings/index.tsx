import React, { useState } from 'react';
import Head from 'next/head';
import AdminLayout from '../../components/AdminLayout';
import { 
  Package, 
  Search, 
  Filter, 
  Download, 
  Edit, 
  Eye,
  MapPin,
  Calendar,
  Clock,
  User,
  Truck,
  DollarSign,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  Navigation
} from 'lucide-react';

interface Booking {
  id: string;
  customer: {
    name: string;
    phone: string;
    email: string;
  };
  driver?: {
    name: string;
    phone: string;
    vehicle: string;
  };
  origin: string;
  destination: string;
  status: 'pending' | 'confirmed' | 'assigned' | 'in-transit' | 'completed' | 'cancelled';
  bookingDate: string;
  scheduledDate: string;
  completedDate?: string;
  items: string[];
  totalValue: number;
  distance: number;
  estimatedDuration: number;
  priority: 'low' | 'medium' | 'high';
  paymentStatus: 'pending' | 'paid' | 'failed';
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: 'RELO001',
      customer: {
        name: 'Thabo Mthembu',
        phone: '+27 81 123 4567',
        email: 'thabo.mthembu@email.com'
      },
      driver: {
        name: 'Sipho Ndlovu',
        phone: '+27 83 345 6789',
        vehicle: 'Mercedes Sprinter - GP 123 ABC'
      },
      origin: 'Cape Town, Western Cape',
      destination: 'Johannesburg, Gauteng',
      status: 'in-transit',
      bookingDate: '2025-01-05',
      scheduledDate: '2025-01-07',
      items: ['Furniture', 'Electronics', 'Clothing'],
      totalValue: 15000,
      distance: 1400,
      estimatedDuration: 18,
      priority: 'high',
      paymentStatus: 'paid'
    },
    {
      id: 'RELO002',
      customer: {
        name: 'Nomsa Khumalo',
        phone: '+27 82 234 5678',
        email: 'nomsa.khumalo@email.com'
      },
      origin: 'Durban, KwaZulu-Natal',
      destination: 'Pretoria, Gauteng',
      status: 'confirmed',
      bookingDate: '2025-01-06',
      scheduledDate: '2025-01-08',
      items: ['Household items', 'Garden tools'],
      totalValue: 12500,
      distance: 600,
      estimatedDuration: 8,
      priority: 'medium',
      paymentStatus: 'paid'
    },
    {
      id: 'RELO003',
      customer: {
        name: 'Pieter van der Merwe',
        phone: '+27 84 456 7890',
        email: 'pieter.vdm@email.com'
      },
      driver: {
        name: 'Lungile Mbeki',
        phone: '+27 85 567 8901',
        vehicle: 'Isuzu NPR - EC 456 DEF'
      },
      origin: 'Port Elizabeth, Eastern Cape',
      destination: 'Bloemfontein, Free State',
      status: 'completed',
      bookingDate: '2025-01-01',
      scheduledDate: '2025-01-03',
      completedDate: '2025-01-03',
      items: ['Office furniture', 'Documents'],
      totalValue: 8900,
      distance: 450,
      estimatedDuration: 6,
      priority: 'low',
      paymentStatus: 'paid'
    },
    {
      id: 'RELO004',
      customer: {
        name: 'Fatima Hassan',
        phone: '+27 86 678 9012',
        email: 'fatima.hassan@email.com'
      },
      origin: 'East London, Eastern Cape',
      destination: 'Cape Town, Western Cape',
      status: 'pending',
      bookingDate: '2025-01-07',
      scheduledDate: '2025-01-09',
      items: ['Furniture', 'Appliances'],
      totalValue: 11200,
      distance: 1000,
      estimatedDuration: 12,
      priority: 'medium',
      paymentStatus: 'pending'
    },
    {
      id: 'RELO005',
      customer: {
        name: 'Johan Kruger',
        phone: '+27 87 789 0123',
        email: 'johan.kruger@email.com'
      },
      driver: {
        name: 'Busisiwe Dlamini',
        phone: '+27 88 890 1234',
        vehicle: 'Ford Transit - LP 789 GHI'
      },
      origin: 'Polokwane, Limpopo',
      destination: 'Nelspruit, Mpumalanga',
      status: 'assigned',
      bookingDate: '2025-01-06',
      scheduledDate: '2025-01-08',
      items: ['Personal belongings', 'Kitchen items'],
      totalValue: 7800,
      distance: 300,
      estimatedDuration: 4,
      priority: 'low',
      paymentStatus: 'paid'
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.destination.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || booking.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'confirmed': return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'assigned': return 'text-purple-700 bg-purple-100 border-purple-200';
      case 'in-transit': return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'completed': return 'text-green-700 bg-green-100 border-green-200';
      case 'cancelled': return 'text-red-700 bg-red-100 border-red-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'assigned': return <User className="w-4 h-4" />;
      case 'in-transit': return <Navigation className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-700 bg-red-100';
      case 'medium': return 'text-yellow-700 bg-yellow-100';
      case 'low': return 'text-green-700 bg-green-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-700 bg-green-100';
      case 'pending': return 'text-yellow-700 bg-yellow-100';
      case 'failed': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  return (
    <AdminLayout title="Bookings Management">
      <Head>
        <title>Bookings Management - RELOConnect Admin</title>
        <meta name="description" content="Manage all relocations and bookings" />
      </Head>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bookings Management</h1>
            <p className="text-gray-600">Monitor and manage all relocation bookings</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-xl font-bold text-gray-900">{bookings.length}</p>
              </div>
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-xl font-bold text-yellow-600">{bookings.filter(b => b.status === 'pending').length}</p>
              </div>
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Transit</p>
                <p className="text-xl font-bold text-orange-600">{bookings.filter(b => b.status === 'in-transit').length}</p>
              </div>
              <Truck className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-xl font-bold text-green-600">{bookings.filter(b => b.status === 'completed').length}</p>
              </div>
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-xl font-bold text-gray-900">R{bookings.reduce((sum, b) => sum + b.totalValue, 0).toLocaleString()}</p>
              </div>
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search bookings..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="assigned">Assigned</option>
                  <option value="in-transit">In Transit</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <select
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  <option value="all">All Priority</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                  <Filter className="w-4 h-4 mr-1" />
                  More Filters
                </button>
                <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking
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
                    Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Schedule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{booking.id}</div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(booking.priority)}`}>
                            {booking.priority}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(booking.paymentStatus)}`}>
                            {booking.paymentStatus}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{booking.customer.name}</div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Phone className="w-3 h-3 mr-1" />
                        {booking.customer.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                          {booking.origin}
                        </div>
                        <div className="flex items-center mt-1">
                          <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                          {booking.destination}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {booking.distance}km • {booking.estimatedDuration}h
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                        {getStatusIcon(booking.status)}
                        <span className="ml-1">{booking.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.driver ? (
                        <div>
                          <div className="font-medium">{booking.driver.name}</div>
                          <div className="text-xs text-gray-500">{booking.driver.vehicle}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Not assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(booking.scheduledDate).toLocaleDateString()}
                      </div>
                      {booking.completedDate && (
                        <div className="text-xs text-green-600">
                          Completed: {new Date(booking.completedDate).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="font-medium">R{booking.totalValue.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">
                        {booking.items.length} items
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <Navigation className="w-4 h-4" />
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
    </AdminLayout>
  );
}
