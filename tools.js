/* ============================================================
   Tools Kit — ported from Jalal Khan's ABIX LAB single-file
   portfolio (the uploaded index__3.html). All 68 tools, registry
   + builders, unchanged logic. Wrapped in an IIFE so its `$`,
   TOOLS and BUILDERS stay scoped and cannot clash with the
   portfolio's own script.js (which also defines a global `$`).
   External libraries (pdf-lib, Tesseract, JsBarcode, marked,
   DOMPurify, js-beautify) load from jsDelivr in index.html;
   tools that need them say so honestly if the CDN is offline.
   ============================================================ */
(function () {
"use strict";
/* ================= Tools registry ================= */
const TOOLS = [
 {id:'scale',  ic:'🎨', name:'Colour Scale Generator', cat:'Design', desc:'Make a full 50–900 colour family from any base colour — the reel concept, live.'},
 {id:'picker', ic:'🧪', name:'Colour Picker & Converter', cat:'Design', desc:'Pick any colour and convert between HEX, RGB and HSL.'},
 {id:'gradient',ic:'🌈', name:'CSS Gradient Generator', cat:'Design', desc:'Build a two-colour gradient visually and copy the CSS.'},
 {id:'shadow', ic:'⬛', name:'Box Shadow Generator', cat:'Design', desc:'Craft box-shadow values with sliders and copy the CSS.'},
 {id:'contrast',ic:'◐', name:'Contrast Checker', cat:'Design', desc:'WCAG contrast ratio between text and background — AA / AAA verdict.'},
 {id:'qr',     ic:'🔳', name:'QR Generator', cat:'Utility', desc:'Create a QR code for any URL or text and download it.'},
 {id:'passgen',ic:'🔑', name:'Password Generator', cat:'Security', desc:'Strong random passwords with custom rules, made locally.'},
 {id:'hash',   ic:'#️⃣', name:'Hash Generator', cat:'Security', desc:'SHA-1, SHA-256 and SHA-512 hashes of any text.'},
 {id:'uuid',   ic:'🆔', name:'UUID Generator', cat:'Dev', desc:'Generate RFC-4122 v4 UUIDs, one or in bulk.'},
 {id:'json',   ic:'{}', name:'JSON Formatter', cat:'Dev', desc:'Beautify, minify and validate JSON in the browser.'},
 {id:'regex',  ic:'.*', name:'Regex Tester', cat:'Dev', desc:'Test regular expressions with live match highlighting.'},
 {id:'diff',   ic:'±', name:'Diff Checker', cat:'Dev', desc:'Compare two texts line by line and see what changed.'},
 {id:'base64', ic:'🔤', name:'Base64 Encode / Decode', cat:'Encoding', desc:'Encode or decode Base64, Unicode-safe.'},
 {id:'urlenc', ic:'🔗', name:'URL Encoder / Decoder', cat:'Encoding', desc:'Encode or decode special characters in URLs.'},
 {id:'morse',  ic:'📻', name:'Morse Code Translator', cat:'Encoding', desc:'Text to Morse and back, with sound playback.'},
 {id:'base',   ic:'🔢', name:'Number Base Converter', cat:'Converters', desc:'Convert between binary, octal, decimal and hex.'},
 {id:'unit',   ic:'📏', name:'Unit Converter', cat:'Converters', desc:'Length, weight, temperature and speed conversions.'},
 {id:'ts',     ic:'🕐', name:'Timestamp Converter', cat:'Converters', desc:'Unix timestamp ↔ human date, in your timezone.'},
 {id:'word',   ic:'📝', name:'Word Counter', cat:'Text', desc:'Words, characters, sentences and reading time.'},
 {id:'case',   ic:'Aa', name:'Case Converter', cat:'Text', desc:'UPPER, lower, Title, camelCase, snake_case and more.'},
 {id:'lorem',  ic:'¶', name:'Lorem Ipsum Generator', cat:'Text', desc:'Placeholder text of any length for your designs.'},
 {id:'pal',    ic:'🔁', name:'Palindrome Checker', cat:'Text', desc:'Does it read the same forwards and backwards?'},
 {id:'age',    ic:'🎂', name:'Age Calculator', cat:'Utility', desc:'Exact age in years, months, days and hours.'},
 {id:'imgc',   ic:'🗜️', name:'Image Compressor', cat:'Images', desc:'Shrink JPEG / PNG / WebP in your browser — no upload.'},
 {id:'imgv',   ic:'🖼️', name:'Image Converter', cat:'Images', desc:'Convert images between PNG, JPEG and WebP.'},
 {id:'typing', ic:'⌨️', name:'Typing Speed Test', cat:'Games', desc:'Measure your WPM with a 60-second test.'},
 {id:'memory', ic:'🧠', name:'Memory Game', cat:'Games', desc:'Flip cards and match the pairs.'},
];
const CATS = ['All','Design','Dev','Encoding','Converters','Text','Utility','Security','Images','Games'];
const $ = s => document.querySelector(s);
const grid = $('#toolGrid'), chips = $('#catChips');
let activeCat = 'All', query = '';
let favs = [];
try{ favs = JSON.parse(localStorage.getItem('abix_favs')||'[]'); }catch(e){ favs = []; }

CATS.forEach(c=>{
  const b=document.createElement('button'); b.className='chip'+(c==='All'?' on':''); b.textContent=c;
  b.onclick=()=>{ activeCat=c; document.querySelectorAll('.chip').forEach(x=>x.classList.toggle('on',x.textContent===c)); render(); };
  chips.appendChild(b);
});
$('#toolSearch').addEventListener('input', e=>{ query=e.target.value.toLowerCase(); render(); });

function isFav(id){ return favs.includes(id); }
function toggleFav(id, ev){
  ev.stopPropagation();
  favs = isFav(id) ? favs.filter(f=>f!==id) : [...favs, id];
  try{ localStorage.setItem('abix_favs', JSON.stringify(favs)); }catch(e){}
  render();
}
function render(){
  grid.innerHTML='';
  const list = TOOLS.filter(t => (activeCat==='All'||t.cat===activeCat) &&
    (t.name.toLowerCase().includes(query)||t.desc.toLowerCase().includes(query)));
  list.forEach(t=>{
    const d=document.createElement('div'); d.className='card tcard';
    d.innerHTML = `<button class="star ${isFav(t.id)?'on':''}" title="Pin to favorites">★</button>
      <span class="cat">${t.cat}</span><div class="ic">${t.ic}</div><h3>${t.name}</h3><p>${t.desc}</p>`;
    d.querySelector('.star').onclick = e=>toggleFav(t.id, e);
    d.onclick = ()=>openTool(t.id);
    grid.appendChild(d);
  });
  $('#toolCount').textContent = list.length + ' of ' + TOOLS.length + ' tools';
  const fw = $('#favWrap');
  if(favs.length){
    fw.style.display='block';
    $('#favGrid').innerHTML='';
    favs.forEach(id=>{ const t=TOOLS.find(x=>x.id===id); if(!t) return;
      const b=document.createElement('button'); b.className='favbtn'; b.textContent=t.ic+' '+t.name;
      b.onclick=()=>openTool(id); $('#favGrid').appendChild(b); });
  } else fw.style.display='none';
}
render();

/* colour system strip */
(function(){
  const scale=[['50','var(--p50)','#0B65D6'],['100','var(--p100)','#0B65D6'],['200','var(--p200)','#0A4FA8'],['300','var(--p300)','#0D305E'],['400','var(--p400)','#fff'],['500','var(--p500)','#fff'],['600','var(--p600)','#fff'],['700','var(--p700)','#fff'],['800','var(--p800)','#fff'],['900','var(--p900)','#fff']];
  $('#scaleStrip').innerHTML = scale.map(s=>`<div style="background:${s[1]};color:${s[2]}">${s[0]}</div>`).join('');
})();

/* ================= Modal ================= */
const modal=$('#modal');
function openTool(id){
  const t=TOOLS.find(x=>x.id===id); if(!t) return;
  $('#toolTitle').textContent=t.ic+' '+t.name;
  $('#toolSub').textContent=t.desc;
  const body=$('#toolBody'); body.innerHTML='';
  BUILDERS[id](body);
  modal.classList.add('open');
}
function closeTool(){ modal.classList.remove('open'); if(window.__timer){clearInterval(window.__timer); window.__timer=null;} }
$('#modalX').onclick=closeTool;
modal.addEventListener('click',e=>{ if(e.target===modal) closeTool(); });

/* helpers */
function F(label, inner){ return `<div class="f"><label>${label}</label>${inner}</div>`; }
function TA(id, ph){ return `<textarea id="${id}" placeholder="${ph||''}"></textarea>`; }
function IN(id, ph, type){ return `<input id="${id}" type="${type||'text'}" placeholder="${ph||''}">`; }
function OUT(id){ return `<div class="out" id="${id}">—</div>`; }
function BTN(txt, cls){ return `<button class="btn ${cls||'btn-p'}" style="margin:4px 6px 4px 0">${txt}</button>`; }
function copyTxt(s){ if(navigator.clipboard) navigator.clipboard.writeText(s); }
function hexToRgb(h){ h=h.replace('#',''); if(h.length===3) h=h.split('').map(c=>c+c).join(''); const n=parseInt(h,16); return [n>>16&255, n>>8&255, n&255]; }
function rgbToHex(r,g,b){ return '#'+[r,g,b].map(v=>Math.round(Math.max(0,Math.min(255,v))).toString(16).padStart(2,'0')).join('').toUpperCase(); }
function rgbToHsl(r,g,b){ r/=255;g/=255;b/=255; const mx=Math.max(r,g,b),mn=Math.min(r,g,b); let h=0,s=0,l=(mx+mn)/2;
  if(mx!==mn){ const d=mx-mn; s=l>0.5? d/(2-mx-mn): d/(mx+mn);
    if(mx===r) h=(g-b)/d+(g<b?6:0); else if(mx===g) h=(b-r)/d+2; else h=(r-g)/d+4; h*=60; }
  return [Math.round(h), Math.round(s*100), Math.round(l*100)]; }
function hslToRgb(h,s,l){ s/=100; l/=100; const k=n=>(n+h/30)%12, a=s*Math.min(l,1-l),
  f=n=>l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1))); return [Math.round(f(0)*255),Math.round(f(8)*255),Math.round(f(4)*255)]; }
function lum(r,g,b){ const f=c=>{ c/=255; return c<=0.03928? c/12.92 : Math.pow((c+0.055)/1.055,2.4); }; return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b); }

/* ================= Tool builders ================= */
const BUILDERS = {

scale(el){
  el.innerHTML = F('Base colour (this becomes step 500)', `<div class="row"><input type="color" id="sc" value="#3B8EF5"><input id="sh" value="#3B8EF5"></div>`)
    + `<div class="swatches" id="sout"></div><p style="font-size:13px;color:var(--n500);margin-top:10px">Click any swatch to copy its HEX.</p>`;
  const draw=()=>{
    const hex=$('#sh').value.trim(); if(!/^#?[0-9a-fA-F]{6}$/.test(hex)) return;
    const [r,g,b]=hexToRgb(hex.startsWith('#')?hex:'#'+hex), hsl=rgbToHsl(r,g,b);
    const steps=[[50,96],[100,90],[200,80],[300,68],[400,57],[500,hsl[2]],[600,Math.max(hsl[2]-10,8)],[700,Math.max(hsl[2]-20,6)],[800,Math.max(hsl[2]-29,5)],[900,Math.max(hsl[2]-37,4)]];
    $('#sout').innerHTML = steps.map(([n,l])=>{
      const c = n===500? rgbToHex(r,g,b) : rgbToHex(...hslToRgb(hsl[0], hsl[1], l));
      const dark = l>62; return `<div class="sw" data-hex="${c}" style="background:${c};color:${dark?'#17191D':'#fff'}">${n}<br>${c}</div>`;
    }).join('');
    el.querySelectorAll('.sw').forEach(s=>s.onclick=()=>{ copyTxt(s.dataset.hex); s.style.outline='3px solid var(--p600)'; setTimeout(()=>s.style.outline='',500); });
  };
  $('#sc').addEventListener('input', e=>{ $('#sh').value=e.target.value.toUpperCase(); draw(); });
  $('#sh').addEventListener('input', draw); draw();
},

picker(el){
  el.innerHTML = F('Pick a colour', `<input type="color" id="pc" value="#0B65D6">`) + OUT('pout');
  const draw=()=>{ const [r,g,b]=hexToRgb($('#pc').value); const [h,s,l]=rgbToHsl(r,g,b);
    $('#pout').textContent = `HEX  ${rgbToHex(r,g,b)}\nRGB  rgb(${r}, ${g}, ${b})\nHSL  hsl(${h}, ${s}%, ${l}%)`; };
  $('#pc').addEventListener('input', draw); draw();
},

gradient(el){
  el.innerHTML = `<div class="row">${F('Colour 1','<input type="color" id="g1" value="#3B8EF5">')}${F('Colour 2','<input type="color" id="g2" value="#0D305E">')}</div>`
    + F('Direction', `<select id="gd"><option>to right</option><option>to bottom</option><option>to bottom right</option><option>135deg</option></select>`)
    + `<div id="gprev" style="height:130px;border-radius:12px;border:1px solid var(--n200)"></div><div style="height:10px"></div>` + OUT('gout') + BTN('Copy CSS');
  const draw=()=>{ const css=`linear-gradient(${$('#gd').value}, ${$('#g1').value.toUpperCase()}, ${$('#g2').value.toUpperCase()})`;
    $('#gprev').style.background=css; $('#gout').textContent='background: '+css+';'; };
  ['g1','g2','gd'].forEach(i=>$('#'+i).addEventListener('input',draw)); draw();
  el.querySelector('.btn').onclick=()=>copyTxt($('#gout').textContent);
},

shadow(el){
  el.innerHTML = ['X offset|sx|-60|60|10','Y offset|sy|-60|60|18','Blur|sb|0|120|32','Spread|ss|-40|40|0'].map(s=>{const[a,id,mn,mx,v]=s.split('|');
      return F(`${a}: <span id="${id}v">${v}</span>px`, `<input type="range" id="${id}" min="${mn}" max="${mx}" value="${v}">`);}).join('')
    + `<div id="sprev" style="height:120px;background:#fff;border:1px solid var(--n200);border-radius:12px;margin:14px 30px"></div>` + OUT('sout2') + BTN('Copy CSS');
  const draw=()=>{ const v=id=>$('#'+id).value; ['sx','sy','sb','ss'].forEach(i=>$('#'+i+'v').textContent=v(i));
    const css=`${v('sx')}px ${v('sy')}px ${v('sb')}px ${v('ss')}px rgba(23,25,29,0.25)`;
    $('#sprev').style.boxShadow=css; $('#sout2').textContent='box-shadow: '+css+';'; };
  ['sx','sy','sb','ss'].forEach(i=>$('#'+i).addEventListener('input',draw)); draw();
  el.querySelector('.btn').onclick=()=>copyTxt($('#sout2').textContent);
},

contrast(el){
  el.innerHTML = `<div class="row">${F('Text colour','<input type="color" id="ct" value="#FFFFFF">')}${F('Background','<input type="color" id="cb" value="#0B65D6">')}</div>`
    + `<div id="cprev" style="padding:18px;border-radius:12px;font-weight:700;margin-bottom:12px">Sample text — The quick brown fox</div>` + OUT('cout');
  const draw=()=>{ const t=hexToRgb($('#ct').value), b=hexToRgb($('#cb').value);
    const L1=lum(...t), L2=lum(...b), ratio=(Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05);
    $('#cprev').style.color=$('#ct').value; $('#cprev').style.background=$('#cb').value;
    $('#cout').textContent=`Contrast ratio: ${ratio.toFixed(2)} : 1\nNormal text AA (≥4.5): ${ratio>=4.5?'PASS ✅':'FAIL ❌'}   AAA (≥7): ${ratio>=7?'PASS ✅':'FAIL ❌'}\nLarge text AA (≥3): ${ratio>=3?'PASS ✅':'FAIL ❌'}   AAA (≥4.5): ${ratio>=4.5?'PASS ✅':'FAIL ❌'}`; };
  ['ct','cb'].forEach(i=>$('#'+i).addEventListener('input',draw)); draw();
},

qr(el){
  el.innerHTML = F('Text or URL', IN('qt','https://…')) + BTN('Generate QR') + `<div style="text-align:center;margin-top:14px"><img id="qimg" alt="" style="max-width:230px"></div><div id="qdl"></div>`;
  el.querySelector('.btn').onclick=()=>{ const v=$('#qt').value.trim(); if(!v) return;
    const src='https://api.qrserver.com/v1/create-qr-code/?size=460x460&data='+encodeURIComponent(v);
    $('#qimg').src=src; $('#qdl').innerHTML=`<a class="btn btn-p" href="${src}" download="qr.png" target="_blank" rel="noopener">Download QR</a>`; };
},

passgen(el){
  el.innerHTML = `<div class="row">${F('Length','<input id="pl" type="number" value="16" min="4" max="64">')}${F('How many','<input id="pn" type="number" value="3" min="1" max="20">')}</div>`
    + `<label style="font-size:14px"><input type="checkbox" id="ps" checked> Symbols &nbsp;</label><label style="font-size:14px"><input type="checkbox" id="pd" checked> Digits</label><br><br>`
    + BTN('Generate') + OUT('pout2');
  el.querySelector('.btn').onclick=()=>{ let cs='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if($('#pd').checked) cs+='0123456789'; if($('#ps').checked) cs+='!@#$%^&*()-_=+[]{}<>?';
    const len=+$('#pl').value, n=+$('#pn').value, out=[];
    const buf=new Uint32Array(len);
    for(let i=0;i<n;i++){ crypto.getRandomValues(buf); out.push([...buf].map(x=>cs[x%cs.length]).join('')); }
    $('#pout2').textContent=out.join('\n'); };
},

async hash(el){
  el.innerHTML = F('Text', TA('ht','')) + `<div class="row">${BTN('SHA-256')}${BTN('SHA-512','btn-ghost')}${BTN('SHA-1','btn-ghost')}</div>` + OUT('hout');
  const go=async alg=>{ const buf=await crypto.subtle.digest(alg, new TextEncoder().encode($('#ht').value));
    $('#hout').textContent=[...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join(''); };
  const bs=el.querySelectorAll('.btn'); bs[0].onclick=()=>go('SHA-256'); bs[1].onclick=()=>go('SHA-512'); bs[2].onclick=()=>go('SHA-1');
},

uuid(el){
  el.innerHTML = BTN('Generate 1') + BTN('Generate 10','btn-ghost') + OUT('uout');
  const one=()=>crypto.randomUUID();
  const bs=el.querySelectorAll('.btn');
  bs[0].onclick=()=>{ $('#uout').textContent=one(); };
  bs[1].onclick=()=>{ $('#uout').textContent=Array.from({length:10},one).join('\n'); };
},

json(el){
  el.innerHTML = F('JSON', TA('jt','{"name":"ABIX","tools":27}')) + BTN('Beautify') + BTN('Minify','btn-ghost') + OUT('jout');
  const bs=el.querySelectorAll('.btn');
  bs[0].onclick=()=>{ try{ $('#jout').textContent=JSON.stringify(JSON.parse($('#jt').value),null,2); }catch(e){ $('#jout').textContent='❌ Invalid JSON: '+e.message; } };
  bs[1].onclick=()=>{ try{ $('#jout').textContent=JSON.stringify(JSON.parse($('#jt').value)); }catch(e){ $('#jout').textContent='❌ Invalid JSON: '+e.message; } };
},

regex(el){
  el.innerHTML = `<div class="row">${F('Pattern', IN('rp','\\d+'))}${F('Flags', IN('rf','g'))}</div>` + F('Text', TA('rt','Order 66 costs 1200 and 45 more')) + OUT('rout');
  const draw=()=>{ try{ const re=new RegExp($('#rp').value, $('#rf').value||'g');
      const txt=$('#rt').value; const m=[...txt.matchAll(re)];
      $('#rout').innerHTML = m.length? ('Matches ('+m.length+'): '+m.map(x=>'<mark>'+x[0].replace(/</g,'&lt;')+'</mark>').join(', ')) : 'No matches'; }
    catch(e){ $('#rout').textContent='❌ '+e.message; } };
  ['rp','rf','rt'].forEach(i=>$('#'+i).addEventListener('input',draw)); draw();
},

diff(el){
  el.innerHTML = `<div class="row">${F('Original', TA('d1','line one\nline two'))}${F('Changed', TA('d2','line one\nline TWO changed\nline three'))}</div>` + BTN('Compare') + OUT('dout');
  el.querySelector('.btn').onclick=()=>{ const a=$('#d1').value.split('\n'), b=$('#d2').value.split('\n');
    const setA=new Set(a), setB=new Set(b); let out='';
    b.forEach(l=>{ if(!setA.has(l)) out+='+ '+l+'\n'; });
    a.forEach(l=>{ if(!setB.has(l)) out+='- '+l+'\n'; });
    $('#dout').textContent = out||'No differences — texts are identical line by line.'; };
},

base64(el){
  el.innerHTML = F('Text', TA('bt','')) + BTN('Encode') + BTN('Decode','btn-ghost') + OUT('bout');
  const bs=el.querySelectorAll('.btn');
  bs[0].onclick=()=>{ try{ $('#bout').textContent=btoa(String.fromCharCode(...new TextEncoder().encode($('#bt').value))); }catch(e){ $('#bout').textContent='❌ '+e.message; } };
  bs[1].onclick=()=>{ try{ $('#bout').textContent=new TextDecoder().decode(Uint8Array.from(atob($('#bt').value.trim()), c=>c.charCodeAt(0))); }catch(e){ $('#bout').textContent='❌ Invalid Base64'; } };
},

urlenc(el){
  el.innerHTML = F('Text / URL', TA('ut','')) + BTN('Encode') + BTN('Decode','btn-ghost') + OUT('uout2');
  const bs=el.querySelectorAll('.btn');
  bs[0].onclick=()=>{ $('#uout2').textContent=encodeURIComponent($('#ut').value); };
  bs[1].onclick=()=>{ try{ $('#uout2').textContent=decodeURIComponent($('#ut').value); }catch(e){ $('#uout2').textContent='❌ Invalid encoded text'; } };
},

morse(el){
  const MAP={A:'.-',B:'-...',C:'-.-.',D:'-..',E:'.',F:'..-.',G:'--.',H:'....',I:'..',J:'.---',K:'-.-',L:'.-..',M:'--',N:'-.',O:'---',P:'.--.',Q:'--.-',R:'.-.',S:'...',T:'-',U:'..-',V:'...-',W:'.--',X:'-..-',Y:'-.--',Z:'--..','1':'.----','2':'..---','3':'...--','4':'....-','5':'.....','6':'-....','7':'--...','8':'---..','9':'----.','0':'-----',' ':'/'};
  const REV=Object.fromEntries(Object.entries(MAP).map(([k,v])=>[v,k]));
  el.innerHTML = F('Text or Morse (use spaces between letters)', TA('mt','SOS')) + BTN('To Morse') + BTN('To Text','btn-ghost') + BTN('▶ Play','btn-ghost') + OUT('mout');
  const bs=el.querySelectorAll('.btn');
  bs[0].onclick=()=>{ $('#mout').textContent=$('#mt').value.toUpperCase().split('').map(c=>MAP[c]||'').join(' ').trim(); };
  bs[1].onclick=()=>{ $('#mout').textContent=$('#mt').value.trim().split(/\s+/).map(c=>REV[c]||'').join(''); };
  bs[2].onclick=()=>{ const code=$('#mout').textContent; if(!code||code==='—') return;
    const ctx=new (window.AudioContext||window.webkitAudioContext)(); let t=ctx.currentTime;
    const beep=(d)=>{ const o=ctx.createOscillator(), g=ctx.createGain(); o.frequency.value=620; o.connect(g); g.connect(ctx.destination);
      o.start(t); o.stop(t+d); t+=d+0.09; };
    for(const ch of code){ if(ch==='.') beep(0.09); else if(ch==='-') beep(0.27); else t+=0.14; } };
},

base(el){
  el.innerHTML = F('Number', IN('bn','255')) + `<div class="row">${F('From base',`<select id="bf"><option>2</option><option>8</option><option selected>10</option><option>16</option></select>`)}${F('To base',`<select id="bto"><option>2</option><option>8</option><option>10</option><option selected>16</option></select>`)}</div>` + OUT('bnout');
  const draw=()=>{ const v=parseInt($('#bn').value, +$('#bf').value);
    $('#bnout').textContent = isNaN(v)? '❌ Not a valid number in that base' : v.toString(+$('#bto').value).toUpperCase(); };
  ['bn','bf','bto'].forEach(i=>$('#'+i).addEventListener('input',draw)); draw();
},

unit(el){
  const T={Length:{m:1,km:1000,cm:0.01,mm:0.001,mi:1609.344,yd:0.9144,ft:0.3048,in:0.0254},
           Weight:{kg:1,g:0.001,lb:0.453592,t:1000,oz:0.0283495},
           Speed:{'m/s':1,'km/h':0.277778,mph:0.44704,kn:0.514444}};
  el.innerHTML = F('Category', `<select id="uc">${Object.keys(T).concat('Temperature').map(c=>`<option>${c}</option>`).join('')}</select>`)
    + `<div class="row">${F('Value', IN('uv','1','number'))}${F('From', '<select id="uf"></select>')}${F('To', '<select id="uto"></select>')}</div>` + OUT('unout');
  const fill=()=>{ const c=$('#uc').value; const units = c==='Temperature'? ['°C','°F','K'] : Object.keys(T[c]);
    $('#uf').innerHTML=units.map(u=>`<option>${u}</option>`).join(''); $('#uto').innerHTML=units.map(u=>`<option>${u}</option>`).join('');
    if(units[1]) $('#uto').selectedIndex=1; draw(); };
  const draw=()=>{ const c=$('#uc').value, v=parseFloat($('#uv').value); if(isNaN(v)){ $('#unout').textContent='—'; return; }
    const f=$('#uf').value, t=$('#uto').value; let r;
    if(c==='Temperature'){ let cel = f==='°C'? v : f==='°F'? (v-32)*5/9 : v-273.15; r = t==='°C'? cel : t==='°F'? cel*9/5+32 : cel+273.15; }
    else r = v*T[c][f]/T[c][t];
    $('#unout').textContent = `${v} ${f} = ${(+r.toFixed(6))} ${t}`; };
  $('#uc').addEventListener('change', fill); ['uv','uf','uto'].forEach(i=>$('#'+i).addEventListener('input',draw)); fill();
},

ts(el){
  el.innerHTML = F('Unix timestamp (seconds or ms)', IN('tsv','')) + BTN('To date') + BTN('Now','btn-ghost') + `<div style="height:8px"></div>` + F('Or pick a date', '<input id="tsd" type="datetime-local">') + OUT('tsout');
  const bs=el.querySelectorAll('.btn');
  const show=d=>{ $('#tsout').textContent = isNaN(d)? '❌ Invalid value' : `Local: ${d.toString()}\nUTC: ${d.toUTCString()}\nUnix (s): ${Math.floor(d.getTime()/1000)}`; };
  bs[0].onclick=()=>{ let v=+$('#tsv').value; if($('#tsv').value.length<=10) v*=1000; show(new Date(v)); };
  bs[1].onclick=()=>{ const d=new Date(); $('#tsv').value=Math.floor(d.getTime()/1000); show(d); };
  $('#tsd').addEventListener('change', ()=>show(new Date($('#tsd').value)));
},

word(el){
  el.innerHTML = F('Your text', TA('wt','')) + OUT('wout');
  const draw=()=>{ const v=$('#wt').value; const words=(v.match(/\S+/g)||[]).length;
    const sents=(v.match(/[.!?]+/g)||[]).length;
    $('#wout').textContent=`Words: ${words}   Characters: ${v.length}   Without spaces: ${v.replace(/\s/g,'').length}\nSentences: ${sents}   Reading time: ${Math.max(1,Math.round(words/200))} min`; };
  $('#wt').addEventListener('input',draw); draw();
},

case(el){
  el.innerHTML = F('Text', TA('ct2','hello world from abix lab')) + `<div id="cbts"></div>` + OUT('cout2');
  const modes={'UPPER CASE':s=>s.toUpperCase(),'lower case':s=>s.toLowerCase(),'Title Case':s=>s.toLowerCase().replace(/\b\w/g,c=>c.toUpperCase()),
    'camelCase':s=>s.toLowerCase().replace(/[^a-zA-Z0-9 ]/g,'').split(' ').map((w,i)=>i? w.charAt(0).toUpperCase()+w.slice(1):w).join(''),
    'snake_case':s=>s.trim().toLowerCase().replace(/\s+/g,'_'),'kebab-case':s=>s.trim().toLowerCase().replace(/\s+/g,'-')};
  $('#cbts').innerHTML=Object.keys(modes).map(m=>BTN(m,'btn-ghost')).join('');
  [...$('#cbts').querySelectorAll('.btn')].forEach((b,i)=>b.onclick=()=>{ $('#cout2').textContent=modes[Object.keys(modes)[i]]($('#ct2').value); });
},

lorem(el){
  el.innerHTML = F('Paragraphs', '<input id="ln" type="number" value="2" min="1" max="10">') + BTN('Generate') + OUT('lout');
  const P='Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.';
  el.querySelector('.btn').onclick=()=>{ $('#lout').textContent=Array.from({length:+$('#ln').value},()=>P).join('\n\n'); };
},

pal(el){
  el.innerHTML = F('Word or sentence', IN('pt','Racecar')) + OUT('pout3');
  const draw=()=>{ const raw=$('#pt').value, clean=raw.toLowerCase().replace(/[^a-z0-9]/g,'');
    $('#pout3').textContent = !clean? '—' : (clean===clean.split('').reverse().join('') ? '✅ Yes — it is a palindrome.' : '❌ No — not a palindrome.'); };
  $('#pt').addEventListener('input',draw); draw();
},

age(el){
  el.innerHTML = F('Date of birth', '<input id="ad" type="date">') + OUT('aout');
  $('#ad').addEventListener('change', ()=>{ const d=new Date($('#ad').value); if(isNaN(d)){ $('#aout').textContent='—'; return; }
    const now=new Date(); let y=now.getFullYear()-d.getFullYear(), m=now.getMonth()-d.getMonth(), dd=now.getDate()-d.getDate();
    if(dd<0){ m--; dd+=new Date(now.getFullYear(), now.getMonth(), 0).getDate(); } if(m<0){ y--; m+=12; }
    const days=Math.floor((now-d)/864e5);
    $('#aout').textContent=`${y} years, ${m} months, ${dd} days\nTotal days: ${days.toLocaleString()}   Total hours: ${(days*24).toLocaleString()}`; });
},

imgc(el){
  el.innerHTML = F('Choose an image', '<input id="if1" type="file" accept="image/*">')
    + F('Quality: <span id="qv">70</span>%', '<input id="iq" type="range" min="10" max="95" value="70">')
    + `<div id="iinfo" class="out">No image yet — everything happens in your browser, nothing is uploaded.</div><div id="idl" style="margin-top:12px"></div>`;
  let url='';
  $('#iq').addEventListener('input', ()=>{ $('#qv').textContent=$('#iq').value; run(); });
  $('#if1').addEventListener('change', ()=>{ const f=$('#if1').files[0]; if(!f) return;
    if(url) URL.revokeObjectURL(url); url=URL.createObjectURL(f); el._file=f; run(); });
  function run(){ const f=el._file; if(!f) return; const img=new Image();
    img.onload=()=>{ const c=document.createElement('canvas'); c.width=img.naturalWidth; c.height=img.naturalHeight;
      c.getContext('2d').drawImage(img,0,0);
      c.toBlob(b=>{ $('#iinfo').textContent=`Original: ${(f.size/1024).toFixed(1)} KB → Compressed: ${(b.size/1024).toFixed(1)} KB  (saved ${(100-b.size/f.size*100).toFixed(0)}%)`;
        $('#idl').innerHTML=''; const a=document.createElement('a'); a.className='btn btn-p'; a.textContent='Download compressed';
        a.href=URL.createObjectURL(b); a.download='compressed.jpg'; $('#idl').appendChild(a); }, 'image/jpeg', +$('#iq').value/100); };
    img.src=url; }
},

imgv(el){
  el.innerHTML = F('Choose an image', '<input id="if2" type="file" accept="image/*">')
    + F('Convert to', '<select id="ifmt"><option value="image/png">PNG</option><option value="image/jpeg">JPEG</option><option value="image/webp">WebP</option></select>')
    + `<div id="idl2" style="margin-top:12px"></div>`;
  const run=()=>{ const f=$('#if2').files[0]; if(!f) return; const img=new Image();
    img.onload=()=>{ const c=document.createElement('canvas'); c.width=img.naturalWidth; c.height=img.naturalHeight;
      c.getContext('2d').drawImage(img,0,0); const ext=$('#ifmt').value.split('/')[1];
      $('#idl2').innerHTML=''; const a=document.createElement('a'); a.className='btn btn-p'; a.textContent='Download .'+ext;
      a.href=c.toDataURL($('#ifmt').value, 0.92); a.download='converted.'+ext; $('#idl2').appendChild(a); };
    img.src=URL.createObjectURL(f); };
  $('#if2').addEventListener('change', run); $('#ifmt').addEventListener('change', run);
},

typing(el){
  const TEXT='The quick brown fox jumps over the lazy dog. Serious software is built from idea to production, one careful line at a time.';
  el.innerHTML = `<p class="mono" style="background:var(--n50);border:1px solid var(--n200);border-radius:10px;padding:12px">${TEXT}</p><div style="height:10px"></div>`
    + F('Type here — timer starts on your first keystroke', TA('tt','')) + OUT('tout');
  let start=null;
  $('#tt').addEventListener('input', ()=>{ const v=$('#tt').value;
    if(!start && v.length) { start=Date.now();
      window.__timer=setInterval(()=>{ const s=(Date.now()-start)/1000; if(s>=60){ clearInterval(window.__timer); window.__timer=null;
        $('#tout').textContent=final(v,s); } }, 250); }
    if(start){ const s=Math.max((Date.now()-start)/1000,1); $('#tout').textContent=final(v,s)+'   ('+Math.round(s)+'s elapsed)'; } });
  function final(v,s){ let ok=0; for(let i=0;i<Math.min(v.length,TEXT.length);i++) if(v[i]===TEXT[i]) ok++;
    const wpm=Math.round((v.length/5)/(s/60)); const acc=v.length? Math.round(ok/v.length*100):100;
    return `WPM: ${wpm}   Accuracy: ${acc}%   Characters: ${v.length}`; }
},

memory(el){
  const icons=['🚀','🎧','📱','⌚','🎮','🚁','💡','🎨'];
  el.innerHTML = `<div class="row" style="align-items:end"><div class="out" id="mstat">Moves: 0 · Pairs: 0 / 8</div>${BTN('Restart')}</div><div style="height:12px"></div><div class="mem" id="mgrid"></div>`;
  let deck, first=null, lock=false, moves=0, pairs=0;
  function start(){ deck=[...icons,...icons].sort(()=>Math.random()-0.5); first=null; lock=false; moves=0; pairs=0;
    $('#mstat').textContent='Moves: 0 · Pairs: 0 / 8';
    $('#mgrid').innerHTML=deck.map(()=>'<div>❓</div>').join('');
    [...$('#mgrid').children].forEach((c,i)=>c.onclick=()=>flip(c,i)); }
  function flip(c,i){ if(lock||c.classList.contains('done')||c.textContent!=='❓') return;
    c.textContent=deck[i];
    if(!first){ first={c,i}; return; }
    moves++;
    if(deck[first.i]===deck[i]){ c.classList.add('done'); first.c.classList.add('done'); pairs++; first=null; }
    else { lock=true; const f=first; first=null; setTimeout(()=>{ c.textContent='❓'; f.c.textContent='❓'; lock=false; }, 650); }
    $('#mstat').textContent=`Moves: ${moves} · Pairs: ${pairs} / 8` + (pairs===8? '  🎉 You win!' : ''); }
  el.querySelector('.btn').onclick=start; start();
}
};

/* --- expansion pack (41 more tools) --- */
/* ===== Expansion pack: tools in the style of FAK LAB's kit, ABIX's own UI ===== */
TOOLS.push(
 {id:'tts',   ic:'🔊', name:'Text to Speech', cat:'Text', desc:'Convert written text to spoken audio with your browser voice.'},
 {id:'stt',   ic:'🎙️', name:'Speech to Text', cat:'Text', desc:'Transcribe your voice in real time (Chrome).'},
 {id:'ocr',   ic:'🔍', name:'OCR Studio', cat:'Images', desc:'Extract printed text from any image, on-device.'},
 {id:'stego', ic:'🕵️', name:'Steganography', cat:'Images', desc:'Hide or reveal a secret text message inside an image.'},
 {id:'resize',ic:'📐', name:'Image Resizer', cat:'Images', desc:'Resize images to exact pixel dimensions in your browser.'},
 {id:'img64', ic:'🧬', name:'Image to Base64', cat:'Images', desc:'Convert any image into a Base64 data URI.'},
 {id:'palette',ic:'🎨', name:'Colour Extractor', cat:'Design', desc:'Pull the dominant colour palette from any image.'},
 {id:'exif',  ic:'📷', name:'EXIF Viewer', cat:'Images', desc:'Reveal camera model, settings and GPS data from photos.'},
 {id:'qrscan',ic:'📸', name:'QR Scanner', cat:'Utility', desc:'Scan a QR code from an uploaded image.'},
 {id:'passstr',ic:'🛡️', name:'Password Strength', cat:'Security', desc:'How long would it take to crack this password?'},
 {id:'jwtdec',ic:'🎫', name:'JWT Decoder', cat:'Security', desc:'Decode and inspect JWT headers and payloads.'},
 {id:'jwtgen',ic:'✍️', name:'JWT Generator', cat:'Security', desc:'Build and sign a HS256 JWT with your own secret.'},
 {id:'htmlenc',ic:'🛟', name:'HTML Encoder', cat:'Encoding', desc:'Escape HTML entities to embed text safely in pages.'},
 {id:'caesar',ic:'🏛️', name:'Caesar Cipher', cat:'Encoding', desc:'Encrypt or decrypt text with the classic Caesar shift.'},
 {id:'binconv',ic:'0️⃣', name:'Binary Converter', cat:'Encoding', desc:'Convert text to binary code and back.'},
 {id:'calc',  ic:'🧮', name:'Scientific Calculator', cat:'Utility', desc:'Calculator with history-friendly display and functions.'},
 {id:'currency',ic:'💱', name:'Currency Converter', cat:'Converters', desc:'Live exchange rates for 30+ world currencies.'},
 {id:'weather',ic:'🌦️', name:'Weather Forecast', cat:'Utility', desc:'7-day forecast for any city, live data.'},
 {id:'prayer',ic:'🕌', name:'Prayer Times', cat:'Utility', desc:'Daily Salah times for your city.'},
 {id:'translate',ic:'🌐', name:'Language Translator', cat:'Text', desc:'Translate between Urdu, English and more languages.'},
 {id:'dict',  ic:'📖', name:'English Dictionary', cat:'Text', desc:'Definitions, phonetics and synonyms for any word.'},
 {id:'ip',    ic:'🌍', name:'IP Lookup', cat:'Dev', desc:'Geolocate any IP — country, city, ISP and ASN. Or check your own.'},
 {id:'quote', ic:'💬', name:'Quote of the Day', cat:'Text', desc:'A fresh inspirational quote every day.'},
 {id:'barcode',ic:'🏷️', name:'Barcode Generator', cat:'Utility', desc:'Generate CODE128 barcodes for print or digital use.'},
 {id:'ghstats',ic:'🐙', name:'GitHub Stats', cat:'Dev', desc:'Any GitHub profile — repos, stars, followers, top languages.'},
 {id:'csvjson',ic:'🔀', name:'CSV to JSON', cat:'Dev', desc:'Parse CSV text into structured JSON with one click.'},
 {id:'mdprev',ic:'🖋️', name:'Markdown Previewer', cat:'Text', desc:'Write Markdown, see live HTML preview and copy the HTML.'},
 {id:'glass', ic:'🪟', name:'Glassmorphism Generator', cat:'Design', desc:'css.glass style generator — tint, blur and opacity sliders with ready-to-paste CSS.'},
 {id:'cron',  ic:'⏰', name:'Cron Parser', cat:'Dev', desc:'Cron expressions in plain English + next run times.'},
 {id:'jsbeaut',ic:'✨', name:'JS Beautifier', cat:'Dev', desc:'Format and indent minified JavaScript for reading.'},
 {id:'cssmin',ic:'✂️', name:'CSS Minifier', cat:'Dev', desc:'Strip whitespace and comments from CSS for production.'},
 {id:'pdfmerge',ic:'📚', name:'PDF Merge & Split', cat:'Utility', desc:'Merge PDFs into one, or split one into single pages.'},
 {id:'imgpdf',ic:'🗂️', name:'Image to PDF', cat:'Images', desc:'Combine images into one downloadable PDF.'},
 {id:'pdfmeta',ic:'🔎', name:'PDF Metadata', cat:'Utility', desc:'Extract author, creator, dates and page count from a PDF.'},
 {id:'filemeta',ic:'📄', name:'File Metadata', cat:'Utility', desc:'Size, type, timestamps and SHA-256 of any file.'},
 {id:'dns',   ic:'🧭', name:'DNS Lookup', cat:'Dev', desc:'Query A, MX, TXT and NS records for any domain in real time.'},
 {id:'subdom',ic:'🗺️', name:'Subdomain Finder', cat:'Dev', desc:'Discover subdomains via public certificate-transparency logs.'},
 {id:'nye',   ic:'🎆', name:'New Year Countdown', cat:'Utility', desc:'Live countdown to the New Year.'},
 {id:'vid64', ic:'🎞️', name:'Video to Base64', cat:'Images', desc:'Encode a small video file to a Base64 string.'},
 {id:'audiorec',ic:'⏺️', name:'Audio Recorder', cat:'Utility', desc:'Record from your microphone and download the audio.'},
 {id:'vid2aud',ic:'🎵', name:'Video to Audio', cat:'Utility', desc:'Extract the audio track from a video file.'}
);
Object.assign(BUILDERS, {
glass(el){
  el.innerHTML = `<div style="border-radius:16px;padding:22px;background:linear-gradient(120deg,#F59E0B,#EC4899 45%,#3B8EF5);margin-bottom:14px">
      <div id="glprev" style="padding:20px;max-width:340px;margin:0 auto;text-align:center;color:#fff">
        <div style="font-size:30px">🪟</div><b>Glass Card</b>
        <p style="font-size:13.5px">Frosted glass over a bright gradient — exactly what the CSS below produces.</p>
      </div></div>`
    + `<div class="row">${F('Tint colour','<input type="color" id="glc" value="#FFFFFF">')}${F('Radius (px)','<input id="glr" type="number" value="16" min="0" max="60">')}</div>`
    + F('Opacity: <span id="glov">20</span>%','<input id="glo" type="range" min="0" max="100" value="20">')
    + F('Blur: <span id="glbv">8</span>px','<input id="glb" type="range" min="0" max="40" value="8">')
    + F('Saturation: <span id="glsv">150</span>%','<input id="gls" type="range" min="50" max="250" value="150">')
    + OUT('glout') + BTN('Copy CSS');
  const draw=()=>{ const rgb=hexToRgb($('#glc').value); const r=rgb[0],g=rgb[1],b=rgb[2];
    const o=+$('#glo').value/100, bl=+$('#glb').value, st=+$('#gls').value, rd=+$('#glr').value||0;
    $('#glov').textContent=$('#glo').value; $('#glbv').textContent=bl; $('#glsv').textContent=st;
    const p=$('#glprev');
    p.style.background=`rgba(${r}, ${g}, ${b}, ${o})`; p.style.borderRadius=rd+'px';
    p.style.boxShadow='0 4px 30px rgba(0, 0, 0, 0.1)';
    p.style.backdropFilter=`blur(${bl}px) saturate(${st}%)`; p.style.webkitBackdropFilter=`blur(${bl}px) saturate(${st}%)`;
    p.style.border=`1px solid rgba(${r}, ${g}, ${b}, 0.3)`;
    p.style.color=(lum(r,g,b)>0.35&&o>0.4)?'#17191D':'#fff';
    $('#glout').textContent=`background: rgba(${r}, ${g}, ${b}, ${o.toFixed(2)});\nborder-radius: ${rd}px;\nbox-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);\nbackdrop-filter: blur(${bl}px) saturate(${st}%);\n-webkit-backdrop-filter: blur(${bl}px) saturate(${st}%);\nborder: 1px solid rgba(${r}, ${g}, ${b}, 0.3);`; };
  ['glc','glr','glo','glb','gls'].forEach(i=>$('#'+i).addEventListener('input',draw)); draw();
  el.querySelector('.btn').onclick=()=>copyTxt($('#glout').textContent);
},


tts(el){
  el.innerHTML = F('Text to speak', TA('tt2','Assalam o Alaikum, welcome to ABIX LAB.'))
    + F('Voice', '<select id="tv"></select>') + BTN('▶ Speak') + BTN('Stop','btn-ghost');
  const fill=()=>{ const vs=speechSynthesis.getVoices(); $('#tv').innerHTML=vs.map((v,i)=>`<option value="${i}">${v.name} (${v.lang})</option>`).join(''); };
  speechSynthesis.onvoiceschanged=fill; fill();
  const bs=el.querySelectorAll('.btn');
  bs[0].onclick=()=>{ const u=new SpeechSynthesisUtterance($('#tt2').value); const v=speechSynthesis.getVoices()[+$('#tv').value]; if(v) u.voice=v; speechSynthesis.speak(u); };
  bs[1].onclick=()=>speechSynthesis.cancel();
},

stt(el){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  el.innerHTML = (SR? BTN('🎙️ Start listening') + BTN('Stop','btn-ghost') : '<p>⚠️ Speech recognition needs Chrome/Edge.</p>') + OUT('stout');
  if(!SR) return;
  const rec=new SR(); rec.continuous=true; rec.interimResults=true; rec.lang='en-US';
  rec.onresult=e=>{ let s=''; for(const r of e.results) s+=r[0].transcript;
    $('#stout').textContent=s; };
  const bs=el.querySelectorAll('.btn'); bs[0].onclick=()=>{ try{rec.start();}catch(e){} $('#stout').textContent='Listening… speak now.'; };
  bs[1].onclick=()=>rec.stop();
},

ocr(el){
  el.innerHTML = F('Choose an image', '<input id="ocf" type="file" accept="image/*">') + OUT('ocout')
    + '<p style="font-size:13px;color:var(--n500)">Runs on-device via Tesseract.js — English works best; nothing is uploaded.</p>';
  $('#ocf').addEventListener('change', async ()=>{ const f=$('#ocf').files[0]; if(!f) return;
    if(typeof Tesseract==='undefined'){ $('#ocout').textContent='❌ OCR library failed to load (needs internet once).'; return; }
    $('#ocout').textContent='Reading… this can take 10–30 seconds.';
    try{ const r=await Tesseract.recognize(f,'eng'); $('#ocout').textContent=r.data.text.trim()||'(no text found)'; }
    catch(e){ $('#ocout').textContent='❌ '+e.message; } });
},

stego(el){
  el.innerHTML = F('Cover image (PNG works best)', '<input id="sgf" type="file" accept="image/*">')
    + F('Secret message', TA('sgm','meet me at midnight')) + BTN('Hide & Download PNG') + BTN('Reveal from image','btn-ghost') + OUT('sgout');
  const loadImg=cb=>{ const f=$('#sgf').files[0]; if(!f){ $('#sgout').textContent='Choose an image first.'; return; }
    const img=new Image(); img.onload=()=>cb(img); img.src=URL.createObjectURL(f); };
  const bs=el.querySelectorAll('.btn');
  bs[0].onclick=()=>loadImg(img=>{ const c=document.createElement('canvas'); c.width=img.naturalWidth; c.height=img.naturalHeight;
    const ctx=c.getContext('2d'); ctx.drawImage(img,0,0); const d=ctx.getImageData(0,0,c.width,c.height); const data=d.data;
    const bytes=new TextEncoder().encode($('#sgm').value);
    const bits=[]; const len=bytes.length;
    [len>>24&255,len>>16&255,len>>8&255,len&255].forEach(b=>{ for(let i=7;i>=0;i--) bits.push(b>>i&1); });
    bytes.forEach(b=>{ for(let i=7;i>=0;i--) bits.push(b>>i&1); });
    if(bits.length>data.length/4){ $('#sgout').textContent='❌ Message too long for this image.'; return; }
    bits.forEach((bit,i)=>{ const p=i*4; data[p]=(data[p]&0xFE)|bit; });
    ctx.putImageData(d,0,0);
    const a=document.createElement('a'); a.className='btn btn-p'; a.textContent='Download image with hidden message';
    a.href=c.toDataURL('image/png'); a.download='secret.png'; $('#sgout').innerHTML='Hidden ✅ '; $('#sgout').appendChild(a); });
  bs[1].onclick=()=>loadImg(img=>{ const c=document.createElement('canvas'); c.width=img.naturalWidth; c.height=img.naturalHeight;
    const ctx=c.getContext('2d'); ctx.drawImage(img,0,0); const data=ctx.getImageData(0,0,c.width,c.height).data;
    const bitAt=i=>data[i*4]&1; let len=0; for(let i=0;i<32;i++) len=(len<<1)|bitAt(i);
    if(len<=0||len>100000){ $('#sgout').textContent='No hidden message found (or image was re-compressed).'; return; }
    const bytes=new Uint8Array(len);
    for(let j=0;j<len;j++){ let b=0; for(let k=0;k<8;k++) b=(b<<1)|bitAt(32+j*8+k); bytes[j]=b; }
    $('#sgout').textContent=new TextDecoder().decode(bytes); });
},

resize(el){
  el.innerHTML = F('Choose an image', '<input id="rzf" type="file" accept="image/*">')
    + `<div class="row">${F('Width (px)', '<input id="rzw" type="number" value="800">')}${F('Height (px)', '<input id="rzh" type="number" value="600">')}</div>`
    + '<label style="font-size:14px"><input type="checkbox" id="rzk" checked> Keep aspect ratio</label><br><br>' + BTN('Resize & Download') + OUT('rzout');
  el.querySelector('.btn').onclick=()=>{ const f=$('#rzf').files[0]; if(!f){ $('#rzout').textContent='Choose an image first.'; return; }
    const img=new Image(); img.onload=()=>{ let w=+$('#rzw').value, h=+$('#rzh').value;
      if($('#rzk').checked) h=Math.round(w*img.naturalHeight/img.naturalWidth);
      const c=document.createElement('canvas'); c.width=w; c.height=h; c.getContext('2d').drawImage(img,0,0,w,h);
      const a=document.createElement('a'); a.className='btn btn-p'; a.textContent=`Download ${w}×${h}`;
      a.href=c.toDataURL('image/png'); a.download='resized.png'; $('#rzout').innerHTML=''; $('#rzout').appendChild(a); };
    img.src=URL.createObjectURL(f); };
},

img64(el){
  el.innerHTML = F('Choose an image', '<input id="i6f" type="file" accept="image/*">') + F('Base64 data URI', TA('i6o','')) + OUT('i6s');
  $('#i6f').addEventListener('change', ()=>{ const f=$('#i6f').files[0]; if(!f) return;
    const r=new FileReader(); r.onload=()=>{ $('#i6o').value=r.result; $('#i6s').textContent=`${f.name} — ${(f.size/1024).toFixed(1)} KB → data URI ${($('#i6o').value.length/1024).toFixed(1)} KB`; };
    r.readAsDataURL(f); });
},

palette(el){
  el.innerHTML = F('Choose an image', '<input id="plf" type="file" accept="image/*">') + '<div class="swatches" id="plout"></div>'
    + '<p style="font-size:13px;color:var(--n500)">Click any colour to copy its HEX.</p>';
  $('#plf').addEventListener('change', ()=>{ const f=$('#plf').files[0]; if(!f) return;
    const img=new Image(); img.onload=()=>{ const c=document.createElement('canvas'); const S=90;
      c.width=S; c.height=Math.max(1,Math.round(S*img.naturalHeight/img.naturalWidth));
      const ctx=c.getContext('2d'); ctx.drawImage(img,0,0,c.width,c.height);
      const d=ctx.getImageData(0,0,c.width,c.height).data; const map=new Map();
      for(let i=0;i<d.length;i+=16){ const key=((d[i]>>5)<<6)|((d[i+1]>>5)<<3)|(d[i+2]>>5);
        if(!map.has(key)) map.set(key,[0,[0,0,0]]); const e=map.get(key); e[0]++; e[1][0]+=d[i]; e[1][1]+=d[i+1]; e[1][2]+=d[i+2]; }
      const top=[...map.values()].sort((a,b)=>b[0]-a[0]).slice(0,8);
      $('#plout').innerHTML=top.map(e=>{ const hex=rgbToHex(e[1][0]/e[0],e[1][1]/e[0],e[1][2]/e[0]);
        const dark=lum(...hexToRgb(hex))>0.35; return `<div class="sw" data-hex="${hex}" style="background:${hex};color:${dark?'#17191D':'#fff'}">${hex}</div>`; }).join('');
      el.querySelectorAll('.sw').forEach(s=>s.onclick=()=>copyTxt(s.dataset.hex)); };
    img.src=URL.createObjectURL(f); });
},

exif(el){
  el.innerHTML = F('Choose a JPEG photo', '<input id="exf" type="file" accept="image/jpeg,image/jpg">') + OUT('exout');
  $('#exf').addEventListener('change', ()=>{ const f=$('#exf').files[0]; if(!f) return;
    const r=new FileReader(); r.onload=()=>{ try{ $('#exout').textContent=parseExif(new DataView(r.result), f); }
      catch(e){ $('#exout').textContent='No EXIF data found in this photo (many apps strip it).'; } };
    r.readAsArrayBuffer(f); });
  function parseExif(dv, f){
    if(dv.getUint16(0)!==0xFFD8) return 'Not a JPEG file.';
    let off=2, exif=null;
    while(off<dv.byteLength-4){ const marker=dv.getUint16(off); if((marker&0xFF00)!==0xFF00) break;
      const size=dv.getUint16(off+2);
      if(marker===0xFFE1){ const s=new TextDecoder().decode(new Uint8Array(dv.buffer, off+4, 6));
        if(s.startsWith('Exif')){ exif=off+4+6; break; } }
      if(marker===0xFFDA) break; off+=2+size; }
    if(exif===null) return 'No EXIF data found in this photo.';
    const le=dv.getUint16(exif)===0x4949;
    const u16=o=>dv.getUint16(o,le), u32=o=>dv.getUint32(o,le);
    const TYPES={1:1,2:1,3:2,4:4,5:8,7:1,9:4,10:8};
    function valAt(entryOff){ const type=u16(entryOff+2), count=u32(entryOff+4), sz=(TYPES[type]||1)*count;
      let vo=exif+entryOff+8; if(sz>4) vo=exif+u32(entryOff+8);
      if(type===2) return new TextDecoder().decode(new Uint8Array(dv.buffer, vo, count)).replace(/\0+$/,'');
      if(type===3) return u16(vo); if(type===4) return u32(vo); if(type===9) return dv.getInt32(vo,le);
      if(type===5||type===10){ const get=type===5? u32 : (o=>dv.getInt32(o,le)); const n=get(vo), dnm=get(vo+4); return dnm? +(n/dnm).toFixed(4) : 0; }
      return count; }
    function readIFD(ifdOff, tags){ const out={}; const n=u16(exif+ifdOff);
      for(let i=0;i<n;i++){ const eo=ifdOff+2+i*12; const tag=u16(exif+eo); if(tags[tag]) out[tags[tag]]=valAt(exif+eo); }
      return out; }
    const ifd0=u32(exif+4);
    const main=readIFD(ifd0, {0x010F:'Make',0x0110:'Model',0x0112:'Orientation',0x0131:'Software',0x0132:'DateTime',0x8769:'_exif',0x8825:'_gps'});
    const exifSub=main._exif? readIFD(main._exif, {0x9003:'Date Taken',0x829A:'Exposure (s)',0x829D:'F-Number',0x8827:'ISO',0x920A:'Focal Length (mm)',0xA405:'Focal 35mm'}) : {};
    const gps={}; if(main._gps){ const g=readIFD(main._gps, {1:'Lat Ref',2:'_lat',3:'Lon Ref',4:'_lon'});
      const dms=v=>Array.isArray(v)? v : v; 
      const raw={}; const n=u16(exif+main._gps);
      const vals={}; for(let i=0;i<n;i++){ const eo=main._gps+2+i*12; vals[u16(exif+eo)]=eo; }
      function rat3(eo){ const type=u16(exif+eo+2); let vo=exif+u32(exif+eo+8); const out=[];
        for(let k=0;k<3;k++){ const nn=u32(vo+k*8), dd=u32(vo+k*8+4); out.push(dd? nn/dd : 0); } return out; }
      if(vals[2]&&vals[4]){ const la=rat3(exif+vals[2]), lo=rat3(exif+vals[4]);
        gps['GPS']=`${(la[0]+la[1]/60+la[2]/3600).toFixed(6)}, ${(lo[0]+lo[1]/60+lo[2]/3600).toFixed(6)}`; } }
    delete main._exif; delete main._gps;
    const all={File:f.name, Size:(f.size/1024).toFixed(1)+' KB', ...main, ...exifSub, ...gps};
    const lines=Object.entries(all).filter(([,v])=>v!==undefined&&v!=='').map(([k,v])=>`${k}: ${v}`);
    return lines.length>2? lines.join('\n') : 'EXIF header present but no readable tags.';
  }
},

qrscan(el){
  el.innerHTML = F('Choose an image with a QR code', '<input id="qsf" type="file" accept="image/*">') + OUT('qsout');
  $('#qsf').addEventListener('change', async ()=>{ const f=$('#qsf').files[0]; if(!f) return;
    if(!('BarcodeDetector' in window)){ $('#qsout').textContent='⚠️ QR scanning needs Chrome/Edge (BarcodeDetector API).'; return; }
    try{ const bmp=await createImageBitmap(f); const det=new BarcodeDetector({formats:['qr_code']});
      const res=await det.detect(bmp); $('#qsout').textContent=res.length? 'QR content: '+res[0].rawValue : 'No QR code found in this image.'; }
    catch(e){ $('#qsout').textContent='❌ '+e.message; } });
},

passstr(el){
  el.innerHTML = F('Password to test (never stored, never sent)', '<input id="psw" type="text" placeholder="type a password…">') + OUT('psout');
  $('#psw').addEventListener('input', ()=>{ const v=$('#psw').value; if(!v){ $('#psout').textContent='—'; return; }
    let set=0; if(/[a-z]/.test(v)) set+=26; if(/[A-Z]/.test(v)) set+=26; if(/\d/.test(v)) set+=10; if(/[^a-zA-Z0-9]/.test(v)) set+=33;
    const ent=v.length*Math.log2(set||1); const guesses=Math.pow(2,ent-1); const secs=guesses/1e10;
    const human=s=> s<1?'instantly': s<60? Math.round(s)+' seconds' : s<3600? Math.round(s/60)+' minutes' : s<86400? Math.round(s/3600)+' hours' : s<31557600? Math.round(s/86400)+' days' : s<3.15576e9? Math.round(s/31557600)+' years' : s<3.15576e12? Math.round(s/3.15576e9)+' thousand years' : 'millions of years';
    $('#psout').textContent=`Length: ${v.length} · Entropy: ~${ent.toFixed(0)} bits\nAt 10 billion guesses/sec: about ${human(secs)} to crack.`; });
},

jwtdec(el){
  el.innerHTML = F('JWT token', TA('jw','')) + OUT('jwout');
  $('#jw').addEventListener('input', ()=>{ const p=$('#jw').value.trim().split('.');
    if(p.length<2){ $('#jwout').textContent='Paste a full JWT (header.payload.signature)'; return; }
    const dec=s=>{ try{ return JSON.stringify(JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')), c=>c.charCodeAt(0)))), null, 2); }catch(e){ return '❌ '+e.message; } };
    $('#jwout').textContent='HEADER:\n'+dec(p[0])+'\n\nPAYLOAD:\n'+dec(p[1]); });
},

jwtgen(el){
  el.innerHTML = F('Payload (JSON)', TA('jg','{"sub":"123","name":"ABIX","admin":true}'))
    + F('Secret', IN('jgs','my-secret')) + BTN('Sign (HS256)') + OUT('jgout');
  el.querySelector('.btn').onclick=async ()=>{ const b64=o=>btoa(String.fromCharCode(...new TextEncoder().encode(o))).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
    try{ JSON.parse($('#jg').value); }catch(e){ $('#jgout').textContent='❌ Payload is not valid JSON'; return; }
    const data=b64(JSON.stringify({alg:'HS256',typ:'JWT'}))+'.'+b64($('#jg').value);
    const key=await crypto.subtle.importKey('raw', new TextEncoder().encode($('#jgs').value), {name:'HMAC',hash:'SHA-256'}, false, ['sign']);
    const sig=await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
    $('#jgout').textContent=data+'.'+b64(String.fromCharCode(...new Uint8Array(sig))); };
},

htmlenc(el){
  el.innerHTML = F('Text / HTML', TA('he','<b>Hello</b> & "ABIX"')) + BTN('Encode') + BTN('Decode','btn-ghost') + OUT('heout');
  const bs=el.querySelectorAll('.btn');
  bs[0].onclick=()=>{ $('#heout').textContent=$('#he').value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); };
  bs[1].onclick=()=>{ const t=document.createElement('textarea'); t.innerHTML=$('#he').value; $('#heout').textContent=t.value; };
},

caesar(el){
  el.innerHTML = `<div class="row">${F('Text', TA('cc','Hello ABIX'))}${F('Shift (1–25)', '<input id="csh" type="number" value="3" min="1" max="25">')}</div>`
    + BTN('Encrypt') + BTN('Decrypt','btn-ghost') + OUT('ccout');
  const run=dir=>{ const sh=(+$('#csh').value%26)*dir;
    $('#ccout').textContent=$('#cc').value.replace(/[a-z]/gi, ch=>{ const base=ch<='Z'?65:97; return String.fromCharCode((ch.charCodeAt(0)-base+sh+26)%26+base); }); };
  const bs=el.querySelectorAll('.btn'); bs[0].onclick=()=>run(1); bs[1].onclick=()=>run(-1);
},

binconv(el){
  el.innerHTML = F('Text or binary (space-separated bytes)', TA('bc','ABIX')) + BTN('Text → Binary') + BTN('Binary → Text','btn-ghost') + OUT('bcout');
  const bs=el.querySelectorAll('.btn');
  bs[0].onclick=()=>{ $('#bcout').textContent=[...new TextEncoder().encode($('#bc').value)].map(b=>b.toString(2).padStart(8,'0')).join(' '); };
  bs[1].onclick=()=>{ try{ const bytes=$('#bc').value.trim().split(/\s+/).map(b=>parseInt(b,2)); $('#bcout').textContent=new TextDecoder().decode(new Uint8Array(bytes)); }catch(e){ $('#bcout').textContent='❌ Invalid binary'; } };
},

calc(el){
  el.innerHTML = `<div class="out mono" id="cdisp" style="font-size:22px;text-align:right;min-height:56px">0</div><div style="height:10px"></div>
  <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px" id="cgrid"></div>`;
  const keys=['7','8','9','/','C','4','5','6','*','⌫','1','2','3','-','(','0','.','=','+',')','sin','cos','tan','√','^'];
  let expr='';
  const upd=()=>{ $('#cdisp').textContent=expr||'0'; };
  keys.forEach(k=>{ const b=document.createElement('button'); b.className='btn '+(k==='='?'btn-p':'btn-ghost'); b.textContent=k; b.style.margin='0';
    b.onclick=()=>{ if(k==='C'){ expr=''; } else if(k==='⌫'){ expr=expr.slice(0,-1); }
      else if(k==='='){ try{ const safe=expr.replace(/sin/g,'Math.sin').replace(/cos/g,'Math.cos').replace(/tan/g,'Math.tan').replace(/√/g,'Math.sqrt').replace(/\^/g,'**');
        if(/[^0-9+\-*/().Matha-z ]/.test(safe.replace(/Math\.(sin|cos|tan|sqrt)/g,''))) throw 0;
        expr=String(Function('"use strict";return('+safe+')')()); }catch(e){ expr='Error'; setTimeout(()=>{expr='';upd();},900); } }
      else if(k==='sin'||k==='cos'||k==='tan'){ expr+=k+'('; } else if(k==='√'){ expr+='√('; } else expr+=k;
      upd(); };
    $('#cgrid').appendChild(b); });
},

currency(el){
  const CUR=['USD','PKR','EUR','GBP','AED','SAR','INR','CAD','AUD','JPY','CNY','TRY','KWD','QAR','BDT','LKR','NPR','MYR','SGD','CHF','SEK','NOK','DKK','NZD','ZAR','EGP','NGN','KES','BRL','MXN','RUB'];
  el.innerHTML = `<div class="row">${F('Amount','<input id="cuA" type="number" value="100">')}${F('From',`<select id="cuF">${CUR.map(c=>`<option ${c==='USD'?'selected':''}>${c}</option>`).join('')}</select>`)}${F('To',`<select id="cuT">${CUR.map(c=>`<option ${c==='PKR'?'selected':''}>${c}</option>`).join('')}</select>`)}</div>` + OUT('cuout');
  const draw=async ()=>{ const a=parseFloat($('#cuA').value); if(isNaN(a)){ $('#cuout').textContent='—'; return; }
    try{ const r=await fetch(`https://api.exchangerate-api.com/v4/latest/${$('#cuF').value}`); const j=await r.json();
      const rate=j.rates[$('#cuT').value]; $('#cuout').textContent=`${a} ${$('#cuF').value} = ${(a*rate).toLocaleString(undefined,{maximumFractionDigits:2})} ${$('#cuT').value}\nRate: 1 ${$('#cuF').value} = ${rate} ${$('#cuT').value} (live, ${j.date||'today'})`; }
    catch(e){ $('#cuout').textContent='❌ Rates could not load (needs internet).'; } };
  ['cuA','cuF','cuT'].forEach(i=>$('#'+i).addEventListener('input',draw)); draw();
},

weather(el){
  el.innerHTML = F('City', IN('wc','Swabi')) + BTN('Get 7-day forecast') + OUT('wcout');
  el.querySelector('.btn').onclick=async ()=>{ const city=$('#wc').value.trim(); if(!city) return;
    $('#wcout').textContent='Loading…';
    try{ const g=await (await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`)).json();
      if(!g.results?.length){ $('#wcout').textContent='City not found.'; return; }
      const {latitude,longitude,name,country}=g.results[0];
      const w=await (await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`)).json();
      let s=`${name}, ${country}\n`;
      w.daily.time.forEach((d,i)=>{ s+=`${d}:  ${w.daily.temperature_2m_min[i]}° – ${w.daily.temperature_2m_max[i]}°C · rain ${w.daily.precipitation_probability_max[i]??0}%\n`; });
      $('#wcout').textContent=s; }
    catch(e){ $('#wcout').textContent='❌ '+e.message; } };
},

prayer(el){
  el.innerHTML = `<div class="row">${F('City', IN('pc2','Swabi'))}${F('Country', IN('pk2','Pakistan'))}</div>` + BTN('Get prayer times') + OUT('prout');
  el.querySelector('.btn').onclick=async ()=>{ $('#prout').textContent='Loading…';
    try{ const r=await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent($('#pc2').value)}&country=${encodeURIComponent($('#pk2').value)}&method=2`);
      const j=await r.json(); const t=j.data.timings;
      $('#prout').textContent=['Fajr','Sunrise','Dhuhr','Asr','Maghrib','Isha'].map(k=>`${k}: ${t[k]}`).join('\n')+`\nDate: ${j.data.date.readable} (${j.data.date.hijri.date} Hijri)`; }
    catch(e){ $('#prout').textContent='❌ Could not load — check city/country spelling.'; } };
},

translate(el){
  const L={en:'English',ur:'Urdu',ar:'Arabic',hi:'Hindi',es:'Spanish',fr:'French',de:'German',tr:'Turkish',fa:'Persian',ps:'Pashto'};
  el.innerHTML = F('Text', TA('trt',''))
    + `<div class="row">${F('From',`<select id="trf">${Object.entries(L).map(([k,v])=>`<option value="${k}" ${k==='en'?'selected':''}>${v}</option>`).join('')}</select>`)}${F('To',`<select id="trto">${Object.entries(L).map(([k,v])=>`<option value="${k}" ${k==='ur'?'selected':''}>${v}</option>`).join('')}</select>`)}</div>`
    + BTN('Translate') + OUT('trout');
  el.querySelector('.btn').onclick=async ()=>{ const q=$('#trt').value.trim(); if(!q) return;
    $('#trout').textContent='Translating…';
    try{ const r=await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(q)}&langpair=${$('#trf').value}|${$('#trto').value}`);
      const j=await r.json(); $('#trout').textContent=j.responseData?.translatedText||'No result'; }
    catch(e){ $('#trout').textContent='❌ '+e.message; } };
},

dict(el){
  el.innerHTML = F('English word', IN('dw','serious')) + BTN('Look up') + OUT('dwout');
  el.querySelector('.btn').onclick=async ()=>{ const w=$('#dw').value.trim(); if(!w) return;
    $('#dwout').textContent='Loading…';
    try{ const r=await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(w)}`);
      if(!r.ok) throw new Error('Word not found'); const j=await r.json(); const e=j[0];
      let s=`${e.word}  ${e.phonetic||''}\n`;
      e.meanings.forEach(m=>{ s+=`\n${m.partOfSpeech}:\n`; m.definitions.slice(0,3).forEach(d=>{ s+='• '+d.definition+'\n'; }); });
      $('#dwout').textContent=s; }
    catch(e){ $('#dwout').textContent='❌ '+e.message; } };
},

ip(el){
  el.innerHTML = F('IP address (leave empty for your own)', IN('ipv','8.8.8.8')) + BTN('Look up') + OUT('ipout');
  el.querySelector('.btn').onclick=async ()=>{ $('#ipout').textContent='Loading…';
    try{ const r=await fetch('https://ipwho.is/'+encodeURIComponent($('#ipv').value.trim()));
      const j=await r.json(); if(j.success===false) throw new Error(j.message||'lookup failed');
      $('#ipout').textContent=`IP: ${j.ip}\nLocation: ${j.city}, ${j.region}, ${j.country}\nISP: ${j.connection?.isp||j.connection?.org||'-'}\nTimezone: ${j.timezone?.id||'-'}`; }
    catch(e){ $('#ipout').textContent='❌ '+e.message; } };
},

quote(el){
  const Q=[['The best way to predict the future is to invent it.','Alan Kay'],['Simplicity is the soul of efficiency.','Austin Freeman'],['First, solve the problem. Then, write the code.','John Johnson'],['Code is like humour. When you have to explain it, it is bad.','Cory House'],['Make it work, make it right, make it fast.','Kent Beck'],['Experience is the name everyone gives to their mistakes.','Oscar Wilde'],['Knowledge is power.','Francis Bacon'],['Stay hungry, stay foolish.','Steve Jobs'],['Whatever you are, be a good one.','Abraham Lincoln'],['It always seems impossible until it is done.','Nelson Mandela'],['Quality is not an act, it is a habit.','Aristotle'],['The only true wisdom is in knowing you know nothing.','Socrates']];
  const day=Math.floor((Date.now()-new Date(new Date().getFullYear(),0,0))/864e5);
  const [q,a]=Q[day%Q.length];
  el.innerHTML = `<div class="out" style="font-size:18px">“${q}”<br><small>— ${a}</small></div>` + BTN('Another (random)');
  el.querySelector('.btn').onclick=()=>{ const [q2,a2]=Q[Math.floor(Math.random()*Q.length)];
    el.querySelector('.out').innerHTML=`“${q2}”<br><small>— ${a2}</small>`; };
},

barcode(el){
  el.innerHTML = F('Text / numbers', IN('bcv','ABIX-9696')) + BTN('Generate') + '<div style="text-align:center"><svg id="bcsvg"></svg></div>';
  el.querySelector('.btn').onclick=()=>{ if(typeof JsBarcode==='undefined'){ alert('Barcode library failed to load (needs internet once).'); return; }
    JsBarcode('#bcsvg', $('#bcv').value||'ABIX', {format:'CODE128', displayValue:true}); };
},

ghstats(el){
  el.innerHTML = F('GitHub username', IN('ghu','Jalalkhan96')) + BTN('Fetch stats') + OUT('ghout');
  el.querySelector('.btn').onclick=async ()=>{ const u=$('#ghu').value.trim(); if(!u) return;
    $('#ghout').textContent='Loading…';
    try{ const [usr,repos]=await Promise.all([
        (await fetch(`https://api.github.com/users/${u}`)).json(),
        (await fetch(`https://api.github.com/users/${u}/repos?per_page=100`)).json() ]);
      if(usr.message) throw new Error(usr.message);
      const stars=repos.reduce((s,r)=>s+r.stargazers_count,0);
      const langs={}; repos.forEach(r=>{ if(r.language) langs[r.language]=(langs[r.language]||0)+1; });
      const top=Object.entries(langs).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([k,v])=>`${k} (${v})`).join(', ');
      $('#ghout').textContent=`${usr.name||usr.login} — ${usr.public_repos} public repos · ${usr.followers} followers · ${stars} total stars\nTop languages: ${top||'-'}\nJoined: ${(usr.created_at||'').slice(0,10)} · ${usr.html_url}`; }
    catch(e){ $('#ghout').textContent='❌ '+e.message; } };
},

csvjson(el){
  el.innerHTML = F('CSV (first row = headers)', TA('cvt','name,role\nJalal,Engineer\nABIX,Lab')) + BTN('Convert') + OUT('cvout');
  el.querySelector('.btn').onclick=()=>{ const rows=$('#cvt').value.trim().split('\n').map(r=>{
      const out=[]; let cur='', q=false;
      for(const ch of r){ if(ch==='"') q=!q; else if(ch===','&&!q){ out.push(cur); cur=''; } else cur+=ch; }
      out.push(cur); return out; });
    const head=rows[0]; const objs=rows.slice(1).map(r=>Object.fromEntries(head.map((h,i)=>[h, r[i]??''])));
    $('#cvout').textContent=JSON.stringify(objs,null,2); };
},

mdprev(el){
  el.innerHTML = F('Markdown', TA('mdt','# ABIX LAB\n\n**Serious software** — built from *idea* to production.\n\n- Fast\n- Tested\n- Shipped'))
    + '<label style="font-size:13px;font-weight:700;color:var(--n700)">Preview</label><div class="out" id="mdp"></div>'
    + '<label style="font-size:13px;font-weight:700;color:var(--n700)">HTML</label>' + OUT('mdh') + BTN('Copy HTML');
  const draw=()=>{ if(typeof marked==='undefined'||typeof DOMPurify==='undefined'){ $('#mdp').textContent='Markdown libraries failed to load (needs internet once).'; return; }
    const html=marked.parse($('#mdt').value); $('#mdp').innerHTML=DOMPurify.sanitize(html); $('#mdh').textContent=html; };
  $('#mdt').addEventListener('input',draw); draw();
  el.querySelector('.btn').onclick=()=>copyTxt($('#mdh').textContent);
},

cron(el){
  el.innerHTML = F('Cron expression (5 fields)', IN('cr','19 10 * * *')) + OUT('crout');
  const NAMES=['minute','hour','day of month','month','day of week'];
  const draw=()=>{ const p=$('#cr').value.trim().split(/\s+/); if(p.length!==5){ $('#crout').textContent='Needs exactly 5 fields: minute hour day month weekday'; return; }
    const desc=p.map((f,i)=> f==='*'? `every ${NAMES[i]}` : `at ${NAMES[i]} = ${f}`).join(' · ');
    let next=[]; try{ const [mi,ho]=[p[0],p[1]]; const d=new Date(); d.setSeconds(0,0);
      for(let i=0;i<20000 && next.length<5;i++){ d.setMinutes(d.getMinutes()+1);
        const ok=(f,v)=> f==='*'||f.split(',').some(x=>{ if(x.includes('/')){ const s=+x.split('/')[1]; return v%s===0; } if(x.includes('-')){ const[a,b]=x.split('-').map(Number); return v>=a&&v<=b; } return +x===v; });
        if(ok(p[0],d.getMinutes())&&ok(p[1],d.getHours())&&ok(p[2],d.getDate())&&ok(p[3],d.getMonth()+1)&&ok(p[4],d.getDay())) next.push(d.toLocaleString()); } }
    catch(e){}
    $('#crout').textContent=desc+'\n\nNext runs:\n'+(next.join('\n')||'(none found soon)'); };
  $('#cr').addEventListener('input',draw); draw();
},

jsbeaut(el){
  el.innerHTML = F('Minified JavaScript', TA('jbt','const a={x:1,y:2};function f(n){return n*2}')) + BTN('Beautify') + OUT('jbout');
  el.querySelector('.btn').onclick=()=>{ if(typeof js_beautify==='undefined'){ $('#jbout').textContent='❌ Beautifier library failed to load (needs internet once).'; return; }
    $('#jbout').textContent=js_beautify($('#jbt').value, {indent_size:2}); };
},

cssmin(el){
  el.innerHTML = F('CSS', TA('csm','/* hi */\n.card {\n  color : red ;\n  margin : 0px ;\n}')) + BTN('Minify') + OUT('csout');
  el.querySelector('.btn').onclick=()=>{ const v=$('#csm').value
      .replace(/\/\*[\s\S]*?\*\//g,'').replace(/\s+/g,' ').replace(/\s*([{}:;,>])\s*/g,'$1').replace(/;}/g,'}').trim();
    $('#csout').textContent=v+`\n\n(${v.length} bytes — was ${$('#csm').value.length})`; };
},

pdfmerge(el){
  el.innerHTML = '<div class="row">' + F('Merge: choose 2+ PDFs', '<input id="pmf" type="file" accept="application/pdf" multiple>')
    + F('Split: choose 1 PDF', '<input id="psf" type="file" accept="application/pdf">') + '</div>'
    + BTN('Merge all') + BTN('Split into pages','btn-ghost') + OUT('pmout');
  const bs=el.querySelectorAll('.btn');
  const dl=(bytes,name)=>{ const a=document.createElement('a'); a.className='btn btn-p'; a.textContent='Download '+name;
    a.href=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'})); a.download=name; $('#pmout').innerHTML=''; $('#pmout').appendChild(a); };
  bs[0].onclick=async ()=>{ if(typeof PDFLib==='undefined'){ $('#pmout').textContent='❌ PDF library failed to load (needs internet once).'; return; }
    const fs=$('#pmf').files; if(fs.length<2){ $('#pmout').textContent='Choose at least 2 PDFs to merge.'; return; }
    const out=await PDFLib.PDFDocument.create();
    for(const f of fs){ const doc=await PDFLib.PDFDocument.load(await f.arrayBuffer());
      (await out.copyPages(doc, doc.getPageIndices())).forEach(pg=>out.addPage(pg)); }
    dl(await out.save(), 'merged.pdf'); };
  bs[1].onclick=async ()=>{ if(typeof PDFLib==='undefined'){ $('#pmout').textContent='❌ PDF library failed to load (needs internet once).'; return; }
    const f=$('#psf').files[0]; if(!f){ $('#pmout').textContent='Choose a PDF to split.'; return; }
    const doc=await PDFLib.PDFDocument.load(await f.arrayBuffer());
    $('#pmout').innerHTML=''; 
    for(let i=0;i<doc.getPageCount();i++){ const one=await PDFLib.PDFDocument.create();
      const [pg]=await one.copyPages(doc,[i]); one.addPage(pg);
      const a=document.createElement('a'); a.className='btn btn-ghost'; a.textContent='Page '+(i+1);
      a.href=URL.createObjectURL(new Blob([await one.save()],{type:'application/pdf'})); a.download='page-'+(i+1)+'.pdf';
      $('#pmout').appendChild(a); } };
},

imgpdf(el){
  el.innerHTML = F('Choose images', '<input id="ipf" type="file" accept="image/*" multiple>') + BTN('Make PDF') + OUT('ipout');
  el.querySelector('.btn').onclick=async ()=>{ if(typeof PDFLib==='undefined'){ $('#ipout').textContent='❌ PDF library failed to load (needs internet once).'; return; }
    const fs=$('#ipf').files; if(!fs.length){ $('#ipout').textContent='Choose at least one image.'; return; }
    const doc=await PDFLib.PDFDocument.create();
    for(const f of fs){ const buf=await f.arrayBuffer();
      const img=f.type==='image/png'? await doc.embedPng(buf) : await doc.embedJpg(buf);
      const page=doc.addPage([img.width, img.height]); page.drawImage(img,{x:0,y:0,width:img.width,height:img.height}); }
    const a=document.createElement('a'); a.className='btn btn-p'; a.textContent='Download PDF';
    a.href=URL.createObjectURL(new Blob([await doc.save()],{type:'application/pdf'})); a.download='images.pdf';
    $('#ipout').innerHTML=''; $('#ipout').appendChild(a); };
},

pdfmeta(el){
  el.innerHTML = F('Choose a PDF', '<input id="pdf1" type="file" accept="application/pdf">') + OUT('pdfout');
  $('#pdf1').addEventListener('change', ()=>{ const f=$('#pdf1').files[0]; if(!f) return;
    const r=new FileReader(); r.onload=()=>{ const s=new TextDecoder('latin1').decode(r.result);
      const get=k=>{ const m=s.match(new RegExp('/'+k+'\\s*\\(([^\\)]*)\\)')); return m? m[1] : '-'; };
      const pages=(s.match(/\/Type\s*\/Page[^s]/g)||[]).length;
      $('#pdfout').textContent=`File: ${f.name} (${(f.size/1024).toFixed(1)} KB)\nTitle: ${get('Title')}\nAuthor: ${get('Author')}\nCreator: ${get('Creator')}\nProducer: ${get('Producer')}\nCreated: ${get('CreationDate')}\nPages (approx): ${pages||'-'}`; };
    r.readAsArrayBuffer(f); });
},

filemeta(el){
  el.innerHTML = F('Choose any file', '<input id="fmf" type="file">') + OUT('fmout');
  $('#fmf').addEventListener('change', async ()=>{ const f=$('#fmf').files[0]; if(!f) return;
    const buf=await crypto.subtle.digest('SHA-256', await f.arrayBuffer());
    const hash=[...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('');
    $('#fmout').textContent=`Name: ${f.name}\nSize: ${f.size.toLocaleString()} bytes (${(f.size/1024).toFixed(1)} KB)\nType: ${f.type||'unknown'}\nModified: ${new Date(f.lastModified).toLocaleString()}\nSHA-256: ${hash}`; });
},

dns(el){
  el.innerHTML = `<div class="row">${F('Domain', IN('dn','google.com'))}${F('Record type', '<select id="dnt"><option>A</option><option>AAAA</option><option>MX</option><option>TXT</option><option>NS</option><option>CNAME</option></select>')}</div>`
    + BTN('Look up') + OUT('dnout');
  el.querySelector('.btn').onclick=async ()=>{ $('#dnout').textContent='Loading…';
    try{ const r=await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent($('#dn').value.trim())}&type=${$('#dnt').value}`, {headers:{Accept:'application/dns-json'}});
      const j=await r.json();
      $('#dnout').textContent=j.Answer? j.Answer.map(a=>`${a.name} → ${a.data} (TTL ${a.TTL})`).join('\n') : 'No records found.'; }
    catch(e){ $('#dnout').textContent='❌ '+e.message; } };
},

subdom(el){
  el.innerHTML = F('Domain', IN('sbd','example.com')) + BTN('Find subdomains') + OUT('sbout')
    + '<p style="font-size:13px;color:var(--n500)">Uses public certificate-transparency logs (crt.sh) — passive OSINT, for authorised research.</p>';
  el.querySelector('.btn').onclick=async ()=>{ const d=$('#sbd').value.trim().replace(/^https?:\/\//,''); if(!d) return;
    $('#sbout').textContent='Searching CT logs… can take 10–20 seconds.';
    try{ const r=await fetch(`https://crt.sh/?q=%25.${encodeURIComponent(d)}&output=json`);
      const j=await r.json(); const names=new Set();
      j.forEach(e=>e.name_value.split('\n').forEach(n=>{ n=n.trim().toLowerCase(); if(n.endsWith(d)&&!n.includes('*')) names.add(n); }));
      const list=[...names].sort(); $('#sbout').textContent=list.length? `${list.length} subdomains:\n`+list.join('\n') : 'No subdomains found in CT logs.'; }
    catch(e){ $('#sbout').textContent='❌ crt.sh did not respond — try again in a minute.'; } };
},

nye(el){
  el.innerHTML = '<div class="out" id="nyout" style="font-size:24px;text-align:center">—</div>';
  const tick=()=>{ const now=new Date(); let target=new Date(now.getFullYear()+1,0,1);
    let s=Math.max(0,Math.floor((target-now)/1000));
    const d=Math.floor(s/86400); s%=86400; const h=Math.floor(s/3600); s%=3600; const m=Math.floor(s/60); const sec=s%60;
    const o=$('#nyout'); if(o) o.textContent=`🎆 ${d} days · ${h} hrs · ${m} min · ${sec} sec to ${target.getFullYear()}`; };
  tick(); window.__timer=setInterval(tick,1000);
},

vid64(el){
  el.innerHTML = F('Choose a small video (under ~10 MB)', '<input id="v6f" type="file" accept="video/*">') + F('Base64 data URI', TA('v6o','')) + OUT('v6s');
  $('#v6f').addEventListener('change', ()=>{ const f=$('#v6f').files[0]; if(!f) return;
    const r=new FileReader(); r.onload=()=>{ $('#v6o').value=r.result; $('#v6s').textContent=`${f.name} — ${(f.size/1024/1024).toFixed(2)} MB → data URI ${($('#v6o').value.length/1024/1024).toFixed(2)} MB`; };
    r.readAsDataURL(f); });
},

audiorec(el){
  el.innerHTML = BTN('🎙️ Start recording') + BTN('Stop','btn-ghost') + '<div id="arout" style="margin-top:12px"></div>';
  let rec=null, chunks=[];
  const bs=el.querySelectorAll('.btn');
  bs[0].onclick=async ()=>{ try{ const stream=await navigator.mediaDevices.getUserMedia({audio:true});
      rec=new MediaRecorder(stream); chunks=[];
      rec.ondataavailable=e=>chunks.push(e.data);
      rec.onstop=()=>{ const blob=new Blob(chunks,{type:rec.mimeType}); const url=URL.createObjectURL(blob);
        $('#arout').innerHTML=`<audio controls src="${url}"></audio><br><a class="btn btn-p" href="${url}" download="recording.webm">Download</a>`;
        stream.getTracks().forEach(t=>t.stop()); };
      rec.start(); bs[0].textContent='● Recording…'; }
    catch(e){ $('#arout').textContent='❌ Microphone permission denied.'; } };
  bs[1].onclick=()=>{ if(rec&&rec.state!=='inactive'){ rec.stop(); bs[0].textContent='🎙️ Start recording'; } };
},

vid2aud(el){
  el.innerHTML = F('Choose a video', '<input id="vaf" type="file" accept="video/*">') + BTN('Extract audio')
    + '<p style="font-size:13px;color:var(--n500)">The video plays once (muted preview) while its audio is captured — keep this tab open until it finishes.</p>'
    + '<video id="vav" style="width:100%;border-radius:10px" controls></video><div id="vaout" style="margin-top:10px"></div>';
  el.querySelector('.btn').onclick=()=>{ const f=$('#vaf').files[0]; if(!f){ $('#vaout').textContent='Choose a video first.'; return; }
    const v=$('#vav'); v.src=URL.createObjectURL(f);
    v.onloadedmetadata=()=>{ const stream=v.captureStream ? v.captureStream() : null;
      if(!stream){ $('#vaout').textContent='⚠️ This browser cannot capture streams.'; return; }
      const tracks=stream.getAudioTracks(); if(!tracks.length){ $('#vaout').textContent='No audio track in this video.'; return; }
      const rec=new MediaRecorder(new MediaStream(tracks)); const chunks=[];
      rec.ondataavailable=e=>chunks.push(e.data);
      rec.onstop=()=>{ const url=URL.createObjectURL(new Blob(chunks,{type:rec.mimeType}));
        $('#vaout').innerHTML=`<audio controls src="${url}"></audio><br><a class="btn btn-p" href="${url}" download="audio.webm">Download audio</a>`; };
      v.onended=()=>rec.stop(); rec.start(); v.play(); }; };
}
});
render();

})();

/* ---------- bottom glass dock: spring-eased anchored pointer ---------- */
(function () {
    "use strict";
    var dock = document.getElementById('dock');
    if (!dock) return;
    var ptr = document.getElementById('dockPtr');
    var btns = Array.prototype.slice.call(dock.querySelectorAll('button'));
    function move(btn) {
        btns.forEach(function (x) { x.classList.toggle('sel', x === btn); });
        if (ptr) ptr.style.transform = 'translateX(' + (btn.offsetLeft + btn.offsetWidth / 2 - 23) + 'px)';
    }
    btns.forEach(function (b) {
        b.addEventListener('click', function () {
            move(b);
            var t = document.querySelector(b.getAttribute('data-go'));
            if (t) t.scrollIntoView({ behavior: 'smooth' });
        });
    });
    move(btns[0]);
    addEventListener('resize', function () { move(dock.querySelector('button.sel') || btns[0]); });
})();
