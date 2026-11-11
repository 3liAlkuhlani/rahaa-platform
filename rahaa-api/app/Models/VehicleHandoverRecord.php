<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VehicleHandoverRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'vehicle_id',
        'owner_id',
        'renter_id',
        'record_type',
        'odometer_km',
        'fuel_level',
        'vehicle_condition_photos',
        'condition_notes',
        'keys_handed_over',
        'extra_charges',
        'extra_charges_reason',
        'both_parties_confirmed',
    ];

    protected $casts = [
        'vehicle_condition_photos' => 'array',
        'keys_handed_over' => 'boolean',
        'both_parties_confirmed' => 'boolean',
        'extra_charges' => 'decimal:2',
    ];

    public function booking()
    {
        return $this->belongsTo(RentalBooking::class, 'booking_id');
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class, 'vehicle_id');
    }
}

