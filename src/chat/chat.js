import React, {Component} from 'react'
import ChatMessagePane from './chat_message_pane'
import './style/chat.css'

const io = require('socket.io-client');

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

function DisplayTitlebar({ username, onClose }) {
    return (
        <div id='display-titlebar-container'>
            <i className='material-icons' id='titlebar-menu-icon'>list</i>
            <small id='titlebar-username'>{username}</small>
            <i className='material-icons' id='titlebar-close-icon' onClick={onClose}>data_usage</i>
        </div>
    )
}

function DisplayUserList({ activeUsers, filter }) {
    let displayMessages; //holds final <li> list to display

    if (filter !== '') {
        console.log(`filter: ${filter}`);        
        let userFilter = new RegExp(filter);

        const filteredList = activeUsers.filter( u => (
            userFilter.test(u.username)
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
            activeUsers: [
                {
                    username: 'Ricky Bobby',
                    status: 'online',
                    socketId: 'alskjdfj43232398g',
                }
            ], 
            messages: [
                {
                    user: 'Rick',
                    msgId: 'f02ktng-d9gjsn2',
                    msg: 'Connected to server',
                    receiveTime: '11:02 AM'
                },
                {
                    user: 'Spacer',
                    msgId: 'f02ktasdgng-d9gjsn2',
                    msg: 'testing stuff',
                    receiveTime: '12:51 PM'
                },
                {
                    user: 'Placeholder',
                    msgId: 'f02ktng-d9dggasgasdggjsn2',
                    msg: 'such messages',
                    receiveTime: '1:50 PM'
                },
                {
                    user: 'Rick3',
                    msgId: 'f02ktn3g-d9gjsn2',
                    msg: 'Connected to server3',
                    receiveTime: '11:03 AM'
                },
                {
                    user: 'Spacer3',
                    msgId: 'f02k2t3asdgng-d9gjsn2',
                    msg: 'testing stuff3',
                    receiveTime: '12:53 PM'
                },
                {
                    user: 'Place4holder',
                    msgId: 'f02ktng-235d9dggasgasdggjsn2',
                    msg: 'such messages2',
                    receiveTime: '1:52 PM'
                },
                {
                    user: 'Rick65',
                    msgId: 'f02k1tng-d9653gjsn2',
                    msg: 'Connected to server5',
                    receiveTime: '11:52 AM'
                },
                {
                    user: 'Spacer9',
                    msgId: 'f02ktasdg94ng-d9gjsn2',
                    msg: 'testing stuff9',
                    receiveTime: '12:59 PM'
                },
                {
                    user: 'Placeholder9',
                    msgId: 'f02ktng-d9dgg2asg55asdggjsn2',
                    msg: 'such messages8',
                    receiveTime: '1:59 PM'
                },
            ]
        }

        this.username = parseCookie(); //returns the username from document.cookie
        
        this.onClose = this.onClose.bind(this); //user clicked close button
        this.onFilterChange = this.onFilterChange.bind(this); //filter updated
        this.onSocketSetup = this.onSocketSetup.bind(this);
    }

    componentDidMount() {
        this.onSocketSetup(); //connects to server & sets up socket events
    }

    onClose(e) {
        this.props.closeApp(e);
    }

    onFilterChange(e) {
        this.setState({ filter: e.currentTarget.value });
    }

    onSocketSetup() {
        //call this.props.loginFailed(info of fail) to reset to login screen if goes wrong here. //if called, make sure to disconnect current socket from server

        //call during 'component did mount' - if it's called everytime something updates, modify so it's only called on initial connection
        this.socket = io('localhost:8080', {
            query: {
            userData: JSON.stringify(this.props.loginData) //passes user data - {newUser(true/false), email(if newUser is true), username, pass}
            }
        });  

        //client is new user or another user disconnected
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
    }

    render() {
        return ( 
            <div id='chat-wrapper'>
                <DisplayTitlebar username={this.username} onClose={this.onClose} />

                <div id='chat-pane-container'>
                    <DisplayUsers activeUsers={this.state.activeUsers} filter={this.state.filter} onChange={this.onFilterChange} />
                    <ChatMessagePane messages={this.state.messages} />
                </div>
            </div>
        );
    }
}

export default Chat;