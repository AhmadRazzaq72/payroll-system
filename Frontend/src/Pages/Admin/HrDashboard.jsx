import React, { useEffect, useState } from "react";
import { apiUrl } from "../../utils/api";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  UserCheck, 
  UserX, 
  Bell, 
  Calendar, 
  ArrowUpRight, 
  Clock, 
  Plus, 
  FileText,
  TrendingUp,
  Briefcase
} from "lucide-react";

const Dashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await fetch(apiUrl("/api/all-attendance"));
        const data = await response.json();
        setEmployees(data.attendance || []);
      } catch (error) {
        console.error("❌ Error fetching attendance data:", error);
      }
    };

    const fetchAllEmployees = async () => {
      try {
        const response = await fetch(apiUrl("/api/all"));
        const data = await response.json();
        setTotalEmployees(data.users?.length || 0);
      } catch (error) {
        console.error("❌ Error fetching employees:", error);
      }
    };

    fetchAttendance();
    fetchAllEmployees();
  }, []);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch(apiUrl("/api/announcements"));
        const data = await response.json();
        if (response.ok) {
          setAnnouncements(data.announcements || []);
        }
      } catch (error) {
        console.error("❌ Error fetching announcements:", error);
      }
    };
    fetchAnnouncements();
  }, []);

  const tenDaysAgo = new Date();
  tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
  const recentAnnouncements = announcements.filter((item) => {
    const createdAt = new Date(item.createdAt || item.startDate);
    return createdAt >= tenDaysAgo;
  });

  const getStatusColor = (status) => {
    if (!status) return "bg-gray-100 text-gray-600";
    const s = status.toLowerCase();
    if (s.includes("present")) return "bg-emerald-50 text-emerald-600 border border-emerald-100";
    if (s.includes("late")) return "bg-amber-50 text-amber-600 border border-amber-100";
    if (s.includes("absent")) return "bg-rose-50 text-rose-600 border border-rose-100";
    return "bg-gray-50 text-gray-600 border border-gray-100";
  };

  const stats = [
    {
      title: "Total Force",
      value: totalEmployees,
      icon: <Users className="w-6 h-6 text-indigo-600" />,
      bg: "bg-indigo-50",
  
    },
    {
      title: "Present Today",
      value: employees.filter((e) => e.status?.toLowerCase().includes("present")).length,
      icon: <UserCheck className="w-6 h-6 text-emerald-600" />,
      bg: "bg-emerald-50",
    },
    {
      title: "Late/Absent",
      value: employees.filter((e) => e.status?.toLowerCase().includes("late") || e.status?.toLowerCase().includes("absent")).length,
      icon: <UserX className="w-6 h-6 text-rose-600" />,
      bg: "bg-rose-50",
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 p-4 md:p-8 space-y-8 w-full max-w-[1600px] mx-auto">
        
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">HR Command Center</h1>
            <p className="text-gray-500 mt-1 flex items-center gap-2">
              <Clock className="w-4 h-4" /> 
              Overview for {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => navigate('/hraddemployee')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-100 transition flex items-center gap-2 font-semibold"
            >
              <Plus className="w-5 h-5" />
              New Hire
            </button>
            <button 
              onClick={() => navigate('/hrannouncements')}
              className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-5 py-2.5 rounded-xl transition flex items-center gap-2 font-semibold"
            >
              <Bell className="w-5 h-5 text-gray-400" />
              Broadcast
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition group">
              <div className="flex justify-between items-start">
                <div className={`p-3 rounded-2xl ${stat.bg} group-hover:scale-110 transition`}>
                  {stat.icon}
                </div>
              
              </div>
              <div className="mt-4">
                <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">{stat.title}</p>
                <p className="text-4xl font-black text-gray-900 mt-1">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Attendance Table */}
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-indigo-600" />
                  Live Attendance Feed
                </h2>
                <span className="text-xs font-bold text-gray-400 uppercase">Real-time Data</span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50 text-gray-500 text-xs font-bold uppercase tracking-widest border-b border-gray-100">
                      <th className="px-8 py-4">Employee Details</th>
                      <th className="px-8 py-4 text-center">Date</th>
                      <th className="px-8 py-4 text-center">Check-In</th>
                      <th className="px-8 py-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {employees.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-8 py-12 text-center text-gray-400 italic">No attendance data recorded yet today</td>
                      </tr>
                    ) : (
                      employees.slice(0, 8).map((emp, idx) => (
                        <tr key={idx} className="hover:bg-indigo-50/30 transition group">
                          <td className="px-8 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700">
                                {emp.username?.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900">{emp.username}</p>
                                <p className="text-xs text-gray-400 font-medium">{emp.user_id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-4 text-center text-sm font-semibold text-gray-600">
                            {new Date(emp.date).toLocaleDateString()}
                          </td>
                          <td className="px-8 py-4 text-center">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-lg text-xs font-bold text-gray-600">
                              <Clock className="w-3 h-3" />
                              {new Date(emp.time).toLocaleTimeString("en-US", {
                                timeZone: "UTC",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              })}
                            </div>
                          </td>
                          <td className="px-8 py-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(emp.status)}`}>
                              {emp.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="p-4 border-t border-gray-50 bg-gray-50/20 text-center">
                <button className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition">View All Log History &rarr;</button>
              </div>
            </div>
          </div>

          {/* Side Panel: Announcements & Insights */}
          <div className="space-y-6">
            {/* Announcements Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-500" />
                  Recent Announcements
                </h2>
                <button onClick={() => navigate('/hrannouncements')} className="p-2 hover:bg-gray-100 rounded-xl transition">
                  <ArrowUpRight className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                {recentAnnouncements.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Bell className="w-6 h-6 text-gray-300" />
                    </div>
                    <p className="text-sm text-gray-400">All caught up! No recent broadcasts.</p>
                  </div>
                ) : (
                  recentAnnouncements.slice(0, 3).map((item) => (
                    <div key={item._id} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-indigo-200 transition group cursor-pointer">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-gray-900 group-hover:text-indigo-600 transition">{item.title}</h4>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{item.startDate}</span>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{item.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

     

            {/* Quick Actions List */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Command Shortcuts</h2>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => navigate('/hrleave-management')}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 transition group border border-transparent hover:border-indigo-100"
                >
                  <FileText className="w-6 h-6 text-gray-400 group-hover:text-indigo-600" />
                  <span className="text-xs font-bold">Leave Requests</span>
                </button>
                <button 
                  onClick={() => navigate('/hrpayrollsystem')}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gray-50 hover:bg-emerald-50 hover:text-emerald-600 transition group border border-transparent hover:border-emerald-100"
                >
                  <Briefcase className="w-6 h-6 text-gray-400 group-hover:text-emerald-600" />
                  <span className="text-xs font-bold">Payroll Mgmt</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
