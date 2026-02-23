# Bizaway Trip Planner API

Base URL: `http://localhost:3000`

## Authentication

Just put a non-empty Bearer token in Authorization header
example: Bearer 123-test-token

## Endpoints

### `GET /health`
Health check endpoint

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-21T10:30:00.000Z",
  "version": "1.0.0",
  "uptime": 123.456,
  "environment": "development"
}
```

### `GET /trips/search`
Search trips between two locations

**Query Parameters:**
- `origin` (required): 3-letter IATA code (e.g. "LAX")
- `destination` (required): 3-letter IATA code (e.g. "JFK")  
- `sort_by` (required): "fastest" or "cheapest"

**Response:**
```json
{
  "trips": [
    {
      "origin": "LAX",
      "destination": "JFK", 
      "cost": 450,
      "duration": 6,
      "type": "flight",
      "id": "b849c866-7928-4d08-9d5c-a6821a583d1b",
      "display_name": "from LAX to JFK by flight"
    }
  ],
  "origin": "LAX",
  "destination": "JFK", 
  "sort_by": "fastest",
  "total_results": 1
}
```

### `POST /trips`
Save a trip in DB

**Request Body:**
```json
{
  "origin": "LAX",
  "destination": "JFK",
  "cost": 450,
  "duration": 6,
  "type": "flight",
  "id": "b849c866-7928-4d08-9d5c-a6821a583d1b",
  "display_name": "from LAX to JFK by flight"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Trip saved successfully",
  "trip": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "origin": "LAX",
    "destination": "JFK",
    "cost": 450,
    "duration": 6,
    "type": "flight",
    "trip_id": "b849c866-7928-4d08-9d5c-a6821a583d1b",
    "display_name": "from LAX to JFK by flight",
    "created_at": "2026-02-21T10:30:00.000Z",
    "updated_at": "2026-02-21T10:30:00.000Z"
  }
}
```

### `GET /trips`
Get all trips from DB

**Response:**
```json
{
  "trips": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "origin": "LAX",
      "destination": "JFK",
      "cost": 450,
      "duration": 6,
      "type": "flight",
      "trip_id": "b849c866-7928-4d08-9d5c-a6821a583d1b",
      "display_name": "from LAX to JFK by flight",
      "created_at": "2026-02-21T10:30:00.000Z",
      "updated_at": "2026-02-21T10:30:00.000Z"
    }
  ],
  "total": 1
}
```

### `GET /trips/{id}`
Get specific DB trip by ID

**Path Parameters:**
- `id` (required): DB trip ID

**Response:**
```json
{
  "success": true,
  "message": "Trip retrieved successfully",
  "trip": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "origin": "LAX",
    "destination": "JFK",
    "cost": 450,
    "duration": 6,
    "type": "flight",
    "trip_id": "b849c866-7928-4d08-9d5c-a6821a583d1b",
    "display_name": "from LAX to JFK by flight",
    "created_at": "2026-02-21T10:30:00.000Z",
    "updated_at": "2026-02-21T10:30:00.000Z"
  }
}
```

### `DELETE /trips/{id}`
Delete a trip from DB

**Path Parameters:**
- `id` (required): DB trip ID

**Response:**
```json
{
  "success": true,
  "message": "Trip deleted successfully"
}
```

## Trip Data Structure

**Saved trips contain two IDs:**
- `id`: Unique identifier for the saved trip record in DB 
- `trip_id`: Trip ID from search results