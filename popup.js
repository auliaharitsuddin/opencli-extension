// --- i18n ---
const I18N = {
  en: {
    checking: 'Checking...',
    noDaemon: 'No daemon connected',
    connected: 'Connected to daemon',
    reconnecting: 'Reconnecting...',
    profileLabel: 'Profile',
    copy: 'Copy',
    copied: 'Copied',
    failed: 'Failed',
    copyTitle: 'Copy contextId',
    hint: 'The extension connects automatically when you run any <code>opencli</code> command.',
    docLink: 'Documentation',
  },
  id: {
    checking: 'Memeriksa...',
    noDaemon: 'Daemon tidak terhubung',
    connected: 'Terhubung ke daemon',
    reconnecting: 'Menghubungkan ulang...',
    profileLabel: 'Profil',
    copy: 'Salin',
    copied: 'Tersalin',
    failed: 'Gagal',
    copyTitle: 'Salin contextId',
    hint: 'Ekstensi ini terhubung otomatis saat Anda menjalankan perintah <code>opencli</code>.',
    docLink: 'Dokumentasi',
  },
};

let lang = 'en';
function t(key) {
  return I18N[lang][key];
}

const els = {};
let lastResp = null;

function applyStaticText() {
  els.hint.innerHTML = t('hint');
  els.copyBtn.title = t('copyTitle');
  els.copyBtn.textContent = t('copy');
  els.docLink.textContent = t('docLink');
  els.langId.setAttribute('aria-pressed', String(lang === 'id'));
  els.langEn.setAttribute('aria-pressed', String(lang === 'en'));
}

function renderStatus() {
  const resp = lastResp;
  if (!resp) {
    setState(els.card, els.dot, 'disconnected');
    els.status.textContent = t('checking');
    return;
  }
  if (chrome.runtime.lastError || resp.error) {
    setState(els.card, els.dot, 'disconnected');
    els.status.textContent = t('noDaemon');
    els.daemonVersion.textContent = '';
    els.profileRow.style.display = 'none';
    els.hint.style.display = 'block';
    return;
  }

  if (typeof resp.contextId === 'string' && resp.contextId.length > 0) {
    els.contextId.textContent = resp.contextId;
    els.profileRow.style.display = 'flex';
  } else {
    els.profileRow.style.display = 'none';
  }
  els.profileLabel.textContent = t('profileLabel');

  if (resp.connected) {
    setState(els.card, els.dot, 'connected');
    els.status.textContent = t('connected');
    if (typeof resp.daemonVersion === 'string') {
      els.daemonVersion.textContent = `daemon v${resp.daemonVersion}`;
    }
    els.hint.style.display = 'none';
  } else if (resp.reconnecting) {
    setState(els.card, els.dot, 'connecting');
    els.status.textContent = t('reconnecting');
    els.daemonVersion.textContent = '';
    els.hint.style.display = 'none';
  } else {
    setState(els.card, els.dot, 'disconnected');
    els.status.textContent = t('noDaemon');
    els.daemonVersion.textContent = '';
    els.hint.style.display = 'block';
  }
}

function setLang(newLang) {
  lang = newLang === 'id' ? 'id' : 'en';
  applyStaticText();
  renderStatus();
  try {
    chrome.storage.local.set({ lang });
  } catch (e) {
    // ponytail: storage may be unavailable in odd contexts; ignore
  }
}

function setState(card, dot, state) {
  card.classList.remove('connected', 'disconnected', 'connecting');
  card.classList.add(state);
  dot.classList.remove('connected', 'disconnected', 'connecting');
  dot.classList.add(state);
}

function copyToClipboard(text, btn) {
  navigator.clipboard.writeText(text).then(
    () => {
      btn.textContent = t('copied');
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = t('copy');
        btn.classList.remove('copied');
      }, 1200);
    },
    () => {
      btn.textContent = t('failed');
      setTimeout(() => { btn.textContent = t('copy'); }, 1200);
    },
  );
}

function init() {
  els.card = document.getElementById('card');
  els.dot = document.getElementById('dot');
  els.status = document.getElementById('status');
  els.daemonVersion = document.getElementById('daemonVersion');
  els.profileRow = document.getElementById('profileRow');
  els.profileLabel = els.profileRow.querySelector('.profile-label');
  els.contextId = document.getElementById('contextId');
  els.copyBtn = document.getElementById('copyBtn');
  els.hint = document.getElementById('hint');
  els.extVersion = document.getElementById('extVersion');
  els.langId = document.getElementById('langId');
  els.langEn = document.getElementById('langEn');
  els.docLink = document.getElementById('docLink');

  els.copyBtn.addEventListener('click', () => {
    if (lastResp && typeof lastResp.contextId === 'string') {
      copyToClipboard(lastResp.contextId, els.copyBtn);
    }
  });
  els.langId.addEventListener('click', () => setLang('id'));
  els.langEn.addEventListener('click', () => setLang('en'));

  chrome.storage.local.get(['lang'], (result) => {
    lang = result && result.lang === 'id' ? 'id' : 'en';
    applyStaticText();
    renderStatus();

    chrome.runtime.sendMessage({ type: 'getStatus' }, (resp) => {
      if (resp && typeof resp.extensionVersion === 'string') {
        els.extVersion.textContent = `v${resp.extensionVersion}`;
      }
      lastResp = chrome.runtime.lastError || !resp ? { error: true } : resp;
      renderStatus();
    });
  });
}

init();
