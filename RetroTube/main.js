const img = document.querySelectorAll('.pictures-box img')
let currentIndex = 0

img[currentIndex].style.display = "inline"

setInterval(function () {

    img.forEach (
        function (img) {
            img.style.display = "none"
        }
    )
    currentIndex += 1

    if(currentIndex === img.length) {
        currentIndex = 0;
    }


images[currentIndex].style.display = "inline"
}, 3000)