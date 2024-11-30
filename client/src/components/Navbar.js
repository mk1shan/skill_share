import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Typography
} from '@mui/material';
import {
  Home,
  Person,
  Search,
  ExitToApp,
  Settings,
  AccountCircle,
  Bookmark
} from '@mui/icons-material';

const colors = {
  darkest: '#051F20',   // Darkest green
  dark: '#0B2B26',      // Dark green
  medium: '#163832',    // Medium green
  regular: '#235347',   // Regular green
  light: '#8EB69B',     // Light green
  lightest: '#DAF1DE',  // Lightest green
};

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar 
      position="static" 
      sx={{ 
        backgroundColor: colors.darkest,
        boxShadow: '0px 4px 12px rgba(0,0,0,0.15)',
        backgroundImage: `linear-gradient(to right, ${colors.darkest}, ${colors.dark})`
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: 4 }}>
        {/* Logo/Brand */}
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            color: colors.lightest,
            textDecoration: 'none',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          SkillShare
        </Typography>

        {/* Main Navigation */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            component={Link}
            to="/feed"
            sx={{
              color: colors.lightest,
              textTransform: 'none',
              px: 2,
              '&:hover': {
                backgroundColor: `${colors.medium}40`,
              }
            }}
            startIcon={<Home />}
          >
            Feed
          </Button>

          <Button
            component={Link}
            to="/search"
            sx={{
              color: colors.lightest,
              textTransform: 'none',
              px: 2,
              '&:hover': {
                backgroundColor: `${colors.medium}40`,
              }
            }}
            startIcon={<Search />}
          >
            Search
          </Button>
        </Box>

        {/* Profile Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            onClick={handleClick}
            size="small"
            aria-controls={open ? 'profile-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
          >
            <Avatar 
              sx={{ 
                width: 40, 
                height: 40,
                bgcolor: colors.regular,
                border: `2px solid ${colors.light}`,
                transition: 'all 0.2s ease',
                '&:hover': {
                  border: `2px solid ${colors.lightest}`,
                  transform: 'scale(1.05)'
                }
              }}
            >
              <Person />
            </Avatar>
          </IconButton>

          <Menu
            id="profile-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            onClick={handleClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              sx: {
                mt: 1.5,
                backgroundColor: colors.dark,
                border: `1px solid ${colors.light}20`,
                '& .MuiMenuItem-root': {
                  color: colors.lightest,
                  py: 1,
                  px: 2,
                  '&:hover': {
                    backgroundColor: `${colors.medium}80`
                  }
                },
              },
            }}
          >
            <MenuItem component={Link} to="/profile">
              <AccountCircle sx={{ mr: 2 }} /> Profile
            </MenuItem>
            <MenuItem component={Link} to="/saved">
              <Bookmark sx={{ mr: 2 }} /> Saved Items
            </MenuItem>
            <MenuItem component={Link} to="/settings">
              <Settings sx={{ mr: 2 }} /> Settings
            </MenuItem>
            <Divider sx={{ my: 1, borderColor: `${colors.light}30` }} />
            <MenuItem component={Link} to="/logout" sx={{ color: '#ef4444 !important' }}>
              <ExitToApp sx={{ mr: 2 }} /> Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
