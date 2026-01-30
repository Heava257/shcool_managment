<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AcademicYear;
use App\Models\Semester;
use App\Models\AcademicClass;
use App\Models\Schedule;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Support\Facades\Validator;

class AcademicController extends Controller
{
    // --- Academic Years ---
    public function getYears()
    {
        return response()->json([
            'success' => true,
            'years' => AcademicYear::orderBy('name', 'desc')->get()
        ]);
    }

    public function createYear(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => $validator->errors()->first()], 400);
        }

        $year = AcademicYear::create($request->all());
        return response()->json(['success' => true, 'year' => $year]);
    }

    // --- Semesters ---
    public function getSemesters(Request $request)
    {
        $query = Semester::with('academicYear');
        if ($request->academic_year_id) {
            $query->where('academic_year_id', $request->academic_year_id);
        }
        return response()->json([
            'success' => true,
            'semesters' => $query->get()
        ]);
    }

    public function createSemester(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'academic_year_id' => 'required|exists:academic_years,id',
            'name' => 'required|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => $validator->errors()->first()], 400);
        }

        $semester = Semester::create($request->all());
        return response()->json(['success' => true, 'semester' => $semester]);
    }

    // --- Classes ---
    public function getClasses(Request $request)
    {
        $query = AcademicClass::with(['teacher', 'academicYear']);
        if ($request->academic_year_id) {
            $query->where('academic_year_id', $request->academic_year_id);
        }
        return response()->json([
            'success' => true,
            'classes' => $query->get()
        ]);
    }

    public function createClass(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string',
            'level' => 'nullable|string',
            'teacher_id' => 'nullable|exists:users,id',
            'academic_year_id' => 'nullable|exists:academic_years,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => $validator->errors()->first()], 400);
        }

        $class = AcademicClass::create($request->all());
        return response()->json(['success' => true, 'class' => $class]);
    }

    // --- Schedules ---
    public function getSchedules(Request $request)
    {
        $query = Schedule::with(['academicClass', 'subject', 'teacher', 'academicYear', 'semesterRef']);
        
        if ($request->class_id) {
            $query->where('class_id', $request->class_id);
        }
        if ($request->academic_year_id) {
            $query->where('academic_year_id', $request->academic_year_id);
        }
        if ($request->semester_id) {
            $query->where('semester_id', $request->semester_id);
        }

        return response()->json([
            'success' => true,
            'schedules' => $query->get()
        ]);
    }

    public function createSchedule(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'class_id' => 'required|exists:classes,id',
            'subject_id' => 'required|exists:subjects,id',
            'teacher_id' => 'required|exists:users,id',
            'day_of_week' => 'required|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'start_time' => 'required',
            'end_time' => 'required',
            'academic_year_id' => 'required|exists:academic_years,id',
            'semester_id' => 'required|exists:semesters,id',
            'room' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => $validator->errors()->first()], 400);
        }

        $schedule = Schedule::create($request->all());
        return response()->json(['success' => true, 'schedule' => $schedule]);
    }
}
