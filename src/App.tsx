import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import DepositPage from './pages/DepositPage';

export function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate checking authentication status
    const checkAuth = setTimeout(() => {
      // Check if user is logged in (could check localStorage, cookies, etc.)
      const userToken = localStorage.getItem('userToken');
      if (userToken) {
        setIsLoggedIn(true);
      }
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(checkAuth);
  }, []);
  
  const handleLogin = () => {
    // Set a dummy token
    localStorage.setItem('userToken', 'dummy-token-value');
    setIsLoggedIn(true);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('userToken');
    setIsLoggedIn(false);
  };

  if (isLoading) {
    return (
      <div className="loader">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            isLoggedIn ? 
              <Navigate to="/dashboard" /> : 
              <LandingPage onLogin={handleLogin} />
          } 
        />
        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<Dashboard onLogout={handleLogout} />} />
        <Route path="/dashboard/deposit" element={<DepositPage onLogout={handleLogout} />} />
      </Routes>
    </Router>
  );
}