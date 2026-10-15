// Progressive navigation: keep standalone HTML routes, swap only fully fetched content.
export function setupNavigation({initializePage, closeMenu}) {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const allowed = new Set(['/', '/about/', '/portfolio/', '/approach/', '/contact/', '/privacy/', '/companies/protocol-tomorrow/', '/companies/fugly-media/', '/companies/blue-water-spices/']);
  const cache = new Map();
  let cleanup = initializePage();
  let version = 0;
  let pending = false;
  let transition;
  let rendered = location.href;
  history.scrollRestoration = 'manual';
  history.replaceState({...history.state, darkScroll:scrollY}, '', location.href);

  const status = document.createElement('div');
  status.className='navigation-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');document.body.append(status);
  function eligible(anchor) {
    if(!anchor || anchor.hasAttribute('download') || (anchor.target && anchor.target!=='_self'))return null;
    const url=new URL(anchor.href,location.href);
    return url.origin===location.origin && allowed.has(url.pathname) ? url : null;
  }
  async function load(url) {
    const key=url.pathname;
    const existing=cache.get(key);
    if(existing && Date.now()-existing.time<30000)return existing.promise;
    const promise=(async()=>{
      const response=await fetch(key,{headers:{Accept:'text/html'},credentials:'same-origin'});
      if(!response.ok || !response.headers.get('content-type')?.includes('text/html'))throw new Error('Invalid page response');
      const parsed=new DOMParser().parseFromString(await response.text(),'text/html');
      if(!parsed.querySelector('main#main') || !parsed.querySelector('.site-frame'))throw new Error('Invalid page markup');
      return parsed;
    })();
    cache.set(key,{time:Date.now(),promise});
    promise.catch(()=>cache.delete(key));
    return promise;
  }
  async function prepareImages(parsed){
    const jobs=[...parsed.querySelectorAll('main img')].map(img=>{
      const preload=new Image();preload.src=new URL(img.getAttribute('src'),location.origin).href;
      return preload.decode().catch(()=>{});
    });
    // Avoid delaying a whole navigation indefinitely for a slow image.
    let timer;await Promise.race([Promise.all(jobs),new Promise(resolve=>{timer=setTimeout(resolve,1200);})]);clearTimeout(timer);
  }
  async function navigate(url, {pop=false, scroll=0}={}) {
    const current=++version;
    pending=true;transition?.skipTransition();
    if(!pop)history.replaceState({...history.state,darkScroll:scrollY},'',location.href);
    document.documentElement.classList.add('navigation-loading');
    document.querySelector('main').setAttribute('aria-busy','true');
    status.textContent='Loading page…';
    try {
      const parsed=await load(url);
      await prepareImages(parsed);
      if(current!==version)return;
      closeMenu(false);
      const update=()=>{
        if(current!==version)return;
        const nextStyles=parsed.querySelector('style[data-site-styles]');
        const existingStyles=document.querySelector('style[data-site-styles]');
        if(nextStyles && existingStyles?.textContent!==nextStyles.textContent){
          if(existingStyles)existingStyles.replaceWith(document.importNode(nextStyles,true));
          else document.head.append(document.importNode(nextStyles,true));
        }
        cleanup();
        const next=document.importNode(parsed.querySelector('main'),true);
        document.querySelector('main').replaceWith(next);
        document.body.className=parsed.body.className;
        document.title=parsed.title;
        for(const selector of ['meta[name="description"]','meta[property="og:title"]','meta[property="og:description"]']){
          document.querySelector(selector)?.setAttribute('content',parsed.querySelector(selector)?.content||'');
        }
        if(!pop)history.pushState({darkScroll:0},'',url);
        rendered=url.href;
        const active=url.pathname.startsWith('/companies/')?'/portfolio/':url.pathname;
        document.querySelectorAll('#site-menu nav a').forEach(link=>{if(new URL(link.href).pathname===active)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');});
        window.scrollTo({top:pop?scroll:0,behavior:'instant'});
        cleanup=initializePage();
        next.setAttribute('tabindex','-1');next.focus({preventScroll:true});
        if(url.hash){const target=document.getElementById(decodeURIComponent(url.hash.slice(1)));target?.scrollIntoView({behavior:'instant'});}
      };
      if(!reducedMotion.matches && document.startViewTransition){
        transition=document.startViewTransition(update);
        await transition.finished.catch(()=>{});
      }else if(!reducedMotion.matches){
        const outgoing=document.querySelector('main');
        await outgoing.animate([{opacity:1},{opacity:0,transform:'translateY(-6px)'}],{duration:140,easing:'ease-in',fill:'forwards'}).finished.catch(()=>{});
        if(current!==version){outgoing.getAnimations().forEach(animation=>animation.cancel());return;}
        update();
        await document.querySelector('main').animate([{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}],{duration:260,easing:'ease-out'}).finished.catch(()=>{});
      }else update();
      if(current===version)status.textContent=`${parsed.title.split(' | ')[0]} page loaded.`;
    }catch(error){
      if(current===version)location.assign(url.href); // Ordinary, fully styled navigation remains a fallback.
    }finally{
      if(current===version){pending=false;transition=null;document.documentElement.classList.remove('navigation-loading');document.querySelector('main').removeAttribute('aria-busy');}
    }
  }
  document.addEventListener('click',event=>{
    if(event.defaultPrevented || event.button!==0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)return;
    const url=eligible(event.target.closest('a'));
    if(!url)return;
    if(url.pathname===location.pathname && url.search===location.search && url.hash)return;
    event.preventDefault();
    if(url.href===rendered){
      version++;pending=false;transition?.skipTransition();transition=null;closeMenu(false);
      document.documentElement.classList.remove('navigation-loading');
      document.querySelector('main').removeAttribute('aria-busy');status.textContent='';return;
    }
    void navigate(url);
  });
  for(const eventName of ['pointerover','focusin'])document.addEventListener(eventName,event=>{
    const url=eligible(event.target.closest('a'));
    if(url && url.pathname!==location.pathname)void load(url).catch(()=>{});
  });
  window.addEventListener('popstate',event=>void navigate(new URL(location.href),{pop:true,scroll:event.state?.darkScroll||0}));
  let scheduled=false;
  window.addEventListener('scroll',()=>{
    if(scheduled||pending)return;scheduled=true;
    requestAnimationFrame(()=>{scheduled=false;if(!pending && location.href===rendered)history.replaceState({...history.state,darkScroll:scrollY},'',location.href);});
  },{passive:true});
}
