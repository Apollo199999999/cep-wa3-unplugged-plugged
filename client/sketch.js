let ball;
let em;
let mapBuilder;
let camManager;
let currentRoomCode = null;
let localIGN = null;
let allowMapModification = true;

// Only start drawing stuff after the client successfully registers itself with the server
let setupComplete = false;

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
    ball = createPlayerSprite(localIGN);
    camManager.setTarget(ball);
    mapBuilder.buildMap(mapManager);
    mapBuilder.setStartPos(mapManager, ball);

    setupComplete = true;
});

socket.on("updateMap", (mapManager) => {
    mapBuilder.buildMap(mapManager);
});

socket.on("playerDataUpdate", (id, playerData) => {
    for (let data of playerData) {
        if (data.id === id) continue;
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
}

function draw() {
    if (setupComplete) {
        background("#484848");
        move();
        interpolateOtherPlayers();
        camManager.update();
        socket.emit("position", ball.pos.x, ball.pos.y);
    }
}

function mouseReleased() {
    if (setupComplete && allowMapModification) {
        mapBuilder.addClickedTile("x");
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
    const SPEED = 10;
    if (kb.pressing("w")) {
        ball.pos.y -= SPEED;
    }
    if (kb.pressing("a")) {
        ball.pos.x -= SPEED;
    }
    if (kb.pressing("s")) {
        ball.pos.y += SPEED;
    }
    if (kb.pressing("d")) {
        ball.pos.x += SPEED;
    }
}
