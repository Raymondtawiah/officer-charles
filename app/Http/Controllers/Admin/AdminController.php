<?php

namespace App\Http\Controllers\Admin;

use App\Contracts\Admin\AiUsageServiceInterface;
use App\Contracts\Admin\CreditServiceInterface;
use App\Contracts\Admin\DashboardServiceInterface;
use App\Contracts\Admin\InterviewServiceInterface;
use App\Contracts\Admin\PaymentServiceInterface;
use App\Contracts\Admin\SettingsServiceInterface;
use App\Contracts\Admin\UserServiceInterface;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function __construct(
        protected DashboardServiceInterface $dashboard,
        protected UserServiceInterface $users,
        protected CreditServiceInterface $credits,
        protected PaymentServiceInterface $payments,
        protected InterviewServiceInterface $interviews,
        protected AiUsageServiceInterface $aiUsage,
        protected SettingsServiceInterface $settings,
    ) {}

    public function overview(): JsonResponse
    {
        return response()->json($this->dashboard->getOverview());
    }

    public function users(Request $request): JsonResponse
    {
        $search = $request->query('search');
        $perPage = (int) ($request->query('per_page', 20));

        return response()->json($this->users->listUsers($search, $perPage));
    }

    public function userProfile(int $userId): JsonResponse
    {
        return response()->json($this->users->getUserProfile($userId));
    }

    public function creditStats(): JsonResponse
    {
        return response()->json($this->credits->getCreditStats());
    }

    public function creditTransactions(Request $request): JsonResponse
    {
        $userId = $request->query('user_id');
        $perPage = (int) ($request->query('per_page', 20));

        return response()->json($this->credits->getTransactionHistory($userId, $perPage));
    }

    public function addCredits(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'amount' => ['required', 'integer', 'min:1'],
            'description' => ['nullable', 'string', 'max:255'],
        ]);

        $result = $this->credits->addCredits(
            $request->input('user_id'),
            $request->input('amount'),
            $request->input('description')
        );

        return response()->json($result, 201);
    }

    public function removeCredits(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'amount' => ['required', 'integer', 'min:1'],
            'description' => ['nullable', 'string', 'max:255'],
        ]);

        $result = $this->credits->removeCredits(
            $request->input('user_id'),
            $request->input('amount'),
            $request->input('description')
        );

        return response()->json($result);
    }

    public function paymentHistory(Request $request): JsonResponse
    {
        $userId = $request->query('user_id');
        $perPage = (int) ($request->query('per_page', 20));

        return response()->json($this->payments->getPaymentHistory($userId, $perPage));
    }

    public function revenueStats(): JsonResponse
    {
        return response()->json($this->payments->getRevenueStats());
    }

    public function interviewStats(): JsonResponse
    {
        return response()->json($this->interviews->getInterviewStats());
    }

    public function userPerformance(Request $request): JsonResponse
    {
        $perPage = (int) ($request->query('per_page', 20));

        return response()->json($this->interviews->getUserPerformance($perPage));
    }

    public function aiUsageStats(): JsonResponse
    {
        return response()->json($this->aiUsage->getAiUsageStats());
    }

    public function getCreditPackages(): JsonResponse
    {
        return response()->json($this->settings->getCreditPackages());
    }

    public function updateCreditPackages(Request $request): JsonResponse
    {
        $request->validate([
            'packages' => ['required', 'array'],
        ]);

        $this->settings->updateCreditPackages($request->input('packages'));

        return response()->json([
            'message' => 'Credit packages updated successfully',
            'packages' => $this->settings->getCreditPackages(),
        ]);
    }

    public function getCreditCosts(): JsonResponse
    {
        return response()->json($this->settings->getCreditCosts());
    }

    public function updateCreditCosts(Request $request): JsonResponse
    {
        $request->validate([
            'costs' => ['required', 'array'],
        ]);

        $this->settings->updateCreditCosts($request->input('costs'));

        return response()->json([
            'message' => 'Credit costs updated successfully',
            'costs' => $this->settings->getCreditCosts(),
        ]);
    }

    public function getFreeCredits(): JsonResponse
    {
        return response()->json(['free_credits' => $this->settings->getFreeCredits()]);
    }

    public function updateFreeCredits(Request $request): JsonResponse
    {
        $request->validate([
            'amount' => ['required', 'integer', 'min:0'],
        ]);

        $this->settings->updateFreeCredits($request->input('amount'));

        return response()->json([
            'message' => 'Free credits updated successfully',
            'free_credits' => $this->settings->getFreeCredits(),
        ]);
    }
}
