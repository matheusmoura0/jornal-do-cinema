const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const {fork}=require('node:child_process');
const {mkdir}=require('node:fs/promises');
(async () => {
  await mkdir('/app/review-output',{recursive:true});
  const server=fork('/app/scripts/preview-vps.mjs');
  let browser;
  try {
    for(let i=0;i<30;i++){try{if((await fetch('http://127.0.0.1:3210/contato')).ok)break;}catch{}await new Promise(resolve=>setTimeout(resolve,200));}
    browser=await chromium.launch({headless:true,args:['--no-sandbox']});
    for(const width of [1440,768,390,320]) {
      const page=await browser.newPage({viewport:{width,height:900}});
      const errors=[];page.on('pageerror',error=>errors.push(error.message));
      await page.goto('http://127.0.0.1:3210/cineclube',{waitUntil:'networkidle'});
      assert.equal(await page.locator('[data-question]:visible').count(),1);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
      await page.screenshot({path:`/app/review-output/cineclube-${width}.png`,fullPage:true});
      await page.getByRole('button',{name:'Conferir resposta'}).click();
      assert.match(await page.locator('[data-quiz-feedback]').innerText(),/Selecione uma resposta/);
      const answers=[1,2,0,1,0,2,1,2];
      for(let i=0;i<8;i++) {
        await page.locator(`[name="q${i}"][value="${answers[i]}"]`).check();
        await page.getByRole('button',{name:'Conferir resposta'}).click();
        assert.match(await page.locator('[data-quiz-feedback]').innerText(),/Acertou/);
        await page.getByRole('button',{name:i===7?'Ver resultado':'Próxima pergunta'}).click();
      }
      assert.match(await page.locator('[data-quiz-feedback]').innerText(),/8 de 8/);
      await page.getByRole('button',{name:'Jogar novamente'}).click();
      await page.locator('[name=q0][value="0"]').check();
      await page.getByRole('button',{name:'Conferir resposta'}).click();
      assert.match(await page.locator('[data-quiz-feedback]').innerText(),/Resposta:/);
      await page.getByLabel('Encontrar um termo').fill('camera');
      assert.equal(await page.locator('.glossary-term:visible').count(),1);
      await page.getByLabel('Encontrar um termo').fill('zzzz');
      assert.equal(await page.locator('[data-glossary-empty]').isVisible(),true);
      await page.getByLabel('Encontrar um termo').fill('');
      assert.equal(await page.locator('.glossary-term:visible').count(),12);
      await page.goto('http://127.0.0.1:3210/guias/como-ler-uma-critica',{waitUntil:'networkidle'});
      await page.getByRole('button',{name:'Salvar leitura'}).click();
      assert.equal(await page.getByRole('button',{name:'Leitura salva'}).getAttribute('aria-pressed'),'true');
      await page.getByRole('link',{name:'Minhas leituras',exact:true}).click();
      assert.equal(await page.locator('.saved-list li').count(),1);
      await page.reload({waitUntil:'networkidle'});
      assert.equal(await page.locator('.saved-list li').count(),1);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
      await page.screenshot({path:`/app/review-output/saved-${width}.png`,fullPage:true});
      await page.getByRole('button',{name:/Remover:/}).click();
      assert.match(await page.locator('[data-saved-list]').innerText(),/Nenhuma leitura salva/);
      assert.deepEqual(errors,[]);
      await page.close();console.log(`PASS quiz, glossary, saved reading and layout: ${width}px`);
    }
    const nojs=await browser.newPage({javaScriptEnabled:false});
    await nojs.goto('http://127.0.0.1:3210/cineclube');
    assert.equal(await nojs.locator('noscript details').count(),8);
    await nojs.getByLabel('Encontrar um termo').fill('camera');
    await nojs.getByRole('button',{name:'Buscar',exact:true}).click();
    await nojs.waitForURL(/termo=camera/);
    assert.equal(await nojs.locator('.glossary-term:visible').count(),1);
    const blocked=await browser.newContext();
    await blocked.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new Error('Storage unavailable');}}));
    const page=await blocked.newPage();
    await page.goto('http://127.0.0.1:3210/guias/como-ler-uma-critica');
    await page.getByRole('button',{name:'Salvar leitura'}).click();
    assert.match(await page.locator('.reader-status').innerText(),/Não foi possível salvar/);
    console.log('PASS no-JavaScript content/search and blocked storage handling');
  } finally {await browser?.close();server.kill();}
})().catch(error=>{console.error(error);process.exitCode=1;});
