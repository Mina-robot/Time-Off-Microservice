# Time-Off Microservice Technical Requirements Document

## 1. Problem Statement

Employees submit leave requests in ReadyOn/ExampleHR, while HCM remains the source of truth for employment and leave balance data. The main risks are stale balances, race conditions, and invalid approvals when HCM changes independently from the request platform.

## 2. Goals

- Provide a robust REST API for time-off request lifecycle.
- Keep local balances synchronized with HCM using realtime and batch mechanisms.
- Defensively validate balances locally even if HCM validation is not guaranteed.
- Provide manager decisions (approve/reject) with data integrity.
- Keep implementation clean, testable, and easy to evolve.

## 3. Non-Goals

- Authentication/authorization.
- Complex accrual policies and holiday calendars.
- Real external HCM integration (mocked in this solution).

## 4. Functional Requirements

- Employee can create a time-off request.
- Manager can approve/reject pending requests.
- System exposes local balance lookup endpoint.
- System supports HCM -> service realtime sync and batch sync.
- System logs sync operations for auditability.
- System prevents over-requesting through local defensive checks.
- System attempts consistency with HCM reserve/release calls.

## 5. Quality Requirements

- SOLID-friendly module boundaries and single-responsibility services.
- Transactional updates for local state transitions.
- Automated regression tests for critical flows.
- SQLite persistence for simple local deployment.

## 6. Proposed Architecture

- **Balances Module**: local leave balance persistence and sync writes.
- **Time-Off Module**: request lifecycle, orchestration, manager actions.
- **HCM Mock Module**: mock source-of-truth API with reserve/release logic.
- **Sync Module**: inbound HCM sync endpoints and sync event audit trail.
- **Persistence**: TypeORM + SQLite with entities for balances, requests, HCM balances, sync events.

## 7. Data Model

- `leave_balances`: local mirrors consumed by employee/manager flows.
- `hcm_balances`: mock authoritative balances.
- `time_off_requests`: request lifecycle records.
- `sync_events`: sync operation audit records.

## 8. API Surface

- `GET /api` - service health.
- `GET /api/balances/:employeeId/:locationId`
- `POST /api/balances/realtime`
- `POST /api/balances/batch`
- `POST /api/sync/hcm/realtime`
- `POST /api/sync/hcm/batch`
- `GET /api/sync/hcm/audit`
- `POST /api/time-off-requests`
- `GET /api/time-off-requests`
- `PATCH /api/time-off-requests/:id/approve`
- `PATCH /api/time-off-requests/:id/reject`
- `GET /api/mock-hcm/balances/:employeeId/:locationId`
- `POST /api/mock-hcm/balances/realtime`
- `POST /api/mock-hcm/balances/batch`
- `POST /api/mock-hcm/reserve`
- `POST /api/mock-hcm/release`

## 9. Consistency and Failure Handling

- Request creation does local pre-check and HCM reserve first.
- Local request + local balance update are transactional.
- If local transaction fails after HCM reserve, a compensating HCM release is attempted.
- Reject operation refunds local and HCM balances.

## 10. Alternatives Considered

1. **Only trust HCM validation**  
   Rejected: poor UX and fragile under partial outages; no defensive local checks.

2. **Event-driven async only (no synchronous reserve)**  
   Rejected for this scope: eventual consistency windows can cause overbooking.

3. **Single balance store without local mirror**  
   Rejected: high runtime dependency on HCM for every UI call; slower and less resilient.

## 11. Testing Strategy

- End-to-end tests target full lifecycle and integration behavior:
  - Health endpoint.
  - Happy-path request creation with local/HCM deduction.
  - Insufficient balance defense.
  - Rejection flow with balance refund.
  - Batch sync and audit trail verification.
- Mock HCM endpoints are part of executable test scenarios.

## 12. Future Enhancements

- Outbox pattern for guaranteed integration events.
- Idempotency keys on request creation and sync ingestion.
- Distributed locking or optimistic concurrency for higher throughput contention.
- Role-based access control and audit enrichment.
