# CBSERP System - School ERP Application

CBSERP System is a comprehensive, full-stack School Enterprise Resource Planning (ERP) platform built with **React**, **Vite**, **Tailwind CSS**, **Node.js**, **Express**, and **MongoDB**.

It features full authentication, role-based dashboards for **Admins** and **Students**, academic session management, attendance tracking, fee management, announcement posting with PDF attachments, and result management.

---

## 🚀 Features

### 👑 Admin Module
- **Dashboard**: High-level overview of total students, classes, pending fees, active sessions, and announcements.
- **Student Management**: Register, view, edit, search, filter, and manage student profiles across classes and sections.
- **Attendance Management**: Mark and update daily student attendance by class and date.
- **Fee Management**: Track fee structures, record payments, manage pending dues, and issue digital receipts.
- **Session Management**: Manage academic years/sessions, set active sessions, and configure classes.
- **Announcement Management**: Publish notices with optional PDF attachments for students.
- **Result Management**: Upload and publish student examination marks and report cards.

### 🎓 Student Module
- **Personalized Dashboard**: View attendance summary, fee status, latest announcements, and academic performance.
- **Attendance History**: Detailed month-wise and subject-wise attendance logs with percentage calculations.
- **Fee Details**: View fee receipts, payment status, due dates, and payment history.
- **Announcements**: Browse school notices and download attached PDF documents.
- **Report Cards & Results**: View term exam marks and download PDF report cards.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, GSAP (Animations), Lucide React (Icons), React Router v6, Axios
- **Backend**: Node.js, Express.js, Mongoose (MongoDB ORM), JWT Authentication, BcryptJS, Multer (File Uploads)
- **Database**: MongoDB

---

## 📁 Repository Structure

```
CBSERP_System/
├── backend/
│   ├── controllers/       # Request handlers (auth, students, attendance, fees, etc.)
│   ├── middleware/        # JWT authentication & upload middleware
│   ├── models/            # Mongoose data schemas
│   ├── routes/            # Express API endpoint routes
│   ├── uploads/           # PDF attachments and static upload storage
│   ├── package.json       # Backend dependencies & scripts
│   ├── seeder.js          # Database seed script for initial mock data
│   └── server.js          # Main Express server entry point
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # AuthContext & global state providers
│   │   ├── pages/         # Admin & Student view pages
│   │   ├── utils/         # Axios instance & GSAP animation helpers
│   │   ├── App.jsx        # Root application & routing
│   │   └── main.jsx       # Vite entry point
│   ├── index.html         # Main HTML document
│   ├── package.json       # Frontend dependencies & scripts
│   ├── tailwind.config.js # Tailwind CSS configuration
│   └── vite.config.js     # Vite configuration
└── README.md              # Project documentation
```

---

## ⚙️ Getting Started & Installation

### Prerequisites
- **Node.js**: v18.x or higher
- **MongoDB**: Local MongoDB instance running on `mongodb://127.0.0.1:27017` or MongoDB Atlas connection string.

---

### 1️⃣ Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory (refer to `.env.example`):
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/cbserp_db
JWT_SECRET=cbserp_super_secret_jwt_key_2026
```

#### Seed Initial Data (Optional):
```bash
npm run seed
```

#### Start Backend Server:
```bash
npm run dev
# Server will run on http://localhost:5000
```

---

### 2️⃣ Frontend Setup

Open a new terminal window:

```bash
cd frontend
npm install
```

#### Start Frontend Development Server:
```bash
npm run dev
# Frontend will run on http://localhost:5173
```

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
