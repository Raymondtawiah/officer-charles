<?php

namespace App\Contracts\Admin;

interface SettingsServiceInterface
{
    public function getCreditPackages(): array;

    public function updateCreditPackages(array $packages): void;

    public function getCreditCosts(): array;

    public function updateCreditCosts(array $costs): void;

    public function getFreeCredits(): int;

    public function updateFreeCredits(int $amount): void;
}
