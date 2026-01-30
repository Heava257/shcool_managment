<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Subject;

class TeacherDashboardController extends Controller
{
    /**
     * Get classes (subjects) assigned to the teacher
     */
    public function getMyClasses(Request $request)
    {
        $user = Auth::user();
        
        // Fetch subjects where teacher_id matches
        $classes = Subject::where('teacher_id', $user->id)
                        ->withCount('students') // Count enrolled students
                        ->get();

        // Transform for frontend if needed? 
        // Frontend expects: { key, name, students, schedule }
        // Schedule is not in DB yet. Using Placeholder.

        $data = $classes->map(function($subject) {
            return [
                'key' => $subject->id,
                'name' => $subject->name . ' (' . $subject->code . ')',
                'students' => $subject->students_count,
                'schedule' => 'Mon, Wed 10:00 AM', // Placeholder
                'credits' => $subject->credits,
                'level' => $subject->level
            ];
        });

        return response()->json([
            'success' => true,
            'classes' => $data
        ]);
    }

    /**
     * Get Teacher Schedule (Mock/Placeholder for now)
     */
    public function getSchedule()
    {
        // Placeholder
        return response()->json(['success' => true, 'events' => []]);
    }

    /**
     * Create a new Assessment
     */
    public function createAssessment(Request $request)
    {
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'subject_id' => 'required|exists:subjects,id',
            'name' => 'required|string',
            'type' => 'required|in:homework,quiz,midterm,final,other',
            'weight' => 'required|numeric|min:0|max:100',
            'max_score' => 'required|integer|min:1',
            'due_date' => 'nullable|date',
            'academic_year_id' => 'required|exists:academic_years,id',
            'semester_id' => 'required|exists:semesters,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $assessment = \App\Models\Assessment::create(array_merge($request->all(), [
            'teacher_id' => Auth::id()
        ]));

        return response()->json(['success' => true, 'assessment' => $assessment]);
    }

    /**
     * Get Assessments for a Subject
     */
    public function getAssessments(Request $request) 
    {
        $subjectId = $request->query('subject_id');
        if(!$subjectId) return response()->json(['success' => false, 'message' => 'Subject ID required']);

        $assessments = \App\Models\Assessment::where('subject_id', $subjectId)
                        ->where('teacher_id', Auth::id())
                        ->with('scores')
                        ->orderBy('created_at', 'desc')
                        ->get();

        return response()->json(['success' => true, 'assessments' => $assessments]);
    }

    /**
     * Save Student Scores
     */
    public function saveScores(Request $request)
    {
        $scores = $request->input('scores'); 
        
        foreach ($scores as $item) {
             \App\Models\StudentScore::updateOrCreate(
                ['assessment_id' => $item['assessment_id'], 'student_id' => $item['student_id']],
                ['score' => $item['score'], 'comment' => $item['comment'] ?? null]
             );
        }

        return response()->json(['success' => true, 'message' => 'Scores saved successfully']);
    }

    /**
     * Get Enrolled Students for a Subject (for grading context)
     */
    public function getSubjectStudents(Request $request)
    {
        $subjectId = $request->query('subject_id');
        $subject = \App\Models\Subject::where('id', $subjectId)->where('teacher_id', Auth::id())->first();
        
        if(!$subject) {
            return response()->json(['success' => false, 'message' => 'Subject not found or access denied'], 403);
        }

        $students = $subject->students; 

        return response()->json(['success' => true, 'students' => $students]);
    }

    /**
     * Get Attendance for a specific date and subject
     */
    public function getAttendance(Request $request)
    {
        $subjectId = $request->query('subject_id');
        $date = $request->query('date', now()->format('Y-m-d'));

        $subject = \App\Models\Subject::where('id', $subjectId)->where('teacher_id', Auth::id())->first();
        if(!$subject) return response()->json(['success' => false, 'message' => 'Subject not found'], 403);

        $attendance = \App\Models\Attendance::where('subject_id', $subjectId)
                        ->where('date', $date)
                        ->get()
                        ->keyBy('student_id');

        return response()->json(['success' => true, 'attendance' => $attendance]);
    }

    /**
     * Save/Update Attendance
     */
    public function saveAttendance(Request $request)
    {
        $subjectId = $request->input('subject_id');
        $date = $request->input('date');
        $records = $request->input('records'); // Array of {student_id, status, remarks}

        if (!$subjectId || !$date || !$records) {
             return response()->json(['success' => false, 'message' => 'Invalid data'], 422);
        }

        foreach($records as $record) {
            \App\Models\Attendance::updateOrCreate(
                [
                    'subject_id' => $subjectId,
                    'student_id' => $record['student_id'],
                    'date' => $date
                ],
                [
                    'status' => $record['status'], 
                    'remarks' => $record['remarks'] ?? null,
                    'recorded_by' => Auth::id()
                ]
            );
        }

        return response()->json(['success' => true, 'message' => 'Attendance saved successfully']);
    }

    public function getAcademicContext()
    {
        return response()->json([
            'success' => true,
            'years' => \App\Models\AcademicYear::where('status', 'active')->get(),
            'semesters' => \App\Models\Semester::where('status', 'active')->get(),
        ]);
    }
}
