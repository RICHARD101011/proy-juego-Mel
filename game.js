const screens = {
  menu: document.getElementById("menu"),
  game: document.getElementById("gameScreen"),
  question: document.getElementById("questionScreen"),
  final: document.getElementById("finalScreen")
};

function show(name){
  Object.values(screens).forEach(s=>s.classList.remove("active"));
  screens[name].classList.add("active");
}

const photoPairs = [
  ["photoMe","imgMe","meFallback","qMe","finalMe","photo_me"],
  ["photoHer","imgHer","herFallback","qHer","finalHer","photo_her"]
];

function setPhoto(imgId, fallbackId, miniId, finalId, data){
  const img=document.getElementById(imgId);
  const fb=document.getElementById(fallbackId);
  img.src=data; img.style.display="block"; fb.style.display="none";
  document.getElementById(miniId).src=data;
  document.getElementById(finalId).src=data;
}

photoPairs.forEach(([inputId,imgId,fbId,miniId,finalId,key])=>{
  const saved=localStorage.getItem(key);
  if(saved) setPhoto(imgId,fbId,miniId,finalId,saved);
  document.getElementById(inputId).addEventListener("change",e=>{
    const f=e.target.files?.[0]; if(!f) return;
    const r=new FileReader();
    r.onload=()=>{localStorage.setItem(key,r.result);setPhoto(imgId,fbId,miniId,finalId,r.result)};
    r.readAsDataURL(f);
  });
});

document.getElementById("resetPhotos").onclick=()=>{
  localStorage.removeItem("photo_me"); localStorage.removeItem("photo_her"); location.reload();
};

const canvas=document.getElementById("game"), ctx=canvas.getContext("2d");
const W=canvas.width,H=canvas.height;

let keys={}, running=false, heartsCollected=0, cameraX=0;
const player={x:80,y:360,w:38,h:48,vx:0,vy:0,onGround:false};
const gravity=.85;
const worldWidth=2500;

const platforms=[
  {x:0,y:440,w:400,h:100,label:""},
  {x:470,y:390,w:180,h:32,label:""},
  {x:720,y:330,w:180,h:32,label:""},
  {x:980,y:420,w:240,h:32,label:"Malos entendidos"},
  {x:1290,y:350,w:220,h:32,label:"Orgullo"},
  {x:1580,y:410,w:230,h:32,label:"Suposiciones"},
  {x:1880,y:330,w:180,h:32,label:""},
  {x:2130,y:420,w:370,h:120,label:""}
];
const hearts=[
  {x:525,y:330,taken:false},
  {x:790,y:270,taken:false},
  {x:1070,y:355,taken:false},
  {x:1370,y:285,taken:false},
  {x:1960,y:265,taken:false}
];

function resetGame(){
  player.x=80;player.y=360;player.vx=0;player.vy=0;cameraX=0;heartsCollected=0;
  hearts.forEach(h=>h.taken=false); document.getElementById("score").textContent="0";
}

function rects(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}

function update(){
  if(!running)return;
  const left=keys.ArrowLeft||keys.KeyA, right=keys.ArrowRight||keys.KeyD;
  player.vx=(right?5:0)+(left?-5:0);
  player.vy+=gravity; player.x+=player.vx; player.y+=player.vy; player.onGround=false;

  platforms.forEach(p=>{
    if(player.vy>=0 &&
      player.x+player.w>p.x && player.x<p.x+p.w &&
      player.y+player.h>=p.y && player.y+player.h-player.vy<=p.y+4){
      player.y=p.y-player.h;player.vy=0;player.onGround=true;
    }
  });

  if(player.y>H+150){player.x=Math.max(30,player.x-170);player.y=250;player.vy=0}
  player.x=Math.max(0,Math.min(worldWidth-player.w,player.x));

  hearts.forEach(h=>{
    if(!h.taken && Math.hypot((player.x+player.w/2)-h.x,(player.y+player.h/2)-h.y)<45){
      h.taken=true; heartsCollected++;
      document.getElementById("score").textContent=heartsCollected;
    }
  });

  cameraX=Math.max(0,Math.min(worldWidth-W,player.x-W*.35));

  if(heartsCollected===5 && player.x>2050){
    running=false; setTimeout(()=>show("question"),350);
  }
  draw(); requestAnimationFrame(update);
}

function jump(){if(player.onGround){player.vy=-15;player.onGround=false}}

window.addEventListener("keydown",e=>{
  keys[e.code]=true;
  if(["ArrowUp","Space","KeyW"].includes(e.code)){e.preventDefault();jump()}
});
window.addEventListener("keyup",e=>keys[e.code]=false);

function hold(btn,code){
  btn.addEventListener("pointerdown",e=>{e.preventDefault();keys[code]=true});
  ["pointerup","pointercancel","pointerleave"].forEach(ev=>btn.addEventListener(ev,()=>keys[code]=false));
}
hold(document.getElementById("leftBtn"),"ArrowLeft");
hold(document.getElementById("rightBtn"),"ArrowRight");
document.getElementById("jumpBtn").addEventListener("pointerdown",e=>{e.preventDefault();jump()});

function heartShape(x,y,s){
  ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.beginPath();
  ctx.moveTo(0,7);ctx.bezierCurveTo(-16,-7,-28,9,0,30);ctx.bezierCurveTo(28,9,16,-7,0,7);
  ctx.fillStyle="#ff8eaa";ctx.fill();ctx.restore();
}

function draw(){
  const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,"#302150");g.addColorStop(.58,"#b35c84");g.addColorStop(1,"#f2a073");
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  ctx.fillStyle="rgba(255,255,255,.75)";
  for(let i=0;i<50;i++){let x=(i*197-cameraX*.2)%W,y=(i*83)%280;ctx.fillRect(x,y,2,2)}

  ctx.save();ctx.translate(-cameraX,0);
  platforms.forEach(p=>{
    ctx.fillStyle="#3b2b45";ctx.fillRect(p.x,p.y,p.w,p.h);
    ctx.fillStyle="#6c925e";ctx.fillRect(p.x,p.y,p.w,10);
    if(p.label){
      ctx.fillStyle="#f8e2dc";ctx.fillRect(p.x+10,p.y-45,Math.min(p.w-20,180),34);
      ctx.fillStyle="#57394b";ctx.font="bold 18px system-ui";ctx.textAlign="center";
      ctx.fillText(p.label,p.x+Math.min(p.w/2,100),p.y-22);
    }
  });
  hearts.forEach(h=>{if(!h.taken)heartShape(h.x,h.y,.8)});

  ctx.fillStyle="#1e1725";ctx.fillRect(player.x,player.y,player.w,player.h);
  ctx.fillStyle="#f2c8b4";ctx.fillRect(player.x+7,player.y+4,24,20);
  ctx.fillStyle="#6d2d3a";ctx.fillRect(player.x+4,player.y+27,30,19);
  ctx.restore();

  ctx.fillStyle="rgba(255,247,243,.92)";ctx.fillRect(24,24,310,58);
  ctx.fillStyle="#5a3b4a";ctx.font="bold 20px system-ui";ctx.textAlign="left";
  ctx.fillText(heartsCollected<5?"Recolecta los 5 corazones":"Ahora llega al final →",42,60);
}

document.getElementById("startBtn").onclick=()=>{
  resetGame();show("game");running=true;requestAnimationFrame(update);
};

document.querySelectorAll("[data-choice]").forEach(btn=>{
  btn.onclick=()=>{
    const choice=btn.dataset.choice;
    document.getElementById("finalMessage").textContent =
      `Elegiste “${choice}”. No quiero que un mal momento pese más que todo lo bueno. `+
      `Me importas, me gusta seguir conociéndote y quisiera que podamos estar bien, `+
      `hablar con calma y seguir compartiendo momentos bonitos.`;
    show("final");
  };
});

document.getElementById("playAgain").onclick=()=>show("menu");

// fallback avatar placeholders in later screens
["qMe","qHer","finalMe","finalHer"].forEach(id=>{
  const img=document.getElementById(id);
  img.onerror=()=>{img.style.background="#eadce2"};
});
