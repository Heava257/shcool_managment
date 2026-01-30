<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Subject;
use App\Models\Student;
use App\Models\User;

class Attendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'subject_id', 
        'student_id', 
        'date', 
        'status', 
        'remarks', 
        'recorded_by'
    ];

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function recorder()
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }
}
