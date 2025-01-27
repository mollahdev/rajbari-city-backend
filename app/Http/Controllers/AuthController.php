<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\OTP;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
class AuthController extends Controller
{
    /**
     * Send OTP for phone number verification
     *
     * @param   Request  $request  [$request description]
     *
     * @return  JSON
     */
    public function sendOtp(Request $request)
    {
        $request->validate([
            'dial_code' => 'required|string|size:3|regex:/^[0-9]+$/',
            'phone'     => 'required|string|digits:10|regex:/^[1-9][0-9]{9}$/',
        ]);

        $otp = rand(100000, 999999); // Generate 6-digit OTP
        $expiresAt = Carbon::now()->addMinutes(10); // OTP expires in 10 minutes

        $message = "Rajbari City account registration OTP {$otp}";

        // Send OTP
        $phoneNumber = "{$request->dialcode}{$request->phone}";
        $is_send_otp = OTP::send($phoneNumber, $message);

        if (!$is_send_otp) {
            return response()->json(['message' => 'Something went wrong, please try again.'], 422);
        }

        $user = new User();
        $user->phone          = $request->phone;
        $user->dialcode       = $request->dialcode;
        $user->district       = $request->district;
        $user->otp            = $otp;
        $user->otp_expires_at = $expiresAt;

        $user->save();

        return response()->json([
            'message' => 'OTP sent successfully.',
            'data'      => [
                'access_token' => $user->createAuthToken(),
                'token_type'   => 'Bearer'
            ]
        ]);
    }

    /**
     * Verify OTP
     *
     * @param   Request  $request  [$request description]
     *
     * @return  JSON
     */
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'otp' => 'required',
        ]);

        $user = Auth::user();

        if (!$user || $user->otp !== $request->otp || Carbon::now()->isAfter($user->otp_expires_at)) {
            return response()->json(['message' => 'Invalid or expired OTP.'], 422);
        }

        $user->update([
            'phone_verified_at' => Carbon::now(),
            'otp'               => null,
            'otp_expires_at'    => null,
        ]);

        return response()->json(['message' => 'OTP verified successfully.']);
    }

    /**
     * Update user profile
     *
     * @param   Request  $request  [$request description]
     *
     * @return  JSON
     */
    public function updateProfile(Request $request)
    {
        $request->validate([
            'name'      => 'required',
            'dob'       => 'required',
            'gender'    => 'required',
            'upzilla'   => 'required',
            'union'     => 'required',
            'password'  => ['required', Password::min(8)->mixedCase()->numbers()],
        ]);

        $user = $user = Auth::user();

        if (!$user || !$user->is_verified()) {
            return response()->json(['message' => 'Phone number not verified.'], 403);
        }

        $user->update([
            'name'     => $request->name,
            'email'    => $request->email,
            'dob'      => Carbon::createFromFormat('d-m-Y', $request->dob)->format('Y-m-d'),
            'gender'   => $request->gender,
            'upzilla'  => $request->upzilla,
            'union'    => $request->union,
            'password' => Hash::make($request->password),
            'account_status' => 'active',
        ]);

        return response()->json([
            'message'   => 'Profile updated successfully.',
        ]);
    }

    /**
     * Login user
     *
     * @param   Request  $request  [$request description]
     *
     * @return  array
     */
    public function login(Request $request)
    {
        $request->validate([
            'dial_code' => 'required|string|size:3|regex:/^[0-9]+$/',
            'phone'     => 'required|string|digits:10|regex:/^[1-9][0-9]{9}$/',
            'password'  => 'required',
        ]);

        $credentials = $request->only('phone', 'password');

        $user = User::where('phone', $request->phone)->first();

        if (!$user) {
            return response()->json([
                'message' => 'User not found',
            ], 404);
        }

        if (!Auth::attempt($credentials)) {
            return response()->json([
                'message' => 'Phone number or password doesn\'t match',
            ], 401);
        }

        $user = Auth::user();

        return response()->json([
            'message'       => 'Login success',
            'data'          => [
                'access_token' => $user->createAuthToken(),
                'token_type'   => 'Bearer',
            ]
        ]);
    }
}
