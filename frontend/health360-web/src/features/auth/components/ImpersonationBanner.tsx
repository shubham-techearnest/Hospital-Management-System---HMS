import { Box, Button, Stack, Typography } from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '@/app/store';
import { endImpersonationLocal } from '@/features/auth/store/authSlice';
import { endImpersonation } from '@/features/admin/api/impersonationApi';
import { useToast } from '@/shared/ui/ToastProvider';

export const IMPERSONATION_BANNER_HEIGHT = 52;

export function ImpersonationBanner() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const impersonation = useSelector((state: RootState) => state.auth.impersonation);

  if (!impersonation) {
    return null;
  }

  const subjectName = [impersonation.subject.firstName, impersonation.subject.lastName]
    .filter(Boolean)
    .join(' ')
    .trim() || impersonation.subject.email;
  const subjectRole = impersonation.subject.roles?.[0]?.replace(/_/g, ' ') ?? 'User';
  const env = (impersonation.environmentLabel || 'DEV').toUpperCase();

  const handleExit = async () => {
    try {
      await endImpersonation();
    } catch {
      // restore admin session locally even if API fails (e.g. already expired)
    } finally {
      dispatch(endImpersonationLocal());
      showToast('Exited impersonation. Restored Platform Admin session.');
      navigate('/admin/users');
    }
  };

  return (
    <Box
      role="status"
      aria-live="polite"
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: (theme) => theme.zIndex.appBar + 2,
        minHeight: IMPERSONATION_BANNER_HEIGHT,
        px: { xs: 1.5, md: 2.5 },
        py: 0.85,
        display: 'flex',
        alignItems: 'center',
        bgcolor: '#7a1f1f',
        color: '#fff8f0',
        borderBottom: '2px solid #c44536',
        boxShadow: '0 4px 16px rgba(122, 31, 31, 0.35)',
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={{ xs: 0.75, sm: 2 }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        sx={{ width: '100%' }}
      >
        <Stack direction="row" spacing={1.1} alignItems="flex-start" sx={{ minWidth: 0 }}>
          <WarningAmberRoundedIcon sx={{ fontSize: 22, mt: 0.15, flexShrink: 0 }} />
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 800, fontSize: '0.82rem', letterSpacing: '0.06em', lineHeight: 1.3 }}>
              {env} · IMPERSONATION MODE
            </Typography>
            <Typography sx={{ fontSize: '0.78rem', lineHeight: 1.35, opacity: 0.95 }}>
              Viewing as <strong>{subjectName}</strong> · {subjectRole}
              {' · '}
              Original session: Platform Administrator
            </Typography>
          </Box>
        </Stack>
        <Button
          variant="contained"
          size="small"
          onClick={() => void handleExit()}
          sx={{
            flexShrink: 0,
            bgcolor: '#fff8f0',
            color: '#7a1f1f',
            fontWeight: 800,
            '&:hover': { bgcolor: '#ffe8d6' },
          }}
        >
          Exit Impersonation
        </Button>
      </Stack>
    </Box>
  );
}
