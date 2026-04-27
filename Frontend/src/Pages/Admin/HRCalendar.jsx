import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react';
import dayjs from 'dayjs';
import { apiUrl } from '../../utils/api';

const HRCalendar = () => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [holidays, setHolidays] = useState({});
  const [formData, setFormData] = useState({ dd: '', mm: '', yy: '', reason: '' });
  const [toast, setToast] = useState({ message: '', type: '' });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 3000);
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = () => {
    fetch(apiUrl("/api/holidays"))
      .then(res => res.json())
      .then(data => {
        const holidayMap = {};
        if (Array.isArray(data)) {
          data.forEach(holiday => {
            holidayMap[holiday.date] = holiday.reason;
          });
        }
        setHolidays(holidayMap);
      })
      .catch(err => console.error("Error loading holidays:", err));
  };

  const startOfMonth = currentDate.startOf('month');
  const daysInMonth = currentDate.daysInMonth();
  
  // Adjust startDay to align with Monday as first day (0=Mon, 6=Sun)
  // dayjs: 0=Sun, 1=Mon...
  const rawStartDay = startOfMonth.day(); 
  const startDayOffset = rawStartDay === 0 ? 6 : rawStartDay - 1;

  const prevMonth = () => setCurrentDate(currentDate.subtract(1, 'month'));
  const nextMonth = () => setCurrentDate(currentDate.add(1, 'month'));

  const days = [];
  for (let i = 0; i < startDayOffset; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddHoliday = async () => {
    const { dd, mm, yy, reason } = formData;
    if (!dd || !mm || !yy || !reason) return showToast("All fields are required", "error");
    
    const day = parseInt(dd);
    const month = parseInt(mm);
    const year = parseInt(yy);

    if (isNaN(day) || day < 1 || day > 31) return showToast("Invalid Day (1-31)", "error");
    if (isNaN(month) || month < 1 || month > 12) return showToast("Invalid Month (1-12)", "error");
    if (isNaN(year) || year < 2000) return showToast("Invalid Year", "error");

    const formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    try {
      const res = await fetch(apiUrl("/api/holidays/add"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: formattedDate, reason })
      });
      const result = await res.json();
      if (res.ok) {
        setHolidays(prev => ({ ...prev, [formattedDate]: reason }));
        setFormData({ dd: '', mm: '', yy: '', reason: '' });
        showToast("Holiday added successfully");
      } else {
        showToast(result.message || "Failed to add holiday", "error");
      }
    } catch (error) {
      console.error("Error adding holiday:", error);
      showToast("Error adding holiday", "error");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <CalendarIcon className="text-indigo-600" />
            Holiday Calendar
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar View */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-700">{currentDate.format('MMMM YYYY')}</h2>
              <div className="flex gap-2">
                <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full transition">
                  <ChevronLeft size={20} className="text-gray-600" />
                </button>
                <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full transition">
                  <ChevronRight size={20} className="text-gray-600" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 mb-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-px bg-gray-100 border border-gray-100 rounded-lg overflow-hidden">
              {days.map((day, idx) => {
                if (!day) return <div key={idx} className="bg-gray-50 h-24"></div>;
                
                const fullDate = currentDate.date(day).format('YYYY-MM-DD');
                const holidayReason = holidays[fullDate];
                const isToday = dayjs().format('YYYY-MM-DD') === fullDate;
                const isSunday = currentDate.date(day).day() === 0;

                return (
                  <div key={idx} className={`bg-white h-24 p-2 relative group transition hover:bg-indigo-50/30 ${isToday ? 'bg-indigo-50/50' : ''}`}>
                    <span className={`text-sm font-medium ${isToday ? 'text-indigo-600 font-bold underline' : 'text-gray-600'} ${isSunday ? 'text-red-500' : ''}`}>
                      {day}
                    </span>
                    {holidayReason && (
                      <div className="mt-1">
                        <div className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded leading-tight font-medium line-clamp-2" title={holidayReason}>
                          {holidayReason}
                        </div>
                      </div>
                    )}
                    {isSunday && !holidayReason && (
                      <div className="mt-1">
                        <div className="text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded leading-tight">
                          Weekend
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add Holiday Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Plus size={18} className="text-indigo-600" />
                Add Holiday
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Day</label>
                    <input
                      type="text"
                      name="dd"
                      value={formData.dd}
                      onChange={handleInputChange}
                      placeholder="DD"
                      className="w-full border border-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Month</label>
                    <input
                      type="text"
                      name="mm"
                      value={formData.mm}
                      onChange={handleInputChange}
                      placeholder="MM"
                      className="w-full border border-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Year</label>
                    <input
                      type="text"
                      name="yy"
                      value={formData.yy}
                      onChange={handleInputChange}
                      placeholder="YYYY"
                      className="w-full border border-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Description</label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    placeholder="Holiday reason..."
                    rows="3"
                    className="w-full border border-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition resize-none"
                  />
                </div>
                <button
                  onClick={handleAddHoliday}
                  className="w-full bg-indigo-600 text-white font-semibold py-2.5 rounded-lg hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all active:scale-95"
                >
                  Set Holiday
                </button>
              </div>
            </div>

            {/* Upcoming Section */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Quick Tip</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Holidays added here will be visible to all employees on their dashboard calendars. 
              </p>
            </div>
          </div>
        </div>
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

export default HRCalendar;
