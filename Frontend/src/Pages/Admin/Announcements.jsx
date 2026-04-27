import React, { useEffect, useState } from "react";
import { apiUrl } from "../../utils/api";

const initialForm = {
  title: "",
  startDate: "",
  endDate: "",
  description: "",
};

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState("");

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await fetch(apiUrl("/api/announcements"));
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch announcements");
      }

      setAnnouncements(data.announcements || []);
    } catch (error) {
      setMessage(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData(initialForm);
    setEditingId("");
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      title: item.title || "",
      startDate: item.startDate || "",
      endDate: item.endDate || "",
      description: item.description || "",
    });
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      const isEdit = Boolean(editingId);
      const url = isEdit ? apiUrl(`/api/announcements/${editingId}`) : apiUrl("/api/announcements");
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to save announcement");
      }

      setMessage(isEdit ? "✅ Announcement updated." : "✅ Announcement created.");
      resetForm();
      fetchAnnouncements();
    } catch (error) {
      setMessage(`❌ ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Announcements</h1>
        <p className="text-sm text-gray-500">Create, edit, and view all announcements.</p>
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-4">{editingId ? "Edit Announcement" : "Add Announcement"}</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Title"
            className="border border-gray-300 rounded px-3 py-2"
            required
          />
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-2"
            required
          />
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-2"
            required
          />
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description"
            className="border border-gray-300 rounded px-3 py-2 md:col-span-2"
            rows="3"
            required
          />

          <div className="md:col-span-2 flex items-center gap-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:bg-indigo-300"
            >
              {saving ? "Saving..." : editingId ? "Update Announcement" : "Create Announcement"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-100"
              >
                Cancel Edit
              </button>
            )}
            {message && <p className="text-sm text-gray-700">{message}</p>}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-4">All Announcements</h2>

        {loading ? (
          <p className="text-sm text-gray-600">Loading announcements...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="p-2 text-left">Title</th>
                  <th className="p-2 text-left">Start Date</th>
                  <th className="p-2 text-left">End Date</th>
                  <th className="p-2 text-left">Description</th>
                  <th className="p-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {announcements.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-3 text-center text-gray-500">
                      No announcements found.
                    </td>
                  </tr>
                ) : (
                  announcements.map((item) => (
                    <tr key={item._id} className="border-t">
                      <td className="p-2">{item.title}</td>
                      <td className="p-2">{item.startDate}</td>
                      <td className="p-2">{item.endDate}</td>
                      <td className="p-2">{item.description}</td>
                      <td className="p-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="px-3 py-1 text-xs rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Announcements;
