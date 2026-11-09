// ===== WEXPAND BRAIN · Cerebro Universal (live agent graph) =====
// Un núcleo (Cerebro Universal) con sub-cerebros: Recruiting (WeAI), Growth OS, Simulador y Laboratorio de evaluación.
const BRAIN_COL={screener:'#4da3ff',followup:'#ffb454',sourcing:'#4be3a0',job_intake:'#b48cff',analytics:'#ff7ab6',interview_analyst:'#5ee6e6',client_intel:'#e6e65e'};
const BRAIN_LBL={screener:'Screener',followup:'Follow-up',sourcing:'Sourcing',job_intake:'Job Intake',analytics:'Analytics',interview_analyst:'Interview Analyst',client_intel:'Client Intel'};
const BRAIN_SALES=['#ff6b6b','#ff8f5a','#ffd25a','#c0e65a','#5ae6c0','#5ac8ff','#8f8bff','#e68bff','#ff8bb8','#b0b8c4'];
const BRAIN_SIM=['#7fe0ff','#9be7c4','#c3a6ff','#ffc58f','#f59bd0','#b5c7d9'];
const BRAIN_KIND={job_intake:'Intake',analytics_report:'Report',interview_eval:'Interview',client_intel:'Client'};
const BRAIN_HUBS={
  recruiting:{label:'Recruiting · WeAI',color:'#4da3ff',brain:'recruiting'},
  growth:{label:'Growth OS',color:'#ffd25a',brain:'growth'},
  sim:{label:'Simulador',color:'#5ee6e6',brain:'simulador'},
  lab:{label:'Laboratorio de evaluación',color:'#F07E2E',brain:'evaluacion'}
};
const BRAIN_LINKS=[
  ['WeAI','https://weai.wexpandmx.com','recruiting'],
  ['Growth OS','https://growth.wexpandmx.com','growth'],
  ['Simulador','https://camp.wexpandmx.com','sim'],
  ['Rúbricas','https://weai.wexpandmx.com/agentes.html?v=rubricas','lab'],
  ['Laboratorio','https://claude.ai/artifact/K5ukps3GzS64o4DPdRk6L7','lab'],
  ['Video entrevistas','https://videointerviews.wexpandmx.com',null]
];
const BRAIN_SEM={verde:'#2E9E5B',amarillo:'#E0A100',rojo:'#C8372D'};
let _brain=null;
function brainShort(n){n=String(n||'').trim();if(!n)return 'Candidate';const p=n.split(/\s+/);return p[0]+(p[1]?' '+p[1][0]+'.':'');}
function brainAgo(ts){const s=Math.max(0,(Date.now()-new Date(ts).getTime())/1000);if(s<90)return 'now';if(s<3600)return Math.round(s/60)+'m';if(s<86400)return Math.round(s/3600)+'h';return Math.round(s/86400)+'d';}
function brainEsc(s){return (typeof esc==='function')?esc(s):String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function openBrain(opts){
  opts=opts||{};
  if(_brain) return;
  if(!document.getElementById('brainCss')){const st=document.createElement('style');st.id='brainCss';st.textContent='#brainOv{position:fixed;inset:0;z-index:9999;background:radial-gradient(ellipse at 50% 42%,#0d2238 0%,#050d16 72%);color:#dfeaf5;font-family:Arial,Helvetica,sans-serif;display:flex;flex-direction:column}#brainOv .bh{display:flex;align-items:center;gap:10px;padding:10px 18px;flex-wrap:wrap}#brainOv .bh h2{margin:0;font-size:17px;letter-spacing:.1em}#brainOv .bh .sub{font-size:12px;color:#8fb3d1}#brainOv .live{display:flex;align-items:center;gap:6px;font-size:12px;color:#8fb3d1}#brainOv .live i{width:8px;height:8px;border-radius:50%;background:#4be3a0;box-shadow:0 0 8px #4be3a0;animation:bpulse 1.6s infinite}@keyframes bpulse{50%{opacity:.3}}#brainOv button{background:#12304a;color:#dfeaf5;border:1px solid #28506f;border-radius:8px;padding:6px 12px;font-size:12.5px;cursor:pointer}#brainOv .bar{display:flex;align-items:center;gap:8px;padding:0 18px 8px;flex-wrap:wrap}#brainOv .views{display:flex;gap:4px;background:#0a1d2e;border:1px solid #1e3d58;border-radius:10px;padding:3px}#brainOv .views button{border:0;background:transparent;padding:5px 11px}#brainOv .views button[aria-pressed=true]{background:#1f4e78;color:#fff}#brainOv .plat{display:flex;gap:6px;flex-wrap:wrap;margin-left:auto}#brainOv .plat a{display:inline-flex;align-items:center;gap:6px;text-decoration:none;color:#0b1a28;background:#dfeaf5;border-radius:8px;padding:6px 11px;font-size:12.5px;font-weight:700}#brainOv .plat a i{width:8px;height:8px;border-radius:50%}#brainOv .plat a.here{background:#1f4e78;color:#fff;pointer-events:none}#brainOv .bm{flex:1;position:relative;min-height:0}#brainOv canvas{width:100%;height:100%;display:block}#brainOv .feed{position:absolute;right:14px;top:6px;width:min(310px,44vw);overflow:hidden;font-size:11.5px;pointer-events:none}#brainOv .feed div{background:rgba(10,28,44,.8);border-left:3px solid;border-radius:6px;padding:5px 8px;margin-bottom:5px;animation:bin .5s}@keyframes bin{from{opacity:0;transform:translateX(14px)}}#brainOv .leg{position:absolute;left:16px;bottom:12px;right:16px;font-size:11.5px;color:#8fb3d1;display:flex;gap:6px 14px;flex-wrap:wrap}#brainOv .leg i{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:5px}#brainOv .tip{position:absolute;pointer-events:none;background:#0b2236;border:1px solid #2b5578;border-radius:8px;padding:7px 10px;font-size:12px;max-width:280px;display:none;line-height:1.45}';document.head.appendChild(st);}
  const ov=document.createElement('div');ov.id='brainOv';
  const hn=location.hostname;
  const plat=opts.platform||(hn.indexOf('growth')===0||hn.indexOf('wexpand-growth')===0?'growth':hn.indexOf('camp.')===0||hn.indexOf('training-camp')===0?'sim':(hn.indexOf('weai.')===0||hn.indexOf('we-ai')===0||hn.indexOf('we-')===0)?'recruiting':null);
  const isHere=l=>!!plat&&l[2]===plat&&l[0]!=='Rúbricas'&&l[0]!=='Laboratorio';
  ov.innerHTML='<div class="bh"><h2>WEXPAND BRAIN</h2><span class="sub">Cerebro Universal</span><span class="live"><i></i><span id="brLive">connecting…</span></span><span style="flex:1"></span>'+(opts.onRubricas?'<button id="brRub" style="background:#F07E2E;border-color:#F07E2E;color:#fff;font-weight:700">Rúbricas de evaluación</button>':'')+'<button id="brFs">Full screen</button>'+(opts.embed?'':'<button id="brX">Close ✕</button>')+'</div>'+
    '<div class="bar"><div class="views" role="group" aria-label="Vista">'+[['all','Universal'],['recruiting','Recruiting'],['growth','Growth OS'],['sim','Simulador'],['lab','Evaluación']].map((v,i)=>'<button data-v="'+v[0]+'" aria-pressed="'+(i===0)+'">'+v[1]+'</button>').join('')+'</div>'+
    '<div class="plat">'+BRAIN_LINKS.filter(l=>!(opts.onRubricas&&l[0]==='Rúbricas')).map(l=>'<a href="'+l[1]+'" target="_blank" rel="noopener" class="'+(isHere(l)?'here':'')+'"><i style="background:'+(l[2]?BRAIN_HUBS[l[2]].color:'#c9d6e3')+'"></i>'+l[0]+(isHere(l)?' · aquí':' ↗')+'</a>').join('')+'</div></div>'+
    '<div class="bm"><canvas id="brC"></canvas><div class="feed" id="brFeed"></div><div class="tip" id="brTip"></div><div class="leg"><span id="brLeg"></span><span><i style="background:#c9d6e3"></i>Positions</span><span><i style="background:transparent;border:2px solid #2E9E5B"></i>Anillo = salud de evaluación</span><span style="opacity:.8">Clic en un sub-cerebro para enfocarlo · pulso brillante = acción real</span></div></div>';
  if(opts.mount){ov.style.position='absolute';opts.mount.appendChild(ov);}else document.body.appendChild(ov);
  const cv=ov.querySelector('#brC'),cx=cv.getContext('2d'),tip=ov.querySelector('#brTip'),feed=ov.querySelector('#brFeed'),live=ov.querySelector('#brLive');
  const S={nodes:new Map(),links:[],pulses:[],seen:new Set(),queue:[],agents:{},evalBy:{},brains:{},w:0,h:0,dpr:1,hover:null,raf:0,timer:0,rel:0,first:true,firstT:true,firstE:true,t0:performance.now(),view:'all',hubPos:{}};
  _brain=S;
  function size(){const r=cv.getBoundingClientRect();S.dpr=window.devicePixelRatio||1;S.w=r.width;S.h=r.height;cv.width=r.width*S.dpr;cv.height=r.height*S.dpr;}
  size();const ro=new ResizeObserver(size);ro.observe(cv);S.ro=ro;
  function node(id,type,label,color,extra){let n=S.nodes.get(id);if(n)return n;const a=Math.random()*6.28,d=60+Math.random()*80;n=Object.assign({id,type,label,color,x:S.w/2+Math.cos(a)*d,y:S.h/2+Math.sin(a)*d,vx:0,vy:0,r:type==='core'?20:type==='hub'?14:type==='agent'?12:type==='pos'?8:4.5,born:performance.now(),flash:0,info:'',group:'all'},extra||{});S.nodes.set(id,n);return n;}
  function link(a,b,color,w,dash){if(S.links.some(l=>l.a===a&&l.b===b))return;S.links.push({a,b,color,w:w||1,dash:!!dash});}
  function pulse(a,b,color,real){const A=S.nodes.get(a),B=S.nodes.get(b);if(!A||!B)return;S.pulses.push({a:A,b:B,color,t:0,real:!!real,sp:real?0.9:0.55});}
  const core=node('core','core','Cerebro Universal','#e8f3ff');
  Object.entries(BRAIN_HUBS).forEach(([k,h])=>{node('hub:'+k,'hub',h.label,h.color,{group:k,hub:k});link('core','hub:'+k,h.color,1.6);});
  ['recruiting','growth','sim'].forEach(k=>link('hub:lab','hub:'+k,BRAIN_HUBS.lab.color,1.1,true));
  function evalKey(agentId){if(agentId.indexOf('s:')===0){const k=agentId.slice(2);return k==='followup'?'gos_followup':k;}return agentId;}
  function syncAgents(list,sim){
    const groups={recruiting:list.filter(a=>a.area!=='sales'),growth:list.filter(a=>a.area==='sales'),sim:(sim||[]).map(a=>({key:'sim:'+a.key,name:a.name,enabled:a.status!=='paused',area:'sim',description:a.description,status:a.status}))};
    Object.entries(groups).forEach(([g,arr])=>arr.forEach((a,i)=>{const id='ag:'+a.key;const col=g==='recruiting'?(BRAIN_COL[a.key]||'#9fb6cc'):g==='growth'?BRAIN_SALES[i%BRAIN_SALES.length]:BRAIN_SIM[i%BRAIN_SIM.length];
      let x=S.nodes.get(id);const ang=-Math.PI/2+i*2*Math.PI/Math.max(arr.length,1);
      if(!x){x=node(id,'agent',a.name||BRAIN_LBL[a.key]||a.key,col,{ang,group:g,hub:g});link('hub:'+g,id,col,1.2);}else x.ang=ang;
      BRAIN_COL[a.key]=col;BRAIN_LBL[a.key]=a.name||BRAIN_LBL[a.key]||a.key;if(g==='sim'){x.enabled=a.enabled;x.info=a;}}));
  }
  function visible(n){return S.view==='all'||n.type==='core'||n.group===S.view||(S.view==='lab'&&n.type==='hub')||(S.view==='lab'&&n.type==='agent');}
  function addEvent(ev,animate){
    const k=ev.agent_key;if(!BRAIN_COL[k]||!S.nodes.has('ag:'+k))return;const col=BRAIN_COL[k];
    const sales=k.indexOf('s:')===0;const g=sales?'growth':'recruiting';const pname=ev.position||(sales?'Sales':k==='analytics'?'Reports':'(no position)');const pid='pos:'+pname;
    if(!S.nodes.has(pid)){node(pid,'pos',pname.length>26?pname.slice(0,25)+'…':pname,'#c9d6e3',{info:pname,group:g});link('hub:'+g,pid,'#6f8ba5',0.6);}
    const nm=ev.candidate||ev.headline||BRAIN_KIND[ev.kind]||ev.kind||'Item';const cid='c:'+(ev.candidate||ev.id)+'|'+pname;
    const cn=node(cid,'cand',sales?String(nm).slice(0,22):brainShort(nm),col,{info:ev,group:g});cn.color=col;cn.info=ev;
    link('ag:'+k,cid,col,0.8);link(cid,pid,'#47627a',0.5);
    if(animate){const ag=S.nodes.get('ag:'+k);ag.flash=1;pulse('ag:'+k,cid,col,true);setTimeout(()=>pulse(cid,pid,col,true),700);cn.born=performance.now();
      feedAdd(col,'<b style="color:'+col+'">'+brainEsc(BRAIN_LBL[k])+'</b> · '+brainEsc(sales?String(nm).slice(0,40):brainShort(nm))+(ev.verdict?' → <i>'+brainEsc(ev.verdict)+'</i>':'')+'<br><span style="opacity:.7">'+brainEsc(pname)+' · '+brainAgo(ev.created_at)+'</span>');}
  }
  function feedAdd(col,html){const d=document.createElement('div');d.style.borderColor=col;d.innerHTML=html;feed.prepend(d);while(feed.children.length>7)feed.lastChild.remove();}
  function addTask(t){const k=t.agent_key;if(!S.nodes.has('ag:'+k))return;const col=BRAIN_COL[k]||'#9fb6cc';const ag=S.nodes.get('ag:'+k);ag.flash=1;pulse('hub:recruiting','ag:'+k,'#e8f3ff',true);
    feedAdd('#e8f3ff','<b>Orchestrator</b> → <b style="color:'+col+'">'+brainEsc(BRAIN_LBL[k]||k)+'</b><br><span style="opacity:.7">'+brainEsc(t.status)+(t.trigger?' · '+brainEsc(t.trigger):'')+' · '+brainAgo(t.created_at)+'</span>');}
  function addEvalEvent(e){const p=typeof e.payload==='string'?JSON.parse(e.payload):(e.payload||{});const lab=S.nodes.get('hub:lab');if(lab)lab.flash=1;
    let src=null;S.nodes.forEach(n=>{if(n.type==='agent'&&evalKey(n.id.slice(3))===p.agent_key)src=n.id;});
    if(src){pulse(src,'hub:lab',BRAIN_HUBS.lab.color,true);setTimeout(()=>pulse('hub:lab','core',BRAIN_HUBS.lab.color,true),800);}
    feedAdd('#C8372D','<b style="color:#ff8a80">● Falla crítica</b> · '+brainEsc(p.agent_key||'')+' · '+brainEsc(p.criterio||'')+'<br><span style="opacity:.75">'+brainEsc(p.reviewer||'')+(p.nota?' · '+brainEsc(String(p.nota).slice(0,60)):'')+' · '+brainAgo(e.created_at)+'</span>');}
  function prune(){const cands=[...S.nodes.values()].filter(n=>n.type==='cand').sort((a,b)=>a.born-b.born);while(cands.length>90){const o=cands.shift();S.nodes.delete(o.id);S.links=S.links.filter(l=>l.a!==o.id&&l.b!==o.id);}}
  async function poll(){
    const [g,u]=await Promise.all([sb.rpc('brain_graph',{p_limit:150}),sb.rpc('brain_universe')]);
    if(!_brain)return;
    const data=g.data,uni=(u&&!u.error&&u.data)||{};
    if(g.error||!data){live.textContent='no connection';return;}
    syncAgents(data.agents||[],uni.sim_agents||[]);
    S.evalBy={};(uni.eval||[]).forEach(e=>{S.evalBy[e.agent_key]=e;});
    S.brains={};(uni.brains||[]).forEach(b=>{S.brains[b.key]=b;});
    (data.agents||[]).forEach(a=>{S.agents[a.key]=a;const n=S.nodes.get('ag:'+a.key);if(n){n.enabled=a.enabled;n.info=a;if(a.last_run_at&&Date.now()-new Date(a.last_run_at).getTime()<150000){n.flash=1;}}});
    const evs=(data.events||[]).slice().reverse();
    const fresh=evs.filter(e=>!S.seen.has(e.id));fresh.forEach(e=>S.seen.add(e.id));
    if(S.first){S.first=false;const old=fresh.slice(0,Math.max(0,fresh.length-22));old.forEach(e=>addEvent(e,false));S.queue.push(...fresh.slice(old.length));}
    else S.queue.push(...fresh);
    const tk=(data.tasks||[]).slice().reverse().filter(t=>!S.seen.has('t:'+t.id));tk.forEach(t=>S.seen.add('t:'+t.id));
    if(S.firstT){S.firstT=false;}else S.queue.push(...tk.map(t=>Object.assign({_task:true},t)));
    const ee=(uni.eval_events||[]).slice().reverse().filter(e=>!S.seen.has('e:'+e.id));ee.forEach(e=>S.seen.add('e:'+e.id));
    if(S.firstE){S.firstE=false;ee.slice(-3).forEach(e=>S.queue.push(Object.assign({_eval:true},e)));}else S.queue.push(...ee.map(e=>Object.assign({_eval:true},e)));
    const lg=ov.querySelector('#brLeg');if(lg)lg.innerHTML=Object.values(BRAIN_HUBS).map(h=>'<span style="margin-right:12px"><i style="background:'+h.color+'"></i><b>'+brainEsc(h.label)+'</b></span>').join('');
    prune();
    const on=Object.values(S.agents).filter(a=>a.enabled).length;const pend=Object.values(S.evalBy).reduce((s,e)=>s+(Number(e.pendientes)||0),0);
    const crit=Object.values(S.evalBy).reduce((s,e)=>s+(Number(e.criticas)||0),0);
    live.textContent=on+' of '+Object.keys(S.agents).length+' agents on · '+Object.values(S.agents).reduce((s,a)=>s+(a.today||0),0)+' actions today · '+pend.toLocaleString('en-US')+' por revisar'+(crit?' · '+crit+' fallas críticas (30d)':'');
  }
  function hubXY(k,W,H,R){
    if(S.view!=='all'&&S.view!=='lab'){if(k===S.view)return [W/2,H/2];return [W/2,H/2];}
    const cxm=W/2,cym=H/2,D=R*1.15;
    const ang={recruiting:Math.PI,growth:-Math.PI/4,sim:Math.PI/4,lab:Math.PI/2}[k];
    const d=k==='lab'?R*0.62:D;return [cxm+Math.cos(ang)*d*(k==='lab'?1:1.25),cym+Math.sin(ang)*d];
  }
  function step(){
    const W=S.w,H=S.h,cxm=W/2,cym=H/2,R=Math.min(W,H)*0.27,t=(performance.now()-S.t0)/1000;
    const arr=[...S.nodes.values()];const focus=S.view!=='all'&&S.view!=='lab';
    core.x=focus?cxm:cxm;core.y=focus?cym-R*1.3:cym;core.vx=core.vy=0;
    Object.keys(BRAIN_HUBS).forEach(k=>{const h=S.nodes.get('hub:'+k);const [x,y]=hubXY(k,W,H,R);h.x=x;h.y=y;S.hubPos[k]=[x,y];});
    arr.forEach(n=>{if(n.type==='agent'){const [hx,hy]=S.hubPos[n.hub]||[cxm,cym];const rr=focus?R*0.95:R*(n.hub==='sim'?0.42:n.hub==='recruiting'?0.68:0.55);const dir=n.hub==='growth'?-0.03:0.04;n.x=hx+Math.cos(n.ang+t*dir)*rr*(focus?1.35:1);n.y=hy+Math.sin(n.ang+t*dir)*rr;n.vx=n.vy=0;}});
    for(let i=0;i<arr.length;i++){const a=arr[i];if(a.type==='core'||a.type==='agent'||a.type==='hub')continue;
      for(let j=0;j<arr.length;j++){if(i===j)continue;const b=arr[j];let dx=a.x-b.x,dy=a.y-b.y,d2=dx*dx+dy*dy+0.01;if(d2>40000)continue;const f=(a.type==='pos'&&b.type==='pos'?5200:b.type==='cand'||a.type==='cand'?520:900)/d2,d=Math.sqrt(d2);a.vx+=dx/d*f;a.vy+=dy/d*f;}
      const [hx,hy]=S.hubPos[a.group]||[cxm,cym];const gx=hx-a.x,gy=hy-a.y;const g=a.type==='pos'?0.004:0.0012;a.vx+=gx*g;a.vy+=gy*g;}
    S.links.forEach(l=>{const A=S.nodes.get(l.a),B=S.nodes.get(l.b);if(!A||!B)return;if(A.type==='hub'||A.type==='core')if(B.type==='hub'||B.type==='agent')return;const dx=B.x-A.x,dy=B.y-A.y,d=Math.sqrt(dx*dx+dy*dy)+0.01;const rest=A.type==='hub'?R*0.45:(A.type==='agent'?R*0.4:R*0.25);const f=(d-rest)*(A.type==='cand'||B.type==='cand'?0.012:0.006);const fx=dx/d*f,fy=dy/d*f;if(A.type==='pos'||A.type==='cand'){A.vx+=fx;A.vy+=fy;}if(B.type==='pos'||B.type==='cand'){B.vx-=fx;B.vy-=fy;}});
    arr.forEach(n=>{if(n.type==='core'||n.type==='agent'||n.type==='hub')return;n.vx*=0.86;n.vy*=0.86;n.x+=n.vx;n.y+=n.vy;n.x+=Math.sin(t*0.6+n.born)*0.08;n.y+=Math.cos(t*0.5+n.born)*0.08;n.x=Math.max(20,Math.min(W-20,n.x));n.y=Math.max(20,Math.min(H-20,n.y));});
  }
  function draw(){
    const W=S.w,H=S.h;cx.setTransform(S.dpr,0,0,S.dpr,0,0);cx.clearRect(0,0,W,H);const now=performance.now();
    S.links.forEach(l=>{const A=S.nodes.get(l.a),B=S.nodes.get(l.b);if(!A||!B||!visible(A)||!visible(B))return;cx.strokeStyle=l.color;cx.globalAlpha=0.22*l.w+0.05;cx.lineWidth=l.w;cx.setLineDash(l.dash?[6,6]:[]);cx.beginPath();cx.moveTo(A.x,A.y);cx.lineTo(B.x,B.y);cx.stroke();});
    cx.setLineDash([]);cx.globalAlpha=1;
    S.pulses=S.pulses.filter(p=>{p.t+=0.016*p.sp;if(p.t>=1)return false;if(!visible(p.a)||!visible(p.b))return true;const x=p.a.x+(p.b.x-p.a.x)*p.t,y=p.a.y+(p.b.y-p.a.y)*p.t;const g=cx.createRadialGradient(x,y,0,x,y,p.real?16:8);g.addColorStop(0,p.real?'#ffffff':p.color);g.addColorStop(0.3,p.color);g.addColorStop(1,'rgba(0,0,0,0)');cx.globalAlpha=p.real?1:0.45;cx.fillStyle=g;cx.beginPath();cx.arc(x,y,p.real?16:8,0,6.29);cx.fill();cx.globalAlpha=1;return true;});
    S.nodes.forEach(n=>{
      if(!visible(n))return;
      const age=Math.min(1,(now-n.born)/600),pop=n.type==='cand'?(age<1?1+Math.sin(age*3.14)*0.9:1):1;n.flash=Math.max(0,n.flash-0.008);
      const off=n.type==='agent'&&n.enabled===false;const r=n.r*pop*(1+n.flash*0.25);
      const gl=cx.createRadialGradient(n.x,n.y,0,n.x,n.y,r*(n.type==='cand'?3.2:4+n.flash*3));gl.addColorStop(0,n.color);gl.addColorStop(1,'rgba(0,0,0,0)');cx.globalAlpha=(off?0.12:0.28+n.flash*0.5);cx.fillStyle=gl;cx.beginPath();cx.arc(n.x,n.y,r*(n.type==='cand'?3.2:4+n.flash*3),0,6.29);cx.fill();
      cx.globalAlpha=off?0.45:1;cx.fillStyle=n.type==='core'?'#e8f3ff':n.color;cx.beginPath();cx.arc(n.x,n.y,r,0,6.29);cx.fill();
      if(n.type==='hub'){cx.strokeStyle='#e8f3ff';cx.lineWidth=2;cx.globalAlpha=0.8;cx.beginPath();cx.arc(n.x,n.y,r+4,0,6.29);cx.stroke();}
      if(n.type==='agent'){const ev=S.evalBy[evalKey(n.id.slice(3))];if(ev){cx.lineWidth=2.5;cx.globalAlpha=0.95;cx.strokeStyle=BRAIN_SEM[ev.semaforo]||'#6f8ba5';cx.setLineDash(BRAIN_SEM[ev.semaforo]?[]:[3,3]);cx.beginPath();cx.arc(n.x,n.y,r+5,0,6.29);cx.stroke();cx.setLineDash([]);}}
      if(n.type==='cand'&&n.info&&n.info.status==='rejected'){cx.globalAlpha=0.55;cx.fillStyle='#07131f';cx.beginPath();cx.arc(n.x,n.y,r*0.5,0,6.29);cx.fill();}
      cx.globalAlpha=1;
      const show=n.type!=='cand'||S.hover===n||now-n.born<6000;
      if(show){cx.font=(n.type==='core'||n.type==='hub'?'bold 13.5px':n.type==='agent'?'bold 12px':'11px')+' Arial';cx.textAlign='center';cx.fillStyle=n.type==='cand'?'#c7d9ea':n.type==='hub'?n.color:'#e8f3ff';cx.globalAlpha=off?0.5:0.95;cx.fillText(n.label+(off?' (off)':''),n.x,n.y+r+(n.type==='agent'?18:15));cx.globalAlpha=1;}
    });
  }
  function ambient(){const ls=S.links.filter(l=>S.nodes.has(l.a)&&S.nodes.has(l.b));if(!ls.length)return;const l=ls[Math.floor(Math.random()*ls.length)];const A=S.nodes.get(l.a);if(A.type==='agent'&&A.enabled===false)return;pulse(l.a,l.b,l.color,false);}
  function loop(){step();draw();S.raf=requestAnimationFrame(loop);}
  S.raf=requestAnimationFrame(loop);
  S.rel=setInterval(()=>{const e=S.queue.shift();if(e)(e._eval?addEvalEvent(e):e._task?addTask(e):addEvent(e,true));},900);
  S.amb=setInterval(()=>{ambient();if(Math.random()<0.5)ambient();},500);
  S.timer=setInterval(poll,8000);poll().catch(()=>{live.textContent='no connection';});
  function hit(e){const r=cv.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;let best=null,bd=14;S.nodes.forEach(n=>{if(!visible(n))return;const d=Math.hypot(n.x-x,n.y-y)-n.r;if(d<bd){bd=d;best=n;}});return {best,x,y};}
  function setView(v){S.view=v;ov.querySelectorAll('.views button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.v===v));}
  ov.querySelectorAll('.views button').forEach(b=>b.onclick=()=>setView(b.dataset.v));
  cv.addEventListener('click',e=>{const {best}=hit(e);if(best&&best.type==='hub')setView(S.view===best.hub?'all':best.hub);else if(best&&best.type==='core')setView('all');});
  cv.addEventListener('mousemove',e=>{const {best,x,y}=hit(e);S.hover=best;cv.style.cursor=best&&(best.type==='hub'||best.type==='core')?'pointer':'default';
    if(best){let h='<b>'+brainEsc(best.type==='cand'?(best.info.candidate||best.label):best.type==='pos'?best.info:best.label)+'</b>';
      if(best.type==='cand'&&best.info){h+='<br>'+brainEsc(BRAIN_LBL[best.info.agent_key]||'')+' · '+brainEsc(best.info.kind||'')+(best.info.verdict?' → '+brainEsc(best.info.verdict):'')+(best.info.score?' (fit '+brainEsc(best.info.score)+')':'')+'<br>'+brainEsc(best.info.position||'')+' · '+brainAgo(best.info.created_at);}
      else if(best.type==='agent'){const i=best.info||{};if(i.key&&i.area!=='sim'){h+='<br>'+(i.enabled?'On':'Off')+' · '+(i.today||0)+' actions today'+(i.last_run_at?'<br>Last run '+brainAgo(i.last_run_at)+' ago':'')+(i.last_result?'<br><span style="opacity:.75">'+brainEsc(String(i.last_result).slice(0,120))+'</span>':'');}else if(i.description){h+='<br><span style="opacity:.8">'+brainEsc(i.description)+'</span>';}
        const ev=S.evalBy[evalKey(best.id.slice(3))];if(ev){h+='<br><span style="color:#F07E2E">Evaluación</span> · '+ev.criterios+' criterios · '+Number(ev.pendientes).toLocaleString('en-US')+' por revisar'+(ev.revisadas?' · salud '+(ev.salud??'—'):'')+' · '+brainEsc(ev.semaforo||'sin datos')+(ev.criticas?' · '+ev.criticas+' críticas':'');}
        else if(best.id.indexOf('ag:sim:')===0){h+='<br><span style="color:#F07E2E">Evaluación</span> · ver en el Laboratorio';}}
      else if(best.type==='hub'){const b=S.brains[BRAIN_HUBS[best.hub].brain]||{};h+='<br>'+(b.agentes??'—')+' agentes · '+(b.reglas??0)+' reglas · '+(b.decisiones_abiertas??0)+' decisiones abiertas'+(best.hub!=='lab'?'<br>'+(b.revisiones_pendientes!=null?Number(b.revisiones_pendientes).toLocaleString('en-US')+' por revisar':'Evaluación en el Laboratorio')+(b.rojos?' · '+b.rojos+' en rojo':''):'<br>Audita a Recruiting, Growth OS y Simulador')+'<br><span style="opacity:.7">Clic para enfocar</span>';}
      else if(best.type==='core'){const u=S.brains.universal||{};h+='<br>4 sub-cerebros · '+(u.reglas??0)+' reglas · '+(u.eventos_pendientes??0)+' alertas sin atender';}
      tip.innerHTML=h;tip.style.display='block';tip.style.left=Math.min(x+14,S.w-290)+'px';tip.style.top=(y+14)+'px';}else tip.style.display='none';});
  if(ov.querySelector('#brX'))ov.querySelector('#brX').onclick=closeBrain;
  if(opts.onRubricas)ov.querySelector('#brRub').onclick=()=>opts.onRubricas();
  if(opts.view&&opts.view!=='all')setView(opts.view);
  ov.querySelector('#brFs').onclick=()=>{if(document.fullscreenElement)document.exitFullscreen();else ov.requestFullscreen&&ov.requestFullscreen().catch(()=>{});};
  S.key=e=>{if(!opts.embed&&e.key==='Escape'&&!document.fullscreenElement)closeBrain();};document.addEventListener('keydown',S.key);
}
function closeBrain(){const S=_brain;if(!S)return;cancelAnimationFrame(S.raf);clearInterval(S.timer);clearInterval(S.rel);clearInterval(S.amb);S.ro&&S.ro.disconnect();document.removeEventListener('keydown',S.key);if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});const o=document.getElementById('brainOv');if(o)o.remove();_brain=null;}
