const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Serve the site (index.html, resume.pdf, images) from the project root
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Single-page site: anything else falls back to the homepage
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
