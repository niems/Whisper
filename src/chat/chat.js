import React, {Component} from 'react'
import ChatMessagePane from './chat_message_pane'
import './style/chat.css'

const io = require('socket.io-client');

/*server setup*/ 
const serverHost = '192.168.86.32:8080';
//const serverHost='68.71.67.108:8080';
//const serverHost = 'http://whisperme.ddns.net';

function parseCookie() {
    let username;
    let cookie = document.cookie;
    let usernameIndex = cookie.indexOf('=', cookie.indexOf('username=') ) + 1; //+1 - don't want the '=' included
    let endUsernameIndex = cookie.indexOf(';', usernameIndex);

    
    if (endUsernameIndex === -1) {
        username = cookie.replace('username=', '');
    }

    else {           
        username = cookie.slice(usernameIndex, endUsernameIndex);
    }  

    return username;
}

function DisplayUserList({ activeUsers, filter }) {
    let displayMessages; //holds final <li> list to display

    if (filter !== '') {
        console.log(`filter: ${filter}`);        
        let userFilter = new RegExp(filter);

        const filteredList = activeUsers.filter( u => (
            userFilter.test(u.username.toLowerCase())
        ));

        console.log(filteredList);

        displayMessages = filteredList.map( u => (
            <li className='displayed-user' key={u.socketId} id={u.socketId}>
                {u.username + ' - '}<small className='displayed-user-status'>{u.status}</small>
            </li>  
        ));
    }

    else {
        displayMessages = activeUsers.map( u => (
            <li className='displayed-user' key={u.socketId} id={u.socketId}>
                {u.username + ' - '}<small className='displayed-user-status'>{u.status}</small>
            </li>  
        ));
    }

    return (
        <div id='display-user-list-container'>
            <ul className='list-group display-user-listgroup' id='display-user-listgroup'>
                {displayMessages}
            </ul>
        </div>
    );
}

function DisplayUsers({ activeUsers, filter, onChange }) {
    return (
        <div id='display-users-container'>

            <input type='text' id='display-users-input-filter' value={filter}
                   onChange={onChange} placeholder='Search by username...' />

            <DisplayUserList activeUsers={activeUsers} filter={filter} />

        </div>
    );
}


class Chat extends Component {
    constructor(props) {
        super(props);

        this.state = {
            filter: '',
            activeUsers: [], 
            messages: []
        }

        this.username = parseCookie(); //returns the username from document.cookie
        
        this.onFilterChange = this.onFilterChange.bind(this); //filter updated
        this.onSocketSetup = this.onSocketSetup.bind(this);
        this.onSendChatMessage = this.onSendChatMessage.bind(this); //sends a message to other users
    }

    componentDidMount() {
        this.onSocketSetup(); //connects to server & sets up socket events
    }

    onFilterChange(e) {
        this.setState({ filter: e.currentTarget.value.toString().toLowerCase() });
    }

    onSocketSetup() {
        try {
            this.socket = io(serverHost, {
                query: {
                userData: JSON.stringify(this.props.loginData) //passes user data - {newUser(true/false), email(if newUser is true), username, pass}
                }
            });  
    
            //client is new user or another user disconnected
            //also adds connect/disconnect msg from new user activity
            this.socket.on('active users list', (data) => {
                this.setState({
                    activeUsers: JSON.parse(data)
                });
            });
    
            //client is active user, new user connected to server
            this.socket.on('active user update', (data) => {
                let activeUsers = this.state.activeUsers;
    
                activeUsers.unshift( JSON.parse(data) ); //adds new active user to list
    
                this.setState({ activeUsers });
            });
    
            //client received a message from another user
            this.socket.on('chat message', (msg) => {
                let messages = this.state.messages;
                messages.unshift( JSON.parse(msg) ); //adds message from client
    
                this.setState({ messages }); 
            });
    
            this.socket.on('CONNECTION FAILED', (msg) => {
                this.socket.close(); //manually disconnectes socket
                this.props.loginFailed(msg);
            });
        }

        catch(err) {
            alert(err.message);
        }        
    }

    onSendChatMessage(msg) {
        let date = new Date();
        let id =   ( Math.floor( Math.random() * 1000 ) ).toString() + date.getDay() + date.getHours().toString() + date.getSeconds().toString();

        let message = {
            username: this.username,
            socketId: this.socket.id,
            msgId: id,
            msg: msg,
            receiveTime: date.toLocaleTimeString()
        };

        this.socket.emit('chat message', JSON.stringify(message) ); //sends the message from this client to the server - broadcasted to everyone except client

        let messages = this.state.messages;
        messages.unshift( message ); //adds client message
        
        this.setState({ messages });
    }
    

    render() {
        return ( 
            <div id='chat-wrapper'>
                <div id='chat-pane-container'>
                    <DisplayUsers activeUsers={this.state.activeUsers} filter={this.state.filter} onChange={this.onFilterChange} />
                    <ChatMessagePane messages={this.state.messages} onSendMessage={this.onSendChatMessage} />
                </div>
            </div>
        );
    }
}

export default Chat;