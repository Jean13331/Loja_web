import { Box } from '@mui/material'
import { 
  LocalFlorist, 
  Park, 
  Nature,
  Spa
} from '@mui/icons-material'

const DecorativeElements = () => {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {/* Círculos decorativos sutis no fundo */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '15%',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 107, 53, 0.08) 0%, transparent 70%)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '20%',
          right: '20%',
          width: '250px',
          height: '250px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(247, 64, 27, 0.06) 0%, transparent 70%)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          right: '10%',
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34, 139, 34, 0.05) 0%, transparent 70%)',
        }}
      />

      {/* Grupo 1 - Canto inferior esquerdo */}
      <Box
        sx={{
          position: 'absolute',
          bottom: '-40px',
          left: '-40px',
          opacity: 0.5,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, transform: 'rotate(-25deg)' }}>
          <Nature sx={{ fontSize: 160, color: '#8B4513' }} />
          <Box sx={{ display: 'flex', gap: 1.2, ml: 10 }}>
            <LocalFlorist sx={{ fontSize: 55, color: '#228B22' }} />
            <LocalFlorist sx={{ fontSize: 50, color: '#32CD32' }} />
            <LocalFlorist sx={{ fontSize: 45, color: '#228B22' }} />
            <LocalFlorist sx={{ fontSize: 42, color: '#32CD32' }} />
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, ml: 14 }}>
            <Park sx={{ fontSize: 40, color: '#F7401B' }} />
            <Park sx={{ fontSize: 35, color: '#FF6B35' }} />
            <Park sx={{ fontSize: 32, color: '#F7401B' }} />
          </Box>
          <Box sx={{ display: 'flex', gap: 1.2, ml: 6, mt: 1 }}>
            <Spa sx={{ fontSize: 45, color: '#228B22' }} />
            <Spa sx={{ fontSize: 40, color: '#32CD32' }} />
            <Spa sx={{ fontSize: 38, color: '#228B22' }} />
          </Box>
        </Box>
      </Box>

      {/* Grupo 2 - Canto superior direito */}
      <Box
        sx={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          opacity: 0.5,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, transform: 'rotate(25deg)' }}>
          <Nature sx={{ fontSize: 150, color: '#8B4513' }} />
          <Box sx={{ display: 'flex', gap: 1.2, ml: 12 }}>
            <LocalFlorist sx={{ fontSize: 53, color: '#228B22' }} />
            <LocalFlorist sx={{ fontSize: 48, color: '#32CD32' }} />
            <LocalFlorist sx={{ fontSize: 43, color: '#228B22' }} />
            <LocalFlorist sx={{ fontSize: 40, color: '#32CD32' }} />
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, ml: 16 }}>
            <Park sx={{ fontSize: 38, color: '#FF6B35' }} />
            <Park sx={{ fontSize: 33, color: '#F7401B' }} />
            <Park sx={{ fontSize: 30, color: '#FF6B35' }} />
          </Box>
          <Box sx={{ display: 'flex', gap: 1.2, ml: 8, mt: 1 }}>
            <Spa sx={{ fontSize: 43, color: '#32CD32' }} />
            <Spa sx={{ fontSize: 38, color: '#228B22' }} />
            <Spa sx={{ fontSize: 35, color: '#32CD32' }} />
          </Box>
        </Box>
      </Box>

      {/* Grupo 3 - Canto superior esquerdo */}
      <Box
        sx={{
          position: 'absolute',
          top: '-40px',
          left: '-40px',
          opacity: 0.5,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, transform: 'rotate(-20deg)' }}>
          <Nature sx={{ fontSize: 140, color: '#8B4513' }} />
          <Box sx={{ display: 'flex', gap: 1.2, ml: 8 }}>
            <LocalFlorist sx={{ fontSize: 51, color: '#228B22' }} />
            <LocalFlorist sx={{ fontSize: 46, color: '#32CD32' }} />
            <LocalFlorist sx={{ fontSize: 41, color: '#228B22' }} />
            <LocalFlorist sx={{ fontSize: 38, color: '#32CD32' }} />
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, ml: 12 }}>
            <Park sx={{ fontSize: 37, color: '#F7401B' }} />
            <Park sx={{ fontSize: 32, color: '#FF6B35' }} />
            <Park sx={{ fontSize: 29, color: '#F7401B' }} />
          </Box>
          <Box sx={{ display: 'flex', gap: 1.2, ml: 5, mt: 1 }}>
            <Spa sx={{ fontSize: 41, color: '#32CD32' }} />
            <Spa sx={{ fontSize: 36, color: '#228B22' }} />
            <Spa sx={{ fontSize: 33, color: '#32CD32' }} />
          </Box>
        </Box>
      </Box>

      {/* Elementos adicionais espalhados */}
      <Box
        sx={{
          position: 'absolute',
          bottom: '15%',
          right: '15%',
          opacity: 0.35,
          transform: 'rotate(15deg)',
        }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
          <LocalFlorist sx={{ fontSize: 60, color: '#228B22' }} />
          <Park sx={{ fontSize: 45, color: '#FF6B35' }} />
        </Box>
      </Box>

      <Box
        sx={{
          position: 'absolute',
          top: '30%',
          left: '10%',
          opacity: 0.35,
          transform: 'rotate(-10deg)',
        }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Spa sx={{ fontSize: 55, color: '#32CD32' }} />
          <Park sx={{ fontSize: 40, color: '#F7401B' }} />
        </Box>
      </Box>

      <Box
        sx={{
          position: 'absolute',
          bottom: '25%',
          left: '20%',
          opacity: 0.35,
          transform: 'rotate(20deg)',
        }}
      >
        <Nature sx={{ fontSize: 80, color: '#8B4513' }} />
      </Box>
    </Box>
  )
}

export default DecorativeElements
