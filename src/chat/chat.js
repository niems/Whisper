import React, {Component} from 'react'
import VerifyLogin from './verify_login'
import ChatMenu from './chat_menu'
import ChannelView from './channel_view'
import './style/chat.css'

const io = require('socket.io-client');
const serverHost = '192.168.86.32:8080';

function DisplayChat({ accountVerified, userData, users, messages, onSendMsg, onSelect, onImgFail }) {
    if ( accountVerified ) {
        return (
            <div id='chat-container'>
                <ChatMenu userData={userData} users={users} onSelect={onSelect} onImgFail={onImgFail} />
                <ChannelView messages={messages} onSendMsg={onSendMsg} />
            </div>
        );
    }

    return ( <VerifyLogin /> );
}

class Chat extends Component {
    constructor(props) {
        super(props);

        this._adminId = undefined; //testing only - used to send message to only the admin

        this.state = {
            userData: this.props.userData, //current user info (initialized w/login info from landing page, updated on server connect)
            accountVerified: false, //determines if the user has successfully connected to the server & logged in
            activeUsers: [],

            messages: [], //displays the messages based on the current view

            /*
            let date = new Date();
        let id = ( Math.floor( Math.random() * 1000 ) ).toString() + date.getDay() + date.getHours().toString() + date.getSeconds().toString();

        let message = {
            username: this.state.userData.username,
            socketId: this.state.userData.socketId,
            image: this.state.userData.image,
            msgId: id,
            msg: msg,
            timestamp: date.toLocaleTimeString()
        };
            */
            selectedChannel: {
                name: '#general', //name of the channel - #channel_name for channels, pm - [username] for private messages
                path: '/', //socket id for private messages, #channel_name for channels
                isUser: false
            },
            //selectedChannel: '#general', //determines the messages
            selectedMessages: [], //all messages for the selected channel 
        };

        this.allMessages = [ //collection of all the current conversations
            {
                channel: '#general',
                description: 'general desc.',
                //toReceive: 'everyone', //'' - everyone. Determines which user(socket id) or channel(group name) are sent the message
                messages: [], //all the messages for the current channel
            },
        ];

        //this.state.userData = this.props.userData; //ONLY MODIFY HERE FOR TESTING, THEN ADD THE APP.JS MOD
        
        this.onSocketSetup = this.onSocketSetup.bind(this); //connects to server and sets up socket events
        this.removeActiveUser = this.removeActiveUser.bind(this); //socket id passed, boolean returned - true if user is removed from active users pool 
        this.onSendMessage = this.onSendMessage.bind(this); //sends a channel/user/group a message

        this.onConnectionVerified = this.onConnectionVerified.bind(this); //runs when the current user's connection is verified by the server
        this.onNewUserConnection = this.onNewUserConnection.bind(this); //new user connected to server - updates current user info
        this.onUserDisconnect = this.onUserDisconnect.bind(this); //user disconnected - removes from active users' list & adds disconnect msg
        this.onChatMessage = this.onChatMessage.bind(this); //user received new message

        this.onChannelSelect = this.onChannelSelect.bind(this); // user/channel selected - determines channel view display
        this.getChannelInfo = this.getChannelInfo.bind(this);
        this.updateChannelInfo = this.updateChannelInfo.bind(this);

        this.onImgLoadFail = this.onImgLoadFail.bind(this); //user img failed to load, placeholder img used

    }

    componentDidMount() {
        this.onSocketSetup(); //socket event setup
    }

    componentWillUnmount() {
        if ( this.state.accountVerified ) {
            alert('closing w/account verified');
        }
    }

    onSocketSetup() {
        try {
            this.socket = io(serverHost, {
                query: {
                    userData: JSON.stringify(this.state.userData) //passes user data - {newUser(true/false), email(if newUser is true), username, pass}
                }
            });

            //calling loginSuccess and having userData in state there may cause the page to refresh
            this.socket.on('CONNECTION VERIFIED', (data) => {
                this.onConnectionVerified(data);
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
            username: this.state.userData.username,
            socketId: this.state.userData.socketId,
            image: this.state.userData.image,
            msgId: id,
            msg: msg,
            timestamp: date.toLocaleTimeString()
        };

        let serverInfo = {
            sendTo: this.state.selectedChannel.path //'/' //default path 
        };

        let packedMsg = {
            msgInfo: message,
            serverInfo: serverInfo
        };

        /*
        if ( this.state.userData.username !== 'admin' ) {
            if ( typeof( this._adminId ) !== 'undefined' ) {
                packedMsg.serverInfo.sendTo = this._adminId;

                //this.socket.to( this._adminId ).emit('chat message', JSON.stringify(message) );
            }
        }
        */
        
        this.socket.emit('chat message', JSON.stringify(packedMsg) );
        

        //appends user's message to message list
        let messages = this.state.messages;
        message.receivedTimestamp = date.toLocaleTimeString(); //receive time is the same as sent time for the sender...

        messages.unshift( message );
        this.setState({ messages });
    }

    onConnectionVerified(data) {
        try {
            data = JSON.parse(data);
            
            if ( this.state.userData.newUser ) {
                this.socket.query.userData = JSON.stringify({
                    newUser: false,
                    username: data.user.username,
                    pass: data.user.pass
                });
                
                this.props.loginSuccess('account created');                    
            }
    
            let extTest = new RegExp('([.](png|jpg|svg|gif))$'); //checks if correct image path is given - only accepts .png/jpg/svg images
            let userUpdate = data.user;
            userUpdate.image = extTest.test(userUpdate.image) ? userUpdate.image : '/images/placeholder.svg'; //uses the placeholder image if a valid image isn't given
    
            console.log('****CONNECTION VERIFIED**************');
            console.log(`user image: ${userUpdate.image}`);
            console.log(`Reg exp test: ${extTest.test(userUpdate.image)}`);
            
            /*
            this.userData = data.user; //updates user data
            this.userData.image = imgExp.test(this.userData.image) ? this.userData.image : '/images/placeholder.svg';
            */
    
            //testing only - finds the socket id of the admin 
            for(let i = 0; i < data.activeUsers.length; i++) {
                if ( data.activeUsers[i].username === 'admin' ) {
                    this._adminId = data.activeUsers[i].socketId;
                    break;
                }
            }
    
            this.setState(
                {
                    activeUsers: data.activeUsers,
                    accountVerified: true,
                    userData: userUpdate
                }
            );
        }
        catch(err) {
            console.log(`Chat onConnectionVerified(): ${err.message}`);
        }
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

    updateChannelInfo(selectedChannel) {
        let foundMsgInfo = undefined; //channel info/messages for the current channel

        for(let i = 0; i < this.allMessages.length; i++) { //goes through all the messages
            if ( this.allMessages[i].channel === selectedChannel.name ) { //selected channel found
                foundMsgInfo = this.allMessages[i]; //stores the messages & info for the current channel
                break;
            }
        }

        if ( typeof(foundMsgInfo) !== 'undefined' ) { //channel info & messages found 

            //updates the selected channel & corresponding messages 
            this.setState({ 
                selectedChannel: selectedChannel,
                selectedMessages: foundMsgInfo
            });

            return true;
        }

        //channel does not exist yet - creating channel
        else {
            //let receiver = undefined; //who the messages are being sent to
            let desc = selectedChannel.isUser ? selectedChannel.name : ('no description of ' + selectedChannel.name); //description of channel/PM
            
            this.allMessages.unshift(
                {
                    channel: selectedChannel.name,
                    description: desc,
                    messages: [],
                }
            );
        }

        alert()
        return false;
    }

    //returns the name and path 
    getChannelInfo(channel) {
        //if the selected is a user, replace w/socket id
        let isChannel = new RegExp('^[#]'); 
        let tempChannel = { 
            name: '',
            path: '',
            isUser: undefined
        };

        //user selected - private message
        if ( !isChannel.test(channel) ) { 
            let aUsers = this.state.activeUsers;

            for(let i = 0; i < aUsers.length; i++) { //checks through all active users
                if ( channel === aUsers[i].username ) { //selected user found                    
                    tempChannel.name = 'pm - ' + channel;
                    tempChannel.path = aUsers[i].socketId;
                    tempChannel.isUser = true;
                    return tempChannel; 
                }
            }
            return undefined; //user selected but not found in active users D:
        }

        //channel selected - group message
        tempChannel.name = channel;
        tempChannel.path = channel;
        tempChannel.isUser = false;

        return tempChannel;
    }
    //determines the channel view, argument is a user/channel id
    onChannelSelect(selected) {
        //if the selected is a user, replace w/socket id
        let tempChannel = this.getChannelInfo( selected ); //returns the name and path of the channel

        if ( typeof(tempChannel) === 'undefined' ) {
            alert('ERROR - temp channel is undefined D:');
            return false;
        }

        this.updateChannelInfo( tempChannel );
        /*
        let isChannel = new RegExp('^[#]'); 
        let tempChannel = { 
            name: '',
            path: ''
        };
        //user selected - private message
        if ( !isChannel.test(selected) ) { 
            let aUsers = this.state.activeUsers;

            for(let i = 0; i < aUsers.length; i++) {
                if ( selected === aUsers[i].username ) { //selected user found
                    //selected = aUsers[i].socketId; //user's socket id used as channel
                    
                    tempChannel.name = 'pm - ' + selected;
                    tempChannel.path = aUsers[i].socketId;
                    break;
                }
            }
        }

        //channel selected - group message
        else { 
            tempChannel.name = selected;
            tempChannel.path = selected;
        }
        */
        //update message selection also
        //this.setState({ selectedChannel: tempChannel });
    }

    //called when user img fails to load. Placeholder image used
    onImgLoadFail(source) {
        let placeholderImg = '/images/placeholder.svg';
        let userInfo = undefined; //used to update

        console.log(`Img fail: ${source}`);

        if ( source === 'current user' ) {
            let userUpdate = this.state.userData;
            userUpdate.image = placeholderImg;
            userInfo = userUpdate;
    
            this.setState({ userData: userUpdate });
        }

        else { //source is the id of the active user
            console.log('active user img fail');
            
            let allUsers = this.state.activeUsers;
            let allMsgs = this.state.messages;

            for(let i = 0; i < allUsers.length; i++) { //goes through all active users
                if ( allUsers[i].socketId === source ) { //user found - replace failed img with placeholder
                    allUsers[i].image = placeholderImg;
                    userInfo = allUsers[i];

                    for(let k = 0; k < allMsgs.length; k++) { //checks all messages for this user 
                        if ( allMsgs[k].socketId === allUsers[i].socketId ) { //found msg from this user
                            allMsgs[k].image = placeholderImg; //updates to placeholder img
                        }
                    }
                    
                    this.setState({ 
                        activeUsers: allUsers,
                        messages: allMsgs
                    });
                    console.log('active user img & messages updated');
                    break;
                }
            }
        }

        if ( typeof( userInfo ) !== 'undefined' ) {
            this.socket.emit('SERVER USER IMG UPDATE', JSON.stringify( userInfo ) );
        }

    }

    render() {
        return (
            <DisplayChat accountVerified={this.state.accountVerified} userData={this.state.userData} users={this.state.activeUsers}
                         messages={this.state.messages} onSendMsg={this.onSendMessage} onSelect={this.onChannelSelect} onImgFail={this.onImgLoadFail} />
        );
    }
}

export default Chat;