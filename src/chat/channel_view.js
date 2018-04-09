import React from 'react'
import ChatNavbar from './chat_navbar'
import ChatMessageList from './chat_message_list'
import ChatInput from './chat_input'
import './style/channel_view.css'

const ChannelView = ({ messages, onSendMsg }) => {
    return (
        <div id='channel-view-container'>
            <ChatNavbar />
            <ChatMessageList messages={messages} />
            <ChatInput onSendMsg={onSendMsg} />                                    
        </div>                
    );
}

export default ChannelView;