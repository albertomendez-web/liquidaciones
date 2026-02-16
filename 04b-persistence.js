// === CONFIG PERSISTENCE: "Configuracion" tab in Google Sheets ===
//  [M06-PERSIST] CONFIG PERSISTENCE ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â Pesta\u00f1a "Configuracion" en Google Sheets
// ==============================================================================================================================

// === CONFIG PERSISTENCE: "Configuracion" tab in Google Sheets ===
const CONFIG_TAB_NAME = CONFIG.CONFIG_TAB_NAME;
const PROPIETARIOS_TAB_NAME = CONFIG.PROPIETARIOS_TAB_NAME;
let _propietariosMap = {}; // alojamiento code (normalized) -> propietario name
let _propietariosEmailMap = {}; // alojamiento code (normalized) -> propietario email
let _propietariosKeys = []; // sorted by length desc for best match
let _propietariosRowMap = {}; // alojamiento code (normalized) -> sheet row number (1-based)
let _propietariosSheetId = null;

// ==============================================================================================================================
//  [M07] PROPIETARIOS ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â Mapeo alojamiento -> propietario y edici\u00f3n inline
// ==============================================================================================================================

/**
 * @description Busca el propietario de un alojamiento.
 * Primero intenta match exacto, luego match parcial (substring).
 * @param {string} alojamiento - Nombre/c\u00f3digo del alojamiento
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
 * @param {string} alojamiento - Nombre/c\u00f3digo del alojamiento
 * @returns {string} Email del propietario o cadena vac\u00eda
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
 * @param {string} alojamiento - Nombre/c\u00f3digo del alojamiento
 * @param {string} email - Email del propietario
 * @returns {Promise<boolean>} true si se guard\u00f3 correctamente
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
      if (!ok) { showToast('Error al guardar. \u00bfEst\u00e1s conectado a Google Sheets?', 'error'); }
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
 * @description Programa el guardado de configuraci\u00f3n global con debounce de 1500ms.
 * Cada llamada reinicia el timer. Solo se ejecuta si hay conexi\u00f3n a Google Sheets.
 */
function scheduleGlobalConfigSave() {
  if (!_sheetSource || !_googleToken) return;
  if (_globalConfigSaveTimer) clearTimeout(_globalConfigSaveTimer);
  _globalConfigSaveTimer = setTimeout(saveGlobalConfigToSheet, 1500);
}

/**
 * @description Programa el guardado de configuraci\u00f3n de una reserva con debounce.
 * Acumula m\u00faltiples cambios y los guarda en batch tras 1000ms de inactividad.
 * @param {number} idx - ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Ândice de la reserva modificada
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
  // Invoicing config
  var invRows = buildInvoicingConfigRows();
  for (var ir = 0; ir < invRows.length; ir++) rows.push(invRows[ir]);
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
 * @description Carga o crea la pesta\u00f1a "Configuracion" del Google Sheet.
 * Esta pesta\u00f1a almacena todas las opciones globales y ajustes por reserva.
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
      } else {
        // Delegate to invoicing parser
        if (typeof parseInvoicingConfig === 'function') parseInvoicingConfig(key, val);
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
      validated = new Set(); // reset Ã¢â‚¬â€ config is authoritative
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
 * @description Guarda toda la configuraci\u00f3n en la pesta\u00f1a "Configuracion".
 * Usa patr\u00f3n write-first: escribe datos nuevos ANTES de limpiar obsoletos.
 * Esto garantiza que si la limpieza falla, los datos ya est\u00e1n salvados.
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
