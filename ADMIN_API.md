# Admin API Documentation

## Default Credentials

| Field  | Value                   |
|--------|-------------------------|
| Email  | `admin@officercharles.com` |
| Password | `Admin@123!`           |

> These credentials are created by `AdminUserSeeder`. Change the password immediately after first login.

---

## Authentication

All admin endpoints require a valid `Bearer` token from the regular login endpoint.

**Login first:**

```http
POST /api/login
Content-Type: application/json

{
  "email": "admin@officercharles.com",
  "password": "Admin@123!"
}
```

**Use the returned token:**

```http
Authorization: Bearer {token}
```

---

## Endpoints

All admin routes are prefixed with `/api/admin`.

---

### 1. Dashboard Overview

```http
GET /api/admin/overview
```

**Response:**

```json
{
  "total_users": 120,
  "active_users": 45,
  "total_revenue": 150000,
  "total_credits_sold": 5000,
  "total_credits_used": 3200,
  "total_interviews_completed": 890
}
```

---

### 2. Users

#### List Users

```http
GET /api/admin/users?search=john&per_page=20
```

**Response (paginated):**

```json
{
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "credits_balance": 50,
      "created_at": "2026-01-15T10:00:00Z",
      "updated_at": "2026-06-30T08:00:00Z"
    }
  ],
  "current_page": 1,
  "last_page": 6,
  "per_page": 20,
  "total": 120
}
```

#### User Profile

```http
GET /api/admin/users/{userId}
```

**Response:**

```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "account_date": "2026-01-15T10:00:00Z",
  "current_credits": 50,
  "sessions_completed": 12,
  "packages_purchased": [...],
  "interview_history": [...],
  "credit_transactions": [...]
}
```

---

### 3. Credit Management

#### Credit Stats

```http
GET /api/admin/credits/stats
```

**Response:**

```json
{
  "total_issued": 5000,
  "total_used": 3200
}
```

#### Credit Transaction History

```http
GET /api/admin/credits/transactions?user_id=1&per_page=20
```

#### Add Credits (Admin)

```http
POST /api/admin/credits/add
Content-Type: application/json

{
  "user_id": 1,
  "amount": 100,
  "description": "Bonus credits"
}
```

**Response:**

```json
{
  "user_id": 1,
  "amount_added": 100,
  "new_balance": 150
}
```

#### Remove Credits (Admin)

```http
POST /api/admin/credits/remove
Content-Type: application/json

{
  "user_id": 1,
  "amount": 50,
  "description": "Penalty adjustment"
}
```

---

### 4. Payments

#### Payment History

```http
GET /api/admin/payments/history?user_id=1&per_page=20
```

#### Revenue Stats

```http
GET /api/admin/payments/revenue
```

**Response:**

```json
{
  "total_revenue": 150000,
  "stripe_revenue": 100000,
  "paystack_revenue": 50000,
  "stripe_transactions": 200,
  "paystack_transactions": 150,
  "total_transactions": 350
}
```

---

### 5. Interview Analytics

#### Interview Stats

```http
GET /api/admin/interviews/stats
```

**Response:**

```json
{
  "chat_interviews_completed": 450,
  "live_interviews_completed": 120,
  "training_sessions": 320,
  "real_simulation_sessions": 120,
  "total_interviews": 570
}
```

#### User Performance

```http
GET /api/admin/interviews/performance?per_page=20
```

---

### 6. AI Usage

```http
GET /api/admin/ai-usage/stats
```

**Response:**

```json
{
  "openai": {
    "total_messages": 15000,
    "user_messages": 7500,
    "assistant_messages": 7500,
    "estimated_cost": 12.5,
    "estimated_input_tokens": 1125000,
    "estimated_output_tokens": 2250000
  },
  "voice": {
    "total_messages": 500,
    "estimated_cost": 7.5
  },
  "avatar": {
    "total_sessions": 120,
    "estimated_cost": 3.0
  },
  "total_estimated_cost": 23.0
}
```

---

### 7. Settings

#### Get Credit Packages

```http
GET /api/admin/settings/credit-packages
```

**Response:**

```json
{
  "starter": {
    "amount": 1000,
    "credits": 100,
    "name": "Starter Pack - 100 Credits"
  },
  "standard": {
    "amount": 2000,
    "credits": 200,
    "name": "Standard Pack - 200 Credits"
  }
}
```

#### Update Credit Packages

```http
PUT /api/admin/settings/credit-packages
Content-Type: application/json

{
  "packages": {
    "starter": {
      "amount": 1000,
      "credits": 100,
      "name": "Starter Pack - 100 Credits"
    }
  }
}
```

#### Get Credit Costs

```http
GET /api/admin/settings/credit-costs
```

**Response:**

```json
{
  "training": 2,
  "interview": 5,
  "live": 10
}
```

#### Update Credit Costs

```http
PUT /api/admin/settings/credit-costs
Content-Type: application/json

{
  "costs": {
    "training": 2,
    "interview": 5,
    "live": 10
  }
}
```

#### Get Free Credits

```http
GET /api/admin/settings/free-credits
```

**Response:**

```json
{
  "free_credits": 20
}
```

#### Update Free Credits

```http
PUT /api/admin/settings/free-credits
Content-Type: application/json

{
  "amount": 30
}
```

---

## Error Responses

All endpoints return standard HTTP status codes:

| Status | Meaning |
|--------|---------|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request |
| `401` | Unauthorized (missing/invalid token) |
| `403` | Forbidden (not an admin) |
| `404` | Not Found |
| `422` | Validation Error |
| `500` | Server Error |

**Example 422:**

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "user_id": ["The user id field is required."]
  }
}
```

**Example 403:**

```json
{
  "message": "Unauthorized. Admin access required."
}
```

---

## Quick Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/overview` | Dashboard overview |
| GET | `/api/admin/users` | List all users |
| GET | `/api/admin/users/{userId}` | User profile |
| GET | `/api/admin/credits/stats` | Credit statistics |
| GET | `/api/admin/credits/transactions` | Credit transactions |
| POST | `/api/admin/credits/add` | Add credits to user |
| POST | `/api/admin/credits/remove` | Remove credits from user |
| GET | `/api/admin/payments/history` | Payment history |
| GET | `/api/admin/payments/revenue` | Revenue statistics |
| GET | `/api/admin/interviews/stats` | Interview statistics |
| GET | `/api/admin/interviews/performance` | User performance |
| GET | `/api/admin/ai-usage/stats` | AI usage statistics |
| GET | `/api/admin/settings/credit-packages` | Get credit packages |
| PUT | `/api/admin/settings/credit-packages` | Update credit packages |
| GET | `/api/admin/settings/credit-costs` | Get credit costs |
| PUT | `/api/admin/settings/credit-costs` | Update credit costs |
| GET | `/api/admin/settings/free-credits` | Get free credits amount |
| PUT | `/api/admin/settings/free-credits` | Update free credits amount |

---

## Seeding Admin User

If the admin user is missing, run:

```bash
php artisan db:seed --class=AdminUserSeeder
```

Default credentials after seeding:
- **Email:** `admin@officercharles.com`
- **Password:** `Admin@123!`
