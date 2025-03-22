require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const http = require('http');
const socketIo = require('socket.io');
const { db } = require('../config/firebaseConfig');


const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

const MOBILE_PLATFORM_LISTENER_PORT = process.env.MOBILE_PLATFORM_LISTENER_PORT;

const server = http.createServer(app);
const io = socketIo(server, {
    cors: { origin: '*' }
});

let usersSocketIds = [];

db.collection('pfm_100_mobile_platform').onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
        let record = { id: change.doc.id, ...change.doc.data() };

        let eventData = null;
        if (change.type === 'added') {
            eventData = { type: 'new', record };
        } else if (change.type === 'modified') {
            eventData = { type: 'update', record };
        } else if (change.type === 'removed') {
            eventData = { type: 'delete', record };
        }

        if (eventData) {
            // Send only to sockets with the "players" role
            usersSocketIds.forEach((user) => {
                if (user['listenerParams']['listenObjects'].includes(eventData['record']['type'])) {
                    io.to(user['socketId']).emit('usersUpdated', eventData);
                }
            });
        }

    });
});

let liveUsers = 0
io.on('connection', (socket) => {
    usersSocketIds.push({
        socketId: socket.id,
        listenerParams: JSON.parse(socket['handshake']['query']['listenerParams'])
    });

    liveUsers = liveUsers + 1
    console.log('Client connected - users count', liveUsers);

    socket.on('disconnect', () => {
        usersSocketIds.splice(usersSocketIds.findIndex(rec => rec['socketId'] === socket.id), 1);
        liveUsers = liveUsers - 1
        console.log('Client disconnected');
    });
});


server.listen(MOBILE_PLATFORM_LISTENER_PORT, () => {
    console.log(`Server running on port http://localhost:${MOBILE_PLATFORM_LISTENER_PORT}`);
});