<?php

namespace App\Http\Controllers\Api;

use App\Contracts\PaymentGatewayInterface;
use App\Http\Controllers\Controller;
use App\Models\CreditTransaction;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CreditController extends Controller
{
    public function balance(Request $request): JsonResponse
    {
        return response()->json([
            'credits' => $request->user()->credits_balance,
        ]);
    }

    public function history(Request $request): JsonResponse
    {
        $transactions = CreditTransaction::where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json($transactions);
    }

    public function purchase(Request $request, PaymentGatewayInterface $paymentGateway): JsonResponse
    {
        $request->validate([
            'package' => ['required', 'string', 'in:starter,standard'],
        ]);

        $user = $request->user();

        $packages = [
            'starter' => [
                'amount' => 1000,
                'credits' => 100,
                'name' => 'Starter Pack - 100 Credits',
            ],
            'standard' => [
                'amount' => 2000,
                'credits' => 200,
                'name' => 'Standard Pack - 200 Credits',
            ],
        ];

        $package = $packages[$request->input('package')];

        $result = $paymentGateway->initialize([
            'amount' => $package['amount'],
            'currency' => config('services.stripe.currency', 'usd'),
            'product_name' => $package['name'],
            'success_url' => config('app.url').'/credits/success?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => config('app.url').'/credits/cancel',
            'metadata' => [
                'user_id' => $user->id,
                'credits' => $package['credits'],
                'package' => $request->input('package'),
            ],
        ]);

        if (! $result['success']) {
            return response()->json([
                'message' => $result['message'],
                'status' => $result['status'],
            ], $result['status']);
        }

        return response()->json([
            'message' => 'Checkout session created',
            'data' => $result['data'],
        ], 201);
    }

    public function webhook(Request $request): JsonResponse
    {
        $payload = $request->all();
        $signature = $request->header('Stripe-Signature');

        $eventResult = app(PaymentGatewayInterface::class)->handleWebhook($payload, $signature);

        if (! $eventResult['success']) {
            return response()->json(['message' => $eventResult['message'] ?? 'Invalid payload'], $eventResult['status'] ?? 400);
        }

        $event = $eventResult['data']['event'] ?? 'unknown';
        $session = $eventResult['data']['session'] ?? [];

        if ($event === 'checkout.session.completed' && ($session['payment_status'] ?? '') === 'paid') {
            $metadata = $session['metadata'] ?? [];
            $userId = $metadata['user_id'] ?? null;
            $credits = $metadata['credits'] ?? 0;

            if ($userId && $credits > 0) {
                $user = User::find($userId);

                if ($user) {
                    $newBalance = $user->credits_balance + $credits;

                    $user->update(['credits_balance' => $newBalance]);

                    CreditTransaction::create([
                        'user_id' => $user->id,
                        'type' => 'purchase',
                        'amount' => $credits,
                        'balance_after' => $newBalance,
                        'description' => 'Credit purchase via Stripe',
                        'reference' => $session['id'] ?? null,
                        'metadata' => $metadata,
                    ]);

                    Log::info('Credits added via webhook', [
                        'user_id' => $user->id,
                        'credits' => $credits,
                        'new_balance' => $newBalance,
                    ]);
                }
            }
        }

        return response()->json(['message' => 'Webhook received'], 200);
    }

    public function deduct(Request $request): JsonResponse
    {
        $request->validate([
            'amount' => ['required', 'integer', 'min:1'],
            'description' => ['sometimes', 'string', 'max:255'],
            'reference' => ['sometimes', 'string'],
        ]);

        $user = $request->user();

        if ($user->credits_balance < $request->input('amount')) {
            return response()->json([
                'message' => 'Insufficient credits',
                'credits' => $user->credits_balance,
            ], 422);
        }

        $newBalance = $user->credits_balance - $request->input('amount');

        $user->update(['credits_balance' => $newBalance]);

        CreditTransaction::create([
            'user_id' => $user->id,
            'type' => 'deduction',
            'amount' => -$request->input('amount'),
            'balance_after' => $newBalance,
            'description' => $request->input('description') ?? 'Feature usage',
            'reference' => $request->input('reference'),
        ]);

        return response()->json([
            'message' => 'Credits deducted',
            'credits' => $newBalance,
        ]);
    }
}
