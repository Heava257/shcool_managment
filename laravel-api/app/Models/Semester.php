<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Semester extends Model
{
    use HasFactory;

    protected $fillable = ['academic_year_id', 'name', 'start_date', 'end_date', 'status'];

    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class);
    }
}
