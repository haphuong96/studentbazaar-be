import { ITokenPayload } from "../auth/auth.interface";

export interface InboxPayload {
    receiverId?: number,
    conversationId?: number,
    message: string
}

export interface ReadMessagePayload {
    messageId: number,
}