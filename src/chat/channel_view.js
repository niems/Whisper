import React from 'react'
import ChatNavbar from './chat_navbar'
import ChatMessageList from './chat_message_list'
import ChatInput from './chat_input'
import NoSelection from './no_selection'
import './style/channel_view.css'

const ChannelView = ({ userData, selectedChannel, selectedMsgs, onSendMsg }) => {
    if ( typeof( selectedChannel.channelId ) !== 'undefined') { //channel is selected
        return (
            <div id='channel-view-container'>
                <ChatNavbar selectedChannel={selectedChannel} />
                <ChatMessageList userData={userData} selectedMsgs={selectedMsgs} />
                <ChatInput selectedChannel={selectedChannel} onSendMsg={onSendMsg} />                                    
            </div>                
        );
    }

    return (
        <NoSelection /> //no channel selected
    );
}

export default ChannelView;