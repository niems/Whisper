import React, {Component} from 'react'
import ChatMessageListItem from './chat_message_list_item'
import './style/chat_message_list.css'

/*
const ChatMessageList = ({ userData, selectedMsgs }) => {
    const items = selectedMsgs.map( msg => (
        <ChatMessageListItem userData={userData} msg={msg} key={msg.msgId} id={msg.msgId} />
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

        this.setListRef = element => {
            this.listRef = element;
        }

        this.updateListScroll = this.updateListScroll.bind(this);
    }

    updateListScroll() {
        if ( this.listRef ) {
            console.log('\nupdateListScroll(): scrolling now :D');
            console.log('updateListScroll(): values to use: ');
            console.log(`scrollTop: ${this.listRef.scrollTop}`);
            console.log(`scrollHeight: ${this.listRef.scrollHeight}\n`);

            this.listRef.scrollTop = this.listRef.scrollHeight;
        }

        else {
            console.log('updateListScroll(): not updating');
        }
    }

    componentDidUpdate() {
        this.updateListScroll();
    }

    render() {
        const items = this.props.selectedMsgs.map( msg => (
            <ChatMessageListItem userData={this.props.userData} msg={msg} key={msg.msgId} id={msg.msgId} />
        ));

        return (
            <div id='chat-messages-list-pane'>
                <ul id='chat-messages-list' ref={this.setListRef}>
                    {items}
                </ul>
            </div>
        );
    }
} 

export default ChatMessageList;