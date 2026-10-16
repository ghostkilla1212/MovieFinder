const searchList = document.getElementById("searchList");
const  searchButton = document.getElementById("searchButton");


searchButton.addEventListener("click", () => {
    const currentInputValue = searchList.value;
    window.location.href =  `https://movie-finder.vercel.app/results.html?query=${encodeURIComponent(currentInputValue)}`;
});

