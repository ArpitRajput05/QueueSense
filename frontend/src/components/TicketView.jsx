import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, Users, Coffee, BellRing, Info } from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

const TicketView = () => {
  const { ticketId } = useParams();
  const [ticketData, setTicketData] = useState(null);
  const [error, setError] = useState('');

  const fetchStatus = () => {
    fetch(`${API_BASE}/tickets/${ticketId}/status`)
      .then(res => {
        if (!res.ok) throw new Error('Ticket not found');
        return res.json();
      })
      .then(data => setTicketData(data))
      .catch(err => setError(err.message));
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000); // Poll every 3 seconds for fast updates
    return () => clearInterval(interval);
  }, [ticketId]);

  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500 font-bold bg-gray-50">{error}</div>;
  if (!ticketData) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium">Loading your ticket...</p>
      </div>
    </div>
  );

  const isNext = ticketData.people_ahead === 0;
  const isCalled = ticketData.status === 'SERVING';
  const isServed = ticketData.status === 'SERVED';
  
  // Smart recommendation logic
  const safeToLeave = ticketData.estimated_wait_minutes > 15;

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-indigo-50 to-white flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        
        {/* Main Ticket Card - Glassmorphism */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl rounded-[2.5rem] p-8 relative overflow-hidden">
          
          {/* Header */}
          <div className="text-center mb-8 relative z-10">
            <h2 className="text-sm font-bold text-indigo-500 uppercase tracking-widest mb-1">QueueSense</h2>
            <p className="text-xs text-gray-400 font-medium">Live Digital Token</p>
          </div>

          {/* Ticket Number */}
          <div className="text-center relative z-10 mb-8">
            <p className="text-gray-400 text-sm font-semibold mb-2">YOUR TOKEN</p>
            <h1 className="text-7xl font-black text-gray-800 tracking-tighter mb-4">{ticketData.ticket_number}</h1>
            
            {isCalled ? (
              <span className="inline-block bg-green-500 text-white px-6 py-2 rounded-full text-sm font-black uppercase tracking-wider shadow-lg shadow-green-500/30 animate-pulse">
                It's your turn!
              </span>
            ) : isServed ? (
              <span className="inline-block bg-gray-200 text-gray-600 px-6 py-2 rounded-full text-sm font-black uppercase tracking-wider">
                Served
              </span>
            ) : (
              <span className="inline-block bg-indigo-100 text-indigo-700 px-6 py-2 rounded-full text-sm font-black uppercase tracking-wider">
                Waiting
              </span>
            )}
          </div>

          {/* Org Announcement */}
          {ticketData.announcement && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6 relative z-10 flex gap-3 shadow-sm">
              <Info className="text-yellow-500 shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-xs font-bold text-yellow-700 uppercase tracking-wider mb-1">Notice</p>
                <p className="text-sm text-yellow-900 font-medium leading-tight">{ticketData.announcement}</p>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
              <Users className="mx-auto text-gray-400 mb-2" size={20} />
              <p className="text-3xl font-black text-gray-800 mb-1">{ticketData.people_ahead}</p>
              <p className="text-xs text-gray-500 font-bold uppercase">Ahead of you</p>
            </div>
            
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
              <Clock className="mx-auto text-indigo-400 mb-2" size={20} />
              <p className="text-3xl font-black text-indigo-600 mb-1">{ticketData.estimated_wait_minutes}</p>
              <p className="text-xs text-indigo-400 font-bold uppercase">Mins Wait</p>
            </div>
          </div>

          {/* Smart Recommendation */}
          {!isCalled && !isServed && (
            <div className={`p-4 rounded-2xl flex items-center gap-4 relative z-10 border ${
              safeToLeave ? 'bg-green-50 border-green-100' : 
              isNext ? 'bg-blue-50 border-blue-100' : 'bg-orange-50 border-orange-100'
            }`}>
              <div className={`p-3 rounded-full ${
                safeToLeave ? 'bg-green-200 text-green-700' : 
                isNext ? 'bg-blue-200 text-blue-700' : 'bg-orange-200 text-orange-700'
              }`}>
                {safeToLeave ? <Coffee size={24} /> : <BellRing size={24} />}
              </div>
              <div>
                <h3 className={`font-black ${
                  safeToLeave ? 'text-green-800' : 
                  isNext ? 'text-blue-800' : 'text-orange-800'
                }`}>
                  {safeToLeave ? "Grab a coffee ☕" : 
                   isNext ? "Get ready! 🏃" : "Stay close 👀"}
                </h3>
                <p className={`text-sm font-medium ${
                  safeToLeave ? 'text-green-600' : 
                  isNext ? 'text-blue-600' : 'text-orange-600'
                }`}>
                  {safeToLeave ? "You have plenty of time." : 
                   isNext ? "You are the very next person." : "Your turn is coming up soon."}
                </p>
              </div>
            </div>
          )}

          {/* Background Decorations */}
          <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-indigo-400/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-[-50px] left-[-50px] w-40 h-40 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-sm font-medium text-gray-400 hover:text-gray-600 transition">
            Powered by QueueSense
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TicketView;
