import z from 'zod'

export enum SupportedMessage {
    JoinRoom = "JOIN_ROOM",
    SendMessage = "SEND_MESSAGE",
    UpvoteMessage = "UPVOTE_MESSAGE"
}

export type IncomingMessages = {
    type: SupportedMessage.JoinRoom,
    payload: InitMessageType
} | {
    type: SupportedMessage.SendMessage,
    payload: InitUserMessage
} | {
    type: SupportedMessage.UpvoteMessage,
    payload: InitUpvoteMessage
}

export const initMessage = z.object({
    name: z.string(),
    userId: z.string(),
    roomId: z.string()
})

export type InitMessageType = z.infer<typeof initMessage>

export const UserMessage = z.object({
    userId: z.string(),
    roomId: z.string(),
    message: z.string(),
})

export type InitUserMessage = z.infer<typeof UserMessage>

export const UpvoteMessage = z.object({
    userId: z.string(),
    roomId: z.string(),
    chatId: z.string(),
})

export type InitUpvoteMessage = z.infer<typeof UpvoteMessage>
