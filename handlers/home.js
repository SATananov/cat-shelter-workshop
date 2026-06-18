const fs = require('fs');
const path = require('path');

const catsPath = path.join(__dirname, '..', 'data', 'cats.json');

function readJson(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data || '[]');
    } catch (err) {
        return [];
    }
}

function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function renderCats(cats) {
    if (cats.length === 0) {
        return '<p class="empty-message">No cats in the shelter yet.</p>';
    }

    return cats.map((cat) => `
        <li>
            <img src="${escapeHtml(cat.image)}" alt="${escapeHtml(cat.name)}">
            <h3>${escapeHtml(cat.name)}</h3>
            <p><span>Breed: </span>${escapeHtml(cat.breed)}</p>
            <p><span>Description: </span>${escapeHtml(cat.description)}</p>
            <ul class="buttons">
                <li class="btn edit"><a href="/cats/edit/${escapeHtml(cat.id)}">Change Info</a></li>
                <li class="btn delete"><a href="/cats/shelter/${escapeHtml(cat.id)}">New Home</a></li>
            </ul>
        </li>
    `).join('\n');
}

module.exports = (req, res) => {
    const baseUrl = `http://${req.headers.host}`;
    req.pathname = req.pathname || new URL(req.url, baseUrl).pathname;

    if (req.pathname === '/' && req.method === 'GET') {
        const filePath = path.normalize(
            path.join(__dirname, '../views/home/index.html')
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

            const cats = readJson(catsPath);
            const catsHtml = renderCats(cats);

            data = data.replace('{{cats}}', catsHtml);

            res.writeHead(200, {
                'Content-Type': 'text/html',
            });

            res.write(data);
            res.end();
        });

        return false;
    }

    return true;
};
