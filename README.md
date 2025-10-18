# Monolithic Architecture with NestJS

<p align="center">
  A comprehensive <strong>Modular Monolithic Architecture</strong> built with <a href="http://nestjs.com/" target="_blank">NestJS</a>, featuring microservices patterns, modern tooling, and enterprise-grade testing.
</p>

## 🏗️ Architecture Overview

This project demonstrates a **Modular Monolithic Architecture** using NestJS, implementing Domain-Driven Design (DDD) principles with:

- **Modular Structure**: Each domain (Users, Credit Engine) is isolated with clear boundaries
- **Repository Pattern**: Abstracted data access with multiple implementations (TypeORM, In-Memory)
- **Event-Driven Architecture**: Async communication between modules using Bull queues
- **GraphQL + REST**: Dual API approach for different client needs
- **Enterprise Testing**: 100% test coverage with unit, integration, and e2e tests

## 🚀 Features

### Core Modules
- **Users Module**: Complete user management with CRUD operations
- **Credit Engine Module**: Business logic for credit processing
- **Users Management Module**: Background job processing with Bull queues

### API Layers
- **REST API**: Traditional HTTP endpoints for standard operations
- **GraphQL API**: Flexible query interface with Apollo Server
- **WebSocket**: Real-time communication capabilities

### Infrastructure
- **Multi-Database Support**: PostgreSQL (TypeORM), MongoDB (Prisma)
- **Caching**: Redis integration for performance optimization
- **File Storage**: AWS S3 integration for file uploads
- **Logging**: Structured logging with Winston
- **Monitoring**: Health checks and error tracking

### Development Experience
- **Hot Reload**: Fast development with Nodemon
- **Type Safety**: Full TypeScript coverage
- **Code Quality**: ESLint + Prettier configuration
- **Testing**: Jest with comprehensive test suites
- **CI/CD**: GitHub Actions with automated testing and security audits

## 📦 Installation

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- Yarn or npm

### Quick Start

```bash
# Clone the repository
git clone https://github.com/luizcurti/monolithic-architecture.git
cd monolithic-architecture

# Install dependencies
yarn install

# Setup environment
cp .env.example .env

# Start infrastructure services
docker compose up -d

# Run database migrations
yarn db:generate
yarn db:migrate-mongo

# Start the application
yarn start:dev
```

## 🔧 Development

### Available Scripts

```bash
# Development
yarn start:dev          # Start with hot reload
yarn credit:start:dev    # Start credit service separately

# Building
yarn build              # Build for production
yarn start:prod         # Run production build

# Testing
yarn test               # Run unit tests
yarn test:watch         # Run tests in watch mode
yarn test:cov           # Generate coverage report (100%)
yarn test:e2e           # Run end-to-end tests
yarn test:e2e:cov       # E2E tests with coverage

# Code Quality
yarn lint               # Run ESLint with auto-fix
yarn lint:fix           # Alias for lint
yarn format             # Format code with Prettier

# Database
yarn db:generate        # Generate Prisma client
yarn db:migrate-mongo   # Run MongoDB migrations
yarn db:format          # Format Prisma schema
```

### Project Structure

```
src/
├── common/                 # Shared utilities and services
│   ├── constants/         # Database configurations
│   ├── events/           # Domain events
│   ├── filters/          # Global exception filters
│   ├── loggers/          # Winston logging service
│   └── s3/               # AWS S3 file upload service
├── config/               # Configuration modules
│   ├── database.config.ts
│   ├── redis.config.ts
│   └── s3.config.ts
├── ioC/                  # Inversion of Control
│   └── app.module.ts     # Root application module
└── modules/              # Feature modules
    ├── users/            # User management
    │   ├── domain/       # Business logic
    │   │   ├── entities/
    │   │   ├── models/
    │   │   ├── repositories/
    │   │   └── users.service.ts
    │   └── http/         # API layer
    │       ├── dtos/
    │       ├── users.controller.ts
    │       └── user.resolver.ts
    ├── credit-engine/    # Credit processing
    └── users-management/ # Background jobs
```

## 🐳 Docker Support

### Single Application Container

```bash
# Build the Docker image
docker build -t monolithic-architecture .

# Run the container
docker run -p 3000:3000 monolithic-architecture
```

### Full Stack with Docker Compose

```bash
# Start all services (app + databases)
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

**Services included:**
- **Application**: NestJS app on port 3000
- **PostgreSQL**: Database on port 5432
- **MongoDB**: Document store on port 27017
- **Redis**: Cache/message broker on port 6379

## 🧪 Testing Strategy

### Test Coverage: 100%

- **Unit Tests**: 108 tests covering all business logic
- **Integration Tests**: Repository and service layer testing
- **E2E Tests**: Full API testing with real database
- **Coverage**: 100% lines, branches, and statements

### Test Files
```
test/
├── app.e2e-spec.ts        # End-to-end API tests
├── jest-e2e.json          # E2E Jest configuration
└── jest-coverage.json     # Coverage configuration

src/**/*.spec.ts           # Unit test files
```

### Running Tests

```bash
# Quick test run
yarn test

# With coverage report
yarn test:cov

# End-to-end tests
yarn test:e2e

# Watch mode for development
yarn test:watch
```

## 🌐 API Documentation

### REST Endpoints

- `GET /users` - List all users
- `POST /users` - Create new user
- `GET /credit-engine/health` - Health check

### GraphQL Playground

Visit `http://localhost:3000/graphql` for interactive GraphQL playground.

**Available Queries:**
```graphql
query {
  findAllUsers {
    name
    email
  }
}

mutation {
  createUser(data: { name: "John", email: "john@example.com" }) {
    name
    email
  }
}
```

## 🔒 Security

- **Input Validation**: Class-validator for DTO validation
- **Security Audits**: Automated vulnerability scanning
- **Environment Variables**: Secure configuration management
- **Error Handling**: Proper error responses without information leakage

## 🚀 CI/CD Pipeline

GitHub Actions workflow includes:

1. **Code Quality**: ESLint and TypeScript compilation
2. **Testing**: Unit tests with 100% coverage requirement
3. **Security**: Vulnerability auditing with yarn audit
4. **Docker**: Container build verification
5. **E2E Testing**: Full application testing with real databases

## 📊 Performance

- **Hot Reload**: Fast development iteration
- **Caching**: Redis for improved response times
- **Connection Pooling**: Optimized database connections
- **Async Processing**: Background jobs with Bull queues

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Maintain 100% test coverage
- Follow existing code patterns
- Update documentation for new features
- Ensure all CI checks pass