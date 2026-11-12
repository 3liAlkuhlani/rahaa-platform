<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    public const SUPERVISOR_PERMISSIONS = [
        'overview',
        'users',
        'drivers',
        'trips',
        'vehicles',
        'complaints',
        'analytics',
        'settings',
    ];

    protected $fillable = [
        'name',
        'username',
        'phone',
        'email',
        'password',
        'role',
        'permissions',
        'status',
        'avatar',
        'phone_verified_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'phone_verified_at' => 'datetime',
            'permissions' => 'array',
            'password' => 'hashed',
        ];
    }

    public function driverProfile()
    {
        return $this->hasOne(DriverProfile::class, 'user_id');
    }

    public function passengerProfile()
    {
        return $this->hasOne(PassengerProfile::class, 'user_id');
    }

    public function tripsAsPassenger()
    {
        return $this->hasMany(Trip::class, 'passenger_id');
    }

    public function tripsAsDriver()
    {
        return $this->hasMany(Trip::class, 'driver_id');
    }

    public function driverServices()
    {
        return $this->hasMany(DriverService::class, 'user_id');
    }

    public function vehicles()
    {
        return $this->hasMany(Vehicle::class, 'owner_id');
    }

    public function verificationDocuments()
    {
        return $this->hasMany(VerificationDocument::class, 'user_id');
    }

    public function rentalBookingsAsRenter()
    {
        return $this->hasMany(RentalBooking::class, 'renter_id');
    }

    public function rentalBookingsAsOwner()
    {
        return $this->hasMany(RentalBooking::class, 'owner_id');
    }

    public function cargoRequestsAsSender()
    {
        return $this->hasMany(CargoRequest::class, 'sender_id');
    }

    public function cargoRequestsAsDriver()
    {
        return $this->hasMany(CargoRequest::class, 'driver_id');
    }

    public function complaints()
    {
        return $this->hasMany(Complaint::class, 'user_id');
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isSupervisor(): bool
    {
        return $this->role === 'supervisor';
    }

    public function isAdminOrSupervisor(): bool
    {
        return in_array($this->role, ['admin', 'supervisor'], true);
    }

    public function hasPermission(string $permission): bool
    {
        if ($this->isAdmin()) {
            return true;
        }
        if (!$this->isSupervisor()) {
            return false;
        }
        if ($permission === 'supervisors') {
            return false;
        }
        $perms = is_array($this->permissions) ? $this->permissions : [];
        return in_array($permission, $perms, true);
    }

    public function isDriver(): bool
    {
        return $this->role === 'driver';
    }

    public function isPassenger(): bool
    {
        return $this->role === 'passenger';
    }
}
