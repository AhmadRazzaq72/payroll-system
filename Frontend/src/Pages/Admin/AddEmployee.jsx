import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiUrl } from "../../utils/api";

const AddEmployee = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isUpdateMode = !!id;

  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    id: "",
    joigningDate: "",
    designation: "",
    address: "",
    bankAccount: "",
    mobile: "",
    email: "",
    role: "",
    salary: "",
    employmentType: "",
    attendanceType: "",
    emergencyContact: "",
    emergencyContactname: "",
    IFSC: "",
    leaveAllowance: 30
  });
  const [toast, setToast] = useState({ message: '', type: '' });

  useEffect(() => {
    if (isUpdateMode) {
      const fetchEmployee = async () => {
        try {
          const response = await fetch(apiUrl(`/api/users/${id}`));
          if (response.ok) {
            const data = await response.json();
            const emp = data.user;
            setFormData({
              name: emp.username || "",
              gender: emp.gender || "",
              id: emp.user_id || id,
              joigningDate: emp.joigningDate || "",
              designation: emp.designation || "",
              address: emp.address || "",
              bankAccount: emp.bankAccount || "",
              mobile: emp.mobile || "",
              email: emp.email || "",
              role: emp.role || "",
              salary: emp.salary || "",
              employmentType: emp.employmentType || "",
              attendanceType: emp.attendanceType || "",
              emergencyContact: emp.emergencyContact || "",
              emergencyContactname: emp.emergencyContactname || "",
              IFSC: emp.IFSC || "",
              leaveAllowance: emp.leaveAllowance || 30
            });
          }
        } catch (error) {
          console.error("Error fetching employee:", error);
          showToast("❌ Error loading employee data", "error");
        }
      };
      fetchEmployee();
    }
  }, [id, isUpdateMode]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = isUpdateMode ? apiUrl(`/api/update/${id}`) : apiUrl("/api/add");
    const method = isUpdateMode ? "PUT" : "POST";

    // When updating, the backend expects 'username' instead of 'name' based on previous context, 
    // but the addUser controller uses 'name'. I'll send both or map accordingly.
    const payload = { ...formData, username: formData.name };

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) {
        showToast(isUpdateMode ? "✅ Employee updated successfully!" : "✅ Employee added successfully!");
        if (!isUpdateMode) {
          setFormData({
            name: "", gender: "", id: "", joigningDate: "", designation: "", address: "",
            bankAccount: "", mobile: "", email: "", role: "", salary: "",
            employmentType: "", attendanceType: "", emergencyContact: "",
            emergencyContactname: "", IFSC: "", leaveAllowance: 30
          });
        } else {
          setTimeout(() => navigate('/hremployees'), 1500);
        }
      } else {
        showToast(`❌ Error: ${data.message || "Operation failed."}`, "error");
      }
    } catch (error) {
      console.error("❌ Error:", error);
      showToast("❌ Network error.", "error");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
        <div className="flex-1 p-6 bg-gray-50">
          <h2 className="text-2xl font-semibold mb-6">
            {isUpdateMode ? "Update Employee" : "Add Employee"}
          </h2>

          <form
            onSubmit={handleSubmit}
            className="bg-white p-8 rounded-xl shadow-md max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-6 w-full"
          >
            <div>
              <label className="block text-sm font-medium mb-1">
                Employee Name:
              </label>
              <input
                type="text"
                name="name"
                placeholder="ex. John Doe"
                value={formData.name}
                onChange={handleChange}
                className="w-full border px-4 py-2 rounded"
                required
              />
            </div>
              <div>
              <label className="block text-sm font-medium mb-1">
                Employee id:
              </label>
              <input
                type="text"
                name="id"
                placeholder="ex. CS001"
                value={formData.id}
                onChange={handleChange}
                disabled={isUpdateMode}
                className="w-full border px-4 py-2 rounded disabled:bg-gray-100"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Employee Address:
              </label>
              <input
                type="text"
                name="address"
                placeholder="ex. House no, Society name, District, State"
                value={formData.address}
                onChange={handleChange}
                className="w-full border px-4 py-2 rounded"
                required
              />
            </div>

              <div>{/*Gender*/}
              <label className="block text-sm font-medium mb-1">
                Gender:
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full border px-4 py-2 rounded"
                required
              >
                <option value="">Please Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

                        <div>
              <label className="block text-sm font-medium mb-1">
                Employee Bank Account No.:
              </label>
              <input
                type="text"
                name="bankAccount"
                placeholder="ex. ************"
                value={formData.bankAccount}
                onChange={handleChange}
                className="w-full border px-4 py-2 rounded"
                required
              />
            </div>
          
              <div>
              <label className="block text-sm font-medium mb-1">
                IFSC CODE.:
              </label>
              <input
                type="text"
                name="IFSC"
                placeholder="ex. SBI001"
                value={formData.IFSC}
                onChange={handleChange}
                className="w-full border px-4 py-2 rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Employee Mobile No.:
              </label>
              <input
                type="text"
                name="mobile"
                placeholder="ex. 9876543273"
                value={formData.mobile}
                onChange={handleChange}
                className="w-full border px-4 py-2 rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Employee Mail ID:
              </label>
              <input
                type="email"
                name="email"
                placeholder="ex. abc@mail.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full border px-4 py-2 rounded"
                required
              />
            </div>


            <div> {/*Designation*/}
              <label className="block text-sm font-medium mb-1">
                Designation:
              </label>
              <input
                type="text"
                name="designation"
                placeholder="ex. Software Engineer"
                value={formData.designation}
                onChange={handleChange}
                className="w-full border px-4 py-2 rounded"
                required
              />
            </div> 

            <div>
              <label className="block text-sm font-medium mb-1">
                Employee Salary:
              </label>
              <input
                type="text"
                name="salary"
                placeholder="ex. 20,000"
                value={formData.salary}
                onChange={handleChange}
                className="w-full border px-4 py-2 rounded"
                required
              />
            </div>

              <div>{/*Role*/}
              <label className="block text-sm font-medium mb-1">
                Role:
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full border px-4 py-2 rounded"
                required
              >
                <option value="">Please Select</option>
                <option value="HR">HR</option>
                <option value="employee">Employee</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Employment Type:
              </label>
              <select
                name="employmentType"
                value={formData.employmentType}
                onChange={handleChange}
                className="w-full border px-4 py-2 rounded"
                required
              >
                <option value="">Please Select</option>
                <option value="Full Time">Full Time</option>
                <option value="Part Time">Part Time</option>
                <option value="Contract">Contract</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Employee Attendance Type:
              </label>
              <select
                name="attendanceType"
                value={formData.attendanceType}
                onChange={handleChange}
                className="w-full border px-4 py-2 rounded"
                required
              >
                <option value="">Please Select</option>
                <option value="Daily">Daily</option>
                <option value="Hourly">Hourly</option>
              </select>
            </div>

              <div>{/*Joining Date*/}
              <label className="block text-sm font-medium mb-1">
                 Joining Date:
              </label>
              <input
                type="text"
                name="joigningDate"
                placeholder="ex. 18-07-2025"
                value={formData.joigningDate}
                onChange={handleChange}
                className="w-full border px-4 py-2 rounded"
                required
              />
            </div>


            <div>{/*Emergencycontactname*/}
              <label className="block text-sm font-medium mb-1">
                Emergency Contact Name:
              </label>
              <input
                type="text"
                name="emergencyContactname"
                placeholder="ex. Rahul"
                value={formData.emergencyContactname}
                onChange={handleChange}
                className="w-full border px-4 py-2 rounded"
                required
              />
            </div>

            
              <div>{/*Emergencycontact*/}
              <label className="block text-sm font-medium mb-1">
                Emergency Contact:
              </label>
              <input
                type="text"
                name="emergencyContact"
                placeholder="ex. 9875641230"
                value={formData.emergencyContact}
                onChange={handleChange}
                className="w-full border px-4 py-2 rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Annual Leave Allowance:
              </label>
              <input
                type="number"
                name="leaveAllowance"
                placeholder="ex. 30"
                value={formData.leaveAllowance}
                onChange={handleChange}
                className="w-full border px-4 py-2 rounded"
                required
              />
            </div>


            <div className="col-span-1 md:col-span-2 mt-4">
              <button
                type="submit"
                className="bg-purple-600 text-white font-semibold px-6 py-2 rounded hover:bg-purple-700 shadow"
              >
                {isUpdateMode ? "Update Employee" : "Add Employee"}
              </button>
            </div>
          </form>
        </div>
      

      {toast.message && (
        <div className={`fixed top-4 right-4 z-[9999] px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-all duration-300 transform translate-y-0 ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default AddEmployee;
