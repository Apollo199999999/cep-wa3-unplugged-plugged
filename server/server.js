import { Server } from "socket.io";
import { readFileSync } from "fs";

const io = new Server(8001, {
    cors: {
        origin: "*",
    },
});
const clients = new Set();
const rooms = [];
const TICK_DELAY = 1000 / 60;
const MAPS_DATA = JSON.parse(readFileSync("./maps.json"));

function Client(socket) {
    this.socket = socket;
    this.position = { x: 0, y: 0 };
}

class Room {
    constructor(id) {
        this.clients = [];
        this.id = id;
    }

    addClient(c) {
        if (c.room) {
            throw Error(`Client ${c.socket.id} already in room`);
        }
        this.clients.push(c);
        c.room = this;
    }

    removeClient(c) {
        if (!this.clients.includes(c)) {
            throw Error(`No client ${c.socket.id} in room`);
        }
        this.clients.splice(this.clients.indexOf(c), 1);
        if (this.clients.length === 0) {
            rooms.splice(rooms.indexOf(this), 1);
        }
    }
}

console.log("Server running...");

io.on("connection", (socket) => {
    console.log("New connection!");
    let client = new Client(socket);
    clients.add(client);

    socket.on("position", (x, y) => {
        client.position = { x, y };
    });

    socket.on("requestCreateRoom", () => {
        const roomCode = generateRandomRoomCode();
        let room = new Room(roomCode);
        room.addClient(client);
        rooms.push(room);
        socket.emit("setRoomCode", roomCode);
        socket.emit("buildMap", MAPS_DATA.myWorld);
    });

    socket.on("requestJoinRoom", (code) => {
        for (let room of rooms) {
            if (room.id === code) {
                room.addClient(client);
                socket.emit("setRoomCode", code);
                socket.emit("buildMap", MAPS_DATA.myWorld);
                return;
            }
        }
    });

    socket.on("disconnect", () => {
        if (client.room) {
            client.room.removeClient(client);
        }
        clients.delete(client);
        clients.forEach((c) => {
            c.socket.emit("removeClient", socket.id);
        });
    });
});

function generateRandomRoomCode() {
    return (+new Date()).toString(36).slice(-5);
}

function tick() {
    for (let room of rooms) {
        let allData = [...room.clients].map((c) => {
            return {
                position: c.position,
                id: c.socket.id,
            };
        });
        for (let c of room.clients) {
            c.socket.emit("playerDataUpdate", c.socket.id, allData);
        }
    }
}

setInterval(tick, TICK_DELAY);
