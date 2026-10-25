const openPopup = document.getElementById('openPopup');
const closePopups = document.getElementById('closePopups')
const newsPopUp = document.getElementById('newsPopUp')

newsPopUp.addEventListener("click", () => {
 openPopup.classList.add('active');
});

closePopups.addEventListener("click", () => {
    openPopup.classList.remove("active");
});

