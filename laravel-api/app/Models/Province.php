<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Province extends Model
{
    protected $fillable =[
        'name',
        'code',
        'description',
        'distand_from_city',
        'status',
    ];
}
