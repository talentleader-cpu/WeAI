// WeAI portfolio.js (2026-11-27): portfolio for positions with positions.portfolio_required (e.g. Video Editor - 253).
// Shows the portfolio the candidate submitted inside "Documents & video" and adds a "Portfolio" toggle to the client view settings.
(function(){
  if(window.__wxPortfolio) return; window.__wxPortfolio = true;
  var reqCache = {};
  async function posRequired(pid){
    if(!pid) return false;
    if(pid in reqCache) return reqCache[pid];
    try{
      var r = await sb.from('positions').select('portfolio_required').eq('id', pid).maybeSingle();
      reqCache[pid] = !!(r && r.data && r.data.portfolio_required);
    }catch(e){ reqCache[pid] = false; }
    return reqCache[pid];
  }
  function safeUrl(u){
    u = String(u || '').trim();
    if(!u) return '';
    if(/^https?:\/\//i.test(u)) return u;
    if(/^[a-z][a-z0-9+.-]*:/i.test(u)) return '';
    return 'https://' + u;
  }
  function escH(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }

  async function addRow(a){
    if(!a || !a.id) return;
    window.__wxPfLast = a.id;
    if(!(await posRequired(a.position_id))) return;
    var r = await sb.from('applications').select('portfolio_url,portfolio_file_url,portfolio_file_name,portfolio_submitted_at').eq('id', a.id).maybeSingle();
    if(window.__wxPfLast !== a.id) return;
    var box = document.getElementById('pwpDocs'); if(!box) return;
    var old = box.querySelector('.wx-portfolio-row'); if(old) old.remove();
    var d = (r && r.data) || {};
    var link = safeUrl(d.portfolio_url);
    var file = (d.portfolio_file_url && /^https?:\/\//i.test(d.portfolio_file_url)) ? d.portfolio_file_url : '';
    var has = !!(link || file);
    var html = '<span class="dn">Portfolio (required)</span><span class="ds ' + (has ? 'ok' : '') + '">' + (has ? 'Submitted ✓' : 'Not submitted yet') + '</span>';
    if(link) html += '<a class="btn-ghost" href="' + escH(link) + '" target="_blank" rel="noopener">Open link</a>';
    if(file) html += '<a class="btn-ghost" href="' + escH(file) + '" target="_blank" rel="noopener">' + escH(d.portfolio_file_name || 'Open file') + '</a>';
    var div = document.createElement('div');
    div.className = 'pwdoc wx-portfolio-row';
    div.innerHTML = html;
    box.appendChild(div);
  }

  var oRender = window.pwDocsRender;
  if(typeof oRender === 'function'){
    window.pwDocsRender = function(a){
      var out = oRender.apply(this, arguments);
      try{ addRow(a); }catch(e){}
      return out;
    };
  }

  async function injectToggle(){
    if(typeof pwPos === 'undefined' || !pwPos) return;
    if(!(await posRequired(pwPos.id))) return;
    var ref = document.getElementById('cvf_matrix_pdf');
    if(!ref || document.getElementById('cvf_portfolio')) return;
    var lab = ref.closest('label'); if(!lab || !lab.parentNode) return;
    var f = pwPos.client_view_fields || {};
    var n = document.createElement('label');
    n.style.cssText = lab.style.cssText;
    n.innerHTML = '<input type="checkbox" id="cvf_portfolio" ' + (f.portfolio !== false ? 'checked' : '') + ' style="width:16px;height:16px;flex:0 0 auto;margin-top:2px;accent-color:var(--blue)"><span><span>Portfolio</span><div class="muted" style="font-size:11px;margin-top:1px">The portfolio link or file the candidate submitted. Only for positions that require a portfolio.</div></span>';
    lab.parentNode.insertBefore(n, lab.nextSibling);
  }
  var oOpen = window.pwOpenClientView;
  if(typeof oOpen === 'function'){
    window.pwOpenClientView = async function(){
      var out = await oOpen.apply(this, arguments);
      try{ await injectToggle(); }catch(e){}
      return out;
    };
  }
  var oSave = window.pwSaveClientView;
  if(typeof oSave === 'function'){
    window.pwSaveClientView = async function(){
      var cb = document.getElementById('cvf_portfolio');
      var val = cb ? cb.checked : null;
      var out = await oSave.apply(this, arguments);
      if(cb !== null && typeof pwPos !== 'undefined' && pwPos){
        try{
          var nf = Object.assign({}, pwPos.client_view_fields || {}, { portfolio: val });
          var u = await sb.from('positions').update({ client_view_fields: nf }).eq('id', pwPos.id);
          if(!u.error) pwPos.client_view_fields = nf;
        }catch(e){}
      }
      return out;
    };
  }
})();
