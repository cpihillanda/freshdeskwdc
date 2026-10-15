import {test, expect} from '@playwright/test';
const routes = ['/', '/about/', '/portfolio/', '/approach/', '/contact/', '/privacy/', '/companies/protocol-tomorrow/', '/companies/fugly-media/', '/companies/blue-water-spices/'];

for (const width of [1440,390,320]) {
  test(`all pages load directly with working assets at ${width}px`, async ({page}) => {
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.setViewportSize({width,height:1000});
    await page.emulateMedia({reducedMotion:'reduce'});
    for(const route of routes) {
      const response=await page.goto(route);
      expect(response.status()).toBe(200);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page).toHaveTitle(/Dark Consolidated/);
      await page.evaluate(()=>document.fonts.ready);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),route).toBeTruthy();
      expect(await page.locator('h1').evaluate(el=>el.scrollWidth<=el.clientWidth),route).toBeTruthy();
      expect(await page.locator('img').evaluateAll(images=>images.every(img=>img.complete&&img.naturalWidth>0)),route).toBeTruthy();
      if(['/', '/portfolio/', '/companies/fugly-media/', '/contact/'].includes(route)) await page.screenshot({path:`test-results/${width}-${route.replaceAll('/','_')}.png`,fullPage:true});
    }
    expect(errors).toEqual([]);
  });
}

test('menu navigation, keyboard dismissal, direct reload and browser history',async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.goto('/');
  const trigger=page.getByRole('button',{name:'Open navigation'});
  await trigger.click();
  await expect(page.getByRole('dialog',{name:'Main navigation'})).toBeVisible();
  const menuBox=await page.locator('#site-menu').boundingBox();
  expect(menuBox.width).toBeLessThanOrEqual(350);
  expect(menuBox.height).toBeLessThan(520);
  await page.keyboard.press('Escape');await expect(trigger).toBeFocused();
  await trigger.click();
  await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:/Our portfolio/}).click();
  await expect(page).toHaveURL(/\/portfolio\/$/);
  await page.reload();await expect(page.locator('.company-card')).toHaveCount(3);
  await page.goBack();await expect(page).toHaveURL(/\/$/);
});

test('portfolio filters and company enquiry routes',async({page})=>{
  await page.goto('/portfolio/');
  await page.getByRole('button',{name:'Media',exact:true}).click();
  await expect(page.locator('.company-card:visible')).toHaveCount(1);
  await expect(page.locator('#filter-count')).toHaveText('1 company');
  await page.locator('.company-card:visible a').click();
  await expect(page).toHaveURL(/\/companies\/fugly-media\/$/);
  await expect(page.locator('.audience-stats')).toContainText('20M+');
  await page.getByRole('link',{name:'Start a conversation'}).click();
  await expect(page.getByLabel('I’m interested in')).toHaveValue('Fugly Media — content & collaborations');
  await page.getByLabel('Your name').fill('Test Visitor');
  await page.getByLabel('Email address').fill('visitor@example.com');
  await page.getByLabel('Your message').fill('Please discuss a creative collaboration with our company.');
  await page.getByRole('button',{name:'Open email draft'}).click();
  await expect(page.locator('#form-status')).toContainText('Email draft requested');
  await page.goto('/companies/blue-water-spices/');
  await expect(page.locator('.relationship')).toContainText('has not yet been completed');
  await page.getByRole('link',{name:'Start a conversation'}).click();
  await expect(page.getByLabel('I’m interested in')).toHaveValue('Blue Water Spices — enquiries');
});

test('capability accordion and reduced motion controls',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
  await expect(page.getByRole('button',{name:'Play background animation'})).toHaveAttribute('aria-pressed','true');
  await page.getByRole('button',{name:'Play background animation'}).click();
  await expect(page.getByRole('button',{name:'Pause background animation'})).toBeVisible();
  await page.getByRole('button',{name:'Pause background animation'}).click();
  await page.goto('/companies/protocol-tomorrow/');
  await page.locator('summary').filter({hasText:'Agentic AI'}).click();
  await expect(page.locator('details[open]')).toHaveCount(1);
  await expect(page.locator('details[open]')).toContainText('human oversight');
});

test('all internal links resolve to generated pages',async({page,request})=>{
  const paths=new Set();
  for(const route of routes){await page.goto(route);for(const href of await page.locator('a[href^="/"]').evaluateAll(links=>links.map(a=>a.getAttribute('href'))))paths.add(href.split('?')[0]);}
  for(const path of paths){expect(routes).toContain(path);expect((await request.get(path)).status()).toBe(200);}
});

test('transparent logos and black-gold palette',async({page})=>{
  await page.goto('/portfolio/');
  const logos=await page.locator('.site-header .brand img,.company-logo').evaluateAll(images=>images.map(img=>{
    const canvas=document.createElement('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;
    const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0);const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;
    let transparent=0,visible=0;for(let i=3;i<pixels.length;i+=4){if(pixels[i]===0)transparent++;if(pixels[i]>100)visible++;}
    return {src:img.src,transparent:transparent/(pixels.length/4),visible:visible/(pixels.length/4)};
  }));
  expect(logos).toHaveLength(4);
  for(const logo of logos){expect(logo.src).toContain('-transparent.png');expect(logo.transparent).toBeGreaterThan(.4);expect(logo.visible).toBeGreaterThan(.03);}
  expect(await page.locator('html').evaluate(el=>getComputedStyle(el).getPropertyValue('--gold').trim())).toBe('#d7ae5c');
  const sizes=await page.locator('.company-logo').evaluateAll(imgs=>imgs.map(i=>[i.clientWidth,i.clientHeight]));
  expect(sizes).toEqual([[210,150],[210,150],[210,150]]);
});

test('compact menu dismisses outside and desktop page navigation animates',async({page})=>{
  await page.setViewportSize({width:1440,height:1000});await page.goto('/');
  await page.getByRole('button',{name:'Open navigation'}).click();
  const box=await page.locator('#site-menu').boundingBox();expect(box.width).toBeLessThanOrEqual(350);expect(box.height).toBeLessThan(520);
  await page.screenshot({path:'test-results/compact-menu.png'});
  await page.mouse.click(100,500);await expect(page.locator('#site-menu')).not.toBeVisible();
  await page.getByRole('link',{name:'Explore our companies'}).click();await expect(page).toHaveURL(/\/portfolio\/$/);
  await expect(page.locator('.insight-section')).toHaveCount(2);
  await page.getByRole('button',{name:'Heritage',exact:true}).click();
  await expect(page.locator('.company-card:visible')).toHaveCount(1);
  await expect(page.locator('.company-card:visible')).toContainText('Blue Water Spices');
});
