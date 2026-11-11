<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RentalGuarantee extends Model
{
    use HasFactory;

    protected $fillable = [
        'guarantee_receipt_number',
        'booking_id',
        'renter_id',
        'owner_id',
        'guarantee_type',
        'estimated_value',
        'item_description',
        'legal_license_number',
        'item_photos',
        'status',
        'inspection_notes',
        'received_at',
        'returned_at',
        'received_by_signature',
        'returned_to_signature',
    ];

    protected $casts = [
        'estimated_value' => 'decimal:2',
        'item_photos' => 'array',
        'received_at' => 'datetime',
        'returned_at' => 'datetime',
    ];

    public function booking()
    {
        return $this->belongsTo(RentalBooking::class, 'booking_id');
    }

    public function renter()
    {
        return $this->belongsTo(User::class, 'renter_id');
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }
}

