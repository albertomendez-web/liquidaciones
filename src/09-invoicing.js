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

  // --- Section 1: Holded API Key ---
  html += '<div class="inv-section">';
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

  // --- Section 2: Empresas receptoras ---
  html += '<hr class="section-divider">';
  html += '<div class="inv-section">';
  html += '<div class="inv-section-title">&#127970; ' + t('inv.companiesTitle') + '</div>';
  html += '<div class="inv-section-desc">' + t('inv.companiesDesc') + '</div>';
  html += '<div class="inv-companies">';
  _invoiceCompanies.forEach(function(c, i) {
    html += '<div class="inv-company-card">';
    html += '<div class="inv-company-header">';
    html += '<span class="inv-company-badge">' + c.id.toUpperCase() + '</span>';
    html += '<span class="inv-company-name">' + esc(c.name) + '</span>';
    html += '<button class="inv-btn inv-btn-sm" onclick="editInvoiceCompany(' + i + ')" title="' + t('inv.edit') + '">&#9998;</button>';
    html += '</div>';
    html += '<div class="inv-company-detail"><span class="inv-label">' + t('inv.companyCif') + ':</span> ' + esc(c.cif) + '</div>';
    html += '<div class="inv-company-detail"><span class="inv-label">' + t('inv.address') + ':</span> ' + esc(c.address) + '</div>';
    html += '</div>';
  });
  html += '</div>';
  html += '<button class="inv-btn inv-btn-outline" onclick="addInvoiceCompany()" style="margin-top:8px;">' + t('inv.addCompany') + '</button>';
  html += '</div>';

  // --- Section 3: Toggle por alojamiento ---
  html += '<hr class="section-divider">';
  html += '<div class="inv-section">';
  html += '<div class="inv-section-title">&#128196; ' + t('inv.alojTitle') + '</div>';
  html += '<div class="inv-section-desc">' + t('inv.alojDesc') + '</div>';

  // Get all known alojamientos from data
  var alojs = [];
  if (typeof getAlojamientos === 'function') {
    var alojList = getAlojamientos();
    alojs = alojList.map(function(a) { return a.name; }).sort();
  }

  if (alojs.length === 0) {
    html += '<div style="padding:16px;text-align:center;color:#9ca3af;font-size:13px;">' + t('inv.noData') + '</div>';
  } else {
    var enabledCount = 0;
    html += '<div class="inv-aloj-list">';
    alojs.forEach(function(name) {
      var key = name.trim().toLowerCase();
      var cfg = _invoiceConfig[key] || { enabled: false, companyId: _invoiceCompanies.length > 0 ? _invoiceCompanies[0].id : '' };
      var on = cfg.enabled;
      if (on) enabledCount++;
      var prop = typeof getPropietario === 'function' ? getPropietario(name) : '';

      html += '<div class="inv-aloj-row' + (on ? ' inv-aloj-on' : '') + '">';
      // Toggle
      html += '<div class="toggle" onclick="toggleInvoiceAloj(\'' + name.replace(/'/g, "\\'") + '\')">';
      html += '<div class="toggle-track' + (on ? ' on' : '') + '" style="' + (on ? 'background:#059669;' : '') + '">';
      html += '<div class="toggle-thumb"></div></div></div>';
      // Info
      html += '<div class="inv-aloj-info">';
      html += '<div class="inv-aloj-name">' + esc(name) + '</div>';
      if (prop && prop !== t('consol.missingOwner')) {
        html += '<div class="inv-aloj-prop">' + esc(prop) + '</div>';
      }
      html += '</div>';
      // Company selector (only visible when enabled)
      if (on) {
        html += '<select class="inv-select" onchange="setInvoiceCompany(\'' + name.replace(/'/g, "\\'") + '\', this.value)">';
        _invoiceCompanies.forEach(function(c) {
          html += '<option value="' + c.id + '"' + (cfg.companyId === c.id ? ' selected' : '') + '>' + c.id.toUpperCase() + ' - ' + esc(c.name) + '</option>';
        });
        html += '</select>';
      }
      html += '</div>';
    });
    html += '</div>';
    html += '<div class="inv-counter"><span class="badge">' + enabledCount + '</span> de ' + alojs.length + ' con facturaci\u00f3n activa</div>';
  }
  html += '</div>';

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
  scheduleGlobalConfigSave();
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
