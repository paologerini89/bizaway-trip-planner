# BizAway Trip Planner API

A secure Node.js API for searching and managing trips with simple token authentication. The API integrates with a 3rd party service to provide flight and transportation options with flexible sorting strategies.

## 📋 Table of Contents

- [Features](#-features)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Build](#-build)
- [Running the Application](#-running-the-application)
- [Testing](#-testing)
- [API Documentation](#-api-documentation)
- [Architecture](#️-architecture)
- [Technologies](#-technologies)

## ✨ Features

- 🔍 **Trip Search**: Search flights by origin, destination with sorting (fastest/cheapest)
- 💾 **Trip Manager**: Save, list, and delete favorite trips
- 🔐 **Simple Authentication**: Bearer token validation
- 📊 **Comprehensive Error Handling**: Detailed axios error responses
- ✅ **Type Safety**: Full TypeScript support with TypeBox schemas
- 🚀 **High Performance**: Built with Fastify framework

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (version 18.0.0 or higher)
- **npm** (version 8.0.0 or higher) 
- **Git** (for cloning the repository)

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/paologerini89/bizaway-trip-planner.git
cd bizaway-trip-planner
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required dependencies listed in `package.json`:
- **Production dependencies**: Fastify, TypeBox, Axios, dotenv, etc.
- **Development dependencies**: TypeScript, ts-node, nodemon, ESLint, Jest

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3000
HOST=0.0.0.0
NODE_ENV=development

# 3rd Party API Configuration
TRIPS_API_ENDPOINT=https://z0qw1e7jpd.execute-api.eu-west-1.amazonaws.com/default/trips
TRIPS_API_KEY=your_api_key_here
```

**Required Variables:**
- `TRIPS_API_ENDPOINT`: The URL of the 3rd party trips API
- `TRIPS_API_KEY`: Your API key for accessing the trips service

**Optional Variables:**
- `PORT`: Server port (default: 3000)
- `HOST`: Server host (default: 0.0.0.0)
- `NODE_ENV`: Environment mode (development/production)

## 🔨 Build

### Development Build

For development with automatic recompilation:

```bash
npm run dev
```

### Production Build

To compile TypeScript to JavaScript:

```bash
npm run build
```

This creates a `dist/` folder with compiled JavaScript files.

### Build Verification

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

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (development)
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Linting

```bash
# Check code style and errors
npm run lint

# Automatically fix linting issues
npm run lint:fix
```

### Manual API Testing

Test the API manually with curl:

```bash
# 1. Search for trips
curl -H "Authorization: Bearer test_token" \
  "http://localhost:3000/trips/search?origin=LAX&destination=JFK&sort_by=cheapest"

# 2. Save a trip (use trip object from search results)
curl -X POST -H "Authorization: Bearer test_token" \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "LAX",
    "destination": "JFK",
    "cost": 450,
    "duration": 6,
    "type": "flight",
    "id": "example-trip-id",
    "display_name": "from LAX to JFK by flight"
  }' \
  http://localhost:3000/trips/saved

# 3. List saved trips
curl -H "Authorization: Bearer test_token" \
  http://localhost:3000/trips/saved
```

## 📋 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with ts-node |
| `npm run dev:watch` | Start with nodemon for auto-restart |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Start production server (requires build) |
| `npm test` | Run Jest tests |
| `npm run lint` | Run ESLint code analysis |
| `npm run lint:fix` | Fix ESLint issues automatically |

## � API Documentation

- [API Documentation](./API_DOCUMENTATION.md) - Complete API reference

## 📋 API Endpoints

### Trip Operations (🔒 Requires Authentication)
- `GET /trips/search` - Search trips with origin, destination, and sorting

### Trip Manager (🔒 Requires Authentication)  
- `POST /trips` - Save a trip to DB
- `GET /trips` - List all trips from DB
- `GET /trips/{id}` - Get a specific trip from DB
- `DELETE /trips/{id}` - Delete a trip from DB

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

## 🏗️ Architecture

```
src/
├── index.ts                 # Application entry point
├── types/                   # TypeBox schemas and type definitions
│   ├── trips.ts            # Trip-related types
│   ├── tripManager.ts      # Trip manager types
│   └── errors.ts           # Error response types
├── middleware/
│   ├── auth.ts             # Authentication middleware
│   └── search.ts           # Search validation middleware
├── routes/
│   ├── trips.ts           # Trip search routes
│   └── tripManager.ts     # Trip management routes
├── services/
│   ├── tripService.ts     # 3rd party API integration
│   └── tripStore.ts       # In-memory trip storage
├── utils/
│   ├── errors.ts          # Error handling utilities
│   └── common.ts          # Common constants
└── errors/
    └── ApiError.ts        # Custom error classes
```

## 🚀 Technologies

- **[Fastify](https://www.fastify.io/)** - Fast and efficient web framework
- **[TypeBox](https://github.com/sinclairzx81/typebox)** - JSON Schema validation and TypeScript types
- **[Axios](https://axios-http.com/)** - Promise-based HTTP client
- **[TypeScript](https://www.typescriptlang.com/)** - Type-safe development
- **[dotenv](https://www.npmjs.com/package/dotenv)** - Environment variable management
- **[UUID](https://www.npmjs.com/package/uuid)** - Unique identifier generation
- **[Jest](https://jestjs.io/)** - Testing framework
- **[ESLint](https://eslint.org/)** - Code linting and formatting

## 💡 Example Usage

### Complete Workflow Example

```bash
# 1. Search for trips
SEARCH_RESULT=$(curl -s -H "Authorization: Bearer test_token" \
  "http://localhost:3000/trips/search?origin=LAX&destination=JFK&sort_by=cheapest")

# 2. Extract the first trip from results (requires jq)
TRIP_JSON=$(echo $SEARCH_RESULT | jq '.trips[0]')

# 3. Save the trip in DB
curl -X POST -H "Authorization: Bearer test_token" \
  -H "Content-Type: application/json" \
  -d "$TRIP_JSON" \
  http://localhost:3000/trips

# 4. List all trips from DB
curl -H "Authorization: Bearer test_token" \
  http://localhost:3000/trips
```

### Individual Requests

```bash
# Search trips (requires any Bearer token)
curl -H "Authorization: Bearer mytoken123" \
  "http://localhost:3000/trips/search?origin=LAX&destination=JFK&sort_by=fastest"

# Save a trip (requires full trip object from search results) in DB
curl -X POST -H "Authorization: Bearer mytoken123" \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "LAX",
    "destination": "JFK",
    "cost": 450,
    "duration": 6,
    "type": "flight", 
    "id": "b849c866-7928-4d08-9d5c-a6821a583d1b",
    "display_name": "from LAX to JFK by flight"
  }' \
  http://localhost:3000/trips

# List all trips from DB
curl -H "Authorization: Bearer mytoken123" \
  http://localhost:3000/trips

# Delete a trip from DB
curl -X DELETE -H "Authorization: Bearer mytoken123" \
  http://localhost:3000/trips/{id}

# Health check (public)
curl http://localhost:3000/health
```

## 🔧 Troubleshooting

### Common Issues

**Port Already in Use:**
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use a different port
PORT=3001 npm run dev
```

**API Key Issues:**
- Verify your `TRIPS_API_KEY` is correctly set in `.env`
- Check that the API key has proper permissions
- Ensure the API endpoint URL is correct

**TypeScript Compilation Errors:**
```bash
# Clean build and reinstall
rm -rf dist/ node_modules/
npm install
npm run build
```

### Development Tips

1. **Hot Reload**: Use `npm run dev:watch` for automatic server restarts
2. **Debugging**: Set `NODE_ENV=development` for detailed error messages
3. **API Testing**: Use the `/health` endpoint to verify server status
4. **Logs**: Check console output for detailed request/response information

## ⚠️ Error Responses

### 401 Unauthorized - Missing header
```json
{
  "error": "Unauthorized",
  "message": "Authorization header is required",
  "timestamp": "2026-02-21T10:30:00.000Z"
}
```

### 401 Unauthorized - Invalid format
```json
{
  "error": "Unauthorized", 
  "message": "Invalid authorization format. Expected: Bearer <token>",
  "timestamp": "2026-02-21T10:30:00.000Z"
}
```

### 409 Conflict - Trip already saved
```json
{
  "error": "Conflict",
  "message": "Trip is already saved",
  "timestamp": "2026-02-21T10:30:00.000Z"
}
```

### 503 Service Unavailable - API connection error
```json
{
  "error": "Service Unavailable",
  "message": "Network error: Unable to reach the API",
  "timestamp": "2026-02-21T10:30:00.000Z"
}
```

## 📝 Supported IATA Codes

The API supports the following airport codes:

`ATL`, `PEK`, `LAX`, `DXB`, `HND`, `ORD`, `LHR`, `PVG`, `CDG`, `DFW`, `AMS`, `FRA`, `IST`, `CAN`, `JFK`, `SIN`, `DEN`, `ICN`, `BKK`, `SFO`, `LAS`, `CLT`, `MIA`, `KUL`, `SEA`, `MUC`, `EWR`, `MAD`, `HKG`, `MCO`, `PHX`, `IAH`, `SYD`, `MEL`, `GRU`, `YYZ`, `LGW`, `BCN`, `MAN`, `BOM`, `DEL`, `ZRH`, `SVO`, `DME`, `JNB`, `ARN`, `OSL`, `CPH`, `HEL`, `VIE`

## 📄 License

This project is licensed under the ISC License.

## 👤 Author

**Paolo Gerini**

- GitHub: [@paologerini89](https://github.com/paologerini89)
- Repository: [bizaway-trip-planner](https://github.com/paologerini89/bizaway-trip-planner)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request