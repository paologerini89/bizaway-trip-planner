# BizAway Trip Planner API

A secure Node.js API for searching trips with simple token authentication.

## 🔐 Simple Authentication

This API requires a Bearer token in the Authorization header for protected endpoints.

### Quick Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm run dev
   ```

3. **Use any token to access protected endpoints:**
   ```bash
   curl -H "Authorization: Bearer your_token_here" \
     "http://localhost:3000/trips/search?origin=SYD&destination=GRU&sort_by=cheapest"
   ```

## 📋 API Endpoints

### Trip Operations (🔒 Requires Authentication)
- `GET /trips/search` - Search trips with origin, destination, and sorting

### Public Endpoints
- `GET /health` - API health check

## 🔑 Authentication

Include any Bearer token in the Authorization header:

```http
Authorization: Bearer your_token_here
```

The API simply checks that:
- Authorization header is present
- Format is "Bearer <token>"
- Token is not empty

## 📖 Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference.

## 🏗️ Architecture

```
src/
├── index.ts                 # Application entry point
├── types/                   # TypeBox schemas
├── middleware/
│   └── auth.ts             # Simple authentication middleware
├── routes/
│   └── trips.ts           # Protected trip routes
└── services/
    └── tripService.ts     # 3rd party API integration
```

## 🚀 Technologies

- **[Fastify](https://www.fastify.io/)** - Fast web framework
- **[TypeBox](https://github.com/sinclairzx81/typebox)** - Schema validation
- **[Axios](https://axios-http.com/)** - HTTP client
- **Simple Auth Middleware** - Bearer token validation

## Example Usage

```bash
# Search trips (requires any Bearer token)
curl -H "Authorization: Bearer mytoken123" \
  "http://localhost:3000/trips/search?origin=LAX&destination=JFK&sort_by=fastest"

# Health check (public)
curl http://localhost:3000/health
```

## Error Responses

### 401 Unauthorized - Missing header
```json
{
  "error": "Unauthorized",
  "message": "Authorization header is required",
  "timestamp": "2026-02-20T10:30:00.000Z"
}
```

### 401 Unauthorized - Invalid format
```json
{
  "error": "Unauthorized", 
  "message": "Invalid authorization format. Expected: Bearer <token>",
  "timestamp": "2026-02-20T10:30:00.000Z"
}
```