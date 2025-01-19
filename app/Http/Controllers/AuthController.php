<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

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
    }
}
