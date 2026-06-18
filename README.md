# Cat Shelter Workshop

Cat Shelter is a simple Node.js web application created for the JS Back-End course workshop.

The application works as a small cat catalog for a shelter. It uses HTML, CSS, Node.js routing, file system operations, and JSON files as a simple database.

## Features

* List all cats from a JSON database
* Add a new cat breed
* Add a new cat with name, description, image, and breed
* Upload cat images
* Edit existing cat information
* Shelter a cat / remove it from the catalog
* Search cats by name, breed, or description
* Serve static files such as CSS and images

## Technologies

* Node.js
* HTML5
* CSS3
* JSON file storage
* Formidable for file uploads

## Project Structure

```txt
cat-shelter-workshop/
├── content/
│   ├── images/
│   │   └── .gitkeep
│   └── styles/
│       └── site.css
├── data/
│   ├── cats.json
│   └── breeds.json
├── handlers/
│   ├── cat.js
│   ├── home.js
│   ├── index.js
│   └── static-files.js
├── views/
│   ├── home/
│   │   └── index.html
│   ├── addBreed.html
│   ├── addCat.html
│   ├── catShelter.html
│   └── editCat.html
├── index.js
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

## Development Steps

1. Initialized the Node.js project with `npm init`.
2. Created the project folder structure.
3. Added the provided workshop resources and views.
4. Created a basic Node.js HTTP server.
5. Loaded the Home page from an HTML file.
6. Added a static files handler for CSS and images.
7. Added routes for Add Breed and Add Cat pages.
8. Implemented Add Breed functionality and saved breeds in `breeds.json`.
9. Implemented Add Cat functionality with image upload and saved cats in `cats.json`.
10. Rendered the Home page dynamically from the JSON database.
11. Implemented Edit Cat functionality.
12. Implemented Shelter the Cat functionality.
13. Implemented Search functionality.
14. Polished the page layout, forms, and cat cards.
15. Prepared the project for GitHub with commits and README documentation.

## Routes

```txt
GET  /                    Home page with all cats
GET  /search              Search cats
GET  /cats/add-breed      Add breed page
POST /cats/add-breed      Save new breed
GET  /cats/add-cat        Add cat page
POST /cats/add-cat        Save new cat
GET  /cats/edit/:id       Edit cat page
POST /cats/edit/:id       Save edited cat
GET  /cats/shelter/:id    Shelter cat page
POST /cats/shelter/:id    Remove cat from shelter
GET  /content/...         Static files
```

## How to Run

Install dependencies:

```bash
npm install
```

Start the server:

```bash
npm start
```

Open the application:

```txt
http://localhost:3001
```

## Notes

This project uses JSON files as a simple database:

* `data/cats.json`
* `data/breeds.json`

Uploaded images are saved in:

```txt
content/images/
```

The project was developed step by step as part of the JS Back-End workshop.
