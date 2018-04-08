import React from 'react'
import ChatNavbar from './chat_navbar'
import ChatMessageList from './chat_message_list'
import ChatInput from './chat_input'
import './style/chat_messages.css'

const ChatMessages = ({ messages, onSendMsg }) => {
    return (
        <div id='chat-messages-container'>
            <ChatNavbar />
            <ChatMessageList messages={messages} />
            <ChatInput onSendMsg={onSendMsg} />                                    
        </div>                
    );
}

export default ChatMessages;