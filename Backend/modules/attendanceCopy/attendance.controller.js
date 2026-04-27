const { getDB } = require("../../config/db");

// ✅ GET /attendance/:userId
exports.getTodayAttendance = async (req, res) => {
  const db = getDB();
  const user_id = String(req.params.userId);
  const nowIST = new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000);
  const today = nowIST.toISOString().split("T")[0];
  // console.log("Todays date:", today);

  try {
    const data = await db.collection("Attendance").findOne({ user_id, date: today });
    if(!data){
      console.log("No attendance data found for user:", user_id);
      return res.status(404).json({ status: "Absent" });
    }else if(data.date === today && data){
    return res.status(200).json({ status: data ? data.status : "Absent" });
    }
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ error: "DB error" });
  }
};

// ✅ POST /mark-attendance
exports.markAttendance = async (req, res) => {
  try {
    const db = getDB();
    const { username, location, id } = req.body;
    console.log("📥 Request body:", req.body);

    // 1. Find user
    const user = await db.collection("users").findOne({ user_id: id, username });
    if (!user) return res.status(404).json({ message: "❌ User not found" });

    // 2. Check location 
    const office = { lat: 31.40405996861821, lng: 73.10721709489617 };
    const distance = (loc1, loc2) => {
      const R = 6371;
      const toRad = deg => (deg * Math.PI) / 180;
      const dLat = toRad(loc1.lat - loc2.lat);
      const dLon = toRad(loc1.lng - loc2.lng);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(loc1.lat)) *
          Math.cos(toRad(loc2.lat)) *
          Math.sin(dLon / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    const dist = distance(location, office);
    console.log("📍 Distance from office:", dist.toFixed(2), "km");
    // Removed location check
    // if (dist > 3) {
    //   return res.status(403).json({ message: "⛔ Not at office location!" });
    // }

    // 3. Get IST time using UTC offset
    const utcNow = new Date();
    console.log("utcNow is:", utcNow.toISOString());

    const istOffset = 5.5 * 60 * 60 * 1000;
    const istNow = new Date(utcNow.getTime() + istOffset);

    const hours = istNow.getUTCHours();
    const minutes = istNow.getUTCMinutes();
    const totalMinutes = hours * 60 + minutes;

    console.log("🕒 Current IST time (ISO):", istNow.toISOString());
    console.log("🕘 IST Hours:", hours, "| Minutes:", minutes);

    // 4. Time validation
    if (hours < 9 || hours >= 19) {
      return res.status(403).json({
        message: `⏰ Not within office hours (9:00–18:59 IST). Current time is ${hours}:${minutes < 10 ? '0' : ''}${minutes}`,
      });
    }

    // 5. Prepare data
    const timeData = {
      user_id: id,
      username,
      location,
      time: istNow,
      date: istNow.toISOString().split("T")[0],
    };

    // 6. Status logic
    let status = "Late Absent";
    if (totalMinutes <= 615) {
      status = "Present";
    } else if (totalMinutes <= 645) {
      status = "Late";
    }

    await db.collection("Attendance").insertOne({ ...timeData, status });

    return res.json({
      message: `✅ Attendance marked as '${status}'`,
    });

  } catch (error) {
    console.error("❌ Error in markAttendance:", error);
    res.status(500).json({ message: "Internal Server Error. Please try again later." });
  }
};

// ✅ GET /all-attendance
exports.getAllAttendance = async (req, res) => {
  try {
    const db = getDB();
    const nowIST = new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000);
    const today = nowIST.toISOString().split("T")[0]; // "2025-06-15"
    console.log("Today's date:", today);
    const todayDate = new Date(today); // midnight
    const tomorrowDate = new Date(today);

    tomorrowDate.setDate(todayDate.getDate() + 1); // next day;
    console.log("Tomorrow's date:", tomorrowDate);
    const attendance = await db
      .collection("Attendance")
      .find({
        date: {
          $gte: today, // greater than or equal to today
          $lt: tomorrowDate.toISOString().split("T")[0], // less than tomorrow
        },
      })
      .sort({ time: -1 })
      .toArray();

    res.status(200).json({ attendance });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attendance in db', error });
  }
};
  
exports.getAllAttendanceByMonthofuser= async (req, res) => {
  const db = getDB();
  const { userId, month } = req.params;

  const startDate = `${month}-01`; // e.g., 2025-06-01
  console.log("Start date:", startDate);
  const endDate = new Date(`${month}-01`);
  
  endDate.setMonth(endDate.getMonth() + 1);
  console.log("End date before increment:", endDate);
  const endStr = endDate.toISOString().split("T")[0]; // e.g., 2025-07-01

   try {
    const attendance = await db.collection("Attendance").find({
      user_id: userId,
      date: {
        $gte: startDate,
        $lt: endStr
      }
    }).toArray();

    res.json(attendance);
  } catch (err) {
    console.error("❌ Error fetching attendance:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
