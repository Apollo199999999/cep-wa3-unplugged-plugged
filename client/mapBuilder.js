class MapBuilder {
    constructor() {
        this.mapTiles = null;
    }

    buildMap(mapManager, clientSprite) {
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

        // Position tiles at the bottom center of the screen
        this.mapTiles = new Tiles(mapManager.mapTiles, 
            (width / 2) - (mapManager.numCols / 2) * mapManager.cellSize,
            height - mapManager.numRows * mapManager.cellSize,
            mapManager.cellSize,
            mapManager.cellSize);

        // Spawn the client sprite inside the room
        clientSprite.position.x = (width / 2) - (mapManager.numCols / 2);
        clientSprite.position.y = height - mapManager.cellSize * 5;
    }
}