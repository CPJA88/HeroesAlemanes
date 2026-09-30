import test from 'node:test';
import assert from 'node:assert/strict';
import {CHARACTERS,QUESTIONS} from '../public/data.js';
import * as E from '../public/engine.js';
const game=()=>E.createGame('fritz',Array(QUESTIONS.length).fill(0));

test('Las ocho apariencias conservan las aptitudes del mismo cuestionario',()=>{
  const results=CHARACTERS.map(c=>E.createGame(c.id,Array(8).fill(0)));
  for(const s of results){
    assert.deepEqual(s.stats,results[0].stats);
    assert.equal(Object.values(s.stats).reduce((a,b)=>a+b,0),37);
  }
  assert.equal(new Set(results.map(s=>s.characterId)).size,8);
});
test('Cuestionarios distintos crean aptitudes y hábitos distintos',()=>{
  const a=E.questionnaireResult(Array(8).fill(0)),b=E.questionnaireResult(Array(8).fill(3));
  assert.notDeepEqual(a.stats,b.stats);
  assert.equal(a.habit,'tobacco');assert.equal(b.habit,null);
  assert.throws(()=>E.questionnaireResult([0,0]),/incompleto/);
});
test('Leer o gestionar en pausa no consume tiempo ni necesidades',()=>{
  const s=game(),before=E.serializeGame(s);
  E.tickWorld(s,120,true);
  assert.equal(E.serializeGame(s),before);
});
test('Una actividad larga resuelve muerte y llegada del cadáver en orden',()=>{
  const s=game();E.acceptCourier(s);E.advanceTime(s,20*3600);
  assert.equal(s.courier.status,'dead');
  assert.equal(s.flags.bodyReturned,true);
  assert.equal(s.journal.find(j=>j.id==='greta_body').at,18*3600);
});
test('Rescatar temprano conserva al compañero al pasar sus antiguos plazos',()=>{
  const s=game();E.advanceTime(s,3*3600);
  assert.equal(E.rescueCourier(s),'healthy');
  E.advanceTime(s,20*3600);
  assert.equal(s.courier.status,'rescued');
  assert.equal(s.companionActive,true);
  assert.equal(s.flags.bodyReturned,undefined);
});
test('El rescate tardío exige material y después necesita atención médica',()=>{
  const s=game();E.advanceTime(s,9*3600);s.inventory.bandage=0;
  assert.equal(E.rescueCourier(s,'threaten'),'needs_bandage');
  assert.equal(s.courier.status,'missing');
  s.inventory.bandage=1;
  assert.equal(E.rescueCourier(s),'injured');
  assert.equal(s.companionActive,false);
  assert.equal(E.healAtClinic(s),true);
  assert.equal(s.companionActive,true);
  assert.equal(s.courier.injured,false);
});
test('Una muerte no se revierte al encontrar después al personaje',()=>{
  const s=game();E.advanceTime(s,17*3600);
  assert.equal(E.rescueCourier(s),'dead');
  assert.equal(s.courier.status,'dead');
  assert.equal(s.companionActive,false);
  assert.equal(E.chapterEnding(s).kind,'loss');
});
test('La coacción cambia la confianza y el cierre de la primera aventura',()=>{
  const s=game();E.rescueCourier(s,'threaten');
  assert.equal(s.courier.trust,-2);
  assert.equal(E.chapterEnding(s).kind,'dark');
  const before=s.morality;E.moralAct(s,'greta_coercion',-12,'Duplicado');
  assert.equal(s.morality,before);
});
test('La preparación altera la iniciativa y los objetos consumen turno',()=>{
  const a=game(),b=game();b.stealth=true;
  E.beginCombat(a);E.beginCombat(b);
  assert.equal(b.health-a.health,8);
  const hp=b.health,world=b.worldSeconds;
  assert.equal(E.useItem(b,'water',true),true);
  assert.ok(b.health<hp);assert.equal(b.worldSeconds-world,20);
});
test('Hablar alto o bajo puede cambiar la negociación del sendero',()=>{
  const a=game(),b=game();
  a.stats.social=5;b.stats.social=5;a.coins=0;b.coins=0;
  a.voice='loud';b.voice='quiet';
  assert.equal(E.negotiate(a),true);assert.equal(E.negotiate(b),false);
});
test('Una partida conserva pérdidas, calendario y vínculos al recuperar',()=>{
  const s=game();E.advanceTime(s,9*3600);E.rescueCourier(s,'threaten');E.work(s);
  const restored=E.restoreGame(E.serializeGame(s));
  assert.deepEqual(restored,s);
  assert.equal(restored.courier.injured,true);
});
test('La carga rechaza versiones, tiempos y recursos corruptos',()=>{
  const s=game();
  assert.throws(()=>E.restoreGame('no es JSON'));
  assert.throws(()=>E.restoreGame(JSON.stringify({schema:999,state:s})));
  for(const change of [
    x=>x.worldSeconds=-1,x=>x.worldSeconds=1e300,x=>x.health=-4,
    x=>x.maxHealth=NaN,x=>x.inventory.bandage=-1,x=>x.stats.force=99
  ]){
    const corrupted=structuredClone(s);change(corrupted);
    assert.throws(()=>E.restoreGame(JSON.stringify({schema:1,state:corrupted})));
  }
  assert.throws(()=>E.advanceTime(s,1e300));
});
