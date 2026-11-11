<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PasswordResetSms extends Model
{
    use HasFactory;

    protected $table = 'password_resets_sms';

    protected $fillable = [
        'phone',
        'code_hash',
        'attempts',
        'used',
        'expires_at',
    ];

    protected $casts = [
        'used' => 'boolean',
        'expires_at' => 'datetime',
    ];
}
