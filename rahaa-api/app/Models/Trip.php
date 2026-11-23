<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Trip extends Model
{
    use HasFactory;

    /**
     * Statuses considered active (passenger cannot create a new trip while one exists)
     * - requested   = Pending (waiting for driver)
     * - accepted    = Accepted by driver
     * - arrived     = Driver Arriving / Arrived at pickup
     * - in_progress = Trip in progress
     */
    public const ACTIVE_STATUSES = [
        'requested',
        'accepted',
        'driver_arriving',
        'arrived',
        'in_progress',
    ];

    /**
     * Statuses where the assigned driver's live location is permitted to be shared
     * strictly with the trip's passenger (NEVER before acceptance or after completion/cancellation).
     */
    public const TRACKABLE_STATUSES = [
        'accepted',
        'driver_arriving',
        'arrived',
        'in_progress',
    ];

    public const TERMINAL_STATUSES = [
        'completed',
        'cancelled',
    ];

    public const PAYMENT_STATUSES = [
        'pending',
        'paid',
        'failed',
    ];

    protected $fillable = [
        'trip_number',
        'passenger_id',
        'driver_id',
        'pickup_name',
        'dropoff_name',
        'pickup_lat',
        'pickup_lng',
        'dropoff_lat',
        'dropoff_lng',
        'driver_lat',
        'driver_lng',
        'driver_location_updated_at',
        'vehicle_type',
        'fare',
        'final_fare',
        'payment_method',
        'payment_status',
        'payment_reference',
        'payment_confirmed_by',
        'paid_at',
        'status',
        'cancellation_reason',
        'cancelled_by',
        'passenger_rating',
        'driver_rating',
        'review',
        'accepted_at',
        'driver_arriving_at',
        'arrived_at',
        'started_at',
        'completed_at',
        'cancelled_at',
    ];

    protected $casts = [
        'fare' => 'float',
        'final_fare' => 'float',
        'passenger_rating' => 'float',
        'driver_rating' => 'float',
        'pickup_lat' => 'float',
        'pickup_lng' => 'float',
        'dropoff_lat' => 'float',
        'dropoff_lng' => 'float',
        'driver_lat' => 'float',
        'driver_lng' => 'float',
        'driver_location_updated_at' => 'datetime',
        'paid_at' => 'datetime',
        'accepted_at' => 'datetime',
        'driver_arriving_at' => 'datetime',
        'arrived_at' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    public function scopeActive($query)
    {
        return $query->whereIn('status', self::ACTIVE_STATUSES);
    }

    public function isActive(): bool
    {
        return in_array($this->status, self::ACTIVE_STATUSES, true);
    }

    public function isTrackable(): bool
    {
        return $this->driver_id !== null && in_array($this->status, self::TRACKABLE_STATUSES, true);
    }

    /**
     * Enforce strict driver location privacy on API serialization:
     * - Passengers can ONLY see their assigned driver's coordinates while trip is in TRACKABLE_STATUSES.
     * - Before acceptance (requested) and after completion/cancellation, all driver coordinates are stripped.
     */
    public function sanitizeForViewer(?User $viewer): self
    {
        if (!$viewer) {
            return $this;
        }

        if ($viewer->role === 'passenger') {
            $canSeeDriverLocation =
                $this->passenger_id === $viewer->id &&
                $this->isTrackable();

            if (!$canSeeDriverLocation) {
                $this->setAttribute('driver_lat', null);
                $this->setAttribute('driver_lng', null);
                $this->setAttribute('driver_location_updated_at', null);

                if ($this->relationLoaded('driver') && $this->driver && $this->driver->relationLoaded('driverProfile') && $this->driver->driverProfile) {
                    $this->driver->driverProfile->setAttribute('current_lat', null);
                    $this->driver->driverProfile->setAttribute('current_lng', null);
                }
            }
        }

        return $this;
    }

    public function passenger()
    {
        return $this->belongsTo(User::class, 'passenger_id');
    }

    public function driver()
    {
        return $this->belongsTo(User::class, 'driver_id');
    }
}
