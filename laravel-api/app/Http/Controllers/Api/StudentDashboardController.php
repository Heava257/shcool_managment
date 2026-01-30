<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class StudentDashboardController extends Controller
{
    /**
     * Get Student Grades (from Enrolled Subjects)
     */
    public function getMyGrades(Request $request)
    {
        $user = Auth::user();

        // 1. Check if user has linked Student record
        $student = $user->student;

        if (!$student) {
            // Check if we can find by email (legacy sync)
            $student = \App\Models\Student::where('email', $user->email)->first();
            if ($student) {
                // Link it!
                $student->user_id = $user->id;
                $student->save();
            } else {
                 return response()->json(['success' => true, 'grades' => []]); // No records yet
            }
        }

        // 2. Fetch subjects with pivot data
        $subjects = $student->subjects;

        // 3. Transform
        $data = $subjects->map(function($subject) {
            return [
                'key' => $subject->id,
                'subject' => $subject->name,
                'score' => $subject->pivot->grade ?? 'N/A',
                'grade' => $this->calculateGrade($subject->pivot->grade),
                'comments' => $subject->pivot->status === 'completed' ? 'Completed' : 'In Progress'
            ];
        });

        return response()->json([
            'success' => true,
            'grades' => $data
        ]);
    }

    public function getDetailedGrades(Request $request)
    {
        $user = Auth::user();
        if (!$user->student) return response()->json(['success' => true, 'report' => []]);
        $studentId = $user->student->id;

        // Get subjects
        $subjects = $user->student->subjects;
        $report = [];

        foreach($subjects as $subject) {
            // Get Assessments for this subject
            $query = \App\Models\Assessment::where('subject_id', $subject->id);
            
            if ($request->semester_id) {
                $query->where('semester_id', $request->semester_id);
            }
            if ($request->academic_year_id) {
                $query->where('academic_year_id', $request->academic_year_id);
            }

            $assessments = $query->with(['scores' => function($q) use ($studentId) {
                                $q->where('student_id', $studentId);
                            }])
                            ->get();
            
            // Calculate totals
            $assessmentData = $assessments->map(function($assessment) {
                 $myScore = $assessment->scores->first();
                 return [
                     'type' => $assessment->type,
                     'name' => $assessment->name,
                     'weight' => $assessment->weight,
                     'score' => $myScore ? $myScore->score : 0,
                     'max' => $assessment->max_score,
                     'weighted_score' => $myScore ? ($myScore->score / $assessment->max_score) * $assessment->weight : 0
                 ];
            });
            
            $totalScore = $assessmentData->sum('weighted_score');

            $report[] = [
                'subject' => $subject->name,
                'details' => $assessmentData,
                'final_grade' => number_format($totalScore, 2),
                'letter_grade' => $this->calculateGrade($totalScore)
            ];
        }

        return response()->json(['success' => true, 'report' => $report]);
    }
    
    public function getMySchedule(Request $request)
    {
         $user = Auth::user();
         // Check if student belongs to a class
         if (!$user->student || !$user->student->class_id) 
             return response()->json(['success' => true, 'schedule' => []]);

         $query = \App\Models\Schedule::where('class_id', $user->student->class_id);
         
         if ($request->semester_id) {
             $query->where('semester_id', $request->semester_id);
         }
         if ($request->academic_year_id) {
             $query->where('academic_year_id', $request->academic_year_id);
         }

         $schedules = $query->with(['subject', 'teacher'])
                        ->get()
                        ->groupBy('day_of_week');

         return response()->json(['success' => true, 'schedule' => $schedules]);
    }

    public function getAttendanceHistory(Request $request) 
    {
        $user = Auth::user();
        if (!$user->student) return response()->json(['success' => true, 'history' => []]);

        $history = \App\Models\Attendance::where('student_id', $user->student->id)
                    ->with('subject')
                    ->orderBy('date', 'desc')
                    ->get();

        return response()->json(['success' => true, 'history' => $history]);
    }

    public function getAcademicContext()
    {
        return response()->json([
            'success' => true,
            'years' => \App\Models\AcademicYear::where('status', 'active')->get(),
            'semesters' => \App\Models\Semester::where('status', 'active')->get(),
        ]);
    }

    private function calculateGrade($score) {
        if ($score === null) return '-';
        if ($score >= 90) return 'A';
        if ($score >= 80) return 'B';
        if ($score >= 70) return 'C';
        if ($score >= 60) return 'D';
        return 'F';
    }
}
