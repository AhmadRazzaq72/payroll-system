import {React,useState,useEffect} from "react";
import Header from "../../Components/Header"; // Adjust if needed
import Sidebar from "../../Components/HRSidebar"; // Adjust if needed
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../../utils/api";
import { Trash2, Edit, Plus } from "lucide-react";

const Employees = () => {
  // const employees = [
  //   {
  //     id: "HR001",
  //     name: "Aisha Doe",
  //     jobTitle: "HR Manager",
  //     status: "Full Time Employee",
  //   },
  //   {
  //     id: "HR002",
  //     name: "Chukwuemeka",
  //     jobTitle: "Software Engineer",
  //     status: "Part Time Employee",
  //   },
  //   {
  //     id: "HR003",
  //     name: "Suleiman",
  //     jobTitle: "Marketing Executive",
  //     status: "Full Time Employee",
  //   },
  //   {
  //     id: "HR004",
  //     name: "Olamide",
  //     jobTitle: "Financial Analyst",
  //     status: "Full Time Employee",
  //   },
  //   {
  //     id: "HR005",
  //     name: "Jide",
  //     jobTitle: "Project Manager",
  //     status: "Full Time Employee",
  //   },
  //   {
  //     id: "HR006",
  //     name: "Femi",
  //     jobTitle: "Sales Manager",
  //     status: "Full Time Employee",
  //   },
  // ];
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const navigate = useNavigate();

useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch(apiUrl("/api/all"));
        if (!response.ok) {
          throw new Error("Failed to fetch employees");
        }
        const data = await response.json();
        setEmployees(data.users);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };
    fetchEmployees();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee? This action cannot be undone.")) return;

    try {
      const response = await fetch(apiUrl(`/api/delete/${id}`), {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error("Failed to delete employee");

      setEmployees(prev => prev.filter(emp => emp.user_id !== id));
      alert("Employee deleted successfully");
    } catch (error) {
      console.error("Error deleting employee:", error);
      alert("Error deleting employee");
    }
  };

  const filteredEmployees = employees.filter(emp =>
  emp.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.user_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <div className="min-h-screen flex flex-col">
        <div className="flex-1 p-6 bg-gray-50 w-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Employees List</h2>
            <button
              onClick={() => navigate('/hraddemployee')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl shadow-lg transition flex items-center gap-2 font-semibold"
            >
              <Plus className="w-5 h-5" />
              Add Employee
            </button>
          </div>

          {/* Search Bar */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search The Employee By id or Name"
              value={searchTerm}
              onChange={(e)=>setSearchTerm(e.target.value)}
              className="w-full md:w-1/2 border border-gray-300 rounded px-4 py-2 focus:outline-none"
            />
          </div>

          {/* Table */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-600">
                <tr>
                  <th className="text-left px-6 py-3">Sr.no</th>
                  <th className="text-left px-6 py-3">Employee Id</th>
                  <th className="text-left px-6 py-3">Employee Name</th>
                  <th className="text-left px-6 py-3">Job Title</th>
                  <th className="text-left px-6 py-3">Employment Status</th>
                  <th className="text-left px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length > 0 ? (
             filteredEmployees.map((emp, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition cursor-pointer"
                    onClick={()=>navigate(`/hremployees/profile/${emp.user_id}`)}
                  >
                    <td className="px-6 py-4">{String(index + 1).padStart(2, "0")}</td>
                    <td className="px-6 py-4">{emp.user_id}</td>
                    <td className="px-6 py-4 flex items-center gap-3">
                      {/* Avatar Circle with Icon */}
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-5 h-5 text-red-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5.121 17.804A7.975 7.975 0 0112 15c2.21 0 4.21.896 5.879 2.345M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                      <span>{emp.username}</span>
                    </td>
                    <td className="px-6 py-4">{emp.designation}</td>
                    <td className="px-6 py-4">{emp.employmentType}</td>
                    <td className="px-6 py-4">
                       <div className="flex gap-2">
                         <button
                           onClick={(e) => {
                             e.stopPropagation();
                             navigate(`/hrupdateemployee/${emp.user_id}`);
                           }}
                           className="p-1 hover:bg-blue-100 rounded text-blue-600 transition"
                           title="Edit Employee"
                         >
                           <Edit size={18} />
                         </button>
                         <button
                           onClick={(e) => {
                             e.stopPropagation();
                             handleDelete(emp.user_id);
                           }}
                           className="p-1 hover:bg-red-100 rounded text-red-600 transition"
                           title="Delete Employee"
                         >
                           <Trash2 size={18} />
                         </button>
                       </div>
                     </td>
                  </tr>
                ))
        ) : (
            <tr>
        <td colSpan="6" className="text-center text-gray-500 h-16">
          No users found.
        </td>
      </tr>
        )}
      
              </tbody>
            </table>
          </div>

          {/* Update Employee Modal */}
          {selectedEmployee && (
            <UpdateEmployeeModal
              employee={selectedEmployee}
              onClose={() => setSelectedEmployee(null)}
              onUpdate={(updatedEmp) => {
                setEmployees(prev => prev.map(emp => emp.user_id === updatedEmp.user_id ? updatedEmp : emp));
                setSelectedEmployee(null);
              }}
            />
          )}
        </div>
    </div>
  );
};

const UpdateEmployeeModal = ({ employee, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    username: employee.username || "",
    email: employee.email || "",
    mobile: employee.mobile || "",
    designation: employee.designation || "",
    employmentType: employee.employmentType || "",
    role: employee.role || "",
    salary: employee.salary || "",
    address: employee.address || "",
    leaveAllowance: employee.leaveAllowance || 30,
    gender: employee.gender || "",
    joigningDate: employee.joigningDate || "",
    attendanceType: employee.attendanceType || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(apiUrl(`/api/update/${employee.user_id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to update employee");

      const data = await response.json();
      onUpdate({ ...employee, ...formData });
      alert(data.message);
    } catch (error) {
      console.error("Error updating employee:", error);
      alert("Error updating employee");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center bg-indigo-600 rounded-t-2xl text-white">
          <h3 className="text-xl font-bold">Update Employee: {employee.user_id}</h3>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input type="text" name="username" value={formData.username} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-indigo-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-indigo-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Designation</label>
              <input type="text" name="designation" value={formData.designation} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Salary</label>
              <input type="text" name="salary" value={formData.salary} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Employment Type</label>
              <select name="employmentType" value={formData.employmentType} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-indigo-500">
                <option value="Full Time">Full Time</option>
                <option value="Part Time">Part Time</option>
                <option value="Contract">Contract</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <select name="role" value={formData.role} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-indigo-500">
                <option value="HR">HR</option>
                <option value="employee">Employee</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Mobile</label>
              <input type="text" name="mobile" value={formData.mobile} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Leave Allowance</label>
              <input type="number" name="leaveAllowance" value={formData.leaveAllowance} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <textarea name="address" value={formData.address} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-indigo-500" rows="2"></textarea>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-6 py-2 border rounded-lg hover:bg-gray-100 transition">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Employees;