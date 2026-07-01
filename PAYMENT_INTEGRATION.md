# Officer Charles API Reference

## Integration Overview

This is a credit-based payment system. New users receive configurable free credits on registration. After exhausting credits, users purchase credit packages via Stripe or Paystack. Each feature deducts credits automatically.

## Credit Packages

Credit packages are stored in `settings` table (`key = credit_packages`). Defaults:

| Name | Display Name | Credits | USD Price | Paystack Amount (GHS) |
|------|-------------|---------|-----------|------------------------|
| starter | Starter Pack - 100 Credits | 100 | $10 | 1133 |
| standard | Standard Pack - 200 Credits | 200 | $20 | 2266 |

## Public Credit Packages Endpoint

```bash
GET /api/credit-packages
```

Response:

```json
{
  "packages": {
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
}
```

## Payment Completion Pages

Authenticated users are redirected after payment:

- Success: `/credits/success?session_id=...`
- Cancel: `/credits/cancel`

## Onboarding Defaults

- New users receive configurable `free_credits` from the `settings` table on registration, falling back to `20`.
- Credits are automatically deducted when using interview features.
- When credits are insufficient, the chat returns a `422` response with the user's current balance.

## Feature Credit Costs

| Feature | Cost |
|---------|------|
| Chat Interview | 2 |
| Live Avatar Interview | 10 |

## Base URL

```
APP_URL
```

All endpoints below are prefixed with `/api`.

## Authentication

Include the Bearer token from login in the `Authorization` header.

```
Authorization: Bearer {token}
```

## Credit Operations (Unaffected by Gateway)

### Get Credit Balance

```bash
GET /api/credits/balance
```

Response:

```json
{
  "credits": 100
}
```

### Get Credit History

```bash
GET /api/credits/history
```

Response (paginated):

```json
{
  "data": [
    {
      "id": 1,
      "type": "purchase",
      "amount": 100,
      "balance_after": 120,
      "description": "Credit purchase via Stripe",
      "reference": "cs_test_...",
      "created_at": "2026-06-30T10:00:00Z"
    }
  ]
}
```

### Deduct Credits (Internal)

```bash
POST /api/credits/deduct
```

Body:

```json
{
  "amount": 2,
  "description": "Feature usage",
  "reference": "optional-reference"
}
```

Response:

```json
{
  "message": "Credits deducted",
  "credits": 118
}
```

## Stripe Integration

Stripe is the default payment gateway. Currency is USD.

### Purchase Credits

```bash
POST /api/stripe/purchase
```

Body:

```json
{
  "package": "starter"
}
```

Allowed values for `package`:

- `starter` — 100 credits ($10)
- `standard` — 200 credits ($20)

Response:

```json
{
  "message": "Checkout session created",
  "data": {
    "session_id": "cs_test_...",
    "url": "https://checkout.stripe.com/..."
  }
}
```

Redirect the user to the `url` to complete payment.

### Stripe Webhook

Configure Stripe to send events to:

```
POST {APP_URL}/api/stripe/webhook
```

Stripe signs webhooks with `Stripe-Signature`. On `checkout.session.completed` with `payment_status = paid`, the backend automatically adds credits to the user account based on `metadata.credits`.

Required Stripe webhook events:

- `checkout.session.completed`

## Paystack Integration

Paystack uses GHS as the default currency. The backend auto-converts USD package prices to GHS at the rate 1 USD = 11.33 GHS.

### Initialize Paystack Payment

```bash
POST /api/paystack/initialize
```

Body:

```json
{
  "email": "user@example.com",
  "amount": 1000,
  "metadata": {
    "user_id": 1,
    "credits": 100,
    "package": "starter"
  }
}
```

Notes:

- `amount` is the amount in USD cents (same as Stripe).
- The backend automatically converts USD cents → GHS pesewas using the rate 1 USD = 11.33 GHS before calling Paystack.
- For the `starter` package (100 credits, $10 USD), send `1000`.
- For the `standard` package (200 credits, $20 USD), send `2000`.

Response:

```json
{
  "message": "Payment initialized successfully",
  "data": {
    "authorization_url": "https://checkout.paystack.com/...",
    "access_code": "...",
    "reference": "ref_...",
    "transaction_id": 1
  }
}
```

Redirect the user to the `authorization_url` to complete payment.

### Verify Paystack Transaction

```bash
GET /api/paystack/verify/{reference}
```

Response:

```json
{
  "message": "Payment verified successfully",
  "data": {
    "id": 12345,
    "status": "success",
    "amount": 113300,
    "currency": "GHS",
    "channel": "card",
    "paid_at": "2026-06-30T10:05:00Z"
  }
}
```

### Paystack Webhook

Configure Paystack to send events to:

```
POST {APP_URL}/api/paystack/webhook
```

Paystack signs webhooks with `X-Paystack-Signature`. On `charge.success`, the backend automatically adds credits to the user account based on `metadata.credits`.

Required Paystack webhook events:

- `charge.success`

## Frontend Flow

### Stripe Flow

1. User selects a credit package.
2. Call `POST /api/stripe/purchase` with `package`.
3. Redirect user to `data.url`.
4. After payment, Stripe sends a webhook that adds credits.
5. User can check balance via `GET /api/credits/balance`.

### Paystack Flow

1. User selects a credit package.
2. Compute GHS amount (package USD price x 11.33, then x 100 for pesewas).
3. Call `POST /api/paystack/initialize` with `email`, GHS `amount`, and `metadata` containing `user_id`, `credits`, and `package`.
4. Redirect user to `authorization_url`.
5. After payment, Paystack sends a webhook that adds credits.
6. User can check balance via `GET /api/credits/balance`.
