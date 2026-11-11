/* assistant2.js — chat del WeAI Assistant más grande, con botón para ampliar y mensajes que no se cortan. */
(function(){
  'use strict';
  var css=[
    '.assistant{width:460px;height:min(700px,86vh);max-height:86vh;max-width:96vw}',
    '.assistant.big{width:min(900px,96vw);height:calc(100vh - 110px);max-height:calc(100vh - 110px);right:2vw}',
    '#aBody{overflow-y:auto;overflow-x:hidden}',
    '#aBody,#aBody *{overflow-wrap:anywhere;word-break:break-word;max-width:100%}',
    '#aBody pre,#aBody code{white-space:pre-wrap}',
    '#aBody table{display:block;overflow-x:auto}',
    '#aBody img{max-width:100%;height:auto}',
    '#aExpand{background:transparent;border:0;color:#fff;font-size:18px;line-height:1;cursor:pointer;padding:4px 8px;margin-left:auto;opacity:.9}',
    '#aExpand:hover{opacity:1}',
    '@media(max-width:600px){.assistant{width:96vw;right:2vw;height:82vh;max-height:82vh}#aExpand{display:none}}'
  ].join('\n');
  try{var st=document.createElement('style');st.id='assistant2-css';st.textContent=css;document.head.appendChild(st);}catch(e){}

  function init(){
    try{
      var a=document.getElementById('assistant'); var close=document.getElementById('aClose');
      if(!a||!close||document.getElementById('aExpand')) return;
      var b=document.createElement('button'); b.id='aExpand'; b.type='button'; b.title='Ampliar / reducir'; b.setAttribute('aria-label','Ampliar o reducir el chat'); b.textContent='⤢';
      close.parentNode.insertBefore(b,close);
      var big=false; try{big=localStorage.getItem('assistantBig')==='1';}catch(e){}
      function apply(){ a.classList.toggle('big',big); b.textContent=big?'⤡':'⤢'; var body=document.getElementById('aBody'); if(body) body.scrollTop=body.scrollHeight; }
      b.onclick=function(){ big=!big; try{localStorage.setItem('assistantBig',big?'1':'0');}catch(e){} apply(); };
      apply();
    }catch(e){}
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
