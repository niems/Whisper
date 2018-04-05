const fs = require('fs');
const app = require('express')();
const socket = require('socket.io');

const hostname = '192.168.86.32';
const port = '8080';
const DEBUG = true;
let io = undefined;
let allUsers = undefined; //stores account data for all users - probably should store this in a DB instead of a file
let activeUsers = []; //stores the current users' data

const userAccountsPath = 'user_accounts.txt';
const STATUS = {
    INITIAL_CONNECTION: 1,
};

//returns user accounts
function loadUserAccounts(path) {
    try {
        let fileData = fs.readFileSync(path, {encoding: 'utf8', flag: 'a+'});
        console.log('Succesfully loaded user accounts\n');
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
    console.log(`Image path: ${data.user.image}`);
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
            image: 'N/A',
            ip: {
                address: socket.handshake.address,
                mostRecentTimestamp: date.toLocaleDateString() + ' @ ' + date.toLocaleTimeString(),
                totalConnections: 'N/A',
            }
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
        let fileData = loadUserAccounts( userAccountsPath );

        if ( DEBUG ) {
            let fileLength = fileData.length;
            console.log(`File data length: ${fileData.length}`);

            if ( fileLength > 0 ) {
                console.log('*Successfully loaded user accounts');
                console.log(`${fileData}\n`);
            }

        }

        io.on('connection', (socket) => {
            console.log(`\n\n************************************************`);
            console.log('Initial connect...');
            
            let userData = getSocketData( socket ); //pulls all user/socket data from the initial connection
            displayUserData( userData );
    
            socket.on('disconnect', () => {
                console.log('Socket disconnect');
                socket.handshake.query = {
                    userData: {
                        newUser: false,
                        email: userData.user.email,
                        username: userData.user.username,
                        pass: userData.user.pass
                    }
                };

                displayUserData( userData );
                console.log(`\n************************************************\n`);
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