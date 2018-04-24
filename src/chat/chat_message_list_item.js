import React from 'react'
import './style/chat_message_list_item.css'

const ChatMessageListItem = ({ userData, msg }) => {
    let msgClass = 'message-items';
    let itemClass = 'message-item';

    //applies different li class if msg is from the current user
    if ( userData.username === msg.username ) {
        msgClass = 'message-items message-items-current-user';
        itemClass = 'message-item message-item-current-user';

        console.log(`classes: ${msgClass}`);
        return (
            <li className={msgClass}>
                    <div className={itemClass}>
                        <div className='user-msg-text'>
                            <span className='item-timestamp'><small className='item-timestamp-current'>{msg.receivedTimestamp}</small></span>
                            <span className='item-msg'>{msg.msg}</span>
                        </div>
                    
                        <div className='user-img-container'>
                            <img className='item-username-img' src={msg.image} alt='failed to load user img' />
                            <span className='item-username'>{msg.username}</span>
                        </div>
                    </div>
            </li>
        );
    }
    console.log(`classes: ${msgClass}`);

    return (
        <li className={msgClass}>
                <div className={itemClass}>

                    <div className='user-img-container'>
                        <img className='item-username-img' src={msg.image} alt='failed to load user img' />
                        <span className='item-username'>{msg.username}</span>
                    </div>
                    
                    <div className='user-msg-text'>
                        <span className='item-timestamp'><small className='item-timestamp-current'>{msg.receivedTimestamp}</small></span>
                        <span className='item-msg'>{msg.msg}</span>
                    </div>
                
                </div>
        </li>
    );
};

/*<small className='item-timestamp-sender'>{`${msg.timestamp} / `}</small>*/
export default ChatMessageListItem;