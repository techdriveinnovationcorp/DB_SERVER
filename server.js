const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const uuidRoutes = require('./routes/uuidRoutes');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

const SERVER_PORT = process.env.SERVER_PORT;

// Use Routes
app.use('/pfm_100_mobile_platform', userRoutes);
app.use('/getUUID', uuidRoutes);

app.listen(SERVER_PORT, () => {
  console.log(`\x1b[32mServer running at http://localhost:${ SERVER_PORT}/users\x1b[0m`);
});