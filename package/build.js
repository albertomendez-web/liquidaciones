#!/usr/bin/env node
/**
 * build.js — Liquidaciones-GTC Build System
 * 
 * Concatena los módulos de src/ en un solo index.html
 * Uso: node build.js
 * 
 * Estructura:
 *   src/head.html            — DOCTYPE, meta, fonts, external scripts
 *   src/styles.css           — Todo el CSS (<style>...</style>)
 *   src/body.html            — HTML body + apertura <script>
 *   src/00-versioning.js     — APP_VERSION, APP_BUILD, CHANGELOG
 *   src/01-utils.js          — esc, fmt, toast, copyVal, SafeStorage, debounce, safeGet
 *   src/02-i18n.js           — I18N data + t() function
 *   src/03-config.js         — Constants, state, DOMContentLoaded init
 *   src/04-google.js         — OAuth, Picker, Sheets read/load, sheet history
 *   src/04b-persistence.js   — Config tab persistence, propietarios, write-back
 *   src/04c-sync.js          — Multi-user sync polling system
 *   src/04d-core.js          — GTC config, cache, filters, calcLiquidacion, data parsing
 *   src/04e-navigation.js    — showScreen, columns, sorting, stats, renderTable
 *   src/05-tables.js         — CE system, table rendering details
 *   src/06-views.js          — viewDetail, consolDetail, monthly deductions
 *   src/07-generate.js       — handleGenerar, print cards, PDF
 *   src/08-ai.js             — AI assistant panel
 *   src/tail.html            — </script>, email-module loader, init, closing
 */

const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'src');
const OUT = path.join(__dirname, 'index.html');

// Orden de concatenación — NO cambiar sin actualizar los módulos
const PARTS = [
  'head.html',
  'styles.css',
  'body.html',
  '00-versioning.js',
  '01-utils.js',
  '02-i18n.js',
  '03-config.js',
  '04-google.js',
  '04b-persistence.js',
  '04c-sync.js',
  '04d-core.js',
  '04e-navigation.js',
  '05-tables.js',
  '06-views.js',
  '07-generate.js',
  '08-ai.js',
  '09-invoicing.js',
  'tail.html',
];

// Leer y concatenar
let output = '';
let errors = [];

for (const file of PARTS) {
  const fp = path.join(SRC, file);
  if (!fs.existsSync(fp)) {
    errors.push(`  ✗ ${file} — NO ENCONTRADO`);
    continue;
  }
  const content = fs.readFileSync(fp, 'utf8');
  output += content;
}

if (errors.length) {
  console.error('❌ Build fallido — archivos faltantes:');
  errors.forEach(e => console.error(e));
  process.exit(1);
}

// Escribir
fs.writeFileSync(OUT, output, 'utf8');

// Stats
const lines = output.split('\n').length;
const kb = (Buffer.byteLength(output, 'utf8') / 1024).toFixed(1);
console.log(`✅ index.html generado — ${lines} líneas, ${kb} KB`);

// Verificar sintaxis JS (extraer bloque <script>)
const match = output.match(/<script>\n([\s\S]*?)\n<\/script>/);
if (match) {
  try {
    new Function(match[1]);
    console.log('✅ Sintaxis JS verificada');
  } catch (e) {
    console.error('⚠️  Error de sintaxis JS: ' + e.message);
    // No exit(1) — deja que el usuario decida
  }
}

// Mostrar módulos
console.log('\nMódulos ensamblados:');
for (const file of PARTS) {
  const fp = path.join(SRC, file);
  const lc = fs.readFileSync(fp, 'utf8').split('\n').length;
  const pad = file.padEnd(25);
  console.log(`  ${pad} ${String(lc).padStart(5)} líneas`);
}
