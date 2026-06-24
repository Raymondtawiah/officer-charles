<?php

use App\Models\AiMessage;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

test('ai message validates mode and visa type', function () {
    $response = $this->postJson('/api/ai/messages', [
        'content' => 'My answer',
        'mode' => 'invalid',
        'visa_type' => 'tourist',
    ]);

    $response
        ->assertStatus(422)
        ->assertJsonValidationErrors(['mode', 'visa_type']);
});

test('ai message stores selected visa type and calls gemini', function () {
    Http::fake([
        'generativelanguage.googleapis.com/*' => Http::response([
            'candidates' => [
                [
                    'content' => [
                        'parts' => [
                            ['text' => 'Good morning. Please provide your passport.'],
                        ],
                    ],
                ],
            ],
        ], 200),
    ]);

    $response = $this->postJson('/api/ai/messages', [
        'content' => 'Start my interview.',
        'mode' => 'interview',
        'visa_type' => 'b1_b2',
    ]);

    $response->assertCreated();

    expect(AiMessage::where('role', 'user')->first()->visa_type)->toBe('b1_b2')
        ->and(AiMessage::where('role', 'assistant')->first()->visa_type)->toBe('b1_b2');

    Http::assertSent(fn ($request) => str_contains($request->url(), 'generativelanguage.googleapis.com')
        && $request['contents'][0]['parts'][0]['text'] === 'Start my interview.'
        && str_contains($request['systemInstruction']['parts'][0]['text'], 'APPLICATION SELECTION OVERRIDE')
        && str_contains($request['systemInstruction']['parts'][0]['text'], 'MODE: REAL INTERVIEW SIMULATION')
        && str_contains($request['systemInstruction']['parts'][0]['text'], 'DO NOT:')
        && str_contains($request['systemInstruction']['parts'][0]['text'], 'Good morning. Please provide your passport.')
        && ! str_contains($request['systemInstruction']['parts'][0]['text'], 'Strengths:'));
});

test('training chat prompt follows pdf retry format and does not advance after strong answers', function () {
    Http::fake([
        'generativelanguage.googleapis.com/*' => Http::response([
            'candidates' => [
                [
                    'content' => [
                        'parts' => [
                            ['text' => "Strengths:\n- Clear goal.\n\nWeaknesses:\n- Needs detail.\n\nImprovement Suggestions:\n- Add sponsor details.\n\nRetry:\nPlease answer the same question again."],
                        ],
                    ],
                ],
            ],
        ], 200),
    ]);

    $response = $this->postJson('/api/ai/messages', [
        'content' => 'My parents will pay.',
        'mode' => 'training',
        'visa_type' => 'f1',
    ]);

    $response->assertCreated();

    Http::assertSent(fn ($request) => str_contains($request->url(), 'generativelanguage.googleapis.com')
        && str_contains($request['systemInstruction']['parts'][0]['text'], 'MODE: TRAINING SESSION')
        && str_contains($request['systemInstruction']['parts'][0]['text'], 'Strengths:')
        && str_contains($request['systemInstruction']['parts'][0]['text'], 'Weaknesses:')
        && str_contains($request['systemInstruction']['parts'][0]['text'], 'Improvement Suggestions:')
        && str_contains($request['systemInstruction']['parts'][0]['text'], 'Retry:')
        && str_contains($request['systemInstruction']['parts'][0]['text'], 'Ask the applicant to answer the same question again.')
        && ! str_contains($request['systemInstruction']['parts'][0]['text'], 'ask the next appropriate interview question'));
});

test('real simulation asks for final report only after target interview turns', function () {
    Http::fake([
        'generativelanguage.googleapis.com/*' => Http::response([
            'candidates' => [
                [
                    'content' => [
                        'parts' => [
                            ['text' => "Interview Performance Report\n\nOverall Performance Score: 75%\n\nWhat Went Well\n- Clear answers.\n\nAreas To Improve\n- Add detail."],
                        ],
                    ],
                ],
            ],
        ], 200),
    ]);

    $visitorId = (string) Str::uuid();
    $sessionId = (string) Str::uuid();

    for ($index = 0; $index < 12; $index++) {
        AiMessage::create([
            'visitor_id' => $visitorId,
            'session_id' => $sessionId,
            'role' => 'assistant',
            'content' => 'Officer question '.($index + 1).'? ',
            'mode' => 'interview',
            'visa_type' => 'b1_b2',
        ]);
    }

    $response = $this
        ->withCredentials()
        ->withUnencryptedCookie('officer_charles_visitor', $visitorId)
        ->withUnencryptedCookie('officer_charles_session_interview_b1_b2', $sessionId)
        ->postJson('/api/ai/messages', [
            'content' => 'That is all.',
            'mode' => 'interview',
            'visa_type' => 'b1_b2',
        ]);

    $response
        ->assertCreated()
        ->assertJson(['session_completed' => true]);

    Http::assertSent(fn ($request) => str_contains($request->url(), 'generativelanguage.googleapis.com')
        && str_contains($request['systemInstruction']['parts'][0]['text'], 'FINAL REPORT NOW')
        && str_contains($request['systemInstruction']['parts'][0]['text'], 'Interview Performance Report')
        && str_contains($request['systemInstruction']['parts'][0]['text'], 'personal coaching message')
        && str_contains($request['systemInstruction']['parts'][0]['text'], 'B1/B2 VISITOR VISA'));
});

test('gemini failure keeps the user answer saved', function () {
    Http::fake([
        'generativelanguage.googleapis.com/*' => Http::response(['error' => ['message' => 'Bad key']], 401),
    ]);

    $response = $this->postJson('/api/ai/messages', [
        'content' => 'This answer should remain saved.',
        'mode' => 'training',
        'visa_type' => 'f1',
    ]);

    $response->assertStatus(502);

    expect(AiMessage::where('role', 'user')->count())->toBe(1)
        ->and(AiMessage::where('role', 'assistant')->count())->toBe(0);
});

test('live session calls core v2', function () {
    Http::fake([
        '127.0.0.1:8010/sessions' => Http::response(['session_id' => 'live-session-1'], 200),
    ]);

    $response = $this->postJson('/api/ai/live-session', [
        'mode' => 'interview',
        'visa_type' => 'f1',
    ]);

    $response
        ->assertOk()
        ->assertJson([
            'session_id' => 'live-session-1',
            'ws_url' => 'ws://127.0.0.1:8010/ws/live-session-1',
        ]);

    Http::assertSent(fn ($request) => $request->url() === 'http://127.0.0.1:8010/sessions'
        && $request['mode'] === 'interview'
        && $request['visa_type'] === 'f1');
});

test('restart closes only the selected mode and visa session', function () {
    $visitorId = (string) Str::uuid();
    $f1Session = (string) Str::uuid();
    $visitorSession = (string) Str::uuid();

    AiMessage::create([
        'visitor_id' => $visitorId,
        'session_id' => $f1Session,
        'role' => 'user',
        'content' => 'F1 answer',
        'mode' => 'training',
        'visa_type' => 'f1',
    ]);

    AiMessage::create([
        'visitor_id' => $visitorId,
        'session_id' => $visitorSession,
        'role' => 'user',
        'content' => 'Visitor answer',
        'mode' => 'training',
        'visa_type' => 'b1_b2',
    ]);

    $response = $this
        ->withCredentials()
        ->withUnencryptedCookie('officer_charles_visitor', $visitorId)
        ->withUnencryptedCookie('officer_charles_session_training_f1', $f1Session)
        ->postJson('/api/ai/restart', [
            'mode' => 'training',
            'visa_type' => 'f1',
        ]);

    $response->assertOk();

    expect(AiMessage::where('session_id', $f1Session)->first()->completed_at)->not->toBeNull()
        ->and(AiMessage::where('session_id', $visitorSession)->first()->completed_at)->toBeNull();
});

test('chat session resets after five minutes without a user answer', function () {
    Http::fake([
        'generativelanguage.googleapis.com/*' => Http::response([
            'candidates' => [
                [
                    'content' => [
                        'parts' => [
                            ['text' => 'Good morning. Please provide your passport and your Form I-20.'],
                        ],
                    ],
                ],
            ],
        ], 200),
    ]);

    $visitorId = (string) Str::uuid();
    $oldSession = (string) Str::uuid();

    $oldMessage = AiMessage::create([
        'visitor_id' => $visitorId,
        'session_id' => $oldSession,
        'role' => 'assistant',
        'content' => 'Why do you want to study in the United States?',
        'mode' => 'interview',
        'visa_type' => 'f1',
    ]);

    AiMessage::whereKey($oldMessage->id)->update([
        'created_at' => now()->subMinutes(6),
        'updated_at' => now()->subMinutes(6),
    ]);

    $response = $this
        ->withCredentials()
        ->withUnencryptedCookie('officer_charles_visitor', $visitorId)
        ->withUnencryptedCookie('officer_charles_session_interview_f1', $oldSession)
        ->postJson('/api/ai/messages', [
            'content' => 'I want to study computer science.',
            'mode' => 'interview',
            'visa_type' => 'f1',
        ]);

    $response
        ->assertCreated()
        ->assertJson(['session_reset' => true]);

    expect(AiMessage::where('session_id', $oldSession)->first()->completed_at)->not->toBeNull()
        ->and($response->json('user.session_id'))->not->toBe($oldSession);
});
