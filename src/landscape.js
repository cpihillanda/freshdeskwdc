// Original procedural wire landscape; no external videos or images.
export function startLandscape() {
  const canvas = document.querySelector('#landscape');
  const ctx = canvas.getContext('2d');
  const button = document.querySelector('#motion-toggle');
  if (!ctx) { button.hidden = true; return; }
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const controller = new AbortController();
  const options = {signal:controller.signal};
  let paused = preference.matches, width = 0, height = 0, frame = 0, time = 0, last = 0, pointer = 0;
  const particles = Array.from({length:32}, (_, i) => ({x:((i*73+19)%101)/101,y:((i*37+7)%97)/97,size:i%4+1}));
  function draw() {
    ctx.clearRect(0,0,width,height);
    const glow = ctx.createRadialGradient(width*.75,height*.4,0,width*.75,height*.4,width*.7);
    glow.addColorStop(0,'#a36b1740');glow.addColorStop(.5,'#5d2b1025');glow.addColorStop(1,'#11090000');
    ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);
    const lines=width<600?34:62;
    for(let line=0;line<lines;line++) {
      const z=line/(lines-1);ctx.beginPath();
      for(let step=0;step<=100;step++) {
        const x=step/100,swell=Math.exp(-Math.pow((x-.73-pointer*.02)/.28,2));
        const ripple=Math.sin(x*11+z*4+time*.00016)*.065+Math.sin(x*21-z*2+time*.0001)*.018;
        const y=height*(.84-z*.22-swell*(.35+z*.2)+ripple*(.7+z));
        const px=x*width*1.25-width*.04,py=y+(1-z)*(1-z)*height*.32;
        if(step===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);
      }
      ctx.strokeStyle=`rgba(${Math.round(175+z*65)},${Math.round(115+z*74)},${Math.round(42+z*72)},${.08+z*.27})`;
      ctx.lineWidth=.65;ctx.stroke();
    }
    particles.forEach((p,i)=>{
      const x=p.x*width+Math.sin(time*.00012+i)*12,y=((p.y*height-time*.006*(p.size/4))%height+height)%height;
      ctx.save();ctx.translate(x,y);ctx.rotate(time*.00004+i);ctx.fillStyle=`rgba(220,167,65,${.12+p.size*.035})`;ctx.shadowColor='#e5af48';ctx.shadowBlur=8;ctx.fillRect(-p.size,-p.size,p.size*2,p.size*2);ctx.restore();
    });
  }
  function resize() {
    const rect=canvas.getBoundingClientRect();width=rect.width;height=rect.height;
    const ratio=Math.min(devicePixelRatio||1,1.5);canvas.width=width*ratio;canvas.height=height*ratio;ctx.setTransform(ratio,0,0,ratio,0,0);draw();
  }
  function loop(now) {
    if(paused||document.hidden){frame=0;last=0;return;}
    if(!last||now-last>=32){time+=last?Math.min(now-last,60):0;last=now;draw();}
    frame=requestAnimationFrame(loop);
  }
  function sync() {
    button.setAttribute('aria-pressed',String(paused));button.setAttribute('aria-label',paused?'Play background animation':'Pause background animation');
    button.innerHTML=`${paused?'Play':'Pause'} motion <span aria-hidden="true">${paused?'▷':'Ⅱ'}</span>`;
    cancelAnimationFrame(frame);frame=0;last=0;if(!paused&&!document.hidden)frame=requestAnimationFrame(loop);else draw();
  }
  button.addEventListener('click',()=>{paused=!paused;sync();},options);
  preference.addEventListener('change',event=>{paused=event.matches;sync();},options);
  document.addEventListener('visibilitychange',sync,options);
  canvas.parentElement.addEventListener('pointermove',event=>{if(!paused)pointer=(event.clientX/innerWidth-.5)*2;},options);
  const observer=new ResizeObserver(resize);observer.observe(canvas);resize();sync();
  return ()=>{paused=true;cancelAnimationFrame(frame);observer.disconnect();controller.abort();};
}
