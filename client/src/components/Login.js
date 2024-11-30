import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { Button, TextField, Container, Typography, Box, Paper, Avatar, CircularProgress } from '@mui/material';
import { Lock as LockIcon, Email as EmailIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';

// Colors from the image
const colors = {
  darkest: '#051F20',   // Darkest green
  dark: '#0B2B26',      // Dark green
  medium: '#163832',    // Medium green
  regular: '#235347',   // Regular green
  light: '#8EB69B',     // Light green
  lightest: '#DAF1DE',  // Lightest green
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/feed');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(to bottom, ${colors.darkest}, ${colors.medium}, ${colors.regular})`,
        padding: 3,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        animation: 'fadeIn 2s ease-in-out',
        '@keyframes fadeIn': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            borderRadius: 2,
            backdropFilter: 'blur(10px)',
            backgroundColor: colors.lightest,
            border: `1px solid ${colors.light}20`,
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.15)',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: colors.light }}>
              <LockIcon />
            </Avatar>
            <Typography component="h1" variant="h5" sx={{ color: colors.dark }}>
              Welcome Back
            </Typography>
            <Typography sx={{ color: `${colors.dark}80`, textAlign: 'center', fontSize: '0.875rem' }}>
              Login to your account
            </Typography>
            {error && (
              <Typography color="error" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}
            <Box component="form" onSubmit={handleLogin} sx={{ mt: 1, width: '100%' }}>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: <EmailIcon sx={{ color: colors.dark, mr: 1 }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: colors.lightest,
                    color: colors.dark,
                    '& fieldset': { borderColor: `${colors.dark}40` },
                    '&:hover fieldset': { borderColor: colors.dark },
                    '&.Mui-focused fieldset': { borderColor: colors.dark },
                    '& input': { color: colors.dark },
                  },
                  '& .MuiInputLabel-root': {
                    color: colors.dark,
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: colors.dark,
                  },
                }}
              />
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: <LockIcon sx={{ color: colors.dark, mr: 1 }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: colors.lightest,
                    color: colors.dark,
                    '& fieldset': { borderColor: `${colors.dark}40` },
                    '&:hover fieldset': { borderColor: colors.dark },
                    '&.Mui-focused fieldset': { borderColor: colors.dark },
                    '& input': { color: colors.dark },
                  },
                  '& .MuiInputLabel-root': {
                    color: colors.dark,
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: colors.dark,
                  },
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  background: `linear-gradient(to bottom, ${colors.light}, ${colors.regular})`,
                  color: colors.darkest,
                  py: 1.5,
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: `linear-gradient(to bottom, ${colors.lightest}, ${colors.light})`,
                    transform: 'translateY(-2px)',
                    boxShadow: `0 4px 12px ${colors.light}40`,
                  },
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate('/')}
                startIcon={<ArrowBackIcon />}
                sx={{
                  mt: 2,
                  color: colors.dark,
                  borderColor: colors.dark,
                  borderRadius: '12px',
                  py: 1.5,
                  textTransform: 'none',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: colors.dark,
                    bgcolor: `${colors.dark}10`,
                    transform: 'translateY(-2px)',
                    boxShadow: `0 4px 12px ${colors.dark}40`,
                  },
                }}
              >
                Back to Home
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
