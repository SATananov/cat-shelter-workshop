const http = require('http');

const PORT = 3001;

const server = http.createServer((req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/plain',
    });

    res.write('Cat Shelter server is running!');
    res.end();
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});