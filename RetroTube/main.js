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

const customCursor = document.getElementById('customCursor');

if (customCursor && window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('pointermove', event => {
        document.body.classList.remove('cursor-hidden');
        customCursor.style.left = `${event.clientX}px`;
        customCursor.style.top = `${event.clientY}px`;

        const target = event.target;
        customCursor.classList.toggle(
            'is-hovering',
            Boolean(target.closest('button, a, input, [role="button"], [aria-haspopup="dialog"]'))
        );
    });

    window.addEventListener('pointerleave', () => {
        document.body.classList.add('cursor-hidden');
    });

    window.addEventListener('pointerdown', () => {
        customCursor.classList.add('is-clicking');
    });

    window.addEventListener('pointerup', () => {
        customCursor.classList.remove('is-clicking');
    });
}
