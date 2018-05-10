import React from 'react'
import ChatNavbar from './chat_navbar'
import ChatMessageList from './chat_message_list'
import ChatInput from './chat_input'
import NoSelection from './no_selection'
import './style/channel_view.css'

const ChannelView = ({ userData, selectedChannel, selectedMsgs, onSendMsg, allMessages, logout }) => {
    if ( typeof( selectedChannel.channelId ) !== 'undefined') { //channel is selected
        return (
            <div id='channel-view-container'>
                <ChatNavbar selectedChannel={selectedChannel} logout={logout}/>
                <ChatMessageList userData={userData} selectedMsgs={selectedMsgs} />
                <ChatInput selectedChannel={selectedChannel} onSendMsg={onSendMsg} />                                    
            </div>                
        );
    }

    /*
    let allChannelMsgs = allMessages.filter( channel => channel.messages.length > 0 );
    console.log(`channel view messages: ${JSON.stringify(allChannelMsgs)}`);

    allChannelMsgs = allChannelMsgs.map( channel => (
        <li key={channel.channelId} id={channel.channelId}>
            {channel.messages[0].msg}
        </li>
    ));

    return (
        <div id='all-channel-messages'>
            <ul id='all-channel-messages-list'>
                {allChannelMsgs}
            </ul>
        </div>
    );
    */

    return (
        <NoSelection />
    );
}

export default ChannelView;

/*<NoSelection /> //no channel selected */