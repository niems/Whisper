import React, {Component} from 'react'
import './style/chat_message_list.css'


const ChatMessageList = ({ messages, selectedMsgs }) => {

    const items = selectedMsgs.map( msg => (
        <li className='message-items' key={msg.msgId} id={msg.msgId}>
            <div className='message-item'>
                <img className='item-username-img' src={msg.image} alt='failed to load user img' />
                <span className='item-username'>{msg.username}</span>
                <span className='item-timestamp'><small className='item-timestamp-sender'>{`${msg.timestamp} / `}</small><b className='item-timestamp-current'>{msg.receivedTimestamp}</b></span>
                <br />
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



export default ChatMessageList;