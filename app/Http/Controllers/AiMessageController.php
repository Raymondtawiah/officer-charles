<?php

namespace App\Http\Controllers;

use App\Models\AiMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class AiMessageController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'content' => ['required', 'string', 'max:10000'],
            'mode' => ['nullable', 'string', 'in:training,interview'],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $mode = $request->input('mode', 'interview');

        $history = AiMessage::orderBy('created_at', 'asc')
            ->get(['role', 'content'])
            ->toArray();

        $userMessage = AiMessage::create([
            'role' => 'user',
            'content' => $request->input('content'),
            'mode' => $mode,
        ]);

        $response = $this->callAi($request->input('content'), $history, $mode);

        $assistantMessage = AiMessage::create([
            'role' => 'assistant',
            'content' => $response,
            'mode' => $mode,
        ]);

        return response()->json([
            'user' => $userMessage,
            'assistant' => $assistantMessage,
        ], 201);
    }

    public function index(Request $request): JsonResponse
    {
        $messages = AiMessage::orderBy('created_at', 'asc')
            ->get(['id', 'role', 'content', 'agent_id', 'created_at', 'mode']);

        return response()->json($messages);
    }

    private function callAi(string $userMessage, array $history, string $mode): string
    {
        $assistantCount = collect($history)->where('role', 'assistant')->count();
        $systemPrompt = $this->buildSystemPrompt($mode, $assistantCount, empty($history));

        $messages = [
            ['role' => 'system', 'content' => $systemPrompt],
        ];

        foreach ($history as $msg) {
            $messages[] = [
                'role' => $msg['role'],
                'content' => $msg['content'],
            ];
        }

        $messages[] = ['role' => 'user', 'content' => $userMessage];

        $response = $this->callFoundryApi($messages);

        if (str_starts_with($response, 'Sorry, I encountered an error')) {
            $response = $this->callGeminiApi($messages);
        }

        return $response;
    }

    private function buildSystemPrompt(string $mode, int $assistantCount, bool $isEmpty): string
    {
        if ($mode === 'training') {
            $start = $isEmpty
                ? "You are a friendly US visa officer helping a student practice for their F-1 student visa interview.\n\nStart by introducing yourself briefly and asking your first question."
                : "";

            return $start . "\n\nYour role:\n- Ask relevant student visa interview questions\n- After each answer, provide constructive feedback to help the student improve\n- Be encouraging but honest\n\nFor each student answer, respond in this exact format:\n\nScore: X/100\n\nFeedback: [One sentence about the main problem with their answer]\n\nImprove: [Bullet points of specific things they should mention]\n- [Specific suggestion 1]\n- [Specific suggestion 2]\n\nNext: [The next interview question]\n\nExample:\nScore: 30/100\n\nFeedback: Your answer is too short and doesn't show clear academic purpose.\n\nImprove:\n- Mention the specific program and university\n- Explain career goals after graduation\n- Connect studies to opportunities in your home country\n\nNext: What specific program are you applying for and why does it interest you?\n\nKeep questions realistic for a US student visa interview. Cover: study plans, university choice, career goals, financial support, home country ties, post-graduation plans.";
        }

        $shouldReport = $assistantCount >= 12;

        if ($shouldReport) {
            return "You are a strict US visa officer conducting a real F-1 student visa interview simulation.\n\nThe interview is now complete (approximately 12 questions). Provide a final performance report in this format:\n\n=== FINAL REPORT ===\n\nOverall Score: X/100\n\nStrengths:\n- [Strength 1]\n- [Strength 2]\n\nConcerns:\n- [Concern 1]\n- [Concern 2]\n\nRisk Areas:\n- [Risk area 1]\n\nRecommendations:\n- [Recommendation 1]\n- [Recommendation 2]\n\nBe realistic and fair in your assessment.";
        }

        $start = $isEmpty
            ? "You are a strict US visa officer conducting a real F-1 student visa interview simulation.\n\nStart by introducing yourself and asking your first question naturally."
            : "";

        return $start . "\n\nRules:\n- Ask ONE question at a time\n- NEVER provide feedback, hints, or examples during the interview\n- Be realistic, professional, and sometimes probing\n- This is a real interview simulation - the student must answer convincingly\n\nAsk questions relevant to F-1 student visa interviews: study plans, university choice, career goals, financial support, home country ties, post-graduation plans.\n\nDo NOT say 'Next question:' or provide any meta-commentary. Just ask the question naturally.";
    }

    private function callFoundryApi(array $messages): string
    {
        $endpoint = config('services.foundry.endpoint');
        $apiKey = config('services.foundry.api_key');
        $agentId = config('services.foundry.agent_id');

        $url = str_replace(
            ['{AGENT_ID}'],
            [$agentId],
            $endpoint
        ) . '?api-version=' . config('services.foundry.api_version', '1');

        $response = Http::withHeaders([
            'api-key' => $apiKey,
            'Content-Type' => 'application/json',
        ])->post($url, [
            'messages' => $messages,
        ]);

        if ($response->failed()) {
            Log::error('Foundry API error', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            return 'Sorry, I encountered an error processing your request. Status: ' . $response->status();
        }

        $data = $response->json();

        return $data['choices'][0]['message']['content'] ?? $data['output'][0]['content'][0]['text'] ?? 'No response received.';
    }

    private function callGeminiApi(array $messages): string
    {
        $apiKey = config('services.gemini.api_key');
        $model = config('services.gemini.model', 'gemini-2.0-flash');

        $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}";

        $systemInstruction = null;
        $contents = [];

        foreach ($messages as $msg) {
            if ($msg['role'] === 'system') {
                $systemInstruction = $msg['content'];
                continue;
            }

            $role = $msg['role'] === 'assistant' ? 'model' : 'user';
            $contents[] = [
                'role' => $role,
                'parts' => [['text' => $msg['content']]],
            ];
        }

        $payload = ['contents' => $contents];

        if ($systemInstruction) {
            $payload['systemInstruction'] = ['parts' => [['text' => $systemInstruction]]];
        }

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
        ])->post($url, $payload);

        if ($response->failed()) {
            return 'Sorry, I encountered an error processing your request. Status: ' . $response->status();
        }

        $data = $response->json();

        return $data['candidates'][0]['content']['parts'][0]['text'] ?? 'No response received.';
    }
}
