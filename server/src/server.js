require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Url = require('./models/Url');
const urlRoutes = require('./routes/urlRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '10kb' }));
app.use('/api/urls', urlRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'QuickLink API' }));

// Redirect and count clicks.
app.get('/:shortCode', async (req, res, next) => {
  try {
    const url = await Url.findOneAndUpdate(
      { shortCode: req.params.shortCode },
      { $inc: { clicks: 1 }, $set: { lastClickedAt: new Date() } },
      { new: true }
    );
    if (!url) return res.status(404).send('This short link does not exist.');
    return res.redirect(302, url.originalUrl);
  } catch (error) { next(error); }
});

app.use((req, res) => res.status(404).json({ message: 'Route not found.' }));
app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: 'Something went wrong on the server.' });
});


mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () =>
      console.log(`QuickLink API running at http://localhost:${PORT}`)
    );
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  });
