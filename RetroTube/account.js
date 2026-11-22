const accountOpenButton = document.getElementById('accountOpen');
const accountBackdrop = document.getElementById('accountBackdrop');
const accountCloseButton = document.getElementById('accountClose');
const accountForm = document.getElementById('accountForm');
const accountUsername = document.getElementById('accountUsername');
const accountPassword = document.getElementById('accountPassword');
const accountImage = document.getElementById('accountImage');
const accountPreview = document.getElementById('accountPreview');
const accountPreviewName = document.getElementById('accountPreviewName');
const accountSignedIn = document.getElementById('accountSignedIn');
const accountProfileAvatar = document.getElementById('accountProfileAvatar');
const accountProfileName = document.getElementById('accountProfileName');
const accountSignOut = document.getElementById('accountSignOut');
const headerAccountAvatar = document.getElementById('headerAccountAvatar');
const headerAccountName = document.getElementById('headerAccountName');

let profileImageData = '';

function openAccountDialog() {
    accountBackdrop.hidden = false;
    document.body.classList.add('account-open');
    if (accountSignedIn.hidden) {
        accountUsername.focus();
    } else {
        accountCloseButton.focus();
    }
}

function closeAccountDialog() {
    accountBackdrop.hidden = true;
    document.body.classList.remove('account-open');
    accountOpenButton.focus();
}

function setAvatar(element, imageData, fallbackText = '👤') {
    element.replaceChildren();
    if (!imageData) {
        element.textContent = fallbackText;
        return;
    }

    const image = document.createElement('img');
    image.src = imageData;
    image.alt = '';
    element.appendChild(image);
}

accountOpenButton.addEventListener('click', openAccountDialog);
accountCloseButton.addEventListener('click', closeAccountDialog);
accountBackdrop.addEventListener('click', event => {
    if (event.target === accountBackdrop) {
        closeAccountDialog();
    }
});

document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !accountBackdrop.hidden) {
        closeAccountDialog();
    }
});

accountUsername.addEventListener('input', () => {
    accountPreviewName.textContent = accountUsername.value.trim() || 'Your profile preview';
});

accountImage.addEventListener('change', () => {
    const file = accountImage.files[0];
    if (!file) {
        profileImageData = '';
        setAvatar(accountPreview);
        return;
    }

    if (!file.type.startsWith('image/')) {
        accountImage.value = '';
        profileImageData = '';
        setAvatar(accountPreview);
        return;
    }

    const reader = new FileReader();
    reader.addEventListener('load', () => {
        profileImageData = String(reader.result);
        setAvatar(accountPreview, profileImageData);
    });
    reader.readAsDataURL(file);
});

accountForm.addEventListener('submit', event => {
    event.preventDefault();
    const username = accountUsername.value.trim();
    const password = accountPassword.value;

    if (!username || !password) {
        return;
    }

    accountPassword.value = '';
    accountForm.hidden = true;
    accountSignedIn.hidden = false;
    accountProfileName.textContent = username;
    headerAccountName.textContent = username;
    setAvatar(accountProfileAvatar, profileImageData);
    setAvatar(headerAccountAvatar, profileImageData);
});

accountSignOut.addEventListener('click', () => {
    profileImageData = '';
    accountForm.reset();
    accountForm.hidden = false;
    accountSignedIn.hidden = true;
    accountPreviewName.textContent = 'Your profile preview';
    setAvatar(accountPreview);
    setAvatar(headerAccountAvatar);
    headerAccountName.textContent = 'Login';
    accountUsername.focus();
});
