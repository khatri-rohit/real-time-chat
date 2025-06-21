import { connection, Message, request, server as WebSocketServer } from 'websocket'
import http from 'http'
import { IncomingMessages, InitUpvoteMessage, InitUserMessage, SupportedMessage } from './messages/incomingMessage';
import { OutgoingMessages, SupportedMessage as OutgoingSupportMessage } from "./messages/outgoingMessages";

import { UserManager } from './UserManager';
import { InMemoryStore } from './store/InMemoryStore';

const httpServer = http.createServer(function (request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
httpServer.listen(8080, function () {
    console.log((new Date()) + ' Server is listening on port 8080');
});

const userManager = new UserManager();
const store = new InMemoryStore();

const wsServer = new WebSocketServer({
    httpServer: httpServer,
    autoAcceptConnections: true
});

function originIsAllowed(origin: string) {
    return true;
}

wsServer.on('request', function (request: request) {
    if (!originIsAllowed(request.origin)) {
        request.reject();
        console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
        return;
    }

    var connection = request.accept('echo-protocol', request.origin);
    console.log((new Date()) + ' Connection accepted.');

    connection.on('message', function (message: Message) {
        if (message.type === 'utf8') {
            try {
                console.log(message)
                messageHandler(connection, JSON.parse(message.utf8Data))
            } catch (e) {
                console.log("catch an exception ", e);
            }

            console.log('Received Message: ' + message.utf8Data);
            connection.sendUTF(message.utf8Data);
        }
    });
    connection.on('close', function (reasonCode: any, description: any) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});

function messageHandler(ws: connection, message: IncomingMessages) {
    console.log("Incoming Message " + JSON.stringify(message))

    if (message.type === SupportedMessage.JoinRoom) {
        const payload = message.payload;
        userManager.adduser(payload.name, payload.userId, payload.roomId, ws)
    }
    if (message.type === SupportedMessage.SendMessage) {
        const payload = message.payload;
        const user = userManager.getUsers(payload.roomId, payload.userId)
        if (!user) {
            console.log("User not found")
            return
        }
        let chat = store.addChat(payload.userId, payload.roomId, user.name, payload.message)

        if (!chat) {
            return;
        }

        const outgoingPayload: OutgoingMessages = {
            type: OutgoingSupportMessage.AddChat,
            payload: {
                chatId: chat.id,
                roomId: payload.roomId,
                name: user.name,
                message: payload.message,
                upvotes: 0
            }
        }
        userManager.boardcast(payload.roomId, payload.userId, outgoingPayload)
    }
    if (message.type === SupportedMessage.UpvoteMessage) {
        const payload = message.payload;
        let chat = store.upvote(payload.userId, payload.roomId, payload.chatId)
        if (!chat) {
            return null;
        }
        const outgoingPayload: OutgoingMessages = {
            type: OutgoingSupportMessage.UpdateChat,
            payload: {
                chatId: payload.chatId,
                roomId: payload.roomId,
                upvotes: chat.upvotes.length
            }
        }

        userManager.boardcast(payload.roomId, payload.userId, outgoingPayload)
    }
}