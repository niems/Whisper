import React, {Component} from 'react'
import './style/chat_menu.css'

function DisplayUserStatusOrb({ id, status }) {

    let svgClass = 'chat-menu-' + id + '-status';
    let circleClass = 'chat-menu-' + id + '-status-img ' + status; //determines the fill color for the orb

    return (
        <svg className={svgClass}>
            <circle className={circleClass} />
        </svg>
    );
}

function DisplayMenuUserInfo({ user }) {
    return (
        <div id='chat-menu-user-info'>
            <DisplayUserStatusOrb id='current-user' status={user.status} />
            <b id='chat-menu-username'>{user.username}</b>
            <img className='chat-menu-current-user-img' src={user.image} /> 
        </div>
    );
}

/*
username: user.data.username,
        ip: user.ip,
        status: 'online',
        socketId: user.socketId
        */

function DisplayOnlineCategory({ users }) {
    try {
        const aUsers = users.map( user => (
            <li className='menu-list-item' key={user.username} id={user.username}>
                <div className='display-online-menu'>
                    <DisplayUserStatusOrb id='user' status={user.status} />
                    <img className='chat-menu-user-img' src={user.image} /> 
                    <b className='display-username'>{user.username}</b>
                </div>
            </li>         
        ));
                
        return (
            <div id='online-category-container'>
                <h6 className='category-header'>online</h6>
                <ul id='menu-list'>
                    {aUsers}
                </ul>
            </div>        
        );
    }
    catch(err) {
        console.log(`ERR chat_menu.js DisplayOnlineCategory(): ${err.message}`);
    }
}

class ChatMenu extends Component {
    render() {
        let categoryList = [
            {
                category: 'All Threads',
                list: undefined
            },
            {
                category: 'Channels',
                list: undefined
            },
            {
                category: 'Direct Messages',
                list: undefined
            },
            {
                category: 'Online',
                list: undefined
            }
        ];

        return (
            <div id='chat-menu-container'>
                <DisplayMenuUserInfo user={this.props.loginData} />
                
                <div id='all-menu-categories'>
                    <DisplayOnlineCategory users={this.props.users} />
                </div>
                
            </div>
        );
    }
}

export default ChatMenu;