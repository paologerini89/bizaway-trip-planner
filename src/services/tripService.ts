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
		const normalizedOrigin = origin.toUpperCase();
		const normalizedDestination = destination.toUpperCase();

		// const endpoint = `${this.apiUrl}?origin=${normalizedOrigin}&destination=${normalizedDestination}`;
		const endpoint = `${this.apiUrl}?origin=${normalizedOrigin}`;

		const response = await axios.get<Trip[]>(endpoint, {
			headers: {
				'x-api-key': this.apiKey,
				'Content-Type': 'application/json'
			}
		});

		return response.data;
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
		// Fetch all trips from API
		const allTrips = await this.getTripsFromRemoteAPI(origin, destination);
		
		// Filter trips by origin and destination
		const filteredTrips = this.filterTrips(allTrips, origin, destination);
		
		// Sort trips based on strategy
		const sortedTrips = this.sortTrips(filteredTrips, sortBy);

		return sortedTrips;
	}
}