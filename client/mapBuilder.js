class MapBuilder {
    constructor() {
        this.mapTiles = null;

        // Map diagram variables
        this.diagramw = 200;
        this.diagramh = 200;
        this.w = 2;
        this.h = 2;

        this.numCols = 0;
        this.numRows = 0;
        this.mapDiagram = createGraphics(this.diagramw, this.diagramh); //adjusted to no of cols and rows
        this.mapCellSize;
        this.mapBuilt = false;

        // Store position of map tileset
        this.mapX;
        this.mapY;

        // Store the location of the real treasure room
        this.realTreasureRoomLocation = [];

        // Stores location of map overlay areas
        this.mapOverlayAreas;

        // Create sprite groups based on the different tiles available in the map
        this.wallBricks = new Group();
        this.pathBricks = new Group();
        this.boundaryBricks = new Group();
        this.emptyBricks = new Group();
        this.goldBricks = new Group();
        this.coingroup = new Group();
        this.mapOverlayAreaSprite = new Group();

        // Stores the coins received from server-side
        this.coins = [];

        this.coingroup.w = 60
        this.coingroup.h = 60
        this.coingroup.tile = "c";
        this.coingroup.overlaps(allSprites);
        this.coingroup.layer = 999;
        this.coingroup.spriteSheet = "./images/textures/coin4_16x16.png";
        this.coingroup.addAnis({
            idle: { row: 0, frames: 9, w: 16, h: 16 },
        });
        this.coingroup.anis.frameDelay = 2;
        this.coingroup.anis.scale = 4;
        this.coingroup.anis.rotation = 0;

        // To indicate which tile can be edited
        this.selectedtile = new Sprite();
        this.selectedtile.visible = false;
        this.selectedtile.collider = "none";
        this.selectedtile.w = 32;
        this.selectedtile.h = 32;
        this.selectedtile.stroke = "yellow";
        this.selectedtile.strokeWeight = 2;
        this.selectedtile.img = "./images/textures/selected.png";

        this.revealRoomTile = new Sprite();
        this.revealRoomTile.w = 5 * 32;
        this.revealRoomTile.h = 7 * 32;
        this.revealRoomTile.pos.x = 1300
        this.revealRoomTile.pos.y = 400
        this.revealRoomTile.collider = 'none';
        // this.revealRoomTile.layer = 1000000;
        this.revealRoomTile.visible = false;
        this.revealRoomTile.img = "./images/textures/foundtreasureroom.png"

    }

    setStartPos(mapManager, clientSprite) {
        // Spawn the client sprite inside the room
        clientSprite.position.x = (width / 2) - (mapManager.numCols / 2);
        clientSprite.position.y = height - mapManager.cellSize * 7;
    }


    revealRoom(mapManager){
        this.revealRoomTile.pos.x = (mapManager.realTreasureRoomLocation.x * this.mapCellSize + this.mapX) + 32 * 3;
        this.revealRoomTile.pos.y = (mapManager.realTreasureRoomLocation.y * this.mapCellSize + this.mapY) + 32 * 4;
        // this.revealRoomTile.pos = createVector(this.realTreasureRoomLocation.x * this.mapCellSize + this.mapX, this.realTreasureRoomLocation.y * this.mapCellSize + this.mapY);
        this.revealRoomTile.visible = true;
        this.revealRoomTile.layer = 1000000;
        // console.log(mapManager.realTreasureRoomLocation.x * this.mapCellSize + this.mapX, this.realTreasureRoomLocation.y * this.mapCellSize)
        // console.log(this.revealRoomTile);

    }

    findMapPosition(clientSprite) {
        let x = Math.round((clientSprite.pos.x - this.mapX) / this.mapCellSize);
        let y = Math.round((clientSprite.pos.y - this.mapY) / this.mapCellSize);

        return createVector(x, y);
    }

    displaySelectedTile(tileIndex, muted) {
        if (tileIndex != -1) {
            let currTile = this.mapTiles[tileIndex];
            this.selectedtile.pos.x = currTile.x;
            this.selectedtile.pos.y = currTile.y;
            this.selectedtile.visible = true;
            this.selectedtile.layer = 999999;
            if (muted) {
                console.log("Muted");
                this.selectedtile.img = "./images/textures/selected_muted.png";
            } else {
                this.selectedtile.img = "./images/textures/selected.png";
            }
        }
    }

    buildMap(mapManager) {
        // Clear existing map before building
        if (this.mapTiles != null) {
            this.mapTiles.removeAll();
        }

        this.numCols = mapManager.numCols;
        this.numRows = mapManager.numRows;
        this.mapDiagram = createGraphics(this.numCols * this.w, this.numRows * this.h);

        // Construct map based on mapmanager from server side
        this.wallBricks.w = mapManager.cellSize; // Width of each brick
        this.wallBricks.h = mapManager.cellSize; // Height of each brick
        this.wallBricks.tile = "=";
        this.wallBricks.color = mapManager.wallColor;
        this.wallBricks.collider = 'static';
        this.wallBricks.stroke = mapManager.wallColor;
        this.wallBricks.layer = 990;
        this.wallBricks.img = "./images/textures/wall.png";

        this.pathBricks.w = mapManager.cellSize;
        this.pathBricks.h = mapManager.cellSize;
        this.pathBricks.tile = "*";
        this.pathBricks.color = mapManager.pathColor;
        this.pathBricks.collider = 'static';
        this.pathBricks.stroke = mapManager.pathColor;
        this.pathBricks.layer = 990;
        this.pathBricks.img = "./images/textures/path.png";

        this.boundaryBricks.w = mapManager.cellSize;
        this.boundaryBricks.h = mapManager.cellSize;
        this.boundaryBricks.tile = "x";
        this.boundaryBricks.color = mapManager.boundaryColor;
        this.boundaryBricks.collider = 'static';
        this.boundaryBricks.stroke = mapManager.boundaryColor;
        this.boundaryBricks.layer = 990;
        this.boundaryBricks.img = "./images/textures/boundary.png";

        this.goldBricks.w = mapManager.cellSize;
        this.goldBricks.h = mapManager.cellSize;
        this.goldBricks.tile = "G";
        this.goldBricks.color = mapManager.goldColor;
        this.goldBricks.collider = 'static';
        this.goldBricks.stroke = mapManager.goldColor;
        this.goldBricks.overlaps(allSprites);
        this.goldBricks.layer = -999;
        this.goldBricks.img = "./images/textures/gold.png";

        this.emptyBricks.w = mapManager.cellSize;
        this.emptyBricks.h = mapManager.cellSize;
        this.emptyBricks.tile = "-";
        this.emptyBricks.color = "#484848";
        this.emptyBricks.collider = 'static';
        this.emptyBricks.stroke = "#484848";
        this.emptyBricks.overlaps(allSprites);
        this.emptyBricks.layer = -999;
        this.emptyBricks.img = "./images/textures/empty.png";

        // Position tiles at the bottom center of the screen
        this.mapTiles = new Tiles(mapManager.mapTiles, // 2D array of tiles
            (width / 2) - (mapManager.numCols / 2) * mapManager.cellSize, // x to centralise map
            height - mapManager.numRows * mapManager.cellSize, // y to position at top
            mapManager.cellSize,
            mapManager.cellSize);

        this.mapX = (width / 2) - (mapManager.numCols / 2) * mapManager.cellSize;
        this.mapY = height - mapManager.numRows * mapManager.cellSize;

        // Obtain the real treasure room
        this.realTreasureRoomLocation = mapManager.realTreasureRoomLocation;
        this.mapCellSize = mapManager.cellSize;

        // Build map overlays
        // Define props for map overlays
        this.mapOverlayAreaSprite.collider = 'static';
        this.mapOverlayAreaSprite.layer = 999;

        // Build map overlay areas
        let mapOverlayAreas = mapManager.mapOverlayAreas;
        this.mapOverlayAreas = mapManager.mapOverlayAreas;

        for (let i = 0; i < mapOverlayAreas.length; i++) {
            let mapOverlayArea = mapOverlayAreas[i];
            let mapOverlayAreaSprite = new this.mapOverlayAreaSprite.Sprite();

            if (mapOverlayArea.collider == "none") {
                mapOverlayAreaSprite.overlaps(allSprites);
            }

            mapOverlayAreaSprite.w = mapOverlayArea.w * this.mapCellSize;
            mapOverlayAreaSprite.h = mapOverlayArea.h * this.mapCellSize;
            // p5play treats position of rectangle using the center point of the rect, hence this suspicious positioning fix
            mapOverlayAreaSprite.x = (mapOverlayArea.x * this.mapCellSize) + this.mapX + (mapOverlayAreaSprite.w / 2) - (this.mapCellSize / 2);
            mapOverlayAreaSprite.y = (mapOverlayArea.y * this.mapCellSize) + this.mapY + (mapOverlayAreaSprite.h / 2) - (this.mapCellSize / 2);
            mapOverlayAreaSprite.img = mapOverlayArea.img;
        }

        this.mapBuilt = true;
    }

    updateClickedTile(tileIndex, tileTarget) {
        let currTile = this.mapTiles[tileIndex];

        if (tileIndex != null) {
            if (tileTarget == "x") {
                let newTile = new this.boundaryBricks.Sprite();
                newTile.x = currTile.x;
                newTile.y = currTile.y;
                this.mapTiles[tileIndex] = newTile;
            } else if (tileTarget == "*") {
                let newTile = new this.pathBricks.Sprite();
                newTile.x = currTile.x;
                newTile.y = currTile.y;
                this.mapTiles[tileIndex] = newTile;
            } else if (tileTarget == "=") {
                let newTile = new this.wallBricks.Sprite();
                newTile.x = currTile.x;
                newTile.y = currTile.y;
                this.mapTiles[tileIndex] = newTile;
            } else if (tileTarget == "-") {
                let newTile = new this.emptyBricks.Sprite();
                newTile.x = currTile.x;
                newTile.y = currTile.y;
                this.mapTiles[tileIndex] = newTile;
            }
            currTile.remove();
            this.mapTiles.update();
        }
    }


    editClickedTile(tileChar, selectedTileIndex) {
        let currTile = this.mapTiles[selectedTileIndex];

        // Prevent the user from adding a tile in a non-empty space
        if (currTile.tile == "-" && tileChar != "-") {
            socket.emit("mapModified", selectedTileIndex, tileChar);
            return true;
        }
        // Prevent the user from breaking boundary tiles/gold tiles
        if (tileChar == "-" && currTile.tile != "x" && currTile.tile != "-" && currTile.tile != 'G') {
            socket.emit("mapModified", selectedTileIndex, "-");
            return true;
        }

        return false;
    }

    generateMapDiagram() {
        // Generate the map diagram
        push();
        this.mapDiagram.background(255);
        this.mapDiagram.stroke(0);
        this.mapDiagram.strokeWeight(0);
        for (let i = 0; i < this.mapTiles.length; i++) {
            let rowNum = Math.floor((i) / this.numCols);
            let colNum = (i) - (rowNum) * this.numCols;
            let currTile = this.mapTiles[i];
            this.mapDiagram.fill(currTile.color);
            this.mapDiagram.rect((colNum) * this.w, rowNum * this.h, this.w, this.h);
        }
        pop();
    }

    displayMapDiagram() {
        // Display the map diagram on the console
        image(this.mapDiagram, 50, height - 200);
    }

    displayCoins(mapManager) {
        // Generate coins on the map
        // Clear our current record of coins
        for (let i = 0; i < this.coins.length; i++) {
            if (this.coins[i] != null) {
                this.coins[i].remove();
            }
        }
        this.coins = [];

        // Spawn coins on the map
        for (let i = 0; i < mapManager.coinarr.length; i++) {
            // We know which tile the coin is on
            let coin = mapManager.coinarr[i];
            let coinXTile = coin.x;
            let coinYTile = coin.y;

            // Calculate coinX and coinY based on the position of the map
            let coinX = coinXTile * mapManager.cellSize + this.mapX;
            let coinY = coinYTile * mapManager.cellSize + this.mapY;
            this.createCoin(coinX, coinY, mapManager.coinWidth, mapManager.coinHeight);
        }
    }

    createCoin(posx, posy, coinWidth, coinHeight) {
        let coin = new this.coingroup.Sprite();
        coin.x = posx;
        coin.y = posy;
        coin.rotation = 0;
        coin.width = coinWidth;
        coin.height = coinHeight;
        coin.scale = { x: 1.5, y: 1.5 };
        coin.draw = () => {
            coin.ani.draw(0, 0, 0, coin.scale.x, coin.scale.y);
        }

        this.coins.push(coin);
    }

    checkPlayerCollectedCoins(playerSprite) {
        // Check if player has collected a coin
        for (let i = 0; i < this.coins.length; i++) {
            let coin = this.coins[i];
            if (dist(playerSprite.x, playerSprite.y, coin.x, coin.y) < 64) {
                socket.emit("collectCoin", i, this.coins.length);
                console.log("Coin collected");
            }
        }
    }

    checkPlayerInTreasureRoom(playerSprite) {
        if (this.mapBuilt == true) {
            // Get the dimensions of the treasure room
            // + and - to exclude walls
            let x = (this.realTreasureRoomLocation.x + 1) * this.mapCellSize + this.mapX;
            let y = (this.realTreasureRoomLocation.y + 1) * this.mapCellSize + this.mapY;
            let w = (this.realTreasureRoomLocation.width - 2) * this.mapCellSize;
            let h = (this.realTreasureRoomLocation.height - 2) * this.mapCellSize;

            if (playerSprite.pos.x > x && playerSprite.pos.x < x + w && playerSprite.pos.y > y && playerSprite.pos.y < y + h) {
                socket.emit("gameOver", "dwarf");
            }
        }
    }

    // Check if the player is near any usable object (i.e. any map overlay that is not a coin spawner)
    checkPlayerNearUsableObject(playerSprite) {
        if (this.mapBuilt == true) {
            for (let i = 0; i < this.mapOverlayAreas.length; i++) {
                let mapOverlayArea = this.mapOverlayAreas[i];

                if (mapOverlayArea.isCoinSpawner == false) {
                    // Get the dimensions of the map overlay area
                    // Increase the map overlay area to include the area around the overlay
                    let areaPadding = 1.5;
                    let x = (mapOverlayArea.x - areaPadding) * this.mapCellSize + this.mapX;
                    let y = (mapOverlayArea.y - areaPadding) * this.mapCellSize + this.mapY;
                    let w = (mapOverlayArea.w + areaPadding * 2) * this.mapCellSize;
                    let h = (mapOverlayArea.h + areaPadding * 2) * this.mapCellSize;

                    if (playerSprite.pos.x > x && playerSprite.pos.x < x + w && playerSprite.pos.y > y && playerSprite.pos.y < y + h) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    // Function to get the map overlay that the player is closest to 
    getPlayerUsingWhichOverlayIndex(playerSprite) {
        if (this.mapBuilt == true) {
            for (let i = 0; i < this.mapOverlayAreas.length; i++) {
                let mapOverlayArea = this.mapOverlayAreas[i];

                if (mapOverlayArea.isCoinSpawner == false) {
                    // Get the dimensions of the map overlay area
                    // Increase the map overlay area to include the area around the overlay
                    let areaPadding = 1.5;
                    let x = (mapOverlayArea.x - areaPadding) * this.mapCellSize + this.mapX;
                    let y = (mapOverlayArea.y - areaPadding) * this.mapCellSize + this.mapY;
                    let w = (mapOverlayArea.w + areaPadding * 2) * this.mapCellSize;
                    let h = (mapOverlayArea.h + areaPadding * 2) * this.mapCellSize;

                    if (playerSprite.pos.x > x && playerSprite.pos.x < x + w && playerSprite.pos.y > y && playerSprite.pos.y < y + h) {
                        return i;
                    }
                }
            }
        }
        return -1;
    }
}