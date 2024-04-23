import { Server } from "socket.io";
import MapManager from "./mapManager.js"

const io = new Server(8001, {
    cors: {
        origin: "*",
    },
});


const clients = new Set();
const rooms = [];
const TICK_DELAY = 1000 / 60;

function Client(socket) {
    this.socket = socket;
    this.ign = null;
    this.room = null;
    this.position = { x: 0, y: 0 };
    this.coins = 0;
}


class Room {
    constructor(id) {
        this.clients = [];
        this.id = id;
        this.mapManager = new MapManager();
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

    // Update the client's coins server-side
    // socket.on("coins", (coins) => {
    //     client.coins = coins;
    // });

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

        socket.emit("buildMap", client.room.mapManager);
    });

    socket.on("mapModified", (tileIndex, tileChar) => {
        client.room.mapManager.updateMap(tileIndex, tileChar);
        if (client.room){
            for (let c of client.room.clients) {
                c.socket.emit("updateMap", tileIndex, tileChar);
            }
        }
        
    });

    socket.on("collectCoin", (coinIndex) => {
        if (client.room == null) return;
        client.coins += client.room.mapManager.coinarr[coinIndex].value;
        let result = client.room.mapManager.collectCoin(coinIndex); // index in array
        if (!result) return;
        
        console.log("Coin collected by: " + client.ign + " at index: " + coinIndex + " with value: " + client.room.mapManager.coinarr[coinIndex]);
        
        for (let c of client.room.clients) {
            c.socket.emit("updateCoins", client.room.mapManager, coinIndex);
        }
    });

    socket.on("generateCoins", () => {
        client.room.mapManager.generateCoins();
        for (let c of client.room.clients) {
            c.socket.emit("updateCoins", client.room.mapManager, null);
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

    socket.on("gameOver", () => {
        for (let c of client.room.clients) {
            c.socket.emit("gameOver", c.socket.id);
            clients.delete(c)
        }

        rooms.splice(rooms.indexOf(client.room), 1);
    });
});


function tick() {
    for (let room of rooms) {
        let allData = [...room.clients].map((c) => {
            return {
                position: c.position,
                id: c.socket.id,
                ign: c.ign,
                coins: c.coins,
            };
        });
        for (let c of room.clients) {
            c.socket.emit("playerDataUpdate", c.socket.id, allData);
        }
    }
}

setInterval(tick, TICK_DELAY);
