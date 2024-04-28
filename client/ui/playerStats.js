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
        cooldownReductionCounter.innerHTML = "Cooldown Reduction Active for: " + cooldownReduction.toString() + "s";
    } catch { }
}   

function updateMuteCondition(frameDocument, muteCondition, showMuteCondition) {
    // Try catch because draw() will sometimes call before document has loaded
    try {
        let muteCounter = frameDocument.getElementById("muteCounter")
        muteCounter.innerHTML = "Mute Active for: " + muteCondition.toString() + "s";
        if (!showMuteCondition) {
            div = document.getElementById("mutediv");
            div.addClass("hidden");
        } else {
            div = document.getElementById("mutediv");
            div.removeClass("hidden");
        
        }
        // Coins variable is from sktech.js
        
    } catch { }
}