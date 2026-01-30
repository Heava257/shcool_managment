<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Student;
use App\Models\Subject;
use App\Services\AuditService;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $query = Student::with('subjects');

        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('first_name', 'like', '%' . $request->search . '%')
                  ->orWhere('last_name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%')
                  ->orWhere('student_id', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $students = $query->paginate($request->per_page ?? 10);

        return response()->json([
            'success' => true,
            'data' => $students
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:students,email',
            'phone' => 'nullable|string|max:20',
            'date_of_birth' => 'required|date|before:today',
            'gender' => 'required|in:male,female,other',
            'address' => 'nullable|string',
            'field_of_study' => 'required|string|in:computer_science,information_technology,business_administration,accounting,marketing,engineering,medicine,law,education,arts,science,mathematics,other',
            'subjects' => 'array',
            'subjects.*' => 'exists:subjects,id',
            'profile_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $validator->validated();
        
        // Generate unique student ID
        $data['student_id'] = 'STU' . str_pad(Student::count() + 1, 6, '0', STR_PAD_LEFT);
        $data['status'] = $request->status ?? 'pending'; // Use provided status or default to pending

        // Handle profile image upload
        if ($request->hasFile('profile_image')) {
            $image = $request->file('profile_image');
            $path = $image->store('students/profiles', 'public');
            $data['profile_image'] = $path;
        }

        $student = Student::create($data);

        // Attach subjects if provided
        if (isset($data['subjects']) && is_array($data['subjects'])) {
            foreach ($data['subjects'] as $subjectId) {
                $student->subjects()->attach($subjectId, [
                    'status' => 'enrolled',
                    'enrollment_date' => now()
                ]);
            }
        }

        // Log the student creation
        AuditService::logStudentAction('create', $student, null, $student->toArray());

        return response()->json([
            'success' => true,
            'message' => 'Student registered successfully',
            'data' => $student->load('subjects')
        ], 201);
    }

    public function show($id)
    {
        $student = Student::with('subjects')->find($id);

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $student
        ]);
    }

    public function update(Request $request, $id)
    {
        $student = Student::find($id);

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'first_name' => 'sometimes|required|string|max:255',
            'last_name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:students,email,' . $id,
            'phone' => 'nullable|string|max:20',
            'date_of_birth' => 'sometimes|required|date|before:today',
            'gender' => 'sometimes|required|in:male,female,other',
            'address' => 'nullable|string',
            'status' => 'sometimes|in:active,inactive,graduated',
            'subjects' => 'array',
            'subjects.*' => 'exists:subjects,id',
            'profile_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $oldValues = $student->toArray();
        $data = $validator->validated();

        // Handle profile image upload
        if ($request->hasFile('profile_image')) {
            // Delete old image if exists
            if ($student->profile_image) {
                Storage::disk('public')->delete($student->profile_image);
            }
            $image = $request->file('profile_image');
            $path = $image->store('students/profiles', 'public');
            $data['profile_image'] = $path;
        }

        $student->update($data);

        // Log the student update
        AuditService::logStudentAction('update', $student, $oldValues, $student->toArray());

        return response()->json([
            'success' => true,
            'message' => 'Student updated successfully',
            'data' => $student->load('subjects')
        ]);
    }

    public function destroy($id)
    {
        $student = Student::find($id);

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found'
            ], 404);
        }

        $oldValues = $student->toArray();

        // Delete profile image if exists
        if ($student->profile_image) {
            Storage::disk('public')->delete($student->profile_image);
        }

        // Delete student subject relationships
        $student->subjects()->detach();

        $student->delete();

        // Log the student deletion
        AuditService::logStudentAction('delete', $student, $oldValues, null);

        return response()->json([
            'success' => true,
            'message' => 'Student deleted successfully'
        ]);
    }

    public function getStudentSubjects($id)
    {
        $student = Student::find($id);

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found'
            ], 404);
        }

        $subjects = $student->subjects()->get();

        return response()->json([
            'success' => true,
            'data' => $subjects
        ]);
    }

    public function updateStudentSubject(Request $request, $studentId, $subjectId)
    {
        $student = Student::find($studentId);

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:enrolled,completed,dropped',
            'grade' => 'nullable|numeric|min:0|max:100'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $validator->validated();

        if ($data['status'] === 'completed') {
            $data['completion_date'] = now();
        }

        $student->subjects()->updateExistingPivot($subjectId, $data);

        return response()->json([
            'success' => true,
            'message' => 'Student subject updated successfully'
        ]);
    }

    public function approveStudent($id)
    {
        $student = Student::find($id);

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found'
            ], 404);
        }

        if ($student->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Only pending students can be approved'
            ], 400);
        }

        $oldValues = $student->toArray();
        $student->status = 'approved';
        $student->save();

        // Log the approval action
        AuditService::logStudentAction('approve', $student, $oldValues, $student->toArray());

        return response()->json([
            'success' => true,
            'message' => 'Student approved successfully'
        ]);
    }

    public function rejectStudent($id)
    {
        $student = Student::find($id);

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found'
            ], 404);
        }

        if ($student->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Only pending students can be rejected'
            ], 400);
        }

        $oldValues = $student->toArray();
        $student->status = 'rejected';
        $student->save();

        // Log the rejection action
        AuditService::logStudentAction('reject', $student, $oldValues, $student->toArray());

        return response()->json([
            'success' => true,
            'message' => 'Student rejected successfully'
        ]);
    }
}
