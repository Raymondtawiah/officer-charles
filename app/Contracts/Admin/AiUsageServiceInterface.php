<?php

namespace App\Contracts\Admin;

interface AiUsageServiceInterface
{
    public function getAiUsageStats(): array;
}
