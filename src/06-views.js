function viewDetail(idx) {
  currentDetailIdx = idx;
  const r=allReservas.find(x=>x.idx===idx); if(!r)return;
  const s=settings[r.idx]||{},c=calcLiquidacion(r,s),isV=validated.has(r.idx),isB=r.plataforma==="Booking.com";
  const pasL=isB?"Booking":"Stripe",pasR=s.pasarelaRate!==undefined?s.pasarelaRate:(isB?pasarelaBookingOptions[pasarelaBookingOptions.length-1]/100:pasarelaStripeOptions[pasarelaStripeOptions.length-1]/100);
  const _vd = (idx, key) => `changeSetting(${idx},'${key}',parseFloat(this.value));viewDetail(${idx})`;
  const _sel = (opts, current, idx, key, unitPct) => {
    if(isV) return unitPct ? `(${(current*100).toFixed(1)}%)` : ``;
    return `<select class="liq-sel" onchange="${_vd(idx,key)}">` +
      opts.map(o => { const v = unitPct ? o/100 : o;
        return `<option value="${v}" ${Math.abs(current-v)<0.0001?'selected':''}>${unitPct?o+'%':o+' &#8364;'}</option>`;
      }).join('') + `</select>`;
  };
  const fv = (v) => { const d = v < 0 ? `\u2212 ${fmt(Math.abs(v))}` : (v > 0 ? `+ ${fmt(v)}` : fmt(v)); return d + ' \u20AC'; };
  const platOpts = platformOptions[r.plataforma]||[10];
  const pasOpts = isB ? pasarelaBookingOptions : pasarelaStripeOptions;
  const _prop = getPropietario(r.alojamiento);
  const _propStyle = _prop === t('consol.missingOwner') ? ' style="color:#c0392b;cursor:pointer" ' : ' style="cursor:pointer" ';
  const _propClick = `editPropietarioInline('${r.alojamiento.replace(/'/g,"\\'")}', this)`;

  // Compute period string
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

  // Build pasarela row HTML
  let pasHtml = '';
  if (!isV) {
    const pasSelHtml = s.pasarela ? _sel(pasOpts, pasR, r.idx, 'pasarelaRate', true) : '';
    const lblStyle = s.pasarela ? '' : ' style="color:#9ca8ab;opacity:0.5"';
    const valCls = s.pasarela ? 'liq-pas-val' : 'liq-pas-val off';
    const trackCls = s.pasarela ? 'liq-sw-track on' : 'liq-sw-track';
    pasHtml = `<div class="liq-pas-row"><div class="liq-pas-left">` +
      `<div class="liq-sw" onclick="togglePasarela(${r.idx});viewDetail(${r.idx})"><div class="${trackCls}"><div class="liq-sw-thumb"></div></div></div>` +
      `<span${lblStyle}>${t('liq.gateway')} ${pasL} ${pasSelHtml}</span></div>` +
      `<span class="${valCls}">${fv(-c.comPas)}</span></div>`;
  } else if (s.pasarela) {
    pasHtml = `<div class="liq-row"><span>${t('liq.gatewayPayment')} ${pasL} (${(pasR*100).toFixed(1)}%)</span><span class="liq-val neg">${fv(-c.comPas)}</span></div>`;
  }

  // Build CE2 section
  let ce2Html = '';
  if (c.ceSinIvaTotal > 0) {
    const ce2Items = s.conceptosSinIVA || [];
    let ce2Rows = '';
    ce2Items.forEach(function(item) {
      if (item.amount > 0) ce2Rows += `<div class="liq-row"><span><span class="liq-ce2-dot"></span>${esc(item.label || t('liq.noName'))}</span><span class="liq-val">${fv(-item.amount)}</span></div>`;
    });
    if (ce2Rows) {
      ce2Html = `<div class="liq-ce2"><div class="liq-sec-label">${t('liq.specialConcepts')}</div>${ce2Rows}</div>`;
    }
  }

  document.getElementById("detail-content").innerHTML=`<div class="liq-container print-target" id="print-zone">
    <div class="liq-gold-bar-top"></div>
    <div class="liq-header"><div class="liq-header-top"><div><div class="type">${isV?t('liq.settlement'):t('liq.reservation')}</div><div class="name"${_propStyle} title="Clic para editar propietario" onclick="${_propClick}">${_prop}</div></div>
    <div style="display:flex;align-items:center;gap:12px;"><div class="liq-period-badge"><div class="liq-period-label">${t('liq.settlement')}</div><div class="liq-period-value">${_periodStr}</div></div><div class="liq-header-logo"><span class="logo-main">h\u00F4mity</span><span class="logo-sub">holidays</span></div>
    ${isV?'<span class="badge-liq badge-liq-green">&#10003; ' + t('status.validated') + '</span>':'<span class="badge-liq badge-liq-amber">' + t('status.pending') + '</span>'}</div></div>
    <div class="liq-meta-strip"><div class="liq-meta-item"><div class="liq-meta-label">${t("col.alojamiento")}</div><div class="liq-meta-value cpv" data-cpv="${esc(r.alojamiento)}" onclick="copyVal(this.dataset.cpv,this)">${esc(r.alojamiento)}${_cpvSvg}</div></div>
    <div class="liq-meta-item"><div class="liq-meta-label">${t("sort.fechaEntrada")}</div><div class="liq-meta-value">${formatDate(r.fechaEntrada)} &#8594; ${formatDate(r.fechaSalida)}</div></div>
    <div class="liq-meta-item"><div class="liq-meta-label">${t("liq.salesChannel")}</div><div class="liq-meta-value">${r.plataforma}</div></div>
    <div class="liq-meta-item"><div class="liq-meta-label">${t("sort.idReserva")}</div><div class="liq-meta-value cpv" data-cpv="${r.id}" onclick="copyVal(this.dataset.cpv,this)">${r.id}${_cpvSvg}</div></div>
    <div class="liq-meta-item"><div class="liq-meta-label">${t("sort.localizador")}</div><div class="liq-meta-value sm cpv" data-cpv="${r.localizador}" onclick="copyVal(this.dataset.cpv,this)">${r.localizador}${_cpvSvg}</div></div>
    <div class="liq-meta-item"><div class="liq-meta-label">${t("col.edificio")}</div><div class="liq-meta-value">${esc(r.edificio)}</div></div></div></div>
    <div class="liq-sec">
      <div class="liq-row bold"><span>${t('liq.totalVAT')}</span><span class="liq-val">${fv(c.total)}</span></div>
      <div class="liq-row"><span>${t('liq.vatReservation')} (${(IVA_RESERVA*100).toFixed(0)}%)</span><span class="liq-val neg">${fv(-(c.total-c.baseSinIVA))}</span></div>
      <div class="liq-row bold"><span>${t('liq.baseNoVAT')}</span><span class="liq-val">${fv(c.baseSinIVA)}</span></div>
    </div>
    <div class="liq-sec">
      <div class="liq-sec-label">${t('liq.salesOps')}</div>
      <div class="liq-row"><span>${t('liq.salesChannel')} ${esc(r.plataforma)} ${_sel(platOpts, c.comRate, r.idx, 'comPlataforma', true)}</span><span class="liq-val neg">${fv(-c.comPlat)}</span></div>
      <div class="liq-row"><span>${t('liq.gtcMgmt')} ${_sel(gtcOptions, c.gtcRate, r.idx, 'comGTC', true)}</span><span class="liq-val neg">${fv(-c.comGTC)}</span></div>
      <div class="liq-row"><span>${t('liq.cleaning')} ${_sel(cleaningOptions, c.limp, r.idx, 'limpieza', false)}</span><span class="liq-val neg">${fv(-c.limp)}</span></div>
      <div class="liq-row"><span>${t('liq.amenities')} ${_sel(amenitiesOptions, c.amen, r.idx, 'amenities', false)}</span><span class="liq-val neg">${fv(-c.amen)}</span></div>
      <div class="liq-divider"></div>
      ${pasHtml}
    </div>
    ${ce2Html}
    <div class="liq-sec">
      <div class="liq-subtotal-bar"><span>${t('liq.subtotal')}</span><span>${fv(c.sub)}</span></div>
      <div class="liq-row" style="margin-top:8px"><span>${t('liq.irpfWithholding')} ${_sel(irpfOptions, c.irpfRate, r.idx, 'irpf', true)}</span><span class="liq-val neg">${fv(-c.ret)}</span></div>
      <div class="liq-row"><span>${t('liq.vatSubtotal')} (${(IVA_SUBTOTAL*100).toFixed(0)}%)</span><span class="liq-val pos">${fv(c.iva)}</span></div>
    </div>
    <div class="liq-total-bar"><div class="liq-total"><div><span class="liq-total-label">${t("liq.totalToSettle")}</span><div class="liq-total-label-sub">${t("liq.monthlySettlement")}</div></div><span class="liq-total-value cpv" data-cpv="${fmt(c.totalLiq)}" onclick="event.stopPropagation();copyVal(this.dataset.cpv,this)">${fmt(c.totalLiq)} \u20AC${_cpvSvg}</span></div></div>
    <div class="liq-gold-bar-bottom"></div></div>
    <div class="liq-actions no-print">
      ${!isV?`<button class="btn btn-orange" onclick="toggleValidate(${r.idx})">&#10003; ${t('btn.validate')}</button>`:`<button class="btn btn-success" onclick="toggleValidate(${r.idx})">&#8617; ${t('btn.unvalidate')}</button>`}
      <button class="btn btn-outline" onclick="window.print()">&#128424; ${t('btn.print')}</button></div>`;
  document.getElementById("nav-detail").style.display="block"; showScreen("detail");
}


// \u2500\u2500\u2500 CONSOLIDATED GRID \u2500\u2500\u2500
let _alojCache = null;
// ==============================================================================================================================
//  [M14] CONSOL_VIEW ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â Vista consolidada por alojamiento
// ==============================================================================================================================

/** @description Invalida la cach\u00e9 de agrupaci\u00f3n por alojamiento */
function invalidateAlojCache() { _alojCache = null; }
/**
 * @description Agrupa reservas por alojamiento para la vista consolidada.
 * Solo incluye reservas VALIDADAS. Usa cach\u00e9 para evitar rec\u00e1lculos.
 * @returns {Object.<string, Object>} Mapa alojamiento  ->  { items[], totalR, totalL }
 */
function getAlojamientos() {
  if (_alojCache) return _alojCache;
  const map = {};
  allReservas.forEach(r => {
    if (!map[r.alojamiento]) map[r.alojamiento] = { name: r.alojamiento, edificio: r.edificio, reservas: [] };
    map[r.alojamiento].reservas.push(r);
  });
  _alojCache = Object.values(map).sort((a, b) => a.name.localeCompare(b.name));
  return _alojCache;
}

/**
 * @description Renderiza el grid de tarjetas de alojamientos (pantalla "consol").
 * Agrupa reservas validadas por alojamiento y muestra stats por tarjeta.
 */
function renderConsolGrid() {
  const alojamientos = getAlojamientos();

  // Apply date filter helper
  function filterByDate(reservas) {
    if (!_mpHasFilter()) return reservas;
    return reservas.filter(r => _mpMatchDate(r._dEntrada));
  }

  let totalAloj = 0, readyCount = 0, totalLiq = 0;

  // Pre-compute stats for sorting (with date-filtered reservas)
  let alojData = alojamientos.map(a => {
    const filtered = filterByDate(a.reservas);
    if (filtered.length === 0) return null; // hide alojamientos with 0 reservas in range
    const total = filtered.length;
    const valCount = filtered.filter(r => validated.has(r.idx)).length;
    const allVal = valCount === total;
    const sumReservas = filtered.reduce((s, r) => s + r.totalReserva, 0);
    const sumLiq = filtered.reduce((s, r) => s + getLiq(r).totalLiq, 0);
    return { ...a, reservas: filtered, total, valCount, allVal, sumReservas, sumLiq };
  }).filter(Boolean);

  // Text search filter for consol
  if (_searchTextConsol) {
    const s = _searchTextConsol;
    alojData = alojData.filter(a => {
      // Search in alojamiento name and edificio
      if (a.name.toLowerCase().includes(s) || (a.edificio||'').toLowerCase().includes(s)) return true;
      // Search in any reservation field within this alojamiento
      return a.reservas.some(r => {
        const c = getLiq(r);
        return r._clienteLc.includes(s) || r.id.toLowerCase().includes(s) ||
        r.localizador.toLowerCase().includes(s) || r._platLc.includes(s) ||
        (r.atendidoPor||'').toLowerCase().includes(s) ||
        (r.observacion||'').toLowerCase().includes(s) ||
        r._fmtEntrada.includes(s) || r._fmtSalida.includes(s) ||
        fmt(r.totalReserva).includes(s) || fmt(c.totalLiq).includes(s) ||
        fmt(c.baseSinIVA).includes(s) || String(r.totalReserva).includes(s);
      });
    });
  }

  // Compute stats after all filters
  alojData.forEach(a => {
    totalAloj++;
    if (a.allVal) readyCount++;
    totalLiq += a.sumLiq;
  });

  // Sort: toggle takes priority, then dropdown sort as tiebreaker
  const sortMode = simpleComboState.consolsort.value;
  const _vtMode = _consolValToggle; // 'noval' | 'val' | null
  alojData.sort((a, b) => {
    // Primary: toggle-based validation sort
    if (_vtMode === 'noval') {
      const d = (a.allVal?1:0) - (b.allVal?1:0);
      if (d !== 0) return d;
    } else if (_vtMode === 'val') {
      const d = (b.allVal?1:0) - (a.allVal?1:0);
      if (d !== 0) return d;
    }
    // Secondary: dropdown sort
    switch(sortMode) {
      case 'name': return a.name.localeCompare(b.name);
      case 'name-desc': return b.name.localeCompare(a.name);
      case 'reservas-desc': return b.total - a.total || a.name.localeCompare(b.name);
      case 'reservas-asc': return a.total - b.total || a.name.localeCompare(b.name);
      case 'liq-desc': return b.sumLiq - a.sumLiq || a.name.localeCompare(b.name);
      case 'liq-asc': return a.sumLiq - b.sumLiq || a.name.localeCompare(b.name);
      case 'total-desc': return b.sumReservas - a.sumReservas || a.name.localeCompare(b.name);
      case 'total-asc': return a.sumReservas - b.sumReservas || a.name.localeCompare(b.name);
      default: return a.name.localeCompare(b.name);
    }
  });

  // Render position badges for top sorts
  const showRank = ['reservas-desc','liq-desc','total-desc'].includes(sortMode);

  // Counts for toggle badges
  const pendingCount = alojData.filter(a => !a.allVal).length;
  const readyCountBadge = alojData.filter(a => a.allVal).length;

  let cardsHTML = '';
  alojData.forEach((a, idx) => {
    const pct = a.total > 0 ? (a.valCount / a.total * 100) : 0;
    const barColor = a.allVal ? '#43a047' : '#ff9800';
    const rankBadge = showRank ? `<div style="position:absolute;top:12px;left:12px;width:24px;height:24px;border-radius:12px;background:${idx<3?'#4f8cff':'#e0e4ea'};color:${idx<3?'#fff':'#6b7280'};font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;">${idx+1}</div>` : '';
    // Dimmed: when toggle is active, dim the non-priority group
    const dimmed = _vtMode !== null && (
      (_vtMode === 'noval' && a.allVal) || (_vtMode === 'val' && !a.allVal)
    );

    cardsHTML += `
      <div class="aloj-card ${a.allVal ? 'ready' : 'pending'}${dimmed ? ' dimmed' : ''}" onclick="viewConsolDetail('${a.name.replace(/'/g, "\\'")}')">
        ${rankBadge}
        <div class="aloj-semaforo">${a.allVal ? '&#128994;' : '&#128992;'}</div>
        <div class="aloj-name" ${showRank?'style="padding-left:28px;"':''}>${a.name}</div>
        <div class="aloj-edificio">${a.edificio}</div>
        <div class="aloj-stats">
          <div><div class="aloj-stat-label">${t('consol.reservations')}</div><div class="aloj-stat-value">${a.total}</div></div>
          <div><div class="aloj-stat-label">${t('consol.billing')}</div><div class="aloj-stat-value" style="font-size:14px;color:#1a2744">${fmt(a.sumReservas)} \u20AC</div></div>
          <div><div class="aloj-stat-label">${t('consol.toSettle')}</div><div class="aloj-stat-value" style="color:#4f8cff;font-size:14px">${fmt(a.sumLiq)} \u20AC</div></div>
        </div>
        <div class="aloj-bar"><div class="aloj-bar-fill" style="width:${pct}%;background:${barColor};"></div></div>
      </div>`;
  });

  // Compute total facturacion
  const totalFact = alojData.reduce((s, a) => s + a.sumReservas, 0);

  document.getElementById("consol-stats").innerHTML = `
    <div class="stat-card"><div class="stat-label">${t("stats.properties")}</div><div class="stat-value">${totalAloj}</div></div>
    <div class="stat-card"><div class="stat-label">${t("stats.totalBilling")}</div><div class="stat-value" style="color:#1a2744">${fmt(totalFact)} \u20AC</div></div>
    <div class="stat-card"><div class="stat-label">${t("stats.totalToSettle")}</div><div class="stat-value" style="color:#4f8cff">${fmt(totalLiq)} \u20AC</div></div>
    <div class="stat-card"><div class="stat-label">${t("stats.readyToSettle")}</div><div class="stat-value" style="color:#43a047">${readyCount} / ${totalAloj}</div></div>`;
  document.getElementById("aloj-grid").innerHTML = cardsHTML;

  // Update validation toggle buttons and counts
  const btnNo = document.getElementById('vt-btn-noval');
  const btnYes = document.getElementById('vt-btn-val');
  if (btnNo && btnYes) {
    btnNo.classList.toggle('active', _vtMode === 'noval');
    btnYes.classList.toggle('active', _vtMode === 'val');
    document.getElementById('vt-count-noval').textContent = pendingCount;
    document.getElementById('vt-count-val').textContent = readyCountBadge;
  }
}

// \u2500\u2500\u2500 CONSOLIDATED DETAIL \u2500\u2500\u2500
function buildComPlatRows(calcs) {
  const groups = {};
  calcs.forEach(x => {
    const key = x.r.plataforma + '|' + (x.c.comRate * 100).toFixed(1);
    if (!groups[key]) groups[key] = { plat: x.r.plataforma, rate: x.c.comRate, sum: 0, count: 0 };
    groups[key].sum += x.c.comPlat;
    groups[key].count++;
  });
  const entries = Object.values(groups);
  if (entries.length === 1) {
    const g = entries[0];
    return `<div class="consol-row"><span>${t('liq.salesChannel')} ${g.plat} (${(g.rate*100).toFixed(1)}%) &#8212; ${g.count} ${g.count>1?t('consol.reservations'):t('consol.reservation')}</span><span class="neg">- ${fmt(g.sum)} &#8364;</span></div>`;
  }
  let html = '';
  let total = 0;
  entries.forEach(g => {
    html += `<div class="consol-row sub"><span>${g.plat} (${(g.rate*100).toFixed(1)}%) &#8212; ${g.count} ${g.count>1?t('consol.reservations'):t('consol.reservation')}</span><span class="neg">- ${fmt(g.sum)} &#8364;</span></div>`;
    total += g.sum;
  });
  return `<div class="consol-row"><span>${t('liq.salesChannel')}</span><span class="neg">- ${fmt(total)} &#8364;</span></div>` + html;
}

function buildGTCRows(calcs) {
  const groups = {};
  calcs.forEach(x => {
    const rate = x.c.gtcRate;
    const key = (rate * 100).toFixed(0);
    if (!groups[key]) groups[key] = { rate, sum: 0, count: 0 };
    groups[key].sum += x.c.comGTC;
    groups[key].count++;
  });
  const entries = Object.values(groups);
  if (entries.length === 1) {
    const g = entries[0];
    return `<div class="consol-row"><span>${t('liq.gtcMgmt')} (${(g.rate*100).toFixed(0)}%) &#8212; ${g.count} ${g.count>1?t('consol.reservations'):t('consol.reservation')}</span><span class="neg">- ${fmt(g.sum)} &#8364;</span></div>`;
  }
  let html = '', total = 0;
  entries.forEach(g => {
    html += `<div class="consol-row sub"><span>GTC al ${(g.rate*100).toFixed(0)}% &#8212; ${g.count} ${g.count>1?t('consol.reservations'):t('consol.reservation')}</span><span class="neg">- ${fmt(g.sum)} &#8364;</span></div>`;
    total += g.sum;
  });
  return `<div class="consol-row"><span>${t('liq.gtcMgmt')}</span><span class="neg">- ${fmt(total)} &#8364;</span></div>` + html;
}

function buildPasarelaRows(calcs) {
  const withPas = calcs.filter(x => x.s.pasarela && x.c.comPas > 0);
  if (withPas.length === 0) return '';
  const groups = {};
  withPas.forEach(x => {
    const isB = x.r.plataforma === 'Booking.com';
    const label = isB ? 'Booking' : 'Stripe';
    const rate = x.s.pasarelaRate || (isB ? pasarelaBookingOptions[pasarelaBookingOptions.length-1]/100 : pasarelaStripeOptions[pasarelaStripeOptions.length-1]/100);
    const key = label + '|' + (rate * 100).toFixed(1);
    if (!groups[key]) groups[key] = { label, rate, sum: 0, count: 0 };
    groups[key].sum += x.c.comPas;
    groups[key].count++;
  });
  const entries = Object.values(groups);
  if (entries.length === 1) {
    const g = entries[0];
    return `<div class="consol-row"><span>${t('liq.paymentGateway')} ${g.label} (${(g.rate*100).toFixed(1)}%) &#8212; ${g.count} ${g.count>1?t('consol.reservations'):t('consol.reservation')}</span><span class="neg">- ${fmt(g.sum)} &#8364;</span></div>`;
  }
  let html = '', total = 0;
  entries.forEach(g => {
    html += `<div class="consol-row sub"><span>${g.label} (${(g.rate*100).toFixed(1)}%) &#8212; ${g.count} ${g.count>1?t('consol.reservations'):t('consol.reservation')}</span><span class="neg">- ${fmt(g.sum)} &#8364;</span></div>`;
    total += g.sum;
  });
  return `<div class="consol-row"><span>${t('liq.paymentGateway')}</span><span class="neg">- ${fmt(total)} &#8364;</span></div>` + html;
}

function buildIrpfRows(calcs) {
  const groups = {};
  calcs.forEach(x => {
    const rate = x.c.irpfRate;
    const key = (rate * 100).toFixed(0);
    if (!groups[key]) groups[key] = { rate, sum: 0, count: 0 };
    groups[key].sum += x.c.ret;
    groups[key].count++;
  });
  const entries = Object.values(groups);
  if (entries.length === 1) {
    const g = entries[0];
    return `<div class="consol-row"><span>${t('liq.irpfWithholding')} (${(g.rate*100).toFixed(0)}%) &#8212; ${g.count} ${g.count>1?t('consol.reservations'):t('consol.reservation')}</span><span class="neg">- ${fmt(g.sum)} &#8364;</span></div>`;
  }
  let html = '', total = 0;
  entries.forEach(g => {
    html += `<div class="consol-row sub"><span>IRPF al ${(g.rate*100).toFixed(0)}% &#8212; ${g.count} ${g.count>1?t('consol.reservations'):t('consol.reservation')}</span><span class="neg">- ${fmt(g.sum)} &#8364;</span></div>`;
    total += g.sum;
  });
  return `<div class="consol-row"><span>${t('liq.irpfWithholding')}</span><span class="neg">- ${fmt(total)} &#8364;</span></div>` + html;
}

function buildLimpRows(calcs) {
  const groups = {};
  calcs.forEach(x => {
    const v = x.c.limp;
    const key = v.toFixed(0);
    if (!groups[key]) groups[key] = { val: v, sum: 0, count: 0 };
    groups[key].sum += v;
    groups[key].count++;
  });
  const entries = Object.values(groups);
  if (entries.length === 1) {
    const g = entries[0];
    return `<div class="consol-row"><span>${t('liq.cleaning')} (${g.count} &#215; ${fmt(g.val)} &#8364;)</span><span class="neg">- ${fmt(g.sum)} &#8364;</span></div>`;
  }
  let html = '', total = 0;
  entries.forEach(g => {
    html += `<div class="consol-row sub"><span>${g.count} &#215; ${fmt(g.val)} &#8364;</span><span class="neg">- ${fmt(g.sum)} &#8364;</span></div>`;
    total += g.sum;
  });
  return `<div class="consol-row"><span>${t('liq.cleaning')}</span><span class="neg">- ${fmt(total)} &#8364;</span></div>` + html;
}

// ==============================================================================================================================
//  [M15] CONSOL_DEDUCT ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â Mantenimiento y extras mensuales por alojamiento
// ==============================================================================================================================

// === Consolidated monthly deductions management ===
function buildPrintDeductionsHtml(alojName, lang) {
  const _en = lang === 'en';
  let maint = getConsolMaint(alojName);
  let extras = getConsolExtras(alojName);
  let h = '';
  if (maint.enabled) {
    h += '<div class="liq-row"><span>' + t('liq.maintenance') + '</span><span class="neg">- ' + fmt(maint.amount) + ' \u20AC</span></div>';
  }
  extras.forEach(function(ex) {
    h += '<div class="liq-row"><span>' + ex.label + '</span><span class="neg">- ' + fmt(ex.amount) + ' \u20AC</span></div>';
  });
  return h;
}

function buildConsolDeductionsHtml(alojName) {
  let maint = getConsolMaint(alojName);
  let extras = getConsolExtras(alojName);
  let esc2 = alojName.replace(/'/g, "\\'");
  let maintSelOpts = maintenanceOptions.map(function(o) {
    return '<option value="'+o+'"'+(o===maint.amount?' selected':'')+'>'+o+' \u20AC</option>';
  }).join('');

  let html = '';

  // Maintenance row ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â same consol-row style
  html += '<div class="consol-row"><span style="display:flex;align-items:center;gap:8px;">';
  html += '<span class="no-print" style="display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:3px;border:2px solid '+(maint.enabled?'#16a34a':'#d1d5db')+';background:'+(maint.enabled?'#16a34a':'#fff')+';color:#fff;font-size:11px;cursor:pointer;" onclick="toggleConsolMaint(\''+esc2+'\')">'+(maint.enabled?'&#10003;':'')+'</span>';
  html += '<span style="'+(maint.enabled?'':'color:#9ca3af;text-decoration:line-through;')+'">'+t('liq.maintenance')+'</span>';
  if (maint.enabled) html += ' <select class="sel no-print" onchange="changeConsolMaintAmount(\''+esc2+'\',this.value)" style="font-size:11px;padding:2px 6px;">'+maintSelOpts+'</select>';
  html += '</span>';
  if (maint.enabled) html += '<span class="neg">- '+fmt(maint.amount)+' \u20AC</span>';
  html += '</div>';

  // Extra concepts ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â CE-style editable rows
  extras.forEach(function(ex, ei) {
    html += '<div class="cex-item-row" style="display:flex;align-items:center;gap:8px;padding:4px 8px;animation:ceRowIn .2s ease;">';
    html += '<input class="cex-inp-label" type="text" value="'+(ex.label||'').replace(/"/g,'&quot;')+'" onchange="updateConsolExtra(\''+esc2+'\','+ei+',\'label\',this.value)" onkeydown="_cexKey(event,\''+esc2+'\',false)" placeholder="'+t('cex.placeholder')+'" style="flex:0 0 50%;border:1.5px solid #e5e7eb;border-radius:5px;padding:5px 8px;font-size:12px;font-family:inherit;outline:none;" />';
    html += '<input class="cex-inp-amt" type="text" value="'+fmt(ex.amount||0)+'" onchange="updateConsolExtra(\''+esc2+'\','+ei+',\'amount\',this.value)" onkeydown="_cexKey(event,\''+esc2+'\',true)" placeholder="0,00" style="width:80px;border:1.5px solid #e5e7eb;border-radius:5px;padding:5px 8px;font-size:12px;font-family:inherit;outline:none;text-align:right;font-weight:600;" />';
    html += '<span style="font-size:12px;color:#6b7280;flex-shrink:0;">\u20AC</span>';
    html += '<button class="ce-del" onclick="removeConsolExtra(\''+esc2+'\','+ei+')" style="width:22px;height:22px;border-radius:5px;border:none;background:#fef2f2;color:#ef4444;cursor:pointer;font-size:13px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">\u00D7</button>';
    html += '<span class="neg" style="margin-left:auto;white-space:nowrap;">- '+fmt(ex.amount||0)+' \u20AC</span>';
    html += '</div>';
  });

  // Add concept link ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â same style as CE
  html += '<div class="no-print" style="padding:4px 8px;">';
  html += '<a class="cex-add-link" onclick="addConsolExtra(\''+esc2+'\')" style="font-size:12px;color:#3b82f6;cursor:pointer;text-decoration:none;">'+t('ce.addItem')+'</a>';
  html += '</div>';

  return html;
}

function toggleConsolMaint(alojName) {
  let m = getConsolMaint(alojName);
  m.enabled = !m.enabled;
  scheduleGlobalConfigSave();
  // Re-render just the maint row + patch totals
  _refreshConsolMaintRow(alojName);
  _patchConsolFinalTotals();
}
function changeConsolMaintAmount(alojName, val) {
  let m = getConsolMaint(alojName);
  m.amount = parseFloat(val) || maintenanceOptions[0];
  scheduleGlobalConfigSave();
  // Patch the displayed neg span in maint row
  var box = document.querySelector('.consol-monthly-box');
  if (box) { var nr = box.querySelector('.consol-row .neg'); if (nr) nr.textContent = '- ' + fmt(m.amount) + ' \u20AC'; }
  _patchConsolFinalTotals();
}
function updateConsolExtra(alojName, idx, field, rawVal) {
  var extras = getConsolExtras(alojName);
  if (!extras[idx]) return;
  if (field === 'label') {
    extras[idx].label = rawVal;
    scheduleGlobalConfigSave();
  } else {
    var v = parseFloat(String(rawVal).replace(/\./g,'').replace(',','.'));
    if (isNaN(v)) v = 0;
    extras[idx].amount = v;
    scheduleGlobalConfigSave();
    _patchConsolFinalTotals();
  }
}
function addConsolExtra(alojName) {
  var extras = getConsolExtras(alojName);
  extras.push({ label: '', amount: 0 });
  scheduleGlobalConfigSave();
  // Append DOM row instead of full re-render
  var box = document.querySelector('.consol-monthly-box');
  if (!box) return;
  var addLink = box.querySelector('.cex-add-link');
  if (!addLink) return;
  var ei = extras.length - 1;
  var esc2 = alojName.replace(/'/g, "\\'");
  var row = document.createElement('div');
  row.className = 'cex-item-row';
  row.style.cssText = 'display:flex;align-items:center;gap:8px;padding:4px 8px;animation:ceRowIn .2s ease;';
  row.innerHTML = '<input class="cex-inp-label" type="text" value="" onchange="updateConsolExtra(\''+esc2+'\','+ei+',\'label\',this.value)" onkeydown="_cexKey(event,\''+esc2+'\',false)" placeholder="'+t('cex.placeholder')+'" style="flex:0 0 50%;border:1.5px solid #e5e7eb;border-radius:5px;padding:5px 8px;font-size:12px;font-family:inherit;outline:none;" />'
    + '<input class="cex-inp-amt" type="text" value="0,00" onchange="updateConsolExtra(\''+esc2+'\','+ei+',\'amount\',this.value)" onkeydown="_cexKey(event,\''+esc2+'\',true)" placeholder="0,00" style="width:80px;border:1.5px solid #e5e7eb;border-radius:5px;padding:5px 8px;font-size:12px;font-family:inherit;outline:none;text-align:right;font-weight:600;" />'
    + '<span style="font-size:12px;color:#6b7280;flex-shrink:0;">\u20AC</span>'
    + '<button class="ce-del" onclick="removeConsolExtra(\''+esc2+'\','+ei+')" style="width:22px;height:22px;border-radius:5px;border:none;background:#fef2f2;color:#ef4444;cursor:pointer;font-size:13px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">\u00D7</button>'
    + '<span class="neg" style="margin-left:auto;white-space:nowrap;">- 0,00 \u20AC</span>';
  var addLinkWrap = addLink.parentNode;
  addLinkWrap.parentNode.insertBefore(row, addLinkWrap);
  var inp = row.querySelector('.cex-inp-label');
  if (inp) inp.focus();
}
function removeConsolExtra(alojName, idx) {
  var box = document.querySelector('.consol-monthly-box');
  if (box) {
    var rows = box.querySelectorAll('.cex-item-row');
    if (rows[idx]) {
      rows[idx].style.animation = 'ceRowOut .2s ease forwards';
      rows[idx].addEventListener('animationend', function() {
        rows[idx].remove();
        var extras = getConsolExtras(alojName);
        if (idx >= 0 && idx < extras.length) extras.splice(idx, 1);
        scheduleGlobalConfigSave();
        // Rebuild onclick/onchange indices on remaining rows
        _rebuildCexIndices(alojName);
        _patchConsolFinalTotals();
      }, {once:true});
      return;
    }
  }
  var extras = getConsolExtras(alojName);
  if (idx >= 0 && idx < extras.length) extras.splice(idx, 1);
  scheduleGlobalConfigSave();
  _patchConsolFinalTotals();
}

function _rebuildCexIndices(alojName) {
  var box = document.querySelector('.consol-monthly-box');
  if (!box) return;
  var esc2 = alojName.replace(/'/g, "\\'");
  var rows = box.querySelectorAll('.cex-item-row');
  rows.forEach(function(row, ei) {
    var lbl = row.querySelector('.cex-inp-label');
    var amt = row.querySelector('.cex-inp-amt');
    var del = row.querySelector('.ce-del');
    if (lbl) {
      lbl.setAttribute('onchange', "updateConsolExtra('"+esc2+"',"+ei+",'label',this.value)");
      lbl.setAttribute('onkeydown', "_cexKey(event,'"+esc2+"',false)");
    }
    if (amt) {
      amt.setAttribute('onchange', "updateConsolExtra('"+esc2+"',"+ei+",'amount',this.value)");
      amt.setAttribute('onkeydown', "_cexKey(event,'"+esc2+"',true)");
    }
    if (del) del.setAttribute('onclick', "removeConsolExtra('"+esc2+"',"+ei+")");
  });
}

function _refreshConsolMaintRow(alojName) {
  var box = document.querySelector('.consol-monthly-box');
  if (!box) return;
  // First child is the maint consol-row
  var maintRow = box.querySelector('.consol-row');
  if (!maintRow) return;
  var maint = getConsolMaint(alojName);
  var esc2 = alojName.replace(/'/g, "\\'");
  var maintSelOpts = maintenanceOptions.map(function(o) {
    return '<option value="'+o+'"'+(o===maint.amount?' selected':'')+'>'+o+' \u20AC</option>';
  }).join('');
  var html = '<span style="display:flex;align-items:center;gap:8px;">';
  html += '<span class="no-print" style="display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:3px;border:2px solid '+(maint.enabled?'#16a34a':'#d1d5db')+';background:'+(maint.enabled?'#16a34a':'#fff')+';color:#fff;font-size:11px;cursor:pointer;" onclick="toggleConsolMaint(\''+esc2+'\')">'+(maint.enabled?'&#10003;':'')+'</span>';
  html += '<span style="'+(maint.enabled?'':'color:#9ca3af;text-decoration:line-through;')+'">'+t('liq.maintenance')+'</span>';
  if (maint.enabled) html += ' <select class="sel no-print" onchange="changeConsolMaintAmount(\''+esc2+'\',this.value)" style="font-size:11px;padding:2px 6px;">'+maintSelOpts+'</select>';
  html += '</span>';
  if (maint.enabled) html += '<span class="neg">- '+fmt(maint.amount)+' \u20AC</span>';
  else html += '';
  maintRow.innerHTML = html;
}

function _refreshConsolDeductionsBox(alojName) {
  var box = document.querySelector('.consol-monthly-box');
  if (!box) return;
  box.innerHTML = '<div class="consol-monthly-title">&#128197; ' + t('consol.otherConcepts') + '</div>' + buildConsolDeductionsHtml(alojName);
}

function _patchConsolFinalTotals() {
  if (!currentConsolAloj) return;
  var data = _getConsolCalcsAndSums(currentConsolAloj);
  if (!data) return;
  var sums = data.sums;
  var _ded = getConsolDeductions(currentConsolAloj);
  var _isSplit = isGtcSplit(currentConsolAloj);
  var _gtcSplitAmt = _isSplit ? sums.sub * GTC_SPLIT_RATE : 0;
  var _ownerBase = _isSplit ? sums.sub - _gtcSplitAmt : sums.sub;
  var adjSub = _ownerBase - _ded.totalBase;
  var avgIrpfRate = sums.sub > 0 ? sums.ret / sums.sub : 0;
  var adjRet = adjSub * avgIrpfRate;
  var adjIva = adjSub * IVA_SUBTOTAL;
  var adjLiq = adjSub - adjRet + adjIva;
  var el;
  el = document.getElementById('csf-subtotal'); if (el) el.innerHTML = '<span>' + t('consol.subtotalFinal') + '</span><span>' + fmt(adjSub) + ' \u20AC</span>';
  el = document.getElementById('csf-irpf'); if (el) el.innerHTML = '<span>' + t('liq.irpfWithholding') + ' (' + (avgIrpfRate*100).toFixed(0) + '%)</span><span class="neg">- ' + fmt(adjRet) + ' \u20AC</span>';
  el = document.getElementById('csf-iva'); if (el) el.innerHTML = '<span>' + t('liq.vatSubtotal') + ' (21%)</span><span class="pos">+ ' + fmt(adjIva) + ' \u20AC</span>';
  el = document.getElementById('csf-total'); if (el) el.innerHTML = '<div class="cd-total-hero-label">' + t('liq.totalToSettleFull') + (_isSplit ? ' \u2014 ' + t('liq.propietario') : '') + '</div><div class="cd-total-hero-amount">' + fmt(adjLiq) + ' <span class="eur">\u20AC</span></div>';
  el = document.getElementById('csf-total-bar'); if (el) { el.querySelector('.cd-total-bar-amount').textContent = fmt(adjLiq) + ' \u20AC'; }
}

function _refreshConsolSummaryBlock() {
  if (!currentConsolAloj) return;
  var data = _getConsolCalcsAndSums(currentConsolAloj);
  if (!data) return;
  var summaryBlock = document.getElementById('consol-summary-block');
  if (summaryBlock) summaryBlock.innerHTML = _buildConsolSummaryInner(data.calcs, data.sums, currentConsolAloj);
}

/**
 * @description Renderiza la liquidaci\u00f3n consolidada completa de un alojamiento.
 * Incluye tabla de reservas, resumen financiero, deducciones mensuales,
 * reparto 80/20 GTC (si aplica), y totales con IRPF/IVA.
 * @param {string} alojName - Nombre del alojamiento
 */
function viewConsolDetail(alojName) {
  currentConsolAloj = alojName;
  const alojamientos = getAlojamientos();
  const a = alojamientos.find(x => x.name === alojName);
  if (!a) return;

  // Apply date filter
  let filteredReservas = a.reservas;
  if (_mpHasFilter()) {
    filteredReservas = a.reservas.filter(r => _mpMatchDate(r._dEntrada));
  }

  const allVal = filteredReservas.every(r => validated.has(r.idx));
  const calcs = filteredReservas.map(r => ({ r, s: settings[r.idx] || {}, c: getLiq(r) }));

  // Sums
  const sumCE = calcs.reduce((s, x) => s + x.c.ceTotal, 0);
  const sumOriginal = calcs.reduce((s, x) => s + x.r.totalReserva, 0);
  const sumTotal = calcs.reduce((s, x) => s + x.c.total, 0);
  const sumBase = calcs.reduce((s, x) => s + x.c.baseSinIVA, 0);
  const sumComPlat = calcs.reduce((s, x) => s + x.c.comPlat, 0);
  const sumComGTC = calcs.reduce((s, x) => s + x.c.comGTC, 0);
  const sumComPas = calcs.reduce((s, x) => s + x.c.comPas, 0);
  const sumLimp = calcs.reduce((s, x) => s + x.c.limp, 0);
  const sumAmen = calcs.reduce((s, x) => s + x.c.amen, 0);
  const sumCE2 = calcs.reduce((s, x) => s + x.c.ceSinIvaTotal, 0);
  const sumSub = calcs.reduce((s, x) => s + x.c.sub, 0);
  const sumIva = calcs.reduce((s, x) => s + x.c.iva, 0);
  const sumRet = calcs.reduce((s, x) => s + x.c.ret, 0);
  const sumLiq = calcs.reduce((s, x) => s + x.c.totalLiq, 0);

  // Sort calcs
  calcs.sort((a,b) => {
    let va = consolGetSortValue(a, consolSortF), vb = consolGetSortValue(b, consolSortF);
    if (typeof va === "string") return consolSortD === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    return consolSortD === "asc" ? va - vb : vb - va;
  });

  // Consolidated table - identical look to main preliquidaciones (without alojamiento)
  let cNoches=0, cTotal=0, cBase=0, cComPlat=0, cComGTC=0, cLimp=0, cAmen=0, cComPas=0, cSub=0, cRet=0, cIva21=0, cLiq=0, cCE=0, cCE2=0;

  let miniRows = calcs.map(x => {
    const r = x.r, c = x.c, s = x.s, isV = validated.has(r.idx), isB = r._isBooking;
    const nights = r._nights;
    const dis = isV ? 'disabled' : '';

    const pO = selectWithValue(_selectCache['plat_'+r.plataforma]||'<option>10%</option>', s.comPlataforma);
    const gO = selectWithValue(_selectCache.gtc, s.comGTC);
    const cO = selectCleanWithValue(_selectCache.clean, s.limpieza);
    const aO = selectCleanWithValue(_selectCache.amenities, s.amenities);
    const iO = selectWithValue(_selectCache.irpf, s.irpf);
    const psO = selectWithValue(isB?_selectCache.pasBooking:_selectCache.pasStripe, s.pasarelaRate);

    cNoches+=nights; cTotal+=r.totalReserva; cBase+=c.baseSinIVA; cComPlat+=c.comPlat; cComGTC+=c.comGTC; cLimp+=c.limp; cAmen+=c.amen; cComPas+=c.comPas; cSub+=c.sub; cRet+=c.ret; cIva21+=c.iva; cLiq+=c.totalLiq; cCE+=c.ceTotal; cCE2+=c.ceSinIvaTotal;

    return `<tr ${isV?'class="validated"':''} id="crow-${r.idx}">
      <td class="cc-estado">${isV?'<span class="badge badge-green">&#10003; ' + t('status.validated') + '</span>':'<span class="badge badge-amber">' + t('status.pending') + '</span>'}</td>
      <td class="cc-idReserva" style="font-size:12px;color:#6b7280;">${_cpv(r.id)}</td>
      <td class="cc-localizador" style="font-size:11px;color:#6b7280;white-space:nowrap;">${_cpv(r.localizador)}</td>
      <td class="cc-fechaAlta" style="font-size:12px;color:#6b7280;">${r._fmtAlta}</td>
      <td class="cc-cliente bold ellip">${esc(r.cliente)}</td>
      <td class="cc-edificio ellip" style="font-size:12px;color:#6b7280;">${esc(r.edificio)}</td>
      <td class="cc-plataforma"><span class="badge ${isB?'badge-purple':'badge-blue'}">${r.plataforma}</span></td>
      <td class="cc-atendidoPor ellip" style="font-size:12px;color:#6b7280;">${esc(r.atendidoPor)}</td>
      <td class="cc-origenMarketing ellip" style="font-size:12px;color:#6b7280;">${esc(r.origenMarketing)}</td>
      <td class="cc-tipoReserva" style="font-size:12px;color:#6b7280;">${esc(r.tipoReserva)}</td>
      <td class="cc-fechaEntrada" style="font-size:12px;white-space:nowrap;">${r._fmtEntrada}</td>
      <td class="cc-fechaSalida" style="font-size:12px;white-space:nowrap;">${r._fmtSalida}</td>
      <td class="cc-noches" style="text-align:center">${nights}</td>
      <td class="cc-totalReserva right bold">${fmt(r.totalReserva)} &#8364;</td>
      <td class="cc-ce" style="text-align:center;vertical-align:middle;">${_buildCEButton(r.idx, c, 'c')}</td>
      <td class="cc-baseSinIVA right" style="color:#6b7280;font-size:12px;">${fmt(c.baseSinIVA)} &#8364;</td>
      <td class="cc-comPlataforma" style="text-align:center;vertical-align:middle;"><div style="display:flex;flex-direction:column;align-items:center;gap:3px;"><select class="sel" onchange="event.stopPropagation();changeSettingConsol(${r.idx},'comPlataforma',parseFloat(this.value))" ${dis}>${pO}</select>
        <span style="font-size:11px;color:#e53935;font-variant-numeric:tabular-nums;">&#8211; ${fmt(c.comPlat)} &#8364;</span></div></td>
      <td class="cc-comGTC" style="text-align:center;vertical-align:middle;"><div style="display:flex;flex-direction:column;align-items:center;gap:3px;"><select class="sel" onchange="event.stopPropagation();changeSettingConsol(${r.idx},'comGTC',parseFloat(this.value))" ${dis}>${gO}</select>
        <span style="font-size:11px;color:#e53935;font-variant-numeric:tabular-nums;">&#8211; ${fmt(c.comGTC)} &#8364;</span></div></td>
      <td class="cc-limpieza" style="text-align:center;vertical-align:middle;"><div style="display:flex;flex-direction:column;align-items:center;gap:3px;"><select class="sel" onchange="event.stopPropagation();changeSettingConsol(${r.idx},'limpieza',parseFloat(this.value))" ${dis}>${cO}</select>
        <span style="font-size:11px;color:#e53935;font-variant-numeric:tabular-nums;">&#8211; ${fmt(c.limp)} &#8364;</span></div></td>
      <td class="cc-amenities" style="text-align:center;vertical-align:middle;"><div style="display:flex;flex-direction:column;align-items:center;gap:3px;"><select class="sel" onchange="event.stopPropagation();changeSettingConsol(${r.idx},'amenities',parseFloat(this.value))" ${dis}>${aO}</select>
        <span style="font-size:11px;color:#e53935;font-variant-numeric:tabular-nums;">&#8211; ${fmt(c.amen)} &#8364;</span></div></td>
      <td class="cc-pasarela" style="text-align:center;vertical-align:middle;"><div style="display:flex;flex-direction:column;align-items:center;gap:3px;"><div style="display:flex;align-items:center;justify-content:center;gap:6px;">
        <div class="toggle" onclick="event.stopPropagation();if(!${isV}){togglePasarelaConsol(${r.idx})}"><div class="toggle-track ${s.pasarela?'on':''}"><div class="toggle-thumb"></div></div></div>
        ${s.pasarela?`<select class="sel" style="width:70px;font-size:11px;padding:4px 6px;" onchange="event.stopPropagation();changeSettingConsol(${r.idx},'pasarelaRate',parseFloat(this.value))" ${dis}>${psO}</select>`:`<span class="toggle-label">${isB?'Booking':'Stripe'}</span>`}
      </div>${s.pasarela&&c.comPas>0?`<span style="font-size:11px;color:#e53935;font-variant-numeric:tabular-nums;">&#8211; ${fmt(c.comPas)} &#8364;</span>`:''}</div></td>
      <td class="cc-ceSinIva" style="text-align:center;vertical-align:middle;">${_buildCE2Button(r.idx, c, 'c')}</td>
      <td class="cc-subtotal right bold" style="font-size:12px;">${fmt(c.sub)} &#8364;</td>
      <td class="cc-irpf" style="text-align:center;vertical-align:middle;"><div style="display:flex;flex-direction:column;align-items:center;gap:3px;"><select class="sel" onchange="event.stopPropagation();changeSettingConsol(${r.idx},'irpf',parseFloat(this.value))" ${dis}>${iO}</select>
        <span style="font-size:11px;color:#e53935;font-variant-numeric:tabular-nums;">&#8211; ${fmt(c.ret)} &#8364;</span></div></td>
      <td class="cc-iva21" style="text-align:center;vertical-align:middle;"><span style="font-size:11px;color:#43a047;font-variant-numeric:tabular-nums;">+ ${fmt(c.iva)} &#8364;</span></td>
      <td class="cc-totalLiquidar right bold" style="color:${c.totalLiq>=0?'#1a2744':'#e53935'}">${fmt(c.totalLiq)} &#8364;</td>
      <td class="cc-observacion ellip" style="font-size:11px;color:#6b7280;max-width:180px;overflow:hidden;text-overflow:ellipsis;" title="${esc(r.observacion)}">${esc(r.observacion)}</td>
      <td class="cc-acciones"><div style="display:flex;gap:6px;">
        ${!isV?`<button class="btn btn-sm btn-orange" onclick="event.stopPropagation();toggleValidateConsol(${r.idx})">&#10004;</button>`:`<button class="btn btn-sm btn-success" onclick="event.stopPropagation();toggleValidateConsol(${r.idx})">&#8617;</button>`}
      </div></td>
    </tr>${_buildCEPanelRow(r.idx, settings[r.idx], c, 'c')}${_buildCE2PanelRow(r.idx, settings[r.idx], c, 'c')}`;
  }).join("");

  // Footer totals - identical dark bar like main table
  const _cfs='border:none;padding:10px 8px;';
  const _cfr='border:none;padding:10px 8px;color:#ff8a80;text-align:center;font-variant-numeric:tabular-nums;';
  const miniTotals = `<tr id="consol-tfoot-row" style="background:#0f1628;color:#fff;font-weight:700;font-size:12px;">
    <td class="cc-estado" style="${_cfs}"></td>
    <td class="cc-idReserva" style="${_cfs}"></td>
    <td class="cc-localizador" style="${_cfs}"></td>
    <td class="cc-fechaAlta" style="${_cfs}"></td>
    <td class="cc-cliente" style="${_cfs}text-align:right;text-transform:uppercase;letter-spacing:0.06em;font-size:11px;color:rgba(255,255,255,0.6);">${t('consol.reservasTotal')} (${calcs.length})</td>
    <td class="cc-edificio" style="${_cfs}"></td>
    <td class="cc-plataforma" style="${_cfs}"></td>
    <td class="cc-atendidoPor" style="${_cfs}"></td>
    <td class="cc-origenMarketing" style="${_cfs}"></td>
    <td class="cc-tipoReserva" style="${_cfs}"></td>
    <td class="cc-fechaEntrada" style="${_cfs}"></td>
    <td class="cc-fechaSalida" style="${_cfs}"></td>
    <td class="cc-noches" style="${_cfs}text-align:center;">${cNoches}</td>
    <td class="cc-totalReserva" style="${_cfs}text-align:right;">${fmt(cTotal)} &#8364;</td>
    <td class="cc-ce" style="${_cfs}text-align:center;color:#d97706;font-size:11px;">${cCE > 0 ? '&#8211; ' + fmt(cCE) + ' &#8364;' : ''}</td>
    <td class="cc-baseSinIVA" style="${_cfs}text-align:right;color:rgba(255,255,255,0.6);">${fmt(cBase)} &#8364;</td>
    <td class="cc-comPlataforma" style="${_cfr}">${fmt(cComPlat)} &#8364;</td>
    <td class="cc-comGTC" style="${_cfr}">${fmt(cComGTC)} &#8364;</td>
    <td class="cc-limpieza" style="${_cfr}">${fmt(cLimp)} &#8364;</td>
    <td class="cc-amenities" style="${_cfr}">${fmt(cAmen)} &#8364;</td>
    <td class="cc-pasarela" style="${_cfr}">${cComPas>0?fmt(cComPas)+' &#8364;':'&#8211;'}</td>
    <td class="cc-ceSinIva" style="${_cfs}text-align:center;color:#c4b5fd;font-size:11px;">${cCE2 > 0 ? '&#8211; ' + fmt(cCE2) + ' &#8364;' : ''}</td>
    <td class="cc-subtotal" style="${_cfs}text-align:right;">${fmt(cSub)} &#8364;</td>
    <td class="cc-irpf" style="${_cfr}">&#8211; ${fmt(cRet)} &#8364;</td>
    <td class="cc-iva21" style="${_cfs}text-align:center;color:#81c784;font-variant-numeric:tabular-nums;">+ ${fmt(cIva21)} &#8364;</td>
    <td class="cc-totalLiquidar" style="${_cfs}text-align:right;color:#81d4fa;font-size:14px;">${_cpvRaw(fmt(cLiq), fmt(cLiq) + ' &#8364;')}</td>
    <td class="cc-observacion" style="${_cfs}"></td>
    <td class="cc-acciones" style="${_cfs}"></td>
  </tr>`;

  const _dedHtml = buildConsolDeductionsHtml(alojName);
  const _ded = getConsolDeductions(alojName);
  const _isSplit = isGtcSplit(alojName);
  const _gtcSplitAmt = _isSplit ? sumSub * GTC_SPLIT_RATE : 0;
  const _ownerBase = _isSplit ? sumSub - _gtcSplitAmt : sumSub;
  const adjSub = _ownerBase - _ded.totalBase;
  const avgIrpfRate = sumSub > 0 ? sumRet / sumSub : 0;
  const adjRet = adjSub * avgIrpfRate;
  const adjIva = adjSub * IVA_SUBTOTAL;
  const adjLiq = adjSub - adjRet + adjIva;
  const valCount = filteredReservas.filter(r=>validated.has(r.idx)).length;
  const valPct = filteredReservas.length > 0 ? Math.round(valCount / filteredReservas.length * 100) : 0;
  const progressColor = allVal ? 'linear-gradient(90deg,#43a047,#66bb6a)' : 'linear-gradient(90deg,#ff9800,#ffb74d)';
  const _propName = getPropietario(a.name);
  const _propIsMissing = _propName === t('consol.missingOwner');
  const sumNoches = calcs.reduce((s, x) => s + x.r._nights, 0);
  const sumVGO = sumComPlat + sumComGTC + sumLimp + sumAmen + sumComPas;

  // Compute period string for display
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

  const content = `
    <div class="consol-container print-target" id="print-zone">
      <div class="liq-gold-bar-top" style="border-radius:14px 14px 0 0;"></div>
      <div class="consol-header" style="border-radius:0;">
        <div class="header-top" style="display:flex;justify-content:space-between;align-items:flex-start;">
          <div>
            <div class="type">${t('liq.monthlyConsol')}</div>
            <div class="name">${a.name}</div>
          </div>
          <div style="display:flex;align-items:center;gap:12px;">
            <div class="liq-header-logo"><span class="logo-main">h\u00F4mity</span><span class="logo-sub">holidays</span></div>
            ${allVal?'<span class="badge-liq badge-liq-green">&#10003; ' + t('status.ready') + '</span>':'<span class="badge-liq badge-liq-amber">' + t('status.pending') + '</span>'}</div>
        </div>
        <div class="cd-progress-wrap">
          <div class="cd-progress">
            <div class="cd-progress-bar"><div class="cd-progress-fill" style="width:${valPct}%;background:${progressColor};"></div></div>
            <div class="cd-progress-text"><strong>${valCount} / ${filteredReservas.length}</strong> ${t('consol.validated_pl')}</div>
          </div>
        </div>
        <div class="consol-meta-strip">
          <div class="consol-meta-item"><div class="consol-meta-label">${t("liq.period")}</div><div class="consol-meta-value" style="color:#d4a017;font-weight:700;">${_periodStr}</div></div>
          <div class="consol-meta-item"><div class="consol-meta-label">${t("consol.owner")}</div><div class="consol-meta-value${_propIsMissing?' alert':''}" style="cursor:pointer" title="Clic para editar propietario" onclick="editPropietarioInline('${a.name.replace(/'/g,"\\'")}', this)">${_propName}</div></div>
          <div class="consol-meta-item"><div class="consol-meta-label">${t("consol.building")}</div><div class="consol-meta-value">${a.edificio}</div></div>
          <div class="consol-meta-item"><div class="consol-meta-label">${t("consol.numReservations")}</div><div class="consol-meta-value">${filteredReservas.length}</div></div>
          <div class="consol-meta-item"><div class="consol-meta-label">${t("stats.billing")}</div><div class="consol-meta-value cpv" data-cpv="${fmt(sumTotal)}" onclick="event.stopPropagation();copyVal(this.dataset.cpv,this)">${fmt(sumTotal)} \u20AC${_cpvSvg}</div></div>
        </div>
      </div>

      <div class="consol-body">
        <div class="no-print" style="display:flex;align-items:center;justify-content:space-between;padding:10px 16px;border-bottom:1px solid #eef0f4;background:#f8f9fb;position:relative;z-index:10;">
          <div style="display:flex;gap:8px;align-items:center;">
            ${!allVal ? `<button class="btn btn-sm btn-orange" onclick="validarTodasConsol('${a.name.replace(/'/g, "\\'")}')">${t('btn.validateAll')} (${filteredReservas.filter(r=>!validated.has(r.idx)).length})</button>` : ''}
            ${filteredReservas.some(r=>validated.has(r.idx)) ? `<button class="btn btn-sm btn-success" onclick="desvalidarTodasConsol('${a.name.replace(/'/g, "\\'")}')">${t('btn.unvalidateAll')}</button>` : ''}
          </div>
          <div class="col-toggle-wrap">
            <button class="col-toggle-btn" onclick="toggleConsolColDropdown()" data-i18n-title="misc.showHideCols" title="${t('misc.showHideCols')}">&#9783; <span data-i18n="filter.columns">${t('filter.columns')}</span></button>
            <div class="col-toggle-dd" id="consol-col-toggle-dd"></div>
          </div>
        </div>
        <div class="card" style="padding:0;overflow:hidden;margin-bottom:0;border-radius:0;box-shadow:none;">
        <div class="table-wrap">
          <table>
            <thead><tr>
              ${CONSOL_COLUMNS.map(c => {
                const is = consolSortF===c.key;
                const ar = c.sortable ? '<span class="sort-arrow">'+(is?(consolSortD==="asc"?"&#9650;":"&#9660;"):"&#8661;")+'</span>' : '';
                const cls = ["cc-"+c.key, c.right?"right":"", is?"sorted":"", c.sortable?"":"no-sort"].filter(Boolean).join(" ");
                return '<th class="'+cls+'" '+(c.sortable?'onclick="consolSortByColumn(\''+c.key+'\')"':'')+'>'+c.label+ar+'</th>';
              }).join("")}
            </tr></thead>
            <tbody>${miniRows}</tbody>
            <tfoot>${miniTotals}</tfoot>
          </table>
        </div>
        </div>

        <div class="cd-summary-section" id="consol-summary-block">
          <!-- LEFT: Detailed breakdown -->
          <div class="cd-summary-left">
            <div class="cd-sum-title">${t('consol.summary')}</div>
            <div class="consol-row bold"><span>${t('consol.totalReservasVAT')}</span><span>${fmt(sumTotal)} \u20AC</span></div>
${sumCE > 0 ? `<div class="no-print" style="background:#fffdf5;border:1px dashed #f59e0b;border-radius:6px;margin:4px 0;padding:4px 12px;">
              <div class="consol-row" style="color:#d97706;font-size:12px;padding:4px 0;"><span>&#9888; ${t('consol.originalTotal')}</span><span>${fmt(sumOriginal)} \u20AC</span></div>
              <div class="consol-row" style="color:#d97706;font-size:12px;padding:4px 0;"><span>${t('consol.specialConceptsDisc')}</span><span class="neg">- ${fmt(sumCE)} \u20AC</span></div>
            </div>` : ''}
            <div class="consol-row"><span>${t('consol.vatReservas')} (10%)</span><span class="neg">- ${fmt(sumTotal - sumBase)} \u20AC</span></div>
            <div class="consol-row bold"><span>${t('liq.baseNoVAT')}</span><span>${fmt(sumBase)} \u20AC</span></div>
            <div class="consol-divider"></div>
            ${buildComPlatRows(calcs)}
            <div class="consol-divider"></div>
            ${buildGTCRows(calcs)}
            ${buildLimpRows(calcs)}
            <div class="consol-row"><span>${t('liq.amenities')}</span><span class="neg">- ${fmt(sumAmen)} \u20AC</span></div>
            <div class="consol-divider"></div>
            ${buildPasarelaRows(calcs)}
${sumCE2 > 0 ? `<div class="no-print" style="background:#faf8ff;border:1px dashed #7c3aed;border-radius:6px;margin:4px 0;padding:4px 12px;">
              <div class="consol-row" style="color:#7c3aed;font-size:12px;padding:4px 0;"><span>&#9888; C.E. sin IVA descontados</span><span class="neg">- ${fmt(sumCE2)} \u20AC</span></div>
              ${calcs.flatMap(x => (x.s.conceptosSinIVA||[]).filter(it=>it.amount>0).map(it=>({label:it.label||t('liq.noName'),amount:it.amount,reserva:x.r.id}))).map(it=>`<div class="consol-row sub" style="color:#9f7aea;font-size:11px;padding:2px 0 2px 12px;"><span>${esc(it.label)} <span style="color:#c4b5fd;font-size:10px">(Res. ${esc(it.reserva)})</span></span><span class="neg">- ${fmt(it.amount)} \u20AC</span></div>`).join('')}
            </div>` : ''}
            <div class="consol-subtotal-reservas"><span>${t('consol.subtotalReservas')}</span><span>${fmt(sumSub)} \u20AC</span></div>
${_isSplit ? `<div class="consol-split-box">
              <div class="consol-split-title">&#8621; ${t('consol.splitTitle')}</div>
              <div class="consol-row bold" style="color:#7c3aed;padding:8px 16px;"><span><span class="consol-split-dot" style="background:#7c3aed;"></span>${t('consol.gtcRetains')} (${(GTC_SPLIT_RATE*100).toFixed(0)}%)</span><span>${fmt(_gtcSplitAmt)} \u20AC</span></div>
              <div class="consol-split-divider"></div>
              <div class="consol-row bold" style="color:#16a34a;padding:8px 16px;"><span><span class="consol-split-dot" style="background:#16a34a;"></span>${t('consol.ownerReceives')} (${((1-GTC_SPLIT_RATE)*100).toFixed(0)}%)</span><span>${fmt(_ownerBase)} \u20AC</span></div>
              <div class="consol-split-bar"><div class="consol-split-bar-gtc" style="width:${(GTC_SPLIT_RATE*100).toFixed(0)}%;">${(GTC_SPLIT_RATE*100).toFixed(0)}%</div><div class="consol-split-bar-owner" style="width:${((1-GTC_SPLIT_RATE)*100).toFixed(0)}%;">${((1-GTC_SPLIT_RATE)*100).toFixed(0)}%</div></div>
            </div>` : ''}
            <div class="consol-monthly-box no-print">
              <div class="consol-monthly-title">&#128197; ${t('consol.otherConcepts')}</div>
              ${_dedHtml}
            </div>
            <div class="consol-row bold" id="csf-subtotal"><span>${t('consol.subtotalFinal')}</span><span>${fmt(adjSub)} \u20AC</span></div>
            <div class="consol-row" id="csf-irpf"><span>${t('liq.irpfWithholding')} (${(avgIrpfRate*100).toFixed(0)}%)</span><span class="neg">- ${fmt(adjRet)} \u20AC</span></div>
            <div class="consol-row" id="csf-iva"><span>${t('liq.vatSubtotal')} (21%)</span><span class="pos">+ ${fmt(adjIva)} \u20AC</span></div>
          </div>

          <!-- RIGHT: Quick stats + Total hero -->
          <div class="cd-summary-right">
            <div class="cd-sum-title">${t('consol.quickSummary')}</div>
            <div class="cd-quick-stats">
              <div class="cd-qs-item"><div class="cd-qs-label">${t("stats.reservations")}</div><div class="cd-qs-value">${filteredReservas.length}</div></div>
              <div class="cd-qs-item"><div class="cd-qs-label">${t("stats.nights")}</div><div class="cd-qs-value">${sumNoches}</div></div>
              <div class="cd-qs-item"><div class="cd-qs-label">${t("stats.billing")}</div><div class="cd-qs-value">${fmt(sumTotal)} \u20AC</div></div>
            </div>
            <div style="margin-bottom:16px;">
              <div class="cd-tb-row"><span>${t('liq.baseNoVAT')}</span><span class="cd-tb-val">${fmt(sumBase)} \u20AC</span></div>
              <div class="cd-tb-row"><span>${t('consol.salesOps')}</span><span class="cd-tb-val neg">\u2212 ${fmt(sumVGO)} \u20AC</span></div>
              <div class="cd-tb-row" style="font-weight:700;"><span>${t('consol.subtotalReservas2')}</span><span class="cd-tb-val">${fmt(sumSub)} \u20AC</span></div>
${_isSplit ? `<div class="cd-split-mini">
                <div class="cd-split-mini-header">&#8621; ${t('consol.specialAgreement')}</div>
                <div class="cd-split-mini-row"><span><span class="consol-split-dot" style="background:#7c3aed;"></span>GTC (${(GTC_SPLIT_RATE*100).toFixed(0)}%)</span><span style="color:#7c3aed;font-weight:600;">\u2212 ${fmt(_gtcSplitAmt)} \u20AC</span></div>
                <div class="cd-split-mini-row"><span><span class="consol-split-dot" style="background:#16a34a;"></span>${t('liq.propietario')} (${((1-GTC_SPLIT_RATE)*100).toFixed(0)}%)</span><span style="color:#16a34a;font-weight:700;">${fmt(_ownerBase)} \u20AC</span></div>
              </div>` : ''}
              <div class="cd-tb-row"><span>${t('consol.otherConceptsShort')}</span><span class="cd-tb-val neg">\u2212 ${fmt(_ded.totalBase)} \u20AC</span></div>
              <div class="cd-tb-row" style="font-weight:700;"><span>${t('consol.subtotalFinalMonth')}</span><span class="cd-tb-val">${fmt(adjSub)} \u20AC</span></div>
              <div class="cd-tb-row"><span>${t('liq.irpfWithholding')} (${(avgIrpfRate*100).toFixed(0)}%)</span><span class="cd-tb-val neg">\u2212 ${fmt(adjRet)} \u20AC</span></div>
              <div class="cd-tb-row"><span>${t('liq.vatSubtotal')} (21%)</span><span class="cd-tb-val pos">+ ${fmt(adjIva)} \u20AC</span></div>
            </div>
            <div style="flex:1;"></div>
            <div class="cd-total-hero" id="csf-total">
              <div class="cd-total-hero-label">${t(_isSplit ? 'consol.toSettleOwner' : 'consol.totalToSettle')}</div>
              <div class="cd-total-hero-amount cpv" data-cpv="${fmt(adjLiq)}" onclick="event.stopPropagation();copyVal(this.dataset.cpv,this)">${fmt(adjLiq)} <span class="eur">\u20AC</span>${_cpvSvg}</div>
            </div>
            <div class="no-print" style="margin-top:12px;">
              <div style="margin-bottom:8px;text-align:center;"><span style="font-size:11px;color:#9ca3af;margin-right:6px;">${t('doc.langLabel')}:</span>${_buildDocLangPicker()}</div>
              ${allVal
                ? `<button class="cd-btn-generate" onclick="handleGenerar()">&#128424; ${t('btn.generate')}</button>
                   <button class="pdf-download-btn" onclick="handleDownloadPdf()">&#11123; ${t('btn.downloadPdf')}</button>
                   <button class="email-btn" onclick="handleEmailLiquidacion()">&#9993; ${t('btn.sendEmail')}</button>`
                : `<button class="cd-btn-generate disabled">${t('btn.validateFirst')}</button>
                   <button class="pdf-download-btn disabled">&#11123; ${t('btn.downloadPdf')}</button>
                   <button class="email-btn disabled">&#9993; ${t('btn.sendEmail')}</button>`}
            </div>
            ${allVal && _previewPref !== null
              ? `<div class="no-print" style="text-align:center;font-size:12px;color:#9ca3af;margin-top:8px;">
                  ${_previewPref ? '\ud83d\udc41 ' + t('preview.show') : '\ud83d\udda8 ' + t('preview.direct')}
                  &nbsp;\u00B7&nbsp; <a href="#" onclick="resetPreviewPref();return false;" style="color:#4f8cff;">${t('preview.change')}</a>
                </div>`
              : allVal ? `<div class="no-print" id="preview-options" style="display:flex;flex-direction:column;gap:8px;align-items:center;margin-top:8px;">
                  <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer;">
                    <input type="checkbox" id="chk-preview" checked style="width:14px;height:14px;cursor:pointer;">
                    ${t('preview.before')}
                  </label>
                  <label style="display:flex;align-items:center;gap:6px;font-size:11px;color:#9ca3af;cursor:pointer;">
                    <input type="checkbox" id="chk-remember" style="width:13px;height:13px;cursor:pointer;">
                    ${t('preview.dontAsk')}
                  </label>
                </div>` : ''}
          </div>
        </div>

        <div class="cd-total-bar" id="csf-total-bar">
          <div class="cd-total-bar-label">${t(_isSplit ? 'consol.toSettleOwner' : 'consol.totalToSettle')}<strong>${a.name}</strong></div>
          <div class="cd-total-bar-amount cpv" data-cpv="${fmt(adjLiq)}" onclick="event.stopPropagation();copyVal(this.dataset.cpv,this)">${fmt(adjLiq)} \u20AC${_cpvSvg}</div>
        </div>
        <div class="liq-gold-bar-bottom"></div>
      </div>
    </div>

    <div id="preview-zone" style="display:none;"></div>`;

  _previewActive = false;
  document.getElementById("consoldetail-content").innerHTML = content;
  document.getElementById("nav-consoldetail").style.display = "block";
  showScreen("consoldetail");
}

// \u2500\u2500\u2500 PRINT PREFERENCES \u2500\u2500\u2500
let _previewPref = null; // null = show options, true = always preview, false = never preview
{ const v = SafeStorage.get('liq-preview-pref'); if (v !== null) _previewPref = v === 'true'; }

function getPreviewPref() { return _previewPref === null ? true : _previewPref; }

// ==============================================================================================================================
//  [M16] PRINT ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â Generaci\u00f3n de impresi\u00f3n y vista previa
// ==============================================================================================================================

/**
 * @description Genera la liquidaci\u00f3n para imprimir: muestra preview o imprime directo.
 * Respeta la preferencia del usuario (ver preview o ir directo a imprimir).
 */
