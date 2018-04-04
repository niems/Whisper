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

        this.userData = this.props.userData;
        this.onSocketSetup = this.onSocketSetup.bind(this); //connects to server and sets up socket events
        this.onSendMessage = this.onSendMessage.bind(this); //sends a channel/user/group a message
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
                this.userData = data.user; //updates user data
                this.setState(
                    {
                        activeUsers: data.activeUsers,
                        accountVerified: true
                    }
                );
            });

            //updates user's active user list
            this.socket.on('active users list', (data) => {
                this.setState({ activeUsers: JSON.parse(data) });
            });

            //new active user connected to server
            this.socket.on('active user update', (data) => {
                let activeUsers = this.state.activeUsers;
                
                activeUsers.unshift( JSON.parse(data) );
                this.setState({ activeUsers });
            });

            //user received a message - adds new message to the top
            this.socket.on('chat message', (msg) => {
                let messages = this.state.messages;

                messages.unshift( JSON.parse(msg) );
                this.setState({ messages });
            });

            this.socket.on('CONNECTION FAILED', (msg) => {
                this.socket.close(); //manually disconnects socket
                this.props.loginFailed(msg); //redirects user back to landing page - could not verify login
            });
        }
        catch(err) {
            console.log(`ERR Chat.js onSocketSetup(): ${err.message}`);
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
        
        messages.unshift( message );
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

/**
 * 
            <div id='chat-container'>
                <ChatMenu userData={this.userData} users={this.state.activeUsers} />
                <ChatMessages messages={this.state.messages} onSendMsg={this.onSendMessage} />
            </div>
 */