<?php

namespace App\Services;

use App\Contracts\PaymentGatewayInterface;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Log;
use Stripe\Checkout\Session as StripeSession;
use Stripe\Exception\ApiErrorException;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Stripe;
use Stripe\Webhook;

class StripeService implements PaymentGatewayInterface
{
    protected string $secretKey;

    protected string $webhookSecret;

    protected string $currency;

    public function __construct()
    {
        $this->secretKey = config('services.stripe.secret_key');
        $this->webhookSecret = config('services.stripe.webhook_secret');
        $this->currency = config('services.stripe.currency', 'usd');

        Stripe::setApiKey($this->secretKey);
    }

    public function initialize(array $payload): array
    {
        try {
            $session = StripeSession::create([
                'payment_method_types' => ['card'],
                'line_items' => [[
                    'price_data' => [
                        'currency' => $payload['currency'] ?? $this->currency,
                        'product_data' => [
                            'name' => $payload['product_name'] ?? 'Credits',
                        ],
                        'unit_amount' => $payload['amount'],
                    ],
                    'quantity' => 1,
                ]],
                'mode' => 'payment',
                'success_url' => $payload['success_url'] ?? config('app.url').'/credits/success?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => $payload['cancel_url'] ?? config('app.url').'/credits/cancel',
                'metadata' => $payload['metadata'] ?? [],
                'webhook_endpoint' => config('services.stripe.webhook_url'),
            ]);

            return [
                'success' => true,
                'data' => [
                    'session_id' => $session->id,
                    'url' => $session->url,
                ],
                'message' => 'Checkout session created',
                'status' => 200,
            ];
        } catch (ApiErrorException $exception) {
            Log::error('Stripe initialization failed', [
                'message' => $exception->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => $exception->getMessage(),
                'status' => 422,
            ];
        } catch (ConnectionException $exception) {
            Log::error('Stripe connection error during initialization', [
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
            $session = StripeSession::retrieve($reference);

            return [
                'success' => true,
                'data' => [
                    'id' => $session->id,
                    'status' => $session->status,
                    'payment_status' => $session->payment_status,
                    'amount_total' => $session->amount_total,
                    'currency' => $session->currency,
                    'metadata' => $session->metadata,
                ],
                'message' => 'Session retrieved',
                'status' => 200,
            ];
        } catch (ApiErrorException $exception) {
            Log::error('Stripe verification failed', [
                'message' => $exception->getMessage(),
                'reference' => $reference,
            ]);

            return [
                'success' => false,
                'message' => $exception->getMessage(),
                'status' => 422,
            ];
        }
    }

    public function handleWebhook(array $payload, ?string $signature = null): array
    {
        if ($signature && $this->webhookSecret) {
            try {
                $event = Webhook::constructEvent(
                    json_encode($payload),
                    $signature,
                    $this->webhookSecret
                );
            } catch (\UnexpectedValueException $exception) {
                Log::error('Stripe webhook invalid payload', [
                    'message' => $exception->getMessage(),
                ]);

                return [
                    'success' => false,
                    'message' => 'Invalid webhook payload.',
                    'status' => 400,
                ];
            } catch (SignatureVerificationException $exception) {
                Log::error('Stripe webhook signature verification failed', [
                    'message' => $exception->getMessage(),
                ]);

                return [
                    'success' => false,
                    'message' => 'Invalid webhook signature.',
                    'status' => 401,
                ];
            }
        }

        $event = $payload['type'] ?? 'unknown';
        $data = $payload['data']['object'] ?? [];

        Log::info('Stripe webhook received', [
            'event' => $event,
            'session_id' => $data['id'] ?? null,
        ]);

        return [
            'success' => true,
            'data' => [
                'event' => $event,
                'session' => $data,
            ],
        ];
    }
}
