import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Landing from './components/Landing';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import Map from './components/Map';
import Report from './components/Report';
import Insights from './components/Insights';
import Profile from './components/Profile';
import ApiTest from './components/ApiTest';
import './App.css';

// Import API tests in development - disabled quickApiTest to prevent quota issues
if (import.meta.env.DEV) {
  import('./utils/apiTest.js');
  import('./utils/manualApiTest.js'); // Manual testing utilities available in console
  // import('./utils/quickApiTest.js'); // Disabled to prevent quota exhaustion
}

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/home" element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } />
            <Route path="/map" element={
              <ProtectedRoute>
                <Map />
              </ProtectedRoute>
            } />
            <Route path="/report" element={
              <ProtectedRoute>
                <Report />
              </ProtectedRoute>
            } />
            <Route path="/insights" element={
              <ProtectedRoute>
                <Insights />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            {/* API Test Route - Development Only */}
            {import.meta.env.DEV && (
              <Route path="/api-test" element={<ApiTest />} />
            )}
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
