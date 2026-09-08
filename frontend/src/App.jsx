import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';

// Admin Suite Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProfile from './pages/admin/AdminProfile';
import StudentManagement from './pages/admin/StudentManagement';
import SessionManagement from './pages/admin/SessionManagement';
import AttendanceManagement from './pages/admin/AttendanceManagement';
import FeeManagement from './pages/admin/FeeManagement';
import AnnouncementManagement from './pages/admin/AnnouncementManagement';
import ResultManagement from './pages/admin/ResultManagement';

// Student Suite Pages
import StudentLayout from './pages/student/StudentLayout';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentAttendance from './pages/student/StudentAttendance';
import StudentFees from './pages/student/StudentFees';
import StudentAnnouncements from './pages/student/StudentAnnouncements';
import StudentResults from './pages/student/StudentResults';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Admin Protected Console */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="students" element={<StudentManagement />} />
          <Route path="sessions" element={<SessionManagement />} />
          <Route path="attendance" element={<AttendanceManagement />} />
          <Route path="fees" element={<FeeManagement />} />
          <Route path="announcements" element={<AnnouncementManagement />} />
          <Route path="results" element={<ResultManagement />} />
        </Route>

        {/* Student Protected Console */}
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<StudentDashboard />} />
          <Route path="attendance" element={<StudentAttendance />} />
          <Route path="fees" element={<StudentFees />} />
          <Route path="announcements" element={<StudentAnnouncements />} />
          <Route path="results" element={<StudentResults />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
