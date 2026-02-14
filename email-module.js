/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  EMAIL MODULE v2.0.0 — PDF generation + Gmail sending for liquidaciones
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
 *  @version 2.0.0
 *  @date 2026-02-14
 */

/* global buildPrintCards, currentConsolAloj, getPropietario, getPropietarioEmail,
          savePropietarioEmail, showToast, fmt, esc, _googleToken, gapi,
          _mpSelYears, _mpSelMonths, _mpHasFilter, SafeStorage, getAlojamientos,
          validated, settings, getLiq, IVA_RESERVA, IVA_SUBTOTAL, GTC_SPLIT_RATE,
          isGtcSplit, getConsolDeductions, buildPrintDeductionsHtml, formatDate */

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
async function _generatePdf(onProgress) {
  const _p = onProgress || (() => {});

  _p(0, 5, 'Cargando librer\u00EDas...');
  await _loadPdfLibs();

  _p(1, 5, 'Preparando datos...');
  const result = buildPrintCards();
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
    #_pdf-render-root .no-print { display: none !important; }
    #_pdf-render-root .liq-sw { display: none !important; }
    #_pdf-render-root .liq-sel { display: none !important; }
    #_pdf-render-root .liq-row.bold {
      margin: 0 -32px !important;
      padding: 12px 32px !important;
    }
    #_pdf-render-root .liq-subtotal-bar {
      margin: 0 -32px !important;
      padding: 12px 32px !important;
    }
  </style>
  ${result.cardsHtml}
  ${result.summaryHtml}`;

  document.body.appendChild(container);

  // Small delay to let browser render and fonts apply
  await new Promise(r => setTimeout(r, 200));

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
        onclone: (doc) => {
          // Ensure cloned doc has proper font rendering
          const root = doc.getElementById('_pdf-render-root');
          if (root) root.style.visibility = 'visible';
        }
      });

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
  const filename = `Liquidacion_${safeName}_${safeMonth}.pdf`;

  // Disable the download button to prevent double-clicks
  const btn = document.querySelector('.pdf-download-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Generando...'; }

  showToast('Generando PDF, espera un momento...', 'info', 8000);

  try {
    const blob = await _generatePdf();

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
    showToast('Error al generar PDF: ' + err.message, 'error', 5000);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '\u2B73 Descargar PDF'; }
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
function _buildMimeMessage({ to, from, subject, body, pdfBase64, filename }) {
  const boundary = 'boundary_' + Date.now() + '_' + Math.random().toString(36).slice(2);

  const mimeLines = [
    `From: ${from}`,
    `To: ${to}`,
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
  ];

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
async function _sendGmail({ to, subject, htmlBody, pdfBlob, filename }) {
  if (!_googleToken) {
    throw new Error('No hay sesi\u00F3n de Google activa. Inicia sesi\u00F3n primero.');
  }

  // Get sender email from Gmail profile
  const profileResp = await fetch('https://www.googleapis.com/gmail/v1/users/me/profile', {
    headers: { 'Authorization': 'Bearer ' + _googleToken.access_token }
  });
  if (!profileResp.ok) {
    if (profileResp.status === 403 || profileResp.status === 401) {
      throw new Error('Sin permiso de Gmail. Desconecta y vuelve a conectar tu cuenta de Google para aceptar el permiso.');
    }
    throw new Error('No se pudo obtener el perfil de Gmail. Verifica los permisos.');
  }
  const profile = await profileResp.json();
  const from = profile.emailAddress;

  // Convert PDF blob to base64
  const pdfBase64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = () => reject(new Error('Error al leer el archivo PDF'));
    reader.readAsDataURL(pdfBlob);
  });

  const raw = _buildMimeMessage({ to, from, subject, body: htmlBody, pdfBase64, filename });

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
    throw new Error('Error al enviar el email: ' + (err.error?.message || sendResp.statusText));
  }

  const result = await sendResp.json();
  console.log('[Email] Sent! Message ID:', result.id, 'to:', to);
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
 * @returns {string} HTML email body
 */
function _buildEmailBody(propName, alojName, mes) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial,Helvetica,sans-serif;color:#1f2937;line-height:1.6;max-width:600px;margin:0 auto;padding:20px;">
  <div style="background:linear-gradient(135deg,#0f1628,#1a2744);color:#fff;padding:24px 28px;border-radius:12px 12px 0 0;">
    <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;opacity:0.7;margin-bottom:4px;">Liquidaci\u00F3n Mensual</div>
    <div style="font-size:22px;font-weight:800;">${_escHtml(alojName)}</div>
    <div style="font-size:13px;opacity:0.6;margin-top:4px;">${_escHtml(mes)}</div>
  </div>
  <div style="background:#f8f9fb;padding:24px 28px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;">
    <p>Estimado/a <strong>${_escHtml(propName)}</strong>,</p>
    <p>Adjunto encontrar\u00E1 la liquidaci\u00F3n correspondiente a <strong>${_escHtml(mes)}</strong> para el alojamiento <strong>${_escHtml(alojName)}</strong>.</p>
    <p>El documento PDF adjunto contiene el desglose completo de la liquidaci\u00F3n con todas las reservas y conceptos del periodo.</p>
    <p>Si tiene alguna duda o necesidad de aclaraci\u00F3n sobre alg\u00FAn concepto, no dude en ponerse en contacto con nosotros.</p>
    <p style="margin-top:24px;">Un cordial saludo,<br><strong>GTC \u2014 Gesti\u00F3n Tur\u00EDstica Completa</strong></p>
  </div>
  <div style="text-align:center;padding:16px;font-size:11px;color:#9ca3af;">
    Este email ha sido generado autom\u00E1ticamente desde el sistema de liquidaciones GTC.
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
  const safeName = alojName.replace(/[^a-zA-Z0-9\-_]/g, '_');
  const safeMonth = mes.replace(/[^a-zA-Z0-9\-_]/g, '_');
  const filename = `Liquidacion_${safeName}_${safeMonth}.pdf`;
  const subject = `Liquidaci\u00F3n ${mes} \u2014 ${alojName}`;

  const overlay = document.createElement('div');
  overlay.className = 'email-modal-overlay';
  overlay.id = 'email-modal-overlay';
  overlay.onclick = (e) => { if (e.target === overlay) closeEmailModal(); };

  overlay.innerHTML = `
    <div class="email-modal">
      <div class="email-modal-header">
        <h3>&#9993; Enviar Liquidaci\u00F3n por Email</h3>
        <p>${_escHtml(alojName)} \u2014 ${_escHtml(mes)}</p>
      </div>
      <div class="email-modal-body">
        <div class="email-modal-field">
          <label>Destinatario (${_escHtml(propName)})</label>
          <input type="email" id="email-to" value="${_escHtml(propEmail)}" placeholder="email@ejemplo.com" autocomplete="email">
        </div>
        <div class="email-modal-field">
          <label>Asunto</label>
          <input type="text" id="email-subject" value="${_escHtml(subject)}">
        </div>
        <div class="email-modal-field">
          <label>Mensaje adicional (opcional)</label>
          <textarea id="email-extra-msg" placeholder="A\u00F1ade un mensaje personalizado..."></textarea>
        </div>
        <div class="email-modal-field" style="margin-bottom:0;">
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
            <input type="checkbox" id="email-save-addr" ${propEmail ? '' : 'checked'} style="width:14px;height:14px;">
            Guardar email del propietario
          </label>
        </div>
        <div class="email-status" id="email-status"></div>
      </div>
      <div class="email-modal-footer">
        <button class="btn-cancel" onclick="closeEmailModal()">Cancelar</button>
        <button class="btn-send" id="email-send-btn" onclick="_doSendEmail('${alojName.replace(/'/g, "\\'")}', '${propName.replace(/'/g, "\\'")}', '${mes.replace(/'/g, "\\'")}', '${filename.replace(/'/g, "\\'")}')">
          Enviar &#10148;
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
  const subjectInput = document.getElementById('email-subject');
  const extraMsg = document.getElementById('email-extra-msg');
  const saveCheck = document.getElementById('email-save-addr');
  const sendBtn = document.getElementById('email-send-btn');
  const statusEl = document.getElementById('email-status');

  const to = (toInput?.value || '').trim();
  const subject = (subjectInput?.value || '').trim();

  // Validate email
  if (!to) {
    toInput.style.borderColor = '#ef4444';
    toInput.focus();
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    toInput.style.borderColor = '#ef4444';
    _setStatus(statusEl, 'error', 'Email no v\u00E1lido. Revisa la direcci\u00F3n.');
    toInput.focus();
    return;
  }
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

    const pdfBlob = await _generatePdf((step, total, msg) => {
      _setStatus(statusEl, 'sending', '&#9203; ' + msg);
    });

    // Step 2: Build HTML body
    _setStatus(statusEl, 'sending', '&#9203; Enviando email a ' + _escHtml(to) + '...');
    sendBtn.textContent = 'Enviando...';

    let htmlBody = _buildEmailBody(propName, alojName, mes);
    const extra = (extraMsg?.value || '').trim();
    if (extra) {
      // Insert custom message before footer
      const footerMarker = '<div style="text-align:center;padding:16px';
      const customBlock = `<div style="background:#fffbeb;border:1px solid #fbbf24;border-radius:8px;padding:14px 18px;margin-top:16px;">
          <div style="font-size:11px;text-transform:uppercase;color:#92400e;font-weight:700;margin-bottom:4px;">Nota adicional</div>
          <div style="color:#78350f;">${_escHtml(extra).replace(/\n/g, '<br>')}</div>
        </div>
      </div>\n  `;
      htmlBody = htmlBody.replace('</div>\n  <div style="text-align:center;padding:16px',
        customBlock + '<div style="text-align:center;padding:16px');
    }

    // Step 3: Send via Gmail
    await _sendGmail({ to, subject, htmlBody, pdfBlob, filename });

    // Step 4: Save email if checkbox checked
    if (saveCheck?.checked && to) {
      try {
        await savePropietarioEmail(alojName, to);
      } catch (e) {
        console.warn('[Email] Could not save email address:', e);
      }
    }

    // Success
    _setStatus(statusEl, 'success', `&#10004; Email enviado correctamente a <strong>${_escHtml(to)}</strong>`);
    sendBtn.textContent = '\u00A1Enviado! \u2714';
    sendBtn.style.background = 'linear-gradient(135deg, #16a34a, #22c55e)';
    showToast('Email enviado a ' + to, 'success');

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
console.log('[Email Module] v2.0.0 loaded');
