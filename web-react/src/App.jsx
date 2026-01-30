import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter, Route, Routes } from "react-router-dom"
import HomePage from './page/Home/HomePage'
import MainLayout from '../layout/MainLatout'
import MainLayoutAuth from '../layout/MainLayoutAuth'
import RolePage from './page/role/RolePage'
import LoginPage from '../commponent/auth/LoginPage'
import RegisterPage from '../commponent/auth/RegisterPage'
import OTPVerification from './page/OTPVerification/OTPVerification'
import StudentManagement from './components/StudentManagement/StudentManagement'
import StudentRegistration from './components/StudentRegistration/StudentRegistration'
import SubjectManagement from './components/SubjectManagement/SubjectManagement'
import TeacherAttendancePage from './page/teacher/TeacherAttendancePage'
import PendingUsersPage from './page/admin/PendingUsersPage'
import AcademicManagementPage from './page/admin/AcademicManagementPage'
import TeacherClassesPage from './page/teacher/TeacherClassesPage'
import TeacherAssignmentsPage from './page/teacher/TeacherAssignmentsPage'
import StudentSchedulePage from './page/student/StudentSchedulePage'
import StudentGradesPage from './page/student/StudentGradesPage'
import StudentAttendancePage from './page/student/StudentAttendancePage'
import ComingSoonPage from './page/ComingSoonPage'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/role" element={<RolePage />} />

          {/* Admin Routes */}
          <Route path="/admin/students" element={<StudentManagement />} />
          <Route path="/admin/students/register" element={<StudentRegistration />} />
          <Route path="/admin/subjects" element={<SubjectManagement />} />
          <Route path="/admin/pending-users" element={<PendingUsersPage />} />
          <Route path="/admin/academic" element={<AcademicManagementPage />} />

          {/* Teacher Routes */}
          <Route path="/teacher/classes" element={<TeacherClassesPage />} />
          <Route path="/teacher/schedule" element={<ComingSoonPage title="Teacher Schedule" />} />
          <Route path="/teacher/assignments" element={<TeacherAssignmentsPage />} />
          <Route path="/teacher/attendance" element={<TeacherAttendancePage />} />

          {/* Student Routes */}
          <Route path="/student/schedule" element={<StudentSchedulePage />} />
          <Route path="/student/grades" element={<StudentGradesPage />} />
          <Route path="/student/assignments" element={<ComingSoonPage title="My Assignments" />} />
          <Route path="/student/attendance" element={<StudentAttendancePage />} />

          <Route path="*" element={"404"} />
        </Route>
        <Route element={<MainLayoutAuth />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<OTPVerification />} />
        </Route>


      </Routes>
    </BrowserRouter>
  )
}

export default App