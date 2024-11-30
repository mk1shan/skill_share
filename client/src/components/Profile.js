import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Container,
  Box,
  Grid,
  Paper,
  Typography,
  Avatar,
  TextField,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Chip,
  LinearProgress,
  Badge,
  useTheme
} from '@mui/material';
import {
  Edit,
  Delete,
  Add,
  Event,
  School,
  LinkedIn,
  GitHub,
  VideoCall,
  Message
} from '@mui/icons-material';
import { firestore, auth } from '../firebase'; // Ensure correct path
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

// Enhanced color palette
const colors = {
  darkest: '#051F20',
  dark: '#0B2B26',
  medium: '#163832',
  regular: '#235347',
  light: '#8EB69B',
  lightest: '#DAF1DE',
  overlay: 'rgba(5, 31, 32, 0.8)',
};

const Profile = () => {
  const theme = useTheme();

  // State declarations
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [avatar, setAvatar] = useState('/api/placeholder/100/100');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState([]);
  const [skillLevels, setSkillLevels] = useState({});
  const [newSkill, setNewSkill] = useState('');
  const [editSkillIndex, setEditSkillIndex] = useState(null);
  const [editSkill, setEditSkill] = useState('');
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState(null);
  const [courses, setCourses] = useState([]);
  const [completedCourses, setCompletedCourses] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [newCourse, setNewCourse] = useState('');
  const [newMeeting, setNewMeeting] = useState('');
  const [teachingStats, setTeachingStats] = useState({
    totalStudents: 0,
    averageRating: 0,
    totalHours: 0
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      const user = auth.currentUser;
      if (user) {
        setUserId(user.uid);
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setName(userData.name || '');
          setTitle(userData.title || '');
          setAvatar(userData.avatar || '/api/placeholder/100/100');
          setBio(userData.bio || '');
          setSkills(userData.skills || []);
          setSkillLevels(userData.skillLevels || {});
          setCourses(userData.courses || []);
          setCompletedCourses(userData.completedCourses || []);
          setMeetings(userData.meetings || []);
          setTeachingStats(userData.teachingStats || {
            totalStudents: 0,
            averageRating: 0,
            totalHours: 0
          });
        } else {
          // Create a new document if it doesn't exist
          await setDoc(userDocRef, {
            name: user.displayName || 'Anonymous',
            title: '',
            avatar: user.photoURL || '/api/placeholder/100/100',
            bio: '',
            skills: [],
            skillLevels: {},
            courses: [],
            completedCourses: [],
            meetings: [],
            teachingStats: {
              totalStudents: 0,
              averageRating: 0,
              totalHours: 0
            }
          });
          setName(user.displayName || 'Anonymous');
          setAvatar(user.photoURL || '/api/placeholder/100/100');
          setSkills([]);
          setSkillLevels({});
          setCourses([]);
          setCompletedCourses([]);
          setMeetings([]);
          setTeachingStats({
            totalStudents: 0,
            averageRating: 0,
            totalHours: 0
          });
        }
      }
    };

    fetchUserProfile();
  }, []);

  const handleSaveProfile = async () => {
    if (userId) {
      const userDocRef = doc(firestore, 'users', userId);
      await setDoc(userDocRef, {
        name,
        title,
        avatar,
        bio,
        skills,
        skillLevels,
        courses,
        completedCourses,
        meetings,
        teachingStats
      }, { merge: true });
    }
  };

  // Skill Handlers
  const handleAddSkill = async () => {
    if (newSkill.trim()) {
      const updatedSkills = [...skills, newSkill];
      setSkills(updatedSkills);
      setSkillLevels({
        ...skillLevels,
        [newSkill]: 50 // Default skill level
      });
      setNewSkill('');
      await updateSkillsInFirestore(updatedSkills, {
        ...skillLevels,
        [newSkill]: 50
      });
    }
  };

  const handleEditSkill = (index) => {
    setEditSkillIndex(index);
    setEditSkill(skills[index]);
    setOpen(true);
  };

  const handleSaveEditSkill = async () => {
    const updatedSkills = [...skills];
    const updatedSkillLevels = { ...skillLevels };
    updatedSkills[editSkillIndex] = editSkill;
    updatedSkillLevels[editSkill] = updatedSkillLevels[skills[editSkillIndex]];
    delete updatedSkillLevels[skills[editSkillIndex]];
    setSkills(updatedSkills);
    setSkillLevels(updatedSkillLevels);
    setEditSkill('');
    setEditSkillIndex(null);
    setOpen(false);
    await updateSkillsInFirestore(updatedSkills, updatedSkillLevels);
  };

  const handleDeleteSkill = async (index) => {
    const updatedSkills = skills.filter((_, i) => i !== index);
    const updatedSkillLevels = { ...skillLevels };
    delete updatedSkillLevels[skills[index]];
    setSkills(updatedSkills);
    setSkillLevels(updatedSkillLevels);
    await updateSkillsInFirestore(updatedSkills, updatedSkillLevels);
  };

  const updateSkillsInFirestore = async (updatedSkills, updatedSkillLevels) => {
    if (userId) {
      const userDocRef = doc(firestore, 'users', userId);
      await updateDoc(userDocRef, {
        skills: updatedSkills,
        skillLevels: updatedSkillLevels
      });
    }
  };

  // Course Handlers
  const handleAddCourse = async () => {
    if (newCourse.trim()) {
      const updatedCourses = [...courses, newCourse];
      setCourses(updatedCourses);
      setNewCourse('');
      await updateCoursesInFirestore(updatedCourses);
    }
  };

  const handleAddCompletedCourse = async (course) => {
    if (course.trim()) {
      const updatedCompletedCourses = [...completedCourses, course];
      setCompletedCourses(updatedCompletedCourses);
      await updateCompletedCoursesInFirestore(updatedCompletedCourses);
    }
  };

  const updateCoursesInFirestore = async (updatedCourses) => {
    if (userId) {
      const userDocRef = doc(firestore, 'users', userId);
      await updateDoc(userDocRef, {
        courses: updatedCourses
      });
    }
  };

  const updateCompletedCoursesInFirestore = async (updatedCompletedCourses) => {
    if (userId) {
      const userDocRef = doc(firestore, 'users', userId);
      await updateDoc(userDocRef, {
        completedCourses: updatedCompletedCourses
      });
    }
  };

  // Meeting Handlers
  const handleAddMeeting = async () => {
    if (newMeeting.trim()) {
      const updatedMeetings = [...meetings, newMeeting];
      setMeetings(updatedMeetings);
      setNewMeeting('');
      await updateMeetingsInFirestore(updatedMeetings);
    }
  };

  const updateMeetingsInFirestore = async (updatedMeetings) => {
    if (userId) {
      const userDocRef = doc(firestore, 'users', userId);
      await updateDoc(userDocRef, {
        meetings: updatedMeetings
      });
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  const skillBarVariants = {
    hidden: { width: 0 },
    visible: { 
      width: "100%",
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const hoverScale = {
    scale: 1.02,
    transition: { type: "spring", stiffness: 400, damping: 10 }
  };

  const paperStyles = {
    backgroundColor: 'background.paper',
    borderRadius: 2,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    position: 'relative',
    '&:hover': {
      boxShadow: '0 6px 30px rgba(0, 0, 0, 0.15)',
      transition: 'box-shadow 0.3s ease-in-out'
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Grid container spacing={4}>
          {/* Left Column */}
          <Grid item xs={12} md={4}>
            {/* Skills Section */}
            <motion.div variants={cardVariants}>
              <Paper 
                elevation={0}
                sx={{ ...paperStyles, p: 3 }}
              >
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Skills & Expertise
                </Typography>
                <Box sx={{ px: 1 }}>
                  {skills.map((skill, index) => (
                    <motion.div
                      key={skill}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">{skill}</Typography>
                          <Typography variant="body2" color="text.secondary">{skillLevels[skill]}%</Typography>
                        </Box>
                        <motion.div
                          initial="hidden"
                          animate="visible"
                          variants={skillBarVariants}
                        >
                          <LinearProgress
                            variant="determinate"
                            value={skillLevels[skill]}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              backgroundColor: 'rgba(0,0,0,0.04)',
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 3,
                                backgroundImage: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                              }
                            }}
                          />
                        </motion.div>
                      </Box>
                    </motion.div>
                  ))}
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    label="New Skill"
                    variant="outlined"
                    size="small"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    sx={{
                      flex: 1,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        '&:hover': {
                          '& > fieldset': {
                            borderColor: colors.medium,
                          }
                        }
                      }
                    }}
                  />
                  <IconButton color="primary" onClick={handleAddSkill}>
                    <Add />
                  </IconButton>
                </Box>
              </Paper>
            </motion.div>

            {/* Courses Section */}
            <motion.div variants={cardVariants}>
              <Paper 
                elevation={0}
                sx={{ ...paperStyles, mt: 3, p: 3 }}
              >
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Courses
                </Typography>
                <List sx={{ width: '100%' }}>
                  {courses.map((course, index) => (
                    <ListItem key={index}>
                      <ListItemAvatar>
                        <Avatar>
                          <School />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={course} />
                    </ListItem>
                  ))}
                  <ListItem>
                    <TextField
                      fullWidth
                      label="Add Course"
                      variant="outlined"
                      size="small"
                      value={newCourse}
                      onChange={(e) => setNewCourse(e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          '&:hover': {
                            '& > fieldset': {
                              borderColor: colors.medium,
                            }
                          }
                        }
                      }}
                    />
                    <IconButton color="primary" onClick={handleAddCourse}>
                      <Add />
                    </IconButton>
                  </ListItem>
                </List>
              </Paper>
            </motion.div>
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} md={8}>
            <AnimatePresence>
              {/* Profile Header */}
              <motion.div
                variants={cardVariants}
                layout
              >
                <Paper 
                  elevation={0}
                  sx={{ ...paperStyles, p: 3, mb: 3 }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Avatar
                      src={avatar}
                      sx={{
                        width: 120,
                        height: 120,
                        border: `4px solid ${theme.palette.background.paper}`,
                        boxShadow: '0 2px 10px rgba(0,0,0,0.12)'
                      }}
                    />
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {name}
                      </Typography>
                      <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
                        {title}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <IconButton
                          component="a"
                          href={`mailto:${auth.currentUser?.email}`}
                          target="_blank"
                          sx={{
                            backgroundColor: 'rgba(0,0,0,0.04)',
                            '&:hover': { backgroundColor: 'rgba(0,0,0,0.08)' }
                          }}
                        >
                          <Message />
                        </IconButton>
                        <IconButton
                          component="a"
                          href={`https://meet.google.com/`}
                          target="_blank"
                          sx={{
                            backgroundColor: 'rgba(0,0,0,0.04)',
                            '&:hover': { backgroundColor: 'rgba(0,0,0,0.08)' }
                          }}
                        >
                          <VideoCall />
                        </IconButton>
                        <IconButton
                          component="a"
                          href={`https://linkedin.com/in/`}
                          target="_blank"
                          sx={{
                            backgroundColor: 'rgba(0,0,0,0.04)',
                            '&:hover': { backgroundColor: 'rgba(0,0,0,0.08)' }
                          }}
                        >
                          <LinkedIn />
                        </IconButton>
                        <IconButton
                          component="a"
                          href={`https://github.com/`}
                          target="_blank"
                          sx={{
                            backgroundColor: 'rgba(0,0,0,0.04)',
                            '&:hover': { backgroundColor: 'rgba(0,0,0,0.08)' }
                          }}
                        >
                          <GitHub />
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                  <Divider sx={{ my: 3 }} />
                  <TextField
                    fullWidth
                    label="About Me"
                    variant="outlined"
                    multiline
                    minRows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        '&:hover': {
                          '& > fieldset': {
                            borderColor: colors.medium,
                          }
                        }
                      }
                    }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button variant="contained" onClick={handleSaveProfile}>
                      Save Profile
                    </Button>
                  </Box>
                </Paper>
              </motion.div>

              {/* Teaching Stats */}
              <motion.div
                variants={cardVariants}
                layout
              >
                <Paper 
                  elevation={0}
                  sx={{ ...paperStyles, p: 3, mb: 3 }}
                >
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Teaching Stats
                  </Typography>
                  <Grid container spacing={3}>
                    {[
                      { label: 'Students Taught', value: teachingStats.totalStudents },
                      { label: 'Average Rating', value: teachingStats.averageRating },
                      { label: 'Hours Taught', value: teachingStats.totalHours }
                    ].map((stat, index) => (
                      <Grid item xs={12} sm={4} key={index}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                            {stat.value}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {stat.label}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </motion.div>

              {/* Completed Courses */}
              <motion.div
                variants={cardVariants}
                layout
              >
                <Paper 
                  elevation={0}
                  sx={{ ...paperStyles, p: 3, mb: 3 }}
                >
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Completed Courses
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {completedCourses.map((course, index) => (
                      <Chip key={index} label={course} color="primary" />
                    ))}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <TextField
                      label="New Completed Course"
                      variant="outlined"
                      size="small"
                      value={newCourse}
                      onChange={(e) => setNewCourse(e.target.value)}
                      sx={{
                        flex: 1,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          '&:hover': {
                            '& > fieldset': {
                              borderColor: colors.medium,
                            }
                          }
                        }
                      }}
                    />
                    <IconButton color="primary" onClick={() => handleAddCompletedCourse(newCourse)}>
                      <Add />
                    </IconButton>
                  </Box>
                </Paper>
              </motion.div>

              {/* Scheduled Meetings */}
              <motion.div
                variants={cardVariants}
                layout
              >
                <Paper 
                  elevation={0}
                  sx={{ ...paperStyles, p: 3, mb: 3 }}
                >
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Scheduled Meetings
                  </Typography>
                  <List sx={{ width: '100%' }}>
                    {meetings.map((meeting, index) => (
                      <ListItem key={index}>
                        <ListItemAvatar>
                          <Avatar>
                            <Event />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary={meeting} />
                      </ListItem>
                    ))}
                    <ListItem>
                      <TextField
                        fullWidth
                        label="Add Meeting"
                        variant="outlined"
                        size="small"
                        value={newMeeting}
                        onChange={(e) => setNewMeeting(e.target.value)}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            '&:hover': {
                              '& > fieldset': {
                                borderColor: colors.medium,
                              }
                            }
                          }
                        }}
                      />
                      <IconButton color="primary" onClick={handleAddMeeting}>
                        <Add />
                      </IconButton>
                    </ListItem>
                  </List>
                </Paper>
              </motion.div>
            </AnimatePresence>
          </Grid>
        </Grid>
      </motion.div>

      {/* Edit Skill Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Edit Skill</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Skill"
            variant="outlined"
            value={editSkill}
            onChange={(e) => setEditSkill(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                '&:hover': {
                  '& > fieldset': {
                    borderColor: colors.medium,
                  }
                }
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="secondary">Cancel</Button>
          <Button onClick={handleSaveEditSkill} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile;
