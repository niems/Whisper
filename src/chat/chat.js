import React, {Component} from 'react'
import Database from './database'
import VerifyLogin from './verify_login'
import ChatMenu from './chat_menu'
import ChannelView from './channel_view'
import './style/chat.css'

const io = require('socket.io-client');
const serverHost = 'http://localhost:8080';
//const serverHost = '192.168.86.32:8080';

const STATUS = { 
    MESSAGE_ADDED: 1, //successfully added message to channel
    CHANNEL_CREATED: 2, //successfully created channel & added message
    SELECTED_CHANNEL_FOUND: 3, //successfully found selected channel info

    error: {
        DUPLICATE_MESSAGE: -1, //message not added (duplicate found)
        CHANNEL_NOT_FOUND: -2, 
        CHANNEL_CREATION_FAILED: -3, //failed to create channel

        UNKNOWN: -9, //generic error
    }
}

//returns a new selected channel - if channel is supplied, ensures to return a new reference for the object
//'type' determines the type of channel created (selected channel doesn't have a messages array)
function createNewChannel(channelInfo = undefined, msg = undefined, channelType = 'selected') {
    try {
        console.log('\n*ENTERING createNewChannel()');

        let channel = {
            channelId: '',
            channelDisplayName: '',
            isUser: '',
    
            description: '',
            path: '',
        };

        if ( typeof(channelInfo) !== 'undefined' ) { //creating info for selected channel
            //console.log('createNewChannel(): creating based on given channel info');
            channel.channelId = ( typeof( channelInfo.channelId ) === 'undefined' ) ? '' : channelInfo.channelId;
            channel.channelDisplayName = ( typeof( channelInfo.channelDisplayName ) === 'undefined' ) ? '' : channelInfo.channelDisplayName;
            channel.isUser = ( typeof( channelInfo.isUser ) === 'undefined' ) ? '' : channelInfo.isUser;
    
            channel.description = ( typeof( channelInfo.description ) === 'undefined' ) ? '' : channelInfo.description;
            channel.path = ( typeof( channelInfo.path ) === 'undefined' ) ? '' : channelInfo.path;
        }

        else if ( typeof(msg) !== 'undefined' ) { //creating info for new channel (received from msg)
            //console.log('createNewChannel(): creating based on received msg');            
            let _isChannel = isChannel( msg.channelId ); //is the channel a direct message (false) or group chat (true)
            channel.channelId = ( typeof( msg.channelId ) === 'undefined' ) ? '' : msg.channelId;

            if ( _isChannel ) { //message for group chat
                channel.channelDisplayName = msg.channelId; //channel display name is the same as the channel id
                channel.isUser = false;
                channel.description = 'All about that ' + msg.channelId + ' talk';
                channel.path = msg.channelId;
            }

            else { //message for specific user (direct message)
                //channel.channelDisplayName = ' @ ' + msg.username;
                channel.channelDisplayName = msg.username;
                channel.isUser = true;
                channel.description = "Sending D.M's to " + msg.username;
                channel.path = (channelType === 'selected') ? msg.socketId : 'N/A'; //only stores socket id path if this is for a selected channel (path required in this case)
            }
        }

        else {
            //console.log('createNewChannel(): empty channel being returned - both channel info & msg not provided');
        }
    
        //if a regular channel is created (stored w/this.allMessages which includes the messages property)
        if ( channelType !== 'selected' ) {
            if ( typeof(msg) !== 'undefined' ) { //msg passed (first channel msg)
                channel.messages = [ createNewMsg(msg) ]; //stores a new reference for the msg object
            }

            else {
                channel.messages = ( typeof( channelInfo.messages ) === 'undefined' ) ? [] : JSON.parse( JSON.stringify( channelInfo.messages ) );
            }
        }
    
        console.log('*LEAVING createNewChannel()\n');
        return channel;
    }
    catch(err) {
        console.log(`ERR Chat createNewChannel(): ${err.message}`);
        console.log('*LEAVING createNewChannel()\n');
        return undefined;
    }
}

//returns a new message - if msg is supplied, ensures to return a new reference for the object
function createNewMsg(msg = undefined) {
    try {
        //console.log('\n*ENTERING createNewMsg()');

        let message = {
            channelId: ( typeof( msg.channelId ) === 'undefined' ) ? '' : msg.channelId,
            username: ( typeof( msg.username ) === 'undefined' ) ? '' : msg.username,
            socketId: ( typeof( msg.username ) === 'undefined' ) ? '' : msg.socketId,
            image: ( typeof( msg.image ) === 'undefined' ) ? '' : msg.image,
            msg: ( typeof( msg.msg ) === 'undefined' ) ? '' : JSON.parse( JSON.stringify( msg.msg ) ),
            msgId: ( typeof( msg.msgId ) === 'undefined' ) ? '' : msg.msgId,
            timestamp: ( typeof( msg.timestamp ) === 'undefined' ) ? '' : msg.timestamp,
            receivedTimestamp: ( typeof( msg.receivedTimestamp ) === 'undefined' ) ? '' : msg.receivedTimestamp
        };

        //displayMessage( message );
        //console.log('*LEAVING createNewMsg()\n');        
        return message;
    }
    catch(err) {
        console.log(`ERR Chat createNewMsg(): ${err.message}`);
        console.log('*LEAVING createNewMsg()\n');
        return undefined;
    }
}

//given the username, returns user's current socket id
function getUserInfo( username, activeUsers ) {
    for(let i = 0; i < activeUsers.length; i++) { //goes through all active users
        if ( activeUsers[i].username === username ) { //user found
            return activeUsers[i];
        }
    }

    return undefined; //user not found
}

//returns boolean based on if the given element id is a channel
function isChannel( selectedId ) {
    let isChannel = new RegExp('^[#]').test( selectedId ); //determines if selected id is a channel

    if ( isChannel ) {
        return true;
    }

    return false;
}
//given the current username and selected Id, returns channel name (also will return the group channel (ex #general))
function generateChannelId( username, selectedId ) {
    try {
        //console.log('\n*ENTERING generateChannelId()');
        let channelId = undefined;
        let dmTest = new RegExp(' - '); //determines if the selected id is already been set as a channel id
    
        if ( isChannel( selectedId ) ) { //channel has been selected
            //console.log('generateChannelId(): channel selected');
            return selectedId; 
        }

        else if ( dmTest.test( selectedId ) ) { //if channel id has already been set as the selected id
            //console.log('generateChannelId(): direct message selected w/channel id already generated')
            return selectedId; 
        }
    
        if ( username > selectedId ) {
            channelId = `${selectedId} - ${username}`;
        }
    
        else {
            channelId = `${username} - ${selectedId}`;
        }
    
        return channelId;
    }
    catch(err) {
        console.log(`ERR generateChannelId(): ${err.message}`);
        return STATUS.error.UNKNOWN;
    }
}

function displayMessage( msg ) {
    try {
        console.log('\nDisplayMessage():');
        console.log(`Sent to channel: ${msg.channelId}`);
        console.log(`From username: ${msg.username}`);
        console.log(`-socketId: ${msg.socketId}`);
        console.log(`-image path: ${msg.image}`);
        console.log(`-message: ${msg.msg}`);
        console.log(`-message id: ${msg.msgId}`);
        console.log(`sent timestamp: ${msg.timestamp}\n`);
    }
    catch(err) {
        console.log(`ERR Chat.js DisplayMessage(): ${err.message}`);
    }
}

function displayChannelInfo( channelInfo ) {
    console.log();
    console.log(`\tChannel display name: ${channelInfo.channelDisplayName}`);
    console.log(`\tChannel id: ${channelInfo.channelId}`);
    console.log(`\tIs direct message channel: ${channelInfo.isUser}`);
    console.log(`\t-description: ${channelInfo.description}`);
    console.log(`\t-path to channel: ${channelInfo.path}`);
    console.log(`\t-messages:`);

    //displays all the messages for this channel
    let msgs = channelInfo.messages;
    for(let i = 0; i < msgs.length; i++) {
        console.log('\n-------------');
        
        console.log(`Channel name: ${msgs[i].channelId}`);
        console.log(`-from: ${msgs[i].username}`);
        console.log(`--socketId: ${msgs[i].socketId}`);
        console.log(`--image path: ${msgs[i].image}`);
        console.log(`--message: ${msgs[i].msg}`);
        console.log(`--message id: ${msgs[i].msgId}`);
        console.log(`--timestamp: ${msgs[i].timestamp}`);
        
        console.log('-------------\n');
    }
    console.log();
}

//returns the channel info, given the channel id and the channels to search through
//returns undefined if channel is not found
function getChannelInfo( channelId, allChannels ) {
    //console.log('\n*ENTERING getChannelInfo()');

    for(let i = 0; i < allChannels.length; i++) {
        if ( allChannels[i].channelId === channelId ) { //channel found
            //console.log(`getChannelInfo(): found channel "${channelId}"`);
            return allChannels[i];
        }
    }

    //console.log('getChannelInfo(): failed to find channel D:');
    return undefined;
}

function DisplayChat({ accountVerified, userData, users, selectedChannel, selectedMsgs, onSendMsg, onSelect, onImgFail, recentChannels, onRemoveRecentChannel, joinedChannels, onRemoveCategory, allMessages, logout }) {
    if ( accountVerified ) {
        return (
            <div id='chat-container'>
                <ChatMenu userData={userData} users={users} onSelect={onSelect} recentChannels={recentChannels} onRemoveRecentChannel={onRemoveRecentChannel}
                          joinedChannels={joinedChannels} onRemoveCategory={onRemoveCategory} onImgFail={onImgFail} logout={logout} />
                <ChannelView userData={userData} selectedChannel={selectedChannel} selectedMsgs={selectedMsgs} onSendMsg={onSendMsg} allMessages={allMessages} />
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
            
            joinedChannels: [
                {
                    channelId: '#random',
                    image: './images/default_channel_icon.svg',
                },
                {
                    channelId: '#general',
                    image: './images/default_channel_icon.svg',
                }
            ],
            recentChannels: [
                /*
                {
                    channelId: '#random',
                    displayName: '#random',
                    image: './images/default_channel_icon.png',
                    status: 'none' //default for group channels
                }
                */
            ],
            selectedMessages: [], //all messages for the selected channel 
            
            selectedChannel: {
                channelId: undefined,
                channelDisplayName: undefined,
                isUser: undefined,

                description: undefined,
                path: undefined,
           }
        };


        this.allMessages = [ //collection of all the current conversations
            /*
            {
                channelId: '#random', //used as the unique id when searching for a particular channel. ex. '_admin - _root' for a direct message channelId
                channelDisplayName: '#random', //used when displaying
                isUser: false, 

                description: 'All about that #random talk',
                path: '#random', // N/A for private messages(no point storing socket id), #channel_name for channels
                messages: [], //all the messages for the current channel
            },
            */
        ];
        
        this.onSocketSetup = this.onSocketSetup.bind(this); //connects to server and sets up socket events
        this.removeActiveUser = this.removeActiveUser.bind(this); //socket id passed, boolean returned - true if user is removed from active users pool 
        this.onSendMessage = this.onSendMessage.bind(this); //sends a channel/user/group a message

        this.onConnectionVerified = this.onConnectionVerified.bind(this); //runs when the current user's connection is verified by the server
        this.onNewUserConnection = this.onNewUserConnection.bind(this); //new user connected to server - updates current user info
        this.onUserDisconnect = this.onUserDisconnect.bind(this); //user disconnected - removes from active users' list & adds disconnect msg
        this.onReceiveMessage = this.onReceiveMessage.bind(this); //user received new message

        this.onSocketChannelUpdate = this.onSocketChannelUpdate.bind(this); //user clicked new channel - socket joins/leaves room
        this.onRemoveSocketChannel = this.onRemoveSocketChannel.bind(this); //removes user from selected room
        //this.activeUserUpdate = this.activeUserUpdate.bind(this); //updates active user info when reconnecting (previously dc'd)

        this.onChannelSelect = this.onChannelSelect.bind(this); // user/channel selected - determines channel view display
        this.getChannelInfo = this.getChannelInfo.bind(this);
        this.updateChannelInfo = this.updateChannelInfo.bind(this);
        this.addNewChannel = this.addNewChannel.bind(this); //adds a new channel to this.allMessages
        this.addSelectedChannelMessage = this.addSelectedChannelMessage.bind(this);
        this.addMsgAllChannels = this.addMsgAllChannels.bind(this);
        this.updateRecentChannels = this.updateRecentChannels.bind(this);
        this.doesMessageExist = this.doesMessageExist.bind(this);

        this.onRemoveRecentChannel = this.onRemoveRecentChannel.bind(this); //removes the selected recent channel from the recent category in the chat menu
        this.onRemoveCategory = this.onRemoveCategory.bind(this); //removes the selected channel & leaves the channel room (will not receive another message for this channel)
        this.resetSelectedChannel = this.resetSelectedChannel.bind(this); //restores the selected channel to the default settings

        this.onLogout = this.onLogout.bind(this); //used to emit socket event telling the server the user is logging out, also rerouting user back to landing page

        this.onImgLoadFail = this.onImgLoadFail.bind(this); //user img failed to load, placeholder img used
    }

    componentDidMount() {
        console.log('***COMPONENT DID MOUNT');
        let dbName = 'chat';
        let osName = 'messages';

        this.db = new Database( dbName, osName );

        //this.onChannelSelect('#random'); //default channel selected
        this.onSocketSetup(); //socket event setup
    }

    componentWillUnmount() {
        if ( this.state.accountVerified ) {
            console.log('User being logged out');
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
                this.onReceiveMessage( msg );
            });

            this.socket.on('NEW USER CONNECTED', (data) => {
                this.onNewUserConnection( data );
            });

            this.socket.on('USER DISCONNECTED', (user) => {
                this.onUserDisconnect( user );
            })

            this.socket.on('CONNECTION FAILED', (msg) => {
                this.socket.close(); //manually disconnects socket
                this.props.logout( msg ); //redirects user back to landing page - could not verify login
            });
        }
        catch(err) {
            console.log(`ERR Chat.js onSocketSetup(): ${err.message}`);
        }
    }

    //removes user from active users pool - STATE MUST STILL BE UPDATED, provided the socket id
    removeActiveUser(id) {
        try {
            let currentUsers = JSON.parse( JSON.stringify(this.state.activeUsers ) ); //gets current active users

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
        try {
            console.log(`\nENTERING onSendMessage()`);
            //console.log(`Selected Msg status: ${JSON.stringify(this.state.selectedMessages)}`);       

            let currentStatus = undefined;
            let date = new Date();
            let id = ( Math.floor( Math.random() * 1000 ) ).toString() + date.getDay() + date.getHours().toString() + date.getSeconds().toString();
            let message = {
                channelId: this.state.selectedChannel.channelId, //determines who the message is being sent to
                username: this.state.userData.username, //username who sent message
                socketId: this.state.userData.socketId, //socket id of user who sent message
                image: this.state.userData.image, //image path of user who sent message
                msgId: id,
                msg: msg,
                timestamp: date.toLocaleTimeString()
            };

            let serverInfo = {
                sendTo: this.state.selectedChannel.path //'/' //default path 
            };

            message.receivedTimestamp = date.toLocaleTimeString(); //receive time is the same as sent time for the sender...            
            let packedMsg = {
                msgInfo: message,
                serverInfo: serverInfo
            };

            currentStatus = this.addMsgAllChannels( message );

            if ( currentStatus === STATUS.MESSAGE_ADDED ) {
                //console.log('onSendMessage(): successfully added message to both channels');     
                //console.log('onSendMessage(): *EMITTING chat message event to server');           
                this.socket.emit('chat message', JSON.stringify(packedMsg) ); //only sends to server if successfully added
                this.updateRecentChannels( this.state.selectedChannel.channelId, message );       
                
                
                let tempChannelInfo = getChannelInfo( message.channelId, this.allMessages );

                if ( typeof( tempChannelInfo ) !== 'undefined' ) { //channel info found
                    //console.log('onSendMessage(): channel info found - attempting to update database...');
                    this.db.addData( tempChannelInfo );
                }

                else {
                    //console.log('onSendMessage(): channel info not found - NOT updated in database D:');
                }
            }

            else {
                //console.log('ERR Chat onSendMessage(): failed to add message to both channels');
            }
           
           //displayMessage( message );            
           //console.log(`Selected Msg status: ${JSON.stringify(this.state.selectedMessages)}`);                  
           //console.log(`LEAVING onSendMessage()\n`);
        }
        catch(err) {
            console.log(`Chat onSendMessage(): ${err.message}`);
        }
    }
    
    onReceiveMessage(msg) {
        let currentStatus = undefined; //current status when attempting to store message 
        msg = JSON.parse(msg);

        //determines if the message is for a channel or the user
        console.log('\n*ENTERING onReceiveMessage()');

         if ( this.state.userData.username !== msg.username ) { //current user did NOT send this message
            //console.log('Message received: ');
            //displayMessage( msg );

            if ( this.state.selectedChannel.channelId === msg.channelId ) { //msg is from current selected channel
                currentStatus = this.addMsgAllChannels( msg );

                if ( currentStatus === STATUS.MESSAGE_ADDED ) { //new msg added to both channels
                    //console.log('onReceiveMessage(): successfully added new message to both channels');
                    //this.updateRecentChannels( this.state.selectedChannel.channelId, msg );
                    this.updateRecentChannels( msg.channelId, msg );
                }

                else if ( currentStatus === STATUS.error.CHANNEL_NOT_FOUND ) {
                    //console.log('onReceiveMessage(): channel not found - creating now');
                }

                else {
                    //console.log('ERR onReceiveMessage(): failed to add new message to both channels');
                }
            }

            else { //msg is  NOT from selected channel
                //console.log('onReceiveMessage(): msg NOT from selected channel');
                currentStatus = this.addMessageToChannel( msg.channelId, msg );

                if ( currentStatus === STATUS.MESSAGE_ADDED ) { //successfully added to channel
                    //console.log('onReceiveMessage(): successfully added message to channel');
                    //this.updateRecentChannels( this.state.selectedChannel.channelId, msg );                    
                    this.updateRecentChannels( msg.channelId, msg );
                }

                else if ( currentStatus === STATUS.error.CHANNEL_NOT_FOUND ) {
                    console.log('onReceiveMessage(): msg channel not found - creating channel & adding msg now');
                    //createNewChannel( undefined, msg, '' );
                    currentStatus = (this.addNewChannel( undefined, msg ) ).status;

                    //update recent channel here also!
                    if ( currentStatus === STATUS.CHANNEL_CREATED ) {
                        this.updateRecentChannels( msg.channelId, msg );
                    }

                    else {
                        console.log('ERR Chat OnReceiveMessage(): failed to add new channel and update recent channels');
                    }
                }
            }
         }

         else {
             console.log('Current user sent this message...no action taken');
         }

        console.log(`onReceiveMessage() ending status: ${currentStatus}`);
        console.log('LEAVING onReceiveMessage()\n'); 
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
        try {
            //console.log('\n*ENTERING onNewUserConnection()');
            data = JSON.parse(data); 
    
            let date = new Date();
            let newMsg = data.message;
            newMsg.receivedTimestamp = date.toLocaleTimeString();
    
            let currentUsers = JSON.parse( JSON.stringify( this.state.activeUsers ) ); //current active users
            currentUsers.unshift(data.newUser); //adds new user
            
            /*
            let tempChannelId = generateChannelId( this.state.userData.username, newMsg.username )
            compare generated channel id(current username & username from new msg) to current selected channel
            if they're the same, the path needs to be updated
            */

            let tempChannelId = generateChannelId( this.state.userData.username, newMsg.username );

            if ( tempChannelId === this.state.selectedChannel.channelId ) {
                let updatedSelection = this.state.selectedChannel;
                updatedSelection.path = newMsg.socketId; //updates the socket id for the current user (probably dc'd and reconnected)
            }

            if ( this.state.selectedChannel.channelId === newMsg.channelId ) {
                let updateSelected = JSON.parse( JSON.stringify( this.state.selectedChannel ) );
                
                this.addMsgAllChannels( newMsg );

                if ( !isChannel( newMsg.channelId ) ) {
                    updateSelected = newMsg.socketId;

                    this.setState({ selectedChannel: updateSelected });
                }                
            }

            else {
                this.addMessageToChannel( newMsg.channelId, newMsg );                
            }

            this.setState({ activeUsers: currentUsers });
            //console.log('*LEAVING onNewUserConnection()\n');
            
        }
        catch(err) {
            console.log(`ERR Chat onNewUserConnection(): ${err.message}`);
            console.log('*LEAVING onNewUserConnection()\n');            
        }

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
            //console.log('\n*ENTERING onUserDisconnect()');
            let date = new Date();
            user = JSON.parse( user );

            //updates messages w/user disconnect msg
            let newMsg = user;
            //let selectedMsgs = this.state.selectedMessages;
            newMsg.receivedTimestamp = date.toLocaleTimeString();

            if ( this.state.selectedChannel.channelId === newMsg.channelId ) { //currently on selected channel
                this.addMsgAllChannels( newMsg );
            }
            
            else {
                this.addMessageToChannel( newMsg.channelId, newMsg );
            }

            //removes disconnected user from active user pool
            let currentUsers = this.removeActiveUser( user.socketId );

            if ( currentUsers !== false ) { //user successfully disconnected
                this.setState({
                    //selectedMessages: selectedMsgs,
                    activeUsers: currentUsers //removes DC'd user
                });

                //console.log('onUserDisconnect(): user successfully removed & state updated');
            }
        
            else {
                //console.log(`Failed to remove disconnected user: ${user.username}`);
            }

            //console.log('*LEAVING onUserDisconnect()\n');            
       }
       catch(err) {
           console.log(`ERR Chat onUserDisconnect(): ${err.message}`);
           console.log('*LEAVING onUserDisconnect()\n');                       
       }
    }

    //runs when sending message (may also run when receiving - if so, need to add code when a different channel is selected (2nd if statement))
    onSocketChannelUpdate(selected) {
        try {
            //determines the channels the socket will join/leave
            let update = {
                join: undefined,
                leave: undefined
            };
    
            if ( !selected.isUser ) { //channel selected
                if ( selected.name !== this.state.selectedChannel.name ) { //different channel selected - doesn't update if same channel is clicked
                    update.join = selected.name; //joins new group

                    if ( !this.state.selectedChannel.isUser ) { //previous selection is a group
                        if ( this.state.selectedChannel.path !== '/' ) { //only leaves group if it isn't the default path
                            //update.leave = this.state.selectedChannel.name; //leaves previous group
                        }
                    }

                    else { //previous selection is a private message
                        //update.join = selected.name; //joins new group 
                    }

                    //only emits the event if something needs to be updated
                    if ( typeof(update.join) !== 'undefined' || typeof(update.leave) !== 'undefined' ) {
                        //emits event to server to update current socket channel
                        this.socket.emit('UPDATE CHANNEL', JSON.stringify(update) );
                    }
                }
            }
        }
        catch(err) {
            console.log(`Chat onSocketChannelUpdate(): ${err.message}`);
        }
    }

    onRemoveSocketChannel(channel) {
        try {
            //console.log('\n*ENTERING onRemoveSocketChannel()');

            this.socket.emit('LEAVE ROOM', JSON.stringify( channel ) );

            //console.log('*LEAVING onRemoveSocketChannel()\n');
            
        }
        catch(err) {
            console.log(`ERR Chat onRemoveSocketChannel(): ${err.message}`);
        }
    }

    addSelectedChannelMessage(msg) {
        try {
            //console.log('*ENTERING addSelectedChannelMessage()');
            let selectedMsgs = JSON.parse( JSON.stringify(this.state.selectedMessages) );

            //console.log(`Selected Msg status: ${JSON.stringify(this.state.selectedMessages)}`);
    
            for(let i = 0; i < selectedMsgs.length; i++) { //checking for duplicate messages
                if  ( selectedMsgs[i].msgId === msg.msgId ) { //found duplicate msg
                    //console.log('\nERR addSelectedChannelMessage(): duplicate message found...not adding');
                    //console.log(`selectedMessages[i].msgId: ${selectedMsgs[i].msgId}`);
                    //console.log(`Msg id: ${msg.msgId}\n`);
                    
                    return STATUS.error.DUPLICATE_MESSAGE;
                    //return false;
                }
            }
    
            //duplicate msg not found
            selectedMsgs.unshift( msg );
            this.setState({ selectedMessages: selectedMsgs });
            
            //console.log('*Leaving addSelectedChannelMessage()');        
            return STATUS.MESSAGE_ADDED;
            //return true;
        }
        catch(err) {
            console.log(`ERR Chat addSelectedChannelMessage(): ${err.message}`);
            return STATUS.error.UNKNOWN;
        }
    }

    //adds message to given channel name, provided the channel exists and message isn't a duplicate - returns false if not added
    addMessageToChannel(channelName, msg) {
        try {
            //console.log(`\n*ENTERING addMessageToChannel():`);
            //console.log(`-channelName: ${channelName}`);
            //console.log(`-msg received: ${msg.msg}`);
            
    
            for(let i = 0; i < this.allMessages.length; i++) {  //goes through all the messages
              if ( this.allMessages[i].channelId === channelName ) { //channel is found
                //console.log('Channel found. Current messages: ');
                //console.log( JSON.stringify(this.allMessages[i].messages) );
                //console.log();
                //checks for duplicate messages
                for(let k = 0; k < this.allMessages[i].messages.length; k++) {
                    if ( this.allMessages[i].messages[k].msgId === msg.msgId ) { //duplicate msg found
                        //console.log('addMessageToChannel(): duplicate message found...not adding');
                        //console.log(`new msg: ${msg.msg}`)
                        //console.log(`current msg: ${this.allMessages[i].messages[k].msg}`);
                        //return false;
                        return STATUS.error.DUPLICATE_MESSAGE;
                    }
                }
                //console.log(`**Selected Msg status: ${JSON.stringify(this.state.selectedMessages)}`);
                
                this.allMessages[i].messages.unshift( msg ); //adds message
                //console.log(`**Selected Msg status: ${JSON.stringify(this.state.selectedMessages)}`);            
                //console.log(`Successfully added ${msg.msg} to ${channelName} (this.allMessages[])`);
                //console.log(`*LEAVING addMessageToChannel():\n`);
            //return true;
                return STATUS.MESSAGE_ADDED;
              }
            }
    
            //console.log('addMessageToChannel(): message not added - channel not found');
            //console.log(`*LEAVING addMessageToChannel():\n`);
            //return false;
            return STATUS.error.CHANNEL_NOT_FOUND;
        }
        catch(err) {
            console.log(`ERR Chat addMessageToChannel(): ${err.message}`);
            return STATUS.error.UNKNOWN;
        }
    }

    doesMessageExist(msg, allMsgs) {
        try {
            //console.log('\n*ENTERING doesMessageExist()');
            //if length > 0, the message is stored at least once
            let msgExists = allMsgs.filter( message => message.msgId === msg.msgId );

            /*
            console.log(`\ndoesMessageExist(): filtered type: ${typeof(msgExists) }`);
            console.log(`filtered content: ${JSON.stringify(msgExists) }\n`);
            */
            if ( msgExists.length > 0 ) { //message exists
                //console.log('doesMessageExist(): message ALREADY STORED D:');
                return true;
            }

            //message doesn't exist
            /*console.log('doesMessageExist(): message not currently stored :D');     
            console.log(`**Selected Msg status: ${JSON.stringify(this.state.selectedMessages)}`);                        
            console.log('*LEAVING doesMessageExist()\n');                       
            */
            return false;
        }
        catch(err) {
            console.log(`ERR Chat doesMessageExist(): ${err.message}`);
            console.log(`**Selected Msg status: ${JSON.stringify(this.state.selectedMessages)}`);                        
            console.log('*LEAVING doesMessageExist()\n');                                   
            return false;
        }
    }
    //adds the message to the selected channel and to this.allMessages
    addMsgAllChannels(msg) {
        try {
            //console.log('\n*ENTERING addMsgAllChannels()');
            //console.log(`**Selected Msg status: ${JSON.stringify(this.state.selectedMessages)}`);            

            //checks if the message already exists in selected messages
            if ( this.doesMessageExist( msg, JSON.parse( JSON.stringify( this.state.selectedMessages ) ) ) ) {
                //console.log('\n**addMsgAllChannels(): message already exists - no changes');
                return STATUS.error.DUPLICATE_MESSAGE;
            }

            else { //message does not exist, stores in all messages & selected messages
                //console.log('addMsgAllChannels(): message DOES NOT exist - storing message in all channels...');
                //console.log(`**Selected Msg status: ${JSON.stringify(this.state.selectedMessages)}`);            
                
                let tempSelectedMsgs = JSON.parse( JSON.stringify( this.state.selectedMessages ) );
                tempSelectedMsgs.unshift( createNewMsg( msg ) );
                //tempSelectedMsgs.push( createNewMsg( msg ) );
                
                for(let i = 0; i < this.allMessages.length; i++) {
                    if ( this.allMessages[i].channelId === msg.channelId ) { //found channel to add message
                        //console.log('**ASSUMPTION: message did not exist in selected messages, so storing there & this.allMessages (assumption)');
                        //console.log('**Adding msg to BOTH channels now');

                        this.allMessages[i].messages.unshift( createNewMsg( msg ) ); //adding message to channel
                        //console.log(`**Selected Msg status (ONLY added to this.allMessages): ${JSON.stringify(this.state.selectedMessages)}`);
                        
                        this.setState({
                            selectedMessages: tempSelectedMsgs
                        });

                        //console.log(`**Selected Msg status (added to selected messages): ${JSON.stringify(this.state.selectedMessages)}`);
                        //console.log('*LEAVING addMsgAllChannels()\n');            
                        //return true;
                        return STATUS.MESSAGE_ADDED;
                    }
                }
            }

            console.log('*LEAVING addMsgAllChannels()\n');
            //return channel not found err
            //return false;
            return STATUS.error.CHANNEL_NOT_FOUND;
        }
        catch(err) {
            console.log(`ERR Chat addMsgAllChannels(): ${err.message}`);
            console.log('*LEAVING addMsgAllChannels()\n'); 
            //return false;           
            return STATUS.error.UNKNOWN;
        }
    }

    //given the channel id and message(sent or received), this either adds a new recent channel or doesn't because it already exists
    updateRecentChannels(channelId, msg) {
        /*
        channelId: '#random',
                    displayName: '#random',
                    image: './images/default_channel_icon.png',
                    status: 'none' //default for group channels
        */
           
        //console.log('\n*ENTERING updateRecentChannels()');

        let channelData = {
            channelId: undefined,
            displayName: undefined,
            image: undefined,
            status: undefined,
        };

        let recent = [...this.state.recentChannels];
        //console.log(`updateRecentChannels() spread operator: ${recent}`);

        let doesChannelExist = ( recent.filter( channel => channel.channelId === channelId ) ).length; //if > 0 it is already a recent channel

        if ( !doesChannelExist ) { //recent channel doesn't currently exist
            //console.log(`updateRecentChannels(): "${channelId}" currently doesn't exist`);

            if( isChannel( channelId ) ) { //updating channel 
                //console.log('updateRecentChannels(): searching this.allMessages for this channel');

                for(let i = 0; i < this.allMessages.length; i++) { //goes through all messages checking for channel data
                    if ( this.allMessages[i].channelId === channelId ) { //found channel data
                        channelData.channelId = channelId;
                        channelData.displayName = this.allMessages[i].channelId;
                        channelData.image = './images/default_channel_icon.svg',
                        channelData.status = 'none';

                        recent.unshift( channelData );
                        this.setState({ recentChannels: recent });

                        break;
                    }
                }
            }

            else { //updating direct message - still pulled from allMessages instead of going through active users
                //console.log('updateRecentChannels(): searching this.allMessages for this direct message channel');

                for(let i = 0; i < this.allMessages.length; i++) {
                    if ( this.allMessages[i].channelId === channelId ) {
                        channelData.channelId = channelId;
                        channelData.displayName = this.allMessages[i].channelDisplayName;
                        //channelData.image = msg.image;
                        channelData.status = 'online';
                        let aUsers = [...this.state.activeUsers];

                        
                        for(let k = 0; k < aUsers.length; k++) {
                            if ( aUsers[k].username === channelData.displayName ) {
                                //console.log('updateRecentChannels(): user image found for recent channel');

                                channelData.image = aUsers[k].image; //updates image 
                                break;
                            }
                        }

                        if ( typeof( channelData.image ) !== 'undefined' ) {
                            //console.log('updateRecentChannels(): updating state now');

                            recent.unshift( channelData );
                            this.setState({ recentChannels: recent });
                        }


                        break;
                    }
                }

            }
        }

        else { //recent channel already exists
            //console.log('updateRecentChannels(): recent channel already exists - no action taken')
        }


        //console.log('*LEAVING updateRecentChannels()\n');
    }
    
    addNewChannel(channelInfo = undefined, msg = undefined) {
        try {
            //console.log('\n*ENTERING addNewChannel()');
            
            //template for new channel (used if channelInfo is not provided)
            let newChannel = {
                channelId: '',
                channelDisplayName: '',
                isUser: undefined,

                description: '',
                path: '',
                messages: ( typeof(msg) === 'undefined' ) ? [] : [ createNewMsg(msg) ]
            };           
            
            //creating channel for new user/group message
            if ( typeof(channelInfo) !== 'undefined' ) {
                //console.log('addNewChannel(): creating channel for selected user/group msg');
                this.allMessages.unshift( JSON.parse( JSON.stringify(channelInfo) ) );
                
                //displayChannelInfo( channelInfo );
                return {channel: JSON.parse( JSON.stringify(channelInfo) ), status: STATUS.CHANNEL_CREATED};
            }

            //received a message from a new channel/user (direct message)
            else if ( typeof(msg) !== 'undefined' ) {     
                //console.log('addNewChannel(): creating channel for new channel/user msg');           
                newChannel.channelId = msg.channelId; //channel unique id

                if ( isChannel( msg.channelId ) ) { //message is for a channel
                    newChannel.channelDisplayName = msg.channelId; //channel display name is the same as the channel id
                    newChannel.isUser = false;
                    newChannel.description = 'All about that ' + msg.channelId + ' talk';
                    newChannel.path = msg.channelId;
                }

                else { //message is for a user (direct message)
                    //newChannel.channelDisplayName = ' @ ' + msg.username;
                    newChannel.channelDisplayName = msg.username;
                    newChannel.isUser = true;
                    newChannel.description = "Sending D.M's to " + msg.username;
                    newChannel.path = msg.socketId; 
                }

                this.allMessages.unshift( JSON.parse( JSON.stringify(newChannel) ) );
                //displayChannelInfo( newChannel );
                return {channel: newChannel, status: STATUS.CHANNEL_CREATED};
                //return STATUS.CHANNEL_CREATED;
            }

            //console.log('*LEAVING addNewChannel()\n');    
            return {channel: undefined, status: STATUS.error.CHANNEL_CREATION_FAILED};        
            //return STATUS.error.CHANNEL_CREATION_FAILED;

        }
        catch(err) {
            console.log(`Chat addNewChannel(): ${err.message}`);
            //return STATUS.error.CHANNEL_CREATION_FAILED; //failed to add new channel
            return {channel: undefined, status: STATUS.error.CHANNEL_CREATION_FAILED};        
        }
    }

    //updating state to new selected channel
    //channelInfo format: {allMessages[i]} - need to break apart message from 
    //the selected channel info
    updateChannelInfo(channelInfo) {
        try {
            
            let newChannel = createNewChannel( channelInfo ); //returns new referenced object for selected channel
    
            //updates selected channel/msgs state
            this.setState({
                selectedChannel: newChannel,
                selectedMessages: JSON.parse( JSON.stringify(channelInfo.messages) ),
            });
            return true;
        }
        catch(err) {
            console.log(`ERR updateChannelInfo(): ${err.message}`);
            return false;
        }
    }

    //selectedId(id of element user clicked) - if user, it will be the user's id (their username)
    //channelId(what the channel id is/would be based on selected id)
    getChannelInfo(selectedId, channelId) {
        try {
            //console.log(`\n*ENTERING getChannelInfo()`);

            //template (used if channel info isn't found in this.allMessages)
            let userInfo = undefined;
            let _isChannel = isChannel( selectedId ); //boolean - true if selectedId is a group channel (not direct message)
            let channelInfo = {
                channelId: channelId, //used as the unique id when searching for a particular channel. ex. '_admin - _root' for a direct message channelId
                channelDisplayName: _isChannel ? channelId : selectedId,  //`@ ${selectedId}`, 
                isUser: _isChannel ? false : true,
    
                description: _isChannel ? `All about that ${selectedId} talk` : `Sending D.M's to ${selectedId}`,
                path: _isChannel ? channelId : 'N/A', //socket id for private messages, #channel_name for channels
    
                messages: [], //message list for current channel
            }
    
            if ( !_isChannel ) { //channel not selected (direct message)
                userInfo = getUserInfo( selectedId, this.state.activeUsers ); //gets the info of the user we're messaging
    
                if ( typeof(userInfo) !== 'undefined' ) { //user info found
                    channelInfo.path = userInfo.socketId; //selected path updated to user's socket id
                    //console.log("getChannelInfo(): successfully updated selected channel path to user's socket id");
                }
    
                else {
                    //console.log('ERR getChannelInfo(): info not found for selected user');
                }
            }
    
    
            for(let i = 0; i < this.allMessages.length; i++) { //search through all stored messages for selected channel
                if ( this.allMessages[i].channelId === channelId ) { //channel found
                    //console.log('getChannelInfo(): channel found in this.allMessages');
                    channelInfo = JSON.parse( JSON.stringify( this.allMessages[i] ) ); 

                    if ( typeof( userInfo ) !== 'undefined' ) {
                        channelInfo.path = userInfo.socketId;
                    }

                    return {channel: channelInfo, status: STATUS.SELECTED_CHANNEL_FOUND};
                }
            }
    
            //console.log(`*LEAVING getChannelInfo()\n`);            
            //channel not found (doesn't exist) - returns error status & template for creating new channel
            return {channel: channelInfo, status: STATUS.error.CHANNEL_NOT_FOUND};
        }
        catch(err) {
            console.log(`ERR Chat getChannelInfo(): ${err.message}`);
            console.log(`*LEAVING getChannelInfo()\n`);                        
        }
    }
    
    //determines the channel view, argument is a user/channel id
    onChannelSelect(selected) {
        //only updates if a new channel has been selected
        /*console.log('\n*ENTERING onChannelSelect()');
        console.log(`-selected channel: ${selected}`);
        console.log(`-current channel: ${this.state.selectedChannel.channelId}\n`);
        */

        let channelInfo = undefined; //returns info from the DB about the selected channel
        let channelId = generateChannelId( this.state.userData.username, selected );

        if ( channelId !== this.state.selectedChannel.channelId ) { //new channel selected
            channelInfo = this.getChannelInfo( selected, channelId );

            if ( channelInfo.status === STATUS.SELECTED_CHANNEL_FOUND ) { //selected channel found  
                //console.log('onChannelSelect(): selected channel found - not creating');

                if ( this.updateChannelInfo( channelInfo.channel ) ) { //successfully updated selected channel/msg state
                    //console.log('onChannelSelect(): successfully updated selected channel/msg state');
                    //displayChannelInfo( channelInfo.channel );
                }

                else {
                    //console.log('ERR onChannelSelect(): failed to update selected channel/msg state');
                }
            }

            else { //selected channel not found (doesn't exist) - creating channel now
                //create channel, then update. channelInfo = createChannel()
                //console.log('onChannelSelect(): channel not found - creating channel now');
                channelInfo = this.addNewChannel( channelInfo.channel, undefined );
                //displayChannelInfo( channelInfo.channel );

                if ( channelInfo.status === STATUS.CHANNEL_CREATED ) { //new channel succcessfully created
                    //console.log('successfully added new channel to this.allMessages()');

                    if ( this.updateChannelInfo( channelInfo.channel ) ) { //successfully updated selected channel/msg state
                        //console.log('onChannelSelect(): successfully updated selected channel/msg state');
                        //displayChannelInfo( channelInfo.channel )
                    }
    
                    else {
                        //console.log('ERR onChannelSelect(): failed to update selected channel/msg state');
                    }
                }

                else {
                    //console.log('ERR onChannelSelected(): failed to create channel');
                }
            }
        }

        else { //user selected current channel
            //console.log('onChannelSelect() channel already selected: no action taken');
        }

        //console.log('*LEAVING onChannelSelect()\n');
    }

    //removes the selected recent channel from the recent category
    onRemoveRecentChannel(selectedId) {
        //console.log('\n*ENTERING onRemoveRecentChannel() - chat.js');
        //console.log(`onRemoveRecentChannel() passed selected id: ${selectedId}`);

        let selectedChannel = selectedId;

        if ( !isChannel( selectedChannel ) ) { //if channel selected for removal is a direct message
            selectedChannel = generateChannelId( this.state.userData.username, selectedId ); //pulls the direct message channel id to filter out
        }

        //removes selected recent channel from state
        let recentChannels = this.state.recentChannels.filter( channel => channel.channelId !== selectedChannel );
        //console.log(`onRemoveRecentChannel() recentChannels filtered: ${JSON.stringify(recentChannels)}\n`);

        if ( selectedChannel === this.state.selectedChannel.channelId ) { //recent category is also the selected view
            //updates selected channel view to default & recent channels to current
            this.setState({
                selectedChannel: this.resetSelectedChannel(),
                recentChannels: recentChannels
            });
        }

        else {
            this.setState({ recentChannels });
        }

        //console.log('*LEAVING onRemoveRecentChannel()\n');
    }

    onRemoveCategory(selectedId) {
        //console.log(`\n*ENTERING onRemoveCategory()`);
        //console.log(`onRemoveCategory() selected channel: ${selectedId}`);

        //filter out selected channel, removing from state
        let joinedChannels = this.state.joinedChannels.filter( channel => channel.channelId !== selectedId );

        if ( selectedId === this.state.selectedChannel.channelId ) { //removed category is also the selected view
            //updates selected channel view to default & joined channels to current
            this.setState({
                selectedChannel: this.resetSelectedChannel(),
                joinedChannels: joinedChannels
            });
        }

        else {
            this.setState({ joinedChannels });
        }


        //once removed from state, leave room on server side
        this.onRemoveSocketChannel( selectedId );

        //console.log('*LEAVING onRemoveCategory()\n')
    }

    //returns the selected channel default state (state not updated here in case multiple updates need to be done)
    resetSelectedChannel() {
        return (
            {
                channelId: undefined,
                channelDisplayName: undefined,
                isUser: undefined,
    
                description: undefined,
                path: undefined,
            }
        );
    }

    onLogout() {
        this.socket.emit('logout'); //used to inform the server the user is logging out
        this.props.logout(); //returns user back to landing page
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
            let allMsgs = this.state.selecetdMessages;

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
                        selectedMessages: allMsgs,
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
                         selectedChannel={this.state.selectedChannel} selectedMsgs={this.state.selectedMessages}
                         onSendMsg={this.onSendMessage} onSelect={this.onChannelSelect} onImgFail={this.onImgLoadFail}
                         recentChannels={this.state.recentChannels} onRemoveRecentChannel={this.onRemoveRecentChannel} 
                         joinedChannels={this.state.joinedChannels} onRemoveCategory={this.onRemoveCategory} allMessages={this.allMessages} logout={this.onLogout} />
        );
    }
}

export default Chat;