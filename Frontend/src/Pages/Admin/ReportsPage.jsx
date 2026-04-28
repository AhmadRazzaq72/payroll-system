import React, { useState, useEffect } from "react";
import { apiUrl } from "../../utils/api";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid 
} from "recharts";
import { Download, Calendar, ArrowUpCircle, ArrowDownCircle, Wallet, Percent } from "lucide-react";

const ReportsPage = () => {
  const [reportData, setReportData] = useState(null);
  const [monthlySummaries, setMonthlySummaries] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0]
  });

  const fetchReport = async () => {
    try {
      const res = await fetch(apiUrl(`/api/finance/reports/financial?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`));
      const data = await res.json();
      setReportData(data);
    } catch (err) {
      console.error("Error fetching financial report:", err);
    }
  };

  const fetchMonthlySummaries = async () => {
    try {
      // Fetch for last 6 months
      const summaries = [];
      for (let i = 0; i < 6; i++) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthStr = d.toISOString().slice(0, 7);
        const res = await fetch(apiUrl(`/api/finance/reports/monthly?month=${monthStr}`));
        const data = await res.json();
        summaries.push(data);
      }
      setMonthlySummaries(summaries.reverse());
    } catch (err) {
      console.error("Error fetching monthly summaries:", err);
    }
  };

  useEffect(() => {
    fetchReport();
    fetchMonthlySummaries();
  }, [dateRange]);

  if (!reportData) return <div className="p-8 text-center text-gray-500">Loading reports...</div>;

  const COLORS = ["#10b981", "#ef4444", "#f59e0b"];
  const pieData = [
    { name: "Income", value: reportData.totalIncome },
    { name: "Other Expenses", value: reportData.otherExpense },
    { name: "Salary Expense", value: reportData.salaryExpense },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="w-full">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
            <p className="text-gray-500">Analyze your organization's financial health</p>
          </div>
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
            <Calendar className="w-5 h-5 text-gray-400 ml-2" />
            <input 
              type="date" 
              value={dateRange.startDate} 
              onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
              className="border-none focus:ring-0 text-sm font-medium outline-none"
            />
            <span className="text-gray-300">to</span>
            <input 
              type="date" 
              value={dateRange.endDate} 
              onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
              className="border-none focus:ring-0 text-sm font-medium outline-none mr-2"
            />
          </div>
        </div>

        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-green-50 rounded-2xl text-green-600"><ArrowUpCircle className="w-6 h-6" /></div>
              <p className="text-sm font-bold text-gray-500">Total Income</p>
            </div>
            <p className="text-2xl font-black text-gray-900">${reportData.totalIncome.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-50 rounded-2xl text-red-600"><ArrowDownCircle className="w-6 h-6" /></div>
              <p className="text-sm font-bold text-gray-500">Total Expenses</p>
            </div>
            <p className="text-2xl font-black text-gray-900">${reportData.totalExpense.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600"><Wallet className="w-6 h-6" /></div>
              <p className="text-sm font-bold text-gray-500">Salary Expenses</p>
            </div>
            <p className="text-2xl font-black text-gray-900">${reportData.salaryExpense.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-yellow-50 rounded-2xl text-yellow-600"><Percent className="w-6 h-6" /></div>
              <p className="text-sm font-bold text-gray-500">Net Profit/Loss</p>
            </div>
            <p className={`text-2xl font-black ${reportData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${reportData.netProfit.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Income vs Expense Distribution</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Monthly Financial Trend</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlySummaries}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                  <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                  <Legend />
                  <Bar dataKey="totalIncome" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="totalExpense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Summary Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-100">
            <h3 className="text-xl font-bold text-gray-900">Historical Monthly Summary</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-8 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Month</th>
                  <th className="px-8 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-green-600">Total Income</th>
                  <th className="px-8 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-red-600">Total Expense</th>
                  <th className="px-8 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Net Profit/Loss</th>
                  <th className="px-8 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {monthlySummaries.map((s, idx) => (
                  <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                    <td className="px-8 py-4 text-sm font-bold text-gray-900">{s.month}</td>
                    <td className="px-8 py-4 text-sm font-semibold text-green-600">${s.totalIncome.toLocaleString()}</td>
                    <td className="px-8 py-4 text-sm font-semibold text-red-600">${s.totalExpense.toLocaleString()}</td>
                    <td className="px-8 py-4 text-sm font-black text-gray-900">${s.netProfit.toLocaleString()}</td>
                    <td className="px-8 py-4 text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${s.netProfit >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {s.netProfit >= 0 ? 'PROFIT' : 'LOSS'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
