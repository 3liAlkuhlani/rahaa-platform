<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PassengerProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'wallet_balance',
        'total_trips',
        'rating',
        'saved_places',
    ];

    protected $casts = [
        'wallet_balance' => 'float',
        'total_trips' => 'integer',
        'rating' => 'float',
        'saved_places' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
