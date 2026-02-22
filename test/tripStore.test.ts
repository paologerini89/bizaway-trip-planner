import { test } from 'tap';
import { TripStore } from '../src/services/tripStore';
import { Trip } from '../src/types/trips';

test('TripStore', async (t) => {
    let store: TripStore;

    t.beforeEach(() => {
        store = new TripStore();
    });

    t.test('saveTripDB', async (t) => {
        const mockTrip: Trip = {
            id: 'trip-123',
            origin: 'ATL',
            destination: 'BOS',
            cost: 100,
            duration: 120,
            type: 'flight',
            display_name: 'Flight from ATL to BOS'
        };

        const savedTrip = store.saveTripDB(mockTrip);

        t.ok(savedTrip.id, 'should assign an ID to saved trip');
        t.equal(savedTrip.trip_id, 'trip-123', 'should store original trip ID');
        t.equal(savedTrip.origin, 'ATL', 'should preserve trip data');
        t.equal(savedTrip.destination, 'BOS', 'should preserve trip data');
        t.equal(savedTrip.cost, 100, 'should preserve trip data');
        t.equal(savedTrip.duration, 120, 'should preserve trip data');
        t.equal(savedTrip.type, 'flight', 'should preserve trip data');
        t.equal(savedTrip.display_name, 'Flight from ATL to BOS', 'should preserve trip data');
    });

    t.test('should not create duplicate trips', async (t) => {
        const mockTrip: Trip = {
            id: 'trip-123',
            origin: 'ATL',
            destination: 'BOS', 
            cost: 100,
            duration: 120,
            type: 'flight',
            display_name: 'Flight from ATL to BOS'
        };

        const firstSave = store.saveTripDB(mockTrip);
        const secondSave = store.saveTripDB(mockTrip);

        t.equal(firstSave.id, secondSave.id, 'should return same trip on duplicate save');
    });

    t.test('getTripDBByTripId', async (t) => {
        const mockTrip: Trip = {
            id: 'trip-456',
            origin: 'JFK',
            destination: 'LAX',
            cost: 300,
            duration: 360,
            type: 'flight',
            display_name: 'Flight from JFK to LAX'
        };

        store.saveTripDB(mockTrip);
        const retrieved = store.getTripDBByTripId('trip-456');

        t.ok(retrieved, 'should retrieve saved trip');
        t.equal(retrieved?.trip_id, 'trip-456', 'should match trip ID');
        t.equal(retrieved?.origin, 'JFK', 'should match trip data');
        });

        t.test('should return undefined for non-existent trip', async (t) => {
        const result = store.getTripDBByTripId('non-existent');
        t.equal(result, undefined, 'should return undefined for non-existent trip');
    });

    t.test('getAllTripsDB', async (t) => {
        const trip1: Trip = {
            id: 'trip-1',
            origin: 'ATL',
            destination: 'BOS',
            cost: 100,
            duration: 120,
            type: 'flight',
            display_name: 'Flight 1'
        };

        const trip2: Trip = {
            id: 'trip-2', 
            origin: 'JFK',
            destination: 'LAX',
            cost: 200,
            duration: 240,
            type: 'flight',
            display_name: 'Flight 2'
        };

        store.saveTripDB(trip1);
        store.saveTripDB(trip2);

        const allTrips = store.getAllTripsDB();
        t.equal(allTrips.length, 2, 'should return all saved trips');

        const tripIds = allTrips.map(t => t.trip_id);
        t.ok(tripIds.includes('trip-1'), 'should include first trip');
        t.ok(tripIds.includes('trip-2'), 'should include second trip');
    });

    t.test('deleteTripDB', async (t) => {
        const mockTrip: Trip = {
            id: 'trip-789',
            origin: 'SFO',
            destination: 'SEA',
            cost: 150,
            duration: 90,
            type: 'flight',
            display_name: 'Flight from SFO to SEA'
        };
        const savedTrip = store.saveTripDB(mockTrip);

        const deleteResult = store.deleteTripDB(savedTrip.id);
        t.equal(deleteResult, true, 'should return true on successful delete');
        const retrieved = store.getTripDBById(savedTrip.id);
        t.equal(retrieved, undefined, 'should not retrieve deleted trip');
    });

    t.test('getTripDBById', async (t) => {
        const mockTrip: Trip = {
            id: 'trip-321',
            origin: 'MIA',
            destination: 'ORD',
            cost: 120,
            duration: 150,
            type: 'flight',
            display_name: 'Flight from MIA to ORD'
        };
        const savedTrip = store.saveTripDB(mockTrip);
        const retrieved = store.getTripDBById(savedTrip.id);

        t.ok(retrieved, 'should retrieve trip by ID');
        t.equal(retrieved?.id, savedTrip.id, 'should match trip ID');
        t.equal(retrieved?.trip_id, 'trip-321', 'should match original trip ID');
    });

    t.test('should return undefined for non-existent ID', async (t) => {
        const result = store.getTripDBById('non-existent-id');
        t.equal(result, undefined, 'should return undefined for non-existent ID');
    });
});