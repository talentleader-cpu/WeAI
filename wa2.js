/* wa2.js — WhatsApp conversation panel for a candidate (opens from the candidate drawer). Sending is gated server-side. */
(function(){
  'use strict';
  const e=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  // Approved templates usable by this number. Add new ones here once Meta approves them for the sending account.
  const TEMPLATES=[
    {name:'bienvenida_video_weai',lang:'es_MX',label:'Invitación a video entrevista (bienvenida)',params:['Nombre','Posición','Enlace de la video entrevista'],
     preview:'Hola {1}, gracias por tu interés en la posición {2} de Wexpand. Para continuar con tu proceso, te pedimos grabar una breve video entrevista en este enlace: {3} …'}
  ];
  // Respuestas rápidas (banco del equipo). Solo para mensaje libre (dentro de 24 h de una respuesta). Se insertan en el cuadro y se pueden editar antes de enviar.
  const QUICK=[{"label": "Vacante cerrada (respuesta)","text": "¡Gracias! Desgraciadamente, ya se cerró la vacante, pero cualquier otra oportunidad te la hago llegar. Igual nos quedamos con tu CV para poder contactarte rápido en cuanto algo se abra. ¡Muchas gracias de verdad por el interés!"},{"label": "Vacante cerrada (aviso)","text": "¡Hola! Para mantenerte actualizado(a), nos acaban de avisar que, desgraciadamente, ya se cerró la vacante, pero cualquier otra oportunidad te la hago llegar. Igual nos quedamos con tu CV para poder contactarte rápido en cuanto algo se abra. ¡Muchas gracias de verdad por el interés!"},{"label": "Posición en pausa","text": "¡Súper! La posición ahorita está en pausa; en cuanto se reactive, te estaremos contactando. ¡Muchas gracias por tu mensaje e interés!"},{"label": "Sin posición similar","text": "¡Hola! Por el momento no tenemos alguna posición similar en esa industria, pero puedes dejarme tu CV y en cuanto se abra algo te contactamos."},{"label": "Seguimiento por correo (hoy)","text": "Súper, te daré seguimiento el día de hoy por correo."},{"label": "Correo con actualizaciones","text": "Te acabamos de mandar un correo con actualizaciones. Cualquier duda o retroalimentación que necesites, ¡quedo atenta!"},{"label": "Revisar spam","text": "Puede ser que te haya llegado a spam el correo; revísalo y si no, me dices para reenviarlo."},{"label": "¿A qué posición aplicaste?","text": "Súper, ¿a qué posición aplicaste y cuál es tu nombre?"},{"label": "Pedir nombre","text": "Excelente, ¿cuál es tu nombre para buscarte directamente y darte seguimiento?"},{"label": "¿Reubicación?","text": "Súper! ¿Estás abierto(a) a reubicarte?"},{"label": "Aplicar por Indeed","text": "¡Hola! Te enviamos un mensaje por Indeed para que aplicaras directamente a la posición. ¿Lo pudiste hacer?"},{"label": "Inglés: cliente en EE. UU.","text": "Sí, ya que nuestro cliente es de Estados Unidos y se necesita para la comunicación diaria."},{"label": "Inglés: nivel conversacional","text": "Te platico que para esta posición, debido a que es para un cliente en Estados Unidos, sí necesitamos a alguien con un nivel conversacional, ya que la comunicación sería totalmente en inglés con ellos."},{"label": "Enviar enlace","text": "Claro que sí, te dejo el link por aquí: "},{"label": "Recibir CV","text": "Si quieres enviarme tu CV por aquí, yo lo subo directamente."}];
  const STAT={draft:'Draft',approved:'Approved',rejected:'Rejected',sent:'Sent',delivered:'Delivered',read:'Read',failed:'Failed',received:''};
  let cur=null;
  /* Cola "necesita humano": mensajes de WhatsApp que Wexpandcito no resolvió */
  (function(){
  var rows=[],btn=null,box=null;
  function paintBtn(){
    if(!btn){btn=document.createElement('button');btn.id='waHandBtn';btn.style.cssText='position:fixed;right:16px;bottom:16px;z-index:9998;padding:8px 14px;border-radius:999px;border:1px solid #b45309;background:#fff7ed;color:#b45309;font-size:13px;font-weight:600;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.15);display:none';btn.onclick=function(){if(box&&box.style.display!=='none'){box.style.display='none';}else{paintBox();}};document.body.appendChild(btn);}
    btn.textContent='WhatsApp: '+rows.length+' por atender';
    btn.style.display=rows.length?'block':'none';
    if(box&&box.style.display!=='none')paintBox();
  }
  function paintBox(){
    if(!box){box=document.createElement('div');box.id='waHandBox';box.style.cssText='position:fixed;right:16px;bottom:60px;z-index:9998;width:min(420px,calc(100vw - 32px));max-height:60vh;overflow:auto;background:#fff;border:1px solid #e4ecf2;border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,.2);padding:10px;font-size:13px;color:#0f2233';document.body.appendChild(box);
      box.onclick=function(ev){var t=ev.target;var did=t.getAttribute&&t.getAttribute('data-done');var oid=t.getAttribute&&t.getAttribute('data-open');
        if(did){sb.rpc('wa_resolve_human',{p_id:did}).then(function(){load();});}
        if(oid){var r=rows.find(function(x){return x.id===oid;});if(r){box.style.display='none';open(r.candidate_id,r.full_name,r.phone,String(r.full_name||'').trim().split(/\s+/)[0]||'',r.application_id);}}
      };}
    box.style.display='block';
    box.innerHTML='<div style="font-weight:700;margin-bottom:8px">Mensajes de WhatsApp que necesitan a una persona</div>'+(rows.length?rows.map(function(r){var why=r.security_flag?'Posible intento de manipulación':(r.intent||'otro');return '<div style="border-top:1px solid #eef2f6;padding:8px 0"><div><b>'+e(r.full_name||'Sin identificar')+'</b> · '+e(r.phone||'')+'</div><div style="color:#33414d;margin:4px 0">'+e(r.mensaje_candidato||'(sin texto)')+'</div><div style="color:#8a97a3;font-size:11.5px">'+e(why)+' · '+e(String(r.created_at||'').slice(0,16).replace('T',' '))+'</div><div style="margin-top:6px;display:flex;gap:6px">'+(r.candidate_id?'<button data-open="'+e(r.id)+'" style="padding:3px 10px;border:1px solid #1f8a4c;color:#1f8a4c;background:#fff;border-radius:999px;font-size:12px;cursor:pointer">Abrir chat</button>':'')+'<button data-done="'+e(r.id)+'" style="padding:3px 10px;border:1px solid #8a97a3;color:#33414d;background:#fff;border-radius:999px;font-size:12px;cursor:pointer">Atendido</button></div></div>';}).join(''):'Nada pendiente.');
  }
  function load(){try{sb.from('wa_handoff_queue').select('*').order('created_at',{ascending:false}).limit(50).then(function(r){rows=(r&&r.data)||[];paintBtn();},function(){});}catch(x){}}
  setTimeout(load,3000);setInterval(load,120000);
})();

  const VIDEO_BASE='https://videointerviews.wexpandmx.com';
  async function lastApp(candId,appId){
    let q=sb.from('applications').select('id,position_id,positions(title,video_enabled)');
    q=appId?q.eq('id',appId):q.eq('candidate_id',candId).order('updated_at',{ascending:false}).limit(1);
    const r=await q;
    return (r.data&&r.data[0])||null;
  }
  // Enlace de la video entrevista de la posición (mismo que usa el correo de bienvenida: kit activo más reciente).
  async function videoLink(app){
    try{
      if(!app||!app.position_id||(app.positions&&app.positions.video_enabled===false))return '';
      const r=await sb.from('interview_kits').select('share_token').eq('position_id',app.position_id).not('share_token','is',null).order('is_active',{ascending:false}).order('created_at',{ascending:false}).limit(1);
      const t=r.data&&r.data[0]&&r.data[0].share_token;
      return t?(VIDEO_BASE+'/interview.html?k='+t):'';
    }catch(x){return '';}
  }
  async function load(candId){
    const r=await sb.from('wa_messages').select('*').eq('candidate_id',candId).order('created_at',{ascending:true}).limit(300);
    return r.data||[];
  }
  function bubble(m){
    const out=m.direction==='out';
    const st=out?('<span style="font-size:10.5px;opacity:.75;margin-left:8px">'+(STAT[m.status]||'')+'</span>'):'';
    const body=m.kind==='template'?('<i>[template '+e(m.template_name)+']</i> '+e((m.template_params||[]).join(' · '))):e(m.body);
    return '<div style="display:flex;justify-content:'+(out?'flex-end':'flex-start')+';margin:4px 0"><div style="max-width:78%;padding:8px 11px;border-radius:12px;font-size:13px;line-height:1.4;white-space:pre-wrap;word-break:break-word;background:'+(out?'#dcf3e4':'#eef1f4')+(m.status==='failed'?';border:1px solid #d9534f':'')+'">'+body
      +'<div style="font-size:10.5px;color:#6b8296;margin-top:3px">'+new Date(m.created_at).toLocaleString('en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})+st+'</div>'
      +(m.error?'<div style="font-size:11px;color:#a03020;margin-top:2px">'+e(m.error)+'</div>':'')+'</div></div>';
  }
  async function open(candId,name,phone,firstName,appId){
    cur={candId:candId,name:name,phone:phone,firstName:firstName||(name||'').split(' ')[0]};
    const app=await lastApp(candId,appId);cur.app=app;cur.videoUrl=await videoLink(app);
    const ov=document.createElement('div');
    ov.style.cssText='position:fixed;inset:0;background:rgba(15,34,51,.55);z-index:10001;display:flex;align-items:center;justify-content:center;padding:16px';
    ov.innerHTML='<div style="background:#fff;border-radius:14px;max-width:560px;width:100%;height:min(86vh,720px);display:flex;flex-direction:column;overflow:hidden;box-sizing:border-box"><div style="padding:14px 18px;border-bottom:1px solid #e6edf3;display:flex;align-items:center;gap:10px"><div style="flex:1;min-width:0;overflow-wrap:anywhere"><div style="font-weight:700;color:var(--navy);font-size:15px">'+e(name||'Candidate')+' · WhatsApp</div><div style="font-size:12px;color:#6b8296">'+e(phone||'No phone on file')+(app&&app.positions?(' · '+e(app.positions.title)):'')+'</div></div><button id="waX" style="border:none;background:#eef1f4;border-radius:8px;padding:6px 12px;cursor:pointer">Close</button></div><div id="waThread" style="flex:1;min-height:0;overflow:auto;padding:12px 18px"></div><div id="waComp" style="border-top:1px solid #e6edf3;padding:12px 18px;display:flex;flex-direction:column;gap:8px;min-width:0;max-height:55%;overflow-y:auto;box-sizing:border-box"></div></div>';
    document.body.appendChild(ov);
    const $=s=>ov.querySelector(s);
    $('#waX').onclick=()=>ov.remove();
    ov.addEventListener('click',ev=>{if(ev.target===ov)ov.remove();});
    async function paintThread(){
      const msgs=await load(candId);cur.msgs=msgs;
      const lastIn=[...msgs].reverse().find(m=>m.direction==='in');
      cur.window=!!lastIn&&(Date.now()-new Date(lastIn.created_at).getTime()<24*3600*1000);
      $('#waThread').innerHTML=msgs.length?msgs.map(bubble).join(''):'<div class="muted" style="text-align:center;margin-top:30px;font-size:13px">No messages yet.</div>';
      $('#waThread').scrollTop=1e9;
      paintComposer();
    }
    function paintComposer(){
      const tpl=TEMPLATES.map((t,i)=>'<option value="'+i+'">'+e(t.label)+'</option>').join('');
      $('#waComp').innerHTML='<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;min-width:0"><select id="waMode" style="max-width:100%;padding:7px;border:1px solid #dfe5ec;border-radius:8px;font:inherit;font-size:13px"><option value="template">Approved template</option><option value="text"'+(cur.window?'':' disabled')+'>Free message'+(cur.window?'':' (needs a reply in the last 24 h)')+'</option></select><select id="waTpl" style="flex:1 1 200px;min-width:0;max-width:100%;text-overflow:ellipsis;padding:7px;border:1px solid #dfe5ec;border-radius:8px;font:inherit;font-size:13px">'+tpl+'</select></div><div id="waFields" style="display:flex;flex-direction:column;gap:6px;min-width:0"></div><div id="waErr" style="color:#a03020;font-size:12px;min-height:14px;overflow-wrap:anywhere"></div><div style="display:flex;justify-content:flex-end"><button id="waSend" style="padding:8px 16px;border:none;border-radius:8px;background:#1f8a4c;color:#fff;cursor:pointer;font-size:13px">Send</button></div>';
      const fields=()=>{
        const mode=$('#waMode').value;$('#waTpl').style.display=mode==='template'?'':'none';
        if(mode==='text'){$('#waFields').innerHTML='<select id="waQuick" style="width:100%;box-sizing:border-box;min-width:0;padding:7px;border:1px solid #dfe5ec;border-radius:8px;font:inherit;font-size:13px"><option value="">Respuestas rápidas…</option>'+QUICK.map((q,i)=>'<option value="'+i+'">'+e(q.label)+'</option>').join('')+'</select><textarea id="waBody" placeholder="Write a message…" style="width:100%;box-sizing:border-box;min-height:70px;padding:9px;border:1px solid #dfe5ec;border-radius:10px;font:inherit;font-size:13px"></textarea>';const qk=$('#waQuick');qk.onchange=()=>{if(qk.value==='')return;const bd=$('#waBody');bd.value=QUICK[Number(qk.value)].text;qk.value='';bd.focus();};return;}
        const t=TEMPLATES[Number($('#waTpl').value)];
        const defs=[cur.firstName||'',(cur.app&&cur.app.positions&&cur.app.positions.title)||'',cur.videoUrl||''];
        $('#waFields').innerHTML='<div style="font-size:12px;color:#5a6f84;line-height:1.4;white-space:normal;overflow-wrap:anywhere;word-break:break-word;background:#f5f8fb;border-radius:8px;padding:8px 10px">'+e(t.preview.replace(/\{(\d)\}/g,function(_,n){return '['+t.params[n-1]+']';}))+'</div>'+t.params.map((p,i)=>'<input data-p="'+i+'" value="'+e(defs[i]||'')+'" placeholder="'+e(p)+'" style="width:100%;box-sizing:border-box;min-width:0;padding:8px;border:1px solid #dfe5ec;border-radius:8px;font:inherit;font-size:13px">').join('');
      };
      $('#waMode').onchange=fields;$('#waTpl').onchange=fields;fields();
      $('#waSend').onclick=async()=>{
        const err=$('#waErr');err.textContent='';
        if(!cur.app){err.textContent='This candidate has no application to link the message to.';return;}
        const mode=$('#waMode').value;let args;
        if(mode==='text'){const b=($('#waBody').value||'').trim();if(!b){err.textContent='Write a message.';return;}args={p_application_id:cur.app.id,p_kind:'text',p_template:null,p_params:[],p_body:b};}
        else{const t=TEMPLATES[Number($('#waTpl').value)];const vals=[...ov.querySelectorAll('[data-p]')].map(x=>x.value.trim());if(vals.some(v=>!v)){err.textContent='Fill in every field.';return;}args={p_application_id:cur.app.id,p_kind:'template',p_template:t.name,p_params:vals,p_body:null};}
        const btn=$('#waSend');btn.disabled=true;btn.textContent='Sending…';
        try{
          const q=await sb.rpc('wa_queue_message',args);if(q.error||!(q.data&&q.data.ok))throw new Error((q.error&&q.error.message)||(q.data&&q.data.error)||'could not queue');
          const id=q.data.id;
          const d=await sb.rpc('wa_decide',{p_id:id,p_approve:true});if(d.error||!(d.data&&d.data.ok))throw new Error((d.error&&d.error.message)||(d.data&&d.data.error)||'could not approve');
          const s=await sb.functions.invoke('whatsapp-send',{body:{message_id:id}});
          const res=s.data||{};
          if(s.error||!res.ok){err.textContent=(res.error||(s.error&&s.error.message)||'send failed')+' — saved as approved, not sent.';}
          else if(window.toast)toast('WhatsApp message sent');
        }catch(x){err.textContent=String(x.message||x);}
        btn.disabled=false;btn.textContent='Send';
        await paintThread();
      };
    }
    await paintThread();
  }
  window.waOpen=open;

  // Add a WhatsApp button to the candidate drawer
  function inject(){
    try{
      const meta=document.getElementById('dMeta');const c=(typeof drawerCand!=='undefined'&&drawerCand)?drawerCand:window.drawerCand;if(!meta||!c)return;
      let b=document.getElementById('waBtn');
      if(!b){b=document.createElement('button');b.id='waBtn';b.textContent='WhatsApp';b.style.cssText='margin-left:10px;padding:3px 10px;border:1px solid #1f8a4c;color:#1f8a4c;background:#fff;border-radius:999px;font-size:12px;cursor:pointer';meta.appendChild(b);}
      b.onclick=ev=>{ev.stopPropagation();open(c.id,c.full_name,c.phone,c.first_name||String(c.full_name||'').replace(/^[^A-Za-z\u00C0-\u017F]+/,'').trim().split(/\s+/)[0]||'');};
    }catch(x){}
  }
  const orig=window.openDrawer;
  if(typeof orig==='function'){window.openDrawer=function(){const r=orig.apply(this,arguments);setTimeout(inject,0);setTimeout(inject,400);setTimeout(inject,1200);return r;};}

  // Tablero (Kanban): el enlace WhatsApp de cada tarjeta abre el panel de WeAI. Ctrl/Cmd/Shift + clic conserva WhatsApp Web.
  const firstOf=c=>c.first_name||String(c.full_name||'').replace(/^[^A-Za-z\u00C0-\u017F]+/,'').trim().split(/\s+/)[0]||'';
  document.addEventListener('click',function(ev){
    try{
      const a=ev.target.closest&&ev.target.closest('a[href^="https://wa.me/"]');
      if(!a||ev.ctrlKey||ev.metaKey||ev.shiftKey||ev.button!==0)return;
      let id=null,m=null;
      const card=a.closest('.pcard');
      const dg=card&&card.getAttribute('ondragstart');
      m=dg&&dg.match(/'([0-9a-f-]{36})'/);
      if(m)id=m[1];
      if(!id){const cv=a.parentElement&&a.parentElement.querySelector('[onclick*="pwPreviewOpen("]');const oc=cv&&cv.getAttribute('onclick');m=oc&&oc.match(/pwPreviewOpen\('([0-9a-f-]{36})'\)/);if(m)id=m[1];}
      if(!id||typeof pwApps==='undefined')return;
      const ap=pwApps.find(x=>x.id===id);const c=ap&&ap.candidates;
      if(!c||!c.id)return;
      ev.preventDefault();ev.stopPropagation();
      open(c.id,c.full_name,c.phone||a.getAttribute('href').replace('https://wa.me/',''),firstOf(c),id);
    }catch(x){}
  },true);
})();
