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
        let playerSprite = createPlayerSprite(data.ign);
        playerSprite.x = data.position.x;
        playerSprite.y = data.position.y;
        this.entities.set(data.id, {
            ign: data.ign,
            sprite: playerSprite,
            positionBuffer: [],
            coins: data.coins,
        });
    }

    updatePlayerData(newData) {
        let currData = this.entities.get(newData.id);
        currData.sprite.visible = true;
        currData.coins = newData.coins;
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
    playerSprite.visible = true;

    // Load sprite sheet
    playerSprite.spriteSheet = "./images/textures/dwarf-sprite-sheet.png";
    playerSprite.anis.offset.y = -4;
    playerSprite.anis.frameDelay = 2;
    playerSprite.addAnis({
        idle: {row: 0, frames: 5, w: 64, h: 32},
        run: {row: 1, frames: 8, w: 64, h: 32},
    });
    playerSprite.anis.scale = 2;

    // Manually draw the ign by overriding the draw function
    // Taking reference from https://github.com/quinton-ashley/p5play/blob/main/p5play.js
    playerSprite.draw = () => {
        fill("white");
        textAlign(CENTER, CENTER);
        textSize(16);
        text(name, 0, -35);

        playerSprite.ani.draw(playerSprite.offset.x, playerSprite.offset.y, 0, playerSprite.scale.x, playerSprite.scale.y);
    }


    return playerSprite;
}
