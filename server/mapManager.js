export default class MapManager {
    constructor() {
        // = means room walls, * means places where players can break to create new paths, x means boundary, - means empty space
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

        this.mapTiles = this.generateMapWithCenterRoom(60, 60, 15, [[7, 9], [10, 15], [15, 8]]);
        this.cellSize = 32;
        this.numCols = this.mapTiles[0].length;
        this.numRows = this.mapTiles.length;
        this.wallColor = "grey";
        this.pathColor = "black";

        this.boundaryColor = "red";
    }
    generateMapWithCenterRoom(width, height, roomAttempts, roomSizes) {
        // Initialize the map with "*" for the outside area.
        let map = Array.from({ length: height }, () => Array(width).fill('*'));

        // Set the outer boundary of the map as "x".
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (x === 0 || y === 0 || x === width - 1 || y === height - 1) {
                    map[y][x] = 'x';
                }
            }
        }

        let rooms = []; // To keep track of the rooms' coordinates and sizes.

        // Helper function to check if a room can be placed.
        function canPlaceRoom(topLeftX, topLeftY, roomWidth, roomHeight) {
            if (topLeftX + roomWidth + 1 >= width || topLeftY + roomHeight + 1 >= height || topLeftX < 1 || topLeftY < 1) {
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

        // Ensure a central room is always placed first.
        const [centralRoomWidth, centralRoomHeight] = [10, 8]
        const centralRoomLocation = {
            x: Math.floor((width - centralRoomWidth) / 2),
            y: Math.floor((height - centralRoomHeight) / 2)
        };
        placeRoom(centralRoomLocation.x, centralRoomLocation.y + (height - 12) / 2, centralRoomWidth, centralRoomHeight);

        // Attempt to place other rooms on the map.
        for (let attempt = 0; attempt < roomAttempts; attempt++) {
            const roomIndex = Math.floor(Math.random() * roomSizes.length);
            const [roomWidth, roomHeight] = roomSizes[roomIndex];
            const topLeftX = Math.floor(Math.random() * (width - roomWidth - 1)) + 1;
            const topLeftY = Math.floor(Math.random() * (height - roomHeight - 1)) + 1;

            if (canPlaceRoom(topLeftX, topLeftY, roomWidth, roomHeight)) {
                placeRoom(topLeftX, topLeftY, roomWidth, roomHeight);
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
}