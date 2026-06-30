<?php

namespace App\Services\Admin;

use App\Contracts\Admin\DashboardServiceInterface;
use App\Models\CreditTransaction;
use App\Models\PaystackTransaction;
use App\Models\StripeTransaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class DashboardService implements DashboardServiceInterface
{
    public function getOverview(): array
    {
        $totalUsers = User::count();
        $activeUsers = User::whereHas('creditTransactions', function ($query) {
            $query->where('created_at', '>=', now()->subDays(30));
        })->count();

        $stripeRevenue = StripeTransaction::where('status', 'paid')
            ->sum('amount');
        $paystackRevenue = PaystackTransaction::where('status', 'success')
            ->sum('amount');

        $totalCreditsSold = CreditTransaction::where('type', 'purchase')
            ->sum('amount');
        $totalCreditsUsed = CreditTransaction::where('type', 'deduction')
            ->sum('amount');

        $totalInterviews = \App\Models\AiMessage::whereIn('mode', ['interview', 'training', 'live'])
            ->whereNotNull('completed_at')
            ->distinct('session_id')
            ->count(DB::raw('DISTINCT session_id'));

        return [
            'total_users' => $totalUsers,
            'active_users' => $activeUsers,
            'total_revenue' => $stripeRevenue + $paystackRevenue,
            'total_credits_sold' => $totalCreditsSold,
            'total_credits_used' => abs($totalCreditsUsed),
            'total_interviews_completed' => $totalInterviews,
        ];
    }
}
