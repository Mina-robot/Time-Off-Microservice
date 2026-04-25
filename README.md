# Time-Off Microservice

A NestJS + SQLite backend for managing time-off requests and syncing leave balances with an external HCM system.

## What is included

- REST API for creating, approving, rejecting, cancelling, and listing requests
- Balance lookup and HCM batch sync endpoint
- Mock HCM endpoints for testing and local development
- Jest unit tests and E2E tests
- SQLite persistence

## Requirements

- Node.js 20+
- npm

## Setup

```bash
npm install
cp .env.example .env
mkdir -p data
```

## Run the app

```bash
npm run start:dev
```

The service runs on `PORT` from `.env` (default `3000`).

## Run tests

```bash
npm test
npm run test:cov
npm run test:e2e
```

## API endpoints

### Time-off requests
- `POST /time-off-requests`
- `GET /time-off-requests`
- `GET /time-off-requests/:id`
- `PATCH /time-off-requests/:id/approve`
- `PATCH /time-off-requests/:id/reject`
- `DELETE /time-off-requests/:id`

### Balances
- `GET /balances/:employeeId?locationId=...`

### HCM sync
- `POST /hcm/batch-sync`

### Mock HCM endpoints
These are included for testing and local simulation:
- `GET /mock-hcm/balances/:employeeId?locationId=...`
- `POST /mock-hcm/reset`
- `POST /mock-hcm/deduct`
- `POST /mock-hcm/restore`
- `POST /mock-hcm/batch-sync`
- `GET /mock-hcm/snapshot`

## Postman test checklist

### 1. Seed mock HCM balances
`POST /mock-hcm/reset`

Body:
```json
{
  "balances": [
    { "employeeId": "emp-001", "locationId": "loc-001", "remainingBalance": 10 }
  ]
}
```

### 2. Fetch balance
`GET /balances/emp-001?locationId=loc-001`

### 3. Create a time-off request
`POST /time-off-requests`

Body:
```json
{
  "employeeId": "emp-001",
  "locationId": "loc-001",
  "startDate": "2026-04-25",
  "endDate": "2026-04-26",
  "type": "VACATION",
  "reason": "Family event"
}
```

### 4. Approve a request
`PATCH /time-off-requests/:id/approve`

### 5. Reject a request
`PATCH /time-off-requests/:id/reject`

Body:
```json
{
  "reason": "Manager rejected the request"
}
```

### 6. Cancel a request
`DELETE /time-off-requests/:id`

### 7. Batch sync from HCM
`POST /hcm/batch-sync`

Body:
```json
{
  "balances": [
    { "employeeId": "emp-001", "locationId": "loc-001", "remainingBalance": 15 }
  ]
}
```

## Design notes

- The system treats HCM as the source of truth.
- Local balance rows are synced defensively from HCM when missing or outdated.
- Request creation checks current HCM balance before inserting a pending request.
- Approval re-validates balance, deducts in HCM, and then syncs the local balance snapshot.
- The code uses a clean NestJS module structure and keeps business logic in services.
- SQLite is used because it was required by the assignment and keeps the project easy to run in a take-home environment.

## Submission notes

- Do not include `node_modules`
- Zip the project root only
- Keep the zip under 50 MB
