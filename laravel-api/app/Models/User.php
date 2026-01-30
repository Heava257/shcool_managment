<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'avatar',
        'role',
        'status',
        'email_verified_at'  // ✅ Add this
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    // ✅ Add profile relationship
    public function profile()
    {
        return $this->hasOne(Profile::class);
    }

    public function student()
    {
        return $this->hasOne(Student::class);
    }

    public function teacherSubjects()
    {
        return $this->hasMany(Subject::class, 'teacher_id');
    }
}