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
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="w-full">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isUpdateMode ? "Update Employee" : "Register New Employee"}
            </h1>
            <p className="text-gray-500">Fill in the details to {isUpdateMode ? "update" : "add"} an employee in the system</p>
          </div>
          <button 
            onClick={() => navigate('/hremployees')}
            className="text-gray-500 hover:text-gray-800 font-medium transition"
          >
            &larr; Back to List
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 pb-12">
          {/* Section 1: Personal Details */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 bg-gray-50/50 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">Personal Information</h2>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Employee ID</label>
                <input
                  type="text"
                  name="id"
                  placeholder="EMP001"
                  value={formData.id}
                  onChange={handleChange}
                  disabled={isUpdateMode}
                  className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition disabled:bg-gray-50 disabled:text-gray-400"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Mobile Number</label>
                <input
                  type="text"
                  name="mobile"
                  placeholder="+1 234 567 890"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                  required
                />
              </div>
              <div className="space-y-1 lg:col-span-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Permanent Address</label>
                <input
                  type="text"
                  name="address"
                  placeholder="Street, City, State, Country"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: Job & Employment */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 bg-gray-50/50 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">Job & Employment Details</h2>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Designation</label>
                <input
                  type="text"
                  name="designation"
                  placeholder="Software Engineer"
                  value={formData.designation}
                  onChange={handleChange}
                  className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Monthly Salary ($)</label>
                <input
                  type="text"
                  name="salary"
                  placeholder="5000"
                  value={formData.salary}
                  onChange={handleChange}
                  className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Employment Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                  required
                >
                  <option value="">Select Role</option>
                  <option value="HR">HR / Admin</option>
                  <option value="employee">Standard Employee</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Employment Type</label>
                <select
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleChange}
                  className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Full Time">Full Time</option>
                  <option value="Part Time">Part Time</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Attendance Type</label>
                <select
                  name="attendanceType"
                  value={formData.attendanceType}
                  onChange={handleChange}
                  className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Daily">Daily Basis</option>
                  <option value="Hourly">Hourly Basis</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Joining Date</label>
                <input
                  type="text"
                  name="joigningDate"
                  placeholder="YYYY-MM-DD"
                  value={formData.joigningDate}
                  onChange={handleChange}
                  className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Annual Leave Allowance</label>
                <input
                  type="number"
                  name="leaveAllowance"
                  value={formData.leaveAllowance}
                  onChange={handleChange}
                  className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Section 3: Bank Details */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-8 py-6 bg-gray-50/50 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-800">Bank Information</h2>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Bank Account Number</label>
                  <input
                    type="text"
                    name="bankAccount"
                    placeholder="Acc No. ************"
                    value={formData.bankAccount}
                    onChange={handleChange}
                    className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">IFSC / Swift Code</label>
                  <input
                    type="text"
                    name="IFSC"
                    placeholder="BANK0123"
                    value={formData.IFSC}
                    onChange={handleChange}
                    className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Emergency Contact */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-8 py-6 bg-gray-50/50 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-800">Emergency Contact</h2>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Contact Name</label>
                  <input
                    type="text"
                    name="emergencyContactname"
                    placeholder="Relative Name"
                    value={formData.emergencyContactname}
                    onChange={handleChange}
                    className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Emergency Phone</label>
                  <input
                    type="text"
                    name="emergencyContact"
                    placeholder="Relative Phone"
                    value={formData.emergencyContact}
                    onChange={handleChange}
                    className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-12 py-4 rounded-2xl shadow-xl shadow-indigo-100 transition-all hover:scale-[1.02] active:scale-95"
            >
              {isUpdateMode ? "Update Employee Data" : "Register Employee"}
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
