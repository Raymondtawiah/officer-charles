<?php

namespace App\Services\Admin;

use App\Contracts\Admin\CreditServiceInterface;
use App\Models\CreditTransaction;
use App\Models\User;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Facades\DB;

class CreditService implements CreditServiceInterface
{
    public function getCreditStats(): array
    {
        $totalIssued = CreditTransaction::where('type', 'purchase')
            ->sum('amount');

        $totalUsed = CreditTransaction::where('type', 'deduction')
            ->sum('amount');

        return [
            'total_issued' => $totalIssued,
            'total_used' => abs($totalUsed),
        ];
    }

    public function getTransactionHistory(?int $userId = null, int $perPage = 20): Paginator
    {
        $query = CreditTransaction::query()->with('user');

        if ($userId) {
            $query->where('user_id', $userId);
        }

        return $query->orderByDesc('created_at')->paginate($perPage);
    }

    public function addCredits(int $userId, int $amount, ?string $description = null): array
    {
        $user = User::findOrFail($userId);
        $newBalance = $user->credits_balance + $amount;

        $user->update(['credits_balance' => $newBalance]);

        CreditTransaction::create([
            'user_id' => $userId,
            'type' => 'purchase',
            'amount' => $amount,
            'balance_after' => $newBalance,
            'description' => $description ?? 'Manual credit addition by admin',
        ]);

        return [
            'user_id' => $userId,
            'amount_added' => $amount,
            'new_balance' => $newBalance,
        ];
    }

    public function removeCredits(int $userId, int $amount, ?string $description = null): array
    {
        $user = User::findOrFail($userId);

        if ($user->credits_balance < $amount) {
            throw new \InvalidArgumentException('Insufficient credits to remove');
        }

        $newBalance = $user->credits_balance - $amount;

        $user->update(['credits_balance' => $newBalance]);

        CreditTransaction::create([
            'user_id' => $userId,
            'type' => 'deduction',
            'amount' => -$amount,
            'balance_after' => $newBalance,
            'description' => $description ?? 'Manual credit removal by admin',
        ]);

        return [
            'user_id' => $userId,
            'amount_removed' => $amount,
            'new_balance' => $newBalance,
        ];
    }
}
