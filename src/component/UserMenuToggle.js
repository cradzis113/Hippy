import React, { useState } from 'react';
import { useSetting } from '../context/SettingContext';
import { Menu, MenuItem, IconButton, ListItemIcon, ListItemText } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import InboxIcon from '@mui/icons-material/Inbox';
import PermIdentityOutlinedIcon from '@mui/icons-material/PermIdentityOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../context/AuthContext';

const UserMenuToggle = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const { logout } = useAuth()
  const { backState, setBackState } = useSetting()

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        aria-controls={open ? 'icon-text-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={backState ? () => setBackState(false) : handleClick}
      >
        {backState ? <ArrowBackIcon /> : <MenuIcon />}
      </IconButton>
      <Menu
        id="icon-text-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
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
        <MenuItem onClick={() => logout()}>
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
