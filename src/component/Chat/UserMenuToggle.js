import React, { useState } from 'react';
import { Menu, MenuItem, IconButton, ListItemIcon, ListItemText } from '@mui/material';
import { Menu as MenuIcon, Inbox as InboxIcon, PermIdentityOutlined as PermIdentityOutlinedIcon, SettingsOutlined as SettingsOutlinedIcon, ArrowBack as ArrowBackIcon, Logout as LogoutIcon } from '@mui/icons-material';
import authStore from '../../stores/authStore';
import useSocketStore from '../../stores/socketStore';
import useSettingStore from '../../stores/settingStore';
import fetchAPI from '../../utils/FetchApi';

const UserMenuToggle = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const socket = useSocketStore(state => state.socket)
  const setIsAuthenticated = authStore(state => state.setIsAuthenticated)
  const backState = useSettingStore(state => state.backState)
  const setBackState = useSettingStore(state => state.setBackState)
  const userName = authStore(state => state.userName)

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleBackStateChange = () => {
    setBackState(false)
    socket.emit('fetchUnseenMessages', userName);
  }

  const handleClose = () => {
    setAnchorEl(null);
  };
  const API_BASE = window.location.protocol === "https:"
    ? import.meta.env.VITE_API_URL_TUNNEL
    : `http://${window.location.hostname}:3001`;

  const handleLogout = async () => {
    try {
      const response = await fetchAPI(API_BASE + '/api/clear-cookie', 'POST', null, null, true);
      if (response.status === 204) {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <>
      <IconButton
        onClick={backState ? handleBackStateChange : handleClick}
      >
        {backState ? <ArrowBackIcon /> : <MenuIcon />}
      </IconButton>
      <Menu
        id="icon-text-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          sx: {
            '& .MuiMenuItem-root': {
              borderRadius: 2,
            },
          },
        }}
        slotProps={{
          paper: {
            elevation: 1,
            sx: {
              borderRadius: 3,
              px: 0.5,
              mt: 1,
            },
          },
        }}
      >
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <InboxIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Saved Messages" />
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <PermIdentityOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Friends" />
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <SettingsOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </MenuItem>

        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Log Out" />
        </MenuItem>
      </Menu>
    </>
  );
};

export default UserMenuToggle;
