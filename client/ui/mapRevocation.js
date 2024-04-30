function initialiseUsernames(frameDocument, emEntities) {
    // Clear all radio buttons
    let userRadioBtns = frameDocument.getElementById("user-radio-buttons");
    userRadioBtns.innerHTML = ' ';

    // Create radio buttons
    for (let [id, playerData] of emEntities) {
        let xmlString = '<label class="label cursor-pointer"><span class="label-text">' + playerData.ign + '</span><input type="radio" name="usernames-radio" data-socketid="' + id +  '" class="radio radio-primary"/></label>';
        let radioBtn = createElementFromHTML(xmlString);
        userRadioBtns.appendChild(radioBtn);
    }
}

function createElementFromHTML(htmlString) {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();

    // Change this to div.childNodes to support multiple top-level nodes.
    return div.firstChild;
}

function exit() {
    // Invoke callback function in sketch.js
    window.parent.closeOverlayWindow();
}

function revokePlayer() {
    // Find the selected player
    let frameDocument = window.parent.getOverlayWindowDocument();
    let userRadioBtns = frameDocument.getElementById("user-radio-buttons");

    // Get the selected radio btn
    let radios = userRadioBtns.querySelectorAll("input[name=\"usernames-radio\"]");
    let radioChecked = false;
    for (let radio of radios) {
        if (radio.checked) {
            let selectedSocketId = radio.dataset.socketid.toString();
            radioChecked = true;
            window.parent.revokeMapPlayer(selectedSocketId);
            window.parent.closeOverlayWindow();

            break;
        }
    }

    if (radioChecked == false) {
        // Show an error message
        Swal.fire({
            title: "No player selected!",
            text: "You have not selected a player to revoke.",
            icon: "error"
        });
    }
}
