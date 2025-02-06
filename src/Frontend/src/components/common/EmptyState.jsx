import { PlusCircle, Users, Factory, Upload, ClipboardList } from "lucide-react"

export const EmptyState = ({ type, onAction }) => {
    const config = {
      makers: {
        icon: <Factory className="w-12 h-12 text-gray-400" />,
        title: "No Makers Found",
        description: "Get started by creating your first maker",
        actionText: "Create Maker",
      },
      customers: {
        icon: <Users className="w-12 h-12 text-gray-400" />,
        title: "No Customers Found",
        description: "There are currently no customers in the system",
        actionText: null,
      },
      employees: {
        icon: <ClipboardList className="w-12 h-12 text-gray-400" />,
        title: "No Employees Found",
        description: "Start by uploading your first employee",
        actionText: "Upload Employee",
      }
    }
  
    const { icon, title, description, actionText } = config[type]
  
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-sm">
        <div className="flex justify-center">{icon}</div>
        <h3 className="mt-4 text-lg font-medium text-gray-900">{title}</h3>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
        {actionText && (
          <button
            onClick={onAction}
            className="mt-6 inline-flex items-center px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            {actionText}
          </button>
        )}
      </div>
    )
  }