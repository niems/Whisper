import React from 'react'
import './style/chat_navbar.css'

const ChatNavbar = ({ selectedChannel }) => {
    let userCount = '1';
    let pinCount = '0';

    return (
        <div id='chat-messages-navbar'>
            <div id='navbar-msg-info-container'>
                <h6 className='navbar-msg-channel'>{selectedChannel.channelDisplayName}</h6>

                <div id='navbar-msg-channel-info'>
                    <button className='navbar-button' id='navbar-star-btn'></button> | 
                    <button className='navbar-button' id='navbar-user-count-btn'></button><small>{userCount}</small> |
                    <button className='navbar-button' id='navbar-pin-btn'></button><small>{pinCount}</small> |        
                    <small id='navbar-channel-info'>{selectedChannel.description}</small>
                </div>
            </div>

            <div id='navbar-functions-container'>
                <button className='navbar-function-button' id='navbar-info-function'></button>
                <button className='navbar-function-button' id='navbar-settings-function'></button>    

                <input type='text' id='navbar-search-input' placeholder='Search...' autoComplete='false' />
            
                <button className='navbar-function-button' id='navbar-star-function'></button>                
                <button className='navbar-function-button' id='navbar-show-items-function'></button>                                            
            </div>
        </div>
    );
}

export default ChatNavbar;