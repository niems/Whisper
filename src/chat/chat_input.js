import React, {Component} from 'react'
import './style/chat_input.css'

class ChatInput extends Component {
    constructor(props) {
        super(props);

        this.state = {value: ''};

        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    onChange(e) {
        this.setState({ value: e.currentTarget.value });
    }

    onSubmit(e) {
        e.preventDefault();

        this.props.onSendMsg( this.state.value );
        this.setState({ value: '' }); //reset
    }

    render() {
        return (
            <div id='chat-messages-input-container'>
                <button id='message-input-add-button'></button>

                <form id='message-input-form' onSubmit={this.onSubmit}>
                    <input className='message-input' type='text' placeholder='Message #random' value={this.state.value} onChange={this.onChange} /> 
                </form>
                    
                <button className='message-input-button' id='message-input-btn1'></button>
                <button className='message-input-button' id='message-input-btn2'></button>                          
            </div>   
        );
    }
}

export default ChatInput;