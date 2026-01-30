<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Otp;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use App\Mail\OtpMail;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    /**
     * Register new user and send OTP
     */
    public function register(Request $request)
    {
            $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6|confirmed',
            'phone' => 'nullable|string|max:20',
            'invitation_code' => 'nullable|string|exists:invitation_codes,code',
            'address' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => true,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Check Invitation Code Logic
            $role = 'pending_user';
            $status = 'pending';
            $invitationCodeUsed = null;

            if ($request->filled('invitation_code')) {
                $invite = DB::table('invitation_codes')
                            ->where('code', $request->invitation_code)
                            ->first();
                
                // Extra checks (expiry, active, limit)
                if (!$invite->is_active) {
                    return response()->json(['error'=>true, 'message'=>'Invitation code is inactive'], 400);
                }
                if ($invite->expires_at && Carbon::parse($invite->expires_at)->isPast()) {
                    return response()->json(['error'=>true, 'message'=>'Invitation code expired'], 400);
                }
                if ($invite->usage_limit !== null && $invite->used_count >= $invite->usage_limit) {
                    return response()->json(['error'=>true, 'message'=>'Invitation code usage limit reached'], 400);
                }

                $role = $invite->role; // 'student' or 'teacher'
                $status = 'active'; // Accepted immediately
                $invitationCodeUsed = $invite->code;
                
                // Increment usage
                DB::table('invitation_codes')->where('id', $invite->id)->increment('used_count');
            }

            // Handle image upload
            $imagePath = null;
            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('profiles', 'public');
            }

            // Create user (email not verified yet)
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'status' => $status,
                'role' => $role,
                'invitation_code_used' => $invitationCodeUsed,
                'email_verified_at' => null // Not verified yet
            ]);

            // Create profile for the user
            $user->profile()->create([
                'phone' => $request->phone,
                'address' => $request->address,
                'image' => $imagePath,
                'type' => $role, // Use the determined role as type
            ]);

            // Generate and send OTP
            $otpCode = $this->generateOTP();
            
            // Save OTP to database
            Otp::create([
                'email' => $request->email,
                'otp' => $otpCode,
                'expires_at' => Carbon::now()->addMinutes(5)
            ]);

            // Send OTP email (wrapped in try-catch)
            try {
                Mail::to($request->email)->send(new OtpMail($otpCode, $request->name));
            } catch (\Exception $mailError) {
                // Log error but don't fail registration
                \Log::error('Failed to send OTP email: ' . $mailError->getMessage());
            }

            return response()->json([
                'error' => false,
                'message' => 'Registration successful. Please check your email for OTP verification.',
                'user' => $user->load('profile'),
                'requires_verification' => true,
                'otp_code' => $otpCode // ONLY for development/testing! Remove in production
            ], 201);

        } catch (\Exception $e) {
            // If registration fails, delete the uploaded image
            if ($imagePath && \Storage::disk('public')->exists($imagePath)) {
                \Storage::disk('public')->delete($imagePath);
            }

            return response()->json([
                'error' => true,
                'message' => 'Registration failed',
                'details' => $e->getMessage()
            ], 500);
        }
    }

 public function verifyOTP(Request $request)
{
    $validator = Validator::make($request->all(), [
        'email' => 'required|email',
        'otp' => 'required|string|size:6'
    ]);

    if ($validator->fails()) {
        return response()->json([
            'error' => true,
            'message' => 'Validation error',
            'errors' => $validator->errors()
        ], 422);
    }

    // Find the latest OTP for this email
    $otpRecord = Otp::where('email', $request->email)
        ->where('is_verified', false)
        ->latest()
        ->first();

    if (!$otpRecord) {
        return response()->json([
            'error' => true,
            'message' => 'No OTP found for this email'
        ], 404);
    }

    // Validate OTP
    if (!$otpRecord->isValid($request->otp)) {
        if ($otpRecord->isExpired()) {
            return response()->json([
                'error' => true,
                'message' => 'OTP has expired. Please request a new one.'
            ], 400);
        }

        return response()->json([
            'error' => true,
            'message' => 'Invalid OTP code'
        ], 400);
    }

    // Mark OTP as verified
    $otpRecord->markAsVerified();

    // Update user's email_verified_at
    $user = User::where('email', $request->email)->first();
    
    if (!$user) {
        return response()->json([
            'error' => true,
            'message' => 'User not found'
        ], 404);
    }
    
    $user->update(['email_verified_at' => Carbon::now()]);

    // Create token
    $token = $user->createToken('auth_token')->plainTextToken;

    return response()->json([
        'error' => false,
        'message' => 'Email verified successfully',
        'access_token' => $token,
        'user' => $user->load('profile')
    ]);
}

    /**
     * Resend OTP
     */
    public function resendOTP(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => true,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if ($user->email_verified_at) {
            return response()->json([
                'error' => true,
                'message' => 'Email already verified'
            ], 400);
        }

        // Generate new OTP
        $otpCode = $this->generateOTP();
        
        // Delete old OTPs for this email
        Otp::where('email', $request->email)->delete();

        // Create new OTP
        Otp::create([
            'email' => $request->email,
            'otp' => $otpCode,
            'expires_at' => Carbon::now()->addMinutes(5)
        ]);

        // Send OTP email
        Mail::to($request->email)->send(new OtpMail($otpCode, $user->name));

        return response()->json([
            'error' => false,
            'message' => 'OTP sent successfully. Please check your email.'
        ]);
    }

    /**
     * Login with OTP verification check
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string|min:6'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => true,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Attempt to authenticate
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'error' => true,
                'message' => 'Invalid credentials'
            ], 401);
        }

        $user = Auth::user();

        // Check if email is verified
        if (!$user->email_verified_at) {
            // Generate and send OTP
            $otpCode = $this->generateOTP();
            
            // Delete old OTPs
            Otp::where('email', $user->email)->delete();
            
            // Create new OTP
            Otp::create([
                'email' => $user->email,
                'otp' => $otpCode,
                'expires_at' => Carbon::now()->addMinutes(5)
            ]);

            // Send OTP email
            Mail::to($user->email)->send(new OtpMail($otpCode, $user->name));

            return response()->json([
                'error' => false,
                'message' => 'Please verify your email. OTP sent to your email.',
                'requires_verification' => true,
                'email' => $user->email
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'error' => false,
            'message' => 'Login successful',
            'access_token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'email_verified_at' => $user->email_verified_at,
                'role' => $user->role,
                'profile' => $user->load('profile')->profile,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
            ]
        ]);
    }

    /**
     * Generate random 6-digit OTP
     */
    private function generateOTP()
    {
        return str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }

    /**
     * Logout
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'error' => false,
            'message' => 'Logout successful'
        ]);
    }

    /**
     * Get authenticated user
     */
    public function me(Request $request)
    {
        return response()->json([
            'error' => false,
            'user' => $request->user()->load('profile')
        ]);
    }

    /**
     * Refresh token
     */
    public function refresh(Request $request)
    {
        $request->user()->tokens()->delete();
        $token = $request->user()->createToken('auth_token')->plainTextToken;

        return response()->json([
            'error' => false,
            'token' => $token,
            'message' => 'Token refreshed successfully'
        ]);
    }
}