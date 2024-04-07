class EntityManager {
    constructor() {
        this.entities = new Map();
    }

    exists(id) {
        return this.entities.has(id);
    }

    get(id) {
        return this.entities.get(id);
    }

    delete(id) {
        return this.entities.delete(id);
    }

    registerNewPlayer(data) {
        console.log(data);
        let playerSprite = createPlayerSprite(data.ign);
        playerSprite.x = data.position.x;
        playerSprite.y = data.position.y;
        this.entities.set(data.id, {
            sprite: playerSprite,
            positionBuffer: [],
        });
    }

    updatePlayerData(newData) {
        let currData = this.entities.get(newData.id);
        currData.sprite.visible = true;
        if (!currData) return;
        currData.positionBuffer.push({
            timestamp: +new Date(),
            x: newData.position.x,
            y: newData.position.y,
        });
        // Restrict MAX number of position objects in `positionBuffer`.
        // When objects are appended past limit, oldest objects are discarded
        // to keep Array size <= `POSITION_BUFFER_MAX_LENGTH`
        const POSITION_BUFFER_MAX_LENGTH = 60;
        if (currData.positionBuffer.length > POSITION_BUFFER_MAX_LENGTH) {
            currData.positionBuffer.splice(
                0,
                currData.positionBuffer.length - POSITION_BUFFER_MAX_LENGTH
            );
        }
    }
}

function createPlayerSprite(name) {
    let playerSprite = new Sprite(0, 0, 32, 32);
    playerSprite.text = name;
    playerSprite.visible = true;

    // Load sprite sheet
    playerSprite.spriteSheet = "./images/textures/dwarf-sprite-sheet.png";
    playerSprite.anis.frameDelay = 2;
    playerSprite.addAnis({
        idle: {row: 0, frames: 5, w: 64, h: 32},
        run: {row: 1, frames: 8, w: 64, h: 32},
    });
    playerSprite.anis.scale = 2;

    return playerSprite;
}
