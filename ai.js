const openPopup = document.getElementById('openPopup');
const closePopups = document.getElementById('closePopups')
const aiPopUp = document.getElementById('aiPopUp')

aiPopUp.addEventListener("click", () => {
 openPopup.classList.add('active');
});

closePopups.addEventListener("click", () => {
    openPopup.classList.remove("active");
});


const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const chatMessages = document.getElementById('chatMessages');

sendButton.addEventListener("click", () => {
 const text = userInput.value.trim();
 if (text === "") return;

 const message = document.createElement('div');

 message.textContent = text

 chatMessages.appendChild(message);
});