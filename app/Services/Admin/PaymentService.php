<?php

namespace App\Services\Admin;

use App\Contracts\Admin\PaymentServiceInterface;
use App\Models\PaystackTransaction;
use App\Models\StripeTransaction;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Facades\DB;

class PaymentService implements PaymentServiceInterface
{
    public function getPaymentHistory(?int $userId = null, int $perPage = 20): Paginator
    {
        $stripeQuery = StripeTransaction::query()->select([
            'id', 'user_id', 'amount', 'currency', 'status', 'paid_at', DB::raw("'stripe' as gateway")
        ]);

        $paystackQuery = PaystackTransaction::query()->select([
            'id', 'user_id', 'amount', 'currency', 'status', 'paid_at', DB::raw("'paystack' as gateway")
        ]);

        if ($userId) {
            $stripeQuery->where('user_id', $userId);
            $paystackQuery->where('user_id', $userId);
        }

        $stripe = $stripeQuery->orderByDesc('paid_at');
        $paystack = $paystackQuery->orderByDesc('paid_at');

        return $stripe->union($paystack)
            ->orderByDesc('paid_at')
            ->paginate($perPage);
    }

    public function getRevenueStats(): array
    {
        $stripeRevenue = StripeTransaction::where('status', 'paid')
            ->sum('amount');

        $paystackRevenue = PaystackTransaction::where('status', 'success')
            ->sum('amount');

        $stripeCount = StripeTransaction::where('status', 'paid')->count();
        $paystackCount = PaystackTransaction::where('status', 'success')->count();

        return [
            'total_revenue' => $stripeRevenue + $paystackRevenue,
            'stripe_revenue' => $stripeRevenue,
            'paystack_revenue' => $paystackRevenue,
            'stripe_transactions' => $stripeCount,
            'paystack_transactions' => $paystackCount,
            'total_transactions' => $stripeCount + $paystackCount,
        ];
    }
}
