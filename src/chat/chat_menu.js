import React, {Component} from 'react'
import './style/chat_menu.css'

function DisplayMenuUserInfo({ username }) {
    return (
        <div id='chat-menu-user-info'>
            <svg id='chat-menu-user-status'>
                <circle id='chat-menu-user-status-img' />
            </svg>
            <b id='chat-menu-username'>{username}</b>
            <img className='chat-menu-user-img' src='/images/rick.svg' /> 
        </div>
    );
}

function DisplayMenuCategory({ category }) {
    return (
        <div className='menu-category-container'>
            <h6 className='menu-category-header'>{category}</h6>
        </div>
    );
}

class ChatMenu extends Component {
    render() {
        return (

            <div id='chat-menu-container'>
                <DisplayMenuUserInfo username='ni3ms' />
                
                <DisplayMenuCategory category='All Threads' />
                <DisplayMenuCategory category='Channels' />
                <DisplayMenuCategory category='Direct Messages' />
                <DisplayMenuCategory category='Online' />                
            </div>
        );
    }
}

export default ChatMenu;