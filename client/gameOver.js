window.onload = () => {
    // Retrieve winning team from url query
    const urlParams = new URLSearchParams(
        window.location.search,
    );

    let winTeam = urlParams.get('winTeam');
    let winText = document.getElementById("winText");

    if (winTeam == "dwarf") {
        winText.innerHTML = "Dwarves win as the treasure room has been found!"
    }
    else {
        winText.innerHTML = "Saboteurs win as the treasure room was not found before time was up!"
    }

};