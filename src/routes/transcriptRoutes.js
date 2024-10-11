const express = require('express');
const router = express.Router();
const { string, plaintext, timestamps } = require('../controller/transciptController');

router.get('/string/:id', string);
router.get('/plaintext/:id', plaintext);
router.get('/timestamps/:id', timestamps);

module.exports = router;
