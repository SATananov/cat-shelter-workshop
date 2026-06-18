const fs = require('fs');
const path = require('path');

function getContentType(pathname) {
    if (pathname.endsWith('.css')) {
        return 'text/css';
    }

    if (pathname.endsWith('.js')) {
        return 'application/javascript';
    }

    if (pathname.endsWith('.html')) {
        return 'text/html';
    }

    if (pathname.endsWith('.ico')) {
        return 'image/x-icon';
    }

    if (pathname.endsWith('.png')) {
        return 'image/png';
    }

    if (pathname.endsWith('.jpg') || pathname.endsWith('.jpeg')) {
        return 'image/jpeg';
    }

    return 'text/plain';
}

function isImage(pathname) {
    return pathname.endsWith('.png')
        || pathname.endsWith('.jpg')
        || pathname.endsWith('.jpeg')
        || pathname.endsWith('.ico');
}

module.exports = (req, res) => {
    const baseUrl = `http://${req.headers.host}`;
    req.pathname = req.pathname || new URL(req.url, baseUrl).pathname;

    if (req.pathname.startsWith('/content/') && req.method === 'GET') {
        const filePath = path.normalize(
            path.join(__dirname, '..', req.pathname)
        );

        const contentType = getContentType(req.pathname);
        const encoding = isImage(req.pathname) ? null : 'utf8';

        fs.readFile(filePath, encoding, (err, data) => {
            if (err) {
                res.writeHead(404, {
                    'Content-Type': 'text/plain',
                });

                res.write('404 Not Found');
                res.end();
                return;
            }

            res.writeHead(200, {
                'Content-Type': contentType,
            });

            res.write(data);
            res.end();
        });

        return false;
    }

    return true;
};
