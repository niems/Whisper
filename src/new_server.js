const app = require('express')();
const socket = require('socket.io');
const hostname = '192.168.86.32';
const port = 8080;


const CONNECTION_STATUS = {
    VERIFIED: 1,            //login successful
    VERIFIED_NEW_ACTIVE_USER: 10, //login successful - added as active user
    VERIFIED_USER_ALREADY_ACTIVE: -10, //login successful err - user already logged in

    /*User 'sign in' errors*/
    INVALID_PASSWORD: -20,   //account exists, password doesn't match
    ACCOUNT_NOT_FOUND: -21,  //account doesn't exist based on user input
}

let activeUsers = []; //current users online - must have account to be an active user
let allUsers = [ //list of all users that have an account - includes all active users
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
    }
]; 

//used for debugging - displays the status of the user connection
function displayConnectionStatus(status, user) {
    let statusMsg = '';
    console.log(`\nLogin attempt: ${user.data.username} @ ${user.ip}`);    

    switch (status) {
        case CONNECTION_STATUS.VERIFIED:
            statusMsg = 'Login successful';
            break;

        case CONNECTION_STATUS.INVALID_PASSWORD:
            statusMsg = 'Login failed: invalid password - does not match based on account username';
            break;

        case CONNECTION_STATUS.ACCOUNT_NOT_FOUND:
            statusMsg = 'Login failed: no account found with username "' + user.data.username + '"'; 
            break;
        
        case CONNECTION_STATUS.VERIFIED_USER_ALREADY_ACTIVE:
            statusMsg = 'Login failed: Current username is already active';
            break;

        case CONNECTION_STATUS.VERIFIED_NEW_ACTIVE_USER:
            statusMsg = 'Login successful: added to active user list';
            break;
    }

    return statusMsg;
}

function updateUserIpInfo(storedUserIp, user) {
    for(let i = 0; i < storedUserIp.length; i++) { //goes through all ip addresses user has used to login
        if ( storedUserIp[i].address === user.ip ) { //ip found - previously used to login
            storedUserIp[i].lastLogin = new Date(); //updates date ip was last used

            return storedUserIp;
        }
    }

    //current ip not found - adds ip w/login date
    storedUserIp.unshift({
        address: user.ip,
        lastLogin: new Date()
    });

    return storedUserIp;
}

//checks if the user is currently active
function isActiveUser(user) {
    for(let i = 0; i < activeUsers.length; i++) {
        if ( activeUsers[i].username === user.data.username ) { //user is already active - trying to login more than once
            return CONNECTION_STATUS.VERIFIED_USER_ALREADY_ACTIVE; 
        }
    }

    //adds new active user
    activeUsers.unshift({
        username: user.data.username,
        ip: user.ip,
        socketId: user.socketId
    });

    return CONNECTION_STATUS.VERIFIED_NEW_ACTIVE_USER;
}

//checks if user already has an account (stored in all users) or if new account
function doesUserAccountExist(user) {
    try {
        if ( !user.data.newUser ) { //unique ID is 'username' - indicates isn't new account
            for(let i = 0; i < allUsers.length; i++) {
                if ( allUsers[i].username === user.data.username ) { //username found

                    if ( allUsers[i].pass === user.data.pass ) { //password matches username
                        allUsers[i].ip = updateUserIpInfo( allUsers[i].ip, user ); //returns updated user ip info

                        return CONNECTION_STATUS.VERIFIED; //login successful
                    }

                    else { //password doesn't match username
                        return CONNECTION_STATUS.INVALID_PASSWORD; 
                    }
                }
            }

            return CONNECTION_STATUS.ACCOUNT_NOT_FOUND; //no account with username provided
        }
    
        else { //unique ID is 'email' - new user account

        }
    }
    catch(err) {
        console.log(`Server.js doesUserAccountExist(): ${err.message}`);
    }    
}

//determines status of connected user
function checkUserData(user) {
    let status = doesUserAccountExist( user ); //returns status of connected user - verifies username/email & password
    //displayConnectionStatus( status, user ); //debugging - outputs status of connection w/user info

    if ( status === CONNECTION_STATUS.VERIFIED ) { //login successful
        let activeStatus = isActiveUser( user );    //checks if the user is already logged in - adds to active list if not
        //displayConnectionStatus( activeStatus, user );

        if ( activeStatus === CONNECTION_STATUS.VERIFIED_NEW_ACTIVE_USER ) { //login successful - user added to active list
            return CONNECTION_STATUS.VERIFIED; //connection & user account fully verified
        }

        else {
            return CONNECTION_STATUS.VERIFIED_USER_ALREADY_ACTIVE; //login failed - account already logged in
        }
    }

    else { //account exist error
        return status; //displayConnectionStatus( status, user ); //returns error msg
    }
}



let server = app.listen(port, hostname, () => {
    let address = server.address().address;
    let family = server.address().family;
    let port = server.address().port;

    console.log('Server info: ');
    console.log(`-family: ${family}`)
    console.log(`-listening on ${address} : ${port}`);
});

let io = socket(server);

//listens for user connections
io.on('connection', (socket) => {
    let user = {
        data: JSON.parse(socket.handshake.query.userData), //data passed from client {newUser(bool), email(new user only), username, pass}
        ip: socket.handshake.address,
        socketId: socket.id
    };

    let status = checkUserData(user); //determines status of the connected user
    let statusMsg = displayConnectionStatus( status, user ); //gets final connection status message

    console.log(statusMsg);

    if ( status === CONNECTION_STATUS.VERIFIED ) {
        //send new user active user list
        //send active users new user info
    }

    else {
        // emit login failed event to user w/error message from server
        
    }
});