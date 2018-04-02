const fs = require('fs');
const app = require('express')();
const socket = require('socket.io');
//const hostname = '68.71.67.108';
const hostname = '192.168.86.32';
const port = 8080;

const userAccountsPath = 'user_accounts.txt';


const CONNECTION_STATUS = {
    VERIFIED: 1,            //login successful
    VERIFIED_NEW_ACTIVE_USER: 10, //login successful - added as active user

    error: {
        CURRENTLY_LOGGED_IN: -10,//login successful err - user already logged in

        /**User 'sign up' errors */
        EMAIL_TAKEN: -30,       //email already exists
        USERNAME_TAKEN: -31,   //username already exists

        /*User 'sign in' errors*/
        INVALID_PASSWORD: -20,   //account exists, password doesn't match
        ACCOUNT_NOT_FOUND: -21,  //account doesn't exist based on user input
    }    
};

let activeUsers = []; //current users online - must have account to be an active user
let allUsers = [ //list of all users that have an account - includes all active users
    /*
    {
        username: 'ni3ms',
        pass: '1234',
        email: 'ni3ms@gmail.com',
        ip: [ //adds new ip and login date if not already logged
            {
                address: '192.168.0.1', 
                lastLogin: new Date() //updates loginDate for ip
            }
        ],
    },
   */
]; 

function saveUserAccountInfo() {
    try {
        fs.writeFile(userAccountsPath, JSON.stringify(allUsers), (err) => {
            if (err) {
                console.log(`ERR server.js saveUserAccountInfo(): ${err.message}`);
                return;
            }
    
            console.log('New user account saved');
        });
    }
    catch(err) {
        console.log(`ERR server.js saveUserAccountInfo(): ${err.message}`);
    }
}

function loadUserAccounts() {
    try {
        fs.readFile(userAccountsPath, 'utf8', (err, data) => {
            if (err) {
                console.log(`ERR server.js loadUserAccounts(): ${err.message}`);
                return;
            }

            allUsers = JSON.parse(data); //stores all the user accounts for login verification
            console.log('User accounts successfully loaded');
        });
    }
    catch(err) {
        console.log(`ERR server.js loadUserAccounts(): ${err.message}`);
    }
}

function removeActiveUser(id) {
    console.log( JSON.stringify(activeUsers) );

    for(let i = 0; i < activeUsers.length; i++) {
        if ( activeUsers[i].socketId === id ) { //disconnected user found
            activeUsers.splice(i, 1); //removes disconnected user
            return true; //active user removed
        }
    }

    return false; //active user not found
}

//used for debugging - displays the status of the user connection
function displayConnectionStatus(status, user) {
    let statusMsg = '';
    console.log(`\nLogin attempt: ${user.data.username} @ ${user.ip}`);    

    switch (status) {
        case CONNECTION_STATUS.VERIFIED:
            statusMsg = 'Login successful';
            break;

        case CONNECTION_STATUS.VERIFIED_NEW_ACTIVE_USER:
        statusMsg = 'Login successful: added to active user list';
        break;

        case CONNECTION_STATUS.error.INVALID_PASSWORD:
            statusMsg = 'Login failed: invalid password - does not match based on account username';
            break;

        case CONNECTION_STATUS.error.ACCOUNT_NOT_FOUND:
            statusMsg = 'Login failed: no account found with username "' + user.data.username + '"'; 
            break;
        
        case CONNECTION_STATUS.error.CURRENTLY_LOGGED_IN:
            statusMsg = 'Login failed: Current username is already active';
            break;

        case CONNECTION_STATUS.error.EMAIL_TAKEN:
            statusMsg = 'Account creation failed: email address already active on another account.';
            break;
        
        case CONNECTION_STATUS.error.USERNAME_TAKEN:
            statusMsg = 'Account creation failed: username already active on another account';
            break;
    }

    return statusMsg;
}

function updateUserIpInfo(storedUserIp, user) {
    let date = new Date();
    let dateInfo = date.toLocaleDateString() + ' @ ' + date.toLocaleTimeString();

    for(let i = 0; i < storedUserIp.length; i++) { //goes through all ip addresses user has used to login
        if ( storedUserIp[i].address === user.ip ) { //ip found - previously used to login
            storedUserIp[i].lastLogin = dateInfo; //updates date ip was last used

            return storedUserIp;
        }
    }

    //current ip not found - adds ip w/login date
    storedUserIp.unshift({
        address: user.ip,
        lastLogin: dateInfo
    });

    return storedUserIp;
}

function addNewUserAccount(user) {
    try {
        let date = new Date();
        let dateInfo = date.toLocaleDateString() + ' @ ' + date.toLocaleTimeString();

        allUsers.unshift({
            username: user.data.username,
            pass: user.data.pass,
            email: user.data.email,
            ip: [
                {
                    address: user.ip,
                    lastLogin: dateInfo
                }
            ]
        });

        saveUserAccountInfo(); //saves the new user info
    }
    catch(err) {
        console.log(`ERR - Server.js addNewUserAccount(): ${err.message}`);
    }
}

function addActiveUser(user) {
    activeUsers.unshift({
        username: user.data.username,
        ip: user.ip,
        status: 'online',
        socketId: user.socketId
    });
}

//checks if the user is currently active
function isActiveUser(user) {
    for(let i = 0; i < activeUsers.length; i++) {
        if ( activeUsers[i].username === user.data.username ) { //user is already active - trying to login more than once
            return CONNECTION_STATUS.error.CURRENTLY_LOGGED_IN; 
        }
    }

    //adds new active user
    addActiveUser(user);

    return CONNECTION_STATUS.VERIFIED_NEW_ACTIVE_USER;
}

//checks if user already has an account (stored in all users) or if new account
function doesUserAccountExist(user) {
    try {
        if ( !user.data.newUser ) { //unique ID is 'username' - indicates isn't new account
            console.log('Previous user logging in');
            for(let i = 0; i < allUsers.length; i++) {
                if ( allUsers[i].username === user.data.username ) { //username found

                    if ( allUsers[i].pass === user.data.pass ) { //password matches username
                        allUsers[i].ip = updateUserIpInfo( allUsers[i].ip, user ); //returns updated user ip info

                        return CONNECTION_STATUS.VERIFIED; //login successful
                    }

                    else { //password doesn't match username
                        return CONNECTION_STATUS.error.INVALID_PASSWORD;
                    }
                }
            }

            return CONNECTION_STATUS.error.ACCOUNT_NOT_FOUND; //no account with username provided
        }
    
        else { //unique ID is 'email' - new user account
            console.log('Creating new user account');
            //goes through all users - ensure email & username are both unique
            for(let i = 0; i < allUsers.length; i++) {
                if ( allUsers[i].email === user.data.email ) { //email already being used
                    console.log('verifying email');
                    return CONNECTION_STATUS.error.EMAIL_TAKEN;
                }

                else if ( allUsers[i].username === user.data.username ) { //username already being used
                    return CONNECTION_STATUS.error.USERNAME_TAKEN;
                }
            }

            addNewUserAccount(user); //adds new user account to DB
            return CONNECTION_STATUS.VERIFIED; //account successfully created
        }
    }
    catch(err) {
        console.log(`Server.js doesUserAccountExist(): ${err.message}`);
    }    
}

//determines status of connected user
function checkUserData(user) {
    let status = doesUserAccountExist( user ); //returns status of connected user - verifies username/email & password

    if ( status === CONNECTION_STATUS.VERIFIED ) { //login successful
        let activeStatus = isActiveUser( user );    //checks if the user is already logged in - adds to active list if not

        if ( activeStatus === CONNECTION_STATUS.VERIFIED_NEW_ACTIVE_USER ) { //login successful - user added to active list
            return CONNECTION_STATUS.VERIFIED; //connection & user account fully verified
        }

        else {
            return CONNECTION_STATUS.error.CURRENTLY_LOGGED_IN; //login failed - account already logged in
        }
    }

    else { //account exist error
        return status; 
    }
}

function sendConnectionStatusMessages(status, user, socket) {
    let statusMsg = displayConnectionStatus( status, user ); //gets final connection status message

    console.log(statusMsg);
    
    if ( status === CONNECTION_STATUS.VERIFIED ) {
        let connectMsg = user.data.username + ' has connected';
        let date = new Date();
        let id =   ( Math.floor( Math.random() * 1000 ) ).toString() + date.getDay() + date.getHours().toString() + date.getSeconds().toString();

        let message = {
            username: user.data.username,
            socketId: socket.id,
            msgId: id,
            msg: connectMsg,
            receiveTime: date.toLocaleTimeString()
        };

        let newUser = {
            username: user.data.username,
            status: 'online',
            socketID: socket.id
        };

        //send new user active user list
        socket.emit('active users list', JSON.stringify(activeUsers) );

        //send active users new user info
        socket.broadcast.emit('active user update', JSON.stringify(newUser) );

        //sends 'connected' message to active users
        socket.broadcast.emit('chat message', JSON.stringify(message) );
    }

    else {
        // emit login failed event to user w/error message from server
        socket.emit('CONNECTION FAILED', statusMsg);
    }
}

function onUserDisconnect(user, socket) {
    console.log(`${user.data.username} disconnected from server`);
    //only sends disconnect message if the user was previously active
    if ( removeActiveUser(socket.id) ) {
        let connectMsg = user.data.username + ' has disconnected';
         let date = new Date();
        let id =   ( Math.floor( Math.random() * 1000 ) ).toString() + date.getDay() + date.getHours().toString() + date.getSeconds().toString();

        let message = {
            username: user.data.username,
            socketId: socket.id,
            msgId: id,
            msg: connectMsg,
            receiveTime: date.toLocaleTimeString()
        };
        io.emit('active users list', JSON.stringify(activeUsers) );   
        io.emit('chat message', JSON.stringify(message) );
    }
}



/**SERVER CREATION AND CONNECTION MONITORING */
let server = app.listen(port, hostname, () => {
    let address = server.address().address;
    let family = server.address().family;
    let port = server.address().port;

    console.log('Server info: ');
    console.log(`-family: ${family}`)
    console.log(`-listening on ${address} : ${port}`);
});

let io = socket(server);

function main() {
    loadUserAccounts(); //loads all the user accounts for login verification

    //listens for user connections
    io.on('connection', (socket) => {
        let user = {
            data: JSON.parse(socket.handshake.query.userData), //data passed from client {newUser(bool), email(new user only), username, pass}
            ip: socket.handshake.address,
            socketId: socket.id
        };

        let status = checkUserData( user ); //determines status of the connected user
        sendConnectionStatusMessages( status, user, socket );    
    
        socket.on('chat message', (msg) => {
            socket.broadcast.emit('chat message', msg);
        });

        socket.on('disconnect', () => {
            onUserDisconnect(user, socket); 
        });
    });
}

main();
