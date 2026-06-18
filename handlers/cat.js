const fs = require('fs');
const path = require('path');

function renderView(res, viewPath) {
    const filePath = path.normalize(
        path.join(__dirname, '..', 'views', viewPath)
    );

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            res.writeHead(404, {
                'Content-Type': 'text/plain',
            });

            res.write('404 Not Found');
            res.end();
            return;
        }

        res.writeHead(200, {
            'Content-Type': 'text/html',
        });

        res.write(data);
        res.end();
    });
}

module.exports = (req, res) => {
    const baseUrl = `http://${req.headers.host}`;
    req.pathname = req.pathname || new URL(req.url, baseUrl).pathname;

    if (req.pathname === '/cats/add-breed' && req.method === 'GET') {
        renderView(res, 'addBreed.html');
        return false;
    }

    if (req.pathname === '/cats/add-cat' && req.method === 'GET') {
        renderView(res, 'addCat.html');
        return false;
    }

    return true;
};
