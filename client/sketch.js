let ball;
let em;
let camManager;
let currentRoomCode = null;

const socket = io.connect("ws://localhost:8001");

window.onload = () => {
    const join_option_input = prompt('Select: "CREATE" or "JOIN"', "CREATE");
    if (join_option_input === "CREATE") {
        socket.emit("requestCreateRoom");
    } else if (join_option_input === "JOIN") {
        const room_code_input = prompt("Enter Room Code");
        socket.emit("requestJoinRoom", room_code_input);
    } else {
        window.onload();
    }
};

socket.on("setRoomCode", (code) => {
    currentRoomCode = code;
});

socket.on("buildMap", (mapData) => {
    for (const blockData of Object.values(mapData.blocks)) {
        let group = new Group();
        Object.assign(group, blockData);
        new Tiles(
            blockData.tileMap,
            blockData.startX,
            blockData.startY,
            blockData.w,
            blockData.h
        );
    }
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
    camManager = new CameraManager(camera);
    ball = createPlayerSprite();
    camManager.setTarget(ball);
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
    if (!currentRoomCode) {
        allSprites.visible = false;
        push();
        background("white");
        textSize(32);
        textAlign(CENTER, CENTER);
        text("Room Not Found", 0, 0, width, height);
        pop();
        return;
    }
    background("grey");
    move();
    interpolateOtherPlayers();
    camManager.update();
    socket.emit("position", ball.pos.x, ball.pos.y);
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
