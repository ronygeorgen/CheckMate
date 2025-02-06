import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Toaster } from 'sonner';
import { Routes, Route,useLocation, useNavigate, Navigate } from 'react-router-dom'
import Signup from './components/user/Signup'
import Login from './components/user/Login'
import Home from './components/user/Home'
import MakerHome from './components/user/MakerHome'
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { PublicRoute } from './components/common/PublicRoute';


function App() {

  return (
    <>
      <Toaster
        position="top-center"
        expand={false}
        richColors
        toastOptions={{
          style: {
            background: 'white',
            border: '1px solid #E2E8F0',
          },
          success: {
            style: {
              background: 'white',
              border: '1px solid #10B981',
              color: '#10B981',
            },
          },
          error: {
            style: {
              background: 'white',
              border: '1px solid #EF4444',
              color: '#EF4444',
            },
          },
        }}
      />
      <Routes>
      <Route path="/signup"  element={ <PublicRoute> <Signup /> </PublicRoute> } />
      <Route path="/login"  element={ <PublicRoute>  <Login /> </PublicRoute> } />
      <Route path="/"  element={ <PublicRoute>  <Login /> </PublicRoute> } />
      <Route path="/home"  element={ <ProtectedRoute allowedRoles={['checker']}> <Home /> </ProtectedRoute> } />
      <Route path="/maker-home"  element={ <ProtectedRoute allowedRoles={['maker']}> <MakerHome /> </ProtectedRoute> } />
      {/* Catch all other routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App
