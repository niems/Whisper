const app = require('express')();
const socket = require('socket.io');
const port = 8080;

//returns the server once it's listening on the port
let allUsers = []; //list of active and inactive users - appended to when new user connects
let activeUsers = []; //list of current active users - stores username & socket ID
let server = app.listen(port, () => {
    let localPort = server.address().port;
    let address = server.address().address;

    console.log(`Server listening on ${address} : ${localPort}`);
});

let io = socket(server);

//listens for user connections
io.on('connection', (socket) => {
    let user = JSON.parse(socket.handshake.query.userData);
    
    console.log(`New user: ${user.newUser}`);
    console.log(`Username: ${user.username}`);
    console.log(`Password: ${user.pass}`);

    if( user.newUser ) { //email only supplied if connected user is new
        console.log(`Email: ${user.email}`);
    }

    console.log(`${user.username} connected: ${socket.id}`);

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

























/*
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
*/