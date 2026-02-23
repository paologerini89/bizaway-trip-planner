import { Trip } from '../types/trips';
import { TripDB } from '../types/tripManager';
import { v4 as uuidv4 } from 'uuid';

export class TripStore {
    private tripsDB: Map<string, TripDB> = new Map();

    /**
     * 
     * We pass the entire trip object instead of just the trip ID because we want to avoid making an additional API call to get the trip details when we save a trip in the DB. 
     * This way, we can save the trip details directly in the DB without needing to fetch them again.
     * Getting details from external API is not ideal because it can fail and it also adds latency to the save operation.
     * If the trips were stored in a real database, we could just store the trip ID and then fetch the details when we need to display the saved trips. 
     * But since we're using an in-memory store, we can just save the entire trip object to simplify the implementation.
     * To emulate a real database, we generate a unique ID for each saved trip and store the original trip ID as a separate field (trip_id) in the TripDB object.
     */
    saveTripDB(trip: Trip): TripDB {
        // If the trip is already saved, return the existing trip instead of creating a new one
        // TODO: maybe we should return an error instead
        const existingTrip = this.getTripDBByTripId(trip.id);
        if (existingTrip) {
            return existingTrip;
        }

        const id = uuidv4();
        const tripDB: TripDB = {
            ...trip,
            id,
            trip_id: trip.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        this.tripsDB.set(id, tripDB);
        return tripDB;
    }

    getAllTripsDB(): TripDB[] {
        // Sort by most recent creation date
        return Array.from(this.tripsDB.values()).sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }

    /**
     * Get trip by ID
     */
    getTripDBById(id: string): TripDB | undefined {
        return this.tripsDB.get(id);
    }

    /**
     * Delete a trip by ID
     */
    deleteTripDB(id: string): boolean {
        return this.tripsDB.delete(id);
    }

    /**
     * Get trip by trip ID
     */
    getTripDBByTripId(tripId: string): TripDB | undefined {
        return Array.from(this.tripsDB.values()).find(trip => trip.trip_id === tripId);
    }
}