<?php

namespace App\Services\Admin;

use App\Contracts\Admin\UserServiceInterface;
use App\Models\AiMessage;
use App\Models\CreditTransaction;
use App\Models\User;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Facades\DB;

class UserService implements UserServiceInterface
{
    public function listUsers(?string $search, int $perPage = 20): Paginator
    {
        $query = User::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        return $query->orderByDesc('created_at')->paginate($perPage);
    }

    public function getUserProfile(int $userId): array
    {
        $user = User::findOrFail($userId);

        $creditTransactions = CreditTransaction::where('user_id', $userId)
            ->orderByDesc('created_at')
            ->get();

        $interviewHistory = AiMessage::where('user_id', $userId)
            ->whereNotNull('completed_at')
            ->orderByDesc('created_at')
            ->get(['id', 'mode', 'visa_type', 'role', 'content', 'created_at']);

        $sessionsCompleted = AiMessage::where('user_id', $userId)
            ->whereNotNull('completed_at')
            ->distinct('session_id')
            ->count(DB::raw('DISTINCT session_id'));

        $packagesPurchased = CreditTransaction::where('user_id', $userId)
            ->where('type', 'purchase')
            ->get(['amount', 'description', 'reference', 'created_at']);

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'account_date' => $user->created_at,
            'current_credits' => $user->credits_balance,
            'sessions_completed' => $sessionsCompleted,
            'packages_purchased' => $packagesPurchased,
            'interview_history' => $interviewHistory,
            'credit_transactions' => $creditTransactions,
        ];
    }
}
