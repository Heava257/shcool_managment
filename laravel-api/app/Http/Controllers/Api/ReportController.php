<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Student;
use App\Models\Subject;

class ReportController extends Controller
{
    public function studentStatistics()
    {
        $totalStudents = Student::count();
        $pendingStudents = Student::where('status', 'pending')->count();
        $approvedStudents = Student::where('status', 'approved')->count();
        $rejectedStudents = Student::where('status', 'rejected')->count();
        $activeStudents = Student::where('status', 'active')->count();
        $inactiveStudents = Student::where('status', 'inactive')->count();
        $graduatedStudents = Student::where('status', 'graduated')->count();

        // Students by field of study
        $studentsByField = Student::select('field_of_study')
            ->selectRaw('COUNT(*) as count')
            ->groupBy('field_of_study')
            ->get()
            ->map(function ($item) {
                return [
                    'field_of_study' => ucfirst(str_replace('_', ' ', $item->field_of_study)),
                    'count' => $item->count
                ];
            });

        // Students by gender
        $studentsByGender = Student::select('gender')
            ->selectRaw('COUNT(*) as count')
            ->groupBy('gender')
            ->get();

        // Monthly registration trends (last 12 months)
        $monthlyTrends = Student::selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, COUNT(*) as count')
            ->where('created_at', '>=', now()->subMonths(12))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'total_students' => $totalStudents,
                'status_breakdown' => [
                    'pending' => $pendingStudents,
                    'approved' => $approvedStudents,
                    'rejected' => $rejectedStudents,
                    'active' => $activeStudents,
                    'inactive' => $inactiveStudents,
                    'graduated' => $graduatedStudents,
                ],
                'students_by_field_of_study' => $studentsByField,
                'students_by_gender' => $studentsByGender,
                'monthly_registration_trends' => $monthlyTrends,
            ]
        ]);
    }

    public function subjectStatistics()
    {
        $totalSubjects = Subject::count();
        $activeSubjects = Subject::where('status', 'active')->count();
        $inactiveSubjects = Subject::where('status', 'inactive')->count();

        // Subject enrollment statistics
        $subjectEnrollments = Subject::withCount('students')
            ->get()
            ->map(function ($subject) {
                return [
                    'id' => $subject->id,
                    'name' => $subject->name,
                    'code' => $subject->code,
                    'level' => $subject->level,
                    'credits' => $subject->credits,
                    'enrolled_students' => $subject->students_count,
                ];
            });

        // Most popular subjects
        $popularSubjects = $subjectEnrollments
            ->sortByDesc('enrolled_students')
            ->take(10)
            ->values();

        return response()->json([
            'success' => true,
            'data' => [
                'total_subjects' => $totalSubjects,
                'active_subjects' => $activeSubjects,
                'inactive_subjects' => $inactiveSubjects,
                'subject_enrollments' => $subjectEnrollments,
                'popular_subjects' => $popularSubjects,
            ]
        ]);
    }

    public function enrollmentStatistics()
    {
        // Total enrollments
        $totalEnrollments = \DB::table('student_subjects')->count();
        
        // Enrollments by status
        $enrollmentsByStatus = \DB::table('student_subjects')
            ->select('status')
            ->selectRaw('COUNT(*) as count')
            ->groupBy('status')
            ->get();

        // Enrollments by subject level
        $enrollmentsByLevel = \DB::table('student_subjects')
            ->join('subjects', 'student_subjects.subject_id', '=', 'subjects.id')
            ->select('subjects.level')
            ->selectRaw('COUNT(*) as count')
            ->groupBy('subjects.level')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'total_enrollments' => $totalEnrollments,
                'enrollments_by_status' => $enrollmentsByStatus,
                'enrollments_by_level' => $enrollmentsByLevel,
            ]
        ]);
    }

    public function powerBiData()
    {
        // Comprehensive data for Power BI integration
        $students = Student::with('subjects')->get()->map(function ($student) {
            return [
                'id' => $student->id,
                'student_id' => $student->student_id,
                'first_name' => $student->first_name,
                'last_name' => $student->last_name,
                'email' => $student->email,
                'phone' => $student->phone,
                'date_of_birth' => $student->date_of_birth,
                'gender' => $student->gender,
                'field_of_study' => $student->field_of_study,
                'status' => $student->status,
                'created_at' => $student->created_at,
                'updated_at' => $student->updated_at,
                'enrolled_subjects_count' => $student->subjects->count(),
                'subjects' => $student->subjects->map(function ($subject) {
                    return [
                        'id' => $subject->id,
                        'name' => $subject->name,
                        'code' => $subject->code,
                        'level' => $subject->level,
                        'credits' => $subject->credits,
                        'pivot_status' => $subject->pivot->status,
                        'pivot_grade' => $subject->pivot->grade,
                        'pivot_enrollment_date' => $subject->pivot->enrollment_date,
                        'pivot_completion_date' => $subject->pivot->completion_date,
                    ];
                }),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $students,
            'total_count' => $students->count(),
        ]);
    }
}
