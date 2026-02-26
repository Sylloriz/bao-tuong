/* SLIDESHOW */
let slides=document.querySelectorAll(".slide");
let index=0;

setInterval(()=>{
slides[index].classList.remove("active");
index=(index+1)%slides.length;
slides[index].classList.add("active");
},4000);

/* PETALS */
const petalContainer=document.querySelector(".petal-container");

function createPetal(){
let petal=document.createElement("div");
petal.classList.add("petal");
petal.style.left=Math.random()*window.innerWidth+"px";
petal.style.animationDuration=(5+Math.random()*5)+"s";
petalContainer.appendChild(petal);
setTimeout(()=>petal.remove(),10000);
}
setInterval(createPetal,300);

/* LANTERNS */
const lanternContainer=document.querySelector(".lantern-container");

function createLantern(){
let lantern=document.createElement("div");
lantern.classList.add("lantern");
lantern.style.left=Math.random()*window.innerWidth+"px";
lantern.style.animationDuration=(8+Math.random()*5)+"s";
lanternContainer.appendChild(lantern);
setTimeout(()=>lantern.remove(),13000);
}
setInterval(createLantern,2000);

/* MUSIC */
const music=document.getElementById("tet-music");
const btn=document.getElementById("music-btn");

btn.addEventListener("click",()=>{
if(music.paused){
music.play();
btn.innerHTML='<i class="fas fa-volume-up"></i>';
}else{
music.pause();
btn.innerHTML='<i class="fas fa-music"></i>';
}
});