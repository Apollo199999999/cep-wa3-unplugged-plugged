let playerSprite;
let em;
let mapBuilder;
let camManager;
let currentRoomCode = null;
let localIGN = null;
let coins = 0; // for now, coin addition is done on the server side
let allowMapModification = true;
let wallEditorMode = '-'; //for future use
let breakDir = 0; //0 for up, 1 for left, 2 for down, 3 for right
let playerMapPos;

//iframe to display player stats
let playerStatsFrame;

// Only start drawing stuff after the client successfully registers itself with the server
let setupComplete = false;

// Map cooldown variables
let mapCooldownPeriod = 30;
let mapCooldownLeft = 0;

// Stores the current overlay window that is open
let openOverlayWindow;

const socket = io.connect("ws://localhost:8001");

window.onload = () => {
    // Retrieve IGN and room code from url query
    const urlParams = new URLSearchParams(
        window.location.search,
    );

    localIGN = urlParams.get('ign');
    Object.freeze(localIGN);

    currentRoomCode = urlParams.get('roomCode');
    Object.freeze(currentRoomCode);

    // Tell the client to register itself with the server event
    socket.emit("registerClient", localIGN, currentRoomCode);
};


socket.on("buildMap", (mapManager) => {
    playerSprite = createPlayerSprite(localIGN);
    camManager.setTarget(playerSprite);
    mapBuilder.buildMap(mapManager);
    mapBuilder.generateMapDiagram();
    mapBuilder.setStartPos(mapManager, playerSprite);
    mapBuilder.displayCoins(mapManager);

    playerSprite.changeAni('idle');
    setupComplete = true;
});

socket.on("updateMap", (tileIndex, tileChar) => {
    mapBuilder.updateClickedTile(tileIndex, tileChar);
    mapBuilder.generateMapDiagram();
});

socket.on("updateCoins", (mapManager) => {
    mapBuilder.displayCoins(mapManager);
});

socket.on("playerDataUpdate", (id, playerData) => {
    for (let data of playerData) {
        if (data.id === id) {
            coins = data.coins;
            continue;
        };
        if (!em.exists(data.id)) {
            em.registerNewPlayer(data);
        } else {
            em.updatePlayerData(data);
        }
    }
});

socket.on("removeClient", (id) => {
    let playerData = em.get(id);
    if (playerData) {
        playerData.sprite.remove();
        em.delete(id);
    }
});

socket.on("gameOver", (ownId, winId) => {
    if (ownId == winId) {
        window.location.href = "gameOver.html?player=" + localIGN;
    }
    else {
        window.location.href = "gameOver.html?player=" + em.get(id).ign;
    }
});

// used as a replacement for console.log on server side to log messages to client
socket.on("Log", (msg) => {
    console.log(msg, "logger");
});


function setup() {
    new Canvas("fullscreen");
    em = new EntityManager();
    mapBuilder = new MapBuilder();
    camManager = new CameraManager(camera);

    // p5play draws over our draw() loop, so we
    // have to jump thru hoops to draw our text
    // over our sprites...... by making a another
    // sprite. wow.
    let text_layer = new Sprite();
    text_layer.visible = false;
    text_layer.collider = "none";
    text_layer.update = () => {
        textAlign(CENTER, CENTER);
        textSize(32);
        text(`Room Code: ${currentRoomCode}`, 0, 50, width, 50);
    };

    let minimap = new Sprite();
    minimap.visible = false;
    minimap.collider = "none";
    minimap.update = () => {
        mapBuilder.displayMapDiagram();
    }
    minimap.layer = 999;

    playerMapPos = createVector();

    // Create an iframe to display player stats
    playerStatsFrame = createElement('iframe').size(250, 80);
    playerStatsFrame.position(width - 10 - playerStatsFrame.width, 10);
    playerStatsFrame.attribute('src', './ui/playerStats.html');
}


let selectedTileIndex = -1;

function selectTile() {
    if (breakDir == 0) {
        selectedTileIndex = (playerMapPos.y - 1) * mapBuilder.numCols + playerMapPos.x; //may need 0 indexing or smth
    } else if (breakDir == 1) {
        selectedTileIndex = playerMapPos.y * mapBuilder.numCols + playerMapPos.x - 1;
    } else if (breakDir == 2) {
        selectedTileIndex = (playerMapPos.y + 1) * mapBuilder.numCols + playerMapPos.x;
    } else if (breakDir == 3) {
        selectedTileIndex = playerMapPos.y * mapBuilder.numCols + playerMapPos.x + 1;
    }

    selectedTileIndex = Math.round(selectedTileIndex);
}

let interactionBtn;
function draw() {
    if (setupComplete) {
        background("#000000");
        move();
        interpolateOtherPlayers();
        camManager.update();
        socket.emit("position", playerSprite.pos.x, playerSprite.pos.y);

        // Prevent playersprite from becoming rotated on collision
        playerSprite.rotation = 0;

        // Map diagram display shouldnt be bound by any conditions
        mapBuilder.displayMapDiagram();

        playerMapPos = mapBuilder.findMapPosition(playerSprite);

        selectTile();

        mapBuilder.displaySelectedTile(selectedTileIndex);

        // Check if players are within range of coins
        mapBuilder.checkPlayerCollectedCoins(playerSprite);

        // Check if players are inside the real treasure room
        mapBuilder.checkPlayerInTreasureRoom(playerSprite);

        // Check if player is near any usable map overlay, and if so, show a button for the user to interact with the area
        if (mapBuilder.checkPlayerNearUsableObject(playerSprite) == true && interactionBtn == undefined) {
            interactionBtn = createButton('Examine');
            interactionBtn.addClass('btn btn-primary w-32');
            interactionBtn.position(width / 2 - 64, height - 100);
            interactionBtn.mouseClicked(examineBtnClicked);
        }
        else if (mapBuilder.checkPlayerNearUsableObject(playerSprite) == false && interactionBtn != undefined) {
            interactionBtn.remove();
            interactionBtn = undefined;
        }

        // Update player stats (from playerStats.js)
        updateCoinCounter((playerStatsFrame.elt.contentDocument || playerStatsFrame.elt.contentWindow.document), coins);
        updateCooldownLeft((playerStatsFrame.elt.contentDocument || playerStatsFrame.elt.contentWindow.document), mapCooldownLeft);
    }
}

let numberOfBlocksEdited = 0;

// Variable to store setInterval object to do map cooldown
let cooldownTimer;

function mouseReleased() {
    if (setupComplete && allowMapModification && numberOfBlocksEdited < 5) {
        let successfulEditMap = mapBuilder.editClickedTile(wallEditorMode, selectedTileIndex);
        if (successfulEditMap) {
            numberOfBlocksEdited++;
        }
    }
    if (numberOfBlocksEdited >= 5) {
        allowMapModification = false;
        mapCooldownLeft = mapCooldownPeriod;
        numberOfBlocksEdited = 0;
        cooldownTimer = setInterval(function () {
            if (mapCooldownLeft > 0) {
                mapCooldownLeft -= 1;
            }
            else {
                mapCooldownLeft = 0;
                allowMapModification = true;
                clearInterval(cooldownTimer);
            }
        }, 1000);
    }
}
    
function closeOverlayWindow() {
    if (openOverlayWindow != undefined) {
        openOverlayWindow.remove();
        openOverlayWindow = undefined;
    }
}

function examineBtnClicked() {
    // Get which map overlay the player is trying to use
    let overlayIdx = mapBuilder.getPlayerUsingWhichOverlayIndex(playerSprite);
    let overlayArea = mapBuilder.mapOverlayAreas[overlayIdx];

    closeOverlayWindow();

    // Depending on what image the overlay is using, we can deduce what type of overlay the player is trying to access
    if (overlayArea.img == "./images/textures/cipherPuzzle.png") {
        // Cipher puzzle
        openOverlayWindow = createElement('iframe').size(586, 520);
        openOverlayWindow.position((width / 2) - 586 / 2, (height / 2) - 550 / 2);
        openOverlayWindow.attribute('src', './ui/cipherPuzzle.html');
    }
}

function puzzleWindowClosed(puzzleSolved) {
    // Close the puzzle window
    closeOverlayWindow();

    // If the puzzle has been solved, double coin spawning rates
    if (puzzleSolved == true) {
        alert("Puzzle solved! Coin spawning rates have been increased for one minute.");
        socket.emit("coinRateUp", 60);
    }
}

function interpolateOtherPlayers() {
    const now = +new Date();
    const EXPECTED_SERVER_TICK_RATE = 60;
    const est_render_timestamp = now - 1000.0 / EXPECTED_SERVER_TICK_RATE;
    for (const [id, playerData] of em.entities) {
        if (id == socket.id || playerData.positionBuffer.length < 2) {
            continue;
        }

        // Prevent sprite from becoming rotated on collision
        playerData.sprite.rotation = 0;

        while (
            playerData.positionBuffer.length > 2 &&
            playerData.positionBuffer[1].timestamp <= est_render_timestamp
        ) {
            playerData.positionBuffer.shift();
        }
        if (
            playerData.positionBuffer.length >= 2 &&
            playerData.positionBuffer[0].timestamp <= est_render_timestamp &&
            est_render_timestamp <= playerData.positionBuffer[1].timestamp
        ) {
            const x0 = playerData.positionBuffer[0].x;
            const x1 = playerData.positionBuffer[1].x;
            const y0 = playerData.positionBuffer[0].y;
            const y1 = playerData.positionBuffer[1].y;
            const t0 = playerData.positionBuffer[0].timestamp;
            const t1 = playerData.positionBuffer[1].timestamp;
            playerData.sprite.x =
                x0 + ((x1 - x0) * (est_render_timestamp - t0)) / (t1 - t0);
            playerData.sprite.y =
                y0 + ((y1 - y0) * (est_render_timestamp - t0)) / (t1 - t0);
        }
    }
}

function move() {
    const SPEED = 8;

    // Play running animation when moving
    // Invert animation where necessary
    if (kb.pressing("w")) {
        playerSprite.changeAni('run');
        playerSprite.scale.x = 1;
        playerSprite.pos.y -= SPEED;
        breakDir = 0;
    }
    if (kb.pressing("a")) {
        playerSprite.changeAni('run');
        playerSprite.scale.x = -1;
        playerSprite.pos.x -= SPEED;
        breakDir = 1;
    }
    if (kb.pressing("s")) {
        playerSprite.changeAni('run');
        playerSprite.scale.x = 1;
        playerSprite.pos.y += SPEED;
        breakDir = 2;
    }
    if (kb.pressing("d")) {
        playerSprite.changeAni('run');
        playerSprite.scale.x = 1;
        playerSprite.pos.x += SPEED;
        breakDir = 3;
    }

    // Reset animation after player stops moving
    if (kb.released("w") || kb.released("s") || kb.released("d")) {
        playerSprite.scale.x = 1;
        playerSprite.changeAni('idle');
    }
    else if (kb.released("a")) {
        playerSprite.scale.x = -1;
        playerSprite.changeAni('idle');
    }

    // Temporary, to allow the players to change the block added
    if (kb.pressing("1") && allowMapModification) {
        wallEditorMode = "*";
    } else if (kb.pressing("2") && allowMapModification) {
        wallEditorMode = "=";
    } else if (kb.pressing("3") && allowMapModification) {
        wallEditorMode = "x";
    } else if (kb.pressing("backspace") && allowMapModification) {
        wallEditorMode = "-";
    }
}
