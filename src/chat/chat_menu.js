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
            <img className='chat-menu-current-user-img' src={user.image} alt='/images/placeholder.svg' /> 
            <b id='chat-menu-username'>{user.username}</b>
        </div>
    );
}

function DisplayChannelsCategory({ filter, onFilterChange, selectedCategory, onSelect }) {
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
                    <img className='category-header-icon' id='channels-header-icon' src='/images/arrow-up.svg' alt='/images/placeholder.svg' />
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
                <img className='category-header-icon' id='channels-header-icon' src='/images/arrow-down.svg' alt='/images/placeholder.svg' />
            </div>

        </div>
    ) ;
}

function DisplayOnlineCategory({ filter, onFilterChange, userData, users, selectedCategory, onSelect }) {
    try {
        if ( selectedCategory === 'online' ) {
            let filteredUsers = users.filter(
                user => user.username !== userData.username //removes current user from online users display
            );

            if ( filter !== '' ) {
                let regFilter = new RegExp(filter, 'i');

                filteredUsers = filteredUsers.filter(
                    user => regFilter.test(user.username) //removes user based on current filter
                );
            }

            let aUsers = filteredUsers.map( user => (
                <li className='menu-list-item' key={user.username} id={user.username}>
                    <div className='display-online-menu'>
                        <DisplayUserStatusOrb id='user' status={user.status} />
                        <img className='chat-menu-user-img' src={user.image} alt='/images/placeholder.svg' /> 
                        <b className='display-username'>{user.username}</b>
                    </div>
                </li>         
            ));
            
            return (
                <div className='category-container-layout selected' id='online-category-container'>
                    <div className='category-header-layout' id='online-category-header' onClick={onSelect}>
                        <b className='category-header'>online</b>
                        <img className='category-header-icon' id='online-header-icon' src='/images/arrow-up.svg' alt='/images/placeholder.svg' />
                    </div>

                    <div className='category-filter-container selected'>
                        <input type='text' className='category-filter-input' value={filter} onChange={onFilterChange} placeholder='Search by username...' />
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
                    <img className='category-header-icon' id='online-header-icon' src='/images/arrow-down.svg' alt='/images/placeholder.svg' />
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

        this.state = {
            selectedCategory: 'online', //determines which category list is displayed
            filter: '',   //filter - determines what is displayed from the selected category
        }; 

        this.onCategorySelect = this.onCategorySelect.bind(this);
        this.onFilterChange = this.onFilterChange.bind(this);
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

    onFilterChange(e) {
        e.preventDefault();

        this.setState({ filter: e.currentTarget.value });
    }

    render() {
        /**need to pass updated DisplayMenuUserInfo() data in order to display the image, currently undefined */
        return (
            <div id='chat-menu-container'>
                <DisplayMenuUserInfo user={this.props.userData} />
                
                <div id='all-menu-categories'>
                    <DisplayOnlineCategory filter={this.state.filter} onFilterChange={this.onFilterChange} userData={this.props.userData} users={this.props.users} selectedCategory={this.state.selectedCategory} onSelect={this.onCategorySelect} />
                    <DisplayChannelsCategory filter={this.state.filter} onFilterChange={this.onFilterChange} selectedCategory={this.state.selectedCategory} onSelect={this.onCategorySelect} />
                </div>
                
            </div>
        );
    }
}

export default ChatMenu;