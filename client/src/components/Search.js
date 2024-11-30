import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  TextField,
  Box,
  Typography,
  Avatar,
  Button,
  Chip,
  Card,
  IconButton,
  InputAdornment,
  Paper,
  CircularProgress,
  Stack,
  Tooltip,
  Rating,
  Grid,
} from '@mui/material';
import {
  Search as SearchIcon,
  X as CloseIcon,
  Star as StarIcon,
  Mail as MailIcon,
  MessageCircle as MessageCircleIcon,
} from 'lucide-react';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  startAt,
  endAt,
  limit,
} from 'firebase/firestore';
import { firestore } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { debounce } from 'lodash';

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    available: false,
    rating: null
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const performSearch = async (term, filters) => {
    setLoading(true);
    setError(null);
    console.log('Searching with term:', term);
    
    try {
      let baseQuery = collection(firestore, 'users');
      let constraints = [];

      // If there's a search term, add name constraints
      if (term.trim()) {
        const termLower = term.toLowerCase();
        constraints.push(where('name', '>=', termLower));
        constraints.push(where('name', '<=', termLower + '\uf8ff'));
      }

      // Add rating filter if selected
      if (filters.rating) {
        constraints.push(where('averageRating', '>=', filters.rating));
      }

      // Add availability filter if selected
      if (filters.available) {
        constraints.push(where('availability.status', '==', 'Available'));
      }

      // Add ordering and limit
      if (constraints.length === 0) {
        constraints.push(orderBy('name'));
        constraints.push(limit(10));
      } else {
        constraints.push(orderBy('name'));
        constraints.push(limit(50));
      }

      const q = query(baseQuery, ...constraints);
      const querySnapshot = await getDocs(q);
      
      const results = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setUsers(results);
    } catch (error) {
      console.error('Search error:', error);
      setError('An error occurred while searching. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useMemo(
    () => debounce((term, filters) => {
      performSearch(term, filters);
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(searchTerm, filters);
    return () => debouncedSearch.cancel();
  }, [searchTerm, filters, debouncedSearch]);

  const handleFilterToggle = (type) => {
    setFilters(prev => ({
      ...prev,
      [type]: !prev[type],
      ...(type === 'available' && { rating: null }),
      ...(type === 'rating' && { available: false }),
    }));
  };

  const handleRatingFilter = (event, newValue) => {
    setFilters((prev) => ({
      ...prev,
      rating: newValue,
      ...(newValue && { available: false }),
    }));
  };

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      {/* Header */}
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Find Skilled Mentors
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Search through our community of experts and learners
        </Typography>
      </Box>

      {/* Search and Filters */}
      <Paper
        elevation={3}
        sx={{
          p: 4,
          mb: 6,
          borderRadius: 2,
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
        >
          {/* Search Input */}
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="clear search"
                    onClick={() => setSearchTerm('')}
                    edge="end"
                  >
                    <CloseIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ maxWidth: 400 }}
          />

          {/* Filters */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            alignItems="center"
          >
            <Tooltip title="Toggle Availability">
              <Button
                variant={filters.available ? 'contained' : 'outlined'}
                color="success"
                startIcon={<StarIcon />}
                onClick={() => handleFilterToggle('available')}
                sx={{ textTransform: 'none' }}
              >
                {filters.available ? 'Available Now' : 'Availability'}
              </Button>
            </Tooltip>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body1" sx={{ mr: 1 }}>
                Minimum Rating:
              </Typography>
              <Rating
                name="rating-filter"
                value={filters.rating}
                precision={0.5}
                onChange={handleRatingFilter}
                emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
              />
            </Box>
          </Stack>
        </Stack>
      </Paper>

      {/* Loading State */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress size={60} />
        </Box>
      ) : (
        <>
          {/* Error Message */}
          {error && (
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h6" color="error">
                {error}
              </Typography>
            </Box>
          )}

          {/* Results Grid */}
          <Grid container spacing={4}>
            {users.map((user) => (
              <Grid item xs={12} sm={6} md={4} key={user.id}>
                <Card
                  elevation={3}
                  sx={{
                    p: 3,
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 6,
                    },
                    height: '100%',
                  }}
                >
                  <Stack spacing={2}>
                    {/* User Avatar and Name */}
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar
                        src={user.avatar || '/api/placeholder/64/64'}
                        alt={user.name}
                        sx={{ width: 64, height: 64 }}
                      />
                      <Box>
                        <Typography variant="h6" component="div">
                          {user.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {user.title}
                        </Typography>
                      </Box>
                    </Stack>

                    {/* Rating and Availability */}
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Rating
                        name="user-rating"
                        value={user.averageRating || 0}
                        precision={0.5}
                        readOnly
                        size="small"
                        emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
                      />
                      <Typography variant="body2" color="text.secondary">
                        ({user.averageRating ? user.averageRating.toFixed(1) : '0'})
                      </Typography>
                      {user.availability?.status === 'Available' && (
                        <Chip
                          label="Available"
                          color="success"
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Stack>

                    {/* Skills */}
                    <Box>
                      {user.skills && user.skills.length > 0 ? (
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          {user.skills.map((skill, index) => (
                            <Chip
                              key={index}
                              label={skill}
                              size="small"
                              variant="outlined"
                              color="primary"
                            />
                          ))}
                        </Stack>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No skills listed.
                        </Typography>
                      )}
                    </Box>

                    {/* Action Buttons */}
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Tooltip title="Send Email">
                        <IconButton
                          color="primary"
                          onClick={() => window.location.href = `mailto:${user.email}`}
                        >
                          <MailIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Send Message">
                        <IconButton
                          color="secondary"
                          onClick={() => navigate(`/messages/${user.id}`)}
                        >
                          <MessageCircleIcon />
                        </IconButton>
                      </Tooltip>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => navigate(`/profile/${user.id}`)}
                      >
                        View Profile
                      </Button>
                    </Stack>
                  </Stack>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* No Results Message */}
          {!loading && users.length === 0 && searchTerm && (
            <Box sx={{ textAlign: 'center', mt: 10 }}>
              <Typography variant="h6" color="text.secondary">
                No users found matching your search criteria.
              </Typography>
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default Search;
