const CONFIG = {
  discordUrl: '#',
  statusApi: ''
};

const toast = document.getElementById('toast');
let toastTimer;

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast(`Copied ${text}`);
  } catch {
    const temp = document.createElement('textarea');
    temp.value = text;
    temp.setAttribute('readonly', '');
    temp.style.position = 'fixed';
    temp.style.opacity = '0';
    document.body.appendChild(temp);
    temp.select();
    document.execCommand('copy');
    temp.remove();
    showToast(`Copied ${text}`);
  }
}

document.querySelectorAll('.copy-ip').forEach((button) => {
  button.addEventListener('click', () => {
    copyText(button.dataset.ip || 'CedarMc.org');
  });
});

document.querySelectorAll('.discord-link').forEach((link) => {
  if (CONFIG.discordUrl && CONFIG.discordUrl !== '#') {
    link.href = CONFIG.discordUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  } else {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      showToast('Discord invite link not added yet');
    });
  }
});

async function loadStatus() {
  const statusText = document.getElementById('serverStatus');
  if (!statusText) return;

  if (!CONFIG.statusApi) {
    statusText.textContent = 'CedarMC Online';
    return;
  }

  try {
    const response = await fetch(CONFIG.statusApi, { cache: 'no-store' });
    if (!response.ok) throw new Error('Status request failed');
    const data = await response.json();

    if (data.online === false || data.minecraft?.online === false) {
      statusText.textContent = 'Server Offline';
      return;
    }

    const onlinePlayers =
      data.players?.online ??
      data.minecraft?.players?.online ??
      data.onlinePlayers;

    statusText.textContent = Number.isFinite(onlinePlayers)
      ? `${onlinePlayers} Player${onlinePlayers === 1 ? '' : 's'} Online`
      : 'CedarMC Online';
  } catch {
    statusText.textContent = 'CedarMC';
  }
}

loadStatus();
