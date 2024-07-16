const express = require('express');
const mongoose = require('mongoose');
const handshake = require('./routes/handshake');
const auth = require('./routes/auth');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/handshake', handshake);
app.use('/auth', auth);

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Failed to connect to MongoDB:', err));

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});