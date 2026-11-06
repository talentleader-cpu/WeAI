// ===== Agents 2: review screen for Job Intake & Analytics drafts (loaded after index.html) =====
(function(){
  const NAMES={job_intake:'Job Intake & Calibration',analytics:'Recruitment Analytics',interview_analyst:'Interview Analyst',client_intel:'Client Intelligence'};
  const DESC={
    job_intake:'Reads each open position and its intake notes, then prepares a calibration: must-haves, ambiguities, knockout questions and a scorecard so screening starts on the same page.',
    interview_analyst:'Reads the transcribed video interviews of candidates on open positions and compares them with the position calibration: evidence per question, strengths, concerns and what to verify. It suggests; the recruiter decides.',
    client_intel:'Studies each client with open positions: how many candidates stall at the client, rejection reasons and what to ask them, so the team adjusts before the next shortlist.',
    analytics:'Once a day reads the funnel, open positions and recruiters and writes a short report: what moved, risks, who needs support and the recommended actions.'
  };
  const KIND={job_intake:'job_intake',analytics:'analytics_report',interview_analyst:'interview_eval',client_intel:'client_intel'};
  const e=s=>(window.esc?window.esc(s):String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])));
  const toast=m=>{try{window.T&&window.T(m);}catch(x){}};
  const arr=v=>Array.isArray(v)?v:(v?[v]:[]);
  const str=x=>typeof x==='string'?x:(x&&typeof x==='object'?Object.values(x).filter(v=>typeof v==='string').join(' · '):String(x==null?'':x));
  const ul=(title,items,color)=>{items=arr(items).filter(Boolean);if(!items.length)return '';return '<div style="margin-top:12px"><div style="font-size:11.5px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:'+(color||'#5a6f84')+'">'+e(title)+'</div><ul style="margin:6px 0 0;padding-left:18px;font-size:13px;line-height:1.5">'+items.map(i=>'<li>'+e(str(i))+'</li>').join('')+'</ul></div>';};
  const chip=(t,bg,fg)=>'<span style="font-size:11.5px;font-weight:600;padding:3px 10px;border-radius:999px;background:'+bg+';color:'+fg+'">'+e(t)+'</span>';

  function intakeCard(d){
    const p=d.payload||{};const ready=p.readiness==='ready';
    const ko=arr(p.knockout_questions).map(k=>'<li><b>'+e(k.question||str(k))+'</b>'+(k.pass_criteria?'<div style="opacity:.75">Passes if: '+e(k.pass_criteria)+'</div>':'')+'</li>').join('');
    const sc=arr(p.scorecard).map(k=>'<tr><td style="padding:4px 8px 4px 0;font-weight:600">'+e(k.criterion||'')+'</td><td style="padding:4px 8px;white-space:nowrap">'+e(k.weight==null?'':k.weight)+'</td><td style="padding:4px 0;opacity:.85">'+e(k.good_looks_like||'')+'</td></tr>').join('');
    return '<div style="display:flex;justify-content:space-between;gap:8px;align-items:center;flex-wrap:wrap"><div><b style="color:var(--navy)">'+e(p.position||'Position')+'</b><div class="muted" style="font-size:12.5px">'+e(p.client||'')+'</div></div><div>'+(ready?chip('Ready to source','#e3f6ea','#1b6b3a'):chip('Needs clarification','#fff4d6','#7a5b00'))+'</div></div>'
      +'<p style="font-size:13px;margin:10px 0 0;line-height:1.5">'+e(p.summary||'')+'</p>'
      +ul('Must have',p.must_have)+ul('Nice to have',p.nice_to_have)
      +ul('Questions for the hiring manager',p.clarifying_questions,'#7a5b00')+ul('Ambiguities',p.ambiguities,'#7a5b00')+ul('Contradictions',p.contradictions,'#a03020')+ul('Requirements that may be unnecessary',p.unnecessary_requirements)
      +(ko?'<div style="margin-top:12px"><div style="font-size:11.5px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:#5a6f84">Knockout questions</div><ul style="margin:6px 0 0;padding-left:18px;font-size:13px;line-height:1.5">'+ko+'</ul></div>':'')
      +(sc?'<div style="margin-top:12px"><div style="font-size:11.5px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:#5a6f84">Scorecard</div><div style="overflow-x:auto"><table style="font-size:13px;border-collapse:collapse;margin-top:6px"><tbody>'+sc+'</tbody></table></div></div>':'')
      +(p.market_note?'<p class="muted" style="font-size:12.5px;margin:12px 0 0"><b>Market note:</b> '+e(p.market_note)+'</p>':'');
  }
  function reportCard(d){
    const p=d.payload||{};
    const flags=arr(p.recruiter_flags).map(f=>typeof f==='string'?f:str(f));
    return '<div><b style="color:var(--navy);font-size:15px">'+e(p.headline||'Daily report')+'</b></div>'
      +'<p style="font-size:13px;margin:8px 0 0;line-height:1.5">'+e(p.summary||'')+'</p>'
      +ul('Highlights',p.highlights,'#1b6b3a')+ul('Risks',p.risks,'#a03020')+ul('Recruiter flags',flags,'#7a5b00')+ul('Recommended actions',p.recommended_actions,'#1f5fa8')+ul('Data gaps',p.data_gaps);
  }


  function interviewCard(d){
    const p=d.payload||{};const rec={advance:['Advance','#e3f6ea','#1b6b3a'],review:['Review','#fff4d6','#7a5b00'],reject:['Not a fit on evidence','#fde8e6','#a03020']}[p.recommendation]||[p.recommendation||'',"#eef1f4","#333"];
    const pq=arr(p.per_question).map(q=>'<tr><td style="padding:3px 8px 3px 0;white-space:nowrap;font-weight:600">Q'+e(q.order)+'</td><td style="padding:3px 8px;white-space:nowrap">'+e(q.score==null?'':q.score)+'/10</td><td style="padding:3px 0;opacity:.85">'+e(q.note||'')+'</td></tr>').join('');
    const sa=arr(p.scorecard_alignment).map(q=>'<li><b>'+e(q.criterion||'')+'</b> · '+e(String(q.rating||'').replace('_',' '))+(q.note?' — '+e(q.note):'')+'</li>').join('');
    const fl=arr(p.flags_for_human).map(f=>'<li><b>'+e(f.type||'Verify')+':</b> '+e(f.detail||str(f))+'</li>').join('');
    return '<div style="display:flex;justify-content:space-between;gap:8px;align-items:center;flex-wrap:wrap"><div><b style="color:var(--navy)">'+e(p.candidate||'Candidate')+'</b><div class="muted" style="font-size:12.5px">'+e(p.position||'')+(p.client?' · '+e(p.client):'')+'</div></div><div>'+chip(rec[0],rec[1],rec[2])+' <b style="margin-left:6px">'+e(p.fit_score==null?'':p.fit_score)+'/100</b></div></div>'
      +'<p style="font-size:13px;margin:10px 0 0;line-height:1.5">'+e(p.summary||'')+'</p>'
      +ul('Strengths',p.strengths,'#1b6b3a')+ul('Concerns',p.concerns,'#a03020')
      +(pq?'<div style="margin-top:12px"><div style="font-size:11.5px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:#5a6f84">By question</div><div style="overflow-x:auto"><table style="font-size:13px;border-collapse:collapse;margin-top:6px"><tbody>'+pq+'</tbody></table></div></div>':'')
      +(sa?'<div style="margin-top:12px"><div style="font-size:11.5px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:#5a6f84">Against the calibration</div><ul style="margin:6px 0 0;padding-left:18px;font-size:13px;line-height:1.5">'+sa+'</ul></div>':(p.calibrated===false?'<p class="muted" style="font-size:12px;margin:10px 0 0">This position has no calibration yet; evaluated against the job description only.</p>':''))
      +(fl?'<div style="margin-top:12px"><div style="font-size:11.5px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:#7a5b00">To verify (not accusations)</div><ul style="margin:6px 0 0;padding-left:18px;font-size:13px;line-height:1.5">'+fl+'</ul></div>':'')
      +ul('Suggested follow-up questions',p.followup_questions,'#1f5fa8')
      +(p.english_observed&&p.english_observed!=='n/d'?'<p class="muted" style="font-size:12.5px;margin:10px 0 0"><b>English observed (low confidence):</b> '+e(p.english_observed)+'</p>':'')
      +'<p class="muted" style="font-size:11.5px;margin:10px 0 0">Based on automatic transcriptions. A suggestion for the recruiter; it does not change the candidate\'s stage or score.</p>';
  }
  function clientCard(d){
    const p=d.payload||{};
    const pat=arr(p.rejection_patterns).map(x=>'<li><b>'+e(x.pattern||str(x))+'</b>'+(x.evidence?'<div style="opacity:.75">'+e(x.evidence)+'</div>':'')+'</li>').join('');
    const rk=arr(p.process_risks).map(x=>'<li><b>'+e(x.risk||str(x))+'</b>'+(x.why?' — '+e(x.why):'')+'</li>').join('');
    return '<div><b style="color:var(--navy);font-size:15px">'+e(p.client||'Client')+'</b></div><div style="font-weight:600;font-size:13.5px;margin-top:4px">'+e(p.headline||'')+'</div>'
      +'<p style="font-size:13px;margin:8px 0 0;line-height:1.5">'+e(p.summary||'')+'</p>'
      +ul('What they seem to value',p.what_they_value,'#1b6b3a')
      +(pat?'<div style="margin-top:12px"><div style="font-size:11.5px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:#a03020">Rejection patterns</div><ul style="margin:6px 0 0;padding-left:18px;font-size:13px;line-height:1.5">'+pat+'</ul></div>':'')
      +(rk?'<div style="margin-top:12px"><div style="font-size:11.5px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:#7a5b00">Process risks</div><ul style="margin:6px 0 0;padding-left:18px;font-size:13px;line-height:1.5">'+rk+'</ul></div>':'')
      +ul('Recommendations for recruiters',p.recommendations,'#1f5fa8')+ul('Questions to ask the client',p.questions_for_client)+ul('Data gaps',p.data_gaps);
  }

  async function open2(key){
    const kind=KIND[key];
    const {data,error}=await sb.from('agent_draft').select('id,kind,payload,created_at').eq('agent_key',key).eq('kind',kind).eq('status','pending').order('created_at',{ascending:false}).limit(30);
    if(error){toast('Could not load drafts: '+error.message);return;}
    const old=document.getElementById('recDraftsOv');if(old)old.remove();
    const ov=document.createElement('div');ov.id='recDraftsOv';
    ov.style.cssText='position:fixed;inset:0;background:rgba(15,34,51,.55);z-index:9999;display:flex;align-items:flex-start;justify-content:center;padding:4vh 16px;overflow:auto';
    const isIntake=key==='job_intake';
    const R={job_intake:intakeCard,analytics:reportCard,interview_analyst:interviewCard,client_intel:clientCard}[key];
    const ok=key==='analytics'||key==='client_intel'?'Mark read':'Mark reviewed',no='Dismiss';
    const cards=(data||[]).map(d=>'<div data-id="'+e(d.id)+'" style="margin-bottom:14px;padding:16px;background:#fff;border:1px solid #dfe7ee;border-radius:12px;width:auto;max-width:none;box-shadow:none;display:block">'+R(d)
      +'<div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap"><button class="btn" data-act="1" style="padding:7px 14px">'+ok+'</button><button class="btn" data-act="0" style="padding:7px 14px;background:#eef1f4;color:#333">'+no+'</button><span class="muted" style="font-size:11.5px;align-self:center">'+e(new Date(d.created_at).toLocaleString())+'</span></div></div>').join('');
    ov.innerHTML='<div style="background:var(--bg,#f4f7fa);border-radius:14px;max-width:820px;width:100%;padding:20px"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:6px"><h2 style="margin:0;font-size:19px;color:var(--navy)">'+e(NAMES[key])+' · pending ('+(data||[]).length+')</h2><button class="btn" id="r2x" style="padding:6px 12px;background:#eef1f4;color:#333">Close</button></div><p class="muted" style="font-size:12.5px;margin:0 0 14px">Drafts only: nothing here changes a position or contacts anyone. '+({job_intake:'Use it to align with the client and recruiter before sourcing.',interview_analyst:'A reading of the interview to support the recruiter; the decision stays with the recruiter.',client_intel:'Patterns from the data we have; validate them with the client before acting.',analytics:'Mark read once the team has seen it.'}[key])+'</p>'+(cards||'<p class="muted">No pending drafts.</p>')+'</div>';
    document.body.appendChild(ov);
    ov.querySelector('#r2x').onclick=()=>ov.remove();
    ov.addEventListener('click',async ev=>{
      if(ev.target===ov){ov.remove();return;}
      const b=ev.target.closest('button[data-act]');if(!b)return;
      const c=b.closest('[data-id]');b.disabled=true;
      const {data:r,error:er}=await sb.rpc('agent_draft_decide',{p_id:c.getAttribute('data-id'),p_approve:b.getAttribute('data-act')==='1'});
      if(er||!r||!r.ok){toast((r&&r.error)||(er&&er.message)||'Could not save');b.disabled=false;return;}
      c.remove();toast('Saved');
      if(!ov.querySelector('[data-id]')){ov.remove();if(window.renderRecruitingAgents)window.renderRecruitingAgents();}
    });
  }

  function tidy(){
    const box=document.getElementById('recAgents');if(!box)return;
    box.querySelectorAll('div').forEach(d=>{
      const k=d.children.length===0?d.textContent.trim():'';
      if(NAMES[k]){d.textContent=NAMES[k];
        const card=d.parentElement&&d.parentElement.parentElement;const m=card&&card.querySelector('.muted');
        if(m&&m.textContent.trim().indexOf('Nothing is sent')===0){m.textContent=DESC[k]+' Nothing is sent or moved on its own; a person reviews every draft.';}
      }
    });
  }


  // ---- Bulk reject must carry a reason (pwBulkMoveTo used to reject without asking) ----
  function askBulkReason(stage,n){
    return new Promise(async resolve=>{
      let list=[];try{list=await window.rrLoad(true);}catch(x){}
      const sc=stage==='rejected_client'?'client':'wexpand';
      const opts=(list||[]).filter(r=>r.scope==='both'||r.scope===sc).map(r=>'<option value="'+e(r.label)+'">'+e(r.label)+'</option>').join('');
      const ov=document.createElement('div');
      ov.style.cssText='position:fixed;inset:0;background:rgba(15,34,51,.55);z-index:10000;display:flex;align-items:center;justify-content:center;padding:16px';
      const bs='padding:8px 14px;border:none;border-radius:8px;font:inherit;font-size:13px;cursor:pointer;';
      ov.innerHTML='<div style="background:#fff;border-radius:14px;max-width:440px;width:100%;padding:20px;display:flex;flex-direction:column;gap:10px"><div style="font-weight:700;color:var(--navy);font-size:16px">Rejection reason</div><div style="font-size:12.5px;color:#5a6f84;line-height:1.45">This reason is saved for the '+n+' selected candidate'+(n===1?'':'s')+'. If they were rejected for different reasons, reject them in separate groups.</div><select id="bkSel" style="padding:9px;border:1px solid #dfe5ec;border-radius:10px;font:inherit;font-size:13.5px"><option value="">Select a reason…</option>'+opts+'</select><textarea id="bkNote" placeholder="Note (optional)" style="min-height:60px;padding:9px;border:1px solid #dfe5ec;border-radius:10px;font:inherit;font-size:13px"></textarea><div id="bkErr" style="color:#a03020;font-size:12px;min-height:14px"></div><div style="display:flex;gap:8px;justify-content:flex-end"><button id="bkNo" style="'+bs+'background:#eef1f4;color:#333">Cancel</button><button id="bkOk" style="'+bs+'background:#0f3b5f;color:#fff">Reject '+n+'</button></div></div>';
      document.body.appendChild(ov);
      const done=v=>{ov.remove();resolve(v);};
      ov.querySelector('#bkNo').onclick=()=>done(null);
      ov.addEventListener('click',ev=>{if(ev.target===ov)done(null);});
      ov.querySelector('#bkOk').onclick=()=>{const r=ov.querySelector('#bkSel').value;if(!r){ov.querySelector('#bkErr').textContent='Select a reason to continue.';return;}done({reason:r,note:ov.querySelector('#bkNote').value.trim()});};
    });
  }
  const origBulk=window.pwBulkMoveTo;
  if(origBulk){
    window.pwBulkMoveTo=async function(stage){
      if(stage!=='rejected_wexpand'&&stage!=='rejected_client')return origBulk.apply(this,arguments);
      if(!stage||!pwBulkSel||!pwBulkSel.size)return;
      const ids=[...pwBulkSel];
      const rr=await askBulkReason(stage,ids.length);
      if(!rr)return;
      const btn=document.getElementById('pwBulkMoveBtn');if(btn)btn.disabled=true;
      let moved=0,failed=0;
      for(const id of ids){
        const a=pwApps.find(x=>x.id===id);if(!a)continue;
        if(pipeStageOf(a)===stage){moved++;continue;}
        const {error}=await sb.from('applications').update({stage:stage,rejection_reason:rr.reason,stage_remark:'Reason: '+rr.reason+(rr.note?' — '+rr.note:'')}).eq('id',id);
        if(error){failed++;}else{a.stage=stage;moved++;}
      }
      try{pwBulkSel.clear();pwBulkMode=false;}catch(x){}
      pwPaintBody();
      toast(failed?('Moved '+moved+', '+failed+' failed'):('Rejected '+moved+' candidate'+(moved===1?'':'s')+' · reason saved'));
    };
  }

  const origDrafts=window.recAgentDrafts;
  window.recAgentDrafts=function(key){if(KIND[key])return open2(key);return origDrafts&&origDrafts.apply(this,arguments);};
  const origRender=window.renderRecruitingAgents;
  if(origRender){window.renderRecruitingAgents=async function(){const r=await origRender.apply(this,arguments);try{tidy();}catch(x){}return r;};}
  setTimeout(()=>{try{tidy();}catch(x){}},0);
})();
