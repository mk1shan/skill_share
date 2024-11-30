import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Typography, Box, Card, CardContent } from '@mui/material';
import { motion } from 'framer-motion';
import { Check, ChevronRight, Award, Users, Book } from 'lucide-react';

// Color palette
const colors = {
  primary: '#0A4D3C', // Dark Green
  secondary: '#E8F5E9', // Light Green/White
  accent: '#00C853', // Bright Green for highlights
  background: '#0A0A0A', // Near Black
  text: '#FFFFFF', // White
};

const features = [
  { icon: <Book className="w-6 h-6" />, title: "Expert-Led Courses", description: "Learn from industry professionals" },
  { icon: <Users className="w-6 h-6" />, title: "Global Community", description: "Connect with learners worldwide" },
  { icon: <Award className="w-6 h-6" />, title: "Verified Certificates", description: "Earn recognized credentials" }
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.background} 100%)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: 3,
      }}
    >
      {/* Hero Section */}
      <Container maxWidth="md" sx={{ py: 8 }}>
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h3" component="h1" gutterBottom sx={{ color: colors.text, fontWeight: 700 }}>
            Master New Skills with
            <span style={{ color: colors.accent, display: 'block', marginTop: '0.5rem' }}>Expert Guidance</span>
          </Typography>
          <Typography variant="h6" component="p" gutterBottom sx={{ color: 'gray.300', maxWidth: '600px', mx: 'auto' }}>
            Join our platform to learn, share, and grow with a community of passionate learners and experts
          </Typography>
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="contained"
              onClick={() => navigate('/signup')}
              sx={{
                backgroundColor: colors.accent,
                color: colors.text,
                py: 1.5,
                px: 3,
                borderRadius: '12px',
                textTransform: 'none',
                fontSize: '1rem',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: '#00A847',
                  transform: 'translateY(-2px)',
                  boxShadow: `0 4px 12px ${colors.accent}40`,
                },
              }}
            >
              Get Started
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/login')}
              sx={{
                borderColor: colors.text,
                color: colors.text,
                py: 1.5,
                px: 3,
                borderRadius: '12px',
                textTransform: 'none',
                fontSize: '1rem',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: colors.text,
                  color: colors.primary,
                  transform: 'translateY(-2px)',
                  boxShadow: `0 4px 12px ${colors.text}40`,
                },
              }}
            >
              Login
            </Button>
          </Box>
        </motion.div>
      </Container>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 4 }}>
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <Card sx={{ backgroundColor: `${colors.primary}20`, backdropFilter: 'blur(10px)', borderRadius: '12px', border: `1px solid ${colors.accent}20`, '&:hover': { borderColor: `${colors.accent}40` } }}>
                <CardContent>
                  <Box sx={{ backgroundColor: `${colors.accent}20`, p: 2, borderRadius: '50%', width: 'fit-content', mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" component="h3" sx={{ color: colors.text, fontWeight: 600, mb: 1 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'gray.300' }}>
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </Box>
      </Container>

      {/* Benefits Section */}
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[
            "Access to premium courses and resources",
            "Personal mentorship opportunities",
            "Interactive learning experience",
            "Industry-recognized certifications"
          ].map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="flex items-center gap-3"
            >
              <Check className="text-[#00C853] w-6 h-6" />
              <Typography variant="body1" sx={{ color: colors.text }}>
                {benefit}
              </Typography>
            </motion.div>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default Home;
