const express = require('express');
const cors = require('cors');
const transciptRoutes = require('./routes/transciptRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(express.json());
app.use(cors({ 
    origin: ['*'], 
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

app.use('/api', transciptRoutes);

app.use(errorHandler);

module.exports = app;
