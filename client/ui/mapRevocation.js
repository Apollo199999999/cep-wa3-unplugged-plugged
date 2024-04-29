function initialiseUsernames(frameDocument, usernamesList) {
    // Clear all radio buttons
    let userRadioBtns = frameDocument.getElementById("user-radio-buttons");
    userRadioBtns.innerHTML = ' ';

    // Create radio buttons based on usernamesList
    for (username of usernamesList) {
        let xmlString = '<label class="label cursor-pointer"><span class="label-text">' + username + '</span><input type="radio" name="usernames-radio" class="radio radio-primary"/></label>';
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

// Simply to test that appending radio btns work
window.onload = () => {
    initialiseUsernames(document, ["User1", "User2"]);
}