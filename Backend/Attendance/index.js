const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { connectDB, getDB ,owner} = require("./db");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[📥 ${new Date().toLocaleString()}] ${req.method} ${req.url}`);
  next();
});

// GET /api/attendance/:user_id
app.get('/attendance/:userId', async (req, res) => {
  const db = getDB();
  const user_id = String(req.params.userId);
  console.log("🔍 Fetching attendance for user:", user_id);
  const today = new Date().toISOString().split('T')[0]; 

  console.log("🔍 Looking for:", { user_id, date: today });

  try {
    const data=await db.collection("Attendance").findOne({
      user_id: user_id,
      date: today
    });

    console.log("📄 Found Record:", data);

    if (!data) {
      return res.status(200).json({ status: 'Absent' });
    }

    return res.status(200).json({ status: data.status });
  } catch (error) {
    console.error("❌ DB Error:", error);
    res.status(500).json({ error: 'Error fetching today’s attendance' });
  }
});



// ✅ Simple attendance route
app.post("/mark-attendance", async (req, res) => {
const db = getDB();

const {  username, location, id } = req.body;
const user = await db.collection("users").findOne({ user_id:id,username});
if (!user) {
  return res.status(404).json({ message: "User not found in db"  });
}

  // Example fixed office location 
  const officeLocation = { lat: 31.40405996861821, lng: 73.10721709489617 };

  // Distance function (in km)
  function distance(loc1, loc2) {
    const toRad = deg => (deg * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(loc1.lat - loc2.lat);
    const dLon = toRad(loc1.lng - loc2.lng);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(loc1.lat)) * Math.cos(toRad(loc2.lat)) *
      Math.sin(dLon / 2) ** 2;
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  }

  // if (distance(location, officeLocation) > 0.5) {
  //   return res.status(403).json({ message: "⛔ You are not at office location!" });
  // }
  
  const dateUTC=new Date()
  const dateIST = new Date(dateUTC.getTime() + 5.5 * 60 * 60 * 1000); // Convert to IST

 await db.collection("Attendance").insertOne({
  user_id: id,
  username,
  location,
  time: dateIST,
  date: dateIST.toISOString().split('T')[0], // Add this line
  status: "Present"
});


  res.json({ message: "✅ Attendance marked!" });
});

// ✅ View all attendance (admin)
app.get("/all-attendance", async (req, res) => {
  const db = getDB();
  const records = await db.collection("Attendance").find().toArray();
  res.json(records);
});

// 🔌 Connect and Start
connectDB().then(() => {
  app.listen(process.env.PORT || 6500, () => {
    console.log("🚀 Server running on port", process.env.PORT || 6500);
  });
}).catch(err => {
  console.error("❌ Failed to connect to MongoDB", err);
});
