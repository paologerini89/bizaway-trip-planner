import { Trip, SortBy } from '../types/trips';
import axios from 'axios';

export class TripService {
	private readonly apiUrl: string;
	private readonly apiKey: string;

	constructor(apiUrl: string | undefined = process.env.TRIPS_API_ENDPOINT, apiKey: string | undefined = process.env.TRIPS_API_KEY) {
		if (!apiUrl) {
			throw new Error('TRIPS_API_ENDPOINT environment variable is required');
		}
		if (!apiKey) {
			throw new Error('TRIPS_API_KEY environment variable is required');
		}
		this.apiUrl = apiUrl;
		this.apiKey = apiKey;
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
		const trips = await this.getTripsFromRemoteAPI(origin, destination);
		
		const sortedTrips = this.sortTrips(trips, sortBy);

		return sortedTrips;
	}
}