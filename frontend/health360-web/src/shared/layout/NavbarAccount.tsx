import {
  Avatar,
  Box,
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { useId, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/app/store';
import { clearCredentials } from '@/features/auth/store/authSlice';
import { logout as logoutApi } from '@/features/auth/api/authApi';
import { displayName, initials } from '@/shared/auth/userDisplay';

function readStoredUser(): RootState['auth']['user'] {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

interface NavbarAccountProps {
  homePath: string;
  settingsPath: string;
  profilePath?: string | null;
  tone?: 'brand' | 'paper';
}

export function NavbarAccount({
  homePath,
  settingsPath,
  profilePath,
  tone = 'paper',
}: NavbarAccountProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const menuId = useId();
  const user = auth.user ?? readStoredUser();
  const accessToken = auth.accessToken ?? localStorage.getItem('accessToken');
  const menuOpen = Boolean(menuAnchor);
  const name = displayName(user?.firstName, user?.lastName, user?.email);
  const brandTone = tone === 'brand';

  const handleLogout = async () => {
    setMenuAnchor(null);
    try {
      if (accessToken) {
        await logoutApi(accessToken, auth.refreshToken ?? localStorage.getItem('refreshToken') ?? undefined);
      }
    } catch {
      // clear local session regardless
    } finally {
      dispatch(clearCredentials());
      navigate('/login');
    }
  };

  return (
    <>
      <Box
        component="button"
        type="button"
        onClick={(e) => setMenuAnchor(e.currentTarget)}
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        aria-controls={menuOpen ? menuId : undefined}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 1,
          height: 40,
          m: 0,
          pl: 0.5,
          pr: { xs: 0.5, sm: 1.25 },
          border: brandTone ? '1px solid rgba(255,255,255,0.18)' : '1px solid',
          borderColor: brandTone ? 'rgba(255,255,255,0.18)' : 'divider',
          borderRadius: 999,
          bgcolor: brandTone ? 'rgba(255,255,255,0.12)' : 'background.default',
          color: brandTone ? '#ffffff' : 'text.primary',
          cursor: 'pointer',
          flexShrink: 0,
          maxWidth: { sm: 220 },
          font: 'inherit',
          '&:hover': {
            bgcolor: brandTone ? 'rgba(255,255,255,0.2)' : 'secondary.light',
          },
        }}
      >
        <Avatar
          sx={{
            width: 28,
            height: 28,
            flexShrink: 0,
            bgcolor: 'primary.main',
            color: '#ffffff',
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {initials(user?.firstName, user?.lastName, user?.email)}
        </Avatar>
        <Typography
          noWrap
          component="span"
          fontWeight={700}
          fontSize={13}
          sx={{ display: { xs: 'none', sm: 'block' }, lineHeight: 1.2 }}
        >
          {name}
        </Typography>
        <KeyboardArrowDownIcon
          sx={{
            fontSize: 18,
            flexShrink: 0,
            opacity: 0.8,
            display: { xs: 'none', sm: 'block' },
          }}
        />
      </Box>
      <Menu
        id={menuId}
        anchorEl={menuAnchor}
        open={menuOpen}
        onClose={() => setMenuAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { mt: 1.25, minWidth: 200, borderRadius: 2 } } }}
      >
        <MenuItem component={RouterLink} to={homePath} onClick={() => setMenuAnchor(null)}>
          <ListItemIcon><DashboardOutlinedIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Dashboard</ListItemText>
        </MenuItem>
        {profilePath ? (
          <MenuItem component={RouterLink} to={profilePath} onClick={() => setMenuAnchor(null)}>
            <ListItemIcon><PersonOutlinedIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Profile</ListItemText>
          </MenuItem>
        ) : null}
        <MenuItem component={RouterLink} to={settingsPath} onClick={() => setMenuAnchor(null)}>
          <ListItemIcon><SettingsOutlinedIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
