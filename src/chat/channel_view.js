import React from 'react'
import ChatNavbar from './chat_navbar'
import ChatMessageList from './chat_message_list'
import ChatInput from './chat_input'
import './style/channel_view.css'

const ChannelView = ({ selectedChannel, selectedMsgs, onSendMsg }) => {
    return (
        <div id='channel-view-container'>
            <ChatNavbar selectedChannel={selectedChannel} />
            <ChatMessageList selectedMsgs={selectedMsgs} />
            <ChatInput selectedChannel={selectedChannel} onSendMsg={onSendMsg} />                                    
        </div>                
    );
}

export default ChannelView;