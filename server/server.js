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
    this.ign = null;
    this.room = null;
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

// Client specific code when a client connects
io.on("connection", (socket) => {
    console.log("New connection!");

    // Update clients on server-side
    let client = new Client(socket);
    clients.add(client);

    // Update the client's position server-side
    socket.on("position", (x, y) => {
        client.position = { x, y };
    });

    // Client registers itself with the server
    socket.on("registerClient", (ign, roomCode) => {
        client.ign = ign;

        // First, we check if the roomcode provided by the client exists
        let roomExists = false;

        for (let i = 0; i < rooms.length; i++) {
            if (rooms[i].id == roomCode) {
                // Allow the client to join the existing room
                roomExists = true;
                rooms[i].addClient(client);
            }
        }

        // Client wants to join a room that does not exist, create a new room
        if (roomExists == false) {
            let room = new Room(roomCode);
            room.addClient(client)
            rooms.push(room);
        }

        socket.emit("buildMap", MAPS_DATA.myWorld);
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


function tick() {
    for (let room of rooms) {
        let allData = [...room.clients].map((c) => {
            return {
                position: c.position,
                id: c.socket.id,
                ign: c.ign,
            };
        });
        for (let c of room.clients) {
            c.socket.emit("playerDataUpdate", c.socket.id, allData);
        }
    }
}

setInterval(tick, TICK_DELAY);
