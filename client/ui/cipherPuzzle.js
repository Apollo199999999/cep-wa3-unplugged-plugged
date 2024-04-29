function exit() {
    // Invoke callback function in sketch.js
    window.parent.puzzleWindowClosed(false, "cipherPuzzle");
}

function verifyCode() {
    let codeInput = document.getElementById("codeInput");
    if (codeInput.value.toString() == "Saboteurs Sabotage") {
        // Invoke callback function in sketch.js
        window.parent.puzzleWindowClosed(true, "cipherPuzzle");
    }
    else {
        alert("Incorrect code");
    }
}

