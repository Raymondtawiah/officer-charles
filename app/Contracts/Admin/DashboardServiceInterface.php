<?php

namespace App\Contracts\Admin;

interface DashboardServiceInterface
{
    public function getOverview(): array;
}
