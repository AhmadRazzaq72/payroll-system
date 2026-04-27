# 📊 Attendance & Payroll Management System

A **full-stack web application** for managing employee attendance, leaves, holidays, and payroll processing.  
This system provides separate dashboards for **HR/Admin** and **Employees**, ensuring smooth workforce and payroll management.

---

## 🚀 Features

### 👨‍💼 HR/Admin
- Manage employee profiles (Add, Edit, Delete)  
- Track daily/monthly attendance  
- Approve/Reject leave requests  
- Manage holidays via calendar  
- Generate and manage payroll (salary slips, deductions, leaves, bonuses)  
- Export salary slips in **PDF** format  

### 👩‍💻 Employee
- View and update profile  
- Mark daily attendance  
- Apply for leave  
- View holiday calendar  
- View monthly payroll and download salary slips  

---

## 🛠️ Tech Stack

### Frontend
- **React (Vite)**  
- **Tailwind CSS**  
- **Redux Toolkit**  
- **Framer Motion**  

### Backend
- **Node.js + Express.js**  
- **MongoDB (Mongoose)**  
- **JWT Authentication**  
- **Multer**  

### Others
- **Cloudinary** (if used)  
- **PDFKit / ReportLab**  

---

## 📂 Project Structure
```
attendance-payroll-system/
│── backend/
│ ├── controllers/
│ ├── models/
│ ├── routes/
│ ├── server.js
│
│── frontend/
│ ├── src/
│ │ ├── components/
│ │ ├── pages/
│ │ ├── redux/
│ │ ├── App.jsx
│ │ └── main.jsx
│
│── README.md

```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository
```bash
git clone https://github.com/your-username/attendance-payroll-system.git
cd attendance-payroll-system
```

2️⃣ Backend Setup
bash
Copy code
cd backend
npm install
npm start

3️⃣ Frontend Setup
bash
Copy code
cd frontend
npm install
npm run dev

🖥️ Usage
HR/Admin login → Manage employees, attendance, payroll, and holidays

Employee login → Mark attendance, apply leave, view salary slips

Default route → Employee dashboard

📌 Roadmap
✅ Attendance Management

✅ Payroll System

✅ Holiday Calendar

🔄 Biometric/QR Attendance (future)

🔄 Email/SMS Notifications

