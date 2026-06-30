<?php

namespace App\Contracts\Admin;

use Illuminate\Pagination\Paginator;

interface UserServiceInterface
{
    public function listUsers(?string $search, int $perPage = 20): Paginator;

    public function getUserProfile(int $userId): array;
}
