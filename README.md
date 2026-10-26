# 🎓 CBSERP System - School Enterprise Resource Planning

A modern, full-stack School ERP (Enterprise Resource Planning) platform built with **React**, **Vite**, **Tailwind CSS**, **Node.js**, **Express**, and **MongoDB**. 

Features enterprise-grade role-based access control for **School Administrators** and **Students**, academic sessions, class management, daily attendance tracking, fee structure & receipt management, student announcements with circular PDF downloads, and student examination report card management.

---

## 🏗️ Architecture & Project Structure

The project is structured cleanly into decoupled `frontend` and `backend` workspaces:

```text
CBSERP_System/
├── .github/
│   └── workflows/
│       └── deploy.yml              # CI/CD workflow configuration
├── backend/
│   ├── controllers/                # Request handling & business logic
│   │   ├── announcementController.js
│   │   ├── attendanceController.js
│   │   ├── authController.js
│   │   ├── feeController.js
│   │   ├── resultController.js
│   │   ├── sessionController.js
│   │   └── studentController.js
│   ├── middleware/                 # Middleware layer
│   │   ├── authMiddleware.js       # JWT token verification & role check
│   │   └── uploadMiddleware.js     # Multer file upload (/tmp serverless support)
│   ├── models/                     # Mongoose schemas & data models
│   │   ├── Admin.js
│   │   ├── Announcement.js
│   │   ├── Attendance.js
│   │   ├── Class.js
│   │   ├── Fee.js
│   │   ├── Institution.js
│   │   ├── Result.js
│   │   ├── Session.js
│   │   └── Student.js
│   ├── routes/                     # RESTful API route definitions
│   │   ├── announcementRoutes.js
│   │   ├── attendanceRoutes.js
│   │   ├── authRoutes.js
│   │   ├── feeRoutes.js
│   │   ├── resultRoutes.js
│   │   ├── sessionRoutes.js
│   │   └── studentRoutes.js
│   ├── uploads/                    # Local storage directory with .gitkeep
│   ├── .env.example                # Backend environment configuration template
│   ├── package.json                # Backend dependencies & npm scripts
│   ├── seeder.js                   # Database seeder for demo accounts & data
│   ├── server.js                   # Express server entry point (Vercel compatible)
│   └── vercel.json                 # Vercel serverless backend configuration
├── frontend/
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # Global authentication & user state provider
│   │   ├── pages/
│   │   │   ├── admin/              # Admin dashboard & management portals
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── AdminLayout.jsx
│   │   │   │   ├── AdminProfile.jsx
│   │   │   │   ├── AnnouncementManagement.jsx
│   │   │   │   ├── AttendanceManagement.jsx
│   │   │   │   ├── FeeManagement.jsx
│   │   │   │   ├── ResultManagement.jsx
│   │   │   │   ├── SessionManagement.jsx
│   │   │   │   └── StudentManagement.jsx
│   │   │   ├── student/            # Student portal & personal views
│   │   │   │   ├── StudentAnnouncements.jsx
│   │   │   │   ├── StudentAttendance.jsx
│   │   │   │   ├── StudentDashboard.jsx
│   │   │   │   ├── StudentFees.jsx
│   │   │   │   ├── StudentLayout.jsx
│   │   │   │   └── StudentResults.jsx
│   │   │   ├── LandingPage.jsx     # Public landing showcase
│   │   │   └── LoginPage.jsx       # Multi-role authentication page
│   │   ├── utils/
│   │   │   ├── animations.js       # GSAP entrance & count-up animations
│   │   │   └── api.js              # Axios instance & dynamic URL resolution
│   │   ├── App.jsx                 # App routing & protected route wrappers
│   │   ├── index.css               # Tailwind CSS utility styles
│   │   └── main.jsx                # React root entry point
│   ├── .env.example                # Frontend environment configuration template
│   ├── index.html                  # HTML entry point
│   ├── package.json                # Frontend dependencies & npm scripts
│   ├── postcss.config.js           # PostCSS configuration
│   ├── tailwind.config.js          # Tailwind CSS theme configuration
│   ├── vercel.json                 # SPA client-side routing rewrites for Vercel
│   └── vite.config.js              # Vite bundler & local dev proxy configuration
├── .gitignore                      # Git ignored files & patterns
├── LICENSE                         # MIT open-source license
└── README.md                       # Complete documentation & deployment guide
```

---

## 🌐 Free Hosting Guide

### 1. MongoDB Atlas (Free Tier)

> **Already hosting 1 project on MongoDB Atlas?**
>
> You **do NOT need a new account or paid plan!** MongoDB Atlas free tier (M0 cluster) allows you to host **multiple isolated databases inside the exact same free cluster**.
>
> In MongoDB, your existing cluster can contain multiple distinct databases (e.g. `your_first_app` and `cbserp_db`). They do not conflict, share credentials securely, and stay 100% free!

#### Steps to configure MongoDB Atlas:
1. Log in to your [MongoDB Atlas Dashboard](https://cloud.mongodb.com/).
2. In your existing cluster (or create a new free M0 cluster), click **Connect** > **Drivers** (Node.js).
3. Copy your connection string:
   ```text
   mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority
   ```
4. **Append the database name** `/cbserp_db` right before the `?`:
   ```text
   mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/cbserp_db?retryWrites=true&w=majority
   ```
   *(MongoDB Atlas will automatically create this new isolated database on first connection without touching your other project).*
5. **Whitelist IP for Vercel**:
   - Go to **Network Access** in the Atlas sidebar.
   - Click **Add IP Address** -> Select **Allow Access From Anywhere** (`0.0.0.0/0`).
   - *Note: Vercel serverless functions use dynamic IP addresses, so `0.0.0.0/0` is required.*

---

### 2. Vercel Deployment (100% Free)

Deploying both frontend and backend on Vercel is free, fast, and takes less than 3 minutes. The recommended best practice is to deploy them as **two connected projects from the same GitHub repository**.

#### Step A: Deploy the Backend API
1. Log in to [Vercel](https://vercel.com/) and click **Add New...** > **Project**.
2. Select your `CBSERP_System` GitHub repository.
3. In the configuration window:
   - **Project Name**: `cbserp-backend` (or your choice)
   - **Framework Preset**: `Other`
   - **Root Directory**: Click *Edit* and select `backend`
4. Add **Environment Variables**:
   - `MONGO_URI`: `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/cbserp_db?retryWrites=true&w=majority`
   - `JWT_SECRET`: `your_random_jwt_secret_key_here`
   - `PORT`: `5000`
5. Click **Deploy**.
6. Once deployed, copy your backend URL (e.g., `https://cbserp-backend.vercel.app`).
   - Verify it by visiting `https://cbserp-backend.vercel.app/api/health` in your browser.

#### Step B: Deploy the Frontend
1. In Vercel, click **Add New...** > **Project** again.
2. Select the same `CBSERP_System` GitHub repository.
3. In the configuration window:
   - **Project Name**: `cbserp-frontend` (or your choice)
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select `frontend`
4. Add **Environment Variables**:
   - `VITE_API_URL`: `https://cbserp-backend.vercel.app/api` *(Your backend URL from Step A with `/api`)*
5. Click **Deploy**.
6. Your school ERP frontend is now live globally on Vercel's Edge CDN!

---

## 💻 Local Development Setup

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or v20.x recommended)
- [Git](https://git-scm.com/)
- Local MongoDB or MongoDB Atlas URI

### 2. Clone the Repository
```bash
git clone https://github.com/YashwantSinghPayaal/CBSERP_System.git
cd CBSERP_System
```

### 3. Setup Backend
```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/cbserp_db
JWT_SECRET=cbserp_super_secret_jwt_key_2026
```

Populate the database with sample demo records (Admins, Sessions, Classes, Students, Attendance, Fees, Results):
```bash
npm run seed
```

Start the backend server:
```bash
npm run dev
# Running on http://localhost:5000
```

### 4. Setup Frontend
In another terminal:
```bash
cd frontend
npm install
npm run dev
# Running on http://localhost:3000
```

---

## 🔑 Demo Login Credentials (After Running Seeder)

| Role | Email | Password | Access Details |
| :--- | :--- | :--- | :--- |
| **Admin (Principal)** | `admin@greenwood.edu` | `admin123` | Full admin privileges (All modules) |
| **Admin (Vice Principal)**| `vp@greenwood.edu` | `admin123` | Head of Academic Affairs |
| **Student (Class 10-A)** | `alex.smith@student.com` | `student123` | Roll No: 1001 (Full student portal) |
| **Student (Class 10-A)** | `emma.watson@student.com` | `student123` | Roll No: 1002 (Full student portal) |

---

## 📝 Serverless File Uploads Note

In local development, uploaded circulars and report cards are saved directly to `backend/uploads/`. When hosted on Vercel serverless lambdas, the `/tmp` temporary filesystem is utilized. For high-volume production deployments with persistent large-scale storage, connecting an external cloud storage provider (such as Cloudinary or AWS S3) is recommended.

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
