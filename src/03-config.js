
// === CONFIG: Application Constants ===
const CONFIG = Object.freeze({
  IVA_RESERVA: 0.10,
  IVA_SUBTOTAL: 0.21,
  MAX_SHEET_ROWS: 10000,
  MAX_CONFIG_ROWS: 10000,
  MAX_AI_DETAIL_ROWS: 50,
  MAX_AI_HISTORY: 20,
  DEFAULT_PAGE_SIZE: 100,
  PAGE_SIZES: [100, 500, 1000],
  MAX_PAGINATION_BUTTONS: 7,
  DEBOUNCE_GLOBAL_CONFIG: 1500,
  DEBOUNCE_RESERVA_CONFIG: 1000,
  SYNC_SAVED_TIMEOUT: 2500,
  SYNC_ERROR_TIMEOUT: 5000,
  VERSION_TOAST_TIMEOUT: 12000,
  SHEET_HISTORY_MAX: 10,
  CONFIG_TAB_NAME: 'Configuracion',
  PROPIETARIOS_TAB_NAME: 'Propietarios',
  AI_MODEL: 'claude-sonnet-4-20250514',
  AI_MAX_TOKENS: 1024,
  SYNC_POLL_INTERVAL: 30000,  // 30s polling for multi-user sync
  SYNC_POLL_MIN: 10000,       // minimum 10s
  SYNC_POLL_MAX: 120000,      // maximum 2min
});


const CHANGELOG = [
  {
    version: '2.30.0',
    date: '2026-02-17',
    changes: [
      'Nuevo m\u00f3dulo 09-invoicing.js: sistema de facturaci\u00f3n',
      'Config: pesta\u00f1a Facturaci\u00f3n con toggle por alojamiento',
      'Config: empresas receptoras (GTC + GEE) editables y a\u00f1adibles',
      'Config: campo API key Holded con persistencia',
      'Cada alojamiento con factura asigna empresa receptora',
      'N\u00famero factura autom\u00e1tico YYYY-MM, fecha fin de mes',
    ]
  },
  {
    version: '2.29.3',
    date: '2026-02-17',
    changes: [
      'Bot\u00f3n Volver a liquidaci\u00f3n: sticky centrado en previsualizaci\u00f3n generada',
    ]
  },
  {
    version: '2.29.1',
    date: '2026-02-17',
    changes: [
      'Periodo: label LIQUIDACI\u00d3N dorado + valor blanco sin pill',
      'Refactor: 04-google.js split en 5 m\u00f3dulos',
      'Fix encoding: 153+ strings funcionales corregidas',
      'Build system: 17 m\u00f3dulos src/',
    ]
  },
  {
    version: '2.29.0',
    date: '2026-02-17',
    changes: [
      'Badge per\u00edodo: estilo pill redondeado (border-radius:20px) en todos los contextos',
      'Copy-to-clipboard: icono SVG clipboard, opacity-based (cero vibraci\u00f3n de columnas)',
      'Copy: sin sombreado de fondo, solo icono aparece/desaparece suavemente al hover',
      'Copy: feedback check verde 1.2s via CSS class toggle (sin innerHTML swap)',
      'Fix: icono warning \\u26a0 duplicado en bot\u00f3n validar (ahora solo desde i18n)',
    ]
  },
  {
    version: '2.28.1',
    date: '2026-02-17',
    changes: [
      'Badge per\u00edodo a\u00f1adido a vista detalle por reserva (viewDetail) junto al logo',
    ]
  },
  {
    version: '2.28.0',
    date: '2026-02-17',
    changes: [
      'Copy-to-clipboard: funci\u00f3n global copyVal() + helpers _cpv/_cpvRaw con feedback visual',
      'Prioridad ALTA (clic en valor): ID Reserva, Localizador, Total a Liquidar en tablas principal y consoldetail',
      'Prioridad ALTA: meta-strip detalle reserva (Alojamiento, ID, Localizador) copiables',
      'Prioridad ALTA: Total hero y total bar en consoldetail copiables',
      'Prioridad MEDIA: Facturaci\u00f3n total en consoldetail meta-strip copiable',
      'CSS: hover highlight azul sutil + flash verde en confirmaci\u00f3n + icono clipboard aparece on hover',
      'Volver a alojamientos sticky (position:sticky top:0) con degradado',
    ]
  },
  {
    version: '2.27.0',
    date: '2026-02-17',
    changes: [
      'Meses traducidos en email/PDF: _getCurrentLiqMonth() usa t() para respetar _withLang',
      'Subject, filename y body del email ahora muestran el mes en el idioma del documento',
      'Badge de per\u00edodo a\u00f1adido a print cards (por reserva + resumen) con estilo gold',
      'Per\u00edodo visible en meta strip de Liquidaci\u00f3n Alojamiento on-screen',
      'Eliminado bot\u00f3n Volver redundante al final de consoldetail (ya existe arriba)',
      'Nueva i18n key: liq.period (ES/EN/DE)',
    ]
  },
  {
    version: '2.26.2',
    date: '2026-02-17',
    changes: [
      'Email modal: protecci\u00f3n drag-out (mousedown dentro + mouseup fuera no cierra)',
      'Bot\u00f3n X a\u00f1adido en header del modal para cierre expl\u00edcito',
      'Cache-buster: email-module.js carga con ?v=APP_VERSION para evitar cach\u00e9',
    ]
  },
  {
    version: '2.26.1',
    date: '2026-02-17',
    changes: [
      'Hotfix: email modal crasheaba por TDZ (Temporal Dead Zone) de _emailLangDefault',
      'const _emailLangDefault movido antes de su uso en filename y subject',
    ]
  },
  {
    version: '2.26.0',
    date: '2026-02-16',
    changes: [
      'Idioma documento (ES/EN/DE) independiente del idioma del UI',
      'Picker de idioma doc visible en vista consolidada y por reserva',
      'Generar Liquidaci\u00f3n: usa _docLang para renderizar print cards en el idioma seleccionado',
      'Descargar PDF: genera en _docLang, nombre archivo seg\u00fan idioma (Liquidacion/Settlement/Abrechnung)',
      'Email modal: selector ES/EN/DE (default _docLang), email body trilingue con soporte alem\u00e1n',
      'Filename PDF del email tambi\u00e9n seg\u00fan idioma seleccionado',
      'Nuevas i18n keys: btn.backToLiq, pdf.generating, pdf.generatingWait',
      '_buildEmailBody: soporte completo ES/EN/DE con helper _t(es,en,de)',
    ]
  },
  {
    version: '2.25.0',
    date: '2026-02-16',
    changes: [
      'Refactor CE: sistema unificado para CE (IVA inc.) y CE2 (sin IVA)',
      'Eliminado 100% de duplicaci\\u00f3n: _CE_CFG config + funciones parametrizadas por tipo',
      'Render \\u00fanico: _ceRenderButton, _ceRenderPanelInner, _ceRenderSummaryCards',
      'CRUD unificado: _ceAdd, _ceRemove, _ceUpdate, _ceApplyChange',
      'Toggle, refresh summary/panel, keyboard, liveSync: todos unificados',
      'Estado consolidado: _openCE.ce / _openCE.ce2 (antes 4 vars separadas)',
      'Wrappers legacy mantienen compatibilidad (toggleCEPanel, addCEItem, etc.)',
      '-127 l\\u00edneas netas, misma funcionalidad',
    ]
  },
  {
    version: '2.24.2',
    date: '2026-02-16',
    changes: [
      'Hotfix: msg.noGtcAlojs y msg.noData ten\\u00edan t() dentro del propio I18N dict \\u2192 crash "Cannot access I18N before initialization"',
      'Restaurado texto ES literal en las 2 entradas afectadas',
    ]
  },
  {
    version: '2.24.1',
    date: '2026-02-16',
    changes: [
      'Fix: cambio de idioma en pantalla Liquidaci\\u00f3n Alojamiento no re-renderizaba (_lastConsolAloj \\u2192 currentConsolAloj)',
      'UX: feedback visual (fade) al cambiar idioma para confirmar el cambio',
    ]
  },
  {
    version: '2.24.0',
    date: '2026-02-16',
    changes: [
      'i18n audit final: 482 claves \u2014 34 patrones _en? reemplazados por t()',
      'Liquidaci\u00f3n detalle: todos los labels (canal, limpieza, IRPF, IVA, subtotal, etc.) ahora trilingues',
      'CE panels: t\u00edtulos, labels resumen, placeholders traducidos (CE1+CE2+extras)',
      'Email modal: 16 claves (t\u00edtulo, campos, botones, estados, radio langs)',
      'CSV export: 20+ cabeceras de columna traducidas',
      'Config modal: Pasarela Stripe, Mantenimiento labels traducidos',
      'Botones: Descargar PDF, Enviar Email, Validar primero \u2014 sin iconos duplicados',
      'Consol: Propietario label, Lista badge, Venta gesti\u00f3n y operaciones traducidos',
      'Mensajes error: cabecera no encontrada, sin alojamientos GTC, sin datos',
      'PDF errors: traducidos en email-module.js con (window.t||String)',
      'Alemn (DE): revisi\u00f3n completa \u2014 535\u21d2482 claves tras deduplicaci\u00f3n',
      'Limpieza: 55 claves duplicadas eliminadas, variable _en ya no se usa',
    ]
  },
  {
    version: '2.23.0',
    date: '2026-02-16',
    changes: [
      'i18n Phase 2: Panel Asistente IA completo en ES/EN/DE (390 claves total)',
      'Gu\u00EDa del Asistente IA generada din\u00e1micamente por idioma (26 secciones \u00d7 3 idiomas)',
      'Chips r\u00e1pidos, alertas autom\u00e1ticas y follow-up suggestions traducidos',
      'System prompt del IA adapta idioma de respuesta autom\u00e1ticamente',
      'API Key prompt, rate limit y error messages traducidos',
    ]},
  {
    version: '2.22.0',
    date: '2026-02-16',
    changes: [
      'i18n Phase 1: 314 claves (antes 241) \u2014 traducci\u00F3n completa de textos visibles',
      'Traducido: "filtradas", botones validar/desvalidar, combos ordenaci\u00F3n/filtro, cabeceras columnas',
      'Traducido: cards consol (Reservas/Facturaci\u00F3n/A Liquidar), mensajes toast, estados carga',
      'Traducido: etiquetas limpieza, pasarela, IRPF, propietario, alertas, conceptos especiales',
      'Fix: window.t y window.setLanguage expl\u00EDcitos para garantizar disponibilidad global',
    ]
  },
  {
    version: '2.21.0',
    date: '2026-02-15',
    changes: [
      'Sistema de internacionalizaci\u00F3n (i18n): soporte completo para espa\u00F1ol, ingl\u00E9s y alem\u00E1n',
      'Diccionario I18N con 241+ claves de traducci\u00F3n cubriendo toda la interfaz',
      'Selector de idioma en sidebar (ES/EN/DE) con persistencia en localStorage',
      'Funci\u00F3n t(key) para contenido din\u00E1mico JavaScript y atributos data-i18n para HTML est\u00E1tico',
      'setLanguage() actualiza DOM, arrays de meses, columnas, combos y re-renderiza pantalla activa',
      'Traducci\u00F3n completa: navegaci\u00F3n, filtros, estad\u00EDsticas, detalle liquidaci\u00F3n, consolidado, configuraci\u00F3n',
      'Meses traducidos (cortos y largos) para los 3 idiomas',
      'email-module.js: helper _et() para integraci\u00F3n i18n en m\u00F3dulo de email',
      '74 atributos data-i18n en HTML, 296 llamadas t() en JavaScript',
    ]
  },
  {
    version: '2.20.0',
    date: '2026-02-15',
    changes: [
      'Memoria multi-turno: recuerda pisos, propietarios y plataformas entre mensajes del chat',
      'Detecci\u00F3n de duplicados: encuentra reservas id\u00E9nticas y anomal\u00EDas de importe (>3x o <0.25x ADR)',
      'Segmentaci\u00F3n de clientes: escapada (\u22642 noches), vacaciones (3-7), larga estancia (>7) con desglose por plataforma',
      'Heatmap de ocupaci\u00F3n: mapa de calor alojamiento\u00D7mes con sparklines Unicode',
      'Lead time: an\u00E1lisis de antelaci\u00F3n de reserva por plataforma con distribuci\u00F3n en rangos',
      'Simulador what-if: datos base de costes y comisiones para simular escenarios',
      'Briefing r\u00E1pido: resumen ejecutivo en 3-5 frases con sparkline de tendencia',
      'Sugerencias contextuales: 2-3 botones de follow-up tras cada respuesta',
      'Sparklines Unicode (\u2581\u2582\u2583\u2584\u2585\u2586\u2587\u2588) en heatmap y briefing',
      'Alerta de duplicados en panel de anomal\u00EDas proactivas',
      'Clasificador ampliado: 24 categor\u00EDas (6 nuevas: DUPCHECK, SEGMENT, HEATMAP, LEADTIME, BRIEFING, WHATIF)',
      '9 chips actualizados con nuevas capacidades',
      'Gu\u00EDa ampliada: 8 nuevas secciones documentadas con 40+ ejemplos adicionales',
    ]
  },
  {
    version: '2.19.0',
    date: '2026-02-15',
    changes: [
      'Gu\u00EDa completa L\u00E9eme: documentaci\u00F3n exhaustiva del asistente IA integrada en el panel',
      'Bot\u00F3n de ayuda (\u2753) en cabecera del chat para abrir/cerrar la gu\u00EDa',
      '14 secciones documentadas con 60+ ejemplos de preguntas reales',
      'Trucos avanzados: combinaci\u00F3n de queries, uso de filtros, preguntas complejas',
      'Tablas de referencia de KPIs y tipos de exportaci\u00F3n',
      'Informaci\u00F3n t\u00E9cnica: modelo, cache, compactaci\u00F3n, API Key',
    ]
  },
  {
    version: '2.18.0',
    date: '2026-02-15',
    changes: [
      'Alertas proactivas: detecta autom\u00E1ticamente pisos con ADR bajo, sin reservas, con margen < 30% y pendientes altas',
      'Comparaci\u00F3n de propietarios: m\u00E9tricas por piso con ADR, margen, reservas y noches por propietario',
      'Predicci\u00F3n de ocupaci\u00F3n: proyecci\u00F3n mensual basada en medias hist\u00F3ricas con tendencia interanual',
      'Export a Excel: 5 tipos de descarga CSV (ranking ADR, propietarios, mensual, plataformas, todo)',
      'Cach\u00E9 de contexto: reutiliza contexto 30s si mismas categor\u00EDas y datos, evita rec\u00E1lculos',
      'Cach\u00E9/alertas se resetean autom\u00E1ticamente al recargar datos',
      'Clasificador ampliado: 18 categor\u00EDas (CMP_OWNER, PREDICT, EXPORT)',
      'Chips actualizados: Comparar propietarios, Predicci\u00F3n, Exportar Excel',
      'Botones de descarga inline tras queries de exportaci\u00F3n',
    ]
  },
  {
    version: '2.17.0',
    date: '2026-02-15',
    changes: [
      'Asistente IA Fase 3: KPIs avanzados (ADR, estancia media, comisi\u00F3n efectiva, margen propietario)',
      'Rankings autom\u00E1ticos: Top 5 y Bottom 5 pisos por liquidaci\u00F3n y por ADR',
      'Comparativa interanual completa con tabla \u0394% y top movers por alojamiento',
      'Estacionalidad cruzada: tabla plataforma x trimestre con pico/valle',
      'Nuevas categor\u00EDas clasificador: KPI, YOY, SEASON (15 categor\u00EDas totales)',
      'Chips actualizados: KPIs, Comparar a\u00F1os, Estacionalidad, Comisiones, Propietarios, Ranking ADR',
      'System prompt enriquecido con definiciones de KPIs para respuestas m\u00E1s precisas',
    ]
  },
  {
    version: '2.16.0',
    date: '2026-02-15',
    changes: [
      'Asistente IA Fase 2: clasificador inteligente de queries con 12 categor\u00EDas',
      'Contexto selectivo: solo env\u00EDa secciones relevantes seg\u00FAn la pregunta',
      'Reducci\u00F3n de tokens 50-80% en preguntas espec\u00EDficas vs contexto completo',
      'Historial compactado autom\u00E1ticamente tras 10+ mensajes',
      'System prompt simplificado con regla de contexto selectivo',
      'Log de categor\u00EDas detectadas en consola para debug',
    ]
  },
  {
    version: '2.15.1',
    date: '2026-02-15',
    changes: [
      'Asistente IA Fase 1: contexto enriquecido con desglose financiero completo',
      'Nuevas secciones IA: comisiones canal+GTC+pasarela, limpieza, amenities, IRPF por agrupaci\u00F3n',
      'Propietarios integrados: nombre, pisos, reservas, importe y liquidaci\u00F3n por propietario',
      'Acuerdos especiales: m\u00EDnimo garantizado 80/20 y propiedades GTC en contexto IA',
      'Mantenimiento mensual por alojamiento incluido en contexto',
      'Datos por agente y origen marketing disponibles para el asistente',
      'Comparativa anual autom\u00E1tica cuando hay datos de 2+ a\u00F1os',
      'Chips de preguntas r\u00E1pidas: 6 consultas frecuentes con un clic',
      'Detalle de reservas ampliado: incluye comisiones canal/GTC/limpieza por fila',
    ]
  },
  {
    version: '2.15.0',
    date: '2026-02-15',
    changes: [
      'Sync multi-usuario: polling cada 30s lee cambios de otros usuarios en tiempo real',
      'Validaciones migradas a pesta\u00F1a Configuracion (persisten aunque cambie la hoja de datos)',
      'Backward compat: si Configuracion no tiene validaciones, fallback a columna de la hoja',
      'Toast discreto muestra resumen de cambios remotos aplicados',
      'Bot\u00F3n sync on/off en sidebar con indicador visual',
      'Pausa autom\u00E1tica del polling durante saves pendientes locales',
      'Delta-merge inteligente: solo aplica cambios en reservas no editadas localmente',
      'Fix asistente IA: contexto reducido de ~25k a ~4k tokens (eliminadas secciones redundantes, detalle 50 filas compactas)',
      'Retry autom\u00E1tico con backoff en rate limits (429) del asistente IA',
    ]
  },
  {
    version: '2.14.0',
    date: '2026-02-15',
    changes: [
      'Acuerdo 80/20 GTC: pestana propia al nivel de Pasarela e Impuestos',
      'Diseno violeta original v2.3.1: caja con degradado purpura, borde d8b4fe, toggles compactos',
      'Tab activa con borde purpura distintivo (#7c3aed)',
      'Separado del tab de Servicios GTC / Limpieza / Amenities / Mant.',
    ]
  },
  {
    version: '2.13.0',
    date: '2026-02-15',
    changes: [
      'PDF en ingles: si se elige English, el PDF adjunto se genera completamente en EN',
      'Todas las etiquetas del PDF traducidas: cabeceras, conceptos, totales, resumen',
      'Impresion y descarga directa de PDF siguen en espanol',
    ]
  },
  {
    version: '2.12.1',
    date: '2026-02-14',
    changes: [
      'Migracion Booking: al cargar datos, fuerza comision maxima en todas las reservas no validadas',
      'Cambios se persisten automaticamente en la hoja de configuracion',
    ]
  },
  {
    version: '2.12.0',
    date: '2026-02-14',
    changes: [
      'Default comision plataforma y pasarela: siempre la opcion mas alta',
      'Columna ID Reserva visible por defecto en ambas vistas (reserva y alojamiento)',
      'Filtro de mes por defecto: mes anterior al actual',
      'Email: selector de idioma Espanol/English en el modal',
    ]
  },
  {
    version: '2.11.8',
    date: '2026-02-14',
    changes: [
      'Fix PDF: createPattern parcheado al cargar modulo (antes de html2canvas)',
      'Fix PDF: try/catch en createPattern como fallback adicional',
    ]
  },
  {
    version: '2.11.7',
    date: '2026-02-14',
    changes: [
      'Fix PDF: monkey-patch createPattern para evitar crash con canvas 0px en html2canvas',
      'PDF render: pseudo-elementos y gradientes eliminados en contexto render',
    ]
  },
  {
    version: '2.11.6',
    date: '2026-02-14',
    changes: [
      'Fix PDF: proteccion contra canvas con dimension 0 (error createPattern)',
      'PDF render: min-height forzado en barras doradas y logo para evitar colapso',
      'PDF render: delay aumentado a 400ms para navegadores lentos',
    ]
  },
  {
    version: '2.11.5',
    date: '2026-02-14',
    changes: [
      'Default comision plataforma: siempre la opcion mas alta (Booking 22% en vez de 15%)',
      'Columna ID Reserva visible por defecto en la tabla',
      'Sidebar: Preliquidacion > Por Reserva, Detalle > Liquidacion Reserva',
    ]
  },
  {
    version: '2.11.4',
    date: '2026-02-14',
    changes: [
      'Sidebar: Preliquidacion renombrado a Por Reserva',
      'Sidebar: Detalle Preliquidacion renombrado a Liquidacion Reserva',
      'Tarjeta detalle: tipo muestra Liquidacion Reserva cuando no validada',
    ]
  },
  {
    version: '2.11.3',
    date: '2026-02-14',
    changes: [
      'Total bar estilo D: "TOTAL A LIQUIDAR" dorado 10px + subtitulo blanco 20px',
      'Valor total ampliado a 32px',
      'Aplicado en detalle, consolidado, print cards individual y resumen',
    ]
  },
  {
    version: '2.11.2',
    date: '2026-02-14',
    changes: [
      'Total a liquidar: importe en blanco en vez de dorado (mejor contraste sobre teal)',
      'Firma email: David Fraidiaz | Green Tropical Coast, S.L. | granadabeachgolf.com',
      'Footer email: granadabeachgolf.com en vez de homityholidays.com',
    ]
  },
  {
    version: '2.11.1',
    date: '2026-02-14',
    changes: [
      'Email modal: boton enviar con gradiente teal Homity (#1D4B56)',
      'Estado enviando: fondo teal oscuro + texto dorado (mejor contraste)',
      'Estado enviado: teal + dorado en vez de verde sobre verde',
      'Status bar sending: fondo crema calido, status success: verde con texto teal',
      'Input focus: borde teal en vez de azul',
    ]
  },
  {
    version: '2.11.0',
    date: '2026-02-14',
    changes: [
      'Branding Homity completo: headers teal (#1D4B56), meta-strips teal oscuro (#163E47)',
      'Barras doradas (#E0AE00) superior e inferior en todas las tarjetas de liquidacion',
      'Logo homity holidays en headers de detalle, consolidado e impresion',
      'Total bar: fondo teal con borde dorado, importe en dorado',
      'Dividers con degradado dorado, filas bold con borde teal, subtotal-bar crema',
      'Variables CSS Homity actualizadas al manual de identidad oficial',
      'Print CSS: soporte para gold bars y logo en impresion',
    ]
  },
  {
    version: '2.10.2',
    date: '2026-02-14',
    changes: [
      'Fix: iconos toast (success/error/warning/info/close) corruptos por triple-encoding UTF-8',
      'Reemplazados caracteres mojibake por HTML entities ASCII-safe (&#10003; &#10007; etc.)',
    ]
  },
  {
    version: '2.10.1',
    date: '2026-02-14',
    changes: [
      'email-module.js v2.0.0: reescritura completa del modulo PDF + Gmail',
      'PDF robusto: CSS clonado de la pagina (no depende de herencia), _waitForFonts()',
      'Nuevo boton Descargar PDF: descarga standalone sin necesidad de Gmail',
      'CSS boton pdf-download-btn con gradiente violeta, oculto en print',
      'Precarga de librerias PDF en background al abrir modal de email',
      'Gmail mejorado: errores especificos para 403/429, cierre modal con fade',
      'Singleton promise para carga de librerias (evita duplicados)',
    ]
  },
  {
    version: '2.10.0',
    date: '2026-02-14',
    changes: [
      'Modulo Email: nuevo archivo satelite email-module.js (arquitectura modular)',
      'OAuth scope ampliado: gmail.send para envio de liquidaciones por correo',
      'Propietarios tab ampliada: columna C para email del propietario',
      'Nuevas funciones core: getPropietarioEmail(), savePropietarioEmail()',
      'Boton Enviar por Email en vista consolidada (junto a Generar Liquidacion)',
      'Generacion de PDF en cliente con html2canvas + jsPDF (carga dinamica)',
      'Envio via Gmail API con PDF adjunto (MIME multipart)',
      'Modal de email: confirmacion destinatario, asunto editable, mensaje personalizable',
      'CSS modal de email integrado en index.html (email-modal-*, email-btn, email-status)',
    ]
  },
  {
    version: '2.9.0',
    date: '2026-02-14',
    changes: [
      'Redise\u00F1o preliquidaci\u00F3n individual: header con meta-strip en franja oscura, textura grid, badge pill',
      'Nuevo liq-header-top + liq-meta-strip reemplaza estructura anterior header+liq-meta',
      'Selectores redise\u00F1ados: pills compactas (liq-sel) con fondo gris, menor padding',
      'Subtotal destacado: nueva barra liq-subtotal-bar con gradiente azul y borde (como consolidado)',
      'Label Deducciones renombrado a Venta, gestiÃ³n y operaciones (coherente con consolidado)',
      'Badge redise\u00F1ado: pill rounded con fondo semitransparente (badge-liq-green/amber)',
      'Padding reducido: 80px a 32px en liq-sec, liq-total, liq-header, liq-ce2',
      'Redise\u00F1o consolidado detalle: header con barra de progreso de validaci\u00F3n animada',
      'Nuevo layout 2 columnas (cd-summary-section): desglose izquierda + resumen rapido derecha',
      'Quick Stats: 3 tarjetas compactas (Reservas, Noches, Facturacion) en columna derecha',
      'Total Hero: tarjeta destacada con gradiente azul y importe 36px centrado',
      'Bot\u00F3n Generar Liquidaci\u00F3n integrado debajo del total hero (verde con shadow)',
      'Split box mejorado: barra visual proporcional (consol-split-bar-gtc/owner) con porcentajes',
      'Dots de color en split: 8px morado para GTC, verde para propietario',
      'Mini-tarjeta split en columna derecha (cd-split-mini) entre subtotal y otros conceptos',
      'Total bar full-width: cd-total-bar oscura con contexto (alojamiento + mes)',
      'Nomenclatura Reparto a Acuerdo en split boxes y panel de configuraci\u00F3n',
      'Nomenclatura Otros Conceptos: reemplaza Conceptos Extraordinarios del Mes',
      'Print: header estructura actualizada a liq-header-top + liq-meta-strip en buildPrintCards',
      'Print: resumen consolidado con propietario en meta-strip y total-label con contexto split',
      'Print CSS actualizado: soporte 2 columnas, progress bar, total hero, meta-strip',
      'Fix: boton Generar Liquidacion no funcionaba (consol-actions eliminado, null-safe en showPrintPreview/exitPreview/printConsolDirect)',
      'Fix print: header consolidado solapado - position:static + z-index:auto + overflow:visible en consol-header/progress/meta-strip',
      'Fix print: consol-meta-strip forzado a grid 4 columnas (evita colapso flex en impresion)',
      'Print CSS reescrito completo: secciones organizadas, todos los componentes nuevos cubiertos',
    ]
  },
  {
    version: '2.8.0',
    date: '2026-02-13',
    changes: [
      'Nuevo: toggle segmentado Validadas/No Validadas en barra de filtros del grid consolidado',
      'Por defecto: No Validadas primero (pendientes destacados, validados atenuados)',
      'Clic en boton activo = estado neutral (sin prioridad de validacion)',
      'Contadores dinamicos en cada boton del toggle',
      'Tarjetas del grupo no prioritario se atenuan (dimmed) pero siguen clicables',
      'Toggle es primario en orden, dropdown Ordenar por actua como secundario',
      'Eliminadas opciones Pendientes/Listas primero del dropdown (ahora en toggle)',
      'Swap colores validacion: validado=verde (positivo), pendiente=naranja (atencion)',
    ]
  },
  {
    version: '2.7.5',
    date: '2026-02-13',
    changes: [
      'Fix print: liq-row.bold con margin:-80px se recortaba al imprimir (ahora -20px en print)',
      'Fix print: liq-container overflow:hidden cortaba contenido (ahora overflow:visible en print)',
      'Fix print: consol-subtotal-reservas sin override de padding 80px en print',
      'Fix print: consol-summary-block max-width 680px limitaba ancho en print',
      'Fix: entrada CHANGELOG con &lt;script&gt; rompia renderizado del historial',
      'Swap colores validacion: validado=verde (positivo), pendiente=naranja (atencion)',
      'Afecta: botones individuales, Validar/Desvalidar todas, vista detalle y consoldetail',
    ]
  },
  {
    version: '2.7.4',
    date: '2026-02-13',
    changes: [
      'Architecture Guide: bloque de documentacion exhaustiva al inicio del &lt;script&gt; para Claude/AI',
      'Modelo de datos documentado: allReservas[], settings{}, validated Set, flujo de c\u00e1lculo',
 'ndice de 18 m\u00f3dulos [M01]-[M18] con marcadores buscables en el c\u00f3digo',
      'JSDoc en 49+ funciones cr\u00edticas: calcLiquidacion, processRows, renderTable, etc.',
 'Documentaci\u00f3n de flujo Google Sheets: OAuth → load → persist → write-back',
      'Documentaci\u00f3n de sistema de cach\u00e9: _liqCache, _cachedFiltered, delta-updates',
      'Documentaci\u00f3n de convenciones: prefijos _, esc() obligatorio, SemVer',
 'M\u00f3dulos marcados con separadores ═ para navegaci\u00f3n r\u00e1pida',
 'Sub-m\u00f3dulos marcados con ─ para secciones dentro de un m\u00f3dulo',
      'Zero cambios funcionales: solo documentaci\u00f3n y organizaci\u00f3n del c\u00f3digo',
    ]
  },
  {
    version: '2.7.3',
    date: '2026-02-13',
    changes: [
      'Fix raiz: texto pegado a bordes era por consol-summary sin max-width (se estiraba a 1920px)',
      'consol-summary-block: max-width 860px + margin 0 auto (centrado como liq-container 780px)',
      'Paddings normalizados a 48px en ambas vistas (liq y consol): header, secciones, rows, totales',
      'Eliminada escalada de paddings (36>40>48>56>64) - ahora todo coherente a 48px',
    ]
  },
  {
    version: '2.7.2',
    date: '2026-02-12',
    changes: [
      'Fix: boton CE en fila principal se desincronizaba del panel de resumen',
      '_refreshCESummary() ahora siempre sincroniza el boton .col-ce en row-{idx}',
      '_refreshCE2Summary() idem para boton .col-ceSinIva',
      'CEX removeConsolExtra: eliminacion DOM pura + _rebuildCexIndices (sin re-render)',
      'CEX inputs importe ahora en color rojo (#e53935)',
      'Fix changeConsolMaintAmount: span neg se actualiza al cambiar select',
    ]
  },
  {
    version: '2.7.1',
    date: '2026-02-12',
    changes: [
      'CEX: input label reducido a 50% del ancho (flex:0 0 50%)',
      'CEX: importe negativo en rojo alineado a la derecha como Mantenimiento',
      'CEX: _cexKey() Enter en label salta a importe, Enter en importe abre nueva fila',
      'CEX: Escape en fila vacia la elimina automaticamente',
      'CEX: live input actualiza span rojo inmediatamente + debounce 400ms para totales',
    ]
  },
  {
    version: '2.7.0',
    date: '2026-02-12',
    changes: [
      'Otros Conceptos: edicion inline estilo CE (label+importe+borrar+anadir)',
      'Filas editables con input label + input importe + boton eliminar (misma mecanica que CE/CE2)',
      'Live debounce 400ms en importes: totales finales se actualizan mientras escribes',
      'Nuevo _patchConsolFinalTotals(): parchea solo Subtotal/IRPF/IVA/TOTAL sin re-render',
      'addConsolExtra inserta fila DOM directamente (sin prompt ni re-render completo)',
      'removeConsolExtra con animacion ceRowOut + indices recalculados tras splice',
      'toggleConsolMaint y changeConsolMaintAmount ya no llaman viewConsolDetail',
    ]
  },
  {
    version: '2.6.5',
    date: '2026-02-12',
    changes: [
      'Consol lightweight patch: CE/CE2 ahora parchean celdas individuales sin reconstruir DOM',
      'Mismo path ligero que preliquidaciones \u2014 cero saltos, panel permanece abierto',
      'Nuevo _patchConsolLightweight(): parchea crow cells + footer + summary innerHTML',
      'Nuevo _patchConsolRowCells(): actualiza solo celdas num\u00E9ricas en crow-{idx}',
      'Nuevo _patchConsolFooterRow(): actualiza solo celdas del tfoot consolidado',
      'Nuevo _buildConsolSummaryInner(): genera HTML del resumen sin tocar tabla ni header',
      'Nuevo _getConsolCalcsAndSums(): helper reutilizable para recalcular sumas consolidadas',
      'IDs a\u00F1adidos: consol-tfoot-row, consol-summary-block para patch directo',
      'Sustituye _viewConsolNoJump/_viewConsolNoJumpKeepPanel en todo el c\u00F3digo CE/CE2'
    ]
  },
  {
    version: '2.6.4',
    date: '2026-02-12',
    changes: [
      'Live input: importes CE/CE2 se actualizan en tiempo real mientras el usuario teclea',
      'Delegaci\u00F3n de eventos: un solo listener document.input captura .ce-inp-amt y .ce2-inp-amt',
      'Debounce 400ms evita re-renders excesivos durante escritura r\u00E1pida',
      'Path ligero: actualiza cache + panel summary + footer stats sin reconstruir DOM completo',
      'Nuevo _viewConsolNoJump(): congela altura contenedor + guarda scroll + viewConsolDetail + restaura',
      'Elimina saltos visuales al re-renderizar resumen consolidado durante edici\u00F3n de importes',
      'Usado en: live input, _applyCEChange, _applyCE2Change, removeCEItem, removeCE2Item',
      'Nuevo _viewConsolNoJumpKeepPanel(): re-abre panel CE/CE2 tras re-render consolidado',
      'REEMPLAZADO: _patchConsolLightweight() hace patch quirurgico sin re-render DOM',
      'Borrar item CE/CE2 ya no cierra el panel - patch ligero como en preliq',
      'Limpieza: eliminado codigo muerto (_viewConsolNoJump, _patchConsolInPlace, duplicados)',
      'Fix: corregido innerHTML corrupto en addCEItem tras limpieza de oninput inline'
    ]
  },
  {
    version: '2.6.3',
    date: '2026-02-12',
    changes: [
      'Fix: removeCEItem y removeCE2Item no re-renderizaban resumen consolidado tras eliminar concepto',
      'Causa: rama con animaci\u00F3n (ceRowOut) parcheaba celdas individuales pero no llamaba viewConsolDetail',
      'A\u00F1adido: if (v==="c\" && currentConsolAloj) viewConsolDetail() en ambas funciones tras animationend',
      'Ahora al borrar un CE/CE2 en la tabla consolidada, el resumen inferior se actualiza inmediatamente'
    ]
  },
  {
    version: '2.6.2',
    date: '2026-02-12',
    changes: [
      'Resumen consolidado: caja C.E. sin IVA descontados ahora muestra desglose de cada concepto',
      'Cada item muestra nombre, importe y n\u00FAmero de reserva asociada',
      'Estilo sub-fila: color #9f7aea, font-size 11px, indentado 12px'
    ]
  },
  {
    version: '2.6.1',
    date: '2026-02-12',
    changes: [
      'Fix cr\u00EDtico parseNum(): cuando Google Sheets devuelve n\u00FAmero nativo JS (ej: 1698.91), se convert\u00EDa a string y se eliminaba el punto decimal como si fuera separador de miles',
      'Resultado: 1698.91 \u2192 169891 (x100), 416.24 \u2192 41624, etc.',
      'Soluci\u00F3n: if (typeof v === "number") return v \u2014 devolver directamente sin parsear strings',
      'Afectaba a totalReserva y cualquier campo num\u00E9rico con decimales desde la API'
    ]
  },
  {
    version: '2.6.0',
    date: '2026-02-12',
    changes: [
      'Detalle liquidaci\u00F3n: reemplazada paleta Homity (gold/slate/serif) por paleta app (azul/sidebar/Inter)',
      'Header: gradiente sidebar (#0f1628 \u2192 #1a2744) + l\u00EDnea azul gradient inferior',
      'Labels meta: color var(--c-primary) #4f8cff, tipograf\u00EDa Inter 800 en nombre propietario',
      'Secciones: padding 36px, bordes var(--c-border-light), filas bold con fondo #f8f9fb',
      'CE2: fondo var(--c-primary-bg) #f0f5ff, borde superior azul, dots azules',
      'Total: gradiente sidebar + importe #4f8cff italic, l\u00EDnea azul gradient',
      'Controles: select.sel con border #dde1e8, focus #4f8cff (igual que tabla)',
      'Toggle pasarela: #4f8cff on, #d1d5db off, tama\u00F1o 38x22px (igual que tabla)',
      'Botones: Validar btn-success #43a047, Desvalidar btn-orange, Imprimir btn-outline',
      'Badges: badge-liq-green rgba(46,125,50,0.2), badge-liq-amber rgba(245,158,11,0.2)',
      'Eliminado liq-gold-line, eliminadas referencias Homity en botones detalle'
    ]
  },
  {
    version: '2.5.1',
    date: '2026-02-12',
    changes: [
      'Fix toggle pasarela: <label> con checkbox oculto causaba doble-click (toggle+toggle = sin efecto)',
      'Reemplazado <label>+<input checkbox> por <div> con clase .on en liq-sw-track',
      'CSS: eliminado selector :checked, usa .liq-sw-track.on para estado activo',
      'Eliminado setTimeout innecesario, viewDetail se llama directamente'
    ]
  },
  {
    version: '2.5.0',
    date: '2026-02-12',
    changes: [
      'Redise\u00F1o completo detalle liquidaci\u00F3n con identidad Homity Holidays',
      'Paleta dorado (#d4a843) + slate (#2e4a52) extra\u00EDda del branding h\u00F4mity holidays',
      'Tipograf\u00EDa: Cormorant Garamond (serif display), JetBrains Mono (importes)',
      'Header slate con l\u00EDnea dorada separadora, labels dorado muted',
      'Secciones con liq-sec, liq-sec-label para estructura sem\u00E1ntica',
      'Pasarela integrada: switch dorado + select + valor en fila \u00FAnica',
      'Switch desactivado: label gris, select oculto, valor tachado',
      'Secci\u00F3n CE2 con fondo dorado sutil, l\u00EDnea gold superior, dots dorados',
      'Total: barra dorada + fondo slate con importe en Cormorant 30px',
      'Badges: pendiente dorado outline, validada verde outline',
      'Selects: fondo cream, focus glow dorado, flecha SVG custom',
      'Bot\u00F3n Validar dorado, Imprimir outlined',
      'Print styles actualizados para nuevas clases',
      'Eliminado border-radius (est\u00E9tica editorial resort)',
      'Valores mon con font-mono JetBrains para alineaci\u00F3n tabular'
    ]
  },
  {
    version: '2.4.9',
    date: '2026-02-12',
    changes: [
      'Fix critico persistencia CE2: rango de lectura Config era A1:I (9 cols), faltaba columna J',
      'conceptosSinIVA se escrib\u00eda en col J pero nunca se le\u00eda de vuelta',
      'Corregido a A1:J en lectura y A:J en limpieza de filas obsoletas'
    ]
  },
  {
    version: '2.4.8',
    date: '2026-02-12',
    changes: [
      '_applyCEChange/_applyCE2Change: reemplazado _patchSingleRow por path ligero',
      'Clic entre campos CE ya no reconstruye el panel ni provoca salto',
      'onchange ahora usa _refreshCESummary + _patchMainRowCells (mismo path que Enter)'
    ]
  },
  {
    version: '2.4.7',
    date: '2026-02-12',
    changes: [
      'Fix: _patchMainRowCells ahora actualiza botones CE y CE2 de la fila principal',
      'El badge "-100,00 \u20AC" refleja el total real tras editar con Enter'
    ]
  },
  {
    version: '2.4.6',
    date: '2026-02-12',
    changes: [
      'Fix critico CE2: _ce2Key guardaba en propiedad incorrecta, valores no llegaban al calculo',
      'CE2 ahora suma y persiste correctamente al pulsar Enter'
    ]
  },
  {
    version: '2.4.5',
    date: '2026-02-12',
    changes: [
      'CE/CE2: Enter no crea fila nueva si ya existe una vac\u00eda abajo',
      'Si hay fila vac\u00eda pendiente, Enter mueve el foco ah\u00ed en vez de duplicar'
    ]
  },
  {
    version: '2.4.4',
    date: '2026-02-12',
    changes: [
      'CE Enter zero-jump: fila nueva PRIMERO, n\u00fameros actualizados en siguiente frame',
      'focus({preventScroll:true}) en todos los focus de CE/CE2 (6 puntos)',
      'requestAnimationFrame para desacoplar actualizaci\u00f3n de cache/stats del DOM',
      'Elimina layout thrashing: no hay lectura+escritura DOM intercalada'
    ]
  },
  {
    version: '2.4.3',
    date: '2026-02-12',
    changes: [
      'CE/CE2: Enter en importe ya no hace re-render completo (0 saltos)',
      'Nuevo _patchMainRowCells: actualiza solo celdas num\u00e9ricas sin tocar DOM del panel',
 'Enter guarda directo al modelo de datos, bypass de onchange   _applyCEChange   _patchSingleRow',
      'Stats del footer actualizados incrementalmente sin rebuild'
    ]
  },
  {
    version: '2.4.2',
    date: '2026-02-12',
    changes: [
      'Config modal: Enter en campo valor ejecuta A\u00f1adir directamente',
      'URLs Google Sheets: Enter en los 3 inputs dispara Cargar/Guardar',
      'Conceptos Extraordinarios: prompt() reemplazado por inputs inline',
 'Consol extras: flujo nombre Enter   importe Enter   guardado suave',
      'Consol extras: Escape cancela, blur inteligente auto-guarda si hay datos'
    ]
  },
  {
    version: '2.4.1',
    date: '2026-02-12',
    changes: [
      'CE/CE2: Pulsar Enter en el campo importe abre nuevo concepto suavemente',
      'CE/CE2: Pulsar Enter en el campo nombre mueve foco al importe',
 'Flujo sin rat\u00f3n: nombre Enter   importe Enter   nuevo concepto'
    ]
  },
  {
    version: '2.4.0',
    date: '2026-02-12',
    changes: [
      'Redise\u00f1o visual: nueva paleta de colores con CSS variables',
      'Tipograf\u00eda mejorada: Inter para t\u00edtulos, DM Sans para cuerpo, tabular-nums en tabla',
      'Tarjetas de alojamiento refinadas con gradiente sutil y mejor hover',
      'Toast notifications en lugar de alert() para feedback no bloqueante',
      'Validaci\u00f3n de inputs num\u00e9ricos con rango (0-100% para tasas)',
      'Sidebar con iconos SVG y transiciones m\u00e1s fluidas',
      'Fix: bloque de versionado corrupto (encoding UTF-8) restaurado',
      'Fix: parseNum() ahora valida rangos para porcentajes',
      'Mejoras en sombras, bordes y espaciado general',
      'Nuevas animaciones: fadeIn para pantallas, slide para paneles'
    ]
  },
  { version: '2.3.2', date: '2026-02-12T23:45:00+01:00', changes: [
    'Lista toggles 80/20 limitada a 20 alojamientos propiedad GTC',
    'Nueva lista _gtcOwnedAlojamientos persistida en Google Sheets (clave gtc_owned)',
    'Descripci\u00F3n actualizada: activa los vendidos, GTC retiene 20%'
  ]},
  { version: '2.3.1', date: '2026-02-12T23:30:00+01:00', changes: [
    'Selector visual de alojamientos 80/20 con toggles en pesta\u00F1a Configuraci\u00F3n > GTC',
    'Lista din\u00E1mica generada a partir de alojamientos cargados',
    'Contador de alojamientos activos con guardado autom\u00E1tico'
  ]},
  { version: '2.3.0', date: '2026-02-12T23:15:00+01:00', changes: [
    'Reparto 80/20 GTC: alojamientos con condici\u00F3n especial retienen 20% para GTC del Subtotal Reservas',
    'Caja violeta de reparto entre Subtotal Reservas y Otros Conceptos',
    'IRPF e IVA se calculan sobre Subtotal Final Mes (80% \u2212 conceptos ext.)',
    'Lista de alojamientos especiales persistida en pesta\u00F1a Configuraci\u00F3n de Google Sheets',
    'Versi\u00F3n impresa incluye desglose del reparto GTC/Propietario'
  ]},
  { version: '2.2.0', date: '2026-02-12T22:45:00+01:00', changes: [
    'Nuevo orden resumen consolidado: sigue orden columnas tabla (Amenities \u2192 Pasarela \u2192 C.E. Sin IVA)',
    'Nuevo Subtotal Reservas: subtotal intermedio que cierra deducciones por reserva',
    'Secci\u00F3n Otros Conceptos separada en caja verde',
    'Subtotal renombrado a Subtotal Final Mes para distinguir del Subtotal Reservas',
    'Versi\u00F3n impresa actualizada con nuevos nombres de subtotales'
  ]},
  { version: '2.1.1', date: '2026-02-12T22:15:00+01:00', changes: [
    'Fix: dropdown selector de columnas se cortaba en secci\u00F3n Liquidaci\u00F3n por overflow del contenedor',
    'A\u00F1adido max-height: 60vh con scroll al desplegable de columnas para evitar desbordamiento'
  ]},
  { version: '2.1.0', date: '2026-02-12T17:30:00+01:00', changes: [
    'Nueva columna C.E. (Sin IVA): conceptos especiales que restan directamente al subtotal',
    'Panel desplegable violeta con misma mec\u00E1nica que C.E. (IVA inc.) pero en base sin IVA',
    'Integrado en preliquidaciones, vista consolidada, detalle individual y vista de impresi\u00F3n',
    'Persistencia autom\u00E1tica en pesta\u00F1a Configuracion de Google Sheets',
    'C\u00E1lculo: sub = baseSinIVA \u2212 comPlat \u2212 comGTC \u2212 comPas \u2212 limp \u2212 amen \u2212 ceSinIva'
  ]},
  { version: '2.0.2', date: '2026-02-13T00:20:00+01:00', changes: [
    'Bloque VERSIONING RULES (SemVer) embebido en el c\u00F3digo con checklist obligatorio',
    'Memoria actualizada para forzar cumplimiento de versionado en cada entrega'
  ]},
  { version: '2.0.1', date: '2026-02-13T00:15:00+01:00', changes: [
    'Fix: addCEItem ahora persiste inmediatamente al a\u00F1adir concepto especial',
    'Persistencia write-first: datos se escriben antes de limpiar filas obsoletas',
    'Si la limpieza de filas residuales falla, los datos nuevos ya est\u00E1n seguros',
    'Eliminado riesgo de p\u00E9rdida de config si la red falla entre clear y update'
  ]},
  { version: '2.0.0', date: '2026-02-12T22:45:00+01:00', changes: [
    'Refactorizaci\u00F3n profunda del c\u00F3digo base para mayor robustez y mantenibilidad',
    'Nuevo objeto CONFIG centraliza todas las constantes de la aplicaci\u00F3n',
    'Nuevo objeto AppState unifica variables globales dispersas (60+ vars \u2192 1 objeto)',
    'Funci\u00F3n esc() para sanitizaci\u00F3n XSS en todos los templates HTML',
    'Deduplicaci\u00F3n: getSortValue() unificada para tabla principal y consolidada',
    'Deduplicaci\u00F3n: _buildFooterHtml() genera footer para ambas vistas',
    'Error handling robusto con try/catch y mensajes descriptivos en operaciones Google API',
    'Eliminado patr\u00F3n fr\u00E1gil processRows._lastValColIdx \u2192 retorno por objeto',
    'Conversi\u00F3n completa var \u2192 const/let en todo el c\u00F3digo',
    'SafeJSON: parsing JSON defensivo con fallback para datos corruptos',
    'Validaci\u00F3n de inputs en funciones cr\u00EDticas (changeSetting, processRows)',
    'Funciones de cache centralizadas en CacheManager',
    'Helpers: safeGet() para acceso seguro a propiedades anidadas',
    'Console logging mejorado con prefijos [Module] consistentes',
    'Correcci\u00F3n de potenciales memory leaks en event listeners'
  ]},
  { version: '1.9.1', date: '2026-02-11T01:12:00+01:00', changes: [
    'CE: eliminar concepto con animaci\u00F3n slide-out sin flash ni re-render',
    'CE: a\u00F1adir concepto con animaci\u00F3n slide-in + auto-focus',
    'Texto: "Totales" \u2192 "Reservas Totales" en barra de totales'
  ]},
  { version: '1.9.0', date: '2026-02-11T01:01:00+01:00', changes: [
    'Filtro de fecha multi-selecci\u00F3n: selecciona varios a\u00F1os y meses simult\u00E1neamente',
    'Combinatoria libre: Ene+Feb de 2025+2026, o un mes en 3 a\u00F1os, etc.',
    'Flechas \u2039 \u203A para navegar cuando hay selecci\u00F3n simple (1 a\u00F1o o 1 a\u00F1o+mes)',
    'Contador de reservas por mes agregado seg\u00FAn a\u00F1os seleccionados',
    'Fix: a\u00F1adir concepto CE suave \u2014 inserta DOM sin re-render + animaci\u00F3n slide-down',
    'Texto: "Totales" \u2192 "Reservas Totales" en barra de totales'
  ]},
  { version: '1.8.0', date: '2026-02-11T00:33:00+01:00', changes: [
    'Asistente Hist\u00F3rico Reservas: chat IA integrado con bot\u00F3n flotante y panel lateral',
    'Responde solo con datos reales cargados \u2014 nunca inventa cifras ni nombres',
    'Contexto completo: res\u00FAmenes por alojamiento, plataforma, mes, edificio, atendido por, tipo reserva',
    'Detalle por reserva: todos los campos del Sheet (ID, localizador, cliente, edificio, etc.)',
    'Desglose de liquidaci\u00F3n: base, comisiones, limpieza, amenities, CE, pasarela, subtotal',
    'System prompt estricto anti-alucinaciones con referencia a campos disponibles',
    'API Key se guarda localmente en el navegador (localStorage)',
    'Contexto inteligente: res\u00FAmenes cubren 100% reservas, detalle usa filtros activos (max 200)'
  ]},
  { version: '1.7.5', date: '2026-02-10T09:07:00+01:00', changes: [
    'Changelog muestra d\u00EDa, hora y segundos en horario Madrid (+01:00)',
    'Sidebar muestra hora real del deploy (primer acceso a la versi\u00F3n), no hora de build',
    'Meta tags anti-cach\u00E9: navegador siempre pide versi\u00F3n fresca al servidor',
    'Scrollbar permanente, fino (6px) y transparente \u2014 elimina sombra al abrir/cerrar CE',
    'Fix: modal config no salta al cambiar de tab (posici\u00F3n fija arriba + min-height)'
  ]},
  { version: '1.7.4', date: '2026-02-10T08:30:00+01:00', changes: [
    'Historial de versiones integrado en la app con enlace en sidebar',
    'Tab de configuraci\u00F3n renombrado: Servicio GTC / Limpieza / Amenities / Mant.',
    'Pesta\u00F1a "Impuestos" separada para IRPF',
    'Toast de nueva versi\u00F3n con lista de cambios y link a historial completo',
    'Toast m\u00E1s duradero (12s)',
    'Fix: toast no aparec\u00EDa al no cambiar string de versi\u00F3n',
    'Fix: doble-click necesario tras buscar (search input cambiaba de ancho al perder foco)',
    'Fix: micro-vibraci\u00F3n DOM con overflow-anchor y DocumentFragment'
  ]},
  { version: '1.7.3', date: '2026-02-10T08:00:00+01:00', changes: [
    'Renombrar "Plataforma" \u2192 "Canal de Venta" en cabeceras y detalle',
    'Reordenar secciones: Canal de Venta \u2192 GTC/Limpieza \u2192 Pasarela \u2192 Impuestos',
    'Fix: salto de scroll al hacer click con pocos resultados filtrados',
    'Fix: IDs de panel CE corregidos en _patchSingleRow (ce-ppanel-)'
  ]},
  { version: '1.7.2', date: '2026-02-10T07:20:00+01:00', changes: [
    'CE interactivo en vista consolidada (panel desplegable)',
    'Sistema de prefijo de vista (p/c) para evitar conflictos de IDs',
    'Toast de notificaci\u00F3n de nueva versi\u00F3n al arrancar',
    'Filtro mes/a\u00F1o por defecto al mes y a\u00F1o actual',
    'Deducciones mensuales (mantenimiento + extras) antes del subtotal',
    'Fix: limpieza e IRPF con valor 0\u20AC no se aplicaban (bug falsy)',
    'Fix: estilos consol-row mejorados'
  ]},
  { version: '1.7.1', date: '2026-02-09T19:30:00+01:00', changes: [
    'Integraci\u00F3n de propietarios desde Google Sheets con edici\u00F3n inline',
    'Columnas renombradas: Canal de Venta, Gesti\u00F3n GTC, Pasarela de pago',
    'Estado de validaci\u00F3n ordenable en la tabla',
    'Fix: filtrado por tab en configuraci\u00F3n'
  ]},
  { version: '1.7.0', date: '2026-02-09T18:40:00+01:00', changes: [
    'Conceptos Especiales (CE): panel inline con bot\u00F3n +/- por reserva',
    'CE se descuenta del total antes de calcular comisiones',
    'CE integrado en vista principal, consolidada, detalle e impresi\u00F3n',
    'Persistencia de CE en Google Sheets (tab Configuracion)',
    'B\u00FAsqueda mejorada: filtra tambi\u00E9n por importes y CE',
    'Fix: cabeceras de columna CE con tooltip',
    'Fix: comportamiento de click en bot\u00F3n CE',
    'Fix: persistencia de autenticaci\u00F3n Google entre sesiones'
  ]},
  { version: '1.6.1', date: '2026-02-09T16:23:00+01:00', changes: [
    'Amenities configurables por reserva (no solo global)',
    'Fix: tab Configuracion se filtraba incorrectamente en carga',
    'Fix: estado de carga atascado al cambiar de fuente',
    'Fix: correcciones de codificaci\u00F3n UTF-8 en textos espa\u00F1oles'
  ]},
  { version: '1.6.0', date: '2026-02-09T14:21:00+01:00', changes: [
    'Persistencia de configuraci\u00F3n en pesta\u00F1a "Configuracion" de Google Sheets',
    'Auto-guardado de opciones globales y ajustes por reserva',
    'Carga autom\u00E1tica de configuraci\u00F3n al conectar Google Sheets',
    'Debounce inteligente para minimizar escrituras API'
  ]},
  { version: '1.5.1', date: '2026-02-09T06:00:00+01:00', changes: [
    'Sincronizaci\u00F3n inmediata con indicadores visuales de estado',
    'B\u00FAsqueda de texto global en todas las vistas',
    'Mejoras en layout de columnas',
    'Escritura de validaciones directamente en Google Sheets'
  ]},
  { version: '1.5.0', date: '2026-02-08T21:00:00+01:00', changes: [
    'Write-back de estado de validaci\u00F3n a Google Sheets',
    'Detecci\u00F3n autom\u00E1tica de columna de validaci\u00F3n',
    'Operaciones batch para validar/desvalidar m\u00FAltiples reservas',
    'Paginaci\u00F3n con delta-updates para rendimiento O(1)',
    'Optimizaci\u00F3n de rendimiento para miles de reservas',
    'Integraci\u00F3n con Google Sheets v\u00EDa OAuth',
    'Deploy en GitHub Pages'
  ]},
  { version: '1.4.0', date: '2026-02-08T19:00:00+01:00', changes: [
    'Vista consolidada por alojamiento con resumen financiero',
    'Liquidaci\u00F3n individual con desglose completo',
    'Impresi\u00F3n optimizada de liquidaciones'
  ]},
  { version: '1.3.0', date: '2026-02-08T17:00:00+01:00', changes: [
    'Sistema de filtros combinados: plataforma, alojamiento, estado',
    'Filtro por mes/a\u00F1o con selector visual',
    'Ordenaci\u00F3n por m\u00FAltiples campos',
    'Tarjetas de estad\u00EDsticas con porcentajes filtrados'
  ]},
  { version: '1.2.0', date: '2026-02-08T15:00:00+01:00', changes: [
    'Pasarela de pago configurable (Stripe/Booking)',
    'Toggle de activaci\u00F3n/desactivaci\u00F3n por reserva',
    'Modal de configuraci\u00F3n con gesti\u00F3n de opciones',
    'C\u00E1lculo de IVA sobre subtotal'
  ]},
  { version: '1.1.0', date: '2026-02-08T13:00:00+01:00', changes: [
    'C\u00E1lculo de liquidaci\u00F3n: comisiones, limpieza, IRPF',
    'Vista de detalle individual por reserva',
    'Validaci\u00F3n de reservas con estado persistente',
    'Exportaci\u00F3n y carga de ficheros Excel'
  ]},
  { version: '1.0.0', date: '2026-02-08T11:00:00+01:00', changes: [
    'Versi\u00F3n inicial: carga de ficheros Excel de reservas',
    'Tabla de preliquidaciones con columnas configurables',
    'Sidebar de navegaci\u00F3n',
    'Dise\u00F1o responsive'
  ]}
];

// Mostrar versi\u00F3n en sidebar + toast si nueva versi\u00F3n
window.addEventListener('DOMContentLoaded', () => {
  const vl = document.getElementById('version-label');
  if (vl) {
    // Record actual deploy time (first load of this version)
    const deployKey = 'app-deploy-time-' + APP_VERSION;
    let deployTime = SafeStorage.get(deployKey);
    if (!deployTime) {
      deployTime = new Date().toISOString();
      SafeStorage.set(deployKey, deployTime);
    }
    const bd = new Date(deployTime);
    const bStr = bd.toLocaleDateString('es-ES', {day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit', second:'2-digit', timeZone:'Europe/Madrid'});
    vl.textContent = APP_VERSION + ' (' + bStr + ')';
  }
  const lastSeen = SafeStorage.get('app-last-version');
  if (lastSeen && lastSeen !== APP_VERSION) {
    showVersionToast(lastSeen);
  }
  SafeStorage.set('app-last-version', APP_VERSION);
});

function showVersionToast(prevVersion) {
  const entry = CHANGELOG.find(c => c.version === APP_VERSION);
  const changesList = entry ? entry.changes.slice(0, 4).map(c => `<div style="font-size:11px;color:#cbd5e1;padding:2px 0 2px 12px;position:relative;line-height:1.4;"><span style="position:absolute;left:2px;color:#4f8cff;">\u2022</span>${c}</div>`).join('') : `<div style="font-size:12px;color:#cbd5e1;">${APP_CHANGES}</div>`;
  const moreCount = entry && entry.changes.length > 4 ? `<div style="font-size:11px;color:#64748b;margin-top:2px;">...y ${entry.changes.length - 4} m\u00E1s</div>` : '';
  const toast = document.createElement('div');
  toast.id = 'version-toast';
  toast.innerHTML = `
    <div style="display:flex;align-items:flex-start;gap:12px;">
      <span style="font-size:22px;line-height:1;">&#x1F680;</span>
      <div style="flex:1;min-width:0;">
        <div style="font-weight:700;font-size:14px;margin-bottom:6px;">Actualizaci\u00F3n v${APP_VERSION}</div>
        ${changesList}${moreCount}
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;">
          <span style="font-size:11px;color:#64748b;">Anterior: v${prevVersion}</span>
          <a href="#" onclick="event.preventDefault();closeVersionToast();showChangelog();" style="font-size:11px;color:#4f8cff;text-decoration:none;font-weight:600;">Ver historial completo \u2192</a>
        </div>
      </div>
      <button onclick="closeVersionToast()" style="background:none;border:none;color:#94a3b8;font-size:18px;cursor:pointer;padding:0;line-height:1;">&times;</button>
    </div>`;
  toast.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:99999;background:linear-gradient(135deg,#0f172a,#1e293b);color:#f1f5f9;padding:16px 20px;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.3),0 0 0 1px rgba(255,255,255,0.08);max-width:360px;min-width:280px;opacity:0;transform:translateY(20px);transition:all 0.4s cubic-bezier(0.16,1,0.3,1);font-family:inherit;';
  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });
  });
  setTimeout(() => closeVersionToast(), CONFIG.VERSION_TOAST_TIMEOUT);
}
function closeVersionToast() {
  const t = document.getElementById('version-toast');
  if (!t) return;
  t.style.opacity = '0';
  t.style.transform = 'translateY(20px)';
  setTimeout(() => t.remove(), 400);
}
function showVersionInfo() {
  showChangelog();
}

function showChangelog() {
  const body = document.getElementById('changelog-body');
  body.innerHTML = CHANGELOG.map((v, i) => {
    const isCurrent = v.version === APP_VERSION;
    const items = v.changes.map(c => `<li>${c}</li>`).join('');
    return `<div class="cl-version">
      <div class="cl-version-header">
        <span class="cl-badge${isCurrent ? ' current' : ''}">v${v.version}</span>
        <span class="cl-date">${new Date(v.date).toLocaleDateString('es-ES', {day:'2-digit', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit', second:'2-digit', timeZone:'Europe/Madrid'})}</span>
        ${isCurrent ? '<span style="font-size:11px;color:#43a047;font-weight:600;">&#x2190; actual</span>' : ''}
      </div>
      <ul class="cl-changes">${items}</ul>
    </div>`;
  }).join('');
  document.getElementById('changelog-overlay').style.display = 'flex';
}

function closeChangelog() {
  document.getElementById('changelog-overlay').style.display = 'none';
}

// ==============================================================================================================================
//  [M05] GOOGLE_AUTH ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â Autenticaci\u00f3n OAuth y gesti\u00f3n de tokens
// ==============================================================================================================================

