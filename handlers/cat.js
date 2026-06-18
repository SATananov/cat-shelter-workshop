const fs = require('fs');
const path = require('path');
const formidable = require('formidable');

const catsPath = path.join(__dirname, '..', 'data', 'cats.json');
const breedsPath = path.join(__dirname, '..', 'data', 'breeds.json');
const imagesDir = path.join(__dirname, '..', 'content', 'images');

function readJson(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '').trim();
        return JSON.parse(data || '[]');
    } catch (err) {
        return [];
    }
}

function writeJson(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function escapeHtml(value) {
    return String(value || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function parseBody(req, callback) {
    let body = '';

    req.on('data', (chunk) => {
        body += chunk;
    });

    req.on('end', () => {
        const params = new URLSearchParams(body);
        const formData = {};

        for (const [key, value] of params.entries()) {
            formData[key] = value;
        }

        callback(formData);
    });
}

function renderView(res, viewPath, replacements = {}) {
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

        Object.entries(replacements).forEach(([placeholder, value]) => {
            data = data.replaceAll(placeholder, value);
        });

        res.writeHead(200, {
            'Content-Type': 'text/html',
        });

        res.write(data);
        res.end();
    });
}

function redirect(res, location) {
    res.writeHead(302, {
        Location: location,
    });

    res.end();
}

function getFieldValue(value) {
    if (Array.isArray(value)) {
        return value[0] || '';
    }

    return value || '';
}

function getUploadedFile(fileValue) {
    if (Array.isArray(fileValue)) {
        return fileValue[0];
    }

    return fileValue;
}

function getBreedOptions(selectedBreed = '') {
    const breeds = readJson(breedsPath);

    return breeds
        .map((breed) => {
            const selected = breed === selectedBreed ? ' selected' : '';
            return `<option value="${escapeHtml(breed)}"${selected}>${escapeHtml(breed)}</option>`;
        })
        .join('\n');
}

function getCatId(pathname, prefix) {
    return pathname.replace(prefix, '').replace('/', '').trim();
}

function handleCatForm(req, res, callback) {
    fs.mkdirSync(imagesDir, { recursive: true });

    const form = new formidable.IncomingForm({
        uploadDir: imagesDir,
        keepExtensions: true,
        multiples: false,
    });

    form.parse(req, (err, fields, files) => {
        if (err) {
            res.writeHead(500, {
                'Content-Type': 'text/plain',
            });

            res.write('Upload error');
            res.end();
            return;
        }

        const uploadedFile = getUploadedFile(files.upload);

        let uploadedImage = '';

        if (uploadedFile && uploadedFile.size > 0) {
            const imageFileName = path.basename(uploadedFile.filepath || uploadedFile.path);
            uploadedImage = `/content/images/${imageFileName}`;
        }

        callback(fields, uploadedImage);
    });
}

module.exports = (req, res) => {
    const baseUrl = `http://${req.headers.host}`;
    req.pathname = req.pathname || new URL(req.url, baseUrl).pathname;

    if (req.pathname === '/cats/add-breed' && req.method === 'GET') {
        renderView(res, 'addBreed.html');
        return false;
    }

    if (req.pathname === '/cats/add-breed' && req.method === 'POST') {
        parseBody(req, (formData) => {
            const breedName = (
                formData.breed ||
                formData.breedName ||
                formData.name ||
                Object.values(formData)[0] ||
                ''
            ).trim();

            if (breedName) {
                const breeds = readJson(breedsPath);

                if (!breeds.includes(breedName)) {
                    breeds.push(breedName);
                    writeJson(breedsPath, breeds);
                }
            }

            redirect(res, '/');
        });

        return false;
    }

    if (req.pathname === '/cats/add-cat' && req.method === 'GET') {
        renderView(res, 'addCat.html', {
            '{{catBreeds}}': getBreedOptions(),
        });

        return false;
    }

    if (req.pathname === '/cats/add-cat' && req.method === 'POST') {
        handleCatForm(req, res, (fields, uploadedImage) => {
            const cats = readJson(catsPath);

            const newCat = {
                id: Date.now().toString(),
                name: getFieldValue(fields.name).trim(),
                description: getFieldValue(fields.description).trim(),
                image: uploadedImage || 'https://cdn.pixabay.com/photo/2015/06/19/14/20/cat-814952_1280.jpg',
                breed: getFieldValue(fields.breed).trim(),
            };

            if (newCat.name && newCat.description && newCat.breed) {
                cats.push(newCat);
                writeJson(catsPath, cats);
            }

            redirect(res, '/');
        });

        return false;
    }

    if (req.pathname.startsWith('/cats/edit/') && req.method === 'GET') {
        const catId = getCatId(req.pathname, '/cats/edit/');
        const cats = readJson(catsPath);
        const cat = cats.find((currentCat) => currentCat.id === catId);

        if (!cat) {
            redirect(res, '/');
            return false;
        }

        renderView(res, 'editCat.html', {
            '{{catId}}': escapeHtml(cat.id),
            '{{catName}}': escapeHtml(cat.name),
            '{{catDescription}}': escapeHtml(cat.description),
            '{{catImage}}': escapeHtml(cat.image),
            '{{catBreeds}}': getBreedOptions(cat.breed),
        });

        return false;
    }

    if (req.pathname.startsWith('/cats/edit/') && req.method === 'POST') {
        const catId = getCatId(req.pathname, '/cats/edit/');

        handleCatForm(req, res, (fields, uploadedImage) => {
            const cats = readJson(catsPath);
            const catIndex = cats.findIndex((currentCat) => currentCat.id === catId);

            if (catIndex !== -1) {
                cats[catIndex] = {
                    ...cats[catIndex],
                    name: getFieldValue(fields.name).trim(),
                    description: getFieldValue(fields.description).trim(),
                    breed: getFieldValue(fields.breed).trim(),
                    image: uploadedImage || cats[catIndex].image,
                };

                writeJson(catsPath, cats);
            }

            redirect(res, '/');
        });

        return false;
    }

    if (req.pathname.startsWith('/cats/shelter/') && req.method === 'GET') {
        const catId = getCatId(req.pathname, '/cats/shelter/');
        const cats = readJson(catsPath);
        const cat = cats.find((currentCat) => currentCat.id === catId);

        if (!cat) {
            redirect(res, '/');
            return false;
        }

        renderView(res, 'catShelter.html', {
            '{{catId}}': escapeHtml(cat.id),
            '{{catName}}': escapeHtml(cat.name),
            '{{catDescription}}': escapeHtml(cat.description),
            '{{catImage}}': escapeHtml(cat.image),
            '{{catBreed}}': escapeHtml(cat.breed),
        });

        return false;
    }

    if (req.pathname.startsWith('/cats/shelter/') && req.method === 'POST') {
        const catId = getCatId(req.pathname, '/cats/shelter/');
        const cats = readJson(catsPath);
        const filteredCats = cats.filter((currentCat) => currentCat.id !== catId);

        writeJson(catsPath, filteredCats);
        redirect(res, '/');

        return false;
    }

    return true;
};

