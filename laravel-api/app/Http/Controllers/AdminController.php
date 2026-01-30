<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    /**
     * Get list of pending users
     */
    public function getPendingUsers()
    {
        $users = User::where('status', 'pending')
                    ->with('profile')
                    ->orderBy('created_at', 'desc')
                    ->get();

        return response()->json([
            'error' => false,
            'users' => $users
        ]);
    }

    /**
     * Approve a pending user
     */
    public function approveUser(Request $request, $id)
    {
        $user = User::findOrFail($id);

        if ($user->status !== 'pending') {
            return response()->json(['error' => true, 'message' => 'User is not pending'], 400);
        }

        // Validate role if changing
        // Assuming admin keeps requested role or 'pending_user' needs update
        $role = $request->input('role', $user->role); 
        
        // If role was 'pending_user', Admin MUST assign a real role (student/teacher)
        if ($role === 'pending_user') {
            // Default to student if not specified? Or error?
            // For now, let's require role if it's pending_user
            return response()->json(['error' => true, 'message' => 'Please assign a role (student/teacher)'], 400);
        }

        $user->update([
            'status' => 'active',
            'role' => $role
        ]);

        return response()->json([
            'error' => false,
            'message' => 'User approved successfully',
            'user' => $user
        ]);
    }

    /**
     * Reject a pending user
     */
    public function rejectUser($id)
    {
        $user = User::findOrFail($id);

        if ($user->status !== 'pending') {
            return response()->json(['error' => true, 'message' => 'User is not pending'], 400);
        }

        // Option: Delete user or set status to rejected
        $user->update(['status' => 'rejected']);
        
        // Alternatively: $user->delete();

        return response()->json([
            'error' => false,
            'message' => 'User rejected'
        ]);
    }

    public function getTeachers()
    {
        $teachers = User::where('role', 'teacher')
                    ->where('status', 'active')
                    ->get(['id', 'name', 'email']);

        return response()->json([
            'success' => true,
            'teachers' => $teachers
        ]);
    }

    public function getStudents()
    {
        $students = User::where('role', 'student')
                    ->where('status', 'active')
                    ->with('studentProfile') // Assuming there's a relation
                    ->get(['id', 'name', 'email']);

        return response()->json([
            'success' => true,
            'students' => $students
        ]);
    }
}
