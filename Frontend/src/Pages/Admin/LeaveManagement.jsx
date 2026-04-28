import React, { useState, useEffect } from "react";
import axios from "axios";
import { CheckCircle, XCircle, Clock, User, Calendar } from "lucide-react";
import { apiUrl } from "../../utils/api";
import Header from "../../Components/Header";
import Sidebar from "../../Components/Sidebar";

const LeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  // const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 3000);
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await axios.get(apiUrl("/api/leaves/all"));
      setLeaves(res.data);
    } catch (err) {
      console.error("Error fetching leaves:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (leaveId, status) => {
    try {
      await axios.patch(apiUrl(`/api/leaves/status/${leaveId}`), { status });
      showToast(`Leave ${status} successfully`);
      fetchLeaves(); // Refresh list
    } catch (err) {
      console.error("Error updating status:", err);
      showToast("Failed to update status", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          <div className="w-full">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Leave Management</h1>
              <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm border">
                Total Requests: {leaves.length}
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Leave Details</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loading ? (
                      <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-500">Loading leave requests...</td></tr>
                    ) : leaves.length === 0 ? (
                      <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-500">No leave requests found.</td></tr>
                    ) : (
                      leaves.map((leave) => (
                        <tr key={leave._id} className="hover:bg-gray-50/50 transition">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                {leave.username?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{leave.username}</div>
                                <div className="text-xs text-gray-500">{leave.user_id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 self-start capitalize">
                                {leave.type}
                              </span>
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Calendar size={14} className="text-gray-400" />
                                {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-600 max-w-[200px] truncate" title={leave.reason}>
                              {leave.reason}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                              leave.status === 'Approved' ? 'bg-green-100 text-green-700' :
                              leave.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {leave.status === 'Pending' && <Clock size={12} />}
                              {leave.status === 'Approved' && <CheckCircle size={12} />}
                              {leave.status === 'Rejected' && <XCircle size={12} />}
                              {leave.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {leave.status === 'Pending' ? (
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleStatusUpdate(leave._id, 'Approved')}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                                  title="Approve"
                                >
                                  <CheckCircle size={20} />
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(leave._id, 'Rejected')}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                  title="Reject"
                                >
                                  <XCircle size={20} />
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400 italic">Processed</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
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

export default LeaveManagement;
