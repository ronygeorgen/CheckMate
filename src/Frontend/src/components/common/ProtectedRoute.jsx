import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

// Protected Route Component for authenticated users
export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, isMaker, isChecker } = useSelector((state) => state.auth)
  const location = useLocation()

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/" state={{ from: location }} replace />
  }

  // Check role-based access
  if (allowedRoles) {
    const hasRequiredRole = (isMaker && allowedRoles.includes('maker')) || 
                          (isChecker && allowedRoles.includes('checker'))
    
    if (!hasRequiredRole) {
      // Redirect to appropriate home page based on role
      return <Navigate to={isMaker ? "/maker-home" : "/home"} replace />
    }
  }

  return children
}