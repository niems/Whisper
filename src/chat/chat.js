import React, {Component} from 'react'
import VerifyLogin from './verify_login'
import ChatMenu from './chat_menu'
import ChannelView from './channel_view'
import './style/chat.css'

const io = require('socket.io-client');
const serverHost = '192.168.86.32:8080';

function DisplayChat({ accountVerified, userData, users, messages, selectedChannel, selectedMsgs, onSendMsg, onSelect, onImgFail }) {
    if ( accountVerified ) {
        return (
            <div id='chat-container'>
                <ChatMenu userData={userData} users={users} onSelect={onSelect} onImgFail={onImgFail} />
                <ChannelView messages={messages} selectedChannel={selectedChannel} selectedMsgs={selectedMsgs} onSendMsg={onSendMsg} />
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

            selectedChannel: {
                name: '#random', //name of the channel - #channel_name for channels, pm - [username] for private messages
                description: 'All about that #random talk',
                path: '/', //socket id for private messages, #channel_name for channels
                isUser: false
            },
            selectedMessages: [], //all messages for the selected channel 
        };

        this.allMessages = [ //collection of all the current conversations
            {
                channel: '#random',
                description: 'All about that #random talk',
                path: '/', // N/A for private messages(no point storing socket id), #channel_name for channels
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
        this.onSocketChannelUpdate = this.onSocketChannelUpdate.bind(this); //user clicked new channel - socket joins/leaves room

        this.onChannelSelect = this.onChannelSelect.bind(this); // user/channel selected - determines channel view display
        this.getChannelInfo = this.getChannelInfo.bind(this);
        this.updateChannelInfo = this.updateChannelInfo.bind(this);
        this.addNewChannel = this.addNewChannel.bind(this); //adds a new channel to this.allMessages

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
        try {
            let date = new Date();
            let id = ( Math.floor( Math.random() * 1000 ) ).toString() + date.getDay() + date.getHours().toString() + date.getSeconds().toString();
    
            let message = {
                channel: this.state.selectedChannel.name, //determines who the message is being sent to
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
            
            this.socket.emit('chat message', JSON.stringify(packedMsg) );
            
    
            //appends user's message to message list
            //alert(`selected messages: ${JSON.stringify(this.state.selectedMessages)}`);
            let selectedMessages = this.state.selectedMessages;
            let messages = this.state.messages;
            message.receivedTimestamp = date.toLocaleTimeString(); //receive time is the same as sent time for the sender...
    
            selectedMessages.unshift( message );
            messages.unshift( message );
    
            this.setState({
                messages: messages,
                selectedMessages: selectedMessages
            });
    
            //adds message to this.allMessages
            if ( this.addMessageToChannel( this.state.selectedChannel.name, message ) ) {
                console.log('successfully added message to current channel');
            }

            else {
                console.log('failed to add message to current channel');
            }
        }
        catch(err) {
            console.log(`Chat onSendMessage(): ${err.message}`);
        }
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
        let selectedMsgs = this.state.selectedMessages;
        let newMsg = data.message;
        newMsg.receivedTimestamp = date.toLocaleTimeString();

        messages.unshift( newMsg );
        selectedMsgs.unshift( newMsg );

        let currentUsers = this.state.activeUsers; //current active users
        currentUsers.unshift(data.newUser); //adds new user
        //alert(`New user info: ${JSON.stringify(data.newUser)}`);

        this.addMessageToChannel( '#random', newMsg );

        if ( this.state.selectedChannel.name === '#random' ) { //currently on default channel
            this.setState({ 
                activeUsers: currentUsers,
                messages: messages,
                selectedMessages: selectedMsgs
            }); 
        }

        else {
            this.setState({ 
                activeUsers: currentUsers,
                messages: messages,
            }); 
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
            let date = new Date();
            user = JSON.parse( user );

            //updates messages w/user disconnect msg
            let newMsg = user;
            let messages = this.state.messages;
            let selectedMsgs = this.state.selectedMessages;
            newMsg.receivedTimestamp = date.toLocaleTimeString();

            messages.unshift( newMsg );
            selectedMsgs.unshift( newMsg );

            //removes disconnected user from active user pool
            let currentUsers = this.removeActiveUser( user.socketId );

            if ( currentUsers !== false ) { //user successfully disconnected
                this.setState({
                    messages: messages, //adds user DC msg
                    selectedMessages: selectedMsgs,
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
        let selectedMsgs = this.state.selectedMessages;
        let messages = this.state.messages;
        let newMsg = JSON.parse(msg);
        let hasChannelUpdated = false; //determines if this new message has been added to the corresponding channel
        let updateSelectedMsgsNeeded = false; //determines if the selected message state is updated
        //determines if the message is for a channel or the user
        let isChannel = (new RegExp('^[#]') ).test( newMsg.channel ); 

        newMsg.receivedTimestamp = date.toLocaleTimeString();
        messages.unshift( newMsg );

        if ( isChannel ) { //message received for a channel
            if ( this.state.selectedChannel.name === newMsg.channel ) {
                updateSelectedMsgsNeeded = true;
            }

            if ( this.addMessageToChannel( newMsg.channel, newMsg ) ) { //successfully added to new msg to the channel
                hasChannelUpdated = true;
            }

            else { //failed to add msg to channel - channel does not exist yet

                if ( typeof(this.addNewChannel( undefined, newMsg )) !== 'undefined' ) {
                    hasChannelUpdated = true;
                }
            }
        }

        else { //message received for a user
            if ( this.state.selectedChannel.name === newMsg.username ) {
                updateSelectedMsgsNeeded = true;
            }

            if ( this.addMessageToChannel( newMsg.username, newMsg ) ) { //successfully added msg to user channel
                hasChannelUpdated = true;
            }

            else { //failed to add msg to channel - user channel does not exist yet
                if ( typeof(this.addNewChannel( undefined, newMsg )) !== 'undefined' ) {
                    hasChannelUpdated = true;
                }
            }
        }
        /*
        //FIRST PARAMETER ONLY WORKS IF THE CHANNEL IS A GROUP. 
        //if this is sent from a user, 'channel' will contain the receiving user's username 
        //tries to add new message to channel - returns false if it fails
        if ( this.addMessageToChannel( newMsg.channel, newMsg ) ) { 
            console.log('message successfully added to channel');
        }

        
        else { //channel doesn't exist - needs to be created 
            //creates a new channel and adds the new msg to it
            //the 'undefined' bit means we don't already have the channel info
            let newChannel = this.addNewChannel( undefined, newMsg );
        }

        if ( newMsg.channel === this.state.selectedChannel.name ) { //only updated if it's a message from the selected channel
            selectedMsgs.unshift( newMsg ); 
        }

        //update all messages here
        for(let i = 0; i < this.allMessages.length; i++) {
            if ( this.allMessages[i].channel === newMsg.channel || this.allMessages[i].channel === newMsg.username ) { //found the channel's messages to update
                this.allMessages[i].messages.unshift( newMsg ); //adds new message
                hasChannelUpdated = true;
                break;
            }
        }

        */
        
        if ( !hasChannelUpdated ) { //channel hasn't updated - doesn't exist yet

            if ( updateSelectedMsgsNeeded ) { //selected view is the same as received msg - updates selected msgs
                selectedMsgs.unshift( newMsg );

                this.setState({ 
                    messages: messages,
                    selectedMessages: selectedMsgs
                 });
            }
        }   
    }

    //runs when sending message (may also run when receiving - if so, need to add code when a different channel is selected (2nd if statement))
    onSocketChannelUpdate(selected) {
        try {

            //console.log(this.socket);
            //determines the channels the socket will join/leave
            let update = {
                join: undefined,
                leave: undefined
            };
    
            if ( !selected.isUser ) { //channel selected
                if ( selected.name !== this.state.selectedChannel.name ) { //different channel selected - doesn't update if same channel is clicked
                    if ( selected.path === '/' ) { //default path selected - need to leave other socket group
                        
                        /*
                        //4.12 -- does not leave previous group b/c you would stop receiving messages from said group.
                        //only should leave a group if explicitly stated (need to add functionality to leave group and not receive messages from them)
                        if ( !this.state.selectedChannel.isUser && this.state.selectedChannel.path !== '/') { //previous selection is a group and not the default
                            //update.leave = this.state.selectedChannel.name; //leaves previous group
                        }
                        */

                        //no need to do anything if previous selection is a private message
                    }
    
                    else { //different channel clicked - selected a channel not currently set to the channel view. May never have joined this socket room
                        update.join = selected.name; //joins new group

                        if ( !this.state.selectedChannel.isUser ) { //previous selection is a group
                            //update.join = selected.name; //joins new group
                            if ( this.state.selectedChannel.path !== '/' ) { //only leaves group if it isn't the default path
                                //update.leave = this.state.selectedChannel.name; //leaves previous group
                            }
                        }

                        else { //previous selection is a private message
                            //update.join = selected.name; //joins new group 
                        }
                    }

                    //emits event to server to update current socket channel
                    this.socket.emit('UPDATE CHANNEL', JSON.stringify(update) );
                }
            }
        }
        catch(err) {
            console.log(`Chat onSocketChannelUpdate(): ${err.message}`);
        }
    }

    addMessageToChannel(channelName, msg) {
        for(let i = 0; i < this.allMessages.length; i++) {  //goes through all the messages
          if ( this.allMessages[i].channel === channelName ) { //channel is found
            this.allMessages[i].messages.unshift( msg ); //adds message
            return true;
          }
        }

        return false;
    }
    addNewChannel(channelInfo = undefined, newMsg = undefined) {
        try {
            let newChannel = {
                channel: '',
                description: '',
                path: '',
                messages: ( typeof(newMsg) === 'undefined' ) ? [] : [ newMsg ]
            };

            if ( typeof(channelInfo) !== 'undefined' ) { //current user messaging a new channel/user
                /*
                if ( channelInfo.isUser ) { //if this is a private message 
                    newChannel.path = 'N/A'; //if there was a point to saving the socket id, it would be saved here
                }

                else { //message to channel/group
                    if ( channelInfo.name === '#random' ) { //default channel path
                        newChannel.path = '/';
                    }

                    else { //normal channel path
                        newChannel.path = channelInfo.name;
                    }
                }

                newChannel.channel = channelInfo.name;
                newChannel.description = channelInfo.description;
                this.allMessages.unshift( newChannel ); //adds new channel 
                return newChannel; //returns added new channel
                */
               channelInfo.messages = newChannel.messages; //accounts for newMsg passed

                this.allMessages.unshift( channelInfo ); //passed new channel info already current
                return channelInfo; //returns added channel
            }
    
            else if ( typeof(newMsg) !== 'undefined') { //current user received a message from a new channel/user
                let isChannel = new RegExp('^[#]');

                if ( isChannel.test( newMsg.channel ) ) { //message from channel - new channel
                    newChannel.description = `All about that ${channelInfo.channel} talk`;
                    newChannel.path = (channelInfo.channel === '#random') ? '/' : channelInfo.channel;
                }

                else { //message from user - new user channel
                    newChannel.description = `Sending P.M's to ${newMsg.username}`;
                    newChannel.path = 'N/A'; //no path recorded for private messages
                    newChannel.channel = channelInfo.username;
                }


                this.allMessages.unshift( newChannel ); //adds new channel
                return newChannel; //returns added new channel
            }

            return undefined; //failed to add new channel
        }
        catch(err) {
            console.log(`Chat addNewChannel(): ${err.message}`);
            return undefined; //failed to add new channel
        }
    }

    updateChannelInfo(selectedChannel) {
        let foundChannelInfo = undefined; //channel info/messages for the current channel 

        for(let i = 0; i < this.allMessages.length; i++) { //goes through all the messages
            if ( this.allMessages[i].channel === selectedChannel.name ) { //selected channel found
                foundChannelInfo = this.allMessages[i]; //stores the messages & info for the current channel
                break;
            }
        }

        if ( typeof(foundChannelInfo) !== 'undefined' ) { //channel info & messages found 

            //updates the selected channel & corresponding messages 
            selectedChannel.description = foundChannelInfo.description; //updating description based on what server has stored
            selectedChannel.path = foundChannelInfo.path;

            this.setState({ 
                selectedChannel: selectedChannel,
                selectedMessages: foundChannelInfo.messages
            });

            return true;
        }

        //channel does not exist yet - creating channel
        else {
            //creates the new channel, adds to this.allMessages, and returns the channel copy
            //the undefined bit is saying new don't have a new message to append
            let newChannel = this.addNewChannel( selectedChannel, undefined );

            alert(`Selected channel: ${JSON.stringify(selectedChannel)}`);

            this.setState({
                selectedChannel: {
                    name: newChannel.name,
                    path: newChannel.path,
                    description: newChannel.description,
                    isUser: newChannel.isUser,
                },
                selectedMessages: newChannel.messages,
            });

            return true;
        }

        alert()
        return false;
    }

    //returns the name and path. 'channel' is the id of what the user clicked
    getChannelInfo(channel) {
        //if the selected is a user, replace w/socket id
        let isChannel = new RegExp('^[#]'); 
        let tempChannel = { 
            name: '',
            path: '',
            description: '',
            isUser: undefined
        };

        //user selected - private message
        if ( !isChannel.test(channel) ) { 
            let aUsers = this.state.activeUsers;

            for(let i = 0; i < aUsers.length; i++) { //checks through all active users
                if ( channel === aUsers[i].username ) { //selected user found                    
                    tempChannel.name = channel;
                    tempChannel.description = "Sending P.M's to " + channel;
                    tempChannel.path = aUsers[i].socketId;
                    tempChannel.isUser = true;
                    return tempChannel; 
                }
            }
            return undefined; //user selected but not found in active users D:
        }

        //channel selected - group message
        tempChannel.name = channel;
        tempChannel.description = 'All about that ' + channel + ' talk';
        tempChannel.path = (channel === '#random') ? '/' : channel; 
        tempChannel.isUser = false;

        return tempChannel;
    }
    
    //determines the channel view, argument is a user/channel id
    onChannelSelect(selected) {
        //if the selected is a user, replace w/socket id
        let tempChannel = this.getChannelInfo( selected ); //returns the name and path of the channel
        this.onSocketChannelUpdate( tempChannel );

        if ( typeof(tempChannel) === 'undefined' ) {
            alert('ERROR - temp channel is undefined D:');
            return false;
        }

        this.updateChannelInfo( tempChannel );
        /*
        if ( this.updateChannelInfo( tempChannel ) ) { //successfully updated channel info
            if ( !this.state.selectedChannel.isUser ) { //channel selected
                if ( this.state.selectedChannel.path !== '/' ) { //not default channel namespace
                    //call update channel function here
                }
            }
        }
        */
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
                         messages={this.state.messages} selectedChannel={this.state.selectedChannel} selectedMsgs={this.state.selectedMessages}
                         onSendMsg={this.onSendMessage} onSelect={this.onChannelSelect} onImgFail={this.onImgLoadFail} />
        );
    }
}

export default Chat;