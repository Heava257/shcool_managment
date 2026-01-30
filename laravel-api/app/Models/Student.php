<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'user_id', // Added user_id
        'phone',
        'date_of_birth',
        'gender',
        'address',
        'field_of_study',
        'student_id',
        'status',
        'profile_image'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    protected $casts = [
        'date_of_birth' => 'date',
        'enrollment_date' => 'date',
        'completion_date' => 'date'
    ];

    public function subjects()
    {
        return $this->belongsToMany(Subject::class, 'student_subjects')
            ->withPivot(['status', 'grade', 'enrollment_date', 'completion_date'])
            ->withTimestamps();
    }

    public function getFullNameAttribute()
    {
        return "{$this->first_name} {$this->last_name}";
    }

    public function getActiveSubjectsAttribute()
    {
        return $this->subjects()->where('student_subjects.status', 'enrolled')->get();
    }

    public function getCompletedSubjectsAttribute()
    {
        return $this->subjects()->where('student_subjects.status', 'completed')->get();
    }
}
