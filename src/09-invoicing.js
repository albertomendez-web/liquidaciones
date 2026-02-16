// ==============================================================================================================================
//  [M09] INVOICING — Facturación: configuración, generación y Holded integration
// ==============================================================================================================================

// --- Invoice Companies ---
let _invoiceCompanies = [
  { id: 'gtc', name: 'Green Tropical Coast S.L.', cif: 'B88560065', address: 'Calle María Moliner, 3 - C 19, Las Rozas De Madrid, 28232, Madrid' },
  { id: 'gee', name: 'Green Efficient Execution S.L.', cif: 'B02789048', address: 'Calle María Moliner, 3 - C 19, Las Rozas De Madrid, 28232, Madrid' }
];

// --- Invoice config per alojamiento ---
// Key: normalized alojamiento code, Value: { enabled: bool, companyId: string }
let _invoiceConfig = {};

// --- Holded API key ---
let _holdedApiKey = '';

// --- Holded Contacts Cache ---
let _holdedContacts = [];    // Full array from Holded API
let _holdedMapping = {};     // alojKey → { contactId, name, vatnumber, email, address, city, postalCode, province, country, phone }
let _holdedSyncStatus = { lastSync: null, contactCount: 0, matchedCount: 0, error: '' };
let _holdedSyncing = false;

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

/**
 * @description Devuelve datos fiscales del propietario de un alojamiento desde Holded.
 * Usado por F3 (generación de factura) y F5 (push a Holded).
 * @param {string} alojName - Nombre del alojamiento
 * @returns {object|null} { contactId, name, vatnumber, email, address, city, postalCode, province, country, phone }
 */
function getHoldedFiscalData(alojName) {
  if (!alojName) return null;
  var key = alojName.trim().toLowerCase();
  var data = _holdedMapping[key];
  if (!data) return null;
  // Sanitize: address may be persisted as object from Holded API
  if (data.address && typeof data.address === 'object') {
    var addrObj = data.address;
    data.city = String(addrObj.city || data.city || '');
    data.postalCode = String(addrObj.postalCode || data.postalCode || '');
    data.province = String(addrObj.province || data.province || '');
    data.country = String(addrObj.country || data.country || '');
    data.address = String(addrObj.address || '');
  }
  // Strip property code prefix: "[MA-2-P6-0C] Name" → "Name"
  if (data.name) data.name = String(data.name).replace(/^\[.*?\]\s*/, '');
  return data;
}

// --- Invoice number: YYYY-MM ---
function getInvoiceNumber(periodStr) {
  var parts = periodStr.trim().split(/\s+/);
  if (parts.length < 2) return '';
  var year = parts[parts.length - 1];
  var monthName = parts.slice(0, parts.length - 1).join(' ');
  var monthIdx = -1;
  var esMonths = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  var enMonths = ['january','february','march','april','may','june','july','august','september','october','november','december'];
  var deMonths = ['januar','februar','märz','april','mai','juni','juli','august','september','oktober','november','dezember'];
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
  var deMonths = ['januar','februar','märz','april','mai','juni','juli','august','september','oktober','november','dezember'];
  var lower = monthName.toLowerCase();
  monthIdx = esMonths.indexOf(lower);
  if (monthIdx < 0) monthIdx = enMonths.indexOf(lower);
  if (monthIdx < 0) monthIdx = deMonths.indexOf(lower);
  if (monthIdx < 0 || isNaN(year)) return '';
  var lastDay = new Date(year, monthIdx + 1, 0);
  return String(lastDay.getDate()).padStart(2, '0') + '/' + String(monthIdx + 1).padStart(2, '0') + '/' + year;
}

// ==============================================================================================================================
//  CONFIG TAB: Facturación
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

  // --- Holded Sync Section ---
  html += renderHoldedSyncSection();

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
      var fiscal = _holdedMapping[key];

      html += '<div class="inv-aloj-row' + (on ? ' inv-aloj-on' : '') + '" data-aloj="' + esc(name) + '" data-prop="' + esc(prop) + '">';
      html += '<div class="toggle" onclick="toggleInvoiceAloj(\'' + safeName + '\')">';
      html += '<div class="toggle-track' + (on ? ' on' : '') + '" style="' + (on ? 'background:#059669;' : '') + '">';
      html += '<div class="toggle-thumb"></div></div></div>';
      html += '<div class="inv-aloj-info">';
      html += '<div class="inv-aloj-name">' + esc(name) + '</div>';
      if (prop && prop !== t('consol.missingOwner')) {
        html += '<div class="inv-aloj-prop">' + esc(prop);
        // Holded match indicator
        if (fiscal) {
          html += ' <span class="inv-holded-badge" title="' + esc(fiscal.vatnumber || '') + '">&#10003; Holded</span>';
        } else if (_holdedContacts.length > 0) {
          html += ' <span class="inv-holded-badge inv-holded-miss" title="' + t('inv.syncNoMatch') + '">&#10007; Holded</span>';
        }
        html += '</div>';
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

// ==============================================================================================================================
//  HOLDED SYNC SECTION
// ==============================================================================================================================

function renderHoldedSyncSection() {
  var html = '<div class="inv-top-card inv-sync-card">';
  html += '<div class="inv-section-title">&#128260; ' + t('inv.syncTitle') + '</div>';
  html += '<div class="inv-section-desc">' + t('inv.syncDesc') + '</div>';

  if (!_holdedApiKey) {
    html += '<div class="inv-sync-empty">' + t('inv.syncNeedKey') + '</div>';
    html += '</div>';
    return html;
  }

  // Sync button + status row
  html += '<div class="inv-sync-row">';
  if (_holdedSyncing) {
    html += '<button class="inv-btn inv-btn-primary" disabled><span class="inv-spin">&#9203;</span> ' + t('inv.syncing') + '</button>';
  } else {
    html += '<button class="inv-btn inv-btn-primary" onclick="syncHoldedContacts()">&#128260; ' + t('inv.syncNow') + '</button>';
  }
  if (_holdedSyncStatus.lastSync) {
    var d = new Date(_holdedSyncStatus.lastSync);
    var timeStr = d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    html += '<span class="inv-sync-time">' + t('inv.syncLast') + ': ' + timeStr + '</span>';
  }
  html += '</div>';

  // Error
  if (_holdedSyncStatus.error) {
    html += '<div class="inv-sync-error">&#9888; ' + esc(_holdedSyncStatus.error) + '</div>';
  }

  // Stats — show when contacts loaded OR mappings exist from persistence
  var matchedCount = Object.keys(_holdedMapping).length;
  if (_holdedContacts.length > 0 || matchedCount > 0 || _holdedSyncStatus.contactCount > 0) {
    var totalAlojs = 0;
    if (typeof getAlojamientos === 'function') totalAlojs = getAlojamientos().length;

    var contactDisplayCount = _holdedContacts.length || _holdedSyncStatus.contactCount || 0;
    html += '<div class="inv-sync-stats">';
    html += '<div class="inv-sync-stat"><span class="inv-sync-num">' + contactDisplayCount + '</span>' + t('inv.syncContacts') + '</div>';
    html += '<div class="inv-sync-stat"><span class="inv-sync-num inv-sync-ok">' + matchedCount + '</span>' + t('inv.syncMatched') + '</div>';
    if (totalAlojs > matchedCount) {
      html += '<div class="inv-sync-stat"><span class="inv-sync-num inv-sync-warn">' + (totalAlojs - matchedCount) + '</span>' + t('inv.syncUnmatched') + '</div>';
    }
    html += '</div>';

    // Mapping table
    var alojs = [];
    if (typeof getAlojamientos === 'function') {
      alojs = getAlojamientos().map(function(a) { return a.name; }).sort();
    }
    if (alojs.length > 0) {
      html += '<div class="inv-sync-map-header">';
      html += '<div class="inv-section-title" style="margin:0;font-size:13px;">&#128279; ' + t('inv.syncMapping') + '</div>';
      html += '<input class="inv-search-input" id="inv-map-search" placeholder="&#128269; ' + t('inv.searchPlaceholder') + '" oninput="filterHoldedMapping(this.value)" style="width:200px;" />';
      html += '</div>';
      html += '<div class="inv-sync-map" id="inv-sync-map">';
      // Sort: unmatched first
      var sorted = alojs.slice().sort(function(a, b) {
        var aM = _holdedMapping[a.trim().toLowerCase()] ? 1 : 0;
        var bM = _holdedMapping[b.trim().toLowerCase()] ? 1 : 0;
        if (aM !== bM) return aM - bM;
        return a.localeCompare(b);
      });
      sorted.forEach(function(name) {
        var key = name.trim().toLowerCase();
        var prop = typeof getPropietario === 'function' ? getPropietario(name) : '';
        var mapping = _holdedMapping[key];
        var safeName = name.replace(/'/g, "\\'");
        html += '<div class="inv-map-row' + (mapping ? ' inv-map-ok' : '') + '" data-aloj="' + esc(name) + '" data-prop="' + esc(prop) + '">';
        html += '<div class="inv-map-aloj">';
        html += '<div class="inv-map-name">' + esc(name) + '</div>';
        if (prop && prop !== t('consol.missingOwner')) html += '<div class="inv-map-prop">' + esc(prop) + '</div>';
        html += '</div>';
        html += '<div class="inv-map-contact">';
        if (mapping) {
          html += '<span class="inv-map-match">&#10003; ' + esc(mapping.name) + '</span>';
          if (mapping.vatnumber) html += '<span class="inv-map-nif">' + esc(mapping.vatnumber) + '</span>';
          html += '<button class="inv-btn inv-btn-sm inv-map-clear" onclick="clearHoldedMapping(\'' + safeName + '\')" title="' + t('inv.syncClear') + '">&#10007;</button>';
        } else if (_holdedContacts.length > 0) {
          var comboId = 'hc-' + key.replace(/[^a-z0-9]/g, '_');
          html += '<div class="inv-combo" id="' + comboId + '">';
          html += '<input class="inv-combo-input" placeholder="' + t('inv.syncAssign') + '…" onfocus="openHoldedCombo(\'' + comboId + '\')" oninput="filterHoldedCombo(\'' + comboId + '\', this.value)" />';
          html += '<div class="inv-combo-drop">';
          _holdedContacts.forEach(function(c) {
            var label = c.name + (c.vatnumber ? ' (' + c.vatnumber + ')' : '');
            html += '<div class="inv-combo-opt" data-id="' + c.id + '" data-search="' + esc(label.toLowerCase()) + '" onclick="pickHoldedCombo(\'' + safeName + '\',\'' + c.id + '\')">' + esc(label) + '</div>';
          });
          html += '</div></div>';
        } else {
          html += '<span class="inv-sync-hint">&#128260; ' + t('inv.syncToAssign') + '</span>';
        }
        html += '</div>';
        html += '</div>';
      });
      html += '</div>';
    }
  }

  html += '</div>';
  return html;
}

// ==============================================================================================================================
//  HOLDED API FUNCTIONS
// ==============================================================================================================================

const HOLDED_API_BASE = 'https://api.holded.com/api/invoicing/v1';
const HOLDED_CORS_PROXY = 'https://corsproxy.io/?url=';

/**
 * @description Realiza una petición a la API de Holded con CORS proxy automático.
 */
async function _holdedFetch(endpoint) {
  var url = HOLDED_API_BASE + endpoint;
  var headers = { 'key': _holdedApiKey, 'Accept': 'application/json' };

  // Try direct first
  try {
    var resp = await fetch(url, { headers: headers, mode: 'cors' });
    if (resp.ok) return await resp.json();
    if (resp.status === 401 || resp.status === 403) throw new Error(t('inv.syncAuthError'));
    if (resp.status >= 400) throw new Error('HTTP ' + resp.status);
  } catch(e) {
    if (e.message && e.message.indexOf(t('inv.syncAuthError')) >= 0) throw e;
    console.log('[Holded] Direct failed, trying CORS proxy:', e.message);
  }

  // Fallback: CORS proxy
  try {
    var proxyUrl = HOLDED_CORS_PROXY + encodeURIComponent(url);
    var resp2 = await fetch(proxyUrl, { headers: headers });
    if (resp2.ok) return await resp2.json();
    if (resp2.status === 401 || resp2.status === 403) throw new Error(t('inv.syncAuthError'));
    throw new Error('HTTP ' + resp2.status);
  } catch(e2) {
    console.error('[Holded] Proxy also failed:', e2.message);
    throw e2;
  }
}

/**
 * @description Obtiene todos los contactos de Holded (con paginación).
 */
async function fetchHoldedContacts() {
  var allContacts = [];
  var page = 1;
  var hasMore = true;

  while (hasMore) {
    var data = await _holdedFetch('/contacts?page=' + page);
    if (!Array.isArray(data) || data.length === 0) {
      hasMore = false;
    } else {
      allContacts = allContacts.concat(data);
      if (data.length < 500) hasMore = false;
      page++;
      if (page > 20) hasMore = false;
    }
  }
  return allContacts;
}

/**
 * @description Normaliza un string para comparación fuzzy.
 */
function _normalizeForMatch(str) {
  return (str || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ').trim();
}

/**
 * @description Auto-matching: mapea contactos Holded a alojamientos por nombre de propietario.
 * Estrategia:
 *   1. Match exacto nombre propietario → nombre contacto
 *   2. Match parcial (propietario contenido en contacto o viceversa)
 *   3. Match por código en customFields o notes del contacto (ej: [MA-2-P3-1C])
 */
function matchHoldedToAlojamientos() {
  if (_holdedContacts.length === 0) return 0;
  var alojs = [];
  if (typeof getAlojamientos === 'function') {
    alojs = getAlojamientos().map(function(a) { return a.name; });
  }
  if (alojs.length === 0) return 0;

  // Build contact lookup by normalized name
  var contactByName = {};
  var contactByCode = {};
  _holdedContacts.forEach(function(c) {
    var norm = _normalizeForMatch(c.name);
    if (norm) contactByName[norm] = c;
    if (c.tradeName) {
      var norm2 = _normalizeForMatch(c.tradeName);
      if (norm2) contactByName[norm2] = c;
    }
    // Check code or notes for property codes like [MA-2-P3-1C]
    var codeStr = (c.code || '') + ' ' + (c.notes || '');
    var codeMatches = codeStr.match(/\[([A-Z0-9\-]+)\]/g);
    if (codeMatches) {
      codeMatches.forEach(function(m) {
        var code = m.replace(/[\[\]]/g, '').toLowerCase();
        contactByCode[code] = c;
      });
    }
  });

  var newMatched = 0;
  alojs.forEach(function(name) {
    var key = name.trim().toLowerCase();
    if (_holdedMapping[key]) return; // already mapped

    var prop = typeof getPropietario === 'function' ? getPropietario(name) : '';
    if (!prop || prop === t('consol.missingOwner')) return;

    var normProp = _normalizeForMatch(prop);
    var contact = null;

    // Strategy 1: Exact match
    if (contactByName[normProp]) {
      contact = contactByName[normProp];
    }

    // Strategy 2: Partial match
    if (!contact && normProp.length >= 4) {
      for (var normC in contactByName) {
        if (normC.indexOf(normProp) >= 0 || normProp.indexOf(normC) >= 0) {
          contact = contactByName[normC];
          break;
        }
      }
    }

    // Strategy 3: Property code in contact notes
    if (!contact) {
      var alojCode = name.trim().toLowerCase().replace(/\s+/g, '-');
      if (contactByCode[alojCode]) contact = contactByCode[alojCode];
    }

    if (contact) {
      _holdedMapping[key] = _extractContactData(contact);
      newMatched++;
    }
  });

  return newMatched;
}

/**
 * @description Extrae datos fiscales relevantes de un contacto Holded.
 */
function _extractContactData(contact) {
  // Holded may return billAddress as object: { address, city, postalCode, province, country }
  var addr = contact.billAddress || contact.address || '';
  var city = '', postalCode = '', province = '', country = '';

  if (addr && typeof addr === 'object') {
    city = String(addr.city || '');
    postalCode = String(addr.postalCode || '');
    province = String(addr.province || '');
    country = String(addr.country || '');
    addr = String(addr.address || '');
  } else {
    addr = String(addr || '');
    city = String(contact.billCity || contact.city || '');
    postalCode = String(contact.billPostalCode || contact.postalCode || contact.billZip || contact.zip || '');
    province = String(contact.billProvince || contact.province || '');
    country = String(contact.billCountry || contact.country || contact.billCountryName || '');
  }

  // Strip property code prefix from name: "[MA-2-P6-0C] Pedro García" → "Pedro García"
  var name = String(contact.name || '');
  name = name.replace(/^\[.*?\]\s*/, '');

  return {
    contactId: String(contact.id || ''),
    name: name,
    vatnumber: String(contact.vatnumber || contact.vatNumber || contact.code || ''),
    email: String(contact.email || ''),
    phone: String(contact.phone || contact.mobile || ''),
    address: addr,
    city: city,
    postalCode: postalCode,
    province: province,
    country: country
  };
}

/**
 * @description Ejecuta sincronización completa con Holded.
 */
async function syncHoldedContacts() {
  if (!_holdedApiKey) { showToast(t('inv.syncNeedKey'), 'warning'); return; }
  if (_holdedSyncing) return;
  _holdedSyncing = true;
  _holdedSyncStatus.error = '';
  renderInvoicingConfigTab();

  try {
    showToast(t('inv.syncStarted'), 'info');
    var contacts = await fetchHoldedContacts();
    _holdedContacts = contacts;
    _holdedSyncStatus.contactCount = contacts.length;
    _holdedSyncStatus.lastSync = new Date().toISOString();

    // Auto-match (only fills unmapped slots)
    var newMatched = matchHoldedToAlojamientos();
    _holdedSyncStatus.matchedCount = Object.keys(_holdedMapping).length;

    // Persist
    scheduleGlobalConfigSave();

    var msg = t('inv.syncDone').replace('%c', contacts.length).replace('%m', newMatched || 0);
    showToast(msg, 'success');
    console.log('[Holded] Sync complete:', contacts.length, 'contacts,', newMatched, 'new matches');
  } catch(e) {
    _holdedSyncStatus.error = e.message || t('inv.syncError');
    showToast(t('inv.syncError') + ': ' + e.message, 'error');
    console.error('[Holded] Sync error:', e);
  }

  _holdedSyncing = false;
  renderInvoicingConfigTab();
}

// --- Manual assignment ---
function assignHoldedContact(alojName, contactId) {
  if (!contactId) return;
  var key = alojName.trim().toLowerCase();
  var contact = _holdedContacts.find(function(c) { return c.id === contactId; });
  if (!contact) return;
  _holdedMapping[key] = _extractContactData(contact);
  _holdedSyncStatus.matchedCount = Object.keys(_holdedMapping).length;
  scheduleGlobalConfigSave();
  renderInvoicingConfigTab();
  showToast(t('inv.syncAssigned').replace('%a', alojName).replace('%c', contact.name), 'success');
}

function clearHoldedMapping(alojName) {
  var key = alojName.trim().toLowerCase();
  delete _holdedMapping[key];
  _holdedSyncStatus.matchedCount = Object.keys(_holdedMapping).length;
  scheduleGlobalConfigSave();
  renderInvoicingConfigTab();
}

function filterHoldedMapping(query) {
  var container = document.getElementById('inv-sync-map');
  if (!container) return;
  var q = (query || '').toLowerCase();
  container.querySelectorAll('.inv-map-row').forEach(function(row) {
    var aloj = (row.getAttribute('data-aloj') || '').toLowerCase();
    var prop = (row.getAttribute('data-prop') || '').toLowerCase();
    row.style.display = (!q || aloj.indexOf(q) >= 0 || prop.indexOf(q) >= 0) ? '' : 'none';
  });
}

// --- Holded searchable combo ---
function openHoldedCombo(comboId) {
  // Close any other open combos first
  document.querySelectorAll('.inv-combo.open').forEach(function(el) {
    if (el.id !== comboId) el.classList.remove('open');
  });
  var el = document.getElementById(comboId);
  if (!el) return;
  el.classList.add('open');
  // Reset filter
  var opts = el.querySelectorAll('.inv-combo-opt');
  opts.forEach(function(o) { o.style.display = ''; });
}

function filterHoldedCombo(comboId, query) {
  var el = document.getElementById(comboId);
  if (!el) return;
  var q = (query || '').toLowerCase();
  var opts = el.querySelectorAll('.inv-combo-opt');
  opts.forEach(function(o) {
    var s = o.getAttribute('data-search') || '';
    o.style.display = (!q || s.indexOf(q) >= 0) ? '' : 'none';
  });
}

function pickHoldedCombo(alojName, contactId) {
  // Close all combos
  document.querySelectorAll('.inv-combo.open').forEach(function(el) { el.classList.remove('open'); });
  assignHoldedContact(alojName, contactId);
}

// Close combos on outside click
document.addEventListener('click', function(e) {
  if (!e.target.closest('.inv-combo')) {
    document.querySelectorAll('.inv-combo.open').forEach(function(el) { el.classList.remove('open'); });
  }
});

// --- F1 Actions (unchanged) ---
function toggleHoldedKeyVisibility() {
  var inp = document.getElementById('inv-holded-key');
  if (!inp) return;
  inp.type = inp.type === 'password' ? 'text' : 'password';
}

function saveHoldedKey() {
  var inp = document.getElementById('inv-holded-key');
  if (!inp) return;
  _holdedApiKey = inp.value.trim();
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
  grid.querySelectorAll('.inv-aloj-row').forEach(function(row) {
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
  var base = id;
  var n = 1;
  while (_invoiceCompanies.some(function(c) { return c.id === id; })) { id = base + n; n++; }
  _invoiceCompanies.push({ id: id, name: newName.trim(), cif: newCif.trim(), address: (newAddr || '').trim() });
  scheduleGlobalConfigSave();
  renderInvoicingConfigTab();
  showToast(t('inv.companyAdded'), 'success');
}

// ==============================================================================================================================
//  F3: INVOICE GENERATION — Factura = Liquidación + cabecera fiscal
// ==============================================================================================================================

/**
 * @description Construye la cabecera fiscal de la factura.
 * Emisor: propietario (datos de Holded). Receptor: empresa GTC/GEE.
 */
function buildInvoiceHeader(alojName, periodStr) {
  var company = getInvoiceCompany(alojName);
  var fiscal = getHoldedFiscalData(alojName);
  var prop = typeof getPropietario === 'function' ? getPropietario(alojName) : '';
  var invNum = getInvoiceNumber(periodStr);
  var invDate = getInvoiceDate(periodStr);

  // Emisor: propietario
  var emisorName = fiscal ? fiscal.name : prop;
  var emisorNif = fiscal ? fiscal.vatnumber : '';
  var emisorAddr = '';
  if (fiscal) {
    var parts = [fiscal.address, fiscal.postalCode, fiscal.city, fiscal.province, fiscal.country].filter(function(p) { return p && String(p).trim(); });
    emisorAddr = parts.map(function(p) { return String(p).trim(); }).join(', ');
  }
  var emisorEmail = fiscal ? fiscal.email : '';
  var emisorPhone = fiscal ? fiscal.phone : '';

  // Receptor: empresa
  var receptorName = company ? company.name : 'Green Tropical Coast S.L.';
  var receptorCif = company ? company.cif : '';
  var receptorAddr = company ? company.address : '';

  var html = '<div class="inv-fiscal-header">';
  html += '<div class="inv-fiscal-top">';
  html += '<div class="inv-fiscal-badge">' + t('inv.invoiceTitle') + '</div>';
  html += '<div class="inv-fiscal-meta">';
  html += '<div class="inv-fiscal-meta-item"><span class="inv-fiscal-label">' + t('inv.invoiceNum') + '</span><span class="inv-fiscal-val">' + esc(invNum) + '</span></div>';
  html += '<div class="inv-fiscal-meta-item"><span class="inv-fiscal-label">' + t('inv.invoiceDate') + '</span><span class="inv-fiscal-val">' + esc(invDate) + '</span></div>';
  html += '</div>';
  html += '</div>';

  html += '<div class="inv-fiscal-parties">';
  // Emisor
  html += '<div class="inv-fiscal-party">';
  html += '<div class="inv-fiscal-party-label">' + t('inv.issuer') + '</div>';
  html += '<div class="inv-fiscal-party-name">' + esc(emisorName) + '</div>';
  if (emisorNif) html += '<div class="inv-fiscal-party-detail"><span class="inv-fiscal-detail-label">NIF/CIF:</span> ' + esc(emisorNif) + '</div>';
  if (emisorAddr) html += '<div class="inv-fiscal-party-detail">' + esc(emisorAddr) + '</div>';
  if (emisorEmail) html += '<div class="inv-fiscal-party-detail">' + esc(emisorEmail) + '</div>';
  if (emisorPhone) html += '<div class="inv-fiscal-party-detail">' + esc(emisorPhone) + '</div>';
  if (!fiscal) html += '<div class="inv-fiscal-party-warn">&#9888; ' + t('inv.syncNoMatch') + '</div>';
  html += '</div>';
  // Receptor
  html += '<div class="inv-fiscal-party">';
  html += '<div class="inv-fiscal-party-label">' + t('inv.recipient') + '</div>';
  html += '<div class="inv-fiscal-party-name">' + esc(receptorName) + '</div>';
  if (receptorCif) html += '<div class="inv-fiscal-party-detail"><span class="inv-fiscal-detail-label">CIF:</span> ' + esc(receptorCif) + '</div>';
  if (receptorAddr) html += '<div class="inv-fiscal-party-detail">' + esc(receptorAddr) + '</div>';
  html += '</div>';
  html += '</div>';
  html += '</div>';

  return html;
}

/**
 * @description Genera factura: liquidación con cabecera fiscal.
 */
function handleGenerarFactura(alojNameParam) {
  try {
    var alojName = alojNameParam || currentConsolAloj;
    if (alojName) currentConsolAloj = alojName;
    if (!alojName) { showToast(t('inv.noAloj'), 'warning'); return; }
    if (!isInvoiceEnabled(alojName)) { showToast(t('inv.notEnabled'), 'warning'); return; }

    console.log('[Invoice] Generating for:', alojName);

    // Build liquidation cards in document language
    var result = _withLang(_docLang, buildPrintCards);
    if (!result) { showToast('Error: buildPrintCards returned null', 'error'); return; }
    console.log('[Invoice] Cards built OK');

    // Build period string in doc language
    var periodStr = _withLang(_docLang, function() {
      var ps = '';
      try {
        if (typeof _mpSelYears !== 'undefined' && _mpSelYears.size > 0) {
          var yr = [..._mpSelYears].sort()[0];
          if (typeof _mpSelMonths !== 'undefined' && _mpSelMonths.size >= 1) {
            var ms = [..._mpSelMonths].sort(function(a,b){return a-b;});
            ps = ms.map(function(m){return t('month.full.'+m);}).join(', ') + ' ' + yr;
          } else { ps = '' + yr; }
        }
      } catch(e) {}
      if (!ps) { var now = new Date(); ps = t('month.full.' + now.getMonth()) + ' ' + now.getFullYear(); }
      return ps;
    });
    console.log('[Invoice] Period:', periodStr);

    // Build fiscal header
    var headerHtml = _withLang(_docLang, function() {
      return buildInvoiceHeader(alojName, periodStr);
    });
    console.log('[Invoice] Header built, length:', headerHtml ? headerHtml.length : 0);

    var previewZone = document.getElementById('preview-zone');
    var printZone = document.getElementById('print-zone');
    var actions = document.getElementById('consol-actions');

    if (!previewZone) { showToast('Error: preview-zone not found', 'error'); return; }

    previewZone.innerHTML = '<div class="no-print" style="position:sticky;top:0;z-index:50;background:linear-gradient(to bottom,#f1f3f8 80%,transparent);padding:12px 0 16px;text-align:center;">'
      + '<button class="btn btn-outline" onclick="exitPreview()">&#8592; ' + t('btn.backToLiq') + '</button></div>'
      + headerHtml
      + result.cardsHtml + result.summaryHtml
      + '<div class="liq-actions no-print" style="margin-top:28px;justify-content:center;">'
      + '<button class="btn btn-success" onclick="printFromPreview()">&#128424; ' + t('btn.print') + '</button>'
      + '<button class="btn btn-outline" onclick="exitPreview()">&#8592; ' + t('btn.backToLiq') + '</button>'
      + '</div>';

    if (printZone) { printZone.style.display = 'none'; printZone.classList.remove('print-target'); }
    if (actions) actions.style.display = 'none';
    previewZone.style.display = 'block';
    previewZone.classList.add('print-target');
    _previewActive = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    console.log('[Invoice] Preview active');
  } catch(e) {
    console.error('[Invoice] Error:', e);
    showToast('Error factura: ' + e.message, 'error');
  }
}

// ==============================================================================================================================
//  PERSISTENCE: build/parse config rows for invoicing + Holded
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
  // Holded mapping per alojamiento (these are small, ~200 chars each)
  Object.keys(_holdedMapping).forEach(function(key) {
    rows.push(['hmap:' + key, JSON.stringify(_holdedMapping[key])]);
  });
  // Holded sync status
  if (_holdedSyncStatus.lastSync) {
    rows.push(['holded_sync', JSON.stringify({ lastSync: _holdedSyncStatus.lastSync, contactCount: _holdedSyncStatus.contactCount, matchedCount: _holdedSyncStatus.matchedCount })]);
  }
  // NOTE: holded_contacts NOT persisted (too large for Sheets cell). Re-fetch with "Sync now".
  console.log('[Invoicing] buildConfigRows:', rows.length, 'rows, mappings:', Object.keys(_holdedMapping).length);
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
  if (key === 'holded_contacts') {
    try {
      var parsed2 = JSON.parse(val);
      if (Array.isArray(parsed2)) _holdedContacts = parsed2;
    } catch(e) { console.warn('[Holded] Error parsing contacts cache:', e); }
    return true;
  }
  if (key === 'holded_sync') {
    try {
      var parsed3 = JSON.parse(val);
      if (parsed3 && typeof parsed3 === 'object') Object.assign(_holdedSyncStatus, parsed3);
    } catch(e) { console.warn('[Holded] Error parsing sync status:', e); }
    return true;
  }
  if (key.startsWith('hmap:')) {
    try {
      _holdedMapping[key.substring(5)] = JSON.parse(val);
    } catch(e) { console.warn('[Holded] Error parsing mapping:', e); }
    return true;
  }
  if (key.startsWith('inv:')) {
    _invoiceConfig[key.substring(4)] = { enabled: true, companyId: val || (_invoiceCompanies[0] ? _invoiceCompanies[0].id : '') };
    return true;
  }
  return false;
}
