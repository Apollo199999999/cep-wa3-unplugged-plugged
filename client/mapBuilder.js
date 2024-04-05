class MapBuilder {
    constructor() {
        this.mapTiles = null;
    }

    setStartPos(mapManager, clientSprite) {
        // Spawn the client sprite inside the room
        clientSprite.position.x = (width / 2) - (mapManager.numCols / 2);
        clientSprite.position.y = height - mapManager.cellSize * 5;
    }

    buildMap(mapManager, tileIndex) {
        // Clear existing map before building
        if (this.mapTiles != null) {
            this.mapTiles.removeAll();
        }
        
        // Construct map based on mapmanager from server side
        let wallBricks = new Group();
        wallBricks.w = mapManager.cellSize; // Width of each brick
        wallBricks.h = mapManager.cellSize; // Height of each brick
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
        this.mapTiles = new Tiles(mapManager.mapTiles, // 2D array of tiles
            (width / 2) - (mapManager.numCols / 2) * mapManager.cellSize, // x to centralise map
            height - mapManager.numRows * mapManager.cellSize, // y to position at top
            mapManager.cellSize,
            mapManager.cellSize);
    }

    updateClickedTile(mapManager, tileIndex) {
        if (tileIndex != null) {
            console.log("Tile index: " + tileIndex, this.mapTiles[tileIndex]);
            let currTile = this.mapTiles[tileIndex];
            let rowNum = Math.floor((tileIndex + 1) / mapManager.numCols);
            let colNum =  (tileIndex + 1) - (rowNum) * mapManager.numCols ;
            console.log(currTile.position.x, currTile.position.y, mapManager.mapTiles[rowNum][colNum], rowNum, colNum);
            //console.log(mouseX, mouseY, "mouse");
            console.log(currTile.tile)
                
            if (mapManager.mapTiles[rowNum][colNum] == "x"){ //collision is suspicious
                this.mapTiles[tileIndex].tile = "x";
                this.mapTiles[tileIndex].w = mapManager.cellSize;
                this.mapTiles[tileIndex].h = mapManager.cellSize;
                this.mapTiles[tileIndex].color = mapManager.boundaryColor;
                this.mapTiles[tileIndex].collider = 'static';
                this.mapTiles[tileIndex].stroke = mapManager.boundaryColor;
                this.mapTiles[tileIndex].layer = 1;
                this.mapTiles[tileIndex].collides(allSprites);
            } else if (mapManager.mapTiles[rowNum][colNum] == "*"){
                this.mapTiles[tileIndex].tile = "*";
                this.mapTiles[tileIndex].w = mapManager.cellSize;
                this.mapTiles[tileIndex].h = mapManager.cellSize;
                this.mapTiles[tileIndex].color = mapManager.pathColor;
                this.mapTiles[tileIndex].collider = 'static';
                this.mapTiles[tileIndex].stroke = mapManager.pathColor;
                this.mapTiles[tileIndex].layer = 1;
                this.mapTiles[tileIndex].collides(allSprites);
            } else if (mapManager.mapTiles[rowNum][colNum] == "="){
                this.mapTiles[tileIndex].tile = "=";
                this.mapTiles[tileIndex].w = mapManager.cellSize;
                this.mapTiles[tileIndex].h = mapManager.cellSize;
                this.mapTiles[tileIndex].color = mapManager.wallColor;
                this.mapTiles[tileIndex].collider = 'static';
                this.mapTiles[tileIndex].stroke = mapManager.wallColor;
                this.mapTiles[tileIndex].layer = 1;
                this.mapTiles[tileIndex].collides(allSprites);
            } else if (mapManager.mapTiles[rowNum][colNum] == "-"){
                this.mapTiles[tileIndex].tile = "-";
                this.mapTiles[tileIndex].w = mapManager.cellSize;
                this.mapTiles[tileIndex].h = mapManager.cellSize;
                this.mapTiles[tileIndex].color = "#484848";
                this.mapTiles[tileIndex].collider = 'static';
                this.mapTiles[tileIndex].overlaps(allSprites);
                this.mapTiles[tileIndex].layer = -999;
                this.mapTiles[tileIndex].stroke = "#484848";
            }
            console.log(this.mapTiles[tileIndex], "new tile")

            //currTile.tile = mapManager.mapTiles[rowNum][colNum];
        }
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