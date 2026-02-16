// === NAVIGATION, COLUMNS, SORTING, RENDERING ===
let _navigating = false;
/**
 * @description Cambia la pantalla activa de la SPA.
 * Gestiona la navegaci\u00f3n entre las 5 vistas principales.
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
// ==============================================================================================================================
//  [M11] TABLE_RENDER ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â Tabla de preliquidaci\u00f3n, columnas, paginaci\u00f3n
// ==============================================================================================================================

/**
 * @description Definici\u00f3n de columnas de la tabla principal de preliquidaci\u00f3n.
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
 * @description Renderiza la tabla principal de preliquidaci\u00f3n.
 * Delega en _renderFull() que aplica filtros, ordenaci\u00f3n, paginaci\u00f3n y stats.
 * Es el punto de entrada p\u00fablico ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â las funciones internas son _renderFull() y _renderPageOnly().
 */
function renderTable() { _renderFull(); }

/**
 * @description Genera el HTML completo de una fila de la tabla de preliquidaci\u00f3n.
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
