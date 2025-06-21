import { Chat, Store, UserId } from "./Store";
var golbalChatId = 0;

export interface Room {
    roomId: string;
    chats: Chat[]
}

export class InMemoryStore implements Store {
    private store: Map<string, Room>;

    constructor() {
        this.store = new Map<string, Room>();
    }

    initRoom(roomId: string) {
        this.store.set(roomId, {
            roomId,
            chats: []
        })
    }

    getChats(roomId: string, limit: number, offset: number) {
        const room = this.store.get(roomId)
        if (!room) {
            return []
        }
        return room.chats.reverse().slice(0, offset).slice(-1 * limit)
    }

    addChat(userId: UserId, roomId: string, name: string, message: string) {
        const room = this.store.get(roomId)
        if (!room) {
            return null
        }
        const chat = {
            id: (golbalChatId++).toString(),
            userId,
            name,
            message,
            upvotes: []
        }
        room.chats.push(chat)
        return chat;
    }

    upvote(userId: UserId, roomId: string, chatId: string): Chat | null {
        const room = this.store.get(roomId)
        if (!room) {
            return null;
        }
        // TODO: Make this more efficient
        const chat = room.chats.find((({ id }) => id === chatId))

        if (!chat) {
            return null;
        }
        chat.upvotes.push(userId)
        return chat;
    }
}