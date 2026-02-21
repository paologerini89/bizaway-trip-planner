import { TripSchema } from './trips';
import { Type, Static } from '@sinclair/typebox';

export const TripDBSchema = Type.Object({
  ...TripSchema.properties,
  id: Type.String(), // Unique ID for the saved trip
  trip_id: Type.String(), // Original trip ID from the search results
  created_at: Type.String({ format: 'date-time' }),
  updated_at: Type.String({ format: 'date-time' })
});

export type TripDB = Static<typeof TripDBSchema>;

export const SaveTripDBRequestSchema = TripSchema;

export type SaveTripDBRequest = Static<typeof SaveTripDBRequestSchema>;

export const SaveTripDBResponseSchema = Type.Object({
	success: Type.Boolean(),
	message: Type.String(),
	trip: TripDBSchema
});

export type SaveTripDBResponse = Static<typeof SaveTripDBResponseSchema>;

export const TripsDBListResponseSchema = Type.Object({
	trips: Type.Array(TripDBSchema),
	total: Type.Number()
});

export type TripsDBListResponse = Static<typeof TripsDBListResponseSchema>;

export const DeleteTripDBParamsSchema = Type.Object({
	id: Type.String()
});

export type DeleteTripDBParams = Static<typeof DeleteTripDBParamsSchema>;

// Schema per la risposta di cancellazione
export const DeleteTripDBResponseSchema = Type.Object({
	success: Type.Boolean(),
	message: Type.String()
});

export type DeleteTripDBResponse = Static<typeof DeleteTripDBResponseSchema>;

export const GetTripDBParamsSchema = Type.Object({
	id: Type.String(),
});

export type GetTripDBParams = Static<typeof GetTripDBParamsSchema>;

export const GetTripDBResponseSchema = Type.Object({
	success: Type.Boolean(),
	message: Type.String(),
	trip: TripDBSchema
});

export type GetTripDBResponse = Static<typeof GetTripDBResponseSchema>;