import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  Fingerprint, 
  Check, 
  CalendarDays, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  Info,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  MousePointer2
} from 'lucide-react';
import { apiUrl } from '../../utils/api';

const AttendancePage = () => {
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ present: 0, absent: 0, late: 0 });

  const user = useSelector((state) => state.auth.user);

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 4000);
  };

  const handleAttendance = async () => {
    showToast("📍 Syncing with secure server...", "loading");
    const location = { lat: 0, lng: 0 }; 

    try {
      const res = await fetch(apiUrl("/api/mark-attendance"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user.username, location, id: user.id }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(data.message || "✅ Attendance verified successfully.", "success");
        setShowModal(false);
        fetchAttendanceData(); // Refresh after marking
      } else {
        showToast(data.message || "❌ Verification failed.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("❌ Connection error. Please try again.", "error");
    }
  };

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl(`/api/getAllAttendanceByMonthofuser/${user.id}/${selectedMonth}`));
      const attendanceRecords = await res.json();

      const presentMap = {};
      let pCount = 0;
      let lCount = 0;
      
      attendanceRecords.forEach(att => {
        presentMap[att.date] = att.status;
        if (att.status?.toLowerCase().includes('present')) pCount++;
        if (att.status?.toLowerCase().includes('late')) lCount++;
      });

      const [year, month] = selectedMonth.split("-");
      const daysInMonth = new Date(Number(year), Number(month), 0).getDate();

      const data = Array.from({ length: daysInMonth }, (_, i) => {
        const day = String(i + 1).padStart(2, '0');
        const dateKey = `${selectedMonth}-${day}`;
        return {
          dayNum: i + 1,
          status: presentMap[dateKey] || 'Absent',
          fullDate: dateKey,
        };
      });

      setChartData(data);
      setStats({
        present: pCount,
        late: lCount,
        absent: daysInMonth - (pCount + lCount)
      });
    } catch (error) {
      console.error("Error loading attendance history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchAttendanceData();
  }, [selectedMonth, user?.id]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 p-4 md:p-8 space-y-8 w-full max-w-[1600px] mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Attendance Record</h1>
            <p className="text-gray-500 mt-1 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" /> 
              Manage your daily presence and track consistency
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
            <button 
              onClick={() => {
                const [y, m] = selectedMonth.split('-').map(Number);
                const prev = new Date(y, m - 2);
                setSelectedMonth(`${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`);
              }}
              className="p-2 hover:bg-gray-50 rounded-xl transition"
            >
              <ChevronLeft className="w-5 h-5 text-gray-400" />
            </button>
            <span className="font-bold text-gray-700 min-w-[140px] text-center">
              {new Date(selectedMonth + "-01").toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
            <button 
              onClick={() => {
                const [y, m] = selectedMonth.split('-').map(Number);
                const next = new Date(y, m);
                setSelectedMonth(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`);
              }}
              className="p-2 hover:bg-gray-50 rounded-xl transition"
            >
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Attendance Calendar */}
          <div className="xl:col-span-2 space-y-8">
            
            {/* Biometric Action Card */}
            <div className="relative overflow-hidden bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-12">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-2xl animate-pulse"></div>
                <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-full bg-indigo-50 border-4 border-white shadow-xl flex items-center justify-center group cursor-pointer overflow-hidden">
                  <Fingerprint size={80} className="text-indigo-600 group-hover:scale-110 transition duration-500" />
                  <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/10 transition duration-500"></div>
                </div>
              </div>
              
              <div className="flex-1 text-center md:text-left space-y-4">
                <h2 className="text-2xl font-black text-gray-900 leading-tight">
                  Daily Verification Required
                </h2>
                <p className="text-gray-500 font-medium max-w-sm">
                  Please provide your biometric signature to securely log your presence for today.
                </p>
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:scale-[1.02] active:scale-100 transition flex items-center gap-3 mx-auto md:mx-0"
                >
                  <MousePointer2 className="w-5 h-5" />
                  Authenticate Now
                </button>
              </div>
              
              <div className="absolute -right-12 -top-12 w-48 h-48 bg-indigo-50 rounded-full opacity-50 blur-3xl"></div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-gray-800">Attendance Log</h3>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Present</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Late</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Absent</span>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="h-[400px] flex items-center justify-center text-gray-400 font-medium italic">
                  Syncing logs...
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-3 md:gap-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-xs font-black text-gray-300 uppercase tracking-widest mb-4">
                      {day}
                    </div>
                  ))}
                  
                  {/* Empty slots for month start */}
                  {Array.from({ length: new Date(selectedMonth.split('-')[0], selectedMonth.split('-')[1] - 1, 1).getDay() }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square rounded-2xl bg-gray-50/30"></div>
                  ))}
                  
                  {chartData.map((entry) => {
                    const isToday = entry.fullDate === new Date().toISOString().split('T')[0];
                    const status = entry.status.toLowerCase();
                    const colors = 
                      status.includes('present') ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      status.includes('late') ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      'bg-rose-50 text-rose-600 border-rose-100';

                    return (
                      <div
                        key={entry.fullDate}
                        className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center transition hover:scale-105 cursor-default relative overflow-hidden group ${colors} ${isToday ? 'ring-2 ring-indigo-600 ring-offset-2' : ''}`}
                      >
                        <span className="text-sm md:text-base font-black">{entry.dayNum}</span>
                        <span className="text-[8px] md:text-[10px] font-black uppercase tracking-tighter opacity-80">
                          {entry.status}
                        </span>
                        {isToday && (
                          <div className="absolute top-1 right-1 w-2 h-2 bg-indigo-600 rounded-full"></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Stats & Info */}
          <div className="space-y-8">
            {/* Monthly Summary Cards */}
            <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm space-y-8">
              <h3 className="text-lg font-bold text-gray-800">Monthly Performance</h3>
              
              <div className="space-y-6">
                {[
                  { label: "Total Present", value: stats.present, color: "text-emerald-600", bg: "bg-emerald-50", icon: <CheckCircle2 /> },
                  { label: "Late Entries", value: stats.late, color: "text-amber-600", bg: "bg-amber-50", icon: <Clock /> },
                  { label: "Total Absent", value: stats.absent, color: "text-rose-600", bg: "bg-rose-50", icon: <AlertCircle /> }
                ].map((stat, i) => (
                  <div key={i} className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition`}>
                        {React.cloneElement(stat.icon, { size: 20 })}
                      </div>
                      <span className="text-sm font-bold text-gray-500">{stat.label}</span>
                    </div>
                    <span className={`text-xl font-black ${stat.color}`}>{stat.value}</span>
                  </div>
                ))}
              </div>
              
              <div className="pt-6 border-t border-gray-50">
                <div className="bg-indigo-900 rounded-2xl p-6 text-white relative overflow-hidden">
                  <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-2">Consistency Score</p>
                  <p className="text-3xl font-black mb-1">{Math.round((stats.present / (stats.present + stats.absent + stats.late || 1)) * 100)}%</p>
                  <p className="text-xs text-indigo-300 font-medium">Keep it above 95% for bonuses!</p>
                  <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/5 rounded-full blur-2xl"></div>
                </div>
              </div>
            </div>

            {/* Quick Tips/Policy */}
            <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-6">
                <Info className="w-5 h-5 text-indigo-600" />
                Attendance Policy
              </h3>
              <ul className="space-y-4">
                {[
                  "Official check-in time is 09:00 AM.",
                  "Grace period of 15 minutes is allowed.",
                  "3 late entries count as 1 half-day leave.",
                ].map((tip, i) => (
                  <li key={i} className="flex gap-3 text-xs font-medium text-gray-500 leading-relaxed">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-200 mt-1.5 shrink-0"></div>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Modern Authentication Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-indigo-950/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white max-sm w-half rounded-[2.5rem] shadow-2xl p-8 relative animate-in fade-in zoom-in duration-300">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition text-gray-400 hover:text-rose-500"
            >
              <X size={20} />
            </button>
            
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-indigo-50 rounded-3xl mx-auto flex items-center justify-center">
                <Fingerprint size={40} className="text-indigo-600" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-gray-900">Secure Check-In</h2>
                <p className="text-sm text-gray-500 font-medium leading-relaxed">
                  Hi <span className="text-indigo-600 font-bold">{user.username}</span>, please confirm to mark your attendance for today.
                </p>
              </div>

              <button
                onClick={handleAttendance}
                className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all hover:scale-[1.02] active:scale-100 flex items-center justify-center gap-2"
              >
                <Check size={20} />
                Verify Identity
              </button>
              
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                Protected by Biometric Encryption
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modern Toast Notification */}
      {toast.message && (
        <div className={`fixed bottom-8 right-8 z-[9999] px-8 py-4 rounded-[1.5rem] shadow-2xl text-white font-black tracking-tight transition-all duration-500 animate-in slide-in-from-bottom-full ${
          toast.type === 'success' ? 'bg-emerald-500 shadow-emerald-100' : 
          toast.type === 'error' ? 'bg-rose-500 shadow-rose-100' : 'bg-indigo-600 shadow-indigo-100'
        }`}>
          <div className="flex items-center gap-3">
            {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : 
             toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <Clock className="w-5 h-5 animate-spin" />}
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendancePage;
