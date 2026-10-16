const searchList = document.getElementById("searchList");
const  searchButton = document.getElementById("searchButton");


searchButton.addEventListener("click", () => {
    const currentInputValue = searchList.value;
    window.location.href =  `results.html?query=${encodeURIComponent(currentInputValue)}`;
});

