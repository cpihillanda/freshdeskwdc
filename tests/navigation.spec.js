import {test,expect} from '@playwright/test';

test('styling is available before JavaScript runs',async({browser,baseURL})=>{
  const context=await browser.newContext({javaScriptEnabled:false});
  const page=await context.newPage();
  await page.goto(`${baseURL}/portfolio/`);
  await expect(page.locator('head link[rel="stylesheet"]')).not.toHaveCount(0);
  expect(await page.locator('.portfolio-grid').evaluate(el=>getComputedStyle(el).display)).toBe('grid');
  expect(await page.locator('html').evaluate(el=>getComputedStyle(el).getPropertyValue('--gold').trim())).toBe('#d7ae5c');
  await expect(page.locator('#site-menu')).not.toBeVisible();
  await context.close();
});

test('HTML stays styled when all external stylesheets and JavaScript are unavailable',async({browser,baseURL})=>{
  const context=await browser.newContext({javaScriptEnabled:false});
  const page=await context.newPage();
  await page.route('**/*.css',route=>route.abort());
  await page.goto(`${baseURL}/portfolio/`);
  await expect(page.locator('head style[data-site-styles]')).toHaveCount(1);
  expect(await page.locator('.portfolio-grid').evaluate(el=>getComputedStyle(el).display)).toBe('grid');
  expect(await page.locator('html').evaluate(el=>getComputedStyle(el).backgroundColor)).toBe('rgb(6, 6, 6)');
  await expect(page.locator('#site-menu')).not.toBeVisible();
  await page.screenshot({path:'test-results/styles-without-css-or-js.png'});
  await context.close();
});

test('internal navigation repairs styles removed from an already open tab',async({page})=>{
  await page.goto('/');
  await page.evaluate(()=>document.querySelectorAll('style,link[rel="stylesheet"]').forEach(el=>el.remove()));
  expect(await page.locator('.site-header').evaluate(el=>getComputedStyle(el).display)).not.toBe('flex');
  await page.getByRole('link',{name:'Explore our companies'}).click();
  await expect(page).toHaveURL(/\/portfolio\/$/);
  await expect(page.locator('html')).not.toHaveClass(/navigation-loading/);
  expect(await page.locator('.portfolio-grid').evaluate(el=>getComputedStyle(el).display)).toBe('grid');
  expect(await page.locator('html').evaluate(el=>getComputedStyle(el).backgroundColor)).toBe('rgb(6, 6, 6)');
});

test('slow navigation keeps the styled current page, then swaps without reloading',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');
  await page.evaluate(()=>{window.navigationSentinel='same-document';});
  let release;
  const ready=new Promise(resolve=>{release=resolve;});
  await page.route('**/portfolio/',async route=>{
    if(route.request().isNavigationRequest())return route.continue();
    await ready;await route.continue();
  });
  await page.getByRole('link',{name:'Explore our companies'}).click();
  await expect(page.locator('html')).toHaveClass(/navigation-loading/);
  await expect(page.locator('.home-message h1')).toBeVisible();
  await expect(page).toHaveTitle(/Built for what comes next/);
  expect(await page.locator('html').evaluate(el=>getComputedStyle(el).getPropertyValue('--gold').trim())).toBe('#d7ae5c');
  release();
  await expect(page).toHaveURL(/\/portfolio\/$/);
  await expect(page.locator('html')).not.toHaveClass(/navigation-loading/);
  expect(await page.evaluate(()=>window.navigationSentinel)).toBe('same-document');
  await expect(page.locator('.company-card')).toHaveCount(3);
  await page.goBack();await expect(page.locator('#landscape')).toBeVisible();
  await expect(page.locator('html')).not.toHaveClass(/navigation-loading/);
  await page.getByRole('button',{name:'Pause background animation'}).click();
  await expect(page.getByRole('button',{name:'Play background animation'})).toBeVisible();
  await page.goForward();await expect(page.locator('.company-card')).toHaveCount(3);
  await expect(page.locator('html')).not.toHaveClass(/navigation-loading/);
  await page.getByRole('button',{name:'Media',exact:true}).click();
  await expect(page.locator('.company-card:visible')).toHaveCount(1);
  expect(errors).toEqual([]);
});

test('fallback animation, topic selection and scroll restoration work without View Transitions',async({page})=>{
  await page.addInitScript(()=>{Object.defineProperty(document,'startViewTransition',{value:undefined});});
  await page.goto('/companies/fugly-media/');
  await page.evaluate(()=>window.scrollTo({top:420,behavior:'instant'}));
  await page.getByRole('link',{name:'Start a conversation'}).click();
  await expect(page).toHaveURL(/\/contact\//);
  await expect(page.locator('html')).not.toHaveClass(/navigation-loading/);
  await expect(page.getByLabel('I’m interested in')).toHaveValue('Fugly Media — content & collaborations');
  await page.goBack();await expect(page).toHaveURL(/\/companies\/fugly-media\/$/);
  await expect(page.locator('html')).not.toHaveClass(/navigation-loading/);
  expect(await page.evaluate(()=>scrollY)).toBeGreaterThan(0);
});

test('new navigation supersedes an older response',async({page})=>{
  await page.goto('/');
  let release;const pending=new Promise(resolve=>{release=resolve;});
  await page.route('**/portfolio/',async route=>{if(!route.request().isNavigationRequest())await pending;await route.continue();});
  await page.getByRole('link',{name:'Explore our companies'}).click();
  await page.getByRole('link',{name:/01 \/ THE GROUP/}).click();
  await expect(page).toHaveURL(/\/about\/$/);
  release();
  await expect(page.locator('html')).not.toHaveClass(/navigation-loading/);
  await expect(page).toHaveTitle(/The group/);
  await expect(page.locator('main h1')).toContainText('INDEPENDENT');
});
