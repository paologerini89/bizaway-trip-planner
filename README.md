# BizAway Trip Planner API

REST API for searching and managing trips built with Node.js and TypeScript.

In the trip manager part, to emulate a real DB using resources from an external source, I decided to
use the entire trip object and to save it generating a new id for the "row", converting the trip "id" value
in the new "trip_id" attribute.

There is also an implementend authentication logic with the auth middleware, but it checks only if the Authorization
header exists and it's in the "Bearer token" format

Plus:
- Caching logic with redis, to store the results from the external API for a while
- Rate limit control

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/paologerini89/bizaway-trip-planner.git
cd bizaway-trip-planner
npm install
```

## Configuration

Create a `.env` file in the root directory:

```env
PORT=3000
HOST=0.0.0.0
NODE_ENV=development
TRIPS_API_ENDPOINT=https://z0qw1e7jpd.execute-api.eu-west-1.amazonaws.com/default/trips
TRIPS_API_KEY=your-api-key-here

# Cache Configuration (optional)
CACHE_TYPE=memory
CACHE_TTL_SECONDS=300

# Redis Configuration (only if CACHE_TYPE=redis)
REDIS_URL=redis://localhost:6379
```

Replace `your-api-key-here` with your actual API key.

### Cache Configuration

The API includes intelligent caching to improve performance:

- **Memory Cache** (default): Fast in-memory caching for development
- **Redis Cache**: Production-ready distributed caching

Set `CACHE_TYPE=redis` and configure Redis connection for production use.

### Rate Limiting

The API includes built-in rate limiting to prevent abuse and ensure fair usage:

- **Default Limit**: 100 requests per minute per IP
- **Configurable**: Adjust limits via environment variables
- **Headers**: Provides rate limit status in response headers
- **Smart Error Handling**: Clear error messages with retry information

Configuration:
```env
RATE_LIMIT_MAX=100        # Max requests per time window  
RATE_LIMIT_WINDOW=1 minute    # Time window (1 minute, 1 hour, etc.)
```

Rate limit headers in responses:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1645518234
```

## Build

Compile TypeScript to JavaScript:

```bash
npm run build
```

## Test

Run the test suite:

```bash
npm test
```

## Run

### Development mode
```bash
npm run dev
```

### Production mode
```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Search trips
```
GET /trips/search?origin=ATL&destination=BOS&sort_by=fastest
```

Parameters:
- `origin`: 3-letter IATA airport code
- `destination`: 3-letter IATA airport code  
- `sort_by`: "fastest" or "cheapest"

### Save trip
```
POST /trips
Content-Type: application/json

{
  "id": "trip-123",
  "origin": "ATL",
  "destination": "BOS", 
  "cost": 200,
  "duration": 120,
  "type": "flight",
  "display_name": "Flight from ATL to BOS"
}
```

### List saved trips
```
GET /trips
```

### Get specific trip
```
GET /trips/{id}
```

### Delete trip
```
DELETE /trips/{id}
```

### Monitoring
```
GET /health
GET /cache/stats  
```

## Response Headers

All API responses include rate limiting information:

```http
X-RateLimit-Limit: 100         # Maximum requests allowed
X-RateLimit-Remaining: 95       # Requests remaining in current window  
X-RateLimit-Reset: 1645518234   # Unix timestamp when limit resets
```

When rate limit is exceeded (HTTP 429):
```json
{
  "code": 429,
  "message": "Rate limit exceeded. Max 100 requests per 1 minute. Try again in 45 seconds."
}
```

To verify the build was successful:

```bash
# Check if dist folder was created
ls -la dist/

# Check the main entry point
node dist/index.js --help
```

## 🚀 Running the Application

### Development Mode (Recommended)

```bash
# Start with automatic reload on file changes
npm run dev
```

### Development Mode with File Watching

```bash
# Start with nodemon for automatic restarts
npm run dev:watch
```

### Production Mode

```bash
# First build the project
npm run build

# Then start the production server
npm start
```

### Verify the Server is Running

```bash
# Check health endpoint
curl http://localhost:3000/health

# Expected response:
# {
#   "status": "healthy",
#   "timestamp": "2026-02-21T10:30:00.000Z",
#   "version": "1.0.0",
#   "authentication": "enabled"
# }
```

## Testing

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (development)
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## API Documentation

- [API Documentation](./API_DOCUMENTATION.md) - Complete API reference

## API Endpoints

### Trip Operations
- `GET /trips/search` - Search trips with origin, destination, and sorting

### Trip Manager  
- `POST /trips` - Save a trip to DB
- `GET /trips` - List all trips from DB
- `GET /trips/{id}` - Get a specific trip from DB
- `DELETE /trips/{id}` - Delete a trip from DB

### Public Endpoints
- `GET /health` - API health check

## Authentication

Included, but not active, with either Authorization header or Bearer token