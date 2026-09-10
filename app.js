const screens = [...document.querySelectorAll(".screen")];

function show(id){
  screens.forEach(s=>s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  window.scrollTo({top:0,behavior:"smooth"});
}

document.querySelectorAll("[data-next]").forEach(b=>{
  b.addEventListener("click",()=>show(b.dataset.next));
});

function applyPhoto(prefix,data){
  const map = prefix==="me"
    ? ["imgMe","meFallback","qMe","finalMe"]
    : ["imgHer","herFallback","qHer","finalHer"];
  const [main,fallback,q,fin]=map;
  const m=document.getElementById(main);
  m.src=data;m.style.display="block";
  document.getElementById(fallback).style.display="none";
  document.getElementById(q).src=data;
  document.getElementById(fin).src=data;
}

function loadSaved(){
  const me=localStorage.getItem("recon_me");
  const her=localStorage.getItem("recon_her");
  if(me)applyPhoto("me",me);
  if(her)applyPhoto("her",her);
}
loadSaved();

[["photoMe","me","recon_me"],["photoHer","her","recon_her"]].forEach(([id,prefix,key])=>{
  document.getElementById(id).addEventListener("change",e=>{
    const file=e.target.files?.[0];if(!file)return;
    const reader=new FileReader();
    reader.onload=()=>{
      localStorage.setItem(key,reader.result);
      applyPhoto(prefix,reader.result);
    };
    reader.readAsDataURL(file);
  });
});

document.getElementById("clearPhotos").addEventListener("click",()=>{
  localStorage.removeItem("recon_me");
  localStorage.removeItem("recon_her");
  location.reload();
});

let seen=0;
const lights=[...document.querySelectorAll(".light")];
const box=document.getElementById("messageBox");
const pbar=document.getElementById("progressBar");
const ptext=document.getElementById("progressText");
const cont=document.getElementById("continueBtn");

lights.forEach(light=>{
  light.addEventListener("click",()=>{
    box.innerHTML=`<span>♡</span><p>${light.dataset.message}</p>`;
    if(!light.classList.contains("done")){
      light.classList.add("done");
      seen++;
      pbar.style.width=`${seen/5*100}%`;
      ptext.textContent=`${seen} de 5 mensajes`;
      if(seen===5)cont.classList.remove("hidden");
    }
  });
});

const endings={
  hablar:"Si tú también quieres hablar con calma, yo estoy dispuesto a escucharte de verdad.",
  vernos:"Si te parece, me gustaría que compartiéramos un rato sin presión y dejáramos que las cosas vuelvan a sentirse naturales.",
  despacio:"Ir despacio también está bien. No necesito forzar nada; prefiero que estemos cómodos y que todo se acomode poco a poco.",
  tiempo:"Si necesitas tiempo, lo respeto. Para mí también es importante que las cosas se arreglen de una forma sana y sincera."
};

document.querySelectorAll("[data-choice]").forEach(btn=>{
  btn.addEventListener("click",()=>{
    document.getElementById("choiceLine").textContent=endings[btn.dataset.choice];
    show("final");
  });
});

document.getElementById("replay").addEventListener("click",()=>{
  seen=0;
  lights.forEach(l=>l.classList.remove("done"));
  pbar.style.width="0";
  ptext.textContent="0 de 5 mensajes";
  cont.classList.add("hidden");
  box.innerHTML="<span>✨</span><p>Toca una luz para descubrir un mensaje.</p>";
  show("inicio");
});
