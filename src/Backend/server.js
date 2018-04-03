const fs = require('fs');
const app = require('express')();
const socket = require('socket.io');
//const hostname = '68.71.67.108';
const hostname = '192.168.86.32';
const port = 8080;

const userAccountsPath = 'user_accounts.txt';
const DEBUG = true;


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

//image reference using client-side formatting
const IMAGES = [
    '/images/user_images/rick.svg',
    '/images/user_images/morty.svg',
    '/images/user_images/cupcake.svg',
    '/images/user_images/cupcake-happy.svg',    
];

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
    for(let i = 0; i < activeUsers.length; i++) {
        if ( activeUsers[i].socketId === id ) { //disconnected user found
            activeUsers.splice(i, 1); //removes disconnected user
            
            console.log( JSON.stringify(activeUsers) );
            return true; //active user removed
        }
    }

    console.log( `Not removed: ${JSON.stringify(activeUsers)}`);
    return false; //active user not found
}

//used for debugging - displays the status of the user connection
function displayConnectionStatus( serverData ) {
    let statusMsg = '';
    console.log(`\nLogin attempt: ${serverData.user.username} @ ${serverData.user.ip}`);    

    switch ( serverData.status ) {
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
            statusMsg = 'Login failed: no account found with username "' + serverData.user.username + '"'; 
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

function addNewUserAccount(serverData) {
    try {
        let date = new Date();
        let dateInfo = date.toLocaleDateString() + ' @ ' + date.toLocaleTimeString();
        let userImgPath = IMAGES[ Math.floor( Math.random() * IMAGES.length ) ]; //not temporary

        serverData.user.image = userImgPath;
        serverData.user.ip = [
            {
                address: serverData.user.ip,
                lastLogin: dateInfo
            }
        ];
        
        allUsers.unshift({
            username: serverData.user.username,
            pass: serverData.user.pass,
            email: serverData.user.email,
            image: serverData.user.image,
            socketId: serverData.user.socketId,
            ip: serverData.user.ip
        });

        saveUserAccountInfo(); //saves the new user info

        return serverData;
    }
    catch(err) {
        console.log(`ERR - Server.js addNewUserAccount(): ${err.message}`);
    }
}

function addActiveUser(user) {
    /**THIS INFORMATION SHOULD BE PULLED WHEN THE ACCOUNT IS VERIFIED */
    
    activeUsers.unshift({
        username: user.username,
        image: user.image,
        ip: user.ip,
        status: 'online',
        socketId: user.socketId
    });

    console.log(`Active user socket id`);
    console.log(`${user.username} | ${user.socketId}\n`);
}

//checks if the user is currently active
function isActiveUser(user) {
    for(let i = 0; i < activeUsers.length; i++) {
        if ( activeUsers[i].username === user.username ) { //user is already active - trying to login more than once
            return CONNECTION_STATUS.error.CURRENTLY_LOGGED_IN; 
        }
    }

    //adds new active user
    addActiveUser(user);

    return CONNECTION_STATUS.VERIFIED_NEW_ACTIVE_USER;
}

//checks if user already has an account (stored in all users) or if new account
function doesUserAccountExist(user, socket) {
    try {

        /*
        allUsers.unshift({
            username: user.data.username,
            pass: user.data.pass,
            email: user.data.email,
            image: userImgPath,
            ip: [
                {
                    address: user.ip,
                    lastLogin: dateInfo
                }
            ]
        });
        */
       let serverData;

        if ( !user.data.newUser ) { //unique ID is 'username' - indicates isn't new account
            console.log('Previous user logging in');
            for(let i = 0; i < allUsers.length; i++) {
                if ( allUsers[i].username === user.data.username ) { //username found

                    if ( allUsers[i].pass === user.data.pass ) { //password matches username
                        allUsers[i].ip = updateUserIpInfo( allUsers[i].ip, user ); //returns updated user ip info
                        allUsers[i].socketId = socket.id; //updates to this session's socket id

                        serverData = {
                            user: {
                                username: allUsers[i].username,
                                pass: allUsers[i].pass,
                                email: allUsers[i].email,
                                image: allUsers[i].image,
                                ip: allUsers[i].ip,
                                socketId: socket.id
                            },
                            status: CONNECTION_STATUS.VERIFIED //login successful                            
                        };

                        return serverData;
                        //return CONNECTION_STATUS.VERIFIED; //login successful
                    }

                    else { //password doesn't match username
                        serverData = {
                            user: {
                                username: user.data.username,
                                pass: user.data.pass,
                                email: '',
                                image: '',
                                ip: user.ip,
                                socketId: socket.id
                            },
                            status: CONNECTION_STATUS.error.INVALID_PASSWORD
                        };
                    }

                        return serverData;
                        //return CONNECTION_STATUS.error.INVALID_PASSWORD;
                }
            }

            serverData = {
                user: {
                    username: user.data.username,
                    pass: user.data.pass,
                    email: '',
                    image: '',
                    ip: user.ip,
                    socketId: socket.id
                },
                status: CONNECTION_STATUS.error.ACCOUNT_NOT_FOUND //no account with username provided
            };
            
            return serverData;
            //return CONNECTION_STATUS.error.ACCOUNT_NOT_FOUND; //no account with username provided
        }
    
        else { //unique ID is 'email' - new user account
            console.log('Creating new user account');
            //goes through all users - ensure email & username are both unique
            for(let i = 0; i < allUsers.length; i++) {
                if ( allUsers[i].email === user.data.email ) { //email already being used
                    
                    serverData = {
                        user: {
                            username: user.data.username,
                            pass: user.data.pass,
                            email: '',
                            image: '',
                            ip: user.ip,
                            socketId: socket.id
                        },
                        status: CONNECTION_STATUS.error.EMAIL_TAKEN
                    };

                    return serverData;
                    //return CONNECTION_STATUS.error.EMAIL_TAKEN;
                }

                else if ( allUsers[i].username === user.data.username ) { //username already being used
                    serverData = {
                        user: {
                            username: user.data.username,
                            pass: user.data.pass,
                            email: '',
                            image: '',
                            ip: user.ip,
                            socketId: socket.id
                        },
                        status: CONNECTION_STATUS.error.USERNAME_TAKEN
                    };

                    return serverData;
                    //return CONNECTION_STATUS.error.USERNAME_TAKEN;
                }
            }

            serverData = {
                user: {
                    username: user.data.username,
                    pass: user.data.pass,
                    email: user.data.email,
                    image: '',
                    ip: '',
                    socketId: socket.id
                },
                status: CONNECTION_STATUS.VERIFIED
            };

            serverData = addNewUserAccount(serverData); //adds new user account to DB
            
            return serverData;
            //return CONNECTION_STATUS.VERIFIED; //account successfully created
        }
    }
    catch(err) {
        console.log(`Server.js doesUserAccountExist(): ${err.message}`);
    }    
}

//determines status of connected user
function checkUserData(user, socket) {
    let serverData = doesUserAccountExist( user, socket ); //returns status of connected user - verifies username/email & password

    if ( serverData.status === CONNECTION_STATUS.VERIFIED ) { //login successful
        //let activeStatus = isActiveUser( serverData.user );    //checks if the user is already logged in - adds to active list if not
        console.log(`Checking isActiveUser(): ${serverData.user.socketId}`);
        serverData.status = isActiveUser( serverData.user );

        if ( serverData.status === CONNECTION_STATUS.VERIFIED_NEW_ACTIVE_USER ) { //login successful - user added to active list
            serverData.status = CONNECTION_STATUS.VERIFIED;

            return serverData;
            //return CONNECTION_STATUS.VERIFIED; //connection & user account fully verified
        }

        else {
            serverData.status = CONNECTION_STATUS.error.CURRENTLY_LOGGED_IN;

            return serverData;
            //return CONNECTION_STATUS.error.CURRENTLY_LOGGED_IN; //login failed - account already logged in
        }
    }

    else { //account exist error
        return serverData;
        //return serverData.status; 
    }
}

function sendConnectionStatusMessages( serverData, socket ) {
    let statusMsg = displayConnectionStatus( serverData ); //gets final connection status message

    console.log(statusMsg);
    
    if ( serverData.status === CONNECTION_STATUS.VERIFIED ) {
        let connectMsg;
        let date = new Date();
        let id =   ( Math.floor( Math.random() * 1000 ) ).toString() + date.getDay() + date.getHours().toString() + date.getSeconds().toString();

        let newUser = {
            username: serverData.user.username,
            status: 'online',
            socketId: serverData.user.socketId,
            image: serverData.user.image
        };

        let message = {
            username: serverData.user.username,
            socketId: serverData.user.socketId,
            msgId: id,
            image: serverData.user.image,
            timestamp: date.toLocaleTimeString()
        };


        if ( DEBUG ) {
            connectMsg = serverData.user.username + ' has connected @ ' + date.toLocaleTimeString(); 
        }

        else {
            connectMsg = serverData.user.username + ' has connected';
        } 
        
        message.msg = connectMsg;


        let newUserData = {
            user: serverData.user,
            activeUsers: activeUsers
        };

        console.log('Active users sent:');
        console.log( JSON.stringify(newUserData.activeUsers) );


        //sends the current user updated account info and list of active users
        socket.emit('CONNECTION VERIFIED', JSON.stringify(newUserData) );

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

function onUserDisconnect(serverData, socket) {
    const date = new Date();
    console.log(`${serverData.user.username} disconnected from server @ ` + date.toLocaleTimeString() );
    
    //only sends disconnect message if the user was previously active
    console.log(`Server data: ${JSON.stringify(serverData)}`);
    console.log(`Attempting to remove ${serverData.user.username}: ${socket.id}`);
    if ( removeActiveUser(socket.id) ) {
        console.log(`Successfully removed ${serverData.user.username}: ${socket.id}`);
        let connectMsg;
        
        if (DEBUG) {
            connectMsg = serverData.user.username + ' has disconnected @ ' + date.toLocaleTimeString();
        }

        else {
            connectMsg = serverData.user.username + ' has disconnected';            
        }
            
        let id =   ( Math.floor( Math.random() * 1000 ) ).toString() + date.getDay() + date.getHours().toString() + date.getSeconds().toString();

        let message = {
            username: serverData.user.username,
            socketId: socket.id,
            image: serverData.user.image,
            msgId: id,
            msg: connectMsg,
            timestamp: date.toLocaleTimeString()
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

        let serverData = checkUserData( user, socket ); //determines status of the connected user
        sendConnectionStatusMessages( serverData, socket );    
    
        socket.on('chat message', (msg) => {
            socket.broadcast.emit('chat message', msg);
        });

        socket.on('disconnect', () => {
            onUserDisconnect(serverData, socket); 
        });
    });
}

main();
