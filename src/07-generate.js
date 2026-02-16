function handleGenerar() {
  // If preference is saved, use it directly
  if (_previewPref !== null) {
    if (_previewPref) showPrintPreview(); else printConsolDirect();
    return;
  }
  // Otherwise read checkboxes
  const chkPreview = document.getElementById('chk-preview');
  const chkRemember = document.getElementById('chk-remember');
  const wantPreview = chkPreview ? chkPreview.checked : true;

  if (chkRemember && chkRemember.checked) {
    _previewPref = wantPreview;
    SafeStorage.set('liq-preview-pref', String(wantPreview));
  }

  if (wantPreview) showPrintPreview(); else printConsolDirect();
}

function resetPreviewPref() {
  _previewPref = null;
  SafeStorage.remove('liq-preview-pref');
  // Re-render to show checkboxes
  if (currentConsolAloj) viewConsolDetail(currentConsolAloj);
}

function buildPrintCards(lang) {
  const _en = lang === 'en';
  const alojName = currentConsolAloj;
  if (!alojName) return null;
  const alojamientos = getAlojamientos();
  const a = alojamientos.find(x => x.name === alojName);
  if (!a) return null;

  const calcs_src = _mpHasFilter() ? a.reservas.filter(r => _mpMatchDate(r._dEntrada)) : a.reservas;
  const calcs = calcs_src.map(r => ({ r, s: settings[r.idx] || {}, c: getLiq(r) }));

  // Compute period string in document language (t() is set via _withLang)
  var _periodStr = '';
  try {
    if (typeof _mpSelYears !== 'undefined' && _mpSelYears.size > 0) {
      const _yr = [..._mpSelYears].sort()[0];
      if (typeof _mpSelMonths !== 'undefined' && _mpSelMonths.size >= 1) {
        const _ms = [..._mpSelMonths].sort((a, b) => a - b);
        _periodStr = _ms.map(m => t('month.full.' + m)).join(', ') + ' ' + _yr;
      } else { _periodStr = '' + _yr; }
    }
  } catch(e) {}
  if (!_periodStr) { const _now = new Date(); _periodStr = t('month.full.' + _now.getMonth()) + ' ' + _now.getFullYear(); }

  let cardsHtml = calcs.map((x, i) => {
    const r = x.r, s = x.s, c = x.c;
    const isB = r.plataforma === 'Booking.com';
    const pasL = isB ? 'Booking' : 'Stripe';
    const pasR = s.pasarelaRate !== undefined ? s.pasarelaRate : (isB ? pasarelaBookingOptions[pasarelaBookingOptions.length-1]/100 : pasarelaStripeOptions[pasarelaStripeOptions.length-1]/100);

    let rows = [
      {l:t('liq.totalResIva'),v:c.total,bold:true},
      {l:(t('liq.ivaReserva'))+` (${(IVA_RESERVA*100).toFixed(0)}%)`,v:-(c.total-c.baseSinIVA),neg:true},
      {l:t('liq.baseExclVat'),v:c.baseSinIVA,bold:true},{div:true},
      {l:(t('liq.salesChannel'))+` ${r.plataforma} (${(c.comRate*100).toFixed(1)}%)`,v:-c.comPlat,neg:true},{div:true},
      {l:(t('liq.gtcMgmt'))+` (${(c.gtcRate*100).toFixed(0)}%)`,v:-c.comGTC,neg:true},
      {l:(t('liq.cleaning'))+` (${fmt(c.limp)} \u20AC)`,v:-c.limp,neg:true},
      {l:`Amenities (${fmt(c.amen)} \u20AC)`,v:-c.amen,neg:true},{div:true},
    ];
    if(s.pasarela) rows.push({l:(t('liq.paymentGw'))+` ${pasL} (${(pasR*100).toFixed(1)}%)`,v:-c.comPas,neg:true},{div:true});
    // CE Sin IVA items
    if (c.ceSinIvaTotal > 0) {
      const ce2Items = s.conceptosSinIVA || [];
      ce2Items.forEach(function(item) {
        if (item.amount > 0) rows.push({l:(t('liq.ceNoVat'))+(item.label || (t('liq.unnamed'))),v:-item.amount,neg:true});
      });
      rows.push({div:true});
    }
    rows.push(
      {l:t('liq.subtotal'),v:c.sub,bold:true},
      {l:(t('liq.irpfWithhold'))+` (${(c.irpfRate*100).toFixed(0)}%)`,v:-c.ret,neg:true},
      {l:(t('liq.vatOnSub'))+` (${(IVA_SUBTOTAL*100).toFixed(0)}%)`,v:c.iva,pos:true});

    const rowsHtml = rows.map(row => {
      if (row.div) return '<div class="liq-divider"></div>';
      const cl = row.bold ? ' bold' : '';
      const vc = row.neg ? 'neg' : row.pos ? 'pos' : '';
      const d = row.v < 0 ? `- ${fmt(Math.abs(row.v))}` : fmt(row.v);
      return `<div class="liq-row${cl}"><span>${row.l}</span><span class="${vc}">${d} &#8364;</span></div>`;
    }).join('');

    return `<div class="liq-container print-card" style="margin-bottom:24px;">
      <div class="liq-gold-bar-top"></div>
      <div class="liq-header">
        <div class="liq-header-top"><div><div class="type">${t('liq.settlement')} ${i+1} ${t('liq.of')} ${calcs.length}</div><div class="name">${getPropietario(r.alojamiento)}</div></div><div style="display:flex;align-items:flex-start;gap:16px;"><div class="liq-period-badge"><div class="liq-period-label">${t('liq.settlement')}</div><div class="liq-period-value">${_periodStr}</div></div><div class="liq-header-logo"><span class="logo-main">h\u00F4mity</span><span class="logo-sub">holidays</span></div></div></div>
        <div class="liq-meta-strip">
          <div class="liq-meta-item"><div class="liq-meta-label">${t('liq.property')}</div><div class="liq-meta-value">${esc(r.alojamiento)}</div></div>
          <div class="liq-meta-item"><div class="liq-meta-label">${t('liq.dates')}</div><div class="liq-meta-value">${formatDate(r.fechaEntrada)} &#8594; ${formatDate(r.fechaSalida)}</div></div>
          <div class="liq-meta-item"><div class="liq-meta-label">${t('liq.salesChannel')}</div><div class="liq-meta-value">${r.plataforma}</div></div>
          <div class="liq-meta-item"><div class="liq-meta-label">${t('liq.bookingId')}</div><div class="liq-meta-value">${r.id}</div></div>
          <div class="liq-meta-item"><div class="liq-meta-label">${t('liq.reference')}</div><div class="liq-meta-value sm">${r.localizador}</div></div>
          <div class="liq-meta-item"><div class="liq-meta-label">${t('liq.building')}</div><div class="liq-meta-value">${esc(r.edificio)}</div></div>
        </div>
      </div>
      <div class="liq-sec" style="padding-top:8px;padding-bottom:8px;">${rowsHtml}</div>
      <div class="liq-total-bar"><div class="liq-total"><div><span class="liq-total-label">${t('liq.totalSettle')}</span><div class="liq-total-label-sub">${t('liq.monthlySettle')}</div></div><span class="liq-total-value">${fmt(c.totalLiq)} &#8364;</span></div></div>
      <div class="liq-gold-bar-bottom"></div>
    </div>`;
  }).join('');

  const sumSub = calcs.reduce((s, x) => s + x.c.sub, 0);
  const sumRet = calcs.reduce((s, x) => s + x.c.ret, 0);
  const sumIva = calcs.reduce((s, x) => s + x.c.iva, 0);
  const sumLiq = calcs.reduce((s, x) => s + x.c.totalLiq, 0);

  const _printDed = getConsolDeductions(a.name);
  const _printDedHtml = buildPrintDeductionsHtml(a.name, lang);
  const _pIsSplit = isGtcSplit(a.name);
  const _pGtcSplit = _pIsSplit ? sumSub * GTC_SPLIT_RATE : 0;
  const _pOwnerBase = _pIsSplit ? sumSub - _pGtcSplit : sumSub;
  const _pAdjSub = _pOwnerBase - _printDed.totalBase;
  const _pAvgIrpf = sumSub > 0 ? sumRet / sumSub : 0;
  const _pAdjRet = _pAdjSub * _pAvgIrpf;
  const _pAdjIva = _pAdjSub * IVA_SUBTOTAL;
  const _pAdjLiq = _pAdjSub - _pAdjRet + _pAdjIva;
  const _pSplitHtml = _pIsSplit ? `<div class="liq-divider"></div>
      <div class="liq-row" style="color:#7c3aed;"><span>${t('liq.gtcRetains')} (${(GTC_SPLIT_RATE*100).toFixed(0)}%)</span><span>${fmt(_pGtcSplit)} &#8364;</span></div>
      <div class="liq-row bold" style="color:#16a34a;"><span>${t('liq.ownerReceives')} (${((1-GTC_SPLIT_RATE)*100).toFixed(0)}%)</span><span>${fmt(_pOwnerBase)} &#8364;</span></div>` : '';
  const summaryHtml = `<div class="liq-container print-summary" style="margin-top:8px;">
    <div class="liq-gold-bar-top"></div>
    <div class="liq-header">
      <div class="liq-header-top"><div><div class="type">${t('liq.consolSummary')} \u2014 ${calcs.length} ${t('liq.reservations')}</div><div class="name">${a.name}</div></div><div style="display:flex;align-items:flex-start;gap:16px;"><div class="liq-period-badge"><div class="liq-period-label">${t('liq.settlement')}</div><div class="liq-period-value">${_periodStr}</div></div><div class="liq-header-logo"><span class="logo-main">h\u00F4mity</span><span class="logo-sub">holidays</span></div></div></div>
      <div class="liq-meta-strip">
        <div class="liq-meta-item"><div class="liq-meta-label">${t('liq.building')}</div><div class="liq-meta-value">${a.edificio}</div></div>
        <div class="liq-meta-item"><div class="liq-meta-label">${t('liq.numReserv')}</div><div class="liq-meta-value">${calcs.length}</div></div>
        <div class="liq-meta-item"><div class="liq-meta-label">${t('liq.ownerLabel')}</div><div class="liq-meta-value">${getPropietario(a.name)}</div></div>
      </div>
    </div>
    <div class="liq-sec" style="padding-top:8px;padding-bottom:8px;">
      <div class="liq-row bold"><span>${t('liq.resSub')}</span><span>${fmt(sumSub)} &#8364;</span></div>
      ${_pSplitHtml}
      ${_printDedHtml}
      <div class="liq-divider"></div>
      <div class="liq-row bold"><span>${t('liq.monthFinalSub')}</span><span>${fmt(_pAdjSub)} &#8364;</span></div>
      <div class="liq-row"><span>${t('liq.irpfWithhold')} (${(_pAvgIrpf*100).toFixed(0)}%)</span><span class="neg">- ${fmt(_pAdjRet)} &#8364;</span></div>
      <div class="liq-row"><span>${t('liq.vat')} 21%</span><span class="pos">+ ${fmt(_pAdjIva)} &#8364;</span></div>
    </div>
    <div class="liq-total-bar"><div class="liq-total"><div><span class="liq-total-label">${t('liq.totalSettle')}${_pIsSplit ? (t('liq.ownerSuffix')) : ''}</span><div class="liq-total-label-sub">${t('liq.consolLabel')}</div></div><span class="liq-total-value">${fmt(_pAdjLiq)} &#8364;</span></div></div>
    <div class="liq-gold-bar-bottom"></div>
  </div>`;

  return { cardsHtml, summaryHtml };
}

/** @description Estado del modo preview de impresi\u00f3n */
let _previewActive = false;

function showPrintPreview() {
  const result = _withLang(_docLang, buildPrintCards);
  if (!result) return;

  const printZone = document.getElementById('print-zone');
  const previewZone = document.getElementById('preview-zone');
  const actions = document.getElementById('consol-actions');

  // Populate preview zone with sticky back button + cards + action buttons
  previewZone.innerHTML = `<div class="no-print" style="position:sticky;top:0;z-index:50;background:linear-gradient(to bottom,#f1f3f8 80%,transparent);padding:12px 0 16px;text-align:center;">
        <button class="btn btn-outline" onclick="exitPreview()">&#8592; ${t('btn.backToLiq')}</button>
      </div>`
    + result.cardsHtml + result.summaryHtml
    + `<div class="liq-actions no-print" style="margin-top:28px;justify-content:center;">
        <button class="btn btn-success" onclick="printFromPreview()">&#128424; ${t('btn.print')}</button>
        <button class="btn btn-outline" onclick="exitPreview()">&#8592; ${t('btn.backToLiq')}</button>
      </div>`;

  // Toggle visibility: hide table, show preview
  printZone.style.display = 'none';
  printZone.classList.remove('print-target');
  if (actions) actions.style.display = 'none';
  previewZone.style.display = 'block';
  previewZone.classList.add('print-target');
  _previewActive = true;

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function printFromPreview() {
  window.print();
}

function exitPreview() {
  const printZone = document.getElementById('print-zone');
  const previewZone = document.getElementById('preview-zone');
  const actions = document.getElementById('consol-actions');

  if (!_previewActive) return;

  // Toggle back: show table, hide preview
  previewZone.style.display = 'none';
  previewZone.classList.remove('print-target');
  previewZone.innerHTML = '';
  printZone.style.display = '';
  printZone.classList.add('print-target');
  if (actions) actions.style.display = '';
  _previewActive = false;
}

function printConsolDirect() {
  const result = _withLang(_docLang, buildPrintCards);
  if (!result) return;

  const printZone = document.getElementById('print-zone');
  const previewZone = document.getElementById('preview-zone');
  const actions = document.getElementById('consol-actions');

  // Temporarily swap to preview for printing only
  previewZone.innerHTML = result.cardsHtml + result.summaryHtml;
  printZone.style.display = 'none';
  printZone.classList.remove('print-target');
  if (actions) actions.style.display = 'none';
  previewZone.style.display = 'block';
  previewZone.classList.add('print-target');

  setTimeout(() => {
    window.print();
    // Restore after print dialog closes
    setTimeout(() => {
      previewZone.style.display = 'none';
      previewZone.classList.remove('print-target');
      previewZone.innerHTML = '';
      printZone.style.display = '';
      printZone.classList.add('print-target');
      if (actions) actions.style.display = '';
    }, 500);
  }, 100);
}

// \u2500\u2500\u2500 CONFIG MODAL \u2500\u2500\u2500
// ==============================================================================================================================
//  [M17] SETTINGS_UI ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â Modal de configuraci\u00f3n y gesti\u00f3n de opciones
// ==============================================================================================================================


function buildOS(title, desc, vals, unit, addId, addFn, delFn) {
  const items = vals.map((v, i) => `<div class="option-item"><span class="val">${v}${unit}</span>
    ${vals.length > 1 ? `<button class="option-delete" onclick="${delFn}(${i})">&#10005;</button>` : '<span style="width:28px"></span>'}</div>`).join("");
  return `<div class="modal-section"><h4>${title}</h4>${desc?`<div class="desc">${desc}</div>`:''}
    <div class="option-list">${items}</div>
    <div class="add-row"><input class="add-input" type="number" id="${addId}" placeholder="${t('config.newValue')}" step="any" onkeydown="if(event.key==='Enter'){event.preventDefault();${addFn}();}">
    <button class="btn btn-sm btn-primary" onclick="${addFn}()">${t('btn.addValue')}</button></div></div>`;
}

function renderConfigPages() {
  const pN = Object.keys(platformOptions).sort();
  let pH = '';
  pN.forEach(name => {
    const safe = name.replace(/[^a-zA-Z0-9]/g,'');
    pH += buildOS(name, "% sobre total reserva (IVA incl.)", platformOptions[name], "%", `add-plat-${safe}`, `addP_${safe}`, `delP_${safe}`);
    window[`addP_${safe}`] = function() { const inp=document.getElementById(`add-plat-${safe}`); const v=parseFloat(inp.value);
      if(isNaN(v)||v<0||v>100){showToast("Porcentaje v\u00e1lido: 0-100", "warning");return;} if(platformOptions[name].some(x=>Math.abs(x-v)<0.001)){showToast("Ya existe.", "warning");return;}
      platformOptions[name].push(v); platformOptions[name].sort((a,b)=>a-b); inp.value=""; renderConfigPages(); scheduleGlobalConfigSave(); };
    window[`delP_${safe}`] = function(i) { if(platformOptions[name].length<=1)return; platformOptions[name].splice(i,1); renderConfigPages(); scheduleGlobalConfigSave(); };
  });
  document.getElementById("tab-plat").innerHTML = pH;
  document.getElementById("tab-pasarela").innerHTML =
    buildOS(t("cfg.pasarelaStripe"),t("cfg.pasarelaDesc"),pasarelaStripeOptions,"%","add-ps","addPS","delPS") +
    '<hr class="section-divider">' +
    buildOS("Pasarela Booking","Solo para Booking.com",pasarelaBookingOptions,"%","add-pb","addPB","delPB");
  document.getElementById("tab-otros").innerHTML =
    buildOS("Gesti\u00F3n GTC","% sobre base sin IVA",gtcOptions,"%","add-gtc","addGTC","delGTC") +
    '<hr class="section-divider">' +
    buildOS("Limpieza","\u20AC sin IVA",cleaningOptions," \u20AC","add-cl","addCL","delCL") +
    '<hr class="section-divider">' +
    buildOS("Amenities","Coste fijo por reserva en \u20AC",amenitiesOptions," \u20AC","add-am","addAM","delAM") +
    '<hr class="section-divider">' +
    buildOS(t("liq.maintenanceMonthly"),t("liq.maintenanceDesc"),maintenanceOptions," \u20AC","add-mt","addMT","delMT");
  document.getElementById("tab-impuestos").innerHTML =
    buildOS("Retenci\u00F3n IRPF","Porcentaje",irpfOptions,"%","add-ir","addIR","delIR");
  document.getElementById("tab-8020").innerHTML = buildGtcSplitSection();
  document.getElementById("tab-invoicing").innerHTML = renderInvoicingTab();
}
function addPS(){aL(pasarelaStripeOptions,"add-ps",100);} function delPS(i){dL(pasarelaStripeOptions,i);}
function addPB(){aL(pasarelaBookingOptions,"add-pb",100);} function delPB(i){dL(pasarelaBookingOptions,i);}
function addCL(){aL(cleaningOptions,"add-cl",99999,false);} function delCL(i){dL(cleaningOptions,i);}
function addIR(){aL(irpfOptions,"add-ir",100);} function delIR(i){dL(irpfOptions,i);}
function addGTC(){aL(gtcOptions,"add-gtc",100);} function delGTC(i){dL(gtcOptions,i);}
function addAM(){aL(amenitiesOptions,"add-am",99999,false);} function delAM(i){dL(amenitiesOptions,i);}
function addMT(){aL(maintenanceOptions,"add-mt",99999,false);} function delMT(i){dL(maintenanceOptions,i);}
function aL(list,inputId,max,isP){const inp=document.getElementById(inputId);const v=parseFloat(inp.value);
  if(isP!==false){if(isNaN(v)||v<0||v>max){showToast("Valor no v\u00e1lido.", "warning");return;}}else{if(isNaN(v)||v<0){showToast("Valor no v\u00e1lido.", "warning");return;}}
  if(list.some(x=>Math.abs(x-v)<0.001)){showToast("Ya existe.", "warning");return;} list.push(v);list.sort((a,b)=>a-b);inp.value="";renderConfigPages();scheduleGlobalConfigSave();}
function dL(list,i){if(list.length<=1)return;list.splice(i,1);renderConfigPages();scheduleGlobalConfigSave();}

function buildGtcSplitSection() {
  const alojs = _gtcOwnedAlojamientos.slice().sort();
  if (alojs.length === 0) return '<div style="padding:24px;text-align:center;color:#9ca3af;font-size:13px;">'+t('msg.noGtcAlojs')+'</div>';
  const rows = alojs.map(function(name) {
    const on = isGtcSplit(name);
    return '<div class="gtc-split-row"><span class="name' + (on ? ' on' : '') + '">' + esc(name) + '</span>' +
      '<div class="toggle" onclick="toggleGtcSplit(\'' + name.replace(/'/g, "\\'") + '\')"><div class="toggle-track' + (on ? ' on' : '') + '" style="' + (on ? 'background:#7c3aed;' : '') + '"><div class="toggle-thumb"></div></div></div></div>';
  }).join('<div class="gtc-split-divider-row"></div>');
  const count = alojs.filter(function(n){ return isGtcSplit(n); }).length;
  return '<div class="gtc-split-section"><div class="gtc-split-title">' +
    '&#8621; Acuerdo 80/20 GTC</div>' +
    '<div class="gtc-split-desc">Alojamientos propiedad GTC. Activa los que ya est\u00E1n vendidos: GTC retiene el 20% del Subtotal Reservas, el propietario recibe el 80%.</div>' +
    '<div class="gtc-split-list">' + rows + '</div>' +
    '<div class="gtc-split-counter"><span class="badge">' + count + '</span> de ' + alojs.length + ' vendido' + (count !== 1 ? 's' : '') + ' (80/20 activo)</div></div>';
}
function toggleGtcSplit(alojName) {
  const idx = _gtcSplitAlojamientos.indexOf(alojName);
  if (idx >= 0) { _gtcSplitAlojamientos.splice(idx, 1); }
  else { _gtcSplitAlojamientos.push(alojName); _gtcSplitAlojamientos.sort(); }
  renderConfigPages();
  scheduleGlobalConfigSave();
}

// \u2500\u2500\u2500 SEARCHABLE COMBO SYSTEM \u2500\u2500\u2500
const comboState = { platform: { selected: new Set(), options: [] }, aloj: { selected: new Set(), options: [] } };
var comboLabels = { platform: t('filter.allPlatforms'), aloj: t('filter.allProperties') };

// \u2014\u2014\u2014 MONTH PICKER STATE (multi-select) \u2014\u2014\u2014
const MONTH_NAMES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
const MONTH_FULL = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
let _mpSelYears = new Set();
let _mpSelMonths = new Set();
let _mpAvailable = {};
let _mpAllYears = [];
let _mpActiveSrc = 'p';

// ----- [M10-MONTHPICKER] Selector de mes/a\u00f1o con multi-selecci\u00f3n ------------------------

/**
 * @description Comprueba si una fecha coincide con los filtros de mes/a\u00f1o activos.
 * Soporta multi-selecci\u00f3n: varios a\u00f1os y/o varios meses simult\u00e1neamente.
 * @param {Date} d - Fecha a comprobar
 * @returns {boolean} true si la fecha pasa el filtro
 */
function _mpMatchDate(d) {
  if (_mpSelYears.size === 0) return true;
  if (!d) return false;
  if (!_mpSelYears.has(d.getFullYear())) return false;
  if (_mpSelMonths.size > 0 && !_mpSelMonths.has(d.getMonth())) return false;
  return true;
}
function _mpHasFilter() { return _mpSelYears.size > 0; }

function buildAvailableMonths() {
  _mpAvailable = {};
  allReservas.forEach(r => {
    if (!r._dEntrada) return;
    const y = r._dEntrada.getFullYear(), m = r._dEntrada.getMonth();
    if (!_mpAvailable[y]) _mpAvailable[y] = {};
    _mpAvailable[y][m] = (_mpAvailable[y][m] || 0) + 1;
  });
  _mpAllYears = Object.keys(_mpAvailable).map(Number).sort((a,b) => b-a);
  // Default to previous month (liquidations are always for the month before)
  const now = new Date();
  now.setMonth(now.getMonth() - 1);
  const curY = now.getFullYear();
  const curM = now.getMonth();
  _mpSelYears = new Set();
  _mpSelMonths = new Set();
  if (_mpAvailable[curY]) {
    _mpSelYears.add(curY);
    if (_mpAvailable[curY][curM] !== undefined) _mpSelMonths.add(curM);
  } else if (_mpAllYears.length > 0) {
    _mpSelYears.add(_mpAllYears[0]);
  }
  updateMonthPickerBtn();
}

function toggleMonthPicker(src) {
  _mpActiveSrc = src || 'p';
  document.querySelectorAll('.combo-list').forEach(l => l.classList.remove('open'));
  const otherId = _mpActiveSrc === 'p' ? 'mp-dd-c' : 'mp-dd-p';
  document.getElementById(otherId).classList.remove('open');
  const dd = document.getElementById('mp-dd-' + _mpActiveSrc);
  const wasOpen = dd.classList.contains('open');
  dd.classList.toggle('open');
  if (!wasOpen) renderMonthPickerDD();
}

function renderMonthPickerDD() {
  const dd = document.getElementById('mp-dd-' + _mpActiveSrc);
  if (!dd) return;
  let monthCounts = {};
  let yearsForMonths = _mpSelYears.size > 0 ? _mpSelYears : new Set(_mpAllYears);
  yearsForMonths.forEach(function(y) {
    let ym = _mpAvailable[y] || {};
    for (let m = 0; m < 12; m++) {
      monthCounts[m] = (monthCounts[m] || 0) + (ym[m] || 0);
    }
  });
  let yearsHtml = _mpAllYears.map(y =>
    `<button class="mp-year ${_mpSelYears.has(y)?'sel':''}" onclick="event.stopPropagation();toggleMPYear(${y})">${y}</button>`
  ).join('');
  let monthsHtml = '';
  for (let m = 0; m < 12; m++) {
    const cnt = monthCounts[m] || 0;
    const isSel = _mpSelMonths.has(m);
    const dim = cnt === 0 ? 'dim' : '';
    monthsHtml += `<button class="mp-month ${isSel?'sel':''} ${dim}" onclick="event.stopPropagation();toggleMPMonth(${m})">${MONTH_NAMES[m]}<span class="mp-cnt">${cnt>0?cnt:''}</span></button>`;
  }
  dd.innerHTML = `
    <div class="mp-years">${yearsHtml}</div>
    <div class="mp-grid">${monthsHtml}</div>
    ${_mpSelYears.size > 0 || _mpSelMonths.size > 0 ? '<button class="mp-all" onclick="event.stopPropagation();clearMonthFilter()">' + t('filter.clearDate') + '</button>' : ''}
  `;
}

function toggleMPYear(year) {
  if (_mpSelYears.has(year)) _mpSelYears.delete(year);
  else _mpSelYears.add(year);
  if (_mpSelYears.size === 0) _mpSelMonths.clear();
  _mpRefreshAll();
  renderMonthPickerDD();
}

function toggleMPMonth(month) {
  if (_mpSelMonths.has(month)) _mpSelMonths.delete(month);
  else _mpSelMonths.add(month);
  _mpRefreshAll();
  renderMonthPickerDD();
}

function clearMonthFilter() {
  _mpSelYears.clear(); _mpSelMonths.clear();
  _mpRefreshAll();
  document.getElementById('mp-dd-p').classList.remove('open');
  document.getElementById('mp-dd-c').classList.remove('open');
}

function _mpRefreshAll() {
  updateMonthPickerBtn();
  invalidateFilterCache(); _currentPage = 1; renderTable();
  renderConsolGrid();
  if (document.getElementById("screen-consoldetail").classList.contains("active") && currentConsolAloj) viewConsolDetail(currentConsolAloj);
}

function _mpBtnHtml() {
  if (_mpSelYears.size === 0) return { active: false, html: null };
  let yArr = [..._mpSelYears].sort();
  let label = '';
  let arrows = false;
  if (_mpSelYears.size === 1 && _mpSelMonths.size <= 1) {
    // Single selection: show arrows
    arrows = true;
    if (_mpSelMonths.size === 1) {
      let m = [..._mpSelMonths][0];
      label = MONTH_FULL[m] + ' ' + yArr[0];
    } else {
      label = 'A\u00F1o ' + yArr[0];
    }
  } else if (_mpSelMonths.size > 0) {
    let mArr = [..._mpSelMonths].sort((a,b) => a-b);
    let mNames = mArr.map(m => MONTH_NAMES[m]).join(', ');
    label = mNames + ' ' + yArr.join(', ');
  } else {
    label = yArr.join(', ');
  }
  let html = '';
  if (arrows) {
    html += '<span class="mp-nav"><button class="mp-arrow" onclick="event.stopPropagation();mpPrev()">&#8249;</button></span>';
  }
  html += label;
  if (arrows) {
    html += '<span class="mp-nav"><button class="mp-arrow" onclick="event.stopPropagation();mpNext()">&#8250;</button></span>';
  }
  html += '<span class="mp-clear" onclick="event.stopPropagation();clearMonthFilter();">\u2715</span>';
  return { active: true, html: html };
}

function mpPrev() {
  if (_mpSelYears.size !== 1) return;
  let y = [..._mpSelYears][0];
  if (_mpSelMonths.size === 1) {
    let m = [..._mpSelMonths][0];
    m--;
    if (m < 0) { m = 11; y--; }
    _mpSelYears = new Set([y]);
    _mpSelMonths = new Set([m]);
  } else {
    _mpSelYears = new Set([y - 1]);
  }
  _mpRefreshAll();
}

function mpNext() {
  if (_mpSelYears.size !== 1) return;
  let y = [..._mpSelYears][0];
  if (_mpSelMonths.size === 1) {
    let m = [..._mpSelMonths][0];
    m++;
    if (m > 11) { m = 0; y++; }
    _mpSelYears = new Set([y]);
    _mpSelMonths = new Set([m]);
  } else {
    _mpSelYears = new Set([y + 1]);
  }
  _mpRefreshAll();
}

function updateMonthPickerBtn() {
  const info = _mpBtnHtml();
  ['p','c'].forEach(src => {
    const btn = document.getElementById('mp-btn-' + src);
    const label = document.getElementById('mp-label-' + src);
    if (!btn || !label) return;
    if (info.active) {
      label.innerHTML = info.html;
      btn.classList.add('active');
    } else {
      label.textContent = t('filter.allMonths');
      btn.classList.remove('active');
    }
  });
}

// ----- [M10-COMBO] Combobox searchable con multi-selecci\u00f3n ---------------------------------------

/**
 * @description Rellena un combobox con las opciones disponibles.
 * @param {string} id - ID del combo ('platform', 'aloj')
 * @param {string[]} items - Array de opciones \u00fanicas
 */
function populateCombo(id, items) {
  comboState[id].options = items;
  comboState[id].selected = new Set();
  updateComboDisplay(id);
}

function openCombo(id) {
  document.querySelectorAll('.combo-list').forEach(l => l.classList.remove('open'));
  document.querySelectorAll('.mp-dd').forEach(l => l.classList.remove('open'));
  const input = document.querySelector(`#combo-${id} .combo-input`);
  input.value = '';
  input.select();
  renderComboList(id, '');
  document.getElementById(`combo-list-${id}`).classList.add('open');
}

function filterCombo(id) {
  const input = document.querySelector(`#combo-${id} .combo-input`);
  renderComboList(id, input.value);
  document.getElementById(`combo-list-${id}`).classList.add('open');
}

function renderComboList(id, query) {
  const list = document.getElementById(`combo-list-${id}`);
  const q = query.toLowerCase().trim();
  const items = comboState[id].options;
  let filtered = items;
  if (q) filtered = items.filter(i => i.toLowerCase().includes(q));
  const sel = comboState[id].selected;

  const countFn = id === 'platform'
    ? (v) => allReservas.filter(r => r.plataforma === v).length
    : (v) => allReservas.filter(r => r.alojamiento === v).length;

  const allChecked = sel.size === 0;
  let html = `<label class="combo-selall" onclick="event.stopPropagation()"><input type="checkbox" ${allChecked?'checked':''} onchange="toggleComboAll('${id}', this.checked)"> ${comboLabels[id]} <span class="combo-item-count">(${allReservas.length})</span></label>`;
  if (filtered.length === 0) {
    html += '<div class="combo-empty">Sin resultados</div>';
  } else {
    filtered.forEach(item => {
      const isChecked = sel.has(item);
      let label = item;
      if (q) {
        const idx = item.toLowerCase().indexOf(q);
        if (idx >= 0) label = item.slice(0, idx) + '<span class="match">' + item.slice(idx, idx + q.length) + '</span>' + item.slice(idx + q.length);
      }
      const count = countFn(item);
      const esc = item.replace(/'/g, "\\'");
      html += `<label class="combo-item-chk" onclick="event.stopPropagation()"><input type="checkbox" ${isChecked?'checked':''} onchange="toggleComboItem('${id}','${esc}',this.checked)"> ${label} <span class="combo-item-count">(${count})</span></label>`;
    });
  }
  list.innerHTML = html;
}

function toggleComboItem(id, item, checked) {
  const sel = comboState[id].selected;
  if (checked) sel.add(item); else sel.delete(item);
  updateComboDisplay(id);
  invalidateFilterCache(); _currentPage = 1; renderTable();
  // Re-render list to update checkboxes
  const input = document.querySelector(`#combo-${id} .combo-input`);
  renderComboList(id, '');
}

function toggleComboAll(id, checked) {
  if (checked) {
    comboState[id].selected = new Set();
  } else {
    comboState[id].selected = new Set(comboState[id].options);
  }
  updateComboDisplay(id);
  invalidateFilterCache(); _currentPage = 1; renderTable();
  renderComboList(id, '');
}

function updateComboDisplay(id) {
  const input = document.querySelector(`#combo-${id} .combo-input`);
  const wrap = document.getElementById(`combo-${id}`);
  const sel = comboState[id].selected;
  if (sel.size === 0) {
    input.value = '';
    input.placeholder = comboLabels[id];
    wrap.classList.remove('has-value');
  } else if (sel.size === 1) {
    input.value = [...sel][0];
    wrap.classList.add('has-value');
  } else {
    const noun = id === 'platform' ? 'plataformas' : 'alojamientos';
    input.value = sel.size + ' ' + noun;
    wrap.classList.add('has-value');
  }
}

function clearCombo(id) {
  comboState[id].selected = new Set();
  updateComboDisplay(id);
  document.getElementById(`combo-list-${id}`).classList.remove('open');
  invalidateFilterCache(); _currentPage = 1; renderTable();
}

// \u2500\u2500\u2500 SIMPLE COMBO SYSTEM (for status, sort, sortdir) \u2500\u2500\u2500
const simpleComboState = {
  status: { value: 'all', label: t('status.all') },
  sort: { value: 'idx', label: t('sort.original') },
  sortdir: { value: 'asc', label: '&#8593;' },
  consolsort: { value: 'name', label: t('sort.nameAZ') }
};
const simpleComboOptions = {
  status: [
    { value: 'all', label: t('status.all') },
    { value: 'pending', label: t('status.pendingPl') },
    { value: 'validated', label: t('status.validatedPl') }
  ],
  sort: [
    { value: 'idx', label: t('sort.original') },
    { value: 'estado', label: t('sort.status') },
    { value: 'idReserva', label: t('sort.idReserva') },
    { value: 'localizador', label: t('sort.localizador') },
    { value: 'fechaAlta', label: t('sort.fechaAlta') },
    { value: 'cliente', label: t('sort.cliente') },
    { value: 'alojamiento', label: t('sort.alojamiento') },
    { value: 'edificio', label: t('sort.edificio') },
    { value: 'plataforma', label: t('sort.plataforma') },
    { value: 'atendidoPor', label: t('sort.atendidoPor') },
    { value: 'origenMarketing', label: t('sort.origenMkt') },
    { value: 'tipoReserva', label: t('sort.tipoReserva') },
    { value: 'fechaEntrada', label: t('sort.fechaEntrada') },
    { value: 'fechaSalida', label: t('sort.fechaSalida') },
    { value: 'noches', label: t('sort.nights') },
    { value: 'totalReserva', label: t('sort.totalReserva') },
    { value: 'baseSinIVA', label: t('sort.baseNoVAT') },
    { value: 'subtotal', label: t('sort.subtotal') },
    { value: 'totalLiquidar', label: t('sort.totalToSettle') },
    { value: 'observacion', label: t('sort.observation') }
  ],
  sortdir: [
    { value: 'asc', label: t('sort.ascending') },
    { value: 'desc', label: t('sort.descending') }
  ],
  consolsort: [
    { value: 'name', label: t('sort.nameAZ') },
    { value: 'name-desc', label: t('sort.nameZA') },
    { value: 'reservas-desc', label: t('sort.moreReservations') },
    { value: 'reservas-asc', label: t('sort.lessReservations') },
    { value: 'liq-desc', label: t('sort.higherSettlement') },
    { value: 'liq-asc', label: t('sort.lowerSettlement') },
    { value: 'total-desc', label: t('sort.higherBilling') },
    { value: 'total-asc', label: t('sort.lowerBilling') }
  ]
};

function openSimpleCombo(id) {
  document.querySelectorAll('.combo-list').forEach(l => l.classList.remove('open'));
  const list = document.getElementById(`combo-list-${id}`);
  const opts = simpleComboOptions[id];
  const current = simpleComboState[id].value;
  list.innerHTML = opts.map(o =>
    `<div class="combo-item ${o.value===current?'active':''}" onclick="selectSimpleCombo('${id}','${o.value}')">${o.label}</div>`
  ).join('');
  list.classList.add('open');
}

function selectSimpleCombo(id, value) {
  const opt = simpleComboOptions[id].find(o => o.value === value);
  simpleComboState[id].value = value;
  simpleComboState[id].label = opt ? opt.label : value;
  const input = document.querySelector(`#combo-${id} .combo-input`);
  const wrap = document.getElementById(`combo-${id}`);
  if (id === 'status') {
    if (value === 'all') {
      input.value = ''; input.placeholder = t('filter.allStatuses'); wrap.classList.remove('has-value');
    } else {
      input.value = opt.label; wrap.classList.add('has-value');
    }
  } else if (id === 'sort') {
    if (value === 'idx') {
      input.value = ''; input.placeholder = t('sort.originalOrder'); wrap.classList.remove('has-value');
    } else {
      input.value = opt.label; wrap.classList.add('has-value');
    }
  } else if (id === 'sortdir') {
    if (value === 'asc') {
      input.value = ''; input.placeholder = '\u2191'; wrap.classList.remove('has-value');
    } else {
      input.value = '\u2193'; wrap.classList.add('has-value');
    }
  } else if (id === 'consolsort') {
    if (value === 'name') {
      input.value = ''; input.placeholder = t('sort.nameAsc'); wrap.classList.remove('has-value');
    } else {
      input.value = opt.label; wrap.classList.add('has-value');
    }
  }
  document.getElementById(`combo-list-${id}`).classList.remove('open');
  if (id === 'consolsort') { renderConsolGrid(); }
  else { _currentPage = 1; renderTable(); }
}

function clearSimpleCombo(id) {
  const defaults = { status: 'all', sort: 'idx', sortdir: 'asc', consolsort: 'name' };
  selectSimpleCombo(id, defaults[id] || 'all');
}

// Close all combos on outside click
document.addEventListener('click', function(e) {
  // Close column toggles
  document.querySelectorAll('.col-toggle-wrap').forEach(ctw => {
    if (!ctw.contains(e.target)) {
      const dd = ctw.querySelector('.col-toggle-dd');
      if (dd) dd.classList.remove('open');
    }
  });
  // Close month pickers
  ['p','c'].forEach(src => {
    const mpWrap = document.getElementById('mp-wrap-' + src);
    if (mpWrap && !mpWrap.contains(e.target)) {
      document.getElementById('mp-dd-' + src).classList.remove('open');
    }
  });
  document.querySelectorAll('.combo').forEach(c => {
    if (!c.contains(e.target)) {
      c.querySelector('.combo-list').classList.remove('open');
      const id = c.id.replace('combo-', '');
      // Restore display for searchable combos
      if (comboState[id]) updateComboDisplay(id);
    }
  });
});

// Keyboard nav for combos
document.querySelectorAll('.combo-input').forEach(input => {
  input.addEventListener('keydown', function(e) {
    const id = this.closest('.combo').id.replace('combo-', '');
    const list = document.getElementById(`combo-list-${id}`);
    if (e.key === 'Escape') { list.classList.remove('open'); this.blur(); }
  });
});

// ==============================================================================================================================
//  [M18] AI_ASSISTANT ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â Chat con IA integrado (Claude API)
// ==============================================================================================================================

