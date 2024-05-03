// This points to our mock.js file. Right now we are just serving it from a local server.
const serviceWorker = '/mock.js';

(function () {
    // register the service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register(serviceWorker)
    }
})()