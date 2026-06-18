const fs = require('fs');
const path = require('path');
const formidable = require('formidable');

const catsPath = path.join(__dirname, '..', 'data', 'cats.json');
const breedsPath = path.join(__dirname, '..', 'data', 'breeds.json');
const imagesDir = path.join(__dirname, '..', 'content', 'images');

function readJson(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data || '[]');
    } catch (err) {
        return [];
    }
}

function writeJson(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
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

function getBreedOptions() {
    const breeds = readJson(breedsPath);

    return breeds
        .map((breed) => `<option value="${breed}">${breed}</option>`)
        .join('\n');
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

            const cats = readJson(catsPath);
            const uploadedFile = getUploadedFile(files.upload);

            let image = 'https://cdn.pixabay.com/photo/2015/06/19/14/20/cat-814952_1280.jpg';

            if (uploadedFile && uploadedFile.size > 0) {
                const imageFileName = path.basename(uploadedFile.filepath || uploadedFile.path);
                image = `/content/images/${imageFileName}`;
            }

            const newCat = {
                id: Date.now().toString(),
                name: getFieldValue(fields.name).trim(),
                description: getFieldValue(fields.description).trim(),
                image,
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

    return true;
};
