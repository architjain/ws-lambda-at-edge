document.getElementById("like").addEventListener("click", (e) => {
    const cardId = document.getElementById("like").getAttribute("data-cardid");
    const req = new XMLHttpRequest();
    req.open("POST", "/api/like?id=" + cardId);
    req.onreadystatechange = () => {
        if (req.readyState == 4) {
            if (req.status == 200) {
                const res = JSON.parse(req.responseText);
                document.getElementById("likes").innerHTML = res.Likes;
                e.srcElement.firstChild.data = "Done! :)";
            } else {
                e.srcElement.firstChild.data = "Error! :(";
            }
        }
    }
    req.send();
    e.srcElement.disabled = true;
    e.srcElement.firstChild.data = "Wait...";
});
