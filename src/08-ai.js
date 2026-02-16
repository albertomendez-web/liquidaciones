// === AI ASSISTANT ===
let _aiPanelOpen = false;
let _aiHistory = [];
let _aiProcessing = false;
let _aiContextCache = { key: '', ctx: '', ts: 0 }; // Phase 4: context cache
let _aiAlertsShown = false; // Phase 4: anomaly alerts shown flag
let _aiEntityMemory = { pisos: [], propietarios: [], plataformas: [] }; // Phase 5: entity tracking

function sendAIChip(btn) {
  var qKey = btn.getAttribute('data-q-key');
  var q = qKey ? t(qKey) : btn.getAttribute('data-q');
  if (!q) return;
  // Decode HTML entities
  var tmp = document.createElement('textarea');
  tmp.innerHTML = q;
  q = tmp.value;
  document.getElementById('ai-input').value = q;
  // Hide chips after first click
  var chips = document.getElementById('ai-chips');
  if (chips) chips.classList.add('ai-chips-hidden');
  sendAIMessage();
}

function toggleAIPanel() {
  _aiPanelOpen = !_aiPanelOpen;
  document.getElementById('ai-panel').classList.toggle('open', _aiPanelOpen);
  if (_aiPanelOpen) {
    document.getElementById('ai-badge').style.display = 'none';
    setTimeout(function(){ document.getElementById('ai-input').focus(); }, 300);
    // Phase 4: Show anomaly alerts on first open after data load
    if (!_aiAlertsShown && allReservas && allReservas.length > 0) {
      _aiAlertsShown = true;
      setTimeout(_showAnomalyAlerts, 400);
    }
  }
}

/**
 * @description Detecta anomal\u00EDas en los datos y muestra alertas proactivas.
 * Se ejecuta una vez al abrir el panel tras cargar datos.
 */
function _showAnomalyAlerts() {
  if (!allReservas || allReservas.length === 0) return;
  var alerts = [];
  var f = function(v) { return v.toFixed(2); };

  // 1. Pisos con ADR bajo (<50 EUR/noche)
  var lowAdr = [];
  var byAloj = {};
  allReservas.forEach(function(r) {
    var a = r.alojamiento || 'Sin'; var c = getLiq(r); var n = r._nights || 0;
    if (!byAloj[a]) byAloj[a] = {n:0, noch:0, imp:0, liq:0};
    byAloj[a].n++; byAloj[a].noch += n; byAloj[a].imp += c.total; byAloj[a].liq += c.totalLiq;
  });
  Object.keys(byAloj).forEach(function(a) {
    var d = byAloj[a];
    if (d.noch >= 5) { // solo si tiene al menos 5 noches
      var adr = d.imp / d.noch;
      if (adr < 50) lowAdr.push({ name: a, adr: adr, noch: d.noch });
    }
  });
  if (lowAdr.length > 0) {
    alerts.push('\u26A0\uFE0F **' + lowAdr.length + ' ' + t('alert.lowAdr') + '**: ' +
      lowAdr.slice(0,5).map(function(x){ return x.name + ' (' + f(x.adr) + '\u20AC)'; }).join(', ') +
      (lowAdr.length > 5 ? '... ' + t('alert.andMore').replace('%s', lowAdr.length-5) : ''));
  }

  // 2. Pisos sin reservas (en propietarios pero 0 reservas)
  if (_propietariosMap) {
    var sinReservas = [];
    Object.keys(_propietariosMap).forEach(function(k) {
      if (!_propietariosMap[k]) return;
      var found = false;
      for (var i = 0; i < allReservas.length; i++) {
        if (allReservas[i]._alojLc === k) { found = true; break; }
      }
      if (!found) sinReservas.push(k.toUpperCase());
    });
    if (sinReservas.length > 0) {
      alerts.push('\uD83D\uDEAB **' + sinReservas.length + ' ' + t('alert.noReserv') + '**: ' +
        sinReservas.slice(0,5).join(', ') + (sinReservas.length > 5 ? '...' : ''));
    }
  }

  // 3. Alto % de pendientes de validar
  var pctPend = allReservas.length > 0 ? ((allReservas.length - validated.size) / allReservas.length * 100) : 0;
  if (pctPend > 50 && allReservas.length > 20) {
    alerts.push('\u2705 **' + (allReservas.length - validated.size) + ' ' + t('alert.pendingVal') + '** (' + pctPend.toFixed(0) + '% ' + t('alert.ofTotal') + ')');
  }

  // 4. Pisos con margen propietario muy bajo (<30%)
  var lowMargin = [];
  Object.keys(byAloj).forEach(function(a) {
    var d = byAloj[a];
    if (d.imp > 500) { // solo pisos con ingresos significativos
      var margin = d.liq / d.imp * 100;
      if (margin < 30) lowMargin.push({ name: a, margin: margin });
    }
  });
  if (lowMargin.length > 0) {
    alerts.push('\uD83D\uDCC9 **' + lowMargin.length + ' ' + t('alert.lowMargin') + '**: ' +
      lowMargin.slice(0,4).map(function(x){ return x.name + ' (' + x.margin.toFixed(0) + '%)'; }).join(', '));
  }

  // 5. Phase 5: Duplicados detectados
  var dupSeen = {};
  var dupCount = 0;
  allReservas.forEach(function(r) {
    var key = (r.cliente||'').toLowerCase().trim() + '|' + (r.alojamiento||'').toLowerCase() + '|' + (r._fmtEntrada||'') + '|' + (r._fmtSalida||'');
    if (key.length < 10) return;
    if (dupSeen[key]) dupCount++; else dupSeen[key] = true;
  });
  if (dupCount > 0) {
    alerts.push('\uD83D\uDD04 **' + dupCount + ' ' + t('alert.duplicates') + '** ' + t('alert.showDups'));
  }

  if (alerts.length > 0) {
    var alertDiv = document.createElement('div');
    alertDiv.className = 'ai-msg ai-alert';
    alertDiv.innerHTML = '<strong>' + t('alert.detected') + '</strong><br>' +
      alerts.join('<br>').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') +
      '<br><em style="font-size:11px;color:#6b7280;">' + t('alert.askMore') + '</em>';
    document.getElementById('ai-messages').appendChild(alertDiv);
    document.getElementById('ai-messages').scrollTop = document.getElementById('ai-messages').scrollHeight;
  }
}

function _toggleAIHelp() {
  var overlay = document.getElementById('ai-help-overlay');
  if (overlay) overlay.classList.toggle('open');
}

function _getAIKey() {
  let key = SafeStorage.get('ai-api-key');
  if (!key) {
    key = prompt(t('ai.apiKeyPrompt'));
    if (key && key.trim()) {
      SafeStorage.set('ai-api-key', key.trim());
    } else { return null; }
  }
  return key;
}

/**
 * @description Fase 2: Clasificador de queries.
 * Analiza la pregunta del usuario y devuelve un Set de categor\u00EDas
 * para construir solo el contexto relevante.
 * @param {string} text - Pregunta del usuario
 * @returns {Set<string>} Categor\u00EDas activas
 */
function _classifyQuery(text) {
  var cats = new Set();
  var t = text.toLowerCase();

  // Always include global summary (cheap)
  cats.add('GLOBAL');

  var patterns = {
    FINANCIAL: /comisi[oÃ³]n|irpf|retenci[oÃ³]n|limpieza|amenities|pasarela|desglose|coste|gasto|margen|beneficio|ingres/i,
    PLATFORM:  /plataforma|booking|airbnb|vrbo|canal|venta|stripe/i,
    PROPERTY:  /alojamiento|piso|apartamento|propiedad|vivienda|top.*(aloj|piso)|ranking/i,
    OWNER:     /propietario|due[Ã±n]o|liquidaci[oÃ³]n\s+(de|para|del)|qui[eÃ©]n|owner/i,
    TIME:      /mes(es)?|mensual|enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre|trimestre|semestre|estacion|temporada|verano|invierno|a[Ã±n]o|anual|201|202|comparar?|vs|versus|evolu|creci|tendencia/i,
    AGENT:     /agente|atendido|gestion[oÃ³]?|qui[eÃ©]n (atiende|gestiona|lleva)/i,
    MARKETING: /marketing|origen|captaci|campa[Ã±n]a|fuente|canal.*(market|captac)/i,
    GTC_SPLIT: /80.?20|m[iÃ­]nimo.*garant|acuerdo|split|especial/i,
    MAINT:     /mantenimiento|extra(ordinari)?|cuota|gasto.*fijo/i,
    VALIDATE:  /validar?|validaci|pendiente|estado|revisar/i,
    DETAIL:    /detalle|lista|reserva.*(de|del|para)|cliente|localizador|busca|espec[iÃ­]fic/i,
    SUMMARY:   /resumen|ejecutivo|general|total|global|overview|todo|completo/i,
    KPI:       /kpi|indicador|adr|revpar|ocupaci|media|promedio|ratio|eficiencia|rendimiento|m[eÃ©]trica|estad[iÃ­]stic/i,
    YOY:       /interanual|yoy|year.over|a[Ã±n]o.a.a[Ã±n]o|compar.*(a[Ã±n]o|anual|201|202)|creci.*anual|vs\s*20[12]/i,
    SEASON:    /estacion|temporada|verano|invierno|alta|baja|trimestre|q[1234]|t[1234]|pico|valle/i,
    CMP_OWNER: /compar.*propietario|propietario.*vs|versus.*propietario|pisos\s+de\s+\w+\s+(vs|contra|frente|compar)/i,
    PREDICT:   /predicci[oÃ³]n|proyecci[oÃ³]n|previsi[oÃ³]n|estimar?|pronostic|futuro|pr[oÃ³]ximo|siguiente|forecast/i,
    EXPORT:    /export|excel|csv|descargar?|generar?.*(tabla|archivo|fichero)|guardar.*(tabla|datos)/i,
    DUPCHECK:  /duplicad|sospech|an[oÃ³]mal|raro|extra[Ã±n]|repetid|error|inconsist/i,
    SEGMENT:   /segmento|tipo.*(estancia|cliente|reserva)|escapada|corta|larga|media.*(estancia|duraci)|clasificar?/i,
    HEATMAP:   /heatmap|mapa.*calor|calendario|ocupaci[oÃ³]n.*(mes|piso|visual)|vista.*(anual|mensual|calend)|parrilla/i,
    LEADTIME:  /antelaci[oÃ³]n|lead.?time|anticipo|d[iÃ­]as.*antes|reserv.*(anticip|antelac|previo)|cuando.*reserv/i,
    BRIEFING:  /briefing|resumen.*r[aÃ¡]pido|3.*frase|estado.*actual|lo m[aÃ¡]s.*importante|titulares|flash|quick/i,
    WHATIF:    /qu[eÃ©].*pasar|simular?|simulaci|what.?if|hipot[eÃ©]tic|escenario|si.*subir|si.*bajar|si.*cambiar|ahorrar[iÃ­]amos/i,
  };

  Object.keys(patterns).forEach(function(cat) {
    if (patterns[cat].test(t)) cats.add(cat);
  });

  // If only GLOBAL matched (no specific pattern), assume SUMMARY
  if (cats.size === 1) cats.add('SUMMARY');

  return cats;
}

/**
 * @description Construye el contexto de datos seg\u00FAn las categor\u00EDas detectadas.
 * Fase 4: Cache + predicci\u00F3n + comparaci\u00F3n propietarios.
 * @param {Set<string>} cats - Categor\u00EDas de la query
 * @returns {string} Contexto optimizado
 */
function buildAIContext(cats) {
  if (!allReservas || allReservas.length === 0) return t('msg.noData');
  if (!cats) cats = new Set(['GLOBAL', 'SUMMARY']);

  // Phase 4: Context cache - reuse if same categories and data hasn't changed
  var cacheKey = Array.from(cats).sort().join(',') + '|' + allReservas.length + '|' + validated.size;
  if (_aiContextCache.key === cacheKey && (Date.now() - _aiContextCache.ts) < 30000) {
    console.log('[AI] Context cache HIT');
    return _aiContextCache.ctx;
  }

  var total = allReservas.length;
  var needAloj = cats.has('PROPERTY') || cats.has('SUMMARY') || cats.has('FINANCIAL') || cats.has('OWNER') || cats.has('MAINT') || cats.has('KPI') || cats.has('YOY') || cats.has('CMP_OWNER') || cats.has('DUPCHECK');
  var needPlat = cats.has('PLATFORM') || cats.has('SUMMARY') || cats.has('FINANCIAL') || cats.has('SEASON') || cats.has('WHATIF');
  var needMes = cats.has('TIME') || cats.has('SUMMARY') || cats.has('SEASON') || cats.has('PREDICT') || cats.has('BRIEFING');
  var needYear = cats.has('TIME') || cats.has('SUMMARY') || cats.has('YOY') || cats.has('PREDICT');
  var needAgent = cats.has('AGENT') || cats.has('SUMMARY');
  var needMkt = cats.has('MARKETING') || cats.has('SUMMARY');
  var needOwner = cats.has('OWNER') || cats.has('SUMMARY') || cats.has('CMP_OWNER');
  var needGtc = cats.has('GTC_SPLIT') || cats.has('OWNER') || cats.has('SUMMARY');
  var needMaint = cats.has('MAINT') || cats.has('OWNER') || cats.has('SUMMARY');
  var needDetail = cats.has('DETAIL');
  var needVal = cats.has('VALIDATE');
  var needKpi = cats.has('KPI') || cats.has('SUMMARY');
  var needYoy = cats.has('YOY') || cats.has('TIME');
  var needSeason = cats.has('SEASON') || cats.has('TIME');
  var needPredict = cats.has('PREDICT');
  var needCmpOwner = cats.has('CMP_OWNER');
  var needDup = cats.has('DUPCHECK');
  var needSegment = cats.has('SEGMENT') || cats.has('SUMMARY');
  var needHeatmap = cats.has('HEATMAP');
  var needLeadtime = cats.has('LEADTIME');
  var needBriefing = cats.has('BRIEFING');
  var needWhatif = cats.has('WHATIF');

  // Always compute global
  var byAloj = {}, byPlat = {}, byMes = {}, byYear = {}, byAgent = {}, byMarketing = {};
  var byPlatQ = {}; // plataforma Ã— trimestre (seasonality)
  var byAlojYear = {}; // alojamiento Ã— a\u00F1o (YoY)
  var bySegment = {corta:0, media:0, larga:0, cortaN:0, mediaN:0, largaN:0, cortaI:0, mediaI:0, largaI:0}; // Phase 5
  var byAlojMes = {}; // Phase 5: heatmap alojÃ—mes
  var leadTimes = []; // Phase 5: lead time data
  var dupCandidates = []; // Phase 5: duplicate candidates
  var G = {n:0, noch:0, imp:0, base:0, cPlat:0, cGTC:0, cPas:0, limp:0, amen:0, ce:0, ce2:0, irpf:0, liq:0, val:0, pend:0};

  allReservas.forEach(function(r) {
    var c = getLiq(r), n = r._nights || 0;
    G.n++; G.noch += n; G.imp += c.total; G.base += c.baseSinIVA;
    G.cPlat += c.comPlat; G.cGTC += c.comGTC; G.cPas += c.comPas;
    G.limp += c.limp; G.amen += c.amen; G.ce += c.ceTotal; G.ce2 += c.ceSinIvaTotal;
    G.irpf += c.ret; G.liq += c.totalLiq;
    if (validated.has(r.idx)) G.val++; else G.pend++;

    if (needAloj) {
      var a = r.alojamiento || 'Sin alojamiento';
      if (!byAloj[a]) byAloj[a] = {n:0, noch:0, imp:0, base:0, cPlat:0, cGTC:0, limp:0, amen:0, liq:0};
      var da = byAloj[a]; da.n++; da.noch += n; da.imp += c.total; da.base += c.baseSinIVA;
      da.cPlat += c.comPlat; da.cGTC += c.comGTC; da.limp += c.limp; da.amen += c.amen; da.liq += c.totalLiq;
    }
    if (needPlat) {
      var p = r.plataforma || 'Desconocida';
      if (!byPlat[p]) byPlat[p] = {n:0, imp:0, base:0, cPlat:0, cPas:0, liq:0};
      var dp = byPlat[p]; dp.n++; dp.imp += c.total; dp.base += c.baseSinIVA;
      dp.cPlat += c.comPlat; dp.cPas += c.comPas; dp.liq += c.totalLiq;
    }
    var fE = r._dEntrada;
    if (fE && (needMes || needYear)) {
      if (needMes) {
        var mes = (fE.getMonth()+1).toString().padStart(2,'0') + '/' + fE.getFullYear();
        if (!byMes[mes]) byMes[mes] = {n:0, noch:0, imp:0, liq:0};
        var dm = byMes[mes]; dm.n++; dm.noch += n; dm.imp += c.total; dm.liq += c.totalLiq;
      }
      if (needYear) {
        var yr = fE.getFullYear().toString();
        if (!byYear[yr]) byYear[yr] = {n:0, noch:0, imp:0, base:0, liq:0, cPlat:0, cGTC:0};
        var dy = byYear[yr]; dy.n++; dy.noch += n; dy.imp += c.total; dy.base += c.baseSinIVA; dy.liq += c.totalLiq;
        dy.cPlat += c.comPlat; dy.cGTC += c.comGTC;
      }
      // Estacionalidad: plataforma x trimestre
      if (needSeason) {
        var q = 'T' + (Math.floor(fE.getMonth() / 3) + 1);
        var pk = (r.plataforma || 'Desconocida') + '|' + q;
        if (!byPlatQ[pk]) byPlatQ[pk] = {n:0, noch:0, imp:0};
        byPlatQ[pk].n++; byPlatQ[pk].noch += n; byPlatQ[pk].imp += c.total;
      }
      // YoY por alojamiento
      if (needYoy) {
        var yk = (r.alojamiento || 'Sin') + '|' + fE.getFullYear();
        if (!byAlojYear[yk]) byAlojYear[yk] = {n:0, noch:0, imp:0, liq:0};
        byAlojYear[yk].n++; byAlojYear[yk].noch += n; byAlojYear[yk].imp += c.total; byAlojYear[yk].liq += c.totalLiq;
      }
    }
    if (needAgent) {
      var ag = r.atendidoPor || 'Sin asignar';
      if (!byAgent[ag]) byAgent[ag] = {n:0, imp:0};
      byAgent[ag].n++; byAgent[ag].imp += c.total;
    }
    if (needMkt) {
      var mk = r.origenMarketing || 'Sin origen';
      if (!byMarketing[mk]) byMarketing[mk] = {n:0, imp:0};
      byMarketing[mk].n++; byMarketing[mk].imp += c.total;
    }
    // Phase 5: Client segmentation
    if (needSegment) {
      if (n <= 2) { bySegment.corta++; bySegment.cortaN += n; bySegment.cortaI += c.total; }
      else if (n <= 7) { bySegment.media++; bySegment.mediaN += n; bySegment.mediaI += c.total; }
      else { bySegment.larga++; bySegment.largaN += n; bySegment.largaI += c.total; }
    }
    // Phase 5: Heatmap alojÃ—mes
    if (needHeatmap && fE) {
      var hmKey = (r.alojamiento || 'Sin') + '|' + (fE.getMonth()+1).toString().padStart(2,'0');
      if (!byAlojMes[hmKey]) byAlojMes[hmKey] = {n:0, noch:0};
      byAlojMes[hmKey].n++; byAlojMes[hmKey].noch += n;
    }
    // Phase 5: Lead time
    if (needLeadtime && fE && r._dAlta) {
      var ltDays = Math.round((fE - r._dAlta) / 86400000);
      if (ltDays >= 0 && ltDays < 730) {
        leadTimes.push({days: ltDays, plat: r.plataforma || 'Desconocida', aloj: r.alojamiento || 'Sin'});
      }
    }
    // Phase 5: Duplicate detection (collect fingerprints)
    if (needDup) {
      dupCandidates.push({
        idx: r.idx, cliente: (r.cliente||'').toLowerCase().trim(),
        aloj: (r.alojamiento||'').toLowerCase(), plat: r.plataforma||'',
        entrada: r._fmtEntrada||'', salida: r._fmtSalida||'',
        imp: c.total, n: n
      });
    }
  });

  var f = function(v){ return v.toFixed(2); };

  // GLOBAL (always)
  var ctx = '=== RESUMEN GLOBAL ===\n';
  ctx += 'Reservas: ' + G.n + ' (Validadas: ' + G.val + ', Pendientes: ' + G.pend + ')\n';
  ctx += 'Noches: ' + G.noch + '\n';
  if (cats.has('FINANCIAL') || cats.has('SUMMARY') || cats.has('GLOBAL')) {
    ctx += 'Importe(IVA): ' + f(G.imp) + ', Base(sinIVA): ' + f(G.base) + '\n';
    ctx += 'Comisi\u00F3n canales: ' + f(G.cPlat) + ', Comisi\u00F3n GTC: ' + f(G.cGTC) + ', Pasarela: ' + f(G.cPas) + '\n';
    ctx += 'Limpieza: ' + f(G.limp) + ', Amenities: ' + f(G.amen) + '\n';
    ctx += 'CE(IVA): ' + f(G.ce) + ', CE(sinIVA): ' + f(G.ce2) + ', IRPF: ' + f(G.irpf) + '\n';
    ctx += 'Total a liquidar: ' + f(G.liq) + '\n';
    if (G.n > 0) ctx += 'Media/reserva: ' + f(G.imp/G.n) + ', Media/noche: ' + (G.noch>0 ? f(G.imp/G.noch) : '-') + '\n';
  } else {
    ctx += 'Importe(IVA): ' + f(G.imp) + ', A liquidar: ' + f(G.liq) + '\n';
  }

  // POR ALOJAMIENTO
  if (needAloj) {
    ctx += '\n=== POR ALOJAMIENTO ===\n';
    Object.keys(byAloj).sort().forEach(function(a) {
      var d = byAloj[a];
      ctx += a + ': ' + d.n + 'res ' + d.noch + 'noch, imp=' + f(d.imp) + ' comCanal=' + f(d.cPlat) + ' comGTC=' + f(d.cGTC) + ' limp=' + f(d.limp) + ' liq=' + f(d.liq) + '\n';
    });
  }

  // POR PLATAFORMA
  if (needPlat) {
    ctx += '\n=== POR PLATAFORMA ===\n';
    Object.keys(byPlat).sort().forEach(function(p) {
      var d = byPlat[p];
      ctx += p + ': ' + d.n + 'res, imp=' + f(d.imp) + ' comCanal=' + f(d.cPlat) + ' comPas=' + f(d.cPas) + ' liq=' + f(d.liq) + '\n';
    });
  }

  // POR MES
  if (needMes) {
    ctx += '\n=== POR MES ===\n';
    Object.keys(byMes).sort().forEach(function(m) {
      var d = byMes[m];
      ctx += m + ': ' + d.n + 'res ' + d.noch + 'noch, imp=' + f(d.imp) + ' liq=' + f(d.liq) + '\n';
    });
  }

  // POR A\u00D1O
  if (needYear) {
    var years = Object.keys(byYear).sort();
    if (years.length > 1) {
      ctx += '\n=== POR A\u00D1O ===\n';
      years.forEach(function(yr) {
        var d = byYear[yr];
        ctx += yr + ': ' + d.n + 'res ' + d.noch + 'noch, imp=' + f(d.imp) + ' comCanal=' + f(d.cPlat) + ' comGTC=' + f(d.cGTC) + ' liq=' + f(d.liq) + '\n';
      });
    }
  }

  // POR AGENTE
  if (needAgent) {
    var agents = Object.keys(byAgent).sort();
    if (agents.length > 1) {
      ctx += '\n=== POR AGENTE ===\n';
      agents.forEach(function(ag) { var d=byAgent[ag]; ctx += ag + ': ' + d.n + 'res, imp=' + f(d.imp) + '\n'; });
    }
  }

  // POR MARKETING
  if (needMkt) {
    var mkKeys = Object.keys(byMarketing).filter(function(k){ return k !== 'Sin origen'; }).sort();
    if (mkKeys.length > 1) {
      ctx += '\n=== POR ORIGEN MARKETING ===\n';
      mkKeys.forEach(function(mk) { var d=byMarketing[mk]; ctx += mk + ': ' + d.n + 'res, imp=' + f(d.imp) + '\n'; });
    }
  }

  // PROPIETARIOS
  if (needOwner && _propietariosMap && Object.keys(_propietariosMap).length > 0) {
    var byOwner = {};
    allReservas.forEach(function(r) {
      var ownerName = getPropietario(r.alojamiento);
      if (!ownerName || ownerName === t('consol.missingOwner')) return;
      if (!byOwner[ownerName]) byOwner[ownerName] = { pisos: {}, reservas: 0, imp: 0, liq: 0 };
      byOwner[ownerName].pisos[r.alojamiento] = true;
      byOwner[ownerName].reservas++;
      var c = getLiq(r);
      byOwner[ownerName].imp += c.total;
      byOwner[ownerName].liq += c.totalLiq;
    });
    var owners = Object.keys(byOwner).sort();
    if (owners.length > 0) {
      ctx += '\n=== PROPIETARIOS ===\n';
      owners.forEach(function(ow) {
        var d = byOwner[ow];
        ctx += ow + ': ' + Object.keys(d.pisos).sort().join(', ') + ' (' + d.reservas + 'res, imp=' + f(d.imp) + ' liq=' + f(d.liq) + ')\n';
      });
    }
  }

  // ACUERDOS ESPECIALES
  if (needGtc && (_gtcSplitAlojamientos.length > 0 || _gtcOwnedAlojamientos.length > 0)) {
    ctx += '\n=== ACUERDOS ESPECIALES ===\n';
    if (_gtcSplitAlojamientos.length > 0) {
      ctx += 'M\u00EDnimo garantizado 80/20: ' + _gtcSplitAlojamientos.join(', ') + '\n';
      ctx += '(GTC retiene 20%, propietario recibe 80%)\n';
    }
    if (_gtcOwnedAlojamientos.length > 0) {
      ctx += 'Propiedades GTC: ' + _gtcOwnedAlojamientos.join(', ') + ' (' + _gtcOwnedAlojamientos.length + ' pisos)\n';
    }
  }

  // MANTENIMIENTO
  if (needMaint) {
    var maintEntries = Object.keys(_consolMaint).filter(function(k){ return _consolMaint[k] && _consolMaint[k].enabled; });
    if (maintEntries.length > 0) {
      ctx += '\n=== MANTENIMIENTO MENSUAL ===\n';
      maintEntries.sort().forEach(function(a) { ctx += a + ': ' + f(_consolMaint[a].amount) + ' EUR/mes\n'; });
    }
  }

  // KPIs AVANZADOS
  if (needKpi && G.n > 0) {
    ctx += '\n=== KPIs ===\n';
    var adr = G.noch > 0 ? G.imp / G.noch : 0;
    var estanciaMedia = G.noch / G.n;
    var numAloj = Object.keys(byAloj).length || 1;
    var impPorPiso = G.imp / numAloj;
    var liqPorPiso = G.liq / numAloj;
    var comEfectiva = G.imp > 0 ? (G.cPlat + G.cGTC + G.cPas) / G.imp * 100 : 0;
    var margenProp = G.imp > 0 ? G.liq / G.imp * 100 : 0;
    ctx += 'ADR (tarifa media diaria): ' + f(adr) + ' EUR/noche (IVA incl.)\n';
    ctx += 'Estancia media: ' + estanciaMedia.toFixed(1) + ' noches/reserva\n';
    ctx += 'Ingreso medio por piso: ' + f(impPorPiso) + ' EUR (' + numAloj + ' alojamientos)\n';
    ctx += 'Liquidaci\u00F3n media por piso: ' + f(liqPorPiso) + ' EUR\n';
    ctx += 'Comisi\u00F3n efectiva total: ' + comEfectiva.toFixed(1) + '% (canal+GTC+pasarela sobre importe)\n';
    ctx += 'Margen propietario: ' + margenProp.toFixed(1) + '% (liquidaci\u00F3n/importe)\n';
    ctx += 'Reservas/piso: ' + (G.n / numAloj).toFixed(1) + ', Noches/piso: ' + (G.noch / numAloj).toFixed(1) + '\n';
    // Top 5 alojamientos por liquidaci\u00F3n
    if (needAloj) {
      var topAloj = Object.keys(byAloj).sort(function(a,b){ return byAloj[b].liq - byAloj[a].liq; }).slice(0,5);
      ctx += 'Top 5 pisos (liq): ';
      ctx += topAloj.map(function(a){ return a + '=' + f(byAloj[a].liq); }).join(', ') + '\n';
      // Bottom 5
      var botAloj = Object.keys(byAloj).sort(function(a,b){ return byAloj[a].liq - byAloj[b].liq; }).slice(0,5);
      ctx += 'Bottom 5 pisos (liq): ';
      ctx += botAloj.map(function(a){ return a + '=' + f(byAloj[a].liq); }).join(', ') + '\n';
      // ADR por alojamiento (top 5 + bottom 5)
      var alojByAdr = Object.keys(byAloj).filter(function(a){ return byAloj[a].noch > 0; })
        .sort(function(a,b){ return (byAloj[b].imp/byAloj[b].noch) - (byAloj[a].imp/byAloj[a].noch); });
      if (alojByAdr.length > 0) {
        ctx += 'Top 5 ADR: ' + alojByAdr.slice(0,5).map(function(a){ return a + '=' + f(byAloj[a].imp/byAloj[a].noch); }).join(', ') + '\n';
        ctx += 'Bottom 5 ADR: ' + alojByAdr.slice(-5).reverse().map(function(a){ return a + '=' + f(byAloj[a].imp/byAloj[a].noch); }).join(', ') + '\n';
      }
    }
  }

  // COMPARATIVA INTERANUAL (YoY)
  if (needYoy) {
    var yoyYears = Object.keys(byYear).sort();
    if (yoyYears.length >= 2) {
      ctx += '\n=== COMPARATIVA INTERANUAL ===\n';
      // Table header
      ctx += 'Concepto|' + yoyYears.join('|') + '|\u0394% \u00FAlt.\n';
      var last = yoyYears[yoyYears.length - 1], prev = yoyYears[yoyYears.length - 2];
      var dl = byYear[last], dp = byYear[prev];
      var pct = function(a,b){ return b > 0 ? ((a-b)/b*100).toFixed(1)+'%' : 'n/a'; };
      ctx += 'Reservas|' + yoyYears.map(function(y){ return byYear[y].n; }).join('|') + '|' + pct(dl.n,dp.n) + '\n';
      ctx += 'Noches|' + yoyYears.map(function(y){ return byYear[y].noch; }).join('|') + '|' + pct(dl.noch,dp.noch) + '\n';
      ctx += 'Importe|' + yoyYears.map(function(y){ return f(byYear[y].imp); }).join('|') + '|' + pct(dl.imp,dp.imp) + '\n';
      ctx += 'Liquidaci\u00F3n|' + yoyYears.map(function(y){ return f(byYear[y].liq); }).join('|') + '|' + pct(dl.liq,dp.liq) + '\n';
      ctx += 'ADR|' + yoyYears.map(function(y){ return byYear[y].noch>0 ? f(byYear[y].imp/byYear[y].noch) : '-'; }).join('|') + '|' + pct(dl.noch>0?dl.imp/dl.noch:0, dp.noch>0?dp.imp/dp.noch:0) + '\n';

      // Top movers por alojamiento (solo los que existen en ambos a\u00F1os)
      var alojYoy = {};
      Object.keys(byAlojYear).forEach(function(k) {
        var parts = k.split('|'), aloj = parts[0], yr = parts[1];
        if (!alojYoy[aloj]) alojYoy[aloj] = {};
        alojYoy[aloj][yr] = byAlojYear[k];
      });
      var movers = Object.keys(alojYoy).filter(function(a){ return alojYoy[a][last] && alojYoy[a][prev]; })
        .map(function(a){
          var curImp = alojYoy[a][last].imp, prevImp = alojYoy[a][prev].imp;
          return { name: a, cur: curImp, prev: prevImp, delta: prevImp > 0 ? (curImp-prevImp)/prevImp*100 : 999 };
        })
        .sort(function(a,b){ return b.delta - a.delta; });
      if (movers.length > 0) {
        ctx += '\nTop 5 crecimiento (' + prev + '\u2192' + last + '):\n';
        movers.slice(0,5).forEach(function(m) {
          ctx += m.name + ': ' + f(m.prev) + ' \u2192 ' + f(m.cur) + ' (' + (m.delta >= 999 ? 'nuevo' : (m.delta>0?'+':'') + m.delta.toFixed(1) + '%') + ')\n';
        });
        if (movers.length > 5) {
          var decliners = movers.slice().reverse().slice(0,5);
          ctx += 'Top 5 descenso:\n';
          decliners.forEach(function(m) {
            ctx += m.name + ': ' + f(m.prev) + ' \u2192 ' + f(m.cur) + ' (' + (m.delta>0?'+':'') + m.delta.toFixed(1) + '%)\n';
          });
        }
      }
    }
  }

  // ESTACIONALIDAD CRUZADA (plataforma x trimestre)
  if (needSeason && Object.keys(byPlatQ).length > 0) {
    ctx += '\n=== ESTACIONALIDAD (PLATAFORMA x TRIMESTRE) ===\n';
    // Collect all platforms and quarters
    var sPlats = {}, sQuarts = {};
    Object.keys(byPlatQ).forEach(function(k) {
      var parts = k.split('|');
      sPlats[parts[0]] = true; sQuarts[parts[1]] = true;
    });
    var platList = Object.keys(sPlats).sort();
    var qList = Object.keys(sQuarts).sort();
    ctx += 'Plataforma|' + qList.join('|') + '|Total\n';
    platList.forEach(function(p) {
      var totalP = 0;
      var row = p;
      qList.forEach(function(q) {
        var d = byPlatQ[p + '|' + q];
        var val = d ? d.imp : 0;
        totalP += val;
        row += '|' + (d ? d.n + 'res/' + f(val) : '-');
      });
      row += '|' + f(totalP);
      ctx += row + '\n';
    });
    // Quarter totals
    var rowT = 'TOTAL';
    var grandT = 0;
    qList.forEach(function(q) {
      var qTotal = 0;
      platList.forEach(function(p) { var d = byPlatQ[p+'|'+q]; if(d) qTotal += d.imp; });
      grandT += qTotal;
      rowT += '|' + f(qTotal);
    });
    rowT += '|' + f(grandT);
    ctx += rowT + '\n';
    // Pico vs valle
    var qTotals = qList.map(function(q) {
      var t = 0; platList.forEach(function(p) { var d = byPlatQ[p+'|'+q]; if(d) t += d.imp; }); return {q:q, imp:t};
    }).sort(function(a,b){ return b.imp - a.imp; });
    if (qTotals.length >= 2) {
      ctx += 'Trimestre pico: ' + qTotals[0].q + ' (' + f(qTotals[0].imp) + '), Valle: ' + qTotals[qTotals.length-1].q + ' (' + f(qTotals[qTotals.length-1].imp) + ')\n';
    }
  }

  // COMPARACIÃ“N DE PROPIETARIOS (detalle por owner con mÃ©tricas por piso)
  if (needCmpOwner && _propietariosMap && Object.keys(_propietariosMap).length > 0) {
    var cmpOwners = {};
    allReservas.forEach(function(r) {
      var ownerName = getPropietario(r.alojamiento);
      if (!ownerName || ownerName === t('consol.missingOwner')) return;
      if (!cmpOwners[ownerName]) cmpOwners[ownerName] = { pisos: {} };
      var a = r.alojamiento;
      if (!cmpOwners[ownerName].pisos[a]) cmpOwners[ownerName].pisos[a] = {n:0, noch:0, imp:0, liq:0};
      var c = getLiq(r), n = r._nights || 0;
      var dp = cmpOwners[ownerName].pisos[a];
      dp.n++; dp.noch += n; dp.imp += c.total; dp.liq += c.totalLiq;
    });
    ctx += '\n=== COMPARACI\u00D3N PROPIETARIOS (detalle por piso) ===\n';
    Object.keys(cmpOwners).sort().forEach(function(ow) {
      var pisos = cmpOwners[ow].pisos;
      var owTot = {n:0, noch:0, imp:0, liq:0};
      ctx += '\n' + ow + ':\n';
      ctx += 'Piso|Res|Noch|ADR|Imp|Liq|Margen%\n';
      Object.keys(pisos).sort().forEach(function(p) {
        var d = pisos[p];
        owTot.n += d.n; owTot.noch += d.noch; owTot.imp += d.imp; owTot.liq += d.liq;
        var adr = d.noch > 0 ? d.imp / d.noch : 0;
        var margin = d.imp > 0 ? d.liq / d.imp * 100 : 0;
        ctx += p + '|' + d.n + '|' + d.noch + '|' + f(adr) + '|' + f(d.imp) + '|' + f(d.liq) + '|' + margin.toFixed(1) + '%\n';
      });
      var owAdr = owTot.noch > 0 ? owTot.imp / owTot.noch : 0;
      var owMargin = owTot.imp > 0 ? owTot.liq / owTot.imp * 100 : 0;
      ctx += 'TOTAL|' + owTot.n + '|' + owTot.noch + '|' + f(owAdr) + '|' + f(owTot.imp) + '|' + f(owTot.liq) + '|' + owMargin.toFixed(1) + '%\n';
    });
  }

  // PREDICCI\u00D3N DE OCUPACI\u00D3N (proyecci\u00F3n simple basada en hist\u00F3rico)
  if (needPredict && Object.keys(byMes).length >= 12) {
    ctx += '\n=== PREDICCI\u00D3N / PROYECCI\u00D3N ===\n';
    var monthAvg = {};
    var monthYears = {};
    Object.keys(byMes).forEach(function(m) {
      var parts = m.split('/');
      var mm = parseInt(parts[0]);
      var yr = parts[1];
      if (!monthAvg[mm]) { monthAvg[mm] = {n:0, noch:0, imp:0, liq:0, count:0}; monthYears[mm] = []; }
      monthAvg[mm].n += byMes[m].n;
      monthAvg[mm].noch += byMes[m].noch;
      monthAvg[mm].imp += byMes[m].imp;
      monthAvg[mm].liq += byMes[m].liq;
      monthAvg[mm].count++;
      monthYears[mm].push(yr);
    });
    var mNames = ['','Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    ctx += 'Mes|Prom.Reservas|Prom.Noches|Prom.Importe|Prom.Liquidaci\u00F3n|A\u00F1os\n';
    for (var mm = 1; mm <= 12; mm++) {
      if (monthAvg[mm] && monthAvg[mm].count > 0) {
        var d = monthAvg[mm], c2 = d.count;
        ctx += mNames[mm] + '|' + (d.n/c2).toFixed(0) + '|' + (d.noch/c2).toFixed(0) + '|' + f(d.imp/c2) + '|' + f(d.liq/c2) + '|' + c2 + ' a\u00F1os\n';
      } else {
        ctx += mNames[mm] + '|sin datos\n';
      }
    }
    var yrKeys = Object.keys(byYear).sort();
    if (yrKeys.length >= 2) {
      var lastY = byYear[yrKeys[yrKeys.length-1]], prevY = byYear[yrKeys[yrKeys.length-2]];
      var growthRes = prevY.n > 0 ? ((lastY.n - prevY.n) / prevY.n * 100) : 0;
      var growthImp = prevY.imp > 0 ? ((lastY.imp - prevY.imp) / prevY.imp * 100) : 0;
      ctx += 'Tendencia ' + yrKeys[yrKeys.length-2] + '\u2192' + yrKeys[yrKeys.length-1] + ': reservas ' + (growthRes>0?'+':'') + growthRes.toFixed(1) + '%, importe ' + (growthImp>0?'+':'') + growthImp.toFixed(1) + '%\n';
      ctx += 'NOTA: La proyecci\u00F3n es una media hist\u00F3rica. Usa la tendencia para ajustar al alza/baja.\n';
    }
  }

  // PHASE 5: SEGMENTACI\u00D3N DE CLIENTES
  if (needSegment && G.n > 0) {
    ctx += '\n=== SEGMENTACI\u00D3N POR TIPO ESTANCIA ===\n';
    ctx += 'Tipo|Reservas|%Total|Noches|Importe|ADR|Estancia.Media\n';
    var segs = [
      {name:'Escapada (\u22642 noch)', n:bySegment.corta, noch:bySegment.cortaN, imp:bySegment.cortaI},
      {name:'Vacaciones (3-7 noch)', n:bySegment.media, noch:bySegment.mediaN, imp:bySegment.mediaI},
      {name:'Larga estancia (>7 noch)', n:bySegment.larga, noch:bySegment.largaN, imp:bySegment.largaI}
    ];
    segs.forEach(function(s) {
      var pct = (s.n / G.n * 100).toFixed(1);
      var adr = s.noch > 0 ? f(s.imp / s.noch) : '-';
      var avg = s.n > 0 ? (s.noch / s.n).toFixed(1) : '-';
      ctx += s.name + '|' + s.n + '|' + pct + '%|' + s.noch + '|' + f(s.imp) + '|' + adr + '|' + avg + ' noches\n';
    });
    // Segmentation by platform
    if (needPlat) {
      ctx += '\nSegmentaci\u00F3n por plataforma:\n';
      var segByPlat = {};
      allReservas.forEach(function(r2) {
        var p2 = r2.plataforma || 'Desconocida', n2 = r2._nights || 0;
        if (!segByPlat[p2]) segByPlat[p2] = {corta:0, media:0, larga:0};
        if (n2 <= 2) segByPlat[p2].corta++;
        else if (n2 <= 7) segByPlat[p2].media++;
        else segByPlat[p2].larga++;
      });
      ctx += 'Plataforma|Escapadas|Vacaciones|Larga\n';
      Object.keys(segByPlat).sort().forEach(function(p2) {
        var s2 = segByPlat[p2];
        ctx += p2 + '|' + s2.corta + '|' + s2.media + '|' + s2.larga + '\n';
      });
    }
  }

  // PHASE 5: HEATMAP OCUPACI\u00D3N (aloj \u00D7 mes)
  if (needHeatmap && Object.keys(byAlojMes).length > 0) {
    ctx += '\n=== HEATMAP OCUPACI\u00D3N (noches por aloj\u00D7mes) ===\n';
    var hmAlojs = new Set(), hmMonths = new Set();
    Object.keys(byAlojMes).forEach(function(k) {
      var p = k.split('|'); hmAlojs.add(p[0]); hmMonths.add(p[1]);
    });
    var hmMList = Array.from(hmMonths).sort();
    var hmMNames = {'\u002701':'Ene','\u002702':'Feb','\u002703':'Mar','\u002704':'Abr','\u002705':'May','\u002706':'Jun','\u002707':'Jul','\u002708':'Ago','\u002709':'Sep','10':'Oct','11':'Nov','12':'Dic'};
    ctx += 'Alojamiento|' + hmMList.map(function(m){ return hmMNames[m]||m; }).join('|') + '|Total\n';
    // Find global max for sparkline
    var hmMax = 0;
    Object.values(byAlojMes).forEach(function(v){ if(v.noch > hmMax) hmMax = v.noch; });
    var spark = ['\u2581','\u2582','\u2583','\u2584','\u2585','\u2586','\u2587','\u2588'];
    Array.from(hmAlojs).sort().slice(0,30).forEach(function(a) {
      var row = a.substring(0,20), rowTotal = 0;
      hmMList.forEach(function(m) {
        var d = byAlojMes[a + '|' + m];
        var noch = d ? d.noch : 0;
        rowTotal += noch;
        var si = hmMax > 0 ? Math.min(7, Math.floor(noch / hmMax * 7)) : 0;
        row += '|' + (noch > 0 ? spark[si] + noch : '\u00B7');
      });
      row += '|' + rowTotal;
      ctx += row + '\n';
    });
  }

  // PHASE 5: LEAD TIME (antelaci\u00F3n de reserva)
  if (needLeadtime && leadTimes.length > 0) {
    ctx += '\n=== LEAD TIME (antelaci\u00F3n de reserva en d\u00EDas) ===\n';
    var ltTotal = 0, ltCount = leadTimes.length;
    leadTimes.forEach(function(l){ ltTotal += l.days; });
    var ltAvg = ltTotal / ltCount;
    var ltSorted = leadTimes.map(function(l){ return l.days; }).sort(function(a,b){ return a-b; });
    var ltMedian = ltSorted[Math.floor(ltCount / 2)];
    ctx += 'Media: ' + ltAvg.toFixed(0) + ' d\u00EDas | Mediana: ' + ltMedian + ' d\u00EDas | Rango: ' + ltSorted[0] + '-' + ltSorted[ltCount-1] + ' d\u00EDas\n';
    // Lead time by platform
    var ltByPlat = {};
    leadTimes.forEach(function(l) {
      if (!ltByPlat[l.plat]) ltByPlat[l.plat] = {sum:0, n:0, vals:[]};
      ltByPlat[l.plat].sum += l.days; ltByPlat[l.plat].n++; ltByPlat[l.plat].vals.push(l.days);
    });
    ctx += '\nPor plataforma:\nPlataforma|Media.D\u00EDas|Mediana|Reservas\n';
    Object.keys(ltByPlat).sort().forEach(function(p) {
      var d = ltByPlat[p];
      d.vals.sort(function(a,b){return a-b;});
      ctx += p + '|' + (d.sum/d.n).toFixed(0) + '|' + d.vals[Math.floor(d.n/2)] + '|' + d.n + '\n';
    });
    // Lead time buckets
    var ltBuckets = {'0-1d':0, '2-7d':0, '8-30d':0, '31-90d':0, '>90d':0};
    leadTimes.forEach(function(l) {
      if (l.days <= 1) ltBuckets['0-1d']++;
      else if (l.days <= 7) ltBuckets['2-7d']++;
      else if (l.days <= 30) ltBuckets['8-30d']++;
      else if (l.days <= 90) ltBuckets['31-90d']++;
      else ltBuckets['>90d']++;
    });
    ctx += '\nDistribuci\u00F3n:\n';
    Object.keys(ltBuckets).forEach(function(b) {
      var pct = (ltBuckets[b] / ltCount * 100).toFixed(1);
      ctx += b + ': ' + ltBuckets[b] + ' (' + pct + '%)\n';
    });
  }

  // PHASE 5: DUPLICADOS / ANOMAL\u00CDAS
  if (needDup && dupCandidates.length > 0) {
    ctx += '\n=== POSIBLES DUPLICADOS / ANOMAL\u00CDAS ===\n';
    // Find exact duplicates (same client+aloj+dates)
    var dupMap = {};
    var dups = [];
    dupCandidates.forEach(function(d) {
      var key = d.cliente + '|' + d.aloj + '|' + d.entrada + '|' + d.salida;
      if (key.length < 10) return; // skip empty
      if (!dupMap[key]) { dupMap[key] = [d]; } else { dupMap[key].push(d); }
    });
    Object.keys(dupMap).forEach(function(k) {
      if (dupMap[k].length > 1) dups.push({key:k, count:dupMap[k].length, items:dupMap[k]});
    });
    if (dups.length > 0) {
      ctx += 'Posibles duplicados exactos: ' + dups.length + ' grupos\n';
      ctx += 'Cliente|Aloj|Entrada|Salida|Veces\n';
      dups.slice(0,20).forEach(function(d) {
        var p = d.key.split('|');
        ctx += p[0].substring(0,20) + '|' + p[1].substring(0,18) + '|' + p[2] + '|' + p[3] + '|' + d.count + '\n';
      });
    } else {
      ctx += 'No se encontraron duplicados exactos.\n';
    }
    // Suspicious imports (very high or very low vs property avg)
    var suspHigh = [], suspLow = [];
    if (Object.keys(byAloj).length > 0) {
      allReservas.forEach(function(r2) {
        var a2 = r2.alojamiento || 'Sin'; var da2 = byAloj[a2];
        if (!da2 || da2.noch < 5 || !r2._nights || r2._nights < 1) return;
        var avgADR = da2.imp / da2.noch;
        var c2 = getLiq(r2);
        var thisADR = c2.total / r2._nights;
        if (thisADR > avgADR * 3 && c2.total > 200) suspHigh.push({id:r2.id, aloj:a2, adr:thisADR, avg:avgADR, imp:c2.total});
        if (thisADR < avgADR * 0.25 && c2.total > 10) suspLow.push({id:r2.id, aloj:a2, adr:thisADR, avg:avgADR, imp:c2.total});
      });
    }
    if (suspHigh.length > 0) {
      ctx += '\nReservas con importe anormalmente ALTO (>3x ADR medio del piso):\n';
      ctx += 'ID|Aloj|ADR.Reserva|ADR.Medio|Importe\n';
      suspHigh.slice(0,10).forEach(function(s) {
        ctx += s.id + '|' + s.aloj.substring(0,18) + '|' + f(s.adr) + '|' + f(s.avg) + '|' + f(s.imp) + '\n';
      });
    }
    if (suspLow.length > 0) {
      ctx += '\nReservas con importe anormalmente BAJO (<0.25x ADR medio):\n';
      ctx += 'ID|Aloj|ADR.Reserva|ADR.Medio|Importe\n';
      suspLow.slice(0,10).forEach(function(s) {
        ctx += s.id + '|' + s.aloj.substring(0,18) + '|' + f(s.adr) + '|' + f(s.avg) + '|' + f(s.imp) + '\n';
      });
    }
    if (dups.length === 0 && suspHigh.length === 0 && suspLow.length === 0) {
      ctx += 'No se detectaron anomal\u00EDas significativas.\n';
    }
  }

  // PHASE 5: WHAT-IF SIMULATOR DATA
  if (needWhatif) {
    ctx += '\n=== DATOS PARA SIMULACI\u00D3N WHAT-IF ===\n';
    ctx += 'Estructura actual de costes:\n';
    var totCom = G.cPlat + G.cGTC + G.cPas;
    ctx += 'Comisi\u00F3n total: ' + f(totCom) + ' (' + (G.imp > 0 ? (totCom/G.imp*100).toFixed(1) : '0') + '% del importe)\n';
    ctx += '  Canal: ' + f(G.cPlat) + ' (' + (G.imp>0?(G.cPlat/G.imp*100).toFixed(1):'0') + '%), GTC: ' + f(G.cGTC) + ', Pasarela: ' + f(G.cPas) + '\n';
    ctx += 'Limpieza: ' + f(G.limp) + ', Amenities: ' + f(G.amen) + '\n';
    ctx += 'IRPF retenido: ' + f(G.irpf) + '\n';
    ctx += 'Liquidaci\u00F3n actual: ' + f(G.liq) + ' (' + (G.imp>0?(G.liq/G.imp*100).toFixed(1):'0') + '% del importe)\n\n';
    // By platform for what-if simulations
    ctx += 'Comisiones por plataforma (para simular cambios):\n';
    ctx += 'Plataforma|Reservas|Importe|Com.Canal|Com.Pasarela|%Comisi\u00F3n\n';
    Object.keys(byPlat).sort().forEach(function(p) {
      var dp = byPlat[p];
      var pctCom = dp.imp > 0 ? ((dp.cPlat+dp.cPas)/dp.imp*100).toFixed(1) : '0';
      ctx += p + '|' + dp.n + '|' + f(dp.imp) + '|' + f(dp.cPlat) + '|' + f(dp.cPas) + '|' + pctCom + '%\n';
    });
    ctx += '\nADR global: ' + (G.noch>0 ? f(G.imp/G.noch) : '-') + '\n';
    ctx += 'INSTRUCCIONES WHAT-IF: Cuando el usuario pida simular un escenario, calcula el impacto usando estos datos base. Muestra antes/despu\u00E9s con diferencia.\n';
  }

  // PHASE 5: BRIEFING R\u00C1PIDO
  if (needBriefing) {
    // Build sparklines for monthly trend
    var mSorted = Object.keys(byMes).sort();
    if (mSorted.length > 0) {
      var spark = ['\u2581','\u2582','\u2583','\u2584','\u2585','\u2586','\u2587','\u2588'];
      var maxImp = 0;
      mSorted.forEach(function(m){ if (byMes[m].imp > maxImp) maxImp = byMes[m].imp; });
      var sparkLine = '';
      mSorted.forEach(function(m) {
        var si = maxImp > 0 ? Math.min(7, Math.floor(byMes[m].imp / maxImp * 7)) : 0;
        sparkLine += spark[si];
      });
      ctx += '\n=== BRIEFING EJECUTIVO ===\n';
      ctx += 'Tendencia ingresos: ' + sparkLine + ' (' + mSorted[0] + ' a ' + mSorted[mSorted.length-1] + ')\n';
      // Best and worst month
      var bestM = mSorted[0], worstM = mSorted[0];
      mSorted.forEach(function(m) {
        if (byMes[m].imp > byMes[bestM].imp) bestM = m;
        if (byMes[m].imp < byMes[worstM].imp) worstM = m;
      });
      ctx += 'Mejor mes: ' + bestM + ' (' + f(byMes[bestM].imp) + '), Peor: ' + worstM + ' (' + f(byMes[worstM].imp) + ')\n';
      ctx += 'INSTRUCCIONES: Resume en m\u00E1ximo 5 frases los datos m\u00E1s importantes. S\u00E9 directo, como un briefing matutino.\n';
    }
  }

  // DETALLE (solo si se piden datos espec\u00EDficos o hay pocas filtradas)
  if (needDetail || needVal) {
    var filtered = (typeof getFilteredSorted === 'function') ? getFilteredSorted() : allReservas;
    var maxDetail = Math.min(CONFIG.MAX_AI_DETAIL_ROWS, filtered.length);
    if (maxDetail > 0) {
      ctx += '\n=== DETALLE (' + maxDetail + ' de ' + filtered.length + ' filtradas, ' + total + ' totales) ===\n';
      ctx += 'ID|Cliente|Aloj|Plat|Entrada|Salida|Noch|ImpIVA|ComCanal|ComGTC|Limp|Liq|Estado\n';
      for (var i = 0; i < maxDetail; i++) {
        var r = filtered[i], c = getLiq(r);
        ctx += [r.id||'-',(r.cliente||'-').substring(0,20),(r.alojamiento||'-').substring(0,18),
          (r.plataforma||'-').substring(0,12),r._fmtEntrada||'-',r._fmtSalida||'-',r._nights||0,
          f(c.total),f(c.comPlat),f(c.comGTC),f(c.limp),f(c.totalLiq),validated.has(r.idx)?'V':'P'
        ].join('|') + '\n';
      }
      if (filtered.length > maxDetail) ctx += '...(' + (filtered.length - maxDetail) + ' m\u00E1s, totales en res\u00FAmenes)\n';
    }
  }

  // Info de contexto selectivo (para debug)
  ctx += '\n[Secciones incluidas: ' + Array.from(cats).join(', ') + ']\n';

  // Phase 4: Save to cache
  _aiContextCache = { key: cacheKey, ctx: ctx, ts: Date.now() };
  return ctx;
}

/**
 * @description Compacta el historial de chat para mantener tokens bajos.
 * Cuando hay m\u00E1s de 10 mensajes, resume los m\u00E1s antiguos en una l\u00EDnea.
 * Mantiene los \u00FAltimos 6 mensajes intactos para continuidad.
 */
function _compactHistory() {
  if (_aiHistory.length <= 10) return;

  var keepLast = 6; // mantener \u00FAltimos 3 turnos (6 mensajes)
  var old = _aiHistory.slice(0, -keepLast);
  var recent = _aiHistory.slice(-keepLast);

  // Extract user questions from old messages
  var topics = [];
  old.forEach(function(m) {
    if (m.role === 'user' && m.content.length < 200) {
      topics.push(m.content);
    }
  });

  var summary = 'Resumen de la conversaci\u00F3n previa: el usuario pregunt\u00F3 sobre: ' + topics.join('; ');
  if (summary.length > 400) summary = summary.substring(0, 400) + '...';

  _aiHistory = [
    { role: 'user', content: summary },
    { role: 'assistant', content: 'Entendido, tengo el contexto de la conversaci\u00F3n anterior.' }
  ].concat(recent);

  console.log('[AI] Compacted history: ' + old.length + ' msgs \u2192 summary + ' + recent.length + ' recent');
}

/**
 * @description Genera y descarga un archivo Excel CSV desde el chat.
 * Soporta varios tipos de export predefinidos.
 * @param {string} type - Tipo de export solicitado
 */
function _aiExportExcel(type) {
  if (!allReservas || allReservas.length === 0) return;
  var f = function(v) { return v.toFixed(2); };
  var rows = [];
  var filename = 'export';

  if (type === 'adr') {
    filename = 'ranking-adr';
    rows.push([t('csv.property'),t('csv.reservations'),t('csv.nights'),t('csv.adr'),t('csv.totalAmount'),t('csv.settlement'),t('csv.margin')]);
    var byA = {};
    allReservas.forEach(function(r) {
      var a = r.alojamiento||'Sin'; var c = getLiq(r); var n = r._nights||0;
      if (!byA[a]) byA[a] = {n:0, noch:0, imp:0, liq:0};
      byA[a].n++; byA[a].noch += n; byA[a].imp += c.total; byA[a].liq += c.totalLiq;
    });
    Object.keys(byA).filter(function(a){ return byA[a].noch > 0; })
      .sort(function(a,b){ return (byA[b].imp/byA[b].noch)-(byA[a].imp/byA[a].noch); })
      .forEach(function(a) {
        var d = byA[a]; var adr = d.imp/d.noch; var mg = d.imp>0 ? d.liq/d.imp*100 : 0;
        rows.push([a, d.n, d.noch, f(adr), f(d.imp), f(d.liq), mg.toFixed(1)+'%']);
      });
  } else if (type === 'owners') {
    filename = 'propietarios';
    rows.push([t('csv.owner'),t('csv.units'),t('csv.reservations'),t('csv.nights'),t('csv.amount'),t('csv.settlement'),'ADR',t('csv.margin')]);
    var byO = {};
    allReservas.forEach(function(r) {
      var ow = getPropietario(r.alojamiento); if (!ow || ow === t('consol.missingOwner')) return;
      if (!byO[ow]) byO[ow] = {pisos:{}, n:0, noch:0, imp:0, liq:0};
      byO[ow].pisos[r.alojamiento] = true; byO[ow].n++; byO[ow].noch += r._nights||0;
      var c = getLiq(r); byO[ow].imp += c.total; byO[ow].liq += c.totalLiq;
    });
    Object.keys(byO).sort().forEach(function(ow) {
      var d = byO[ow]; var adr = d.noch>0 ? d.imp/d.noch : 0; var mg = d.imp>0 ? d.liq/d.imp*100 : 0;
      rows.push([ow, Object.keys(d.pisos).sort().join('; '), d.n, d.noch, f(d.imp), f(d.liq), f(adr), mg.toFixed(1)+'%']);
    });
  } else if (type === 'monthly') {
    filename = 'mensual';
    rows.push([t('csv.month'),t('csv.reservations'),t('csv.nights'),t('csv.amount'),t('csv.settlement'),'ADR']);
    var byM = {};
    allReservas.forEach(function(r) {
      var fE = r._dEntrada; if (!fE) return;
      var m = (fE.getMonth()+1).toString().padStart(2,'0') + '/' + fE.getFullYear();
      if (!byM[m]) byM[m] = {n:0, noch:0, imp:0, liq:0};
      byM[m].n++; byM[m].noch += r._nights||0; var c = getLiq(r); byM[m].imp += c.total; byM[m].liq += c.totalLiq;
    });
    Object.keys(byM).sort().forEach(function(m) {
      var d = byM[m]; var adr = d.noch>0 ? d.imp/d.noch : 0;
      rows.push([m, d.n, d.noch, f(d.imp), f(d.liq), f(adr)]);
    });
  } else if (type === 'platforms') {
    filename = 'plataformas';
    rows.push([t('csv.platform'),t('csv.reservations'),t('csv.amount'),t('csv.channelCom'),t('csv.gatewayCom'),t('csv.settlement'),t('csv.effectivePct')]);
    var byP = {};
    allReservas.forEach(function(r) {
      var p = r.plataforma||'Desconocida'; var c = getLiq(r);
      if (!byP[p]) byP[p] = {n:0, imp:0, cPlat:0, cPas:0, liq:0};
      byP[p].n++; byP[p].imp += c.total; byP[p].cPlat += c.comPlat; byP[p].cPas += c.comPas; byP[p].liq += c.totalLiq;
    });
    Object.keys(byP).sort().forEach(function(p) {
      var d = byP[p]; var ce = d.imp>0 ? (d.cPlat+d.cPas)/d.imp*100 : 0;
      rows.push([p, d.n, f(d.imp), f(d.cPlat), f(d.cPas), f(d.liq), ce.toFixed(1)+'%']);
    });
  } else if (type === 'all') {
    filename = 'reservas-completo';
    rows.push(['ID','Localizador','Cliente','Alojamiento','Plataforma','Entrada','Salida','Noches','Importe','ComCanal','ComGTC','Limpieza','Liquidaci\u00F3n','Estado']);
    allReservas.forEach(function(r) {
      var c = getLiq(r);
      rows.push([r.id||'', r.localizador||'', r.cliente||'', r.alojamiento||'', r.plataforma||'',
        r._fmtEntrada||'', r._fmtSalida||'', r._nights||0,
        f(c.total), f(c.comPlat), f(c.comGTC), f(c.limp), f(c.totalLiq),
        validated.has(r.idx)?t('csv.validated'):t('csv.pending')]);
    });
  } else {
    return; // unknown type
  }

  // Generate CSV with BOM for Excel UTF-8 compatibility
  var csv = '\uFEFF' + rows.map(function(row) {
    return row.map(function(cell) {
      var s = String(cell);
      if (s.indexOf(',') >= 0 || s.indexOf('"') >= 0 || s.indexOf(';') >= 0 || s.indexOf('\n') >= 0) {
        return '"' + s.replace(/"/g, '""') + '"';
      }
      return s;
    }).join(';'); // semicolon for Spanish Excel
  }).join('\r\n');

  var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url; a.download = filename + '-' + new Date().toISOString().slice(0,10) + '.csv';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
  console.log('[AI] Export CSV:', filename, rows.length, 'rows');
}

function _addAIMsg(role, text) {
  let box = document.getElementById('ai-messages');
  let div = document.createElement('div');
  div.className = 'ai-msg ' + role;
  if (role === 'assistant') {
    let html = text
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
    div.innerHTML = html;
  } else {
    div.textContent = text;
  }
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
  return div;
}

function _showTyping() {
  let box = document.getElementById('ai-messages');
  let div = document.createElement('div');
  div.className = 'ai-msg assistant'; div.id = 'ai-typing';
  div.innerHTML = '<div class="ai-typing"><span></span><span></span><span></span></div>';
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}
function _removeTyping() { const el = document.getElementById('ai-typing'); if(el) el.remove(); }

/**
 * @description Extrae entidades (pisos, propietarios, plataformas) del texto.
 * Phase 5: Entity memory for multi-turn conversations.
 */
function _extractEntities(text) {
  var entities = {pisos:[], propietarios:[], plataformas:[]};
  if (!allReservas || allReservas.length === 0) return entities;
  var tLow = text.toLowerCase();
  // Match known pisos
  var knownPisos = new Set();
  allReservas.forEach(function(r){ if(r.alojamiento) knownPisos.add(r.alojamiento); });
  knownPisos.forEach(function(p) {
    if (tLow.indexOf(p.toLowerCase()) >= 0) entities.pisos.push(p);
  });
  // Match known propietarios
  if (_propietariosMap) {
    var owners = new Set();
    Object.values(_propietariosMap).forEach(function(v){ if(v) owners.add(v); });
    owners.forEach(function(o) {
      if (tLow.indexOf(o.toLowerCase()) >= 0) entities.propietarios.push(o);
    });
  }
  // Match platforms
  ['Booking.com','Airbnb','VRBO','Stripe','Web directa'].forEach(function(p) {
    if (tLow.indexOf(p.toLowerCase()) >= 0) entities.plataformas.push(p);
  });
  return entities;
}

/**
 * @description Genera sugerencias de follow-up basadas en categor\u00EDas.
 * Phase 5: Contextual follow-up suggestions.
 */
function _getFollowUpSuggestions(cats) {
  var suggestions = [];
  if (cats.has('KPI') || cats.has('SUMMARY')) {
    suggestions.push({q:t('fu.worstAdrQ'), label:t('fu.worstAdr')});
    suggestions.push({q:t('fu.exportQ'), label:t('fu.export')});
    suggestions.push({q:t('fu.ownersQ'), label:t('fu.owners')});
  }
  if (cats.has('FINANCIAL')) {
    suggestions.push({q:t('fu.simMinusQ'), label:t('fu.simMinus')});
    suggestions.push({q:t('fu.rankMarginQ'), label:t('fu.rankMargin')});
  }
  if (cats.has('PLATFORM')) {
    suggestions.push({q:t('fu.leadtimeQ'), label:t('fu.leadtime')});
    suggestions.push({q:t('fu.segmentsQ'), label:t('fu.segments')});
  }
  if (cats.has('PROPERTY') || cats.has('CMP_OWNER')) {
    suggestions.push({q:t('fu.heatmapQ'), label:t('fu.heatmap')});
    suggestions.push({q:t('fu.duplicatesQ'), label:t('fu.duplicates')});
  }
  if (cats.has('PREDICT')) {
    suggestions.push({q:t('fu.seasonQ'), label:t('fu.season')});
    suggestions.push({q:t('fu.simPlusQ'), label:t('fu.simPlus')});
  }
  if (cats.has('YOY')) {
    suggestions.push({q:t('fu.predictQ'), label:t('fu.predict')});
    suggestions.push({q:t('fu.topGrowthQ'), label:t('fu.topGrowth')});
  }
  if (cats.has('SEASON')) {
    suggestions.push({q:t('fu.segHighQ'), label:t('fu.segHigh')});
  }
  if (cats.has('SEGMENT')) {
    suggestions.push({q:t('fu.ltByStayQ'), label:t('fu.ltByStay')});
  }
  if (cats.has('LEADTIME')) {
    suggestions.push({q:t('fu.byPropQ'), label:t('fu.byProp')});
  }
  if (cats.has('DUPCHECK')) {
    suggestions.push({q:t('fu.kpisQ'), label:t('fu.kpis')});
  }
  if (cats.has('WHATIF')) {
    suggestions.push({q:t('fu.realCommQ'), label:t('fu.realComm')});
  }
  if (cats.has('HEATMAP')) {
    suggestions.push({q:t('fu.predictQ'), label:t('fu.predict')});
  }
  if (cats.has('BRIEFING')) {
    suggestions.push({q:t('fu.kpiDetailQ'), label:t('fu.kpiDetail')});
    suggestions.push({q:t('fu.anomaliesQ'), label:t('fu.anomalies')});
  }
  // Deduplicate and limit to 3
  var seen = new Set();
  return suggestions.filter(function(s) {
    if (seen.has(s.label)) return false;
    seen.add(s.label); return true;
  }).slice(0, 3);
}

async function sendAIMessage() {
  if (_aiProcessing) return;
  let input = document.getElementById('ai-input');
  let text = input.value.trim();
  if (!text) return;

  if (!allReservas || allReservas.length === 0) {
    _addAIMsg('error', t('ai.loadFirst'));
    return;
  }

  let apiKey = _getAIKey();
  if (!apiKey) return;

  _addAIMsg('user', text);
  input.value = ''; input.style.height = 'auto';
  _aiHistory.push({role:'user', content:text});

  // Phase 5: Extract and track entities
  var newEntities = _extractEntities(text);
  if (newEntities.pisos.length > 0) _aiEntityMemory.pisos = newEntities.pisos;
  if (newEntities.propietarios.length > 0) _aiEntityMemory.propietarios = newEntities.propietarios;
  if (newEntities.plataformas.length > 0) _aiEntityMemory.plataformas = newEntities.plataformas;

  // Phase 2: Compact history before sending
  _compactHistory();

  _aiProcessing = true;
  document.getElementById('ai-send').disabled = true;
  _showTyping();

  try {
    // Phase 2: Classify query and build selective context
    let cats = _classifyQuery(text);
    let context = buildAIContext(cats);
    console.log('[AI] Query categories:', Array.from(cats).join(', '), '| Context length:', context.length);

    // Phase 5: Entity memory context
    var entityCtx = '';
    if (_aiEntityMemory.pisos.length > 0 || _aiEntityMemory.propietarios.length > 0 || _aiEntityMemory.plataformas.length > 0) {
      entityCtx = '\nCONTEXTO DE CONVERSACI\u00D3N (entidades mencionadas previamente):\n';
      if (_aiEntityMemory.pisos.length > 0) entityCtx += 'Pisos referenciados: ' + _aiEntityMemory.pisos.join(', ') + '\n';
      if (_aiEntityMemory.propietarios.length > 0) entityCtx += 'Propietarios referenciados: ' + _aiEntityMemory.propietarios.join(', ') + '\n';
      if (_aiEntityMemory.plataformas.length > 0) entityCtx += 'Plataformas referenciadas: ' + _aiEntityMemory.plataformas.join(', ') + '\n';
      entityCtx += 'Si el usuario hace preguntas ambiguas (ej: "y sus comisiones?"), ref\u00E9rete a estas entidades.\n';
    }

    let sysPrompt = 'Eres el "Asistente Hist\u00F3rico Reservas" de Liquidaciones GTC (Green Tropical Coast / Homity Holidays).\n\n' +
      'REGLAS:\n' +
      '1. SOLO responde con los datos proporcionados. NUNCA inventes cifras.\n' +
      '2. Sin informaci\u00F3n: "No tengo esa informaci\u00F3n en los datos cargados."\n' +
      '3. NUNCA des consejos financieros, legales ni fiscales.\n' +
      '4. Responde en ' + ({es:'espa\u00F1ol',en:'English',de:'Deutsch'}[_currentLang]||'espa\u00F1ol') + '. Conciso pero completo.\n' +
      '5. Cifras con 2 decimales y \u20AC. Indica siempre si son con/sin IVA.\n' +
      '6. Res\u00FAmenes = TODAS las reservas. Detalle = filtradas (max 50).\n' +
      '7. Si falta info, sugiere filtrar la tabla o reformular.\n' +
      '8. Los datos se seleccionan seg\u00FAn tu pregunta. Si necesitas una secci\u00F3n que no ves, p\u00EDdela.\n\n' +
      'CAPACIDADES:\n' +
      '- KPIs: ADR, estancia media, comisi\u00F3n efectiva %, margen propietario %, rankings top/bottom\n' +
      '- Comparativa interanual (YoY) con \u0394% y top movers\n' +
      '- Estacionalidad cruzada: plataforma \u00D7 trimestre con pico/valle\n' +
      '- Comparaci\u00F3n entre propietarios: m\u00E9tricas por piso de cada uno\n' +
      '- Predicci\u00F3n: media hist\u00F3rica mensual con tendencia interanual\n' +
      '- Export: CSV/Excel con botones de descarga autom\u00E1ticos\n' +
      '- Duplicados: detecta reservas duplicadas y anomal\u00EDas de importe\n' +
      '- Segmentaci\u00F3n: escapada (\u22642 noches), vacaciones (3-7), larga estancia (>7)\n' +
      '- Heatmap: mapa de calor piso\u00D7mes con sparklines de ocupaci\u00F3n\n' +
      '- Lead time: antelaci\u00F3n de reserva por plataforma y distribuci\u00F3n\n' +
      '- What-if: simula escenarios (cambiar ADR, comisiones, mover plataforma)\n' +
      '- Briefing: resumen r\u00E1pido ejecutivo en 3-5 frases directas\n' +
      '- Usa sparklines Unicode (\u2581\u2582\u2583\u2584\u2585\u2586\u2587\u2588) para mostrar tendencias en l\u00EDnea cuando sea \u00FAtil\n\n' +
      entityCtx +
      'DATOS:\n' + context;

    let messages = _aiHistory.slice(-CONFIG.MAX_AI_HISTORY);

    // Retry logic for rate limits (429)
    let maxRetries = 2;
    let resp = null;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: CONFIG.AI_MODEL,
          max_tokens: CONFIG.AI_MAX_TOKENS,
          system: sysPrompt,
          messages: messages
        })
      });

      if (resp.status === 429 && attempt < maxRetries) {
        let waitSec = (attempt + 1) * 30;
        let retryAfter = resp.headers.get('retry-after');
        if (retryAfter) waitSec = Math.min(parseInt(retryAfter) || waitSec, 90);
        _removeTyping();
        _addAIMsg('info', t('ai.rateLimit').replace('%s', waitSec));
        await new Promise(function(resolve) { setTimeout(resolve, waitSec * 1000); });
        const infoMsgs = document.querySelectorAll('.ai-msg.info');
        infoMsgs.forEach(function(el) { el.remove(); });
        _showTyping();
        continue;
      }
      break;
    }

    _removeTyping();

    if (!resp.ok) {
      let errData = await resp.json().catch(function(){ return {}; });
      if (resp.status === 401) {
        SafeStorage.remove('ai-api-key');
        _addAIMsg('error', t('ai.invalidKey'));
      } else {
        _addAIMsg('error', t('ai.errorPrefix') + (errData.error && errData.error.message ? errData.error.message : resp.statusText));
      }
      _aiHistory.pop();
    } else {
      let data = await resp.json();
      let reply = data.content.map(function(b){ return b.text||''; }).join('');
      _aiHistory.push({role:'assistant', content:reply});
      let msgDiv = _addAIMsg('assistant', reply);

      // Phase 4: Auto-add export buttons for EXPORT queries
      if (cats.has('EXPORT') && msgDiv) {
        var exportBar = document.createElement('div');
        exportBar.style.cssText = 'margin-top:8px;display:flex;flex-wrap:wrap;gap:4px;';
        var exports = [
          {type:'adr', label:'\uD83D\uDCC9 Ranking ADR'},
          {type:'owners', label:'\uD83D\uDC64 Propietarios'},
          {type:'monthly', label:'\uD83D\uDCC5 Mensual'},
          {type:'platforms', label:'\uD83C\uDFE2 Plataformas'},
          {type:'all', label:'\uD83D\uDCCB Todo (detalle)'},
        ];
        exports.forEach(function(ex) {
          var btn = document.createElement('a');
          btn.className = 'ai-export-link';
          btn.textContent = ex.label;
          btn.onclick = function(e) { e.preventDefault(); _aiExportExcel(ex.type); };
          exportBar.appendChild(btn);
        });
        msgDiv.appendChild(exportBar);
      }

      // Phase 5: Follow-up suggestions
      if (msgDiv) {
        var followUps = _getFollowUpSuggestions(cats);
        if (followUps.length > 0) {
          var fuDiv = document.createElement('div');
          fuDiv.className = 'ai-followups';
          followUps.forEach(function(fu) {
            var btn = document.createElement('button');
            btn.className = 'ai-followup-btn';
            btn.textContent = fu.label;
            btn.onclick = function() {
              document.getElementById('ai-input').value = fu.q;
              sendAIMessage();
            };
            fuDiv.appendChild(btn);
          });
          document.getElementById('ai-messages').appendChild(fuDiv);
          document.getElementById('ai-messages').scrollTop = document.getElementById('ai-messages').scrollHeight;
        }
      }
    }
  } catch(e) {
    _removeTyping();
    _addAIMsg('error', 'Error de conexi\u00F3n: ' + e.message);
    _aiHistory.pop();
  }

  _aiProcessing = false;
  document.getElementById('ai-send').disabled = false;
  document.getElementById('ai-input').focus();
}

// Auto-resize AI textarea
(function(){
  let ta = document.getElementById('ai-input');
  if(ta) ta.addEventListener('input', function(){ this.style.height='auto'; this.style.height=Math.min(this.scrollHeight,100)+'px'; });
})();
// === END AI ASSISTANT ===
