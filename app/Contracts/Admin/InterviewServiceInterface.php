<?php

namespace App\Contracts\Admin;

use Illuminate\Pagination\Paginator;

interface InterviewServiceInterface
{
    public function getInterviewStats(): array;

    public function getUserPerformance(int $perPage = 20): Paginator;
}
