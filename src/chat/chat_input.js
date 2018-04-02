import React, {Component} from 'react'
import './style/chat_input.css'

class ChatInput extends Component {
    render() {
        return (
            <div id='chat-messages-input-container'>
                <button id='message-input-add-button'></button>
                <input className='message-input' type='text' placeholder='Message #random' />     
                <button className='message-input-button' id='message-input-btn1'></button>
                <button className='message-input-button' id='message-input-btn2'></button>                          
            </div>   
        );
    }
}

export default ChatInput;