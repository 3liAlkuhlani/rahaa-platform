<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    use HasFactory;

    protected $fillable = [
        'owner_id',
        'service_type',
        'make',
        'model',
        'year',
        'color',
        'plate_number',
        'category',
        'seats',
        'fuel_type',
        'transmission',
        'max_payload_kg',
        'daily_rate',
        'hourly_rate',
        'with_driver_available',
        'self_drive_available',
        'location_name',
        'location_lat',
        'location_lng',
        'images',
        'status',
        'rejection_reason',
        'is_available',
        'rating',
    ];

    protected $casts = [
        'images' => 'array',
        'year' => 'integer',
        'seats' => 'integer',
        'max_payload_kg' => 'decimal:2',
        'daily_rate' => 'decimal:2',
        'hourly_rate' => 'decimal:2',
        'with_driver_available' => 'boolean',
        'self_drive_available' => 'boolean',
        'is_available' => 'boolean',
        'rating' => 'decimal:2',
    ];

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function verificationDocuments()
    {
        return $this->hasMany(VerificationDocument::class, 'vehicle_id');
    }

    public function rentalBookings()
    {
        return $this->hasMany(RentalBooking::class, 'vehicle_id');
    }
}

