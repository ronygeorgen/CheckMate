import { useState, useEffect } from "react"
import api from "../services/api"
import { toast } from "sonner"
import { Eye } from "lucide-react"
import { EmptyState } from "../common/EmptyState"
import  MakerNavbar  from "../common/MakerNavbar"

const MakerHome = () => {
  const [activeView, setActiveView] = useState("employees") 
  const [employees, setEmployees] = useState([])
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    photo: null,
    resume: null,
  })

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const response = await api.get("/user/employees/")
      setEmployees(response.data)
    } catch (err) {
      toast.error("Failed to fetch employees")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, files } = e.target
    if (files) {
      setFormData({ ...formData, [name]: files[0] })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const validateForm = () => {
    const requiredFields = ["first_name", "last_name", "photo", "resume"]
    const missingFields = requiredFields.filter(field => !formData[field])
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in: ${missingFields.join(", ")}`)
      return false
    }

    if (!["image/jpeg", "image/png"].includes(formData.photo.type)) {
      toast.error("Photo must be JPEG or PNG")
      return false
    }
    if (formData.photo.size > 5 * 1024 * 1024) {
      toast.error("Photo must be 5MB or less")
      return false
    }

    if (formData.resume.type !== "application/pdf") {
      toast.error("Resume must be PDF")
      return false
    }
    if (formData.resume.size > 5 * 1024 * 1024) {
      toast.error("Resume must be 5MB or less")
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (!validateForm()) return

    const data = new FormData()
    data.append("first_name", formData.first_name)
    data.append("last_name", formData.last_name)
    data.append("photo", formData.photo)
    data.append("resume", formData.resume)

    try {
      await api.post("/user/employees/upload/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      
      toast.success("Employee uploaded successfully")
      setIsUploadModalOpen(false)
      setFormData({ first_name: "", last_name: "", photo: null, resume: null })
      fetchEmployees()
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to upload employee")
    } finally {
      setIsSubmitting(false)
  }
  }
  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return 'text-green-500'
      case 'declined': return 'text-red-500'
      default: return 'text-yellow-500'
    }
  }

  const handleViewDetails = (employee) => {
    setSelectedEmployee(employee)
    setIsDetailsModalOpen(true)
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading...</p>
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex justify-center items-center h-64">
          <p className="text-red-500">{error}</p>
        </div>
      )
    }

    if (employees.length === 0) {
      return <EmptyState type="employees" onAction={() => setIsUploadModalOpen(true)} />
    }
  

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded By</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Checked By</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {employees.map((employee) => (
              <tr key={employee.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {`${employee.first_name} ${employee.last_name}`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{employee.uploaded_by}</td>
                <td className="px-6 py-4 whitespace-nowrap">{employee.checked_by || "Not checked"}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`font-bold ${getStatusColor(employee.status)}`}>
                    {employee.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleViewDetails(employee)}
                    className="text-blue-500 hover:text-blue-700 flex items-center cursor-pointer"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <MakerNavbar onUploadClick={() => setIsUploadModalOpen(true)} />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Employee Management</h1>
        {renderContent()}
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Upload New Employee
              </h3>
              <form onSubmit={handleSubmit} className="mt-2">
                <input
                  type="text"
                  name="first_name"
                  placeholder="First Name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className="mt-2 p-2 w-full border rounded"
                  required
                />
                <input
                  type="text"
                  name="last_name"
                  placeholder="Last Name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className="mt-2 p-2 w-full border rounded"
                  required
                />
                <input
                  type="file"
                  name="photo"
                  accept=".jpg,.jpeg,.png"
                  onChange={handleInputChange}
                  className="mt-2 p-2 w-full border rounded"
                  required
                />
                <input
                  type="file"
                  name="resume"
                  accept=".pdf"
                  onChange={handleInputChange}
                  className="mt-2 p-2 w-full border rounded"
                  required
                />
                <div className="items-center px-4 py-3">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-black text-white text-base font-medium rounded-md w-full shadow-sm cursor-pointer hover:bg-gray-800"
                  >
                    { isSubmitting ? "Uploading..." : "Upload" }
                  </button>
                </div>
              </form>
            </div>
            <button
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute top-0 right-0 mt-4 mr-5 text-gray-400 hover:text-gray-600"
            >
              <span className="text-2xl">&times;</span>
            </button>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {isDetailsModalOpen && selectedEmployee && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-medium text-gray-900">
                  Employee Details
                </h3>
                <button
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  &times;
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <img
                    src={selectedEmployee.photo_url}
                    alt={`${selectedEmployee.first_name} ${selectedEmployee.last_name}`}
                    className="w-full h-48 object-cover rounded"
                  />
                </div>
                <div className="space-y-2">
                  <p><span className="font-semibold">Name:</span> {`${selectedEmployee.first_name} ${selectedEmployee.last_name}`}</p>
                  <p><span className="font-semibold">Uploaded by:</span> {selectedEmployee.uploaded_by}</p>
                  <p><span className="font-semibold">Checked by:</span> {selectedEmployee.checked_by || "Not checked"}</p>
                  <p>
                    <span className="font-semibold">Status:</span>
                    <span className={`ml-2 font-bold ${getStatusColor(selectedEmployee.status)}`}>
                      {selectedEmployee.status}
                    </span>
                  </p>
                  <a 
                    href={selectedEmployee.resume_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-blue-500 hover:text-blue-700"
                  >
                    View Resume
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MakerHome