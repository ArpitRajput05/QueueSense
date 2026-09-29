import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Clock, Users } from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

const AnalyticsDashboard = ({ orgId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orgId) return;
    
    fetch(`${API_BASE}/analytics/${orgId}/dashboard`)
      .then(res => res.json())
      .then(result => {
        setData(result);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch analytics", err);
        setLoading(false);
      });
  }, [orgId]);

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading AI Analytics...</div>;
  }

  if (!data) return null;

  // Format hour for display (e.g., 14 -> 2 PM)
  const chartData = data.hourly_visits.map(item => ({
    hourLabel: item.hour > 12 ? `${item.hour - 12} PM` : item.hour === 12 ? '12 PM' : `${item.hour} AM`,
    visitors: item.count
  }));

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Activity size={24} className="text-indigo-600" /> 
          Performance Analytics
        </h3>
        {data.mock_data && (
          <span className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-full border border-blue-100">
            AI Generated Demo Data
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center gap-4">
          <div className="bg-indigo-100 p-3 rounded-lg text-indigo-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-semibold uppercase">Total Visitors</p>
            <p className="text-2xl font-black text-gray-800">{data.total_visited}</p>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center gap-4">
          <div className="bg-indigo-100 p-3 rounded-lg text-indigo-600">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-semibold uppercase">Avg Wait Time</p>
            <p className="text-2xl font-black text-gray-800">{data.average_wait_time_mins} min</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="font-bold text-gray-700">Visitor Traffic by Hour</h4>
        <p className="text-sm text-gray-500 mb-4">Identify peak hours to optimize staff scheduling.</p>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="hourLabel" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
              <Tooltip 
                cursor={{fill: '#F3F4F6'}}
                contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
              />
              <Bar dataKey="visitors" fill="#4F46E5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
