// === CONFIGURACIÃƒÆ’Ã¢â‚¬Å“N GOOGLE ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â Credenciales OAuth ===
const GOOGLE_CLIENT_ID = '658971789892-cnsnbr36hus5jablgkuj2qk8ipic5ptf.apps.googleusercontent.com';
const GOOGLE_API_KEY   = 'AIzaSyAqn7NyL_QRC97KW-huBjzZjTLPGpEoT-k';
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/gmail.send';

// === GOOGLE STATE ===
let _gapiInited = false, _gisInited = false, _googleToken = null, _tokenClient = null;
let _pickerInited = false;
let _sheetHistory = [];
_sheetHistory = SafeStorage.getJSON('gsheet-history', []);
let _defaultSheetUrl = null;
_defaultSheetUrl = SafeStorage.get('gsheet-default-url', null);

function gapiLoaded() {
  gapi.load('client:picker', async () => {
    try {
      await gapi.client.init({ apiKey: GOOGLE_API_KEY, discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'] });
      _gapiInited = true; _pickerInited = true;
      maybeEnableGoogleUI();
    } catch(e) { console.warn('gapi init error:', e); }
  });
}

function gisLoaded() {
  _tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CLIENT_ID, scope: SCOPES, callback: onTokenResponse,
  });
  _gisInited = true;
  maybeEnableGoogleUI();
}

function maybeEnableGoogleUI() {
  if (_gapiInited && _gisInited) {
    // Auto re-auth silently if user was previously connected
    if (!_googleToken && _tokenClient) {
      try {
        if (SafeStorage.get('gsheet-connected') === '1') {
          _tokenClient.requestAccessToken({ prompt: '' });
        }
      } catch(e) { console.warn('[Auth] Auto-reconnect error:', e.message); }
    }
    renderSheetHistory();
    if (GOOGLE_CLIENT_ID === 'TU_CLIENT_ID.apps.googleusercontent.com') {
      const el = document.getElementById('gsheet-section');
      if (el) el.innerHTML = '<h3>&#128202; Google Sheets</h3>' +
        '<p style="color:#e53935;">Configura GOOGLE_CLIENT_ID y GOOGLE_API_KEY en el c\u00F3digo para activar esta funci\u00F3n. Consulta el README.md para instrucciones.</p>';
    }
  }
}

window.addEventListener('load', () => {
  if (typeof gapi !== 'undefined') gapiLoaded();
  else { const s = document.querySelector('script[src*="apis.google.com"]'); if (s) s.addEventListener('load', gapiLoaded); }
  if (typeof google !== 'undefined' && google.accounts) gisLoaded();
  else { const s = document.querySelector('script[src*="accounts.google.com"]'); if (s) s.addEventListener('load', () => setTimeout(gisLoaded, 100)); }
});

// === GOOGLE AUTH ===
function googleSignIn() {
  if (!_tokenClient) { showToast('Google API no inicializada. Recarga la pÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡gina.', 'error'); return; }
  if (_googleToken) { updateGoogleStatus(true); return; }
  _tokenClient.requestAccessToken({ prompt: '' });
}
function onTokenResponse(resp) {
  if (resp.error) { console.error('Auth error:', resp); return; }
  _googleToken = resp;
  gapi.client.setToken(resp);
  SafeStorage.set('gsheet-connected', '1');
  updateGoogleStatus(true);
}
function googleSignOut() {
  if (_googleToken) { google.accounts.oauth2.revoke(_googleToken.access_token, () => {}); _googleToken = null; }
  SafeStorage.remove('gsheet-connected');
  updateGoogleStatus(false);
}
let _autoLoadAttempted = false;
function updateGoogleStatus(connected) {
  const statusEl = document.getElementById('gsheet-status');
  const labelEl = document.getElementById('gsheet-status-label');
  const btnC = document.getElementById('btn-google-connect');
  const btnD = document.getElementById('btn-google-disconnect');
  const picker = document.getElementById('gsheet-picker-area');
  const sidebar = document.getElementById('sidebar-google');
  const defaultArea = document.getElementById('gsheet-default-area');
  const noDefaultArea = document.getElementById('gsheet-no-default');
  if (connected) {
    statusEl.className = 'gsheet-status connected'; labelEl.textContent = t('upload.connectedGoogle');
    btnC.style.display = 'none'; btnD.style.display = ''; picker.style.display = '';
    sidebar.style.display = 'block';
    document.getElementById('google-dot').className = 'status-dot on';
    document.getElementById('google-status-text').textContent = t('upload.googleConnected');
    if (_defaultSheetUrl) {
      defaultArea.style.display = '';
      noDefaultArea.style.display = 'none';
      renderDefaultUrlDisplay();
      if (!_autoLoadAttempted && allReservas.length === 0) {
        _autoLoadAttempted = true;
        setTimeout(function() { autoLoadDefaultSheet(); }, 300);
      }
    } else {
      defaultArea.style.display = 'none';
      noDefaultArea.style.display = '';
    }
  } else {
    statusEl.className = 'gsheet-status disconnected'; labelEl.textContent = t('upload.notConnected');
    btnC.style.display = ''; btnD.style.display = 'none'; picker.style.display = 'none';
    sidebar.style.display = 'none';
    defaultArea.style.display = 'none';
    noDefaultArea.style.display = 'none';
    document.getElementById('gsheet-autoload-status').style.display = 'none';
  }
  renderSheetHistory();
}

// === DEFAULT SHEET URL MANAGEMENT ===
function renderDefaultUrlDisplay() {
  const el = document.getElementById('default-url-display');
  if (!el || !_defaultSheetUrl) return;
  const short = _defaultSheetUrl.length > 80 ? _defaultSheetUrl.substring(0, 77) + '...' : _defaultSheetUrl;
  el.innerHTML = '<span style="color:#6b7280;font-size:12px;">URL:</span> ' + short;
}
function loadDefaultSheet() {
  if (!_defaultSheetUrl) return;
  const id = extractSheetId(_defaultSheetUrl);
  if (!id) { showToast('La URL por defecto no es vÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡lida.', 'error'); return; }
  loadSheetById(id, 'Hoja por defecto');
}
function autoLoadDefaultSheet() {
  if (!_defaultSheetUrl || !_googleToken) return;
  let id = extractSheetId(_defaultSheetUrl);
  if (!id) return;
  const statusEl = document.getElementById('gsheet-autoload-status');
  statusEl.style.display = '';
  document.getElementById('autoload-status-text').textContent = t('upload.loadingDefault');
  loadSheetById(id, 'Hoja por defecto');
}
function editDefaultUrl() {
  document.getElementById('default-url-display').style.display = 'none';
  document.getElementById('default-url-edit').style.display = '';
  document.getElementById('default-url-edit-input').value = _defaultSheetUrl || '';
  document.getElementById('default-url-edit-input').focus();
}
function cancelDefaultUrlEdit() {
  document.getElementById('default-url-display').style.display = '';
  document.getElementById('default-url-edit').style.display = 'none';
}
function saveDefaultUrlEdit() {
  const url = document.getElementById('default-url-edit-input').value.trim();
  if (!url) { showToast('Introduce una URL vÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡lida.', 'warning'); return; }
  let id = extractSheetId(url);
  if (!id) { showToast('URL no vÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡lida. Debe ser Google Sheets.', 'error'); return; }
  _defaultSheetUrl = url;
  SafeStorage.set('gsheet-default-url', url);
  cancelDefaultUrlEdit();
  renderDefaultUrlDisplay();
  document.getElementById('gsheet-default-area').style.display = '';
  document.getElementById('gsheet-no-default').style.display = 'none';
}
function clearDefaultUrl() {
  if (!confirm('\u00BFQuitar la hoja por defecto?')) return;
  _defaultSheetUrl = null;
  SafeStorage.remove('gsheet-default-url');
  document.getElementById('gsheet-default-area').style.display = 'none';
  if (_googleToken) document.getElementById('gsheet-no-default').style.display = '';
}
function showSetDefaultUrl() {
  const form = document.getElementById('set-default-url-form');
  form.style.display = form.style.display === 'none' ? '' : 'none';
  if (form.style.display !== 'none') document.getElementById('set-default-url-input').focus();
}
function saveNewDefaultUrl() {
  const url = document.getElementById('set-default-url-input').value.trim();
  if (!url) { showToast('Introduce una URL vÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡lida.', 'warning'); return; }
  let id = extractSheetId(url);
  if (!id) { showToast('URL no vÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡lida. Debe ser Google Sheets.', 'error'); return; }
  _defaultSheetUrl = url;
  SafeStorage.set('gsheet-default-url', url);
  document.getElementById('set-default-url-form').style.display = 'none';
  document.getElementById('set-default-url-input').value = '';
  document.getElementById('gsheet-no-default').style.display = 'none';
  document.getElementById('gsheet-default-area').style.display = '';
  renderDefaultUrlDisplay();
}

// === GOOGLE PICKER ===
function getAppId() {
  const m = GOOGLE_CLIENT_ID.match(/^(\d+)/);
  return m ? m[1] : '';
}
function openGooglePicker() {
  if (!_pickerInited || !_googleToken) { showToast('Inicia sesiÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n con Google primero.', 'warning'); return; }
  const view = new google.picker.DocsView(google.picker.ViewId.SPREADSHEETS).setIncludeFolders(true).setSelectFolderEnabled(false);
  const sharedView = new google.picker.DocsView(google.picker.ViewId.SPREADSHEETS).setIncludeFolders(true).setOwnedByMe(false);
  const picker = new google.picker.PickerBuilder()
    .enableFeature(google.picker.Feature.NAV_HIDDEN)
    .setTitle('Selecciona la hoja de reservas')
    .addView(view).addView(sharedView)
    .setOAuthToken(_googleToken.access_token)
    .setDeveloperKey(GOOGLE_API_KEY)
    .setAppId(getAppId())
    .setCallback(onPickerCallback)
    .setSize(900, 550).build();
  picker.setVisible(true);
}
function onPickerCallback(data) {
  if (data.action === google.picker.Action.PICKED) {
    const doc = data.docs[0]; loadSheetById(doc.id, doc.name);
  }
}

// === LOAD FROM URL ===
function loadFromUrl() {
  const url = document.getElementById('gsheet-url-input').value.trim();
  if (!url) { showToast(t('toast.pasteUrl'), 'warning'); return; }
  const id = extractSheetId(url);
  if (!id) { showToast('URL no vÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡lida. Debe ser Google Sheets.', 'error'); return; }
  loadSheetById(id, 'Google Sheet');
}
function extractSheetId(url) {
  const m = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (m) return m[1];
  if (/^[a-zA-Z0-9_-]{20,}$/.test(url)) return url;
  return null;
}

// ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â
//  [M06] GOOGLE_SHEETS ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â Carga de datos, write-back y persistencia
// ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â

// === LOAD SHEET DATA ===
async function loadSheetById(sheetId, sheetName) {
  if (!_googleToken) { showToast('Inicia sesiÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n con Google primero.', 'warning'); return; }
  showGSheetLoading(t('loading.gettingInfo'));
  try {
    const meta = await gapi.client.sheets.spreadsheets.get({ spreadsheetId: sheetId, fields: 'properties.title,sheets.properties' });
    const title = meta.result.properties.title;
    const sheets = meta.result.sheets.map(s => ({ name: s.properties.title, index: s.properties.index }));
    const dataSheets = sheets.filter(s => s.name !== CONFIG_TAB_NAME && s.name !== PROPIETARIOS_TAB_NAME);
    if (dataSheets.length === 0) { hideGSheetLoading(); showToast(t('toast.noDataSheets'), 'warning'); return; }
    if (dataSheets.length === 1) { await loadSheetData(sheetId, dataSheets[0].name, title); }
    else { hideGSheetLoading(); showSheetSelector(sheetId, dataSheets, title); }
  } catch(e) {
    hideGSheetLoading();
    const errMsg = safeGet(e, 'result.error.message', '');
    console.error('[GSheets] Error loading sheet:', errMsg || e);
    showToast(errMsg ? 'Error: ' + errMsg : t('toast.errorLoadSheet'), 'error', 5000);
  }
}
function showSheetSelector(sheetId, sheets, title) {
  const sel = document.getElementById('gsheet-sheets-selector');
  const list = document.getElementById('gsheet-sheets-list');
  sel.style.display = '';
  list.innerHTML = '';
  const visibleSheets = sheets.filter(s => s.name !== CONFIG_TAB_NAME && s.name !== PROPIETARIOS_TAB_NAME);
  visibleSheets.forEach(s => {
    const btn = document.createElement('button');
    btn.className = 'btn btn-outline btn-sm';
    btn.textContent = s.name;
    btn.addEventListener('click', () => selectSheetTab(sheetId, s.name, title + ' / ' + s.name));
    list.appendChild(btn);
  });
}
async function selectSheetTab(sheetId, sheetTab, title) {
  document.getElementById('gsheet-sheets-selector').style.display = 'none';
  await loadSheetData(sheetId, sheetTab, title + ' / ' + sheetTab);
}
/**
 * @description Carga los datos de una hoja especÃƒÆ’Ã‚Â­fica del Google Sheet.
 * Es la funciÃƒÆ’Ã‚Â³n principal del flujo de carga desde Google Sheets.
 * Tras cargar los datos, configura write-back, config y propietarios.
 * @param {string} sheetId - ID del spreadsheet de Google
 * @param {string} sheetTab - Nombre de la pestaÃƒÆ’Ã‚Â±a a leer
 * @param {string} displayName - Nombre para mostrar al usuario
 */
async function loadSheetData(sheetId, sheetTab, displayName) {
  showGSheetLoading(t('loading.reading') + ' "' + displayName + '"...');
  try {
    const range = sheetTab + '!A1:Z10000';
    const resp = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: sheetId, range: range,
      valueRenderOption: 'UNFORMATTED_VALUE', dateTimeRenderOption: 'SERIAL_NUMBER'
    });
    const rows = resp.result.values;
    if (!rows || rows.length < 2) { hideGSheetLoading(); showToast('La hoja estÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡ vacÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­a o no tiene datos suficientes.', 'warning'); return; }
    showGSheetLoading(t('loading.processing', rows.length - 1));
    if (!processRows(rows)) { hideGSheetLoading(); return; }

    // Set up sheet source for write-back
    const lastResult = processRows._lastResult || {};



    const valColIdx = lastResult.valColIdx !== undefined ? lastResult.valColIdx : null;
    const headerRowIdx = lastResult.headerRow !== undefined ? lastResult.headerRow : 0;
    await setupSheetSource(sheetId, sheetTab, headerRowIdx, valColIdx);

    // Load or create config tab for persistence
    await loadOrCreateConfigTab(sheetId);

    // Load propietarios mapping
    await loadPropietariosTab(sheetId);

    addToSheetHistory(sheetId, displayName, sheetTab);
    document.getElementById("file-name").textContent = '\u{1F4CA} ' + displayName;
    document.getElementById("file-indicator").style.display = "block";
    document.getElementById("nav-consol").style.display = "block";
    updateSyncIndicator('idle');
    document.getElementById('sync-toggle-btn').style.display = 'block';
    // One-time migration: force highest commission for non-validated Booking reservations
    _migrateBookingCommission();

    hideGSheetLoading(); showScreen("list"); renderTable();
    // Auto-start multi-user sync if enabled
    _autoStartSyncIfReady();
  } catch(e) {
    hideGSheetLoading();
    const errMsg = safeGet(e, 'result.error.message', '');
    console.error('[GSheets] Error reading sheet data:', errMsg || e);
    showToast(errMsg ? 'Error: ' + errMsg : t('toast.errorReadData'), 'error', 5000);
  }
}

// === LOADING UI ===
function showGSheetLoading(text) { document.getElementById('gsheet-loading').style.display = 'flex'; document.getElementById('gsheet-loading-text').textContent = text || 'Cargando...'; }
function hideGSheetLoading() { document.getElementById('gsheet-loading').style.display = 'none'; document.getElementById('gsheet-autoload-status').style.display = 'none'; }

// === SHEET WRITE-BACK: Validation column ===
function colIndexToLetter(idx) {
  let s = '';
  idx = Math.max(0, idx);
  while (true) {
    s = String.fromCharCode(65 + (idx % 26)) + s;
    idx = Math.floor(idx / 26) - 1;
    if (idx < 0) break;
  }
  return s;
}

async function setupSheetSource(sheetId, sheetTab, headerRowIdx, valColIdx) {
  if (valColIdx !== null) {
    // Column already exists
    _sheetSource = {
      id: sheetId,
      tab: sheetTab,
      valColIdx: valColIdx,
      valColLetter: colIndexToLetter(valColIdx),
      headerRow: headerRowIdx
    };
    console.log('[Sync] Validation column found at ' + _sheetSource.valColLetter + ' (index ' + valColIdx + ')');
    return;
  }

  // Column doesn't exist \u2014 create it after the last used column
  // Find the max column used in header row
  const headerResp = await gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: sheetTab + '!' + (headerRowIdx + 1) + ':' + (headerRowIdx + 1),
    valueRenderOption: 'UNFORMATTED_VALUE'
  });
  const headerVals = (headerResp.result.values && headerResp.result.values[0]) || [];
  const newColIdx = headerVals.length; // next empty column
  const newColLetter = colIndexToLetter(newColIdx);

  // Write the header "Validada"
  await gapi.client.sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: sheetTab + '!' + newColLetter + (headerRowIdx + 1),
    valueInputOption: 'RAW',
    resource: { values: [['Validada']] }
  });

  _sheetSource = {
    id: sheetId,
    tab: sheetTab,
    valColIdx: newColIdx,
    valColLetter: newColLetter,
    headerRow: headerRowIdx
  };
  console.log('[Sync] Created validation column at ' + newColLetter + ' (index ' + newColIdx + ')');
}

async function writeValidationToSheet(reservaIdx, isValidated) {
  // Validations now persist in Configuracion tab (not data sheet)
  scheduleReservaConfigSave(reservaIdx);
}

async function batchWriteValidation(reservaIndices, isValidated) {
  // Validations now persist in Configuracion tab (not data sheet)
  // All indices are added to pending set, debounce coalesces into single write
  if (!_sheetSource || !_googleToken || reservaIndices.length === 0) return;
  reservaIndices.forEach(function(idx) { _pendingReservaConfigSaves.add(idx); });
  if (_reservaConfigSaveTimer) clearTimeout(_reservaConfigSaveTimer);
  _reservaConfigSaveTimer = setTimeout(flushReservaConfigSaves, 300); // faster for batch
}

// Sync status indicator
function updateSyncIndicator(state) {
  const el = document.getElementById('sync-indicator');
  if (!el) return;
  if (!_sheetSource) { el.style.display = 'none'; return; }
  el.style.display = 'flex';
  const dot = el.querySelector('.sync-dot');
  const text = el.querySelector('.sync-text');
  switch(state) {
    case 'syncing':
      dot.className = 'sync-dot syncing';
      text.textContent = t('save.saving');
      break;
    case 'saved':
      dot.className = 'sync-dot saved';
      text.textContent = t('save.saved');
      // Fade back to idle after 2s
      clearTimeout(el._fadeTimer);
      el._fadeTimer = setTimeout(() => updateSyncIndicator('idle'), 2500);
      break;
    case 'error':
      dot.className = 'sync-dot error';
      text.textContent = t('save.error');
      clearTimeout(el._fadeTimer);
      el._fadeTimer = setTimeout(() => updateSyncIndicator('idle'), 5000);
      break;
    default: // idle
      dot.className = 'sync-dot idle';
      text.textContent = t('save.synced');
      break;
  }
}


// ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â
//  [M06-PERSIST] CONFIG PERSISTENCE ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â PestaÃƒÆ’Ã‚Â±a "Configuracion" en Google Sheets
// ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â

// === CONFIG PERSISTENCE: "Configuracion" tab in Google Sheets ===
const CONFIG_TAB_NAME = CONFIG.CONFIG_TAB_NAME;
const PROPIETARIOS_TAB_NAME = CONFIG.PROPIETARIOS_TAB_NAME;
let _propietariosMap = {}; // alojamiento code (normalized) -> propietario name
let _propietariosEmailMap = {}; // alojamiento code (normalized) -> propietario email
let _propietariosKeys = []; // sorted by length desc for best match
let _propietariosRowMap = {}; // alojamiento code (normalized) -> sheet row number (1-based)
let _propietariosSheetId = null;

// ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â
//  [M07] PROPIETARIOS ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â Mapeo alojamientoÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢propietario y ediciÃƒÆ’Ã‚Â³n inline
// ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â

/**
 * @description Busca el propietario de un alojamiento.
 * Primero intenta match exacto, luego match parcial (substring).
 * @param {string} alojamiento - Nombre/cÃƒÆ’Ã‚Â³digo del alojamiento
 * @returns {string} Nombre del propietario o t('consol.missingOwner')
 */
function getPropietario(alojamiento) {
  if (!alojamiento) return t('consol.missingOwner');
  const key = alojamiento.trim().toLowerCase();
  if (_propietariosMap[key]) return _propietariosMap[key];
  for (let i = 0; i < _propietariosKeys.length; i++) {
    if (key.indexOf(_propietariosKeys[i]) !== -1) return _propietariosMap[_propietariosKeys[i]];
  }
  return t('consol.missingOwner');
}

/**
 * @description Busca el email del propietario de un alojamiento.
 * @param {string} alojamiento - Nombre/cÃƒÆ’Ã‚Â³digo del alojamiento
 * @returns {string} Email del propietario o cadena vacÃƒÆ’Ã‚Â­a
 */
function getPropietarioEmail(alojamiento) {
  if (!alojamiento) return '';
  const key = alojamiento.trim().toLowerCase();
  if (_propietariosEmailMap[key]) return _propietariosEmailMap[key];
  for (let i = 0; i < _propietariosKeys.length; i++) {
    if (key.indexOf(_propietariosKeys[i]) !== -1) return _propietariosEmailMap[_propietariosKeys[i]] || '';
  }
  return '';
}

/**
 * @description Guarda el email del propietario en Google Sheets (columna C).
 * @param {string} alojamiento - Nombre/cÃƒÆ’Ã‚Â³digo del alojamiento
 * @param {string} email - Email del propietario
 * @returns {Promise<boolean>} true si se guardÃƒÆ’Ã‚Â³ correctamente
 */
async function savePropietarioEmail(alojamiento, email) {
  const matchedKey = _getPropietarioKey(alojamiento);
  if (!_propietariosSheetId || !_googleToken || !matchedKey) return false;
  try {
    const row = _propietariosRowMap[matchedKey];
    if (!row) return false;
    await gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId: _propietariosSheetId,
      range: PROPIETARIOS_TAB_NAME + '!C' + row,
      valueInputOption: 'RAW'
    }, { values: [[email]] });
    _propietariosEmailMap[matchedKey] = email;
    return true;
  } catch(e) { console.error('[Propietarios] Error saving email:', e); return false; }
}

function _getPropietarioKey(alojamiento) {
  if (!alojamiento) return null;
  const key = alojamiento.trim().toLowerCase();
  if (_propietariosMap[key]) return key;
  for (let i = 0; i < _propietariosKeys.length; i++) {
    if (key.indexOf(_propietariosKeys[i]) !== -1) return _propietariosKeys[i];
  }
  return null;
}

async function savePropietario(alojamiento, newName) {
  const matchedKey = _getPropietarioKey(alojamiento);
  if (!_propietariosSheetId || !_googleToken) return false;
  try {
    if (matchedKey && _propietariosRowMap[matchedKey]) {
      // Update existing row
      const row = _propietariosRowMap[matchedKey];
      await gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: _propietariosSheetId,
        range: PROPIETARIOS_TAB_NAME + '!B' + row,
        valueInputOption: 'RAW'
      }, { values: [[newName]] });
      _propietariosMap[matchedKey] = newName;
    } else {
      // New entry: find alojamiento code from the full name
      const code = alojamiento.trim();
      const codeKey = code.toLowerCase();
      // Append new row
      await gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: _propietariosSheetId,
        range: PROPIETARIOS_TAB_NAME + '!A:B',
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS'
      }, { values: [[code, newName]] });
      _propietariosMap[codeKey] = newName;
      // Estimate new row number
      let maxRow = 1;
      for (const k in _propietariosRowMap) { if (_propietariosRowMap[k] > maxRow) maxRow = _propietariosRowMap[k]; }
      _propietariosRowMap[codeKey] = maxRow + 1;
      _propietariosKeys = Object.keys(_propietariosMap).sort(function(a, b) { return b.length - a.length; });
    }
    return true;
  } catch(e) { console.error('[Propietarios] Error saving:', e); return false; }
}

function editPropietarioInline(alojamiento, el) {
  let current = getPropietario(alojamiento);
  if (current === t('consol.missingOwner')) current = '';
  const inp = document.createElement('input');
  inp.type = 'text'; inp.value = current;
  inp.style.cssText = 'font-size:inherit;font-weight:700;border:2px solid #3b82f6;border-radius:6px;padding:4px 8px;width:100%;max-width:350px;outline:none;';
  const container = el.parentNode;
  const original = el;
  container.replaceChild(inp, original);
  inp.focus(); inp.select();

  let saving = false;
  async function doSave() {
    if (saving) return; saving = true;
    const val = inp.value.trim();
    if (!val) val = current; // revert if empty
    if (val !== current) {
      inp.disabled = true; inp.style.opacity = '0.5';
      const ok = await savePropietario(alojamiento, val);
      if (!ok) { showToast('Error al guardar. ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¿EstÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡s conectado a Google Sheets?', 'error'); }
    }
    // Rebuild element
    const span = document.createElement('span');
    span.className = original.className;
    const prop = getPropietario(alojamiento);
    span.textContent = prop;
    span.title = 'Clic para editar propietario';
    span.style.cursor = 'pointer';
    if (prop === t('consol.missingOwner')) span.style.color = '#e53935';
    span.onclick = function() { editPropietarioInline(alojamiento, span); };
    container.replaceChild(span, inp);
  }
  inp.addEventListener('keydown', function(e) { if (e.key === 'Enter') { e.preventDefault(); doSave(); } if (e.key === 'Escape') { saving = true; container.replaceChild(original, inp); } });
  inp.addEventListener('blur', function() { setTimeout(doSave, 100); });
}

async function loadPropietariosTab(sheetId) {
  _propietariosMap = {};
  _propietariosEmailMap = {};
  _propietariosRowMap = {};
  _propietariosSheetId = sheetId;
  try {
    const meta = await gapi.client.sheets.spreadsheets.get({ spreadsheetId: sheetId, fields: 'sheets.properties' });
    const sheets = meta.result.sheets || [];
    const hasTab = sheets.some(function(s) { return s.properties.title === PROPIETARIOS_TAB_NAME; });
    if (!hasTab) { console.log('[Propietarios] No tab found'); return; }
    const resp = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: sheetId, range: PROPIETARIOS_TAB_NAME + '!A1:C1000',
      valueRenderOption: 'FORMATTED_VALUE'
    });
    const rows = resp.result.values;
    if (!rows || rows.length < 2) return;
    for (let i = 1; i < rows.length; i++) {
      const aloj = (rows[i][0] || '').trim();
      const prop = (rows[i][1] || '').trim();
      const email = (rows[i][2] || '').trim();
      if (aloj) {
        const k = aloj.toLowerCase();
        _propietariosMap[k] = prop || '';
        _propietariosEmailMap[k] = email || '';
        _propietariosRowMap[k] = i + 1; // 1-based sheet row
      }
    }
    console.log('[Propietarios] Loaded:', Object.keys(_propietariosMap).length);
    _propietariosKeys = Object.keys(_propietariosMap).sort(function(a, b) { return b.length - a.length; });
  } catch(e) { console.warn('Error loading Propietarios tab:', e); }
}
let _configLoaded = false; // true after config has been loaded/created for current sheet

// Debounce timers for saving
let _globalConfigSaveTimer = null;
let _reservaConfigSaveTimer = null;
let _pendingReservaConfigSaves = new Set();

/**
 * @description Programa el guardado de configuraciÃƒÆ’Ã‚Â³n global con debounce de 1500ms.
 * Cada llamada reinicia el timer. Solo se ejecuta si hay conexiÃƒÆ’Ã‚Â³n a Google Sheets.
 */
function scheduleGlobalConfigSave() {
  if (!_sheetSource || !_googleToken) return;
  if (_globalConfigSaveTimer) clearTimeout(_globalConfigSaveTimer);
  _globalConfigSaveTimer = setTimeout(saveGlobalConfigToSheet, 1500);
}

/**
 * @description Programa el guardado de configuraciÃƒÆ’Ã‚Â³n de una reserva con debounce.
 * Acumula mÃƒÆ’Ã‚Âºltiples cambios y los guarda en batch tras 1000ms de inactividad.
 * @param {number} idx - ÃƒÆ’Ã‚Ândice de la reserva modificada
 */
function scheduleReservaConfigSave(idx) {
  if (!_sheetSource || !_googleToken) return;
  _pendingReservaConfigSaves.add(idx);
  if (_reservaConfigSaveTimer) clearTimeout(_reservaConfigSaveTimer);
  _reservaConfigSaveTimer = setTimeout(flushReservaConfigSaves, 1000);
}

// Build global config data as key-value rows
function buildGlobalConfigRows() {
  const rows = [];
  Object.keys(platformOptions).sort().forEach(function(name) {
    rows.push(['plataforma:' + name, platformOptions[name].join(',')]);
  });
  rows.push(['pasarela_stripe', pasarelaStripeOptions.join(',')]);
  rows.push(['pasarela_booking', pasarelaBookingOptions.join(',')]);
  rows.push(['limpieza', cleaningOptions.join(',')]);
  rows.push(['irpf', irpfOptions.join(',')]);
  rows.push(['gtc', gtcOptions.join(',')]);
  rows.push(['amenities', amenitiesOptions.join(',')]);
  rows.push(['mantenimiento', maintenanceOptions.join(',')]);
  rows.push(['gtc_split', _gtcSplitAlojamientos.join(',')]);
  rows.push(['gtc_owned', _gtcOwnedAlojamientos.join(',')]);
  // Per-consolidation monthly deductions
  Object.keys(_consolMaint).forEach(function(k) {
    const m = _consolMaint[k];
    rows.push(['maint:' + k, (m.enabled?'1':'0') + ',' + m.amount]);
  });
  Object.keys(_consolExtras).forEach(function(k) {
    const exs = _consolExtras[k];
    if (exs.length > 0) {
      rows.push(['extras:' + k, JSON.stringify(exs)]);
    }
  });
  return rows;
}

// Build per-reservation config rows
function buildReservaConfigRows(indices) {
  const rows = [];
  const list = indices ? [...indices] : allReservas.map(function(r) { return r.idx; });
  list.forEach(function(idx) {
    const r = allReservas[idx];
    const s = settings[idx];
    if (!r || !s) return;
    rows.push([
      r.id,
      s.comPlataforma !== undefined ? s.comPlataforma : '',
      s.comGTC !== undefined ? s.comGTC : '',
      s.limpieza !== undefined ? s.limpieza : '',
      s.amenities !== undefined ? s.amenities : '',
      s.irpf !== undefined ? s.irpf : '',
      s.pasarela ? 'true' : 'false',
      s.pasarelaRate !== undefined ? s.pasarelaRate : '',
      (s.conceptosEspeciales && s.conceptosEspeciales.length > 0) ? JSON.stringify(s.conceptosEspeciales) : '',
      (s.conceptosSinIVA && s.conceptosSinIVA.length > 0) ? JSON.stringify(s.conceptosSinIVA) : '',
      validated.has(idx) ? 'true' : 'false'
    ]);
  });
  return rows;
}

// Full build of the Configuracion tab content
function buildFullConfigTabData() {
  const data = [];
  data.push(['Configuracion', 'Liquidaciones App', 'v' + APP_VERSION]);
  data.push([]);
  data.push(['OPCIONES GLOBALES']);
  data.push(['Clave', 'Valor']);
  let globalRows = buildGlobalConfigRows();
  globalRows.forEach(function(row) { data.push(row); });
  data.push([]);
  data.push(['AJUSTES POR RESERVA']);
  data.push(['ID Reserva', 'comPlataforma', 'comGTC', 'limpieza', 'amenities', 'irpf', 'pasarela', 'pasarelaRate', 'conceptosEspeciales', 'conceptosSinIVA', 'validated']);
  let reservaRows = buildReservaConfigRows();
  reservaRows.forEach(function(row) { data.push(row); });
  return data;
}

// Load or create the Configuracion tab
/**
 * @description Carga o crea la pestaÃƒÆ’Ã‚Â±a "Configuracion" del Google Sheet.
 * Esta pestaÃƒÆ’Ã‚Â±a almacena todas las opciones globales y ajustes por reserva.
 * Si no existe, la crea con los datos actuales.
 * @param {string} sheetId - ID del spreadsheet
 */
async function loadOrCreateConfigTab(sheetId) {
  if (!_googleToken) return;
  _configLoaded = false;
  try {
    console.log('[Config] Loading config tab...');
    const meta = await gapi.client.sheets.spreadsheets.get({
      spreadsheetId: sheetId,
      fields: 'sheets.properties.title'
    });
    const tabExists = meta.result.sheets.some(function(s) {
      return s.properties.title === CONFIG_TAB_NAME;
    });

    if (tabExists) {
      const resp = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: CONFIG_TAB_NAME + '!A1:K' + CONFIG.MAX_CONFIG_ROWS,
        valueRenderOption: 'UNFORMATTED_VALUE'
      });
      const rows = resp.result.values || [];
      applyConfigFromRows(rows);
      _configLoaded = true;
      console.log('[Config] Loaded config from "' + CONFIG_TAB_NAME + '" tab (' + rows.length + ' rows)');

      // Migration: if config didn't have 'validated' column, save now to persist
      // validations that were read from the data sheet column
      if (!applyConfigFromRows._hadValidatedCol && validated.size > 0) {
        console.log('[Config] Migrating ' + validated.size + ' validations from data sheet to Configuracion...');
        try {
          const data = buildFullConfigTabData();
          await gapi.client.sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: CONFIG_TAB_NAME + '!A1',
            valueInputOption: 'RAW',
            resource: { values: data }
          });
          const clearFrom = data.length + 1;
          await gapi.client.sheets.spreadsheets.values.clear({
            spreadsheetId: sheetId,
            range: CONFIG_TAB_NAME + '!A' + clearFrom + ':K' + CONFIG.MAX_CONFIG_ROWS
          }).catch(function() {});
          console.log('[Config] Migration complete: ' + validated.size + ' validations saved to Configuracion');
        } catch(me) {
          console.warn('[Config] Migration save failed:', me);
        }
      }
    } else {
      await gapi.client.sheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        resource: {
          requests: [{ addSheet: { properties: { title: CONFIG_TAB_NAME } } }]
        }
      });
      const data = buildFullConfigTabData();
      await gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: CONFIG_TAB_NAME + '!A1',
        valueInputOption: 'RAW',
        resource: { values: data }
      });
      _configLoaded = true;
      console.log('[Config] Created "' + CONFIG_TAB_NAME + '" tab with ' + data.length + ' rows');
    }
  } catch(e) {
    console.warn('[Config] Error loading/creating config tab:', e);
  }
}

// Parse config rows and apply to app state
function applyConfigFromRows(rows) {
  if (!rows || rows.length < 4) return;

  let globalStart = -1, reservaHeaderRow = -1;
  for (let i = 0; i < rows.length; i++) {
    const cell = String(rows[i][0] || '').trim();
    if (cell === 'Clave' && globalStart === -1) { globalStart = i + 1; }
    if (cell === 'ID Reserva') { reservaHeaderRow = i; break; }
  }

  // Parse global options
  if (globalStart >= 0) {
    const endRow = reservaHeaderRow > 0 ? reservaHeaderRow : rows.length;
    let newPlatformOptions = {};
    let newPasStripe = null, newPasBooking = null, newLimpieza = null;
    let newIrpf = null, newGtc = null, newAmenities = null;

    for (let i = globalStart; i < endRow; i++) {
      const key = String(rows[i][0] || '').trim();
      const val = String(rows[i][1] || '').trim();
      if (!key || !val) continue;

      if (key.startsWith('plataforma:')) {
        const platName = key.substring(11);
        const nums = val.split(',').map(function(v) { return parseFloat(v.trim()); }).filter(function(v) { return !isNaN(v); });
        if (nums.length > 0) newPlatformOptions[platName] = nums;
      } else if (key === 'pasarela_stripe') {
        newPasStripe = val.split(',').map(function(v) { return parseFloat(v.trim()); }).filter(function(v) { return !isNaN(v); });
      } else if (key === 'pasarela_booking') {
        newPasBooking = val.split(',').map(function(v) { return parseFloat(v.trim()); }).filter(function(v) { return !isNaN(v); });
      } else if (key === 'limpieza') {
        newLimpieza = val.split(',').map(function(v) { return parseFloat(v.trim()); }).filter(function(v) { return !isNaN(v); });
      } else if (key === 'irpf') {
        newIrpf = val.split(',').map(function(v) { return parseFloat(v.trim()); }).filter(function(v) { return !isNaN(v); });
      } else if (key === 'gtc') {
        newGtc = val.split(',').map(function(v) { return parseFloat(v.trim()); }).filter(function(v) { return !isNaN(v); });
      } else if (key === 'amenities') {
        newAmenities = val.split(',').map(function(v) { return parseFloat(v.trim()); }).filter(function(v) { return !isNaN(v); });
      } else if (key === 'mantenimiento') {
        const newMaint = val.split(',').map(function(v) { return parseFloat(v.trim()); }).filter(function(v) { return !isNaN(v); });
        if (newMaint.length > 0) maintenanceOptions = newMaint;
      } else if (key === 'gtc_split') {
        const splitList = val.split(',').map(function(v) { return v.trim(); }).filter(Boolean);
        if (splitList.length > 0) _gtcSplitAlojamientos = splitList;
      } else if (key === 'gtc_owned') {
        const ownedList = val.split(',').map(function(v) { return v.trim(); }).filter(Boolean);
        if (ownedList.length > 0) _gtcOwnedAlojamientos = ownedList;
      } else if (key.startsWith('maint:')) {
        const maintAloj = key.substring(6);
        const parts = val.split(',');
        _consolMaint[maintAloj] = { enabled: parts[0] === '1', amount: parseFloat(parts[1]) || maintenanceOptions[0] };
      } else if (key.startsWith('extras:')) {
        const extAloj = key.substring(7);
        try { _consolExtras[extAloj] = JSON.parse(val); } catch(e) { _consolExtras[extAloj] = []; }
      }
    }

    // Apply global options (merge with platforms from data)
    if (Object.keys(newPlatformOptions).length > 0) {
      Object.keys(platformOptions).forEach(function(p) {
        if (!newPlatformOptions[p]) newPlatformOptions[p] = platformOptions[p];
      });
      platformOptions = newPlatformOptions;
    }
    if (newPasStripe && newPasStripe.length > 0) pasarelaStripeOptions = newPasStripe;
    if (newPasBooking && newPasBooking.length > 0) pasarelaBookingOptions = newPasBooking;
    if (newLimpieza && newLimpieza.length > 0) cleaningOptions = newLimpieza;
    if (newIrpf && newIrpf.length > 0) irpfOptions = newIrpf;
    if (newGtc && newGtc.length > 0) gtcOptions = newGtc;
    if (newAmenities !== null && newAmenities.length > 0) amenitiesOptions = newAmenities;

    console.log('[Config] Applied global options: ' + Object.keys(platformOptions).length + ' plataformas');
  }

  // Parse per-reservation settings
  if (reservaHeaderRow >= 0) {
    // Detect column positions from header row (backwards compatible)
    const hdr = rows[reservaHeaderRow].map(function(c) { return String(c || '').trim(); });
    const colMap = {};
    hdr.forEach(function(name, idx) { colMap[name] = idx; });
    const idCol = colMap['ID Reserva'] !== undefined ? colMap['ID Reserva'] : 0;
    const cpCol = colMap['comPlataforma'];
    const cgCol = colMap['comGTC'];
    const lmCol = colMap['limpieza'];
    const amCol = colMap['amenities'];
    const irCol = colMap['irpf'];
    const paCol = colMap['pasarela'];
    const prCol = colMap['pasarelaRate'];
    const ceCol = colMap['conceptosEspeciales'];
    const ce2Col = colMap['conceptosSinIVA'];
    const valCol = colMap['validated'];

    const reservaMap = {};
    allReservas.forEach(function(r) { reservaMap[r.id] = r.idx; });

    // If config has validated column, it overrides the data sheet column
    let hasConfigValidation = valCol !== undefined;
    if (hasConfigValidation) {
      validated = new Set(); // reset â€” config is authoritative
    }
    applyConfigFromRows._hadValidatedCol = hasConfigValidation;

    let applied = 0;
    for (let i = reservaHeaderRow + 1; i < rows.length; i++) {
      const id = String(rows[i][idCol] || '').trim();
      if (!id) continue;
      let rIdx = reservaMap[id];
      if (rIdx === undefined) continue;

      let s = settings[rIdx];
      if (!s) continue;

      if (cpCol !== undefined) { let v = rows[i][cpCol]; if (v !== undefined && v !== '') s.comPlataforma = parseFloat(v); }
      if (cgCol !== undefined) { let v = rows[i][cgCol]; if (v !== undefined && v !== '') s.comGTC = parseFloat(v); }
      if (lmCol !== undefined) { let v = rows[i][lmCol]; if (v !== undefined && v !== '') s.limpieza = parseFloat(v); }
      if (amCol !== undefined) { let v = rows[i][amCol]; if (v !== undefined && v !== '') { const av = parseFloat(v); if (!isNaN(av) && amenitiesOptions.some(function(o){return Math.abs(o-av)<0.001;})) s.amenities = av; } }
      if (irCol !== undefined) { let v = rows[i][irCol]; if (v !== undefined && v !== '') s.irpf = parseFloat(v); }
      if (paCol !== undefined) { let v = rows[i][paCol]; if (v !== undefined && v !== '') s.pasarela = String(v).trim() === 'true'; }
      if (prCol !== undefined) { let v = rows[i][prCol]; if (v !== undefined && v !== '') s.pasarelaRate = parseFloat(v); }
      if (ceCol !== undefined) { let v = String(rows[i][ceCol] || '').trim(); if (v) { try { const parsed = JSON.parse(v); if (Array.isArray(parsed)) s.conceptosEspeciales = parsed.filter(function(item){return item && typeof item.amount === 'number';}); } catch(e) { console.warn('[Config] Invalid CE JSON for row', i, e.message); } } }
      if (ce2Col !== undefined) { let v = String(rows[i][ce2Col] || '').trim(); if (v) { try { const parsed = JSON.parse(v); if (Array.isArray(parsed)) s.conceptosSinIVA = parsed.filter(function(item){return item && typeof item.amount === 'number';}); } catch(e) { console.warn('[Config] Invalid CE2 JSON for row', i, e.message); } } }
      if (valCol !== undefined) { let v = String(rows[i][valCol] || '').trim(); if (v === 'true') validated.add(rIdx); }

      applied++;
    }
    console.log('[Config] Applied per-reservation settings: ' + applied + ' reservas' + (hasConfigValidation ? ' (validated from config: ' + validated.size + ')' : ''));

    // Sanitize: reset any amenities value that isn't in amenitiesOptions
    let sanitized = 0;
    allReservas.forEach(function(r) {
      let s = settings[r.idx];
      if (s && s.amenities !== undefined && !amenitiesOptions.some(function(o){return Math.abs(o-s.amenities)<0.001;})) {
        s.amenities = amenitiesOptions[0];
        sanitized++;
      }
    });
    if (sanitized > 0) console.log('[Config] Sanitized ' + sanitized + ' reservas with invalid amenities value');
  }

  // Rebuild caches after applying config
  rebuildSelectCache();
  invalidateCache();
}

// Save full global config to sheet (write-first for safety)
/**
 * @description Guarda toda la configuraciÃƒÆ’Ã‚Â³n en la pestaÃƒÆ’Ã‚Â±a "Configuracion".
 * Usa patrÃƒÆ’Ã‚Â³n write-first: escribe datos nuevos ANTES de limpiar obsoletos.
 * Esto garantiza que si la limpieza falla, los datos ya estÃƒÆ’Ã‚Â¡n salvados.
 */
async function saveGlobalConfigToSheet() {
  if (!_sheetSource || !_googleToken || !_configLoaded) return;
  updateSyncIndicator('syncing');
  try {
    let data = buildFullConfigTabData();
    // Write new data first (safe: if clear fails, data is already saved)
    await gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId: _sheetSource.id,
      range: CONFIG_TAB_NAME + '!A1',
      valueInputOption: 'RAW',
      resource: { values: data }
    });
    // Clear any stale rows below the new data
    const clearFrom = data.length + 1;
    await gapi.client.sheets.spreadsheets.values.clear({
      spreadsheetId: _sheetSource.id,
      range: CONFIG_TAB_NAME + '!A' + clearFrom + ':K' + CONFIG.MAX_CONFIG_ROWS
    }).catch(function(e) { console.warn('[Config] Non-critical: clear stale rows failed', e); });
    updateSyncIndicator('saved');
    console.log('[Config] Saved full config (' + data.length + ' rows)');
  } catch(e) {
    console.error('[Config] Error saving config:', e);
    updateSyncIndicator('error');
  }
}

// Flush pending per-reservation config saves (write-first for safety)
async function flushReservaConfigSaves() {
  if (!_sheetSource || !_googleToken || !_configLoaded) return;
  if (_pendingReservaConfigSaves.size === 0) return;

  const indices = [..._pendingReservaConfigSaves];
  _pendingReservaConfigSaves.clear();

  updateSyncIndicator('syncing');
  try {
    let data = buildFullConfigTabData();
    // Write new data first (safe: if clear fails, data is already saved)
    await gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId: _sheetSource.id,
      range: CONFIG_TAB_NAME + '!A1',
      valueInputOption: 'RAW',
      resource: { values: data }
    });
    // Clear any stale rows below the new data
    const clearFrom = data.length + 1;
    await gapi.client.sheets.spreadsheets.values.clear({
      spreadsheetId: _sheetSource.id,
      range: CONFIG_TAB_NAME + '!A' + clearFrom + ':K' + CONFIG.MAX_CONFIG_ROWS
    }).catch(function(e) { console.warn('[Config] Non-critical: clear stale rows failed', e); });
    updateSyncIndicator('saved');
    console.log('[Config] Saved config for ' + indices.length + ' reserva(s)');
  } catch(e) {
    console.error('[Config] Error saving reserva config:', e);
    updateSyncIndicator('error');
  }
}

// === SHEET HISTORY ===
function addToSheetHistory(sheetId, name, sheetTab) {
  _sheetHistory = _sheetHistory.filter(h => h.id !== sheetId || h.tab !== sheetTab);
  _sheetHistory.unshift({ id: sheetId, name, tab: sheetTab, date: new Date().toISOString() });
  if (_sheetHistory.length > CONFIG.SHEET_HISTORY_MAX) _sheetHistory = _sheetHistory.slice(0, CONFIG.SHEET_HISTORY_MAX);
  SafeStorage.set('gsheet-history', JSON.stringify(_sheetHistory));
  renderSheetHistory();
}
function removeFromHistory(idx) {
  _sheetHistory.splice(idx, 1);
  SafeStorage.set('gsheet-history', JSON.stringify(_sheetHistory));
  renderSheetHistory();
}
function renderSheetHistory() {
  const container = document.getElementById('gsheet-history');
  const list = document.getElementById('gsheet-history-list');
  if (!container || !list) return;
  if (!_sheetHistory.length) { container.style.display = 'none'; return; }
  container.style.display = '';
  list.innerHTML = '';
  _sheetHistory.forEach((h, i) => {
    const d = new Date(h.date);
    const dateStr = d.toLocaleDateString('es-ES', { day:'2-digit', month:'short', year:'numeric' });
    const canLoad = !!_googleToken;
    const item = document.createElement('div');
    item.className = 'gsheet-history-item';
    if (!canLoad) item.style.cssText = 'opacity:0.5;cursor:default;';
    item.innerHTML = '<div><div class="name">&#128202; ' + (h.name || h.id) + '</div><div class="meta">' + dateStr + (h.tab ? ' &middot; ' + h.tab : '') + '</div></div>';
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.title = 'Eliminar';
    removeBtn.innerHTML = '&#10005;';
    removeBtn.addEventListener('click', (e) => { e.stopPropagation(); removeFromHistory(i); });
    item.appendChild(removeBtn);
    if (canLoad) {
      item.addEventListener('click', () => loadSheetById(h.id, h.name || h.id));
    }
    list.appendChild(item);
  });
}

// â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
//  [M06b-SYNC] MULTI-USER SYNC â€” Polling Configuracion tab for remote changes
// â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”

let _syncEnabled = false;
let _syncTimerId = null;
let _syncBusy = false;
let _syncLastPoll = 0;

function startSync() {
  if (_syncEnabled) return;
  if (!_sheetSource || !_googleToken || !_configLoaded) {
    console.warn('[Sync] Cannot start: no sheet/token/config');
    return;
  }
  _syncEnabled = true;
  _syncLastPoll = Date.now();
  SafeStorage.set('sync-enabled', 'true');
  _scheduleSyncPoll();
  _updateSyncToggleUI();
  console.log('[Sync] Multi-user sync started (interval: ' + CONFIG.SYNC_POLL_INTERVAL + 'ms)');
}

function stopSync() {
  _syncEnabled = false;
  SafeStorage.set('sync-enabled', 'false');
  if (_syncTimerId) { clearTimeout(_syncTimerId); _syncTimerId = null; }
  _updateSyncToggleUI();
  console.log('[Sync] Multi-user sync stopped');
}

function toggleSync() {
  if (_syncEnabled) stopSync(); else startSync();
}

function _scheduleSyncPoll() {
  if (!_syncEnabled) return;
  if (_syncTimerId) clearTimeout(_syncTimerId);
  _syncTimerId = setTimeout(_doSyncPoll, CONFIG.SYNC_POLL_INTERVAL);
}

async function _doSyncPoll() {
  _syncTimerId = null;
  if (!_syncEnabled || !_sheetSource || !_googleToken || !_configLoaded) {
    _scheduleSyncPoll();
    return;
  }
  if (_pendingReservaConfigSaves.size > 0 || _reservaConfigSaveTimer) {
    console.log('[Sync] Skipping poll \u2014 local save pending');
    _scheduleSyncPoll();
    return;
  }
  if (_syncBusy) return;
  _syncBusy = true;

  try {
    const resp = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: _sheetSource.id,
      range: CONFIG_TAB_NAME + '!A1:K' + CONFIG.MAX_CONFIG_ROWS,
      valueRenderOption: 'UNFORMATTED_VALUE'
    });
    const rows = resp.result.values || [];
    const deltas = _computeSyncDeltas(rows);
    if (deltas.totalChanges > 0) {
      _applySyncDeltas(deltas, rows);
      console.log('[Sync] Applied ' + deltas.totalChanges + ' remote change(s)');
    }
    _syncLastPoll = Date.now();
  } catch(e) {
    console.warn('[Sync] Poll error:', e.message || e);
  } finally {
    _syncBusy = false;
    _scheduleSyncPoll();
  }
}

function _computeSyncDeltas(rows) {
  const result = {
    settingsChanged: [],
    validationChanged: [],
    globalChanged: false,
    totalChanges: 0
  };

  if (!rows || rows.length < 4) return result;

  let reservaHeaderRow = -1;
  for (let i = 0; i < rows.length; i++) {
    if (String(rows[i][0] || '').trim() === 'ID Reserva') { reservaHeaderRow = i; break; }
  }
  if (reservaHeaderRow < 0) return result;

  const hdr = rows[reservaHeaderRow].map(function(c) { return String(c || '').trim(); });
  const colMap = {};
  hdr.forEach(function(name, ci) { colMap[name] = ci; });
  const idCol = colMap['ID Reserva'] !== undefined ? colMap['ID Reserva'] : 0;
  const cpCol = colMap['comPlataforma'];
  const cgCol = colMap['comGTC'];
  const lmCol = colMap['limpieza'];
  const amCol = colMap['amenities'];
  const irCol = colMap['irpf'];
  const paCol = colMap['pasarela'];
  const prCol = colMap['pasarelaRate'];
  const ceCol = colMap['conceptosEspeciales'];
  const ce2Col = colMap['conceptosSinIVA'];
  const valCol = colMap['validated'];

  const reservaMap = {};
  allReservas.forEach(function(r) { reservaMap[r.id] = r.idx; });

  for (let i = reservaHeaderRow + 1; i < rows.length; i++) {
    const id = String(rows[i][idCol] || '').trim();
    if (!id) continue;
    const rIdx = reservaMap[id];
    if (rIdx === undefined) continue;
    const s = settings[rIdx];
    if (!s) continue;

    const checks = [
      { col: cpCol, field: 'comPlataforma', parse: parseFloat },
      { col: cgCol, field: 'comGTC', parse: parseFloat },
      { col: lmCol, field: 'limpieza', parse: parseFloat },
      { col: amCol, field: 'amenities', parse: parseFloat },
      { col: irCol, field: 'irpf', parse: parseFloat },
      { col: prCol, field: 'pasarelaRate', parse: parseFloat },
    ];
    checks.forEach(function(chk) {
      if (chk.col === undefined) return;
      const remoteRaw = rows[i][chk.col];
      if (remoteRaw === undefined || remoteRaw === '') return;
      const remoteVal = chk.parse(remoteRaw);
      const localVal = s[chk.field];
      if (!isNaN(remoteVal) && localVal !== undefined && Math.abs(remoteVal - localVal) > 0.0001) {
        result.settingsChanged.push({ idx: rIdx, field: chk.field, oldVal: localVal, newVal: remoteVal });
      }
    });

    if (paCol !== undefined) {
      const remotePas = String(rows[i][paCol] || '').trim() === 'true';
      if (remotePas !== s.pasarela) {
        result.settingsChanged.push({ idx: rIdx, field: 'pasarela', oldVal: s.pasarela, newVal: remotePas });
      }
    }

    [{ col: ceCol, field: 'conceptosEspeciales' }, { col: ce2Col, field: 'conceptosSinIVA' }].forEach(function(chk) {
      if (chk.col === undefined) return;
      const remoteStr = String(rows[i][chk.col] || '').trim();
      const localStr = (s[chk.field] && s[chk.field].length > 0) ? JSON.stringify(s[chk.field]) : '';
      if (remoteStr !== localStr) {
        try {
          const parsed = remoteStr ? JSON.parse(remoteStr) : [];
          if (Array.isArray(parsed)) {
            result.settingsChanged.push({ idx: rIdx, field: chk.field, oldVal: s[chk.field], newVal: parsed });
          }
        } catch(e) { /* skip invalid JSON */ }
      }
    });

    if (valCol !== undefined) {
      const remoteValidated = String(rows[i][valCol] || '').trim() === 'true';
      const localValidated = validated.has(rIdx);
      if (remoteValidated !== localValidated) {
        result.validationChanged.push({ idx: rIdx, wasValidated: localValidated, nowValidated: remoteValidated });
      }
    }
  }

  // Check global config: maint/extras
  let globalStart = -1;
  for (let i = 0; i < rows.length; i++) {
    const cell = String(rows[i][0] || '').trim();
    if (cell === 'Clave' && globalStart === -1) { globalStart = i + 1; break; }
  }
  if (globalStart >= 0) {
    for (let i = globalStart; i < reservaHeaderRow; i++) {
      const key = String(rows[i][0] || '').trim();
      const val = String(rows[i][1] || '').trim();
      if (!key || !val) continue;
      if (key.startsWith('maint:')) {
        const aloj = key.substring(6);
        const parts = val.split(',');
        const rEnabled = parts[0] === '1';
        const rAmount = parseFloat(parts[1]) || 0;
        const local = _consolMaint[aloj];
        if (!local || local.enabled !== rEnabled || Math.abs(local.amount - rAmount) > 0.01) {
          result.globalChanged = true;
        }
      } else if (key.startsWith('extras:')) {
        const aloj = key.substring(7);
        const localStr = _consolExtras[aloj] ? JSON.stringify(_consolExtras[aloj]) : '[]';
        if (val !== localStr) result.globalChanged = true;
      }
    }
  }

  result.totalChanges = result.settingsChanged.length + result.validationChanged.length + (result.globalChanged ? 1 : 0);
  return result;
}

function _applySyncDeltas(deltas, rawRows) {
  let needRender = false;
  let needConsolRefresh = false;
  const changedIdxs = new Set();

  deltas.settingsChanged.forEach(function(d) {
    const s = settings[d.idx];
    if (!s) return;
    s[d.field] = d.newVal;
    invalidateCache(d.idx);
    changedIdxs.add(d.idx);
    needRender = true;
  });

  deltas.validationChanged.forEach(function(d) {
    if (d.nowValidated) validated.add(d.idx); else validated.delete(d.idx);
    changedIdxs.add(d.idx);
    needRender = true;
  });

  if (deltas.globalChanged && rawRows) {
    // Re-parse global config section from remote rows
    let globalStart = -1, reservaHdr = -1;
    for (let i = 0; i < rawRows.length; i++) {
      const cell = String(rawRows[i][0] || '').trim();
      if (cell === 'Clave' && globalStart === -1) globalStart = i + 1;
      if (cell === 'ID Reserva') { reservaHdr = i; break; }
    }
    if (globalStart >= 0 && reservaHdr > globalStart) {
      for (let i = globalStart; i < reservaHdr; i++) {
        const key = String(rawRows[i][0] || '').trim();
        const val = String(rawRows[i][1] || '').trim();
        if (!key || !val) continue;
        if (key.startsWith('maint:')) {
          const aloj = key.substring(6);
          const parts = val.split(',');
          _consolMaint[aloj] = { enabled: parts[0] === '1', amount: parseFloat(parts[1]) || maintenanceOptions[0] };
        } else if (key.startsWith('extras:')) {
          const aloj = key.substring(7);
          try { _consolExtras[aloj] = JSON.parse(val); } catch(e) { _consolExtras[aloj] = []; }
        }
      }
    }
    needConsolRefresh = true;
    needRender = true;
  }

  if (needRender) {
    _validatedVersion++;
    invalidateFilterCache();
    invalidateGlobalStats();
    _cachedFilteredStats = null;
    renderTable();

    if (needConsolRefresh || (document.getElementById('screen-consoldetail') &&
        document.getElementById('screen-consoldetail').classList.contains('active') && currentConsolAloj)) {
      viewConsolDetail(currentConsolAloj);
    }

    const nSet = deltas.settingsChanged.length;
    const nVal = deltas.validationChanged.length;
    const parts = [];
    if (nVal > 0) parts.push(nVal + ' validaci\u00F3n' + (nVal > 1 ? 'es' : ''));
    if (nSet > 0) parts.push(nSet + ' ajuste' + (nSet > 1 ? 's' : ''));
    if (deltas.globalChanged) parts.push('config global');
    showToast('\uD83D\uDD04 Sync: ' + parts.join(', ') + ' ' + (deltas.totalChanges > 1 ? t('sync.updatedPl') : t('sync.updated')), 'info', 4000);
  }
}

function _updateSyncToggleUI() {
  const btn = document.getElementById('sync-toggle-btn');
  if (!btn) return;
  const dot = btn.querySelector('.sync-toggle-dot');
  const label = btn.querySelector('.sync-toggle-label');
  if (_syncEnabled) {
    if (dot) dot.style.background = '#16a34a';
    if (label) label.textContent = t('sync.on');
    btn.title = t('sync.activeTitle') + ' (' + t('sync.on') + ' - ' + (CONFIG.SYNC_POLL_INTERVAL/1000) + 's)';
  } else {
    if (dot) dot.style.background = '#6b7280';
    if (label) label.textContent = t('sync.off');
    btn.title = t('sync.activateBtn');
  }
}

function _autoStartSyncIfReady() {
  if (_sheetSource && _googleToken && _configLoaded && allReservas.length > 0) {
    const pref = SafeStorage.get('sync-enabled');
    if (pref !== 'false') startSync();
  }
}

// ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â
//  [M08] DATA_MODEL ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â Estado de la aplicaciÃƒÆ’Ã‚Â³n y opciones globales
// ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â

/**
 * @description Opciones de configuraciÃƒÆ’Ã‚Â³n editables por el usuario.
 * Cada array contiene los valores disponibles para los <select> de la UI.
 * Se persisten en la pestaÃƒÆ’Ã‚Â±a "Configuracion" del Google Sheet.
 *
 * platformOptions    ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ comisiones por plataforma (% sobre total con IVA)
 * pasarelaStripeOptions/pasarelaBookingOptions ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ tasa pasarela de pago (%)
 * cleaningOptions    ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ importes fijos de limpieza (ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬)
 * irpfOptions        ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ tasas de retenciÃƒÆ’Ã‚Â³n IRPF (%)
 * gtcOptions         ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ tasas de gestiÃƒÆ’Ã‚Â³n GTC (%)
 * amenitiesOptions   ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ importes fijos de amenities (ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬)
 * maintenanceOptions ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ importes fijos de mantenimiento mensual (ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬)
 */

// IVA constants now in CONFIG object
const IVA_RESERVA = CONFIG.IVA_RESERVA, IVA_SUBTOTAL = CONFIG.IVA_SUBTOTAL;
let amenitiesOptions = [7];

let platformOptions = {
  "Airbnb.com": [15.5], "Booking.com": [15, 17, 22], "Caddie Golf": [10],
  "Comercial": [10], "De Propietario": [0], "Frontex": [10],
  "Granadabeachgolf.com": [10], "Homeaway.com": [15], "Sport2event SL": [10],
};
let pasarelaStripeOptions = [1.3];
let pasarelaBookingOptions = [1.5];
let cleaningOptions = [100, 120];
let irpfOptions = [19, 24];
let gtcOptions = [20];
let maintenanceOptions = [80];

/**
 * @description Deducciones mensuales por alojamiento (mantenimiento).
 * Clave: nombre del alojamiento. Valor: { enabled: boolean, amount: number }
 * @type {Object.<string, {enabled: boolean, amount: number}>}
 */
let _consolMaint = {}; // { alojName: { enabled:true, amount:80 } }
let _consolExtras = {};
/**
 * @description Conceptos extraordinarios mensuales por alojamiento.
 * Clave: nombre alojamiento. Valor: array de { label: string, amount: number }
 * Se editan inline en la vista consoldetail y se persisten en Google Sheets.
 * @type {Object.<string, Array<{label: string, amount: number}>>}
 */

// Special 80/20 GTC split alojamientos
/**
 * @description Tasa de retenciÃƒÆ’Ã‚Â³n GTC para propiedades con mÃƒÆ’Ã‚Â­nimo garantizado.
 * GTC retiene 20% del subtotal de reservas, el propietario recibe el 80%.
 * @const {number}
 */
const GTC_SPLIT_RATE = 0.20; // GTC retains 20%, owner gets 80%
let _gtcSplitAlojamientos = ['MA-2-P2-1A','MA-2-P3-1C','MA-2-P3-1D','MA-2-P3-1E','MA-2-P4-1C','MG-2-0D'];
let _gtcOwnedAlojamientos = [
  'MA-2-P1-4C','MA-2-P1-1C','MA-2-P2-1A','MA-2-P3-1B','MA-2-P3-1C','MA-2-P3-1D','MA-2-P3-1E',
  'MA-2-P4-1A','MA-2-P4-1B','MA-2-P4-1C','MG-2-0D','MG-2-0F','MG-2-0I','MG-2-1F',
  'MG-2-1K','MG-2-1M','MG-2-1N','MG-2-2N','MG-2-3L','MG-3-0C'
];
/**
 * @description Comprueba si un alojamiento tiene reparto 80/20 GTC.
 * @param {string} alojName - Nombre del alojamiento
 * @returns {boolean} true si tiene condiciÃƒÆ’Ã‚Â³n especial de mÃƒÆ’Ã‚Â­nimo garantizado
 */
function isGtcSplit(alojName) { return _gtcSplitAlojamientos.some(function(a){ return alojName === a || alojName.indexOf(a) !== -1; }); }
/**
 * @description Comprueba si un alojamiento es propiedad de GTC.
 * @param {string} alojName - Nombre del alojamiento
 * @returns {boolean} true si es propiedad de GTC
 */
function isGtcOwned(alojName) { return _gtcOwnedAlojamientos.some(function(a){ return alojName === a || alojName.indexOf(a) !== -1; }); }

function getConsolMaint(alojName) {
  if (!_consolMaint[alojName]) _consolMaint[alojName] = { enabled: true, amount: maintenanceOptions[0] };
  return _consolMaint[alojName];
}
function getConsolExtras(alojName) {
  if (!_consolExtras[alojName]) _consolExtras[alojName] = [];
  return _consolExtras[alojName];
}
function getConsolDeductions(alojName) {
  let m = getConsolMaint(alojName);
  let extras = getConsolExtras(alojName);
  let maintBase = m.enabled ? m.amount : 0;
  let extrasTotal = extras.reduce(function(s,e){ return s + e.amount; }, 0);
  return { maintBase: maintBase, extrasTotal: extrasTotal, totalBase: maintBase + extrasTotal };
}

let allReservas = [], settings = {}, validated = new Set(), _lastFiltered = [];
let currentConsolAloj = null, currentDetailIdx = null;
// Google Sheets write-back state
/**
 * @description Fuente de datos Google Sheets para write-back.
 * null cuando se cargÃƒÆ’Ã‚Â³ desde fichero local. Contiene:
 *   .id           - ID del spreadsheet
 *   .tab          - Nombre de la pestaÃƒÆ’Ã‚Â±a de datos
 *   .valColIdx    - ÃƒÆ’Ã‚Ândice de la columna "Validada"
 *   .valColLetter - Letra de la columna (ej: "Q")
 *   .headerRow    - ÃƒÆ’Ã‚Ândice de la fila de cabecera
 * @type {Object|null}
 */
let _sheetSource = null; // null when loaded from file
let _syncQueue = []; // pending write operations
let _syncActive = false; // true while a write is in flight
// Performance: liquidation cache + pagination + render debouncing
let _pageSize = CONFIG.DEFAULT_PAGE_SIZE;
let _liqCache = {}, _currentPage = 1, _fmtCache = {};
/**
 * @description Invalida la cachÃƒÆ’Ã‚Â© de cÃƒÆ’Ã‚Â¡lculos.
 * @param {number} [idx] - Si se pasa, invalida solo esa reserva. Sin param = invalida todo.
 */
function invalidateCache(idx) { if (idx !== undefined) { delete _liqCache[idx]; } else { _liqCache = {}; invalidateGlobalStats(); invalidateFilterCache(); } }
/**
 * @description Obtiene los cÃƒÆ’Ã‚Â¡lculos de liquidaciÃƒÆ’Ã‚Â³n de una reserva (con cachÃƒÆ’Ã‚Â©).
 * @param {Object} r - Objeto reserva de allReservas[]
 * @returns {Object} Resultado de calcLiquidacion() (cacheado)
 */
function getLiq(r) {
  const idx = r.idx;
  if (_liqCache[idx]) return _liqCache[idx];
  _liqCache[idx] = calcLiquidacion(r, settings[idx] || {});
  return _liqCache[idx];
}
// Debounced render via requestAnimationFrame - coalesces multiple renderTable calls into one frame
let _renderRafId = 0, _renderMode = 'full'; // 'full' | 'append'
function scheduleRender(mode) {
  // 'full' overrides 'append'; 'append' only if no pending full
  if (mode === 'full' || _renderMode === 'full') _renderMode = 'full';
  else _renderMode = mode || 'full';
  if (_renderRafId) return; // already scheduled
  _renderRafId = requestAnimationFrame(() => {
    _renderRafId = 0;
    const m = _renderMode; _renderMode = 'full';
    if (m === 'append') _renderPageOnly();
    else _renderFull();
  });
}
// Cached filter+sort result \u2014 invalidated on filter/sort/data changes, NOT on pagination
let _cachedFiltered = null, _filterSortKey = '', _validatedVersion = 0;
let _searchText = '', _searchTextConsol = '';
let _consolValToggle = 'noval'; // 'noval' | 'val' | null (default: No Validadas primero)
function getFilterSortKey() {
  const pKey = [...comboState.platform.selected].sort().join(',') || 'all';
  const aKey = [...comboState.aloj.selected].sort().join(',') || 'all';
  return pKey + '|' + aKey + '|' + [..._mpSelYears].sort().join(',') + '|' + [..._mpSelMonths].sort().join(',') + '|' +
    simpleComboState.status.value + '|' + simpleComboState.sort.value + '|' +
    simpleComboState.sortdir.value + '|' + _validatedVersion + '|' + allReservas.length + '|' + _searchText;
}
function invalidateFilterCache() { _cachedFiltered = null; _filterSortKey = ''; _cachedFilteredStats = null; }
/**
 * @description Obtiene las reservas filtradas y ordenadas segÃƒÆ’Ã‚Âºn los filtros activos.
 * Usa cachÃƒÆ’Ã‚Â©: solo recalcula si los filtros han cambiado.
 * @returns {Array} Array de reservas que pasan todos los filtros
 */
function getFilteredSorted() {
  const key = getFilterSortKey();
  if (_cachedFiltered && _filterSortKey === key) return _cachedFiltered;
  const pSel = comboState.platform.selected, aSel = comboState.aloj.selected;
  const sf2 = simpleComboState.status.value;
  const sortF = simpleComboState.sort.value, sortD = simpleComboState.sortdir.value;
  let fil = allReservas.filter(r => {
    if (pSel.size > 0 && !pSel.has(r.plataforma)) return false;
    if (aSel.size > 0 && !aSel.has(r.alojamiento)) return false;
    if (_mpSelYears.size > 0 && !_mpMatchDate(r._dEntrada)) return false;
    if (sf2 === "validated" && !validated.has(r.idx)) return false;
    if (sf2 === "pending" && validated.has(r.idx)) return false;
    if (_searchText) {
      const s = _searchText;
      const c = getLiq(r);
      const fTotal = fmt(r.totalReserva), fLiq = fmt(c.totalLiq), fBase = fmt(c.baseSinIVA), fSub = fmt(c.sub);
      if (!(r._clienteLc.includes(s) || r._alojLc.includes(s) || r._platLc.includes(s) ||
            r.id.toLowerCase().includes(s) || r.localizador.toLowerCase().includes(s) ||
            (r.edificio||'').toLowerCase().includes(s) || (r.atendidoPor||'').toLowerCase().includes(s) ||
            (r.origenMarketing||'').toLowerCase().includes(s) || (r.observacion||'').toLowerCase().includes(s) ||
            (r.tipoReserva||'').toLowerCase().includes(s) ||
            r._fmtEntrada.includes(s) || r._fmtSalida.includes(s) || r._fmtAlta.includes(s) ||
            fTotal.includes(s) || fLiq.includes(s) || fBase.includes(s) || fSub.includes(s) ||
            String(r.totalReserva).includes(s) || String(r._nights) === s)) return false;
    }
    return true;
  });
  fil.sort((a, b) => {
    let va = getSortValue(a, sortF), vb = getSortValue(b, sortF);
    if (typeof va === "string") return sortD === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    return sortD === "asc" ? va - vb : vb - va;
  });
  _cachedFiltered = fil;
  _filterSortKey = key;
  return fil;
}
// Pre-computed select option strings (rebuilt when config changes)
let _selectCache = {};
function rebuildSelectCache() {
  _selectCache = {};
  // Platform options per platform name
  Object.keys(platformOptions).forEach(name => {
    const opts = platformOptions[name];
    _selectCache['plat_' + name] = opts.map(o => `<option value="${o/100}">${o}%</option>`).join('');
  });
  // GTC
  _selectCache.gtc = gtcOptions.map(o => `<option value="${o/100}">${o}%</option>`).join('');
  // Cleaning
  _selectCache.clean = cleaningOptions.map(o => `<option value="${o}">${o} \u20AC</option>`).join('');
  // Amenities
  _selectCache.amenities = amenitiesOptions.map(o => `<option value="${o}">${o} \u20AC</option>`).join('');
  // IRPF
  _selectCache.irpf = irpfOptions.map(o => `<option value="${o/100}">${o}%</option>`).join('');
  // Pasarela
  _selectCache.pasStripe = pasarelaStripeOptions.map(o => `<option value="${o/100}">${o}%</option>`).join('');
  _selectCache.pasBooking = pasarelaBookingOptions.map(o => `<option value="${o/100}">${o}%</option>`).join('');
}
function selectWithValue(html, val) {
  // Set selected on matching option via string replace (fast)
  const needle = `value="${val}"`;
  return html.replace(needle, needle + ' selected');
}
function selectCleanWithValue(html, val) {
  const needle = `value="${val}"`;
  return html.replace(needle, needle + ' selected');
}

// Fast number formatter (avoid toLocaleString which is ~50x slower)
function fmt(n) {
  const fixed = Math.abs(n).toFixed(2);
  const [int, dec] = fixed.split('.');
  // Add thousands separator (dot for es-ES)
  let result = '';
  for (let i = int.length - 1, c = 0; i >= 0; i--, c++) {
    if (c > 0 && c % 3 === 0) result = '.' + result;
    result = int[i] + result;
  }
  if (n < 0) result = '-' + result;
  return result + ',' + dec;
}
// Fast date formatter (avoid toLocaleDateString)
function fmtDate(d) {
  if (!d) return '\u2014';
  const dd = d.getDate(), mm = d.getMonth() + 1, yy = d.getFullYear();
  return (dd < 10 ? '0' : '') + dd + '/' + (mm < 10 ? '0' : '') + mm + '/' + yy;
}
function parseDate(val) {
  if (!val) return null;
  if (val instanceof Date) return val;
  if (typeof val === "number") return new Date((val - 25569) * 86400000);
  const s = String(val).trim();
  // DD/MM/YYYY or DD/MM/YY
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (m) { const y = m[3].length === 2 ? 2000 + parseInt(m[3]) : parseInt(m[3]); return new Date(y, parseInt(m[2])-1, parseInt(m[1])); }
  const d = new Date(s);
  return isNaN(d) ? null : d;
}
function formatDate(val) {
  const d = parseDate(val);
  return d ? fmtDate(d) : (val ? String(val) : "\u2014");
}
function dateToNum(val) { const d = parseDate(val); return d ? d.getTime() : 0; }
function calcNights(e, s) {
  const a = parseDate(e), b = parseDate(s);
  if (!a || !b) return 0; return Math.max(0, Math.round((b - a) / 86400000));
}
/**
 * @description Parsea un valor a nÃƒÆ’Ã‚Âºmero, manejando formatos espaÃƒÆ’Ã‚Â±oles (1.234,56).
 * IMPORTANTE: Si v ya es number nativo (de Google Sheets API), lo devuelve directo.
 * @param {*} v - Valor a parsear (number, string, null)
 * @returns {number} Valor numÃƒÆ’Ã‚Â©rico (0 si no parseable)
 */
function parseNum(v) {
  if (v == null || v === '') return 0;
  if (typeof v === 'number') return isFinite(v) ? v : 0;
  var s = String(v).replace(/[^\d.,-]/g, '').replace(/\./g, '').replace(',', '.');
  return parseFloat(s) || 0;
}
function parseRate(v, min, max) {
  var n = parseNum(v);
  if (min !== undefined && n < min) n = min;
  if (max !== undefined && n > max) n = max;
  return n;
}
function getDefaultForPlatform(plat) { const o = platformOptions[plat]; return o && o.length ? o[o.length-1] / 100 : 0.10; }

/**
 * @description One-time migration: sets all non-validated Booking.com reservations
 * to the highest available commission percentage.
 * Only modifies reservations that haven't been validated yet.
 */
function _migrateBookingCommission() {
  const bookingOpts = platformOptions['Booking.com'];
  if (!bookingOpts || bookingOpts.length === 0) return;
  const maxRate = bookingOpts[bookingOpts.length - 1] / 100;
  let count = 0;
  allReservas.forEach(function(r) {
    if (r.plataforma !== 'Booking.com') return;
    if (validated[r.idx]) return;
    const s = settings[r.idx] || {};
    if (s.comPlataforma === maxRate) return;
    if (!settings[r.idx]) settings[r.idx] = {};
    settings[r.idx].comPlataforma = maxRate;
    invalidateCache(r.idx);
    _pendingReservaConfigSaves.add(r.idx);
    count++;
  });
  if (count > 0) {
    console.log('[Migration] Booking commission set to ' + (maxRate*100) + '% for ' + count + ' non-validated reservations');
    showToast('Booking: ' + count + ' ' + t('stats.reservationCount') + ' ' + t('sync.updatedPl') + ' ' + (maxRate*100) + '%', 'info', 4000);
    // Schedule save of all modified reservations
    if (_reservaConfigSaveTimer) clearTimeout(_reservaConfigSaveTimer);
    _reservaConfigSaveTimer = setTimeout(flushReservaConfigSaves, 2000);
  }
}

/**
 * @description Calcula la liquidaciÃƒÆ’Ã‚Â³n completa de una reserva.
 * Este es el CORAZÃƒÆ’Ã¢â‚¬Å“N del sistema de cÃƒÆ’Ã‚Â¡lculo financiero.
 *
 * @param {Object} r - Objeto reserva de allReservas[]
 * @param {Object} s - Settings de la reserva (settings[r.idx])
 * @returns {Object} Objeto con todos los importes calculados:
 *   .totalOriginal - Importe original de la reserva
 *   .ceTotal       - Total de conceptos extraordinarios con IVA
 *   .total         - totalOriginal - ceTotal
 *   .baseSinIVA    - Base imponible sin IVA turÃƒÆ’Ã‚Â­stico (10%)
 *   .comRate       - Tasa de comisiÃƒÆ’Ã‚Â³n de plataforma aplicada
 *   .comPlat       - Importe comisiÃƒÆ’Ã‚Â³n plataforma
 *   .gtcRate       - Tasa de gestiÃƒÆ’Ã‚Â³n GTC aplicada
 *   .comGTC        - Importe comisiÃƒÆ’Ã‚Â³n GTC
 *   .comPas        - Importe comisiÃƒÆ’Ã‚Â³n pasarela (0 si desactivada)
 *   .limp          - Importe limpieza
 *   .amen          - Importe amenities
 *   .ceSinIvaTotal - Total conceptos extraordinarios sin IVA
 *   .sub           - Subtotal (base - todas las deducciones)
 *   .iva           - IVA 21% sobre subtotal
 *   .irpfRate      - Tasa IRPF aplicada
 *   .ret           - RetenciÃƒÆ’Ã‚Â³n IRPF
 *   .totalLiq      - TOTAL A LIQUIDAR (sub + iva - ret)
 */
function calcLiquidacion(r, s) {
  if (!r) return { totalOriginal:0, ceTotal:0, total:0, baseSinIVA:0, comRate:0, comPlat:0, gtcRate:0, comGTC:0, comPas:0, limp:0, amen:0, ceSinIvaTotal:0, sub:0, iva:0, irpfRate:0, ret:0, totalLiq:0 };
  const totalOriginal = r.totalReserva || 0;
  const ce = (s.conceptosEspeciales && s.conceptosEspeciales.length > 0) ? s.conceptosEspeciales : [];
  const ceTotal = ce.reduce(function(sum, item) { return sum + (item.amount || 0); }, 0);
  const total = totalOriginal - ceTotal;
  const baseSinIVA = total / (1 + IVA_RESERVA);
  let comRate = s.comPlataforma !== undefined ? s.comPlataforma : getDefaultForPlatform(r.plataforma);
  const comPlat = total * comRate;
  const gtcRate = s.comGTC !== undefined ? s.comGTC : gtcOptions[0]/100;
  const comGTC = baseSinIVA * gtcRate;
  let comPas = 0;
  if (s.pasarela) {
    const isB = r.plataforma === "Booking.com";
    const pr = s.pasarelaRate !== undefined ? s.pasarelaRate : (isB ? pasarelaBookingOptions[pasarelaBookingOptions.length-1]/100 : pasarelaStripeOptions[pasarelaStripeOptions.length-1]/100);
    comPas = total * pr;
  }
  const limp = s.limpieza !== undefined ? s.limpieza : cleaningOptions[0];
  const rawAmen = s.amenities;
  const amen = (rawAmen !== undefined && amenitiesOptions.some(function(o){return Math.abs(o-rawAmen)<0.001;})) ? rawAmen : amenitiesOptions[0];
  const ce2 = (s.conceptosSinIVA && s.conceptosSinIVA.length > 0) ? s.conceptosSinIVA : [];
  const ceSinIvaTotal = ce2.reduce(function(sum, item) { return sum + (item.amount || 0); }, 0);
  const sub = baseSinIVA - comPlat - comGTC - comPas - limp - amen - ceSinIvaTotal;
  const irpfRate = s.irpf !== undefined ? s.irpf : irpfOptions[0]/100;
  const iva = sub * IVA_SUBTOTAL, ret = sub * irpfRate;
  return { totalOriginal, ceTotal, total, baseSinIVA, comRate, comPlat, gtcRate, comGTC, comPas, limp, amen, ceSinIvaTotal, sub, iva, irpfRate, ret, totalLiq: sub + iva - ret };
}

// \u2500\u2500\u2500 FILE \u2500\u2500\u2500
function isHtmlFile(buf) {
  // Detect HTML-based .xls (Avantio exports): first bytes contain "<html" or start with whitespace+<
  const head = new TextDecoder("utf-8").decode(buf.slice(0, 200)).trim().toLowerCase();
  return head.startsWith("<html") || head.startsWith("<!doctype") || head.includes("<html");
}

function parseHtmlXls(text) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, "text/html");
  const trs = doc.querySelectorAll("table tr");
  const json = [];
  trs.forEach(tr => {
    const cells = [];
    tr.querySelectorAll("td, th").forEach(td => cells.push(td.textContent.trim()));
    json.push(cells);
  });
  return json;
}

/**
 * @description Procesa los datos crudos del Sheet/Excel y construye el modelo de datos.
 * Esta funciÃƒÆ’Ã‚Â³n es el PUNTO DE ENTRADA de datos en la aplicaciÃƒÆ’Ã‚Â³n.
 * Llena allReservas[], settings{}, validated Set, y construye los combos de filtro.
 *
 * @param {Array[]} json - Array de arrays (filas del Sheet). Primera fila ÃƒÆ’Ã‚Âºtil = cabecera.
 * @returns {boolean} true si se procesaron datos correctamente
 *
 * @sideeffects Modifica: allReservas, settings, validated, platformOptions,
 *              comboState, _mpAvailable, caches
 */
function processRows(json) {
  if (!json || !Array.isArray(json) || json.length < 2) {
    showToast("El archivo no contiene datos vÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡lidos.", "error");
    return false;
  }
  const headerRow = json.findIndex(r => r && r[0] && String(r[0]).includes("ID Reserva"));
  if (headerRow === -1) { showToast(t("msg.noHeader"), "error"); return false; }

  // Detect validation column in header
  const hdr = json[headerRow];
  let detectedValColIdx = null;
  for (let c = 0; c < (hdr ? hdr.length : 0); c++) {
    const h = String(hdr[c] || '').trim().toLowerCase();
    if (h === 'validada' || h === 'validado' || h === 'validated') { detectedValColIdx = c; break; }
  }

  // Build rows preserving original json row index (for sheet write-back)
  const dataStart = headerRow + 1;
  const allDataRows = json.slice(dataStart);
  const rowEntries = [];
  allDataRows.forEach((row, localIdx) => {
    if (row && row[0] && String(row[0]).trim().toLowerCase() !== 'total') {
      rowEntries.push({ data: row, jsonRow: dataStart + localIdx });
    }
  });

  allReservas = rowEntries.map((entry, idx) => {
    const row = entry.data;
    const r = {
      id: String(row[0]||""), localizador: String(row[1]||""), fechaAlta: row[2],
      alojamiento: String(row[3]||""), edificio: String(row[4]||""),
      plataforma: String(row[5]||"").trim() || "Granadabeachgolf.com",
      atendidoPor: String(row[6]||""), origenMarketing: String(row[7]||""),
      cliente: String(row[8]||""),
      tipoReserva: String(row[9]||""), fechaEntrada: row[10], fechaSalida: row[11],
      totalReserva: parseNum(row[12]), observacion: String(row[13]||""), idx,
      _sheetRow: entry.jsonRow + 1, // 1-indexed row in spreadsheet
    };
    const dE = parseDate(r.fechaEntrada), dS = parseDate(r.fechaSalida);
    const dA = parseDate(r.fechaAlta);
    r._dEntrada = dE; r._dSalida = dS; r._dAlta = dA;
    r._fmtEntrada = dE ? fmtDate(dE) : '\u2014';
    r._fmtSalida = dS ? fmtDate(dS) : '\u2014';
    r._fmtAlta = dA ? fmtDate(dA) : '\u2014';
    r._dateNum = dE ? dE.getTime() : 0;
    r._dateAltaNum = dA ? dA.getTime() : 0;
    r._nights = (dE && dS) ? Math.max(0, Math.round((dS - dE) / 86400000)) : 0;
    r._clienteLc = (r.cliente||"").toLowerCase();
    r._alojLc = (r.alojamiento||"").toLowerCase();
    r._platLc = (r.plataforma||"").toLowerCase();
    r._isBooking = r.plataforma === "Booking.com";
    return r;
  });
  settings = {}; validated = new Set();
  allReservas.forEach(r => {
    const isB = r.plataforma === "Booking.com";
    if (!platformOptions[r.plataforma]) platformOptions[r.plataforma] = [10];
    settings[r.idx] = {
      comPlataforma: getDefaultForPlatform(r.plataforma), comGTC: gtcOptions[0]/100,
      limpieza: cleaningOptions[0], amenities: amenitiesOptions[0], irpf: irpfOptions[0]/100, pasarela: false,
      pasarelaRate: isB ? pasarelaBookingOptions[pasarelaBookingOptions.length-1]/100 : pasarelaStripeOptions[pasarelaStripeOptions.length-1]/100,
      conceptosEspeciales: [],
      conceptosSinIVA: [],
    };
  });

  // Read validation state from sheet if column exists
  if (detectedValColIdx !== null) {
    allReservas.forEach((r, idx) => {
      const val = String(rowEntries[idx].data[detectedValColIdx] || '').trim().toLowerCase();
      if (val && (val === 's\u00ED' || val === 'si' || val === 'yes' || val === '1' || val === 'true' || val === 'x')) {
        validated.add(r.idx);
      }
    });
  }

  // Store metadata for sheet source setup (used by loadSheetData)
  processRows._lastResult = { valColIdx: detectedValColIdx, headerRow: headerRow };

  const plats = [...new Set(allReservas.map(r => r.plataforma))].sort();
  populateCombo('platform', plats);
  const alojs = [...new Set(allReservas.map(r => r.alojamiento))].sort();
  populateCombo('aloj', alojs);
  buildAvailableMonths();
  invalidateCache();
  invalidateAlojCache();
  rebuildSelectCache();
  // Phase 4: Reset AI context cache and alerts when data reloads
  if (typeof _aiContextCache !== 'undefined') _aiContextCache = { key: '', ctx: '', ts: 0 };
  if (typeof _aiAlertsShown !== 'undefined') _aiAlertsShown = false;
  _currentPage = 1;
  return true;
}

/**
 * @description Procesa un fichero Excel (.xlsx/.xls) cargado por el usuario.
 * Detecta si es HTML-based (Avantio) o XLSX real (SheetJS).
 * @param {File} file - Objeto File del input o drag&drop
 */
function handleFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const buf = new Uint8Array(e.target.result);
    let json;
    if (isHtmlFile(buf)) {
      // HTML-based .xls (Avantio): parse as HTML to preserve original text values
      const text = new TextDecoder("utf-8").decode(buf);
      json = parseHtmlXls(text);
    } else {
      // Real .xlsx: use SheetJS
      const wb = XLSX.read(buf, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      json = XLSX.utils.sheet_to_json(ws, { header: 1 });
    }
    if (!processRows(json)) return;
    _sheetSource = null; // not loaded from Google Sheets
    document.getElementById("file-name").textContent = file.name;
    document.getElementById("file-indicator").style.display = "block";
    document.getElementById("nav-consol").style.display = "block";
    showScreen("list"); renderTable();
  };
  reader.readAsArrayBuffer(file);
}

let _navigating = false;
/**
 * @description Cambia la pantalla activa de la SPA.
 * Gestiona la navegaciÃƒÆ’Ã‚Â³n entre las 5 vistas principales.
 * @param {string} name - Nombre de la pantalla: 'upload'|'list'|'detail'|'consol'|'consoldetail'
 */
function showScreen(name) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
  document.getElementById("screen-" + name).classList.add("active");
  document.getElementById("nav-" + name).classList.add("active");
  if (_previewActive) exitPreview();
  if (_navigating) return;
  _navigating = true;
  if (name === "list") renderTable();
  if (name === "consol") renderConsolGrid();
  if (name === "consoldetail" && currentConsolAloj) viewConsolDetail(currentConsolAloj);
  if (name === "detail" && currentDetailIdx !== null) viewDetail(currentDetailIdx);
  _navigating = false;
}

// \u2500\u2500\u2500 TABLE \u2500\u2500\u2500
// ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â
//  [M11] TABLE_RENDER ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â Tabla de preliquidaciÃƒÆ’Ã‚Â³n, columnas, paginaciÃƒÆ’Ã‚Â³n
// ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â

/**
 * @description DefiniciÃƒÆ’Ã‚Â³n de columnas de la tabla principal de preliquidaciÃƒÆ’Ã‚Â³n.
 * Cada columna tiene: key (CSS class), label (cabecera HTML), sortable, right (alinear), locked.
 * Las columnas locked no se pueden ocultar desde el toggle de columnas.
 */
const COLUMNS = [
  { key:"estado",label:t("col.estado"),sortable:true,locked:true },
  { key:"idReserva",label:t("col.idReserva"),sortable:true },
  { key:"localizador",label:t("col.localizador"),sortable:true },
  { key:"fechaAlta",label:t("col.fechaAlta"),sortable:true },
  { key:"cliente",label:t("col.cliente"),sortable:true },
  { key:"alojamiento",label:t("col.alojamiento"),sortable:true },
  { key:"edificio",label:t("col.edificio"),sortable:true },
  { key:"plataforma",label:t("col.plataforma"),sortable:true },
  { key:"atendidoPor",label:t("col.atendidoPor"),sortable:true },
  { key:"origenMarketing",label:t("col.origenMarketing"),sortable:true },
  { key:"tipoReserva",label:t("col.tipoReserva"),sortable:true },
  { key:"fechaEntrada",label:t("col.fechaEntrada"),sortable:true },
  { key:"fechaSalida",label:t("col.fechaSalida"),sortable:true },
  { key:"noches",label:t("col.noches"),sortable:true },
  { key:"totalReserva",label:t("col.totalReserva"),sortable:true,right:true },
  { key:"ce",label:"C.E.<br>(IVA inc.)",sortable:false },
  { key:"baseSinIVA",label:t("col.baseSinIVA"),sortable:true,right:true },
  { key:"comPlataforma",label:t("col.comPlataforma"),sortable:false },
  { key:"comGTC",label:"Gesti\u00F3n<br>GTC",sortable:false },
  { key:"limpieza",label:t("col.limpieza"),sortable:false },
  { key:"amenities",label:t("col.amenities"),sortable:false },
  { key:"pasarela",label:"Pasarela",sortable:false },
  { key:"ceSinIva",label:"C.E.<br>(Sin IVA)",sortable:false },
  { key:"subtotal",label:t("col.subtotal"),sortable:true,right:true },
  { key:"irpf",label:"IRPF",sortable:false },
  { key:"iva21",label:"IVA 21%",sortable:false },
  { key:"totalLiquidar",label:t("col.totalLiquidar"),sortable:true,right:true,locked:true },
  { key:"observacion",label:t("col.observacion"),sortable:true },
  { key:"acciones",label:"",sortable:true,locked:true },
];
// Column visibility state
let colVisibility = {};
COLUMNS.forEach(c => { colVisibility[c.key] = true; });
// Hidden by default
colVisibility['irpf'] = false;
colVisibility['iva21'] = false;
colVisibility['subtotal'] = false;
colVisibility['idReserva'] = true;
colVisibility['localizador'] = false;
colVisibility['fechaAlta'] = false;
colVisibility['edificio'] = false;
colVisibility['atendidoPor'] = false;
colVisibility['origenMarketing'] = false;
colVisibility['tipoReserva'] = false;
colVisibility['observacion'] = false;
function isColVisible(key) { return colVisibility[key] !== false; }
function toggleColVisibility(key) {
  const col = COLUMNS.find(c => c.key === key);
  if (col && col.locked) return;
  colVisibility[key] = !colVisibility[key];
  updateColStyles(); renderTable(); renderColToggle();
}
function updateColStyles() {
  let css = '';
  COLUMNS.forEach(c => {
    if (!isColVisible(c.key)) css += '.col-' + c.key + ' { display: none !important; }\n';
  });
  document.getElementById('col-visibility-style').textContent = css;
}
function renderColToggle() {
  const dd = document.getElementById('col-toggle-dd');
  dd.innerHTML = COLUMNS.filter(c => c.label).map(c => {
    const checked = isColVisible(c.key) ? 'checked' : '';
    const locked = c.locked ? 'locked' : '';
    const dis = c.locked ? 'disabled' : '';
    return '<label class="col-toggle-item ' + locked + '"><input type="checkbox" ' + checked + ' ' + dis +
      ' onchange="toggleColVisibility(\'' + c.key + '\')"> ' + c.label + '</label>';
  }).join('');
}
function toggleColDropdown() {
  const dd = document.getElementById('col-toggle-dd');
  const isOpen = dd.classList.contains('open');
  dd.classList.toggle('open');
  if (!isOpen) renderColToggle();
}

// \u2500\u2500\u2500 CONSOLIDATED TABLE: columns, sort, visibility \u2500\u2500\u2500
const CONSOL_COLUMNS = COLUMNS.filter(c => c.key !== 'alojamiento');
let consolColVis = {};
CONSOL_COLUMNS.forEach(c => { consolColVis[c.key] = true; });
consolColVis['irpf'] = false;
consolColVis['iva21'] = false;
consolColVis['subtotal'] = false;
consolColVis['idReserva'] = true;
consolColVis['localizador'] = false;
consolColVis['fechaAlta'] = false;
consolColVis['edificio'] = false;
consolColVis['atendidoPor'] = false;
consolColVis['origenMarketing'] = false;
consolColVis['tipoReserva'] = false;
consolColVis['observacion'] = false;
let consolSortF = 'idx', consolSortD = 'asc';
// Apply initial col visibility
setTimeout(updateConsolColStyles, 0);
setTimeout(updateColStyles, 0);

function isConsolColVis(key) { return consolColVis[key] !== false; }
function toggleConsolColVis(key) {
  const col = CONSOL_COLUMNS.find(c => c.key === key);
  if (col && col.locked) return;
  consolColVis[key] = !consolColVis[key];
  updateConsolColStyles();
}
function updateConsolColStyles() {
  let css = '';
  CONSOL_COLUMNS.forEach(c => {
    if (!isConsolColVis(c.key)) css += '.cc-' + c.key + ' { display: none !important; }\n';
  });
  document.getElementById('consol-col-visibility-style').textContent = css;
}
function renderConsolColToggle() {
  const dd = document.getElementById('consol-col-toggle-dd');
  if (!dd) return;
  dd.innerHTML = CONSOL_COLUMNS.filter(c => c.label).map(c => {
    const checked = isConsolColVis(c.key) ? 'checked' : '';
    const locked = c.locked ? 'locked' : '';
    const dis = c.locked ? 'disabled' : '';
    return '<label class="col-toggle-item ' + locked + '"><input type="checkbox" ' + checked + ' ' + dis +
      ' onchange="toggleConsolColVis(\'' + c.key + '\')"> ' + c.label + '</label>';
  }).join('');
}
function toggleConsolColDropdown() {
  const dd = document.getElementById('consol-col-toggle-dd');
  const isOpen = dd.classList.contains('open');
  dd.classList.toggle('open');
  if (!isOpen) renderConsolColToggle();
}
function consolSortByColumn(f) {
  if (consolSortF === f) { consolSortD = consolSortD === 'asc' ? 'desc' : 'asc'; }
  else { consolSortF = f; consolSortD = 'asc'; }
  if (currentConsolAloj) viewConsolDetail(currentConsolAloj);
}
// Shared sort value extraction - used by both main table and consolidated view
function _extractSortValue(r, c, f) {
  switch(f) {
    case "estado": return validated.has(r.idx)?1:0;
    case "idReserva": return r.id.toLowerCase();
    case "localizador": return r.localizador.toLowerCase();
    case "fechaAlta": return r._dateAltaNum;
    case "cliente": return r._clienteLc;
    case "alojamiento": return r._alojLc;
    case "edificio": return (r.edificio||"").toLowerCase();
    case "plataforma": return r._platLc;
    case "atendidoPor": return (r.atendidoPor||"").toLowerCase();
    case "origenMarketing": return (r.origenMarketing||"").toLowerCase();
    case "tipoReserva": return (r.tipoReserva||"").toLowerCase();
    case "fechaEntrada": return r._dateNum;
    case "fechaSalida": return r._dSalida ? r._dSalida.getTime() : 0;
    case "noches": return r._nights;
    case "totalReserva": return r.totalReserva;
    case "baseSinIVA": return c.baseSinIVA;
    case "subtotal": return c.sub;
    case "totalLiquidar": return c.totalLiq;
    case "observacion": return (r.observacion||"").toLowerCase();
    case "acciones": return validated.has(r.idx)?1:0;
    default: return r.idx;
  }
}
function consolGetSortValue(x, f) {
  return _extractSortValue(x.r, x.c, f);
}
function getSortValue(r, f) {
  return _extractSortValue(r, getLiq(r), f);
}
function sortByColumn(f) {
  const sortInput = document.querySelector('#combo-sort .combo-input');
  const sortWrap = document.getElementById('combo-sort');
  const dirInput = document.querySelector('#combo-sortdir .combo-input');
  const dirWrap = document.getElementById('combo-sortdir');
  if(simpleComboState.sort.value===f) {
    const nv = simpleComboState.sortdir.value==="asc"?"desc":"asc";
    simpleComboState.sortdir.value = nv;
    if (nv==='asc') { dirInput.value=''; dirInput.placeholder='\u2191'; dirWrap.classList.remove('has-value'); }
    else { dirInput.value='\u2193'; dirWrap.classList.add('has-value'); }
  } else {
    simpleComboState.sort.value = f;
    const opt = simpleComboOptions.sort.find(o=>o.value===f);
    if (f==='idx') { sortInput.value=''; sortInput.placeholder=t('sort.originalOrder'); sortWrap.classList.remove('has-value'); }
    else { sortInput.value=opt?opt.label:f; sortWrap.classList.add('has-value'); }
    simpleComboState.sortdir.value = 'asc';
    dirInput.value=''; dirInput.placeholder='\u2191'; dirWrap.classList.remove('has-value');
  }
  _currentPage = 1;
  renderTable();
}

// Global stats cache (recomputed only when needed)
let _globalStatsCache = null;
function getGlobalStats() {
  if (_globalStatsCache) return _globalStatsCache;
  let tR = 0, tL = 0;
  for (let i = 0; i < allReservas.length; i++) {
    const r = allReservas[i];
    tR += r.totalReserva;
    tL += getLiq(r).totalLiq;
  }
  _globalStatsCache = { tR, tL };
  return _globalStatsCache;
}
function invalidateGlobalStats() { _globalStatsCache = null; }

/**
 * @description Renderiza la tabla principal de preliquidaciÃƒÆ’Ã‚Â³n.
 * Delega en _renderFull() que aplica filtros, ordenaciÃƒÆ’Ã‚Â³n, paginaciÃƒÆ’Ã‚Â³n y stats.
 * Es el punto de entrada pÃƒÆ’Ã‚Âºblico ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â las funciones internas son _renderFull() y _renderPageOnly().
 */
function renderTable() { _renderFull(); }

/**
 * @description Genera el HTML completo de una fila de la tabla de preliquidaciÃƒÆ’Ã‚Â³n.
 * Incluye todas las celdas, selects, botones CE/CE2 y acciones.
 * @param {Object} r - Objeto reserva
 * @returns {string} HTML de la fila <tr> + paneles CE/CE2
 * @private
 */
function _buildRowHtml(r) {
  const s = settings[r.idx] || {}, c = getLiq(r), isV = validated.has(r.idx), isB = r._isBooking, dis = isV ? "disabled" : "";
  const pO = selectWithValue(_selectCache['plat_' + r.plataforma] || '<option>10%</option>', s.comPlataforma);
  const gO = selectWithValue(_selectCache.gtc, s.comGTC);
  const cO = selectCleanWithValue(_selectCache.clean, s.limpieza);
  const aO = selectCleanWithValue(_selectCache.amenities, s.amenities);
  const iO = selectWithValue(_selectCache.irpf, s.irpf);
  const psO = selectWithValue(isB ? _selectCache.pasBooking : _selectCache.pasStripe, s.pasarelaRate);
  return `<tr ${isV ? 'class="validated"' : (c.ceTotal > 0 ? 'class="ce-highlighted"' : (c.ceSinIvaTotal > 0 ? 'class="ce2-highlighted"' : ''))} id="row-${r.idx}">
    <td class="col-estado">${isV ? '<span class="badge badge-green">&#10003; ' + t('status.validated') + '</span>' : '<span class="badge badge-amber">' + t('status.pending') + '</span>'}</td>
    <td class="col-idReserva muted" style="font-size:12px;">${_cpv(r.id)}</td>
    <td class="col-localizador muted" style="font-size:11px;white-space:nowrap;">${_cpv(r.localizador)}</td>
    <td class="col-fechaAlta muted" style="font-size:12px;">${r._fmtAlta}</td>
    <td class="col-cliente bold ellip">${esc(r.cliente)}</td>
    <td class="col-alojamiento ellip muted">${esc(r.alojamiento)}</td>
    <td class="col-edificio ellip muted" style="font-size:12px;">${esc(r.edificio)}</td>
    <td class="col-plataforma"><span class="badge ${isB ? 'badge-purple' : 'badge-blue'}">${r.plataforma}</span></td>
    <td class="col-atendidoPor ellip muted" style="font-size:12px;">${esc(r.atendidoPor)}</td>
    <td class="col-origenMarketing ellip muted" style="font-size:12px;">${esc(r.origenMarketing)}</td>
    <td class="col-tipoReserva muted" style="font-size:12px;">${esc(r.tipoReserva)}</td>
    <td class="col-fechaEntrada" style="font-size:12px;white-space:nowrap;">${r._fmtEntrada}</td>
    <td class="col-fechaSalida" style="font-size:12px;white-space:nowrap;">${r._fmtSalida}</td>
    <td class="col-noches" style="text-align:center">${r._nights}</td>
    <td class="col-totalReserva right bold">${fmt(r.totalReserva)} &#8364;</td>
    <td class="col-ce" style="text-align:center;vertical-align:middle;">${_buildCEButton(r.idx, c)}</td>
    <td class="col-baseSinIVA right" style="color:#6b7280;font-size:12px;">${fmt(c.baseSinIVA)} &#8364;</td>
    <td class="col-comPlataforma" style="text-align:center;vertical-align:middle;"><div style="display:flex;flex-direction:column;align-items:center;gap:3px;"><select class="sel" onchange="changeSetting(${r.idx},'comPlataforma',parseFloat(this.value))" ${dis}>${pO}</select>
      <span style="font-size:11px;color:#e53935;font-variant-numeric:tabular-nums;">&#8211; ${fmt(c.comPlat)} &#8364;</span></div></td>
    <td class="col-comGTC" style="text-align:center;vertical-align:middle;"><div style="display:flex;flex-direction:column;align-items:center;gap:3px;"><select class="sel" onchange="changeSetting(${r.idx},'comGTC',parseFloat(this.value))" ${dis}>${gO}</select>
      <span style="font-size:11px;color:#e53935;font-variant-numeric:tabular-nums;">&#8211; ${fmt(c.comGTC)} &#8364;</span></div></td>
    <td class="col-limpieza" style="text-align:center;vertical-align:middle;"><div style="display:flex;flex-direction:column;align-items:center;gap:3px;"><select class="sel" onchange="changeSetting(${r.idx},'limpieza',parseFloat(this.value))" ${dis}>${cO}</select>
      <span style="font-size:11px;color:#e53935;font-variant-numeric:tabular-nums;">&#8211; ${fmt(c.limp)} &#8364;</span></div></td>
    <td class="col-amenities" style="text-align:center;vertical-align:middle;"><div style="display:flex;flex-direction:column;align-items:center;gap:3px;"><select class="sel" onchange="changeSetting(${r.idx},'amenities',parseFloat(this.value))" ${dis}>${aO}</select>
      <span style="font-size:11px;color:#e53935;font-variant-numeric:tabular-nums;">&#8211; ${fmt(c.amen)} &#8364;</span></div></td>
    <td class="col-pasarela" style="text-align:center;vertical-align:middle;"><div style="display:flex;flex-direction:column;align-items:center;gap:3px;"><div style="display:flex;align-items:center;justify-content:center;gap:6px;">
      <div class="toggle" onclick="if(!${isV}){togglePasarela(${r.idx})}"><div class="toggle-track ${s.pasarela ? 'on' : ''}"><div class="toggle-thumb"></div></div></div>
      ${s.pasarela ? `<select class="sel" style="width:70px;font-size:11px;padding:4px 6px;" onchange="changeSetting(${r.idx},'pasarelaRate',parseFloat(this.value))" ${dis}>${psO}</select>` : `<span class="toggle-label">${isB ? 'Booking' : 'Stripe'}</span>`}
    </div>${s.pasarela && c.comPas > 0 ? `<span style="font-size:11px;color:#e53935;font-variant-numeric:tabular-nums;">&#8211; ${fmt(c.comPas)} &#8364;</span>` : ''}</div></td>
    <td class="col-ceSinIva" style="text-align:center;vertical-align:middle;">${_buildCE2Button(r.idx, c)}</td>
    <td class="col-subtotal right bold" style="font-size:12px;">${fmt(c.sub)} &#8364;</td>
    <td class="col-irpf" style="text-align:center;vertical-align:middle;"><div style="display:flex;flex-direction:column;align-items:center;gap:3px;"><select class="sel" onchange="changeSetting(${r.idx},'irpf',parseFloat(this.value))" ${dis}>${iO}</select>
      <span style="font-size:11px;color:#e53935;font-variant-numeric:tabular-nums;">&#8211; ${fmt(c.ret)} &#8364;</span></div></td>
    <td class="col-iva21" style="text-align:center;vertical-align:middle;"><span style="font-size:11px;color:#43a047;font-variant-numeric:tabular-nums;">+ ${fmt(c.iva)} &#8364;</span></td>
    <td class="col-totalLiquidar right bold" style="color:${c.totalLiq >= 0 ? '#1a2744' : '#e53935'}">${_cpvRaw(fmt(c.totalLiq), fmt(c.totalLiq) + ' &#8364;')}</td>
    <td class="col-observacion ellip muted" style="font-size:11px;max-width:180px;overflow:hidden;text-overflow:ellipsis;" title="${esc(r.observacion)}">${esc(r.observacion)}</td>
    <td class="col-acciones"><div style="display:flex;gap:6px;">
      <button class="btn btn-sm btn-primary" onclick="viewDetail(${r.idx})">&#128065;</button>
      ${!isV ? `<button class="btn btn-sm btn-orange" onclick="toggleValidate(${r.idx})">&#10004;</button>` : `<button class="btn btn-sm btn-success" onclick="toggleValidate(${r.idx})">&#8617;</button>`}
    </div></td>
  </tr>` + _buildCEPanelRow(r.idx, s, c) + _buildCE2PanelRow(r.idx, s, c);
}

