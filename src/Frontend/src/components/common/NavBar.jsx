import { Link, useNavigate } from "react-router-dom"
import { logoutUser  } from "../../redux/features/authSlice"
import { useDispatch } from 'react-redux'
import { toast } from 'sonner'

const NavBar = ({ activeView, setActiveView }) => {

    const dispatch = useDispatch()
    const navigate = useNavigate()
    
    const handleLogout = async () => {
      try {
        await dispatch(logoutUser()).unwrap()
        navigate('/') 
        toast.success('Logged out successfully')
      } catch (error) {
        console.error('Logout failed:', error)
        toast.error('Failed to logout')
        // Handle error (maybe show a toast notification)
      }
    }
  

  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-black">
          CheckMate
        </Link>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setActiveView("makers")}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeView === "makers" ? "bg-black text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            Makers
          </button>
          <button
            onClick={() => setActiveView("customers")}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeView === "customers" ? "bg-black text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            Customers
          </button>
          
          <button
            onClick={() => handleLogout() }
            className={`px-4 py-2 rounded-md transition-colors ${
              activeView === "logout" ? "bg-black text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            Logout
          </button>
        </div>
      </nav>
    </header>
  )
}

export default NavBar