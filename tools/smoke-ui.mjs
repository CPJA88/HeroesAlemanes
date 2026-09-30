import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require(require.resolve('playwright',{paths:[process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||process.cwd()]}));
const out=new URL('../artifacts/',import.meta.url);
await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const errors=[];
try{
  for(const [label,viewport]of [['desktop',{width:1440,height:900}],['mobile',{width:430,height:932}]]){
    const context=await browser.newContext({viewport,deviceScaleFactor:1});
    const page=await context.newPage();
    page.on('pageerror',error=>errors.push(label+': '+error.message));
    page.on('console',message=>{if(message.type()==='error')errors.push(label+': '+message.text());});
    await page.goto('http://localhost:4173',{waitUntil:'networkidle'});
    await page.screenshot({path:new URL(label+'-inicio.png',out).pathname});
    await page.getByRole('button',{name:'Comenzar',exact:true}).click();
    assert.equal(await page.locator('.character-card').count(),8);
    await page.screenshot({path:new URL(label+'-personajes.png',out).pathname});
    await page.locator('[data-action="select"][data-id="lucia"]').click();
    await page.locator('[data-action="begin"]').click();
    await page.locator('[data-action="quiz"]').click();
    for(let i=0;i<8;i++)await page.locator('[data-action="answer"]').first().click();
    assert.match(await page.locator('.summary').innerText(),/Tu punto de partida/);
    await page.screenshot({path:new URL(label+'-atributos.png',out).pathname});
    await page.locator('[data-action="enter"]').click();
    await page.locator('[data-action="accept"]').click();
    await page.screenshot({path:new URL(label+'-refugio.png',out).pathname});
    await page.locator('[data-action="inventory"]').click();
    const pausedAt=await page.evaluate(()=>JSON.parse(localStorage.getItem('heroes-alemanes-rpg-v1')).state.worldSeconds);
    await page.waitForTimeout(1100);
    await page.locator('[data-action="close"]').click();
    const pausedAfter=await page.evaluate(()=>JSON.parse(localStorage.getItem('heroes-alemanes-rpg-v1')).state.worldSeconds);
    assert.equal(pausedAt,pausedAfter);
    await page.locator('[data-action="map"]').click();
    await page.locator('[data-action="travel"][data-id="trail"]').click();
    await page.locator('[data-action="fight"]').click();
    await page.screenshot({path:new URL(label+'-combate.png',out).pathname});
    for(let n=0;n<5;n++){
      if(await page.locator('[data-action="spare"]').count())break;
      await page.locator('[data-action="attack"]').click();
      await page.waitForTimeout(400);
    }
    await page.locator('[data-action="spare"]').click();
    await page.locator('[data-action="search"]').click();
    await page.locator('[data-action="rescue"][data-id="care"]').click();
    await page.locator('[data-action="close"]').click();
    await page.getByRole('button',{name:'Guardar',exact:true}).click();
    const s=await page.evaluate(()=>JSON.parse(localStorage.getItem('heroes-alemanes-rpg-v1')).state);
    assert.equal(s.characterId,'lucia');assert.equal(s.courier.status,'rescued');assert.equal(s.courier.injured,false);
    assert.ok(s.morality>=12);
    await page.locator('[data-action="ending"]').click();
    await page.screenshot({path:new URL(label+'-cierre.png',out).pathname});
    assert.match(await page.locator('.ending').innerText(),/La puerta abierta/);
    await page.reload({waitUntil:'networkidle'});
    await page.getByRole('button',{name:'Continuar partida',exact:true}).click();
    assert.match(await page.locator('.quest-note').innerText(),/regresado contigo/);
    const width=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:innerWidth}));
    assert.ok(width.scroll<=width.viewport,label+' tiene desbordamiento horizontal');
    console.log(label+': inicio, ocho personajes, cuestionario, pausa, combate, rescate y carga verificados');
    await context.close();
  }
  assert.deepEqual(errors,[]);
  console.log('Sin errores de ejecución en el navegador.');
}finally{await browser.close();}
