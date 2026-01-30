<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Otp extends Model
{
    use HasFactory;

    protected $fillable = [
        'email',
        'otp',
        'expires_at',
        'is_verified'
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'is_verified' => 'boolean'
    ];

    /**
     * Check if OTP is expired
     */
    public function isExpired()
    {
        return Carbon::now()->greaterThan($this->expires_at);
    }

    /**
     * Check if OTP is valid
     */
    public function isValid($otp)
    {
        return $this->otp === $otp && !$this->isExpired() && !$this->is_verified;
    }

    /**
     * Mark OTP as verified
     */
    public function markAsVerified()
    {
        $this->update(['is_verified' => true]);
    }
}