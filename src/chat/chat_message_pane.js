import React, {Component} from 'react'
import './style/chat-message-pane.css'

function DisplayMessageList({ messages }) {
    const displayMessages = messages.map( msg => (
        <li className='display-msg-item' key={msg.msgId} id={msg.msgId}>

            <small className='display-msg-username'>{msg.username}</small>
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

function DisplayMessageInput({ onSubmit }) {
    return (
        <div className='display-message-input-container'>
            <form id='message-input-form' onSubmit={onSubmit}>
                <input type='text' id='message-input' placeholder='Type something...' />
            </form>
        </div>
    );
}

class ChatMessagePane extends Component {
    constructor(props) {
        super(props);

        this.onSubmit = this.onSubmit.bind(this); //user submitted message
    }

    componentDidMount() {
        this.messageInput = document.getElementById('message-input'); //stores DOM element since it's used a lot
        this.messageInput.focus();
    }

    //user submitted message
    onSubmit(e) {
        e.preventDefault();

        this.props.onSendMessage( this.messageInput.value );
        this.messageInput.value = ''; //reset once message is sent
    }

    render() {
        return (
            <div className='chat-message-pane-container'>
                <DisplayMessageList messages={this.props.messages} />
                <DisplayMessageInput onSubmit={this.onSubmit} />
            </div>
        );
    }
}

export default ChatMessagePane;