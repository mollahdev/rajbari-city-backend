<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;


class FileUploadController extends Controller
{
    /**
     * Handle file upload.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function uploadFile(Request $request)
    {
        // Validate the file input
        $request->validate([
            'image' => ['required', 'file', 'mimes:jpg,jpeg,png', 'max:5120'], // Limit: 5MB
        ]);

        // Store the file
        $file = $request->file('image');
        $filePath = $file->store('uploads', 'local'); // Replace 's3' with your disk name if it's customized

        // Get the full file URL
        $fileUrl = Storage::disk('local')->url($filePath);

        return response()->json([
            'message' => 'File uploaded successfully.',
            'file_url' => $fileUrl,
            'file_name' => $file->getClientOriginalName(),
        ], 201);
    }
}
