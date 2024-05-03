self.addEventListener("install", function (event) {
    console.log("Hello world from the Service Worker 🤙");
});


self.addEventListener('fetch', function (event) {
    console.log('fetch', event.request.url)

    console.log(event.request)

    event.respondWith(
        fetch(event.request)
    );
});

