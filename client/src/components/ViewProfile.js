import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Avatar,
  Box,
  Grid,
  Chip,
  Rating,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../firebase';
import { Star as StarIcon } from 'lucide-react';

const ViewProfile = () => {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userDoc = await getDoc(doc(firestore, 'users', userId));
        if (userDoc.exists()) {
          setProfile({ id: userDoc.id, ...userDoc.data() });
        } else {
          setError('Profile not found');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Error loading profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Typography variant="h5" color="error" textAlign="center">
          {error}
        </Typography>
      </Container>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      {/* Header Section */}
      <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item>
            <Avatar
              src={profile.avatar || '/api/placeholder/120/120'}
              alt={profile.name}
              sx={{ width: 120, height: 120 }}
            />
          </Grid>
          <Grid item xs>
            <Typography variant="h4" gutterBottom>
              {profile.name}
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {profile.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Rating
                value={profile.averageRating || 0}
                readOnly
                precision={0.5}
                emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
              />
              <Typography variant="body2" color="text.secondary">
                ({profile.averageRating?.toFixed(1) || '0'})
              </Typography>
              {profile.availability?.status === 'Available' && (
                <Chip label="Available" color="success" size="small" />
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={4}>
        {/* Left Column */}
        <Grid item xs={12} md={8}>
          {/* About Section */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                About
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                {profile.about || 'No description provided.'}
              </Typography>
            </CardContent>
          </Card>

          {/* Experience Section */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Experience
              </Typography>
              <List>
                {profile.experience?.map((exp, index) => (
                  <React.Fragment key={index}>
                    <ListItem alignItems="flex-start">
                      <ListItemText
                        primary={exp.title}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary">
                              {exp.company}
                            </Typography>
                            {` — ${exp.period}`}
                            <br />
                            {exp.description}
                          </>
                        }
                      />
                    </ListItem>
                    {index < profile.experience.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))}
                {(!profile.experience || profile.experience.length === 0) && (
                  <ListItem>
                    <ListItemText primary="No experience listed" />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={4}>
          {/* Skills Section */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Skills
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {profile.skills?.map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    variant="outlined"
                    color="primary"
                    size="small"
                  />
                ))}
                {(!profile.skills || profile.skills.length === 0) && (
                  <Typography variant="body2" color="text.secondary">
                    No skills listed
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Education Section */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Education
              </Typography>
              <List>
                {profile.education?.map((edu, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemText
                      primary={edu.degree}
                      secondary={
                        <>
                          {edu.school}
                          <br />
                          {edu.year}
                        </>
                      }
                    />
                  </ListItem>
                ))}
                {(!profile.education || profile.education.length === 0) && (
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText primary="No education listed" />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ViewProfile;
