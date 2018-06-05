import React from 'react'
import ChatNavbar from './chat_navbar'
import ChatMessageList from './chat_message_list'
import ChatInput from './chat_input'
import NoSelection from './no_selection'
import SnapshotView from './snapshot_view';
import './style/channel_view.css'

const ChannelView = ({ userData, selectedChannel, selectedMsgs, onSendMsg, allMessages, snapshot, logout }) => {
    if ( typeof( selectedChannel.channelId ) !== 'undefined') { //channel is selected
        return (
            <div id='channel-view-container'>
                <ChatNavbar selectedChannel={selectedChannel} logout={logout}/>
                <ChatMessageList userData={userData} selectedMsgs={selectedMsgs} />
                <ChatInput selectedChannel={selectedChannel} onSendMsg={onSendMsg} />                                    
            </div>                
        );
    }

    return (
        <SnapshotView snapshotMsgs={snapshot} />
    );
    /*
    return (
        <NoSelection />
    );
    */
}

export default ChannelView;