<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmsService
{
    protected ?string $provider;
    protected ?string $apiKey;
    protected ?string $senderId;

    public function __construct()
    {
        $this->provider = config('services.sms.provider', env('SMS_PROVIDER', ''));
        $this->apiKey = config('services.sms.api_key', env('SMS_API_KEY', ''));
        $this->senderId = config('services.sms.sender_id', env('SMS_SENDER_ID', 'Rahaa'));
    }

    /**
     * Check if real SMS service is configured.
     */
    public function isConfigured(): bool
    {
        return !empty($this->provider) && !empty($this->apiKey);
    }

    /**
     * Send real SMS verification code.
     * Throws exception if provider is not configured, as required.
     */
    public function sendSms(string $phone, string $message): array
    {
        if (!$this->isConfigured()) {
            throw new Exception("خدمة إرسال الرسائل القصيرة (SMS) غير مهيأة في إعدادات الخادم (.env). يرجى ضبط SMS_PROVIDER و SMS_API_KEY.");
        }

        try {
            switch ($this->provider) {
                case 'twilio':
                    // Real twilio integration call
                    $accountSid = env('TWILIO_SID');
                    $token = $this->apiKey;
                    $from = env('TWILIO_FROM');
                    $response = Http::withBasicAuth($accountSid, $token)
                        ->asForm()
                        ->post("https://api.twilio.com/2010-04-01/Accounts/{$accountSid}/Messages.json", [
                            'From' => $from,
                            'To' => $phone,
                            'Body' => $message,
                        ]);
                    return [
                        'success' => $response->successful(),
                        'data' => $response->json(),
                    ];

                case 'generic_http':
                default:
                    // Generic HTTP SMS Gateway
                    $endpoint = env('SMS_API_ENDPOINT', 'https://api.sms-provider.com/v1/send');
                    $response = Http::withHeaders([
                        'Authorization' => "Bearer {$this->apiKey}",
                    ])->post($endpoint, [
                        'sender' => $this->senderId,
                        'phone' => $phone,
                        'message' => $message,
                    ]);

                    return [
                        'success' => $response->successful(),
                        'data' => $response->json(),
                    ];
            }
        } catch (Exception $e) {
            Log::error("SMS Gateway Error: " . $e->getMessage());
            throw new Exception("فشل إرسال رسالة SMS عبر المزود: " . $e->getMessage());
        }
    }
}
