import React, { useState } from "react";
import { apiUrl } from "../utils/api";

import { useSelector } from "react-redux";

function AttendanceNew() {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(""); // "success", "error", "loading"
  const user = useSelector((state) => state.auth.user);

  const handleAttendance = async () => {
    setStatus("loading");
    setMessage("📍 Marking your attendance...");

    const location = { lat: 0, lng: 0 }; // Dummy location

    try {
      const res = await fetch(apiUrl("/api/mark-attendance"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user.username, id: user.id, location }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message || "✅ Attendance marked successfully.");
        setStatus("success");
      } else {
        setMessage(data.message || "❌ Failed to mark attendance.");
        setStatus("error");
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Server error. Please try again later.");
      setStatus("error");
    }
  };

  return (
    <div style={{
      maxWidth: 420,
      margin: "60px auto",
      padding: "30px",
      boxShadow: "0 0 15px rgba(0,0,0,0.1)",
      borderRadius: "10px",
      textAlign: "center",
      fontFamily: "Arial, sans-serif",
    }}>
      <h2 style={{ marginBottom: "20px", color: "#333" }}>📅 Mark Your Attendance</h2>

      <p style={{ marginBottom: "15px", color: "#666" }}>
        You are marking attendance as <strong>{user?.username}</strong>.
      </p>

      <button
        onClick={handleAttendance}
        style={{
          padding: "12px",
          width: "100%",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "6px",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        ✅ Mark Attendance
      </button>

      {message && (
        <p style={{
          marginTop: "20px",
          color:
            status === "success" ? "green" :
            status === "error" ? "red" : "#555",
          fontWeight: "bold",
        }}>
          {message}
        </p>
      )}
    </div>
  );
}

export default AttendanceNew;

