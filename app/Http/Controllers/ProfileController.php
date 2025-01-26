<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Facades\Hash;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\UserResource;

class ProfileController extends Controller
{
    /**
     * Get all users
     *
     * @return  array
     */
    public function index()
    {
        $users = User::all();

        return UserResource::collection($users);
    }

    /**
     * Get single user profile
     *
     * @return  array
     */
    public function getUser()
    {
        $user = Auth::user();

        $userData = (new UserResource($user))->toArray(request());

        return response()->json([
            'message' => 'Get user profile',
            'data'    => $userData,
        ]);
    }

    /**
     * Update user profile
     *
     * @param   UpdateProfileRequest  $request  Update user profile request
     *
     * @return  array
     */
    public function update(UpdateProfileRequest $request)
    {
        $user = Auth::user();

        $user->update([
            'name'     => $request->name,
            'email'    => $request->email,
            'dob'      => $request->dob,
            'gender'   => $request->gender,
            'district' => $request->district,
            'upzilla'  => $request->upzilla,
            'union'    => $request->union,
        ]);

        return response()->json([
            'message' => 'Updated user profile',
        ]);
    }

    /**
     * Change user password
     *
     * @param   Request  $request  [$request description]
     *
     * @return  JSON
     */
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'password'  => ['required', Password::min(8)->mixedCase()->numbers()]
        ]);

        $user = Auth::user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'The provided current password is incorrect.',
            ], 422);
        }

        $user->password = bcrypt($request->password);

        $user->save();

        return response()->json([
            'message'       => 'Successfully updated password'
        ]);
    }
}
