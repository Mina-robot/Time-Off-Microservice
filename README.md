# Time-Off Microservice
_____
## Table of Content
1. [Description](#description)
 - [What is included](#what-is-included)
2. [Project Structure](#project-structure)
3. [Getting Started](#getting-started)
   - [Requirements](#requirements)
   - [Libraries](#libraries)
   - [How to run](#how-to-run)
4. [API endpoints](#aPI-endpoints)

___

## Description
Time-Off Microservice for handling employee leave requests and synchronizing balances with an external HCM system. The microservice will be implemented using NestJS (TypeScript) and SQLite, exposing REST APIs for creating, approving, rejecting, and querying time-off requests. It will maintain local leave balances per employee/location and integrate with an external HCM via both real-time APIs and batch updates. Key goals include data consistency, reliability under concurrent access, and clear architecture. The project will include thorough testing (unit, integration, e2e) and adhere to coding best practices (SOLID, DRY, linting).

### What is included
- REST API for creating, approving, rejecting, cancelling, and listing requests
- Balance lookup and HCM batch sync endpoint
- Mock HCM endpoints for testing and local development
- Jest unit tests and E2E tests
- SQLite persistence

## Project Structure
**src/**
|-main.ts          **Added global API and validation pipeline**
|-appmodule.ts     **Enabled ConfigModule, TypeORM, SQLite database**
|-balances         **Balances Module: Mirrors local balances by by employeeId + locationId** 
|-sync             **Sync Module: Syncing**
|-hcm-mock         **HcmMock Module: Mock HCM authoritative balances**
|-time-off         **TimeOff Module: Request details and lifecycle status (PENDING/APPROVED/REJECTED)**
|-common
  |- enums
    |- time-off-request-status.enum.ts   **Standard request statuses.**

**DTOs**
|-src/balances/dto/upsert-balance.dto.ts
|- src/time-off/dto/create-time-off-request.dto.ts
|- src/time-off/dto/review-time-off-request.dto.ts
|- src/hcm-mock/dto/hcm-balance.dto.ts
|- src/hcm-mock/dto/hcm-reserve.dto.ts

**test/**
|-src/app.controller.spec.ts  **Unit test**
|-test/app.e2e-spec.ts        **E2E Test**

## Getting Started

### Requirements
- Node.js 20+
- npm

### Libraries
- @nestjs/typeorm: TypeORM integration for NestJS.
- typeorm: ORM for entities/repositories/transactions.
- sqlite3: SQLite driver for local database.
- class-validator: request DTO validation.
- class-transformer: DTO transformation support for validation pipeline.
- @nestjs/config: environment config loading

### How to run
1. Clone repository
2. Change directory to Time-Off-Microservices
3. Run
```bash
npm install
```
4. Run
```bash
npm run start:dev
```
5. The service runs on `PORT` from `.env` (default `3000`).

## Run tests
```bash
npm test
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

### Mock HCM endpoints
These are included for testing and local simulation:
- `GET /mock-hcm/balances/:employeeId?locationId=...`
- `POST /mock-hcm/reset`
- `POST /mock-hcm/deduct`
- `POST /mock-hcm/restore`
- `POST /mock-hcm/batch-sync`
- `GET /mock-hcm/snapshot`
