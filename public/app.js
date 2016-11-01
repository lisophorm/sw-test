// register service worker

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js', { scope: '/' }).then(function(reg) {
    
    if(reg.installing) {
      console.log('Service worker installing');
    } else if(reg.waiting) {
      console.log('Service worker installed');
    } else if(reg.active) {
      console.log('Service worker active');
    }
    
  }).catch(function(error) {
    // registration failed
    console.log('Registration failed with ' + error);
  });
}

// function for loading each image via XHR

function imgLoad(imgJSON) {
  // return a promise for an image loading
  return new Promise(function(resolve, reject) {
    var request = new XMLHttpRequest();
    request.open('GET', imgJSON.url);
    request.responseType = 'blob';

    request.onload = function() {
      if (request.status == 200) {
        var arrayResponse = [];
        arrayResponse[0] = request.response;
        arrayResponse[1] = imgJSON;
        resolve(arrayResponse);
      } else {
        reject(Error('Image didn\'t load successfully; error code:' + request.statusText));
      }
    };

    request.onerror = function() {
      reject(Error('There was a network error.'));
    };

    // Send the request
    request.send();
  });
}

var imgSection = document.querySelector('section');

window.onload = function() {

  // load each set of image, alt text, name and caption
  for(var i = 0; i<=Gallery.images.length-1; i++) {
    imgLoad(Gallery.images[i]).then(function(arrayResponse) {

      var myImage = document.createElement('img');
      var myFigure = document.createElement('figure');
      var myCaption = document.createElement('caption');
      var imageURL = window.URL.createObjectURL(arrayResponse[0]);

      myImage.src = imageURL;
      myImage.setAttribute('alt', arrayResponse[1].alt);
      myCaption.innerHTML = '<strong>' + arrayResponse[1].name + '</strong>: Taken by ' + arrayResponse[1].credit;

      imgSection.appendChild(myFigure);
      myFigure.appendChild(myImage);
    //  myFigure.appendChild(myCaption);

    }, function(Error) {
      console.log(Error);
    });
  }
};
$("#loadImgBut").click(function() {
  console.log($("#imgurl").val());
  $("#gino").attr("src",$("#imgurl").val());
});
$("#loadUrlBut").click(function() {
  $.get( $("#loadurl").val(), function( data ) {
    $( "#largeoutput" ).val( data.replace(/(\r\n|\n|\r)/gm,"") );

  });
});
$("#cacheUrlBut").click(function() {
  console.log($("#cacheurl").val());
  console.log('add url to cache');
  addUrlToCache($("#cacheurl").val());
});
function addUrlToCache(url) {
  window.fetch(url, {mode: 'no-cors'}).then(function(response) {
    caches.open('/v8').then(function(cache) {
      cache.put(url, response);
    });
  }).catch(function(error) {
    alert(error);
  });
}
$("#cachenewstuff").click(function() {

  if($('#cachenewstuff').prop('checked')) {
    send_message_to_sw('1');
  } else {
    send_message_to_sw('0');
  }
})
function send_message_to_sw(message) {
  // This wraps the message posting/response in a promise, which will
  // resolve if the response doesn't contain an error, and reject with
  // the error if it does. If you'd prefer, it's possible to call
  // controller.postMessage() and set up the onmessage handler
  // independently of a promise, but this is a convenient wrapper.
  return new Promise(function(resolve, reject) {
    var messageChannel = new MessageChannel();
    messageChannel.port1.onmessage = function(event) {
      if (event.data.error) {
        reject(event.data.error);
      } else {
        resolve(event.data);
      }
    };

    // This sends the message data as well as transferring
    // messageChannel.port2 to the service worker.
    // The service worker can then use the transferred port to reply
    // via postMessage(), which will in turn trigger the onmessage
    // handler on messageChannel.port1.
    // See
    // https://html.spec.whatwg.org/multipage/workers.html#dom-worker-postmessage
    navigator.serviceWorker.controller.postMessage(message, [messageChannel.port2]);
  });
}

registerBroadcastReceiver();

function registerBroadcastReceiver() {
  navigator.serviceWorker.onmessage = function(event) {
    console.log("Broadcasted SW : ", event.data);

    var data = event.data;

    if (data.command == "broadcastOnRequest") {
      console.log("Broadcastedage from the ServiceWorker : ", data.message.replace(/\,/g, '\r\n'));
      $("#cachedURLS").val(data.message.replace(/\,/g, '\r\n'));
    }
  };
}