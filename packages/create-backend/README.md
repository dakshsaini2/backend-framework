# create-dk-backend

CLI to generate production-ready TypeScript backend projects with Express, Prisma, PostgreSQL, and JWT authentication.

## Usage

```bash
npx create-dk-backend my-api
```

## What You Get

A complete, production-ready backend with:

- ✅ TypeScript + Express
- ✅ PostgreSQL + Prisma ORM
- ✅ JWT Authentication (access + refresh tokens)
- ✅ Role-based Authorization (USER, ADMIN, MANAGER)
- ✅ Input Validation (Zod)
- ✅ Error Handling
- ✅ Structured Logging (Pino)
- ✅ Security (Helmet, CORS, rate limiting)
- ✅ Docker + Docker Compose
- ✅ Clean layered architecture

## Generated Structure

```
my-api/
├── src/
│   ├── config/         # Environment & database configuration
│   ├── controllers/    # HTTP request/response handling
│   ├── middleware/      # Auth, validation, error middleware
│   ├── repositories/   # Database access layer
│   ├── routes/         # API route definitions
│   ├── services/       # Business logic
│   ├── types/          # TypeScript definitions
│   ├── utils/          # JWT, password, response utilities
│   ├── validation/     # Zod schemas
│   ├── app.ts          # Express app setup
│   └── server.ts       # Server entry point
├── prisma/             # Database schema
├── tests/              # Test files
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## CLI Options

```bash
npx create-dk-backend my-api              # Default setup
npx create-dk-backend my-api --no-docker  # Skip Docker files
```

## After Generation

```bash
cd my-api
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run db:migrate
npm run dev
```

## License

MIT
