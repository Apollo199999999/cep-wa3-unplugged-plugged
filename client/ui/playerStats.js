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
            console.log("Hiding mute div");
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
            console.log("less than 10")
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

function highlightBlockDisplay(frameDocument, wallEditorMode){
    //removes backgrounds from all blocks
    let blocktext;
    let empty = frameDocument.getElementById("backspace");
    let path = frameDocument.getElementById("p");
    let barrier = frameDocument.getElementById("b");
    let wall = frameDocument.getElementById("q");

    let emptytext = frameDocument.getElementById("backspacetext");
    let pathtext = frameDocument.getElementById("ptext");
    let barriertext = frameDocument.getElementById("btext");
    let walltext = frameDocument.getElementById("qtext");

    if (empty == null || path == null || barrier == null || wall == null) {
        // console.log(empty, path, barrier, wall);
        return;
    }
    if (emptytext == null || pathtext == null || barriertext == null || walltext == null) {
        // console.log(empty, path, barrier, wall);
        return;
    }
    // console.log(wall.classList)
    if (empty.classList.contains("bg-primary")) {
        empty.classList.remove("bg-primary");
        empty.classList.remove("text-gray-800");
        emptytext.classList.remove("font-semibold")
        // empty.classList.remove('text-semibold')
    }
    if (path.classList.contains("bg-primary")) {
        path.classList.remove("bg-primary");
        path.classList.remove("text-gray-800");
        pathtext.classList.remove("font-semibold")
    }
    if (barrier.classList.contains("bg-primary")) {
        barrier.classList.remove("bg-primary");
        barrier.classList.remove("text-gray-800");
        barriertext.classList.remove("font-semibold")
    }   
    if (wall.classList.contains("bg-primary")) {
        wall.classList.remove("bg-primary");
        wall.classList.remove("text-gray-800");
        walltext.classList.remove("font-semibold")
    }

    if (wallEditorMode == "*") { //wall
        blockDisplay = blockFrame.elt.contentDocument.getElementById("p");
        blocktext = frameDocument.getElementById("ptext");
    } else if (wallEditorMode == "=") {
        blockDisplay = blockFrame.elt.contentDocument.getElementById("q");
        blocktext = frameDocument.getElementById("qtext");
    } else if (wallEditorMode == "x") {
        blockDisplay = blockFrame.elt.contentDocument.getElementById("b");
        blocktext = frameDocument.getElementById("btext");
    } else if (wallEditorMode == "-") {
        blockDisplay = blockFrame.elt.contentDocument.getElementById("backspace");  
        blocktext = frameDocument.getElementById("backspacetext");
    }
    blockDisplay.classList.add("bg-primary");
    blockDisplay.classList.add("text-gray-800");
    blocktext.classList.add("font-bold");
    // console.log(blocktext)
    // blockDisplay.classList.add('text-bold')
}