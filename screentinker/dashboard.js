const express = require('express');
const router = express.Router();

const SHEETS_API_KEY = 'AIzaSyASl_QqcJfdSoNDAtS1wnlBk5LL0IVFSSk';
const SPREADSHEET_ID = '1pi30XNUTeeUNZGBhsCq7Rf282vvdQJbO6PfXhKzirN0';
const RANGE = 'Hoja 1!A1:C100';

async function fetchSheetData() {
  const url = 'https://sheets.googleapis.com/v4/spreadsheets/' + SPREADSHEET_ID + '/values/' + encodeURIComponent(RANGE) + '?key=' + SHEETS_API_KEY;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Sheets API error: ' + res.status);
  const json = await res.json();
  if (!json.values || json.values.length < 2) return [];
  const headers = json.values[0];
  return json.values.slice(1).map(function(row) {
    const obj = {};
    headers.forEach(function(h, i) {
      obj[h] = isNaN(row[i]) ? row[i] : Number(row[i]);
    });
    return obj;
  });
}

router.get('/', async (req, res) => {
  try {
    const data = JSON.stringify(await fetchSheetData());
    const t = Date.now();

    const html = '<!DOCTYPE html><html><head>' +
    '<meta charset="UTF-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">' +
    '<title>Dashboard #' + t + '</title>' +
    '<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js"></script>' +
    '<style>' +
    '*{margin:0;padding:0;box-sizing:border-box}' +
    'html,body{width:100%;height:100%;background:#1a1a2e;color:#fff;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;overflow:hidden}' +
    '.d{display:flex;flex-direction:column;height:100vh;padding:20px;gap:16px}' +
    '.h{display:flex;justify-content:space-between;align-items:center;padding:8px 0}' +
    '.t{font-size:24px;font-weight:700}' +
    '.u{font-size:12px;opacity:0.5}' +
    '.c{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px}' +
    '.cd{background:#16213e;border-radius:12px;padding:16px;text-align:center}' +
    '.cv{font-size:32px;font-weight:700;margin-top:4px;color:#4ade80}' +
    '.cl{font-size:13px;opacity:0.6}' +
    '.ch{flex:1;min-height:0;background:#16213e;border-radius:12px;padding:16px}' +
    '.ch canvas{width:100%!important;height:100%!important}' +
    '</style></head><body>' +
    '<div class="d">' +
    '<div class="h"><div class="t">Dashboard</div><div class="u" id="u"></div></div>' +
    '<div class="c" id="c"></div>' +
    '<div class="ch"><canvas id="ch"></canvas></div>' +
    '</div>' +
    '<script>' +
    '(function(){' +
    'var D=' + data + ';' +
    'var _ts=' + t + ';' +
    'if(!D||!D.length){document.getElementById("u").textContent="Sin datos";return}' +
    'var k=Object.keys(D[0]).filter(function(x){return x!=="mes"&&typeof D[0][x]==="number"});' +
    'var tot={};k.forEach(function(x){tot[x]=D.reduce(function(s,r){return s+(Number(r[x])||0)},0)});' +
    'document.getElementById("c").innerHTML=k.map(function(x){' +
    'return \'<div class="cd"><div class="card-label">\'+x+\'</div><div class="cv">\'+Number(tot[x]).toLocaleString()+\'</div></div>\'' +
    '}).join("");' +
    'var colors={};' +
    'k.forEach(function(x,i){colors[x]=["rgba(74,124,255,0.5)","rgba(255,107,107,0.5)","rgba(74,255,128,0.5)"][i%3]});' +
    'var borders={};' +
    'k.forEach(function(x,i){borders[x]=["#4a7cff","#ff6b6b","#4ade80"][i%3]});' +
    'new Chart(document.getElementById("ch"),{type:"bar",data:{labels:D.map(function(r){return r.mes}),' +
    'datasets:k.map(function(x){return{x:x,data:D.map(function(r){return Number(r[x])||0}),' +
    'backgroundColor:colors[x]||"rgba(136,136,136,0.5)",borderColor:borders[x]||"#888",borderWidth:2,borderRadius:4}})},' +
    'options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:"#fff",font:{size:13}}}},' +
    'scales:{x:{ticks:{color:"#fff8"},grid:{color:"#fff2"}},y:{beginAtZero:true,ticks:{color:"#fff8"},grid:{color:"#fff2"}}}}});' +
    'document.getElementById("u").textContent="Actualizado: "+new Date().toLocaleTimeString("es-MX");' +
    '})()' +
    '</script></body></html>';

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.send(html);
  } catch (err) {
    res.status(500).send('<html><body style="background:#1a1a2e;color:#ff6b6b;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif"><h1>Error: ' + err.message + '</h1></body></html>');
  }
});

module.exports = router;
