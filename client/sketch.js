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


let statusconditions = [];
let barrierBlocks = 0;
let cooldownReductionDuration = 0;
let muted = 0;

//iframe to display player stats
let playerStatsFrame;

// Only start drawing stuff after the client successfully registers itself with the server
let setupComplete = false;

// Map cooldown variables
let mapCooldownPeriod = 30;
let mapCooldownLeft = 0;

// Stores the current overlay window that is open
let openOverlayWindow;

// Stores puzzles solved by the user
let puzzlesSolved = [];

// Map cooldown timer
let mapCooldownTimer;

// Player role, either saboteur or dwarf
let playerRole;

const socket = io.connect("ws://localhost:8001");

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
            statusconditions = data.statusconditions;
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

socket.on("gameOver", (winTeam) => {
    window.location.href = "gameOver.html?winTeam=" + winTeam;
});

socket.on("setMuteDuration", (duration) => {
    muted = duration;
});


socket.on("playerAlreadyMuted", (name) => {
    txt = name + " has already been muted. Try again later.";
    Swal.fire({
        title: "Player already muted...",
        text: txt,
        icon: "info"
    });
});

socket.on("realTreasureRoom", (roomIndex) => {
    // console.log(134312)
    txt = "The real treasure room has been revealed...";
    Swal.fire({
        title: "Revelation: ",
        text: txt,
        imageUrl: "./images/shop/treasure-chest.png",
        imageWidth: 200,
        imageHeight: 200,
        animation: true

    });
    mapBuilder.revealRoom(roomIndex);
})

// used as a replacement for console.log on server side to log messages to client
socket.on("Log", (msg) => {
    console.log(msg, "logger");
});
let blockFrame;

function setup() {
    new Canvas("fullscreen");

    // Retrieve IGN and room code from url query
    const urlParams = new URLSearchParams(
        window.location.search,
    );

    localIGN = urlParams.get('ign');
    Object.freeze(localIGN);

    currentRoomCode = urlParams.get('roomCode');
    Object.freeze(currentRoomCode);

    // Assign player role (each player has a 0.3 chance of being a saboteur)
    let random = Math.random();
    if (random < 0.3) {
        playerRole = "saboteur";
    } else {
        playerRole = "dwarf";
    }

    camManager = new CameraManager(camera);
    em = new EntityManager();
    mapBuilder = new MapBuilder();

    // Tell the client to register itself with the server event
    socket.emit("registerClient", localIGN, playerRole, currentRoomCode);

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
    playerStatsFrame = createElement('iframe').size(340, 240);
    playerStatsFrame.addClass('opacity-75 hover:opacity-100');
    playerStatsFrame.position(width - 10 - playerStatsFrame.width, 10);
    playerStatsFrame.attribute('src', './ui/playerStats.html');

    // Create an iframe to display what keys to press to change blocks
    blockFrame = createElement('iframe').size(200, 300);
    blockFrame.addClass('opacity-75 hover:opacity-100');
    blockFrame.position(10, 10);
    blockFrame.attribute('src', './ui/blockKeyboardDisplay.html');
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
        playerSprite.layer = 99999999;

        // Map diagram display shouldnt be bound by any conditions
        mapBuilder.displayMapDiagram();

        playerMapPos = mapBuilder.findMapPosition(playerSprite);

        selectTile();

        mapBuilder.displaySelectedTile(selectedTileIndex, statusconditions.includes("mute"));

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
        // Uppercase first letter of player role
        updatePlayerRole((playerStatsFrame.elt.contentDocument || playerStatsFrame.elt.contentWindow.document), playerRole.charAt(0).toUpperCase() + playerRole.slice(1));
        updateCoinCounter((playerStatsFrame.elt.contentDocument || playerStatsFrame.elt.contentWindow.document), coins);
        updateCooldownLeft((playerStatsFrame.elt.contentDocument || playerStatsFrame.elt.contentWindow.document), mapCooldownLeft);
        updateBarrierBlocks((playerStatsFrame.elt.contentDocument || playerStatsFrame.elt.contentWindow.document), barrierBlocks);
        updateCooldownReduction((playerStatsFrame.elt.contentDocument || playerStatsFrame.elt.contentWindow.document), cooldownReductionDuration);
        updateMuteCondition((playerStatsFrame.elt.contentDocument || playerStatsFrame.elt.contentWindow.document), muted, muted > 0);

        updateStatusConditions();
        highlightBlockDisplay(blockFrame.elt.contentDocument || blockFrame.elt.contentWindow.document, wallEditorMode);
    }
}

let numberOfBlocksEdited = 0;

// Variable to store setInterval object to do map cooldown
let cooldownTimer;

function mouseReleased() {
    if (setupComplete && allowMapModification && numberOfBlocksEdited < 5) {
        if (wallEditorMode == "x" && barrierBlocks > 0) {
            let successfulEditMap = mapBuilder.editClickedTile(wallEditorMode, selectedTileIndex);

            if (successfulEditMap) {
                // numberOfBlocksEdited++;
                barrierBlocks--;
            }
        } else if (wallEditorMode != "x") {
            let successfulEditMap = mapBuilder.editClickedTile(wallEditorMode, selectedTileIndex);
            if (successfulEditMap) {
                numberOfBlocksEdited++;
            }
        }
    }
    if (numberOfBlocksEdited >= 5) {
        allowMapModification = false;
        mapCooldownLeft = mapCooldownPeriod;
        numberOfBlocksEdited = 0;
        if (muted == 0) {
            mapCooldownTimer = setInterval(function () {
                if (mapCooldownLeft > 0) {
                    mapCooldownLeft -= 1;
                }
                else {
                    mapCooldownLeft = 0;
                    allowMapModification = true;
                    clearInterval(mapCooldownTimer);
                }
            }, 1000);
        }

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

    // First, check if the user has already solved this puzzle
    if (puzzlesSolved.includes(overlayArea.type)) {
        Swal.fire({
            title: "Puzzle already solved...",
            text: "You have already solved this puzzle.",
            icon: "info"
        });
        return;
    }

    // Depending on what image the overlay is using, we can deduce what type of overlay the player is trying to access
    if (overlayArea.type == "cipherPuzzle") {
        // Cipher puzzle
        openOverlayWindow = createElement('iframe').size(586, 520);
        openOverlayWindow.position((width / 2) - 586 / 2, (height / 2) - 550 / 2);
        openOverlayWindow.attribute('src', './ui/cipherPuzzle.html');

    } else if (overlayArea.type == "imagePuzzle") {
        openOverlayWindow = createElement('iframe').size(805, 550);
        openOverlayWindow.position((width / 2) - 805 / 2, (height / 2) - 600 / 2);
        openOverlayWindow.attribute('src', './ui/imagePuzzle.html');

    } else if (overlayArea.type == "shop") {
        openOverlayWindow = createElement('iframe').size(width * 0.8, height * 0.8);
        openOverlayWindow.position((width / 2) - (width * 0.8) / 2, (height / 2) - (height * 0.8) / 2);
        openOverlayWindow.attribute('src', './ui/shop.html');
        console.log("Shop opened");
    } else if (overlayArea.type == "mapRevoke") {
        // Map revoke area puzzle
        if (playerRole == "dwarf") {
            openOverlayWindow = createElement('iframe').size(800, 520);
            openOverlayWindow.position((width / 2) - 800 / 2, (height / 2) - 550 / 2);
            openOverlayWindow.attribute('src', './ui/mapRevocation.html');
            // Init usernames in maprevocation window (from mapRevocation.js)
            openOverlayWindow.elt.onload = () => {
                initialiseUsernames((openOverlayWindow.elt.contentDocument || openOverlayWindow.elt.contentWindow.document), em.entities);
            };

        } else {
            Swal.fire({
                title: "Access Denied!",
                text: "Only dwarves can access the map revocation area.",
                icon: "error"
            });
        }
    }

}

function getOverlayWindowDocument() {
    return (openOverlayWindow.elt.contentDocument || openOverlayWindow.elt.contentWindow.document);
}

function puzzleWindowClosed(puzzleSolved, puzzleType) {
    // Close the puzzle window
    closeOverlayWindow();

    // If the puzzle has been solved, double coin spawning rates
    if (puzzleSolved == true) {
        // Indicate that user has solved this puzzle
        puzzlesSolved.push(puzzleType);

        if (puzzleType == "cipherPuzzle") {
            Swal.fire({
                title: "Puzzle solved!",
                text: "Puzzle solved! Coin spawning rates have been doubled for one minute.",
                icon: "success"
            });

            socket.emit("coinRateUp", 60);
        }
        else if (puzzleType == "imagePuzzle") {
            Swal.fire({
                title: "Puzzle solved!",
                text: "Puzzle solved! Coin spawning rates have been quadrupled for one minute.",
                icon: "success"
            });

            socket.emit("coinRateUp", 60);
            socket.emit("coinRateUp", 60);
            socket.emit("coinRateUp", 60);
        }

    }
}

function revokeMapPlayer(socketid, username) {
    // Tell the server to increase this player's cooldown
    socket.emit("mutePlayer", username, socketid, 7 * 60);
}

let targetSelectWindow;
function targetSelectWindowClosed(target, id, cost) {
    closeOverlayWindow();
    targetSelected(target, id);
    socket.emit("useCoins", cost); //change to 20
}

function targetSelected(target, id) {
    console.log(target);
    socket.emit("mutePlayer", target, id, 180);
}

function closeTargetSelectWindow() {
    if (targetSelectWindow != undefined) {
        targetSelectWindow.remove();
        targetSelectWindow = undefined;
    }

}

function buffPurchased(buff, cost) {
    closeOverlayWindow();
    if (coins < cost) {
        Swal.fire({
            title: "Insufficient coins!",
            text: "Insufficient coins to purchase buff!",
            icon: "error"
        });
        return;
    }
    // If the buff has been purchased, apply the buff
    if (buff == 1) {
        socket.emit("useCoins", cost);
        socket.emit("cooldownReduction", 60);
        let initcooldownReductionDuration = cooldownReductionDuration;
        cooldownReductionDuration = 60;
        if (initcooldownReductionDuration == 0) {
            cooldownReductionTimer = setInterval(function () {
                if (cooldownReductionDuration > 0) {
                    cooldownReductionDuration -= 1;
                }
                else {
                    cooldownReductionDuration = 0;
                    clearInterval(cooldownReductionTimer);
                }
            }, 1000);
        }
    } else if (buff == 2) {
        // barrier block
        socket.emit("useCoins", cost);
        barrierBlocks++;
        
    } else if (buff == 3) {
        closeOverlayWindow();
        openOverlayWindow = createElement('iframe').size(width / 2, height / 2)
        openOverlayWindow.position((width / 2) - (width * 0.5) / 2, (height / 2) - (height * 0.5) / 2)
        openOverlayWindow.attribute('src', './ui/targetSelect.html');
        //openOverlayWindow.elt.contentWindow.targetSelectWindowClosed = targetSelectWindowClosed;
        openOverlayWindow.elt.onload = function () {
            buildPlayers(cost);
            // buildOnePlayer('dj');
        };
        // buildOnePlayer('dafdfas')
        // buildPlayers();
        // socket.emit("useCoins", cost); 
        //socket.emit("cooldownReduction", 60);
    } else if (buff = 4) {
        socket.emit("useCoins", cost);
        socket.emit("revealRoom");
    }
}

function buildPlayers(cost) {
    console.log("building players");
    let names = [];
    //buildOnePlayer('dj');
    for (let [id, playerData] of em.entities) {
        console.log(playerData.ign)
        if (playerData.id === socket.id) {
            continue;
        }
        let name = playerData.ign;
        buildOnePlayer(name, id, cost);
        console.log(name);
        names.push(name);

    }

    //socket.emit("loadPlayers", names);
}

function buildOnePlayer(name, id, cost) {
    console.log('building player')
    let element = (openOverlayWindow.elt.contentDocument || openOverlayWindow.elt.contentWindow.document).getElementById("GRID");
    let player = createElement('div');
    player.parent(element);
    player.addClass("w-4/5 justify-self-center h-full items-center mx-4 rounded-md bg-gray-800 ");
    let button = createButton('');
    button.addClass("btn w-full h-full hover:bg-primary hover:text-gray-800");
    button.parent(player);
    button.id = name;
    button.mousePressed(function () {
        targetSelectWindowClosed(name, id, cost);
    });
    let img = createImg("../images/textures/dwarf.png");
    // img.src = "./images/textures/dwarf.png";
    img.class("m-2 h-auto w-full");
    img.parent(button);
    let label = createElement('div');
    label.addClass("flex");
    label.parent(button);
    let text = createElement("h1");
    text.html("Mute " + name);
    // text.innerHTML(id + "text")
    text.class("font-semibold text-center justify-self-center mx-4 text-lg");
    text.parent(label);


}


let prevmute = 0;
function updateStatusConditions() {
    // console.log(statusconditions);
    // console.log(muted)
    // Update statusconditions (from playerStats.js)
    mapCooldownPeriod = 30;

    for (let status of statusconditions) {
        if (status == "cooldownReduction") {
            mapCooldownPeriod = 10;
        } else if (status == "mute") {
            if (prevmute == 0) {
                setInterval(function () {
                    if (muted > 0) {
                        muted -= 1;
                    }
                    else {
                        muted = 0;
                    }
                }, 1000);
                //prevmute = 1;
            }
            prevmute = muted;
            allowMapModification = false;

        }
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

    // To allow the players to change the block added
    if (kb.pressing("p") && allowMapModification) {
        wallEditorMode = "*";
    } else if (kb.pressing("q") && allowMapModification) {
        wallEditorMode = "=";
    } else if (kb.pressing("b") && allowMapModification) { //barrier block
        wallEditorMode = "x";
    } else if (kb.pressing("backspace") && allowMapModification) {
        wallEditorMode = "-";
    }
}
