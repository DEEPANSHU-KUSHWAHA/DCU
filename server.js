const express = require('express');
const compression = require('compression');
const minify = require('express-minify');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable gzip compression
app.use(compression());

// Minify HTML, JS, and CSS
app.use(minify({
    cache: path.join(__dirname, 'cache'),
    uglifyJS: true,
    cssmin: true
}));

// Serve static files
app.use(express.static('public'));

// URL list converter middleware
app.param('list', (req, res, next, list) => {
    req.listParam = list.split(',');
    next();
});

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
