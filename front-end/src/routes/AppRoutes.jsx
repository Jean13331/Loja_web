import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Home from '../pages/Home'
import Login from '../pages/Login'
import Cadastro from '../pages/Cadastro'
import Loja from '../pages/Loja'
import NotFound from '../pages/NotFound'
import authService from '../services/authService'
import { Box, CircularProgress, Typography } from '@mui/material'

const PrivateRoute = ({ children }) => {
  const [isValidating, setIsValidating] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const validateToken = async () => {
      // Verificar se tem token no localStorage
      if (!authService.isAuthenticated()) {
        setIsAuthenticated(false)
        setIsValidating(false)
        return
      }

      // Validar token no servidor
      try {
        const isValid = await authService.verifyToken()
        setIsAuthenticated(isValid)
      } catch (error) {
        setIsAuthenticated(false)
      } finally {
        setIsValidating(false)
      }
    }

    validateToken()
  }, [])

  if (isValidating) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography>Verificando autenticação...</Typography>
      </Box>
    )
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />
}

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route 
        path="/home" 
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/loja" 
        element={
          <PrivateRoute>
            <Loja />
          </PrivateRoute>
        } 
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default AppRoutes

