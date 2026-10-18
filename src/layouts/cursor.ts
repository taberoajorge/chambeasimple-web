// The site's second script, and the only other one the Worker's CSP allows: a soft mint aura that
// trails the pointer so the page feels alive while someone reads it. It runs only with a fine
// pointer, a wide enough screen and no reduced-motion preference; it keeps the native cursor and
// only moves one decorative layer. The loop sleeps once the aura has caught up, so it costs nothing
// at rest. worker/csp.ts allows this exact string by hash; worker/index.test.ts fails if they drift.
// No "<" or "&": the string is injected with set:html, so it must serialize to itself for the hash.
export const CURSOR_SCRIPT = `(()=>{const a=document.getElementById("aura");if(!a)return;if(!matchMedia("(hover:hover) and (pointer:fine)").matches||!matchMedia("(min-width:768px)").matches||matchMedia("(prefers-reduced-motion:reduce)").matches)return;const lerp=0.12;let tx=-200,ty=-200,x=tx,y=ty,raf=0;const tick=()=>{x+=(tx-x)*lerp;y+=(ty-y)*lerp;a.style.transform="translate3d("+x+"px,"+y+"px,0) translate(-50%,-50%)";raf=Math.abs(tx-x)>0.1||Math.abs(ty-y)>0.1?requestAnimationFrame(tick):0};addEventListener("pointermove",e=>{tx=e.clientX;ty=e.clientY;if(!a.dataset.on)a.dataset.on="";if(!raf)raf=requestAnimationFrame(tick)},{passive:true});addEventListener("pointerleave",()=>{delete a.dataset.on})})();`;
