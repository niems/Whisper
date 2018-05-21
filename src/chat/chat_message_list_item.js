import React from 'react'
import './style/chat_message_list_item.css'

const ChatMessageListItem = ({ userData, msg }) => {

  let msgClass = 'message-items';
  let itemClass = 'message-item';

  //applies different li class if msg is from the current user
  if ( userData.username === msg.username ) {
      msgClass = 'message-items message-items-current-user';
      itemClass = 'message-item message-item-current-user';

   //   console.log(`classes: ${msgClass}`);
   /*
      return (
          <li className='message-items message-items-current-user'>
                  <div className='message-item message-item-current-user'>
                      <div className='user-msg-text current-user'>
                          <span className='item-timestamp'><small className='item-timestamp-current current-user'>{msg.receivedTimestamp}</small></span>
                          <span className='item-msg current-user'>{msg.msg}</span>
                      </div>
                  
                      <div className='user-img-container'>
                          <img className='item-username-img' src={msg.image} alt='failed to load user img' />
                          <span className='item-username'>{msg.username}</span>
                      </div>
                  </div>
          </li>
      );
                <div className='new-user-msg-text new-current-user'>
                    <span className='new-item-timestamp'><small className='new-item-timestamp-current new-current-user'>{msg.receivedTimestamp}</small></span>
                    <span className='new-item-msg new-current-user'>{msg.msg}</span>
                </div>

                <div className='new-user-img-container'>
                    <img className='new-item-username-img' src={msg.image} alt='failed to load user img' />
                    <span className='new-item-username'>{msg.username}</span>
                </div>
    */

    return (
        <li className='new-message-items new-current-user'>
           <div className='new-message-item new-current-user'> 

                <div className='new-user-msg-text new-current-user'>
                    <span className='new-item-timestamp new-current-user'><small className='new-item-timestamp-current new-current-user'>{msg.receivedTimestamp}</small></span>
                    <span className='new-item-msg new-current-user'>{msg.msg}</span>
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

            <div className='new-user-msg-text'>
                <span className='new-item-timestamp'><small className='new-item-timestamp-current'>{msg.receivedTimestamp}</small></span>
                <span className='new-item-msg'>{msg.msg}</span>
            </div>

            <div className='new-user-img-container'>
                <img className='new-item-username-img' src={msg.image} alt='failed to load user img' />
                <span className='new-item-username'>{msg.username}</span>
            </div>

       </div>
    </li>
);
 // console.log(`classes: ${msgClass}`);
  /*
  return (
      <li className='message-items'>
              <div className='message-item'>

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
  */

};

/*<small className='item-timestamp-sender'>{`${msg.timestamp} / `}</small>*/
export default ChatMessageListItem;