// === CONFIGURACIÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œN GOOGLE ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â Credenciales OAuth ===
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
  if (!_tokenClient) { showToast('Google API no inicializada. Recarga la p\u00e1gina.', 'error'); return; }
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
  if (!id) { showToast('La URL por defecto no es v\u00e1lida.', 'error'); return; }
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
  if (!url) { showToast('Introduce una URL v\u00e1lida.', 'warning'); return; }
  let id = extractSheetId(url);
  if (!id) { showToast('URL no v\u00e1lida. Debe ser Google Sheets.', 'error'); return; }
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
  if (!url) { showToast('Introduce una URL v\u00e1lida.', 'warning'); return; }
  let id = extractSheetId(url);
  if (!id) { showToast('URL no v\u00e1lida. Debe ser Google Sheets.', 'error'); return; }
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
  if (!_pickerInited || !_googleToken) { showToast('Inicia sesi\u00f3n con Google primero.', 'warning'); return; }
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
  if (!id) { showToast('URL no v\u00e1lida. Debe ser Google Sheets.', 'error'); return; }
  loadSheetById(id, 'Google Sheet');
}
function extractSheetId(url) {
  const m = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (m) return m[1];
  if (/^[a-zA-Z0-9_-]{20,}$/.test(url)) return url;
  return null;
}

// ==============================================================================================================================
//  [M06] GOOGLE_SHEETS ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â Carga de datos, write-back y persistencia
// ==============================================================================================================================

// === LOAD SHEET DATA ===
async function loadSheetById(sheetId, sheetName) {
  if (!_googleToken) { showToast('Inicia sesi\u00f3n con Google primero.', 'warning'); return; }
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
 * @description Carga los datos de una hoja espec\u00edfica del Google Sheet.
 * Es la funci\u00f3n principal del flujo de carga desde Google Sheets.
 * Tras cargar los datos, configura write-back, config y propietarios.
 * @param {string} sheetId - ID del spreadsheet de Google
 * @param {string} sheetTab - Nombre de la pesta\u00f1a a leer
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
    if (!rows || rows.length < 2) { hideGSheetLoading(); showToast('La hoja est\u00e1 vac\u00eda o no tiene datos suficientes.', 'warning'); return; }
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

// Ã¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€Â
//  [M06b-SYNC] MULTI-USER SYNC Ã¢â‚¬â€ Polling Configuracion tab for remote changes
// Ã¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€Â
