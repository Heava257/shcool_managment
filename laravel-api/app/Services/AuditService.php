<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Request;

class AuditService
{
    public static function log($action, $model, $oldValues = null, $newValues = null)
    {
        $user = auth()->user();
        
        if (!$user) {
            return; // Don't log if no authenticated user
        }

        AuditLog::create([
            'user_id' => $user->id,
            'action' => $action,
            'model_type' => get_class($model),
            'model_id' => $model->id,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
        ]);
    }

    public static function logStudentAction($action, $student, $oldValues = null, $newValues = null)
    {
        self::log($action, $student, $oldValues, $newValues);
    }

    public static function logSubjectAction($action, $subject, $oldValues = null, $newValues = null)
    {
        self::log($action, $subject, $oldValues, $newValues);
    }

    public static function getAuditHistory($modelType, $modelId)
    {
        return AuditLog::with('user')
            ->where('model_type', $modelType)
            ->where('model_id', $modelId)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public static function getUserAuditHistory($userId, $limit = 50)
    {
        return AuditLog::with('user')
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    public static function getRecentAudits($limit = 100)
    {
        return AuditLog::with('user')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }
}
