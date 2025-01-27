<?php
namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class ForgotPasswordController extends Controller
{
    /**
     * Send OTP for password reset verification
     *
     * @param   Request  $request  [$request description]
     *
     * @return  JSON
     */
    public function sendOtp(Request $request)
    {
        $request->validate([
            'phone' => 'required|exists:users,phone',
        ]);

        $otp = rand(100000, 999999); // Generate 6-digit OTP
        $expiresAt = Carbon::now()->addMinutes(10); // OTP expires in 10 minutes

        $user = User::where('phone', $request->phone)->first();

        if (!$user) {
            return response()->json([
                'message' => 'User not found',
            ], 404);
        }

        // Send OTP
        if (!$user->sendSMS($otp)) {
            return response()->json(['message' => 'Something went wrong, please try again.'], 422);
        }

        $user->update([
            'otp' => $otp,
            'otp_expires_at' => $expiresAt,
        ]);

        return response()->json([
            'message' => 'OTP sent successfully.',
            'data'      => [
                'access_token' => $user->createAuthToken(),
                'token_type'   => 'Bearer'
            ]
        ]);
    }

    /**
     * Verify OTP for password reset
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
            'otp' => null,
            'otp_expires_at' => null,
        ]);

        return response()->json(['message' => 'OTP verified successfully.']);
    }

    /**
     * Reset password
     *
     * @param   Request  $request
     *
     * @return  JSON
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'phone' => 'required|exists:users,phone',
            'password' => 'required|min:6',
        ]);

        $user = User::where('phone', $request->phone)->first();

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        return response()->json(['message' => 'Password reset successfully.']);
    }
}
