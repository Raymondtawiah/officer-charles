<?php

namespace App\Http\Controllers;

use App\Models\AiMessage;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AiMessageController extends Controller
{
    private const SESSION_TARGET = 12;

    private const INACTIVITY_TIMEOUT_MINUTES = 5;

    private const VISITOR_COOKIE = 'officer_charles_visitor';

    private const SESSION_COOKIE_PREFIX = 'officer_charles_session_';

    private const MODES = ['training', 'interview'];

    private const VISA_TYPES = ['f1', 'b1_b2'];

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'content' => ['required', 'string', 'max:10000'],
            'mode' => ['nullable', 'string', 'in:training,interview'],
            'visa_type' => ['nullable', 'string', 'in:f1,b1_b2'],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $mode = $request->input('mode', 'interview');
        $visaType = $request->input('visa_type', 'f1');
        $visitorId = $this->visitorId($request);
        $activeSession = $this->activeSession($request, $visitorId, $mode, $visaType);
        $sessionId = $activeSession['session_id'];

        $history = AiMessage::where('visitor_id', $visitorId)
            ->where('session_id', $sessionId)
            ->where('mode', $mode)
            ->where('visa_type', $visaType)
            ->whereNull('completed_at')
            ->orderBy('created_at', 'asc')
            ->get(['role', 'content'])
            ->toArray();

        $userMessage = AiMessage::create([
            'visitor_id' => $visitorId,
            'session_id' => $sessionId,
            'role' => 'user',
            'content' => $request->input('content'),
            'mode' => $mode,
            'visa_type' => $visaType,
        ]);

        try {
            $response = $this->callGemini($request->input('content'), $history, $mode, $visaType);
        } catch (\RuntimeException $exception) {
            Log::error('Gemini response error', ['message' => $exception->getMessage()]);

            return $this->withSessionCookies(response()->json([
                'message' => $exception->getMessage(),
                'user' => $userMessage,
            ], 502), $visitorId, $mode, $visaType, $sessionId);
        }

        $assistantMessage = AiMessage::create([
            'visitor_id' => $visitorId,
            'session_id' => $sessionId,
            'role' => 'assistant',
            'content' => $response,
            'mode' => $mode,
            'visa_type' => $visaType,
        ]);

        $nextSessionId = $sessionId;
        $sessionCompleted = false;

        if ($this->isSessionComplete($mode, $response, $history)) {
            AiMessage::where('visitor_id', $visitorId)
                ->where('session_id', $sessionId)
                ->where('mode', $mode)
                ->where('visa_type', $visaType)
                ->update(['completed_at' => now()]);

            $nextSessionId = (string) Str::uuid();
            $sessionCompleted = true;
        }

        return $this->withSessionCookies(response()->json([
            'user' => $userMessage,
            'assistant' => $assistantMessage,
            'session_completed' => $sessionCompleted,
            'session_reset' => $activeSession['timed_out'],
        ], 201), $visitorId, $mode, $visaType, $nextSessionId);
    }

    public function index(Request $request): JsonResponse
    {
        $visitorId = $this->visitorId($request);
        $sessionMap = [];

        foreach (self::MODES as $mode) {
            foreach (self::VISA_TYPES as $visaType) {
                $sessionMap[] = [
                    'mode' => $mode,
                    'visa_type' => $visaType,
                    'session_id' => $this->activeSession($request, $visitorId, $mode, $visaType)['session_id'],
                ];
            }
        }

        $messages = AiMessage::where('visitor_id', $visitorId)
            ->whereNull('completed_at')
            ->where(function ($query) use ($sessionMap) {
                foreach ($sessionMap as $session) {
                    $query->orWhere(fn ($item) => $item
                        ->where('mode', $session['mode'])
                        ->where('visa_type', $session['visa_type'])
                        ->where('session_id', $session['session_id']));
                }
            })
            ->orderBy('created_at', 'asc')
            ->get(['id', 'role', 'content', 'agent_id', 'created_at', 'mode', 'visa_type']);

        return $this->withAllSessionCookies(response()->json($messages), $visitorId, $sessionMap);
    }

    public function restart(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'mode' => ['required', 'string', 'in:training,interview'],
            'visa_type' => ['nullable', 'string', 'in:f1,b1_b2'],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $mode = $request->input('mode');
        $visaType = $request->input('visa_type', 'f1');
        $visitorId = $this->visitorId($request);
        $sessionId = $this->activeSession($request, $visitorId, $mode, $visaType)['session_id'];

        AiMessage::where('visitor_id', $visitorId)
            ->where('session_id', $sessionId)
            ->where('mode', $mode)
            ->where('visa_type', $visaType)
            ->whereNull('completed_at')
            ->update(['completed_at' => now()]);

        return $this->withSessionCookies(response()->json([
            'messages' => [],
            'session_restarted' => true,
        ]), $visitorId, $mode, $visaType, (string) Str::uuid());
    }

    public function liveSession(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'mode' => ['required', 'string', 'in:training,interview'],
            'visa_type' => ['required', 'string', 'in:f1,b1_b2'],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $visitorId = $this->visitorId($request);
        $response = Http::timeout(20)
            ->acceptJson()
            ->post($this->coreV2BaseUrl().'/sessions', [
                'mode' => $request->input('mode'),
                'visa_type' => $request->input('visa_type'),
                'visitor_id' => $visitorId,
            ]);

        if ($response->failed()) {
            Log::error('Core V2 live session error', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return response()->json([
                'message' => 'Could not start the live interview service.',
            ], 502);
        }

        $sessionId = $response->json('session_id');

        return $this->withVisitorCookie(response()->json([
            'session_id' => $sessionId,
            'ws_url' => rtrim(config('services.core_v2.ws_public_url'), '/').'/ws/'.$sessionId,
        ]), $visitorId);
    }

    private function callGemini(string $userMessage, array $history, string $mode, string $visaType): string
    {
        if (! filled(config('services.gemini.api_key'))) {
            throw new \RuntimeException('Gemini API key is not configured.');
        }

        $assistantCount = collect($history)->where('role', 'assistant')->count();
        $messages = [
            ['role' => 'system', 'content' => $this->buildSystemPrompt($mode, $visaType, $assistantCount, empty($history))],
        ];

        foreach ($history as $message) {
            $messages[] = [
                'role' => $message['role'],
                'content' => $message['content'],
            ];
        }

        $messages[] = ['role' => 'user', 'content' => $userMessage];

        return $this->callGeminiApi($messages);
    }

    private function buildSystemPrompt(string $mode, string $visaType, int $assistantCount, bool $isEmpty): string
    {
        $sections = [
            $this->corePrompt('identity'),
            $this->corePrompt('start_conversation'),
            $this->selectionOverride($mode, $visaType),
            $this->corePrompt($mode === 'training' ? 'training_mode' : 'real_interview_mode'),
            $this->corePrompt($visaType === 'b1_b2' ? 'b1_b2_visitor_visa' : 'f1_student_visa'),
            $this->corePrompt('voice_style'),
        ];

        if ($mode === 'training') {
            if ($isEmpty) {
                $sections[] = 'START NOW: Begin with the exact selected visa opening, then ask the first realistic question. Do not provide feedback until the applicant answers.';
            }

            $sections[] = "TRAINING RESPONSE FORMAT:\nStrengths:\n- ...\n\nWeaknesses:\n- ...\n\nImprovement Suggestions:\n- ...\n\nRetry:\n[Ask the applicant to answer the same question again.]";

            return implode("\n\n---\n\n", $sections);
        }

        $shouldReport = $assistantCount >= self::SESSION_TARGET;

        if ($shouldReport) {
            $sections[] = $this->corePrompt('evaluation');
            $sections[] = $this->corePrompt('motivation');
            $sections[] = 'FINAL REPORT NOW: The real interview target has been reached. Do not ask another interview question. Create the Interview Performance Report and personal coaching message now.';

            return implode("\n\n---\n\n", $sections);
        }

        $sections[] = $this->corePrompt('evaluation');
        $sections[] = $this->corePrompt('motivation');
        $sections[] = "REAL INTERVIEW COMPLETION CONTROL:\n- The target interview length is ".self::SESSION_TARGET." officer questions.\n- Track the number of officer questions asked in this conversation.\n- Assistant responses already given in this session: {$assistantCount}.\n- Questions remaining before final evaluation: ".max(self::SESSION_TARGET - $assistantCount, 0).".\n- If the target is reached, provide the Interview Performance Report and motivational message now.\n- Otherwise ask exactly one realistic next question.";

        if ($isEmpty) {
            $sections[] = 'START NOW: Begin with the exact selected visa opening. Ask only that opening/first officer prompt and no feedback.';
        }

        return implode("\n\n---\n\n", $sections);
    }

    private function corePrompt(string $name): string
    {
        $path = base_path("core_v2/prompts/{$name}.md");

        if (! File::exists($path)) {
            throw new \RuntimeException("Core prompt file [{$name}] is missing.");
        }

        return trim(File::get($path));
    }

    private function selectionOverride(string $mode, string $visaType): string
    {
        return "APPLICATION SELECTION OVERRIDE:\n"
            .'The app has already selected mode and visa type. Do not ask the user to choose mode or visa type again. '
            .'Start and continue directly as '.($mode === 'training' ? 'Training Session' : 'Real Interview Simulation').' for '
            .($visaType === 'b1_b2' ? 'B1/B2 Visitor Visa' : 'F-1 Student Visa').'.';
    }

    private function callGeminiApi(array $messages): string
    {
        $apiKey = config('services.gemini.api_key');
        $models = collect([
            config('services.gemini.model', 'gemini-2.5-flash'),
            config('services.gemini.fallback_model', 'gemini-2.0-flash-lite'),
        ])
            ->filter()
            ->unique()
            ->values();

        $systemInstruction = null;
        $contents = [];

        foreach ($messages as $message) {
            if ($message['role'] === 'system') {
                $systemInstruction = $message['content'];

                continue;
            }

            $contents[] = [
                'role' => $message['role'] === 'assistant' ? 'model' : 'user',
                'parts' => [['text' => $message['content']]],
            ];
        }

        $payload = ['contents' => $contents];

        if ($systemInstruction) {
            $payload['systemInstruction'] = ['parts' => [['text' => $systemInstruction]]];
        }

        foreach ($models as $model) {
            $response = $this->postGeminiRequest((string) $model, (string) $apiKey, $payload);

            if ($response->successful()) {
                return $response->json('candidates.0.content.parts.0.text') ?? 'No response received.';
            }

            Log::error('Gemini API error', [
                'model' => $model,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            if (! in_array($response->status(), [429, 503, 504], true)) {
                throw new \RuntimeException('Sorry, I could not connect to the AI provider. Please check the Gemini API key and model settings.');
            }
        }

        throw new \RuntimeException('The AI provider is temporarily busy. Please wait a few seconds and send your answer again.');
    }

    private function postGeminiRequest(string $model, string $apiKey, array $payload)
    {
        $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key=".urlencode($apiKey);

        return Http::retry(3, 700, fn ($exception) => $exception instanceof RequestException
            && $exception->response
            && in_array($exception->response->status(), [429, 503, 504], true), throw: false)
            ->timeout(45)
            ->withHeaders([
                'Content-Type' => 'application/json',
            ])
            ->post($url, $payload);
    }

    private function coreV2BaseUrl(): string
    {
        return rtrim(config('services.core_v2.base_url'), '/');
    }

    private function visitorId(Request $request): string
    {
        $visitorId = $request->cookie(self::VISITOR_COOKIE);

        return is_string($visitorId) && Str::isUuid($visitorId) ? $visitorId : (string) Str::uuid();
    }

    /**
     * @return array{session_id: string, timed_out: bool}
     */
    private function activeSession(Request $request, string $visitorId, string $mode, string $visaType): array
    {
        $cookieName = $this->sessionCookieName($mode, $visaType);
        $sessionId = $request->cookie($cookieName);

        if (is_string($sessionId) && Str::isUuid($sessionId)) {
            $hasCompletedMessages = AiMessage::where('visitor_id', $visitorId)
                ->where('session_id', $sessionId)
                ->where('mode', $mode)
                ->where('visa_type', $visaType)
                ->whereNotNull('completed_at')
                ->exists();

            if (! $hasCompletedMessages) {
                if ($this->sessionTimedOut($visitorId, $sessionId, $mode, $visaType)) {
                    $this->completeSession($visitorId, $sessionId, $mode, $visaType);

                    return ['session_id' => (string) Str::uuid(), 'timed_out' => true];
                }

                return ['session_id' => $sessionId, 'timed_out' => false];
            }
        }

        $existingSessionId = AiMessage::where('visitor_id', $visitorId)
            ->where('mode', $mode)
            ->where('visa_type', $visaType)
            ->whereNull('completed_at')
            ->latest('created_at')
            ->value('session_id');

        if (is_string($existingSessionId) && Str::isUuid($existingSessionId)) {
            if ($this->sessionTimedOut($visitorId, $existingSessionId, $mode, $visaType)) {
                $this->completeSession($visitorId, $existingSessionId, $mode, $visaType);

                return ['session_id' => (string) Str::uuid(), 'timed_out' => true];
            }

            return ['session_id' => $existingSessionId, 'timed_out' => false];
        }

        return ['session_id' => (string) Str::uuid(), 'timed_out' => false];
    }

    private function sessionTimedOut(string $visitorId, string $sessionId, string $mode, string $visaType): bool
    {
        $latestMessage = AiMessage::where('visitor_id', $visitorId)
            ->where('session_id', $sessionId)
            ->where('mode', $mode)
            ->where('visa_type', $visaType)
            ->whereNull('completed_at')
            ->latest('created_at')
            ->first(['role', 'created_at']);

        return $latestMessage?->role === 'assistant'
            && $latestMessage->created_at->lte(now()->subMinutes(self::INACTIVITY_TIMEOUT_MINUTES));
    }

    private function completeSession(string $visitorId, string $sessionId, string $mode, string $visaType): void
    {
        AiMessage::where('visitor_id', $visitorId)
            ->where('session_id', $sessionId)
            ->where('mode', $mode)
            ->where('visa_type', $visaType)
            ->whereNull('completed_at')
            ->update(['completed_at' => now()]);
    }

    private function withAllSessionCookies(JsonResponse $response, string $visitorId, array $sessionMap): JsonResponse
    {
        $this->withVisitorCookie($response, $visitorId);

        foreach ($sessionMap as $session) {
            $this->queueCookie($response, $this->sessionCookieName($session['mode'], $session['visa_type']), $session['session_id']);
        }

        return $response;
    }

    private function withSessionCookies(
        JsonResponse $response,
        string $visitorId,
        string $mode,
        string $visaType,
        string $sessionId,
    ): JsonResponse {
        $this->withVisitorCookie($response, $visitorId);
        $this->queueCookie($response, $this->sessionCookieName($mode, $visaType), $sessionId);

        return $response;
    }

    private function withVisitorCookie(JsonResponse $response, string $visitorId): JsonResponse
    {
        $this->queueCookie($response, self::VISITOR_COOKIE, $visitorId);

        return $response;
    }

    private function queueCookie(JsonResponse $response, string $name, string $value): void
    {
        $minutes = 60 * 24 * 365;

        $response->cookie($name, $value, $minutes, '/', null, false, true, false, 'lax');
    }

    private function sessionCookieName(string $mode, string $visaType): string
    {
        return self::SESSION_COOKIE_PREFIX.$mode.'_'.$visaType;
    }

    private function isSessionComplete(string $mode, string $assistantResponse, array $history): bool
    {
        if (str_contains($assistantResponse, 'FINAL REPORT') || str_contains($assistantResponse, 'Performance Report')) {
            return true;
        }

        return false;
    }
}
