import React from 'react'
import './style/chat_message_list.css'


const ChatMessageList = ({ messages }) => {
    
    for(let i = 0; i < messages.length; i++) {
        console.log(`img: ${messages[i].image}`);
    }

    const items = messages.map( msg => (
        <li className='message-items' key={msg.msgId} id={msg.msgId}>
            <div className='message-item'>
                <span className='item-timestamp'><small>{msg.timestamp}</small></span>
                <span className='item-username'>{msg.username}</span>
                <img className='item-username-img' src={msg.image} />

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