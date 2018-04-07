import React, {Component} from 'react'
import VerifyLogin from './verify_login'
import ChatMenu from './chat_menu'
import ChatMessages from './chat_messages'
import './style/chat.css'

const io = require('socket.io-client');
const serverHost = '192.168.86.32:8080';

function DisplayChat({ accountVerified, userData, users, messages, onSendMsg }) {
    if ( accountVerified ) {
        return (
            <div id='chat-container'>
                <ChatMenu userData={userData} users={users} />
                <ChatMessages messages={messages} onSendMsg={onSendMsg} />
            </div>
        );
    }

    return ( <VerifyLogin /> );
}

class Chat extends Component {
    constructor(props) {
        super(props);

        this.state = {
            activeUsers: [],
            messages: [],
            accountVerified: false //determines if the user has successfully connected to the server & logged in
        };

        this.userData = this.props.userData; //ONLY MODIFY HERE FOR TESTING, THEN ADD THE APP.JS MOD
        
        this.onSocketSetup = this.onSocketSetup.bind(this); //connects to server and sets up socket events
        this.removeActiveUser = this.removeActiveUser.bind(this); //socket id passed, boolean returned - true if user is removed from active users pool 
        this.onSendMessage = this.onSendMessage.bind(this); //sends a channel/user/group a message

        this.onNewUserConnection = this.onNewUserConnection.bind(this); //new user connected to server - updates current user info
        this.onUserDisconnect = this.onUserDisconnect.bind(this); //user disconnected - removes from active users' list & adds disconnect msg
        this.onChatMessage = this.onChatMessage.bind(this); //user received new message
    }

    componentDidMount() {
        this.onSocketSetup(); //socket event setup
    }

    componentWillMount() {
        if ( this.state.accountVerified ) {
            alert('closing w/account verified');
        }
    }

    onSocketSetup() {
        try {
            this.socket = io(serverHost, {
                query: {
                    userData: JSON.stringify(this.userData) //passes user data - {newUser(true/false), email(if newUser is true), username, pass}
                }
            });

            //calling loginSuccess and having userData in state there may cause the page to refresh
            this.socket.on('CONNECTION VERIFIED', (data) => {
                //verify screen runs before this
                //use app.js callback
                data = JSON.parse(data);
                
                if ( this.userData.newUser ) {
                    this.socket.query.userData = JSON.stringify({
                        newUser: false,
                        username: data.user.username,
                        pass: data.user.pass
                    });
                    
                    this.props.loginSuccess('account created');                    
                }

                this.userData = data.user; //updates user data

                this.setState(
                    {
                        activeUsers: data.activeUsers,
                        accountVerified: true
                    }
                );

            });

            //user received a message - adds new message to the top
            this.socket.on('chat message', (msg) => {
                this.onChatMessage( msg );
            });

            this.socket.on('NEW USER CONNECTED', (data) => {
                this.onNewUserConnection( data );
            });

            this.socket.on('USER DISCONNECTED', (user) => {
                this.onUserDisconnect( user );
            })

            this.socket.on('CONNECTION FAILED', (msg) => {
                this.socket.close(); //manually disconnects socket
                this.props.loginFailed( msg ); //redirects user back to landing page - could not verify login
            });
        }
        catch(err) {
            console.log(`ERR Chat.js onSocketSetup(): ${err.message}`);
        }
    }

    //removes user from active users pool - STATE MUST STILL BE UPDATED, provided the socket id
    removeActiveUser(id) {
        try {
            let currentUsers = this.state.activeUsers; //gets current active users

            for(let i = 0; i < currentUsers.length; i++) { //checks all active users
                if ( currentUsers[i].socketId === id ) { //found active user with socket id
                    currentUsers.splice(i, 1); //removes user from active users

                    return currentUsers; //user successfully removed - returns new active users list to update state
                }
            }
    
            return false; //user not removed
        }
        catch(err) {
            console.log(`ERR Chat removeActiveUser(): ${err.message}`);
        }
    }

    onSendMessage(msg) {
        let date = new Date();
        let id = ( Math.floor( Math.random() * 1000 ) ).toString() + date.getDay() + date.getHours().toString() + date.getSeconds().toString();

        let message = {
            username: this.userData.username,
            socketId: this.userData.socketId,
            image: this.userData.image,
            msgId: id,
            msg: msg,
            timestamp: date.toLocaleTimeString()
        };

        //sends user's message to all active users
        this.socket.emit('chat message', JSON.stringify(message) );

        //appends user's message to message list
        let messages = this.state.messages;
        message.receivedTimestamp = date.toLocaleTimeString(); //receive time is the same as sent time for the sender...

        messages.unshift( message );
        this.setState({ messages });
    }

    onNewUserConnection(data) {
        /*
        data = {message: {username, socketId, image, msgId, msg, timestamp}, 
                newUser: {username, socketId, image, status}
        */

        data = JSON.parse(data); 

        let date = new Date();
        let messages = this.state.messages;
        let newMsg = data.message;
        newMsg.receivedTimestamp = date.toLocaleTimeString();
        messages.unshift( newMsg );

        let currentUsers = this.state.activeUsers; //current active users
        currentUsers.unshift(data.newUser); //adds new user
        //alert(`New user info: ${JSON.stringify(data.newUser)}`);

        this.setState({ 
            activeUsers: currentUsers,
            messages: messages
        }); 
    }

    onUserDisconnect(user) {
        /* SENT AS 'USER' FROM SERVER
        let userInfo = {
            username: userData.user.username,
            socketId: userData.user.socketId,
            image: userData.user.image,
            status: 'offline',
            msgId: ( Math.floor( Math.random() * 1000 ) ).toString() + date.getDay() + date.getHours().toString() + date.getSeconds().toString(),
            msg: 'connected to the server :D',
            timestamp: date.toLocaleTimeString()
        }
        */
       try {
            let date = new Date();
            user = JSON.parse( user );

            //updates messages w/user disconnect msg
            let newMsg = user;
            let messages = this.state.messages;
            newMsg.receivedTimestamp = date.toLocaleTimeString();
            messages.unshift( newMsg );

            //removes disconnected user from active user pool
            let currentUsers = this.removeActiveUser( user.socketId );

            if ( currentUsers !== false ) { //user successfully disconnected
                this.setState({
                    messages: messages, //adds user DC msg
                    activeUsers: currentUsers //removes DC'd user
                });
            }
        
            else {
                alert(`Failed to remove disconnected user: ${user.username}`);
            }
       }
       catch(err) {
           console.log(`ERR Chat onUserDisconnect(): ${err.message}`);
       }
    }

    onChatMessage(msg) {
        let date = new Date();
        let messages = this.state.messages;
        let newMsg = JSON.parse(msg);
        newMsg.receivedTimestamp = date.toLocaleTimeString();

        messages.unshift( newMsg );
        this.setState({ messages });
    }

    render() {
        return (
            <DisplayChat accountVerified={this.state.accountVerified} userData={this.userData} users={this.state.activeUsers}
                         messages={this.state.messages} onSendMsg={this.onSendMessage} />
        );
    }
}

export default Chat;