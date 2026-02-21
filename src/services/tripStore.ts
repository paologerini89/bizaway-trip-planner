import { Trip } from '../types/trips';
import { TripDB } from '../types/tripManager';
import { v4 as uuidv4 } from 'uuid';

export class TripStore {
    private tripsDB: Map<string, TripDB> = new Map();

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