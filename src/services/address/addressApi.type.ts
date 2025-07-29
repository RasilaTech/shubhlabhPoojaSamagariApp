export interface UserAddressResponse {
  success: boolean;
  message: string;
  data: UserAddressPayload;
}

export interface UserAddressListResponse {
  success: boolean;
  message: string;
  data: UserAddressPayload[];
}

export interface UserAddressPayload {
  id: string;
  phone_number: string;
  name: string;
  user_id: string;
  address_line1: string;
  address_line2: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  lat: number;
  lng: number;
  is_default: boolean;
}

export interface CreateUserAddressPayload {
  phone_number: string;
  name: string;
  address_line1: string;
  address_line2: string;
  landmark?: string;
  state: string;
  city: string;
  pincode: string;
  lat: number;
  lng: number;
  is_default: boolean;
}

export interface UpdateUserAddressPayload {
  phone_number?: string;
  name?: string;
  address_line1?: string;
  address_line2?: string;
  landmark?: string;
  state?: string;
  city?: string;
  pincode?: string;
  lat?: number;
  lng?: number;
  is_default?: boolean;
}
