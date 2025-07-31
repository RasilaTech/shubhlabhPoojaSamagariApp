export interface MapsLatLngResponse {
  success: boolean;
  message: string;
  data: PlaceDetails;
}

export interface PlaceDetails {
  address_components: AddressComponent[];
  formatted_address: string;
  geometry: Geometry;
  place_id: string;
}

export interface Geometry {
  location: {
    lat: number;
    lng: number;
  };
}

export interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

export interface LatLng {
  lat: number | null;
  lng: number | null;
}

export interface SearchAddressDetails {
  formatted_address: string;
  name: string;
  geometry: Geometry;
}

export interface MapsSearchAddressResponse {
  success: boolean;
  message: string;
  data: SearchAddressDetails[];
}
