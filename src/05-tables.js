// ============================================================================
//  [M12] CE_SYSTEM - Conceptos Extraordinarios UNIFICADO (CE + CE2)
//  Refactored v2.25.0: Single-source rendering, zero duplication
// ============================================================================

// --- CE Type Configuration ---
var _CE_CFG = {
  ce: {
    dataKey: 'conceptosEspeciales',    // settings[idx].XXX
    prefix: 'ce',                      // CSS class prefix + panel ID prefix
    amtField: 'ceTotal',              // field in calc result (getLiq)
    colSel: '.col-ce',                // column selector in main table
    titleKey: 'ce.title',             // i18n keys
    subtitleKey: 'ce.internalOnly',
    phKey: 'ce.placeholder',
    btnTitleKey: 'ce.specialConcepts',
    addLinkCls: 'ce-add-link',
    // Summary cards builder (returns array of card descriptors)
    summaryCards: function(c) {
      return [
        { bg:'#f3f4f6', lc:'#374151', vc:'#1a2744', l1:'ce.totalReserva', l2:'ce.ivaInc', val: c.totalOriginal, neg:false },
        { bg:'#fef3c7', lc:'',        vc:'',        l1:'ce.deduct',       l2:'ce.ivaInc', val: c.ceTotal,       neg:true },
        { bg:'#fff3e0', lc:'#e65100', vc:'#e65100', l1:'ce.totalSinCE',   l2:'ce.ivaInc', val: c.total,         neg:false },
        { bg:'#e8f5e9', lc:'#2e7d32', vc:'#2e7d32', l1:'ce.totalSinCE',   l2:'ce.sinIVA', val: c.baseSinIVA,    neg:false, bigVal:true }
      ];
    },
    // Delta stat fields to update on change
    statUpdate: function(st, oldC, newC) {
      st.tCE += (newC.ceTotal - oldC.ceTotal);
      st.tBase += (newC.baseSinIVA - oldC.baseSinIVA);
    },
    // Extra cell patches on remove (beyond totalLiq + sub)
    extraRemovePatches: function(mainRow, newC) {
      var baseCel = mainRow.querySelector('.col-baseSinIVA');
      if (baseCel) baseCel.innerHTML = fmt(newC.baseSinIVA) + ' \u20AC';
    }
  },
  ce2: {
    dataKey: 'conceptosSinIVA',
    prefix: 'ce2',
    amtField: 'ceSinIvaTotal',
    colSel: '.col-ceSinIva',
    titleKey: 'ce2.title',
    subtitleKey: 'ce2.subtractSub',
    phKey: 'ce2.placeholder',
    btnTitleKey: 'ce2.specialConcepts',
    addLinkCls: 'ce2-add-link2',
    summaryCards: function(c) {
      var subBefore = c.sub + c.ceSinIvaTotal;
      return [
        { bg:'#f3f4f6', lc:'#374151', vc:'#1a2744', l1:'ce2.subBefore',   l2:'ce2.beforeCE', val: subBefore,        neg:false },
        { bg:'#f5f0ff', lc:'#6d28d9', vc:'#7c3aed', l1:'ce2.deductNoVat', l2:'ce.sinIVA',    val: c.ceSinIvaTotal,  neg:true },
        { bg:'#ede9fe', lc:'#5b21b6', vc:'#5b21b6', l1:'ce2.subFinal',    l2:'ce2.final',    val: c.sub,            neg:false }
      ];
    },
    statUpdate: function(st, oldC, newC) {
      st.tCE2 += (newC.ceSinIvaTotal - oldC.ceSinIvaTotal);
    },
    extraRemovePatches: function() {}
  }
};

// --- CE State (unified) ---
var _openCE = { ce: { idx: null, view: 'p' }, ce2: { idx: null, view: 'p' } };

// --- Unified Rendering ---

function _ceRenderButton(type, idx, c, view) {
  var cfg = _CE_CFG[type], v = view || 'p';
  var amt = c[cfg.amtField];
  if (amt > 0) {
    return '<button class="'+cfg.prefix+'-btn has" onclick="event.stopPropagation();_ceToggle(\''+type+'\','+idx+',\''+v+'\')"><span class="'+cfg.prefix+'-dot"></span>&#8211;'+fmt(amt)+' &#8364;</button>';
  }
  return '<button class="'+cfg.prefix+'-btn" onclick="event.stopPropagation();_ceToggle(\''+type+'\','+idx+',\''+v+'\')" title="'+t(cfg.btnTitleKey)+'">+</button>';
}

function _ceRenderItemRow(type, idx, i, item, v) {
  var cfg = _CE_CFG[type], p = cfg.prefix;
  return '<div class="'+p+'-item-row">'
    + '<input class="'+p+'-inp-label" type="text" value="'+(item.label||'').replace(/"/g,'&quot;')+'" '
    + 'onchange="_ceUpdate(\''+type+'\','+idx+','+i+',\'label\',this.value,\''+v+'\')" '
    + 'onkeydown="_ceKeyHandler(event,\''+type+'\','+idx+',\''+v+'\',false)" '
    + 'placeholder="'+t(cfg.phKey)+'" />'
    + '<input class="'+p+'-inp-amt" type="text" value="'+fmt(item.amount||0)+'" '
    + 'onchange="_ceUpdate(\''+type+'\','+idx+','+i+',\'amount\',this.value,\''+v+'\')" '
    + 'onkeydown="_ceKeyHandler(event,\''+type+'\','+idx+',\''+v+'\',true)" />'
    + '<button class="'+p+'-del" onclick="_ceRemove(\''+type+'\','+idx+','+i+',\''+v+'\')">&#215;</button>'
    + '</div>';
}

function _ceRenderSummaryCards(type, c) {
  var cards = _CE_CFG[type].summaryCards(c);
  var _b = 'text-align:center;padding:8px 12px;border-radius:8px;min-width:110px;';
  return cards.map(function(cd) {
    var lStyle = cd.lc ? ' style="color:'+cd.lc+'"' : '';
    var vStyle = ' style="color:'+(cd.vc||'inherit')+(cd.bigVal ? ';font-size:15px' : '')+'"';
    return '<div style="'+_b+'background:'+cd.bg+';">'
      + '<div class="'+_CE_CFG[type].prefix+'-sum-label"'+lStyle+'>'+t(cd.l1)+'<br>'+t(cd.l2)+'</div>'
      + '<div class="'+_CE_CFG[type].prefix+'-sum-val"'+vStyle+'>'+(cd.neg ? '&#8211; ' : '')+fmt(cd.val)+' &#8364;</div>'
      + '</div>';
  }).join('');
}

function _ceRenderPanelInner(type, idx, s, c, v) {
  var cfg = _CE_CFG[type], p = cfg.prefix;
  var items = s[cfg.dataKey] || [];
  var itemsHtml = items.map(function(item, i) {
    return _ceRenderItemRow(type, idx, i, item, v);
  }).join('');
  return '<div class="'+p+'-panel-inner">'
    + '<div class="'+p+'-panel-left">'
    + '<div class="'+p+'-panel-title">'+t(cfg.titleKey)+' <span class="'+p+'-eye">'+t(cfg.subtitleKey)+'</span></div>'
    + itemsHtml
    + '<div class="'+cfg.addLinkCls+'" onclick="_ceAdd(\''+type+'\','+idx+',\''+v+'\')">'+t('ce.addItem')+'</div>'
    + '</div>'
    + '<div class="'+p+'-panel-summary" style="display:flex;gap:8px;align-items:stretch;flex-wrap:wrap;">'
    + _ceRenderSummaryCards(type, c)
    + '</div></div>';
}

function _ceGetColCount(v) {
  return v === 'c'
    ? CONSOL_COLUMNS.filter(function(col){return consolColVis[col.key]!==false;}).length
    : COLUMNS.filter(function(col){return colVisibility[col.key]!==false;}).length;
}

// --- Public API (thin wrappers preserving original names for callers) ---

// Build functions (return HTML string)
function _buildCEButton(idx, c, view)  { return _ceRenderButton('ce', idx, c, view); }
function _buildCE2Button(idx, c, view) { return _ceRenderButton('ce2', idx, c, view); }

function _buildCEPanelRow(idx, s, c, view) {
  var v = view || 'p';
  return '<tr class="ce-panel-row" id="ce-'+v+'panel-'+idx+'" style="display:none"><td colspan="'+_ceGetColCount(v)+'" style="padding:0">'
    + _ceRenderPanelInner('ce', idx, s, c, v) + '</td></tr>';
}
function _buildCE2PanelRow(idx, s, c, view) {
  var v = view || 'p';
  return '<tr class="ce2-panel-row" id="ce2-'+v+'panel-'+idx+'" style="display:none"><td colspan="'+_ceGetColCount(v)+'" style="padding:0">'
    + _ceRenderPanelInner('ce2', idx, s, c, v) + '</td></tr>';
}

// Toggle panel
function _ceToggle(type, idx, view) {
  if (idx == null || !allReservas[idx]) return;
  var cfg = _CE_CFG[type], st = _openCE[type];
  var v = view || 'p';
  var panel = document.getElementById(cfg.prefix + '-' + v + 'panel-' + idx);
  if (!panel) return;
  // Close previous if different
  if (st.idx !== null && (st.idx !== idx || st.view !== v)) {
    var prev = document.getElementById(cfg.prefix + '-' + st.view + 'panel-' + st.idx);
    if (prev) prev.style.display = 'none';
  }
  if (panel.style.display === 'none') {
    var wrap = panel.closest('.table-wrap');
    var scrollY = wrap ? wrap.scrollTop : window.scrollY;
    panel.style.display = '';
    if (wrap) wrap.scrollTop = scrollY; else window.scrollTo(0, scrollY);
    st.idx = idx; st.view = v;
    var s = settings[idx];
    if (!s[cfg.dataKey] || s[cfg.dataKey].length === 0) {
      s[cfg.dataKey] = [{label:'', amount:0}];
      _ceRefreshPanel(type, idx, v);
    }
  } else {
    panel.style.display = 'none';
    st.idx = null;
  }
}
// Legacy wrappers for existing onclick handlers
function toggleCEPanel(idx, view)  { _ceToggle('ce', idx, view); }
function toggleCE2Panel(idx, view) { _ceToggle('ce2', idx, view); }

// Add item
function _ceAdd(type, idx, view) {
  var cfg = _CE_CFG[type], p = cfg.prefix;
  var s = settings[idx]; if (!s) return;
  if (!s[cfg.dataKey]) s[cfg.dataKey] = [];
  var i = s[cfg.dataKey].length;
  s[cfg.dataKey].push({label:'', amount:0});
  var v = view || 'p';
  var panel = document.getElementById(p + '-' + v + 'panel-' + idx);
  if (!panel) return;
  var addLink = panel.querySelector('.' + cfg.addLinkCls);
  if (!addLink) { _ceRefreshPanel(type, idx, v); return; }
  var row = document.createElement('div');
  row.className = p + '-item-row ' + p + '-new';
  row.innerHTML = _ceRenderItemRow(type, idx, i, {label:'', amount:0}, v).replace(/^<div[^>]*>/, '').replace(/<\/div>$/, '');
  addLink.parentNode.insertBefore(row, addLink);
  row.querySelector('.' + p + '-inp-label').focus({preventScroll:true});
  scheduleReservaConfigSave(idx);
}
function addCEItem(idx, view)  { _ceAdd('ce', idx, view); }
function addCE2Item(idx, view) { _ceAdd('ce2', idx, view); }

// Remove item
function _ceRemove(type, idx, itemIdx, view) {
  var cfg = _CE_CFG[type], p = cfg.prefix;
  var s = settings[idx]; if (!s || !s[cfg.dataKey]) return;
  var v = view || 'p';
  var panel = document.getElementById(p + '-' + v + 'panel-' + idx);
  var rows = panel ? panel.querySelectorAll('.' + p + '-item-row') : [];
  if (rows[itemIdx]) {
    var row = rows[itemIdx];
    row.style.animation = 'ceRowOut .2s ease forwards';
    row.addEventListener('animationend', function() {
      row.remove();
      s[cfg.dataKey].splice(itemIdx, 1);
      var oldC = getLiq(allReservas[idx]);
      invalidateCache(idx);
      var newC = getLiq(allReservas[idx]);
      if (_globalStatsCache) _globalStatsCache.tL += (newC.totalLiq - oldC.totalLiq);
      // Patch main row cells
      var mainRow = document.getElementById('row-' + idx);
      if (mainRow) {
        var btnCel = mainRow.querySelector(cfg.colSel);
        if (btnCel) btnCel.innerHTML = _ceRenderButton(type, idx, newC, v);
        var liqCel = mainRow.querySelector('.col-totalLiquidar');
        if (liqCel) liqCel.innerHTML = fmt(newC.totalLiq) + ' \u20AC';
        var subCel = mainRow.querySelector('.col-subtotal');
        if (subCel) subCel.innerHTML = fmt(newC.sub) + ' \u20AC';
        cfg.extraRemovePatches(mainRow, newC);
      }
      _ceRefreshSummary(type, idx, v);
      // Footer stats
      var fst = _cachedFilteredStats;
      if (fst && oldC && newC) {
        fst.fL += (newC.totalLiq - oldC.totalLiq);
        fst.tLiq += (newC.totalLiq - oldC.totalLiq);
        fst.tSub += (newC.sub - oldC.sub);
        cfg.statUpdate(fst, oldC, newC);
        _renderStatsFromCache(_lastFiltered, fst);
      }
      scheduleReservaConfigSave(idx);
      if (v === 'c' && currentConsolAloj) _patchConsolLightweight(idx, oldC, newC);
    }, {once:true});
  } else {
    s[cfg.dataKey].splice(itemIdx, 1);
    _ceApplyChange(type, idx, v);
  }
}
function removeCEItem(idx, itemIdx, view)  { _ceRemove('ce', idx, itemIdx, view); }
function removeCE2Item(idx, itemIdx, view) { _ceRemove('ce2', idx, itemIdx, view); }

// Update item
function _ceUpdate(type, idx, itemIdx, field, rawVal, view) {
  var cfg = _CE_CFG[type];
  var s = settings[idx]; if (!s || !s[cfg.dataKey] || !s[cfg.dataKey][itemIdx]) return;
  if (field === 'label') {
    s[cfg.dataKey][itemIdx].label = rawVal;
    scheduleReservaConfigSave(idx);
  } else {
    var v = parseFloat(String(rawVal).replace(/\./g,'').replace(',','.'));
    if (isNaN(v)) v = 0;
    s[cfg.dataKey][itemIdx].amount = v;
    _ceApplyChange(type, idx, view || 'p');
  }
}
function updateCEItem(idx, itemIdx, field, rawVal, view)  { _ceUpdate('ce', idx, itemIdx, field, rawVal, view); }
function updateCE2Item(idx, itemIdx, field, rawVal, view) { _ceUpdate('ce2', idx, itemIdx, field, rawVal, view); }

// Apply change (recalc + patch)
function _ceApplyChange(type, idx, view) {
  var cfg = _CE_CFG[type], st = _openCE[type];
  var v = view || 'p';
  var oldC = getLiq(allReservas[idx]);
  invalidateCache(idx);
  var newC = getLiq(allReservas[idx]);
  if (_globalStatsCache) _globalStatsCache.tL += (newC.totalLiq - oldC.totalLiq);
  _ceRefreshSummary(type, idx, v);
  _patchMainRowCells(idx, oldC, newC);
  scheduleReservaConfigSave(idx);
  if (v === 'c' && currentConsolAloj) {
    _patchConsolLightweight(idx, oldC, newC);
  } else {
    var panel = document.getElementById(cfg.prefix + '-' + v + 'panel-' + idx);
    if (panel) { panel.style.display = ''; st.idx = idx; st.view = v; }
  }
}
function _applyCEChange(idx, view)  { _ceApplyChange('ce', idx, view); }
function _applyCE2Change(idx, view) { _ceApplyChange('ce2', idx, view); }

// Refresh summary (numbers only, no DOM rebuild)
function _ceRefreshSummary(type, idx, view) {
  var cfg = _CE_CFG[type], p = cfg.prefix;
  var v = view || 'p';
  var c = getLiq(allReservas[idx]);
  var panel = document.getElementById(p + '-' + v + 'panel-' + idx);
  if (!panel) return;
  // Update summary values
  var vals = panel.querySelectorAll('.' + p + '-sum-val');
  var cards = cfg.summaryCards(c);
  vals.forEach(function(el, i) {
    if (i < cards.length) {
      el.innerHTML = (cards[i].neg ? '&#8211; ' : '') + fmt(cards[i].val) + ' &#8364;';
    }
  });
  // Sync button in main table row
  var mainRow = document.getElementById('row-' + idx);
  if (mainRow) {
    var btnCel = mainRow.querySelector(cfg.colSel);
    if (btnCel) btnCel.innerHTML = _ceRenderButton(type, idx, c, v);
  }
  // Re-index onclick handlers for remaining rows
  var rows = panel.querySelectorAll('.' + p + '-item-row');
  rows.forEach(function(row, i) {
    var del = row.querySelector('.' + p + '-del');
    if (del) del.setAttribute('onclick', "_ceRemove('"+type+"',"+idx+","+i+",'"+v+"')");
    var lbl = row.querySelector('.' + p + '-inp-label');
    if (lbl) lbl.setAttribute('onchange', "_ceUpdate('"+type+"',"+idx+","+i+",'label',this.value,'"+v+"')");
    var amt = row.querySelector('.' + p + '-inp-amt');
    if (amt) amt.setAttribute('onchange', "_ceUpdate('"+type+"',"+idx+","+i+",'amount',this.value,'"+v+"')");
  });
}
function _refreshCESummary(idx, view)  { _ceRefreshSummary('ce', idx, view); }
function _refreshCE2Summary(idx, view) { _ceRefreshSummary('ce2', idx, view); }

// Full panel refresh (innerHTML rebuild)
function _ceRefreshPanel(type, idx, view) {
  var cfg = _CE_CFG[type], p = cfg.prefix;
  var v = view || 'p';
  var s = settings[idx] || {}, c = getLiq(allReservas[idx]);
  var panel = document.getElementById(p + '-' + v + 'panel-' + idx);
  if (!panel) return;
  var wrap = panel.closest('.table-wrap') || panel.closest('.main');
  var scrollY = wrap ? wrap.scrollTop : window.scrollY;
  var colCount = _ceGetColCount(v);
  panel.innerHTML = '<td colspan="'+colCount+'" style="padding:0">' + _ceRenderPanelInner(type, idx, s, c, v) + '</td>';
  if (wrap) wrap.scrollTop = scrollY;
  var labels = panel.querySelectorAll('.' + p + '-inp-label');
  if (labels.length > 0) labels[labels.length - 1].focus({preventScroll:true});
}
function _refreshCEPanel(idx, view)  { _ceRefreshPanel('ce', idx, view); }
function _refreshCE2Panel(idx, view) { _ceRefreshPanel('ce2', idx, view); }

// Keyboard handler (Enter: labelâ†’amt, amtâ†’new row; Escape: remove if empty)
function _ceKeyHandler(e, type, idx, view, isAmt) {
  if (e.key !== 'Enter') return;
  e.preventDefault();
  var cfg = _CE_CFG[type], p = cfg.prefix;
  if (!isAmt) {
    var amt = e.target.parentNode.querySelector('.' + p + '-inp-amt');
    if (amt) { amt.focus({preventScroll:true}); amt.select(); }
    return;
  }
  var inp = e.target;
  var row = inp.closest('.' + p + '-item-row');
  var panel = inp.closest('[id^="' + p + '-"]');
  if (!panel) return;
  var rows = panel.querySelectorAll('.' + p + '-item-row');
  var itemIdx = Array.prototype.indexOf.call(rows, row);
  // Save value to model
  var val = parseFloat(String(inp.value).replace(/\./g,'').replace(',','.'));
  if (isNaN(val)) val = 0;
  var s = settings[idx];
  if (s && s[cfg.dataKey] && s[cfg.dataKey][itemIdx]) {
    s[cfg.dataKey][itemIdx].amount = val;
  }
  inp.removeAttribute('onchange');
  // Check if last row is already empty - if so, just focus it
  var allRows = panel.querySelectorAll('.' + p + '-item-row');
  var lastRow = allRows.length ? allRows[allRows.length - 1] : null;
  if (lastRow && lastRow !== row) {
    var lastLbl = lastRow.querySelector('.' + p + '-inp-label');
    var lastAmt = lastRow.querySelector('.' + p + '-inp-amt');
    if (lastLbl && !lastLbl.value.trim() && lastAmt && (!lastAmt.value.trim() || lastAmt.value.trim() === '0,00')) {
      lastLbl.focus({preventScroll:true});
      requestAnimationFrame(function() {
        var oldC = getLiq(allReservas[idx]);
        invalidateCache(idx);
        var newC = getLiq(allReservas[idx]);
        _ceRefreshSummary(type, idx, view);
        _patchMainRowCells(idx, oldC, newC);
        scheduleReservaConfigSave(idx);
      });
      return;
    }
  }
  // Add new row
  _ceAdd(type, idx, view);
  requestAnimationFrame(function() {
    var oldC = getLiq(allReservas[idx]);
    invalidateCache(idx);
    var newC = getLiq(allReservas[idx]);
    _ceRefreshSummary(type, idx, view);
    _patchMainRowCells(idx, oldC, newC);
    scheduleReservaConfigSave(idx);
  });
}
// Legacy wrappers
function _ceKey(e, idx, view, isAmt)  { _ceKeyHandler(e, 'ce', idx, view, isAmt); }
function _ce2Key(e, idx, view, isAmt) { _ceKeyHandler(e, 'ce2', idx, view, isAmt); }

// Live sync (update button+summary while typing, before blur/save)
function _ceLiveSync(type, idx, view) {
  var cfg = _CE_CFG[type], p = cfg.prefix;
  var v = view || 'p', s = settings[idx];
  if (!s || !s[cfg.dataKey]) return;
  var panel = document.getElementById(p + '-' + v + 'panel-' + idx);
  if (!panel) return;
  var amts = panel.querySelectorAll('.' + p + '-inp-amt');
  amts.forEach(function(inp, i) {
    if (i < s[cfg.dataKey].length) {
      var val = parseFloat(String(inp.value).replace(/\./g,'').replace(',','.'));
      s[cfg.dataKey][i].amount = isNaN(val) ? 0 : val;
    }
  });
  var oldC = getLiq(allReservas[idx]);
  invalidateCache(idx);
  var newC = getLiq(allReservas[idx]);
  _patchMainRowCells(idx, oldC, newC);
  _ceRefreshSummary(type, idx, v);
}
function _liveCESync(idx, view)  { _ceLiveSync('ce', idx, view); }
function _liveCE2Sync(idx, view) { _ceLiveSync('ce2', idx, view); }

// === UNIFIED CE/CE2 LIVE INPUT DEBOUNCE (event delegation) ===
var _ceInputTimer = null;
document.addEventListener('input', function(e) {
  var el = e.target;
  var isCE = el.classList.contains('ce-inp-amt');
  var isCE2 = el.classList.contains('ce2-inp-amt');
  if (!isCE && !isCE2) return;
  var type = isCE2 ? 'ce2' : 'ce';
  var cfg = _CE_CFG[type], p = cfg.prefix;
  clearTimeout(_ceInputTimer);
  _ceInputTimer = setTimeout(function() {
    var row = el.closest('.' + p + '-item-row');
    if (!row) return;
    var panel = el.closest('[id^="' + p + '-"]');
    if (!panel) return;
    var idMatch = panel.id.match(new RegExp(p + '-([pc])panel-(\\d+)'));
    if (!idMatch) return;
    var view = idMatch[1], idx = parseInt(idMatch[2]);
    var rows = panel.querySelectorAll('.' + p + '-item-row');
    var itemIdx = Array.prototype.indexOf.call(rows, row);
    if (itemIdx < 0) return;
    var s = settings[idx]; if (!s) return;
    var arr = s[cfg.dataKey];
    if (!arr || !arr[itemIdx]) return;
    var v = parseFloat(String(el.value).replace(/\./g,'').replace(',','.'));
    if (isNaN(v)) v = 0;
    if (arr[itemIdx].amount === v) return;
    arr[itemIdx].amount = v;
    // Lightweight path: update cache + summary without full DOM rebuild
    var oldC = getLiq(allReservas[idx]);
    invalidateCache(idx);
    var newC = getLiq(allReservas[idx]);
    _ceRefreshSummary(type, idx, view);
    _patchMainRowCells(idx, oldC, newC);
    // Update footer stats
    var fst = _cachedFilteredStats;
    if (fst && oldC && newC) {
      fst.fL += (newC.totalLiq - oldC.totalLiq);
      fst.tLiq += (newC.totalLiq - oldC.totalLiq);
      fst.tSub += (newC.sub - oldC.sub);
      cfg.statUpdate(fst, oldC, newC);
      _renderStatsFromCache(_lastFiltered, fst);
    }
    // Update consol view lightweight
    if (view === 'c' && currentConsolAloj) {
      _patchConsolLightweight(idx, oldC, newC);
    }
    scheduleReservaConfigSave(idx);
  }, 400);
});


// === LIVE DEBOUNCED INPUT: Otros Conceptos ===
var _cexInputTimer = null;
document.addEventListener('input', function(e) {
  var el = e.target;
  if (!el.classList.contains('cex-inp-amt')) return;
  // Immediately update the red neg span in the same row
  var row = el.closest('.cex-item-row');
  if (row) {
    var negSpan = row.querySelector('.neg');
    var v = parseFloat(String(el.value).replace(/\./g,'').replace(',','.'));
    if (negSpan) negSpan.textContent = '- ' + fmt(isNaN(v) ? 0 : v) + ' \u20AC';
  }
  clearTimeout(_cexInputTimer);
  _cexInputTimer = setTimeout(function() {
    if (!currentConsolAloj) return;
    var box = el.closest('.consol-monthly-box');
    if (!row || !box) return;
    var rows = box.querySelectorAll('.cex-item-row');
    var itemIdx = Array.prototype.indexOf.call(rows, row);
    if (itemIdx < 0) return;
    var extras = getConsolExtras(currentConsolAloj);
    if (!extras[itemIdx]) return;
    var v2 = parseFloat(String(el.value).replace(/\./g,'').replace(',','.'));
    if (isNaN(v2)) v2 = 0;
    if (extras[itemIdx].amount === v2) return;
    extras[itemIdx].amount = v2;
    scheduleGlobalConfigSave();
    _patchConsolFinalTotals();
  }, 400);
});

// === KEYBOARD: Enter labelÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢amt, Enter amtÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢new row, EscapeÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢remove if empty ===
function _cexKey(e, alojName, isAmt) {
  if (e.key === 'Enter') {
    e.preventDefault();
    var row = e.target.closest('.cex-item-row');
    if (!row) return;
    if (!isAmt) {
      // Enter on label ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ focus amount
      var amt = row.querySelector('.cex-inp-amt');
      if (amt) { amt.focus(); amt.select(); }
    } else {
      // Enter on amount ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ trigger change, then add new row
      e.target.dispatchEvent(new Event('change', {bubbles:true}));
      addConsolExtra(alojName);
    }
  } else if (e.key === 'Escape') {
    var row2 = e.target.closest('.cex-item-row');
    if (!row2) return;
    var lbl = row2.querySelector('.cex-inp-label');
    var amt2 = row2.querySelector('.cex-inp-amt');
    // If both empty, remove the row
    if (lbl && !lbl.value.trim() && amt2 && (!amt2.value.trim() || amt2.value.trim() === '0,00')) {
      var box = row2.closest('.consol-monthly-box');
      if (box) {
        var rows = box.querySelectorAll('.cex-item-row');
        var idx = Array.prototype.indexOf.call(rows, row2);
        if (idx >= 0) removeConsolExtra(alojName, idx);
      }
    }
  }
}

// ----- [M14-PATCH] Patch ligero consolidado (sin reconstruir DOM) ------------------------

/**
 * @description Sistema de actualizaci\u00f3n ligera para la vista consolidada.
 * En vez de reconstruir todo el DOM con viewConsolDetail(), estas funciones
 * parchean solo las celdas/secciones que han cambiado:
 *   - _patchConsolRowCells()  ->  actualiza celdas num\u00e9ricas de una fila
 *   - _patchConsolFooterRow()  ->  actualiza totales del tfoot
 *   - _buildConsolSummaryInner()  ->  regenera HTML del resumen financiero
 *   - _getConsolCalcsAndSums()  ->  helper de c\u00e1lculo reutilizable
 */

// === LIGHTWEIGHT CONSOL PATCH (no DOM rebuild) ===
function _getConsolCalcsAndSums(alojName) {
  var alojamientos = getAlojamientos();
  var a = alojamientos.find(function(x) { return x.name === alojName; });
  if (!a) return null;
  var filteredReservas = a.reservas;
  if (_mpHasFilter()) filteredReservas = a.reservas.filter(function(r) { return _mpMatchDate(r._dEntrada); });
  var calcs = filteredReservas.map(function(r) { return { r: r, s: settings[r.idx] || {}, c: getLiq(r) }; });
  var sums = { CE:0, orig:0, total:0, base:0, comPlat:0, comGTC:0, comPas:0, limp:0, amen:0, CE2:0, sub:0, iva:0, ret:0, liq:0, noches:0 };
  calcs.forEach(function(x) {
    sums.CE += x.c.ceTotal; sums.orig += x.r.totalReserva; sums.total += x.c.total;
    sums.base += x.c.baseSinIVA; sums.comPlat += x.c.comPlat; sums.comGTC += x.c.comGTC;
    sums.comPas += x.c.comPas; sums.limp += x.c.limp; sums.amen += x.c.amen;
    sums.CE2 += x.c.ceSinIvaTotal; sums.sub += x.c.sub; sums.iva += x.c.iva;
    sums.ret += x.c.ret; sums.liq += x.c.totalLiq; sums.noches += x.r._nights;
  });
  return { calcs: calcs, sums: sums, a: a };
}

function _buildConsolSummaryInner(calcs, sums, alojName) {
  var _dedHtml = buildConsolDeductionsHtml(alojName);
  var _ded = getConsolDeductions(alojName);
  var _isSplit = isGtcSplit(alojName);
  var _gtcSplitAmt = _isSplit ? sums.sub * GTC_SPLIT_RATE : 0;
  var _ownerBase = _isSplit ? sums.sub - _gtcSplitAmt : sums.sub;
  var adjSub = _ownerBase - _ded.totalBase;
  var avgIrpfRate = sums.sub > 0 ? sums.ret / sums.sub : 0;
  var adjRet = adjSub * avgIrpfRate;
  var adjIva = adjSub * IVA_SUBTOTAL;
  var adjLiq = adjSub - adjRet + adjIva;
  var sumNoches = calcs.reduce(function(s,x){return s+x.r._nights;},0);
  var sumVGO = sums.comPlat + sums.comGTC + sums.limp + sums.amen + sums.comPas;
  var allVal = calcs.every(function(x){return validated.has(x.r.idx);});
  var h = '';
  // LEFT column
  h += '<div class="cd-summary-left">';
  h += `<div class="cd-sum-title">${t('consol.summary')}</div>`;
  h += `<div class="consol-row bold"><span>${t('consol.totalReservasVAT')}</span><span>${fmt(sums.total)} \u20AC</span></div>`;
  if (sums.CE > 0) {
    h += '<div class="no-print" style="background:#fffdf5;border:1px dashed #f59e0b;border-radius:6px;margin:4px 0;padding:4px 12px;">';
    h += `<div class="consol-row" style="color:#d97706;font-size:12px;padding:4px 0;"><span>\u26A0 ${t('consol.originalTotal')}</span><span>${fmt(sums.orig)} \u20AC</span></div>`;
    h += `<div class="consol-row" style="color:#d97706;font-size:12px;padding:4px 0;"><span>${t('consol.specialConceptsDisc')}</span><span class="neg">- ${fmt(sums.CE)} \u20AC</span></div>`;
    h += '</div>';
  }
  h += `<div class="consol-row"><span>${t('consol.vatReservas')} (10%)</span><span class="neg">- ${fmt(sums.total - sums.base)} \u20AC</span></div>`;
  h += '<div class="consol-row bold"><span>Base sin IVA</span><span>' + fmt(sums.base) + ' \u20AC</span></div>';
  h += '<div class="consol-divider"></div>';
  h += buildComPlatRows(calcs);
  h += '<div class="consol-divider"></div>';
  h += buildGTCRows(calcs);
  h += buildLimpRows(calcs);
  h += `<div class="consol-row"><span>${t('liq.amenities')}</span><span class="neg">- ${fmt(sums.amen)} \u20AC</span></div>`;
  h += '<div class="consol-divider"></div>';
  h += buildPasarelaRows(calcs);
  if (sums.CE2 > 0) {
    h += '<div class="no-print" style="background:#faf8ff;border:1px dashed #7c3aed;border-radius:6px;margin:4px 0;padding:4px 12px;">';
    h += `<div class="consol-row" style="color:#7c3aed;font-size:12px;padding:4px 0;"><span>\u26A0 ${t('consol.ceNoVatDisc')}</span><span class="neg">- ${fmt(sums.CE2)} \u20AC</span></div>`;
    calcs.forEach(function(x) {
      (x.s.conceptosSinIVA||[]).filter(function(it){return it.amount>0;}).forEach(function(it) {
        h += '<div class="consol-row sub" style="color:#9f7aea;font-size:11px;padding:2px 0 2px 12px;"><span>' + esc(it.label||t('liq.noName')) + ' <span style="color:#c4b5fd;font-size:10px">(Res. ' + esc(x.r.id) + ')</span></span><span class="neg">- ' + fmt(it.amount) + ' \u20AC</span></div>';
      });
    });
    h += '</div>';
  }
  h += `<div class="consol-subtotal-reservas"><span>${t('consol.subtotalReservas')}</span><span>${fmt(sums.sub)} \u20AC</span></div>`;
  if (_isSplit) {
    h += '<div class="consol-split-box">';
    h += `<div class="consol-split-title">\u21AD ${t('consol.splitTitle')}</div>`;
    h += '<div class="consol-row bold" style="color:#7c3aed;padding:8px 16px;"><span><span class="consol-split-dot" style="background:#7c3aed;"></span>GTC retiene (' + (GTC_SPLIT_RATE*100).toFixed(0) + '%)</span><span>' + fmt(_gtcSplitAmt) + ' \u20AC</span></div>';
    h += '<div class="consol-split-divider"></div>';
    h += '<div class="consol-row bold" style="color:#16a34a;padding:8px 16px;"><span><span class="consol-split-dot" style="background:#16a34a;"></span>' + t('liq.ownerReceives') + ' (' + ((1-GTC_SPLIT_RATE)*100).toFixed(0) + '%)</span><span>' + fmt(_ownerBase) + ' \u20AC</span></div>';
    h += '<div class="consol-split-bar"><div class="consol-split-bar-gtc" style="width:' + (GTC_SPLIT_RATE*100).toFixed(0) + '%;">' + (GTC_SPLIT_RATE*100).toFixed(0) + '%</div><div class="consol-split-bar-owner" style="width:' + ((1-GTC_SPLIT_RATE)*100).toFixed(0) + '%;">' + ((1-GTC_SPLIT_RATE)*100).toFixed(0) + '%</div></div>';
    h += '</div>';
  }
  h += '<div class="consol-monthly-box no-print">';
  h += `<div class="consol-monthly-title">\uD83D\uDCC5 ${t('consol.otherConcepts')}</div>`;
  h += _dedHtml;
  h += '</div>';
  h += `<div class="consol-row bold" id="csf-subtotal"><span>${t('consol.subtotalFinal')}</span><span>${fmt(adjSub)} \u20AC</span></div>`;
  h += `<div class="consol-row" id="csf-irpf"><span>${t('liq.irpfWithholding')} (${(avgIrpfRate*100).toFixed(0)}%)</span><span class="neg">- ${fmt(adjRet)} \u20AC</span></div>`;
  h += `<div class="consol-row" id="csf-iva"><span>${t('liq.vatSubtotal')} (21%)</span><span class="pos">+ ${fmt(adjIva)} \u20AC</span></div>`;
  h += '</div>';
  // RIGHT column
  h += '<div class="cd-summary-right">';
  h += `<div class="cd-sum-title">${t('consol.quickSummary')}</div>`;
  h += '<div class="cd-quick-stats">';
  h += `<div class="cd-qs-item"><div class="cd-qs-label">${t("stats.reservations")}</div><div class="cd-qs-value">${calcs.length}</div></div>`;
  h += `<div class="cd-qs-item"><div class="cd-qs-label">${t("stats.nights")}</div><div class="cd-qs-value">${sumNoches}</div></div>`;
  h += `<div class="cd-qs-item"><div class="cd-qs-label">${t("stats.billing")}</div><div class="cd-qs-value">${fmt(sums.total)} \u20AC</div></div>`;
  h += '</div>';
  h += '<div style="margin-bottom:16px;">';
  h += `<div class="cd-tb-row"><span>${t('liq.baseNoVAT')}</span><span class="cd-tb-val">${fmt(sums.base)} \u20AC</span></div>`;
  h += `<div class="cd-tb-row"><span>${t('liq.salesOps')}</span><span class="cd-tb-val neg">\u2212 ${fmt(sumVGO)} \u20AC</span></div>`;
  h += `<div class="cd-tb-row" style="font-weight:700;"><span>${t('consol.subtotalReservas2')}</span><span class="cd-tb-val">${fmt(sums.sub)} \u20AC</span></div>`;
  if (_isSplit) {
    h += `<div class="cd-split-mini"><div class="cd-split-mini-header">\u21AD ${t('consol.specialAgreement')}</div>`;
    h += '<div class="cd-split-mini-row"><span><span class="consol-split-dot" style="background:#7c3aed;"></span>GTC (' + (GTC_SPLIT_RATE*100).toFixed(0) + '%)</span><span style="color:#7c3aed;font-weight:600;">\u2212 ' + fmt(_gtcSplitAmt) + ' \u20AC</span></div>';
    h += '<div class="cd-split-mini-row"><span><span class="consol-split-dot" style="background:#16a34a;"></span>' + t('liq.ownerLabel') + ' (' + ((1-GTC_SPLIT_RATE)*100).toFixed(0) + '%)</span><span style="color:#16a34a;font-weight:700;">' + fmt(_ownerBase) + ' \u20AC</span></div>';
    h += '</div>';
  }
  h += `<div class="cd-tb-row"><span>${t('consol.otherConceptsShort')}</span><span class="cd-tb-val neg">\u2212 ${fmt(_ded.totalBase)} \u20AC</span></div>`;
  h += `<div class="cd-tb-row" style="font-weight:700;"><span>${t('consol.subtotalFinalMonth')}</span><span class="cd-tb-val">${fmt(adjSub)} \u20AC</span></div>`;
  h += `<div class="cd-tb-row"><span>${t('liq.irpfWithholding')} (${(avgIrpfRate*100).toFixed(0)}%)</span><span class="cd-tb-val neg">\u2212 ${fmt(adjRet)} \u20AC</span></div>`;
  h += `<div class="cd-tb-row"><span>${t('liq.vatSubtotal')} (21%)</span><span class="cd-tb-val pos">+ ${fmt(adjIva)} \u20AC</span></div>`;
  h += '</div>';
  h += '<div style="flex:1;"></div>';
  h += '<div class="cd-total-hero" id="csf-total"><div class="cd-total-hero-label">' + t('liq.totalToSettleFull') + (_isSplit ? ' \u2014 ' + t('liq.propietario') : '') + '</div><div class="cd-total-hero-amount">' + fmt(adjLiq) + ' <span class="eur">\u20AC</span></div></div>';
  h += '<div class="no-print" style="margin-top:12px;text-align:center;">';
  h += '<div style="margin-bottom:8px;"><span style="font-size:11px;color:#9ca3af;margin-right:6px;">' + t('doc.langLabel') + ':</span>' + _buildDocLangPicker() + '</div>';
  h += allVal ? '<button class="cd-btn-generate" onclick="handleGenerar()">\uD83D\uDDA8 ' + t('btn.generate') + '</button><button class="pdf-download-btn" onclick="handleDownloadPdf()">\u2B73 ' + t('btn.downloadPdfLiq') + '</button><button class="email-btn" onclick="handleEmailLiquidacion()">\u2709 ' + t('btn.sendEmailLiq') + '</button>' + (isInvoiceEnabled(alojName) ? '<button class="inv-btn-generate" onclick="handleGenerarFactura(\'' + alojName.replace(/'/g, "\\'") + '\')">&#128196; ' + t('btn.generateInvoice') + '</button>' : '') : '<button class="cd-btn-generate disabled">' + t('btn.validateFirst') + '</button><button class="pdf-download-btn disabled">\u2B73 ' + t('btn.downloadPdfLiq') + '</button><button class="email-btn disabled">\u2709 ' + t('btn.sendEmailLiq') + '</button>';
  h += '</div>';
  h += '</div>';
  return h;
}

function _patchConsolRowCells(idx, newC) {
  var crow = document.getElementById('crow-' + idx);
  if (!crow) return;
  // Note: cc-totalReserva shows r.totalReserva (original) which never changes with CE/CE2
  var el;
  el = crow.querySelector('.cc-ce'); if (el) el.innerHTML = _buildCEButton(idx, newC, 'c');
  el = crow.querySelector('.cc-baseSinIVA'); if (el) el.innerHTML = fmt(newC.baseSinIVA) + ' \u20AC';
  // For cells with select+span, patch only the span
  var sp;
  sp = crow.querySelector('.cc-comPlataforma span[style*="tabular"]'); if (sp) sp.innerHTML = '\u2013 ' + fmt(newC.comPlat) + ' \u20AC';
  sp = crow.querySelector('.cc-comGTC span[style*="tabular"]'); if (sp) sp.innerHTML = '\u2013 ' + fmt(newC.comGTC) + ' \u20AC';
  sp = crow.querySelector('.cc-pasarela span[style*="tabular"]'); if (sp) sp.innerHTML = '\u2013 ' + fmt(newC.comPas) + ' \u20AC';
  el = crow.querySelector('.cc-ceSinIva'); if (el) el.innerHTML = _buildCE2Button(idx, newC, 'c');
  el = crow.querySelector('.cc-subtotal'); if (el) el.innerHTML = fmt(newC.sub) + ' \u20AC';
  sp = crow.querySelector('.cc-irpf span[style*="tabular"]'); if (sp) sp.innerHTML = '\u2013 ' + fmt(newC.ret) + ' \u20AC';
  sp = crow.querySelector('.cc-iva21 span[style*="tabular"]'); if (sp) sp.innerHTML = '+ ' + fmt(newC.iva) + ' \u20AC';
  el = crow.querySelector('.cc-totalLiquidar'); if (el) { el.innerHTML = fmt(newC.totalLiq) + ' \u20AC'; el.style.color = newC.totalLiq >= 0 ? '#1a2744' : '#e53935'; }
}

function _patchConsolFooterRow(sums, count) {
  var frow = document.getElementById('consol-tfoot-row');
  if (!frow) return;
  var p = function(cls, val) { var el = frow.querySelector('.'+cls); if (el) el.innerHTML = fmt(val) + ' \u20AC'; };
  // cc-totalReserva shows sum of original r.totalReserva (not affected by CE)
  p('cc-totalReserva', sums.orig);
  var ceCel = frow.querySelector('.cc-ce'); if (ceCel) ceCel.innerHTML = sums.CE > 0 ? '\u2013 ' + fmt(sums.CE) + ' \u20AC' : '';
  p('cc-baseSinIVA', sums.base);
  p('cc-comPlataforma', sums.comPlat);
  p('cc-comGTC', sums.comGTC);
  p('cc-limpieza', sums.limp);
  p('cc-amenities', sums.amen);
  var pasCel = frow.querySelector('.cc-pasarela'); if (pasCel) pasCel.innerHTML = sums.comPas > 0 ? fmt(sums.comPas) + ' \u20AC' : '\u2013';
  var ce2Cel = frow.querySelector('.cc-ceSinIva'); if (ce2Cel) ce2Cel.innerHTML = sums.CE2 > 0 ? '\u2013 ' + fmt(sums.CE2) + ' \u20AC' : '';
  p('cc-subtotal', sums.sub);
  var retCel = frow.querySelector('.cc-irpf'); if (retCel) retCel.innerHTML = '\u2013 ' + fmt(sums.ret) + ' \u20AC';
  var ivaCel = frow.querySelector('.cc-iva21'); if (ivaCel) ivaCel.innerHTML = '+ ' + fmt(sums.iva) + ' \u20AC';
  p('cc-totalLiquidar', sums.liq);
}

function _patchConsolLightweight(idx, oldC, newC) {
  if (!currentConsolAloj) return;
  // 1. Patch individual row
  _patchConsolRowCells(idx, newC);
  // 2. Recalculate sums and patch footer + summary
  var data = _getConsolCalcsAndSums(currentConsolAloj);
  if (!data) return;
  _patchConsolFooterRow(data.sums, data.calcs.length);
  var summaryBlock = document.getElementById('consol-summary-block');
  if (summaryBlock) summaryBlock.innerHTML = _buildConsolSummaryInner(data.calcs, data.sums, currentConsolAloj);
}

// ----- [M12-KEYBOARD] Atajos de teclado para CE/CE2 ---------------------------------------------------
/**
 * @description Manejo de Enter/Escape en campos CE/CE2:
 *   - Enter en nombre  ->  mueve foco a importe
 *   - Enter en importe  ->  crea nueva fila
 *   - Escape en fila vac\u00eda  ->  la elimina
 * Patr\u00f3n zero-jump: la fila se inserta PRIMERO, los n\u00fameros se actualizan
 * en el siguiente frame con requestAnimationFrame para evitar layout thrashing.
 */

// === CE ENTER KEY HANDLERS (row-first, numbers async) ===
function _patchMainRowCells(idx, oldC, newC) {
  var mainRow = document.getElementById('row-' + idx);
  if (mainRow) {
    var c = function(cls, val) { var el = mainRow.querySelector(cls); if (el) el.innerHTML = fmt(val) + ' \u20AC'; };
    c('.col-totalLiquidar', newC.totalLiq);
    c('.col-subtotal', newC.sub);
    c('.col-baseSinIVA', newC.baseSinIVA);
    // Update CE/CE2 buttons
    var ceCel = mainRow.querySelector('.col-ce');
    if (ceCel) ceCel.innerHTML = _buildCEButton(idx, newC);
    var ce2Cel = mainRow.querySelector('.col-ceSinIva');
    if (ce2Cel) ce2Cel.innerHTML = _buildCE2Button(idx, newC);
  }
  // Incremental footer stats update
  var st = _cachedFilteredStats;
  if (st && oldC && newC) {
    st.fL += (newC.totalLiq - oldC.totalLiq);
    st.tLiq += (newC.totalLiq - oldC.totalLiq);
    st.tSub += (newC.sub - oldC.sub);
    st.tBase += (newC.baseSinIVA - oldC.baseSinIVA);
    st.tCE += (newC.ceTotal - oldC.ceTotal);
    st.tCE2 += (newC.ceSinIvaTotal - oldC.ceSinIvaTotal);
    _renderStatsFromCache(_lastFiltered, st);
  }
}
/**
 * @description Render completo de la tabla: filtrado + stats + cabecera + filas + footer + paginaci\u00f3n.
 * Se llama tras cambios en filtros, datos o navegaci\u00f3n.
 * @private
 */
function _renderFull() {
  const fil = getFilteredSorted();
  _lastFiltered = fil;
  const sf2 = simpleComboState.status.value;
  const sortF = simpleComboState.sort.value, sortD = simpleComboState.sortdir.value;
  const hasFilter = comboState.platform.selected.size > 0 || comboState.aloj.selected.size > 0 || sf2 !== "all" || _mpHasFilter();

  document.getElementById("filter-count").textContent = fil.length + " " + t("stats.reservationCount");

  // Single pass over filtered: stats + totals + button counts
  const st = _computeStatsFromScratch(fil);
  const filPendingCount = st.filPendingCount, filValidatedCount = st.filValidatedCount;
  const fR = st.fR, fL = st.fL, fV = st.fV;
  const tNoches = st.tNoches, tTotal = st.tTotal, tBase = st.tBase;
  const tComPlat = st.tComPlat, tComGTC = st.tComGTC, tLimp = st.tLimp, tAmen = st.tAmen;
  const tComPas = st.tComPas, tSub = st.tSub, tRet = st.tRet, tIva21 = st.tIva21, tLiq = st.tLiq;
  const tCE = st.tCE;
  const tCE2 = st.tCE2;

  // Global stats (cached)
  const gs = getGlobalStats();
  const tR = gs.tR, tL = gs.tL;
  const vC = validated.size;

  const btnVal = document.getElementById("btn-validar-todas");
  const btnDesval = document.getElementById("btn-desvalidar-todas");
  btnVal.style.display = filPendingCount > 0 ? '' : 'none';
  btnVal.textContent = filPendingCount === fil.length ? `\u2713 ${t('btn.validateAll')} (${filPendingCount})` : `\u2713 ${t('btn.validatePending')} (${filPendingCount})`;
  btnDesval.style.display = filValidatedCount > 0 ? '' : 'none';
  btnDesval.textContent = filValidatedCount === fil.length ? `\u21A9 ${t('btn.unvalidateAll')} (${filValidatedCount})` : `\u21A9 ${t('btn.unvalidateValidated')} (${filValidatedCount})`;

  const pctR = allReservas.length > 0 ? (fil.length / allReservas.length * 100).toFixed(1) : 0;
  const pctTR = tR > 0 ? (fR / tR * 100).toFixed(1) : 0;
  const pctTL = tL > 0 ? (fL / tL * 100).toFixed(1) : 0;
  const pctV = vC > 0 ? (fV / vC * 100).toFixed(1) : 0;
  document.getElementById("stats-row").innerHTML = `
    <div class="stat-card"><div class="stat-label">${t("stats.reservations")}</div><div class="stat-value">${allReservas.length}</div>
      ${hasFilter ? `<div class="stat-filtered">${fil.length} ${t("stats.filtered")} <span class="stat-pct">(${pctR}%)</span></div>` : ''}</div>
    <div class="stat-card"><div class="stat-label">${t("stats.totalReservations")}</div><div class="stat-value" style="color:#1a2744">${fmt(tR)} \u20AC</div>
      ${hasFilter ? `<div class="stat-filtered">${fmt(fR)} \u20AC <span class="stat-pct">(${pctTR}%)</span></div>` : ''}</div>
    <div class="stat-card"><div class="stat-label">${t("stats.totalToSettle")}</div><div class="stat-value" style="color:#4f8cff">${fmt(tL)} \u20AC</div>
      ${hasFilter ? `<div class="stat-filtered">${fmt(fL)} \u20AC <span class="stat-pct">(${pctTL}%)</span></div>` : ''}</div>
    <div class="stat-card"><div class="stat-label">${t("stats.validated")}</div><div class="stat-value" style="color:#43a047">${vC} / ${allReservas.length}</div>
      ${hasFilter ? `<div class="stat-filtered">${fV} / ${fil.length} ${t("stats.filtered")} <span class="stat-pct">(${pctV}%)</span></div>` : ''}</div>`;

  const thead = document.getElementById("table-header");
  thead.innerHTML = COLUMNS.map(c => { const is = sortF === c.key; const ar = c.sortable ? `<span class="sort-arrow">${is ? (sortD === "asc" ? "&#9650;" : "&#9660;") : "&#8661;"}</span>` : "";
    const cls = ["col-" + c.key, c.right ? "right" : "", is ? "sorted" : "", c.sortable ? "" : "no-sort"].filter(Boolean).join(" ");
    return `<th class="${cls}" ${c.sortable ? `onclick="sortByColumn('${c.key}')"` : ""}>${c.label}${ar}</th>`; }).join("");

  // PAGINATION: render only current page slice
  const totalPages = Math.max(1, Math.ceil(fil.length / _pageSize));
  if (_currentPage > totalPages) _currentPage = totalPages;
  const startIdx = (_currentPage - 1) * _pageSize;
  const endIdx = Math.min(startIdx + _pageSize, fil.length);

  // Build row HTML for current page only
  const rowsHtml = new Array(endIdx - startIdx);
  for (let i = startIdx; i < endIdx; i++) {
    rowsHtml[i - startIdx] = _buildRowHtml(fil[i]);
  }
  document.getElementById("table-body").innerHTML = rowsHtml.join('');

  // Pagination bar
  _updatePaginationBar(fil.length, totalPages);

  // Totals footer (always over ALL filtered, not just visible)
  _updateFooter(fil.length, tNoches, tTotal, tBase, tComPlat, tComGTC, tLimp, tAmen, tComPas, tSub, tRet, tIva21, tLiq, tCE, tCE2);
}

// Fast re-render for page changes only \u2014 no stats recalc
function _renderPageOnly() {
  const fil = getFilteredSorted();
  const totalPages = Math.max(1, Math.ceil(fil.length / _pageSize));
  if (_currentPage > totalPages) _currentPage = totalPages;
  const startIdx = (_currentPage - 1) * _pageSize;
  const endIdx = Math.min(startIdx + _pageSize, fil.length);
  const rowsHtml = new Array(endIdx - startIdx);
  for (let i = startIdx; i < endIdx; i++) {
    rowsHtml[i - startIdx] = _buildRowHtml(fil[i]);
  }
  document.getElementById("table-body").innerHTML = rowsHtml.join('');
  _updatePaginationBar(fil.length, totalPages);
}

function _updatePaginationBar(totalCount, totalPages) {
  const pagBar = document.getElementById("pagination-bar");
  if (totalCount === 0) { pagBar.style.display = 'none'; return; }
  pagBar.style.display = 'flex';

  const startIdx = (_currentPage - 1) * _pageSize + 1;
  const endIdx = Math.min(_currentPage * _pageSize, totalCount);

  // Build page buttons (show max 7 pages with ellipsis)
  let pageButtons = '';
  const maxBtns = 7;
  let pages = [];
  if (totalPages <= maxBtns) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    let lo = Math.max(2, _currentPage - 1);
    let hi = Math.min(totalPages - 1, _currentPage + 1);
    if (_currentPage <= 3) { lo = 2; hi = 5; }
    if (_currentPage >= totalPages - 2) { lo = totalPages - 4; hi = totalPages - 1; }
    if (lo > 2) pages.push('...');
    for (let i = lo; i <= hi; i++) pages.push(i);
    if (hi < totalPages - 1) pages.push('...');
    pages.push(totalPages);
  }

  pages.forEach(p => {
    if (p === '...') {
      pageButtons += `<span style="padding:4px 2px;color:#9ca3af;font-size:12px;">\u2026</span>`;
    } else {
      const active = p === _currentPage;
      pageButtons += `<button onclick="goToPage(${p})" style="
        min-width:32px;height:32px;border-radius:6px;border:1.5px solid ${active ? '#4f8cff' : '#dde1e8'};
        background:${active ? '#4f8cff' : '#fff'};color:${active ? '#fff' : '#6b7280'};
        font-size:12px;font-weight:${active ? '700' : '500'};cursor:pointer;font-family:inherit;
        transition:all 0.15s;" onmouseover="if(!${active})this.style.borderColor='#4f8cff'" onmouseout="if(!${active})this.style.borderColor='#dde1e8'">${p}</button>`;
    }
  });

  // Page size options
  const sizes = [100, 500, 1000];
  const sizeOpts = sizes.map(s => `<option value="${s}" ${_pageSize === s ? 'selected' : ''}>${s}</option>`).join('');

  pagBar.innerHTML = `
    <div style="display:flex;align-items:center;gap:6px;">
      <button onclick="goToPage(_currentPage-1)" class="btn btn-sm btn-outline" style="padding:4px 10px;${_currentPage <= 1 ? 'opacity:0.4;pointer-events:none;' : ''}">&#8249;</button>
      ${pageButtons}
      <button onclick="goToPage(_currentPage+1)" class="btn btn-sm btn-outline" style="padding:4px 10px;${_currentPage >= totalPages ? 'opacity:0.4;pointer-events:none;' : ''}">&#8250;</button>
    </div>
    <span style="font-size:12px;color:#6b7280;">${startIdx}\u2013${endIdx} ${t("pager.of")} ${totalCount}</span>
    <div style="display:flex;align-items:center;gap:6px;">
      <label style="font-size:11px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;">Mostrar</label>
      <select class="sel" style="font-size:12px;padding:4px 8px;" onchange="changePageSize(parseInt(this.value))">${sizeOpts}</select>
    </div>`;
}

function goToPage(p) {
  const fil = getFilteredSorted();
  const totalPages = Math.max(1, Math.ceil(fil.length / _pageSize));
  _currentPage = Math.max(1, Math.min(p, totalPages));
  _renderPageOnly();
  // Scroll table to top
  document.querySelector('#screen-list .table-wrap').scrollTop = 0;
}

function changePageSize(size) {
  // Keep roughly the same scroll position
  const firstVisibleIdx = (_currentPage - 1) * _pageSize;
  _pageSize = size;
  _currentPage = Math.max(1, Math.floor(firstVisibleIdx / _pageSize) + 1);
  _renderPageOnly();
}

function _updateFooter(count, tNoches, tTotal, tBase, tComPlat, tComGTC, tLimp, tAmen, tComPas, tSub, tRet, tIva21, tLiq, tCE, tCE2) {
  const tfoot = document.getElementById("table-foot");
  const _fs = 'border:none;padding:10px 8px;';
  const _fr = 'border:none;padding:10px 8px;color:#ff8a80;text-align:center;font-variant-numeric:tabular-nums;';
  tfoot.innerHTML = count > 0 ? `<tr style="background:#0f1628;color:#fff;font-weight:700;font-size:12px;">
    <td class="col-estado" style="${_fs}"></td>
    <td class="col-idReserva" style="${_fs}"></td>
    <td class="col-localizador" style="${_fs}"></td>
    <td class="col-fechaAlta" style="${_fs}"></td>
    <td class="col-cliente" style="${_fs}text-align:right;text-transform:uppercase;letter-spacing:0.06em;font-size:11px;color:rgba(255,255,255,0.6);">${t('consol.reservasTotal')} (${count})</td>
    <td class="col-alojamiento" style="${_fs}"></td>
    <td class="col-edificio" style="${_fs}"></td>
    <td class="col-plataforma" style="${_fs}"></td>
    <td class="col-atendidoPor" style="${_fs}"></td>
    <td class="col-origenMarketing" style="${_fs}"></td>
    <td class="col-tipoReserva" style="${_fs}"></td>
    <td class="col-fechaEntrada" style="${_fs}"></td>
    <td class="col-fechaSalida" style="${_fs}"></td>
    <td class="col-noches" style="${_fs}text-align:center;">${tNoches}</td>
    <td class="col-totalReserva" style="${_fs}text-align:right;">${fmt(tTotal)} &#8364;</td>
    <td class="col-ce" style="${_fs}text-align:center;color:#d97706;font-size:11px;">${tCE > 0 ? '&#8211; ' + fmt(tCE) + ' &#8364;' : ''}</td>
    <td class="col-baseSinIVA" style="${_fs}text-align:right;color:rgba(255,255,255,0.6);">${fmt(tBase)} &#8364;</td>
    <td class="col-comPlataforma" style="${_fr}">${fmt(tComPlat)} &#8364;</td>
    <td class="col-comGTC" style="${_fr}">${fmt(tComGTC)} &#8364;</td>
    <td class="col-limpieza" style="${_fr}">${fmt(tLimp)} &#8364;</td>
    <td class="col-amenities" style="${_fr}">${fmt(tAmen)} &#8364;</td>
    <td class="col-pasarela" style="${_fr}">${tComPas > 0 ? fmt(tComPas) + ' &#8364;' : '&#8211;'}</td>
    <td class="col-ceSinIva" style="${_fs}text-align:center;color:#c4b5fd;font-size:11px;">${tCE2 > 0 ? '&#8211; ' + fmt(tCE2) + ' &#8364;' : ''}</td>
    <td class="col-subtotal" style="${_fs}text-align:right;">${fmt(tSub)} &#8364;</td>
    <td class="col-irpf" style="${_fr}">&#8211; ${fmt(tRet)} &#8364;</td>
    <td class="col-iva21" style="${_fs}text-align:center;color:#81c784;font-variant-numeric:tabular-nums;">+ ${fmt(tIva21)} &#8364;</td>
    <td class="col-totalLiquidar" style="${_fs}text-align:right;color:#81d4fa;font-size:14px;">${fmt(tLiq)} &#8364;</td>
    <td class="col-observacion" style="${_fs}"></td>
    <td class="col-acciones" style="${_fs}"></td>
  </tr>` : '';
}

/**
 * @description Cambia un ajuste individual de una reserva y actualiza la UI.
 * Usa delta-update: actualiza solo la fila afectada sin re-render completo.
 * @param {number} i - ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Ândice de la reserva
 * @param {string} k - Clave del setting ('comPlataforma', 'comGTC', etc.)
 * @param {*} v - Nuevo valor
 */
function changeSetting(i,k,v){
  if (!allReservas[i] || !settings[i]) { console.warn('[Settings] Invalid index:', i); return; }
  if (typeof v === 'number' && isNaN(v)) { console.warn('[Settings] NaN value for', k); return; }
  const oldC = getLiq(allReservas[i]); // capture BEFORE invalidating
  settings[i][k]=v; invalidateCache(i);
  const newC = getLiq(allReservas[i]);
  // Delta update global stats O(1) instead of recomputing O(n)
  if (_globalStatsCache) _globalStatsCache.tL += (newC.totalLiq - oldC.totalLiq);
  _patchSingleRow(i, oldC, newC);
  scheduleReservaConfigSave(i);
}
function validarTodas() { const pending=_lastFiltered.filter(r=>!validated.has(r.idx)); const n=pending.length; if(!n||!confirm(`\u00BFValidar ${n} reserva${n>1?'s':''}?`))return; pending.forEach(r => validated.add(r.idx)); _validatedVersion++; invalidateFilterCache(); renderTable(); batchWriteValidation(pending.map(r=>r.idx), true); }
function desvalidarTodas() { const vals=_lastFiltered.filter(r=>validated.has(r.idx)); const n=vals.length; if(!n||!confirm(`\u00BFDesvalidar ${n} reserva${n>1?'s':''}?`))return; vals.forEach(r => validated.delete(r.idx)); _validatedVersion++; invalidateFilterCache(); renderTable(); batchWriteValidation(vals.map(r=>r.idx), false); }
function changeSettingConsol(i,k,v){const oldC=getLiq(allReservas[i]);settings[i][k]=v;invalidateCache(i);const newC=getLiq(allReservas[i]);if(_globalStatsCache)_globalStatsCache.tL+=(newC.totalLiq-oldC.totalLiq);if(currentConsolAloj)viewConsolDetail(currentConsolAloj);scheduleReservaConfigSave(i);}
function togglePasarelaConsol(i){const oldC=getLiq(allReservas[i]);settings[i].pasarela=!settings[i].pasarela;invalidateCache(i);const newC=getLiq(allReservas[i]);if(_globalStatsCache)_globalStatsCache.tL+=(newC.totalLiq-oldC.totalLiq);if(currentConsolAloj)viewConsolDetail(currentConsolAloj);scheduleReservaConfigSave(i);}
function toggleValidateConsol(i){const wasV=validated.has(i);if(wasV)validated.delete(i);else validated.add(i);_validatedVersion++;invalidateFilterCache();if(currentConsolAloj)viewConsolDetail(currentConsolAloj);writeValidationToSheet(i,!wasV);}
function validarTodasConsol(alojName) {
  let src=allReservas.filter(r => r.alojamiento === alojName);
  if (_mpHasFilter()) src = src.filter(r => _mpMatchDate(r._dEntrada));
  const pending=src.filter(r => !validated.has(r.idx));
  if(!pending.length||!confirm(`\u00BFValidar ${pending.length} reserva${pending.length>1?'s':''} de ${alojName}?`))return;
  pending.forEach(r => validated.add(r.idx));
  _validatedVersion++; invalidateFilterCache();
  if(currentConsolAloj) viewConsolDetail(currentConsolAloj);
  batchWriteValidation(pending.map(r=>r.idx), true);
}
function desvalidarTodasConsol(alojName) {
  let src=allReservas.filter(r => r.alojamiento === alojName);
  if (_mpHasFilter()) src = src.filter(r => _mpMatchDate(r._dEntrada));
  const vals=src.filter(r => validated.has(r.idx));
  if(!vals.length||!confirm(`\u00BFDesvalidar ${vals.length} reserva${vals.length>1?'s':''} de ${alojName}?`))return;
  vals.forEach(r => validated.delete(r.idx));
  _validatedVersion++; invalidateFilterCache();
  if(currentConsolAloj) viewConsolDetail(currentConsolAloj);
  batchWriteValidation(vals.map(r=>r.idx), false);
}
function togglePasarela(i){
  const oldC = getLiq(allReservas[i]);
  settings[i].pasarela=!settings[i].pasarela; invalidateCache(i);
  const newC = getLiq(allReservas[i]);
  if (_globalStatsCache) _globalStatsCache.tL += (newC.totalLiq - oldC.totalLiq);
  _patchSingleRow(i, oldC, newC);
  scheduleReservaConfigSave(i);
}
function toggleValidate(i){
  const wasValidated = validated.has(i);
  if(wasValidated) validated.delete(i); else validated.add(i);
  _validatedVersion++;
  const sf2 = simpleComboState.status.value;
  const sortF = simpleComboState.sort.value;
  if (sf2 !== 'all' || sortF === 'estado') {
    invalidateFilterCache();
    renderTable();
  } else {
    // Patch path \u2014 filtered set unchanged, just toggle badge + update stats
    _patchSingleRow(i, null, null, wasValidated);
  }
  if(document.getElementById("screen-detail").classList.contains("active"))viewDetail(i);
  if(document.getElementById("screen-consoldetail").classList.contains("active") && currentConsolAloj) viewConsolDetail(currentConsolAloj);
  writeValidationToSheet(i, !wasValidated);
}

// \u2500\u2500\u2500 CACHED STATS for incremental updates \u2500\u2500\u2500
let _cachedFilteredStats = null; // { filPendingCount, filValidatedCount, fR, fL, fV, tNoches, tTotal, tBase, tComPlat, tComGTC, tLimp, tAmen, tComPas, tSub, tRet, tIva21, tLiq }

function _computeStatsFromScratch(fil) {
  const s = { filPendingCount:0, filValidatedCount:0, fR:0, fL:0, fV:0,
    tNoches:0, tTotal:0, tBase:0, tComPlat:0, tComGTC:0, tLimp:0, tAmen:0, tComPas:0, tSub:0, tRet:0, tIva21:0, tLiq:0, tCE:0, tCE2:0 };
  for (let i = 0; i < fil.length; i++) {
    const r = fil[i], c = getLiq(r), isV = validated.has(r.idx);
    s.fR += r.totalReserva; s.fL += c.totalLiq;
    if (isV) { s.fV++; s.filValidatedCount++; } else s.filPendingCount++;
    s.tNoches += r._nights; s.tTotal += r.totalReserva; s.tBase += c.baseSinIVA;
    s.tComPlat += c.comPlat; s.tComGTC += c.comGTC; s.tLimp += c.limp; s.tAmen += c.amen; s.tComPas += c.comPas;
    s.tSub += c.sub; s.tRet += c.ret; s.tIva21 += c.iva; s.tLiq += c.totalLiq; s.tCE += c.ceTotal; s.tCE2 += c.ceSinIvaTotal;
  }
  _cachedFilteredStats = s;
  return s;
}

function _getOrComputeStats(fil) {
  if (_cachedFilteredStats) return _cachedFilteredStats;
  return _computeStatsFromScratch(fil);
}

// \u2500\u2500\u2500 IN-PLACE ROW UPDATE O(1) \u2500\u2500\u2500
/**
 * @description Actualiza una sola fila de la tabla sin reconstruir todo el DOM.
 * T\u00e9cnica delta-update: compara c\u00e1lculos antiguos vs nuevos y actualiza solo
 * las celdas num\u00e9ricas que han cambiado, m\u00e1s el footer incrementalmente.
 * @param {number} idx - ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Ândice de la reserva
 * @param {Object} oldC - C\u00e1lculos anteriores (de calcLiquidacion)
 * @param {Object} newC - C\u00e1lculos nuevos
 * @param {boolean} validationFlipped - Si cambi\u00f3 el estado de validaci\u00f3n
 * @private
 */
function _patchSingleRow(idx, oldC, newC, validationFlipped) {
  const row = document.getElementById("row-" + idx);
  if (!row) { renderTable(); return; }
  const r = allReservas[idx];
  if (!r) return;

  // Save scroll position before DOM changes
  const wrap = row.closest('.table-wrap');
  const scrollBefore = wrap ? wrap.scrollTop : window.scrollY;

  // Build new HTML (main row + CE panel row + CE2 panel row)
  const tmp = document.createElement('tbody');
  tmp.innerHTML = _buildRowHtml(r);
  let newMainRow = tmp.children[0];
  let newCePanel = tmp.children[1]; // CE (IVA inc.) panel
  let newCe2Panel = tmp.children[2]; // CE (Sin IVA) panel

  // Remember if CE panels were open
  let oldCePanel = document.getElementById('ce-ppanel-' + idx);
  let cePanelWasOpen = oldCePanel && oldCePanel.style.display !== 'none';
  let oldCe2Panel = document.getElementById('ce2-ppanel-' + idx);
  let ce2PanelWasOpen = oldCe2Panel && oldCe2Panel.style.display !== 'none';

  // Batch all DOM mutations: use replaceWith to swap in one go
  let fragment = document.createDocumentFragment();
  fragment.appendChild(newMainRow);
  if (newCePanel) {
    if (cePanelWasOpen) { newCePanel.style.display = ''; _openCE.ce.idx = idx; _openCE.ce.view = 'p'; }
    fragment.appendChild(newCePanel);
  }
  if (newCe2Panel) {
    if (ce2PanelWasOpen) { newCe2Panel.style.display = ''; _openCE.ce2.idx = idx; _openCE.ce2.view = 'p'; }
    fragment.appendChild(newCe2Panel);
  }
  if (oldCe2Panel) oldCe2Panel.remove();
  if (oldCePanel) oldCePanel.remove();
  row.replaceWith(fragment);

  // Restore scroll position synchronously
  if (wrap) wrap.scrollTop = scrollBefore; else window.scrollTo(0, scrollBefore);

  // Incremental stats update
  const fil = _lastFiltered;
  if (!fil) { renderTable(); return; }

  let st = _cachedFilteredStats;
  if (!st) { st = _computeStatsFromScratch(fil); }

  if (oldC && newC) {
    st.fL += (newC.totalLiq - oldC.totalLiq);
    st.tBase += (newC.baseSinIVA - oldC.baseSinIVA);
    st.tComPlat += (newC.comPlat - oldC.comPlat);
    st.tComGTC += (newC.comGTC - oldC.comGTC);
    st.tLimp += (newC.limp - oldC.limp);
    st.tAmen += (newC.amen - oldC.amen);
    st.tComPas += (newC.comPas - oldC.comPas);
    st.tSub += (newC.sub - oldC.sub);
    st.tRet += (newC.ret - oldC.ret);
    st.tIva21 += (newC.iva - oldC.iva);
    st.tLiq += (newC.totalLiq - oldC.totalLiq);
    st.tCE += (newC.ceTotal - oldC.ceTotal);
    st.tCE2 += (newC.ceSinIvaTotal - oldC.ceSinIvaTotal);
  }
  if (validationFlipped !== undefined) {
    if (validationFlipped) {
      st.filValidatedCount--; st.filPendingCount++; st.fV--;
    } else {
      st.filValidatedCount++; st.filPendingCount--; st.fV++;
    }
  }

  _renderStatsFromCache(fil, st);
}

function _renderStatsFromCache(fil, st) {
  const sf2 = simpleComboState.status.value;
  const hasFilter = comboState.platform.selected.size > 0 || comboState.aloj.selected.size > 0 || sf2 !== "all" || _mpHasFilter();

  const gs = getGlobalStats();
  const tR = gs.tR, tL = gs.tL, vC = validated.size;

  const btnVal = document.getElementById("btn-validar-todas");
  const btnDesval = document.getElementById("btn-desvalidar-todas");
  btnVal.style.display = st.filPendingCount > 0 ? '' : 'none';
  btnVal.textContent = st.filPendingCount === fil.length ? `\u2713 ${t('btn.validateAll')} (${st.filPendingCount})` : `\u2713 ${t('btn.validatePending')} (${st.filPendingCount})`;
  btnDesval.style.display = st.filValidatedCount > 0 ? '' : 'none';
  btnDesval.textContent = st.filValidatedCount === fil.length ? `\u21A9 ${t('btn.unvalidateAll')} (${st.filValidatedCount})` : `\u21A9 ${t('btn.unvalidateValidated')} (${st.filValidatedCount})`;

  document.getElementById("filter-count").textContent = fil.length + " " + t("stats.reservationCount");
  const pctR = allReservas.length > 0 ? (fil.length / allReservas.length * 100).toFixed(1) : 0;
  const pctTR = tR > 0 ? (st.fR / tR * 100).toFixed(1) : 0;
  const pctTL = tL > 0 ? (st.fL / tL * 100).toFixed(1) : 0;
  const pctV = vC > 0 ? (st.fV / vC * 100).toFixed(1) : 0;
  document.getElementById("stats-row").innerHTML = `
    <div class="stat-card"><div class="stat-label">${t("stats.reservations")}</div><div class="stat-value">${allReservas.length}</div>
      ${hasFilter ? `<div class="stat-filtered">${fil.length} ${t("stats.filtered")} <span class="stat-pct">(${pctR}%)</span></div>` : ''}</div>
    <div class="stat-card"><div class="stat-label">${t("stats.totalReservations")}</div><div class="stat-value" style="color:#1a2744">${fmt(tR)} \u20AC</div>
      ${hasFilter ? `<div class="stat-filtered">${fmt(st.fR)} \u20AC <span class="stat-pct">(${pctTR}%)</span></div>` : ''}</div>
    <div class="stat-card"><div class="stat-label">${t("stats.totalToSettle")}</div><div class="stat-value" style="color:#4f8cff">${fmt(tL)} \u20AC</div>
      ${hasFilter ? `<div class="stat-filtered">${fmt(st.fL)} \u20AC <span class="stat-pct">(${pctTL}%)</span></div>` : ''}</div>
    <div class="stat-card"><div class="stat-label">${t("stats.validated")}</div><div class="stat-value" style="color:#43a047">${vC} / ${allReservas.length}</div>
      ${hasFilter ? `<div class="stat-filtered">${st.fV} / ${fil.length} ${t("stats.filtered")} <span class="stat-pct">(${pctV}%)</span></div>` : ''}</div>`;

  _updateFooter(fil.length, st.tNoches, st.tTotal, st.tBase, st.tComPlat, st.tComGTC, st.tLimp, st.tAmen, st.tComPas, st.tSub, st.tRet, st.tIva21, st.tLiq, st.tCE, st.tCE2);
}

let highlightIdx = null;
// ==============================================================================================================================
//  [M13] DETAIL_VIEW ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â Vista de detalle individual de una reserva
// ==============================================================================================================================

/**
 * @description Navega a una reserva espec\u00edfica: cambia de p\u00e1gina si necesario y la resalta.
 * @param {number} idx - ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Ândice de la reserva en allReservas[]
 */
function goToReserva(idx) {
  // Reset filters so the reservation is visible
  comboState.platform.selected = new Set(); updateComboDisplay('platform');
  comboState.aloj.selected = new Set(); updateComboDisplay('aloj');
  clearMonthFilter();
  simpleComboState.status.value = 'all';
  document.querySelector('#combo-status .combo-input').value = '';
  document.querySelector('#combo-status .combo-input').placeholder = t('filter.allStatuses2');
  document.getElementById('combo-status').classList.remove('has-value');
  simpleComboState.sort.value = 'idx';
  document.querySelector('#combo-sort .combo-input').value = '';
  document.querySelector('#combo-sort .combo-input').placeholder = t('sort.originalOrder');
  document.getElementById('combo-sort').classList.remove('has-value');
  simpleComboState.sortdir.value = 'asc';
  document.querySelector('#combo-sortdir .combo-input').value = '';
  document.querySelector('#combo-sortdir .combo-input').placeholder = '\u2191';
  document.getElementById('combo-sortdir').classList.remove('has-value');
  highlightIdx = idx;
  showScreen("list");
  renderTable();
  setTimeout(() => {
    const row = document.getElementById("row-" + idx);
    if (row) {
      row.scrollIntoView({ behavior: "smooth", block: "center" });
      row.classList.add("highlight");
      setTimeout(() => { row.classList.remove("highlight"); highlightIdx = null; }, 2000);
    }
  }, 100);
}

// \\u2500\\u2500\\u2500 INDIVIDUAL DETAIL \\u2500\\u2500\\u2500
/**
 * @description Renderiza la vista de detalle de una reserva individual.
 * Muestra desglose completo de la liquidaci\u00f3n con controles editables.
 * @param {number} idx - ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Ândice de la reserva en allReservas[]
 */
