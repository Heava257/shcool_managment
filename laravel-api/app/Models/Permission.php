<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Permission extends Model
{
    protected $fillable =[
        'name',
        'group',
        'is_menu_web',
        'web_route_key',
    ];
}
