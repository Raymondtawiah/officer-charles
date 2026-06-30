<?php

namespace App\Contracts;

interface PaymentGatewayInterface
{
    public function initialize(array $payload): array;

    public function verify(string $reference): array;

    public function handleWebhook(array $payload, ?string $signature = null): array;
}
