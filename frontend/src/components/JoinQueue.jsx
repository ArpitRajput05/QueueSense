import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:8000/api';

const JoinQueue = () => {
  const { queueCode } = useParams();
  const navigate = useNavigate();
  const [queue, setQueue] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/queues/by-code/${queueCode}`)
      .then(res => {
        if (!res.ok) throw new Error('Queue not found');
        return res.json();
      })
      .then(data => {
        setQueue(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [queueCode]);

  const handleJoin = () => {
    setLoading(true);
    fetch(`${API_BASE}/queues/${queue.id}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to join queue');
        return res.json();
      })
      .then(data => {
        navigate(`/ticket/${data.ticket_id}`);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
        <h1 className="text-2xl font-black text-gray-800 mb-2">QueueSense</h1>
        <p className="text-gray-500 mb-8">{queue?.name || 'General Queue'}</p>
        
        <button 
          onClick={handleJoin}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg transition-colors"
        >
          JOIN QUEUE
        </button>
      </div>
    </div>
  );
};

export default JoinQueue;
