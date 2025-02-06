import { useEffect, useState } from "react"
import NavBar from "../common/NavBar"
import MakerList from "../common/MakerList"
import CustomerList from "../common/CustomerList"
import CreateMakerModal from "../common/CreateMakerModal"
import ViewCustomerModal from "../common/ViewCustomerModal"
import api from "../services/api"
import { toast } from "sonner"
import { EmptyState } from "../common/EmptyState"


const Home = () => {
  const [activeView, setActiveView] = useState("makers") 
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [viewCustomerData, setViewCustomerData] = useState(null)
  const [makers, setMakers] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const fetchMakers = async () => {
    try {
      setLoading(true)
      const response = await api.get('/user/fetch-makers/')      
      setMakers(response.data)
    } catch (err) {
      setError(err.message)
      toast.error("Failed to fetch makers")
    } finally {
      setLoading(false)
    }
  }

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const response = await api.get("/user/employees/")
      setCustomers(response.data)
    } catch (err) {
      toast.error("Failed to fetch employees")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMakers()
    fetchEmployees()
  }, [])

  const handleCreateMaker = (newMaker) => {
    setMakers([...makers, { ...newMaker, id: makers.length + 1, is_active: true }])
    setIsCreateModalOpen(false)
  }

  const handleViewCustomer = (customer) => {
    setViewCustomerData(customer)
  }

  const handleStatusUpdate = (updatedCustomer) => {
    setCustomers(prevCustomers =>
      prevCustomers.map(customer =>
        customer.id === updatedCustomer.id ? updatedCustomer : customer
      )
    )
    fetchEmployees()
  }

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true)
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

    if (activeView === "makers") {
      return makers.length === 0 ? (
        <EmptyState type="makers" onAction={handleOpenCreateModal} />
      ) : (
        <MakerList makers={makers} />
      )
    }

    return customers.length === 0 ? (
      <EmptyState type="customers" />
    ) : (
      <CustomerList customers={customers} onViewCustomer={handleViewCustomer} />
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar activeView={activeView} setActiveView={setActiveView} />
      <main className="container mx-auto px-4 py-8">
        <div className="relative mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">
              {activeView === "makers" ? "Makers Dashboard" : "Customers Dashboard"}
            </h1>
            {activeView === "makers" && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="absolute right-0 top-1/2 -translate-y-1/2 bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors"
              >
                Create Maker
              </button>
            )}
          </div>
        </div>
        
        {renderContent()}
      </main>

      {isCreateModalOpen && (
        <CreateMakerModal 
          onClose={() => setIsCreateModalOpen(false)} 
          onCreateMaker={handleCreateMaker} 
        />
      )}
      
      {viewCustomerData && (
        <ViewCustomerModal
          customer={viewCustomerData}
          onClose={() => setViewCustomerData(null)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  )
}

export default Home