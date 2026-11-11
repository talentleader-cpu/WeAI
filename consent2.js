/* consent2.js — insignia de consentimiento de grabación en la ficha del candidato (solo lectura). */
(function(){
  'use strict';
  var e=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c];});};

  async function paint(){
    try{
      var meta=document.getElementById('dMeta'); var c=window.drawerCand;
      if(!meta||!c||!window.sb) return;
      var b=document.getElementById('consentBadge');
      if(!b){
        b=document.createElement('span'); b.id='consentBadge';
        b.style.cssText='margin-left:10px;padding:3px 10px;border-radius:999px;font-size:12px;border:1px solid #d6dee6;color:#5a6f84;background:#fff';
        meta.appendChild(b);
      }
      var cid=c.id; b.textContent='Grabación: …';
      var r=await window.sb.from('recording_consents').select('accepted_at,created_at,text_version').eq('candidate_id',cid).order('created_at',{ascending:false}).limit(1);
      if(window.drawerCand!==c) return; // el drawer cambió de candidato mientras cargaba
      var row=(r.data&&r.data[0])||null;
      if(!row){ b.textContent='Grabación: sin solicitar'; b.title='Todavía no se le ha enviado la confirmación de grabación.'; return; }
      if(row.accepted_at){
        b.textContent='Grabación: aceptada'; b.style.borderColor='#1f8a4c'; b.style.color='#1f8a4c';
        b.title='Aceptó el '+new Date(row.accepted_at).toLocaleString('es-MX')+' · texto '+row.text_version;
      }else{
        b.textContent='Grabación: pendiente'; b.style.borderColor='#b26a00'; b.style.color='#b26a00';
        b.title='Se le envió el enlace el '+new Date(row.created_at).toLocaleString('es-MX')+', aún no confirma. Pídele que confirme antes de iniciar la entrevista.';
      }
    }catch(x){}
  }

  var orig=window.openDrawer;
  if(typeof orig==='function'){
    window.openDrawer=function(){ var r=orig.apply(this,arguments); setTimeout(paint,50); return r; };
  }
})();
