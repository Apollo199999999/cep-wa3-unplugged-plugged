function exit() {
    // Invoke callback function in sketch.js
    window.parent.puzzleWindowClosed(false);
}

function verifyCode() {
    let codeInput = document.getElementById("codeInput");
    if (codeInput.value.toString() == "Saboteurs Sabotage") {
        // Invoke callback function in sketch.js
        window.parent.puzzleWindowClosed(true);
    }
    else {
        alert("Incorrect code");
    }
}

