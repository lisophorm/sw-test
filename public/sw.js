var wrkSettings={};
wrkSettings.tipo=4;

this.addEventListener('install', function(event) {
  event.waitUntil(
      caches.open('/v8').then(function(cache) {
        return cache.addAll([
          '/',
          '/index.html',
          '/style.css',
          '/app.js',
          '/image-list.js',
          '/star-wars-logo.jpg',
          '/gallery/bountyHunters.jpg',
          '/gallery/myLittleVader.jpg',
          '/gallery/snowTroopers.jpg'
        ]);
      })
  );
});

this.addEventListener('fetch', function(event) {
    var requestURL = new URL(event.request.url);
    console.log('fetch',requestURL.href);
    if(requestURL.href.indexOf('chrome')!=-1) {
        return 0;
    }
    event.respondWith(
        caches.open('/v8').then(function(cache) {
            return cache.match(event.request).then(function(response) {
                var fetchPromise = fetch(event.request).then(function(networkResponse) {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                })
                return response || fetchPromise;
            })
        })
    );
});