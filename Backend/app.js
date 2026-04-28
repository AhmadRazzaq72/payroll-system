const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./modules/auth/authRoutes');
const userRoutes = require('./modules/user/userRoutes');
const attendanceRoutes = require("./modules/attendanceCopy/attendance.routes");
const payrollroutes = require('./modules/payroll/payrollroutes');
const calendar = require('./modules/calendar/holidayRoutes');
const mailroutes = require('./modules/mail/mailroutes');
const cloudinaryroutes = require('./modules/cloudinary/cloudinaryroutes');
const contectHRRoutes = require('./modules/contactwithHR/contectHRRoutes');
const announcementRoutes = require('./modules/announcements/announcements.routes');
const leaveRoutes = require('./modules/leave/leaveRoutes');
const financeRoutes = require('./modules/finance/finance.routes');
const app = express();

// ✅ Configure CORS for React frontend
app.use(cors());

//  Body parser & cookies
app.use(express.json());
app.use(cookieParser());

// ✅ Request logger (good for debugging)
app.use((req, res, next) => {
  console.log(`[📥 ${new Date().toLocaleString()}] ${req.method} ${req.url}`);
  next();
});

// ✅ Mount API routes
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', attendanceRoutes);
app.use('/api', payrollroutes);
app.use('/api', calendar);
app.use('/api', mailroutes);
app.use('/api', cloudinaryroutes);
app.use('/api/contact-hr', contectHRRoutes);
app.use('/api', announcementRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/finance', financeRoutes);

module.exports = app;
