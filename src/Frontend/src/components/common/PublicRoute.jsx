import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

export const PublicRoute = ({ children }) => {
    const { isAuthenticated, isMaker } = useSelector((state) => state.auth)
    
    if (isAuthenticated) {
      // Redirect to appropriate home page if already authenticated
      return <Navigate to={isMaker ? "/maker-home" : "/home"} replace />
    }
  
    return children
  }