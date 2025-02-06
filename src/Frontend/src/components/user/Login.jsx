import React, { useState } from 'react';
import coverImage from '../../assets/login-signup-image.jpg';
import { ChevronLeft } from 'lucide-react';
import { useLogin } from '../hooks/useLogin';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';


const Login = () => {
  const navigate = useNavigate();
  const { login, state } = useLogin();
  const [email, setEmail] = useState('');
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    // Basic email validation
    if (email.trim() && email.includes('@')) {
      setShowPasswordField(true);
      setLocalError('');
    } else {
      setLocalError('Please enter a valid email address');
      toast.error('Please enter a valid email address');
    }
  };

  const handleBackToEmail = () => {
    setShowPasswordField(false);
    setPassword('');
    setLocalError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const response = await login({
        email,
        password
      });

      if (response.is_checker){
        toast.success('Checker login successful');
        navigate('/home');
      } else if (response.is_maker) {
        toast.success('Maker login successful');
        navigate('/maker-home');
      } else {      
        toast.error('Invalid user type'); 
      }
      
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={coverImage}
          alt="cover"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Navigation Bar */}
      <header className="relative z-10 bg-white/80 backdrop-blur-sm shadow-md py-4 px-6">
        <nav className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold">
          CheckMate
          </Link>
          <div className="flex items-center space-x-4">
            <Link 
              to="/signup" 
              className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 text-sm"
            >
              Sign Up
            </Link>
          </div>
        </nav>
      </header>

      {/* Login Card */}
      <div className="relative z-10 flex h-[calc(100vh-4rem)]">
        <div className="w-1/2 flex items-center justify-center">
          <div className="bg-white/60 backdrop-blur-md rounded-lg shadow-lg max-w-md w-full p-8">
            {showPasswordField && (
              <button 
                onClick={handleBackToEmail}
                className="flex items-center text-gray-700 mb-4 hover:text-gray-900"
              >
                <ChevronLeft size={24} className="mr-2" /> Back
              </button>
            )}

            <h1 className="text-3xl font-bold mb-4">Login to your account</h1>

            {showPasswordField && (
              <p className="text-sm text-gray-600 mb-4">
                {email}
              </p>
            )}

            {!showPasswordField ? (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    required
                  />
                  <button 
                    type="submit"
                    className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  required
                />
                <div className="flex justify-between items-center">
                  <a href="/forgot-password" className="text-sm text-gray-600 hover:text-gray-800">
                    Forgot Password?
                  </a>
                </div>
                <button 
                  type="submit"
                  className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors"
                  disabled={state.isLoading}
                >
                  {state.isLoading ? 'Logging in...' : 'Login'}
                </button>
              </form>
            )}

            {!showPasswordField && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account? <Link to="/signup" className="text-black hover:underline">Sign Up</Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;