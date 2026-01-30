# Academic Portal Implementation Plan

## Phase 1: Database & Authentication Structure
**Goal:** Implement the "Registration via School Code" and "Admin Approval" logic.

### 1.1 Database Schema Updates
- [ ] **Create `invitation_codes` table:**
  - `code` (string, unique)
  - `role` (enum: teacher, student)
  - `expiry_date` (timestamp)
  - `status` (active, used, expired)
- [ ] **Update `users` table:**
  - Add `status` (pending, active, rejected)
  - Add `registration_phase` (phase_1, phase_2)
  - Add `verification_document` (path string)
- [ ] **Create Role-Specific Tables:**
  - `teachers` (if not exists)
  - `parents` (if not exists)

### 1.2 Authentication Logic (Backend)
- [ ] **Update Register Controller:**
  - Logic to check `invitation_code` validity.
  - If valid code -> Assign Role + Set Status 'Active'.
  - If no code -> Assign Role 'Pending User' + Set Status 'Pending'.
- [ ] **Admin Approval Endpoint:**
  - API to list pending users.
  - API to approve/reject users.

### 1.3 Frontend Registration Update
- [ ] **Modify `RegisterPage.jsx`:**
  - Add optional "Invitation Code" input field.
  - Add "Role Selection" (Student/Teacher/Parent).
  - Handle different success messages (Active vs Pending).

---

## Phase 2: User Roles & Dashboards (Frontend)
**Goal:** Create distinct experiences for Students, Teachers, and Parents.

### 2.1 Student Dashboard
- [ ] **Features:** Class schedule, Grades, Homework upload.
- [ ] **Restrictions:** Read-only grades.

### 2.2 Teacher Dashboard
- [ ] **Features:** Class management, Grading interface, Content upload.
- [ ] **Restrictions:** Access only own classes.

### 2.3 Parent Dashboard
- [ ] **Features:** Child selector, Grade view, Attendance view.

---

## Phase 3: Academic Management
**Goal:** Connect users with Classes and Subjects.

- [ ] **Class Management:** Create classes, assign teachers.
- [ ] **Enrollment:** Add students to classes.
- [ ] **Schedule:** Manage time slots.

## Phase 4: Systems & Reports
- [ ] **Audit Logs:** Track user actions.
- [ ] **Reports:** Generate PDF/Excel reports for grades/attendance.

