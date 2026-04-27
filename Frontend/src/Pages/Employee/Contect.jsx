import React, { useState } from "react";
import { useSelector } from "react-redux";
import { apiUrl } from "../../utils/api";

const ContactHR = () => {
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("General Inquiry");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("Normal");
  const [attachment, setAttachment] = useState(null);
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const user = useSelector((state) => state.auth.user);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!subject || !message) {
      setStatus("⚠️ Please fill in subject and message.");
      return;
    }

    if (!user?.id || !user?.username) {
      setStatus("⚠️ Please login again before sending request.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(apiUrl("/api/contact-hr"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employeeId: user.id,
          employeeName: user.username,
          subject,
          category,
          priority,
          message,
          attachment: attachment ? attachment.name : "",
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        setStatus(`❌ ${result.message || "Failed to submit request."}`);
        return;
      }

      setStatus("✅ Message sent to HR successfully!");
      setSubject("");
      setCategory("General Inquiry");
      setMessage("");
      setPriority("Normal");
      setAttachment(null);
    } catch (error) {
      console.error("Error submitting HR request:", error);
      setStatus("❌ Unable to send request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">📩 Contact HR</h2>

      {/* Form Section */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-2xl p-8 w-full"
      >
        {/* 🏗 GRID LAYOUT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Subject */}
          <div className="flex flex-col">
            <label className="font-medium text-gray-700 mb-1">Subject</label>
            <input
              type="text"
              placeholder="Enter subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="p-3 border rounded-lg focus:ring focus:ring-blue-300"
            />
          </div>

          {/* Category */}
          <div className="flex flex-col">
            <label className="font-medium text-gray-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="p-3 border rounded-lg focus:ring focus:ring-blue-300"
            >
              <option value="General Inquiry">General Inquiry</option>
              <option value="Leave">Leave Request</option>
              <option value="Payroll">Payroll Issue</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Message (takes full width) */}
          <div className="flex flex-col md:col-span-2">
            <label className="font-medium text-gray-700 mb-1">Message</label>
            <textarea
              placeholder="Write your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="p-3 border rounded-lg focus:ring focus:ring-blue-300"
              rows="5"
            />
          </div>

          {/* Priority */}
          <div className="flex flex-col">
            <label className="font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="p-3 border rounded-lg focus:ring focus:ring-blue-300"
            >
              <option value="Low">Low</option>
              <option value="Normal">Normal</option>
              <option value="High">High</option>
            </select>
          </div>

          {/* Attachment */}
          <div className="flex flex-col">
            <label className="font-medium text-gray-700 mb-1">Attachment</label>
            <input
              type="file"
              onChange={(e) => setAttachment(e.target.files[0])}
              className="p-2 border rounded-lg"
            />
            {attachment && (
              <p className="text-sm text-gray-600 mt-1">
                📎 {attachment.name}
              </p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-6">
          <button
            type="submit"
            disabled={submitting}
            className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            {submitting ? "Sending..." : "Send Message"}
          </button>
        </div>

        {/* Status Message */}
        {status && (
          <p
            className={`mt-4 text-sm font-medium ${
              status.includes("✅") ? "text-green-600" : "text-red-600"
            }`}
          >
            {status}
          </p>
        )}
      </form>
    </div>
  );
};

export default ContactHR;
