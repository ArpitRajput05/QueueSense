import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, User } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black text-gray-800 mb-4 tracking-tight">QueueSense</h1>
        <p className="text-lg text-gray-500 font-medium max-w-md mx-auto">
          The smart, contactless way to manage waiting lines.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        <Link 
          to="/organization/dashboard" 
          className="group relative bg-white/70 backdrop-blur-lg border border-white/50 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 text-center overflow-hidden"
        >
          <div className="absolute inset-0 bg-indigo-600/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
          <div className="bg-indigo-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Building2 size={40} className="text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2 relative z-10">I am an Organization</h2>
          <p className="text-gray-500 relative z-10">Create queues, generate QR codes, and manage your waiting customers effortlessly.</p>
        </Link>

        <div className="group relative bg-white/70 backdrop-blur-lg border border-white/50 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 text-center overflow-hidden">
          <div className="absolute inset-0 bg-blue-600/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
          <div className="bg-blue-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
            <User size={40} className="text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2 relative z-10">I am a Customer</h2>
          <p className="text-gray-500 relative z-10 mb-6">Scan the QR code at the venue to join a queue. Or if you have a code, enter it below:</p>
          
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const code = e.target.elements.code.value;
              if (code) window.location.href = `/join/${code}`;
            }}
            className="relative z-10 flex gap-2"
          >
            <input 
              name="code"
              type="text" 
              placeholder="Enter Queue Code" 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
            />
            <button type="submit" className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">
              Join
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Home;
