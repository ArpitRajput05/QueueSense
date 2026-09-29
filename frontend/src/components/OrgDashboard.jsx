import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Megaphone, Users, Clock, PlusCircle } from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

const OrgDashboard = () => {
  const [selectedQueue, setSelectedQueue] = useState(null);
  const [queueStatus, setQueueStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [orgName, setOrgName] = useState('My Business');
  const [queueName, setQueueName] = useState('General Queue');
  const [announcement, setAnnouncement] = useState('');
  const [isUpdatingAnnouncement, setIsUpdatingAnnouncement] = useState(false);

  useEffect(() => {
    fetchQueues();
  }, []);

  const fetchQueues = () => {
    fetch(`${API_BASE}/queues/`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setSelectedQueue(data[0]);
          setAnnouncement(data[0].announcement || '');
          fetchQueueStatus(data[0].id);
        }
        setLoading(false);
      });
  };

  const handleCreateQueue = (e) => {
    e.preventDefault();
    fetch(`${API_BASE}/organizations/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: orgName })
    })
    .then(res => res.json())
    .then(org => {
      return fetch(`${API_BASE}/queues/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: queueName, organization_id: org.id })
      });
    })
    .then(res => res.json())
    .then(queue => {
      setSelectedQueue(queue);
      fetchQueueStatus(queue.id);
    });
  };

  const fetchQueueStatus = (id) => {
    fetch(`${API_BASE}/queues/${id}/status`)
      .then(res => res.json())
      .then(data => setQueueStatus(data));
  };

  useEffect(() => {
    if (selectedQueue) {
      const interval = setInterval(() => fetchQueueStatus(selectedQueue.id), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedQueue]);

  const callNext = () => {
    if (!selectedQueue) return;
    fetch(`${API_BASE}/queues/${selectedQueue.id}/next`, { method: 'POST' })
      .then(() => fetchQueueStatus(selectedQueue.id));
  };

  const updateAnnouncement = (e) => {
    e.preventDefault();
    setIsUpdatingAnnouncement(true);
    fetch(`${API_BASE}/queues/${selectedQueue.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ announcement })
    })
    .then(() => {
      setIsUpdatingAnnouncement(false);
    });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (!selectedQueue) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-gray-800">Admin Setup</h1>
            <p className="text-gray-500 text-sm">Create your organization and queue.</p>
          </div>
          
          <form onSubmit={handleCreateQueue} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Organization Name</label>
              <input type="text" value={orgName} onChange={e => setOrgName(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Queue Name</label>
              <input type="text" value={queueName} onChange={e => setQueueName(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2">
              <PlusCircle size={20} /> Create Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <header className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-black text-gray-800">{selectedQueue.name}</h1>
            <p className="text-sm text-gray-500">Admin Dashboard • Queue Code: {selectedQueue.queue_code}</p>
          </div>
          <Link to="/" className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-medium hover:bg-gray-200">
            Exit
          </Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Controls */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                <p className="text-gray-500 font-semibold mb-1 text-sm uppercase">Serving</p>
                <p className="text-5xl font-black text-green-600">{queueStatus?.currently_serving || '--'}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                <p className="text-gray-500 font-semibold mb-1 text-sm uppercase">Next up</p>
                <p className="text-5xl font-black text-blue-600">{queueStatus?.next_ticket || '--'}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                <p className="text-gray-500 font-semibold mb-1 text-sm uppercase">Waiting</p>
                <p className="text-5xl font-black text-gray-800">{queueStatus?.waiting_count || '0'}</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
              <button 
                onClick={callNext}
                disabled={!queueStatus?.waiting_count}
                className={`w-full py-6 rounded-2xl font-black text-2xl transition-all shadow-lg hover:shadow-xl ${
                  queueStatus?.waiting_count 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-1' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                CALL NEXT PERSON
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4 text-indigo-600">
                <Megaphone size={20} />
                <h3 className="font-bold text-gray-800">Live Announcement</h3>
              </div>
              <form onSubmit={updateAnnouncement} className="flex gap-2">
                <input 
                  type="text" 
                  value={announcement}
                  onChange={e => setAnnouncement(e.target.value)}
                  placeholder="e.g., Doctor is on a 15-minute break..."
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <button type="submit" disabled={isUpdatingAnnouncement} className="px-6 py-3 bg-gray-800 text-white font-bold rounded-xl hover:bg-black transition">
                  {isUpdatingAnnouncement ? 'Saving...' : 'Broadcast'}
                </button>
              </form>
              <p className="text-xs text-gray-500 mt-2">This message will instantly appear on all customers' screens.</p>
            </div>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center">
              <h3 className="font-bold text-gray-800 mb-4">Printable QR Code</h3>
              <div className="bg-gray-50 p-4 rounded-2xl inline-block mb-4 border">
                <img src={selectedQueue.qr_image_url} alt="Queue QR" className="w-48 h-48" />
              </div>
              <p className="text-sm text-gray-600 mb-4">Print this and display it at your entrance.</p>
              <a 
                href={`/join/${selectedQueue.queue_code}`} 
                target="_blank" 
                rel="noreferrer"
                className="block w-full py-2 bg-indigo-50 text-indigo-600 font-bold rounded-xl hover:bg-indigo-100 transition"
              >
                Open Join Link
              </a>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Users size={18} /> Queue List</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {queueStatus?.tickets?.map(t => (
                  <div key={t.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="font-bold text-gray-700">{t.number}</span>
                    <span className="text-xs font-semibold text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">{t.status}</span>
                  </div>
                ))}
                {queueStatus?.tickets?.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">Queue is empty</p>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OrgDashboard;
