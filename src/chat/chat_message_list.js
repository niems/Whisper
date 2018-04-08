import React, {Component} from 'react'
import './style/chat_message_list.css'

/*
const ChatMessageList = ({ messages, onImgFail }) => {

    const items = messages.map( msg => (
        <li className='message-items' key={msg.msgId} id={msg.msgId}>
            <div className='message-item'>
                <img className='item-username-img' src={msg.image} alt='failed to load user img' data-user='other' data-socketid={msg.socketId} onError={''} />
                <span className='item-username'>{msg.username}</span>
                <span className='item-timestamp'><small className='item-timestamp-sender'>{`${msg.timestamp} / `}</small><b className='item-timestamp-current'>{msg.receivedTimestamp}</b></span>
                <br />
                <span className='item-msg'>{msg.msg}</span>
            </div>
        </li>
    ));

    return (
        <div id='chat-messages-list-pane'>
            <ul id='chat-messages-list'>
                {items}
            </ul>
        </div>
    );
}
*/

class ChatMessageList extends Component {

    constructor(props) {
        super(props);

        this.onImageError = this.onImageError.bind(this);
    }

    onImageError(element) {
        try {
            console.log('updating msg placeholder img')
            element.src = '/images/placeholder.svg';
        }
        catch(err) {
            console.log(`ERR Chat Message List - onImageError(): ${err.message}`);
        }
    }

    render() {
        const items = this.props.messages.map( msg => (
            <li className='message-items' key={msg.msgId} id={msg.msgId}>
                <div className='message-item'>
                    <img className='item-username-img' src={msg.image} alt='failed to load user img' data-user='other' data-socketid={msg.socketId} onError={this.onImageError(this)} />
                    <span className='item-username'>{msg.username}</span>
                    <span className='item-timestamp'><small className='item-timestamp-sender'>{`${msg.timestamp} / `}</small><b className='item-timestamp-current'>{msg.receivedTimestamp}</b></span>
                    <br />
                    <span className='item-msg'>{msg.msg}</span>
                </div>
            </li>
        ));
    
        return (
            <div id='chat-messages-list-pane'>
                <ul id='chat-messages-list'>
                    {items}
                </ul>
            </div>
        );
    }
}

export default ChatMessageList;