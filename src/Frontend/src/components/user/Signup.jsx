import React, { useState } from 'react';
import coverImage from '../../assets/login-signup-image.jpg';
import { ChevronLeft } from 'lucide-react';
import { useRegistration } from '../hooks/useRegistration';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';


const Signup = () => {
  const navigate = useNavigate();
  const { registerUser, state } = useRegistration();
  const [email, setEmail] = useState('');
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    // Basic email validation
    if (email.trim() && email.includes('@')) {
      setShowPasswordFields(true);
      setLocalError('');
    } else {
      setLocalError('Please enter a valid email address');
    }
  };

  const handleBackToEmail = () => {
    setShowPasswordFields(false);
    setPassword('');
    setRepeatPassword('');
    setLocalError('');
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (password !== repeatPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    // Validate password strength (optional)
    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters long');
      return;
    }

    try {
      await registerUser({
        email,
        password
      });

        toast.success('Account created successfully');
        navigate('/');
      
    } catch (err) {
      // Error is already set in the state by the hook
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
              to="/" 
              className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 text-sm"
            >
              Login
            </Link >
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex h-[calc(100vh-4rem)]">
        <div className="w-1/2 flex items-center justify-center">
          <div className="bg-white/60 backdrop-blur-md rounded-lg shadow-lg max-w-md w-full p-8">
            {/* Back Button */}
            {showPasswordFields && (
              <button 
                onClick={handleBackToEmail}
                className="flex items-center text-gray-700 mb-4 hover:text-gray-900"
              >
                <ChevronLeft size={24} className="mr-2" /> Back
              </button>
            )}

            {/* Title */}
            <h1 className="text-3xl font-bold mb-4">Create account</h1>

            {/* Display Email */}
            {showPasswordFields && (
              <p className="text-sm text-gray-600 mb-4">
                {email}
              </p>
            )}

        

            {/* Loading State */}
            {/* {state.isLoading && (
              <div className="text-center text-gray-600 mb-4">
                Processing...
              </div>
            )} */}

            {/* Email Form */}
            {!showPasswordFields ? (
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
              /* Password Form */
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <input
                  type="password"
                  placeholder="Create password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  required
                />
                <input
                  type="password"
                  placeholder="Repeat password"
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  required
                />
                
                <button 
                  type="submit"
                  className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors"
                  disabled={state.isLoading}
                >
                  {state.isLoading ? 'Submitting...' :  'Sign Up' }
                </button>
              </form>
            )}

            {/* Login Link */}
            {!showPasswordFields && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account? <Link to="/" className="text-black hover:underline">Login</Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;