/*
 * Scripts inlined in <head> (see routes/__root.tsx). They run before first
 * paint and before the app's JavaScript arrives, which on a slow connection
 * can be seconds later. Plain ES5 strings: they must not depend on the bundle.
 */

/**
 * `data-perf="low"` on <html> for weak machines and data-saving visitors, so
 * CSS and the app can drop the expensive extras (backdrop blur, repaint-heavy
 * hover transitions, page cross-fades). A dual-core, or a quad-core with 4 GB
 * or less, is roughly a laptop from 2016. Save-Data counts too.
 */
export const deviceBootScript = `(function(){try{var n=navigator,c=n.hardwareConcurrency||8,m=n.deviceMemory,s=n.connection&&n.connection.saveData;if(s||c<=2||(c<=4&&m&&m<=4))document.documentElement.dataset.perf="low"}catch(e){}})();`

/**
 * Entrances (see "Entrances" in styles.css). Anything with `data-enter-on`
 * gets `data-entered` once it scrolls into view, which plays its CSS entrance.
 * The observer starts as soon as the HTML is parsed, so prerendered content
 * appears without waiting for the app; the app reuses it via `window.__enter`
 * (src/lib/enter.ts) for content it renders later. Without IntersectionObserver
 * `data-enter` is never set and everything simply shows.
 */
export const enterBootScript = `(function(){if(!("IntersectionObserver"in window))return;var io=new IntersectionObserver(function(es){for(var i=0;i<es.length;i++)if(es[i].isIntersecting){es[i].target.setAttribute("data-entered","");io.unobserve(es[i].target)}},{rootMargin:"0px 0px -8% 0px"});window.__enter=io;document.documentElement.dataset.enter="";document.addEventListener("DOMContentLoaded",function(){var t=document.querySelectorAll("[data-enter-on]:not([data-entered])");for(var i=0;i<t.length;i++)io.observe(t[i])})})();`
