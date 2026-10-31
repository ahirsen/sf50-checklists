// Offline support: saves the app and its checklist data on the device.
// Opens from the saved copy instantly (works in airplane mode), then quietly
// refreshes the saved copy in the background when there is a connection.
// Bump VERSION whenever files change so devices pick up a clean copy.
const VERSION = 'sf50-v1';
const FILES = [
    './',
    './index.html',
    './main.html',
    './css.css',
    './js.js',
    './speech.js',
    './fit.js',
    './checklists.json',
    './cassMessages.json',
    './manifest.json',
    './icons/icon-180.png',
    './icons/icon-192.png',
    './icons/icon-512.png'
];

self.addEventListener('install', event => {
    event.waitUntil(caches.open(VERSION).then(cache => cache.addAll(FILES)));
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    const req = event.request;
    if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

    event.respondWith(
        caches.open(VERSION).then(cache =>
            cache.match(req, { ignoreSearch: true }).then(cached => {
                const network = fetch(req)
                    .then(res => {
                        if (res && res.ok) cache.put(req, res.clone());
                        return res;
                    })
                    .catch(() => cached);
                return cached || network;
            })
        )
    );
});
