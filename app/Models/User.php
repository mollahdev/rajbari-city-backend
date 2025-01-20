<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;

use App\Services\OTP;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $guarded = [];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Send an SMS to the user.
     *
     * @param string $message The message content.
     * @return bool           True if the SMS is sent successfully, false otherwise.
     */
    public function sendSMS(string $message): bool
    {
        $phoneNumber = "{$this->dial_code}{$this->phone}";
        
        return OTP::send($phoneNumber, $message);
    }

    /**
     * Check a user account status is active
     *
     * @return  bool
     */
    public function is_active()
    {
        return 'active' === $this->account_status;
    }

    /**
     * Check a user account status is pending
     *
     * @return  bool
     */
    public function is_pending()
    {
        return 'pending' === $this->account_status;
    }

    /**
     * Check a user account status is block
     *
     * @return  bool
     */
    public function is_block()
    {
        return 'block' === $this->account_status;
    }

    /**
     * Check a user online status is block
     *
     * @return  bool
     */
    public function is_online()
    {
        return 'online' === $this->online_status;
    }

    /**
     * Check a user online status is block
     *
     * @return  bool
     */
    public function is_offline()
    {
        return 'offline' === $this->online_status;
    }

    /**
     * Create user authentication token
     *
     * @return string
     */
    public function createAuthToken()
    {
        return $this->createToken('auth_token')->plainTextToken;
    }

    /**
     * Check phone number is verified
     *
     * @return  bool
     */
    public function is_verified()
    {
        return $this->phone_verified_at != null;
    }
}
