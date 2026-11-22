const legalOpenButton = document.getElementById('legalOpen');
const legalBackdrop = document.getElementById('legalBackdrop');
const legalCloseButton = document.getElementById('legalClose');

function openLegalDialog() {
    legalBackdrop.hidden = false;
    document.body.classList.add('legal-open');
    legalCloseButton.focus();
}

function closeLegalDialog() {
    legalBackdrop.hidden = true;
    document.body.classList.remove('legal-open');
    legalOpenButton.focus();
}

legalOpenButton.addEventListener('click', openLegalDialog);
legalCloseButton.addEventListener('click', closeLegalDialog);
legalBackdrop.addEventListener('click', event => {
    if (event.target === legalBackdrop) {
        closeLegalDialog();
    }
});

document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !legalBackdrop.hidden) {
        closeLegalDialog();
    }
});
