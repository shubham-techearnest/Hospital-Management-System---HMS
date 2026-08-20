import { createTheme } from '@mui/material/styles';

const PRIMARY = '#714fff';
const PRIMARY_DARK = '#5c3dd9';
const PRIMARY_LIGHT = '#cfc8ff';
const SECONDARY = '#8852cc';
const SECONDARY_LIGHT = '#efecff';
const BG = '#f5f4ff';
const SURFACE = '#ffffff';
const TEXT = '#0f0b28';
const TEXT_MUTED = '#585969';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: PRIMARY,
      dark: PRIMARY_DARK,
      light: PRIMARY_LIGHT,
      contrastText: '#ffffff',
    },
    secondary: {
      main: SECONDARY,
      dark: PRIMARY_DARK,
      light: SECONDARY_LIGHT,
      contrastText: '#ffffff',
    },
    success: {
      main: '#2e7d32',
    },
    warning: {
      main: '#ff754c',
    },
    error: {
      main: '#c62828',
    },
    info: {
      main: PRIMARY_DARK,
      light: PRIMARY_LIGHT,
      dark: PRIMARY_DARK,
    },
    background: {
      default: BG,
      paper: SURFACE,
    },
    text: {
      primary: TEXT,
      secondary: TEXT_MUTED,
    },
    divider: 'rgba(15, 11, 40, 0.10)',
  },
  typography: {
    fontFamily: '"Inter", system-ui, sans-serif',
    h1: { fontWeight: 700, lineHeight: 1.2 },
    h2: { fontWeight: 700, lineHeight: 1.2 },
    h3: { fontWeight: 600, lineHeight: 1.25 },
    h4: { fontWeight: 700, lineHeight: 1.25, fontSize: 'clamp(1.25rem, 2vw + 0.8rem, 2.125rem)' },
    h5: { fontWeight: 600, lineHeight: 1.3 },
    h6: { fontWeight: 600, lineHeight: 1.4 },
    button: { fontWeight: 600 },
    overline: { letterSpacing: '0.06em', fontWeight: 600 },
  },
  shape: {
    borderRadius: 14,
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  transitions: {
    easing: {
      easeOut: 'cubic-bezier(0.22, 1, 0.36, 1)',
    },
    duration: {
      shortest: 120,
      shorter: 180,
      short: 280,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: BG,
          color: TEXT,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 12,
          minHeight: 40,
          transition: 'transform 120ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 180ms cubic-bezier(0.22, 1, 0.36, 1)',
          '&:active': {
            transform: 'translateY(1px)',
          },
        },
        sizeSmall: {
          minHeight: 36,
        },
        outlined: {
          borderColor: 'rgba(113, 79, 255, 0.28)',
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          color: PRIMARY_DARK,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          marginBottom: 4,
          transition: 'background-color 180ms cubic-bezier(0.22, 1, 0.36, 1), color 180ms cubic-bezier(0.22, 1, 0.36, 1)',
          '&.Mui-selected': {
            backgroundColor: SECONDARY_LIGHT,
            color: TEXT,
            '& .MuiListItemIcon-root': {
              color: PRIMARY,
            },
            '&:hover': {
              backgroundColor: SECONDARY_LIGHT,
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(15, 11, 40, 0.10)',
          boxShadow: '0 1px 2px rgba(15, 11, 40, 0.04)',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: PRIMARY_DARK,
            borderWidth: 2,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(15, 11, 40, 0.08)',
          padding: '14px 16px',
        },
        head: {
          fontWeight: 600,
          color: TEXT_MUTED,
          backgroundColor: SURFACE,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&.MuiTableRow-hover:hover': {
            backgroundColor: SECONDARY_LIGHT,
          },
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          paddingBottom: 8,
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '16px 24px',
        },
      },
    },
    MuiSnackbar: {
      defaultProps: {
        anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
    },
    MuiPaper: {
      styleOverrides: {
        outlined: {
          borderColor: 'rgba(15, 11, 40, 0.10)',
        },
      },
    },
    MuiContainer: {
      defaultProps: {
        maxWidth: 'lg',
      },
    },
    MuiDialog: {
      defaultProps: {
        fullWidth: true,
        maxWidth: 'sm',
        scroll: 'paper',
      },
    },
  },
});
