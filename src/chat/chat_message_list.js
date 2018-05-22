import React from 'react'
import ChatMessageListItem from './chat_message_list_item'
import './style/chat_message_list.css'


const ChatMessageList = ({ userData, selectedMsgs }) => {
    const items = selectedMsgs.map( msg => (
        <ChatMessageListItem userData={userData} msg={msg} key={msg.msgId} id={msg.msgId} />
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