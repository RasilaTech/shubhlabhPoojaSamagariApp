export interface UserResposne {
  success: boolean;
  message: string;
  data: UserDetails;
}

export interface UserDetails {
  id: string;
  phone_number: string;
  first_name: string;
  last_name: string;
  gender: "male" | "female";
  email: string;
}

export interface UpdateEmail {
  email: string;
  otp_code?: string;
}
