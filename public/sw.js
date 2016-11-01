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
  var response=3;
  var requestURL = new URL(event.request.url);
  console.log('fetch',requestURL.href);
  if(requestURL.href.indexOf('chrome')!=-1) {
    return 0;
  }

  var fetto=fetch(event.request).then(function(networkResponse) {
      var barra={c:2};
      var responsa=networkResponse.clone();
      console.log('aa');
      caches.open('/v8').then(function(cache) {
          console.log('put in cache');
          return cache.put(event.request,responsa);
      }).then(function(){
          console.log('risppnde');
          barra.gino=24;
          event.respondWith(responsa);
      })


  }).catch(function(ee) {
      console.log(ee);

      caches.match(event.request).then(function (response) {
          console.log('da cache');
          event.respondWith(response);
      });
  }).then(function (responsa) {
      console.log('fetchto',responsa);
     // event.respondWith(responsa);
  });

wrkSettings.tipo=4;


});