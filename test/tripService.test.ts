import { test } from 'tap';

// Mock axios completamente
const mockGet = async (url: string, config: any) => {
    return { 
        data: [
            {
                id: 'trip-1',
                origin: 'ATL',
                destination: 'BOS',
                cost: 100, 
                duration: 180,
                type: 'car',
                display_name: 'Car from ATL to BOS'
            },
            {
                id: 'trip-2',
                origin: 'ATL',
                destination: 'BOS',
                cost: 200,
                duration: 120,
                type: 'flight',
                display_name: 'Flight from ATL to BOS'
            }
        ]
    };
};

// Override del modulo axios
const Module = require('module');
const originalRequire = Module.prototype.require;
Module.prototype.require = function(id: string) {
    if (id === 'axios') {
        return { get: mockGet };
    }
    return originalRequire.apply(this, arguments);
};

// Ora importa TripService dopo aver impostato il mock
const { TripService } = require('../src/services/tripService');

test('TripService constructor', async (t) => {
    t.test('should throw error if apiUrl is missing', async (t) => {
        t.throws(() => {
            new TripService('', 'test-key');
        }, 
        /TRIPS_API_ENDPOINT environment variable is required/);
    });

    t.test('should throw error if apiKey is missing', async (t) => {
        t.throws(() => {
            new TripService('http://test.com', '');
        }, 
        /TRIPS_API_KEY environment variable is required/);
    });

    t.test('should create instance with valid parameters', async (t) => {
        const service = new TripService('http://test.com', 'test-key');
        t.type(service, TripService);
    });
});

test('TripService searchTrips', async (t) => {
  const service = new TripService('http://test.com', 'test-key');
  const result = await service.searchTrips('ATL', 'BOS', 'cheapest');

  t.equal(result.length, 2, 'should return correct number of trips');
  t.equal(result[0].cost, 100, 'should sort by cheapest first');
  t.equal(result[1].cost, 200, 'should sort properly');
});

test('TripService sorting', async (t) => {
    const service = new TripService('http://test.com', 'test-key');

    t.test('should sort by fastest', async (t) => {
        const result = await service.searchTrips('ATL', 'BOS', 'fastest');
        t.equal(result[0].duration, 120, 'fastest trip should be first');
    });

    t.test('should sort by cheapest', async (t) => {
        const result = await service.searchTrips('ATL', 'BOS', 'cheapest');
        t.equal(result[0].cost, 100, 'cheapest trip should be first');
    });
});

test('TripService sortTrips method', async (t) => {
    const service = new TripService('http://test.com', 'test-key');
    const trips = [
        { id: 'trip-1', origin: 'ATL', destination: 'BOS', cost: 100, duration: 180, type: 'car', display_name: 'Car from ATL to BOS' },
        { id: 'trip-2', origin: 'ATL', destination: 'BOS', cost: 200, duration: 120, type: 'flight', display_name: 'Flight from ATL to BOS' }
    ];

    t.test('should sort by fastest', async (t) => {
        const sorted = service.sortTrips(trips, 'fastest');
        t.equal(sorted[0].duration, 120, 'fastest trip should be first');
    });

    t.test('should sort by cheapest', async (t) => {
        const sorted = service.sortTrips(trips, 'cheapest');
        t.equal(sorted[0].cost, 100, 'cheapest trip should be first');
    });

    t.test('should return unsorted for unknown sortBy', async (t) => {
        const sorted = service.sortTrips(trips, 'unknown' as any);
        t.equal(sorted[0].id, 'trip-1', 'should return original order');
    });

    t.test('should handle empty trip list', async (t) => {
        const sorted = service.sortTrips([], 'fastest');
        t.same(sorted, [], 'should return empty array');
    });

    t.test('should handle trips with same cost/duration', async (t) => {
        const tripsWithSameCost = [
            { id: 'trip-1', origin: 'ATL', destination: 'BOS', cost: 100, duration: 180, type: 'car', display_name: 'Car from ATL to BOS' },
            { id: 'trip-2', origin: 'ATL', destination: 'BOS', cost: 100, duration: 120, type: 'flight', display_name: 'Flight from ATL to BOS' }
        ];
        const sortedByCost = service.sortTrips(tripsWithSameCost, 'cheapest');
        t.equal(sortedByCost[0].id, 'trip-1', 'should maintain original order for same cost');
        const sortedByDuration = service.sortTrips(tripsWithSameCost, 'fastest');
        t.equal(sortedByDuration[0].id, 'trip-2', 'should sort by duration when cost is the same');
    });
});