import { Trip, SortBy, isValidPlaceCode } from '../types/trips';
import axios from 'axios';

export class TripService {
	private readonly apiUrl: string;
	private readonly apiKey: string;

	constructor(apiUrl: string = process.env.TRIPS_API_ENDPOINT || '', apiKey: string = process.env.TRIPS_API_KEY || '') {
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
		try {
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
		} catch (error: any) {
			if (error.response) {
				// Errore dalla risposta del server
				const status = error.response.status || 'Unknown';
				const statusText = error.response.statusText || 'Unknown Error';
				throw new Error(`Failed to fetch trips: ${status} ${statusText}`);
			} 
			if (error.request) {
				// Errore di rete (nessuna risposta ricevuta)
				throw new Error('Failed to fetch trips: Network error - no response received');
			}

			// Altro tipo di errore
			throw new Error(`Failed to fetch trips: ${error.message || 'Unknown error'}`);  
		}
	}

	/**
	 * Filters trips by origin and destination
	 */
	private filterTrips(trips: Trip[], origin: string, destination: string): Trip[] {
		const normalizedOrigin = origin.toUpperCase();
		const normalizedDestination = destination.toUpperCase();

		return trips.filter(trip => 
			trip.origin.toUpperCase() === normalizedOrigin && 
			trip.destination.toUpperCase() === normalizedDestination
		);
	}

	/**
	 * Sorts trips based on the sorting strategy
	 */
	private sortTrips(trips: Trip[], sortBy: SortBy): Trip[] {
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
		// Validate IATA codes
		if (!isValidPlaceCode(origin)) {
			throw new Error(`Invalid origin IATA code: ${origin}`);
		}

		if (!isValidPlaceCode(destination)) {
			throw new Error(`Invalid destination IATA code: ${destination}`);
		}

		if (origin.toUpperCase() === destination.toUpperCase()) {
			throw new Error('Origin and destination cannot be the same');
		}

		try {
			// Fetch all trips from API
			const allTrips = await this.getTripsFromRemoteAPI(origin, destination);
			
			// Filter trips by origin and destination
			const filteredTrips = this.filterTrips(allTrips, origin, destination);
			
			// Sort trips based on strategy
			const sortedTrips = this.sortTrips(filteredTrips, sortBy);

			return sortedTrips;
		} catch (error) {
			if (error instanceof Error) {
			throw error;
			}
			throw new Error('Failed to search trips');
		}
	}
}