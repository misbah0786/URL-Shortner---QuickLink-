const express = require('express');
const { nanoid } = require('nanoid');
const Url = require('../models/Url');

const router = express.Router();
const validHttpUrl = (value) => {
  try {
    const parsed = new URL(value);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

// List recent links for the dashboard.
router.get('/', async (req, res, next) => {
  try {
    const urls = await Url.find().sort({ createdAt: -1 }).limit(100).lean();
    res.json({ urls });
  } catch (error) { next(error); }
});

// Create a short link. An optional custom alias can be supplied.
router.post('/', async (req, res, next) => {
  try {
    const originalUrl = String(req.body.originalUrl || '').trim();
    const requestedAlias = String(req.body.customAlias || '').trim();

    if (!validHttpUrl(originalUrl)) {
      return res.status(400).json({ message: 'Enter a valid URL beginning with http:// or https://.' });
    }
    if (requestedAlias && !/^[a-zA-Z0-9_-]{3,30}$/.test(requestedAlias)) {
      return res.status(400).json({ message: 'Custom aliases must be 3–30 characters and use only letters, numbers, - or _.' });
    }

    const shortCode = requestedAlias || nanoid(7);
    const existing = await Url.findOne({ shortCode });
    if (existing) return res.status(409).json({ message: 'That short code is already taken. Try another one.' });

    const url = await Url.create({ originalUrl, shortCode });
    res.status(201).json({ url });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'That short code is already taken.' });
    next(error);
  }
});

// Delete a saved short link.
router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await Url.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Link not found.' });
    res.json({ message: 'Link deleted.' });
  } catch (error) { next(error); }
});

module.exports = router;
