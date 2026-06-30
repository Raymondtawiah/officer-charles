<?php

namespace App\Services\Admin;

use App\Contracts\Admin\SettingsServiceInterface;
use App\Models\Setting;
use Illuminate\Support\Facades\Cache;

class SettingsService implements SettingsServiceInterface
{
    private function getCacheKey(string $key): string
    {
        return "admin.setting.{$key}";
    }

    public function getCreditPackages(): array
    {
        $value = Cache::remember($this->getCacheKey('credit_packages'), 3600, function () {
            $setting = Setting::where('key', 'credit_packages')->first();
            return $setting ? json_decode($setting->value, true) : $this->defaultCreditPackages();
        });

        return is_array($value) ? $value : $this->defaultCreditPackages();
    }

    public function updateCreditPackages(array $packages): void
    {
        Setting::updateOrCreate(
            ['key' => 'credit_packages'],
            ['value' => json_encode($packages), 'group' => 'credits']
        );

        Cache::forget($this->getCacheKey('credit_packages'));
    }

    public function getCreditCosts(): array
    {
        $value = Cache::remember($this->getCacheKey('credit_costs'), 3600, function () {
            $setting = Setting::where('key', 'credit_costs')->first();
            return $setting ? json_decode($setting->value, true) : $this->defaultCreditCosts();
        });

        return is_array($value) ? $value : $this->defaultCreditCosts();
    }

    public function updateCreditCosts(array $costs): void
    {
        Setting::updateOrCreate(
            ['key' => 'credit_costs'],
            ['value' => json_encode($costs), 'group' => 'credits']
        );

        Cache::forget($this->getCacheKey('credit_costs'));
    }

    public function getFreeCredits(): int
    {
        $value = Cache::remember($this->getCacheKey('free_credits'), 3600, function () {
            $setting = Setting::where('key', 'free_credits')->first();
            return $setting ? (int) $setting->value : 20;
        });

        return is_numeric($value) ? (int) $value : 20;
    }

    public function updateFreeCredits(int $amount): void
    {
        Setting::updateOrCreate(
            ['key' => 'free_credits'],
            ['value' => (string) $amount, 'group' => 'credits']
        );

        Cache::forget($this->getCacheKey('free_credits'));
    }

    private function defaultCreditPackages(): array
    {
        return [
            'starter' => [
                'amount' => 1000,
                'credits' => 100,
                'name' => 'Starter Pack - 100 Credits',
            ],
            'standard' => [
                'amount' => 2000,
                'credits' => 200,
                'name' => 'Standard Pack - 200 Credits',
            ],
        ];
    }

    private function defaultCreditCosts(): array
    {
        return [
            'training' => 2,
            'interview' => 5,
            'live' => 10,
        ];
    }
}
