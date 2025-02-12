const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(bodyParser.json());  // Parse incoming JSON requests

app.use('/api', userRoutes);  // Use user routes

module.exports = app;
