<?php

use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ForgotPasswordController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\FileUploadController;

Route::get('/', function (Request $request) {
    return "Hello World";
});


Route::post('/login', [AuthController::class, 'login']);

Route::post('/register/send-otp', [AuthController::class, 'sendOtp']);
Route::post('/register/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('/register/update-profile', [AuthController::class, 'updateProfile']);

Route::post('/password/forgot', [ForgotPasswordController::class, 'sendOtp']);
Route::post('/password/verify-otp', [ForgotPasswordController::class, 'verifyOtp']);
Route::post('/password/reset', [ForgotPasswordController::class, 'resetPassword']);


Route::middleware(['auth:sanctum'])->group(function () {
    Route::patch('/profile', [ProfileController::class, 'update']);
    Route::get('/profile', [ProfileController::class, 'getUser']);
    Route::patch('/change-password', [ProfileController::class, 'changePassword']);
    Route::post('/upload-file', [FileUploadController::class, 'uploadFile']);
});