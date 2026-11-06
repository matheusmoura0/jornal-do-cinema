const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const {fork} = require('node:child_process');
const {mkdir} = require('node:fs/promises');
(async () => {
  await mkdir('/app/review-output',{recursive:true});
  const server = fork('/app/scripts/preview-vps.mjs');
  let browser;
  try {
    for (let i=0;i<30;i++) {
      try {if ((await fetch('http://127.0.0.1:3210/contato')).ok) break;} catch {}
      await new Promise(resolve => setTimeout(resolve,200));
    }
    browser = await chromium.launch({headless:true,args:['--no-sandbox']});
    for (const width of [1440,768,390,320]) {
      const page = await browser.newPage({viewport:{width,height:900}});
      await page.goto('http://127.0.0.1:3210/',{waitUntil:'networkidle'});
      assert.ok((await page.locator('.lead h1').innerText()).length>5);
      const sourceLink = await page.locator('a[href^="/correio/"]').first().getAttribute('href');
      assert.ok(sourceLink);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),true,`overflow ${width}`);
      await page.locator('main img').evaluateAll(nodes => nodes.forEach(node => {node.loading='eager';}));
      await page.waitForFunction(() => [...document.querySelectorAll('main img')].every(node => node.complete && node.naturalWidth>0),{},{timeout:30000});
      await page.screenshot({path:`/app/review-output/home-${width}.png`,fullPage:true});
      await page.screenshot({path:`/app/review-output/home-top-${width}.png`});
      const newsLinks=await page.locator('main a[href^="/correio/"],main a[href^="/materia/"]').evaluateAll(nodes => nodes.map(node => node.getAttribute('href')));
      assert.equal(new Set(newsLinks).size,newsLinks.length,'Stories should not repeat on homepage');
      const images = await page.locator('main img').evaluateAll(nodes => nodes.map(n => ({src:n.src,ok:n.complete && n.naturalWidth>0})));
      assert.ok(images.length>0);
      assert.ok(images.every(image => image.ok),JSON.stringify(images));
      if (width<700) {
        await page.getByRole('button',{name:'Abrir menu'}).click();
        assert.equal(await page.getByRole('button',{name:'Abrir menu'}).getAttribute('aria-expanded'),'true');
      }
      await page.goto('http://127.0.0.1:3210/materia/2333',{waitUntil:'networkidle'});
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),true,`article overflow ${width}`);
      await page.screenshot({path:`/app/review-output/article-${width}.png`,fullPage:true});
      await page.goto(`http://127.0.0.1:3210${sourceLink}`,{waitUntil:'networkidle'});
      assert.match(await page.locator('main').innerText(),/Publicado originalmente por Correio da Manhã/);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),true,`Correio article overflow ${width}`);
      await page.screenshot({path:`/app/review-output/correio-${width}.png`,fullPage:true});
      await page.goto('http://127.0.0.1:3210/guias/como-ler-uma-critica',{waitUntil:'networkidle'});
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),true,`guide overflow ${width}`);
      assert.match(await page.locator('main').innerText(),/revisão editorial: Matheus Moura/);
      await page.screenshot({path:`/app/review-output/guide-${width}.png`,fullPage:true});
      await page.goto('http://127.0.0.1:3210/privacidade',{waitUntil:'networkidle'});
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),true,`privacy overflow ${width}`);
      assert.equal((await page.context().cookies()).length,0);
      await page.close();
      console.log(`PASS layout, article, images and privacy: ${width}px`);
    }
    const nojs = await browser.newPage({javaScriptEnabled:false});
    await nojs.goto('http://127.0.0.1:3210/');
    await nojs.getByLabel('Pesquisar no jornal').fill('Coixet');
    await nojs.getByRole('button',{name:'Buscar',exact:true}).click();
    await nojs.waitForURL(/q=Coixet/);
    assert.match(await nojs.locator('body').innerText(),/1 matéria encontrada/);
    console.log('PASS search and article content without JavaScript');
  } finally {
    await browser?.close();
    server.kill();
  }
})().catch(error => {console.error(error);process.exitCode=1;});
