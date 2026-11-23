/* cvedit.js — Editor + control de calidad del CV Wexpand (por posición).
   - Guarda el CV estructurado (application_cv) al convertir.
   - Editor manual por sección + caja de instrucciones para la IA (cv-assist).
   - Alertas de calidad automáticas.
   - El reclutador marca "revisado" (quién y cuándo) antes de que el cliente vea el CV. */
(function(){
'use strict';
if(window.__wxCvEdit) return; window.__wxCvEdit=1;
function E(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function T(m){ try{ if(typeof toast==='function') toast(m); }catch(_){} }
function clone(o){ return JSON.parse(JSON.stringify(o)); }
function fmt(d){ try{ return new Date(d).toLocaleString('es-MX',{dateStyle:'medium',timeStyle:'short'}); }catch(_){ return String(d||''); } }
function uid(){ try{ return (typeof currentUser!=='undefined'&&currentUser&&currentUser.id)||null; }catch(_){ return null; } }
function findApp(id){ try{ return (typeof pwApps!=='undefined')?pwApps.find(function(x){return x.id===id}):null; }catch(_){ return null; } }
var STATUS={};   // appId -> {status, reviewed_at, reviewed_by_name, alerts_count}

/* ---------- estilos ---------- */
(function(){
  if(document.getElementById('wxceCSS')) return;
  var s=document.createElement('style'); s.id='wxceCSS';
  s.textContent=
  '.wxce-bg{position:fixed;inset:0;background:rgba(7,35,58,.55);z-index:100000;display:flex;align-items:stretch;justify-content:center;padding:14px}'+
  '.wxce{background:#f6f9fc;border-radius:16px;width:min(1280px,100%);display:flex;flex-direction:column;overflow:hidden;box-shadow:0 24px 70px rgba(0,0,0,.35);font-family:inherit;color:#1c2a38}'+
  '.wxce-h{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:12px 18px;background:#fff;border-bottom:1px solid #e3eaf1}'+
  '.wxce-h b{font-size:15px;color:#0f2233}.wxce-h .sub{font-size:12.5px;color:#6b7a89}'+
  '.wxce-b{flex:1;min-height:0;display:grid;grid-template-columns:minmax(360px,1fr) minmax(320px,1fr);gap:14px;padding:14px}'+
  '@media(max-width:900px){.wxce-b{grid-template-columns:1fr;overflow:auto}.wxce-bg{padding:0}.wxce{border-radius:0}}'+
  '.wxce-col{min-height:0;overflow:auto;display:flex;flex-direction:column;gap:12px}'+
  '.wxce-card{background:#fff;border:1px solid #e3eaf1;border-radius:12px;padding:12px 14px}'+
  '.wxce-card h4{margin:0 0 8px;font-size:12px;letter-spacing:.07em;text-transform:uppercase;color:#4a5b6c}'+
  '.wxce details{background:#fff;border:1px solid #e3eaf1;border-radius:12px;padding:0}'+
  '.wxce summary{cursor:pointer;padding:10px 14px;font-weight:700;font-size:13px;color:#0f2233;list-style:none}'+
  '.wxce summary::-webkit-details-marker{display:none}'+
  '.wxce details>.in{padding:2px 14px 14px;display:flex;flex-direction:column;gap:10px}'+
  '.wxce-l{display:flex;flex-direction:column;gap:3px;font-size:11.5px;color:#6b7a89;font-weight:600}'+
  '.wxce-i,.wxce-t{font:inherit;font-size:13px;font-weight:400;color:#1c2a38;border:1px solid #cfd9e3;border-radius:8px;padding:7px 9px;background:#fff;width:100%;box-sizing:border-box}'+
  '.wxce-t{resize:vertical;min-height:70px;line-height:1.45}'+
  '.wxce-i:focus,.wxce-t:focus{outline:2px solid #bcd7f3;border-color:#0653A1}'+
  '.wxce-row{display:grid;grid-template-columns:1fr 1fr;gap:8px}'+
  '.wxce-item{border:1px dashed #cfd9e3;border-radius:10px;padding:10px;display:flex;flex-direction:column;gap:8px;background:#fbfdff}'+
  '.wxce-bar{display:flex;gap:6px;flex-wrap:wrap;align-items:center}'+
  '.wxce-btn{font:inherit;font-size:12.5px;font-weight:600;border:1px solid #cfd9e3;background:#fff;color:#0f2233;border-radius:8px;padding:6px 11px;cursor:pointer}'+
  '.wxce-btn:hover{background:#f0f5fa}.wxce-btn:disabled{opacity:.5;cursor:default}'+
  '.wxce-btn.pri{background:#0653A1;border-color:#0653A1;color:#fff}.wxce-btn.pri:hover{background:#054582}'+
  '.wxce-btn.ok{background:#1c7a57;border-color:#1c7a57;color:#fff}.wxce-btn.ok:hover{background:#176648}'+
  '.wxce-btn.sm{padding:3px 8px;font-size:12px}'+
  '.wxce-al{display:flex;gap:8px;align-items:flex-start;font-size:12.5px;line-height:1.4;padding:6px 8px;border-radius:8px;margin-top:5px}'+
  '.wxce-al.error{background:#fdeceb;color:#8f1d16}.wxce-al.warn{background:#fff5e0;color:#7a5200}.wxce-al.info{background:#eaf2fb;color:#1e4d86}'+
  '.wxce-al b{white-space:nowrap}'+
  '.wxce-note{font-size:12.5px;line-height:1.45;border-radius:8px;padding:7px 10px;background:#eaf6f0;color:#1c5e45;margin-top:8px}'+
  '.wxce-note.w{background:#fff5e0;color:#7a5200}'+
  '.wxce-prev{background:#fff;border:1px solid #e3eaf1;border-radius:12px;padding:10px;overflow:auto}'+
  '.wxce-f{display:flex;gap:10px;align-items:center;flex-wrap:wrap;padding:11px 18px;background:#fff;border-top:1px solid #e3eaf1}'+
  '.wxce-f label{font-size:12.5px;line-height:1.35;display:flex;gap:7px;align-items:flex-start;max-width:520px}'+
  '.wxce-pill{display:inline-block;border-radius:999px;padding:2px 9px;font-size:11.5px;font-weight:700}'+
  '.wxce-pill.p{background:#fff1d6;color:#7a5200}.wxce-pill.r{background:#e4f3ec;color:#1c7a57}'+
  '.wxce-spin{display:inline-block;width:12px;height:12px;border:2px solid #cfd9e3;border-top-color:#0653A1;border-radius:50%;animation:wxces .7s linear infinite;vertical-align:-2px;margin-right:5px}'+
  '@keyframes wxces{to{transform:rotate(360deg)}}';
  document.head.appendChild(s);
})();

/* ---------- utilidades de datos ---------- */
function getP(o,p){ return p.split('.').reduce(function(x,k){return x==null?x:x[k]},o); }
function setP(o,p,v){ var ks=p.split('.'), t=o; for(var i=0;i<ks.length-1;i++){ if(t[ks[i]]==null) return; t=t[ks[i]]; } t[ks[ks.length-1]]=v; }
var TPL={education:{degree:'',institution:''},experience:{org:'',role:'',dates:'',relevance:'relevant',bullets:[]},projects:{name:'',role:'',bullets:[]},technical:{category:'',items:[]},languages:{name:'',level:''}};
function normalize(cv){
  cv=cv||{}; ['overview','education','experience','projects','skills','technical','languages'].forEach(function(k){ if(!Array.isArray(cv[k])) cv[k]=[]; });
  cv.experience.forEach(function(e){ if(!Array.isArray(e.bullets)) e.bullets=[]; if(e.relevance!=='relevant'&&e.relevance!=='additional') e.relevance='relevant'; });
  cv.projects.forEach(function(e){ if(!Array.isArray(e.bullets)) e.bullets=[]; });
  cv.technical.forEach(function(e){ if(!Array.isArray(e.items)) e.items=[]; });
  return cv;
}
function clean(cv){ // quita líneas vacías antes de guardar/renderizar
  var c=clone(cv); var f=function(a){return (a||[]).map(function(x){return String(x).trim()}).filter(Boolean)};
  c.overview=f(c.overview); c.skills=f(c.skills);
  c.experience.forEach(function(e){e.bullets=f(e.bullets)}); c.projects.forEach(function(e){e.bullets=f(e.bullets)}); c.technical.forEach(function(e){e.items=f(e.items)});
  c.education=c.education.filter(function(e){return (e.degree||e.institution)}); c.languages=c.languages.filter(function(e){return e.name});
  c.technical=c.technical.filter(function(e){return e.category||e.items.length}); c.projects=c.projects.filter(function(e){return e.name||e.bullets.length});
  return c;
}
async function srcTextFor(a){
  var c=(a&&a.candidates)||{}; var url=c.raw_cv_pdf_url||c.resume_url;
  if(!url&&c.id){ try{ var r=await sb.from('candidates').select('raw_cv_pdf_url,resume_url').eq('id',c.id).maybeSingle(); url=r&&r.data&&(r.data.raw_cv_pdf_url||r.data.resume_url); }catch(_){} }
  if(!url) return {text:'',url:''};
  try{ var resp=await fetch(url); var b=await resp.blob(); return {text:await jdReadPdf(b),url:url}; }catch(_){ return {text:'',url:url}; }
}
async function callAssist(body){
  var fr=await sb.functions.invoke('cv-assist',{body:body});
  if(fr.error){ var d=fr.error.message||'Error de la función'; try{ if(fr.error.context&&fr.error.context.clone){ var j=await fr.error.context.clone().json(); if(j&&j.error) d=j.error; } }catch(_){} throw new Error(d); }
  if(fr.data&&fr.data.error) throw new Error(fr.data.error);
  return fr.data;
}
async function loadStatuses(ids){
  if(!ids||!ids.length) return;
  try{ var r=await sb.rpc('application_cv_status',{p_ids:ids}); (r.data||[]).forEach(function(x){ STATUS[x.application_id]=x; }); ids.forEach(function(i){ if(!(r.data||[]).some(function(x){return x.application_id===i})) STATUS[i]=null; }); }catch(_){}
}

/* ---------- 1) Capturar el CV estructurado al convertir ---------- */
var _b=window.wxCvBuildPdfBlob;
if(typeof _b==='function'){ window.wxCvBuildPdfBlob=function(d){ try{ window.__wxLastCv={d:d,t:Date.now()}; }catch(_){} return _b.apply(this,arguments); }; }
var _cc=window.cvConvert;
if(typeof _cc==='function'){
  window.cvConvert=async function(candId,btn,appIdArg){
    window.__wxLastCv=null;
    var r=await _cc.apply(this,arguments);
    try{ var L=window.__wxLastCv; if(L&&L.d&&Date.now()-L.t<240000){ window.__wxLastCv=null; await afterConvert(candId,appIdArg,L.d); } }catch(e){ T('El CV se creó, pero no se pudo preparar la revisión: '+(e.message||e)); }
    return r;
  };
}
async function afterConvert(candId,appIdArg,data){
  var appId=appIdArg;
  if(!appId){
    var q=await sb.from('applications').select('id,wexpand_cv_updated_at').eq('candidate_id',candId).not('wexpand_cv_url','is',null).order('wexpand_cv_updated_at',{ascending:false,nullsFirst:false}).limit(1);
    appId=q&&q.data&&q.data[0]&&q.data[0].id;
  }
  if(!appId) return;
  var a=findApp(appId)||{id:appId,candidates:{id:candId}};
  var src=await srcTextFor(a);
  var cv=normalize(clone(data)); delete cv.tailoring_notes;
  var alerts=[]; try{ var rv=await callAssist({action:'review',cv_data:clean(cv),source_text:src.text}); alerts=rv.alerts||[]; }catch(_){}
  var row={application_id:appId,cv_data:cv,source_text:(src.text||'').slice(0,60000),alerts:alerts,status:'pending_review',reviewed_by:null,reviewed_at:null,edited_by:uid(),edit_count:0,updated_at:new Date().toISOString()};
  var ur=await sb.from('application_cv').upsert(row,{onConflict:'application_id'}); if(ur.error) throw ur.error;
  await loadStatuses([appId]);
  try{ var cur=findApp(appId); if(cur&&typeof pwDocsRender==='function') pwDocsRender(cur); }catch(_){}
  T('CV listo. Pendiente de revisión: el cliente no lo verá hasta que lo marques como revisado.');
  openEditor(appId);
}

/* ---------- 2) Botón + estado en el panel de documentos ---------- */
var _docs=window.pwDocsRender;
if(typeof _docs==='function'){
  window.pwDocsRender=function(a){
    var r=_docs.apply(this,arguments);
    try{ paintDocsRow(a); }catch(_){}
    return r;
  };
}
function badgeHtml(st){
  if(!st) return '';
  if(st.status==='reviewed') return '<span class="wxce-pill r" title="Revisado por '+E(st.reviewed_by_name||'—')+'">✓ Revisado por '+E(st.reviewed_by_name||'—')+' · '+E(fmt(st.reviewed_at))+'</span>';
  return '<span class="wxce-pill p">Pendiente de revisión · el cliente no lo ve</span>';
}
function paintDocsRow(a){
  var row=document.getElementById('wxCvRow'); if(!row||!a) return;
  var old=document.getElementById('wxCvRev'); if(old) old.remove();
  var mine=a.wexpand_cv_url&&a.wexpand_cv_source!=='uploaded';
  if(!a.wexpand_cv_url) return;
  var holder=document.createElement('span'); holder.id='wxCvRev'; holder.style.cssText='display:inline-flex;gap:8px;align-items:center;flex-wrap:wrap';
  row.appendChild(holder);
  function draw(){
    var st=STATUS[a.id];
    holder.innerHTML=badgeHtml(st)+(mine?'<button class="btn-ghost" onclick="wxCvEdit(\''+E(a.id)+'\')">'+(st&&st.status==='reviewed'?'Ver / editar':'Editar y revisar')+'</button>':'');
  }
  if(a.id in STATUS) draw(); else { draw(); loadStatuses([a.id]).then(function(){ draw(); }); }
}

/* ---------- 3) Aviso al compartir con el cliente ---------- */
var _tg=window.pwToggleClientVisible;
if(typeof _tg==='function'){
  window.pwToggleClientVisible=async function(appId){
    var r=_tg.apply(this,arguments);
    try{
      await loadStatuses([appId]); var st=STATUS[appId]; var a=findApp(appId);
      if(st&&st.status!=='reviewed'&&a&&a.client_visible) T('Ojo: el CV Wexpand de este candidato aún no está revisado. El cliente NO verá CV hasta que lo marques como revisado.');
    }catch(_){}
    return r;
  };
}

/* ---------- 4) Editor ---------- */
window.wxCvEdit=function(appId){ openEditor(appId); };
async function openEditor(appId){
  var a=findApp(appId); if(!a){ T('No encontré esa aplicación.'); return; }
  var c=a.candidates||{};
  var r=await sb.from('application_cv').select('*').eq('application_id',appId).maybeSingle();
  var row=r&&r.data;
  if(!row){
    var o=document.createElement('div'); o.className='wxce-bg'; o.style.alignItems='center';
    o.innerHTML='<div class="wxce-card" style="max-width:440px;padding:20px"><b style="font-size:15px">Este CV es anterior al editor</b><p style="font-size:13.5px;line-height:1.5;color:#41505f">Para poder editarlo y revisarlo hay que generarlo de nuevo para esta posición. La versión actual se mantiene hasta que lo hagas.</p><div class="wxce-bar" style="justify-content:flex-end"><button class="wxce-btn" data-x="1">Cerrar</button><button class="wxce-btn pri" data-g="1">Generar de nuevo</button></div></div>';
    document.body.appendChild(o);
    o.addEventListener('click',function(e){ var t=e.target; if(t.getAttribute&&t.getAttribute('data-g')){ o.remove(); window.cvConvert(c.id,null,appId); } else if((t.getAttribute&&t.getAttribute('data-x'))||t===o) o.remove(); });
    return;
  }
  var cv=normalize(clone(row.cv_data));
  var S={cv:cv,alerts:row.alerts||[],status:row.status,reviewed_at:row.reviewed_at,reviewed_by:row.reviewed_by,dirty:false,busy:'',undo:[],srcText:row.source_text||'',edit_count:row.edit_count||0,note:'',noteWarn:false,closeWarn:false,confirm:false};
  var posTitle=(a.positions&&a.positions.title)||(a.position&&a.position.title)||'';
  var reviewer=''; if(row.reviewed_by){ try{ var pr=await sb.from('profiles').select('full_name').eq('id',row.reviewed_by).maybeSingle(); reviewer=(pr.data&&pr.data.full_name)||''; }catch(_){} }
  S.reviewer=reviewer;

  var bg=document.createElement('div'); bg.className='wxce-bg';
  bg.innerHTML='<div class="wxce"><div class="wxce-h"></div><div class="wxce-b"><div class="wxce-col" id="wxceL"></div><div class="wxce-col" id="wxceR"></div></div><div class="wxce-f"></div></div>';
  document.body.appendChild(bg);
  var H=bg.querySelector('.wxce-h'), L=bg.querySelector('#wxceL'), R=bg.querySelector('#wxceR'), F=bg.querySelector('.wxce-f');
  var prevTimer=null, scale=1;

  function counts(){ var e=0,w=0; S.alerts.forEach(function(x){ if(x.level==='error') e++; else if(x.level==='warn') w++; }); return {e:e,w:w}; }
  function paintHead(){
    H.innerHTML='<div><b>Editar CV Wexpand · '+E(c.full_name||S.cv.name||'')+'</b><div class="sub">'+E(posTitle?('Para la posición: '+posTitle):'')+'</div></div><div style="flex:1"></div>'+
      (S.status==='reviewed'&&!S.dirty?'<span class="wxce-pill r">✓ Revisado por '+E(S.reviewer||'—')+' · '+E(fmt(S.reviewed_at))+'</span>':'<span class="wxce-pill p">Pendiente de revisión</span>')+
      (S.dirty?'<span class="wxce-pill p" style="background:#fde2e0;color:#8f1d16">Cambios sin guardar</span>':'')+
      '<button class="wxce-btn" data-a="close">'+(S.closeWarn?'Descartar y cerrar':'Cerrar')+'</button>';
  }
  function paintAlerts(){
    var box=R.querySelector('#wxceAlerts'); if(!box) return; var k=counts();
    var h='<h4>Control de calidad '+(S.busy==='review'?'<span class="wxce-spin"></span>revisando…':'')+'</h4>';
    if(!S.alerts.length&&S.busy!=='review') h+='<div class="wxce-note">Sin alertas. Aun así, revisa el CV completo contra el original antes de marcarlo.</div>';
    else h+='<div style="font-size:12.5px;color:#4a5b6c">'+k.e+' crítica(s) · '+k.w+' advertencia(s)</div>';
    var ord={error:0,warn:1,info:2};
    S.alerts.slice().sort(function(x,y){return (ord[x.level]||3)-(ord[y.level]||3)}).forEach(function(x){
      h+='<div class="wxce-al '+E(x.level)+'"><b>'+(x.level==='error'?'Crítica':x.level==='warn'?'Revisar':'Nota')+'</b><span>'+E(x.message)+'</span></div>';
    });
    h+='<div class="wxce-bar" style="margin-top:10px"><button class="wxce-btn sm" data-a="review"'+(S.busy?' disabled':'')+'>Volver a revisar calidad</button></div>';
    box.innerHTML=h;
  }
  function fld(p,label,type){
    var v=getP(S.cv,p); var val=type==='lines'?(v||[]).join('\n'):type==='csv'?(v||[]).join(', '):type==='paras'?(v||[]).join('\n\n'):(v==null?'':v);
    if(type==='lines'||type==='paras'||type==='csv') return '<label class="wxce-l">'+label+'<textarea class="wxce-t" data-p="'+p+'" data-t="'+type+'" rows="'+(type==='csv'?2:type==='paras'?6:5)+'">'+E(val)+'</textarea></label>';
    return '<label class="wxce-l">'+label+'<input class="wxce-i" data-p="'+p+'" value="'+E(val)+'"></label>';
  }
  function sec(title,key,body,addLabel){
    var n=Array.isArray(S.cv[key])?S.cv[key].length:0;
    return '<details open><summary>'+title+(n?' <span style="font-weight:500;color:#6b7a89">('+n+')</span>':'')+'</summary><div class="in">'+body+(addLabel?'<div><button class="wxce-btn sm" data-a="add:'+key+'">+ '+addLabel+'</button></div>':'')+'</div></details>';
  }
  function tools(key,i,n){ return '<div class="wxce-bar" style="justify-content:flex-end">'+(i>0?'<button class="wxce-btn sm" data-a="mv:'+key+':'+i+':-1" title="Subir">↑</button>':'')+(i<n-1?'<button class="wxce-btn sm" data-a="mv:'+key+':'+i+':1" title="Bajar">↓</button>':'')+'<button class="wxce-btn sm" data-a="del:'+key+':'+i+'">Quitar</button></div>'; }
  function paintForm(){
    var cv=S.cv, h='';
    h+='<div class="wxce-card"><h4>Instrucciones para la IA</h4>'+
      '<textarea class="wxce-t" id="wxceIns" rows="3" placeholder="Ej: agrega su experiencia con Salesforce en el puesto de Acme · resalta su nivel de inglés en el resumen · quita la viñeta de viajes · hazlo más enfocado en soporte al cliente"></textarea>'+
      '<div class="wxce-bar" style="margin-top:8px"><button class="wxce-btn pri" data-a="ai"'+(S.busy?' disabled':'')+'>'+(S.busy==='ai'?'<span class="wxce-spin"></span>Aplicando…':'Aplicar con IA')+'</button>'+(S.undo.length?'<button class="wxce-btn" data-a="undo">Deshacer último cambio de IA</button>':'')+'</div>'+
      '<div style="font-size:11.5px;color:#6b7a89;margin-top:6px">La IA solo usa información que ya está en el CV o en el CV original. Si pides algo que no aparece ahí, te avisa y no lo inventa.</div>'+
      (S.note?'<div class="wxce-note'+(S.noteWarn?' w':'')+'">'+S.note+'</div>':'')+'</div>';
    h+=sec('Nombre','name_','<div class="wxce-row">'+fld('name','Nombre (como aparece en el CV)')+'</div>');
    h+=sec('Overview','overview',fld('overview','Resumen (separa párrafos con una línea en blanco)','paras'));
    h+=sec('Educación','education',(cv.education.map(function(e,i){ return '<div class="wxce-item"><div class="wxce-row">'+fld('education.'+i+'.degree','Título')+fld('education.'+i+'.institution','Institución')+'</div>'+tools('education',i,cv.education.length)+'</div>'; }).join('')),'Agregar educación');
    h+=sec('Experiencia profesional','experience',(cv.experience.map(function(e,i){
      return '<div class="wxce-item"><div class="wxce-row">'+fld('experience.'+i+'.org','Empresa')+fld('experience.'+i+'.role','Puesto')+'</div><div class="wxce-row">'+fld('experience.'+i+'.dates','Fechas')+
        '<label class="wxce-l">Relevancia para la posición<select class="wxce-i" data-p="experience.'+i+'.relevance"><option value="relevant"'+(e.relevance==='relevant'?' selected':'')+'>Relevante</option><option value="additional"'+(e.relevance==='additional'?' selected':'')+'>Adicional</option></select></label></div>'+
        fld('experience.'+i+'.bullets','Actividades y logros (una por línea)','lines')+tools('experience',i,cv.experience.length)+'</div>'; }).join('')),'Agregar empleo');
    h+=sec('Proyectos','projects',(cv.projects.map(function(e,i){ return '<div class="wxce-item"><div class="wxce-row">'+fld('projects.'+i+'.name','Proyecto')+fld('projects.'+i+'.role','Rol')+'</div>'+fld('projects.'+i+'.bullets','Detalles (una por línea)','lines')+tools('projects',i,cv.projects.length)+'</div>'; }).join('')),'Agregar proyecto');
    h+=sec('Skills','skills',fld('skills','Habilidades (una por línea, las más relevantes primero)','lines'));
    h+=sec('Technical skills','technical',(cv.technical.map(function(e,i){ return '<div class="wxce-item">'+fld('technical.'+i+'.category','Categoría')+fld('technical.'+i+'.items','Herramientas (separadas por coma)','csv')+tools('technical',i,cv.technical.length)+'</div>'; }).join('')),'Agregar categoría');
    h+=sec('Idiomas','languages',(cv.languages.map(function(e,i){ return '<div class="wxce-item"><div class="wxce-row">'+fld('languages.'+i+'.name','Idioma')+fld('languages.'+i+'.level','Nivel')+'</div>'+tools('languages',i,cv.languages.length)+'</div>'; }).join('')),'Agregar idioma');
    var top=L.scrollTop; L.innerHTML=h; L.scrollTop=top;
  }
  function paintRight(){
    R.innerHTML='<div class="wxce-card" id="wxceAlerts"></div><div class="wxce-card"><h4>Vista previa (así se verá el PDF)</h4><div class="wxce-bar" style="margin-bottom:8px">'+(S.origUrl?'<a class="wxce-btn sm" style="text-decoration:none" href="'+E(S.origUrl)+'" target="_blank" rel="noopener">Abrir CV original ↗</a>':'')+(a.wexpand_cv_url?'<a class="wxce-btn sm" style="text-decoration:none" href="'+E(a.wexpand_cv_url)+'" target="_blank" rel="noopener">PDF guardado actual ↗</a>':'')+'</div><div class="wxce-prev" id="wxcePrev"></div></div>';
    paintAlerts(); paintPrev();
  }
  function paintPrev(){
    var box=R.querySelector('#wxcePrev'); if(!box) return;
    try{
      var node=window.wxCvNode(clean(S.cv)); box.innerHTML='';
      var w=Math.max(280,box.clientWidth-4); scale=Math.min(1,w/794);
      var wrap=document.createElement('div'); wrap.style.cssText='width:'+(794*scale)+'px;overflow:hidden';
      var inner=document.createElement('div'); inner.style.cssText='width:794px;transform:scale('+scale+');transform-origin:top left';
      inner.appendChild(node); wrap.appendChild(inner); box.appendChild(wrap);
      wrap.style.height=(inner.getBoundingClientRect().height)+'px';
    }catch(e){ box.textContent='No se pudo dibujar la vista previa.'; }
  }
  function schedPrev(){ clearTimeout(prevTimer); prevTimer=setTimeout(paintPrev,350); }
  function paintFoot(){
    var k=counts(); var needAck=true;
    F.innerHTML='<button class="wxce-btn pri" data-a="save"'+(S.busy||!S.dirty?' disabled':'')+'>'+(S.busy==='save'?'<span class="wxce-spin"></span>Guardando…':'Guardar cambios')+'</button>'+
      '<label><input type="checkbox" data-a="ack"'+(S.confirm?' checked':'')+'><span>'+(k.e?'Hay '+k.e+' alerta(s) crítica(s). Confirmo que las revisé y que el CV está correcto y completo frente al original.':'Confirmo que revisé el CV completo contra el original y que no falta información.')+'</span></label>'+
      '<button class="wxce-btn ok" data-a="approve"'+((S.busy||!S.confirm)?' disabled':'')+'>'+(S.busy==='approve'?'<span class="wxce-spin"></span>Marcando…':'Marcar como revisado')+'</button>';
  }
  function paintAll(){ paintHead(); paintForm(); paintRight(); paintFoot(); }
  function touch(){ S.dirty=true; S.closeWarn=false; if(S.status==='reviewed') S.confirm=false; paintHead(); paintFoot(); schedPrev(); }

  /* --- acciones --- */
  async function runReview(){
    S.busy='review'; paintAlerts(); paintFoot();
    try{ var rv=await callAssist({action:'review',cv_data:clean(S.cv),source_text:S.srcText}); S.alerts=rv.alerts||[]; }
    catch(e){ S.alerts=[{id:'x',level:'info',section:'sys',message:'No se pudo correr la revisión automática ('+(e.message||e)+'). Revisa manualmente.'}]; }
    S.busy=''; paintAlerts(); paintFoot();
  }
  async function save(){
    S.busy='save'; paintHead(); paintFoot();
    try{
      var cvc=clean(S.cv);
      // 1) primero queda pendiente en la base (el cliente no ve nada nuevo sin revisión)
      var base={application_id:appId,cv_data:cvc,alerts:S.alerts,status:'pending_review',reviewed_by:null,reviewed_at:null,edited_by:uid(),edit_count:S.edit_count+1,updated_at:new Date().toISOString(),source_text:(S.srcText||'').slice(0,60000)};
      var u1=await sb.from('application_cv').upsert(base,{onConflict:'application_id'}); if(u1.error) throw u1.error;
      // 2) PDF nuevo
      var blob=await window.wxCvBuildPdfBlob(cvc);
      var path='wexpand-cv/'+c.id+'-'+(a.position_id||'general')+'.pdf';
      var up=await sb.storage.from('careers-docs').upload(path,blob,{contentType:'application/pdf',upsert:true}); if(up.error) throw up.error;
      var url=sb.storage.from('careers-docs').getPublicUrl(path).data.publicUrl+'?v='+Date.now();
      var upd={wexpand_cv_url:url,wexpand_cv_source:'auto',wexpand_cv_updated_at:new Date().toISOString()}; if(uid()) upd.wexpand_cv_updated_by=uid();
      var u2=await sb.from('applications').update(upd).eq('id',appId); if(u2.error) throw u2.error;
      a.wexpand_cv_url=url; a.wexpand_cv_source='auto';
      S.edit_count++; S.dirty=false; S.status='pending_review'; S.reviewed_at=null; S.reviewer=''; S.confirm=false; STATUS[appId]={application_id:appId,status:'pending_review'};
      try{ if(typeof pwDocsRender==='function') pwDocsRender(a); }catch(_){}
      T('✓ Cambios guardados y PDF actualizado');
    }catch(e){ T('No se pudo guardar: '+(e.message||e)); S.busy=''; paintAll(); return false; }
    S.busy=''; paintHead(); paintFoot(); paintRight();
    runReview();
    return true;
  }
  async function approve(){
    if(S.dirty){ var ok=await save(); if(!ok) return; }
    S.busy='approve'; paintFoot();
    try{
      var k=counts(); var al=S.alerts.slice(); if(k.e) al.push({id:'ack'+Date.now(),level:'info',section:'review',message:'Marcado como revisado con '+k.e+' alerta(s) crítica(s) confirmada(s) por el reclutador.'});
      var now=new Date().toISOString();
      var r=await sb.from('application_cv').update({status:'reviewed',reviewed_by:uid(),reviewed_at:now,alerts:al}).eq('application_id',appId); if(r.error) throw r.error;
      S.status='reviewed'; S.reviewed_at=now; S.alerts=al;
      try{ var me=await sb.from('profiles').select('full_name').eq('id',uid()).maybeSingle(); S.reviewer=(me.data&&me.data.full_name)||'tú'; }catch(_){ S.reviewer='tú'; }
      STATUS[appId]={application_id:appId,status:'reviewed',reviewed_at:now,reviewed_by_name:S.reviewer};
      try{ if(typeof pwDocsRender==='function') pwDocsRender(a); }catch(_){}
      T('✓ CV marcado como revisado. Ya lo puede ver el cliente (si el candidato está compartido).');
    }catch(e){ T('No se pudo marcar como revisado: '+(e.message||e)); }
    S.busy=''; paintAll();
  }
  async function applyAI(){
    var ta=L.querySelector('#wxceIns'); var ins=(ta&&ta.value||'').trim(); if(!ins){ T('Escribe qué quieres cambiar.'); return; }
    if(!S.srcText){ var s=await srcTextFor(a); S.srcText=s.text||''; }
    S.busy='ai'; S.note=''; paintForm(); paintFoot();
    try{
      var res=await callAssist({action:'instruct',cv_data:clean(S.cv),instruction:ins,source_text:S.srcText,position:{title:posTitle}});
      S.undo.push(clone(S.cv)); S.cv=normalize(res.cv);
      var notes='<b>Cambio aplicado:</b> '+E(res.summary||'listo.');
      if(res.not_applied&&res.not_applied.length){ notes+='<br><b>No se pudo hacer:</b> '+res.not_applied.map(E).join(' · '); S.noteWarn=true; } else S.noteWarn=false;
      S.note=notes+'<br>Revisa la vista previa antes de guardar.';
      S.busy=''; touch(); paintForm(); var t2=L.querySelector('#wxceIns'); if(t2) t2.value='';
      runReview();
    }catch(e){ S.busy=''; S.note='No se pudo aplicar: '+E(e.message||e); S.noteWarn=true; paintForm(); paintFoot(); }
  }

  /* --- eventos --- */
  bg.addEventListener('input',function(e){
    var t=e.target; var p=t.getAttribute&&t.getAttribute('data-p'); if(!p) return;
    var ty=t.getAttribute('data-t'); var v=t.value;
    if(ty==='lines') v=v.split('\n'); else if(ty==='paras') v=v.split(/\n\s*\n/); else if(ty==='csv') v=v.split(',').map(function(x){return x.trim()});
    setP(S.cv,p,v); touch();
  });
  bg.addEventListener('change',function(e){
    var t=e.target;
    if(t.getAttribute&&t.getAttribute('data-a')==='ack'){ S.confirm=t.checked; paintFoot(); return; }
    var p=t.getAttribute&&t.getAttribute('data-p'); if(p&&t.tagName==='SELECT'){ setP(S.cv,p,t.value); touch(); }
  });
  bg.addEventListener('click',function(e){
    var el=e.target.closest&&e.target.closest('[data-a]'); if(!el){ return; }
    var act=el.getAttribute('data-a'); if(act==='ack') return;
    if(act==='close'){ if(S.dirty&&!S.closeWarn){ S.closeWarn=true; paintHead(); T('Tienes cambios sin guardar. Pulsa “Descartar y cerrar” para salir sin guardar.'); return; } bg.remove(); return; }
    if(act==='save'){ save(); return; }
    if(act==='approve'){ approve(); return; }
    if(act==='review'){ runReview(); return; }
    if(act==='ai'){ applyAI(); return; }
    if(act==='undo'){ var prev=S.undo.pop(); if(prev){ S.cv=prev; S.note=''; touch(); paintForm(); runReview(); } return; }
    var parts=act.split(':');
    if(parts[0]==='add'){ var k=parts[1]; S.cv[k].push(clone(TPL[k])); touch(); paintForm(); return; }
    if(parts[0]==='del'){ S.cv[parts[1]].splice(+parts[2],1); touch(); paintForm(); return; }
    if(parts[0]==='mv'){ var arr=S.cv[parts[1]], i=+parts[2], j=i+(+parts[3]); if(j>=0&&j<arr.length){ var x=arr[i]; arr[i]=arr[j]; arr[j]=x; touch(); paintForm(); } return; }
  });

  paintAll();
  srcTextFor(a).then(function(s){ if(s.url){ S.origUrl=s.url; if(!S.srcText) S.srcText=s.text||''; paintRight(); } });
  if(!S.alerts.length) runReview();
}

})();
