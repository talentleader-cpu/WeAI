/* Wexpand \u00b7 Centro de agentes (cerebro + r\u00fabricas de evaluaci\u00f3n) para cualquier plataforma.
   Uso: <script src="https://weai.wexpandmx.com/wx-agentes.js" data-plataforma="growth|sim|weai" defer></script>
   Opcional: data-boton="no" para no mostrar el bot\u00f3n flotante y abrir con WXAgentes.open('cerebro'|'rubricas'). */
(function () {
  if (window.WXAgentes) return;
  var me = document.currentScript || document.querySelector('script[src*="wx-agentes.js"]');
  var ORIGEN = 'https://weai.wexpandmx.com';
  var plat = (me && me.dataset.plataforma) || (/^growth|wexpand-growth/.test(location.hostname) ? 'growth' : /^camp\.|training-camp/.test(location.hostname) ? 'sim' : 'weai');
  var FROM = { growth: 'growth', sim: 'sim', weai: 'recruiting' }[plat] || '';
  var css = '#wxaBtn{position:fixed;right:18px;bottom:18px;z-index:2147483000;display:flex;gap:6px;font-family:Montserrat,Arial,sans-serif}' +
    '#wxaBtn button{border:0;border-radius:999px;padding:10px 15px;font-size:13px;font-weight:700;cursor:pointer;box-shadow:0 6px 18px rgba(0,30,60,.28);display:flex;align-items:center;gap:7px}' +
    '#wxaBtn .c{background:#00415E;color:#fff}#wxaBtn .r{background:#F07E2E;color:#fff}' +
    '#wxaBtn i{width:8px;height:8px;border-radius:50%;background:#4be3a0;box-shadow:0 0 8px #4be3a0}' +
    '#wxaOv{position:fixed;inset:0;z-index:2147483001;background:rgba(3,12,20,.6);display:flex;align-items:stretch;justify-content:stretch;padding:14px}' +
    '#wxaOv .box{position:relative;flex:1;border-radius:14px;overflow:hidden;background:#050d16;box-shadow:0 20px 60px rgba(0,0,0,.5)}' +
    '#wxaOv iframe{border:0;width:100%;height:100%;display:block;background:#eef4f9}' +
    '#wxaOv .x{position:absolute;top:8px;right:10px;z-index:2;background:#fff;color:#00415E;border:0;border-radius:8px;padding:6px 11px;font:700 12.5px Arial,sans-serif;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.3)}' +
    '#wxaOv .nt{position:absolute;top:8px;right:92px;z-index:2;background:rgba(255,255,255,.92);color:#00415E;border-radius:8px;padding:6px 11px;font:700 12.5px Arial,sans-serif;text-decoration:none}' +
    '@media(max-width:640px){#wxaBtn{left:12px;right:12px;bottom:12px;justify-content:flex-end}#wxaOv{padding:0}#wxaOv .box{border-radius:0}}';
  function url(v) { return ORIGEN + '/agentes.html?embed=1&p=' + encodeURIComponent(plat) + '&from=' + encodeURIComponent(FROM) + '&v=' + encodeURIComponent(v || 'cerebro'); }
  function open(v) {
    close();
    var ov = document.createElement('div'); ov.id = 'wxaOv';
    ov.innerHTML = '<div class="box"><a class="nt" target="_blank" rel="noopener" href="' + url(v).replace('embed=1&', '') + '">Abrir en pesta\u00f1a \u2197</a><button class="x" type="button" aria-label="Cerrar">Cerrar \u2715</button><iframe title="Centro de agentes Wexpand" allow="fullscreen" src="' + url(v) + '"></iframe></div>';
    ov.querySelector('.x').onclick = close;
    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
    document.body.appendChild(ov);
    document.addEventListener('keydown', esc);
  }
  function esc(e) { if (e.key === 'Escape') close(); }
  function close() { var o = document.getElementById('wxaOv'); if (o) o.remove(); document.removeEventListener('keydown', esc); }
  function boot() {
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    if (me && me.dataset.boton === 'no') return;
    var b = document.createElement('div'); b.id = 'wxaBtn';
    b.innerHTML = '<button class="c" type="button" data-v="cerebro"><i></i>Cerebro</button><button class="r" type="button" data-v="rubricas">R\u00fabricas de agentes</button>';
    b.querySelectorAll('button').forEach(function (x) { x.onclick = function () { open(x.dataset.v); }; });
    document.body.appendChild(b);
  }
  window.WXAgentes = { open: open, close: close };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
