<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\SubjectController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AcademicController;

// Test route
Route::get('test', function() {
    return response()->json(['message' => 'API is working']);
});

// Public routes - no authentication required
Route::post('auth/register', [AuthController::class, 'register']);
Route::post('auth/login', [AuthController::class, 'login']);
Route::post('auth/verify-otp', [AuthController::class, 'verifyOTP']);
Route::post('auth/resend-otp', [AuthController::class, 'resendOTP']);

// Protected routes - Changed from 'auth:api' to 'auth:sanctum'
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::get('auth/me', [AuthController::class, 'me']);
    Route::post('auth/refresh', [AuthController::class, 'refresh']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    
    Route::get('menu-permissions', [PermissionController::class, 'getMenuPermissions']);

    // Student Management Routes
    Route::apiResource('students', StudentController::class);
    Route::get('students/{student}/subjects', [StudentController::class, 'getStudentSubjects']);
    Route::put('students/{student}/subjects/{subject}', [StudentController::class, 'updateStudentSubject']);
    Route::put('students/{student}/approve', [StudentController::class, 'approveStudent']);
    Route::put('students/{student}/reject', [StudentController::class, 'rejectStudent']);

    // Subject Management Routes
    Route::apiResource('subjects', SubjectController::class);
    Route::get('subjects/active', [SubjectController::class, 'getActiveSubjects']);

    // Reporting Routes (Power BI Integration)
    Route::get('reports/student-statistics', [ReportController::class, 'studentStatistics']);
    Route::get('reports/subject-statistics', [ReportController::class, 'subjectStatistics']);
    Route::get('reports/enrollment-statistics', [ReportController::class, 'enrollmentStatistics']);
    Route::get('reports/powerbi-data', [ReportController::class, 'powerBiData']);

    // Audit Log Routes
    Route::apiResource('audit-logs', AuditLogController::class);
    Route::get('audit-logs/student/{studentId}', [AuditLogController::class, 'studentHistory']);
    Route::get('audit-logs/subject/{subjectId}', [AuditLogController::class, 'subjectHistory']);
    Route::get('audit-logs/user/{userId}', [AuditLogController::class, 'userHistory']);
    Route::get('audit-logs/statistics', [AuditLogController::class, 'statistics']);

    // Admin Management Routes
    Route::get('admin/pending-users', [AdminController::class, 'getPendingUsers']);
    Route::post('admin/approve-user/{id}', [AdminController::class, 'approveUser']);
    Route::post('admin/reject-user/{id}', [AdminController::class, 'rejectUser']);
    Route::get('admin/teachers', [AdminController::class, 'getTeachers']);
    Route::get('admin/students', [AdminController::class, 'getStudents']);

    // Academic Management Routes
    Route::get('admin/academic-years', [AcademicController::class, 'getYears']);
    Route::post('admin/academic-years', [AcademicController::class, 'createYear']);
    Route::get('admin/semesters', [AcademicController::class, 'getSemesters']);
    Route::post('admin/semesters', [AcademicController::class, 'createSemester']);
    Route::get('admin/classes', [AcademicController::class, 'getClasses']);
    Route::post('admin/classes', [AcademicController::class, 'createClass']);
    Route::get('admin/schedules', [AcademicController::class, 'getSchedules']);
    Route::post('admin/schedules', [AcademicController::class, 'createSchedule']);

    // Teacher Dashboard
    Route::get('teacher/classes', [App\Http\Controllers\Api\TeacherDashboardController::class, 'getMyClasses']);
    Route::post('teacher/assessments', [App\Http\Controllers\Api\TeacherDashboardController::class, 'createAssessment']);
    Route::get('teacher/assessments', [App\Http\Controllers\Api\TeacherDashboardController::class, 'getAssessments']);
    Route::post('teacher/scores', [App\Http\Controllers\Api\TeacherDashboardController::class, 'saveScores']);
    Route::get('teacher/schedule', [App\Http\Controllers\Api\TeacherDashboardController::class, 'getSchedule']);
    Route::get('teacher/students', [App\Http\Controllers\Api\TeacherDashboardController::class, 'getSubjectStudents']);
    Route::get('teacher/attendance', [App\Http\Controllers\Api\TeacherDashboardController::class, 'getAttendance']);
    Route::post('teacher/attendance', [App\Http\Controllers\Api\TeacherDashboardController::class, 'saveAttendance']);
    Route::get('teacher/academic-context', [App\Http\Controllers\Api\TeacherDashboardController::class, 'getAcademicContext']);

    // Student Dashboard
    Route::get('student/grades', [App\Http\Controllers\Api\StudentDashboardController::class, 'getMyGrades']); // Basic
    Route::get('student/grades/detailed', [App\Http\Controllers\Api\StudentDashboardController::class, 'getDetailedGrades']); // Advanced
    Route::get('student/schedule', [App\Http\Controllers\Api\StudentDashboardController::class, 'getMySchedule']);
    Route::get('student/attendance', [App\Http\Controllers\Api\StudentDashboardController::class, 'getAttendanceHistory']);
    Route::get('student/academic-context', [App\Http\Controllers\Api\StudentDashboardController::class, 'getAcademicContext']);
});