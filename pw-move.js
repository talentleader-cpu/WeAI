/* WeAI - mover candidatos de una posición a otra desde el pipeline (2026-11-13)
   Usa la selección múltiple existente (pwBulkSel) y la RPC move_applications. Correo de bienvenida: pregunta explícita Sí/No, sin opción por defecto. */
(function () {
  if (window.__pwmInstalled) return;
  var POS = null;
  function E(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function close() { var m = document.getElementById('pwmModal'); if (m) m.remove(); }
  async function loadPositions() {
    if (POS) return POS;
    var r = await sb.from('positions').select('id,title,status,clients(name)').order('created_at', { ascending: false }).limit(2000);
    if (r.error) throw r.error;
    POS = r.data || [];
    return POS;
  }
  function listHtml(q, incl) {
    var cur = (typeof pwPos !== 'undefined' && pwPos) ? pwPos.id : null;
    var n = String(q || '').toLowerCase().trim();
    var rows = (POS || []).filter(function (p) {
      if (p.id === cur) return false;
      if (!incl && p.status !== 'open') return false;
      if (!n) return true;
      return (p.title + ' ' + ((p.clients || {}).name || '')).toLowerCase().indexOf(n) >= 0;
    }).slice(0, 60);
    if (!rows.length) return '<div style="padding:14px;color:#6b7a88;font-size:13px">No hay posiciones que coincidan.</div>';
    return rows.map(function (p) {
      return '<label style="display:flex;gap:10px;align-items:flex-start;padding:9px 12px;border-bottom:1px solid #eef2f6;cursor:pointer">' +
        '<input type="radio" name="pwmTo" value="' + E(p.id) + '" data-open="' + (p.status === 'open' ? '1' : '0') + '" style="margin-top:3px">' +
        '<span><b style="font-size:13.5px">' + E(p.title) + '</b><br><span style="font-size:12px;color:#6b7a88">' + E((p.clients || {}).name || 'Sin cliente') + (p.status !== 'open' ? ' · ' + E(p.status) : '') + '</span></span></label>';
    }).join('');
  }
  function refreshList() {
    var q = (document.getElementById('pwmQ') || {}).value || '';
    var incl = !!(document.getElementById('pwmIncl') || {}).checked;
    var box = document.getElementById('pwmList'); if (box) box.innerHTML = listHtml(q, incl);
    syncWelcome();
  }
  function syncWelcome() {
    var sel = document.querySelector('input[name="pwmTo"]:checked');
    var mail = document.querySelector('input[name="pwmMail"]:checked');
    var hint = document.getElementById('pwmWelcomeHint');
    var open = !sel || sel.getAttribute('data-open') === '1';
    if (hint) hint.textContent = (!open && mail && mail.value === 'yes') ? 'Ojo: la posición destino no está abierta, así que el correo no se enviará.' : '';
    var btn = document.getElementById('pwmGo'); if (btn) btn.disabled = !(sel && mail);
  }
  window.pwmOpen = async function () {
    var ids = (typeof pwBulkSel !== 'undefined' && pwBulkSel) ? Array.from(pwBulkSel) : [];
    if (!ids.length) return;
    close();
    var m = document.createElement('div');
    m.id = 'pwmModal';
    m.style.cssText = 'position:fixed;inset:0;background:rgba(15,34,51,.45);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px';
    m.innerHTML = '<div style="background:#fff;border-radius:14px;max-width:560px;width:100%;max-height:90vh;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,.3)">' +
      '<div style="padding:16px 18px;border-bottom:1px solid #e4ecf2"><b style="font-size:16px">Mover ' + ids.length + (ids.length === 1 ? ' candidato' : ' candidatos') + ' a otra posición</b>' +
      '<div style="font-size:12.5px;color:#6b7a88;margin-top:4px">Se reinician en “All candidates” de la nueva posición y se conserva el historial. Se quitan de la posición actual.</div></div>' +
      '<div style="padding:12px 18px 0"><input id="pwmQ" placeholder="Buscar posición o cliente…" style="width:100%;padding:9px 10px;border:1px solid #cfdcf2;border-radius:8px;font-size:13.5px;box-sizing:border-box">' +
      '<label style="display:flex;gap:6px;align-items:center;font-size:12.5px;margin-top:8px;color:#33414d"><input id="pwmIncl" type="checkbox"> Incluir posiciones no abiertas</label></div>' +
      '<div id="pwmList" style="margin:10px 18px;border:1px solid #e4ecf2;border-radius:10px;overflow:auto;min-height:120px;max-height:300px"><div style="padding:14px;color:#6b7a88;font-size:13px">Cargando…</div></div>' +
      '<div style="padding:0 18px 6px"><b style="font-size:13.5px">¿Enviar correo de bienvenida a los candidatos movidos?</b>' +
      '<div style="font-size:12px;color:#6b7a88;margin:2px 0 6px">Si la posición está abierta, reciben los pasos completos de la nueva posición (video entrevista y evaluaciones). Elige una opción para continuar.</div>' +
      '<label style="display:flex;gap:8px;align-items:center;font-size:13.5px;margin-bottom:4px"><input type="radio" name="pwmMail" value="yes"> Sí, enviar correo de bienvenida</label>' +
      '<label style="display:flex;gap:8px;align-items:center;font-size:13.5px"><input type="radio" name="pwmMail" value="no"> No, moverlos sin enviar correo</label>' +
      '<div id="pwmWelcomeHint" style="font-size:12px;color:#b45309;margin-top:4px"></div></div>' +
      '<div id="pwmMsg" style="padding:0 18px;font-size:13px"></div>' +
      '<div style="display:flex;justify-content:flex-end;gap:8px;padding:14px 18px;border-top:1px solid #e4ecf2"><button id="pwmCancel" class="btn-ghost" type="button">Cancelar</button><button id="pwmGo" class="btn-prim" type="button" disabled>Mover</button></div></div>';
    document.body.appendChild(m);
    m.addEventListener('click', function (e) { if (e.target === m) close(); });
    document.getElementById('pwmCancel').onclick = close;
    document.getElementById('pwmQ').oninput = refreshList;
    document.getElementById('pwmIncl').onchange = refreshList;
    document.getElementById('pwmList').onchange = syncWelcome;
    m.querySelectorAll('input[name="pwmMail"]').forEach(function (r) { r.onchange = syncWelcome; });
    document.getElementById('pwmGo').onclick = go;
    try { await loadPositions(); refreshList(); }
    catch (e) { document.getElementById('pwmList').innerHTML = '<div style="padding:14px;color:#b91c1c;font-size:13px">No se pudieron cargar las posiciones.</div>'; }
  };
  async function go() {
    var sel = document.querySelector('input[name="pwmTo"]:checked'); if (!sel) return;
    var ids = Array.from(pwBulkSel);
    var mailSel = document.querySelector('input[name="pwmMail"]:checked'); if (!mailSel) return;
    var welcome = mailSel.value === 'yes';
    var btn = document.getElementById('pwmGo'), msg = document.getElementById('pwmMsg');
    btn.disabled = true; btn.textContent = 'Moviendo…';
    var r = await sb.rpc('move_applications', { p_application_ids: ids, p_to_position_id: sel.value, p_send_welcome: welcome, p_reset_stage: true });
    if (r.error) { msg.style.color = '#b91c1c'; msg.textContent = 'No se pudo mover: ' + r.error.message; btn.disabled = false; btn.textContent = 'Mover'; return; }
    var d = r.data || {}, sk = d.skipped || [];
    var txt = 'Listo: ' + d.moved + ' movido(s) a ' + (d.to || 'la nueva posición') + (welcome ? ' · correo de bienvenida solicitado a ' + d.welcome_requested : '') + '.';
    if (sk.length) txt += ' Omitidos ' + sk.length + ': ' + sk.slice(0, 5).map(function (s) { return s.name + ' (' + String(s.reason).replace(/_/g, ' ') + ')'; }).join(', ') + '.';
    msg.style.color = '#166534'; msg.textContent = txt;
    btn.textContent = 'Cerrar'; btn.disabled = false; btn.onclick = close;
    document.getElementById('pwmCancel').style.display = 'none';
    try { pwBulkSel.clear(); pwBulkMode = false; } catch (_) {}
    try { var id = pwPos && pwPos.id; if (id) await openJob(id, 'jobs'); } catch (_) {}
  }
  function install() {
    window.__pwmInstalled = true;
    var orig = window.pwCandidates;
    window.pwCandidates = function () {
      var html = orig.apply(this, arguments);
      if (typeof html === 'string' && html.indexOf('class="pboard-bulkbar"') >= 0) {
        var n = pwBulkSel ? pwBulkSel.size : 0;
        html = html.replace(/(<div class="pboard-bulkbar"[^>]*>)/, '$1<button type="button" class="btn-ghost" ' + (n ? '' : 'disabled ') + 'onclick="pwmOpen()" style="font-weight:700">Mover a otra posición</button>');
      }
      return html;
    };
  }
  (function wait(n) {
    if (typeof window.pwCandidates === 'function' && typeof pwBulkSel !== 'undefined') install();
    else if (n < 200) setTimeout(function () { wait(n + 1); }, 300);
  })(0);
})();
