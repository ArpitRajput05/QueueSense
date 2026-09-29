import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import JoinQueue from './components/JoinQueue';
import TicketView from './components/TicketView';
import OrgDashboard from './components/OrgDashboard';
import Home from './components/Home';

function App() {
  return (
    <BrowserRouter>
      <div className="App min-h-screen bg-gray-50 font-sans">
        <Routes>
          {/* Main Landing */}
          <Route path="/" element={<Home />} />
          
          {/* Organization Routes */}
          <Route path="/organization/dashboard" element={<OrgDashboard />} />
          
          {/* User Routes */}
          <Route path="/join/:queueCode" element={<JoinQueue />} />
          <Route path="/ticket/:ticketId" element={<TicketView />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
