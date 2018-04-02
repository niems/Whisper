import React from 'react'
import './style/chat_message_list.css'


const ChatMessageList = (props) => {
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

export default ChatMessageList;