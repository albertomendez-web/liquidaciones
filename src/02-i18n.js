const I18N = {
  // â€”â€”â€” Navigation â€”â€”â€”
  'nav.upload':        { es:'Cargar Fichero', en:'Load File', de:'Datei laden' },
  'nav.list':          { es:'Por Reserva', en:'By Reservation', de:'Nach Buchung' },
  'nav.detail':        { es:'Liquidaci\u00f3n Reserva', en:'Reservation Settlement', de:'Buchungsabrechnung' },
  'nav.consol':        { es:'Por Alojamiento', en:'By Property', de:'Nach Unterkunft' },
  'nav.consoldetail':  { es:'Liquidaci\u00f3n Alojamiento', en:'Property Settlement', de:'Unterkunftsabrechnung' },

  // â€”â€”â€” Logo / Title â€”â€”â€”
  'app.title':         { es:'Liquidaciones', en:'Settlements', de:'Abrechnungen' },
  'app.subtitle':      { es:'Gesti\u00f3n de Reservas', en:'Reservation Management', de:'Buchungsverwaltung' },
  'app.doctitle':      { es:'Liquidaciones \u2014 Gesti\u00f3n de Reservas', en:'Settlements \u2014 Reservation Management', de:'Abrechnungen \u2014 Buchungsverwaltung' },

  // â€”â€”â€” Upload Screen â€”â€”â€”
  'upload.title':      { es:'Cargar Reservas', en:'Load Reservations', de:'Buchungen laden' },
  'upload.desc':       { es:'Sube un fichero Excel o conecta con Google Sheets para cargar las reservas', en:'Upload an Excel file or connect to Google Sheets to load reservations', de:'Laden Sie eine Excel-Datei hoch oder verbinden Sie sich mit Google Sheets' },
  'upload.drop':       { es:'Arrastra tu fichero aqu\u00ed', en:'Drag your file here', de:'Datei hierher ziehen' },
  'upload.dropSub':    { es:'o haz clic para seleccionar \u2014 formato .xlsx', en:'or click to select \u2014 .xlsx format', de:'oder klicken zum Ausw\u00e4hlen \u2014 .xlsx Format' },
  'upload.gsheet':     { es:'Cargar desde Google Sheets', en:'Load from Google Sheets', de:'Aus Google Sheets laden' },
  'upload.gsheetDesc': { es:'Conecta con tu cuenta Google para cargar datos directamente desde una hoja de c\u00e1lculo', en:'Connect your Google account to load data directly from a spreadsheet', de:'Verbinden Sie Ihr Google-Konto, um Daten direkt aus einer Tabelle zu laden' },
  'upload.notConnected': { es:'No conectado', en:'Not connected', de:'Nicht verbunden' },
  'upload.connect':    { es:'Conectar con Google', en:'Connect with Google', de:'Mit Google verbinden' },
  'upload.disconnect': { es:'Desconectar', en:'Disconnect', de:'Trennen' },
  'upload.defaultSheet': { es:'Hoja por defecto', en:'Default sheet', de:'Standardtabelle' },
  'upload.loadNow':    { es:'Cargar ahora', en:'Load now', de:'Jetzt laden' },
  'upload.save':       { es:'Guardar', en:'Save', de:'Speichern' },
  'upload.cancel':     { es:'Cancelar', en:'Cancel', de:'Abbrechen' },
  'upload.configure':  { es:'Configurar', en:'Configure', de:'Konfigurieren' },
  'upload.configDesc': { es:'Configura una URL para cargar autom\u00e1ticamente al conectar', en:'Set a URL to load automatically on connect', de:'URL f\u00fcr automatisches Laden beim Verbinden festlegen' },
  'upload.explore':    { es:'Explorar Google Drive', en:'Browse Google Drive', de:'Google Drive durchsuchen' },
  'upload.pasteUrl':   { es:'o pega la URL', en:'or paste the URL', de:'oder URL einf\u00fcgen' },
  'upload.load':       { es:'Cargar', en:'Load', de:'Laden' },
  'upload.loading':    { es:'Cargando datos...', en:'Loading data...', de:'Daten werden geladen...' },
  'upload.selectSheet': { es:'Selecciona la hoja:', en:'Select the sheet:', de:'Tabelle ausw\u00e4hlen:' },
  'upload.recentSheets': { es:'Hojas recientes', en:'Recent sheets', de:'Letzte Tabellen' },
  'upload.loadingDefault': { es:'Cargando hoja por defecto...', en:'Loading default sheet...', de:'Standardtabelle wird geladen...' },
  'upload.connectedGoogle': { es:'Conectado con Google', en:'Connected with Google', de:'Mit Google verbunden' },
  'upload.googleConnected': { es:'Google conectado', en:'Google connected', de:'Google verbunden' },

  // â€”â€”â€” List Screen â€”â€”â€”
  'list.title':        { es:'Por Reserva', en:'By Reservation', de:'Nach Buchung' },
  'list.desc':         { es:'Revisa, ajusta y valida cada reserva antes de generar la liquidaci\u00f3n definitiva', en:'Review, adjust and validate each reservation before generating the final settlement', de:'\u00dcberpr\u00fcfen, anpassen und validieren Sie jede Buchung vor der endg\u00fcltigen Abrechnung' },

  // â€”â€”â€” Consolidated Screen â€”â€”â€”
  'consol.title':      { es:'Por Alojamiento', en:'By Property', de:'Nach Unterkunft' },
  'consol.desc':       { es:'Consolida las reservas validadas de cada alojamiento para generar la liquidaci\u00f3n mensual', en:'Consolidate validated reservations per property to generate the monthly settlement', de:'Konsolidieren Sie validierte Buchungen pro Unterkunft f\u00fcr die monatliche Abrechnung' },

  // â€”â€”â€” Filters / Labels â€”â€”â€”
  'filter.filters':    { es:'Filtros', en:'Filters', de:'Filter' },
  'filter.allPlatforms': { es:'Todas las plataformas', en:'All platforms', de:'Alle Plattformen' },
  'filter.allProperties': { es:'Todos los alojamientos', en:'All properties', de:'Alle Unterk\u00fcnfte' },
  'filter.allStatuses': { es:'Todos los estados', en:'All statuses', de:'Alle Status' },
  'filter.search':     { es:'Buscar cliente, importe, fecha...', en:'Search client, amount, date...', de:'Suche Kunde, Betrag, Datum...' },
  'filter.searchConsol': { es:'Buscar alojamiento, importe...', en:'Search property, amount...', de:'Suche Unterkunft, Betrag...' },
  'filter.sort':       { es:'Ordenar', en:'Sort', de:'Sortieren' },
  'filter.sortBy':     { es:'Ordenar por', en:'Sort by', de:'Sortieren nach' },
  'filter.originalOrder': { es:'Orden original', en:'Original order', de:'Urspr\u00fcngliche Reihenfolge' },
  'filter.columns':    { es:'Columnas', en:'Columns', de:'Spalten' },

  // â€”â€”â€” Column Labels â€”â€”â€”
  'col.estado':        { es:'Estado', en:'Status', de:'Status' },
  'col.idReserva':     { es:'ID<br>Reserva', en:'Reservation<br>ID', de:'Buchungs-<br>ID' },
  'col.localizador':   { es:'Localizador', en:'Locator', de:'Buchungscode' },
  'col.fechaAlta':     { es:'Fecha<br>Alta', en:'Creation<br>Date', de:'Erstellungs-<br>datum' },
  'col.cliente':       { es:'Cliente', en:'Client', de:'Kunde' },
  'col.alojamiento':   { es:'Alojamiento', en:'Property', de:'Unterkunft' },
  'col.edificio':      { es:'Edificio', en:'Building', de:'Geb\u00e4ude' },
  'col.plataforma':    { es:'Plataforma', en:'Platform', de:'Plattform' },
  'col.atendidoPor':   { es:'Atendido<br>por', en:'Attended<br>by', de:'Betreut<br>von' },
  'col.origenMarketing': { es:'Origen<br>Mkt.', en:'Marketing<br>Source', de:'Marketing-<br>Quelle' },
  'col.tipoReserva':   { es:'Tipo<br>Reserva', en:'Reservation<br>Type', de:'Buchungs-<br>typ' },
  'col.fechaEntrada':  { es:'Fecha<br>Entrada', en:'Check-in<br>Date', de:'Anreise-<br>datum' },
  'col.fechaSalida':   { es:'Fecha<br>Salida', en:'Check-out<br>Date', de:'Abreise-<br>datum' },
  'col.noches':        { es:'Noches', en:'Nights', de:'N\u00e4chte' },
  'col.totalReserva':  { es:'Total Reserva<br>(IVA inc.)', en:'Total Reservation<br>(VAT incl.)', de:'Gesamt Buchung<br>(MwSt. inkl.)' },
  'col.ce':            { es:'C.E.<br>(IVA inc.)', en:'S.C.<br>(VAT incl.)', de:'S.K.<br>(MwSt. inkl.)' },
  'col.baseSinIVA':    { es:'Base<br>sin IVA', en:'Base<br>excl. VAT', de:'Netto-<br>betrag' },
  'col.comPlataforma': { es:'Canal de<br>Venta', en:'Sales<br>Channel', de:'Vertriebs-<br>kanal' },
  'col.comGTC':        { es:'Gesti\u00f3n<br>GTC', en:'GTC<br>Mgmt.', de:'GTC<br>Verwaltung' },
  'col.limpieza':      { es:'Limpieza', en:'Cleaning', de:'Reinigung' },
  'col.amenities':     { es:'Amenities', en:'Amenities', de:'Ausstattung' },
  'col.pasarela':      { es:'Pasarela', en:'Payment<br>Gateway', de:'Zahlungs-<br>gateway' },
  'col.ceSinIva':      { es:'C.E.<br>(Sin IVA)', en:'S.C.<br>(excl. VAT)', de:'S.K.<br>(ohne MwSt.)' },
  'col.subtotal':      { es:'Subtotal', en:'Subtotal', de:'Zwischensumme' },
  'col.irpf':          { es:'IRPF', en:'Tax Withh.', de:'Steuer-<br>einbehalt' },
  'col.iva21':         { es:'IVA 21%', en:'VAT 21%', de:'MwSt. 21%' },
  'col.totalLiquidar': { es:'A<br>Liquidar', en:'To<br>Settle', de:'Zur<br>Abrechnung' },
  'col.observacion':   { es:'Observaci\u00f3n', en:'Notes', de:'Bemerkungen' },

  // â€”â€”â€” Status Badges â€”â€”â€”
  'status.validated':  { es:'Validada', en:'Validated', de:'Validiert' },
  'status.pending':    { es:'Pendiente', en:'Pending', de:'Ausstehend' },
  'status.ready':      { es:'Lista', en:'Ready', de:'Bereit' },

  // â€”â€”â€” Stats Cards â€”â€”â€”
  'stats.reservations': { es:'Reservas', en:'Reservations', de:'Buchungen' },
  'stats.totalReservations': { es:'Total Reservas', en:'Total Reservations', de:'Gesamt Buchungen' },
  'stats.totalToSettle': { es:'Total a Liquidar', en:'Total to Settle', de:'Gesamt zur Abrechnung' },
  'stats.validated':   { es:'Validadas', en:'Validated', de:'Validiert' },
  'stats.properties':  { es:'Alojamientos', en:'Properties', de:'Unterk\u00fcnfte' },
  'stats.totalBilling': { es:'Total Facturaci\u00f3n', en:'Total Billing', de:'Gesamt Umsatz' },
  'stats.readyToSettle': { es:'Listos para liquidar', en:'Ready to settle', de:'Abrechnungsbereit' },
  'stats.nights':      { es:'Noches', en:'Nights', de:'N\u00e4chte' },
  'stats.billing':     { es:'Facturaci\u00f3n', en:'Billing', de:'Umsatz' },

  // â€”â€”â€” Buttons / Actions â€”â€”â€”
  'btn.validate':      { es:'Validar', en:'Validate', de:'Validieren' },
  'btn.unvalidate':    { es:'Desvalidar', en:'Unvalidate', de:'Zur\u00fccksetzen' },
  'btn.print':         { es:'Imprimir', en:'Print', de:'Drucken' },
  'btn.backToLiq':     { es:'Volver a la liquidaci\u00f3n', en:'Back to settlement', de:'Zur\u00fcck zur Abrechnung' },
  'btn.back':          { es:'Volver', en:'Back', de:'Zur\u00fcck' },
  'btn.backToList':    { es:'Volver a la lista', en:'Back to list', de:'Zur\u00fcck zur Liste' },
  'btn.backToProperties': { es:'Volver a alojamientos', en:'Back to properties', de:'Zur\u00fcck zu Unterk\u00fcnften' },
  'btn.generate':      { es:'Generar Liquidaci\u00f3n', en:'Generate Settlement', de:'Abrechnung erstellen' },
  'btn.downloadPdf':   { es:'Descargar PDF', en:'Download PDF', de:'PDF herunterladen' },
  'btn.sendEmail':     { es:'Enviar por Email', en:'Send by Email', de:'Per E-Mail senden' },

  // â€”â€”â€” Liquidation Detail Labels â€”â€”â€”
  'liq.reservation':   { es:'Liquidaci\u00f3n Reserva', en:'Reservation Settlement', de:'Buchungsabrechnung' },
  'liq.title':         { es:'Liquidaci\u00f3n', en:'Settlement', de:'Abrechnung' },
  'liq.alojamiento':   { es:'Alojamiento', en:'Property', de:'Unterkunft' },
  'liq.fechas':        { es:'Fechas', en:'Dates', de:'Daten' },
  'liq.canal':         { es:'Canal', en:'Channel', de:'Kanal' },
  'liq.idReserva':     { es:'ID Reserva', en:'Booking ID', de:'Buchungs-ID' },
  'liq.localizador':   { es:'Localizador', en:'Locator', de:'Buchungsnr.' },
  'liq.edificio':      { es:'Edificio', en:'Building', de:'Geb\u00e4ude' },
  'liq.baseSinIVA':    { es:'Base sin IVA', en:'Base excl. VAT', de:'Nettobetrag' },
  'liq.canalVenta':    { es:'Canal de Venta', en:'Sales Channel', de:'Vertriebskanal' },
  'liq.gestionGTC':    { es:'Gesti\u00f3n GTC', en:'GTC Management', de:'GTC Verwaltung' },
  'liq.limpieza':      { es:'Limpieza', en:'Cleaning', de:'Reinigung' },
  'liq.subtotal':      { es:'Subtotal', en:'Subtotal', de:'Zwischensumme' },
  'liq.ivaReserva':    { es:'IVA Reserva', en:'Reservation VAT', de:'Buchungs-MwSt.' },
  'liq.ivaSubtotal':   { es:'IVA del Subtotal', en:'VAT on Subtotal', de:'MwSt. auf Zwischensumme' },
  'liq.irpf':          { es:'Retenci\u00f3n IRPF', en:'IRPF Withholding', de:'IRPF Einbehaltung' },
  'liq.pasarela':      { es:'Pasarela', en:'Payment Gateway', de:'Zahlungsgateway' },
  'liq.totalLabel':    { es:'Total a liquidar', en:'Total to settle', de:'Gesamt zur Abrechnung' },
  'liq.monthlyLiq':    { es:'Liquidaci\u00f3n mensual', en:'Monthly settlement', de:'Monatliche Abrechnung' },
  'liq.monthlyConsol': { es:'Liquidaci\u00f3n Mensual Consolidada', en:'Monthly Consolidated Settlement', de:'Monatliche konsolidierte Abrechnung' },
  'liq.totalVAT':      { es:'Total Reserva (IVA incluido)', en:'Total Reservation (VAT included)', de:'Gesamt Buchung (MwSt. inkl.)' },
  'liq.vatReservation': { es:'IVA Reserva', en:'Reservation VAT', de:'Buchungs-MwSt.' },
  'liq.baseNoVAT':     { es:'Base sin IVA', en:'Base excl. VAT', de:'Nettobetrag' },
  'liq.salesOps':      { es:'Venta, gesti\u00f3n y operaciones', en:'Sales, management and operations', de:'Vertrieb, Verwaltung und Betrieb' },
  'liq.amenities':     { es:'Amenities', en:'Amenities', de:'Ausstattung' },
  'liq.gateway':       { es:'Pasarela', en:'Payment Gateway', de:'Zahlungsgateway' },
  'liq.gatewayPayment': { es:'Pasarela de pago', en:'Payment gateway', de:'Zahlungsgateway' },
  'liq.vatSubtotal':   { es:'IVA del Subtotal', en:'VAT on Subtotal', de:'MwSt. auf Zwischensumme' },
  'liq.totalToSettle': { es:'Total a liquidar', en:'Total to settle', de:'Gesamt zur Abrechnung' },
  'liq.monthlySettlement': { es:'Liquidaci\u00f3n mensual', en:'Monthly settlement', de:'Monatliche Abrechnung' },
  'liq.specialConcepts': { es:'Conceptos especiales (sin IVA)', en:'Special Concepts (excl. VAT)', de:'Sonderposten (ohne MwSt.)' },
  'liq.noName':        { es:'Sin nombre', en:'No name', de:'Ohne Namen' },

  // â€”â€”â€” Consolidated Labels â€”â€”â€”
  'consol.summary':    { es:'Resumen consolidado', en:'Consolidated Summary', de:'Konsolidierte Zusammenfassung' },
  'consol.summaryTitle': { es:'Resumen consolidado', en:'Consolidated summary', de:'Konsolidierte Zusammenfassung' },
  'consol.reservas':   { es:'reservas', en:'reservations', de:'Buchungen' },
  'consol.of':         { es:'de', en:'of', de:'von' },
  'consol.propietario': { es:'Propietario', en:'Owner', de:'Eigent\u00fcmer' },
  'consol.consolidatedTotal': { es:'Resumen consolidado', en:'Consolidated total', de:'Konsolidierter Gesamtbetrag' },
  'consol.gtcSplit':   { es:'Reparto GTC', en:'GTC Split', de:'GTC Aufteilung' },
  'consol.maint':      { es:'Mantenimiento', en:'Maintenance', de:'Wartung' },
  'consol.quickSummary': { es:'Resumen R\u00e1pido', en:'Quick Summary', de:'Kurz\u00fcbersicht' },
  'consol.totalReservasVAT': { es:'Total Reservas (IVA incluido)', en:'Total Reservations (VAT included)', de:'Gesamt Buchungen (MwSt. inkl.)' },
  'consol.vatReservas': { es:'IVA Reservas', en:'Reservations VAT', de:'Buchungs-MwSt.' },
  'consol.subtotalReservas': { es:'Subtotal Reservas', en:'Reservations Subtotal', de:'Buchungs-Zwischensumme' },
  'consol.otherConcepts': { es:'Otros Conceptos', en:'Other Concepts', de:'Sonstige Posten' },
  'consol.subtotalFinal': { es:'Subtotal Final Mes', en:'Monthly Final Subtotal', de:'Monatliche Endsumme' },
  'consol.totalToSettle': { es:'Total a Liquidar', en:'Total to Settle', de:'Gesamt zur Abrechnung' },
  'consol.owner':      { es:'Propietario', en:'Owner', de:'Eigent\u00fcmer' },
  'consol.building':   { es:'Edificio', en:'Building', de:'Geb\u00e4ude' },
  'consol.numReservations': { es:'N\u00BA Reservas', en:'No. Reservations', de:'Anz. Buchungen' },
  'consol.reservasTotal': { es:'Reservas Totales', en:'Total Reservations', de:'Gesamtbuchungen' },
  'consol.reservation': { es:'reserva', en:'reservation', de:'Buchung' },
  'consol.validated_pl': { es:'validadas', en:'validated', de:'validiert' },
  'consol.missingOwner': { es:'Falta propietario', en:'Missing owner', de:'Eigent\u00fcmer fehlt' },
  'consol.salesOps':   { es:'Venta, gesti\u00f3n y operaciones', en:'Sales, management & operations', de:'Vertrieb, Verwaltung & Betrieb' },
  'consol.subtotalReservas2': { es:'Subtotal reservas', en:'Reservations subtotal', de:'Buchungs-Zwischensumme' },
  'consol.otherConceptsShort': { es:'Otros conceptos', en:'Other concepts', de:'Sonstige Posten' },
  'consol.subtotalFinalMonth': { es:'Subtotal final mes', en:'Monthly final subtotal', de:'Monatliche Endsumme' },
  'consol.specialAgreement': { es:'Acuerdo especial', en:'Special agreement', de:'Sondervereinbarung' },
  'consol.originalTotal': { es:'Total reservas original', en:'Original total reservations', de:'Urspr\u00fcngliche Gesamtbuchungen' },
  'consol.specialConceptsDisc': { es:'Conceptos especiales descontados', en:'Special concepts discounted', de:'Sonderposten abgezogen' },
  'consol.ceNoVatDisc': { es:'C.E. sin IVA descontados', en:'S.C. excl. VAT discounted', de:'S.K. ohne MwSt. abgezogen' },
  'consol.splitTitle':  { es:'Acuerdo GTC / Propietario \u2014 Condici\u00f3n Especial', en:'GTC / Owner Agreement \u2014 Special Condition', de:'GTC / Eigent\u00fcmer Vereinbarung \u2014 Sonderbedingung' },
  'consol.gtcRetains':  { es:'GTC retiene', en:'GTC retains', de:'GTC beh\u00e4lt' },
  'consol.ownerReceives': { es:'Propietario recibe', en:'Owner receives', de:'Eigent\u00fcmer erh\u00e4lt' },
  'consol.toSettleOwner': { es:'Total a Liquidar \u2014 Propietario', en:'Total to Settle \u2014 Owner', de:'Gesamt zur Abrechnung \u2014 Eigent\u00fcmer' },

  // â€”â€”â€” Config Modal â€”â€”â€”
  'config.title':      { es:'Configurar Valores', en:'Configure Values', de:'Werte konfigurieren' },
  'config.salesChannel': { es:'Canal de Venta', en:'Sales Channel', de:'Vertriebskanal' },
  'config.gtcService': { es:'Servicio GTC / Limpieza / Amenities / Mant.', en:'GTC Service / Cleaning / Amenities / Maint.', de:'GTC Service / Reinigung / Ausstattung / Wartung' },
  'config.gateway':    { es:'Pasarela', en:'Payment Gateway', de:'Zahlungsgateway' },
  'config.taxes':      { es:'Impuestos', en:'Taxes', de:'Steuern' },
  'config.agreement8020': { es:'Acuerdo 80/20', en:'80/20 Agreement', de:'80/20 Vereinbarung' },

  // â€”â€”â€” Sort/Status Options â€”â€”â€”
  'sort.original':     { es:'Orden original', en:'Original order', de:'Urspr\u00fcngliche Reihenfolge' },
  'sort.status':       { es:'Estado', en:'Status', de:'Status' },
  'sort.idReserva':    { es:'ID Reserva', en:'Reservation ID', de:'Buchungs-ID' },
  'sort.localizador':  { es:'Localizador', en:'Locator', de:'Buchungscode' },
  'sort.fechaAlta':    { es:'Fecha Alta', en:'Creation Date', de:'Erstellungsdatum' },
  'sort.cliente':      { es:'Cliente', en:'Client', de:'Kunde' },
  'sort.alojamiento':  { es:'Alojamiento', en:'Property', de:'Unterkunft' },
  'sort.edificio':     { es:'Edificio', en:'Building', de:'Geb\u00e4ude' },
  'sort.plataforma':   { es:'Plataforma', en:'Platform', de:'Plattform' },
  'sort.atendidoPor':  { es:'Atendido por', en:'Attended by', de:'Betreut von' },
  'sort.origenMkt':    { es:'Origen Mkt.', en:'Marketing Source', de:'Marketing-Quelle' },
  'sort.tipoReserva':  { es:'Tipo Reserva', en:'Reservation Type', de:'Buchungstyp' },
  'sort.fechaEntrada': { es:'Fecha Entrada', en:'Check-in Date', de:'Anreisedatum' },
  'sort.fechaSalida':  { es:'Fecha Salida', en:'Check-out Date', de:'Abreisedatum' },
  'sort.nights':       { es:'Noches', en:'Nights', de:'N\u00e4chte' },
  'sort.totalReserva': { es:'Total reserva', en:'Total reservation', de:'Gesamt Buchung' },
  'sort.baseNoVAT':    { es:'Base sin IVA', en:'Base excl. VAT', de:'Nettobetrag' },
  'sort.subtotal':     { es:'Subtotal', en:'Subtotal', de:'Zwischensumme' },
  'sort.totalToSettle': { es:'Total a liquidar', en:'Total to settle', de:'Gesamt zur Abrechnung' },
  'sort.observation':  { es:'Observaci\u00f3n', en:'Notes', de:'Bemerkungen' },
  'sort.ascending':    { es:'\u2191 Ascendente', en:'\u2191 Ascending', de:'\u2191 Aufsteigend' },
  'sort.descending':   { es:'\u2193 Descendente', en:'\u2193 Descending', de:'\u2193 Absteigend' },
  'sort.nameAZ':       { es:'Nombre A\u2191Z', en:'Name A\u2191Z', de:'Name A\u2191Z' },
  'sort.nameZA':       { es:'Nombre Z\u2191A', en:'Name Z\u2191A', de:'Name Z\u2191A' },
  'sort.moreReservations': { es:'M\u00e1s reservas', en:'Most reservations', de:'Meiste Buchungen' },
  'sort.lessReservations': { es:'Menos reservas', en:'Fewest reservations', de:'Wenigste Buchungen' },
  'sort.higherSettlement': { es:'Mayor liquidaci\u00f3n', en:'Highest settlement', de:'H\u00f6chste Abrechnung' },
  'sort.lowerSettlement': { es:'Menor liquidaci\u00f3n', en:'Lowest settlement', de:'Niedrigste Abrechnung' },
  'sort.higherBilling': { es:'Mayor facturaci\u00f3n', en:'Highest billing', de:'H\u00f6chster Umsatz' },
  'sort.lowerBilling': { es:'Menor facturaci\u00f3n', en:'Lowest billing', de:'Niedrigster Umsatz' },
  'status.all':        { es:'Todos los estados', en:'All statuses', de:'Alle Status' },
  'status.pendingPl':  { es:'Pendientes', en:'Pending', de:'Ausstehend' },
  'status.validatedPl': { es:'Validadas', en:'Validated', de:'Validiert' },
  'consol.notValidated': { es:'No Validadas', en:'Not Validated', de:'Nicht validiert' },
  'consol.validatedTab': { es:'Validadas', en:'Validated', de:'Validiert' },

  // â€”â€”â€” Month names â€”â€”â€”
  'month.short.0': { es:'Ene', en:'Jan', de:'Jan' },
  'month.short.1': { es:'Feb', en:'Feb', de:'Feb' },
  'month.short.2': { es:'Mar', en:'Mar', de:'M\u00e4r' },
  'month.short.3': { es:'Abr', en:'Apr', de:'Apr' },
  'month.short.4': { es:'May', en:'May', de:'Mai' },
  'month.short.5': { es:'Jun', en:'Jun', de:'Jun' },
  'month.short.6': { es:'Jul', en:'Jul', de:'Jul' },
  'month.short.7': { es:'Ago', en:'Aug', de:'Aug' },
  'month.short.8': { es:'Sep', en:'Sep', de:'Sep' },
  'month.short.9': { es:'Oct', en:'Oct', de:'Okt' },
  'month.short.10': { es:'Nov', en:'Nov', de:'Nov' },
  'month.short.11': { es:'Dic', en:'Dec', de:'Dez' },
  'month.full.0':  { es:'Enero', en:'January', de:'Januar' },
  'month.full.1':  { es:'Febrero', en:'February', de:'Februar' },
  'month.full.2':  { es:'Marzo', en:'March', de:'M\u00e4rz' },
  'month.full.3':  { es:'Abril', en:'April', de:'April' },
  'month.full.4':  { es:'Mayo', en:'May', de:'Mai' },
  'month.full.5':  { es:'Junio', en:'June', de:'Juni' },
  'month.full.6':  { es:'Julio', en:'July', de:'Juli' },
  'month.full.7':  { es:'Agosto', en:'August', de:'August' },
  'month.full.8':  { es:'Septiembre', en:'September', de:'September' },
  'month.full.9':  { es:'Octubre', en:'October', de:'Oktober' },
  'month.full.10': { es:'Noviembre', en:'November', de:'November' },
  'month.full.11': { es:'Diciembre', en:'December', de:'Dezember' },

  // â€”â€”â€” Sync â€”â€”â€”
  'sync.synced':       { es:'Sincronizado', en:'Synced', de:'Synchronisiert' },
  'sync.syncing':      { es:'Sincronizando...', en:'Syncing...', de:'Synchronisierung...' },

  // â€”â€”â€” Changelog / Version â€”â€”â€”
  'changelog.title':   { es:'Historial de versiones', en:'Version history', de:'Versionshistorie' },
  'changelog.link':    { es:'Historial de cambios', en:'Changelog', de:'\u00c4nderungsprotokoll' },

  // â€”â€”â€” AI Assistant â€”â€”â€”
  'ai.title':          { es:'Asistente Hist\u00f3rico Reservas', en:'Reservations History Assistant', de:'Buchungshistorie-Assistent' },
  'ai.placeholder':    { es:'Escribe tu pregunta...', en:'Type your question...', de:'Schreiben Sie Ihre Frage...' },
  'ai.send':           { es:'Enviar', en:'Send', de:'Senden' },
  'ai.guide':          { es:'Gu\u00eda completa del Asistente IA', en:'Complete AI Assistant Guide', de:'Vollst\u00e4ndige KI-Assistenten-Anleitung' },
  'ai.guideDesc':      { es:'Todo lo que puedes hacer con el asistente, explicado con ejemplos reales.', en:'Everything you can do with the assistant, explained with real examples.', de:'Alles, was Sie mit dem Assistenten tun k\u00f6nnen, mit Beispielen erkl\u00e4rt.' },
  'ai.closeGuide':     { es:'Cerrar gu\u00eda', en:'Close guide', de:'Anleitung schlie\u00dfen' },

  // â€”â€”â€” Pagination â€”â€”â€”
  'pagination.showing': { es:'Mostrando', en:'Showing', de:'Zeige' },
  'pagination.of':     { es:'de', en:'of', de:'von' },
  'pagination.reservations': { es:'reservas', en:'reservations', de:'Buchungen' },
  'pagination.rowsPerPage': { es:'Filas/p\u00e1g:', en:'Rows/page:', de:'Zeilen/Seite:' },

  // â€”â€”â€” Preview / Print â€”â€”â€”
  'preview.show':      { es:'Se mostrar\u00e1 previsualizaci\u00f3n', en:'Preview will be shown', de:'Vorschau wird angezeigt' },
  'preview.direct':    { es:'Se imprimir\u00e1 directamente', en:'Will print directly', de:'Wird direkt gedruckt' },
  'preview.change':    { es:'Cambiar', en:'Change', de:'\u00c4ndern' },
  'preview.before':    { es:'Ver previsualizaci\u00f3n antes', en:'Show preview first', de:'Vorschau zuerst anzeigen' },
  'preview.dontAsk':   { es:'No preguntar m\u00e1s', en:'Don\u0027t ask again', de:'Nicht mehr fragen' },

  // â€”â€”â€” Language Selector â€”â€”â€”
  'lang.label':        { es:'Idioma', en:'Language', de:'Sprache' },

  // â€”â€”â€” Misc â€”â€”â€”
  'misc.clean':        { es:'Limpiar', en:'Clear', de:'L\u00f6schen' },
  'misc.close':        { es:'Cerrar', en:'Close', de:'Schlie\u00dfen' },
  'misc.clickToEditOwner': { es:'Clic para editar propietario', en:'Click to edit owner', de:'Klicken zum Bearbeiten des Eigent\u00fcmers' },
  'misc.changeUrl':    { es:'Cambiar URL', en:'Change URL', de:'URL \u00e4ndern' },
  'misc.removeDefault': { es:'Quitar por defecto', en:'Remove default', de:'Standard entfernen' },
  'misc.configValues': { es:'Configurar valores', en:'Configure values', de:'Werte konfigurieren' },
  'misc.showHideCols': { es:'Mostrar/ocultar columnas', en:'Show/hide columns', de:'Spalten ein-/ausblenden' },
  // â€”â€”â€” Columns (extra) â€”â€”â€”
  'col.comGtc':          { es:'Gesti\u00f3n<br>GTC', en:'GTC<br>Mgmt', de:'GTC<br>Verw.' },
  'col.conceptosEsp':    { es:'Conceptos<br>Esp.', en:'Special<br>Items', de:'Sonder-<br>posten' },
  'col.conceptosSinIVA': { es:'Conceptos<br>s/IVA', en:'Items<br>No VAT', de:'Posten<br>o.MwSt.' },


  // â€”â€”â€” Toast / Loading messages â€”â€”â€”
  'toast.googleNotInit':  { es:'Google API no inicializada. Recarga la p\u00e1gina.', en:'Google API not initialized. Reload the page.', de:'Google API nicht initialisiert. Seite neu laden.' },
  'toast.defaultUrlInvalid': { es:'La URL por defecto no es v\u00e1lida.', en:'Default URL is not valid.', de:'Standard-URL ist ung\u00fcltig.' },
  'toast.enterValidUrl':  { es:'Introduce una URL v\u00e1lida.', en:'Enter a valid URL.', de:'Geben Sie eine g\u00fcltige URL ein.' },
  'toast.invalidUrlSheets': { es:'URL no v\u00e1lida. Debe ser Google Sheets.', en:'Invalid URL. Must be Google Sheets.', de:'Ung\u00fcltige URL. Muss Google Sheets sein.' },
  'toast.loginFirst':     { es:'Inicia sesi\u00f3n con Google primero.', en:'Sign in with Google first.', de:'Melden Sie sich zuerst bei Google an.' },
  'toast.pasteUrl':       { es:'Pega la URL de la hoja de Google Sheets', en:'Paste the Google Sheets URL', de:'F\u00fcgen Sie die Google Sheets URL ein' },
  'toast.noDataSheets':   { es:'No se encontraron hojas de datos.', en:'No data sheets found.', de:'Keine Datenbl\u00e4tter gefunden.' },
  'toast.sheetEmpty':     { es:'La hoja est\u00e1 vac\u00eda o no tiene datos suficientes.', en:'The sheet is empty or has insufficient data.', de:'Das Blatt ist leer oder enth\u00e4lt nicht gen\u00fcgend Daten.' },
  'toast.errorLoadSheet': { es:'Error al cargar la hoja. Verifica acceso y URL.', en:'Error loading sheet. Check access and URL.', de:'Fehler beim Laden. Zugriff und URL pr\u00fcfen.' },
  'toast.errorReadData':  { es:'Error al leer datos. Comprueba los permisos.', en:'Error reading data. Check permissions.', de:'Fehler beim Lesen. Berechtigungen pr\u00fcfen.' },
  'toast.errorSaveGoogle': { es:'Error al guardar. \u00bfEst\u00e1s conectado a Google Sheets?', en:'Save error. Are you connected to Google Sheets?', de:'Speicherfehler. Mit Google Sheets verbunden?' },
  'toast.noHeaderId':     { es:'No se encontr\u00f3 la cabecera ID Reserva.', en:'Reservation ID header not found.', de:'Buchungs-ID-Kopfzeile nicht gefunden.' },
  'toast.invalidFile':    { es:'El archivo no contiene datos v\u00e1lidos.', en:'File does not contain valid data.', de:'Datei enth\u00e4lt keine g\u00fcltigen Daten.' },
  'toast.validPercent':   { es:'Porcentaje v\u00e1lido: 0-100', en:'Valid percentage: 0-100', de:'G\u00fcltiger Prozentsatz: 0-100' },
  'toast.alreadyExists':  { es:'Ya existe.', en:'Already exists.', de:'Existiert bereits.' },
  'toast.invalidValue':   { es:'Valor no v\u00e1lido.', en:'Invalid value.', de:'Ung\u00fcltiger Wert.' },
  'loading.reading':      { es:'Leyendo datos de', en:'Reading data from', de:'Lese Daten von' },
  'loading.processing':   { es:'Procesando %s filas...', en:'Processing %s rows...', de:'Verarbeite %s Zeilen...' },
  'loading.gettingInfo':  { es:'Obteniendo informaci\u00f3n de la hoja...', en:'Getting sheet information...', de:'Blattinformationen werden abgerufen...' },
  'sync.updated':         { es:'actualizado', en:'updated', de:'aktualisiert' },
  'sync.updatedPl':       { es:'actualizados', en:'updated', de:'aktualisiert' },
  'btn.addValue':         { es:'+ A\u00f1adir', en:'+ Add', de:'+ Hinzuf\u00fcgen' },


  'btn.sendEmail2':      { es:'&#9993; Enviar por Email', en:'&#9993; Send by Email', de:'&#9993; Per E-Mail senden' },
  'btn.validateFirst':   { es:'\u26a0 Valida todas las reservas primero', en:'\u26a0 Validate all reservations first', de:'\u26a0 Zuerst alle Buchungen validieren' },
  'sync.activateBtn':    { es:'Activar sincronizaci\u00f3n multi-usuario', en:'Activate multi-user sync', de:'Multi-User-Sync aktivieren' },


  // â€”â€”â€” Phase 2A: AI Assistant visible elements â€”â€”â€”
  'ai.subtitle':       { es:'Preg\u00fantame sobre tus reservas, liquidaciones, importes... Respondo solo con tus datos reales.', en:'Ask me about your reservations, settlements, amounts... I only answer with your real data.', de:'Fragen Sie mich zu Ihren Buchungen, Abrechnungen, Betr\u00e4gen... Ich antworte nur mit Ihren echten Daten.' },
  'ai.closeGuideBtn':  { es:'Cerrar gu\u00eda \u00d7', en:'Close guide \u00d7', de:'Anleitung schlie\u00dfen \u00d7' },
  'ai.chip.briefing':  { es:'\u26a1 Briefing', en:'\u26a1 Briefing', de:'\u26a1 Briefing' },
  'ai.chip.kpis':      { es:'\ud83d\udcca KPIs', en:'\ud83d\udcca KPIs', de:'\ud83d\udcca KPIs' },
  'ai.chip.owners':    { es:'\ud83d\udc65 Propietarios', en:'\ud83d\udc65 Owners', de:'\ud83d\udc65 Eigent\u00fcmer' },
  'ai.chip.heatmap':   { es:'\ud83d\uddfa\ufe0f Heatmap', en:'\ud83d\uddfa\ufe0f Heatmap', de:'\ud83d\uddfa\ufe0f Heatmap' },
  'ai.chip.duplicates': { es:'\ud83d\udd0d Duplicados', en:'\ud83d\udd0d Duplicates', de:'\ud83d\udd0d Duplikate' },
  'ai.chip.segments':  { es:'\ud83d\udcca Segmentos', en:'\ud83d\udcca Segments', de:'\ud83d\udcca Segmente' },
  'ai.chip.leadtime':  { es:'\u23f1\ufe0f Lead time', en:'\u23f1\ufe0f Lead time', de:'\u23f1\ufe0f Vorlaufzeit' },
  'ai.chip.whatif':    { es:'\ud83d\udd2e What-if', en:'\ud83d\udd2e What-if', de:'\ud83d\udd2e Was-w\u00e4re-wenn' },
  'ai.chip.export':    { es:'\ud83d\udce5 Exportar', en:'\ud83d\udce5 Export', de:'\ud83d\udce5 Exportieren' },
  'ai.chip.briefingQ': { es:'Briefing r\u00e1pido: dame lo m\u00e1s importante en 5 frases', en:'Quick briefing: give me the most important facts in 5 sentences', de:'Schnelles Briefing: gib mir das Wichtigste in 5 S\u00e4tzen' },
  'ai.chip.kpisQ':     { es:'Dame un resumen ejecutivo con KPIs principales: ADR, estancia media, comisi\u00f3n efectiva, margen propietario, top y bottom 5 pisos', en:'Give me an executive summary with main KPIs: ADR, average stay, effective commission, owner margin, top and bottom 5 properties', de:'Gib mir eine Zusammenfassung mit KPIs: ADR, durchschnittliche Aufenthaltsdauer, effektive Provision, Eigent\u00fcmermarge, Top und Bottom 5 Unterk\u00fcnfte' },
  'ai.chip.ownersQ':   { es:'Compara todos los propietarios con m\u00e9tricas detalladas por piso: ADR, margen, reservas, noches', en:'Compare all owners with detailed per-property metrics: ADR, margin, reservations, nights', de:'Vergleiche alle Eigent\u00fcmer mit detaillierten Kennzahlen pro Unterkunft: ADR, Marge, Buchungen, N\u00e4chte' },
  'ai.chip.heatmapQ':  { es:'Mapa de calor de ocupaci\u00f3n por alojamiento y mes con sparklines', en:'Occupancy heatmap by property and month with sparklines', de:'Belegungs-Heatmap nach Unterkunft und Monat mit Sparklines' },
  'ai.chip.duplicatesQ': { es:'\u00bfHay reservas duplicadas o con importes sospechosos? Busca anomal\u00edas', en:'Are there duplicate reservations or suspicious amounts? Look for anomalies', de:'Gibt es doppelte Buchungen oder verd\u00e4chtige Betr\u00e4ge? Suche nach Anomalien' },
  'ai.chip.segmentsQ': { es:'Segmentaci\u00f3n por tipo de estancia: escapadas, vacaciones y larga estancia, por plataforma', en:'Segmentation by stay type: getaways, vacations and long stays, by platform', de:'Segmentierung nach Aufenthaltsart: Kurzurlaub, Urlaub und Langzeitaufenthalt, nach Plattform' },
  'ai.chip.leadtimeQ': { es:'An\u00e1lisis de lead time: \u00bfcon cu\u00e1nta antelaci\u00f3n reservan por plataforma?', en:'Lead time analysis: how far in advance do they book by platform?', de:'Vorlaufzeit-Analyse: wie weit im Voraus wird pro Plattform gebucht?' },
  'ai.chip.whatifQ':   { es:'\u00bfQu\u00e9 pasar\u00eda si subimos el ADR un 10% en todos los pisos?', en:'What if we raise the ADR by 10% on all properties?', de:'Was w\u00e4re, wenn wir den ADR um 10% bei allen Unterk\u00fcnften erh\u00f6hen?' },
  'ai.chip.exportQ':   { es:'Quiero exportar datos a Excel. \u00bfQu\u00e9 opciones de descarga tengo disponibles?', en:'I want to export data to Excel. What download options are available?', de:'Ich m\u00f6chte Daten nach Excel exportieren. Welche Download-Optionen sind verf\u00fcgbar?' },
  'alert.lowAdr':      { es:'piso(s) con ADR < 50\u20ac/noche', en:'property(ies) with ADR < 50\u20ac/night', de:'Unterkunft(en) mit ADR < 50\u20ac/Nacht' },
  'alert.noReserv':    { es:'piso(s) sin reservas en el periodo', en:'property(ies) with no reservations in the period', de:'Unterkunft(en) ohne Buchungen im Zeitraum' },
  'alert.pendingVal':  { es:'reservas pendientes de validar', en:'reservations pending validation', de:'Buchungen ausstehend zur Validierung' },
  'alert.ofTotal':     { es:'del total', en:'of total', de:'der Gesamtzahl' },
  'alert.lowMargin':   { es:'piso(s) con margen < 30%', en:'property(ies) with margin < 30%', de:'Unterkunft(en) mit Marge < 30%' },
  'alert.duplicates':  { es:'posible(s) duplicado(s) detectados. Pregunta:', en:'possible duplicate(s) detected. Ask:', de:'m\u00f6gliche Duplikate erkannt. Fragen Sie:' },
  'alert.showDups':    { es:'\u00abmu\u00e9strame los duplicados\u00bb', en:'\u00abshow me the duplicates\u00bb', de:'\u00abzeig mir die Duplikate\u00bb' },
  'alert.andMore':     { es:'y %s m\u00e1s', en:'and %s more', de:'und %s mehr' },
  'alert.askMore':     { es:'Preg\u00fantame sobre cualquiera de estas alertas para m\u00e1s detalle.', en:'Ask me about any of these alerts for more detail.', de:'Fragen Sie mich zu diesen Warnungen f\u00fcr mehr Details.' },


  // â€”â€”â€” Follow-up suggestion labels & queries â€”â€”â€”
  'fu.worstAdr':      { es:'\ud83d\udcc9 Pisos peor ADR', en:'\ud83d\udcc9 Lowest ADR', de:'\ud83d\udcc9 Niedrigster ADR' },
  'fu.worstAdrQ':     { es:'\u00bfQu\u00e9 pisos tienen el ADR m\u00e1s bajo?', en:'Which properties have the lowest ADR?', de:'Welche Unterk\u00fcnfte haben den niedrigsten ADR?' },
  'fu.export':        { es:'\ud83d\udce5 Exportar', en:'\ud83d\udce5 Export', de:'\ud83d\udce5 Exportieren' },
  'fu.exportQ':       { es:'Exportar estos datos a Excel', en:'Export this data to Excel', de:'Diese Daten nach Excel exportieren' },
  'fu.owners':        { es:'\ud83d\udc65 Propietarios', en:'\ud83d\udc65 Owners', de:'\ud83d\udc65 Eigent\u00fcmer' },
  'fu.ownersQ':       { es:'Compara propietarios con m\u00e9tricas detalladas', en:'Compare owners with detailed metrics', de:'Eigent\u00fcmer mit Kennzahlen vergleichen' },
  'fu.simMinus':      { es:'\ud83d\udd2e Simular -2%', en:'\ud83d\udd2e Simulate -2%', de:'\ud83d\udd2e Simulieren -2%' },
  'fu.simMinusQ':     { es:'\u00bfQu\u00e9 pasar\u00eda si reducimos la comisi\u00f3n un 2%?', en:'What if we reduce commission by 2%?', de:'Was wenn wir die Provision um 2% senken?' },
  'fu.rankMargin':    { es:'\ud83d\udcc8 Ranking margen', en:'\ud83d\udcc8 Margin ranking', de:'\ud83d\udcc8 Marge-Ranking' },
  'fu.rankMarginQ':   { es:'Ranking de pisos por margen propietario', en:'Property ranking by owner margin', de:'Unterkunft-Ranking nach Eigent\u00fcmermarge' },
  'fu.leadtime':      { es:'\u23f1\ufe0f Lead time', en:'\u23f1\ufe0f Lead time', de:'\u23f1\ufe0f Vorlaufzeit' },
  'fu.leadtimeQ':     { es:'\u00bfQu\u00e9 plataforma tiene mejor lead time?', en:'Which platform has the best lead time?', de:'Welche Plattform hat die beste Vorlaufzeit?' },
  'fu.segments':      { es:'\ud83d\udcca Segmentos', en:'\ud83d\udcca Segments', de:'\ud83d\udcca Segmente' },
  'fu.segmentsQ':     { es:'Segmentaci\u00f3n de estancias por plataforma', en:'Stay segmentation by platform', de:'Aufenthaltssegmentierung nach Plattform' },
  'fu.heatmap':       { es:'\ud83d\uddfa\ufe0f Heatmap', en:'\ud83d\uddfa\ufe0f Heatmap', de:'\ud83d\uddfa\ufe0f Heatmap' },
  'fu.heatmapQ':      { es:'Mapa de calor de ocupaci\u00f3n por mes', en:'Occupancy heatmap by month', de:'Belegungs-Heatmap nach Monat' },
  'fu.duplicates':    { es:'\ud83d\udd0d Duplicados', en:'\ud83d\udd0d Duplicates', de:'\ud83d\udd0d Duplikate' },
  'fu.duplicatesQ':   { es:'\u00bfHay reservas duplicadas o sospechosas?', en:'Are there duplicate or suspicious reservations?', de:'Gibt es doppelte oder verd\u00e4chtige Buchungen?' },
  'fu.season':        { es:'\u2600\ufe0f Estacionalidad', en:'\u2600\ufe0f Seasonality', de:'\u2600\ufe0f Saisonalit\u00e4t' },
  'fu.seasonQ':       { es:'Estacionalidad por trimestre y plataforma', en:'Seasonality by quarter and platform', de:'Saisonalit\u00e4t nach Quartal und Plattform' },
  'fu.simPlus':       { es:'\ud83d\udd2e Simular +10%', en:'\ud83d\udd2e Simulate +10%', de:'\ud83d\udd2e Simulieren +10%' },
  'fu.simPlusQ':      { es:'\u00bfQu\u00e9 pasar\u00eda si subimos ADR un 10%?', en:'What if we raise ADR by 10%?', de:'Was wenn wir den ADR um 10% erh\u00f6hen?' },
  'fu.predict':       { es:'\ud83d\udd2e Predecir', en:'\ud83d\udd2e Predict', de:'\ud83d\udd2e Vorhersage' },
  'fu.predictQ':      { es:'Predicci\u00f3n de ocupaci\u00f3n futura', en:'Future occupancy prediction', de:'Zuk\u00fcnftige Belegungsprognose' },
  'fu.topGrowth':     { es:'\ud83d\udcc8 Top crecimiento', en:'\ud83d\udcc8 Top growth', de:'\ud83d\udcc8 Top Wachstum' },
  'fu.topGrowthQ':    { es:'Ranking de pisos con mayor crecimiento', en:'Property ranking by highest growth', de:'Unterkunft-Ranking nach h\u00f6chstem Wachstum' },
  'fu.segHigh':       { es:'\ud83c\udfd6\ufe0f Segmentar alta', en:'\ud83c\udfd6\ufe0f Segment high', de:'\ud83c\udfd6\ufe0f Hochsaison seg.' },
  'fu.segHighQ':      { es:'\u00bfQu\u00e9 tipo de estancia predomina en temporada alta?', en:'What stay type dominates in high season?', de:'Welcher Aufenthaltstyp dominiert in der Hochsaison?' },
  'fu.ltByStay':      { es:'\u23f1\ufe0f Lead time', en:'\u23f1\ufe0f Lead time', de:'\u23f1\ufe0f Vorlaufzeit' },
  'fu.ltByStayQ':     { es:'Lead time por tipo de estancia', en:'Lead time by stay type', de:'Vorlaufzeit nach Aufenthaltsart' },
  'fu.byProp':        { es:'\ud83c\udfe0 Por piso', en:'\ud83c\udfe0 By property', de:'\ud83c\udfe0 Nach Unterkunft' },
  'fu.byPropQ':       { es:'\u00bfQu\u00e9 pisos se reservan con m\u00e1s antelaci\u00f3n?', en:'Which properties are booked furthest in advance?', de:'Welche Unterk\u00fcnfte werden am weitesten im Voraus gebucht?' },
  'fu.kpis':          { es:'\ud83d\udcca KPIs', en:'\ud83d\udcca KPIs', de:'\ud83d\udcca KPIs' },
  'fu.kpisQ':         { es:'Resumen ejecutivo con KPIs', en:'Executive summary with KPIs', de:'Zusammenfassung mit KPIs' },
  'fu.realComm':      { es:'\ud83d\udcb0 Comisiones reales', en:'\ud83d\udcb0 Real commissions', de:'\ud83d\udcb0 Echte Provisionen' },
  'fu.realCommQ':     { es:'Desglose real de comisiones por plataforma', en:'Real commission breakdown by platform', de:'Echte Provisionsaufschl\u00fcsselung nach Plattform' },
  'fu.kpiDetail':     { es:'\ud83d\udcca KPIs detallados', en:'\ud83d\udcca Detailed KPIs', de:'\ud83d\udcca Detaillierte KPIs' },
  'fu.kpiDetailQ':    { es:'Dame m\u00e1s detalle con KPIs completos', en:'Give me more detail with complete KPIs', de:'Gib mir mehr Details mit vollst\u00e4ndigen KPIs' },
  'fu.anomalies':     { es:'\u26a0\ufe0f Anomal\u00edas', en:'\u26a0\ufe0f Anomalies', de:'\u26a0\ufe0f Anomalien' },
  'fu.anomaliesQ':    { es:'\u00bfHay algo an\u00f3malo que deba revisar?', en:'Is there anything anomalous I should review?', de:'Gibt es Anomalien, die ich pr\u00fcfen sollte?' },


  'ai.apiKeyPrompt':  { es:'Introduce tu API Key de Anthropic para activar el asistente IA.\n\nLa clave se guarda localmente en tu navegador y nunca se comparte.\n\nPuedes obtenerla en: console.anthropic.com', en:'Enter your Anthropic API Key to activate the AI assistant.\n\nThe key is stored locally in your browser and never shared.\n\nGet it at: console.anthropic.com', de:'Geben Sie Ihren Anthropic API-Schl\u00fcssel ein, um den KI-Assistenten zu aktivieren.\n\nDer Schl\u00fcssel wird lokal in Ihrem Browser gespeichert und nie weitergegeben.\n\nErhalten Sie ihn unter: console.anthropic.com' },
  'ai.rateLimit':     { es:'\u23f3 L\u00edmite de API alcanzado. Reintentando en %ss...', en:'\u23f3 API rate limit reached. Retrying in %ss...', de:'\u23f3 API-Limit erreicht. Erneuter Versuch in %ss...' },
  'ai.errorPrefix':   { es:'Error: ', en:'Error: ', de:'Fehler: ' },
  'ai.errorGeneric':  { es:'Error al comunicarse con la IA', en:'Error communicating with AI', de:'Fehler bei der KI-Kommunikation' },


  'ai.loadFirst':     { es:'Primero carga las reservas desde Google Sheets o Excel para poder responder preguntas.', en:'First load the reservations from Google Sheets or Excel to be able to answer questions.', de:'Laden Sie zuerst die Buchungen von Google Sheets oder Excel, um Fragen beantworten zu k\u00f6nnen.' },
  'ai.helpBtn':       { es:'L\u00e9eme / Ayuda', en:'Read me / Help', de:'Lies mich / Hilfe' },
  'ai.invalidKey':    { es:'API Key inv\u00e1lida. Se ha borrado. Vuelve a intentarlo.', en:'Invalid API Key. It has been deleted. Please try again.', de:'Ung\u00fcltiger API-Schl\u00fcssel. Er wurde gel\u00f6scht. Bitte versuchen Sie es erneut.' },


  // â€”â€”â€” CE panels, buttons, consol detail â€”â€”â€”
  'ce.placeholderPet': { es:'E.g.: Pet...', en:'E.g.: Pet...', de:'Z.B.: Haustier...' },
  'ce.placeholderRep': { es:'E.g.: Repair...', en:'E.g.: Repair...', de:'Z.B.: Reparatur...' },


  // â€”â€”â€” Email modal â€”â€”â€”



  // â€”â€”â€” Phase 1: Missing visible translations â€”â€”â€”
  'stats.filtered':       { es:'filtradas', en:'filtered', de:'gefiltert' },
  'stats.filteredOf':     { es:'filtradas', en:'filtered', de:'gefiltert' },
  'stats.reservationCount': { es:'reservas', en:'reservations', de:'Buchungen' },
  'btn.validateAll':      { es:'Validar todas', en:'Validate all', de:'Alle validieren' },
  'btn.validatePending':  { es:'Validar pendientes', en:'Validate pending', de:'Ausstehende validieren' },
  'btn.unvalidateAll':    { es:'Desvalidar todas', en:'Unvalidate all', de:'Alle devalidieren' },
  'btn.unvalidateValidated': { es:'Desvalidar validadas', en:'Unvalidate validated', de:'Validierte devalidieren' },
  'consol.reservations':  { es:'Reservas', en:'Reservations', de:'Buchungen' },
  'consol.billing':       { es:'Facturaci\u00f3n', en:'Billing', de:'Rechnungsbetrag' },
  'consol.toSettle':      { es:'A Liquidar', en:'To Settle', de:'Abzurechnen' },
  'filter.clearDate':     { es:'\u00d7 Quitar filtro de fecha', en:'\u00d7 Clear date filter', de:'\u00d7 Datumsfilter entfernen' },
  'filter.allMonths':     { es:'Todos los meses', en:'All months', de:'Alle Monate' },
  'filter.allStatuses2':  { es:'Todos los estados', en:'All statuses', de:'Alle Status' },
  'sort.originalOrder':   { es:'Orden original', en:'Original order', de:'Originalreihenfolge' },
  'sort.nameAsc':         { es:'Nombre A\u2191Z', en:'Name A\u2191Z', de:'Name A\u2191Z' },
  'sync.on':              { es:'Sync ON', en:'Sync ON', de:'Sync AN' },
  'sync.off':             { es:'Sync OFF', en:'Sync OFF', de:'Sync AUS' },
  'sync.activeTitle':     { es:'Sincronizaci\u00f3n multi-usuario activa', en:'Multi-user sync active', de:'Multi-User-Sync aktiv' },
  'sync.activateTitle':   { es:'Activar sincronizaci\u00f3n multi-usuario', en:'Activate multi-user sync', de:'Multi-User-Sync aktivieren' },
  'save.saving':          { es:'Guardando...', en:'Saving...', de:'Speichern...' },
  'save.saved':           { es:'Guardado', en:'Saved', de:'Gespeichert' },
  'save.error':           { es:'Error al guardar', en:'Save error', de:'Speicherfehler' },
  'save.synced':          { es:'Sincronizado', en:'Synced', de:'Synchronisiert' },
  'liq.totalToSettleFull': { es:'Total a Liquidar', en:'Total to Settle', de:'Gesamt abzurechnen' },
  'liq.generateBtn':      { es:'\ud83d\udda8 Generar Liquidaci\u00f3n', en:'\ud83d\udda8 Generate Settlement', de:'\ud83d\udda8 Abrechnung erstellen' },
  'liq.paymentGateway':   { es:'Pasarela de pago', en:'Payment gateway', de:'Zahlungsgateway' },
  'liq.irpfWithholding':  { es:'Retenci\u00f3n IRPF', en:'IRPF Withholding', de:'IRPF-Einbehalt' },
  'liq.ownerReceives':    { es:'Propietario recibe', en:'Owner receives', de:'Eigent\u00fcmer erh\u00e4lt' },
  'liq.propietario':      { es:'Propietario', en:'Owner', de:'Eigent\u00fcmer' },
  'consol.summary2':      { es:'Resumen Consolidado', en:'Consolidated Summary', de:'Konsolidierte \u00dcbersicht' },
  'consol.numReservationsLabel': { es:'N\u00ba Reservas', en:'Reservations', de:'Buchungen' },
  'consol.dates':         { es:'Fechas', en:'Dates', de:'Daten' },
  'alert.detected':       { es:'\ud83d\udd0d Alertas detectadas:', en:'\ud83d\udd0d Alerts detected:', de:'\ud83d\udd0d Erkannte Warnungen:' },
  'ce.specialConcepts':   { es:'Conceptos especiales (IVA inc.)', en:'Special concepts (VAT inc.)', de:'Sonderposten (MwSt. inkl.)' },
  'ce2.specialConcepts':  { es:'Conceptos especiales (Sin IVA)', en:'Special concepts (No VAT)', de:'Sonderposten (ohne MwSt.)' },
  'config.newValue':      { es:'Nuevo valor', en:'New value', de:'Neuer Wert' },
  'confirm.validateAll':  { es:'\u00bfValidar %s reserva(s)?', en:'Validate %s reservation(s)?', de:'%s Buchung(en) validieren?' },
  'confirm.unvalidateAll': { es:'\u00bfDesvalidar %s reserva(s)?', en:'Unvalidate %s reservation(s)?', de:'%s Buchung(en) devalidieren?' },
  'confirm.validateConsol': { es:'\u00bfValidar %s reserva(s) de %s?', en:'Validate %s reservation(s) from %s?', de:'%s Buchung(en) von %s validieren?' },
  'pager.of':             { es:'de', en:'of', de:'von' },

  'pdf.errorGenerate': { es:'Error al generar PDF: ', en:'Error generating PDF: ', de:'Fehler beim PDF-Erstellen: ' },
  'pdf.generating':    { es:'Generando...', en:'Generating...', de:'Wird erstellt...' },
  'pdf.generatingWait':{ es:'Generando PDF, espera un momento...', en:'Generating PDF, please wait...', de:'PDF wird erstellt, bitte warten...' },
  'pdf.errorRead':     { es:'Error al leer el archivo PDF', en:'Error reading PDF file', de:'Fehler beim Lesen der PDF-Datei' },
  // â€”â€”â€” v2.24.0: CE panels â€”â€”â€”
  'ce.title':          { es:'\u26a0 Conceptos especiales', en:'\u26a0 Special Concepts', de:'\u26a0 Sonderposten' },
  'ce.internalOnly':   { es:'\ud83d\udc41 Solo uso interno', en:'\ud83d\udc41 Internal use only', de:'\ud83d\udc41 Nur intern' },
  'ce.addItem':        { es:'+ A\u00f1adir concepto', en:'+ Add concept', de:'+ Posten hinzuf\u00fcgen' },
  'ce.totalReserva':   { es:'Total Reserva', en:'Total Booking', de:'Buchungssumme' },
  'ce.ivaInc':         { es:'(IVA inc.)', en:'(VAT inc.)', de:'(inkl. MwSt.)' },
  'ce.deduct':         { es:'Descontar', en:'Deduct', de:'Abzug' },
  'ce.totalSinCE':     { es:'Total sin C.E.', en:'Total w/o S.C.', de:'Summe ohne S.P.' },
  'ce.sinIVA':         { es:'(sin IVA)', en:'(w/o VAT)', de:'(ohne MwSt.)' },
  'ce.placeholder':    { es:'Ej: Mascota...', en:'E.g.: Pet...', de:'Z.B.: Haustier...' },
  'ce2.title':         { es:'\u26a0 Conceptos especiales (Sin IVA)', en:'\u26a0 Special Concepts (No VAT)', de:'\u26a0 Sonderposten (ohne MwSt.)' },
  'ce2.subtractSub':   { es:'\ud83d\udc41 Resta al subtotal', en:'\ud83d\udc41 Deducted from subtotal', de:'\ud83d\udc41 Vom Zwischensumme abgezogen' },
  'ce2.subBefore':     { es:'Subtotal', en:'Subtotal', de:'Zwischensumme' },
  'ce2.beforeCE':      { es:'antes de C.E.', en:'before S.C.', de:'vor S.P.' },
  'ce2.deductNoVat':   { es:'Descontar', en:'Deduct', de:'Abzug' },
  'ce2.subFinal':      { es:'Subtotal', en:'Subtotal', de:'Zwischensumme' },
  'ce2.final':         { es:'final', en:'final', de:'Endwert' },
  'ce2.placeholder':   { es:'Ej: Reparaci\u00f3n...', en:'E.g.: Repair...', de:'Z.B.: Reparatur...' },
  'cex.placeholder':   { es:'Concepto...', en:'Concept...', de:'Posten...' },
  // â€”â€”â€” v2.24.0: Buttons â€”â€”â€”
  'btn.downloadPdfLiq': { es:'Descargar PDF', en:'Download PDF', de:'PDF herunterladen' },
  'btn.sendEmailLiq':  { es:'Enviar por Email', en:'Send by Email', de:'Per E-Mail senden' },
  // â€”â€”â€” v2.24.0: Maintenance â€”â€”â€”
  'liq.maintenance':   { es:'Mantenimiento', en:'Maintenance', de:'Instandhaltung' },
  'liq.maintenanceMonthly': { es:'Mantenimiento mensual', en:'Monthly maintenance', de:'Monatliche Instandhaltung' },
  'liq.maintenanceDesc': { es:'Importe base (+ 21% IVA) por liquidaci\u00f3n', en:'Base amount (+ 21% VAT) per settlement', de:'Grundbetrag (+ 21% MwSt.) pro Abrechnung' },
  // â€”â€”â€” v2.24.0: Email modal â€”â€”â€”
  'email.title':       { es:'\u2709 Enviar Liquidaci\u00f3n por Email', en:'\u2709 Send Settlement by Email', de:'\u2709 Abrechnung per E-Mail senden' },
  'email.recipient':   { es:'Destinatario', en:'Recipient', de:'Empf\u00e4nger' },
  'email.ccLabel':     { es:'CC \u2014 copia (opcional, separar con comas)', en:'CC \u2014 copy (optional, comma-separated)', de:'CC \u2014 Kopie (optional, kommagetrennt)' },
  'email.ccPlaceholder': { es:'copia1@ejemplo.com, copia2@ejemplo.com', en:'copy1@example.com, copy2@example.com', de:'kopie1@beispiel.com, kopie2@beispiel.com' },
  'email.subject':     { es:'Asunto', en:'Subject', de:'Betreff' },
  'email.extraMsg':    { es:'Mensaje adicional (opcional)', en:'Additional message (optional)', de:'Zus\u00e4tzliche Nachricht (optional)' },
  'email.extraPlaceholder': { es:'A\u00f1ade un mensaje personalizado...', en:'Add a personalized message...', de:'Pers\u00f6nliche Nachricht hinzuf\u00fcgen...' },
  'email.langLabel':   { es:'Idioma del email y PDF', en:'Email & PDF language', de:'E-Mail- & PDF-Sprache' },
  'email.langEs':      { es:'Espa\u00f1ol', en:'Spanish', de:'Spanisch' },
  'email.langEn':      { es:'English', en:'English', de:'Englisch' },
  'email.langDe':      { es:'Deutsch', en:'German', de:'Deutsch' },
  'doc.langLabel':     { es:'Idioma documento', en:'Document language', de:'Dokumentsprache' },
  'email.saveAddr':    { es:'Guardar email del propietario', en:'Save owner email', de:'E-Mail des Eigent\u00fcmers speichern' },
  'email.cancel':      { es:'Cancelar', en:'Cancel', de:'Abbrechen' },
  'email.send':        { es:'Enviar \u25b6', en:'Send \u25b6', de:'Senden \u25b6' },
  'email.toPlaceholder': { es:'email@ejemplo.com, otro@ejemplo.com', en:'email@example.com, other@example.com', de:'email@beispiel.com, andere@beispiel.com' },
  'email.sending':     { es:'\u23f3 Enviando email a %s...', en:'\u23f3 Sending email to %s...', de:'\u23f3 E-Mail wird an %s gesendet...' },
  'email.sendingBtn':  { es:'Enviando...', en:'Sending...', de:'Wird gesendet...' },
  'email.sentBtn':     { es:'\u00a1Enviado! \u2714', en:'Sent! \u2714', de:'Gesendet! \u2714' },
  'email.errorSend':   { es:'Error al enviar el email: ', en:'Error sending email: ', de:'Fehler beim E-Mail-Versand: ' },
  // â€”â€”â€” v2.24.0: Liquidation detail (replaces _en? ternary) â€”â€”â€”
  'liq.totalResIva':   { es:'Total Reserva (IVA incluido)', en:'Total Booking (VAT included)', de:'Buchungssumme (inkl. MwSt.)' },
  'liq.ivaReserva':    { es:'IVA Reserva', en:'Booking VAT', de:'Buchungs-MwSt.' },
  'liq.baseExclVat':   { es:'Base sin IVA', en:'Base excl. VAT', de:'Nettobetrag' },
  'liq.salesChannel':  { es:'Canal de Venta', en:'Sales Channel', de:'Vertriebskanal' },
  'liq.gtcMgmt':       { es:'Gesti\u00f3n GTC', en:'GTC Management', de:'GTC-Verwaltung' },
  'liq.cleaning':      { es:'Limpieza', en:'Cleaning', de:'Reinigung' },
  'liq.paymentGw':     { es:'Pasarela de pago', en:'Payment Gateway', de:'Zahlungsabwicklung' },
  'liq.ceNoVat':       { es:'C.E. Sin IVA: ', en:'S.C. excl. VAT: ', de:'S.P. ohne MwSt.: ' },
  'liq.unnamed':       { es:'Sin nombre', en:'Unnamed', de:'Ohne Bezeichnung' },
  'liq.subtotal':      { es:'Subtotal', en:'Subtotal', de:'Zwischensumme' },
  'liq.irpfWithhold':  { es:'Retenci\u00f3n IRPF', en:'IRPF Withholding', de:'IRPF-Einbehalt' },
  'liq.vatOnSub':      { es:'IVA del Subtotal', en:'VAT on Subtotal', de:'MwSt. auf Zwischensumme' },
  'liq.settlement':    { es:'Liquidaci\u00f3n', en:'Settlement', de:'Abrechnung' },
  'liq.period':        { es:'Per\u00edodo', en:'Period', de:'Zeitraum' },
  'liq.of':            { es:'de', en:'of', de:'von' },
  'liq.property':      { es:'Alojamiento', en:'Property', de:'Unterkunft' },
  'liq.dates':         { es:'Fechas', en:'Dates', de:'Zeitraum' },
  'liq.bookingId':     { es:'ID Reserva', en:'Booking ID', de:'Buchungs-ID' },
  'liq.reference':     { es:'Localizador', en:'Reference', de:'Referenznr.' },
  'liq.building':      { es:'Edificio', en:'Building', de:'Geb\u00e4ude' },
  'liq.totalSettle':   { es:'Total a liquidar', en:'Total Settlement', de:'Abrechnungssumme' },
  'liq.monthlySettle': { es:'Liquidaci\u00f3n mensual', en:'Monthly settlement', de:'Monatsabrechnung' },
  'liq.gtcRetains':    { es:'GTC retiene', en:'GTC retains', de:'GTC beh\u00e4lt' },
  'liq.ownerLabel':    { es:'Propietario', en:'Owner', de:'Eigent\u00fcmer' },
  'liq.consolSummary': { es:'Resumen consolidado', en:'Consolidated Summary', de:'Zusammenfassung' },
  'liq.reservations':  { es:'reservas', en:'reservations', de:'Buchungen' },
  'liq.numReserv':     { es:'N\u00ba Reservas', en:'Reservations', de:'Buchungen' },
  'liq.resSub':        { es:'Subtotal Reservas', en:'Reservations Subtotal', de:'Buchungs-Zwischensumme' },
  'liq.monthFinalSub': { es:'Subtotal Final Mes', en:'Monthly Final Subtotal', de:'Monats-Endsumme' },
  'liq.vat':           { es:'IVA', en:'VAT', de:'MwSt.' },
  'liq.consolLabel':   { es:'Resumen consolidado', en:'Consolidated summary', de:'Zusammenfassung' },
  'liq.ownerSuffix':   { es:' \u2014 Propietario', en:' \u2014 Owner', de:' \u2014 Eigent\u00fcmer' },
  // â€”â€”â€” v2.24.0: Config modal â€”â€”â€”
  'cfg.pasarelaStripe': { es:'Pasarela Stripe', en:'Stripe Gateway', de:'Stripe-Zahlungsabwicklung' },
  'cfg.pasarelaDesc':  { es:'Plataformas distintas de Booking', en:'Platforms other than Booking', de:'Plattformen au\u00dfer Booking' },
  // â€”â€”â€” v2.24.0: Messages â€”â€”â€”
  'msg.noHeader':      { es:'No se encontr\u00f3 la cabecera ID Reserva.', en:'Header row ID Reserva not found.', de:'Kopfzeile ID Reserva nicht gefunden.' },
  'msg.noGtcAlojs':    { es:'No hay alojamientos GTC configurados.', en:'No GTC properties configured.', de:'Keine GTC-Unterk\u00fcnfte konfiguriert.' },
  'msg.noData':        { es:'No hay datos cargados.', en:'No data loaded.', de:'Keine Daten geladen.' },
  // â€”â€”â€” v2.24.0: CSV export headers â€”â€”â€”
  'csv.property':      { es:'Alojamiento', en:'Property', de:'Unterkunft' },
  'csv.reservations':  { es:'Reservas', en:'Reservations', de:'Buchungen' },
  'csv.nights':        { es:'Noches', en:'Nights', de:'N\u00e4chte' },
  'csv.adr':           { es:'ADR (EUR/noche)', en:'ADR (EUR/night)', de:'ADR (EUR/Nacht)' },
  'csv.totalAmount':   { es:'Importe Total', en:'Total Amount', de:'Gesamtbetrag' },
  'csv.settlement':    { es:'Liquidaci\u00f3n', en:'Settlement', de:'Abrechnung' },
  'csv.margin':        { es:'Margen %', en:'Margin %', de:'Marge %' },
  'csv.owner':         { es:'Propietario', en:'Owner', de:'Eigent\u00fcmer' },
  'csv.units':         { es:'Pisos', en:'Units', de:'Einheiten' },
  'csv.amount':        { es:'Importe', en:'Amount', de:'Betrag' },
  'csv.month':         { es:'Mes', en:'Month', de:'Monat' },
  'csv.platform':      { es:'Plataforma', en:'Platform', de:'Plattform' },
  'csv.channelCom':    { es:'Com. Canal', en:'Channel Com.', de:'Kanal-Prov.' },
  'csv.gatewayCom':    { es:'Com. Pasarela', en:'Gateway Com.', de:'Zahlungs-Prov.' },
  'csv.effectivePct':  { es:'Com. Efectiva %', en:'Effective Com. %', de:'Effektive Prov. %' },
  'csv.id':            { es:'ID', en:'ID', de:'ID' },
  'csv.locator':       { es:'Localizador', en:'Reference', de:'Referenznr.' },
  'csv.client':        { es:'Cliente', en:'Client', de:'Kunde' },
  'csv.checkIn':       { es:'Entrada', en:'Check-in', de:'Anreise' },
  'csv.checkOut':      { es:'Salida', en:'Check-out', de:'Abreise' },
  'csv.channelComFull':{ es:'ComCanal', en:'ChannelCom', de:'KanalProv' },
  'csv.gatewayComFull':{ es:'ComPasarela', en:'GatewayCom', de:'ZahlProv' },
  'csv.gtcComFull':    { es:'ComGTC', en:'GTCCom', de:'GTCProv' },
  'csv.cleaningFull':  { es:'Limpieza', en:'Cleaning', de:'Reinigung' },
  'csv.subtotalFull':  { es:'Subtotal', en:'Subtotal', de:'Zwischensumme' },
  'csv.totalLiq':      { es:'TotalLiq', en:'TotalSettle', de:'GesamtAbr' },
  'csv.status':        { es:'Estado', en:'Status', de:'Status' },
  'csv.validated':     { es:'Validada', en:'Validated', de:'Validiert' },
  'csv.pending':       { es:'Pendiente', en:'Pending', de:'Ausstehend' },

  // === INVOICING ===
  'inv.tabTitle':       { es:'Facturaci\u00f3n', en:'Invoicing', de:'Rechnungsstellung' },
  'inv.holdedTitle':    { es:'Holded API', en:'Holded API', de:'Holded API' },
  'inv.holdedDesc':     { es:'Clave API para sincronizar contactos y crear facturas en Holded.', en:'API key to sync contacts and create invoices in Holded.', de:'API-Schl\u00fcssel zum Synchronisieren von Kontakten und Erstellen von Rechnungen in Holded.' },
  'inv.holdedPlaceholder': { es:'Introduce tu API key de Holded', en:'Enter your Holded API key', de:'Holded API-Schl\u00fcssel eingeben' },
  'inv.save':           { es:'Guardar', en:'Save', de:'Speichern' },
  'inv.apiConfigured':  { es:'API key configurada', en:'API key configured', de:'API-Schl\u00fcssel konfiguriert' },
  'inv.apiPending':     { es:'Sin configurar', en:'Not configured', de:'Nicht konfiguriert' },
  'inv.apiSaved':       { es:'API key guardada', en:'API key saved', de:'API-Schl\u00fcssel gespeichert' },
  'inv.apiRemoved':     { es:'API key eliminada', en:'API key removed', de:'API-Schl\u00fcssel entfernt' },
  'inv.companiesTitle': { es:'Empresas receptoras de factura', en:'Invoice recipient companies', de:'Rechnungsempf\u00e4nger' },
  'inv.companiesDesc':  { es:'Empresas que reciben las facturas de los propietarios.', en:'Companies that receive invoices from property owners.', de:'Unternehmen, die Rechnungen von Eigent\u00fcmern erhalten.' },
  'inv.edit':           { es:'Editar', en:'Edit', de:'Bearbeiten' },
  'inv.address':        { es:'Direcci\u00f3n', en:'Address', de:'Adresse' },
  'inv.addCompany':     { es:'+ A\u00f1adir empresa', en:'+ Add company', de:'+ Firma hinzuf\u00fcgen' },
  'inv.alojTitle':      { es:'Facturaci\u00f3n por alojamiento', en:'Invoicing per property', de:'Rechnungsstellung pro Unterkunft' },
  'inv.alojDesc':       { es:'Activa la generaci\u00f3n de factura para cada alojamiento y selecciona la empresa receptora.', en:'Enable invoice generation per property and select the recipient company.', de:'Rechnungserstellung pro Unterkunft aktivieren und Empf\u00e4ngerunternehmen w\u00e4hlen.' },
  'inv.noData':         { es:'Carga datos para ver los alojamientos disponibles.', en:'Load data to see available properties.', de:'Daten laden, um verf\u00fcgbare Unterk\u00fcnfte zu sehen.' },
  'inv.activeCount':    { es:'con facturaci\u00f3n activa', en:'with active invoicing', de:'mit aktiver Rechnungsstellung' },
  'inv.of':             { es:'de', en:'of', de:'von' },
  'inv.companyName':    { es:'Raz\u00f3n social', en:'Company name', de:'Firmenname' },
  'inv.companyCif':     { es:'CIF', en:'Tax ID', de:'Steuernummer' },
  'inv.companyAddr':    { es:'Direcci\u00f3n fiscal', en:'Fiscal address', de:'Steueradresse' },
  'inv.companyUpdated': { es:'Empresa actualizada', en:'Company updated', de:'Firma aktualisiert' },
  'cfg.8020sold':        { es:'vendidos (80/20 activo)', en:'sold (80/20 active)', de:'verkauft (80/20 aktiv)' },

  'cfg.platCommDesc':    { es:'% sobre total reserva (IVA incl.)', en:'% of total booking (VAT incl.)', de:'% der Gesamtbuchung (inkl. MwSt.)' },
  'cfg.pasarelaBooking': { es:'Pasarela Booking', en:'Booking Gateway', de:'Booking Zahlungs-Gateway' },
  'cfg.pasarelaBookDesc':{ es:'Solo para Booking.com', en:'Booking.com only', de:'Nur f\u00fcr Booking.com' },
  'cfg.gestionGtc':      { es:'Gesti\u00f3n GTC', en:'GTC Management', de:'GTC Verwaltung' },
  'cfg.gestionGtcDesc':  { es:'% sobre base sin IVA', en:'% of base excl. VAT', de:'% der Basis ohne MwSt.' },
  'cfg.limpieza':        { es:'Limpieza', en:'Cleaning', de:'Reinigung' },
  'cfg.limpiezaDesc':    { es:'\u20ac sin IVA', en:'\u20ac excl. VAT', de:'\u20ac ohne MwSt.' },
  'cfg.amenities':       { es:'Amenities', en:'Amenities', de:'Ausstattung' },
  'cfg.amenitiesDesc':   { es:'Coste fijo por reserva en \u20ac', en:'Fixed cost per booking in \u20ac', de:'Fixkosten pro Buchung in \u20ac' },
  'cfg.irpfTitle':       { es:'Retenci\u00f3n IRPF', en:'IRPF Withholding', de:'IRPF-Einbehaltung' },
  'cfg.irpfDesc':        { es:'Porcentaje', en:'Percentage', de:'Prozentsatz' },

  'inv.searchPlaceholder': { es:'Buscar alojamiento o propietario...', en:'Search property or owner...', de:'Unterkunft oder Eigent\u00fcmer suchen...' },
  'nav.configLabel':      { es:'Configuraci\u00f3n', en:'Settings', de:'Einstellungen' },
  'cfg.platDesc':         { es:'Comisiones por plataforma de reserva (% sobre total IVA incl.).', en:'Booking platform commissions (% of total incl. VAT).', de:'Buchungsplattform-Provisionen (% des Gesamtbetrags inkl. MwSt.).' },
  'cfg.otrosDesc':        { es:'Valores de gesti\u00f3n, limpieza, amenities y mantenimiento mensual.', en:'Management, cleaning, amenities and monthly maintenance values.', de:'Management-, Reinigungs-, Amenities- und monatliche Wartungswerte.' },
  'cfg.pasarelaDesc':     { es:'Comisiones de pasarela por m\u00e9todo de pago.', en:'Payment gateway commissions by method.', de:'Zahlungs-Gateway-Provisionen nach Methode.' },
  'cfg.impuestosDesc':    { es:'Retenci\u00f3n IRPF aplicable a las liquidaciones.', en:'IRPF withholding applicable to settlements.', de:'IRPF-Einbehaltung f\u00fcr Abrechnungen.' },
  'cfg.8020Desc':         { es:'Alojamientos propiedad GTC vendidos: el propietario recibe el 80% del Subtotal.', en:'GTC-owned sold properties: owner receives 80% of Subtotal.', de:'Verkaufte GTC-eigene Unterk\u00fcnfte: Eigent\u00fcmer erh\u00e4lt 80% der Zwischensumme.' },
  'cfg.invoicingDesc':    { es:'Configuraci\u00f3n de facturaci\u00f3n, empresas receptoras e integraci\u00f3n con Holded.', en:'Invoicing configuration, recipient companies and Holded integration.', de:'Rechnungskonfiguration, Empf\u00e4ngerunternehmen und Holded-Integration.' },

  'inv.companyAdded':   { es:'Empresa a\u00f1adida', en:'Company added', de:'Firma hinzugef\u00fcgt' },

  // Holded Sync (F2)
  'inv.syncTitle':      { es:'Sincronizaci\u00f3n Holded', en:'Holded Sync', de:'Holded-Synchronisierung' },
  'inv.syncDesc':       { es:'Descarga contactos de Holded y los vincula autom\u00e1ticamente a los propietarios de cada alojamiento.', en:'Download contacts from Holded and auto-match them to property owners.', de:'Kontakte aus Holded herunterladen und automatisch den Eigent\u00fcmern zuordnen.' },
  'inv.syncNeedKey':    { es:'Configura la API key de Holded para activar la sincronizaci\u00f3n.', en:'Configure the Holded API key to enable sync.', de:'Holded API-Schl\u00fcssel konfigurieren, um die Synchronisierung zu aktivieren.' },
  'inv.syncNow':        { es:'Sincronizar ahora', en:'Sync now', de:'Jetzt synchronisieren' },
  'inv.syncing':        { es:'Sincronizando\u2026', en:'Syncing\u2026', de:'Synchronisierung\u2026' },
  'inv.syncLast':       { es:'\u00daltima sincronizaci\u00f3n', en:'Last sync', de:'Letzte Synchronisierung' },
  'inv.syncStarted':    { es:'Conectando con Holded\u2026', en:'Connecting to Holded\u2026', de:'Verbindung zu Holded\u2026' },
  'inv.syncDone':       { es:'Sincronizaci\u00f3n completada: %c contactos, %m nuevos v\u00ednculos', en:'Sync complete: %c contacts, %m new matches', de:'Synchronisierung abgeschlossen: %c Kontakte, %m neue Zuordnungen' },
  'inv.syncError':      { es:'Error de sincronizaci\u00f3n', en:'Sync error', de:'Synchronisierungsfehler' },
  'inv.syncAuthError':  { es:'API key inv\u00e1lida o sin permisos', en:'Invalid API key or no permissions', de:'Ung\u00fcltiger API-Schl\u00fcssel oder keine Berechtigung' },
  'inv.syncContacts':   { es:' contactos en Holded', en:' contacts in Holded', de:' Kontakte in Holded' },
  'inv.syncMatched':    { es:' vinculados', en:' matched', de:' zugeordnet' },
  'inv.syncUnmatched':  { es:' sin vincular', en:' unmatched', de:' nicht zugeordnet' },
  'inv.syncMapping':    { es:'Vinculaci\u00f3n propietario \u2194 contacto Holded', en:'Owner \u2194 Holded contact mapping', de:'Eigent\u00fcmer \u2194 Holded-Kontakt Zuordnung' },
  'inv.syncAssign':     { es:'Asignar contacto', en:'Assign contact', de:'Kontakt zuweisen' },
  'inv.syncAssigned':   { es:'%a vinculado a %c', en:'%a linked to %c', de:'%a verkn\u00fcpft mit %c' },
  'inv.syncClear':      { es:'Desvincular', en:'Unlink', de:'Verkn\u00fcpfung l\u00f6sen' },
  'inv.syncNoMatch':    { es:'Sin contacto Holded vinculado', en:'No Holded contact linked', de:'Kein Holded-Kontakt verkn\u00fcpft' },
  'inv.syncToAssign':   { es:'Sincroniza para asignar', en:'Sync to assign', de:'Synchronisieren zum Zuweisen' },

  // Invoice generation (F3)
  'inv.invoiceTitle':   { es:'FACTURA', en:'INVOICE', de:'RECHNUNG' },
  'inv.invoiceNum':     { es:'N\u00ba Factura', en:'Invoice No.', de:'Rechnungsnr.' },
  'inv.invoiceDate':    { es:'Fecha', en:'Date', de:'Datum' },
  'inv.invoiceSubtitle':{ es:'Documento de liquidaci\u00f3n mensual', en:'Monthly settlement document', de:'Monatliches Abrechnungsdokument' },
  'inv.issuer':         { es:'EMISOR', en:'ISSUER', de:'AUSSTELLER' },
  'inv.recipient':      { es:'DESTINATARIO', en:'RECIPIENT', de:'EMPF\u00c4NGER' },
  'inv.detailTitle':    { es:'Detalle de reservas', en:'Reservation detail', de:'Reservierungsdetails' },
  'inv.fiscalSummary':  { es:'Resumen fiscal', en:'Fiscal summary', de:'Steuer\u00fcbersicht' },
  'inv.taxBase':        { es:'Base imponible', en:'Tax base', de:'Steuerbemessungsgrundlage' },
  'inv.totalToSettle':  { es:'Total a liquidar', en:'Total to settle', de:'Gesamtbetrag' },
  'inv.conceptTitle':  { es:'Concepto', en:'Concept', de:'Leistungsbeschreibung' },
  'inv.conceptBody':   { es:'Servicios de gesti\u00f3n y explotaci\u00f3n tur\u00edstica del alojamiento {aloj} \u2014 {period}. Seg\u00fan detalle en hoja de liquidaci\u00f3n adjunta.', en:'Tourism management and operation services for property {aloj} \u2014 {period}. As detailed in the attached settlement sheet.', de:'Tourismus-Management- und Betriebsdienstleistungen f\u00fcr die Unterkunft {aloj} \u2014 {period}. Gem\u00e4\u00df beigef\u00fcgter Abrechnungs\u00fcbersicht.' },
  'inv.footerNote':     { es:'Este documento constituye la factura por los servicios de gesti\u00f3n de alquiler vacacional conforme al contrato suscrito entre las partes.', en:'This document constitutes the invoice for vacation rental management services pursuant to the contract between the parties.', de:'Dieses Dokument stellt die Rechnung f\u00fcr die Ferienvermietungsverwaltung gem\u00e4\u00df dem zwischen den Parteien geschlossenen Vertrag dar.' },
  'inv.page':           { es:'P\u00e1gina', en:'Page', de:'Seite' },
  'inv.noAloj':         { es:'No hay alojamiento seleccionado', en:'No property selected', de:'Keine Unterkunft ausgew\u00e4hlt' },
  'inv.notEnabled':     { es:'Facturaci\u00f3n no activada para este alojamiento', en:'Invoicing not enabled for this property', de:'Rechnungsstellung f\u00fcr diese Unterkunft nicht aktiviert' },
  'btn.generateInvoice':{ es:'Factura', en:'Invoice', de:'Rechnung' },

};

function t(key, ...args) {
  const entry = I18N[key];
  if (!entry) return key;
  let text = entry[_currentLang] || entry['es'] || key;
  // Simple %s replacement
  args.forEach(a => { text = text.replace('%s', a); });
  return text;
}
window.t = t; // Explicit global binding

// Document output language (independent of UI lang)
var _docLang = _currentLang;
function _withLang(lang, fn) {
  var saved = _currentLang;
  _currentLang = lang;
  try { var result = fn(); return result; }
  finally { _currentLang = saved; }
}
async function _withLangAsync(lang, fn) {
  var saved = _currentLang;
  _currentLang = lang;
  try { var result = await fn(); return result; }
  finally { _currentLang = saved; }
}
function _setDocLang(lang) {
  _docLang = lang;
  document.querySelectorAll('.doc-lang-pill').forEach(function(b) {
    var isActive = b.dataset.lang === lang;
    b.style.background = isActive ? '#1D4B56' : '#f9fafb';
    b.style.color = isActive ? '#fff' : '#6b7280';
  });
  SafeStorage.set('liq-doc-lang', lang);
}
function _buildDocLangPicker() {
  var langs = ['es','en','de'];
  var labels = {es:'ES',en:'EN',de:'DE'};
  return '<div class="doc-lang-picker no-print" style="display:inline-flex;gap:0;border-radius:6px;overflow:hidden;border:1px solid #d1d5db;margin-right:10px;vertical-align:middle;">'
    + langs.map(function(l) {
      var act = l === _docLang ? ' active' : '';
      return '<button class="doc-lang-pill'+act+'" data-lang="'+l+'" onclick="_setDocLang(\''+l+'\')" '
        + 'style="padding:4px 10px;font-size:11px;font-weight:600;border:none;cursor:pointer;'
        + 'background:'+(l===_docLang?'#1D4B56':'#f9fafb')+';color:'+(l===_docLang?'#fff':'#6b7280')+';"'
        + '>'+labels[l]+'</button>';
    }).join('') + '</div>';
}
// Init from saved preference
(function() { var s = SafeStorage.get('liq-doc-lang'); if (s && ['es','en','de'].includes(s)) _docLang = s; })();
console.log('[i18n] v2.24.0 loaded:', Object.keys(I18N).length, 'keys, lang=' + _currentLang);
function setLanguage(lang) {
  if (!['es','en','de'].includes(lang)) return;
  _currentLang = lang;
  SafeStorage.set('liq-lang', lang);
  document.documentElement.lang = lang;
  document.title = t('app.doctitle');
  // Brief visual feedback
  var _main = document.querySelector('.main-content');
  if (_main) { _main.style.opacity = '0.6'; _main.style.transition = 'opacity 0.15s'; }
  // Update all data-i18n elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = t(key);
    } else {
      el.innerHTML = t(key);
    }
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    el.title = t(el.getAttribute('data-i18n-title'));
  });
  // Update dynamic arrays
  _updateI18nArrays();
  // Re-render active screens
  _i18nRefreshUI();
  // Re-render AI guide in new language
  if (typeof _renderAIGuide === 'function') _renderAIGuide();
  // Update language selector highlight
  document.querySelectorAll('.lang-option').forEach(el => {
    el.classList.toggle('active', el.dataset.lang === lang);
  });
  // Restore visual
  if (_main) requestAnimationFrame(function(){ requestAnimationFrame(function(){ _main.style.opacity = '1'; }); });
}
window.setLanguage = setLanguage; // Explicit global binding for onclick handlers

function _updateI18nArrays() {
  // Update MONTH_NAMES and MONTH_FULL
  for (let i = 0; i < 12; i++) {
    MONTH_NAMES[i] = t('month.short.' + i);
    MONTH_FULL[i] = t('month.full.' + i);
  }
  // Update COLUMNS labels
  COLUMNS.forEach(c => {
    const k = 'col.' + c.key;
    if (I18N[k]) c.label = t(k);
  });
  // Update simpleComboOptions
  simpleComboOptions.status = [
    { value:'all', label: t('status.all') },
    { value:'pending', label: t('status.pendingPl') },
    { value:'validated', label: t('status.validatedPl') }
  ];
  simpleComboOptions.sort = [
    { value:'idx', label: t('sort.original') },
    { value:'estado', label: t('sort.status') },
    { value:'idReserva', label: t('sort.idReserva') },
    { value:'localizador', label: t('sort.localizador') },
    { value:'fechaAlta', label: t('sort.fechaAlta') },
    { value:'cliente', label: t('sort.cliente') },
    { value:'alojamiento', label: t('sort.alojamiento') },
    { value:'edificio', label: t('sort.edificio') },
    { value:'plataforma', label: t('sort.plataforma') },
    { value:'atendidoPor', label: t('sort.atendidoPor') },
    { value:'origenMarketing', label: t('sort.origenMkt') },
    { value:'tipoReserva', label: t('sort.tipoReserva') },
    { value:'fechaEntrada', label: t('sort.fechaEntrada') },
    { value:'fechaSalida', label: t('sort.fechaSalida') },
    { value:'noches', label: t('sort.nights') },
    { value:'totalReserva', label: t('sort.totalReserva') },
    { value:'baseSinIVA', label: t('sort.baseNoVAT') },
    { value:'subtotal', label: t('sort.subtotal') },
    { value:'totalLiquidar', label: t('sort.totalToSettle') },
    { value:'observacion', label: t('sort.observation') }
  ];
  simpleComboOptions.sortdir = [
    { value:'asc', label: t('sort.ascending') },
    { value:'desc', label: t('sort.descending') }
  ];
  simpleComboOptions.consolsort = [
    { value:'name', label: t('sort.nameAZ') },
    { value:'name-desc', label: t('sort.nameZA') },
    { value:'reservas-desc', label: t('sort.moreReservations') },
    { value:'reservas-asc', label: t('sort.lessReservations') },
    { value:'liq-desc', label: t('sort.higherSettlement') },
    { value:'liq-asc', label: t('sort.lowerSettlement') },
    { value:'total-desc', label: t('sort.higherBilling') },
    { value:'total-asc', label: t('sort.lowerBilling') }
  ];
  // Reset combo labels
  simpleComboState.status.label = t('status.all');
  simpleComboState.sort.label = t('sort.original');
  simpleComboState.consolsort.label = t('sort.nameAZ');
  // Update combo filter labels
  if (typeof comboLabels !== 'undefined') {
    comboLabels.platform = t('filter.allPlatforms');
    comboLabels.aloj = t('filter.allProperties');
  }
}

function _i18nRefreshUI() {
  // Refresh currently visible screen
  const screens = ['upload','list','consol','detail','consoldetail'];
  const active = screens.find(s => {
    const el = document.getElementById('screen-' + s);
    return el && el.classList.contains('active');
  });
  // Check if a config screen is active
  const cfgScreens = ['cfg-plat','cfg-otros','cfg-pasarela','cfg-impuestos','cfg-8020','cfg-invoicing'];
  const activeCfg = cfgScreens.find(s => {
    const el = document.getElementById('screen-' + s);
    return el && el.classList.contains('active');
  });
  if (active === 'list' && allReservas.length > 0) {
    renderTable();
  } else if (active === 'consol' && allReservas.length > 0) {
    renderConsolGrid();
  } else if (active === 'detail' && typeof currentDetailIdx !== 'undefined' && currentDetailIdx !== null) {
    viewDetail(currentDetailIdx);
  } else if (active === 'consoldetail' && currentConsolAloj) {
    viewConsolDetail(currentConsolAloj);
  }
  if (activeCfg && typeof renderConfigPages === 'function') {
    renderConfigPages();
  }
  // Update filter placeholders
  const pi = document.querySelector('#combo-platform .combo-input');
  if (pi && !pi.value) pi.placeholder = t('filter.allPlatforms');
  const ai = document.querySelector('#combo-aloj .combo-input');
  if (ai && !ai.value) ai.placeholder = t('filter.allProperties');
  const si = document.querySelector('#combo-status .combo-input');
  if (si && !si.value) si.placeholder = t('filter.allStatuses');
}



// â€”â€”â€” AI Guide i18n data (v2.22.0) â€”â€”â€”
var _GUIDE_I18N = {
es: {
  title: 'Gu\u00eda completa del Asistente IA',
  subtitle: 'Todo lo que puedes hacer con el asistente, explicado con ejemplos reales.',
  closeBtn: 'Cerrar gu\u00eda \u00d7',
  tipLabel: 'Consejo',
  examplesLabel: 'Ejemplos de preguntas',
  sections: [
    { icon:'\ud83d\ude80', title:'Primeros pasos',
      text:'El asistente analiza <strong>todas las reservas cargadas</strong> en la aplicaci\u00f3n. Antes de usarlo, aseg\u00farate de:',
      list:['Cargar tus reservas desde <strong>Google Sheets</strong> o un <strong>archivo Excel</strong>',
            'Haz clic en el bot\u00f3n <strong>\ud83e\udd16</strong> flotante abajo a la derecha',
            'Escribe tu pregunta o usa los <strong>chips r\u00e1pidos</strong> (botones de colores)'],
      tip:'La primera vez se te pedir\u00e1 una API Key de Anthropic. Se guarda localmente en tu navegador.' },
    { icon:'\ud83d\udcca', title:'KPIs y M\u00e9tricas',
      text:'El asistente calcula autom\u00e1ticamente estos indicadores clave de rendimiento:',
      table:{headers:['KPI','Qu\u00e9 mide'],
        rows:[['<strong>ADR</strong>','Tarifa media diaria (importe / noches)'],
              ['<strong>Estancia media</strong>','Noches por reserva promedio'],
              ['<strong>Comisi\u00f3n efectiva</strong>','% que se llevan canal+GTC+pasarela'],
              ['<strong>Margen propietario</strong>','% que llega al propietario'],
              ['<strong>Ingreso/piso</strong>','Facturaci\u00f3n media por alojamiento'],
              ['<strong>Rankings</strong>','Top 5 y Bottom 5 por liquidaci\u00f3n y ADR']]},
      examples:['Dame un resumen ejecutivo con todos los KPIs',
                '\u00bfQu\u00e9 piso tiene el ADR m\u00e1s alto?',
                'Top 10 alojamientos por facturaci\u00f3n',
                '\u00bfCu\u00e1l es la comisi\u00f3n efectiva que pagamos?',
                '\u00bfCu\u00e1nto ingresa de media cada piso al mes?'] },
    { icon:'\ud83c\udfe0', title:'An\u00e1lisis por Alojamiento',
      text:'Consulta m\u00e9tricas de cualquier piso individual o compara entre ellos.',
      examples:['\u00bfC\u00f3mo va el piso MA-2-P3-1C?',
                '\u00bfCu\u00e1ntas noches tiene el apartamento Sunset Beach?',
                'Compara los 5 pisos con m\u00e1s reservas vs los 5 con menos',
                '\u00bfQu\u00e9 pisos tienen menos de 10 reservas?',
                'Ranking de alojamientos por n\u00famero de noches'] },
    { icon:'\ud83d\udcb0', title:'Comisiones y Costes',
      text:'El sistema desglosa 3 tipos de comisi\u00f3n: <strong>canal</strong> (Booking, Airbnb...), <strong>GTC</strong> (gesti\u00f3n) y <strong>pasarela</strong> (Stripe). Tambi\u00e9n incluye limpieza, amenities e IRPF.',
      examples:['Desglose de comisiones por plataforma',
                '\u00bfCu\u00e1nto pagamos a Booking en comisiones?',
                '\u00bfCu\u00e1l es la plataforma m\u00e1s cara en comisiones?',
                '\u00bfCu\u00e1nto se ha retenido de IRPF en total?',
                '\u00bfCu\u00e1nto se gasta en limpieza al mes?',
                '\u00bfQu\u00e9 pisos tienen los mayores costes de amenities?'] },
    { icon:'\ud83d\udc64', title:'Propietarios',
      text:'El asistente conoce qu\u00e9 pisos pertenecen a cada propietario y puede calcular sus m\u00e9tricas.',
      examples:['Resumen por propietario',
                '\u00bfCu\u00e1l es la liquidaci\u00f3n de [nombre]?',
                '\u00bfQu\u00e9 propietario tiene m\u00e1s reservas?',
                '\u00bfCu\u00e1nto se liquida a [nombre] este mes?',
                'Tabla con todos los propietarios y sus pisos'] },
    { icon:'\ud83d\udc65', title:'Comparar Propietarios',
      text:'Compara el rendimiento de distintos propietarios con m\u00e9tricas detalladas por piso.',
      examples:['Compara propietarios con ADR y margen',
                '\u00bfQu\u00e9 propietario tiene mejor margen?',
                'Top 3 propietarios por facturaci\u00f3n',
                'Tabla comparativa de todos los propietarios'] },
    { icon:'\ud83d\udcc8', title:'Comparativa Interanual (YoY)',
      text:'Si tienes datos de <strong>2 o m\u00e1s a\u00f1os</strong>, el asistente genera comparativas autom\u00e1ticas con variaciones porcentuales.',
      examples:['Comparativa 2024 vs 2025','\u00bfHan subido las reservas respecto al a\u00f1o pasado?',
                'Evoluci\u00f3n del ADR por a\u00f1o','\u00bfQu\u00e9 plataforma ha crecido m\u00e1s?',
                '\u00bfQu\u00e9 pisos han mejorado su facturaci\u00f3n este a\u00f1o?'] },
    { icon:'\u2600\ufe0f', title:'Estacionalidad',
      text:'Analiza el rendimiento por <strong>trimestre</strong> y <strong>plataforma</strong>. Identifica temporadas alta y baja.',
      examples:['\u00bfCu\u00e1l es el trimestre m\u00e1s rentable?','Estacionalidad por plataforma',
                '\u00bfQu\u00e9 meses tienen m\u00e1s reservas?','Comparar temporada alta vs baja',
                'Tabla de ingresos por trimestre y plataforma'] },
    { icon:'\ud83d\udd2e', title:'Predicci\u00f3n y Proyecci\u00f3n',
      text:'Con <strong>12+ meses</strong> de datos, genera una proyecci\u00f3n mes a mes para los pr\u00f3ximos 12 meses.',
      examples:['Predicci\u00f3n de ocupaci\u00f3n futura','\u00bfCu\u00e1nto facturaremos el pr\u00f3ximo trimestre?',
                'Proyecci\u00f3n de ingresos a 6 meses','\u00bfQu\u00e9 pisos tendr\u00e1n m\u00e1s demanda?'] },
    { icon:'\ud83d\udce5', title:'Exportar a Excel',
      text:'Descarga los datos en formato <strong>CSV compatible con Excel</strong>. Al preguntar sobre exportaci\u00f3n aparece un bot\u00f3n de descarga.',
      examples:['Exportar datos a Excel','Descargar CSV con todas las reservas',
                'Quiero un Excel con el desglose por propietario','Exportar heatmap a CSV'] },
    { icon:'\ud83d\udc68\u200d\ud83d\udcbc', title:'Agentes y Marketing',
      text:'Analiza el rendimiento de los agentes que gestionan reservas y los or\u00edgenes de marketing.',
      examples:['\u00bfQu\u00e9 agente gestiona m\u00e1s reservas?','Rendimiento por origen de marketing',
                'Comparar agentes por facturaci\u00f3n','\u00bfQu\u00e9 canal de marketing genera m\u00e1s ingresos?'] },
    { icon:'\ud83d\udccb', title:'Reservas Individuales',
      text:'Puedes buscar reservas espec\u00edficas. El asistente muestra las reservas actualmente filtradas.',
      examples:['\u00bfCu\u00e1l es la reserva m\u00e1s cara?','Busca reservas de [cliente]',
                '\u00bfHay reservas de m\u00e1s de 14 noches?','\u00bfCu\u00e1l fue la \u00faltima reserva?'] },
    { icon:'\u2699\ufe0f', title:'Acuerdos Especiales',
      text:'El asistente conoce los pisos con <strong>m\u00ednimo garantizado 80/20</strong> y puede analizar su rendimiento espec\u00edfico.',
      examples:['\u00bfQu\u00e9 pisos tienen acuerdo 80/20?','Rendimiento de pisos con m\u00ednimo garantizado',
                '\u00bfEs rentable el acuerdo 80/20?','Comparar pisos 80/20 vs pisos est\u00e1ndar'] },
    { icon:'\ud83d\udee0\ufe0f', title:'Mantenimiento',
      text:'Consulta las cuotas de mantenimiento mensual configuradas por alojamiento.',
      examples:['\u00bfQu\u00e9 pisos tienen cuota de mantenimiento?','Total de mantenimiento mensual',
                '\u00bfCu\u00e1nto se deduce por mantenimiento?'] },
    { icon:'\u2705', title:'Estado de Validaci\u00f3n',
      text:'Consulta cu\u00e1ntas reservas est\u00e1n validadas o pendientes.',
      examples:['\u00bfCu\u00e1ntas reservas faltan por validar?','Estado de validaci\u00f3n por alojamiento',
                '\u00bfQu\u00e9 pisos tienen todas las reservas validadas?'] },
    { icon:'\ud83d\udd0d', title:'Alertas Autom\u00e1ticas',
      text:'Al abrir el asistente por primera vez tras cargar datos, <strong>detecta autom\u00e1ticamente</strong> anomal\u00edas.',
      bullets:['Pisos con ADR bajo (< 50\u20ac/noche)','Pisos sin reservas en el periodo',
               'Alto porcentaje de reservas pendientes de validar','Pisos con margen muy bajo (< 30%)',
               'Posibles reservas duplicadas'] },
    { icon:'\ud83d\udd04', title:'Duplicados y Anomal\u00edas',
      text:'Detecta <strong>reservas duplicadas</strong> (mismo cliente + alojamiento + fechas) y anomal\u00edas de importe.',
      examples:['\u00bfHay reservas duplicadas?','Muestra anomal\u00edas de importe',
                'Busca reservas sospechosas','\u00bfHay reservas con importe 0?',
                '\u00bfAlg\u00fan cliente ha reservado dos veces las mismas fechas?'] },
    { icon:'\ud83d\udcca', title:'Segmentaci\u00f3n de Clientes',
      text:'Clasifica las reservas en 3 tipos de estancia:',
      bullets:['<strong>Escapada</strong>: 1-3 noches','<strong>Vacaciones</strong>: 4-13 noches',
               '<strong>Larga estancia</strong>: 14+ noches'],
      examples:['Segmentaci\u00f3n por tipo de estancia','\u00bfQu\u00e9 tipo de estancia genera m\u00e1s ingresos?'] },
    { icon:'\ud83d\uddfa\ufe0f', title:'Heatmap de Ocupaci\u00f3n',
      text:'Genera un <strong>mapa de calor visual</strong> con bloques Unicode mostrando la ocupaci\u00f3n por alojamiento y mes.',
      examples:['Mapa de calor de ocupaci\u00f3n','Heatmap por alojamiento y mes',
                '\u00bfQu\u00e9 meses est\u00e1n m\u00e1s llenos?','Sparklines de ocupaci\u00f3n por piso',
                '\u00bfQu\u00e9 pisos tienen la mayor estacionalidad?'] },
    { icon:'\u23f1\ufe0f', title:'Lead Time (Antelaci\u00f3n)',
      text:'Analiza <strong>cu\u00e1ntos d\u00edas antes del check-in</strong> se hacen las reservas, por plataforma.',
      examples:['Lead time por plataforma','\u00bfCon cu\u00e1nta antelaci\u00f3n reservan en Booking?',
                '\u00bfQu\u00e9 plataforma tiene reservas m\u00e1s de \u00faltima hora?',
                'Distribuci\u00f3n de antelaci\u00f3n de reservas',
                'Lead time por tipo de estancia'] },
    { icon:'\ud83d\udd2e', title:'Simulador What-If',
      text:'Simula escenarios hipot\u00e9ticos para ver el impacto financiero <strong>antes de tomar decisiones</strong>.',
      examples:['\u00bfQu\u00e9 pasa si subimos el ADR un 10%?','Simular reducci\u00f3n de comisi\u00f3n al 12%',
                '\u00bfQu\u00e9 pasa si a\u00f1adimos 5 pisos nuevos?','Impacto de subir limpieza 10\u20ac',
                'Simular quitar la pasarela de pago','\u00bfQu\u00e9 pasa si perdemos Booking?'] },
    { icon:'\u26a1', title:'Briefing R\u00e1pido',
      text:'Un <strong>resumen ejecutivo ultracondensado</strong> en 3-5 frases con lo m\u00e1s importante.',
      examples:['Briefing r\u00e1pido','Dame lo m\u00e1s importante en 5 frases',
                'Resumen ejecutivo flash','\u00bfQu\u00e9 debo saber hoy?',
                'Estado general del negocio'] },
    { icon:'\ud83e\udde0', title:'Memoria de Conversaci\u00f3n',
      text:'El asistente <strong>recuerda las entidades</strong> (pisos, propietarios, plataformas) mencionadas en la conversaci\u00f3n para dar respuestas m\u00e1s contextuales.',
      bullets:['Menciona un piso y las siguientes preguntas lo tendr\u00e1n en cuenta',
               'Puedes encadenar preguntas: \u00abCompara piso A vs B\u00bb \u2192 \u00ab\u00bfY en noches?\u00bb',
               'El historial se compacta autom\u00e1ticamente para optimizar tokens',
               'Cada 10+ mensajes se resume la conversaci\u00f3n anterior'] },
    { icon:'\ud83d\udcac', title:'Sugerencias Contextuales',
      text:'Despu\u00e9s de cada respuesta, el asistente muestra <strong>2-3 botones de seguimiento</strong> con preguntas relacionadas para profundizar en el an\u00e1lisis.' },
    { icon:'\u26a1', title:'Trucos Avanzados',
      bullets:['Usa <strong>filtros de fecha</strong> antes de preguntar para limitar el periodo',
               'Puedes <strong>combinar peticiones</strong>: \u00abADR por piso y plataforma\u00bb',
               'Pide <strong>tablas comparativas</strong>: \u00abTabla de propietarios con ADR y margen\u00bb',
               'Usa <strong>superlativos</strong>: \u00abEl mejor\u00bb, \u00abEl peor\u00bb, \u00abTop 5\u00bb',
               'Pide <strong>exportar</strong> cualquier an\u00e1lisis a CSV/Excel',
               'El asistente <strong>responde en el idioma</strong> en que le preguntes',
               'Puedes pedir <strong>gr\u00e1ficos ASCII</strong> y tablas formateadas',
               'Pregunta \u00ab\u00bfQu\u00e9 m\u00e1s puedes hacer?\u00bb si necesitas ideas',
               'Los datos del asistente se basan <strong>solo en tus reservas reales</strong>',
               'Puedes cambiar la API Key en cualquier momento desde el panel',
               'Los chips de colores <strong>desaparecen tras el primer uso</strong> para no molestar'] },
    { icon:'\u2139\ufe0f', title:'Informaci\u00f3n T\u00e9cnica',
      bullets:['Modelo: <strong>Claude 3.5 Sonnet</strong> (Anthropic)','La API Key se guarda en <strong>localStorage</strong> (nunca se env\u00eda a nuestros servidores)',
               'Los datos se env\u00edan directamente a la API de Anthropic con cada pregunta',
               '<strong>24 categor\u00edas</strong> de clasificaci\u00f3n inteligente para optimizar contexto',
               '<strong>Memoria de entidades</strong>: recuerda pisos, propietarios y plataformas mencionados',
               '<strong>Sugerencias contextuales</strong>: 2-3 follow-ups tras cada respuesta',
               'El historial se <strong>compacta autom\u00e1ticamente</strong> tras 10+ mensajes',
               'Los contextos se <strong>cachean 30 segundos</strong> para queries similares',
               'Versi\u00f3n actual: <strong>' + APP_VERSION + '</strong>'] }
  ]
},
en: {
  title: 'Complete AI Assistant Guide',
  subtitle: 'Everything you can do with the assistant, explained with real examples.',
  closeBtn: 'Close guide \u00d7',
  tipLabel: 'Tip',
  examplesLabel: 'Example questions',
  sections: [
    { icon:'\ud83d\ude80', title:'Getting Started',
      text:'The assistant analyzes <strong>all loaded reservations</strong> in the application. Before using it, make sure to:',
      list:['Load your reservations from <strong>Google Sheets</strong> or an <strong>Excel file</strong>',
            'Click the <strong>\ud83e\udd16</strong> floating button at the bottom right',
            'Type your question or use the <strong>quick chips</strong> (colored buttons)'],
      tip:'The first time you will be asked for an Anthropic API Key. It is stored locally in your browser.' },
    { icon:'\ud83d\udcca', title:'KPIs & Metrics',
      text:'The assistant automatically calculates these key performance indicators:',
      table:{headers:['KPI','What it measures'],
        rows:[['<strong>ADR</strong>','Average daily rate (revenue / nights)'],
              ['<strong>Average stay</strong>','Nights per reservation average'],
              ['<strong>Effective commission</strong>','% taken by channel+GTC+gateway'],
              ['<strong>Owner margin</strong>','% that reaches the owner'],
              ['<strong>Revenue/property</strong>','Average billing per property'],
              ['<strong>Rankings</strong>','Top 5 and Bottom 5 by settlement and ADR']]},
      examples:['Give me an executive summary with all KPIs',
                'Which property has the highest ADR?',
                'Top 10 properties by billing',
                'What is the effective commission we pay?',
                'How much does each property earn on average per month?'] },
    { icon:'\ud83c\udfe0', title:'Property Analysis',
      text:'Check metrics for any individual property or compare between them.',
      examples:['How is property MA-2-P3-1C doing?',
                'How many nights does the Sunset Beach apartment have?',
                'Compare the 5 properties with most reservations vs the 5 with fewest',
                'Which properties have fewer than 10 reservations?',
                'Property ranking by number of nights'] },
    { icon:'\ud83d\udcb0', title:'Commissions & Costs',
      text:'The system breaks down 3 types of commission: <strong>channel</strong> (Booking, Airbnb...), <strong>GTC</strong> (management) and <strong>gateway</strong> (Stripe). Also includes cleaning, amenities and IRPF tax.',
      examples:['Commission breakdown by platform',
                'How much do we pay Booking in commissions?',
                'Which platform is the most expensive in commissions?',
                'How much IRPF has been withheld in total?',
                'How much is spent on cleaning per month?',
                'Which properties have the highest amenities costs?'] },
    { icon:'\ud83d\udc64', title:'Owners',
      text:'The assistant knows which properties belong to each owner and can calculate their metrics.',
      examples:['Summary by owner','What is the settlement for [name]?',
                'Which owner has the most reservations?','How much is settled to [name] this month?',
                'Table with all owners and their properties'] },
    { icon:'\ud83d\udc65', title:'Compare Owners',
      text:'Compare the performance of different owners with detailed per-property metrics.',
      examples:['Compare owners with ADR and margin','Which owner has the best margin?',
                'Top 3 owners by billing','Comparative table of all owners'] },
    { icon:'\ud83d\udcc8', title:'Year-over-Year (YoY)',
      text:'If you have data from <strong>2 or more years</strong>, the assistant generates automatic comparisons with percentage variations.',
      examples:['2024 vs 2025 comparison','Have reservations increased compared to last year?',
                'ADR evolution by year','Which platform has grown the most?',
                'Which properties have improved their billing this year?'] },
    { icon:'\u2600\ufe0f', title:'Seasonality',
      text:'Analyze performance by <strong>quarter</strong> and <strong>platform</strong>. Identify high and low seasons.',
      examples:['Which is the most profitable quarter?','Seasonality by platform',
                'Which months have the most reservations?','Compare high vs low season',
                'Revenue table by quarter and platform'] },
    { icon:'\ud83d\udd2e', title:'Prediction & Projection',
      text:'With <strong>12+ months</strong> of data, generates a month-by-month projection for the next 12 months.',
      examples:['Future occupancy prediction','How much will we bill next quarter?',
                '6-month revenue projection','Which properties will have the most demand?'] },
    { icon:'\ud83d\udce5', title:'Export to Excel',
      text:'Download data in <strong>CSV format compatible with Excel</strong>. When asking about export, a download button appears.',
      examples:['Export data to Excel','Download CSV with all reservations',
                'I want an Excel with the owner breakdown','Export heatmap to CSV'] },
    { icon:'\ud83d\udc68\u200d\ud83d\udcbc', title:'Agents & Marketing',
      text:'Analyze the performance of agents managing reservations and marketing sources.',
      examples:['Which agent manages the most reservations?','Performance by marketing source',
                'Compare agents by billing','Which marketing channel generates the most revenue?'] },
    { icon:'\ud83d\udccb', title:'Individual Reservations',
      text:'You can search for specific reservations. The assistant shows the currently filtered reservations.',
      examples:['What is the most expensive reservation?','Find reservations by [client]',
                'Are there reservations longer than 14 nights?','What was the last reservation?'] },
    { icon:'\u2699\ufe0f', title:'Special Agreements',
      text:'The assistant knows the properties with <strong>80/20 guaranteed minimum</strong> and can analyze their specific performance.',
      examples:['Which properties have the 80/20 agreement?','Performance of guaranteed minimum properties',
                'Is the 80/20 agreement profitable?','Compare 80/20 vs standard properties'] },
    { icon:'\ud83d\udee0\ufe0f', title:'Maintenance',
      text:'Check the monthly maintenance fees configured per property.',
      examples:['Which properties have maintenance fees?','Total monthly maintenance',
                'How much is deducted for maintenance?'] },
    { icon:'\u2705', title:'Validation Status',
      text:'Check how many reservations are validated or pending.',
      examples:['How many reservations are pending validation?','Validation status by property',
                'Which properties have all reservations validated?'] },
    { icon:'\ud83d\udd0d', title:'Automatic Alerts',
      text:'When opening the assistant for the first time after loading data, it <strong>automatically detects</strong> anomalies.',
      bullets:['Properties with low ADR (< 50\u20ac/night)','Properties with no reservations in the period',
               'High percentage of pending validation','Properties with very low margin (< 30%)',
               'Possible duplicate reservations'] },
    { icon:'\ud83d\udd04', title:'Duplicates & Anomalies',
      text:'Detects <strong>duplicate reservations</strong> (same client + property + dates) and amount anomalies.',
      examples:['Are there duplicate reservations?','Show amount anomalies',
                'Search for suspicious reservations','Are there reservations with amount 0?',
                'Has any client booked the same dates twice?'] },
    { icon:'\ud83d\udcca', title:'Client Segmentation',
      text:'Classifies reservations into 3 stay types:',
      bullets:['<strong>Getaway</strong>: 1-3 nights','<strong>Vacation</strong>: 4-13 nights',
               '<strong>Long stay</strong>: 14+ nights'],
      examples:['Segmentation by stay type','Which stay type generates the most revenue?'] },
    { icon:'\ud83d\uddfa\ufe0f', title:'Occupancy Heatmap',
      text:'Generates a <strong>visual heatmap</strong> with Unicode blocks showing occupancy by property and month.',
      examples:['Occupancy heatmap','Heatmap by property and month',
                'Which months are fullest?','Occupancy sparklines by property',
                'Which properties have the most seasonality?'] },
    { icon:'\u23f1\ufe0f', title:'Lead Time (Booking Advance)',
      text:'Analyzes <strong>how many days before check-in</strong> reservations are made, by platform.',
      examples:['Lead time by platform','How far in advance do they book on Booking?',
                'Which platform has the most last-minute bookings?',
                'Booking advance distribution',
                'Lead time by stay type'] },
    { icon:'\ud83d\udd2e', title:'What-If Simulator',
      text:'Simulate hypothetical scenarios to see the financial impact <strong>before making decisions</strong>.',
      examples:['What if we raise ADR by 10%?','Simulate reducing commission to 12%',
                'What if we add 5 new properties?','Impact of raising cleaning by 10\u20ac',
                'Simulate removing the payment gateway','What if we lose Booking?'] },
    { icon:'\u26a1', title:'Quick Briefing',
      text:'An <strong>ultra-condensed executive summary</strong> in 3-5 sentences with the most important information.',
      examples:['Quick briefing','Give me the most important in 5 sentences',
                'Flash executive summary','What should I know today?',
                'General business status'] },
    { icon:'\ud83e\udde0', title:'Conversation Memory',
      text:'The assistant <strong>remembers entities</strong> (properties, owners, platforms) mentioned in conversation for more contextual responses.',
      bullets:['Mention a property and subsequent questions will take it into account',
               'You can chain questions: \u00abCompare property A vs B\u00bb \u2192 \u00abAnd in nights?\u00bb',
               'History is automatically compacted to optimize tokens',
               'Every 10+ messages the previous conversation is summarized'] },
    { icon:'\ud83d\udcac', title:'Contextual Suggestions',
      text:'After each response, the assistant shows <strong>2-3 follow-up buttons</strong> with related questions to deepen the analysis.' },
    { icon:'\u26a1', title:'Advanced Tips',
      bullets:['Use <strong>date filters</strong> before asking to limit the period',
               'You can <strong>combine requests</strong>: \u00abADR by property and platform\u00bb',
               'Ask for <strong>comparative tables</strong>: \u00abOwner table with ADR and margin\u00bb',
               'Use <strong>superlatives</strong>: \u00abThe best\u00bb, \u00abThe worst\u00bb, \u00abTop 5\u00bb',
               'Ask to <strong>export</strong> any analysis to CSV/Excel',
               'The assistant <strong>responds in the language</strong> you ask in',
               'You can request <strong>ASCII charts</strong> and formatted tables',
               'Ask \u00abWhat else can you do?\u00bb if you need ideas',
               'Assistant data is based <strong>only on your real reservations</strong>',
               'You can change the API Key at any time from the panel',
               'Color chips <strong>disappear after first use</strong> to stay out of the way'] },
    { icon:'\u2139\ufe0f', title:'Technical Information',
      bullets:['Model: <strong>Claude 3.5 Sonnet</strong> (Anthropic)','The API Key is stored in <strong>localStorage</strong> (never sent to our servers)',
               'Data is sent directly to the Anthropic API with each question',
               '<strong>24 categories</strong> of intelligent classification to optimize context',
               '<strong>Entity memory</strong>: remembers properties, owners and platforms mentioned',
               '<strong>Contextual suggestions</strong>: 2-3 follow-ups after each response',
               'History is <strong>automatically compacted</strong> after 10+ messages',
               'Contexts are <strong>cached 30 seconds</strong> for similar queries',
               'Current version: <strong>' + APP_VERSION + '</strong>'] }
  ]
},
de: {
  title: 'Vollst\u00e4ndige KI-Assistenten-Anleitung',
  subtitle: 'Alles, was Sie mit dem Assistenten tun k\u00f6nnen, mit echten Beispielen erkl\u00e4rt.',
  closeBtn: 'Anleitung schlie\u00dfen \u00d7',
  tipLabel: 'Tipp',
  examplesLabel: 'Beispielfragen',
  sections: [
    { icon:'\ud83d\ude80', title:'Erste Schritte',
      text:'Der Assistent analysiert <strong>alle geladenen Buchungen</strong> in der Anwendung. Stellen Sie vorher sicher:',
      list:['Laden Sie Ihre Buchungen von <strong>Google Sheets</strong> oder einer <strong>Excel-Datei</strong>',
            'Klicken Sie auf den <strong>\ud83e\udd16</strong> schwebenden Button unten rechts',
            'Geben Sie Ihre Frage ein oder nutzen Sie die <strong>Schnell-Chips</strong> (farbige Buttons)'],
      tip:'Beim ersten Mal wird ein Anthropic API-Schl\u00fcssel ben\u00f6tigt. Er wird lokal in Ihrem Browser gespeichert.' },
    { icon:'\ud83d\udcca', title:'KPIs & Kennzahlen',
      text:'Der Assistent berechnet automatisch diese Leistungskennzahlen:',
      table:{headers:['KPI','Was es misst'],
        rows:[['<strong>ADR</strong>','Durchschnittlicher Tagespreis (Umsatz / N\u00e4chte)'],
              ['<strong>Durchschn. Aufenthalt</strong>','N\u00e4chte pro Buchung im Durchschnitt'],
              ['<strong>Effektive Provision</strong>','% f\u00fcr Kanal+GTC+Gateway'],
              ['<strong>Eigent\u00fcmermarge</strong>','% das beim Eigent\u00fcmer ankommt'],
              ['<strong>Umsatz/Unterkunft</strong>','Durchschn. Abrechnung pro Unterkunft'],
              ['<strong>Rankings</strong>','Top 5 und Bottom 5 nach Abrechnung und ADR']]},
      examples:['Gib mir eine Zusammenfassung mit allen KPIs',
                'Welche Unterkunft hat den h\u00f6chsten ADR?',
                'Top 10 Unterk\u00fcnfte nach Umsatz',
                'Wie hoch ist die effektive Provision?',
                'Wie viel verdient jede Unterkunft durchschnittlich pro Monat?'] },
    { icon:'\ud83c\udfe0', title:'Unterkunftsanalyse',
      text:'Pr\u00fcfen Sie Kennzahlen einzelner Unterk\u00fcnfte oder vergleichen Sie sie.',
      examples:['Wie l\u00e4uft Unterkunft MA-2-P3-1C?',
                'Wie viele N\u00e4chte hat das Apartment Sunset Beach?',
                'Vergleiche die 5 Unterk\u00fcnfte mit den meisten vs wenigsten Buchungen',
                'Welche Unterk\u00fcnfte haben weniger als 10 Buchungen?',
                'Ranking der Unterk\u00fcnfte nach N\u00e4chteanzahl'] },
    { icon:'\ud83d\udcb0', title:'Provisionen & Kosten',
      text:'Das System schl\u00fcsselt 3 Provisionsarten auf: <strong>Kanal</strong> (Booking, Airbnb...), <strong>GTC</strong> (Verwaltung) und <strong>Gateway</strong> (Stripe). Inklusive Reinigung, Amenities und IRPF.',
      examples:['Provisionsaufschl\u00fcsselung nach Plattform',
                'Wie viel zahlen wir an Booking?',
                'Welche Plattform ist am teuersten?',
                'Wie viel IRPF wurde insgesamt einbehalten?',
                'Wie viel wird monatlich f\u00fcr Reinigung ausgegeben?',
                'Welche Unterk\u00fcnfte haben die h\u00f6chsten Amenity-Kosten?'] },
    { icon:'\ud83d\udc64', title:'Eigent\u00fcmer',
      text:'Der Assistent kennt die Zuordnung von Unterk\u00fcnften zu Eigent\u00fcmern.',
      examples:['\u00dcbersicht nach Eigent\u00fcmer','Wie hoch ist die Abrechnung f\u00fcr [Name]?',
                'Welcher Eigent\u00fcmer hat die meisten Buchungen?','Wie viel wird [Name] diesen Monat abgerechnet?',
                'Tabelle aller Eigent\u00fcmer und ihrer Unterk\u00fcnfte'] },
    { icon:'\ud83d\udc65', title:'Eigent\u00fcmer vergleichen',
      text:'Vergleichen Sie die Leistung verschiedener Eigent\u00fcmer mit detaillierten Kennzahlen.',
      examples:['Eigent\u00fcmer mit ADR und Marge vergleichen','Welcher Eigent\u00fcmer hat die beste Marge?',
                'Top 3 Eigent\u00fcmer nach Umsatz','Vergleichstabelle aller Eigent\u00fcmer'] },
    { icon:'\ud83d\udcc8', title:'Jahresvergleich (YoY)',
      text:'Bei Daten aus <strong>2+ Jahren</strong> erstellt der Assistent automatische Vergleiche mit prozentualen Ver\u00e4nderungen.',
      examples:['Vergleich 2024 vs 2025','Sind die Buchungen gegen\u00fcber letztem Jahr gestiegen?',
                'ADR-Entwicklung nach Jahr','Welche Plattform ist am meisten gewachsen?',
                'Welche Unterk\u00fcnfte haben ihren Umsatz verbessert?'] },
    { icon:'\u2600\ufe0f', title:'Saisonalit\u00e4t',
      text:'Analysieren Sie die Leistung nach <strong>Quartal</strong> und <strong>Plattform</strong>. Identifizieren Sie Hoch- und Nebensaison.',
      examples:['Welches Quartal ist am profitabelsten?','Saisonalit\u00e4t nach Plattform',
                'Welche Monate haben die meisten Buchungen?','Hochsaison vs Nebensaison vergleichen',
                'Umsatztabelle nach Quartal und Plattform'] },
    { icon:'\ud83d\udd2e', title:'Prognose & Projektion',
      text:'Mit <strong>12+ Monaten</strong> Daten wird eine monatliche Projektion f\u00fcr die n\u00e4chsten 12 Monate erstellt.',
      examples:['Zuk\u00fcnftige Belegungsprognose','Wie viel werden wir n\u00e4chstes Quartal abrechnen?',
                '6-Monats-Umsatzprognose','Welche Unterk\u00fcnfte werden am meisten nachgefragt?'] },
    { icon:'\ud83d\udce5', title:'Nach Excel exportieren',
      text:'Laden Sie Daten im <strong>CSV-Format f\u00fcr Excel</strong> herunter. Ein Download-Button erscheint bei Export-Anfragen.',
      examples:['Daten nach Excel exportieren','CSV mit allen Buchungen herunterladen',
                'Excel mit Eigent\u00fcmer-Aufschl\u00fcsselung','Heatmap als CSV exportieren'] },
    { icon:'\ud83d\udc68\u200d\ud83d\udcbc', title:'Agenten & Marketing',
      text:'Analysieren Sie die Leistung der Agenten und Marketingquellen.',
      examples:['Welcher Agent verwaltet die meisten Buchungen?','Leistung nach Marketingquelle',
                'Agenten nach Umsatz vergleichen','Welcher Marketingkanal generiert den meisten Umsatz?'] },
    { icon:'\ud83d\udccb', title:'Einzelne Buchungen',
      text:'Sie k\u00f6nnen nach bestimmten Buchungen suchen. Der Assistent zeigt die aktuell gefilterten Buchungen.',
      examples:['Was ist die teuerste Buchung?','Buchungen von [Kunde] finden',
                'Gibt es Buchungen \u00fcber 14 N\u00e4chte?','Was war die letzte Buchung?'] },
    { icon:'\u2699\ufe0f', title:'Sondervereinbarungen',
      text:'Der Assistent kennt Unterk\u00fcnfte mit <strong>80/20 Mindestgarantie</strong> und kann deren Leistung analysieren.',
      examples:['Welche Unterk\u00fcnfte haben die 80/20-Vereinbarung?','Leistung der Mindestgarantie-Unterk\u00fcnfte',
                'Ist die 80/20-Vereinbarung rentabel?','80/20 vs Standard-Unterk\u00fcnfte vergleichen'] },
    { icon:'\ud83d\udee0\ufe0f', title:'Wartung',
      text:'Pr\u00fcfen Sie die monatlichen Wartungsgeb\u00fchren pro Unterkunft.',
      examples:['Welche Unterk\u00fcnfte haben Wartungsgeb\u00fchren?','Monatliche Wartung gesamt',
                'Wie viel wird f\u00fcr Wartung abgezogen?'] },
    { icon:'\u2705', title:'Validierungsstatus',
      text:'Pr\u00fcfen Sie, wie viele Buchungen validiert oder ausstehend sind.',
      examples:['Wie viele Buchungen fehlen zur Validierung?','Validierungsstatus nach Unterkunft',
                'Welche Unterk\u00fcnfte sind vollst\u00e4ndig validiert?'] },
    { icon:'\ud83d\udd0d', title:'Automatische Warnungen',
      text:'Beim ersten \u00d6ffnen nach dem Laden erkennt der Assistent <strong>automatisch</strong> Anomalien.',
      bullets:['Unterk\u00fcnfte mit niedrigem ADR (< 50\u20ac/Nacht)','Unterk\u00fcnfte ohne Buchungen im Zeitraum',
               'Hoher Anteil ausstehender Validierungen','Unterk\u00fcnfte mit sehr niedriger Marge (< 30%)',
               'M\u00f6gliche doppelte Buchungen'] },
    { icon:'\ud83d\udd04', title:'Duplikate & Anomalien',
      text:'Erkennt <strong>doppelte Buchungen</strong> (gleicher Kunde + Unterkunft + Daten) und Betragsanomalien.',
      examples:['Gibt es doppelte Buchungen?','Betragsanomalien anzeigen',
                'Verd\u00e4chtige Buchungen suchen','Gibt es Buchungen mit Betrag 0?',
                'Hat ein Kunde zweimal die gleichen Daten gebucht?'] },
    { icon:'\ud83d\udcca', title:'Kundensegmentierung',
      text:'Klassifiziert Buchungen in 3 Aufenthaltstypen:',
      bullets:['<strong>Kurzurlaub</strong>: 1-3 N\u00e4chte','<strong>Urlaub</strong>: 4-13 N\u00e4chte',
               '<strong>Langzeitaufenthalt</strong>: 14+ N\u00e4chte'],
      examples:['Segmentierung nach Aufenthaltsart','Welcher Aufenthaltstyp generiert den meisten Umsatz?'] },
    { icon:'\ud83d\uddfa\ufe0f', title:'Belegungs-Heatmap',
      text:'Erstellt eine <strong>visuelle Heatmap</strong> mit Unicode-Bl\u00f6cken f\u00fcr die Belegung nach Unterkunft und Monat.',
      examples:['Belegungs-Heatmap','Heatmap nach Unterkunft und Monat',
                'Welche Monate sind am vollsten?','Belegungs-Sparklines pro Unterkunft',
                'Welche Unterk\u00fcnfte haben die st\u00e4rkste Saisonalit\u00e4t?'] },
    { icon:'\u23f1\ufe0f', title:'Vorlaufzeit (Buchungsvorlauf)',
      text:'Analysiert <strong>wie viele Tage vor dem Check-in</strong> gebucht wird, nach Plattform.',
      examples:['Vorlaufzeit nach Plattform','Wie weit im Voraus buchen sie auf Booking?',
                'Welche Plattform hat die meisten Last-Minute-Buchungen?',
                'Verteilung der Buchungsvorlaufzeit',
                'Vorlaufzeit nach Aufenthaltsart'] },
    { icon:'\ud83d\udd2e', title:'Was-w\u00e4re-wenn Simulator',
      text:'Simulieren Sie hypothetische Szenarien, um die finanzielle Auswirkung <strong>vor Entscheidungen</strong> zu sehen.',
      examples:['Was wenn wir den ADR um 10% erh\u00f6hen?','Provisionsreduzierung auf 12% simulieren',
                'Was wenn wir 5 neue Unterk\u00fcnfte hinzuf\u00fcgen?','Auswirkung einer Reinigungserh\u00f6hung um 10\u20ac',
                'Zahlungs-Gateway entfernen simulieren','Was wenn wir Booking verlieren?'] },
    { icon:'\u26a1', title:'Schnell-Briefing',
      text:'Eine <strong>ultrakompakte Zusammenfassung</strong> in 3-5 S\u00e4tzen mit den wichtigsten Informationen.',
      examples:['Schnelles Briefing','Gib mir das Wichtigste in 5 S\u00e4tzen',
                'Flash-Zusammenfassung','Was sollte ich heute wissen?',
                'Allgemeiner Gesch\u00e4ftsstatus'] },
    { icon:'\ud83e\udde0', title:'Gespr\u00e4chsspeicher',
      text:'Der Assistent <strong>merkt sich Entit\u00e4ten</strong> (Unterk\u00fcnfte, Eigent\u00fcmer, Plattformen) f\u00fcr kontextbezogenere Antworten.',
      bullets:['Erw\u00e4hnen Sie eine Unterkunft und Folgefragen ber\u00fccksichtigen sie',
               'Fragen verketten: \u00abVergleiche A vs B\u00bb \u2192 \u00abUnd bei N\u00e4chten?\u00bb',
               'Der Verlauf wird automatisch komprimiert',
               'Alle 10+ Nachrichten wird das Gespr\u00e4ch zusammengefasst'] },
    { icon:'\ud83d\udcac', title:'Kontextbezogene Vorschl\u00e4ge',
      text:'Nach jeder Antwort zeigt der Assistent <strong>2-3 Follow-up-Buttons</strong> mit verwandten Fragen zur Vertiefung der Analyse.' },
    { icon:'\u26a1', title:'Fortgeschrittene Tipps',
      bullets:['Nutzen Sie <strong>Datumsfilter</strong> vor der Frage, um den Zeitraum einzugrenzen',
               'Sie k\u00f6nnen <strong>Anfragen kombinieren</strong>: \u00abADR nach Unterkunft und Plattform\u00bb',
               'Bitten Sie um <strong>Vergleichstabellen</strong>: \u00abEigent\u00fcmertabelle mit ADR und Marge\u00bb',
               'Verwenden Sie <strong>Superlative</strong>: \u00abDas Beste\u00bb, \u00abDas Schlechteste\u00bb, \u00abTop 5\u00bb',
               'Bitten Sie um <strong>Export</strong> jeder Analyse als CSV/Excel',
               'Der Assistent <strong>antwortet in der Sprache</strong>, in der Sie fragen',
               'Sie k\u00f6nnen <strong>ASCII-Diagramme</strong> und formatierte Tabellen anfordern',
               'Fragen Sie \u00abWas kannst du noch?\u00bb wenn Sie Ideen brauchen',
               'Die Daten basieren <strong>nur auf Ihren echten Buchungen</strong>',
               'Sie k\u00f6nnen den API-Schl\u00fcssel jederzeit im Panel \u00e4ndern',
               'Farb-Chips <strong>verschwinden nach der ersten Nutzung</strong>'] },
    { icon:'\u2139\ufe0f', title:'Technische Informationen',
      bullets:['Modell: <strong>Claude 3.5 Sonnet</strong> (Anthropic)','API-Schl\u00fcssel in <strong>localStorage</strong> (nie an unsere Server gesendet)',
               'Daten werden direkt an die Anthropic API gesendet',
               '<strong>24 Kategorien</strong> intelligenter Klassifizierung zur Kontextoptimierung',
               '<strong>Entit\u00e4tsspeicher</strong>: merkt sich erw\u00e4hnte Unterk\u00fcnfte, Eigent\u00fcmer und Plattformen',
               '<strong>Kontextvorschl\u00e4ge</strong>: 2-3 Follow-ups nach jeder Antwort',
               'Verlauf wird <strong>automatisch komprimiert</strong> nach 10+ Nachrichten',
               'Kontexte werden <strong>30 Sekunden gecacht</strong> f\u00fcr \u00e4hnliche Anfragen',
               'Aktuelle Version: <strong>' + APP_VERSION + '</strong>'] }
  ]
}
};

/**
 * @description Renders AI guide content in current language.
 * Called on load and on language change.
 */
function _renderAIGuide() {
  var el = document.getElementById('ai-guide-body');
  if (!el || typeof _GUIDE_I18N === 'undefined') return;
  var L = _currentLang || 'es';
  var g = _GUIDE_I18N[L] || _GUIDE_I18N.es;
  el.innerHTML =
    '<div class="ai-help-header">' +
      '<h2>&#x1F4D6; ' + g.title + '</h2>' +
      '<p>' + g.subtitle + '</p>' +
      '<button class="ai-help-close" onclick="_toggleAIHelp()">' + g.closeBtn + '</button>' +
    '</div>' +
    g.sections.map(function(s) {
      var h = '<div class="ai-help-section"><h3>' + s.icon + ' ' + s.title + '</h3>';
      if (s.text) h += '<p>' + s.text + '</p>';
      if (s.table) {
        h += '<table class="ai-help-table"><tr>' + s.table.headers.map(function(th){ return '<th>'+th+'</th>'; }).join('') + '</tr>';
        h += s.table.rows.map(function(r){ return '<tr>' + r.map(function(c){ return '<td>'+c+'</td>'; }).join('') + '</tr>'; }).join('');
        h += '</table>';
      }
      if (s.list) {
        h += '<ol>' + s.list.map(function(li){ return '<li>'+li+'</li>'; }).join('') + '</ol>';
      }
      if (s.tip) {
        h += '<div class="ai-help-tip">&#x1F4A1; <strong>' + g.tipLabel + ':</strong> ' + s.tip + '</div>';
      }
      if (s.examples) {
        h += '<div class="ai-help-example"><strong>' + g.examplesLabel + ':</strong><ul>' +
          s.examples.map(function(ex){ return '<li>&laquo;'+ex+'&raquo;</li>'; }).join('') +
        '</ul></div>';
      }
      if (s.bullets) {
        h += '<ul>' + s.bullets.map(function(b){ return '<li>'+b+'</li>'; }).join('') + '</ul>';
      }
      return h + '</div>';
    }).join('');
}


