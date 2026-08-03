import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#714fff',
      dark: '#5c3dd9',
      light: '#cfc8ff',
    },
    secondary: {
      main: '#8852cc',
      dark: '#5c3dd9',
      light: '#efecff',
    },
    success: {
      main: '#2e7d32',
    },
    warning: {
      main: '#ff754c',
    },
    background: {
      default: '#f5f4ff',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f0b28',
      secondary: '#585969',
    },
  },
  typography: {
    fontFamily: '"Inter", system-ui, sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
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
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 12,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          marginBottom: 4,
        },
      },
    },
    MuiContainer: {
      defaultProps: {
        maxWidth: 'lg',
      },
    },
  },
});
