// ===== BRAIN (live agent graph) =====
const BRAIN_COL={screener:'#4da3ff',followup:'#ffb454',sourcing:'#4be3a0',job_intake:'#b48cff',analytics:'#ff7ab6',interview_analyst:'#5ee6e6',client_intel:'#e6e65e'};
const BRAIN_LBL={screener:'Screener',followup:'Follow-up',sourcing:'Sourcing',job_intake:'Job Intake',analytics:'Analytics',interview_analyst:'Interview Analyst',client_intel:'Client Intel'};
const BRAIN_SALES=['#ff6b6b','#ff8f5a','#ffd25a','#c0e65a','#5ae6c0','#5ac8ff','#8f8bff','#e68bff','#ff8bb8','#b0b8c4'];
const BRAIN_KIND={job_intake:'Intake',analytics_report:'Report',interview_eval:'Interview',client_intel:'Client'};
let _brain=null;
function brainShort(n){n=String(n||'').trim();if(!n)return 'Candidate';const p=n.split(/\s+/);return p[0]+(p[1]?' '+p[1][0]+'.':'');}
function brainAgo(ts){const s=Math.max(0,(Date.now()-new Date(ts).getTime())/1000);if(s<90)return 'now';if(s<3600)return Math.round(s/60)+'m';if(s<86400)return Math.round(s/3600)+'h';return Math.round(s/86400)+'d';}
function openBrain(){
  if(_brain) return;
  if(!document.getElementById('brainCss')){const st=document.createElement('style');st.id='brainCss';st.textContent='#brainOv{position:fixed;inset:0;z-index:9999;background:radial-gradient(ellipse at 50% 42%,#0d2238 0%,#050d16 72%);color:#dfeaf5;font-family:Arial,Helvetica,sans-serif;display:flex;flex-direction:column}#brainOv .bh{display:flex;align-items:center;gap:12px;padding:12px 18px;flex-wrap:wrap}#brainOv .bh h2{margin:0;font-size:17px;letter-spacing:.1em}#brainOv .live{display:flex;align-items:center;gap:6px;font-size:12px;color:#8fb3d1}#brainOv .live i{width:8px;height:8px;border-radius:50%;background:#4be3a0;box-shadow:0 0 8px #4be3a0;animation:bpulse 1.6s infinite}@keyframes bpulse{50%{opacity:.3}}#brainOv button{background:#12304a;color:#dfeaf5;border:1px solid #28506f;border-radius:8px;padding:6px 12px;font-size:12.5px;cursor:pointer}#brainOv .bm{flex:1;position:relative;min-height:0}#brainOv canvas{width:100%;height:100%;display:block}#brainOv .feed{position:absolute;right:14px;top:6px;width:min(300px,44vw);overflow:hidden;font-size:11.5px;pointer-events:none}#brainOv .feed div{background:rgba(10,28,44,.78);border-left:3px solid;border-radius:6px;padding:5px 8px;margin-bottom:5px;animation:bin .5s}@keyframes bin{from{opacity:0;transform:translateX(14px)}}#brainOv .leg{position:absolute;left:16px;bottom:12px;right:16px;font-size:11.5px;color:#8fb3d1;display:flex;gap:6px 14px;flex-wrap:wrap}#brainOv .leg i{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:5px}#brainOv .tip{position:absolute;pointer-events:none;background:#0b2236;border:1px solid #2b5578;border-radius:8px;padding:7px 10px;font-size:12px;max-width:260px;display:none;line-height:1.45}';document.head.appendChild(st);}
  const ov=document.createElement('div');ov.id='brainOv';
  ov.innerHTML='<div class="bh"><h2>WEAI BRAIN</h2><span class="live"><i></i><span id="brLive">connecting…</span></span><span style="flex:1"></span><button id="brFs">Full screen</button><button id="brX">Close ✕</button></div><div class="bm"><canvas id="brC"></canvas><div class="feed" id="brFeed"></div><div class="tip" id="brTip"></div><div class="leg"><span id="brLeg"></span><span><i style="background:#c9d6e3"></i>Positions</span><span style="opacity:.8">Bright pulse = real agent action · faint pulse = idle link</span></div></div>';
  document.body.appendChild(ov);
  const cv=ov.querySelector('#brC'),cx=cv.getContext('2d'),tip=ov.querySelector('#brTip'),feed=ov.querySelector('#brFeed'),live=ov.querySelector('#brLive');
  const S={nodes:new Map(),links:[],pulses:[],seen:new Set(),queue:[],agents:{},w:0,h:0,dpr:1,hover:null,raf:0,timer:0,rel:0,first:true,firstT:true,t0:performance.now(),ambient:0};
  _brain=S;
  function size(){const r=cv.getBoundingClientRect();S.dpr=window.devicePixelRatio||1;S.w=r.width;S.h=r.height;cv.width=r.width*S.dpr;cv.height=r.height*S.dpr;}
  size();const ro=new ResizeObserver(size);ro.observe(cv);S.ro=ro;
  function node(id,type,label,color,extra){let n=S.nodes.get(id);if(n)return n;const a=Math.random()*6.28,d=60+Math.random()*80;n=Object.assign({id,type,label,color,x:S.w/2+Math.cos(a)*d,y:S.h/2+Math.sin(a)*d,vx:0,vy:0,r:type==='core'?20:type==='agent'?15:type==='pos'?9:4.5,born:performance.now(),flash:0,info:''},extra||{});S.nodes.set(id,n);return n;}
  function link(a,b,color,w){if(S.links.some(l=>l.a===a&&l.b===b))return;S.links.push({a,b,color,w:w||1});}
  function pulse(a,b,color,real){const A=S.nodes.get(a),B=S.nodes.get(b);if(!A||!B)return;S.pulses.push({a:A,b:B,color,t:0,real:!!real,sp:real?0.9:0.55});}
  const core=node('core','core','Orchestrator','#e8f3ff');
  function syncAgents(list){const rec=list.filter(a=>a.area!=='sales'),sal=list.filter(a=>a.area==='sales');
    const mk=(a,i,n,ring,col)=>{const id='ag:'+a.key;let x=S.nodes.get(id);if(!x){x=node(id,'agent',a.name||BRAIN_LBL[a.key]||a.key,col,{ang:-Math.PI/2+i*2*Math.PI/Math.max(n,1)+(ring>1?0.3:0),ring});link('core',id,col,ring>1?0.9:1.4);}else{x.ang=-Math.PI/2+i*2*Math.PI/Math.max(n,1)+(ring>1?0.3:0);}BRAIN_COL[a.key]=col;BRAIN_LBL[a.key]=a.name||BRAIN_LBL[a.key]||a.key;};
    rec.forEach((a,i)=>mk(a,i,rec.length,1,BRAIN_COL[a.key]||'#9fb6cc'));sal.forEach((a,i)=>mk(a,i,sal.length,2,BRAIN_SALES[i%BRAIN_SALES.length]));}
  function addEvent(ev,animate){
    const k=ev.agent_key;if(!BRAIN_COL[k]||!S.nodes.has('ag:'+k))return;const col=BRAIN_COL[k];
    const sales=k.indexOf('s:')===0;const pname=ev.position||(sales?'Sales':k==='analytics'?'Reports':'(no position)');const pid='pos:'+pname;
    if(!S.nodes.has(pid)){node(pid,'pos',pname.length>26?pname.slice(0,25)+'…':pname,'#c9d6e3',{info:pname});link('core',pid,'#6f8ba5',0.7);}
    const nm=ev.candidate||ev.headline||BRAIN_KIND[ev.kind]||ev.kind||'Item';const cid='c:'+(ev.candidate||ev.id)+'|'+pname;let isNew=!S.nodes.has(cid);
    const cn=node(cid,'cand',sales?String(nm).slice(0,22):brainShort(nm),col,{info:ev});cn.color=col;cn.info=ev;
    link('ag:'+k,cid,col,0.8);link(cid,pid,'#47627a',0.5);
    if(animate){const ag=S.nodes.get('ag:'+k);ag.flash=1;pulse('ag:'+k,cid,col,true);setTimeout(()=>pulse(cid,pid,col,true),700);cn.born=performance.now();
      const d=document.createElement('div');d.style.borderColor=col;d.innerHTML='<b style="color:'+col+'">'+BRAIN_LBL[k]+'</b> · '+esc(sales?String(nm).slice(0,40):brainShort(nm))+(ev.verdict?' → <i>'+esc(ev.verdict)+'</i>':'')+'<br><span style="opacity:.7">'+esc(pname)+' · '+brainAgo(ev.created_at)+'</span>';feed.prepend(d);while(feed.children.length>7)feed.lastChild.remove();}
  }
  function addTask(t){const k=t.agent_key;if(!S.nodes.has('ag:'+k))return;const col=BRAIN_COL[k]||'#9fb6cc';const ag=S.nodes.get('ag:'+k);ag.flash=1;pulse('core','ag:'+k,'#e8f3ff',true);
    const d=document.createElement('div');d.style.borderColor='#e8f3ff';d.innerHTML='<b>Orchestrator</b> → <b style="color:'+col+'">'+esc(BRAIN_LBL[k]||k)+'</b><br><span style="opacity:.7">'+esc(t.status)+(t.trigger?' · '+esc(t.trigger):'')+' · '+brainAgo(t.created_at)+'</span>';feed.prepend(d);while(feed.children.length>7)feed.lastChild.remove();}
  function prune(){const cands=[...S.nodes.values()].filter(n=>n.type==='cand').sort((a,b)=>a.born-b.born);while(cands.length>90){const o=cands.shift();S.nodes.delete(o.id);S.links=S.links.filter(l=>l.a!==o.id&&l.b!==o.id);}}
  async function poll(){
    const {data,error}=await sb.rpc('brain_graph',{p_limit:150});
    if(!_brain)return;
    if(error||!data){live.textContent='no connection';return;}
    syncAgents(data.agents||[]);
    (data.agents||[]).forEach(a=>{S.agents[a.key]=a;const n=S.nodes.get('ag:'+a.key);if(n){n.enabled=a.enabled;n.info=a;if(a.last_run_at&&Date.now()-new Date(a.last_run_at).getTime()<150000){n.flash=1;}}});
    const evs=(data.events||[]).slice().reverse();
    const fresh=evs.filter(e=>!S.seen.has(e.id));fresh.forEach(e=>S.seen.add(e.id));
    if(S.first){S.first=false;const old=fresh.slice(0,Math.max(0,fresh.length-22));old.forEach(e=>addEvent(e,false));S.queue.push(...fresh.slice(old.length));}
    else S.queue.push(...fresh);
    const tk=(data.tasks||[]).slice().reverse().filter(t=>!S.seen.has('t:'+t.id));tk.forEach(t=>S.seen.add('t:'+t.id));
    if(S.firstT){S.firstT=false;}else S.queue.push(...tk.map(t=>Object.assign({_task:true},t)));
    const lg=ov.querySelector('#brLeg');if(lg)lg.innerHTML=(data.agents||[]).map(a=>'<span style="margin-right:12px"><i style="background:'+(BRAIN_COL[a.key]||'#9fb6cc')+'"></i>'+esc(BRAIN_LBL[a.key]||a.key)+'</span>').join('');
    prune();
    const on=Object.values(S.agents).filter(a=>a.enabled).length;
    live.textContent=on+' of '+Object.keys(S.agents).length+' agents on · '+Object.values(S.agents).reduce((s,a)=>s+(a.today||0),0)+' actions today';
  }
  function step(){
    const W=S.w,H=S.h,cxm=W/2,cym=H/2,R=Math.min(W,H)*0.27,t=(performance.now()-S.t0)/1000;
    const arr=[...S.nodes.values()];
    core.x=cxm;core.y=cym;core.vx=core.vy=0;
    arr.forEach(n=>{if(n.type==='agent'){const rr=R*(n.ring>1?1.7:1.25),dir=n.ring>1?-0.03:0.05;n.x=cxm+Math.cos(n.ang+t*dir)*rr*(n.ring>1?1.15:1);n.y=cym+Math.sin(n.ang+t*dir)*rr;n.vx=n.vy=0;}});
    for(let i=0;i<arr.length;i++){const a=arr[i];if(a.type==='core'||a.type==='agent')continue;
      for(let j=0;j<arr.length;j++){if(i===j)continue;const b=arr[j];let dx=a.x-b.x,dy=a.y-b.y,d2=dx*dx+dy*dy+0.01;if(d2>40000)continue;const f=(a.type==='pos'&&b.type==='pos'?5200:b.type==='cand'||a.type==='cand'?520:900)/d2,d=Math.sqrt(d2);a.vx+=dx/d*f;a.vy+=dy/d*f;}
      const gx=cxm-a.x,gy=cym-a.y;const g=a.type==='pos'?0.004:0.0012;a.vx+=gx*g;a.vy+=gy*g;}
    S.links.forEach(l=>{const A=S.nodes.get(l.a),B=S.nodes.get(l.b);if(!A||!B)return;const dx=B.x-A.x,dy=B.y-A.y,d=Math.sqrt(dx*dx+dy*dy)+0.01;const rest=l.a==='core'?R*0.72:(A.type==='agent'?R*0.7:R*0.35);const f=(d-rest)*(A.type==='cand'||B.type==='cand'?0.012:0.006);const fx=dx/d*f,fy=dy/d*f;if(A.type!=='core'&&A.type!=='agent'){A.vx+=fx;A.vy+=fy;}if(B.type!=='core'&&B.type!=='agent'){B.vx-=fx;B.vy-=fy;}});
    arr.forEach(n=>{if(n.type==='core'||n.type==='agent')return;n.vx*=0.86;n.vy*=0.86;n.x+=n.vx;n.y+=n.vy;n.x+=Math.sin(t*0.6+n.born)*0.08;n.y+=Math.cos(t*0.5+n.born)*0.08;n.x=Math.max(20,Math.min(W-20,n.x));n.y=Math.max(20,Math.min(H-20,n.y));});
  }
  function draw(){
    const W=S.w,H=S.h;cx.setTransform(S.dpr,0,0,S.dpr,0,0);cx.clearRect(0,0,W,H);const now=performance.now();
    S.links.forEach(l=>{const A=S.nodes.get(l.a),B=S.nodes.get(l.b);if(!A||!B)return;cx.strokeStyle=l.color;cx.globalAlpha=0.22*l.w+0.05;cx.lineWidth=l.w;cx.beginPath();cx.moveTo(A.x,A.y);cx.lineTo(B.x,B.y);cx.stroke();});
    cx.globalAlpha=1;
    S.pulses=S.pulses.filter(p=>{p.t+=0.016*p.sp;if(p.t>=1)return false;const x=p.a.x+(p.b.x-p.a.x)*p.t,y=p.a.y+(p.b.y-p.a.y)*p.t;const g=cx.createRadialGradient(x,y,0,x,y,p.real?16:8);g.addColorStop(0,p.real?'#ffffff':p.color);g.addColorStop(0.3,p.color);g.addColorStop(1,'rgba(0,0,0,0)');cx.globalAlpha=p.real?1:0.45;cx.fillStyle=g;cx.beginPath();cx.arc(x,y,p.real?16:8,0,6.29);cx.fill();cx.globalAlpha=1;return true;});
    S.nodes.forEach(n=>{
      const age=Math.min(1,(now-n.born)/600),pop=n.type==='cand'?(age<1?1+Math.sin(age*3.14)*0.9:1):1;n.flash=Math.max(0,n.flash-0.008);
      const off=n.type==='agent'&&n.enabled===false;const r=n.r*pop*(1+n.flash*0.25);
      const gl=cx.createRadialGradient(n.x,n.y,0,n.x,n.y,r*(n.type==='cand'?3.2:4+n.flash*3));gl.addColorStop(0,n.color);gl.addColorStop(1,'rgba(0,0,0,0)');cx.globalAlpha=(off?0.12:0.28+n.flash*0.5);cx.fillStyle=gl;cx.beginPath();cx.arc(n.x,n.y,r*(n.type==='cand'?3.2:4+n.flash*3),0,6.29);cx.fill();
      cx.globalAlpha=off?0.45:1;cx.fillStyle=n.type==='core'?'#e8f3ff':n.color;cx.beginPath();cx.arc(n.x,n.y,r,0,6.29);cx.fill();
      if(n.type==='cand'&&n.info&&n.info.status==='rejected'){cx.globalAlpha=0.55;cx.fillStyle='#07131f';cx.beginPath();cx.arc(n.x,n.y,r*0.5,0,6.29);cx.fill();}
      cx.globalAlpha=1;
      const show=n.type!=='cand'||S.hover===n||now-n.born<6000;
      if(show){cx.font=(n.type==='agent'||n.type==='core'?'bold 12.5px':'11px')+' Arial';cx.textAlign='center';cx.fillStyle=n.type==='cand'?'#c7d9ea':'#e8f3ff';cx.globalAlpha=off?0.5:0.95;cx.fillText(n.label+(off?' (off)':''),n.x,n.y+r+14);cx.globalAlpha=1;}
    });
  }
  function ambient(){const ls=S.links.filter(l=>S.nodes.has(l.a)&&S.nodes.has(l.b));if(!ls.length)return;const l=ls[Math.floor(Math.random()*ls.length)];const A=S.nodes.get(l.a);if(A.type==='agent'&&A.enabled===false)return;pulse(l.a,l.b,l.color,false);}
  function loop(){step();draw();S.raf=requestAnimationFrame(loop);}
  S.raf=requestAnimationFrame(loop);
  S.rel=setInterval(()=>{const e=S.queue.shift();if(e)(e._task?addTask(e):addEvent(e,true));},S.queue.length>8?350:900);
  S.amb=setInterval(()=>{ambient();if(Math.random()<0.5)ambient();},500);
  S.timer=setInterval(poll,8000);poll();
  cv.addEventListener('mousemove',e=>{const r=cv.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;let best=null,bd=14;S.nodes.forEach(n=>{const d=Math.hypot(n.x-x,n.y-y)-n.r;if(d<bd){bd=d;best=n;}});S.hover=best;
    if(best){let h='<b>'+esc(best.type==='cand'?(best.info.candidate||best.label):best.type==='pos'?best.info:best.label)+'</b>';
      if(best.type==='cand'&&best.info){h+='<br>'+esc(BRAIN_LBL[best.info.agent_key]||'')+' · '+esc(best.info.kind||'')+(best.info.verdict?' → '+esc(best.info.verdict):'')+(best.info.score?' (fit '+esc(best.info.score)+')':'')+'<br>'+esc(best.info.position||'')+' · '+brainAgo(best.info.created_at);}
      else if(best.type==='agent'&&best.info&&best.info.key){h+='<br>'+(best.info.enabled?'On':'Off')+' · '+(best.info.today||0)+' actions today'+(best.info.last_run_at?'<br>Last run '+brainAgo(best.info.last_run_at)+' ago':'')+(best.info.last_result?'<br><span style="opacity:.75">'+esc(String(best.info.last_result).slice(0,120))+'</span>':'');}
      tip.innerHTML=h;tip.style.display='block';tip.style.left=Math.min(x+14,S.w-270)+'px';tip.style.top=(y+14)+'px';}else tip.style.display='none';});
  ov.querySelector('#brX').onclick=closeBrain;
  ov.querySelector('#brFs').onclick=()=>{if(document.fullscreenElement)document.exitFullscreen();else ov.requestFullscreen&&ov.requestFullscreen().catch(()=>{});};
  S.key=e=>{if(e.key==='Escape'&&!document.fullscreenElement)closeBrain();};document.addEventListener('keydown',S.key);
}
function closeBrain(){const S=_brain;if(!S)return;cancelAnimationFrame(S.raf);clearInterval(S.timer);clearInterval(S.rel);clearInterval(S.amb);S.ro&&S.ro.disconnect();document.removeEventListener('keydown',S.key);if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});const o=document.getElementById('brainOv');if(o)o.remove();_brain=null;}
