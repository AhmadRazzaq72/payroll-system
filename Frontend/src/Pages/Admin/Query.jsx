import React, { useEffect, useState } from "react";
import { FaPaperclip, FaExclamationCircle } from "react-icons/fa";
import { apiUrl } from "../../utils/api";

const HRRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const filters = ["All", "Pending", "In Progress", "Resolved"];

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(apiUrl("/api/contact-hr"));
        const data = await response.json();
        console.log("📩 HR requests fetched:", data);

        if (!response.ok) {
          throw new Error(data.message || "Failed to load requests");
        }

        setRequests(data.requests || []);
      } catch (err) {
        console.error("Error fetching HR requests:", err);
        setError("Unable to load HR requests right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleStatusUpdate = async (requestId, nextStatus) => {
    try {
      setUpdatingId(requestId);
      const token = localStorage.getItem("token");

      const response = await fetch(apiUrl(`/api/contact-hr/${requestId}/status`), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to update status");
      }

      setRequests((prev) =>
        prev.map((req) =>
          (req._id === requestId || req.id === requestId)
            ? { ...req, status: nextStatus, updatedAt: new Date().toISOString() }
            : req
        )
      );
    } catch (err) {
      console.error("Error updating status:", err);
      setError(err.message || "Unable to update request status.");
    } finally {
      setUpdatingId("");
    }
  };

  const filteredRequests = requests.filter((req) => {
    const currentStatus = req.status || "Pending";
    return activeFilter === "All" ? true : currentStatus === activeFilter;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">📩 Employee HR Requests</h1>

      <div className="flex flex-wrap gap-2 mb-4">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
              activeFilter === filter
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {loading && <p className="mb-4 text-sm text-gray-600">Loading requests...</p>}
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <div className="bg-white shadow-md rounded-xl p-4">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-3">Employee</th>
              <th className="p-3">Subject</th>
              <th className="p-3">Category</th>
              <th className="p-3">Priority</th>
              <th className="p-3">Date</th>
              <th className="p-3">Status</th>
              <th className="p-3">Attachment</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {!loading && filteredRequests.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-6 text-center text-gray-500">
                  No HR requests found for {activeFilter}.
                </td>
              </tr>
            ) : (
              filteredRequests.map((req) => (
              <tr key={req._id || req.id} className="border-t border-gray-200 hover:bg-gray-50">
                {/* Employee Name */}
                <td className="px-6 py-4">
                  <p className="font-semibold">{req.employeeName}</p>
                  <p className="text-xs text-gray-500">{req.employeeId}</p>
                </td>

                {/* Subject */}
                <td className="px-6 py-4">{req.subject}</td>

                {/* Category */}
                <td className="px-6 py-4">{req.category}</td>

                {/* Priority Badge */}
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      req.priority === "High"
                        ? "bg-red-100 text-red-700"
                        : req.priority === "Low"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {req.priority}
                  </span>
                </td>

                {/* Date */}
                <td className="px-6 py-4">{(req.createdAt || req.date || "").toString().slice(0, 10)}</td>

                {/* Status */}
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      req.status === "Resolved"
                        ? "bg-green-100 text-green-700"
                        : req.status === "In Progress"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {req.status || "Pending"}
                  </span>
                </td>

                {/* Attachment */}
                <td className="px-6 py-4">
                  {req.attachment ? (
                    <a
                      href={req.attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <FaPaperclip /> View
                    </a>
                  ) : (
                    <span className="text-gray-400">No File</span>
                  )}
                </td>

                {/* Action Button */}
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-2 min-w-[170px]">
                    <select
                      value={req.status || "Pending"}
                      onChange={(e) => handleStatusUpdate(req._id || req.id, e.target.value)}
                      disabled={updatingId === (req._id || req.id)}
                      className="px-2 py-1.5 text-xs rounded border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                    <span className="text-xs text-gray-600 pt-1 line-clamp-2">{req.message}</span>
                  </div>
                </td>
              </tr>
            ))) }
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HRRequests;
