import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

// Components
import Home from './components/Home';
import Signup from './components/Signup';
import Login from './components/Login';
import Feed from './components/Feed';
import Profile from './components/Profile';
import ViewProfile from './components/ViewProfile.js';
import Search from './components/Search';
import Navbar from './components/Navbar';

// Firebase
import { auth } from './firebase';
import theme from './theme';

// Protected Route Component
const ProtectedRoute = ({ children, requiresAuth }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (requiresAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          {user && <Navbar />}
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route 
              path="/signup" 
              element={user ? <Navigate to="/feed" replace /> : <Signup />} 
            />
            <Route 
              path="/login" 
              element={user ? <Navigate to="/feed" replace /> : <Login />} 
            />
            
            {/* Protected Routes */}
            <Route
              path="/feed"
              element={
                <ProtectedRoute requiresAuth>
                  <Feed />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute requiresAuth>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/search"
              element={
                <ProtectedRoute requiresAuth>
                  <Search />
                </ProtectedRoute>
              }
            />

            {/* View Profile Route - Accessible only when logged in */}
            <Route
              path="/profile/:userId"
              element={
                <ProtectedRoute requiresAuth>
                  <ViewProfile />
                </ProtectedRoute>
              }
            />

            {/* Logout Route */}
            <Route path="/logout" element={<Logout />} />

            {/* 404 Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

// Logout Component
const Logout = () => {
  useEffect(() => {
    const handleLogout = async () => {
      try {
        await auth.signOut();
      } catch (error) {
        console.error('Logout error:', error);
      }
    };
    handleLogout();
  }, []);

  return <Navigate to="/login" replace />;
};

export default App;
