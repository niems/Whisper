import React, {Component} from 'react'
import ChatMenu from './chat_menu'
import ChatMessages from './chat_messages'
import './style/new_chat.css'

class NewChat extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div id='chat-container'>
                <ChatMenu />
                <ChatMessages />
            </div>
        );
    }
}

export default NewChat;