import express from 'express';
import path from 'path';
import fs from 'fs';

export function startServer() {
  try {
    const app = express();
    const port = 4000;

    // Serve static files from the 'public' directory
    app.use(express.static(path.join(__dirname, 'public')));

    // Endpoint to get JSON data
    app.get('/data', (req, res) => {
      const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data-output/statsOutput.json'), 'utf-8'));
      res.json(data);
    });

    // Route handler for the root URL
    app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });

    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });

    app.use('/node_modules', express.static(path.join(__dirname, '../../node_modules')));
  } catch (err) {
    console.error(err);
    throw new Error(`startServer()`);
  }
}
