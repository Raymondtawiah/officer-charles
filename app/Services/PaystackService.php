<?php

namespace App\Services;

use App\Contracts\PaymentGatewayInterface;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaystackService implements PaymentGatewayInterface
{
    protected string $baseUrl;

    protected string $secretKey;

    protected string $currency;

    protected float $usdToGhsRate;

    public function __construct()
    {
        $this->baseUrl = 'https://api.paystack.co';
        $this->secretKey = config('services.paystack.secret_key');
        $this->currency = config('services.paystack.currency', 'GHS');
        $this->usdToGhsRate = 11.33;
    }

    public function initialize(array $payload): array
    {
        try {
            $amount = $payload['amount'];
            $currency = $payload['currency'] ?? $this->currency;

            if ($currency === 'GHS') {
                $amount = (int) round($amount * $this->usdToGhsRate);
            }

            $requestPayload = array_merge($payload, [
                'amount' => $amount,
                'currency' => $currency,
            ]);

            $response = Http::timeout(30)
                ->acceptJson()
                ->withToken($this->secretKey)
                ->post("{$this->baseUrl}/transaction/initialize", $requestPayload);

            if ($response->failed()) {
                Log::error('Paystack initialization failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return [
                    'success' => false,
                    'message' => $response->json('message') ?: 'Payment initialization failed.',
                    'status' => $response->status(),
                ];
            }

            return [
                'success' => true,
                'data' => $response->json('data'),
                'message' => $response->json('message'),
                'status' => $response->status(),
            ];
        } catch (ConnectionException $exception) {
            Log::error('Paystack connection error during initialization', [
                'message' => $exception->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => 'Payment service unavailable. Please try again later.',
                'status' => 502,
            ];
        }
    }

    public function verify(string $reference): array
    {
        try {
            $response = Http::timeout(30)
                ->acceptJson()
                ->withToken($this->secretKey)
                ->get("{$this->baseUrl}/transaction/verify/{$reference}");

            if ($response->failed()) {
                Log::error('Paystack verification failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'reference' => $reference,
                ]);

                return [
                    'success' => false,
                    'message' => $response->json('message') ?: 'Payment verification failed.',
                    'status' => $response->status(),
                ];
            }

            return [
                'success' => true,
                'data' => $response->json('data'),
                'message' => $response->json('message'),
                'status' => $response->status(),
            ];
        } catch (ConnectionException $exception) {
            Log::error('Paystack connection error during verification', [
                'message' => $exception->getMessage(),
                'reference' => $reference,
            ]);

            return [
                'success' => false,
                'message' => 'Payment service unavailable. Please try again later.',
                'status' => 502,
            ];
        }
    }

    public function handleWebhook(array $payload, ?string $signature = null): array
    {
        return [
            'success' => true,
            'data' => $payload,
        ];
    }
}
