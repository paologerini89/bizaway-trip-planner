import { Type, Static } from '@sinclair/typebox';

export const TripSchema = Type.Object({
  origin: Type.String(),
  destination: Type.String(),
  cost: Type.Number(),
  duration: Type.Number(),
  type: Type.String(),
  id: Type.String(),
  display_name: Type.String()
});

export type Trip = Static<typeof TripSchema>;

export const SortBySchema = Type.Union([
  Type.Literal('fastest'),
  Type.Literal('cheapest')
]);

export type SortBy = Static<typeof SortBySchema>;

const IATA_CODE_REGEX = /^[A-Z]{3}$/;

export const SUPPORTED_PLACES = [
  "ATL", "PEK", "LAX", "DXB", "HND", "ORD", "LHR", "PVG", "CDG", "DFW",
  "AMS", "FRA", "IST", "CAN", "JFK", "SIN", "DEN", "ICN", "BKK", "SFO",
  "LAS", "CLT", "MIA", "KUL", "SEA", "MUC", "EWR", "MAD", "HKG", "MCO",
  "PHX", "IAH", "SYD", "MEL", "GRU", "YYZ", "LGW", "BCN", "MAN", "BOM",
  "DEL", "ZRH", "SVO", "DME", "JNB", "ARN", "OSL", "CPH", "HEL", "VIE"
];

const IATA_CODES = Type.Union(SUPPORTED_PLACES.map(code => Type.Literal(code)));

export function isValidPlaceCode(code: string): boolean {
  return IATA_CODE_REGEX.test(code.toUpperCase()) && SUPPORTED_PLACES.includes(code.toUpperCase());
}

export const PlaceCodeSchema = IATA_CODES;

// Search request schema
export const SearchRequestSchema = Type.Object({
  origin: Type.String({ minLength: 3, maxLength: 3 }),
  destination: Type.String({ minLength: 3, maxLength: 3 }),
  sort_by: SortBySchema
});

export type SearchRequest = Static<typeof SearchRequestSchema>;

// Search response schema
export const SearchResponseSchema = Type.Object({
  trips: Type.Array(TripSchema),
  origin: Type.String({ minLength: 3, maxLength: 3 }),
  destination: Type.String({ minLength: 3, maxLength: 3 }),
  sort_by: SortBySchema,
  total_results: Type.Number()
});

export type SearchResponse = Static<typeof SearchResponseSchema>;

