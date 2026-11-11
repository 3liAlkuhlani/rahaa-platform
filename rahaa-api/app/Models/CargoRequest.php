<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CargoRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'request_number',
        'sender_id',
        'driver_id',
        'service_type',
        'sub_service',
        'pickup_location',
        'pickup_lat',
        'pickup_lng',
        'delivery_location',
        'delivery_lat',
        'delivery_lng',
        'cargo_type',
        'cargo_description',
        'weight_kg',
        'volume_size',
        'required_truck_type',
        'cargo_images',
        'scheduled_at',
        'estimated_fare',
        'payment_method',
        'status',
        'cancellation_reason',
    ];

    protected $casts = [
        'cargo_images' => 'array',
        'weight_kg' => 'decimal:2',
        'estimated_fare' => 'decimal:2',
        'scheduled_at' => 'datetime',
    ];

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function driver()
    {
        return $this->belongsTo(User::class, 'driver_id');
    }
}

