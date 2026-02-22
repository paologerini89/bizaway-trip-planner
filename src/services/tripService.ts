import { Trip, SortBy } from '../types/trips';
import axios from 'axios';
import { CacheService } from './cache';

export class TripService {
	private readonly apiUrl: string;
	private readonly apiKey: string;
	private readonly cache: CacheService;
	private readonly cacheTtlSeconds: number;

	constructor(
		apiUrl: string | undefined = process.env.TRIPS_API_ENDPOINT, 
		apiKey: string | undefined = process.env.TRIPS_API_KEY,
		cache: CacheService,
		cacheTtlSeconds = 300 // 5 minuti default
	) {
		if (!apiUrl) {
			throw new Error('TRIPS_API_ENDPOINT environment variable is required');
		}
		if (!apiKey) {
			throw new Error('TRIPS_API_KEY environment variable is required');
		}
		this.apiUrl = apiUrl;
		this.apiKey = apiKey;
		this.cache = cache;
		this.cacheTtlSeconds = cacheTtlSeconds;
	}		

	private createCacheKey(origin: string, destination: string): string {
		return `trips:${origin.toUpperCase()}:${destination.toUpperCase()}`;
	}

	private async getTripsFromRemoteAPI(origin: string, destination: string): Promise<Trip[]> {
		const normalizedOrigin = origin.toUpperCase();
		const normalizedDestination = destination.toUpperCase();

		const endpoint = `${this.apiUrl}?origin=${normalizedOrigin}&destination=${normalizedDestination}`;

		const response = await axios.get<Trip[]>(endpoint, {
			headers: {
				'x-api-key': this.apiKey,
				'Content-Type': 'application/json'
			}
		});

		return response.data;
	}

	sortTrips(trips: Trip[], sortBy: SortBy): Trip[] {
		const sortedTrips = [...trips];

		switch (sortBy) {
			case 'fastest':
				return sortedTrips.sort((a, b) => a.duration - b.duration);
			case 'cheapest':
				return sortedTrips.sort((a, b) => a.cost - b.cost);
			default:
				return sortedTrips;
		}
	}

	async searchTrips(origin: string, destination: string, sortBy: SortBy): Promise<Trip[]> {
		// Crea chiave cache che include il tipo di sorting
		const cacheKey = `${this.createCacheKey(origin, destination)}:${sortBy}`;
		
		// Controlla cache prima
		const cachedTrips = await this.cache.get<Trip[]>(cacheKey);
		if (cachedTrips) {
			console.log(`Cache HIT per ${cacheKey}`);
			return cachedTrips;
		}

		console.log(`Cache MISS per ${cacheKey}`);
		
		// Cache miss - chiama API
		const trips = await this.getTripsFromRemoteAPI(origin, destination);
		
		// Ordina risultati
		const sortedTrips = this.sortTrips(trips, sortBy);
		
		// Salva in cache
		await this.cache.set(cacheKey, sortedTrips, this.cacheTtlSeconds);
		
		return sortedTrips;
	}
}