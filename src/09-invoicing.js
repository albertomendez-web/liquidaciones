// ==============================================================================================================================
//  [M09] INVOICING \u2014 Facturaci\u00f3n: configuraci\u00f3n, generaci\u00f3n y Holded integration
// ==============================================================================================================================

// --- Invoice Companies ---
let _invoiceCompanies = [
  { id: 'gtc', name: 'Green Tropical Coast S.L.', cif: 'B88560065', address: 'Calle Mar\u00eda Moliner, 3 - C 19, Las Rozas De Madrid, 28232, Madrid' },
  { id: 'gee', name: 'Green Efficient Execution S.L.', cif: 'B02789048', address: 'Calle Mar\u00eda Moliner, 3 - C 19, Las Rozas De Madrid, 28232, Madrid' }
];

// --- Invoice config per alojamiento ---
// Key: normalized alojamiento code, Value: { enabled: bool, companyId: string }
let _invoiceConfig = {};

// --- Holded API key ---
let _holdedApiKey = '';

// --- Helpers ---
function getInvoiceConfig(alojamiento) {
  if (!alojamiento) return null;
  var key = alojamiento.trim().toLowerCase();
  return _invoiceConfig[key] || null;
}

function isInvoiceEnabled(alojamiento) {
  var cfg = getInvoiceConfig(alojamiento);
  return cfg ? cfg.enabled : false;
}

function getInvoiceCompany(alojamiento) {
  var cfg = getInvoiceConfig(alojamiento);
  if (!cfg || !cfg.companyId) return _invoiceCompanies[0] || null;
  return _invoiceCompanies.find(function(c) { return c.id === cfg.companyId; }) || _invoiceCompanies[0];
}

function getInvoiceCompanyById(id) {
  return _invoiceCompanies.find(function(c) { return c.id === id; }) || null;
}

// --- Invoice number: YYYY-MM ---
function getInvoiceNumber(periodStr) {
  // periodStr is like "Enero 2026" or "January 2026"
  var parts = periodStr.trim().split(/\s+/);
  if (parts.length < 2) return '';
  var year = parts[parts.length - 1];
  var monthName = parts.slice(0, parts.length - 1).join(' ');
  var monthIdx = -1;
  // Try Spanish months
  var esMonths = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  var enMonths = ['january','february','march','april','may','june','july','august','september','october','november','december'];
  var deMonths = ['januar','februar','m\u00e4rz','april','mai','juni','juli','august','september','oktober','november','dezember'];
  var lower = monthName.toLowerCase();
  monthIdx = esMonths.indexOf(lower);
  if (monthIdx < 0) monthIdx = enMonths.indexOf(lower);
  if (monthIdx < 0) monthIdx = deMonths.indexOf(lower);
  if (monthIdx < 0) return year + '-00';
  return year + '-' + String(monthIdx + 1).padStart(2, '0');
}

// --- Invoice date: last day of the period month ---
function getInvoiceDate(periodStr) {
  var parts = periodStr.trim().split(/\s+/);
  if (parts.length < 2) return '';
  var year = parseInt(parts[parts.length - 1]);
  var monthName = parts.slice(0, parts.length - 1).join(' ');
  var monthIdx = -1;
  var esMonths = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  var enMonths = ['january','february','march','april','may','june','july','august','september','october','november','december'];
  var deMonths = ['januar','februar','m\u00e4rz','april','mai','juni','juli','august','september','oktober','november','dezember'];
  var lower = monthName.toLowerCase();
  monthIdx = esMonths.indexOf(lower);
  if (monthIdx < 0) monthIdx = enMonths.indexOf(lower);
  if (monthIdx < 0) monthIdx = deMonths.indexOf(lower);
  if (monthIdx < 0 || isNaN(year)) return '';
  // Last day of month: day 0 of next month
  var lastDay = new Date(year, monthIdx + 1, 0);
  return String(lastDay.getDate()).padStart(2, '0') + '/' + String(monthIdx + 1).padStart(2, '0') + '/' + year;
}

// ==============================================================================================================================
//  CONFIG MODAL TAB: Facturaci\u00f3n
// ==============================================================================================================================

function renderInvoicingTab() {
  var html = '';

  // --- Top row: API + Companies side by side ---
  html += '<div class="inv-top-row">';

  // Left: Holded API
  html += '<div class="inv-top-card">';
  html += '<div class="inv-section-title">&#128273; ' + t('inv.holdedTitle') + '</div>';
  html += '<div class="inv-section-desc">' + t('inv.holdedDesc') + '</div>';
  html += '<div class="inv-api-row">';
  html += '<input type="password" id="inv-holded-key" class="inv-input" placeholder="' + t('inv.holdedPlaceholder') + '" value="' + esc(_holdedApiKey) + '" />';
  html += '<button class="inv-btn inv-btn-sm" onclick="toggleHoldedKeyVisibility()">&#128065;</button>';
  html += '<button class="inv-btn inv-btn-primary inv-btn-sm" onclick="saveHoldedKey()">' + t('inv.save') + '</button>';
  html += '</div>';
  if (_holdedApiKey) {
    html += '<div class="inv-api-status inv-api-ok">&#10003; ' + t('inv.apiConfigured') + '</div>';
  } else {
    html += '<div class="inv-api-status inv-api-pending">' + t('inv.apiPending') + '</div>';
  }
  html += '</div>';

  // Right: Companies
  html += '<div class="inv-top-card">';
  html += '<div class="inv-section-title">&#127970; ' + t('inv.companiesTitle') + '</div>';
  html += '<div class="inv-companies">';
  _invoiceCompanies.forEach(function(c, i) {
    html += '<div class="inv-company-card">';
    html += '<div class="inv-company-header">';
    html += '<span class="inv-company-badge">' + c.id.toUpperCase() + '</span>';
    html += '<span class="inv-company-name">' + esc(c.name) + '</span>';
    html += '<button class="inv-btn inv-btn-sm" onclick="editInvoiceCompany(' + i + ')" title="' + t('inv.edit') + '">&#9998;</button>';
    html += '</div>';
    html += '<div class="inv-company-detail"><span class="inv-label">' + t('inv.companyCif') + ':</span> ' + esc(c.cif) + '</div>';
    html += '</div>';
  });
  html += '</div>';
  html += '<button class="inv-btn inv-btn-outline" onclick="addInvoiceCompany()" style="margin-top:8px;">' + t('inv.addCompany') + '</button>';
  html += '</div>';

  html += '</div>'; // end inv-top-row

  // --- Alojamientos grid ---
  var alojs = [];
  if (typeof getAlojamientos === 'function') {
    var alojList = getAlojamientos();
    alojs = alojList.map(function(a) { return a.name; }).sort();
  }

  if (alojs.length === 0) {
    html += '<div style="padding:24px;text-align:center;color:#9ca3af;font-size:13px;">' + t('inv.noData') + '</div>';
  } else {
    var enabledCount = 0;
    alojs.forEach(function(name) {
      var key = name.trim().toLowerCase();
      var cfg = _invoiceConfig[key] || { enabled: false };
      if (cfg.enabled) enabledCount++;
    });

    // Header with search + counter
    html += '<div class="inv-aloj-header">';
    html += '<div class="inv-section-title" style="margin:0;">&#128196; ' + t('inv.alojTitle') + '</div>';
    html += '<input class="inv-search-input" id="inv-search" placeholder="&#128269; ' + t('inv.searchPlaceholder') + '" oninput="filterInvoiceAlojs(this.value)" />';
    html += '<div class="inv-counter"><span class="badge">' + enabledCount + '</span> ' + t('inv.of') + ' ' + alojs.length + ' ' + t('inv.activeCount') + '</div>';
    html += '</div>';

    // Grid
    html += '<div class="inv-aloj-grid" id="inv-aloj-grid">';
    alojs.forEach(function(name) {
      var key = name.trim().toLowerCase();
      var cfg = _invoiceConfig[key] || { enabled: false, companyId: _invoiceCompanies.length > 0 ? _invoiceCompanies[0].id : '' };
      var on = cfg.enabled;
      var prop = typeof getPropietario === 'function' ? getPropietario(name) : '';
      var safeName = name.replace(/'/g, "\\'");

      html += '<div class="inv-aloj-row' + (on ? ' inv-aloj-on' : '') + '" data-aloj="' + esc(name) + '" data-prop="' + esc(prop) + '">';
      html += '<div class="toggle" onclick="toggleInvoiceAloj(\'' + safeName + '\')">';
      html += '<div class="toggle-track' + (on ? ' on' : '') + '" style="' + (on ? 'background:#059669;' : '') + '">';
      html += '<div class="toggle-thumb"></div></div></div>';
      html += '<div class="inv-aloj-info">';
      html += '<div class="inv-aloj-name">' + esc(name) + '</div>';
      if (prop && prop !== t('consol.missingOwner')) {
        html += '<div class="inv-aloj-prop">' + esc(prop) + '</div>';
      }
      html += '</div>';
      if (on) {
        html += '<select class="inv-select" onchange="setInvoiceCompany(\'' + safeName + '\', this.value)">';
        _invoiceCompanies.forEach(function(co) {
          html += '<option value="' + co.id + '"' + (cfg.companyId === co.id ? ' selected' : '') + '>' + co.id.toUpperCase() + '</option>';
        });
        html += '</select>';
      }
      html += '</div>';
    });
    html += '</div>';
  }

  return html;
}

// --- Actions ---
function toggleHoldedKeyVisibility() {
  var inp = document.getElementById('inv-holded-key');
  if (!inp) return;
  inp.type = inp.type === 'password' ? 'text' : 'password';
}

function saveHoldedKey() {
  var inp = document.getElementById('inv-holded-key');
  if (!inp) return;
  _holdedApiKey = inp.value.trim();
  // Immediate save (not debounced) — critical credential
  if (typeof saveGlobalConfigToSheet === 'function') saveGlobalConfigToSheet();
  renderInvoicingConfigTab();
  showToast(_holdedApiKey ? t('inv.apiSaved') : t('inv.apiRemoved'), 'success');
}

function toggleInvoiceAloj(alojName) {
  var key = alojName.trim().toLowerCase();
  var cfg = _invoiceConfig[key];
  if (!cfg) {
    _invoiceConfig[key] = { enabled: true, companyId: _invoiceCompanies.length > 0 ? _invoiceCompanies[0].id : '' };
  } else {
    cfg.enabled = !cfg.enabled;
  }
  scheduleGlobalConfigSave();
  renderInvoicingConfigTab();
}

function setInvoiceCompany(alojName, companyId) {
  var key = alojName.trim().toLowerCase();
  if (!_invoiceConfig[key]) {
    _invoiceConfig[key] = { enabled: true, companyId: companyId };
  } else {
    _invoiceConfig[key].companyId = companyId;
  }
  scheduleGlobalConfigSave();
}

function filterInvoiceAlojs(query) {
  var grid = document.getElementById('inv-aloj-grid');
  if (!grid) return;
  var q = (query || '').toLowerCase();
  var rows = grid.querySelectorAll('.inv-aloj-row');
  rows.forEach(function(row) {
    var aloj = (row.getAttribute('data-aloj') || '').toLowerCase();
    var prop = (row.getAttribute('data-prop') || '').toLowerCase();
    row.style.display = (!q || aloj.indexOf(q) >= 0 || prop.indexOf(q) >= 0) ? '' : 'none';
  });
}

function renderInvoicingConfigTab() {
  var el = document.getElementById('tab-invoicing');
  if (el) el.innerHTML = renderInvoicingTab();
}

// --- Company CRUD ---
function editInvoiceCompany(idx) {
  var c = _invoiceCompanies[idx];
  if (!c) return;
  var newName = prompt(t('inv.companyName') + ':', c.name);
  if (newName === null) return;
  var newCif = prompt(t('inv.companyCif') + ':', c.cif);
  if (newCif === null) return;
  var newAddr = prompt(t('inv.companyAddr') + ':', c.address);
  if (newAddr === null) return;
  c.name = newName.trim();
  c.cif = newCif.trim();
  c.address = newAddr.trim();
  scheduleGlobalConfigSave();
  renderInvoicingConfigTab();
  showToast(t('inv.companyUpdated'), 'success');
}

function addInvoiceCompany() {
  var newName = prompt(t('inv.companyName') + ':');
  if (!newName) return;
  var newCif = prompt(t('inv.companyCif') + ':');
  if (!newCif) return;
  var newAddr = prompt(t('inv.companyAddr') + ':');
  if (newAddr === null) return;
  var id = newName.trim().split(/\s+/).map(function(w) { return w[0]; }).join('').toLowerCase();
  // Ensure unique id
  var base = id;
  var n = 1;
  while (_invoiceCompanies.some(function(c) { return c.id === id; })) { id = base + n; n++; }
  _invoiceCompanies.push({ id: id, name: newName.trim(), cif: newCif.trim(), address: (newAddr || '').trim() });
  scheduleGlobalConfigSave();
  renderInvoicingConfigTab();
  showToast(t('inv.companyAdded'), 'success');
}

// ==============================================================================================================================
//  PERSISTENCE: build/parse config rows for invoicing
// ==============================================================================================================================

function buildInvoicingConfigRows() {
  var rows = [];
  // Companies
  rows.push(['inv_companies', JSON.stringify(_invoiceCompanies)]);
  // Per-alojamiento invoice config
  Object.keys(_invoiceConfig).forEach(function(key) {
    var cfg = _invoiceConfig[key];
    if (cfg.enabled) {
      rows.push(['inv:' + key, cfg.companyId || '']);
    }
  });
  // Holded API key
  if (_holdedApiKey) {
    rows.push(['holded_api_key', _holdedApiKey]);
  }
  return rows;
}

function parseInvoicingConfig(key, val) {
  if (key === 'inv_companies') {
    try {
      var parsed = JSON.parse(val);
      if (Array.isArray(parsed) && parsed.length > 0) _invoiceCompanies = parsed;
    } catch(e) { console.warn('[Invoicing] Error parsing companies:', e); }
    return true;
  }
  if (key === 'holded_api_key') {
    _holdedApiKey = val;
    return true;
  }
  if (key.startsWith('inv:')) {
    var alojKey = key.substring(4);
    _invoiceConfig[alojKey] = { enabled: true, companyId: val || (_invoiceCompanies[0] ? _invoiceCompanies[0].id : '') };
    return true;
  }
  return false;
}
