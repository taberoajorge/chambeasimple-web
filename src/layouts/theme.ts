// The site's only JavaScript: the light/dark switch. It runs inline in <head> so a saved choice
// applies before the first paint (no flash), marks <html data-js> so the header button shows without
// moving anything, then wires it. Without JavaScript there is no button and the theme follows the
// system. worker/csp.ts allows exactly this script by its hash in the CSP; worker/index.test.ts
// fails if they drift apart.
export const THEME_SCRIPT = `(()=>{const r=document.documentElement,k="theme";r.dataset.js="";try{const s=localStorage.getItem(k);if(s==="light"||s==="dark")r.dataset.theme=s}catch{}const dark=()=>(r.dataset.theme||(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"))==="dark";addEventListener("DOMContentLoaded",()=>{const b=document.getElementById("theme");if(!b)return;const sync=()=>b.setAttribute("aria-pressed",String(dark()));sync();b.addEventListener("click",()=>{r.dataset.theme=dark()?"light":"dark";try{localStorage.setItem(k,r.dataset.theme)}catch{}sync()})})})();`;
