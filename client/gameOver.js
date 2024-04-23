window.onload = () => {
    // Retrieve IGN from url query
    const urlParams = new URLSearchParams(
        window.location.search,
    );

    let winPlayer = urlParams.get('player');
    
    let winText = document.getElementById("winText");
    winText.innerHTML = winPlayer + " has found the treasure room!"
};