const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const designerDbRoute = require('./routes/designerDbRoutes');
const uuidRoutes = require('./routes/uuidRoutes');
const MOBILE_PLATFORM_LISTENER = require('./listeners/pfm_100_mobile_platform')
require('dotenv').config();

const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: { origin: '*' }
});

app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

const SERVER_PORT = process.env.SERVER_PORT;

// Use Routes
app.use('/pfm_100_mobile_platform', userRoutes);
app.use('/pfm_100_formula', userRoutes);
app.use('/pfm_100_meta_info', userRoutes);
app.use('/pfm_100_designer', designerDbRoute);
app.use('/getUUID', uuidRoutes);

// starting listeners
console.log(`\x1b[33m\x1b[4mAvailable Listeners\x1b[0m`);
MOBILE_PLATFORM_LISTENER.startMobilePlatformListener(io, SERVER_PORT);

server.listen(SERVER_PORT, () => {
  console.log(`\x1b[32m\x1b[4mAvailable Routes\x1b[0m`);
  console.log(`\x1b[32mhttp://localhost:${ SERVER_PORT}/pfm_100_mobile_platform/\x1b[0m`);
  console.log(`\x1b[32mhttp://localhost:${ SERVER_PORT}/pfm_100_formula/\x1b[0m`);
  console.log(`\x1b[32mhttp://localhost:${ SERVER_PORT}/pfm_100_meta_info/\x1b[0m`);
  console.log(`\x1b[32mhttp://localhost:${ SERVER_PORT}/pfm_100_designer/\x1b[0m`);
});