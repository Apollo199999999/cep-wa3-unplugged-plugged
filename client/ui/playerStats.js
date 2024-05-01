function updatePlayerRole(frameDocument, playerRole) {
    try {
        let roleDisplay = frameDocument.getElementById("playerRoleDisplay");
        // Coins variable is from sktech.js
        roleDisplay.innerHTML = "Role: " + playerRole.toString();
    } catch { }
}

function updateCoinCounter(frameDocument, coinCount) {
    // Try catch because draw() will sometimes call before document has loaded
    try {
        let coinCounter = frameDocument.getElementById("coinCounter");
        // Coins variable is from sktech.js
        coinCounter.innerHTML = "Coins: " + coinCount.toString();
    } catch { }
}

function updateCooldownLeft(frameDocument, cooldownLeft) {
    // Try catch because draw() will sometimes call before document has loaded
    try {
        let cooldownCounter = frameDocument.getElementById("cooldownCounter");
        // Coins variable is from sktech.js
        cooldownCounter.innerHTML = "Map Cooldown Left: " + cooldownLeft.toString() + "s";
    } catch { }
}

function updateBarrierBlocks(frameDocument, barrierBlocks) {
    // Try catch because draw() will sometimes call before document has loaded
    try {
        let barrierCounter = frameDocument.getElementById("barrierCounter");
        // Coins variable is from sktech.js
        barrierCounter.innerHTML = "Barrier Blocks: " + barrierBlocks.toString();
    } catch { }
}

function updateCooldownReduction(frameDocument, cooldownReduction) {
    // Try catch because draw() will sometimes call before document has loaded
    try {
        let cooldownReductionCounter = frameDocument.getElementById("cooldownReductionCounter");
        // Coins variable is from sktech.js
        cooldownReductionCounter.innerHTML = "Cooldown Reduction Active For: " + cooldownReduction.toString() + "s";
    } catch { }
}   

function updateMuteCondition(frameDocument, muteCondition, showMuteCondition) {
    // Try catch because draw() will sometimes call before document has loaded
    try {
        // console.log(muteCondition, showMuteCondition)
        let muteCounter = frameDocument.getElementById("muteCounter")
        muteCounter.innerHTML = "Mute Active For: " + muteCondition.toString() + "s";
        let div  = frameDocument.getElementById("mutediv");
        // console.log(div.classList.contains("hidden"));
        if (!showMuteCondition && !div.classList.contains("hidden")) {
            // console.log("Hiding mute div");
            div.classList.add("hidden");
        } else if (showMuteCondition && div.classList.contains("hidden")) {
            div.classList.remove("hidden");
        
        }
        // Coins variable is from sktech.js
        
    } catch { }
}

function updateTimer(frameDocument, timer) {
    // Try catch because draw() will sometimes call before document has loaded  
    try {
        let mins = Math.floor(timer / 60);
        let secs = timer % 60;
        let timerelement = frameDocument.getElementById("timer");
        let timersecs = secs.toString();
        let timermins = mins.toString();
        if (secs < 10) {
            timersecs = "0" + secs.toString();
            // console.log("less than 10")
        }
        if (mins < 10) {
            timermins = "0" + mins.toString();
        }
        timerelement.innerHTML = timermins + ":" + timersecs;

        if (timer < 60){
            timerelement.classList.add("text-red-600");
            // frameDocument.classList.add("outline-red-400 outline-2 outline-offset-1");
        } else {
            if (timerelement.classList.contains("text-red-600")) {
                // frameDocument.classList.remove("outline-red-500 outline-2 outline-offset-1");
                timerelement.classList.remove("text-red-600");
            }
        }


        if (timer < 0) {
            timer.innerHTML = "00:00";
        }
        
    } catch { }
}

function updateRoomCode(frameDocument, roomCode, isGameStarted) {
    // Try catch because draw() will sometimes call before document has loaded
    try {
        let roomCodeElement = frameDocument.getElementById("roomcode");
        roomCodeElement.innerHTML = "Room Code: " + roomCode;
        if (isGameStarted) {
            roomCodeElement.innerHTML = "Game Started";
        }
    } catch { }
}