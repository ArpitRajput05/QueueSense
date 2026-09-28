import React, { useState, useEffect } from 'react';
import { Clock, Users, Coffee, TrendingDown, BellRing } from 'lucide-react';

const QueueDashboard = () => {
  // State to hold the data coming from Java Spring Boot (which gets it from Pandas)
  const [queueData, setQueueData] = useState({
    currentlyServing: 0,
    yourTicket: 0,
    peopleAhead: 0,
    estimatedWaitMins: 0,
    historicalPace: "Loading AI Prediction...",
    safeToLeave: false
  });

  useEffect(() => {
    // Fetch real data from our Spring Boot backend
    fetch('http://localhost:8080/api/queue-status')
      .then(response => response.json())
      .then(data => setQueueData(data))
      .catch(error => console.error('Error fetching queue data:', error));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 font-sans">
      
      {/* Main Glassmorphism Card */}
      <div className="bg-white/70 backdrop-blur-lg border border-white/40 shadow-2xl rounded-3xl w-full max-w-md p-6 overflow-hidden relative">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">QueueSense AI</h1>
          <p className="text-sm text-gray-500 font-medium">City Hospital • General Checkup</p>
        </div>

        {/* Big Ticket Display */}
        <div className="flex justify-between items-center bg-white rounded-2xl p-6 shadow-sm mb-6 border border-gray-100">
          <div className="text-center w-1/2 border-r border-gray-200">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Serving</p>
            <p className="text-4xl font-black text-gray-300">#{queueData.currentlyServing}</p>
          </div>
          <div className="text-center w-1/2">
            <p className="text-xs text-indigo-500 uppercase tracking-wider font-bold mb-1">Your Ticket</p>
            <p className="text-5xl font-black text-indigo-600">#{queueData.yourTicket}</p>
          </div>
        </div>

        {/* AI Wait Time Predictor (Data Analysis Highlights) */}
        <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg mb-6 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 opacity-20">
            <Clock size={120} />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={18} className="text-indigo-200"/>
              <p className="text-sm font-semibold text-indigo-200">AI Estimated Wait</p>
            </div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-5xl font-black">{queueData.estimatedWaitMins}</h2>
              <span className="text-lg font-medium text-indigo-200">mins</span>
            </div>
            <div className="mt-4 inline-flex items-center gap-2 bg-indigo-500/50 rounded-full px-3 py-1 text-xs font-medium">
              <TrendingDown size={14} />
              {queueData.historicalPace}
            </div>
          </div>
        </div>

        {/* Smart Recommendations */}
        <div className="space-y-3">
          <div className={`flex items-center gap-4 p-4 rounded-xl border ${queueData.safeToLeave ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
            <div className={`p-3 rounded-full ${queueData.safeToLeave ? 'bg-green-200 text-green-700' : 'bg-red-200 text-red-700'}`}>
              {queueData.safeToLeave ? <Coffee size={20} /> : <BellRing size={20} />}
            </div>
            <div>
              <h3 className={`text-sm font-bold ${queueData.safeToLeave ? 'text-green-800' : 'text-red-800'}`}>
                {queueData.safeToLeave ? "Safe to grab a coffee!" : "Stay close!"}
              </h3>
              <p className={`text-xs ${queueData.safeToLeave ? 'text-green-600' : 'text-red-600'}`}>
                {queueData.safeToLeave ? "You have plenty of time." : "Your turn is coming up very soon."}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center gap-3">
              <Users size={18} className="text-gray-400" />
              <span className="text-sm font-semibold text-gray-700">People ahead of you</span>
            </div>
            <span className="text-lg font-bold text-gray-800">{queueData.peopleAhead}</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default QueueDashboard;
