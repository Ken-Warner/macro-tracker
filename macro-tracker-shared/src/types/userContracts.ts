export interface UserCreateRequest {
  username: string;
  password: string;
  passwordConfirm: string;
  emailAddress: string;
}

export interface UserLoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}
