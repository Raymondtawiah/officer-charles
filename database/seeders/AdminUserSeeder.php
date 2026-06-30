<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@officercharles.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('Admin@123!'),
                'is_admin' => true,
            ]
        );
    }
}
