import {CHARACTERS, QUESTIONS, SAVE_SCHEMA, START_DATE, WORLD_RATE, COURIER_HURT_TIME, COURIER_DEATH_TIME, COURIER_RETURN_TIME} from './data.js';

export const blankStats=()=>({force:3,agility:3,endurance:3,perception:3,intellect:3,will:3,social:3});
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
export function questionnaireResult(answers){
  if(!Array.isArray(answers)||answers.length!==QUESTIONS.length)throw new Error('El cuestionario está incompleto.');
  const stats=blankStats();let background='';let habit=null;
  for(let i=0;i<QUESTIONS.length;i++){
    const answer=QUESTIONS[i].answers[answers[i]];
    if(!answer)throw new Error('Hay una respuesta inválida.');
    for(const [key,value]of Object.entries(answer.points))stats[key]+=value;
    if(answer.background)background=answer.background;
    if('habit' in answer)habit=answer.habit;
  }
  return {stats,background,habit};
}

export function createGame(characterId,answers){
  if(!CHARACTERS.some(c=>c.id===characterId))throw new Error('Personaje desconocido.');
  const result=questionnaireResult(answers);
  const maxHealth=80+result.stats.endurance*6;
  return {
    schema:SAVE_SCHEMA,revision:0,characterId,answers:[...answers],...result,
    worldSeconds:0,location:'refuge',health:maxHealth,maxHealth,
    needs:{food:85,water:85,energy:85,hygiene:80,withdrawal:0},
    inventory:{ration:3,water:3,bandage:2,tobacco:result.habit?3:0},coins:8,
    morality:0,moralMemory:[],stealth:false,voice:'normal',power:'latent',
    courier:{status:'missing',known:false,stabilized:false,injured:false,trust:0},
    companionActive:false,ambush:'pending',combat:null,housing:{work:0,room:false},
    journal:[{id:'awakening',text:'Baumann te ha atendido. El doctor Hartmann te ofrece una estancia en su finca.',at:0}],
    messages:[],chapterClosed:false,rng:1729,flags:{}
  };
}

export function addJournal(s,id,text){
  if(s.journal.some(e=>e.id===id))return;
  s.journal.push({id,text,at:s.worldSeconds});
}
export function note(s,text){s.messages.push(text);if(s.messages.length>8)s.messages.shift();}
export function moralAct(s,id,amount,text){
  if(s.moralMemory.some(e=>e.id===id))return;
  s.moralMemory.push({id,amount,text,at:s.worldSeconds});
  s.morality=clamp(s.morality+amount,-100,100);
}
export function moralityName(s){return s.morality>=8?'Luz':s.morality<=-8?'Oscuridad':'En equilibrio';}

function applyNeeds(s,seconds){
  const h=seconds/3600;
  s.needs.food=clamp(s.needs.food-2*h,0,100);
  s.needs.water=clamp(s.needs.water-4*h,0,100);
  s.needs.energy=clamp(s.needs.energy-(s.location==='trail'?3:1.6)*h,0,100);
  s.needs.hygiene=clamp(s.needs.hygiene-h,0,100);
  if(s.habit==='tobacco')s.needs.withdrawal=clamp(s.needs.withdrawal+6*h,0,100);
  if(s.needs.water<=0||s.needs.food<=0)s.health=clamp(s.health-h*3,0,s.maxHealth);
}
function resolveTimeEvents(s){
  if(s.courier.status==='missing'&&!s.courier.stabilized){
    if(s.worldSeconds>=COURIER_HURT_TIME&&!s.flags.courierWorsened){
      s.flags.courierWorsened=true;
      if(s.courier.known)note(s,'La tarde avanza. Greta lleva demasiado tiempo fuera.');
    }
    if(s.worldSeconds>=COURIER_DEATH_TIME){
      s.courier.status='dead';
      s.companionActive=false;
      s.flags.courierDied=true;
    }
  }
  if(s.courier.status==='dead'&&s.worldSeconds>=COURIER_RETURN_TIME&&!s.flags.bodyReturned){
    s.flags.bodyReturned=true;
    s.courier.known=true;
    addJournal(s,'greta_body','Ernst ha traído el cadáver de Greta al refugio. Hanne esperaba verla regresar viva.');
    note(s,'Ernst vuelve a la finca con una carga cubierta. Greta no regresará.');
  }
}

// Cada salto resuelve sus umbrales en orden. Las necesidades usan segmentos acotados.
export function advanceTime(s,seconds){
  if(!Number.isFinite(seconds)||seconds<0||seconds>366*86400)throw new Error('Duración inválida.');
  const target=s.worldSeconds+seconds;
  while(s.worldSeconds<target){
    const nextEvent=[COURIER_HURT_TIME,COURIER_DEATH_TIME,COURIER_RETURN_TIME].find(t=>t>s.worldSeconds);
    const end=Math.min(target,s.worldSeconds+300,nextEvent??Infinity);
    applyNeeds(s,end-s.worldSeconds);s.worldSeconds=end;resolveTimeEvents(s);
  }
  resolveTimeEvents(s);s.revision++;
  return s;
}
export function tickWorld(s,realSeconds,paused=false){
  if(paused||s.health<=0)return s;
  return advanceTime(s,clamp(realSeconds,0,2)*WORLD_RATE);
}
export function timeLabel(s){
  const d=new Date(START_DATE+s.worldSeconds*1000);
  return {clock:String(d.getUTCHours()).padStart(2,'0')+':'+String(d.getUTCMinutes()).padStart(2,'0'),date:d.getUTCDate()+' OCT · '+d.getUTCFullYear()};
}
export function acceptCourier(s){
  s.courier.known=true;
  addJournal(s,'greta_missing','Greta salió por el sendero del arroyo y no ha regresado. Hanne teme que esté herida. La noche puede ser decisiva.');
}
export function travel(s,location){
  if(!['refuge','clinic','trail'].includes(location))throw new Error('Destino desconocido.');
  const from=s.location;
  if(from===location)return;
  const minutes=(from==='clinic'||location==='clinic')?45:90;
  advanceTime(s,minutes*60);s.location=location;
  note(s,({refuge:'Llegas a la finca.',clinic:'Llegas a la clínica.',trail:'Llegas al sendero del arroyo.'}[location]));
}
export function wait(s,hours){
  if(!Number.isFinite(hours)||hours<=0||hours>24)throw new Error('Espera inválida.');
  advanceTime(s,hours*3600);note(s,'Han pasado '+hours+' horas.');
}
export function rest(s,hours){
  advanceTime(s,hours*3600);
  s.needs.energy=clamp(s.needs.energy+hours*8,0,100);
  s.health=clamp(s.health+hours*3,0,s.maxHealth);
  note(s,'Descansas '+hours+' horas. El mundo ha seguido su curso.');
}
export function work(s){
  advanceTime(s,2*3600);s.coins+=3;s.housing.work++;
  if(s.housing.work>=3&&!s.housing.room){
    s.housing.room=true;
    addJournal(s,'own_room','Tu ayuda en la finca te ha ganado un espacio propio. Hanne te entrega la llave de una habitación.');
    note(s,'Hanne te entrega la llave de una habitación propia.');
  }else note(s,'Ayudas en el mantenimiento. Ganas tres marcos y experiencia en la finca.');
}
export function useItem(s,id,inCombat=false){
  if(!['ration','water','bandage','tobacco'].includes(id)||!s.inventory[id])return false;
  if(id==='tobacco'&&s.habit!=='tobacco')return false;
  s.inventory[id]--;
  if(id==='ration')s.needs.food=clamp(s.needs.food+35,0,100);
  if(id==='water')s.needs.water=clamp(s.needs.water+45,0,100);
  if(id==='bandage')s.health=clamp(s.health+28,0,s.maxHealth);
  if(id==='tobacco')s.needs.withdrawal=clamp(s.needs.withdrawal-65,0,100);
  advanceTime(s,inCombat?20:({ration:600,water:120,bandage:900,tobacco:300}[id]));
  if(inCombat&&s.combat)enemyTurn(s);
  return true;
}
export function wash(s){advanceTime(s,1200);s.needs.hygiene=100;note(s,'Te aseas y cambias los vendajes que lo necesitaban.');}
export function healAtClinic(s){
  if(s.coins<2)return false;
  s.coins-=2;advanceTime(s,1800);s.health=s.maxHealth;
  if(s.courier.status==='rescued'&&s.courier.injured){
    s.courier.injured=false;s.companionActive=true;
    addJournal(s,'greta_recovers','Baumann ha tratado las heridas de Greta. Puede acompañarte de nuevo.');
  }
  return true;
}

export function rescueCourier(s,method='care'){
  s.courier.known=true;
  if(s.courier.status==='dead'){
    addJournal(s,'greta_found_dead','Has encontrado a Greta demasiado tarde. Sus pertenencias conservan una carta dirigida a Hartmann.');
    s.flags.foundLetter=true;
    return 'dead';
  }
  if(s.courier.status==='rescued')return 'already';
  const late=s.worldSeconds>=COURIER_HURT_TIME;
  if(late&&!s.inventory.bandage)return 'needs_bandage';
  if((late||method==='care')&&s.inventory.bandage)s.inventory.bandage--;
  s.courier.stabilized=true;s.courier.status='rescued';s.courier.injured=late;
  s.courier.trust=method==='threaten'?-2:3;s.companionActive=!late;
  if(method==='threaten')moralAct(s,'greta_coercion',-12,'Exigiste obediencia a Greta a cambio de tu ayuda.');
  else moralAct(s,'greta_help',12,'Volviste para ayudar a Greta.');
  advanceTime(s,3600);
  addJournal(s,'greta_rescued',late?'Greta ha sobrevivido, pero necesita atención médica.':'Greta ha regresado contigo. Se ofrece a ayudarte a reconocer los caminos.');
  s.flags.foundLetter=true;
  addJournal(s,'letter','Greta llevaba una carta cerrada para Hartmann. Dice que no sabe qué contiene.');
  return late?'injured':'healthy';
}

function random(s){s.rng=(Math.imul(s.rng,1664525)+1013904223)>>>0;return s.rng/4294967296;}
export function beginCombat(s){
  if(s.ambush!=='pending')return false;
  s.combat={enemyHealth:42,enemyMax:42,guard:false,round:1,log:'El hombre del camino levanta su garrote.'};
  if(!s.stealth){s.health=clamp(s.health-8,0,s.maxHealth);s.combat.log='Te oyó acercarte. Su primer golpe te toma por sorpresa.';}
  return true;
}
function enemyTurn(s){
  if(!s.combat||s.combat.enemyHealth<=0)return;
  const damage=Math.max(3,10-Math.floor(s.stats.endurance/3)-(s.combat.guard?4:0));
  s.health=clamp(s.health-damage,0,s.maxHealth);
  s.combat.guard=false;s.combat.round++;
  s.combat.log='El hombre responde. Pierdes '+damage+' de vigor.';
  if(s.health<=0){s.combat=null;note(s,'Caes herido en el camino. Puedes recuperar un guardado anterior.');}
}
export function combatAttack(s){
  if(!s.combat)return null;
  const damage=8+s.stats.force+(s.companionActive?5:0);
  s.combat.enemyHealth=clamp(s.combat.enemyHealth-damage,0,s.combat.enemyMax);
  advanceTime(s,20);
  if(s.combat.enemyHealth<=0){s.combat.log='El hombre cae de rodillas. Ha dejado caer el garrote.';return 'victory';}
  enemyTurn(s);return 'turn';
}
export function combatGuard(s){
  if(!s.combat)return;
  s.combat.guard=true;advanceTime(s,20);enemyTurn(s);
}
export function combatFlee(s){
  if(!s.combat)return false;
  const ok=random(s)<0.45+s.stats.agility*0.04;
  advanceTime(s,20);
  if(ok){s.combat=null;s.location='refuge';note(s,'Logras volver al refugio. El hombre sigue en el sendero.');}
  else enemyTurn(s);
  return ok;
}
export function spareEnemy(s,kill=false){
  if(!s.combat||s.combat.enemyHealth>0)return false;
  s.combat=null;s.ambush='resolved';
  if(kill){
    moralAct(s,'assailant_killed',-18,'Mataste al hombre después de que dejara de luchar.');
    addJournal(s,'ambush','El hombre del sendero ha muerto a tus manos. El camino queda abierto.');
  }else{
    moralAct(s,'assailant_spared',8,'Permitiste que el hombre del camino se marchara.');
    addJournal(s,'ambush','El hombre ha prometido marcharse. El camino vuelve a estar libre.');
  }
  s.coins+=2;return true;
}
export function negotiate(s){
  advanceTime(s,600);
  const required=s.voice==='loud'?5:s.voice==='quiet'?7:6;
  if(s.stats.social>=required){s.ambush='resolved';moralAct(s,'talked_past',4,'Resolviste el enfrentamiento hablando.');addJournal(s,'ambush','El hombre aceptó dejarte pasar después de escucharte.');return true;}
  if(s.coins>=3){s.coins-=3;s.ambush='resolved';addJournal(s,'ambush','Entregaste tres marcos para pasar por el sendero.');return true;}
  return false;
}
export function bypass(s){
  if(!s.stealth||s.stats.agility+s.stats.perception<12)return false;
  advanceTime(s,1800);s.ambush='bypassed';addJournal(s,'ambush','Rodeaste al hombre del sendero sin que advirtiera tu presencia.');return true;
}

export function chapterEnding(s){
  if(s.courier.status==='missing')return null;
  const dark=s.morality<=-8;
  if(s.courier.status==='dead')return {
    title:'Lo que no alcanzaste',kind:'loss',
    text:'Hanne reconoce el bolso antes de que Ernst retire la manta. Habías encontrado un lugar donde quedarte; Greta nunca llegó a compartirlo contigo. En la mesa hay una carta para Hartmann. Su destinatario todavía ignora cómo ha vuelto.',
    consequence:'Greta ha muerto. La carta y las reacciones del refugio abren otro camino.'
  };
  if(dark)return{
    title:'El precio del amparo',kind:'dark',
    text:'Greta ha vuelto viva. Escucha tus condiciones sin darte la mano. Cuando Hanne sale de la habitación, guarda su bolso bajo la almohada. Tu ayuda ha creado una deuda; la confianza tendrá que esperar.',
    consequence:'Greta sobrevive. Sus heridas y su desconfianza acompañarán la siguiente etapa.'
  };
  return{
    title:s.courier.injured?'Todavía a tiempo':'La puerta abierta',kind:'light',
    text:s.courier.injured?'Baumann recibe a Greta al otro lado de la puerta. Durante el camino ha hablado poco, pero se niega a soltarte la manga hasta saber que vas a quedarte. Hay una recuperación por delante y una carta que entregar.':'Greta vuelve a recorrer el patio por su propio pie. Antes de entrar, te señala un sendero que no aparece en el mapa. «Mañana te lo enseñaré». Hanne sirve un plato más. La carta de Hartmann queda junto a los demás asuntos pendientes.',
    consequence:s.courier.injured?'Greta sobrevive herida. La atención médica modifica su disponibilidad.':'Greta sobrevive y puede acompañarte. Su conocimiento del bosque está disponible.'
  };
}

export function serializeGame(s){return JSON.stringify({schema:SAVE_SCHEMA,state:s});}
export function restoreGame(raw){
  let wrapper;try{wrapper=JSON.parse(raw);}catch{throw new Error('El archivo de partida no es válido.');}
  if(wrapper.schema!==SAVE_SCHEMA||!wrapper.state)throw new Error('Versión de partida incompatible.');
  const s=wrapper.state;
  if(!CHARACTERS.some(c=>c.id===s.characterId)||!Number.isFinite(s.worldSeconds)||s.worldSeconds<0||s.worldSeconds>20*366*86400||!['refuge','clinic','trail'].includes(s.location))throw new Error('La partida contiene datos incorrectos.');
  const result=questionnaireResult(s.answers);
  if(!s.stats||Object.keys(result.stats).some(k=>s.stats[k]!==result.stats[k]))throw new Error('Los atributos de la partida no son válidos.');
  if(!s.needs||['food','water','energy','hygiene','withdrawal'].some(k=>!Number.isFinite(s.needs[k])||s.needs[k]<0||s.needs[k]>100))throw new Error('Los estados de supervivencia no son válidos.');
  if(!['missing','rescued','dead'].includes(s.courier?.status)||!Array.isArray(s.journal)||!Array.isArray(s.moralMemory))throw new Error('Los datos narrativos no son válidos.');
  if(!s.inventory||Object.keys(s.inventory).some(k=>!['ration','water','bandage','tobacco'].includes(k)||!Number.isInteger(s.inventory[k])||s.inventory[k]<0))throw new Error('El inventario no es válido.');
  if(s.maxHealth!==80+result.stats.endurance*6||!Number.isFinite(s.health)||s.health<0||s.health>s.maxHealth||!Number.isFinite(s.coins)||s.coins<0)throw new Error('Los recursos de la partida no son válidos.');
  if(!Number.isFinite(s.morality)||s.morality<-100||s.morality>100||typeof s.stealth!=='boolean'||!['quiet','normal','loud'].includes(s.voice)||!Array.isArray(s.messages)||!s.flags||!s.housing)throw new Error('La continuidad de la partida no es válida.');
  if(s.combat&&(!Number.isFinite(s.combat.enemyHealth)||s.combat.enemyHealth<0||s.combat.enemyHealth>s.combat.enemyMax||s.combat.enemyMax!==42))throw new Error('El combate guardado no es válido.');
  return structuredClone(s);
}
