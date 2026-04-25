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
    app.setGlobalPrefix('api');
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
      .get('/api')
      .expect(200)
      .expect((response) => {
        expect(response.body).toMatchObject({
          service: 'time-off-microservice',
          status: 'ok',
        });
      });
  });

  it('creates request and reserves balance in both systems', async () => {
    const hcmSeed = {
      employeeId: 'E-100',
      locationId: 'LOC-1',
      availableDays: 10,
    };
    await request(app.getHttpServer())
      .post('/api/mock-hcm/balances/realtime')
      .send(hcmSeed)
      .expect(201);
    await request(app.getHttpServer())
      .post('/api/sync/hcm/realtime')
      .send(hcmSeed)
      .expect(201);

    const createResponse = await request(app.getHttpServer())
      .post('/api/time-off-requests')
      .send({
        employeeId: 'E-100',
        locationId: 'LOC-1',
        daysRequested: 2,
        startDate: '2026-05-01',
        endDate: '2026-05-02',
      })
      .expect(201);

    expect(createResponse.body.status).toBe('PENDING');

    await request(app.getHttpServer())
      .get('/api/balances/E-100/LOC-1')
      .expect(200)
      .expect((response) => {
        expect(response.body.availableDays).toBe(8);
      });

    await request(app.getHttpServer())
      .get('/api/mock-hcm/balances/E-100/LOC-1')
      .expect(200)
      .expect((response) => {
        expect(response.body.availableDays).toBe(8);
      });
  });

  it('rejects when local balance is insufficient', async () => {
    await request(app.getHttpServer())
      .post('/api/sync/hcm/realtime')
      .send({
        employeeId: 'E-200',
        locationId: 'LOC-2',
        availableDays: 1,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/time-off-requests')
      .send({
        employeeId: 'E-200',
        locationId: 'LOC-2',
        daysRequested: 2,
        startDate: '2026-06-10',
        endDate: '2026-06-11',
      })
      .expect(400);
  });

  it('reject workflow refunds local and HCM balances', async () => {
    const seed = {
      employeeId: 'E-300',
      locationId: 'LOC-3',
      availableDays: 5,
    };
    await request(app.getHttpServer())
      .post('/api/mock-hcm/balances/realtime')
      .send(seed)
      .expect(201);
    await request(app.getHttpServer())
      .post('/api/sync/hcm/realtime')
      .send(seed)
      .expect(201);

    const createResponse = await request(app.getHttpServer())
      .post('/api/time-off-requests')
      .send({
        employeeId: 'E-300',
        locationId: 'LOC-3',
        daysRequested: 1,
        startDate: '2026-07-01',
        endDate: '2026-07-01',
      })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/api/time-off-requests/${createResponse.body.id}/reject`)
      .send({ managerComment: 'Team coverage issue' })
      .expect(200)
      .expect((response) => {
        expect(response.body.status).toBe('REJECTED');
      });

    await request(app.getHttpServer())
      .get('/api/balances/E-300/LOC-3')
      .expect(200)
      .expect((response) => {
        expect(response.body.availableDays).toBe(5);
      });

    await request(app.getHttpServer())
      .get('/api/mock-hcm/balances/E-300/LOC-3')
      .expect(200)
      .expect((response) => {
        expect(response.body.availableDays).toBe(5);
      });
  });

  it('supports batch sync and logs audit events', async () => {
    await request(app.getHttpServer())
      .post('/api/sync/hcm/batch')
      .send([
        { employeeId: 'E-400', locationId: 'LOC-1', availableDays: 12 },
        { employeeId: 'E-401', locationId: 'LOC-2', availableDays: 8 },
      ])
      .expect(201);

    await request(app.getHttpServer())
      .get('/api/balances/E-401/LOC-2')
      .expect(200)
      .expect((response) => {
        expect(response.body.availableDays).toBe(8);
      });

    await request(app.getHttpServer())
      .get('/api/sync/hcm/audit')
      .expect(200)
      .expect((response) => {
        expect(response.body[0]).toMatchObject({
          source: 'HCM',
          operation: 'BATCH',
        });
      });
  });
});
