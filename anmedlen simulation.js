const email = document.getElementById("email") /*damit greife ich die emial eingabe zu*/
const psw = document.getElementById("psw"); /*damit greife ich die psw eingabe zu*/



const loginButton = document.getElementById("loginButton");

loginButton.addEventListener("click", function() {
    // Declare the reference outside the conditional blocks
    const messageField = document.getElementById('messageField');
    const emailValue = email.value.trim();
    const pswValue = psw.value.trim();

    if (emailValue !== "" && pswValue !== "") {
        // Now messageField is accessible here
        messageField.textContent = "Login successful"; 
    } else {
        // And it is also accessible here
        console.log("Fields are empty");
    }
});


const popUp = document.getElementById("popUp");
const closeButton = document.getElementById("closeButton");

closeButton.addEventListener("click", function() {
    popUp.style.display = "none";
});






