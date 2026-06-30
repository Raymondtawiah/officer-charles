<?php

namespace App\Contracts\Admin;

use Illuminate\Pagination\Paginator;

interface PaymentServiceInterface
{
    public function getPaymentHistory(?int $userId = null, int $perPage = 20): Paginator;

    public function getRevenueStats(): array;
}
