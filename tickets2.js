/* tickets2.js — Error analysis inside WeAI Support: grouped errors, agent diagnosis, documented resolution. */
(function(){
  'use strict';
  if(typeof window.renderSupport!=='function')return;
  const e=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let T=[],D={},filter='active',openId=null;
  const when=d=>d?new Date(d).toLocaleString('en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}):'—';
  const chip=(k,l,n)=>'<button class="lnk" data-tf="'+k+'" style="padding:5px 11px;border-radius:999px;border:1px solid #dfe7ee;background:'+(filter===k?'#0f3b5f':'#fff')+';color:'+(filter===k?'#fff':'#35526b')+';font-size:12.5px;cursor:pointer">'+l+(n!=null?' · '+n:'')+'</button>';
  const sevCol={high:'#c0392b',medium:'#d98a00',low:'#2e8b57'};

  async function load(){
    const r=await sb.from('support_tickets').select('*').order('created_at',{ascending:false}).limit(400);
    if(r.error)throw r.error;
    T=r.data||[];
    D={};
    const d=await sb.from('agent_draft').select('id,payload,status,created_at').eq('kind','ticket_analysis').eq('status','pending').order('created_at',{ascending:false}).limit(100);
    (d.data||[]).forEach(x=>{const k=x.payload&&x.payload.ticket_id;if(k&&!D[k])D[k]=x;});
  }
  function visible(){
    const prim=T.filter(t=>!t.duplicate_of);
    if(filter==='active')return prim.filter(t=>t.status==='open'||t.status==='in_progress');
    if(filter==='resolved')return prim.filter(t=>t.status==='resolved'||t.status==='closed');
    if(filter==='review')return prim.filter(t=>D[t.id]);
    return T;
  }
  function row(t){
    const dr=D[t.id];
    const badges=(t.occurrences>1?'<span style="background:#eef3f8;color:#35526b;border-radius:6px;padding:1px 7px;font-size:11px;margin-left:6px">×'+t.occurrences+'</span>':'')
      +(t.regression_of?'<span style="background:#fdecea;color:#a03020;border-radius:6px;padding:1px 7px;font-size:11px;margin-left:6px">regression of #'+t.regression_of+'</span>':'')
      +(dr?'<span style="background:#e8f5ee;color:#1f6b45;border-radius:6px;padding:1px 7px;font-size:11px;margin-left:6px">agent proposal ready</span>':'');
    const ctx=t.context||{};
    return '<tr data-tk="'+t.id+'" style="cursor:pointer"><td>#'+t.id+'</td><td>'+(window.typeBadge?typeBadge(t.type):e(t.type))+'</td>'
      +'<td><b>'+e(t.subject||'—')+'</b>'+badges+'<div class="muted" style="font-size:12px">'+e((t.diagnosis||t.message||'').slice(0,120))+'</div></td>'
      +'<td>'+e(t.user_email||'')+'<div class="muted" style="font-size:11px">'+e(ctx.module||'')+(ctx.tab?' · '+e(ctx.tab):'')+'</div></td>'
      +'<td>'+(window.statusPill?statusPill(t.status):e(t.status))+'</td>'
      +'<td class="muted" style="font-size:12px">'+when(t.last_seen_at||t.created_at)+'</td></tr>';
  }
  function paint(){
    const prim=T.filter(t=>!t.duplicate_of);
    const act=prim.filter(t=>t.status==='open'||t.status==='in_progress').length;
    const res=prim.filter(t=>t.status==='resolved'||t.status==='closed').length;
    const rev=prim.filter(t=>D[t.id]).length;
    const rows=visible().map(row).join('');
    const v=document.getElementById('view');
    v.innerHTML='<div class="content"><div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;align-items:center">'
      +chip('active','Open',act)+chip('review','Agent proposals',rev)+chip('resolved','Resolved',res)+chip('all','All (incl. grouped)',T.length)
      +'<span class="muted" style="font-size:12px;margin-left:auto">Errors are grouped automatically; the error agent analyzes them and proposes a fix for you to approve.</span></div>'
      +(rows?'<table><thead><tr><th>#</th><th>Type</th><th>Subject / diagnosis</th><th>User</th><th>Status</th><th>Last seen</th></tr></thead><tbody>'+rows+'</tbody></table>':'<p class="muted">Nothing here.</p>')+'</div>';
    v.querySelectorAll('[data-tf]').forEach(b=>b.onclick=()=>{filter=b.dataset.tf;paint();});
    v.querySelectorAll('tr[data-tk]').forEach(r=>r.onclick=()=>detail(Number(r.dataset.tk)));
  }
  function sec(title,body){return body?'<div style="margin-top:12px"><div style="font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#6b8296;margin-bottom:4px">'+title+'</div>'+body+'</div>':'';}
  function detail(id){
    const t=T.find(x=>x.id===id);if(!t)return;openId=id;
    const dr=D[id],p=dr&&dr.payload;
    const ctx=t.context||{};
    const done=t.status==='resolved'||t.status==='closed';
    const dups=T.filter(x=>x.duplicate_of===id).length;
    let h='<div style="font-weight:700;color:var(--navy);font-size:16px">#'+t.id+' · '+e(t.subject||'')+'</div>'
      +'<div style="font-size:12px;color:#6b8296;margin-top:3px">'+e(t.type)+' · '+e(t.status)+' · '+e(t.user_email||'')+' · first '+when(t.created_at)+' · last '+when(t.last_seen_at)+(t.occurrences>1?' · '+t.occurrences+' occurrences':'')+(dups?' · '+dups+' grouped duplicates':'')+'</div>';
    h+=sec('Message / stack','<pre style="white-space:pre-wrap;word-break:break-word;background:#f5f8fb;border-radius:8px;padding:9px;font-size:12px;margin:0;max-height:150px;overflow:auto">'+e(t.message||'(empty)')+'</pre><div style="font-size:11.5px;color:#6b8296;margin-top:4px">'+e(ctx.module||'')+' · '+e(String(ctx.url||'').slice(0,90))+'</div>');
    if(p){
      const sc=sevCol[p.severity]||'#35526b';
      h+='<div style="margin-top:14px;border:1px solid #cfe3d8;background:#f4fbf7;border-radius:12px;padding:12px">'
        +'<div style="font-weight:700;color:#1f6b45;font-size:13px">Agent proposal · '+e(p.category||'')+' · <span style="color:'+sc+'">'+e(p.severity||'')+'</span> · confidence '+e(p.confidence||'')+'</div>'
        +sec('Root cause',e(p.root_cause))+sec('Evidence',e(p.evidence))
        +sec('Proposed status',p.proposed_state==='resolved'?'Resolved'+(p.likely_already_fixed?' (looks already fixed)':''):'In progress (needs a fix)')
        +sec('How it is resolved',e(p.resolution_note))
        +((p.fix_steps||[]).length?sec('Steps','<ol style="margin:0;padding-left:18px;font-size:13px;line-height:1.5">'+p.fix_steps.map(s=>'<li>'+e(s)+'</li>').join('')+'</ol>'):'')
        +(p.suggested_patch?sec('Suggested patch','<pre style="white-space:pre-wrap;word-break:break-word;background:#fff;border:1px solid #dfe7ee;border-radius:8px;padding:9px;font-size:12px;margin:0;max-height:160px;overflow:auto">'+e(p.suggested_patch)+'</pre>'):'')
        +sec('Verification',e(p.verification))
        +'<div style="display:flex;gap:8px;margin-top:12px"><button id="tkApprove" style="padding:8px 14px;border:none;border-radius:8px;background:#0f3b5f;color:#fff;cursor:pointer;font-size:13px">Approve &amp; document</button><button id="tkDismiss" style="padding:8px 14px;border:none;border-radius:8px;background:#eef1f4;color:#333;cursor:pointer;font-size:13px">Dismiss</button></div></div>';
    }else if(t.diagnosis){
      h+=sec('Diagnosis',e(t.diagnosis));
    }
    if(done||t.resolution)h+=sec('Resolution'+(t.resolved_by?' ('+e(t.resolved_by)+', '+when(t.resolved_at)+')':''),'<div style="font-size:13px;white-space:pre-wrap;line-height:1.5">'+e(t.resolution||'(no note)')+'</div>');
    h+='<div style="margin-top:14px;display:flex;flex-direction:column;gap:8px">';
    if(!done){
      h+='<textarea id="tkNote" placeholder="How was it resolved? (saved in the ticket)" style="min-height:64px;padding:9px;border:1px solid #dfe5ec;border-radius:10px;font:inherit;font-size:13px">'+e(t.resolution||'')+'</textarea><div style="display:flex;gap:8px;flex-wrap:wrap"><button id="tkResolve" style="padding:8px 14px;border:none;border-radius:8px;background:#2e8b57;color:#fff;cursor:pointer;font-size:13px">Mark resolved</button>'
        +(t.status!=='in_progress'?'<button id="tkProg" style="padding:8px 14px;border:none;border-radius:8px;background:#eef1f4;color:#333;cursor:pointer;font-size:13px">In progress</button>':'')
        +(t.type==='error'||t.type==='bug'?'<button id="tkRe" style="padding:8px 14px;border:none;border-radius:8px;background:#eef1f4;color:#333;cursor:pointer;font-size:13px">Re-analyze with agent</button>':'')+'</div>';
    }else{
      h+='<div style="display:flex;gap:8px"><button id="tkReopen" style="padding:8px 14px;border:none;border-radius:8px;background:#eef1f4;color:#333;cursor:pointer;font-size:13px">Reopen</button></div>';
    }
    h+='</div><div style="display:flex;justify-content:flex-end;margin-top:12px"><button id="tkClose" style="padding:8px 14px;border:none;border-radius:8px;background:#eef1f4;color:#333;cursor:pointer;font-size:13px">Close</button></div>';
    const ov=document.createElement('div');
    ov.style.cssText='position:fixed;inset:0;background:rgba(15,34,51,.55);z-index:10000;display:flex;align-items:center;justify-content:center;padding:16px';
    ov.innerHTML='<div style="background:#fff;border-radius:14px;max-width:680px;width:100%;max-height:92vh;overflow:auto;padding:20px">'+h+'</div>';
    document.body.appendChild(ov);
    const $=s=>ov.querySelector(s);
    const shut=async(reload)=>{ov.remove();if(reload){try{await load();}catch(x){}paint();if(window.refreshSupportBadge)refreshSupportBadge();}};
    ov.addEventListener('click',ev=>{if(ev.target===ov)shut(false);});
    $('#tkClose').onclick=()=>shut(false);
    const upd=async(patch,msg)=>{const r=await sb.from('support_tickets').update(patch).eq('id',id);if(r.error){toast('Error: '+r.error.message);return;}toast(msg);shut(true);};
    const who=(window.currentUser&&currentUser.email)||'person';
    if($('#tkResolve'))$('#tkResolve').onclick=()=>{const n=$('#tkNote').value.trim();if(!n){toast('Add a short note on how it was resolved');return;}upd({status:'resolved',resolution:n,resolved_at:new Date().toISOString(),resolved_by:who},'Ticket resolved and documented');};
    if($('#tkProg'))$('#tkProg').onclick=()=>upd({status:'in_progress'},'Marked in progress');
    if($('#tkRe'))$('#tkRe').onclick=()=>upd({analyzed_at:null},'Queued: the agent will re-analyze it in the next run');
    if($('#tkReopen'))$('#tkReopen').onclick=()=>upd({status:'open',resolved_at:null,resolved_by:null},'Reopened');
    if($('#tkApprove'))$('#tkApprove').onclick=async()=>{const r=await sb.rpc('ticket_analysis_decide',{p_id:dr.id,p_approve:true});if(r.error||!(r.data&&r.data.ok)){toast('Error: '+((r.error&&r.error.message)||(r.data&&r.data.error)));return;}toast('Approved and documented in the ticket');shut(true);};
    if($('#tkDismiss'))$('#tkDismiss').onclick=async()=>{const r=await sb.rpc('ticket_analysis_decide',{p_id:dr.id,p_approve:false});if(r.error||!(r.data&&r.data.ok)){toast('Error: '+((r.error&&r.error.message)||(r.data&&r.data.error)));return;}toast('Proposal dismissed');shut(true);};
  }
  window.renderSupport=async function(){
    const v=document.getElementById('view');
    v.innerHTML='<div class="content"><div class="muted">Loading…</div></div>';
    try{await load();paint();}catch(x){v.innerHTML='<div class="content"><div class="muted">Error: '+e(x.message||x)+'</div></div>';}
  };
  if(typeof activeModule!=='undefined'&&activeModule==='support')window.renderSupport();
})();
