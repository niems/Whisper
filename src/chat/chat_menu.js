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
            <img className='chat-menu-current-user-img' src={user.image} alt='cannot load main user img' /> 
        </div>
    );
}

/*
username: user.data.username,
        ip: user.ip,
        status: 'online',
        socketId: user.socketId
        */

function DisplayChannelsCategory({ selectedCategory, onSelect }) {
    let channels = [
        {
            channel: '#random',
        },
        {
            channel: '#general',
        },
        {
            channel: '#rubbish',
        }
    ];

    if ( selectedCategory === 'channels' ) {
        let allChannels = channels.map( channel => (
            <li className='menu-list-item' key={channel.channel} id={channel.channel}>
                <div className='display-online-menu'>
                    <b className='display-channel'>{channel.channel}</b>
                </div>
            </li>
        ));

        return (
            <div className='category-container-layout selected' id='channels-category-container'>

                <div className='category-header-layout' id='channels-category-header' onClick={onSelect}>
                    <b className='category-header'>Channels</b>
                    <img className='category-header-icon' id='channels-header-icon' src='/images/arrow-up.svg' alt='cannot load arrow-up.svg' />
                </div>
                <ul id='category-menu-list' className='menu-list'>
                    {allChannels}
                </ul>

            </div>
        );
    }

    return (
        <div className='category-container-layout' id='channels-category-container'>

            <div className='category-header-layout' id='channels-category-header' onClick={onSelect}>
                <b className='category-header'>Channels</b>
                <img className='category-header-icon' id='channels-header-icon' src='/images/arrow-down.svg' alt='cannot load arrow-down.svg' />
            </div>

        </div>
    ) ;
}

function DisplayOnlineCategory({ userData, users, selectedCategory, onSelect }) {
    try {
        if ( selectedCategory === 'online' ) {
            let filteredUser = users.filter(
                user => user.username !== userData.username
            );

            let aUsers = filteredUser.map( user => (
                <li className='menu-list-item' key={user.username} id={user.username}>
                    <div className='display-online-menu'>
                        <DisplayUserStatusOrb id='user' status={user.status} />
                        <img className='chat-menu-user-img' src={user.image} alt='cannot load user-message image from given path' /> 
                        <b className='display-username'>{user.username}</b>
                    </div>
                </li>         
            ));
            
            return (
                <div className='category-container-layout selected' id='online-category-container'>
                    <div className='category-header-layout' id='online-category-header' onClick={onSelect}>
                        <b className='category-header'>online</b>
                        <img className='category-header-icon' id='online-header-icon' src='/images/arrow-up.svg' alt='cannot load arrow-up.svg' />
                    </div>
                    <ul id='online-menu-list' className='menu-list'>
                        {aUsers}
                    </ul>
                </div>        
            );
        }

        return (
            <div className='category-container-layout' id='online-category-container'>
            
                <div className='category-header-layout' id='online-category-header' onClick={onSelect}>
                    <b className='category-header'>online</b>
                    <img className='category-header-icon' id='online-header-icon' src='/images/arrow-down.svg' alt='cannot load arrow-down.svg' />
                </div>

            </div>        
        );
    }
    catch(err) {
        console.log(`ERR chat_menu.js DisplayOnlineCategory(): ${err.message}`);
    }
}

class ChatMenu extends Component {
    constructor(props) {
        super(props);

        this.state = {selectedCategory: 'online'}; //determines which category list is displayed

        this.onCategorySelect = this.onCategorySelect.bind(this);
    }

    //determines which category list to display
    onCategorySelect(e) {
        try {
            e.preventDefault();
            let target = e.currentTarget.id;
            let selection = ''; //defaults to '' if selection is not found

            switch(target) {
                case 'online-category-header':
                    selection = this.state.selectedCategory === 'online' ? '' : 'online';
                    break;

                case 'channels-category-header':
                selection = this.state.selectedCategory === 'channels' ? '' : 'channels';
                    break;

                default:
                    selection = '';
            }

    
            this.setState({ selectedCategory: selection });
        }
        catch(err) {
            console.log(`ERR chat_menu.js onCategorySelect(): ${err.message}`);
        }
        
    }

    render() {
        /**need to pass updated DisplayMenuUserInfo() data in order to display the image, currently undefined */
        return (
            <div id='chat-menu-container'>
                <DisplayMenuUserInfo user={this.props.userData} />
                
                <div id='all-menu-categories'>
                    <DisplayOnlineCategory userData={this.props.userData} users={this.props.users} selectedCategory={this.state.selectedCategory} onSelect={this.onCategorySelect} />
                    <DisplayChannelsCategory selectedCategory={this.state.selectedCategory} onSelect={this.onCategorySelect} />
                </div>
                
            </div>
        );
    }
}

export default ChatMenu;