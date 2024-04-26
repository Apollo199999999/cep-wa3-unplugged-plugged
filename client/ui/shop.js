function purchaseBuff(buff) {
    let cost = 0;
    if (buff == 1){ //reduce cooldown
        cost = 10;
    } else if (buff == 2){ //increase coin rate
        cost = 10;
    } else if (buff == 3){ //add barrier block
        cost = 20;
        //console.log("add barrier block");
        //exit();

    }
    window.parent.buffPurchased(buff, cost);
}
// let targetSelectWindow;
function chooseTarget() {
    //targetSelectWindow = createElement('iframe').size(width / 2, height / 2).position((width / 2) - (width * 0.5) / 2, (height / 2) - (height * 0.5) / 2).attribute('src', 'client/ui/targetSelect.html');
}



function exit() {
    // Invoke callback function in sketch.js
    window.parent.puzzleWindowClosed(false);
}