const CACHE="takeload-v2-3";
const ASSETS=["./","./index.html","./manifest.json","./icon-192.png","./icon-512.png"];

self.addEventListener("install",e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(
    keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))
  )).then(()=>self.clients.claim()));
});

// Allow the page to trigger an immediate update.
self.addEventListener("message",e=>{
  if(e.data==="SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch",e=>{
  const url=new URL(e.request.url);

  // External APIs (distance/fuel): network-first.
  if(url.origin!==location.origin){
    e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));
    return;
  }

  // App shell (HTML/manifest): NETWORK-FIRST so updates land automatically.
  if(e.request.mode==="navigate" || url.pathname.endsWith("/") ||
     url.pathname.endsWith("index.html") || url.pathname.endsWith("manifest.json")){
    e.respondWith(
      fetch(e.request).then(res=>{
        const copy=res.clone();
        caches.open(CACHE).then(c=>c.put(e.request,copy));
        return res;
      }).catch(()=>caches.match(e.request).then(hit=>hit||caches.match("./index.html")))
    );
    return;
  }

  // Static assets (icons): cache-first.
  e.respondWith(
    caches.match(e.request).then(hit=>hit || fetch(e.request).then(res=>{
      const copy=res.clone();
      caches.open(CACHE).then(c=>c.put(e.request,copy));
      return res;
    }).catch(()=>caches.match("./index.html")))
  );
});
