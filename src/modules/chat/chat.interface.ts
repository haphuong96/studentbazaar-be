import { ITokenPayload } from "../auth/auth.interface";

export interface ClientData {
    user: ITokenPayload,
    message: string
}