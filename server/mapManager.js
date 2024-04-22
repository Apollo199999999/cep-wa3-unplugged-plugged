export default class MapManager {
    constructor() {
        // = means room walls, * means places where players can break to create new paths, x means boundary, - means empty space
        // The following is how a map tileset should look like (even though maps are randomly generated currently)
        this.mapTiles =
            [
                'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
                'x***************************************************************x',
                'x===============************************************************x',
                'x=-------------=************************************************x',
                'x=-------------=************************************************x',
                'x=-------------=************************************************x',
                'x=-------------=************************************************x',
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

        // Variable to store central room location after spawning rooms
        this.centralRoomLocation = {x: 0, y: 0};

        this.boundaryColor = "red";
        // Stores Coin objects, which tell us where each coin on the map is
        this.coinarr = [];
        this.coinWidth = 30;
        this.coinHeight = 30;
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
        function placeRoom(topLeftX, topLeftY, roomWidth, roomHeight) {
            for (let y = topLeftY; y < topLeftY + roomHeight; y++) {
                for (let x = topLeftX; x < topLeftX + roomWidth; x++) {
                    if (y === topLeftY || y === topLeftY + roomHeight - 1 || x === topLeftX || x === topLeftX + roomWidth - 1) {
                        map[y][x] = '='; // Place wall
                    } else {
                        map[y][x] = '-'; // Place path inside the room
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
        this.centralRoomLocation = centralRoomLocation;
        placeRoom(centralRoomLocation.x, centralRoomLocation.y + (mapHeight - 12) / 2, centralRoomWidth, centralRoomHeight);

        // Attempt to place 3 other treasure rooms on the map.
        let numTreasureRooms = 0;
        while (numTreasureRooms < 3) {
            const topLeftX = Math.floor(Math.random() * (mapWidth - treasureRoomWidth - 1)) + 1;
            const topLeftY = Math.floor(Math.random() * (mapHeight - treasureRoomHeight - 1)) + 1;

            if (canPlaceRoom(topLeftX, topLeftY, treasureRoomWidth, treasureRoomHeight) && (Math.abs(topLeftX - centralRoomLocation.x) - centralRoomWidth) ** 2 + (Math.abs(topLeftY - centralRoomLocation.y) - centralRoomHeight) ** 2 > 200) {
                placeRoom(topLeftX, topLeftY, treasureRoomWidth, treasureRoomHeight);
                numTreasureRooms += 1;
            }
        }

        return map.map(row => row.join(''));
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


    generateCoins() {
        //this.coinarr = [];
        let number = 0;

        // Function to generate a random number
        function random(min, max) {
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

        while (number < 5) {
            let x = random(this.centralRoomLocation.x, this.numCols);
            let y = random(this.centralRoomLocation.y, this.numRows);
            if (this.mapTiles[Math.floor(y)][Math.floor(x)] == '-') {
                this.coinarr.push(new Coin(x, y));
                number++;
            }
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