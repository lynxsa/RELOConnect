import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { MapPin, Users, Car, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

const RealTimeMonitor: React.FC = () => {
  const [liveData, setLiveData] = useState({
    activeBookings: 24,
    driversOnline: 18,
    systemLoad: 67,
    lastUpdate: new Date(),
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveData(prev => ({
        ...prev,
        activeBookings: prev.activeBookings + Math.floor(Math.random() * 3) - 1,
        driversOnline: prev.driversOnline + Math.floor(Math.random() * 3) - 1,
        systemLoad: Math.max(30, Math.min(90, prev.systemLoad + Math.floor(Math.random() * 10) - 5)),
        lastUpdate: new Date(),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const systemAlerts = [
    { id: 1, type: 'warning', message: 'High system load detected in Johannesburg', time: '2 min ago' },
    { id: 2, type: 'info', message: 'New driver registered in Cape Town', time: '5 min ago' },
    { id: 3, type: 'success', message: 'Booking completed successfully in Durban', time: '8 min ago' },
  ];

  return (
    <AdminLayout title="Real-time Monitor">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Real-time Monitor</h1>                <p className="text-gray-600">Live system monitoring and alerts across South Africa</p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Last updated: {liveData.lastUpdate.toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Live Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{liveData.activeBookings}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Car className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-green-600">
              <span className="font-medium">+3</span> in last hour
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Drivers Online</p>
                <p className="text-2xl font-bold text-gray-900">{liveData.driversOnline}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-green-600">
              <span className="font-medium">+2</span> since morning
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Load</p>
                <p className="text-2xl font-bold text-gray-900">{liveData.systemLoad}%</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-600 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${liveData.systemLoad}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Response Time</p>
                <p className="text-2xl font-bold text-gray-900">1.2s</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <MapPin className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-green-600">
              <span className="font-medium">-0.3s</span> improvement
            </div>
          </div>
        </div>

        {/* System Alerts */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">System Alerts</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {systemAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full ${
                    alert.type === 'warning' ? 'bg-yellow-100' :
                    alert.type === 'info' ? 'bg-blue-100' : 'bg-green-100'
                  }`}>
                    {alert.type === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-600" />}
                    {alert.type === 'info' && <Clock className="w-4 h-4 text-blue-600" />}
                    {alert.type === 'success' && <CheckCircle className="w-4 h-4 text-green-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{alert.message}</p>
                    <p className="text-xs text-gray-500">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Map Placeholder */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Live Tracking Map</h2>
          </div>
          <div className="p-6">
            <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Interactive map with live driver locations</p>
                <p className="text-sm text-gray-500 mt-2">Google Maps integration will be displayed here</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default RealTimeMonitor;
