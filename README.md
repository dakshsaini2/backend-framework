# Backend Framework

A production-ready, reusable NPM backend framework that generates complete TypeScript/Express backend projects with authentication, authorization, validation, error handling, and a clean scalable architecture.

## Packages

| Package                                                | Description                                                                         | Version |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------- | ------- |
| [`@devsaini2300/backend-core`](./packages/backend-core) | Reusable backend infrastructure (JWT, auth middleware, errors, validation, logging) | 1.0.0   |
| [`create-dk-backend`](./packages/create-backend)       | CLI to generate complete backend projects                                           | 1.0.0   |

## Quick Start

### Generate a new backend project

```bash
npx create-dk-backend my-api
cd my-api
npm install
cp .env.example .env
npm run db:migrate
npm run dev
```

Server starts at `http://localhost:5000`

### API Endpoints (generated)

```
POST /api/auth/register   — Register a new user
POST /api/auth/login      — Login and receive tokens
POST /api/auth/refresh    — Refresh access token
POST /api/auth/logout     — Logout (revoke refresh token)
GET  /api/auth/me         — Get current user (protected)
GET  /api/health          — Health check
```

## Architecture

```
HTTP Request → Route → Middleware → Controller → Service → Repository → Prisma → PostgreSQL
```

The generated project uses a clean layered architecture:

- **Routes** — Define endpoints and middleware
- **Controllers** — Handle HTTP concerns (request, response, status codes)
- **Services** — Contain business logic
- **Repositories** — Database access layer
- **Middleware** — Authentication, authorization, validation, errors

## Technology Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT (access + refresh tokens) with bcrypt
- **Validation**: Zod
- **Logging**: Pino
- **Testing**: Vitest + Supertest
- **Security**: Helmet, CORS, rate limiting
- **DevOps**: Docker + Docker Compose

## Features

### Authentication

- JWT access tokens (15m default) and refresh tokens (7d default)
- Refresh token rotation with database-backed revocation
- Hashed refresh tokens stored in PostgreSQL
- Secure password hashing with bcrypt (12 rounds)
- Rate limiting on auth endpoints

### Authorization

```typescript
import { authenticate, authorize } from "@devsaini2300/backend-core";

// Any authenticated user
router.get("/profile", authenticate, getProfile);

// Admin only
router.delete("/users/:id", authenticate, authorize("ADMIN"), deleteUser);

// Multiple roles
router.get("/reports", authenticate, authorize("ADMIN", "MANAGER"), getReports);
```

### Validation

```typescript
import { validate } from "@devsaini2300/backend-core";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

router.post("/register", validate(schema), registerController);
```

### Error Handling

```typescript
import { AppError } from "@devsaini2300/backend-core";

// Throws structured errors with proper HTTP status codes
throw AppError.notFound("User not found");
throw AppError.unauthorized("Invalid credentials");
throw AppError.conflict("Email already registered");
```

## Environment Variables

| Variable                 | Description                         | Default       |
| ------------------------ | ----------------------------------- | ------------- |
| `NODE_ENV`               | Environment                         | `development` |
| `PORT`                   | Server port                         | `5000`        |
| `DATABASE_URL`           | PostgreSQL connection string        | —             |
| `JWT_ACCESS_SECRET`      | Access token secret (min 32 chars)  | —             |
| `JWT_REFRESH_SECRET`     | Refresh token secret (min 32 chars) | —             |
| `JWT_ACCESS_EXPIRES_IN`  | Access token expiry                 | `15m`         |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry                | `7d`          |
| `CORS_ORIGIN`            | CORS origin                         | `*`           |
| `LOG_LEVEL`              | Log level                           | `info`        |

## Docker

```bash
# Start PostgreSQL + app
docker compose up -d

# Just PostgreSQL for local development
docker compose up -d postgres
```

## Development

### Monorepo Setup

```bash
# Install all dependencies
npm install

# Build all packages
npm run build

# Run all tests
npm test
```

### Available Scripts (generated project)

```bash
npm run dev          # Development server with hot reload
npm run build        # Production build
npm start            # Start production server
npm test             # Run tests
npm run lint         # ESLint
npm run format       # Prettier
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run database migrations
npm run db:studio    # Prisma Studio GUI
```

## Publishing

### 1. Core package

```bash
cd packages/backend-core
npm login
npm publish --access public
```

### 2. CLI package

```bash
cd packages/create-backend
npm login
npm publish
```

### Then users can run:

```bash
npx create-dk-backend my-api
```

## Security

- Passwords hashed with bcrypt (12 rounds)
- JWT secrets validated at startup (minimum 32 characters)
- Refresh token rotation prevents reuse of old tokens
- Hashed refresh tokens in database (SHA-256)
- Rate limiting on authentication endpoints
- Helmet security headers
- CORS configuration
- Input validation on all endpoints
- Production error responses hide internal details
- No secrets in source code

## Future Extensibility

The architecture supports adding:

- MongoDB/MySQL/Drizzle support
- OAuth (Google, GitHub) login
- Email verification and password reset
- Two-factor authentication
- Swagger/OpenAPI documentation
- WebSocket support
- Background jobs
- And more...

## License

MIT © [dakshsaini2](https://github.com/dakshsaini2)
