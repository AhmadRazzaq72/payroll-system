import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Users,
  DollarSign,
  Calendar,
  Settings,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  ArrowRight,
  TrendingUp,
  Briefcase,
  Bell,
  ChevronRight
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setAttendanceStatus } from "../../Redux/Slice.jsx";
import { apiUrl } from "../../utils/api";

const Dashboard = () => {
  const [userId, setUserId] = useState("");
  const [setStatus] = useState(null);
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

  const user = useSelector((state) => state.auth.user);
  const attendanceStatus = useSelector((state) => state.auth.status);

  useEffect(() => {
    if (user?.id) {
      setUserId(user.id);
    }
  }, [user]);

  useEffect(() => {
    if (!userId) return;
    const fetchTodayStatus = async () => {
      try {
        const res = await axios.get(apiUrl(`/api/attendance/${userId}`));
        dispatch(setAttendanceStatus(res.data.status));
      } catch (err) {
        console.error("Error fetching today's attendance", err);
      }
    };
    fetchTodayStatus();
  }, [userId, dispatch]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setAnnouncementsLoading(true);
        const res = await fetch(apiUrl("/api/announcements"));
        const data = await res.json();
        if (res.ok) setAnnouncements(data.announcements || []);
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
      const historyRes = await axios.get(apiUrl(`/api/leaves/employee/${userId}`));
      setLeaveHistory(historyRes.data);
    } catch (err) {
      console.error("Error submitting leave:", err);
      showToast("Failed to submit leave request", "error");
    }
  };

  const stats = (() => {
    let taken = 0;
    let pending = 0;
    leaveHistory.forEach(leave => {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      if (leave.status === 'Approved') taken += days;
      else if (leave.status === 'Pending') pending += 1;
    });
    const allowance = user?.leaveAllowance || 30;
    return { taken, pending, available: Math.max(0, allowance - taken), allowance };
  })();

  const yearData = [
    { name: "Jan", Attendance: 24 }, { name: "Feb", Attendance: 22 },
    { name: "Mar", Attendance: 18 }, { name: "Apr", Attendance: 27 },
    { name: "May", Attendance: 30 }, { name: "Jun", Attendance: 25 },
    { name: "Jul", Attendance: 29 }, { name: "Aug", Attendance: 24 },
    { name: "Sep", Attendance: 26 }, { name: "Oct", Attendance: 28 },
    { name: "Nov", Attendance: 23 }, { name: "Dec", Attendance: 21 },
  ];

  const getStatusDisplay = () => {
    const s = attendanceStatus || "Absent";
    const colors = {
      "Present": "bg-emerald-50 text-emerald-600 border-emerald-100",
      "Late": "bg-amber-50 text-amber-600 border-amber-100",
      "Late Absent": "bg-rose-50 text-rose-600 border-rose-100",
      "Absent": "bg-rose-50 text-rose-600 border-rose-100"
    };
    return {
      text: s,
      className: colors[s] || colors["Absent"]
    };
  };

  const statusInfo = getStatusDisplay();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 p-4 md:p-8 space-y-8 w-full max-w-[1600px] mx-auto">
        
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-indigo-900 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl shadow-indigo-200">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left space-y-4">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight">
                Welcome back, <span className="text-indigo-300">{user?.username}</span>!
              </h1>
              <p className="text-indigo-100 text-lg max-w-md font-medium opacity-90">
                You've completed 85% of your goals this week. Keep up the great momentum!
              </p>
              <div className="flex flex-wrap gap-4 pt-2 justify-center md:justify-start">
                <button 
                  onClick={() => navigate('/emattendance')}
                  className="bg-white text-indigo-900 px-8 py-3.5 rounded-2xl font-bold hover:bg-indigo-50 transition shadow-lg flex items-center gap-2 group"
                >
                  <Clock className="w-5 h-5" />
                  Clock In / Buddy Punching
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </button>
                <button 
                  onClick={() => setShowLeaveModal(true)}
                  className="bg-indigo-800 text-white border border-indigo-700 px-8 py-3.5 rounded-2xl font-bold hover:bg-indigo-700 transition"
                >
                  Request Leave
                </button>
              </div>
            </div>
            
            {/* Status Card Overlay */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 w-full max-w-[300px]">
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-black uppercase tracking-widest opacity-60 text-indigo-200">Today's Status</span>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black border ${statusInfo.className} bg-white shadow-sm`}>
                  {statusInfo.text}
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">9:02 AM</p>
                    <p className="text-[10px] opacity-60">Arrival Time</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-indigo-300" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">On Track</p>
                    <p className="text-[10px] opacity-60">Performance</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500 rounded-full blur-[120px] opacity-20"></div>
          <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-indigo-400 rounded-full blur-[120px] opacity-20"></div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: "Leave Balance",
              value: stats.available,
              icon: <Briefcase className="text-emerald-600" />,
              bg: "bg-emerald-50",
              note: `Available out of ${stats.allowance} days`,
              color: "text-emerald-600"
            },
            {
              title: "Leaves Taken",
              value: stats.taken,
              icon: <Calendar className="text-rose-600" />,
              bg: "bg-rose-50",
              note: "Total approved days this year",
              color: "text-rose-600"
            },
            {
              title: "Pending Requests",
              value: stats.pending,
              icon: <AlertCircle className="text-amber-600" />,
              bg: "bg-amber-50",
              note: "Applications awaiting review",
              color: "text-amber-600"
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-2xl ${item.bg}`}>
                  {React.cloneElement(item.icon, { size: 24 })}
                </div>
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">{item.title}</h4>
              </div>
              <div>
                <p className={`text-4xl font-black ${item.color}`}>{item.value}</p>
                <p className="text-xs text-gray-500 mt-2 font-medium">{item.note}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Announcements & Activity */}
          <div className="xl:col-span-2 space-y-8">
            {/* Announcements */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-indigo-600" />
                  Recent Broadcasts
                </h2>
                <button className="text-xs font-bold text-indigo-600 hover:underline">View All</button>
              </div>
              <div className="p-2">
                {announcementsLoading ? (
                  <div className="p-8 text-center text-gray-400">Loading broadcasts...</div>
                ) : announcements.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">No recent announcements</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {announcements.slice(0, 4).map((item, idx) => (
                      <div key={idx} className="p-6 rounded-2xl hover:bg-gray-50 transition border border-transparent hover:border-gray-100 cursor-pointer group">
                        <div className="flex justify-between items-start mb-3">
                          <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded text-[10px] font-black uppercase tracking-tighter">
                            {item.startDate}
                          </span>
                        </div>
                        <h4 className="font-bold text-gray-900 group-hover:text-indigo-600 transition mb-2">{item.title}</h4>
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{item.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Attendance Chart */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Attendance Trends</h3>
                  <p className="text-sm text-gray-500 font-medium mt-1">Your presence summary for 2026</p>
                </div>
                <select
                  className="bg-gray-50 border-none rounded-xl px-4 py-2 text-sm font-bold text-gray-600 focus:ring-2 focus:ring-indigo-100"
                  value={selectedRange}
                  onChange={(e) => setSelectedRange(e.target.value)}
                >
                  <option>This Year</option>
                  <option>This Month</option>
                </select>
              </div>

              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={selectedRange === "This Year" ? yearData : yearData.slice(0, 31)}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 600 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 600 }}
                    />
                    <Tooltip 
                      cursor={{ fill: '#f5f3ff' }}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                    />
                    <Bar 
                      dataKey="Attendance" 
                      fill="#6366f1" 
                      radius={[6, 6, 6, 6]} 
                      barSize={selectedRange === "This Year" ? 30 : 15}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Sidebar: History & Quick Links */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-6 px-2">Quick Navigation</h2>
              <div className="space-y-2">
                {[
                  { label: "My Profile", icon: <User />, path: `/emprofile/${user?.id}`, color: "text-blue-500" },
                  { label: "Salary Slips", icon: <DollarSign />, path: "/emsalary", color: "text-emerald-500" },
                  { label: "Company Calendar", icon: <Calendar />, path: "/emcalendar", color: "text-amber-500" },
                  { label: "System Settings", icon: <Settings />, path: "/settings", color: "text-gray-500" }
                ].map((link, idx) => (
                  <button
                    key={idx}
                    onClick={() => navigate(link.path)}
                    className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2.5 rounded-xl bg-white shadow-sm border border-gray-100 group-hover:scale-110 transition ${link.color}`}>
                        {React.cloneElement(link.icon, { size: 20 })}
                      </div>
                      <span className="text-sm font-bold text-gray-700">{link.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-600 transition group-hover:translate-x-1" />
                  </button>
                ))}
              </div>
            </div>

            {/* Leave History Condensed */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
              <h3 className="text-lg font-bold text-gray-800 mb-6">Recent Leave History</h3>
              <div className="space-y-6">
                {leaveLoading ? (
                  <p className="text-sm text-gray-400">Loading history...</p>
                ) : leaveHistory.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">No history found</p>
                ) : (
                  leaveHistory.slice(0, 5).map((item) => (
                    <div key={item._id} className="flex justify-between items-start group cursor-default">
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-gray-900 capitalize">{item.type} Leave</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                          {new Date(item.startDate).toLocaleDateString()} &bull; {Math.ceil((new Date(item.endDate) - new Date(item.startDate)) / (1000 * 60 * 60 * 24)) + 1} Days
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                        item.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        item.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                        'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
              <button 
                onClick={() => navigate('/emsalary')} // Or wherever detailed leave is
                className="w-full mt-8 py-3 rounded-2xl border border-gray-100 text-xs font-bold text-gray-500 hover:bg-gray-50 transition"
              >
                View Complete History
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Leave Modal Redesign */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-indigo-950/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-md w-full rounded-[2.5rem] shadow-2xl p-8 relative animate-in fade-in zoom-in duration-300">
            <button 
              onClick={() => setShowLeaveModal(false)}
              className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition text-gray-400 hover:text-rose-500"
            >
              ✕
            </button>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Request Time Off</h2>
            <p className="text-sm text-gray-500 mb-8 font-medium">Complete the form below to submit your request.</p>
            
            <form onSubmit={handleLeaveSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Leave Category</label>
                <select 
                  required 
                  value={leaveForm.type}
                  onChange={(e) => setLeaveForm({...leaveForm, type: e.target.value})}
                  className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold text-gray-700 focus:ring-2 focus:ring-indigo-100 transition"
                >
                  <option value="">Choose a type</option>
                  <option value="sick">Medical / Sick Leave</option>
                  <option value="casual">Personal / Casual Leave</option>
                  <option value="annual">Vacation / Annual Leave</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">Start Date</label>
                  <input 
                    type="date" 
                    required 
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm({...leaveForm, startDate: e.target.value})}
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold text-gray-700 focus:ring-2 focus:ring-indigo-100 transition" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">End Date</label>
                  <input 
                    type="date" 
                    required 
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm({...leaveForm, endDate: e.target.value})}
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold text-gray-700 focus:ring-2 focus:ring-indigo-100 transition" 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Reason for Request</label>
                <textarea 
                  required 
                  rows="3" 
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({...leaveForm, reason: e.target.value})}
                  className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold text-gray-700 focus:ring-2 focus:ring-indigo-100 transition resize-none" 
                  placeholder="Tell us a bit more..."
                ></textarea>
              </div>
              
              <button type="submit" className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all hover:scale-[1.02] active:scale-100">
                Submit Application
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modern Toast */}
      {toast.message && (
        <div className={`fixed bottom-8 right-8 z-[9999] px-8 py-4 rounded-[1.5rem] shadow-2xl text-white font-black tracking-tight transition-all duration-500 animate-in slide-in-from-bottom-full ${
          toast.type === 'success' ? 'bg-emerald-500 shadow-emerald-100' : 'bg-rose-500 shadow-rose-100'
        }`}>
          <div className="flex items-center gap-3">
            {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
