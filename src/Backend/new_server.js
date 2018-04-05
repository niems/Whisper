const fs = require('fs');
const app = require('express')();
const socket = require('socket.io');

const hostname = '192.168.86.32';
const port = '8080';
let io = undefined;
let allUsers = undefined;
let activeUsers = undefined;

const STATUS = {
    INITIAL_CONNECTION: 1,
};

//returns a string with the connection status msg
function getConnectionStatusMsg(status) {
    let statusMsg = '';

    switch(status) {
        case STATUS.INITIAL_CONNECTION:
            statusMsg = 'Initial connection to server';
            break;
        
        default:
            statusMsg = 'Message for this status UNDEFINED';
    }

    return statusMsg;
}

//displays all the data for the current user (passes userData from main() )
function displayUserData(data) {
    console.log('\n-----USER DATA-----');

    console.log(`Username: ${data.user.username}`);
    console.log(`IP: ${data.user.ip.address}`);
    console.log(`Total connections from this IP: ${data.user.ip.totalConnections}`);
    console.log(`Socket id: ${data.user.socketId}`);
    console.log(`Connecting as new user: ${data.user.newUser}`);
    console.log(`Email: ${data.user.email}`);
    console.log(`Password: ${data.user.pass}`);
    console.log(`Connection status: ${data.status.code}`);
    console.log(`Connection status msg: ${data.status.msg}`);

    console.log('-----END USER DATA-----\n');
}

function getSocketData(socket) {
    let date = new Date();
    let socketData = JSON.parse(socket.handshake.query.userData);
    let userData = {
        user : {
            newUser: socketData.newUser,
            email: (socketData.newUser ? socketData.email : 'N/A'),
            username: socketData.username,
            pass: socketData.pass,
            socketId: socket.id,
            ip: {
                address: socket.handshake.address,
                mostRecentTimestamp: date.toLocaleDateString() + ' @ ' + date.toLocaleTimeString(),
                totalConnections: 1,
            }
        },
        status: {
            code: STATUS.INITIAL_CONNECTION,
            msg: 'N/A'
        }
    };

    return userData; //returns the user data from the initial server connect
}

function main() {
    io.on('connection', (socket) => {
        console.log(`\n\n************************************************\n`);
        console.log('Initial connect...');
        
        let userData = getSocketData( socket ); //pulls all user/socket data from the initial connection
        userData.status.msg = getConnectionStatusMsg( userData.status.code ); //updates the connection status message
        displayUserData( userData );

        socket.on('disconnect', () => {
            console.log('Socket disconnect');
            displayUserData( userData );
            console.log(`\n************************************************\n`);
        });

    });  
}

const server = app.listen(port, hostname, () => {
    let address = server.address().address;
    let family = server.address().family;
    let port = server.address().port;

    console.log('The server is listening...');
    console.log(`-Family: ${family}`);
    console.log(`-Address: ${address}`);
    console.log(`-Port: ${port}\n`);

    io = socket(server);
    main();
});