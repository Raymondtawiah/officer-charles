<?php

namespace App\Contracts\Admin;

use Illuminate\Pagination\Paginator;

interface CreditServiceInterface
{
    public function getCreditStats(): array;

    public function getTransactionHistory(?int $userId = null, int $perPage = 20): Paginator;

    public function addCredits(int $userId, int $amount, ?string $description = null): array;

    public function removeCredits(int $userId, int $amount, ?string $description = null): array;
}
