import React, { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Anchor, Search, MapPin, Ship, Calendar, TrendingUp, Activity, Globe, Clock, AlertTriangle, CheckCircle, Package } from 'lucide-react';

const RELOPortsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRegion, setFilterRegion] = useState('all');

  const ports = [
    {
      id: 1,
      name: 'Port of Los Angeles',
      code: 'LAX',
      region: 'West Coast',
      country: 'USA',
      status: 'active',
      volume: 2847,
      capacity: 5000,
      nextShipment: '2024-01-16T08:00:00Z',
      averageDelay: 2.3,
      congestion: 'low',
      services: ['Container', 'Cargo', 'Vehicle'],
      contact: '+1 (310) 555-0123',
      coordinates: { lat: 33.7701, lng: -118.1937 },
    },
    {
      id: 2,
      name: 'Port of New York',
      code: 'NYK',
      region: 'East Coast',
      country: 'USA',
      status: 'active',
      volume: 3421,
      capacity: 4500,
      nextShipment: '2024-01-16T06:30:00Z',
      averageDelay: 1.8,
      congestion: 'medium',
      services: ['Container', 'Cargo', 'Bulk'],
      contact: '+1 (212) 555-0456',
      coordinates: { lat: 40.6692, lng: -74.0445 },
    },
    {
      id: 3,
      name: 'Port of Miami',
      code: 'MIA',
      region: 'Southeast',
      country: 'USA',
      status: 'maintenance',
      volume: 1890,
      capacity: 3000,
      nextShipment: '2024-01-18T10:00:00Z',
      averageDelay: 4.2,
      congestion: 'high',
      services: ['Container', 'Cargo'],
      contact: '+1 (305) 555-0789',
      coordinates: { lat: 25.7617, lng: -80.1918 },
    },
    {
      id: 4,
      name: 'Port of Seattle',
      code: 'SEA',
      region: 'Northwest',
      country: 'USA',
      status: 'active',
      volume: 2156,
      capacity: 3500,
      nextShipment: '2024-01-16T14:00:00Z',
      averageDelay: 1.5,
      congestion: 'low',
      services: ['Container', 'Vehicle', 'Bulk'],
      contact: '+1 (206) 555-0321',
      coordinates: { lat: 47.6062, lng: -122.3321 },
    },
  ];

  const filteredPorts = ports.filter(port => {
    const matchesSearch = port.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         port.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         port.region.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = filterRegion === 'all' || port.region === filterRegion;
    return matchesSearch && matchesRegion;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-3 h-3 mr-1" />;
      case 'maintenance': return <AlertTriangle className="w-3 h-3 mr-1" />;
      case 'inactive': return <AlertTriangle className="w-3 h-3 mr-1" />;
      default: return <Clock className="w-3 h-3 mr-1" />;
    }
  };

  const getCongestionColor = (congestion: string) => {
    switch (congestion) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const regions = ['all', 'West Coast', 'East Coast', 'Southeast', 'Northwest', 'Gulf Coast'];

  return (
    <AdminLayout title="RELOPorts">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">RELOPorts</h1>
            <p className="text-gray-600">Port information and shipping logistics</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search ports..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
            >
              {regions.map(region => (
                <option key={region} value={region}>
                  {region === 'all' ? 'All Regions' : region}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Ports</p>
                <p className="text-2xl font-bold text-gray-900">18</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Anchor className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Volume</p>
                <p className="text-2xl font-bold text-gray-900">12,847</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Package className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Delay</p>
                <p className="text-2xl font-bold text-gray-900">2.4h</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Utilization</p>
                <p className="text-2xl font-bold text-gray-900">78%</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Ports Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Port Information</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Port</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Congestion</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Shipment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPorts.map((port) => (
                  <tr key={port.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center">
                          <Anchor className="w-5 h-5 text-white" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{port.name}</div>
                          <div className="text-sm text-gray-500">{port.code} • {port.country}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{port.region}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="font-medium">{port.volume} / {port.capacity}</div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(port.volume / port.capacity) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCongestionColor(port.congestion)}`}>
                        <Activity className="w-3 h-3 mr-1" />
                        {port.congestion}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{new Date(port.nextShipment).toLocaleDateString()}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(port.nextShipment).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(port.status)}`}>
                        {getStatusIcon(port.status)}
                        {port.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                      <button className="text-indigo-600 hover:text-indigo-900 mr-3">Track</button>
                      <button className="text-green-600 hover:text-green-900">Contact</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Services Overview */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Available Services</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-4">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">Container</div>
                <div className="text-sm text-gray-600">Standard container shipping</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-4">
                  <Ship className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">Cargo</div>
                <div className="text-sm text-gray-600">Bulk cargo handling</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-4">
                  <Globe className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">Vehicle</div>
                <div className="text-sm text-gray-600">Vehicle transportation</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default RELOPortsPage;
