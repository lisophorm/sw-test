var wrkSettings={};
wrkSettings.cacheNew=true;

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

    //  if (event.request.mode === 'navigate' ||
   // (event.request.method === 'GET' &&
    var requestURL = new URL(event.request.url);
    var localRes={};
    console.log('fetch',requestURL.href);
    if(requestURL.href.indexOf('chrome')!=-1) {
        return 0;
    }
    event.respondWith(
        caches.open('/v8').then(function(cache) {
            return cache.match(event.request).then(function(response) {
                var fetchPromise = fetch(event.request).then(function(networkResponse) {
                    if(wrkSettings.cacheNew) {
                        cache.put(event.request, networkResponse.clone()).then(function() {
                            cacheList();
                        });
                    }
                    return networkResponse;
                })
                return response || fetchPromise;
            })
        })
    );
});

this.addEventListener('message', function(event){
    if(event.data=='1') {
        console.log("ON" + event.data);
        wrkSettings.cacheNew=true;
    } else {
        console.log("OFF " + event.data);
        wrkSettings.cacheNew=false;
    }

});

function cacheList() {
    var urls=[];
    caches.open('/v8').then(function(cache) {
        cache.keys().then(function (keys) {
            keys.forEach(function (request, index, array) {
                urls.push(request.url);
                console.log('cache key', request);
                // cache.delete(request);
            });
            sendMsc(urls);
        });
    });
}

function emptyCache() {
    cache.keys().then(function(keys) {
        keys.forEach(function(request, index, array) {
            console.log('cache key',array);
            cache.delete(request);
        });
    });
}

function sendMsc(msg) {
    self.clients.matchAll().then(function(clients) {
        clients.forEach(function(client) {
            client.postMessage({
                "command": "broadcastOnRequest",
                "message": msg
            });
        })
    });
}