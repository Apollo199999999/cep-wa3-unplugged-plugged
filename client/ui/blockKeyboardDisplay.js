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
        emptytext.classList.remove("font-bold")
        // empty.classList.remove('text-semibold')
    }
    if (path.classList.contains("bg-primary")) {
        path.classList.remove("bg-primary");
        path.classList.remove("text-gray-800");
        pathtext.classList.remove("font-bold")
    }
    if (barrier.classList.contains("bg-primary")) {
        barrier.classList.remove("bg-primary");
        barrier.classList.remove("text-gray-800");
        barriertext.classList.remove("font-bold")
    }   
    if (wall.classList.contains("bg-primary")) {
        wall.classList.remove("bg-primary");
        wall.classList.remove("text-gray-800");
        walltext.classList.remove("font-bold")
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

function showHowTo() {

}