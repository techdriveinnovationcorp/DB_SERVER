require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const { db } = require('../config/firebaseConfig');

const MOBILE_PLATFORM_LISTENER = {
   async startMobilePlatformListener (io, PORT) {

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
                    usersSocketIds.forEach((user) => {
                        if (user['listenerParams']['listenObjects'].includes(eventData['record']['type'])) {
                            io.of('/listener/pfm_100_mobile_platform').to(user['socketId']).emit('usersUpdated', eventData);
                        }
                    });
                }
        
            });
        });
        
        let liveUsers = 0
        io.of('/listener/pfm_100_mobile_platform').on('connection', (socket) => {
            usersSocketIds.push({
                socketId: socket.id,
                listenerParams: JSON.parse(socket['handshake']['query']['listenerParams'])
            });
        
            liveUsers = liveUsers + 1

            console.log(`\x1b[32mClient connected - ( users count ) ===> \x1b[33m${liveUsers}\x1b[0m`);

            socket.on('disconnect', () => {
                usersSocketIds.splice(usersSocketIds.findIndex(rec => rec['socketId'] === socket.id), 1);
                liveUsers = liveUsers - 1
                console.log(`\x1b[31m A Client disconnected\x1b[0m`);
            });
        });

        console.log(`\x1b[33mhttp://localhost:${PORT}/listener/pfm_100_mobile_platform/\x1b[0m`);
    }
}

module.exports = MOBILE_PLATFORM_LISTENER;
