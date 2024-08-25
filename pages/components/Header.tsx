import React from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/router';
import { Box, Typography, Menu, MenuItem, Button, IconButton } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';

const Header = () => {
  const { user, logout } = usePrivy();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleGoBack = () => {
    router.back();
  };

  const isDashboard = router.pathname === '/dashboard';

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: 2, 
      backgroundColor: 'background.paper', 
      boxShadow: 1 
    }}>
      {isDashboard ? (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <HomeIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" component="div" color="primary">
            validAR
          </Typography>
        </Box>
      ) : (
        <IconButton onClick={handleGoBack} color="primary" aria-label="go back">
          <ArrowBackIcon />
        </IconButton>
      )}
      
      <div>
        <Button
          onClick={handleMenu}
          color="inherit"
          startIcon={<AccountCircleIcon />}
        >
          {user?.wallet?.address ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}` : 'Account'}
        </Button>
        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem onClick={handleClose}>Profile</MenuItem>
          <MenuItem onClick={logout}>Logout</MenuItem>
        </Menu>
      </div>
    </Box>
  );
};

export default Header;