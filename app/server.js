const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/catatan_plp';

// Middleware
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(methodOverride('_method'));

// Koneksi ke MongoDB (dengan retry, karena container db mungkin belum siap saat web start)
async function connectDB(retries = 10) {
  while (retries > 0) {
    try {
      await mongoose.connect(MONGO_URI);
      console.log('✅ Terhubung ke MongoDB:', MONGO_URI);
      return;
    } catch (err) {
      console.log(`⏳ Menunggu MongoDB siap... (${retries} percobaan tersisa)`);
      retries -= 1;
      await new Promise((res) => setTimeout(res, 3000));
    }
  }
  console.error('❌ Gagal terhubung ke MongoDB setelah beberapa percobaan.');
}
connectDB();

// Schema & Model
const catatanSchema = new mongoose.Schema({
  namaSiswa: { type: String, required: true },
  pertemuan: { type: Number, required: true },
  materi: { type: String, required: true },
  catatan: { type: String, required: true },
  nilai: { type: Number, min: 0, max: 100, default: 0 },
  createdAt: { type: Date, default: Date.now },
});
const Catatan = mongoose.model('Catatan', catatanSchema);

// Routes
app.get('/', async (req, res) => {
  try {
    const daftarCatatan = await Catatan.find().sort({ createdAt: -1 });
    res.render('index', { daftarCatatan, error: null });
  } catch (err) {
    res.render('index', { daftarCatatan: [], error: 'Database belum siap, coba refresh beberapa saat lagi.' });
  }
});

app.get('/tambah', (req, res) => {
  res.render('tambah');
});

app.post('/catatan', async (req, res) => {
  try {
    const { namaSiswa, pertemuan, materi, catatan, nilai } = req.body;
    await Catatan.create({ namaSiswa, pertemuan, materi, catatan, nilai });
    res.redirect('/');
  } catch (err) {
    res.status(500).send('Gagal menyimpan catatan: ' + err.message);
  }
});

app.get('/catatan/:id/edit', async (req, res) => {
  const item = await Catatan.findById(req.params.id);
  res.render('edit', { item });
});

app.put('/catatan/:id', async (req, res) => {
  const { namaSiswa, pertemuan, materi, catatan, nilai } = req.body;
  await Catatan.findByIdAndUpdate(req.params.id, { namaSiswa, pertemuan, materi, catatan, nilai });
  res.redirect('/');
});

app.delete('/catatan/:id', async (req, res) => {
  await Catatan.findByIdAndDelete(req.params.id);
  res.redirect('/');
});

// Health check endpoint (berguna untuk cek container hidup)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', db: mongoose.connection.readyState === 1 ? 'connected' : 'connecting' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di port ${PORT}`);
});
