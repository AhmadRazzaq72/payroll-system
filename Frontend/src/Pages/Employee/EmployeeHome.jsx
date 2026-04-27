import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Users,
  DollarSign,
  Calendar,
  Settings,
  User,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setAttendanceStatus } from "../../Redux/Slice.jsx";
import Header from "../../Components/Header";
import Sidebar from "../../Components/Sidebar";
import { apiUrl } from "../../utils/api";



const Dashboard = () => {
  // const [menuOpen, setMenuOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [ setStatus] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedRange, setSelectedRange] = useState("This Year");
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    type: "",
    startDate: "",
    endDate: "",
    reason: ""
  });
  const [toast, setToast] = useState({ message: '', type: '' });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 3000);
  };

  const handleBuddyPunching = () => {
    navigate('/emattendance'); // your route path
  };
  const handleManagerPOV = () => {
    navigate(`/emprofile/${user?.id}`); 
  };

  const user = useSelector((state) => state.auth.user);
  const attendanceStatus = useSelector((state) => state.auth.status);
  useEffect(() => {
    if (user?.id) {
      setUserId(user.id);
    }
  }, [user]);

  // ✅ Fetch status when `id` is set
  useEffect(() => {
    if (!userId) return;

    const fetchTodayStatus = async () => {
      try {
        const res = await axios.get(apiUrl(`/api/attendance/${userId}`));
        console.log("id sent to api is ", userId);
        setStatus(res.data.status);
        dispatch(setAttendanceStatus(res.data.status));
        console.log("Attendance status updated in Redux:", res.data.status);
        console.log("Today's attendance status:", res.data.status);
      } catch (err) {
        console.error("Error fetching today's attendance", err);
      }
    };

    fetchTodayStatus();
  }, [userId]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setAnnouncementsLoading(true);
        const res = await fetch(apiUrl("/api/announcements"));
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch announcements");
        }
        setAnnouncements(data.announcements || []);
      } catch (err) {
        console.error("Error fetching announcements:", err);
      } finally {
        setAnnouncementsLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  useEffect(() => {
    const fetchLeaveHistory = async () => {
      if (!userId) return;
      try {
        setLeaveLoading(true);
        const res = await axios.get(apiUrl(`/api/leaves/employee/${userId}`));
        setLeaveHistory(res.data);
      } catch (err) {
        console.error("Error fetching leave history:", err);
      } finally {
        setLeaveLoading(false);
      }
    };
    fetchLeaveHistory();
  }, [userId]);

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(apiUrl('/api/leaves/apply'), {
        ...leaveForm,
        user_id: user.id,
        username: user.username
      });
      showToast(res.data.message);
      setShowLeaveModal(false);
      setLeaveForm({ type: "", startDate: "", endDate: "", reason: "" });
      // Refresh history
      const historyRes = await axios.get(apiUrl(`/api/leaves/employee/${userId}`));
      setLeaveHistory(historyRes.data);
    } catch (err) {
      console.error("Error submitting leave:", err);
      showToast("Failed to submit leave request", "error");
    }
  };

  const calculateLeaveStats = () => {
    let taken = 0;
    let pending = 0;
    
    leaveHistory.forEach(leave => {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      
      if (leave.status === 'Approved') {
        taken += days;
      } else if (leave.status === 'Pending') {
        pending += 1; // User asked for "Leave request pending" count, not days
      }
    });

    const allowance = user?.leaveAllowance || 30; // Use dynamic allowance from user profile
    return {
      taken,
      pending,
      available: Math.max(0, allowance - taken),
      allowance
    };
  };

  const stats = calculateLeaveStats();



  const yearData = [
    { name: "Jan", Attendance: 24 },
    { name: "Feb", Attendance: 22 },
    { name: "Mar", Attendance: 18 },
    { name: "Apr", Attendance: 27 },
    { name: "May", Attendance: 30 },
    { name: "Jun", Attendance: 25 },
    { name: "Jul", Attendance: 29 },
    { name: "Aug", Attendance: 24 },
    { name: "Sep", Attendance: 26 },
    { name: "Oct", Attendance: 28 },
    { name: "Nov", Attendance: 23 },
    { name: "Dec", Attendance: 21 },
  ];

  const monthData = Array.from({ length: 31 }, (_, i) => ({
    name: `${i + 1}`,
    Attendance: Math.random() > 0.15 ? 1 : 0,
  }));


  const statusmanager = () => {
    if (attendanceStatus === "Present") {
      return "Present";
    } else if (attendanceStatus === "Late") {
      return "Late";
    } else if (attendanceStatus === "Late Absent") {
      return "Late Absent";
    } else {
      return "Absent";
    }
  }




  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex-1 h-[calc(100vh-64px)] overflow-y-auto p-6 space-y-6 bg-gray-50">
        {/* Page Title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-xl font-semibold">Dashboard</h1>

          <div className="flex flex-wrap gap-2 items-center">
            <button
              onClick={handleBuddyPunching}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm shadow hover:bg-indigo-700 transition"
            >
              + Buddy Punching
            </button>
            <button
              onClick={handleManagerPOV}
              className="border px-4 py-2 rounded-md text-sm shadow hover:bg-gray-50 transition"
            >
              Manager POV
            </button>

            {/* Today's Attendance Status */}
            <div
              className={`px-4 py-2 rounded-md text-sm font-medium shadow transition ${(attendanceStatus === 'Present' || attendanceStatus === 'Late')
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white'
                }`}
            >
              {statusmanager()}
            </div>
          </div>
        </div>


        {/* Welcome Message & Action */}
        <div className="text-sm text-gray-700 bg-white p-4 rounded-md shadow flex justify-between items-center">
          <div>
            <span className="font-medium text-base">Good to see you, {user?.username}👋</span>
          </div>
          <button 
            onClick={() => setShowLeaveModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-medium transition"
          >
            Apply for Leave
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              title: "Total leave taken",
              value: stats.taken,
              valueColor: "text-red-600",
              note: "Days approved",
            },
            {
              title: "Total leave available",
              value: stats.available,
              valueColor: "text-green-600",
              note: `Out of ${stats.allowance} days`,
            },
            {
              title: "Leave request pending",
              value: stats.pending,
              valueColor: "text-indigo-600",
              note: "Applications",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-5 rounded-lg shadow flex flex-col gap-1"
            >
              <h4 className="text-xs text-gray-500">{item.title}</h4>
              <p className={`text-xl font-bold ${item.valueColor || ""}`}>
                {item.value}
              </p>
              <p className="text-xs text-gray-400">{item.note}</p>
            </div>
          ))}
        </div>

        {/* Announcements Table */}
        <div className="bg-white p-4 rounded shadow mb-6">
          <h3 className="font-semibold text-lg mb-4 text-gray-800">Announcements</h3>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm rounded text-left text-gray-600">
              <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Start Date</th>
                  <th className="px-4 py-3">End Date</th>
                  <th className="px-4 py-3">Description</th>
                </tr>
              </thead>
              <tbody>
                {announcementsLoading ? (
                  <tr>
                    <td className="px-4 py-3" colSpan="4">Loading announcements...</td>
                  </tr>
                ) : announcements.length === 0 ? (
                  <tr>
                    <td className="px-4 py-3" colSpan="4">No announcements available.</td>
                  </tr>
                ) : (
                announcements.map((item, idx) => (
                  <tr
                    key={item._id || idx}
                    className="border-b hover:bg-gray-50 transition duration-200"
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">{item.title}</td>
                    <td className="px-4 py-3">{item.startDate}</td>
                    <td className="px-4 py-3">{item.endDate}</td>
                    <td className="px-4 py-3">{item.description}</td>
                  </tr>
                ))) }
              </tbody>
            </table>
          </div>
        </div>

        {/* Leave History Table */}
        <div className="bg-white p-4 rounded shadow mb-6">
          <h3 className="font-semibold text-lg mb-4 text-gray-800">My Leave Requests</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm rounded text-left text-gray-600">
              <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Dates</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Reason</th>
                </tr>
              </thead>
              <tbody>
                {leaveLoading ? (
                  <tr><td colSpan="4" className="px-4 py-3">Loading...</td></tr>
                ) : leaveHistory.length === 0 ? (
                  <tr><td colSpan="4" className="px-4 py-3">No leave requests found.</td></tr>
                ) : (
                  leaveHistory.map((item) => (
                    <tr key={item._id} className="border-b hover:bg-gray-50 transition duration-200">
                      <td className="px-4 py-3 font-medium capitalize">{item.type}</td>
                      <td className="px-4 py-3 text-xs">
                        {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                          item.status === 'Approved' ? 'bg-green-100 text-green-700' :
                          item.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 truncate max-w-[150px]">{item.reason}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Attendance Chart */}
        <div className="bg-white p-4 rounded shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Attendance Statistics</h3>
            <select
              className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none"
              value={selectedRange}
              onChange={(e) => setSelectedRange(e.target.value)}
            >
              <option>This Year</option>
              <option>This Month</option>
            </select>
          </div>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={selectedRange === "This Year" ? yearData : monthData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="Attendance" fill="#7c3aed" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {showLeaveModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-md w-full rounded-xl shadow-xl p-6 relative">
            <button 
              onClick={() => setShowLeaveModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-xl font-bold"
            >
              ✕
            </button>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Apply for Leave</h2>
            <form onSubmit={handleLeaveSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                <select 
                  required 
                  value={leaveForm.type}
                  onChange={(e) => setLeaveForm({...leaveForm, type: e.target.value})}
                  className="w-full border border-gray-300 rounded p-2 focus:ring focus:ring-indigo-200 focus:outline-none"
                >
                  <option value="">Select Type</option>
                  <option value="sick">Sick Leave</option>
                  <option value="casual">Casual Leave</option>
                  <option value="annual">Annual Leave</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input 
                    type="date" 
                    required 
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm({...leaveForm, startDate: e.target.value})}
                    className="w-full border border-gray-300 rounded p-2 focus:ring focus:ring-indigo-200 focus:outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input 
                    type="date" 
                    required 
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm({...leaveForm, endDate: e.target.value})}
                    className="w-full border border-gray-300 rounded p-2 focus:ring focus:ring-indigo-200 focus:outline-none" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <textarea 
                  required 
                  rows="3" 
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({...leaveForm, reason: e.target.value})}
                  className="w-full border border-gray-300 rounded p-2 focus:ring focus:ring-indigo-200 focus:outline-none" 
                  placeholder="Explain the reason for leave..."
                ></textarea>
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white font-semibold py-2 rounded hover:bg-indigo-700 transition">
                Submit Request
              </button>
            </form>
          </div>
        </div>
      )}

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

export default Dashboard;
