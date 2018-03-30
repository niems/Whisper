const app = require('express')();
const socket = require('socket.io');
const hostname = '192.168.86.32';
const port = 8080;

 //stores new user info - remembers friend list & conversations associated with this user
 //returns true if user was added - send message to new users & connected message to active users
 //returns false if error occurred - send message to user who tried to get a new account
function addNewUser(userInfo) {
    let validNewUser = true;

    //checks if potential new user is valid
    for(let i = 0; i < allUsers.length; i++) {
        if ( allUsers[i].email === userInfo.email ) { //email already linked to an account
            console.log('An account already exists with that email address');
            validNewUser = false;
            break;
        }

        else if ( allUsers[i].username === userInfo.username ) { //username taken - if using email as login non-unique usernames' don't matter
            console.log('An account already exists with that username')
            validNewUser = false;
            break;
        }
    }

    //if new user is valid, store their info
    if ( validNewUser ) {

        console.log('New user added!');
        allUsers.push(
            {
                email: userInfo.email,
                username: userInfo.username,
                pass: userInfo.pass
            }
        );
    }
    
    return validNewUser; //true if user has been added as a new user
}

//user just logged in - removed when they're disconnected
function addActiveUser(user) {
    for(let i = 0; i < activeUsers.length; i++) {
        if ( activeUsers[i].username === user.username ) { //user is already in active list

            if ( activeUsers[i].socketID !== user.socketID ) { //socket ID for active user has changed
                console.log(`${user.username} already active user - updated socket ID`);
                activeUsers[i].socketID = user.socketID; //updates socket ID
            }

            return true; //exits function - user doesn't need to be added to list. Still returns true because socket ID needs to be updated for all users
        }
    }

    //adds new active user
    console.log(`Added active user - ${user.username}: ${user.socketID}`);

    activeUsers.push({
        username: user.username,
        status: 'online',
        socketID: user.socketID
    });

    return true; //active user added
}

//previously active user - removed from list because of socket disconnect
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
    let user = JSON.parse(socket.handshake.query.userData);
    let address = socket.handshake.address;
    
    console.log(`New user: ${user.newUser}`);
    console.log(`Username: ${user.username} from ${address}`);
    console.log(`Password: ${user.pass}`);

    if( user.newUser ) { //email only supplied if connected user is new
        console.log(`Email: ${user.email}`);

        if ( addNewUser(user) ) { //stores new user info if user is new
            //emit message to new user that they're account is active

            //broadcast message to other users that this user has signed up for an account
        }

        else {
            //emit message to new user that their account info is taken/invalid
        }
    }

    //using an array instead of an object so the emit event can stay the same
    //and the format for reading these in can stay the same for the new user getting the full list of active users
    //or if it's an active user getting the single new user update
    let newActiveUser = {
            username: user.username,
            status: 'online',
            socketID: socket.id
        };

    //send current user the list of active users
    if ( addActiveUser(newActiveUser) ) { //new active user added or socket ID of active user updated
        let connectMsg = user.username + ' has connected';
        let date = new Date();
        let id =   ( Math.floor( Math.random() * 1000 ) ).toString() + date.getDay() + date.getHours().toString() + date.getSeconds().toString();

        let message = {
            username: user.username,
            socketId: socket.id,
            msgId: id,
            msg: connectMsg,
            receiveTime: date.toLocaleTimeString()
        };

        socket.broadcast.emit( 'active user update', JSON.stringify(newActiveUser) );  //update all users' (except current user) active user list 
        socket.broadcast.emit( 'chat message', JSON.stringify(message) );
        socket.emit( 'active users list', JSON.stringify(activeUsers) ); //updates the new user with the active users list
    }

    console.log(`${user.username} connected: ${socket.id}`);

    
    //message send from client - broadcast message to all users except client
    socket.on('chat message', (msg) => {
        socket.broadcast.emit('chat message', msg); //msg is already a JSON object - sent that way from client
    });

    socket.on('disconnect', () => {
        let disconnectMsg = user.username + ' has disconnected';
        
        let date = new Date();
        let id =   ( Math.floor( Math.random() * 1000 ) ).toString() + date.getDay() + date.getHours().toString() + date.getSeconds().toString();

        let message = {
            username: user.username,
            socketId: socket.id,
            msgId: id,
            msg: disconnectMsg,
            receiveTime: date.toLocaleTimeString()
        };
        

        removeActiveUser(socket.id); //removes from active user list
        io.emit( 'chat message', JSON.stringify(message) ); //sends disconnect message to active users
        io.emit( 'active users list', JSON.stringify(activeUsers) ); //sends the updated active users list
        console.log(`User disconnected: ${socket.id}`);
    });
});