import React, { useState } from 'react';
import { Container, Box, Card, CardContent, Typography, TextField, Button, IconButton, CircularProgress } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../firebase";
import GoogleIcon from '@mui/icons-material/Google';
import { Visibility, VisibilityOff, Person, Email } from '@mui/icons-material';

// Theme colors matching login page
const colors = {
  primary: {
    main: '#3B82F6',
    dark: '#2563EB',
    light: '#60A5FA',
  },
  secondary: {
    main: '#93C5FD',
    dark: '#3B82F6',
    light: '#BFDBFE',
  },
  text: {
    primary: '#1E40AF',
    secondary: '#3B82F6',
  },
  background: {
    gradient: 'linear-gradient(135deg, #EFF6FF 0%, #BFDBFE 50%, #93C5FD 100%)',
    glass: 'rgba(255, 255, 255, 0.7)',
  }
};

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      navigate("/login");
    } catch (error) {
      if (error.code === 'auth/operation-not-allowed') {
        setError('Email/Password authentication is not enabled. Please enable it in the Firebase Console.');
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate("/feed");
    } catch (error) {
      if (error.code === 'auth/operation-not-allowed') {
        setError('Google authentication is not enabled. Please enable it in the Firebase Console.');
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: colors.background.gradient,
        padding: 3,
        animation: 'fadeIn 2s ease-in-out',
        '@keyframes fadeIn': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            position: 'relative',
            backdropFilter: 'blur(10px)',
            backgroundColor: colors.background.glass,
            borderRadius: '16px',
            border: `1px solid rgba(147, 197, 253, 0.2)`,
            boxShadow: '0 8px 32px 0 rgba(30, 64, 175, 0.15)',
            padding: 4,
            marginTop: '60px',
            overflow: 'visible',
            maxWidth: '90%',
            margin: '60px auto 0',
          }}
        >
          <CardContent>
            <Typography variant="h4" sx={{ textAlign: 'center', color: colors.text.primary, fontWeight: 700, mb: 4 }}>
              Create Account
            </Typography>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <TextField
                fullWidth
                label="Full Name"
                variant="outlined"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                InputProps={{
                  startAdornment: <Person sx={{ color: colors.primary.main, mr: 1 }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    '& fieldset': { borderColor: `${colors.primary.main}40` },
                    '&:hover fieldset': { borderColor: colors.primary.main },
                    '&.Mui-focused fieldset': { borderColor: colors.primary.main },
                  },
                }}
              />

              <TextField
                fullWidth
                label="Email"
                variant="outlined"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                InputProps={{
                  startAdornment: <Email sx={{ color: colors.primary.main, mr: 1 }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    '& fieldset': { borderColor: `${colors.primary.main}40` },
                    '&:hover fieldset': { borderColor: colors.primary.main },
                    '&.Mui-focused fieldset': { borderColor: colors.primary.main },
                  },
                }}
              />

              <TextField
                fullWidth
                label="Password"
                variant="outlined"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    '& fieldset': { borderColor: `${colors.primary.main}40` },
                    '&:hover fieldset': { borderColor: colors.primary.main },
                    '&.Mui-focused fieldset': { borderColor: colors.primary.main },
                  },
                }}
              />

              <TextField
                fullWidth
                label="Confirm Password"
                variant="outlined"
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    '& fieldset': { borderColor: `${colors.primary.main}40` },
                    '&:hover fieldset': { borderColor: colors.primary.main },
                    '&.Mui-focused fieldset': { borderColor: colors.primary.main },
                  },
                }}
              />

              {error && (
                <Typography color="error" variant="body2" sx={{ textAlign: 'center' }}>
                  {error}
                </Typography>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.dark} 100%)`,
                  color: 'white',
                  py: 1.5,
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: `linear-gradient(135deg, ${colors.primary.light} 0%, ${colors.primary.main} 100%)`,
                    transform: 'translateY(-2px)',
                    boxShadow: `0 4px 12px ${colors.primary.main}40`,
                  },
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
              </Button>

              <Box sx={{ position: 'relative', textAlign: 'center', my: 2 }}>
                <Box sx={{
                  position: 'absolute',
                  top: '50%',
                  left: 0,
                  right: 0,
                  height: '1px',
                  bgcolor: `${colors.primary.main}20`,
                }} />
                <Typography sx={{ 
                  display: 'inline-block',
                  px: 2,
                  bgcolor: colors.background.glass,
                  position: 'relative',
                  color: colors.text.primary
                }}>
                  OR
                </Typography>
              </Box>

              <Button
                fullWidth
                variant="outlined"
                onClick={handleGoogleSignIn}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <GoogleIcon />}
                sx={{
                  color: '#4285F4',
                  borderColor: '#4285F4',
                  borderRadius: '12px',
                  py: 1.5,
                  textTransform: 'none',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: '#4285F4',
                    bgcolor: 'rgba(66, 133, 244, 0.04)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(66, 133, 244, 0.2)',
                  },
                }}
              >
                Sign Up with Google
              </Button>

              <Typography variant="body2" sx={{ textAlign: 'center', mt: 2, color: colors.text.primary }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: colors.primary.main, textDecoration: 'none', fontWeight: 600 }}>
                  Log In
                </Link>
              </Typography>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Signup;
