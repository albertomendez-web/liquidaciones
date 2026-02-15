/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  EMAIL MODULE v2.4.0 — PDF generation + Gmail sending for liquidaciones
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *  Satellite file for index.html (Liquidaciones GTC).
 *  Loads after the main script and accesses its global functions:
 *    - buildPrintCards(), currentConsolAloj, getPropietario(), getPropietarioEmail()
 *    - savePropietarioEmail(), showToast(), fmt(), esc(), _googleToken, gapi
 *    - _mpSelYears, _mpSelMonths, _mpHasFilter()
 *
 *  External dependencies (lazy-loaded from CDN):
 *    - html2canvas 1.4.1
 *    - jsPDF 2.5.2
 *
 *  @version 2.1.0
 *  @date 2026-02-14
 */

/* global buildPrintCards, currentConsolAloj, getPropietario, getPropietarioEmail,
          savePropietarioEmail, showToast, fmt, esc, _googleToken, gapi,
          _mpSelYears, _mpSelMonths, _mpHasFilter, SafeStorage, getAlojamientos,
          validated, settings, getLiq, IVA_RESERVA, IVA_SUBTOTAL, GTC_SPLIT_RATE,
          isGtcSplit, getConsolDeductions, buildPrintDeductionsHtml, formatDate */


// i18n helper - uses main app's t() if available, otherwise falls back to Spanish
function _et(key) { return (typeof t === 'function') ? t(key) : key; }

// ═══════════════════════════════════════════════════════════════════════════════
//  [E01] LAZY LOADING — Dynamic CDN loading of PDF libraries
// ═══════════════════════════════════════════════════════════════════════════════

const _EMAIL_CDN = {
  html2canvas: 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  jsPDF: 'https://unpkg.com/jspdf@2.5.1/dist/jspdf.umd.min.js'
};

let _pdfLibsLoaded = false;
let _pdfLibsPromise = null;

/**
 * @description Loads html2canvas and jsPDF from CDN if not already available.
 * Uses singleton promise to prevent duplicate loading.
 * @returns {Promise<void>}
 */
function _loadPdfLibs() {
  if (_pdfLibsLoaded) return Promise.resolve();
  if (_pdfLibsPromise) return _pdfLibsPromise;

  // Patch createPattern BEFORE html2canvas loads (it captures the reference at load time)
  if (!CanvasRenderingContext2D.prototype._origCreatePattern) {
    CanvasRenderingContext2D.prototype._origCreatePattern = CanvasRenderingContext2D.prototype.createPattern;
    CanvasRenderingContext2D.prototype.createPattern = function(img, rep) {
      try {
        if (img && ('width' in img) && ('height' in img) && (img.width === 0 || img.height === 0)) {
          console.warn('[Email] createPattern: blocked 0-dim image, using 1x1 fallback');
          const fallback = document.createElement('canvas');
          fallback.width = 1; fallback.height = 1;
          return this._origCreatePattern(fallback, rep);
        }
        return this._origCreatePattern(img, rep);
      } catch(e) {
        console.warn('[Email] createPattern error caught:', e.message);
        const fallback = document.createElement('canvas');
        fallback.width = 1; fallback.height = 1;
        return this._origCreatePattern(fallback, rep);
      }
    };
    console.log('[Email] createPattern patched');
  }

  _pdfLibsPromise = (async () => {
    const loads = [];
    if (typeof html2canvas === 'undefined') {
      loads.push(_loadScript(_EMAIL_CDN.html2canvas));
    }
    if (typeof window.jspdf === 'undefined') {
      loads.push(_loadScript(_EMAIL_CDN.jsPDF));
    }
    if (loads.length > 0) {
      await Promise.all(loads);
    }
    // Verify libs loaded correctly
    if (typeof html2canvas === 'undefined') throw new Error('html2canvas not available');
    if (!window.jspdf || !window.jspdf.jsPDF) throw new Error('jsPDF not available');
    _pdfLibsLoaded = true;
    console.log('[Email] PDF libs loaded');
  })().catch(e => {
    _pdfLibsPromise = null; // allow retry
    throw new Error('No se pudieron cargar las librer\u00EDas PDF. Comprueba tu conexi\u00F3n a internet.');
  });

  return _pdfLibsPromise;
}

function _loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = () => reject(new Error('Failed to load: ' + src));
    document.head.appendChild(s);
  });
}


// ═══════════════════════════════════════════════════════════════════════════════
//  [E02] PDF GENERATION — HTML print cards to PDF conversion
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @description Clones all page stylesheets into a standalone <style> block.
 * This ensures the off-screen render container has identical styling.
 * @returns {string} Complete CSS text
 */
function _clonePageStyles() {
  const parts = [];
  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules) {
        // Skip @media print rules — we want screen rendering
        if (rule instanceof CSSMediaRule && rule.conditionText === 'print') continue;
        parts.push(rule.cssText);
      }
    } catch (e) {
      // Cross-origin stylesheet, skip (fonts etc.)
    }
  }
  return parts.join('\n');
}

/**
 * @description Waits for web fonts to be loaded (max 3s timeout).
 * @returns {Promise<void>}
 */
async function _waitForFonts() {
  if (document.fonts && document.fonts.ready) {
    await Promise.race([
      document.fonts.ready,
      new Promise(r => setTimeout(r, 3000))
    ]);
  }
}

/**
 * @description Generates a PDF Blob from the current liquidation print cards.
 * Renders HTML in a hidden off-screen container, captures with html2canvas,
 * composes pages with jsPDF.
 *
 * @param {Function} [onProgress] - Optional callback(step, totalSteps, message)
 * @returns {Promise<Blob>} PDF as Blob
 */
async function _generatePdf(onProgress, lang) {
  const _p = onProgress || (() => {});

  _p(0, 5, 'Cargando librer\u00EDas...');
  await _loadPdfLibs();

  _p(1, 5, 'Preparando datos...');
  const pdfLang = lang || (typeof _docLang !== 'undefined' ? _docLang : 'es');
  const result = (typeof _withLang === 'function') ? _withLang(pdfLang, function() { return buildPrintCards(pdfLang); }) : buildPrintCards(pdfLang);
  if (!result) throw new Error('No se pudo generar la liquidaci\u00F3n. Verifica los datos.');

  // Wait for fonts
  await _waitForFonts();

  // Create hidden render container with full CSS
  _p(2, 5, 'Renderizando tarjetas...');
  const container = document.createElement('div');
  container.id = '_pdf-render-root';
  container.style.cssText = [
    'position:fixed', 'left:-9999px', 'top:0',
    'width:1100px', 'background:#fff', 'z-index:-1',
    'font-family:DM Sans,Helvetica Neue,sans-serif',
    'color:#1a1a2e', '-webkit-print-color-adjust:exact',
    'print-color-adjust:exact'
  ].join(';');

  // Inject cloned styles + overrides for rendering context
  const pageCSS = _clonePageStyles();
  container.innerHTML = `<style>
    ${pageCSS}
    /* Render overrides */
    #_pdf-render-root .liq-container {
      max-width: 1100px !important;
      margin: 0 !important;
      box-shadow: none !important;
      border-radius: 14px !important;
      overflow: hidden !important;
    }
    #_pdf-render-root .liq-header {
      overflow: hidden !important;
    }
    /* Force gold bars to have explicit dimensions */
    #_pdf-render-root .liq-gold-bar-top {
      height: 5px !important;
      min-height: 5px !important;
      width: 100% !important;
      display: block !important;
      background: #E0AE00 !important;
    }
    #_pdf-render-root .liq-gold-bar-bottom {
      height: 4px !important;
      min-height: 4px !important;
      width: 100% !important;
      display: block !important;
      background: #E0AE00 !important;
    }
    #_pdf-render-root .liq-header-logo {
      min-width: 1px !important;
      min-height: 1px !important;
    }
    /* Kill ALL pseudo-elements — html2canvas chokes on gradient ::before/::after */
    #_pdf-render-root .liq-total-bar::before,
    #_pdf-render-root .liq-header::before,
    #_pdf-render-root .liq-header::after,
    #_pdf-render-root .consol-header::before,
    #_pdf-render-root .consol-header::after,
    #_pdf-render-root .cd-total-bar::before {
      display: none !important;
      content: none !important;
    }
    /* Replace gradient dividers with solid color */
    #_pdf-render-root .liq-divider {
      background: #D4C49A !important;
      height: 1px !important;
      min-height: 1px !important;
    }
    /* Subtotal bar — solid background instead of gradient */
    #_pdf-render-root .liq-subtotal-bar {
      background: #FBF4E8 !important;
      margin: 0 -32px !important;
      padding: 12px 32px !important;
    }
    #_pdf-render-root .no-print { display: none !important; }
    #_pdf-render-root .liq-sw { display: none !important; }
    #_pdf-render-root .liq-sel { display: none !important; }
    #_pdf-render-root .liq-row.bold {
      margin: 0 -32px !important;
      padding: 12px 32px !important;
    }
  </style>
  ${result.cardsHtml}
  ${result.summaryHtml}`;

  document.body.appendChild(container);

  // Small delay to let browser render and fonts apply
  await new Promise(r => setTimeout(r, 400));

  try {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageW = pdf.internal.pageSize.getWidth();  // ~297mm
    const pageH = pdf.internal.pageSize.getHeight(); // ~210mm
    const margin = 8;
    const contentW = pageW - margin * 2;
    const maxContentH = pageH - margin * 2;

    const cards = container.querySelectorAll('.liq-container');
    const totalCards = cards.length;

    _p(3, 5, `Capturando ${totalCards} tarjeta${totalCards > 1 ? 's' : ''}...`);

    let isFirst = true;

    for (let ci = 0; ci < totalCards; ci++) {
      const card = cards[ci];
      if (!isFirst) pdf.addPage();
      isFirst = false;

      const canvas = await html2canvas(card, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: 1100,
        windowWidth: 1100,
        removeContainer: true,
        onclone: (doc) => {
          // Ensure cloned doc has proper font rendering
          const root = doc.getElementById('_pdf-render-root');
          if (root) root.style.visibility = 'visible';
        }
      });

      // Safety check: skip cards with zero-dimension canvas
      if (!canvas.width || !canvas.height) {
        console.warn('[Email] Card', ci, 'rendered with 0 dimensions, skipping');
        continue;
      }

      const imgData = canvas.toDataURL('image/jpeg', 0.92);
      const imgW = contentW;
      const imgH = (canvas.height / canvas.width) * imgW;

      if (imgH <= maxContentH) {
        // Fits on one page — center vertically slightly
        pdf.addImage(imgData, 'JPEG', margin, margin, imgW, imgH);
      } else {
        // Scale to fit — card is too tall for one page
        const scale = maxContentH / imgH;
        const scaledW = imgW * scale;
        const scaledH = maxContentH;
        const offsetX = margin + (contentW - scaledW) / 2;
        pdf.addImage(imgData, 'JPEG', offsetX, margin, scaledW, scaledH);
      }
    }

    _p(4, 5, 'Finalizando PDF...');
    const blob = pdf.output('blob');
    _p(5, 5, 'PDF generado');
    console.log('[Email] PDF generated:', totalCards, 'pages,', Math.round(blob.size / 1024), 'KB');
    return blob;
  } finally {
    document.body.removeChild(container);
  }
}


// ═══════════════════════════════════════════════════════════════════════════════
//  [E03] PDF DOWNLOAD — Standalone PDF download
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @description Downloads the current liquidation as PDF.
 * Called from the "Descargar PDF" button.
 */
async function handleDownloadPdf() {
  const alojName = currentConsolAloj;
  if (!alojName) { showToast('No hay liquidaci\u00F3n seleccionada', 'error'); return; }

  const mes = _getCurrentLiqMonth();
  const safeName = alojName.replace(/[^a-zA-Z0-9\-_]/g, '_');
  const safeMonth = mes.replace(/[^a-zA-Z0-9\-_]/g, '_');
  const pdfLang = (typeof _docLang !== 'undefined') ? _docLang : 'es';
  const pfx = pdfLang === 'en' ? 'Settlement' : pdfLang === 'de' ? 'Abrechnung' : 'Liquidacion';
  const filename = `${pfx}_${safeName}_${safeMonth}.pdf`;

  // Disable the download button to prevent double-clicks
  const btn = document.querySelector('.pdf-download-btn');
  if (btn) { btn.disabled = true; btn.textContent = (window.t||String)('pdf.generating'); }

  showToast((window.t||String)('pdf.generatingWait'), 'info', 8000);

  try {
    const blob = await _generatePdf(null, pdfLang);

    // Download via temp link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);

    showToast(`PDF descargado: ${filename}`, 'success');
  } catch (err) {
    console.error('[Email] PDF download error:', err);
    showToast((window.t||String)('pdf.errorGenerate') + err.message, 'error', 5000);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '\u2B73 ' + (window.t||String)('btn.downloadPdfLiq'); }
  }
}


// ═══════════════════════════════════════════════════════════════════════════════
//  [E04] GMAIL API — Send email with PDF attachment
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @description Builds a MIME multipart message with PDF attachment.
 * @param {Object} opts - { to, from, subject, body, pdfBase64, filename }
 * @returns {string} Raw MIME message in base64url encoding
 */
function _buildMimeMessage({ to, cc, from, subject, body, pdfBase64, filename }) {
  const boundary = 'boundary_' + Date.now() + '_' + Math.random().toString(36).slice(2);

  const mimeLines = [
    `From: ${from}`,
    `To: ${to}`,
  ];
  if (cc) mimeLines.push(`Cc: ${cc}`);
  mimeLines.push(
    `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    btoa(unescape(encodeURIComponent(body))),
    '',
    `--${boundary}`,
    `Content-Type: application/pdf; name="${filename}"`,
    'Content-Transfer-Encoding: base64',
    `Content-Disposition: attachment; filename="${filename}"`,
    '',
    pdfBase64,
    '',
    `--${boundary}--`
  );

  const mimeStr = mimeLines.join('\r\n');
  return _base64url(mimeStr);
}

/**
 * @description Encodes ASCII string to base64url (safe for Gmail API raw field).
 * Chunks processing to avoid call stack limits with large PDFs.
 * @param {string} str - ASCII string to encode
 * @returns {string} base64url encoded string
 */
function _base64url(str) {
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) bytes[i] = str.charCodeAt(i);
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * @description Sends an email with PDF attachment via Gmail API REST endpoint.
 * @param {Object} opts - { to, subject, htmlBody, pdfBlob, filename }
 * @returns {Promise<Object>} Gmail API response
 */
async function _sendGmail({ to, cc, subject, htmlBody, pdfBlob, filename }) {
  if (!_googleToken) {
    throw new Error('No hay sesi\u00F3n de Google activa. Inicia sesi\u00F3n primero.');
  }

  // Gmail sets the From header automatically for the authenticated user
  const from = 'me';

  // Convert PDF blob to base64
  const pdfBase64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = () => reject(new Error((window.t||String)('pdf.errorRead')));
    reader.readAsDataURL(pdfBlob);
  });

  const raw = _buildMimeMessage({ to, cc, from, subject, body: htmlBody, pdfBase64, filename });

  // Send via Gmail API
  const sendResp = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + _googleToken.access_token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ raw })
  });

  if (!sendResp.ok) {
    const err = await sendResp.json().catch(() => ({}));
    console.error('[Email] Gmail API error:', sendResp.status, err);
    if (sendResp.status === 403) {
      throw new Error('Sin permiso para enviar emails. Desconecta y reconecta tu cuenta de Google para aceptar el permiso de Gmail.');
    }
    if (sendResp.status === 429) {
      throw new Error('Demasiadas solicitudes. Espera unos segundos e int\u00E9ntalo de nuevo.');
    }
    throw new Error((window.t||String)('email.errorSend') + (err.error?.message || sendResp.statusText));
  }

  const result = await sendResp.json();
  console.log('[Email] Sent! Message ID:', result.id, 'to:', to, cc ? 'cc:' + cc : '');
  return result;
}


// ═══════════════════════════════════════════════════════════════════════════════
//  [E05] EMAIL BODY — HTML email template
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @description Generates the HTML email body for a liquidation email.
 * Uses inline styles for maximum email client compatibility.
 * @param {string} propName - Owner name
 * @param {string} alojName - Property name
 * @param {string} mes - Month string (e.g. "Enero 2026")
 * @param {string} lang - Language: 'es' or 'en'
 * @returns {string} HTML email body
 */
function _buildEmailBody(propName, alojName, mes, lang) {
  const L = lang || 'es';
  const _t = function(es, en, de) { return L === 'en' ? en : L === 'de' ? de : es; };
  const t = {
    badge:       _t('Liquidaci\u00F3n', 'Settlement', 'Abrechnung'),
    greeting:    _t('Estimado/a', 'Dear', 'Sehr geehrte/r'),
    body:        _t(
      `Adjunto encontrar\u00E1 la liquidaci\u00F3n correspondiente a <strong>${_escHtml(mes)}</strong> para el alojamiento <strong>${_escHtml(alojName)}</strong>.`,
      `Please find attached the settlement statement for <strong>${_escHtml(mes)}</strong> regarding the property <strong>${_escHtml(alojName)}</strong>.`,
      `Anbei finden Sie die Abrechnung f\u00FCr <strong>${_escHtml(mes)}</strong> f\u00FCr die Unterkunft <strong>${_escHtml(alojName)}</strong>.`
    ),
    pdfNote:     _t(
      'El documento <strong style="color:#1D4B56;">PDF adjunto</strong> contiene el desglose completo de la liquidaci\u00F3n con todas las reservas y conceptos del periodo.',
      'The attached <strong style="color:#1D4B56;">PDF document</strong> contains the full settlement breakdown with all reservations and items for the period.',
      'Das beigef\u00FCgte <strong style="color:#1D4B56;">PDF-Dokument</strong> enth\u00E4lt die vollst\u00E4ndige Abrechnungs\u00FCbersicht mit allen Buchungen und Posten des Zeitraums.'
    ),
    contact:     _t(
      'Si tiene alguna duda o necesidad de aclaraci\u00F3n sobre alg\u00FAn concepto, no dude en ponerse en contacto con nosotros.',
      'Should you have any questions or require clarification on any item, please do not hesitate to contact us.',
      'Sollten Sie Fragen haben oder eine Kl\u00E4rung zu einem Posten ben\u00F6tigen, z\u00F6gern Sie bitte nicht, uns zu kontaktieren.'
    ),
    closing:     _t('Un cordial saludo,', 'Kind regards,', 'Mit freundlichen Gr\u00FC\u00DFen,'),
    extraLabel:  _t('Nota adicional', 'Additional note', 'Zusätzliche Anmerkung'),
    footer:      _t('Este email ha sido generado autom\u00E1ticamente', 'This email has been automatically generated', 'Diese E-Mail wurde automatisch erstellt'),
  };

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:20px;background:#e8ecf0;font-family:'Roboto',Arial,Helvetica,sans-serif;color:#1D4B56;">
  <div style="max-width:600px;margin:0 auto;">
    <!-- Top gold accent bar -->
    <div style="height:5px;background:#E0AE00;border-radius:8px 8px 0 0;"></div>
    <!-- Header with logo -->
    <div style="background:#1D4B56;padding:28px 36px 24px;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td>
        <span style="font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:300;color:#E0AE00;letter-spacing:0.01em;">h\u00F4mity</span>
        <span style="font-family:Georgia,'Times New Roman',serif;font-size:14px;font-weight:300;color:#7191AC;letter-spacing:0.08em;margin-left:6px;">holidays</span>
      </td></tr></table>
    </div>
    <!-- Info band -->
    <div style="background:#163E47;padding:18px 36px;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
        <td style="vertical-align:middle;">
          <div style="font-family:Georgia,'Times New Roman',serif;font-size:18px;font-weight:600;color:#FFFFFF;letter-spacing:0.01em;">${_escHtml(alojName)}</div>
        </td>
        <td style="text-align:right;vertical-align:middle;">
          <div style="display:inline-block;background:rgba(224,174,0,0.15);border:1px solid rgba(224,174,0,0.3);border-radius:6px;padding:6px 14px;">
            <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.12em;color:#E8BE4B;line-height:1;">${t.badge}</div>
            <div style="font-family:Georgia,'Times New Roman',serif;font-size:15px;font-weight:500;color:#FFFFFF;margin-top:2px;">${_escHtml(mes)}</div>
          </div>
        </td>
      </tr></table>
    </div>
    <!-- Body -->
    <div id="email-body-content" style="background:#FFFFFF;padding:32px 36px;">
      <p style="margin:0 0 16px;font-size:14px;color:#1D4B56;line-height:1.7;">${t.greeting} <strong>${_escHtml(propName)}</strong>,</p>
      <p style="margin:0 0 16px;font-size:14px;color:#1D4B56;line-height:1.7;">${t.body}</p>
      <!-- Highlight box -->
      <div style="background:#FBF4E8;border-left:3px solid #E0AE00;border-radius:0 8px 8px 0;padding:16px 20px;margin:20px 0;">
        <p style="margin:0;font-size:13px;color:#4D7A97;line-height:1.6;">&#128206; ${t.pdfNote}</p>
      </div>
      <p style="margin:16px 0 0;font-size:14px;color:#4D7A97;line-height:1.7;">${t.contact}</p>
      <!-- Signature -->
      <div style="margin-top:28px;padding-top:20px;border-top:1px solid #D1E8E6;">
        <p style="margin:0;font-size:14px;color:#1D4B56;">${t.closing}</p>
        <table cellpadding="0" cellspacing="0" border="0" style="margin-top:12px;"><tr>
          <td style="padding-right:14px;border-right:2px solid #E0AE00;">
            <div style="font-family:Georgia,'Times New Roman',serif;font-size:16px;font-weight:600;color:#1D4B56;">David Fraidiaz</div>
            <div style="font-size:12px;color:#7191AC;margin-top:2px;">Green Tropical Coast, S.L.</div>
          </td>
          <td style="padding-left:14px;">
            <div style="font-size:12px;color:#7191AC;line-height:1.6;">david.fraidiaz@granadabeachgolf.com<br>Tel. 608 626 555</div>
          </td>
        </tr></table>
      </div>
    </div>
    <!-- Footer -->
    <div id="email-footer" style="background:#EFF1F6;padding:14px 36px;border-top:1px solid #D5DAE5;text-align:center;">
      <div style="font-size:11px;color:#ACB8C0;line-height:1.5;">${t.footer} \u00B7 <span style="color:#7191AC;">granadabeachgolf.com</span></div>
    </div>
    <!-- Bottom gold accent bar -->
    <div style="height:4px;background:#E0AE00;border-radius:0 0 8px 8px;"></div>
  </div>
</body>
</html>`;
}

function _escHtml(str) {
  const d = document.createElement('div');
  d.textContent = str || '';
  return d.innerHTML;
}


// ═══════════════════════════════════════════════════════════════════════════════
//  [E06] UI — Email modal and send orchestration
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @description Entry point: shows the email sending modal.
 * Called from the "Enviar por Email" button in the consolidated view.
 */
function handleEmailLiquidacion() {
  const alojName = currentConsolAloj;
  if (!alojName) { showToast('No hay liquidaci\u00F3n seleccionada', 'error'); return; }
  if (!_googleToken) { showToast('Inicia sesi\u00F3n con Google primero', 'error'); return; }

  const propName = getPropietario(alojName);
  const propEmail = getPropietarioEmail(alojName);

  if (propName === 'Falta propietario') {
    showToast('Asigna un propietario antes de enviar el email', 'error');
    return;
  }

  const mes = _getCurrentLiqMonth();
  const _emailLangDefault = (typeof _docLang !== 'undefined') ? _docLang : 'es';
  const safeName = alojName.replace(/[^a-zA-Z0-9\-_]/g, '_');
  const safeMonth = mes.replace(/[^a-zA-Z0-9\-_]/g, '_');
  const _emailLangPfx = { es: 'Liquidacion', en: 'Settlement', de: 'Abrechnung' };
  const filename = `${_emailLangPfx[_emailLangDefault] || 'Liquidacion'}_${safeName}_${safeMonth}.pdf`;
  const _emailSubjects = {
    es: `Liquidaci\u00F3n ${mes} \u2014 ${alojName}`,
    en: `Settlement ${mes} \u2014 ${alojName}`,
    de: `Abrechnung ${mes} \u2014 ${alojName}`
  };
  const subject = _emailSubjects[_emailLangDefault] || _emailSubjects.es;

  const overlay = document.createElement('div');
  overlay.className = 'email-modal-overlay';
  overlay.id = 'email-modal-overlay';
  // Drag-out detection: only close if BOTH mousedown AND mouseup happen on overlay
  let _mdOnOverlay = false;
  overlay.addEventListener('mousedown', (e) => { _mdOnOverlay = (e.target === overlay); });
  overlay.addEventListener('mouseup', (e) => {
    if (_mdOnOverlay && e.target === overlay) closeEmailModal();
    _mdOnOverlay = false;
  });

  overlay.innerHTML = `
    <div class="email-modal">
      <div class="email-modal-header">
        <button onclick="closeEmailModal()" style="position:absolute;top:12px;right:14px;background:none;border:none;color:rgba(255,255,255,0.6);font-size:22px;cursor:pointer;padding:4px 8px;line-height:1;border-radius:4px;transition:all 0.15s;" onmouseover="this.style.color='#fff';this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.color='rgba(255,255,255,0.6)';this.style.background='none'">&times;</button>
        <h3>${(window.t||String)('email.title')}</h3>
        <p>${_escHtml(alojName)} \u2014 ${_escHtml(mes)}</p>
      </div>
      <div class="email-modal-body">
        <div class="email-modal-field">
          <label>${(window.t||String)('email.recipient')} (${_escHtml(propName)})</label>
          <input type="text" id="email-to" value="${_escHtml(propEmail)}" placeholder="${(window.t||String)('email.toPlaceholder')}" autocomplete="email">
        </div>
        <div class="email-modal-field">
          <label>CC <span style="font-weight:400;text-transform:none;letter-spacing:normal;color:#9ca3af;">${(window.t||String)('email.ccLabel').replace(/^CC /,'')}</span></label>
          <input type="text" id="email-cc" placeholder="${(window.t||String)('email.ccPlaceholder')}" autocomplete="email">
        </div>
        <div class="email-modal-field">
          <label>${(window.t||String)('email.subject')}</label>
          <input type="text" id="email-subject" value="${_escHtml(subject)}">
        </div>
        <div class="email-modal-field">
          <label>${(window.t||String)('email.extraMsg')}</label>
          <textarea id="email-extra-msg" placeholder="${(window.t||String)('email.extraPlaceholder')}"></textarea>
        </div>
        <div class="email-modal-field" style="margin-bottom:8px;">
          <label>${(window.t||String)('email.langLabel')}</label>
          <div style="display:flex;gap:8px;margin-top:4px;">
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:400;text-transform:none;letter-spacing:normal;font-size:13px;">
              <input type="radio" name="email-lang" value="es" ${_emailLangDefault === 'es' ? 'checked' : ''} style="width:14px;height:14px;"> ${(window.t||String)("email.langEs")}
            </label>
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:400;text-transform:none;letter-spacing:normal;font-size:13px;">
              <input type="radio" name="email-lang" value="en" ${_emailLangDefault === 'en' ? 'checked' : ''} style="width:14px;height:14px;"> ${(window.t||String)("email.langEn")}
            </label>
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:400;text-transform:none;letter-spacing:normal;font-size:13px;">
              <input type="radio" name="email-lang" value="de" ${_emailLangDefault === 'de' ? 'checked' : ''} style="width:14px;height:14px;"> ${(window.t||String)("email.langDe")}
            </label>
          </div>
        </div>
        <div class="email-modal-field" style="margin-bottom:0;">
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
            <input type="checkbox" id="email-save-addr" ${propEmail ? '' : 'checked'} style="width:14px;height:14px;">
            ${(window.t||String)('email.saveAddr')}
          </label>
        </div>
        <div class="email-status" id="email-status"></div>
      </div>
      <div class="email-modal-footer">
        <button class="btn-cancel" onclick="closeEmailModal()">${(window.t||String)('email.cancel')}</button>
        <button class="btn-send" id="email-send-btn" onclick="_doSendEmail('${alojName.replace(/'/g, "\\'")}', '${propName.replace(/'/g, "\\'")}', '${mes.replace(/'/g, "\\'")}', '${filename.replace(/'/g, "\\'")}')">
          ${(window.t||String)('email.send')}
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Focus email input
  setTimeout(() => {
    const inp = document.getElementById('email-to');
    if (inp) { inp.focus(); if (!propEmail) inp.select(); }
  }, 100);

  // Preload PDF libs in background
  _loadPdfLibs().catch(() => {});
}

/**
 * @description Closes and removes the email modal.
 */
function closeEmailModal() {
  const overlay = document.getElementById('email-modal-overlay');
  if (overlay) {
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.15s';
    setTimeout(() => overlay.remove(), 150);
  }
}

/**
 * @description Orchestrates the send flow: validate → generate PDF → send → feedback.
 */
async function _doSendEmail(alojName, propName, mes, filename) {
  const toInput = document.getElementById('email-to');
  const ccInput = document.getElementById('email-cc');
  const subjectInput = document.getElementById('email-subject');
  const extraMsg = document.getElementById('email-extra-msg');
  const saveCheck = document.getElementById('email-save-addr');
  const sendBtn = document.getElementById('email-send-btn');
  const statusEl = document.getElementById('email-status');

  const to = (toInput?.value || '').trim();
  const subject = (subjectInput?.value || '').trim();

  // Parse CC: split by comma, trim, filter empties
  const ccRaw = (ccInput?.value || '').trim();
  const ccList = ccRaw ? ccRaw.split(',').map(e => e.trim()).filter(e => e) : [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Validate TO email(s) - accepts comma-separated
  if (!to) {
    toInput.style.borderColor = '#ef4444';
    toInput.focus();
    return;
  }
  const toList = to.split(',').map(e => e.trim()).filter(e => e);
  const badTo = toList.find(e => !emailRegex.test(e));
  if (badTo) {
    toInput.style.borderColor = '#ef4444';
    _setStatus(statusEl, 'error', 'Email no v\u00E1lido: ' + _escHtml(badTo));
    toInput.focus();
    return;
  }
  const toFinal = toList.join(', ');

  // Validate CC emails
  if (ccList.length > 0) {
    const badCc = ccList.find(e => !emailRegex.test(e));
    if (badCc) {
      ccInput.style.borderColor = '#ef4444';
      _setStatus(statusEl, 'error', 'CC no v\u00E1lido: ' + _escHtml(badCc));
      ccInput.focus();
      return;
    }
  }
  const cc = ccList.join(', ');

  if (!subject) {
    subjectInput.style.borderColor = '#ef4444';
    subjectInput.focus();
    return;
  }

  // Lock UI
  sendBtn.disabled = true;
  const cancelBtn = sendBtn.parentElement?.querySelector('.btn-cancel');
  if (cancelBtn) cancelBtn.style.display = 'none';

  try {
    // Step 1: Generate PDF
    _setStatus(statusEl, 'sending', '&#9203; Generando PDF de la liquidaci\u00F3n...');
    sendBtn.textContent = 'Generando PDF...';

    const lang = document.querySelector('input[name="email-lang"]:checked')?.value || 'es';

    // Override filename based on selected language
    const _lPfx = { es: 'Liquidacion', en: 'Settlement', de: 'Abrechnung' };
    const safeFn = alojName.replace(/[^a-zA-Z0-9\-_]/g, '_');
    const safeMo = mes.replace(/[^a-zA-Z0-9\-_]/g, '_');
    const actualFilename = `${_lPfx[lang] || 'Liquidacion'}_${safeFn}_${safeMo}.pdf`;

    const pdfBlob = await _generatePdf((step, total, msg) => {
      _setStatus(statusEl, 'sending', '&#9203; ' + msg);
    }, lang);

    // Step 2: Build HTML body
    _setStatus(statusEl, 'sending', (window.t||String)('email.sending').replace('%s', _escHtml(toFinal) + (cc ? ' (CC: ' + _escHtml(cc) + ')' : '')));
    sendBtn.textContent = (window.t||String)('email.sendingBtn');

    let htmlBody = _buildEmailBody(propName, alojName, mes, lang);
    const extra = (extraMsg?.value || '').trim();
    if (extra) {
      // Insert custom message before the signature divider
      const sigMarker = '<div style="margin-top:28px;padding-top:20px;border-top:1px solid #D1E8E6;">';
      const extraLabel = lang === 'en' ? 'Additional note' : lang === 'de' ? 'Zus\u00E4tzliche Anmerkung' : 'Nota adicional';
      const customBlock = `<div style="background:#FBF4E8;border:1px solid #E8BE4B;border-radius:8px;padding:14px 18px;margin-top:20px;">
          <div style="font-size:11px;text-transform:uppercase;color:#1D4B56;font-weight:700;margin-bottom:4px;letter-spacing:0.05em;">${extraLabel}</div>
          <div style="font-size:13px;color:#4D7A97;line-height:1.6;">${_escHtml(extra).replace(/\n/g, '<br>')}</div>
        </div>
      `;
      htmlBody = htmlBody.replace(sigMarker, customBlock + sigMarker);
    }

    // Step 3: Send via Gmail
    await _sendGmail({ to: toFinal, cc, subject, htmlBody, pdfBlob, filename: actualFilename });

    // Step 4: Save email if checkbox checked (save first address only)
    if (saveCheck?.checked && toList[0]) {
      try {
        await savePropietarioEmail(alojName, toList[0]);
      } catch (e) {
        console.warn('[Email] Could not save email address:', e);
      }
    }

    // Success
    _setStatus(statusEl, 'success', `&#10004; Email enviado correctamente a <strong>${_escHtml(toFinal)}</strong>`);
    sendBtn.textContent = (window.t||String)('email.sentBtn');
    sendBtn.style.background = 'linear-gradient(135deg, #1D4B56, #306472)';
    sendBtn.style.color = '#E0AE00';
    showToast('Email enviado a ' + toFinal, 'success');

    // Auto-close after 2.5 seconds
    setTimeout(closeEmailModal, 2500);

  } catch (err) {
    console.error('[Email] Error:', err);
    _setStatus(statusEl, 'error', '&#10008; ' + _escHtml(err.message));
    sendBtn.disabled = false;
    sendBtn.textContent = 'Reintentar \u21BB';
    if (cancelBtn) cancelBtn.style.display = '';
  }
}

function _setStatus(el, type, html) {
  if (!el) return;
  el.className = 'email-status ' + type;
  el.innerHTML = html;
}


// ═══════════════════════════════════════════════════════════════════════════════
//  [E07] HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @description Gets the current liquidation month from the active date filter.
 * @returns {string} Month in readable format (e.g., "Enero 2026")
 */
function _getCurrentLiqMonth() {
  const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                 'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  try {
    if (typeof _mpSelYears !== 'undefined' && _mpSelYears.size > 0) {
      const year = [..._mpSelYears].sort()[0];
      if (typeof _mpSelMonths !== 'undefined' && _mpSelMonths.size === 1) {
        return MESES[[..._mpSelMonths][0]] + ' ' + year;
      }
      if (typeof _mpSelMonths !== 'undefined' && _mpSelMonths.size > 1) {
        const months = [..._mpSelMonths].sort((a, b) => a - b);
        return months.map(m => MESES[m]).join(', ') + ' ' + year;
      }
      return year.toString();
    }
  } catch (e) { /* ignore */ }
  const now = new Date();
  return MESES[now.getMonth()] + ' ' + now.getFullYear();
}

// ═══════════════════════════════════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════════════════════════════════
// Patch createPattern immediately at module load (before any lib loads)
if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype._origCreatePattern) {
  CanvasRenderingContext2D.prototype._origCreatePattern = CanvasRenderingContext2D.prototype.createPattern;
  CanvasRenderingContext2D.prototype.createPattern = function(img, rep) {
    try {
      if (img && ('width' in img) && ('height' in img) && (img.width === 0 || img.height === 0)) {
        console.warn('[Email] createPattern: blocked 0-dim image');
        const fb = document.createElement('canvas'); fb.width = 1; fb.height = 1;
        return this._origCreatePattern(fb, rep);
      }
      return this._origCreatePattern(img, rep);
    } catch(e) {
      console.warn('[Email] createPattern fallback:', e.message);
      const fb = document.createElement('canvas'); fb.width = 1; fb.height = 1;
      return this._origCreatePattern(fb, rep);
    }
  };
}
console.log('[Email Module] v2.4.0 loaded');
