import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { UsersController } from '../src/modules/users/http/users.controller';
import { UsersService } from '../src/modules/users/domain/users.service';
import { UserResolver } from '../src/modules/users/http/user.resolver';
import { CreditController } from '../src/modules/credit-engine/http/credit-engine.controller';
import { CreditService } from '../src/modules/credit-engine/domain/credit-engine.service';
import { provideUsersRepository } from '../src/modules/users/domain/repositories/user.repository.provider';
import { LoggerModule } from '../src/common/loggers/logger.module';
import { User } from '../src/modules/users/domain/models/users.model';
import { AllExceptionsFilter } from '../src/common/filters/exception.filter';
import databaseConfig from '../src/config/database.config';

const mockQueue = {
  add: jest.fn().mockResolvedValue({}),
  close: jest.fn().mockResolvedValue({}),
};

describe('Application (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [databaseConfig],
          isGlobal: true,
        }),
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [User],
          synchronize: true,
          dropSchema: true,
        }),
        TypeOrmModule.forFeature([User]),
        EventEmitterModule.forRoot(),
        GraphQLModule.forRoot<ApolloDriverConfig>({
          driver: ApolloDriver,
          autoSchemaFile: true,
        }),
        LoggerModule,
      ],
      controllers: [UsersController, CreditController],
      providers: [
        UsersService,
        UserResolver,
        CreditService,
        ...provideUsersRepository(),
        {
          provide: 'BullQueue_users',
          useValue: mockQueue,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('v1');
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  afterAll(async () => {
    // Allow time for all async operations to complete
    await new Promise(resolve => setTimeout(resolve, 500));
  });

  describe('Users API (REST)', () => {
    it('GET /v1/users - should return empty array initially', () => {
      return request(app.getHttpServer())
        .get('/v1/users')
        .expect(200)
        .expect([]);
    });

    it('POST /v1/users - should create a new user', () => {
      return request(app.getHttpServer())
        .post('/v1/users')
        .send({
          name: 'John Doe',
          email: 'john.doe@example.com'
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('name', 'John Doe');
          expect(res.body).toHaveProperty('email', 'john.doe@example.com');
        });
    });

    it('GET /v1/users - should return created user', async () => {
      await request(app.getHttpServer())
        .post('/v1/users')
        .send({
          name: 'Jane Smith',
          email: 'jane.smith@example.com'
        });

      return request(app.getHttpServer())
        .get('/v1/users')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('name');
          expect(res.body[0]).toHaveProperty('email');
        });
    });

    it('POST /v1/users - should validate required fields', () => {
      return request(app.getHttpServer())
        .post('/v1/users')
        .send({})
        .expect(400);
    });

    it('POST /v1/users - should validate email format', () => {
      return request(app.getHttpServer())
        .post('/v1/users')
        .send({
          name: 'Invalid Email User',
          email: 'invalid-email'
        })
        .expect(400);
    });
  });

  describe('Credit Engine API (REST)', () => {
    it('GET /v1/credit - should return credit engine message', () => {
      return request(app.getHttpServer())
        .get('/v1/credit')
        .expect(200)
        .expect('Hello Credit Engine');
    });
  });

  describe('GraphQL API', () => {
    it('should execute GraphQL health check query', () => {
      const query = `
        query {
          __schema {
            types {
              name
            }
          }
        }
      `;

      return request(app.getHttpServer())
        .post('/graphql')
        .send({ query })
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeDefined();
          expect(res.body.data.__schema).toBeDefined();
        });
    });

    it('should create user via GraphQL mutation', () => {
      const mutation = `
        mutation {
          create(data: {
            name: "GraphQL User"
            email: "graphql@example.com"
          }) {
            name
            email
          }
        }
      `;

      return request(app.getHttpServer())
        .post('/graphql')
        .send({ query: mutation })
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeDefined();
          expect(res.body.data.create).toHaveProperty('name', 'GraphQL User');
          expect(res.body.data.create).toHaveProperty('email', 'graphql@example.com');
        });
    });

    it('should query users via GraphQL', async () => {
      const mutation = `
        mutation {
          create(data: {
            name: "Query User"
            email: "query@example.com"
          }) {
            name
            email
          }
        }
      `;

      await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: mutation });
        
      const query = `
        query {
          findAll {
            name
            email
          }
        }
      `;

      return request(app.getHttpServer())
        .post('/graphql')
        .send({ query })
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeDefined();
          expect(res.body.data.findAll).toBeDefined();
          expect(Array.isArray(res.body.data.findAll)).toBe(true);
        });
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 for non-existent routes', () => {
      return request(app.getHttpServer())
        .get('/v1/non-existent')
        .expect(404);
    });

    it('should handle invalid JSON in POST requests', () => {
      return request(app.getHttpServer())
        .post('/v1/users')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);
    });
  });
});
