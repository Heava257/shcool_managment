<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Assessment extends Model
{
    use HasFactory;

    protected $fillable = [
        'subject_id', 
        'teacher_id', 
        'class_id', 
        'name', 
        'type', 
        'weight', 
        'max_score', 
        'due_date', 
        'semester',
        'academic_year_id',
        'semester_id'
    ];

    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function semesterRef()
    {
        return $this->belongsTo(Semester::class, 'semester_id');
    }

    protected $casts = [
        'due_date' => 'date',
        'weight' => 'decimal:2',
    ];

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }
    
    public function academicClass()
    {
        return $this->belongsTo(AcademicClass::class, 'class_id');
    }

    public function scores()
    {
        return $this->hasMany(StudentScore::class);
    }
}
