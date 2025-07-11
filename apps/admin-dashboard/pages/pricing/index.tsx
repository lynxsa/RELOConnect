/* eslint-disable */
import React from 'react';
import Head from 'next/head';
import AdminLayout from '../../components/AdminLayout';
import { 
  DollarSign, 
  MapPin,
  TrendingUp,
  Settings,
  X,
  Zap
} from 'lucide-react';

const { useState } = React;

interface PricingRule {
  id: string;
  name: string;
  type: 'distance' | 'volume' | 'weight' | 'service';
  basePrice: number;
  pricePerUnit: number;
  minPrice: number;
  maxPrice: number;
  unit: string;
  active: boolean;
  description: string;
  lastUpdated: string;
}

interface RoutePrice {
  id: string;
  from: string;
  to: string;
  distance: number;
  basePrice: number;
  pricePerKm: number;
  estimatedDuration: number;
  multiplier: number;
  active: boolean;
  lastUpdated: string;
}

export default function PricingPage() {
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([
    {
      id: '1',
      name: 'Distance-based Pricing',
      type: 'distance',
      basePrice: 500,
      pricePerUnit: 8.50,
      minPrice: 500,
      maxPrice: 50000,
      unit: 'km',
      active: true,
      description: 'Standard pricing based on distance traveled',
      lastUpdated: '2025-01-07'
    },
    {
      id: '2',
      name: 'Volume-based Pricing',
      type: 'volume',
      basePrice: 200,
      pricePerUnit: 150,
      minPrice: 200,
      maxPrice: 20000,
      unit: 'm³',
      active: true,
      description: 'Pricing based on cargo volume',
      lastUpdated: '2025-01-06'
    },
    {
      id: '3',
      name: 'Weight-based Pricing',
      type: 'weight',
      basePrice: 300,
      pricePerUnit: 25,
      minPrice: 300,
      maxPrice: 15000,
      unit: 'kg',
      active: true,
      description: 'Pricing based on cargo weight',
      lastUpdated: '2025-01-05'
    },
    {
      id: '4',
      name: 'Premium Service',
      type: 'service',
      basePrice: 1000,
      pricePerUnit: 0,
      minPrice: 1000,
      maxPrice: 5000,
      unit: 'flat',
      active: true,
      description: 'Premium service with white glove handling',
      lastUpdated: '2025-01-04'
    }
  ]);

  const [routePrices, setRoutePrices] = useState<RoutePrice[]>([
    {
      id: '1',
      from: 'Cape Town',
      to: 'Johannesburg',
      distance: 1400,
      basePrice: 2000,
      pricePerKm: 12,
      estimatedDuration: 18,
      multiplier: 1.2,
      active: true,
      lastUpdated: '2025-01-07'
    },
    {
      id: '2',
      from: 'Johannesburg',
      to: 'Durban',
      distance: 600,
      basePrice: 1200,
      pricePerKm: 10,
      estimatedDuration: 8,
      multiplier: 1.0,
      active: true,
      lastUpdated: '2025-01-06'
    },
    {
      id: '3',
      from: 'Cape Town',
      to: 'Durban',
      distance: 1650,
      basePrice: 2200,
      pricePerKm: 11,
      estimatedDuration: 20,
      multiplier: 1.1,
      active: true,
      lastUpdated: '2025-01-05'
    },
    {
      id: '4',
      from: 'Johannesburg',
      to: 'Pretoria',
      distance: 60,
      basePrice: 500,
      pricePerKm: 8,
      estimatedDuration: 1,
      multiplier: 0.9,
      active: true,
      lastUpdated: '2025-01-04'
    }
  ]);

  const [activeTab, setActiveTab] = useState<'rules' | 'routes'>('rules');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredRules = pricingRules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || rule.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const filteredRoutes = routePrices.filter(route => {
    const matchesSearch = route.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         route.to.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'distance': return 'text-blue-700 bg-blue-100';
      case 'volume': return 'text-green-700 bg-green-100';
      case 'weight': return 'text-purple-700 bg-purple-100';
      case 'service': return 'text-orange-700 bg-orange-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const calculateTotalPrice = (rule: PricingRule, quantity: number) => {
    const calculatedPrice = rule.basePrice + (rule.pricePerUnit * quantity);
    return Math.min(Math.max(calculatedPrice, rule.minPrice), rule.maxPrice);
  };

  const calculateRoutePrice = (route: RoutePrice) => {
    return route.basePrice + (route.pricePerKm * route.distance * route.multiplier);
  };

  return (
    <AdminLayout title="Pricing Management">
      <Head>
        <title>Pricing Management - RELOConnect Admin</title>
        <meta name="description" content="Manage pricing rules and route prices" />
      </Head>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pricing Management</h1>
            <p className="text-gray-600">Configure pricing rules and route-specific prices</p>
          </div>
          <div className="flex space-x-2">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>Add Rule</span>
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
              <DollarSign className="w-4 h-4" />
              <span>Price Calculator</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Rules</p>
                <p className="text-2xl font-bold text-gray-900">{pricingRules.filter(r => r.active).length}</p>
              </div>
              <Settings className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Routes Configured</p>
                <p className="text-2xl font-bold text-gray-900">{routePrices.length}</p>
              </div>
              <MapPin className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Price/km</p>
                <p className="text-2xl font-bold text-gray-900">R{(routePrices.reduce((sum, r) => sum + r.pricePerKm, 0) / routePrices.length).toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Price Changes</p>
                <p className="text-2xl font-bold text-gray-900 flex items-center">
                  <TrendingUp className="w-5 h-5 text-green-500 mr-1" />
                  +5.2%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('rules')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'rules'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Pricing Rules
              </button>
              <button
                onClick={() => setActiveTab('routes')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'routes'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Route Prices
              </button>
            </nav>
          </div>

          {/* Search and Filters */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder={`Search ${activeTab}...`}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                {activeTab === 'rules' && (
                  <select
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <option value="all">All Types</option>
                    <option value="distance">Distance</option>
                    <option value="volume">Volume</option>
                    <option value="weight">Weight</option>
                    <option value="service">Service</option>
                  </select>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Refresh
                </button>
                <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          {activeTab === 'rules' ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rule Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Base Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Per Unit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Min/Max
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Example (10 units)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{rule.name}</div>
                          <div className="text-sm text-gray-500">{rule.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(rule.type)}`}>
                          {rule.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        R{rule.basePrice.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        R{rule.pricePerUnit.toLocaleString()}/{rule.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>
                          <div>Min: R{rule.minPrice.toLocaleString()}</div>
                          <div>Max: R{rule.maxPrice.toLocaleString()}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          rule.active ? 'text-green-700 bg-green-100' : 'text-gray-700 bg-gray-100'
                        }`}>
                          {rule.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="font-medium text-green-600">
                          R{calculateTotalPrice(rule, 10).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            <Calculator className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Route
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Distance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Base Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Per KM
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Multiplier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRoutes.map((route) => (
                    <tr key={route.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{route.from} → {route.to}</div>
                            <div className="text-sm text-gray-500">Last updated: {new Date(route.lastUpdated).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {route.distance.toLocaleString()} km
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        R{route.basePrice.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        R{route.pricePerKm.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {route.multiplier}x
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="font-medium text-green-600">
                          R{calculateRoutePrice(route).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {route.estimatedDuration}h
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            <Calculator className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
