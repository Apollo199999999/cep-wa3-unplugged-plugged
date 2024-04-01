export default class MapManager {
    constructor() {
        // = means room walls, * means places where players can break to create new paths, x means boundary
        this.mapTiles =
            [
                'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
                'x***************************************************************x',
                'x===============************************************************x',
                'x=.............=************************************************x',
                'x=.............=************************************************x',
                'x=.............=************************************************x',
                'x=.............=************************************************x',
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
                'x***********==========================================**********x',
                'x***********=........................................=**********x',
                'x***********=........................................=**********x',
                'x***********=........................................=**********x',
                'x***********=........................................=**********x',
                'x***********=........................................=**********x',
                'x***********=........................................=**********x',
                'x***********=........................................=**********x',
                'x***********=........................................=**********x',
                'x***********==========================================**********x',
                'x***************************************************************x',
                'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
            ]

        this.cellSize = 32;
        this.numCols = this.mapTiles[0].length;
        this.numRows = this.mapTiles.length;
        this.wallColor = "grey";
        this.pathColor = "black";
        this.boundaryColor = "red";
    }

}