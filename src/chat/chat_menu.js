import React, {Component} from 'react'
import './style/chat_menu.css'

//returns true if category is a selected category
function displayselectedCategories( category, selectedCategories ) {
    console.log(`displayselectedCategories(): ${JSON.stringify(selectedCategories)}`);

    if ( selectedCategories.includes( category ) ) { //category is a selected category
        console.log(`displayselectedCategories(): ${category} is a selected category`);
        return true;
    }

    console.log(`displayselectedCategories(): ${category} is NOT a selected category`);    
    return false; //category is not selected
}

function DisplayUserStatusOrb({ id, status }) {

    let svgClass = 'chat-menu-' + id + '-status';
    let circleClass = 'chat-menu-' + id + '-status-img ' + status; //determines the fill color for the orb

    return (
        <svg className={svgClass}>
            <circle className={circleClass} />
        </svg>
    );
}

function DisplayMenuUserInfo({ user, onImgError }) {
    return (
        <div id='chat-menu-user-info'>
            <DisplayUserStatusOrb id='current-user' status={user.status} />
            <img className='chat-menu-current-user-img' id='chat-menu-current-user-profile-pic' src={user.image} alt='/images/placeholder.svg' data-user='current user' onError={onImgError} /> 
            <b id='chat-menu-username'>{user.username}</b>
        </div>
    );
}

function DisplayChannelsCategory({ filter, onFilterChange, selectedCategories, onSelect, onChannelSelect }) {
    let channels = [
        {
            channel: '#random',
        },
        {
            channel: '#general',
        }
    ];

    //if ( selectedCategories === 'channels' ) {
    if ( displayselectedCategories( 'channels', selectedCategories ) ) {
        let allChannels = channels;

        if ( filter !== '' ) {
            let regFilter = new RegExp(filter, 'i');

            allChannels = channels.filter(
                channel => regFilter.test(channel.channel) //removes user based on current filter
            );
        }

        allChannels = allChannels.map( channel => (
            <li className='menu-list-item' key={channel.channel} id={channel.channel} onClick={onChannelSelect}>
                <div className='display-category-menu'>
                    <b className='display-channel'>{channel.channel}</b>
                </div>
            </li>
        ));

        return (
            <div className='category-container-layout selected' id='channels-category-container'>

                <div className='category-header-layout' id='channels-category-header' onClick={onSelect}>
                    <b className='category-header'>Channels</b>
                    <img className='category-header-icon' id='channels-header-icon' src='/images/page_icons/arrow-up.svg' alt='/images/placeholder.svg' />
                </div>

                <div className='category-filter-container selected'>
                    <input type='text' className='category-filter-input' value={filter} onChange={onFilterChange} placeholder='Search by channel...' autoComplete='off' />
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
                <img className='category-header-icon' id='channels-header-icon' src='/images/page_icons/arrow-down.svg' alt='/images/placeholder.svg' />
            </div>

        </div>
    ) ;
}

function DisplayRecentCategory({ filter, onFilterChange, userData, users, selectedCategories, onSelect, onChannelSelect, onImgError, recentChannels }) {
    try {

        if ( displayselectedCategories( 'recent', selectedCategories ) ) {
            let filteredChannels = JSON.parse( JSON.stringify( recentChannels ) );

            if ( filter !== '' ) {
                let regFilter = new RegExp(filter, 'i');

                filteredChannels = recentChannels.filter(
                    channel => regFilter.test( channel.channelDisplayName ) //removes recent messages based on current filter
                );
            }

                filteredChannels = filteredChannels.map( channel => (
                <li className='menu-list-item' key={channel.displayName} id={channel.displayName} onClick={onChannelSelect}>
                    <div className='display-category-menu'>
                        <DisplayUserStatusOrb id='user' status={channel.status} />
                        <img className='chat-menu-user-img' src={channel.image} alt='failed to load user img' data-user='other user' data-socketid={channel.path} onError={onImgError} /> 
                        <b className='display-username'>{channel.displayName}</b>
                    </div>
                </li>         
            ));
            
            return (
                <div className='category-container-layout selected' id='recent-category-container'>
                    <div className='category-header-layout' id='recent-category-header' onClick={onSelect}>
                        <b className='category-header'>recent</b>
                        <img className='category-header-icon' id='recent-header-icon' src='/images/page_icons/arrow-up.svg' alt='/images/placeholder.svg' />
                    </div>

                    <div className='category-filter-container selected'>
                        <input type='text' className='category-filter-input' value={filter} onChange={onFilterChange} placeholder='Search by channel...' autoComplete='off' />
                    </div>

                    <ul id='recent-menu-list' className='menu-list'>
                        {filteredChannels}
                    </ul>
                </div>        
            );
        }

        return (
            <div className='category-container-layout' id='recent-category-container'>
            
                <div className='category-header-layout' id='recent-category-header' onClick={onSelect}>
                    <b className='category-header'>recent</b>
                    <img className='category-header-icon' id='recent-header-icon' src='/images/page_icons/arrow-down.svg' alt='/images/placeholder.svg' />
                </div>

            </div>        
        );
    }
    catch(err) {
        console.log(`Chat menu DisplayRecentCategory(): ${err.message}`);
    }
}

function DisplayOnlineCategory({ filter, onFilterChange, userData, users, selectedCategories, onSelect, onChannelSelect, onImgError }) {
    try {
        let categoryText = `online (${users.length})`;
        //if ( selectedCategories === 'online' ) {
        if ( displayselectedCategories( 'online', selectedCategories ) ) {
            console.log(`\nDisplayOnlineCategory() input data: ${JSON.stringify(users)}`);

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
                <li className='menu-list-item' key={user.username} id={user.username} onClick={onChannelSelect}>
                    <div className='display-category-menu'>
                        <DisplayUserStatusOrb id='user' status={user.status} />
                        <img className='chat-menu-user-img' src={user.image} alt='failed to load user img' data-user='other user' data-socketid={user.socketId} onError={onImgError} /> 
                        <b className='display-username'>{user.username}</b>
                    </div>
                </li>         
            ));
             
            return (
                <div className='category-container-layout selected' id='online-category-container'>
                    <div className='category-header-layout' id='online-category-header' onClick={onSelect}>
                        <b className='category-header'>online<small>{` (${users.length - 1})`}</small></b>
                        <img className='category-header-icon' id='online-header-icon' src='/images/page_icons/arrow-up.svg' alt='/images/placeholder.svg' />
                    </div>

                    <div className='category-filter-container selected'>
                        <input type='text' className='category-filter-input' value={filter} onChange={onFilterChange} placeholder='Search by username...' autoComplete='off' />
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
                    <b className='category-header'>online<small>{` (${users.length - 1})`}</small></b>
                    <img className='category-header-icon' id='online-header-icon' src='/images/page_icons/arrow-down.svg' alt='/images/placeholder.svg' />
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
            // selectedCategories: 'online', //determines which category list is displayed
            selectedCategories: [],
            filter: '',   //filter - determines what is displayed from the selected category
        }; 

        this.onCategorySelect = this.onCategorySelect.bind(this);
        this.onFilterChange = this.onFilterChange.bind(this);
        this.onChannelSelect = this.onChannelSelect.bind(this); //sends selected channel/user info back to chat


        this.onImgError = this.onImgError.bind(this); //loads the placeholder img if the profile img fails
    }

    //determines which category list to display
    onCategorySelect(e) {
        try {
            e.preventDefault();
            let target = e.currentTarget.id;
            let selection = ''; //defaults to '' if selection is not found
            console.log(`onCategorySelect(): ${target}`);
            /*
            switch(target) {
                case 'online-category-header':
                    selection = this.state.selectedCategories === 'online' ? '' : 'online';
                    break;

                case 'channels-category-header':
                selection = this.state.selectedCategories === 'channels' ? '' : 'channels';
                    break;

                default:
                    selection = '';
            }
            */
           let newSelections = JSON.parse( JSON.stringify( this.state.selectedCategories ) );

           switch(target) {
            case 'online-category-header':
                selection = {
                    index: newSelections.indexOf('online'),
                    channel: 'online',
                };
                break;

            case 'channels-category-header':
                selection = {
                    index: newSelections.indexOf('channels'),
                    channel: 'channels',
                };
                break;
            
            case 'recent-category-header':
                selection = {
                    index: newSelections.indexOf('recent'),
                    channel: 'recent',
                };
                break;

            default:
                selection = {
                    index: -1,
                    channel: 'N/A',
                };
            }

            console.log('onCategorySelect() selection info:');
            console.log(`-index: ${selection.index}`);
            console.log(`-channel: ${selection.channel}`);

            if ( selection.index >= 0 ) { //if the channel already exists
                console.log(`Chat menu onCategorySelect(): ${selection.channel} already exists, removing channel`); 
                newSelections.splice( selection.index, 1 ); //removes channel from selected channels
                this.setState({ selectedCategories: newSelections });
            }

            else if( selection.channel !== 'N/A' ) { //channel doesn't exist yet 
                console.log(`Chat menu onCategorySelect(): ${selection.channel} doesn't exist, adding channel`);             
                newSelections.unshift( selection.channel ) //adds channel to selected channels
                this.setState({ selectedCategories: newSelections });                
            }

            else {
                console.log(`Chat menu onCategorySelect(): invalid channel selection - no action taken`);                 
            }
            
        }
        catch(err) {
            console.log(`ERR chat_menu.js onCategorySelect(): ${err.message}`);
        }
        
    }

    onFilterChange(e) {
        e.preventDefault();

        this.setState({ filter: e.currentTarget.value });
    }

    //determines the channel view - clicking a user changes the channel view to a PM w/that user
    onChannelSelect(e) {
        let id = e.currentTarget.id; 
        console.log(`Chat Menu onChannelSelect: ${id}`);
        this.props.onSelect( id );
    }

    onImgError(e) {
        let targetData = e.currentTarget.dataset;

        if ( targetData.user === 'current user' ) {
            console.log('image fail current user');
            this.props.onImgFail('current user'); //specifies the current user's img failed to load
        }

        else {
            console.log('image fail other user');
            this.props.onImgFail( targetData.socketid ); 
        }
    }

    render() {
        /**need to pass updated DisplayMenuUserInfo() data in order to display the image, currently undefined */
        return (
            <div id='chat-menu-container'>
                <DisplayMenuUserInfo user={this.props.userData} onImgError={this.onImgError} />
                
                <div id='all-menu-categories'>
                    <DisplayRecentCategory filter={this.state.filter} onFilterChange={this.onFilterChange} userData={this.props.userData}
                                           users={this.props.users} selectedCategories={this.state.selectedCategories} onSelect={this.onCategorySelect}
                                           onChannelSelect={this.onChannelSelect} onImgError={this.onImgError} recentChannels={this.props.recentChannels} />
                                           
                    <DisplayOnlineCategory filter={this.state.filter} onFilterChange={this.onFilterChange} userData={this.props.userData}
                                           users={this.props.users} selectedCategories={this.state.selectedCategories} onSelect={this.onCategorySelect}
                                           onChannelSelect={this.onChannelSelect} onImgError={this.onImgError} />

                    <DisplayChannelsCategory filter={this.state.filter} onFilterChange={this.onFilterChange} selectedCategories={this.state.selectedCategories}
                                             onSelect={this.onCategorySelect} onChannelSelect={this.onChannelSelect} />
                </div>
                
            </div>
        );
    }
}

export default ChatMenu;