const homeHandler = require('./home');
const catHandler = require('./cat');
const staticFilesHandler = require('./static-files');

module.exports = [
    homeHandler,
    catHandler,
    staticFilesHandler,
];
