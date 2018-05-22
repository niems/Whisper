import React from 'react'
import './style/chat_message_list_item.css'

const ChatMessageListItem = ({ userData, msg }) => {

    //applies different li class if msg is from the current user
    if ( userData.username === msg.username ) {
        return (
            <li className='new-message-items new-current-user'>
                <div className='new-message-item new-current-user'> 

                    <div className='new-user-msg-text-container new-current-user'>
                        <div className='new-user-msg-text new-current-user'>
                            <div className='new-item-timestamp new-current-user'><small className='new-item-timestamp-current new-current-user'>{msg.receivedTimestamp}</small></div>
                            <div className='new-item-msg new-current-user'>{msg.msg}</div>
                        </div>

                        <div className='new-user-msg-text-spacer new-current-user'>
                        </div>
                    </div>
        
                    <div className='new-user-img-container new-current-user'>
                        <img className='new-item-username-img' src={msg.image} alt='failed to load user img' />
                        <span className='new-item-username'>{msg.username}</span>
                    </div>
                </div>
            </li>
        );
    }

    return (
        <li className='new-message-items'>
            <div className='new-message-item'> 

                <div className='new-user-img-container'>
                    <img className='new-item-username-img' src={msg.image} alt='failed to load user img' />
                    <span className='new-item-username'>{msg.username}</span>
                </div>

                <div className='new-user-msg-text-container'>
                    <div className='new-user-msg-text'>
                        <div className='new-item-timestamp'><small className='new-item-timestamp-current'>{msg.receivedTimestamp}</small></div>
                        <div className='new-item-msg'>{msg.msg}</div>
                    </div>

                    <div className='new-user-msg-text-spacer'>
                    </div>
                </div>

            </div>
        </li>
    );
};

export default ChatMessageListItem;