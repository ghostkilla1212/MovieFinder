const images = document.querySelectorAll('.picture-box img');
let currentIndex = 0;

function showImage(index) {
    images.forEach((image, imageIndex) => {
        image.classList.toggle('is-active', imageIndex === index);
    });
}

showImage(currentIndex);

if (images.length > 1) {
    window.setInterval(() => {
        currentIndex = (currentIndex + 1) % images.length;
        showImage(currentIndex);
    }, 4000);
}

