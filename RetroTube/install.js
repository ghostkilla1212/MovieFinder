const installBackdrop = document.getElementById('installBackdrop');
const installMessage = document.getElementById('installMessage');
const installAction = document.getElementById('installAction');
const installDismissButtons = [
    document.getElementById('installClose'),
    document.getElementById('installDismiss')
];
let deferredInstallPrompt = null;

function isMobileDevice() {
    const userAgent = navigator.userAgent;
    const isAndroidTv = /Android.*TV|GoogleTV|Leanback|AFT[A-Z0-9]+|BRAVIA|SHIELD TV/i.test(userAgent);
    return !isAndroidTv && (
        window.matchMedia('(max-width: 700px)').matches
        || /Android|iPhone|iPad|iPod/i.test(userAgent)
    );
}

function isInstalled() {
    return window.matchMedia('(display-mode: standalone)').matches
        || navigator.standalone === true;
}

function showInstallPrompt(message, canInstall) {
    if (!isMobileDevice() || isInstalled() || sessionStorage.getItem('retrotube-install-dismissed')) {
        return;
    }

    installMessage.textContent = message;
    installAction.hidden = !canInstall;
    installBackdrop.hidden = false;
}

function dismissInstallPrompt() {
    installBackdrop.hidden = true;
    sessionStorage.setItem('retrotube-install-dismissed', 'true');
}

window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredInstallPrompt = event;
    showInstallPrompt('Install RetroTube on your home screen for quick access.', true);
});

installAction.addEventListener('click', async () => {
    if (!deferredInstallPrompt) {
        return;
    }

    await deferredInstallPrompt.prompt();
    const choice = await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    if (choice.outcome === 'accepted') {
        installBackdrop.hidden = true;
        return;
    }

    dismissInstallPrompt();
});

installDismissButtons.forEach(button => button.addEventListener('click', dismissInstallPrompt));
installBackdrop.addEventListener('click', event => {
    if (event.target === installBackdrop) {
        dismissInstallPrompt();
    }
});

document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !installBackdrop.hidden) {
        dismissInstallPrompt();
    }
});

if (isMobileDevice() && /iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    window.setTimeout(() => {
        showInstallPrompt('In Safari, tap Share, then choose “Add to Home Screen”.', false);
    }, 1800);
} else if (isMobileDevice() && /Android/i.test(navigator.userAgent)) {
    window.setTimeout(() => {
        if (!deferredInstallPrompt) {
            showInstallPrompt('Open your browser menu and choose “Install app” or “Add to Home screen”.', false);
        }
    }, 2500);
}

if ('serviceWorker' in navigator && window.isSecureContext) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .catch(error => console.error('Could not register the app service worker:', error));
    });
}
