import {
  Badge,
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Popover,
  Stack,
  Typography,
} from '@mui/material';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import { useId, useState } from 'react';
import type { MouseEvent } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useToast, type ToastSeverity } from '@/shared/ui/ToastProvider';

const SEVERITY_LABEL: Record<ToastSeverity, string> = {
  success: 'Success',
  error: 'Error',
  warning: 'Warning',
  info: 'Update',
};

function timeLabel(createdAt: number) {
  const delta = Date.now() - createdAt;
  if (delta < 60_000) {
    return 'Just now';
  }
  const minutes = Math.round(delta / 60_000);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  const hours = Math.round(minutes / 60);
  return `${hours}h ago`;
}

interface ToastNavbarProps {
  notificationsPath?: string | null;
  iconColor?: string;
  tone?: 'brand' | 'paper';
}

export function ToastNavbar({ notificationsPath, iconColor, tone = 'paper' }: ToastNavbarProps) {
  const { toasts, unreadCount, markToastsRead } = useToast();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const panelId = useId();
  const open = Boolean(anchor);
  const brandTone = tone === 'brand';
  const resolvedIconColor = iconColor ?? (brandTone ? '#ffffff' : 'text.secondary');

  const handleOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchor(event.currentTarget);
    markToastsRead();
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleOpen}
        aria-label={unreadCount ? `${unreadCount} new notifications` : 'Notifications'}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        sx={{
          color: resolvedIconColor,
          width: 40,
          height: 40,
          '&:hover': {
            bgcolor: brandTone ? 'rgba(255,255,255,0.12)' : 'action.hover',
          },
        }}
      >
        <Badge
          color="warning"
          badgeContent={unreadCount}
          max={9}
          overlap="circular"
        >
          <NotificationsOutlinedIcon />
        </Badge>
      </IconButton>
      <Popover
        id={panelId}
        open={open}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              width: 360,
              maxWidth: 'calc(100vw - 24px)',
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: 'var(--h360-shadow-md)',
              overflow: 'hidden',
            },
          },
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 1.5 }}>
          <Typography fontWeight={800} fontSize={15}>
            Notifications
          </Typography>
          {notificationsPath ? (
            <Button
              component={RouterLink}
              to={notificationsPath}
              size="small"
              onClick={() => setAnchor(null)}
            >
              Preferences
            </Button>
          ) : null}
        </Stack>
        <Divider />
        {toasts.length === 0 ? (
          <Box sx={{ px: 2, py: 3 }}>
            <Typography fontWeight={700} sx={{ mb: 0.5 }}>
              You are all caught up
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
              Alerts from bookings, records, and hospital work will show up here.
            </Typography>
          </Box>
        ) : (
          <List disablePadding sx={{ maxHeight: 360, overflowY: 'auto' }}>
            {toasts.map((item) => (
              <ListItem key={item.id} alignItems="flex-start" sx={{ px: 2, py: 1.25 }}>
                <ListItemText
                  primary={item.message}
                  secondary={`${SEVERITY_LABEL[item.severity]} · ${timeLabel(item.createdAt)}`}
                  primaryTypographyProps={{ fontWeight: 600, fontSize: 14 }}
                  secondaryTypographyProps={{ fontSize: 12 }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Popover>
    </>
  );
}
