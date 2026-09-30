import {CHARACTERS,QUESTIONS,STAT_NAMES,LOCATIONS,ITEMS,VERSION} from './data.js';
import * as Engine from './engine.js';

const root=document.querySelector('#app'),toastEl=document.querySelector('#toast');
const SAVE_KEY='heroes-alemanes-rpg-v1';
let screen='home',game=null,selected='fritz',answers=[],quizIndex=0,modal=null,paused=false;
let dialogue=null,typingTimer=null,toastTimer=null,lastFrame=performance.now(),saveElapsed=0,seenMessages=0,lastMessage='',busy=false;
let soundEnabled=false,audioContext=null;
const savedRaw=()=>{try{return localStorage.getItem(SAVE_KEY);}catch{return null;}};
const e=value=>{const span=document.createElement('span');span.textContent=String(value??'');return span.innerHTML;};
const paths={
  play:'M8 5l11 7-11 7z',pause:'M8 5v14M16 5v14',save:'M5 3h12l4 4v14H3V3h2zM7 3v6h10V3M7 21v-8h10v8',
  settings:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2',
  close:'M5 5l14 14M19 5L5 19',back:'M15 5l-7 7 7 7',bag:'M5 8h14v12H5zM8 8V4h8v4M5 13h14',map:'M3 5l6-2 6 2 6-2v16l-6 2-6-2-6 2zM9 3v16M15 5v16',
  book:'M4 3h13a3 3 0 0 1 3 3v15H7a3 3 0 0 1-3-3V3zM4 17h16M8 7h8M8 11h6',team:'M8 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6M16 5a3 3 0 1 0 0 6 3 3 0 0 0 0-6M2 20v-4a6 6 0 0 1 12 0v4M15 13a5 5 0 0 1 7 5v2',
  health:'M12 21C3 15 0 8 5 4c3-2 5 0 7 2 2-2 4-4 7-2 5 4 2 11-7 17z',
  food:'M5 3v7M9 3v7M3 6h8M7 10v11M17 3v18M17 3c5 2 5 9 0 10',water:'M12 2C8 8 4 12 4 16a8 8 0 0 0 16 0c0-4-4-8-8-14z',
  rest:'M20 15A9 9 0 0 1 9 4a9 9 0 1 0 11 11z',hygiene:'M5 12h14v9H5zM8 12V9a4 4 0 0 1 8 0v3M10 3h4M3 15h18',
  stealth:'M3 12c4-8 14-8 18 0-4 8-14 8-18 0zM12 8a4 4 0 1 0 0 8M3 3l18 18',voice:'M3 9h4l5-5v16l-5-5H3zM16 8c3 2 3 6 0 8M19 5c5 4 5 10 0 14',
  coin:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M12 7v10M9 9h6M9 15h6',home:'M3 11l9-8 9 8M5 10v11h14V10M10 21v-7h4v7',
  arrow:'M3 12h18M14 5l7 7-7 7',talk:'M3 4h18v12H9l-6 5V4zM7 8h10M7 12h7',
  sword:'M5 20L19 6l1-4-4 1L2 17M4 14l6 6M3 21l-1-1',leaf:'M4 20C1 9 10 3 21 3c0 11-6 20-17 17zM4 20L16 8',
  import:'M12 3v12M7 10l5 5 5-5M4 17v4h16v-4',export:'M12 17V3M7 8l5-5 5 5M4 17v4h16v-4',
  hammer:'M4 21l9-9M10 3l5-1 7 7-5 5-7-7z'
};
const icon=name=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+(paths[name]||paths.book)+'"/></svg>';
function sprite(index,classes=''){
  return '<span class="portrait '+classes+'"><span class="sprite-art" style="background-position:'+(index%4/3*100)+'% '+(Math.floor(index/4)/2*100)+'%"></span></span>';
}
const person=()=>CHARACTERS.find(c=>c.id===(game?.characterId||selected));
function scene(location='refuge'){
  const l=LOCATIONS[location];
  return '<div class="scene-bg '+(location==='clinic'?'clinic':location==='trail'?'trail':'')+'" style="background-image:url('+l.image+')" role="img" aria-label="'+l.name+'"></div>';
}
function header(inWorld=false){
  const time=game?Engine.timeLabel(game):null;
  return '<header class="topbar"><div class="brand"><span class="brandmark">✦</span><div><strong>HÉROES ALEMANES</strong><small>EVENTO FUNDACIONAL</small></div></div><div class="top-end">'+
    (inWorld?'<div class="clock"><b data-clock>'+time.clock+'</b><small data-date>'+time.date+'</small></div>':'')+
    '<div class="top-actions">'+(inWorld?'<button class="icon-button" data-action="pause" aria-label="'+(paused?'Continuar tiempo':'Pausar tiempo')+'">'+icon(paused?'play':'pause')+'</button><button class="icon-button optional" data-action="save" aria-label="Guardar partida">'+icon('save')+'</button>':'')+
    '<button class="icon-button" data-action="settings" aria-label="Ajustes">'+icon('settings')+'</button></div></div></header>';
}
function notify(text){
  clearTimeout(toastTimer);toastEl.textContent=text;toastEl.classList.add('visible');
  toastTimer=setTimeout(()=>toastEl.classList.remove('visible'),4200);
}
function sound(freq=420){
  if(!soundEnabled)return;
  try{audioContext??=new (window.AudioContext||window.webkitAudioContext)();audioContext.resume();const o=audioContext.createOscillator(),g=audioContext.createGain();o.type='triangle';o.frequency.value=freq;g.gain.setValueAtTime(.035,audioContext.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioContext.currentTime+.11);o.connect(g);g.connect(audioContext.destination);o.start();o.stop(audioContext.currentTime+.12);}catch{}
}
function save(announce=false){
  if(!game||game.health<=0)return;
  try{localStorage.setItem(SAVE_KEY,Engine.serializeGame(game));if(announce)notify('Partida guardada.');}
  catch{if(announce)notify('No se pudo guardar en este dispositivo. Puedes exportar la partida.');}
}
function render(){
  clearInterval(typingTimer);
  if(screen==='home')renderHome();
  else if(screen==='characters')renderCharacters();
  else if(screen==='quiz'||screen==='intro')renderInterview();
  else if(screen==='summary')renderSummary();
  else if(screen==='world')renderWorld();
  renderModal();
  typeText();
}
function renderHome(){
  root.innerHTML=scene()+header()+'<section class="home"><p class="eyebrow">WASGAU · 1921</p><h1>HÉROES<br><span>ALEMANES</span></h1><p class="intro">Despiertas lejos de casa.<br>Lo que hagas después cambiará la historia.</p><div class="home-menu"><button class="primary" data-action="new">'+icon('play')+'Comenzar</button><button class="secondary" data-action="continue" '+(!savedRaw()?'disabled':'')+'>'+icon('book')+'Continuar partida</button><button class="secondary" data-action="import">'+icon('import')+'Importar partida</button></div><div class="version">EN DESARROLLO · '+VERSION+'</div><div class="home-location"><strong>El refugio del bosque</strong><span>FRONTERA FRANCOALEMANA</span></div></section>';
}
function renderCharacters(){
  const c=CHARACTERS.find(c=>c.id===selected);
  root.innerHTML=scene('clinic')+header()+'<section class="select-screen"><div class="screen-heading"><div><h1>Tu rostro, tu historia</h1><p>Elige quién despierta. Tus recuerdos definirán tus aptitudes.</p></div><button class="icon-button" data-action="home" aria-label="Volver">'+icon('back')+'</button></div><div class="character-grid">'+
    CHARACTERS.map(x=>'<button class="character-card '+(x.id===selected?'selected':'')+'" data-action="select" data-id="'+x.id+'" aria-label="'+x.name+', '+x.origin+'"><span class="portrait"><span class="sprite-art" style="background-position:'+(x.sprite%4/3*100)+'% '+(Math.floor(x.sprite/4)/2*100)+'%"></span></span><strong>'+x.name+'</strong><small>'+x.origin+' · '+x.age+' años</small></button>').join('')+
    '</div><div class="selected-detail"><p>'+e(c.description)+'</p><button class="primary" data-action="begin">'+icon('arrow')+'Abrir los ojos</button></div></section>';
}
function renderInterview(){
  const c=CHARACTERS.find(c=>c.id===selected),q=QUESTIONS[quizIndex];
  const text=screen==='intro'?'Me llamo Felix Baumann. Te encontraron en el bosque y te trajeron a la clínica. Estás a salvo. Antes de levantarte, quiero saber qué recuerdas.':q.text;
  root.innerHTML=scene('clinic')+header()+'<section class="dialogue-stage"><div class="stage-person player">'+sprite(c.sprite)+'</div><div class="stage-person doctor">'+sprite(8,'face-left')+'</div><div class="speech-wrap"><div class="speech"><div class="speaker"><span>DOCTOR FELIX BAUMANN</span><small>'+(screen==='intro'?'Clínica':(quizIndex+1)+' / '+QUESTIONS.length+' · '+e(q.title))+'</small></div><p class="typed" data-typed>'+e(text)+'</p><div class="choice-list">'+
    (screen==='intro'?'<button class="choice" data-action="quiz"><span class="choice-number">01</span>Estoy escuchando.</button>':q.answers.map((a,i)=>'<button class="choice" data-action="answer" data-id="'+i+'"><span class="choice-number">0'+(i+1)+'</span>'+e(a.text)+'</button>').join(''))+
    '</div>'+(screen==='quiz'?'<div class="quiz-progress"><i style="width:'+((quizIndex+1)/QUESTIONS.length*100)+'%"></i></div>':'')+'</div></div></section>';
}
function renderSummary(){
  const c=CHARACTERS.find(c=>c.id===selected),r=Engine.questionnaireResult(answers);
  root.innerHTML=scene('clinic')+header()+'<section class="summary"><div class="summary-person">'+sprite(c.sprite)+'<h1>'+c.name+'</h1><small>'+c.origin+' · '+c.age+' años</small><small>'+e(r.background)+'</small></div><div><p class="eyebrow">LO QUE RECUERDAS</p><h1>Tu punto de partida</h1><p>Las respuestas han reconstruido tus aptitudes. Puedes revisarlas antes de salir de la clínica.</p>'+statList(r.stats)+'<p>'+(r.habit==='tobacco'?'Has recordado tu hábito de fumar. La ausencia de tabaco influirá en tu abstinencia.':'No has recordado una dependencia que necesite atención.')+'</p><div class="summary-buttons"><button class="primary" data-action="enter">'+icon('arrow')+'Ir al refugio</button><button class="secondary" data-action="review">'+icon('back')+'Revisar recuerdos</button></div></div></section>';
}
function statList(stats){return '<div class="stats">'+Object.entries(STAT_NAMES).map(([k,n])=>'<div class="stat-line"><span>'+n+'</span><div class="stat-track"><i style="width:'+Math.min(100,stats[k]/12*100)+'%"></i></div><b>'+stats[k]+'</b></div>').join('')+'</div>';}
function needRow(id,name,value,max,ico){
  return '<div class="need">'+icon(ico)+'<div><small>'+name+'</small><div class="need-bar"><i data-need-bar="'+id+'" style="width:'+(value/max*100)+'%"></i></div></div><b data-need-value="'+id+'">'+Math.round(value)+'</b></div>';
}
function renderWorld(){
  if(game.combat){renderBattle();return;}
  const c=person(),l=LOCATIONS[game.location],dead=game.courier.status==='dead',rescued=game.courier.status==='rescued';
  let actionHTML='';
  if(game.location==='refuge'){
    actionHTML='<button data-action="hanne">'+icon('talk')+'Hablar con Hanne</button><button data-action="work">'+icon('hammer')+'Ayudar en la finca · 2 h</button><button data-action="rest">'+icon('rest')+'Descansar</button><button data-action="wash">'+icon('water')+'Asearte · 20 min</button>';
    if(rescued||dead)actionHTML+='<button data-action="ending">'+icon('book')+'Cerrar esta aventura</button>';
  }else if(game.location==='clinic'){
    actionHTML='<button data-action="doctor">'+icon('talk')+'Consultar a Baumann</button><button data-action="heal">'+icon('health')+'Atención médica · 2 ℳ</button><button data-action="travel" data-id="refuge">'+icon('home')+'Regresar a la finca</button>';
  }else{
    actionHTML='<button data-action="search">'+icon('stealth')+'Buscar a Greta</button><button data-action="inspect">'+icon('book')+'Examinar el sendero</button><button data-action="travel" data-id="refuge">'+icon('home')+'Regresar a la finca</button>';
  }
  const quest=dead?(game.flags.bodyReturned?'Ernst ha vuelto. Hay noticias de Greta.':'El silencio del bosque tiene otro peso.'):rescued?(game.courier.injured?'Greta necesita atención médica.':'Greta ha regresado contigo.'):'Greta no ha regresado. Hanne espera noticias antes de la noche.';
  root.innerHTML=scene(game.location)+header(true)+'<div class="world-title"><p class="eyebrow">WASGAU · '+(paused?'TIEMPO PAUSADO':'EL MUNDO SIGUE SU CURSO')+'</p><h1>'+l.name+'</h1><small>'+l.subtitle+'</small></div><div class="gold-count">'+icon('coin')+game.coins+' marcos</div><div class="quest-note"><small>UN LUGAR DONDE QUEDARSE</small><p>'+quest+'</p></div><div class="world-person">'+sprite(c.sprite)+'</div>'+
    (game.companionActive?'<div class="world-person companion">'+sprite(10)+'</div>':game.location==='refuge'?'<div class="world-person housekeeper">'+sprite(9,'face-left')+'</div>':'')+
    '<aside class="needs-panel">'+needRow('health','Vigor',game.health,game.maxHealth,'health')+needRow('food','Alimento',game.needs.food,100,'food')+needRow('water','Agua',game.needs.water,100,'water')+needRow('energy','Descanso',game.needs.energy,100,'rest')+needRow('hygiene','Higiene',game.needs.hygiene,100,'hygiene')+'</aside><aside class="world-actions"><h2>'+ (game.location==='refuge'?'VIDA EN EL REFUGIO':'A TU ALCANCE')+'</h2>'+actionHTML+'</aside><div class="moral-note">TU RECORRIDO · '+Engine.moralityName(game).toUpperCase()+'</div><div class="mode-controls"><button class="mode-button '+(game.stealth?'active':'')+'" data-action="stealth">'+icon('stealth')+'Sigilo '+(game.stealth?'activo':'inactivo')+'</button><button class="mode-button" data-action="voice">'+icon('voice')+'Voz '+({quiet:'baja',normal:'normal',loud:'alta'}[game.voice])+'</button><button class="mode-button" data-action="ask-companion">'+icon('talk')+'Consultar</button></div><nav class="bottom-dock">'+[['map','map','Mapa'],['inventory','bag','Bolsa'],['party','team','Equipo'],['journal','book','Diario'],['save','save','Guardar']].map(([a,i,n])=>'<button class="dock-button" data-action="'+a+'">'+icon(i)+'<span>'+n+'</span></button>').join('')+'</nav>';
}
function renderBattle(){
  const c=person(),b=game.combat;
  root.innerHTML=scene('trail')+header(true)+'<section class="battle"><div class="battle-status player"><strong>'+c.name+'</strong><small>'+ (game.companionActive?'Greta cubre tu flanco':'Sin compañeros activos')+'</small><div class="need-bar"><i style="width:'+(game.health/game.maxHealth*100)+'%"></i></div></div><div class="battle-status enemy"><strong>El hombre del sendero</strong><small>Garrote · Turno '+b.round+'</small><div class="need-bar"><i style="width:'+(b.enemyHealth/b.enemyMax*100)+'%"></i></div></div><div class="fighter player" id="player-fighter">'+sprite(c.sprite)+'</div>'+(game.companionActive?'<div class="fighter ally">'+sprite(10)+'</div>':'')+'<div class="fighter enemy">'+sprite(11,'face-left')+'</div><div class="battle-log">'+e(b.log)+'</div><div class="battle-controls"><button data-action="attack">'+icon('sword')+'Ataque</button><button data-action="inventory">'+icon('bag')+'Bolsa</button><button data-action="combat-team">'+icon('team')+'Equipo</button><button data-action="flee">'+icon('arrow')+'Huir</button></div></section>';
}
function openModal(type){modal={type};render();}
function openDialogue(speaker,text,choices){modal={type:'dialogue'};dialogue={speaker,text,choices};render();}
function closeModal(){modal=null;dialogue=null;render();}
function modalFrame(title,body,wide=false){
  return '<div class="shade"><section class="modal '+(wide?'wide':'')+'" role="dialog" aria-modal="true" aria-label="'+e(title)+'"><div class="modal-head"><h2>'+e(title)+'</h2><button class="icon-button" data-action="close" aria-label="Cerrar">'+icon('close')+'</button></div>'+body+'</section></div>';
}
function choice(text,action,id='',number=1){return '<button class="choice" data-action="'+action+'"'+(id!==''?' data-id="'+id+'"':'')+'><span class="choice-number">0'+number+'</span>'+text+'</button>';}
function renderModal(){
  if(!modal)return;
  let body='',title='',wide=false;
  if(modal.type==='dialogue'){
    title=dialogue.speaker;
    body='<p class="typed" data-typed>'+e(dialogue.text)+'</p><div class="choice-list">'+dialogue.choices.map((c,i)=>choice(c.text,c.action,c.id??'',i+1)).join('')+'</div>';
  }else if(modal.type==='inventory'){
    title='Tus pertenencias';body=Object.entries(ITEMS).map(([id,item])=>'<div class="inventory-row">'+icon(item.sprite)+'<div class="item-detail"><b>'+item.name+' · '+(game.inventory[id]||0)+'</b><small>'+item.description+'</small></div><button data-action="use-item" data-id="'+id+'" '+(!game.inventory[id]||(id==='tobacco'&&game.habit!=='tobacco')?'disabled':'')+'>Usar</button></div>').join('')+'<p><small>En combate, utilizar un objeto consume tu acción del turno.</small></p>';
  }else if(modal.type==='map'){
    title='Caminos del Wasgau';wide=true;
    body='<div class="map-art"><svg viewBox="0 0 600 380" aria-hidden="true"><path d="M-30 280Q100 220 170 250T370 145T630 70" fill="none" stroke="#90ac9f" stroke-width="22"/><path d="M20 310Q140 300 260 130T560 170" fill="none" stroke="#c6b488" stroke-width="5" stroke-dasharray="5 6"/><path d="M-10 80Q100 25 190 80T420 35T650 20M-5 100Q110 45 200 100T420 55T650 40M-10 330Q100 260 240 330T480 300T650 350" fill="none" stroke="#9eac7c" stroke-width="1" opacity=".4"/></svg>'+
    [['clinic',22,67],['refuge',53,36],['trail',80,61]].map(([id,x,y])=>'<button class="map-node '+(game.location===id?'current':'')+'" style="left:'+x+'%;top:'+y+'%" data-action="travel" data-id="'+id+'">'+LOCATIONS[id].name+'<small>'+(game.location===id?'Estás aquí':id==='clinic'||game.location==='clinic'?'45 minutos':'1 h 30 min')+'</small></button>').join('')+'</div><p class="map-key">Cada desplazamiento consume tiempo del mundo. Las personas y sus plazos siguen avanzando durante el viaje.</p>';
  }else if(modal.type==='journal'){
    title='Lo que sabes';body=game.journal.slice().reverse().map(j=>'<article class="journal-entry"><small>'+e(Engine.timeLabel({...game,worldSeconds:j.at}).clock)+' · '+e(Engine.timeLabel({...game,worldSeconds:j.at}).date)+'</small><p>'+e(j.text)+'</p></article>').join('');
  }else if(modal.type==='party'){
    title='Tu equipo';body='<div class="party-row">'+sprite(person().sprite)+'<div><h3>'+person().name+'</h3><p>'+e(game.background)+'</p><small>Vigor '+Math.round(game.health)+' / '+game.maxHealth+' · Poder aún latente</small></div></div>'+statList(game.stats)+
    (game.courier.status==='rescued'?'<div class="party-row">'+sprite(10)+'<div><h3>Greta Vogel</h3><p>'+(game.courier.injured?'Necesita cuidados.':'Conoce los senderos y ayuda a llevar carga.')+'</p><small>'+(game.courier.trust<0?'Conserva sus reservas sobre ti.':'Confía en tu ayuda.')+'</small></div></div>':'<p>'+(game.courier.status==='dead'?'Greta no podrá incorporarse a tu grupo.':'Todavía no tienes compañeros. Encontrarlos depende de lo que hagas y de cuándo llegues.')+'</p>');
  }else if(modal.type==='rest'){
    title='El tiempo que necesitas';body='<p>Dormir recupera vigor y descanso. Los acontecimientos continúan durante el sueño.</p><div class="choice-list">'+choice('Descansar dos horas','sleep','2',1)+choice('Dormir ocho horas','sleep','8',2)+choice('Esperar cuatro horas','wait','4',3)+choice('Esperar hasta el día siguiente','wait','24',4)+'</div>';
  }else if(modal.type==='settings'){
    title='Ajustes';body='<div class="settings-row"><span>Sonidos de interacción</span><button class="secondary" data-action="sound">'+(soundEnabled?'Activados':'Desactivados')+'</button></div><p><small>El tiempo se pausa mientras lees, gestionas menús o dejas la aplicación en segundo plano.</small></p>'+
    (game?'<button class="secondary" data-action="export">'+icon('export')+'Exportar partida</button><button class="secondary" data-action="import">'+icon('import')+'Importar partida</button><button class="secondary" data-action="home">'+icon('home')+'Volver al inicio</button>':'<button class="secondary" data-action="import">'+icon('import')+'Importar partida</button>');
  }else if(modal.type==='ending'){
    const ending=Engine.chapterEnding(game);title='Primera aventura';body='<div class="ending"><div class="ending-symbol">✦</div><p class="eyebrow">UN LUGAR DONDE QUEDARSE</p><h2>'+e(ending.title)+'</h2><p>'+e(ending.text)+'</p><p class="consequence">'+e(ending.consequence)+'</p><button class="primary" data-action="finish">'+icon('home')+'Volver al refugio</button><button class="secondary" data-action="export">'+icon('export')+'Conservar esta partida</button></div>';
  }else if(modal.type==='combat-team'){
    title='Órdenes del equipo';body='<p>'+(game.companionActive?'Greta está contigo. Puede cubrirte mientras te preparas para el siguiente golpe.':'Puedes dedicar tu turno a cubrirte y reducir el siguiente impacto.')+'</p>'+choice('Cubrirse este turno','guard','',1);
  }else if(modal.type==='new-confirm'){
    title='Otra historia';body='<p>Empezar una partida nueva sustituirá el guardado de este dispositivo. Puedes exportarlo antes.</p><button class="secondary" data-action="export">Exportar la partida actual</button><button class="primary" data-action="new-confirmed">Empezar otra historia</button>';
  }else if(modal.type==='fallen'){
    title='El camino termina aquí';body='<p>Has caído. Puedes recuperar el último guardado o comenzar otra historia.</p><button class="primary" data-action="continue">Cargar partida</button><button class="secondary" data-action="new">Comenzar de nuevo</button>';
  }
  root.insertAdjacentHTML('beforeend',modalFrame(title,body,wide));
}
function typeText(){
  const target=root.querySelector('[data-typed]');
  if(!target)return;
  const text=target.textContent;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  target.textContent='';let index=0;
  target.dataset.complete=text;
  typingTimer=setInterval(()=>{index=Math.min(text.length,index+2);target.textContent=text.slice(0,index);if(index===text.length)clearInterval(typingTimer);},20);
}
function finishTyping(){const p=root.querySelector('[data-typed]');if(p){clearInterval(typingTimer);p.textContent=p.dataset.complete||p.textContent;}}
function showMessages(){const latest=game.messages.at(-1);if(latest&&(game.messages.length>seenMessages||latest!==lastMessage))notify(latest);seenMessages=game.messages.length;lastMessage=latest;}
function afterAction(){save();showMessages();if(game.health<=0)modal={type:'fallen'};render();}
function loadSaved(){
  const raw=savedRaw();if(!raw){notify('Todavía no hay una partida guardada.');return;}
  try{game=Engine.restoreGame(raw);screen='world';modal=null;seenMessages=game.messages.length;paused=false;render();notify('Partida recuperada.');}
  catch(err){notify(err.message);}
}
function startNew(){game=null;selected='fritz';answers=[];quizIndex=0;screen='characters';modal=null;paused=false;render();}
function exportGame(){
  if(!game){const raw=savedRaw();if(raw)try{game=Engine.restoreGame(raw);}catch{}}
  if(!game){notify('No hay una partida para exportar.');return;}
  const blob=new Blob([Engine.serializeGame(game)],{type:'application/json'});
  const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download='Heroes_alemanes_'+game.characterId+'.json';link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1000);
}
function hanne(){
  const text=game.courier.status==='dead'?'Ernst no ha vuelto solo. Greta conocía estos caminos desde niña. Hay una carta entre sus pertenencias, dirigida al doctor Hartmann.':game.courier.status==='rescued'?(game.courier.trust<0?'Greta me ha contado cómo volvisteis. Ha sobrevivido, pero eso no significa que todo esté resuelto.':'Ya hay un plato más en la mesa. Has hecho algo por una de los nuestros. Esas cosas importan aquí.'):'Greta salió con una carta para el doctor. Debería haber regresado. El sendero del arroyo puede ser traicionero; si está herida, pasar la noche allí será muy peligroso.';
  openDialogue('Hanne Dietrich',(game.stealth?'Puedes dejar de esconderte dentro de casa. ':'')+text,[{text:'Iré a buscarla.',action:'accept'},{text:'Necesito saber cómo puedo quedarme aquí.',action:'housing-talk'},{text:'Gracias. Voy a pensarlo.',action:'close'}]);
}
function encounter(){
  openDialogue('Un hombre en el sendero','Un hombre se aparta de un árbol y apoya el garrote contra el hombro. «Por aquí no se pasa sin hablar conmigo».',[{text:game.voice==='loud'?'Hablar alto y pedirle que explique qué quiere.':'Preguntarle qué quiere.',action:'negotiate'},{text:'Intentar rodearlo en sigilo.',action:'bypass'},{text:'Prepararme para luchar.',action:'fight'},{text:'Volver al refugio.',action:'travel',id:'refuge'}]);
}
function findGreta(){
  if(game.ambush==='pending'){encounter();return;}
  Engine.advanceTime(game,(game.stats.perception>=6?30:45)*60);
  if(game.courier.status==='rescued'){notify('Greta ya está a salvo.');afterAction();return;}
  if(game.courier.status==='dead'){
    Engine.rescueCourier(game);
    openDialogue('El sendero del arroyo','Encuentras el bolso junto a unas raíces. Greta yace inmóvil a pocos pasos. Dentro del bolso hay una carta para Hartmann. Llegaste demasiado tarde.',[{text:'Regresar y contar lo ocurrido.',action:'travel',id:'refuge'}]);
  }else{
    const late=game.worldSeconds>=8*3600;
    openDialogue('Greta Vogel',late?'Greta está apoyada contra una roca. Tiene la ropa ensangrentada y apenas consigue incorporarse. «Creía que nadie iba a venir». Necesita un vendaje antes de moverse.':'Una voz responde desde la orilla. Greta tiene el tobillo atrapado entre las raíces, pero puede hablar. «No tires de golpe. Dame una mano».',[
      {text:'Ayudarla y tratar sus heridas.',action:'rescue',id:'care'},
      {text:'Ayudarla, exigiendo que después trabaje para mí.',action:'rescue',id:'threaten'},
      {text:'Volver más tarde.',action:'close'}
    ]);
  }
  save();
}

root.addEventListener('click',async event=>{
  if(event.target.closest('[data-typed]')){finishTyping();return;}
  const button=event.target.closest('[data-action]');if(!button||button.disabled||busy)return;
  const action=button.dataset.action,id=button.dataset.id;
  sound();
  try{
    if(action==='new'){if(savedRaw()){modal={type:'new-confirm'};render();}else startNew();}
    else if(action==='new-confirmed')startNew();
    else if(action==='home'){save();screen='home';modal=null;render();}
    else if(action==='continue')loadSaved();
    else if(action==='select'){selected=id;render();}
    else if(action==='begin'){screen='intro';answers=[];quizIndex=0;render();}
    else if(action==='quiz'){screen='quiz';render();}
    else if(action==='answer'){answers[quizIndex]=Number(id);quizIndex++;screen=quizIndex>=QUESTIONS.length?'summary':'quiz';render();}
    else if(action==='review'){screen='quiz';quizIndex=0;render();}
    else if(action==='enter'){game=Engine.createGame(selected,answers);Engine.advanceTime(game,3600);screen='world';seenMessages=0;Engine.acceptCourier(game);save();render();hanne();}
    else if(action==='close')closeModal();
    else if(action==='settings')openModal('settings');
    else if(action==='sound'){soundEnabled=!soundEnabled;render();}
    else if(action==='save')save(true);
    else if(action==='export')exportGame();
    else if(action==='import')document.querySelector('#import-file').click();
    else if(['inventory','map','party','journal','rest','combat-team'].includes(action))openModal(action);
    else if(action==='pause'){paused=!paused;render();notify(paused?'El tiempo está pausado.':'El tiempo vuelve a avanzar.');}
    else if(action==='stealth'){game.stealth=!game.stealth;save();render();}
    else if(action==='voice'){game.voice=({quiet:'normal',normal:'loud',loud:'quiet'}[game.voice]);save();render();}
    else if(action==='hanne')hanne();
    else if(action==='accept'){Engine.acceptCourier(game);modal=null;dialogue=null;afterAction();}
    else if(action==='housing-talk')openDialogue('Hanne Dietrich',game.housing.room?'La habitación es tuya mientras contribuyas. Ernst agradece tener ayuda para mantener la finca.':'Aquí todos aportamos algo. Ayuda en el mantenimiento y podremos prepararte una habitación. Ernst te enseñará por dónde empezar.',[{text:'Entendido.',action:'close'}]);
    else if(action==='work'){Engine.work(game);modal=null;afterAction();}
    else if(action==='sleep'){Engine.rest(game,Number(id));modal=null;afterAction();}
    else if(action==='wait'){Engine.wait(game,Number(id));modal=null;afterAction();}
    else if(action==='wash'){Engine.wash(game);afterAction();}
    else if(action==='heal'){if(!Engine.healAtClinic(game))notify('Necesitas dos marcos para esta atención.');afterAction();}
    else if(action==='doctor')openDialogue('Doctor Felix Baumann','La recuperación necesita descanso, comida y paciencia. Hartmann podrá explicarte más sobre su trabajo cuando te encuentres mejor. Si Greta está herida, tráela antes de volver al bosque.',[{text:'Solicitar atención médica por dos marcos.',action:'heal'},{text:'Me quedaré con eso.',action:'close'}]);
    else if(action==='travel'){Engine.travel(game,id);modal=null;dialogue=null;afterAction();if(id==='trail'&&game.ambush==='pending')encounter();}
    else if(action==='search')findGreta();
    else if(action==='inspect')openDialogue('El sendero','Hay pisadas junto al agua y fibras de una correa prendidas en un espino. Las rocas conservan el calor de la tarde. Aquí se puede escuchar antes de avanzar.',[{text:'Examinar las pisadas y buscar a Greta.',action:'search'},{text:'Continuar observando.',action:'close'}]);
    else if(action==='negotiate'){if(Engine.negotiate(game)){modal=null;afterAction();notify('Consigues que te deje pasar.');}else{modal=null;Engine.beginCombat(game);afterAction();}}
    else if(action==='bypass'){if(Engine.bypass(game)){modal=null;afterAction();notify('Pasas sin que advierta tu presencia.');}else notify('Necesitas sigilo activo y más agilidad y percepción para rodearlo.');}
    else if(action==='fight'){Engine.beginCombat(game);modal=null;afterAction();}
    else if(action==='rescue'){
      const result=Engine.rescueCourier(game,id);
      if(result==='needs_bandage'){notify('Te hace falta un vendaje limpio para estabilizarla.');return;}
      Engine.travel(game,'refuge');modal=null;afterAction();
      openDialogue('Greta Vogel',result==='dead'?'La noche llegó antes que tu ayuda.':id==='threaten'?'Te he oído. Necesito llegar a la casa. Ya hablaremos de tus condiciones.':result==='injured'?'Gracias. Tendrás que ayudarme a llegar hasta Baumann. La carta… no la pierdas.':'Creía que conocía todos los caminos. Mañana te enseñaré uno menos traicionero. Gracias por venir.',[{text:'Volver a la vida del refugio.',action:'close'}]);
    }
    else if(action==='ask-companion'){
      const text=game.courier.status==='rescued'?game.courier.injured?'Greta necesita atención médica antes de volver a salir.':game.location==='trail'?'Las raíces junto al arroyo parecen firmes, pero algunas descansan sobre huecos. Sigue la tierra seca.':'Ernst conoce esta finca mejor que nadie. Si quieres quedarte, empieza por hablar con Hanne.':game.courier.status==='dead'?'La persona que podía enseñarte esos caminos ha muerto.':'Todavía no viaja nadie contigo.';
      openDialogue(game.courier.status==='rescued'?'Greta Vogel':'Tu equipo',text,[{text:'Entendido.',action:'close'}]);
    }
    else if(action==='use-item'){if(Engine.useItem(game,id,!!game.combat)){afterAction();}else notify('No puedes usar ese objeto ahora.');}
    else if(action==='attack'){
      busy=true;root.querySelectorAll('.battle-controls button').forEach(button=>button.disabled=true);root.querySelector('#player-fighter')?.classList.add('attack');const result=Engine.combatAttack(game);
      await new Promise(r=>setTimeout(r,350));busy=false;afterAction();
      if(result==='victory')openDialogue('El hombre del sendero','Ha dejado caer el garrote. Mantiene las manos a la vista y espera tu decisión.',[{text:'Dejar que se marche.',action:'spare'},{text:'Matarlo.',action:'kill'}]);
    }
    else if(action==='guard'){Engine.combatGuard(game);modal=null;afterAction();}
    else if(action==='flee'){Engine.combatFlee(game);modal=null;afterAction();}
    else if(action==='spare'||action==='kill'){Engine.spareEnemy(game,action==='kill');modal=null;afterAction();}
    else if(action==='ending'){if(Engine.chapterEnding(game))openModal('ending');}
    else if(action==='finish'){game.chapterClosed=true;save();modal=null;render();}
  }catch(err){busy=false;notify(err.message||'No se ha podido completar la acción.');}
});

document.querySelector('#import-file').addEventListener('change',async event=>{
  const file=event.target.files?.[0];if(!file)return;
  try{
    if(file.size>1024*1024)throw new Error('El archivo de partida es demasiado grande.');
    const restored=Engine.restoreGame(await file.text());
    game=restored;screen='world';modal=null;seenMessages=game.messages.length;save();render();notify('Partida importada.');
  }catch(err){notify(err.message);}
  event.target.value='';
});
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&modal)closeModal();
  else if(event.code==='Space'){event.preventDefault();if(root.querySelector('[data-typed]'))finishTyping();else if(game&&screen==='world'){paused=!paused;render();}}
});
document.addEventListener('visibilitychange',()=>{lastFrame=performance.now();if(document.hidden)save();});
window.addEventListener('pagehide',()=>save());
function updateHud(){
  if(!game||screen!=='world')return;
  const time=Engine.timeLabel(game);
  root.querySelector('[data-clock]')?.replaceChildren(document.createTextNode(time.clock));
  root.querySelector('[data-date]')?.replaceChildren(document.createTextNode(time.date));
  for(const [id,value]of Object.entries({...game.needs,health:game.health})){
    const bar=root.querySelector('[data-need-bar="'+id+'"]'),label=root.querySelector('[data-need-value="'+id+'"]');
    if(bar){const fraction=value/(id==='health'?game.maxHealth:100);bar.style.width=(fraction*100)+'%';bar.style.background=fraction<.25?'#bf7857':'';}
    if(label)label.textContent=Math.round(value);
  }
}
function loop(now){
  const delta=Math.min((now-lastFrame)/1000,2);lastFrame=now;
  if(game&&screen==='world'&&!document.hidden&&!modal&&!paused&&!game.combat&&!busy){
    const status=game.courier.status,returned=game.flags.bodyReturned;
    Engine.tickWorld(game,delta);updateHud();saveElapsed+=delta;
    if(status!==game.courier.status||returned!==game.flags.bodyReturned){render();showMessages();}
    if(game.health<=0){modal={type:'fallen'};render();}
    if(saveElapsed>=5){save();saveElapsed=0;}
  }
  requestAnimationFrame(loop);
}
render();requestAnimationFrame(loop);
