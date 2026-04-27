// import React from 'react';

// import Header from '../../Components/Header'; // Adjust path if needed
// import Sidebar from '../../Components/Sidebar'; // Adjust path if needed
// import {
//     BarChart,
//     Bar,
//     XAxis,
//     YAxis,
//     Tooltip,
//     ResponsiveContainer
// } from 'recharts';
// import { Fingerprint } from 'lucide-react';

// const data = [
//     { name: 'Jan', Attendance: 24 },
//     { name: 'Feb', Attendance: 27 },
//     { name: 'Mar', Attendance: 17 },
//     { name: 'Apr', Attendance: 20 },
//     { name: 'May', Attendance: 23 },
//     { name: 'Jun', Attendance: 0 },
//     { name: 'Jul', Attendance: 0 },
//     { name: 'Aug', Attendance: 0 },
//     { name: 'Sep', Attendance: 0 },
//     { name: 'Oct', Attendance: 0 },
//     { name: 'Nov', Attendance: 0 },
//     { name: 'Dec', Attendance: 0 },
// ];

// const MainContent = () => {
//     return (
//         <div className="min-h-screen bg-gray-100 flex flex-col">
//             {/* Header at the top */}
//             <Header />

//             {/* Content below header */}
//             <div className="flex flex-1">
//                 {/* Sidebar */}
//                 <Sidebar />


//                 {/* Page Content */}
//                 <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
//                     {/* Page Title */}
//                     <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6">
//                         Attendance
//                     </h1>

//                     {/* Biometric Card */}
//                     <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 flex flex-col sm:flex-row justify-around sm:items-center gap-6 sm:gap-0 mb-6 sm:mb-8">
//                         <div className="flex justify-center">
//                             <Fingerprint size={120} className="text-purple-600 sm:size-[180px]" />
//                         </div>
//                         <div className="flex flex-col items-start sm:items-start text-center sm:text-left">
//                             <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
//                                 Give me your Biometric for today's attendance
//                             </h2>
//                             <button className="px-4 py-2 bg-white border border-gray-200 shadow-sm rounded-md text-purple-600 font-medium hover:shadow-md transition">
//                                 Let's do it &rarr;
//                             </button>
//                         </div>
//                     </div>

//                     {/* Attendance Statistics */}
//                     <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6">
//                         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
//                             <h2 className="text-md sm:text-lg font-semibold text-gray-800">
//                                 Attendance Statistics
//                             </h2>
//                             <div className="flex items-center gap-2">
//                                 <span className="text-sm text-purple-600 font-semibold">Attendance</span>
//                                 <select className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none">
//                                     <option>This Year</option>
//                                     <option>This Month</option>
//                                 </select>
//                             </div>
//                         </div>
//                         <ResponsiveContainer width="100%" height={250}>
//                             <BarChart data={data}>
//                                 <XAxis dataKey="name" />
//                                 <YAxis />
//                                 <Tooltip />
//                                 <Bar dataKey="Attendance" fill="#7c3aed" radius={[6, 6, 0, 0]} />
//                             </BarChart>
//                         </ResponsiveContainer>
//                     </div>
//                 </main>

//             </div>
//         </div>
//     );
// };

// export default MainContent;

import React, { useState, useEffect } from 'react';
import Header from '../../Components/Header';
import Sidebar from '../../Components/Sidebar';
import { useSelector } from 'react-redux';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Cell,
} from 'recharts';
import { CalendarDays, Check, Fingerprint } from 'lucide-react';
import { apiUrl } from '../../utils/api';

const MainContent = () => {
  const [showModal, setShowModal] = useState(false);
  // const [username, setUsername] = useState('');
  // const [id, setId] = useState('');
  const [toast, setToast] = useState({ message: '', type: '' });
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  const user = useSelector((state) => state.auth.user);

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 4000);
  };

  const handleAttendance = async () => {
    showToast("📍 Marking your attendance...", "loading");

    const location = { lat: 0, lng: 0 }; // Dummy location

    try {
      const res = await fetch(apiUrl("/api/mark-attendance"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user.username, location, id: user.id }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast(data.message || "✅ Attendance marked successfully.", "success");
        setShowModal(false);
      } else {
        showToast(data.message || "❌ Failed to mark attendance.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("❌ Server error. Please try again later.", "error");
    }
  };

  useEffect(() => {
    const fetchAttendanceData = async () => {
      setLoading(true);
      try {
        const res = await fetch(apiUrl(`/api/getAllAttendanceByMonthofuser/${user.id}/${selectedMonth}`));
        const attendanceRecords = await res.json();

        const presentDates = new Set(attendanceRecords.map(att => att.date));
        console.log("Present Dates:", presentDates);
        const [year, month] = selectedMonth.split("-");
        const daysInMonth = new Date(Number(year), Number(month), 0).getDate();

        const data = Array.from({ length: daysInMonth }, (_, i) => {
          const day = String(i + 1).padStart(2, '0');
          const dateKey = `${selectedMonth}-${day}`;
          return {
            name: `Day ${i + 1}`,
            dayNum: i + 1,
            Attendance: presentDates.has(dateKey) ? 1 : 0,
            fullDate: dateKey,
          };
        });

        setChartData(data);
      } catch (error) {
        console.error("Error loading chart data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) fetchAttendanceData();
  }, [selectedMonth, user?.id]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col relative">
      <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">Attendance</h1>

        {/* Biometric Card */}
        <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col sm:flex-row justify-around sm:items-center gap-6 mb-8">
          <div className="flex justify-center">
            <Fingerprint size={120} className="text-purple-600 sm:size-[180px]" />
          </div>
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
              Give me your Biometric for today's attendance
            </h2>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-white border border-gray-200 shadow-sm rounded-md text-purple-600 font-medium hover:shadow-md transition"
            >
              Let's do it &rarr;
            </button>
          </div>
        </div>

        {/* Attendance Statistics */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <h2 className="text-md sm:text-lg font-semibold text-gray-800">
              Attendance Statistics
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-purple-600 font-semibold">Month</span>
              <select
                className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                {Array.from({ length: 6 }).map((_, i) => {
                  const d = new Date();
                  d.setMonth(d.getMonth() - i);
                  const year = d.getFullYear();
                  const monthNum = String(d.getMonth() + 1).padStart(2, '0');
                  const monthName = d.toLocaleString('default', { month: 'long' });
                  return (
                    <option key={`${year}-${monthNum}`} value={`${year}-${monthNum}`}>
                      {monthName} {year}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {loading ? (
            <p className="text-center text-gray-500">Loading calendar...</p>
          ) : (
            <div className="w-full mt-4">
              <div className="grid grid-cols-7 gap-1 text-center font-semibold text-gray-600 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1 md:gap-2">
                {selectedMonth && Array.from({ length: new Date(selectedMonth.split('-')[0], selectedMonth.split('-')[1] - 1, 1).getDay() }).map((_, i) => (
                  <div key={`empty-${i}`} className="p-2 md:p-4 rounded-md bg-transparent"></div>
                ))}
                {chartData.map((entry) => (
                  <div
                    key={entry.fullDate}
                    className={`flex flex-col items-center justify-center p-2 md:p-4 rounded-md shadow-sm border ${
                      entry.Attendance === 1 ? 'bg-green-100 border-green-300' : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <span className="text-sm font-medium text-gray-700">{entry.dayNum}</span>
                    <span className={`text-xs mt-1 font-bold ${entry.Attendance === 1 ? 'text-green-600' : 'text-red-500'}`}>
                      {entry.Attendance === 1 ? 'Present' : 'Absent'}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex gap-4 mt-4 justify-end text-sm">
                 <div className="flex items-center gap-1"><span className="w-3 h-3 bg-green-100 border border-green-300 inline-block"></span> Present</div>
                 <div className="flex items-center gap-1"><span className="w-3 h-3 bg-red-50 border border-red-200 inline-block"></span> Absent</div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 w-96 rounded-xl shadow-lg text-center space-y-4 relative">
            <div className="flex justify-center">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-800">
                <CalendarDays className="w-5 h-5 text-indigo-600" />
                Mark Your Attendance
              </h2>
            </div>

            <p className="text-gray-600 mb-4">You are marking attendance as <strong>{user.username}</strong>.</p>
            <div className="flex justify-center">
              <button
                onClick={handleAttendance}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                <Check className="w-5 h-5" />
                Mark Attendance
              </button>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-xl"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.message && (
        <div className={`fixed top-6 right-3 px-4 py-3 rounded-md shadow-lg text-white z-50
          ${toast.type === 'success' ? 'bg-green-500' :
            toast.type === 'error' ? 'bg-red-500' : 'bg-yellow-500'}`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default MainContent;
