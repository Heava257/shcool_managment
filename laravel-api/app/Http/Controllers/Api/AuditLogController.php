<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\AuditLog;
use App\Models\Student;
use App\Models\Subject;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        $query = AuditLog::with('user');

        // Filter by model type
        if ($request->model_type) {
            $query->where('model_type', $request->model_type);
        }

        // Filter by action
        if ($request->action) {
            $query->where('action', $request->action);
        }

        // Filter by user
        if ($request->user_id) {
            $query->where('user_id', $request->user_id);
        }

        // Filter by date range
        if ($request->start_date) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->end_date) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        $auditLogs = $query->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 20);

        return response()->json([
            'success' => true,
            'data' => $auditLogs
        ]);
    }

    public function studentHistory($studentId)
    {
        $student = Student::find($studentId);

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found'
            ], 404);
        }

        $auditLogs = AuditLog::with('user')
            ->where('model_type', Student::class)
            ->where('model_id', $studentId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $auditLogs
        ]);
    }

    public function subjectHistory($subjectId)
    {
        $subject = Subject::find($subjectId);

        if (!$subject) {
            return response()->json([
                'success' => false,
                'message' => 'Subject not found'
            ], 404);
        }

        $auditLogs = AuditLog::with('user')
            ->where('model_type', Subject::class)
            ->where('model_id', $subjectId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $auditLogs
        ]);
    }

    public function userHistory($userId)
    {
        $auditLogs = AuditLog::with('user')
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 20);

        return response()->json([
            'success' => true,
            'data' => $auditLogs
        ]);
    }

    public function statistics()
    {
        $totalLogs = AuditLog::count();
        
        $logsByAction = AuditLog::select('action')
            ->selectRaw('COUNT(*) as count')
            ->groupBy('action')
            ->get();

        $logsByModel = AuditLog::select('model_type')
            ->selectRaw('COUNT(*) as count')
            ->groupBy('model_type')
            ->get();

        $recentLogs = AuditLog::with('user')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'total_logs' => $totalLogs,
                'logs_by_action' => $logsByAction,
                'logs_by_model' => $logsByModel,
                'recent_logs' => $recentLogs
            ]
        ]);
    }
}
