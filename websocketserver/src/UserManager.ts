import { connection } from "websocket";
import { OutgoingMessages } from "./messages/outgoingMessages";

interface User {
    id: string;
    name: string;
    conn: connection;
}

interface Room {
    users: User[];
}

export class UserManager {
    private rooms: Map<string, Room>

    constructor() {
        this.rooms = new Map<string, Room>();
    }

    adduser(name: string, userId: string, roomId: string, socket: connection) {
        console.log({
            id: userId,
            name,
            conn: socket
        })
        if (!this.rooms.get(roomId)) {
            this.rooms.set(roomId, {
                users: []
            })
        }
        this.rooms.get(roomId)?.users.push({
            id: userId,
            name,
            conn: socket
        })
        console.log({
            id: userId,
            name,
            conn: socket
        })
    }

    removeUser(roomId: string, userId: string) {
        const users = this.rooms.get(roomId)?.users;
        if (users) {
            users.filter(({ id }) => id !== userId)
        }
    }

    getUsers(roomId: string, userId: string): User | null {
        const users = this.rooms.get(roomId)?.users.find(({ id }) => id === userId)
        return users ?? null
    }

    boardcast(roomId: string, userId: string, message: OutgoingMessages) {
        const user = this.getUsers(roomId, userId)
        if (!user) {
            console.error("User not found")
            return
        }
        const room = this.rooms.get(roomId);
        if (!room) {
            console.error("Room not found")
            return
        }

        room.users.forEach(({ conn }) => {
            conn.sendUTF(JSON.stringify(message))
        })
    }

}