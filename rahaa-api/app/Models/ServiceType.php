<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceType extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug',
        'name_ar',
        'name_en',
        'description',
        'icon',
        'is_active',
        'base_fare',
        'per_km_rate',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'base_fare' => 'decimal:2',
        'per_km_rate' => 'decimal:2',
    ];
}

