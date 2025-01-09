/* eslint-disable no-unused-vars */
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext'; // Import AuthProvider
import Layout from './components/Layout';
import Home from './components/Home';
import Cart from './components/Cart';
import './App.css';
import Payment from './components/Payment';
import Signup from './components/Signup';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import History from './components/History';

function App() {
  return (
    <AuthProvider> {/* Wrap everything with AuthProvider */}
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="cart" element={<Cart />} />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
            <Route path="payment" element={<Payment />} />
            <Route path="history" element={<History />} />
          </Route>
          <Route path="admin" element={<Dashboard />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
