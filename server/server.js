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
    this.coins = 0;
    this.statusconditions = [];
}


class Room {
    constructor(id) {
        this.clients = [];
        this.id = id;
        this.mapManager = new MapManager();
        this.gameStarted = false;
        this.timer = 1200;
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
            console.log(`No client ${c.socket.id} in room`);
        }
        else {
            this.clients.splice(this.clients.indexOf(c), 1);
            if (this.clients.length === 0) {
                rooms.splice(rooms.indexOf(this), 1);
            }
        }
    }
    startGame() {
        this.gameStarted = true;
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
                if (rooms[i].gameStarted) {
                    socket.emit("gameAlreadyStarted");
                    return;
                }
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

    socket.on("startingGameSoon", () => {
        if (client.room == null) return;
        for (let c of client.room.clients) {
            console.log("Starting game soon");
            c.socket.emit("startingGameSoon");
        }
    });

    socket.on("startGame", () => {
        if (client.room == null) return;
        client.room.startGame();
        let saboteurCount = 0;
        let playerroles = new Map();
        while (saboteurCount < Math.floor(client.room.clients.length * 0.3)) {
            let randomIndex = Math.floor(Math.random() * client.room.clients.length);
            if (!playerroles.has(client.room.clients[randomIndex].socket.id)) {
                playerroles.set(client.room.clients[randomIndex].socket.id, "Saboteur");
                saboteurCount += 1;
            }
        }
        for (let c of client.room.clients) {
            if (playerroles.has(c.socket.id)) {
                c.socket.emit("playerRole", playerroles.get(c.socket.id));
            }
            else {
                playerroles.set(c.socket.id, "Dwarf");
                c.socket.emit("playerRole", "Dwarf");
            }
        }
        console.log(playerroles)
        for (let c of client.room.clients) {
            c.socket.emit("gameStarted");
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
                else {
                    c.statusconditions.push("mute");
                    c.socket.emit("setMuteDuration", duration);
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

    socket.on("gameOver", (winTeam) => {
        for (let c of client.room.clients) {
            c.socket.emit("gameOver", winTeam);
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
        if (room.gameStarted == true && frameCount % 60 == 0) {
            room.timer -= 1;
            if (room.timer == 0) {
                for (let c of room.clients) {
                    c.socket.emit("gameOver", "Saboteurs");
                    room.removeClient(c);
                }
                continue;
            }
        }

        let allData = [...room.clients].map((c) => {
            return {
                position: c.position,
                id: c.socket.id,
                ign: c.ign,
                coins: c.coins,
                statusconditions: c.statusconditions,
                timer: room.timer
            };
        });

        // Spawn coins at specified rate
        if (frameCount % Math.round(60 / room.mapManager.coinrate) == 0 && room.gameStarted) {
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
