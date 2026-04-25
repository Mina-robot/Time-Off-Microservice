import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';

describe('Time-off Microservice (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    process.env.DB_PATH = ':memory:';
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
    dataSource = moduleFixture.get(DataSource);
  });

  beforeEach(async () => {
    await dataSource.synchronize(true);
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns service health', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect((response) => {
        expect(response.body).toMatchObject({
          service: 'time-off-microservice',
          status: 'ok',
        });
      });
  });

  it('creates request and reserves balance in both systems', async () => {
    await request(app.getHttpServer())
      .post('/mock-hcm/reset')
      .send({
        balances: [
          {
            employeeId: 'E-100',
            locationId: 'LOC-1',
            remainingBalance: 10,
          },
        ],
      })
      .expect(201);
    await request(app.getHttpServer())
      .post('/hcm/batch-sync')
      .send({
        balances: [
          {
            employeeId: 'E-100',
            locationId: 'LOC-1',
            availableDays: 10,
          },
        ],
      })
      .expect(201);

    const createResponse = await request(app.getHttpServer())
      .post('/time-off-requests')
      .send({
        employeeId: 'E-100',
        locationId: 'LOC-1',
        startDate: '2026-05-01',
        endDate: '2026-05-02',
        type: 'VACATION',
        reason: 'Family event',
      })
      .expect(201);

    expect(createResponse.body.status).toBe('PENDING');

    await request(app.getHttpServer())
      .get('/balances/E-100?locationId=LOC-1')
      .expect(200)
      .expect((response) => {
        expect(response.body.availableDays).toBe(8);
      });

    await request(app.getHttpServer())
      .get('/mock-hcm/balances/E-100?locationId=LOC-1')
      .expect(200)
      .expect((response) => {
        expect(response.body.availableDays).toBe(8);
      });
  });

  it('rejects when local balance is insufficient', async () => {
    await request(app.getHttpServer())
      .post('/hcm/batch-sync')
      .send({
        balances: [
          {
            employeeId: 'E-200',
            locationId: 'LOC-2',
            availableDays: 1,
          },
        ],
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/time-off-requests')
      .send({
        employeeId: 'E-200',
        locationId: 'LOC-2',
        startDate: '2026-06-10',
        endDate: '2026-06-11',
      })
      .expect(400);
  });

  it('reject workflow refunds local and HCM balances', async () => {
    await request(app.getHttpServer())
      .post('/mock-hcm/reset')
      .send({
        balances: [
          {
            employeeId: 'E-300',
            locationId: 'LOC-3',
            remainingBalance: 5,
          },
        ],
      })
      .expect(201);
    await request(app.getHttpServer())
      .post('/hcm/batch-sync')
      .send({
        balances: [
          {
            employeeId: 'E-300',
            locationId: 'LOC-3',
            availableDays: 5,
          },
        ],
      })
      .expect(201);

    const createResponse = await request(app.getHttpServer())
      .post('/time-off-requests')
      .send({
        employeeId: 'E-300',
        locationId: 'LOC-3',
        startDate: '2026-07-01',
        endDate: '2026-07-01',
      })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/time-off-requests/${createResponse.body.id}/reject`)
      .send({ reason: 'Team coverage issue' })
      .expect(200)
      .expect((response) => {
        expect(response.body.status).toBe('REJECTED');
      });

    await request(app.getHttpServer())
      .get('/balances/E-300?locationId=LOC-3')
      .expect(200)
      .expect((response) => {
        expect(response.body.availableDays).toBe(5);
      });

    await request(app.getHttpServer())
      .get('/mock-hcm/balances/E-300?locationId=LOC-3')
      .expect(200)
      .expect((response) => {
        expect(response.body.availableDays).toBe(5);
      });
  });

  it('supports batch sync and logs audit events', async () => {
    await request(app.getHttpServer())
      .post('/hcm/batch-sync')
      .send({
        balances: [
          { employeeId: 'E-400', locationId: 'LOC-1', availableDays: 12 },
          { employeeId: 'E-401', locationId: 'LOC-2', availableDays: 8 },
        ],
      })
      .expect(201);

    await request(app.getHttpServer())
      .get('/balances/E-401?locationId=LOC-2')
      .expect(200)
      .expect((response) => {
        expect(response.body.availableDays).toBe(8);
      });

    await request(app.getHttpServer())
      .get('/sync/hcm/audit')
      .expect(200)
      .expect((response) => {
        expect(response.body[0]).toMatchObject({
          source: 'HCM',
          operation: 'BATCH',
        });
      });
  });

  it('cancels a pending request', async () => {
    await request(app.getHttpServer())
      .post('/mock-hcm/reset')
      .send({
        balances: [
          {
            employeeId: 'E-500',
            locationId: 'LOC-5',
            remainingBalance: 4,
          },
        ],
      })
      .expect(201);
    await request(app.getHttpServer())
      .post('/hcm/batch-sync')
      .send({
        balances: [{ employeeId: 'E-500', locationId: 'LOC-5', availableDays: 4 }],
      })
      .expect(201);

    const created = await request(app.getHttpServer())
      .post('/time-off-requests')
      .send({
        employeeId: 'E-500',
        locationId: 'LOC-5',
        startDate: '2026-08-01',
        endDate: '2026-08-01',
      })
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/time-off-requests/${created.body.id}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/time-off-requests/${created.body.id}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.status).toBe('CANCELLED');
      });
  });
});
