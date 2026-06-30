<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StripeTransaction extends Model
{
    protected $fillable = [
        'user_id',
        'stripe_session_id',
        'payment_intent_id',
        'amount',
        'currency',
        'status',
        'payment_method',
        'stripe_response',
        'metadata',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'user_id' => 'integer',
            'amount' => 'integer',
            'stripe_response' => 'array',
            'metadata' => 'array',
            'paid_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
