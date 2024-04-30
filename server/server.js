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
const date = new Date();
const lastTime = date.getTime();
let frameCount = 0;

function Client(socket) {
    this.socket = socket;
    this.ign = null;
    this.room = null;
    this.playerRole = null;
    this.position = { x: 0, y: 0 };
    this.coins = 100;
    this.statusconditions = [];
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

    // Client registers itself with the server
    socket.on("registerClient", (ign, playerRole, roomCode) => {
        client.ign = ign;
        client.playerRole = playerRole;

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
        if (client.room) {
            for (let c of client.room.clients) {
                c.socket.emit("updateMap", tileIndex, tileChar);
            }
        }

    });

    socket.on("collectCoin", (coinIndex, clientArrLength) => {
        if (client.room == null) return;

        // I'm guessing some sort of timing issue between client and server can sometimes cause the client side and server side coin array to mismatch, hence this check
        if (clientArrLength == client.room.mapManager.coinarr.length) {
            client.coins += client.room.mapManager.coinarr[coinIndex].value;
            console.log("Coin collected by: " + client.ign + " at index: " + coinIndex + " with value: " + client.room.mapManager.coinarr[coinIndex].value);
            let result = client.room.mapManager.collectCoin(coinIndex); // index in array
            if (!result) return;



            for (let c of client.room.clients) {
                c.socket.emit("updateCoins", client.room.mapManager, coinIndex);
            }
        }

    });

    socket.on("useCoins", (amount) => {
        if (client.room == null) return;
        if (client.coins >= amount) {
            client.coins -= amount;
            // for (let c of client.room.clients) {
            //     c.socket.emit("updateCoins", client.room.mapManager, null);
            // }
        }
    });

    socket.on("mapRevoke", (socketid) => {
        console.log(socketid);
        for (let c of client.room.clients) {
            if (c.socket.id == socketid) {
                c.socket.emit("mapRevokeIncreaseCooldown");
                break;
            }
        }
    });

    socket.on("cooldownReduction", (duration) => {
        if (client.room == null) return;
        if (client.statusconditions.includes("cooldownReduction")) { //refresh cooldown reduction
            client.statusconditions.splice(client.statusconditions.indexOf("cooldownReduction"), 1);
            client.statusconditions.push("cooldownReduction");
            setTimeout(() => {
                client.statusconditions.splice(client.statusconditions.indexOf("cooldownReduction"), 1);
            }, duration * 1000);
        };
        client.statusconditions.push("cooldownReduction");
        setTimeout(() => {
            client.statusconditions.splice(client.statusconditions.indexOf("cooldownReduction"), 1);
        }, duration * 1000);
    });

    socket.on("addBarrierBlock", (count) => {
        if (client.room == null) return;
        for (let i = 0; i < count; i++) {
            client.statusconditions.push("addBarrierBlock");
            setTimeout(() => {
                client.statusconditions.splice(client.statusconditions.indexOf("addBarrierBlock"), 1); //next frame remove
            }, 2 * 1000 / 60);
        }
    });

    socket.on("mutePlayer", (target, id, duration) => {
        console.log("Muting player: " + target + " for " + duration + " seconds" + " by " + client.ign)
        if (client.room == null) return;

        for (let c of client.room.clients) {
            console.log(id, c.socket.id)
            if (c.socket.id == id) {
                console.log("Muting player: " + c.ign + " for " + duration + " seconds" + " by " + client.ign)
                if (c.statusconditions.includes("mute")) {
                    client.socket.emit("playerAlreadyMuted", c.ign);
                    return;
                }
                // if (c.statusconditions.includes("mute")){
                //     c.statusconditions.splice(c.statusconditions.indexOf("mute"), 1);
                //     c.statusconditions.push("mute");
                //     setTimeout(() => {
                //         c.statusconditions.splice(c.statusconditions.indexOf("mute"), 1);
                //     }, duration * 1000);
                else {
                    c.statusconditions.push("mute");
                    setTimeout(() => {
                        c.statusconditions.splice(c.statusconditions.indexOf("mute"), 1);
                    }, duration * 1000);
                }

            }
        }
    });

    socket.on("revealRoom", () => {
        // console.log(3298746523987)
        if (client.room == null) return;
        if (client.room.mapManager.realTreasureRoomIndex == null) return;
        console.log(client.room.mapManager.realTreasureRoomIndex)
        client.socket.emit("realTreasureRoom", client.room.mapManager);
    });
    

    socket.on("generateCoins", () => {
        if (client.room == null) return;
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
            c.socket.emit("gameOver", client.socket.id, c.socket.id);
            clients.delete(c)
        }

        rooms.splice(rooms.indexOf(client.room), 1);
    });

    socket.on("coinRateUp", (duration) => {
        if (client.room == null) return;

        client.room.mapManager.coinRateUp(duration);
        for (let c of client.room.clients) {
            c.socket.emit("updateCoins", client.room.mapManager, null);
        }
    });
});

function tick() {
    frameCount += 1;
    for (let room of rooms) {
        let allData = [...room.clients].map((c) => {
            return {
                position: c.position,
                id: c.socket.id,
                ign: c.ign,
                coins: c.coins,
                statusconditions: c.statusconditions,
            };
        });
        // Spawn coins at specified rate
        if (frameCount % Math.round(60 / room.mapManager.coinrate) == 0) {
            room.mapManager.generateCoins();
            console.log("generating", frameCount, date.getTime() - lastTime, room.mapManager.coinrate, 60 / room.mapManager.coinrate);

            for (let c of room.clients) {
                c.socket.emit("updateCoins", c.room.mapManager, null);
            }
        }

        //room.mapManager.generateCoins();
        for (let c of room.clients) {
            c.socket.emit("playerDataUpdate", c.socket.id, allData);
        }
    }
}

setInterval(tick, TICK_DELAY);
