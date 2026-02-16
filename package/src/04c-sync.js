// === MULTI-USER SYNC SYSTEM ===
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

// ==============================================================================================================================
//  [M08] DATA_MODEL ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â Estado de la aplicaci\u00f3n y opciones globales
// ==============================================================================================================================

/**
 * @description Opciones de configuraci\u00f3n editables por el usuario.
 * Cada array contiene los valores disponibles para los <select> de la UI.
 * Se persisten en la pesta\u00f1a "Configuracion" del Google Sheet.
 *
 * platformOptions     ->  comisiones por plataforma (% sobre total con IVA)
 * pasarelaStripeOptions/pasarelaBookingOptions  ->  tasa pasarela de pago (%)
 * cleaningOptions     ->  importes fijos de limpieza (ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬)
 * irpfOptions         ->  tasas de retenci\u00f3n IRPF (%)
 * gtcOptions          ->  tasas de gesti\u00f3n GTC (%)
 * amenitiesOptions    ->  importes fijos de amenities (ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬)
 * maintenanceOptions  ->  importes fijos de mantenimiento mensual (ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬)
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
 * @description Tasa de retenci\u00f3n GTC para propiedades con m\u00ednimo garantizado.
 * GTC retiene 20% del subtotal de reservas, el propietario recibe el 80%.
 * @const {number}
 */
const GTC_SPLIT_RATE = 0.20; // GTC retains 20%, owner gets 80%
