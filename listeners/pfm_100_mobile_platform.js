require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { db } = require('../config/firebaseConfig');
const _ = require('lodash');

const MOBILE_PLATFORM_LISTENER = {
    async startMobilePlatformListener(io, PORT) {
        let usersSocketIds = new Map();

        db.collection('pfm_100_mobile_platform').onSnapshot((snapshot) => {
            _.forEach(snapshot.docChanges(), (change) => {
                const record = { ...change.doc.data() };
                const eventData = { type: change.type, record };

                usersSocketIds.forEach((user, socketId) => {
                    if (_.get(user, 'listenerParams.listenObjects', []).includes(record.type)) {
                        io.of('/listener/pfm_100_mobile_platform')
                            .to(socketId)
                            .emit('usersUpdated', eventData);
                    }
                });
            });
        }, (error) => {
            console.error('\x1b[31mFirestore Listener Error:\x1b[0m', error);
        });

        let liveUsers = 0;
        io.of('/listener/pfm_100_mobile_platform').on('connection', (socket) => {
            try {
                const listenerParams = JSON.parse(_.get(socket, 'handshake.query.listenerParams', '{}'));
                usersSocketIds.set(socket.id, { socketId: socket.id, listenerParams });
                liveUsers++;
                console.log(`\x1b[32mClient connected - ( Users count: ${liveUsers} )\x1b[0m`);
            } catch (error) {
                console.error('\x1b[31mError parsing listenerParams:\x1b[0m', error);
                socket.disconnect();
                return;
            }

            socket.on('disconnect', () => {
                usersSocketIds.delete(socket.id);
                liveUsers = _.max([liveUsers - 1, 0]);
                console.log(`\x1b[31mA Client disconnected - Remaining users: ${liveUsers}\x1b[0m`);
            });
        });

        console.log(`\x1b[33mServer started at: http://localhost:${PORT}/listener/pfm_100_mobile_platform/\x1b[0m`);
    }
};

module.exports = MOBILE_PLATFORM_LISTENER;