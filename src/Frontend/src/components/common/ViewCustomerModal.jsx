import { useState } from 'react'
import { toast } from 'sonner'
import api from '../services/api'

const ViewCustomerModal = ({ customer, onClose, onStatusUpdate }) => {
  const [loadingStatus, setLoadingStatus] = useState(null) // 'approve' or 'decline' or null

  const handleStatusUpdate = async (newStatus) => {
    const actionType = newStatus === 'approved' ? 'approve' : 'decline'
    setLoadingStatus(actionType)
    
    try {
      const response = await api.patch(
        `/user/employees/${customer.id}/status/`,
        { status: newStatus },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      
      toast.success(`Successfully ${newStatus.toLowerCase()} employee`)
      onStatusUpdate(response.data)
      onClose()
    } catch (error) {
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.detail || 
                          `Failed to ${newStatus.toLowerCase()} employee`
      toast.error(errorMessage)
    } finally {
      setLoadingStatus(null)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Customer Details</h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Name</p>
            <p className="mt-1">{`${customer.first_name} ${customer.last_name}`}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Photo</p>
            <img
              src={customer.photo_url || "/placeholder.svg"}
              alt={customer.first_name}
              className="mt-1 w-full h-40 object-cover rounded-md"
            />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Resume</p>
            <div className="mt-1 p-2 bg-gray-100 rounded-md">
              <a 
                href={customer.resume_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block mt-2 text-blue-500 hover:text-blue-700"
              >
                View Resume
              </a>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Status</p>
            <span
              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                customer.status === "approved"
                  ? "bg-green-100 text-green-800"
                  : customer.status === "declined"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {customer.status}
            </span>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          {customer.status === "pending" && (
            <>
              <button
                onClick={() => handleStatusUpdate("declined")}
                disabled={loadingStatus !== null}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingStatus === 'decline' ? "Processing..." : "Decline"}
              </button>
              <button
                onClick={() => handleStatusUpdate("approved")}
                disabled={loadingStatus !== null}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingStatus === 'approve' ? "Processing..." : "Approve"}
              </button>
            </>
          )}
          <button
            onClick={onClose}
            disabled={loadingStatus !== null}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default ViewCustomerModal