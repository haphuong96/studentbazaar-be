export interface GoogleOauth2TokenResponse {
    accessToken: string;
    refreshToken: string;
    scope: string;
    tokenType: string;
    expiryDate: number;
}