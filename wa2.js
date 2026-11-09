/* wa2.js — WhatsApp conversation panel for a candidate (opens from the candidate drawer). Sending is gated server-side. */
(function(){
  'use strict';
  const e=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  // Approved templates usable by this number. Add new ones here once Meta approves them for the sending account.
  const TEMPLATES=[
    {name:'candidato_15_01_2025',lang:'es_MX',label:'Application invite + video interview',params:['First name','Position title','Video interview link'],
     preview:'Hola {1}, soy Maricela de Wexpand. Recibí tu información para la vacante de {2}… responde las preguntas en este enlace: {3}'}
  ];
  const STAT={draft:'Draft',approved:'Approved',rejected:'Rejected',sent:'Sent',delivered:'Delivered',read:'Read',failed:'Failed',received:''};
  let cur=null;

  async function lastApp(candId){
    const r=await sb.from('applications').select('id,position_id,positions(title)').eq('candidate_id',candId).order('updated_at',{ascending:false}).limit(1);
    return (r.data&&r.data[0])||null;
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
  async function open(candId,name,phone,firstName){
    cur={candId:candId,name:name,phone:phone,firstName:firstName||(name||'').split(' ')[0]};
    const app=await lastApp(candId);cur.app=app;
    const ov=document.createElement('div');
    ov.style.cssText='position:fixed;inset:0;background:rgba(15,34,51,.55);z-index:10001;display:flex;align-items:center;justify-content:center;padding:16px';
    ov.innerHTML='<div style="background:#fff;border-radius:14px;max-width:560px;width:100%;height:min(86vh,720px);display:flex;flex-direction:column"><div style="padding:14px 18px;border-bottom:1px solid #e6edf3;display:flex;align-items:center;gap:10px"><div style="flex:1"><div style="font-weight:700;color:var(--navy);font-size:15px">'+e(name||'Candidate')+' · WhatsApp</div><div style="font-size:12px;color:#6b8296">'+e(phone||'No phone on file')+(app&&app.positions?(' · '+e(app.positions.title)):'')+'</div></div><button id="waX" style="border:none;background:#eef1f4;border-radius:8px;padding:6px 12px;cursor:pointer">Close</button></div><div id="waThread" style="flex:1;overflow:auto;padding:12px 18px"></div><div id="waComp" style="border-top:1px solid #e6edf3;padding:12px 18px;display:flex;flex-direction:column;gap:8px"></div></div>';
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
      $('#waComp').innerHTML='<div style="display:flex;gap:8px;align-items:center"><select id="waMode" style="padding:7px;border:1px solid #dfe5ec;border-radius:8px;font:inherit;font-size:13px"><option value="template">Approved template</option><option value="text"'+(cur.window?'':' disabled')+'>Free message'+(cur.window?'':' (needs a reply in the last 24 h)')+'</option></select><select id="waTpl" style="flex:1;padding:7px;border:1px solid #dfe5ec;border-radius:8px;font:inherit;font-size:13px">'+tpl+'</select></div><div id="waFields" style="display:flex;flex-direction:column;gap:6px"></div><div id="waErr" style="color:#a03020;font-size:12px;min-height:14px"></div><div style="display:flex;justify-content:flex-end"><button id="waSend" style="padding:8px 16px;border:none;border-radius:8px;background:#1f8a4c;color:#fff;cursor:pointer;font-size:13px">Send</button></div>';
      const fields=()=>{
        const mode=$('#waMode').value;$('#waTpl').style.display=mode==='template'?'':'none';
        if(mode==='text'){$('#waFields').innerHTML='<textarea id="waBody" placeholder="Write a message…" style="min-height:70px;padding:9px;border:1px solid #dfe5ec;border-radius:10px;font:inherit;font-size:13px"></textarea>';return;}
        const t=TEMPLATES[Number($('#waTpl').value)];
        const defs=[cur.firstName||'',(cur.app&&cur.app.positions&&cur.app.positions.title)||'',''];
        $('#waFields').innerHTML='<div style="font-size:12px;color:#5a6f84;line-height:1.4">'+e(t.preview.replace(/\{(\d)\}/g,function(_,n){return '['+t.params[n-1]+']';}))+'</div>'+t.params.map((p,i)=>'<input data-p="'+i+'" value="'+e(defs[i]||'')+'" placeholder="'+e(p)+'" style="padding:8px;border:1px solid #dfe5ec;border-radius:8px;font:inherit;font-size:13px">').join('');
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
      const meta=document.getElementById('dMeta');if(!meta||!window.drawerCand)return;
      let b=document.getElementById('waBtn');
      if(!b){b=document.createElement('button');b.id='waBtn';b.textContent='WhatsApp';b.style.cssText='margin-left:10px;padding:3px 10px;border:1px solid #1f8a4c;color:#1f8a4c;background:#fff;border-radius:999px;font-size:12px;cursor:pointer';meta.appendChild(b);}
      const c=window.drawerCand;
      b.onclick=ev=>{ev.stopPropagation();open(c.id,c.full_name,c.phone,c.first_name);};
    }catch(x){}
  }
  const orig=window.openDrawer;
  if(typeof orig==='function'){window.openDrawer=function(){const r=orig.apply(this,arguments);setTimeout(inject,0);return r;};}
})();
