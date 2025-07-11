import React, { useState } from 'react';
import Head from 'next/head';
import AdminLayout from '../../components/AdminLayout';
import { 
  Car, 
  Search, 
  Filter, 
  Download, 
  Edit, 
  Eye,
  MapPin,
  Calendar,
  Clock,
  User,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  Navigation,
  Star,
  TrendingUp,
  Activity
} from 'lucide-react';

interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  licenseNumber: string;
  status: 'active' | 'inactive' | 'suspended' | 'offline';
  rating: number;
  totalTrips: number;
  totalEarnings: number;
  joinDate: string;
  lastActive: string;
  vehicle: {
    make: string;
    model: string;
    year: number;
    licensePlate: string;
    capacity: string;
    type: 'van' | 'truck' | 'bakkie';
  };
  location: {
    city: string;
    province: string;
    coordinates?: { lat: number; lng: number };
  };
  currentBooking?: {
    id: string;
    customer: string;
    destination: string;
    estimatedCompletion: string;
  };
  documents: {
    license: 'verified' | 'pending' | 'expired';
    insurance: 'verified' | 'pending' | 'expired';
    registration: 'verified' | 'pending' | 'expired';
  };
}

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([
    {
      id: '1',
      name: 'Sipho Ndlovu',
      phone: '+27 83 345 6789',
      email: 'sipho.ndlovu@email.com',
      licenseNumber: 'GP123456789',
      status: 'active',
      rating: 4.8,
      totalTrips: 156,
      totalEarnings: 245000,
      joinDate: '2024-03-10',
      lastActive: '2025-01-07T14:30:00Z',
      vehicle: {
        make: 'Mercedes',
        model: 'Sprinter',
        year: 2020,
        licensePlate: 'GP 123 ABC',
        capacity: '3.5 tons',
        type: 'van'
      },
      location: {
        city: 'Johannesburg',
        province: 'Gauteng',
        coordinates: { lat: -26.2041, lng: 28.0473 }
      },
      currentBooking: {
        id: 'RELO001',
        customer: 'Thabo Mthembu',
        destination: 'Cape Town',
        estimatedCompletion: '2025-01-08T16:00:00Z'
      },
      documents: {
        license: 'verified',
        insurance: 'verified',
        registration: 'verified'
      }
    },
    {
      id: '2',
      name: 'Lungile Mbeki',
      phone: '+27 85 567 8901',
      email: 'lungile.mbeki@email.com',
      licenseNumber: 'EC987654321',
      status: 'active',
      rating: 4.6,
      totalTrips: 89,
      totalEarnings: 134000,
      joinDate: '2024-05-15',
      lastActive: '2025-01-07T12:15:00Z',
      vehicle: {
        make: 'Isuzu',
        model: 'NPR',
        year: 2019,
        licensePlate: 'EC 456 DEF',
        capacity: '5 tons',
        type: 'truck'
      },
      location: {
        city: 'Port Elizabeth',
        province: 'Eastern Cape',
        coordinates: { lat: -33.9608, lng: 25.6022 }
      },
      documents: {
        license: 'verified',
        insurance: 'verified',
        registration: 'verified'
      }
    },
    {
      id: '3',
      name: 'Busisiwe Dlamini',
      phone: '+27 88 890 1234',
      email: 'busisiwe.dlamini@email.com',
      licenseNumber: 'LP456789123',
      status: 'active',
      rating: 4.9,
      totalTrips: 203,
      totalEarnings: 312000,
      joinDate: '2024-01-20',
      lastActive: '2025-01-07T15:45:00Z',
      vehicle: {
        make: 'Ford',
        model: 'Transit',
        year: 2021,
        licensePlate: 'LP 789 GHI',
        capacity: '2 tons',
        type: 'van'
      },
      location: {
        city: 'Polokwane',
        province: 'Limpopo',
        coordinates: { lat: -23.9045, lng: 29.4689 }
      },
      currentBooking: {
        id: 'RELO005',
        customer: 'Johan Kruger',
        destination: 'Nelspruit',
        estimatedCompletion: '2025-01-08T10:00:00Z'
      },
      documents: {
        license: 'verified',
        insurance: 'verified',
        registration: 'verified'
      }
    },
    {
      id: '4',
      name: 'Mandla Sithole',
      phone: '+27 89 901 2345',
      email: 'mandla.sithole@email.com',
      licenseNumber: 'KZN789123456',
      status: 'offline',
      rating: 4.2,
      totalTrips: 45,
      totalEarnings: 67000,
      joinDate: '2024-08-12',
      lastActive: '2025-01-06T18:00:00Z',
      vehicle: {
        make: 'Toyota',
        model: 'Hilux',
        year: 2018,
        licensePlate: 'KZN 321 JKL',
        capacity: '1.5 tons',
        type: 'bakkie'
      },
      location: {
        city: 'Durban',
        province: 'KwaZulu-Natal'
      },
      documents: {
        license: 'verified',
        insurance: 'pending',
        registration: 'verified'
      }
    },
    {
      id: '5',
      name: 'Nthabiseng Mokoena',
      phone: '+27 90 012 3456',
      email: 'nthabiseng.mokoena@email.com',
      licenseNumber: 'FS654321987',
      status: 'suspended',
      rating: 3.8,
      totalTrips: 23,
      totalEarnings: 28000,
      joinDate: '2024-10-05',
      lastActive: '2024-12-20T10:30:00Z',
      vehicle: {
        make: 'Nissan',
        model: 'Cabstar',
        year: 2017,
        licensePlate: 'FS 654 MNO',
        capacity: '3 tons',
        type: 'truck'
      },
      location: {
        city: 'Bloemfontein',
        province: 'Free State'
      },
      documents: {
        license: 'expired',
        insurance: 'verified',
        registration: 'pending'
      }
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('all');

  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         driver.vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         driver.location.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || driver.status === statusFilter;
    const matchesVehicleType = vehicleTypeFilter === 'all' || driver.vehicle.type === vehicleTypeFilter;
    return matchesSearch && matchesStatus && matchesVehicleType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-700 bg-green-100 border-green-200';
      case 'inactive': return 'text-gray-700 bg-gray-100 border-gray-200';
      case 'suspended': return 'text-red-700 bg-red-100 border-red-200';
      case 'offline': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'inactive': return <XCircle className="w-4 h-4" />;
      case 'suspended': return <AlertCircle className="w-4 h-4" />;
      case 'offline': return <Clock className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getDocumentStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-700 bg-green-100';
      case 'pending': return 'text-yellow-700 bg-yellow-100';
      case 'expired': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getVehicleTypeIcon = (type: string) => {
    switch (type) {
      case 'van': return '🚐';
      case 'truck': return '🚛';
      case 'bakkie': return '🚚';
      default: return '🚗';
    }
  };

  return (
    <AdminLayout title="Drivers Management">
      <Head>
        <title>Drivers Management - RELOConnect Admin</title>
        <meta name="description" content="Manage drivers and their vehicles" />
      </Head>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Drivers Management</h1>
            <p className="text-gray-600">Monitor and manage all drivers and their vehicles</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Drivers</p>
                <p className="text-xl font-bold text-gray-900">{drivers.length}</p>
              </div>
              <Car className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-xl font-bold text-green-600">{drivers.filter(d => d.status === 'active').length}</p>
              </div>
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">On Trip</p>
                <p className="text-xl font-bold text-orange-600">{drivers.filter(d => d.currentBooking).length}</p>
              </div>
              <Navigation className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-xl font-bold text-yellow-600">{(drivers.reduce((sum, d) => sum + d.rating, 0) / drivers.length).toFixed(1)}</p>
              </div>
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-xl font-bold text-gray-900">R{drivers.reduce((sum, d) => sum + d.totalEarnings, 0).toLocaleString()}</p>
              </div>
              <TrendingUp className="w-6 h-6 text-green-600" />
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
                    placeholder="Search drivers..."
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
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                  <option value="offline">Offline</option>
                </select>
                <select
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={vehicleTypeFilter}
                  onChange={(e) => setVehicleTypeFilter(e.target.value)}
                >
                  <option value="all">All Vehicles</option>
                  <option value="van">Van</option>
                  <option value="truck">Truck</option>
                  <option value="bakkie">Bakkie</option>
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

          {/* Drivers Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documents
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Trip
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDrivers.map((driver) => (
                  <tr key={driver.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-medium">
                              {driver.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{driver.name}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {driver.location.city}, {driver.location.province}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-1 text-gray-400" />
                          {driver.phone}
                        </div>
                        <div className="text-xs text-gray-500">
                          License: {driver.licenseNumber}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">{getVehicleTypeIcon(driver.vehicle.type)}</span>
                        <div>
                          <div className="font-medium">{driver.vehicle.make} {driver.vehicle.model}</div>
                          <div className="text-xs text-gray-500">{driver.vehicle.licensePlate} • {driver.vehicle.capacity}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(driver.status)}`}>
                        {getStatusIcon(driver.status)}
                        <span className="ml-1">{driver.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-500 mr-1" />
                          <span>{driver.rating}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {driver.totalTrips} trips • R{driver.totalEarnings.toLocaleString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDocumentStatusColor(driver.documents.license)}`}>
                          License: {driver.documents.license}
                        </span>
                        <div className="flex space-x-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDocumentStatusColor(driver.documents.insurance)}`}>
                            Ins: {driver.documents.insurance}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDocumentStatusColor(driver.documents.registration)}`}>
                            Reg: {driver.documents.registration}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {driver.currentBooking ? (
                        <div>
                          <div className="font-medium text-blue-600">{driver.currentBooking.id}</div>
                          <div className="text-xs text-gray-500">
                            To: {driver.currentBooking.destination}
                          </div>
                          <div className="text-xs text-gray-500">
                            ETA: {new Date(driver.currentBooking.estimatedCompletion).toLocaleString()}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Not on trip</span>
                      )}
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
