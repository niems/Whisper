const express = require('express');
const app = express();
const socket = require('socket.io');

let server = app.listen(8080, () => {
    let host = server.address().address;
    let port = server.address().port;

    console.log(`Server listening on ${host} : ${port}`);
});

let io = socket(server);

io.on('connection', (socket) => {
    console.log(`Connection ID: ${socket.id}`);

    let newUser = {
        id: socket.id,
        name: 'rando connector'
    };

    socket.emit('CONNECTED_TO_SERVER', newUser);
});
