const fs = require('fs');
const path = require('path');

const catsPath = path.join(__dirname, '..', 'data', 'cats.json');

function readJson(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '').trim();
        return JSON.parse(data || '[]');
    } catch (err) {
        return [];
    }
}

function escapeHtml(value) {
    return String(value || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function renderCats(cats) {
    if (cats.length === 0) {
        return '<p class="empty-message">No cats found.</p>';
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

function filterCats(cats, query) {
    const search = query.toLowerCase().trim();

    if (!search) {
        return cats;
    }

    return cats.filter((cat) => {
        return cat.name.toLowerCase().includes(search)
            || cat.breed.toLowerCase().includes(search)
            || cat.description.toLowerCase().includes(search);
    });
}

module.exports = (req, res) => {
    const currentUrl = new URL(req.url, `http://${req.headers.host}`);
    req.pathname = req.pathname || currentUrl.pathname;

    if ((req.pathname === '/' || req.pathname === '/search') && req.method === 'GET') {
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

            const searchQuery = currentUrl.searchParams.get('search') || '';
            const cats = readJson(catsPath);
            const filteredCats = filterCats(cats, searchQuery);
            const catsHtml = renderCats(filteredCats);

            data = data.replace('{{cats}}', catsHtml);
            data = data.replace('{{searchValue}}', escapeHtml(searchQuery));

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

