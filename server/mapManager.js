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
                'x***********==========================================**********x',
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

        this.cellSize = 32;
        this.numCols = this.mapTiles[0].length;
        this.numRows = this.mapTiles.length;
        this.wallColor = "grey";
        this.pathColor = "black";
        this.boundaryColor = "red";
    }

    updateMap(tileIndex, isTileBroken, tileChar) {
        //console.log("d")
        console.log(tileIndex)
        // Find which char in this.mapTiles to update
        let rowNum = Math.floor((tileIndex + 1) / this.numCols);
        let colNum =  (tileIndex + 1) - (rowNum) * this.numCols;
        console.log(colNum, rowNum)

        if (isTileBroken) {
            let newRow = "";
            for (let i = 0; i < this.numCols; i++) {
                if (i != colNum - 1) {
                    newRow += this.mapTiles[rowNum][i];
                }
                else {
                    newRow += '-';
                }
            }

            this.mapTiles[rowNum] = newRow;
        }
        else {
            console.log("d", tileChar)
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
}