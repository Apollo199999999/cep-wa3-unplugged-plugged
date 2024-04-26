export default class MapManager {
    constructor() {
        // = means room walls, * means places where players can break to create new paths, x means boundary, - means empty space, G means gold
        // The following is how a map tileset should look like (even though maps are randomly generated currently)
        this.mapTiles =
            [
                'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
                'x***************************************************************x',
                'x===============************************************************x',
                'x=GGGGGGGGGGGGG=************************************************x',
                'x=GGGGGGGGGGGGG=************************************************x',
                'x=GGGGGGGGGGGGG=************************************************x',
                'x=GGGGGGGGGGGGG=************************************************x',
                'x===============************************************************x',
                'x***************************************************************x',
                'x***************************************************************x',
                'x***************************************************************x',
                'x***************************************************************x',
                'x***************************************************************x',
                'x***************************************************************x',
                'x***************************************************************x',
                'x***************************************************************x',
                'x***************************************************************x',
                'x***************************************************************x',
                'x***************************************************************x',
                'x***************************************************************x',
                'x***************************************************************x',
                'x***************************************************************x',
                'x***************************************************************x',
                'x***************************************************************x',
                'x***********==========================================**********x',
                'x***********=----------------------------------------=**********x',
                'x***********=----------------------------------------=**********x',
                'x***********=----------------------------------------=**********x',
                'x***********=----------------------------------------=**********x',
                'x***********=----------------------------------------=**********x',
                'x***********=----------------------------------------=**********x',
                'x***********=----------------------------------------=**********x',
                'x***********=----------------------------------------=**********x',
                'x***********=----------------------------------------=**********x',
                'x***********=----------------------------------------=**********x',
                'x***********=----------------------------------------=**********x',
                'x***********=----------------------------------------=**********x',
                'x***********=----------------------------------------=**********x',
                'x***********=----------------------------------------=**********x',
                'x***********==========================================**********x',
                'x***************************************************************x',
                'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
            ]

        this.mapTiles = this.generateMapWithCenterRoom(60, 60, 7, 9);

        this.cellSize = 32;
        this.numCols = this.mapTiles[0].length;
        this.numRows = this.mapTiles.length;
        this.wallColor = "grey";
        this.pathColor = "black";
        this.boundaryColor = "red";
        this.goldColor = "yellow"

        // Store the location of the real treasure room
        this.realTreasureRoomLocation;

        // Variables to store central room details
        this.centralRoomLocation;
        this.centralRoomHeight;
        this.centralRoomWidth;

        // Stores MapOverlayArea objects
        this.mapOverlayAreas = this.generateMapOverlayAreas();

        // Stores Coin objects, which tell us where each coin on the map is
        this.coinarr = [];
        this.coinWidth = 30;
        this.coinHeight = 30;
        this.coinrate = 0.15;
    }

    generateMapWithCenterRoom(mapWidth, mapHeight, treasureRoomWidth, treasureRoomHeight) {
        // Initialize the map with "*" for the outside area.
        let map = Array.from({ length: mapHeight }, () => Array(mapWidth).fill('*'));

        // Set the outer boundary of the map as "x".
        for (let y = 0; y < mapHeight; y++) {
            for (let x = 0; x < mapWidth; x++) {
                if (x === 0 || y === 0 || x === mapWidth - 1 || y === mapHeight - 1) {
                    map[y][x] = 'x';
                }
            }
        }

        let rooms = []; // To keep track of the rooms' coordinates and sizes.

        // Helper function to check if a room can be placed.
        function canPlaceRoom(topLeftX, topLeftY, roomWidth, roomHeight) {
            if (topLeftX + roomWidth + 1 >= mapWidth || topLeftY + roomHeight + 1 >= mapHeight || topLeftX < 1 || topLeftY < 1) {
                return false; // Room goes out of the boundary or touches the boundary edge.
            }

            return rooms.every(room => {
                return topLeftX + roomWidth < room.x || topLeftX > room.x + room.width ||
                    topLeftY + roomHeight < room.y || topLeftY > room.y + room.height;
            });
        }

        // Helper function to place a room on the map.
        function placeRoom(topLeftX, topLeftY, roomWidth, roomHeight, isTreasureRoom) {
            for (let y = topLeftY; y < topLeftY + roomHeight; y++) {
                for (let x = topLeftX; x < topLeftX + roomWidth; x++) {
                    if (y === topLeftY || y === topLeftY + roomHeight - 1 || x === topLeftX || x === topLeftX + roomWidth - 1) {
                        map[y][x] = '='; // Place wall
                    } else {
                        if (isTreasureRoom) {
                            map[y][x] = 'G';
                        }
                        else {
                            map[y][x] = '-'; // Place path inside the room
                        }
                    }
                }
            }
            rooms.push({ x: topLeftX, y: topLeftY, width: roomWidth, height: roomHeight });
        }

        // Ensure a central room is always placed first. Its location is fixed
        const [centralRoomWidth, centralRoomHeight] = [40, 12]

        // Minus 2 to avoid touching boundary walls
        // Minus additional 4 from mapHeight to ensure the  center room is slightly above the boundary edge
        const centralRoomLocation = {
            x: Math.floor((mapWidth - centralRoomWidth - 2) / 2),
            y: Math.floor((mapHeight - centralRoomHeight - 2 - 4) / 2)
        };

        placeRoom(centralRoomLocation.x, centralRoomLocation.y + (mapHeight - 12) / 2, centralRoomWidth, centralRoomHeight, false);

        this.centralRoomLocation = {
            x: centralRoomLocation.x,
            y: centralRoomLocation.y + (mapHeight - 12) / 2
        };

        this.centralRoomHeight = centralRoomHeight;
        this.centralRoomWidth = centralRoomWidth;

        // Attempt to place 3 other treasure rooms on the map.
        let numTreasureRooms = 0;
        // Randomly generate which treasure room contains the real gold
        let realTreasureRoomIndex = Math.floor(this.random(0, 2));

        while (numTreasureRooms < 3) {
            const topLeftX = Math.floor(Math.random() * (mapWidth - treasureRoomWidth - 1)) + 1;
            const topLeftY = Math.floor(Math.random() * (mapHeight - treasureRoomHeight - 1)) + 1;

            if (canPlaceRoom(topLeftX, topLeftY, treasureRoomWidth, treasureRoomHeight) && (Math.abs(topLeftX - centralRoomLocation.x) - centralRoomWidth) ** 2 + (Math.abs(topLeftY - centralRoomLocation.y) - centralRoomHeight) ** 2 > 200) {
                placeRoom(topLeftX, topLeftY, treasureRoomWidth, treasureRoomHeight, true);

                if (numTreasureRooms == realTreasureRoomIndex) {
                    // Push the real treasure room to the global variable
                    this.realTreasureRoomLocation = { x: topLeftX, y: topLeftY, width: treasureRoomWidth, height: treasureRoomHeight };
                }

                numTreasureRooms += 1;
            }
        }

        return map.map(row => row.join(''));
    }

    generateMapOverlayAreas() {
        let rooms = [];
        // With reference to the central room location, create 2 coin spawner rooms at the top left and right corners of the map
        rooms.push(new MapOverlayArea(this.centralRoomLocation.x + 1,
            this.centralRoomLocation.y + 1,
            4,
            4,
            "none",
            "./images/textures/spawnerFloor.png",
            true, "coinSpawner"));

        rooms.push(new MapOverlayArea(this.centralRoomLocation.x + this.centralRoomWidth - 5,
            this.centralRoomLocation.y + 1,
            4,
            4,
            "none",
            "./images/textures/spawnerFloor.png", 
            true, "coinSpawner"));


        // Push map overlay areas for puzzles
        rooms.push(new MapOverlayArea(this.centralRoomLocation.x + (this.centralRoomWidth / 2) - 2,
            this.centralRoomLocation.y + this.centralRoomHeight - 4,
            3,
            3,
            "static",
            "./images/textures/cipherPuzzle.png", 
            false, "cipherPuzzle"));
        
        // Push map overlay areas for shop
        rooms.push(new MapOverlayArea(this.centralRoomLocation.x + (this.centralRoomWidth / 2) - 2,
            this.centralRoomLocation.y + 1,
            3,
            1,
            "static",
            "./images/textures/cipherPuzzle.png", //temporary
            false, "shop"));

        return rooms;
    }

    updateMap(tileIndex, tileChar) {
        // Find which char in this.mapTiles to update
        let rowNum = Math.floor((tileIndex + 1) / this.numCols);
        let colNum = (tileIndex + 1) - (rowNum) * this.numCols;

        let newRow = "";
        for (let i = 0; i < this.numCols; i++) {
            if (i != colNum - 1) {
                newRow += this.mapTiles[rowNum][i];
            }
            else {
                newRow += tileChar;
            }
        }

        this.mapTiles[rowNum] = newRow;
    }

    collectCoin(coinIndex) {
        if (coinIndex != null) {
            this.coinarr.splice(coinIndex, 1);
            return true;
        } else return false;
    }

    // Function to generate a random number
    random(min, max) {
        let rand;

        rand = Math.random();

        if (typeof min === 'undefined') {
            return rand;
        } else if (typeof max === 'undefined') {
            if (Array.isArray(min)) {
                return min[Math.floor(rand * min.length)];
            } else {
                return rand * min;
            }
        } else {
            if (min > max) {
                const tmp = min;
                min = max;
                max = tmp;
            }

            return rand * (max - min) + min;
        }
    };

    generateCoins() {
        let number = 0;
        while (number < 1) {
            for (let i = 0; i < this.mapOverlayAreas.length; i++) {
                if (this.mapOverlayAreas[i].isCoinSpawner == true) {
                    let coinSpawnerRoom = this.mapOverlayAreas[i];
                    let x = this.random(coinSpawnerRoom.x + 1, coinSpawnerRoom.x + coinSpawnerRoom.w - 1);
                    let y = this.random(coinSpawnerRoom.y + 1, coinSpawnerRoom.y + coinSpawnerRoom.h - 1);
                    if (this.mapTiles[Math.floor(y)][Math.floor(x)] == '-') {
                        this.coinarr.push(new Coin(x, y));
                        number++;
                    }
                }
            }
        }
    }

    coinRateUp(duration) { // duration in seconds
        console.log("Coin rate up");
        if (this.coinrate < 5){
            this.coinrate += 1;
            setTimeout(() => {
                this.coinRateDown();
            }, duration * 1000);
        }
        
    }
    coinRateDown() {
        if (this.coinrate > 1){
            this.coinrate -= 1;
        }
    }
}


class Coin {
    constructor(x, y, value = 1) {
        // x and y here refer to which tile it is placed on
        this.x = x;
        this.y = y;
        this.value = value;
    }
}

// Class to store overlays on the map (e.g. coin spawner rooms)
// Overlay type an be one of the following:
class MapOverlayArea {
    constructor(x, y, w, h, collider, clientOverlayImgPath, isCoinSpawner, type) {
        // x and y here refer to which tile it is placed on
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.collider = collider;
        this.img = clientOverlayImgPath;
        this.isCoinSpawner = isCoinSpawner;
        this.type = type;
    }
}