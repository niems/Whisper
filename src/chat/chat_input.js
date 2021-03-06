import React, {Component} from 'react'
import './style/chat_input.css'

class ChatInput extends Component {
    constructor(props) {
        super(props);

        this.state = {value: ''};

        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    componentDidMount() {
        this.inputfield = document.getElementById('chat-message-inputfield');
        this.inputfield.focus();
    }

    onChange(e) {
        e.preventDefault();

        this.setState({ value: e.currentTarget.value });
    }

    onSubmit(e) {
        e.preventDefault();
        
        //only submits if there is something to send
        if ( this.state.value !== '' ) {
            this.props.onSendMsg( this.state.value );
            this.setState({ value: '' }); //reset
        }
    }

    render() {
        let placeholder = this.props.selectedChannel.channelDisplayName;

        if ( this.props.selectedChannel.isUser ) {
            placeholder = `Say something to ${this.props.selectedChannel.channelDisplayName}`;
        }

        return (
            <div id='chat-messages-input-container'>
                <button id='message-input-add-button'></button>

                <form id='message-input-form' onSubmit={this.onSubmit}>
                    <input className='message-input' id='chat-message-inputfield' type='text' placeholder={placeholder}
                           value={this.state.value} onChange={this.onChange} autoComplete='off' /> 
                </form>
                    
                <button className='message-input-button' id='message-input-btn1'></button>
                <button className='message-input-button' id='message-input-btn2'></button>                          
            </div>   
        );
    }
}

export default ChatInput;