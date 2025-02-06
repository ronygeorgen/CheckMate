import { useState } from "react"
import { useMakerRegistration } from "../hooks/useMakerRegistration"
import { toast } from "sonner"
import { Link, useNavigate } from "react-router-dom"

const CreateMakerModal = ({ onClose, onCreateMaker }) => {

  const navigate = useNavigate()
  const { registerMaker, state } = useMakerRegistration()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [localError, setLocalError] = useState('');
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Basic email validation
    if (email.trim() && email.includes('@')) {
      setShowPasswordFields(true);

      setLocalError('');
    } else {
      setLocalError('Please enter a valid email address');
    }

    if (password !== confirmPassword) {
      setLocalError("Passwords don't match")
      return
    }

    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters long');
      return;
    }

    try {
      await registerMaker({
        email,
        password
      });
      toast.success('Account created successfully');
      navigate('/home');
    } catch (error) {
      toast.error(error.message);
      setIsLoading(false);
      
    }

    onCreateMaker({ email, password })
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Create Maker</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Create Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black"
              required
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black"
              required
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
            >
              {isLoading ? 'Creating...' : 'Create Maker'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateMakerModal

