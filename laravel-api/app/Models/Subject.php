<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subject extends Model
{
    protected $fillable = [
        'name',
        'code',
        'description',
        'credits',
        'level',
        'status',
        'teacher_id'
    ];

    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function students()
    {
        return $this->belongsToMany(Student::class, 'student_subjects')
            ->withPivot(['status', 'grade', 'enrollment_date', 'completion_date'])
            ->withTimestamps();
    }

    public function getActiveStudentsAttribute()
    {
        return $this->students()->where('student_subjects.status', 'enrolled')->get();
    }

    public function getCompletedStudentsAttribute()
    {
        return $this->students()->where('student_subjects.status', 'completed')->get();
    }
}
