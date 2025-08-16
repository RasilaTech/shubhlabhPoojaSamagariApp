export interface CreateUserDevicePayload {
  device_token: string;
  device_type: string;
}
export interface UserDeviceResponse {
  success: boolean;
  message: string;
  data: CreateUserDevicePayload;
}
