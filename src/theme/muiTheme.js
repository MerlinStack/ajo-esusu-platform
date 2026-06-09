import { createTheme } from '@mui/material/styles';

const getCustomTheme = (isDarkMode) =>
  createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        main: '#00695c',
        light: '#439889',
        dark: '#003d33',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#ff8f00',
        light: '#ffc046',
        dark: '#c56000',
        contrastText: '#000000',
      },
      error: {
        main: '#d32f2f',
        light: '#ef5350',
        dark: '#c62828',
      },
      warning: {
        main: '#ed6c02',
        light: '#ff9800',
        dark: '#e65100',
      },
      success: {
        main: '#2e7d32',
        light: '#4caf50',
        dark: '#1b5e20',
      },
      info: {
        main: '#0288d1',
        light: '#03a9f4',
        dark: '#01579b',
      },
      background: {
        default: isDarkMode ? '#0a1929' : '#f5f7fa',
        paper: isDarkMode ? '#1a2a3a' : '#ffffff',
      },
      text: {
        primary: isDarkMode ? '#e3f2fd' : '#1a237e',
        secondary: isDarkMode ? '#b0bec5' : '#546e7a',
        disabled: isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
      },
      divider: isDarkMode
        ? 'rgba(255,255,255,0.08)'
        : 'rgba(0,0,0,0.08)',
    },
    typography: {
      fontFamily: "'JetBrains Mono', 'Inter', sans-serif",
      h1: {
        fontWeight: 800,
        letterSpacing: '-0.03em',
        fontSize: '2.5rem',
      },
      h2: {
        fontWeight: 700,
        letterSpacing: '-0.02em',
        fontSize: '2rem',
      },
      h3: {
        fontWeight: 700,
        letterSpacing: '-0.02em',
        fontSize: '1.75rem',
      },
      h4: {
        fontWeight: 700,
        letterSpacing: '-0.02em',
        fontSize: '1.5rem',
      },
      h5: {
        fontWeight: 600,
        letterSpacing: '-0.01em',
        fontSize: '1.25rem',
      },
      h6: {
        fontWeight: 600,
        fontSize: '1rem',
      },
      subtitle1: {
        fontFamily: "'Inter', sans-serif",
        fontWeight: 500,
        fontSize: '0.95rem',
      },
      subtitle2: {
        fontFamily: "'Inter', sans-serif",
        fontWeight: 500,
        fontSize: '0.85rem',
      },
      body1: {
        fontFamily: "'JetBrains Mono', 'Inter', sans-serif",
        fontSize: '0.9rem',
        lineHeight: 1.6,
      },
      body2: {
        fontFamily: "'JetBrains Mono', 'Inter', sans-serif",
        fontSize: '0.8rem',
        lineHeight: 1.5,
      },
      caption: {
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.7rem',
        letterSpacing: '-0.01em',
      },
      overline: {
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.65rem',
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
      },
      button: {
        fontFamily: "'JetBrains Mono', 'Inter', sans-serif",
        fontWeight: 600,
        fontSize: '0.8rem',
        textTransform: 'none',
      },
    },
    shape: {
      borderRadius: 10,
    },
    spacing: 8,
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
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollBehavior: 'smooth',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
          },
          '*::-webkit-scrollbar': {
            width: '6px',
            height: '6px',
          },
          '*::-webkit-scrollbar-track': {
            background: isDarkMode ? '#0a1929' : '#f0f0f0',
          },
          '*::-webkit-scrollbar-thumb': {
            background: isDarkMode ? '#1a2a3a' : '#c0c0c0',
            borderRadius: '3px',
          },
          '*::-webkit-scrollbar-thumb:hover': {
            background: isDarkMode ? '#2a3a4a' : '#a0a0a0',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: isDarkMode
              ? '0 2px 12px rgba(0,0,0,0.4)'
              : '0 2px 12px rgba(0,105,92,0.08)',
            border: isDarkMode
              ? '1px solid rgba(255,255,255,0.06)'
              : '1px solid rgba(0,105,92,0.06)',
            borderRadius: 12,
            transition: 'box-shadow 0.2s ease, transform 0.2s ease',
            '&:hover': {
              boxShadow: isDarkMode
                ? '0 4px 24px rgba(0,0,0,0.6)'
                : '0 4px 24px rgba(0,105,92,0.12)',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            fontFamily: "'JetBrains Mono', 'Inter', sans-serif",
            borderRadius: 8,
            padding: '8px 20px',
            transition: 'all 0.15s ease',
          },
          contained: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            },
          },
          outlined: {
            borderWidth: 1.5,
            '&:hover': {
              borderWidth: 1.5,
            },
          },
          sizeSmall: {
            padding: '4px 12px',
            fontSize: '0.75rem',
          },
          sizeLarge: {
            padding: '12px 28px',
            fontSize: '0.9rem',
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            transition: 'all 0.15s ease',
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-head': {
              fontWeight: 700,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.7rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              backgroundColor: isDarkMode
                ? 'rgba(255,255,255,0.03)'
                : 'rgba(0,105,92,0.04)',
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            fontFamily: "'JetBrains Mono', 'Inter', sans-serif",
            fontSize: '0.8rem',
            borderBottom: isDarkMode
              ? '1px solid rgba(255,255,255,0.06)'
              : '1px solid rgba(0,0,0,0.06)',
            padding: '12px 16px',
          },
          head: {
            padding: '10px 16px',
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            transition: 'background-color 0.15s ease',
            '&:hover': {
              backgroundColor: isDarkMode
                ? 'rgba(255,255,255,0.03)'
                : 'rgba(0,105,92,0.03)',
            },
            '&:last-child .MuiTableCell-body': {
              borderBottom: 'none',
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 600,
            fontSize: '0.7rem',
            borderRadius: 6,
          },
          sizeSmall: {
            fontSize: '0.65rem',
            height: 24,
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 4,
            height: 8,
            backgroundColor: isDarkMode
              ? 'rgba(255,255,255,0.08)'
              : 'rgba(0,105,92,0.1)',
          },
          bar: {
            borderRadius: 4,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: isDarkMode
              ? '1px solid rgba(255,255,255,0.06)'
              : '1px solid rgba(0,0,0,0.06)',
            backgroundColor: isDarkMode ? '#0d2137' : '#ffffff',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
            borderBottom: isDarkMode
              ? '1px solid rgba(255,255,255,0.06)'
              : '1px solid rgba(0,0,0,0.06)',
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.7rem',
            borderRadius: 6,
            padding: '6px 10px',
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 12,
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            fontFamily: "'JetBrains Mono', 'Inter', sans-serif",
            borderRadius: 8,
          },
          standardSuccess: {
            backgroundColor: isDarkMode
              ? 'rgba(46,125,50,0.15)'
              : 'rgba(46,125,50,0.08)',
          },
          standardError: {
            backgroundColor: isDarkMode
              ? 'rgba(211,47,47,0.15)'
              : 'rgba(211,47,47,0.08)',
          },
          standardWarning: {
            backgroundColor: isDarkMode
              ? 'rgba(237,108,2,0.15)'
              : 'rgba(237,108,2,0.08)',
          },
          standardInfo: {
            backgroundColor: isDarkMode
              ? 'rgba(2,136,209,0.15)'
              : 'rgba(2,136,209,0.08)',
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 700,
          },
        },
      },
      MuiBadge: {
        styleOverrides: {
          badge: {
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 700,
            fontSize: '0.6rem',
          },
        },
      },
      MuiSnackbar: {
        styleOverrides: {
          root: {
            fontFamily: "'JetBrains Mono', 'Inter', sans-serif",
          },
        },
      },
    },
  });

export default getCustomTheme;
