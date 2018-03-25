import React, {Component} from 'react'
import './style/chat-message-pane.css'

function DisplayMessageList({ messages }) {
    const displayMessages = messages.map( msg => (
        <li className='display-msg-item' key={msg.msgId} id={msg.msgId}>

            <small className='display-msg-username'>{msg.user}</small>
            <small className='display-msg-time'>{' ' + msg.receiveTime}</small>
            <br />
            <small className='display-msg'>{msg.msg}</small>
            
        </li>
    ));

    return (
        <div className='message-list-container'>
            <ul className='list-group message-list'>
                {displayMessages}
            </ul>
        </div>        
    );
}

function DisplayMessageInput(props) {
    return (
        <div className='display-message-input-container'>
            <input type='text' id='message-input' placeholder='Type something...' />
        </div>
    );
}

class ChatMessagePane extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        document.getElementById('message-input').focus();
    }

    render() {
        return (
            <div className='chat-message-pane-container'>
                <DisplayMessageList messages={this.props.messages} />
                <DisplayMessageInput />
            </div>
        );
    }
}

export default ChatMessagePane;