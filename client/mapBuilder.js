class MapBuilder {
    constructor() {
        this.mapTiles = null;
    }

    setStartPos(mapManager, clientSprite) {
        // Spawn the client sprite inside the room
        clientSprite.position.x = (width / 2) - (mapManager.numCols / 2);
        clientSprite.position.y = height - mapManager.cellSize * 5;
    }

    buildMap(mapManager) {
        // Clear existing map before building
        if (this.mapTiles != null) {
            this.mapTiles.removeAll();
        }

        // Construct map based on mapmanager from server side
        let wallBricks = new Group();
        wallBricks.w = mapManager.cellSize;
        wallBricks.h = mapManager.cellSize;
        wallBricks.tile = "=";
        wallBricks.color = mapManager.wallColor;
        wallBricks.collider = 'static';
        wallBricks.stroke = mapManager.wallColor;

        let pathBricks = new Group();
        pathBricks.w = mapManager.cellSize;
        pathBricks.h = mapManager.cellSize;
        pathBricks.tile = "*";
        pathBricks.color = mapManager.pathColor;
        pathBricks.collider = 'static';
        pathBricks.stroke = mapManager.pathColor;

        let boundaryBricks = new Group();
        boundaryBricks.w = mapManager.cellSize;
        boundaryBricks.h = mapManager.cellSize;
        boundaryBricks.tile = "x";
        boundaryBricks.color = mapManager.boundaryColor;
        boundaryBricks.collider = 'static';
        boundaryBricks.stroke = mapManager.boundaryColor;

        let emptyBricks = new Group();
        emptyBricks.w = mapManager.cellSize;
        emptyBricks.h = mapManager.cellSize;
        emptyBricks.tile = "-";
        emptyBricks.color = "#484848";
        emptyBricks.collider = 'static';
        emptyBricks.stroke = "#484848";
        emptyBricks.overlaps(allSprites);
        emptyBricks.layer = -999;

        // Position tiles at the bottom center of the screen
        this.mapTiles = new Tiles(mapManager.mapTiles,
            (width / 2) - (mapManager.numCols / 2) * mapManager.cellSize,
            height - mapManager.numRows * mapManager.cellSize,
            mapManager.cellSize,
            mapManager.cellSize);
    }

    removeClickedTile() {
        // Iterate through map tiles to retrieve the sprite that is clicked
        for (let i = 0; i < this.mapTiles.length; i++) {
            let currTile = this.mapTiles[i];

            // Prevent the user from breaking boundary tiles or empty spaces
            if (currTile.mouse.released() == true && currTile.tile != "x" && currTile.tile != "-") {
                // Send the index of the tile to the server
                socket.emit("mapModified", i, true, "");
                break;
            }
        }
    }

    addClickedTile(tileChar) {
        // Iterate through map tiles to retrieve the sprite that is clicked
        for (let i = 0; i < this.mapTiles.length; i++) {
            let currTile = this.mapTiles[i];

            // Prevent the user from breaking boundary tiles or empty spaces
            if (currTile.mouse.released() == true && currTile.tile == "-") {
                // Send the index of the tile to the server
                socket.emit("mapModified", i, false, tileChar);
                break;
            }
        }
    }
}