const openPopup = document.getElementById('openPopup');
const closePopups = document.getElementById('closePopups')
const aiPopUp = document.getElementById('aiPopUp')

aiPopUp.addEventListener("click", () => {
 openPopup.classList.add('active');
});

closePopups.addEventListener("click", () => {
    openPopup.classList.remove("active");
});