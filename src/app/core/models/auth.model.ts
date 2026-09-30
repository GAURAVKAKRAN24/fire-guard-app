export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
  auth_provider?: string;
  profile_picture?: string | null;
  is_verified?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface SignupResponse {
  message: string;
  user: AuthUser;
}

