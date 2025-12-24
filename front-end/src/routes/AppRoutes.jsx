import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Home from '../pages/Home'
import Login from '../pages/Login'
import Cadastro from '../pages/Cadastro'
import Loja from '../pages/Loja'
import AdminLogin from '../pages/AdminLogin'
import AdminDashboard from '../pages/AdminDashboard'
import AdminProdutos from '../pages/AdminProdutos'
import AdminUsuarios from '../pages/AdminUsuarios'
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

const AdminRoute = ({ children }) => {
  const [isValidating, setIsValidating] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const validateAdmin = async () => {
      // Verificar se tem token no localStorage
      if (!authService.isAuthenticated()) {
        setIsAuthenticated(false)
        setIsAdmin(false)
        setIsValidating(false)
        return
      }

      // Validar token no servidor
      try {
        const isValid = await authService.verifyToken()
        setIsAuthenticated(isValid)
        
        // Verificar se é admin
        const user = authService.getCurrentUser()
        if (user && (user.admin === 1 || user.admin === true)) {
          setIsAdmin(true)
        } else {
          setIsAdmin(false)
        }
      } catch (error) {
        setIsAuthenticated(false)
        setIsAdmin(false)
      } finally {
        setIsValidating(false)
      }
    }

    validateAdmin()
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
        <Typography>Verificando permissões de administrador...</Typography>
      </Box>
    )
  }

  return isAuthenticated && isAdmin ? children : <Navigate to="/admin/login" replace />
}

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/admin/login" element={<AdminLogin />} />
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
      <Route 
        path="/admin/dashboard" 
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } 
      />
      <Route 
        path="/admin/produtos" 
        element={
          <AdminRoute>
            <AdminProdutos />
          </AdminRoute>
        } 
      />
      <Route 
        path="/admin/usuarios" 
        element={
          <AdminRoute>
            <AdminUsuarios />
          </AdminRoute>
        } 
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default AppRoutes

