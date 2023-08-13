import { ITokenPayload } from "../auth/auth.interface";

export interface InboxPayload {
    receiverId?: number,
    conversationId?: number,
    message: string
}