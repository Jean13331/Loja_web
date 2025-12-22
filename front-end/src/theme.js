import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: {
      main: '#F7401B',
      light: '#FF6B35',
      dark: '#D6300A',
      contrastText: '#fff',
    },
    secondary: {
      main: '#213547',
      light: '#666',
      dark: '#000',
    },
    error: {
      main: '#dc3545',
    },
    warning: {
      main: '#ffc107',
    },
    info: {
      main: '#17a2b8',
    },
    success: {
      main: '#28a745',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#213547',
      secondary: '#666',
    },
  },
  typography: {
    fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '0.75rem 1.5rem',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            boxShadow: '0 5px 15px rgba(247, 64, 27, 0.3)',
            transform: 'translateY(-2px)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #F7401B 0%, #FF6B35 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #D6300A 0%, #F7401B 100%)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#F7401B',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#F7401B',
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
})

export default theme

