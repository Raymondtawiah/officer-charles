<?php

namespace App\Services\Admin;

use App\Contracts\Admin\InterviewServiceInterface;
use App\Models\AiMessage;
use App\Models\User;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Facades\DB;

class InterviewService implements InterviewServiceInterface
{
    public function getInterviewStats(): array
    {
        $chatInterviews = AiMessage::where('mode', 'interview')
            ->whereNotNull('completed_at')
            ->distinct('session_id')
            ->count(DB::raw('DISTINCT session_id'));

        $liveInterviews = AiMessage::where('mode', 'live')
            ->whereNotNull('completed_at')
            ->distinct('session_id')
            ->count(DB::raw('DISTINCT session_id'));

        $trainingSessions = AiMessage::where('mode', 'training')
            ->whereNotNull('completed_at')
            ->distinct('session_id')
            ->count(DB::raw('DISTINCT session_id'));

        $totalInterviews = $chatInterviews + $liveInterviews;

        return [
            'chat_interviews_completed' => $chatInterviews,
            'live_interviews_completed' => $liveInterviews,
            'training_sessions' => $trainingSessions,
            'real_simulation_sessions' => $liveInterviews,
            'total_interviews' => $totalInterviews,
        ];
    }

    public function getUserPerformance(int $perPage = 20): Paginator
    {
        return User::select('users.id', 'users.name', 'users.email', DB::raw('COUNT(DISTINCT ai_messages.session_id) as sessions_completed'))
            ->leftJoin('ai_messages', function ($join) {
                $join->on('users.id', '=', 'ai_messages.user_id')
                    ->whereNotNull('ai_messages.completed_at');
            })
            ->groupBy('users.id', 'users.name', 'users.email')
            ->orderByDesc('sessions_completed')
            ->paginate($perPage);
    }
}
