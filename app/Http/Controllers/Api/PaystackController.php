<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CreditTransaction;
use App\Models\PaystackTransaction;
use App\Models\User;
use App\Services\PaystackService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaystackController extends Controller
{
    public function __construct(
        protected PaystackService $paystack
    ) {}

    public function initialize(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'amount' => ['required', 'integer', 'min:1'],
            'currency' => ['sometimes', 'string', 'size:3'],
            'metadata' => ['sometimes', 'array'],
            'callback_url' => ['sometimes', 'url'],
        ]);

        $payload = [
            'email' => $validated['email'],
            'amount' => $validated['amount'],
            'currency' => $validated['currency'] ?? 'GHS',
            'metadata' => array_merge($validated['metadata'] ?? [], [
                'user_id' => $request->user()->id,
            ]),
            'callback_url' => $validated['callback_url'] ?? null,
        ];

        $result = $this->paystack->initialize($payload);

        if (! $result['success']) {
            return response()->json([
                'message' => $result['message'],
                'status' => $result['status'],
            ], $result['status']);
        }

        $transaction = PaystackTransaction::create([
            'user_id' => $request->user()->id,
            'reference' => $result['data']['reference'],
            'amount' => $validated['amount'],
            'currency' => $payload['currency'],
            'status' => 'pending',
            'paystack_response' => $result['data'],
            'metadata' => $validated['metadata'] ?? [],
        ]);

        return response()->json([
            'message' => 'Payment initialized successfully',
            'data' => [
                'authorization_url' => $result['data']['authorization_url'],
                'access_code' => $result['data']['access_code'],
                'reference' => $result['data']['reference'],
                'transaction_id' => $transaction->id,
            ],
        ], 201);
    }

    public function verify(Request $request, string $reference): JsonResponse
    {
        $transaction = PaystackTransaction::where('reference', $reference)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $result = $this->paystack->verify($reference);

        if (! $result['success']) {
            return response()->json([
                'message' => $result['message'],
                'status' => $result['status'],
            ], $result['status']);
        }

        $status = $result['data']['status'] ?? 'failed';

        $transaction->update([
            'status' => $status,
            'payment_method' => $result['data']['channel'] ?? null,
            'paystack_response' => $result['data'],
            'paid_at' => $status === 'success' ? now() : null,
        ]);

        return response()->json([
            'message' => $status === 'success' ? 'Payment verified successfully' : 'Payment failed',
            'data' => $result['data'],
        ]);
    }

    public function webhook(Request $request): JsonResponse
    {
        $signature = $request->header('X-Paystack-Signature');

        if (! $signature) {
            return response()->json(['message' => 'Invalid signature'], 401);
        }

        $secret = config('services.paystack.secret_key');
        $hash = hash_hmac('sha512', $request->getContent(), $secret);

        if (! hash_equals($hash, $signature)) {
            return response()->json(['message' => 'Invalid signature'], 401);
        }

        $payload = $request->all();
        $event = $payload['event'] ?? 'unknown';
        $data = $payload['data'] ?? [];

        Log::info('Paystack webhook received', [
            'event' => $event,
            'reference' => $data['reference'] ?? null,
        ]);

        if ($event === 'charge.success') {
            $transaction = PaystackTransaction::where('reference', $data['reference'])->first();

            if ($transaction) {
                $transaction->update([
                    'status' => 'success',
                    'payment_method' => $data['channel'] ?? null,
                    'paystack_response' => $data,
                    'paid_at' => now(),
                ]);

                $metadata = $transaction->metadata ?? [];
                $userId = $metadata['user_id'] ?? null;
                $credits = $metadata['credits'] ?? 0;

                if ($userId && $credits > 0) {
                    $alreadyCredited = CreditTransaction::where('reference', $transaction->reference)
                        ->where('type', 'purchase')
                        ->exists();

                    if (! $alreadyCredited) {
                        $user = User::find($userId);

                        if ($user) {
                            $newBalance = $user->credits_balance + $credits;

                            $user->update(['credits_balance' => $newBalance]);

                            CreditTransaction::create([
                                'user_id' => $user->id,
                                'type' => 'purchase',
                                'amount' => $credits,
                                'balance_after' => $newBalance,
                                'description' => 'Credit purchase via Paystack',
                                'reference' => $transaction->reference,
                                'metadata' => $metadata,
                            ]);

                            Log::info('Credits added via Paystack webhook', [
                                'user_id' => $user->id,
                                'credits' => $credits,
                                'new_balance' => $newBalance,
                            ]);
                        }
                    }
                }
            }
        }

        return response()->json(['message' => 'Webhook received'], 200);
    }
}

