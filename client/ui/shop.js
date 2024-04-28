

function purchaseBuff(buff) {
    let cost = 0;
    if (buff == 1){ //reduce cooldown
        cost = 10;
    } else if (buff == 2){ //increase coin rate
        cost = 10;
    } else if (buff == 3){ //add barrier block
        cost = 0;
        //console.log("add barrier block");
        //exit();

    }
    window.parent.buffPurchased(buff, cost);
}

socket1.on("loadPlayers", (players) => {
    console.log(names);
    for (let player of names) {
        buildOnePlayer(player);
    }
});
// let targetSelectWindow;
function chooseTarget() {
    //targetSelectWindow = createElement('iframe').size(width / 2, height / 2).position((width / 2) - (width * 0.5) / 2, (height / 2) - (height * 0.5) / 2).attribute('src', 'client/ui/targetSelect.html');
}

// const element = openOverlayWindow.getElementById("GRID");
function buildOnePlayer(name) {
    let element = document.getElementById("GRID");
    console.log(element);
    let player = createDiv();
    player.parent(element);
    player.classList.add("w-full h-full items-center mt-4 mx-4 rounded bg-gray-800");
    let button = createButton();
    button.addClass("btn bg-gray-800 w-full h-full mt-4 hover:bg-primary");
    button.parent(player);
    button.id = name;
    let img = document.createElement("img");
    img.src = "./images/textures/dwarf.png";
    img.classList.add("m-2 h-3/4 w-auto");
    img.parent(button);
    let label = createDiv();
    label.classList.add("flex");
    label.parent(button);
    let text = document.createElement("h1");
    text.innerHTML = name;
    text.id = name + "text";
    text.classList.add("font-semibold text-center justify-self-center mx-4 mt-4");
    text.parent(label);


}

function exit() {
    // Invoke callback function in sketch.js
    window.parent.puzzleWindowClosed(false);
}