// src/Routes.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Live from './pages/Live';
import Sales from './pages/Sales';
import Header from './Header';
import TotalSales from './pages/TotalSales';
import { AuthProvider } from './AuthContext';

const AppRoutes = () => {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/live" element={<Live />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/totalsales" element={<TotalSales />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default AppRoutes;
