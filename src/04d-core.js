// === CORE: Business Logic, Calculations, Data Processing ===
let _gtcSplitAlojamientos = ['MA-2-P2-1A','MA-2-P3-1C','MA-2-P3-1D','MA-2-P3-1E','MA-2-P4-1C','MG-2-0D'];
let _gtcOwnedAlojamientos = [
  'MA-2-P1-4C','MA-2-P1-1C','MA-2-P2-1A','MA-2-P3-1B','MA-2-P3-1C','MA-2-P3-1D','MA-2-P3-1E',
  'MA-2-P4-1A','MA-2-P4-1B','MA-2-P4-1C','MG-2-0D','MG-2-0F','MG-2-0I','MG-2-1F',
  'MG-2-1K','MG-2-1M','MG-2-1N','MG-2-2N','MG-2-3L','MG-3-0C'
];
/**
 * @description Comprueba si un alojamiento tiene reparto 80/20 GTC.
 * @param {string} alojName - Nombre del alojamiento
 * @returns {boolean} true si tiene condici\u00f3n especial de m\u00ednimo garantizado
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
 * null cuando se carg\u00f3 desde fichero local. Contiene:
 *   .id           - ID del spreadsheet
 *   .tab          - Nombre de la pesta\u00f1a de datos
 *   .valColIdx    - ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Ândice de la columna "Validada"
 *   .valColLetter - Letra de la columna (ej: "Q")
 *   .headerRow    - ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Ândice de la fila de cabecera
 * @type {Object|null}
 */
let _sheetSource = null; // null when loaded from file
let _syncQueue = []; // pending write operations
let _syncActive = false; // true while a write is in flight
// Performance: liquidation cache + pagination + render debouncing
let _pageSize = CONFIG.DEFAULT_PAGE_SIZE;
let _liqCache = {}, _currentPage = 1, _fmtCache = {};
/**
 * @description Invalida la cach\u00e9 de c\u00e1lculos.
 * @param {number} [idx] - Si se pasa, invalida solo esa reserva. Sin param = invalida todo.
 */
function invalidateCache(idx) { if (idx !== undefined) { delete _liqCache[idx]; } else { _liqCache = {}; invalidateGlobalStats(); invalidateFilterCache(); } }
/**
 * @description Obtiene los c\u00e1lculos de liquidaci\u00f3n de una reserva (con cach\u00e9).
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
 * @description Obtiene las reservas filtradas y ordenadas seg\u00fan los filtros activos.
 * Usa cach\u00e9: solo recalcula si los filtros han cambiado.
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
 * @description Parsea un valor a n\u00famero, manejando formatos espa\u00f1oles (1.234,56).
 * IMPORTANTE: Si v ya es number nativo (de Google Sheets API), lo devuelve directo.
 * @param {*} v - Valor a parsear (number, string, null)
 * @returns {number} Valor num\u00e9rico (0 si no parseable)
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
 * @description Calcula la liquidaci\u00f3n completa de una reserva.
 * Este es el CORAZÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œN del sistema de c\u00e1lculo financiero.
 *
 * @param {Object} r - Objeto reserva de allReservas[]
 * @param {Object} s - Settings de la reserva (settings[r.idx])
 * @returns {Object} Objeto con todos los importes calculados:
 *   .totalOriginal - Importe original de la reserva
 *   .ceTotal       - Total de conceptos extraordinarios con IVA
 *   .total         - totalOriginal - ceTotal
 *   .baseSinIVA    - Base imponible sin IVA tur\u00edstico (10%)
 *   .comRate       - Tasa de comisi\u00f3n de plataforma aplicada
 *   .comPlat       - Importe comisi\u00f3n plataforma
 *   .gtcRate       - Tasa de gesti\u00f3n GTC aplicada
 *   .comGTC        - Importe comisi\u00f3n GTC
 *   .comPas        - Importe comisi\u00f3n pasarela (0 si desactivada)
 *   .limp          - Importe limpieza
 *   .amen          - Importe amenities
 *   .ceSinIvaTotal - Total conceptos extraordinarios sin IVA
 *   .sub           - Subtotal (base - todas las deducciones)
 *   .iva           - IVA 21% sobre subtotal
 *   .irpfRate      - Tasa IRPF aplicada
 *   .ret           - Retenci\u00f3n IRPF
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
 * Esta funci\u00f3n es el PUNTO DE ENTRADA de datos en la aplicaci\u00f3n.
 * Llena allReservas[], settings{}, validated Set, y construye los combos de filtro.
 *
 * @param {Array[]} json - Array de arrays (filas del Sheet). Primera fila \u00fatil = cabecera.
 * @returns {boolean} true si se procesaron datos correctamente
 *
 * @sideeffects Modifica: allReservas, settings, validated, platformOptions,
 *              comboState, _mpAvailable, caches
 */
function processRows(json) {
  if (!json || !Array.isArray(json) || json.length < 2) {
    showToast("El archivo no contiene datos v\u00e1lidos.", "error");
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
