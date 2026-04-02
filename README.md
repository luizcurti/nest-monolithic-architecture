# Monolithic Architecture with NestJS

A **Modular Monolithic Architecture** built with [NestJS](http://nestjs.com/), featuring Domain-Driven Design patterns, dual REST + GraphQL APIs, event-driven background processing, and a three-tier test suite.

---

## Architecture Overview

Each domain module is self-contained with its own controller, service, repository interface, and data-access implementations. Cross-module communication goes through NestJS EventEmitter or Bull queues — never direct imports.

```
src/
├── common/
│   ├── constants/       # TypeORM datasource factory
│   ├── events/          # Domain events (UserCreatedEvent)
│   ├── filters/         # Global HTTP exception filter
│   ├── loggers/         # Winston logger (TRANSIENT scope)
│   └── s3/              # AWS S3 upload service
├── config/              # database / redis / s3 configs (ConfigModule)
├── ioC/
│   └── app.module.ts    # Root module
└── modules/
    ├── users/
    │   ├── domain/
    │   │   ├── models/           # User TypeORM entity + GraphQL ObjectType
    │   │   ├── repositories/     # IUserRepository interface + provider
    │   │   │   └── implementations/
    │   │   │       ├── users.typeorm.repository.ts
    │   │   │       └── users.in-memory.repository.ts
    │   │   └── users.service.ts  # Business logic, events
    │   └── http/
    │       ├── dtos/             # CreateUserDto / UpdateUserDto
    │       ├── users.controller.ts
    │       └── user.resolver.ts
    ├── credit-engine/            # Credit processing placeholder
    └── users-management/
        ├── domain/               # Mongoose schema + repository
        └── queues/               # Bull processor (sendEmail job)
```

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 20+ |
| npm / yarn | any |
| Docker & Docker Compose | 24+ |

---

## Environment Setup

Copy the example and fill in the values:

```bash
cp .env.example .env   # or create .env manually from the table below
```

| Variable | Example | Description |
|----------|---------|-------------|
| `DATABASE_DATASOURCE` | `typeorm` | Active datasource (`typeorm` or `in-memory`) |
| `TYPEORM_TYPE` | `postgres` | TypeORM driver |
| `TYPEORM_HOST` | `0.0.0.0` | PostgreSQL host |
| `TYPEORM_PORT` | `5432` | PostgreSQL port |
| `TYPEORM_USERNAME` | `qso_user` | DB user |
| `TYPEORM_PASSWORD` | `qso_password` | DB password |
| `TYPEORM_DATABASE` | `qso_example` | DB name |
| `MONGODB_URL` | `mongodb://127.0.0.1:27017/users_management` | MongoDB connection |
| `REDIS_HOST` | `127.0.0.1` | Redis host |
| `REDIS_PORT` | `6379` | Redis port |

---

## Running with Docker

```bash
# Start PostgreSQL and Redis
docker compose up -d

# Install dependencies
npm install

# Start the application (hot-reload)
npm run start:dev
```

The API is available at `http://localhost:3000`.

---

## Available Scripts

```bash
# Development
npm run start:dev          # NestJS with hot-reload (Nodemon)
npm run start:prod         # Run compiled build

# Build
npm run build

# Code quality
npm run lint               # ESLint + auto-fix
npm run format             # Prettier

# Tests
npm run test               # Unit tests (Jest)
npm run test:watch         # Unit tests in watch mode
npm run test:cov           # Unit tests with coverage report
npm run test:e2e           # E2E tests against SQLite in-memory
npm run test:e2e:docker    # E2E tests against real PostgreSQL (requires Docker)

# Database helpers (Prisma / MongoDB)
npm run db:generate        # Generate Prisma client
npm run db:migrate-mongo   # Run MongoDB migrations
npm run db:format          # Format Prisma schema
```

---

## REST API

All endpoints are prefixed with `/v1`.

### Users — `GET /v1/users`

Returns the list of all users.

**Response 200**
```json
[{ "id": 1, "name": "John Doe", "email": "john@example.com" }]
```

### Users — `POST /v1/users`

Creates a new user.

**Body**
```json
{ "name": "John Doe", "email": "john@example.com" }
```

**Response 201** — created user object with generated `id`.

### Users — `GET /v1/users/:id`

Returns a single user by numeric ID.

**Response 200** — user object  
**Response 404** — user not found

### Users — `PATCH /v1/users/:id`

Partially updates a user. Both `name` and `email` are optional.

**Body**
```json
{ "name": "Jane Doe" }
```

**Response 200** — updated user object  
**Response 404** — user not found

### Users — `DELETE /v1/users/:id`

Deletes a user.

**Response 204** — no content  
**Response 404** — user not found

### Credit Engine — `GET /v1/credit`

Health-check endpoint for the credit engine module.

**Response 200** — `Hello Credit Engine`

---

## GraphQL API

Playground available at `http://localhost:3000/graphql`.

```graphql
# List all users
query {
  findAll {
    id
    name
    email
  }
}

# Find user by ID (returns null if not found — nullable field)
query {
  findUser(id: 1) {
    name
    email
  }
}

# Create user
mutation {
  create(data: { name: "John Doe", email: "john@example.com" }) {
    id
    name
    email
  }
}
```

---

## Error Responses

All errors follow the same shape:

```json
{
  "statusCode": 404,
  "message": "User with ID 99 not found",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/v1/users/99"
}
```

---

## Testing

### Unit Tests

```bash
npm run test
```

Covers all services, controllers, resolvers, repositories, filters, and events using Jest mocks and an in-memory repository. Zero external dependencies required.

### E2E — SQLite (no Docker)

```bash
npm run test:e2e
```

Spins up the full NestJS application with an SQLite in-memory database. Runs 26 tests covering complete CRUD, GraphQL queries/mutations, validation errors, and error-response shape — no external services required.

### E2E — PostgreSQL (Docker)

```bash
# Prerequisite: containers must be running
docker compose up -d

npm run test:e2e:docker
```

Runs 27 tests against the real PostgreSQL container. Each test starts with a clean `user` table (via `DELETE FROM "user"`). Verifies true persistence, auto-generated IDs, and data integrity across sequential requests.

| Suite | Config file | DB | Tests |
|-------|-------------|-----|-------|
| Unit | `package.json` (default Jest) | none | 132 |
| E2E SQLite | `test/jest-e2e.json` | SQLite `:memory:` | 26 |
| E2E Docker | `test/jest-e2e-docker.json` | PostgreSQL 11 | 27 |

---

## Event-Driven Flow

When a user is created via REST or GraphQL:

1. `UsersService.create()` emits `UserCreatedEvent`
2. `UsersService.welcomeNewUser()` handler receives the event
3. A Bull job is added to the `users` queue
4. `UsersManagementProcessor.sendEmail()` processes the job asynchronously

---

## CI/CD

GitHub Actions (`.github/workflows/ci.yml`) runs on every push:

1. Install dependencies
2. ESLint
3. TypeScript compilation check
4. Unit tests
5. `npm audit` security scan

---

## Docker Services

```yaml
# docker-compose.yml
postgres:  # qso     — port 5432  (PostgreSQL 11.8)
redis:     # qso_redis — port 6379  (Redis alpine)
```

The application container is defined in `docker-compose.yml` but commented out; run `npm run start:dev` locally for development.