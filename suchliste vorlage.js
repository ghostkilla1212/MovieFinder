const searchList = document.getElementById("searchList");
const  searchButton = document.getElementById("searchButton");


searchButton.addEventListener("click", () => {
    const currentInputValue = searchList.value;
    window.location.href =  `http://127.0.0.1:5500/results.html?query=${encodeURIComponent(currentInputValue)}`;
});