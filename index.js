const http = require('http');
const handlers = require('./handlers');

const PORT = 3001;

const server = http.createServer((req, res) => {
    let isHandled = false;

    for (const handler of handlers) {
        const next = handler(req, res);

        if (!next) {
            isHandled = true;
            break;
        }
    }

    if (!isHandled) {
        res.writeHead(404, {
            'Content-Type': 'text/plain',
        });

        res.write('404 Not Found');
        res.end();
    }
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
