<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    /**
     * Register a user
     *
     * @return  array
     */
    public function register(Request $request)
    {
        $request->validate([
            'phone'     => 'required',
            'dialcode'  => 'required',
            'district'  => 'required',
        ]);

        $user = User::where('phone', $request->phone)->first();

        if ($user && $user->is_active()) {
            return response()->json([
                'message' => 'User already exists',
            ], 422);
        }

        $user = new User();

        $user->phone    = $request->phone;
        $user->dialcode = $request->dialcode;
        $user->district = $request->district;

        $user->save();

        return response()->json([
            'message'   => 'A verfication code has been sent to your phone',
            'data'      => [
                'access_token' => $user->createAuthToken(),
                'token_type'   => 'Bearer'
            ]
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
            'phone'     => 'required',
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
