
const endpoint = "http://localhost:3000"


async function mockData(url, method, data) {

    const res = await fetch(`${endpoint}/mock`, {
        method: 'POST',
        body: JSON.stringify({
            endpoint: url,
            method,
            data,
        }),
    });

    return res.json();
}


async function interceptRequest(request) {


    const res = await fetch(request);

    const cloned = res.clone();
    const data = await res.json().catch(() => null);

    if (!data)
        return cloned

    const mockedData = await mockData(request.url, request.method, data);

    return new Response(JSON.stringify(mockedData), {
        ...res,
        headers: {
            ...res.headers,
            'Pixeleye-Mock': 'true',
        }
    });
}

// TODO - Check search params are encapsulated in the URL
self.addEventListener('fetch', (event) => { event.respondWith(interceptRequest(event.request)) });








