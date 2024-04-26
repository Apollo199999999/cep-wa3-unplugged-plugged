function exit() {
    // From sketch.js
    puzzleWindowClosed(false);
}

function verifyCode() {
    let codeInput = document.getElementById("codeInput");
    if (codeInput.value.toString() == "Saboteurs Sabotage") {
        // From sketch.js
        puzzleWindowClosed(true);
    }
    else {
        alert("Incorrect code");
    }
}