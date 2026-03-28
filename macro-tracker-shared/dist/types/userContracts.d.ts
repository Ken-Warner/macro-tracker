export interface UserLoginResponse {
    userId: string;
    username: string;
}
export interface UserCreateResponse {
    userId: string;
    username: string;
}
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
//# sourceMappingURL=userContracts.d.ts.map