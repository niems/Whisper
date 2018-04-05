const fs = require('fs');
const app = require('express')();
const socket = require('socket.io');

const hostname = '192.168.86.32';
const port = '8080';
const DEBUG = true;
let io = undefined;
let allUsers = []; //stores account data for all users - probably should store this in a DB instead of a file
let activeUsers = []; //stores the current users' data

const userAccountsPath = 'user_accounts.txt';
const STATUS = {
    INITIAL_CONNECTION: 1,

    error: {
        /**NEW ACCOUNT ERRORS */
        EMAIL_TAKEN: -1,
        USERNAME_TAKEN: -10,
    }
};

//returns user accounts
function loadUserAccounts(path) {
    try {
        let fileData = fs.readFileSync(path, {encoding: 'utf8', flag: 'a+'});

        if ( DEBUG ) {
            console.log(`File data length: ${fileData.length}`);

            if ( fileLength > 0 ) {
                console.log('*Successfully loaded user accounts');
                console.log(`${fileData}\n`);
            }
        }

        return fileData;
    }
    catch(err) {
        console.log(`ERR server.js loadUserAccounts(): ${err.message}`);
    }
}

//returns a string with the connection status msg
function getConnectionStatusMsg(status) {
    let statusMsg = '';

    switch(status) {
        case STATUS.INITIAL_CONNECTION:
            statusMsg = 'Initial connection to server';
            break;
        
        case STATUS.error.EMAIL_TAKEN:
            statusMsg = 'Email already in use for another account';
        
        default:
            statusMsg = 'Message for this status UNDEFINED';
    }

    return statusMsg;
}

//displays all the data for the current user (passes userData from main() )
function displayUserData(data) {
    console.log('\n-----USER DATA-----');

    console.log(`Connecting as new user: ${data.user.newUser}`);    
    console.log(`Username: ${data.user.username}`);
    console.log(`Password: ${data.user.pass}`);
    console.log(`Image path: ${data.user.image}`);
    console.log(`Email: ${data.user.email}\n`);

    console.log(`Socket id: ${data.user.socketId}`);
    console.log(`IP: ${data.user.ip[0].address}`);
    console.log(`Total connections from this IP: ${data.user.ip[0].totalConnections}\n`);

    console.log(`Connection status: ${data.status.code} ---> ${data.status.msg}`);
    console.log('-----END USER DATA-----\n');
}

//determines to create a new user account
function verifyNewAccountInfo(userData) {
    for(let i = 0; i < allUsers.length; i++) {

        if ( allUsers[i].user.email === userData.user.email ) { //email active on another account
            userData.status.code = STATUS.error.EMAIL_TAKEN;
            userData.status.msg = getConnectionStatusMsg( userData.status.code );
            return userData;
        }

        else if ( allUsers[i].user.username === userData.user.username ) { //username active on another account
             userData.status.code = STATUS.error.USERNAME_TAKEN;
             userData.status.msg = getConnectionStatusMsg( userData.status.code );
             return userData;
        }

    }
}

//determines if the user's login/sign up is valid - returns updated status & info
function verifyUserConnection(userData) {
    if ( userData.user.newUser ) {
        console.log('Attempting to create a new account');
        userData = verifyNewAccountInfo( userData );
    }

    else {
        console.log('Attempting to access user account');
    }

    return userData;
}

function onSocketConnect(socket) {
    console.log(`\n\n************************************************`);
    console.log('Initial connect...');
    
    let userData = getSocketData( socket ); //pulls all user/socket data from the initial connection
    displayUserData( userData );
    
    userData = verifyUserConnection( userData ); //confirms/rejects user login/sign up info

    return userData;
}

function onSocketDisconnect(userData) {
    console.log('Socket disconnect');
    displayUserData( userData );
    console.log(`\n************************************************\n`);
}

function getSocketData(socket) {
    let date = new Date();
    let socketData = JSON.parse(socket.handshake.query.userData);
    let userData = {
        user : {
            newUser: socketData.newUser,
            email: socketData.newUser ? socketData.email : 'N/A',
            username: socketData.username,
            pass: socketData.pass,
            socketId: socket.id,
            image: 'N/A',
            ip: [{
                address: socket.handshake.address,
                mostRecentTimestamp: date.toLocaleDateString() + ' @ ' + date.toLocaleTimeString(),
                totalConnections: 'N/A',
            }]
        },
        status: {
            code: STATUS.INITIAL_CONNECTION,
            msg: getConnectionStatusMsg( STATUS.INITIAL_CONNECTION ) //sets the initial connection status message
        }
    };

    return userData; //returns the user data from the initial server connect
}

function main() {
    try {
        let fileData = loadUserAccounts( userAccountsPath ); //loads users' account data if it exists

        io.on('connection', (socket) => {
            let userData = onSocketConnect( socket ); //initial user connection - returns user data & connection status code/msg
           
            socket.on('disconnect', () => {
                onSocketDisconnect( userData );
            });
    
        });  
    }
    catch(err) {
        console.log(`ERR server.js main(): ${err.message}`);
    }
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