// Google Apps Script — Alternative approach (not recommended for real-time)
// This is kept for reference. The preferred approach is html/dashboard.html
// which fetches directly from Google Sheets API v4 from the client side.

// CONFIG: Replace with your values
var SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/YOUR_ID/pub?gid=0&single=true&output=csv';

function doGet(e) {
  var t = (e && e.parameter && e.parameter._t) || '';

  var data = [];
  try {
    var csvUrl = SHEET_CSV_URL + '&_cb=' + t;
    var response = UrlFetchApp.fetch(csvUrl, { muteHttpExceptions: true });
    var csv = response.getContentText();
    var lines = csv.trim().split('\n');
    if (lines.length >= 2) {
      var headers = lines[0].split(',').map(function(h) { return h.trim(); });
      for (var i = 1; i < lines.length; i++) {
        var values = lines[i].split(',').map(function(v) { return v.trim(); });
        var row = {};
        headers.forEach(function(h, idx) {
          row[h] = isNaN(values[idx]) ? values[idx] : Number(values[idx]);
        });
        data.push(row);
      }
    }
  } catch (err) {
    data = [];
  }

  var dataJson = JSON.stringify(data);
  var t2 = Date.now();
  var html = '<!DOCTYPE html><html><head>' +
    '<meta charset="UTF-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>Dashboard</title>' +
    '<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js"><\/script>' +
    '<style>' +
    '*{margin:0;padding:0;box-sizing:border-box}' +
    'html,body{width:100%;height:100%;background:#1a1a2e;color:#fff;font-family:-apple-system,sans-serif;overflow:hidden}' +
    '.d{display:flex;flex-direction:column;height:100vh;padding:20px;gap:16px}' +
    '.h{display:flex;justify-content:space-between;align-items:center}' +
    '.t{font-size:24px;font-weight:700}' +
    '.u{font-size:12px;opacity:0.5}' +
    '.c{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px}' +
    '.cd{background:#16213e;border-radius:12px;padding:16px;text-align:center}' +
    '.cv{font-size:32px;font-weight:700;margin-top:4px;color:#4ade80}' +
    '.cl{font-size:13px;opacity:0.6}' +
    '.ch{flex:1;min-height:0;background:#16213e;border-radius:12px;padding:16px}' +
    '.ch canvas{width:100%!important;height:100%!important}' +
    '</style></head><body>' +
    '<div class="d"><div class="h"><div class="t">Dashboard</div><div class="u" id="u"></div></div>' +
    '<div class="c" id="c"></div><div class="ch"><canvas id="ch"></canvas></div></div>' +
    '<script>(function(){var D=' + dataJson + ';' +
    'if(!D||!D.length){document.getElementById("u").textContent="Sin datos";return}' +
    'var k=Object.keys(D[0]).filter(function(x){return x!=="mes"&&typeof D[0][x]==="number"});' +
    'var tot={};k.forEach(function(x){tot[x]=D.reduce(function(s,r){return s+(Number(r[x])||0)},0)});' +
    'document.getElementById("c").innerHTML=k.map(function(x){return \'<div class="cd"><div class="cl">\'+x+\'</div><div class="cv">\'+Number(tot[x]).toLocaleString()+\'</div></div>\'}).join("");' +
    'var colors=["rgba(74,124,255,0.5)","rgba(255,107,107,0.5)","rgba(74,255,128,0.5)"];' +
    'var bdr=["#4a7cff","#ff6b6b","#4ade80"];' +
    'new Chart(document.getElementById("ch"),{type:"bar",data:{labels:D.map(function(r){return r.mes}),' +
    'datasets:k.map(function(x,i){return{label:x,data:D.map(function(r){return Number(r[x])||0}),backgroundColor:colors[i%3],borderColor:bdr[i%3],borderWidth:2,borderRadius:4}})}' +
    ',options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:"#fff"}}},' +
    'scales:{x:{ticks:{color:"#fff8"},grid:{color:"#fff2"}},y:{beginAtZero:true,ticks:{color:"#fff8"},grid:{color:"#fff2"}}}}});' +
    'document.getElementById("u").textContent="Actualizado: "+new Date().toLocaleTimeString("es-MX")})()<\/script></body></html>';

  return HtmlService.createHtmlOutput(html)
    .setTitle('Dashboard')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
