import React, {Component} from 'react'
import ChatNavbar from './chat_navbar'
import ChatMessageList from './chat_message_list'
import ChatInput from './chat_input'
import './style/chat_messages.css'

class ChatMessages extends Component {
    render() {
        return (
            <div id='chat-messages-container'>
                <ChatNavbar />
                <ChatMessageList />
                <ChatInput />                                    
            </div>                
        );
    }
}

export default ChatMessages;