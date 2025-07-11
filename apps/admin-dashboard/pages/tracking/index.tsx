import React from 'react';
import Head from 'next/head';
import AdminLayout from '../../components/AdminLayout';
import { 
  MapPin, 
  Navigation, 
  TrendingUp,
  Clock,
  Package,
  Truck,
  Users,
  AlertTriangle
} from 'lucide-react';

export default function TrackingPage() {
  const activeTrackings = [
    {
      id: 'RELO001',
      customer: 'Thabo Mthembu',
      driver: 'Sipho Ndlovu',
      from: 'Cape Town',
      to: 'Johannesburg',
      progress: 65,
      currentLocation: 'Bloemfontein',
      estimatedArrival: '2025-01-08T16:00:00Z',
      lastUpdate: '2025-01-07T14:30:00Z'
    },
    {
      id: 'RELO005',
      customer: 'Johan Kruger',
      driver: 'Busisiwe Dlamini',
      from: 'Polokwane',
      to: 'Nelspruit',
      progress: 30,
      currentLocation: 'Tzaneen',
      estimatedArrival: '2025-01-08T10:00:00Z',
      lastUpdate: '2025-01-07T15:45:00Z'
    }
  ];

  return (
    <AdminLayout title="Real-time Tracking">
      <Head>
        <title>Real-time Tracking - RELOConnect Admin</title>
        <meta name="description" content="Track active relocations in real-time" />
      </Head>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Real-time Tracking</h1>
            <p className="text-gray-600">Monitor active relocations and vehicle positions</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Trips</p>
                <p className="text-2xl font-bold text-gray-900">{activeTrackings.length}</p>
              </div>
              <Truck className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">On Schedule</p>
                <p className="text-2xl font-bold text-green-600">2</p>
              </div>
              <Clock className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Delayed</p>
                <p className="text-2xl font-bold text-orange-600">0</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Speed</p>
                <p className="text-2xl font-bold text-gray-900">85 km/h</p>
              </div>
              <Navigation className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Map Placeholder */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Live Map View</h3>
          </div>
          <div className="h-96 bg-gray-100 rounded-b-xl flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Map integration would be displayed here</p>
              <p className="text-sm text-gray-400">Google Maps integration with real-time vehicle positions</p>
            </div>
          </div>
        </div>

        {/* Active Trackings */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Active Trips</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {activeTrackings.map((tracking) => (
                <div key={tracking.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900">{tracking.id} - {tracking.customer}</h4>
                      <p className="text-sm text-gray-500">Driver: {tracking.driver}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{tracking.from} → {tracking.to}</p>
                      <p className="text-sm text-gray-500">Current: {tracking.currentLocation}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{tracking.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${tracking.progress}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">
                      ETA: {new Date(tracking.estimatedArrival).toLocaleString()}
                    </span>
                    <span className="text-gray-500">
                      Last update: {new Date(tracking.lastUpdate).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
