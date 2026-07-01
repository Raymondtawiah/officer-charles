<?php

namespace App\Providers;

use App\Contracts\Admin\AiUsageServiceInterface;
use App\Contracts\Admin\CreditServiceInterface;
use App\Contracts\Admin\DashboardServiceInterface;
use App\Contracts\Admin\InterviewServiceInterface;
use App\Contracts\Admin\PaymentServiceInterface;
use App\Contracts\Admin\SettingsServiceInterface;
use App\Contracts\Admin\UserServiceInterface;
use App\Contracts\PaymentGatewayInterface;
use App\Services\Admin\AiUsageService;
use App\Services\Admin\CreditService;
use App\Services\Admin\DashboardService;
use App\Services\Admin\InterviewService;
use App\Services\Admin\PaymentService;
use App\Services\Admin\SettingsService;
use App\Services\Admin\UserService;
use App\Services\StripeService;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(PaymentGatewayInterface::class, StripeService::class);
        $this->app->bind(SettingsServiceInterface::class, SettingsService::class);
        $this->app->bind(DashboardServiceInterface::class, DashboardService::class);
        $this->app->bind(UserServiceInterface::class, UserService::class);
        $this->app->bind(CreditServiceInterface::class, CreditService::class);
        $this->app->bind(PaymentServiceInterface::class, PaymentService::class);
        $this->app->bind(InterviewServiceInterface::class, InterviewService::class);
        $this->app->bind(AiUsageServiceInterface::class, AiUsageService::class);
    }

    public function boot(): void
    {
        $this->configureDefaults();
    }

    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
