import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import fs from 'fs';

const app = express();
const port = 3004;

// __dirname setup (Penting untuk ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. CORS - Tambahkan localhost:3003 juga agar bisa akses dirinya sendiri jika perlu
app.use(cors({
  origin: [
    'http://localhost:3000', 
    "http://127.0.0.1:8000",
    "http://localhost:8000",
    'http://localhost:3003', // Tambahkan ini jika testing antar port
    'https://pureday-invitation.vercel.app',
    'https://www.puredayinvitation.my.id', 
    'https://puredayinvitation.my.id',
    'https://template-pureday-invitation.vercel.app'
  ]
}));

app.use(express.json());

// 2. Route API untuk scan folder music
// Endpoint: http://localhost:3003/api/get-music
app.get('/api/get-music', (req, res) => {
    // Gunakan __dirname agar path absolut ke folder music benar
    const directoryPath = path.join(__dirname, 'music');
    
    try {
        if (!fs.existsSync(directoryPath)) {
            return res.status(404).json({ error: "Folder music tidak ditemukan" });
        }

        const files = fs.readdirSync(directoryPath);
        const mp3Files = files.filter(file => file.endsWith('.mp3'));
        res.status(200).json(mp3Files);
    } catch (err) {
        res.status(500).json({ error: "Gagal membaca folder musik" });
    }
})

// Static folders
app.use(express.static(path.join(__dirname, 'templates-more')));



app.use('/music', express.static(path.join(__dirname, 'music')));
app.use('/templates', express.static(path.join(__dirname, 'templates')));

// Route index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'index.html'));
});

// Route untuk templates dinamis
app.get('/:name', (req, res) => {
  const { name } = req.params;
  // Pastikan path ke .html benar sesuai struktur folder kamu
  res.sendFile(
    path.join(__dirname, 'templates', name, `${name}.html`),
    (err) => {
      if (err) {
        res.status(404).send('File template tidak ditemukan!');
      }
    }
  );
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});