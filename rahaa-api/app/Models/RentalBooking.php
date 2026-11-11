<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RentalBooking extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_number',
        'renter_id',
        'vehicle_id',
        'owner_id',
        'start_date',
        'end_date',
        'pickup_time',
        'return_time',
        'rental_mode',
        'total_amount',
        'payment_method',
        'status',
        'cancellation_reason',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'total_amount' => 'decimal:2',
    ];

    public function renter()
    {
        return $this->belongsTo(User::class, 'renter_id');
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class, 'vehicle_id');
    }

    public function guarantee()
    {
        return $this->hasOne(RentalGuarantee::class, 'booking_id');
    }

    public function handoverRecords()
    {
        return $this->hasMany(VehicleHandoverRecord::class, 'booking_id');
    }
}

