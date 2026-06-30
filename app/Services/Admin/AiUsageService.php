<?php

namespace App\Services\Admin;

use App\Contracts\Admin\AiUsageServiceInterface;
use App\Models\AiMessage;
use Illuminate\Support\Facades\DB;

class AiUsageService implements AiUsageServiceInterface
{
    public function getAiUsageStats(): array
    {
        $totalMessages = AiMessage::count();
        $userMessages = AiMessage::where('role', 'user')->count();
        $assistantMessages = AiMessage::where('role', 'assistant')->count();

        $chatMessages = AiMessage::where('mode', 'interview')->count();
        $trainingMessages = AiMessage::where('mode', 'training')->count();
        $liveMessages = AiMessage::where('mode', 'live')->count();

        $estimatedInputTokens = $userMessages * 150;
        $estimatedOutputTokens = $assistantMessages * 300;
        $estimatedGeminiCost = ($estimatedInputTokens * 0.00000035) + ($estimatedOutputTokens * 0.00000070);

        $estimatedVoiceCost = $liveMessages * 0.015;
        $estimatedAvatarCost = $liveMessages * 0.025;

        return [
            'openai' => [
                'total_messages' => $totalMessages,
                'user_messages' => $userMessages,
                'assistant_messages' => $assistantMessages,
                'estimated_cost' => round($estimatedGeminiCost, 4),
                'estimated_input_tokens' => $estimatedInputTokens,
                'estimated_output_tokens' => $estimatedOutputTokens,
            ],
            'voice' => [
                'total_messages' => $liveMessages,
                'estimated_cost' => round($estimatedVoiceCost, 4),
            ],
            'avatar' => [
                'total_sessions' => AiMessage::where('mode', 'live')->distinct('session_id')->count(DB::raw('DISTINCT session_id')),
                'estimated_cost' => round($estimatedAvatarCost, 4),
            ],
            'total_estimated_cost' => round($estimatedGeminiCost + $estimatedVoiceCost + $estimatedAvatarCost, 4),
        ];
    }
}
