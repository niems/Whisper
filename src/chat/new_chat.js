import React, {Component} from 'react'
import './style/new_chat.css'

//LEFT PANE
function DisplayChatMenu(props) {
    return (
        <div id='chat-menu-container'>
            .
        </div>
    );
}
//END LEFT PANE


//MAIN PANE
function DisplayNavbar(props) {
    let channel = '#random';
    let channelDesc = 'Non-work banter and water cooler conversation';
    let userCount = '1';
    let pinCount = '0';

    return (
        <div id='chat-messages-navbar'>
            <div id='navbar-msg-info-container'>
                <h6 className='navbar-msg-channel'>{channel}</h6>

                <div id='navbar-msg-channel-info'>
                    <button className='navbar-button' id='navbar-star-btn'></button> | 
                    <button className='navbar-button' id='navbar-user-count-btn'></button><small>{userCount}</small> |
                    <button className='navbar-button' id='navbar-pin-btn'></button><small>{pinCount}</small> |        
                    <small id='navbar-channel-info'>{channelDesc}</small>
                </div>
            </div>

            <div id='navbar-functions-container'>
                <button className='navbar-function-button' id='navbar-info-function'></button>
                <button className='navbar-function-button' id='navbar-settings-function'></button>    

                <input type='text' id='navbar-search-input' placeholder='Search...' />
            
                <button className='navbar-function-button' id='navbar-star-function'></button>                
                <button className='navbar-function-button' id='navbar-show-items-function'></button>                                            
            </div>
        </div>
    );
}

function DisplayMessageList(props) {
    let messageData = [
        {
            username: 'ni3ms',
            msg: 'joined #random',
            timestamp: '12:38PM',
            msgId: '1234jfz'
        },
        {
            username: 'ni3ms',
            msg: 'ayyyyyyyyyyy this is an example of a longer message to see how the <li> elements wrap...',
            timestamp: '12:40PM',
            msgId: '123z9vsdj'
        },
        {
            username: 'ni3ms',
            msg: 'joined #random',
            timestamp: '12:38PM',
            msgId: '1234afasdjfz'
        },
        {
            username: 'ni3ms',
            msg: 'joined #random',
            timestamp: '12:38PM',
            msgId: '1234basdjfz'
        },
        {
            username: 'ni3ms',
            msg: 'joined #random',
            timestamp: '12:38PM',
            msgId: '1234jasef3fz'
        },
        {
            username: 'ni3ms',
            msg: 'joined #random',
            timestamp: '12:38PM',
            msgId: '12343gh4jfz'
        },
        {
            username: 'ni3ms',
            msg: 'joined #random',
            timestamp: '12:38PM',
            msgId: '1234lg5g9jfz'
        },
    ];

    /**user img thumbnail after username */
    const items = messageData.map( msg => (
        <li className='message-items' key={msg.msgId} id={msg.msgId}>
            <div className='message-item'>
                <span className='item-timestamp'><small>{msg.timestamp}</small></span>
                <span className='item-username'>{msg.username}</span>
                <img className='item-username-img' src='/images/rick.svg' />

                <span className='item-msg'>{msg.msg}</span>
            </div>
        </li>
    ));

    return (
        <div id='chat-messages-list-pane'>
            <ul id='chat-messages-list'>
                {items}
            </ul>
        </div>
    );
}

function DisplayMessageInput(props) {
    return (
        <div id='chat-messages-input-container'>
            
            <button id='message-input-add-button'></button>
            <input className='message-input' type='text' placeholder='Message #random' />     
            <button className='message-input-button' id='message-input-btn1'></button>
            <button className='message-input-button' id='message-input-btn2'></button>                          
        </div>
    );
}

function DisplayChatMessagePane(props) {
    return (
        <div id='chat-messages-container'>
            <DisplayNavbar />
            <DisplayMessageList />
            <DisplayMessageInput />                                    
        </div>
    );
}
//END MAIN PANE

class NewChat extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div id='chat-container'>
                <DisplayChatMenu />
                <DisplayChatMessagePane />
            </div>
        );
    }
}

export default NewChat;