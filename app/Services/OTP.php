<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class OTP
{
    /**
     * The base API URL for sending SMS.
     *
     * @var string
     */
    private const API_URL = 'http://bulksmsbd.net/api/smsapi';

    /**
     * Send an SMS to a receiver.
     *
     * @param string $phoneNumber The recipient's phone number.
     * @param string $message     The message content.
     * @return bool               True if the SMS is sent successfully, false otherwise.
     */
    public static function send(string $phoneNumber, string $message): bool
    {
        $data = [
            'api_key'   => config('services.sms.api_key'),
            'senderid'  => config('services.sms.sender_id'),
            'type'      => 'text',
            'number'    => $phoneNumber,
            'message'   => $message,
        ];

        $response = Http::get(self::API_URL, $data);

        return $response->successful() && ($response->json()['response_code'] ?? null) === 202;
    }
}
