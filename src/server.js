const app = require('express')();
const socket = require('socket.io');
const port = 8080;

function addNewUser(userInfo) {
    allUsers.push(
        {
            email: userInfo.email,
            username: userInfo.username,
            pass: userInfo.pass
        }
    );
}

function addActiveUser(user) {
    for(let i = 0; i < activeUsers.length; i++) {
        if ( activeUsers[i].username === user.username ) { //user is already in active list

            if ( activeUsers[i].socketID !== user.socketID ) { //socket ID for active user has changed
                activeUsers[i].socketID = user.socketID; //updates socket ID
            }

            return; //exits function - user doesn't need to be added to list
        }
    }

    //adds new active user
    console.log(`addActiveUser - ${user.username}: ${user.socketID}`);

    activeUsers.push({
        username: user.username,
        socketID: user.socketID
    });
}

function removeActiveUser(id) {
    console.log( JSON.stringify(activeUsers) );
    
    for(let i = 0; i < activeUsers.length; i++) {
        if ( activeUsers[i].socketID === id ) {
            activeUsers.splice(i, 1); //removes the disconnected user
            break;
        }
    }

    console.log( JSON.stringify(activeUsers) );
}

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

        addNewUser(user); //stores new user info
    }

    addActiveUser({
        username: user.username,
        socketID: socket.id
    }); //adds active user to list

    console.log(`${user.username} connected: ${socket.id}`);

    socket.on('disconnect', () => {
        removeActiveUser(socket.id); //removes from active user list
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