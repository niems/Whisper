import React, {Component} from 'react'
import './style/chat_menu.css'

const closeImg = './images/page_icons/close-cross.svg';

//returns true if category is a selected category
function displayselectedCategories( category, selectedCategories ) {
    //console.log(`displayselectedCategories(): ${JSON.stringify(selectedCategories)}`);

    if ( selectedCategories.includes( category ) ) { //category is a selected category
        //console.log(`displayselectedCategories(): ${category} is a selected category`);
        return true;
    }

    //console.log(`displayselectedCategories(): ${category} is NOT a selected category`);    
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

function DisplayUnreadMessageNotification({ unreadMsgCount }) {
    if ( unreadMsgCount > 0 ) { //only displays notification if there are unread messages
        return (
            <span className='chat-menu-unread-message-container'>
                <small id='chat-menu-unread-messages'>{unreadMsgCount}</small>
            </span>
        );
    }

    return null;
}

function DisplayMenuUserInfo({ user, onImgError, isDisplayed, enableUserPanel, disableUserPanel, logout }) {
    return (
        <div id='chat-menu-user-info' onMouseEnter={ e => enableUserPanel(e) } onMouseLeave={ e => disableUserPanel(e) }>
            <DisplayUserOptions isDisplayed={isDisplayed} logout={logout} />
            <img className='chat-menu-current-user-img' id='chat-menu-current-user-profile-pic' src={user.image} alt='/images/placeholder.svg' data-user='current user' onError={onImgError} /> 
            <b id='chat-menu-username'>{user.username}</b>
        </div>
    );
}

function DisplayRemoveOrb( props ) {
    return (
        <svg className='remove-svg-container' >
            <rect className='remove-svg-icon'  />
        </svg>
    );
}

function DisplayChannelsCategory({ selectedCategories, onSelect, onChannelSelect, joinedChannels, onRemoveCategory }) {
    let allChannels = joinedChannels;
    
    if ( allChannels.length > 0 ) { //only displays the category if content exists

        if ( selectedCategories.includes( 'channels' ) ) {
            allChannels = allChannels.map( channel => (
                <li className='menu-list-item' key={channel.channelId}>
                    <div className='display-category-menu' id={channel.channelId} onClick={onChannelSelect}>
                        <img className='chat-menu-user-img' src={channel.image} alt='failed to load channel default img' />             
                        <b className='display-channel'>{channel.channelId}</b>
                    </div>
    
                    <div className='remove-category-container' id={channel.channelId} onClick={onRemoveCategory}>
                        <DisplayRemoveOrb />
                    </div>
                </li>
            ));

            return (
                <div className='category-container-layout selected' id='channels-category-container'>
    
                    <div className='category-header-layout' id='channels-category-header' onClick={onSelect}>
                        <b className='category-header'>Channels</b>
                        <img id='add_category' src='/images/page_icons/add.svg' alt='failed to load add.svg' />
                    </div>
    
                    <ul id='category-menu-list' className='menu-list'>
                        {allChannels}
                    </ul>
    
                </div>
            );
        }

        else {
            return (
                <div className='category-container-layout selected' id='channels-category-container'>
    
                    <div className='category-header-layout' id='channels-category-header' onClick={onSelect}>
                        <b className='category-header'>Channels<small>{`\t (${joinedChannels.length})`}</small></b>
                        <img id='add_category' src='/images/page_icons/add.svg' alt='failed to load add.svg' />                        
                    </div>
    
                </div>
            );
        }
    }

    return null;
}

function DisplayRecentCategory({ selectedCategories, onSelect, onChannelSelect, onImgError, recentChannels, onRemoveRecentChannel }) {
    try {
        //console.log('\n*ENTERING DisplayRecentCategory()');

        let filteredChannels = JSON.parse( JSON.stringify( recentChannels ) );

        if( filteredChannels.length > 0 ) { //if there are channels to be displayed

            if ( selectedCategories.includes('recent') ) { //if the recent channel should be displayed (toggled on/off)

                filteredChannels = filteredChannels.map( channel => (
                    <li className='menu-list-item' key={channel.displayName} >

                        <div className='display-category-menu' id={channel.displayName} onClick={onChannelSelect}>
                            <div className='chat-menu-user-img-container'>
                                <DisplayUserStatusOrb id='user' status={channel.status} />
                                <DisplayUnreadMessageNotification unreadMsgCount={channel.unreadMessages} />
                                <img className='chat-menu-user-img' src={channel.image} alt='failed to load user img' data-user='other user' data-socketid={channel.path} onError={onImgError} /> 
                            </div>
                                <b className='display-username'>{channel.displayName}</b>
                        </div>

                        <div className='remove-category-container' id={channel.displayName} onClick={onRemoveRecentChannel}>
                            <DisplayRemoveOrb />
                        </div>

                    </li>         
                ));
                
                //console.log('*LEAVING DisplayRecentCategory()\n');
                return (
                    <div className='category-container-layout selected' id='recent-category-container'>
                        <div className='category-header-layout' id='recent-category-header' onClick={onSelect}>
                            <b className='category-header'>recent</b>
                        </div>

                        <ul id='recent-menu-list' className='menu-list'>
                            {filteredChannels}
                        </ul>
                    </div>        
                );
            }

            else { //category title displayed but no particular channels (toggled off)
                return (
                    <div className='category-container-layout selected' id='recent-category-container'>
                        <div className='category-header-layout' id='recent-category-header' onClick={onSelect}>
                            <b className='category-header'>recent<small>{`\t (${recentChannels.length})`}</small></b>
                        </div>
                    </div>        
                );
            }
        }

        //console.log('*LEAVING DisplayRecentCategory()\n');        
        return null;
    }
    catch(err) {
        console.log(`Chat menu DisplayRecentCategory(): ${err.message}`);
    }
}

function DisplayOnlineCategory({ selectedCategories, userData, users, onSelect, onChannelSelect, onImgError }) { 
    try {
        let categoryText = `online (${users.length})`;
        //console.log(`\nDisplayOnlineCategory() input data: ${JSON.stringify(users)}`);

        let filteredUsers = users.filter(
            user => user.username !== userData.username //removes current user from online users display
        );
        
        if ( filteredUsers.length > 0 ) { //only displays the online category if there's content

            if ( selectedCategories.includes('online') ) { //online category is toggled on
                let aUsers = filteredUsers.map( user => (
                    <li className='menu-list-item' key={user.username} id={user.username} onClick={onChannelSelect}>
                        <div className='display-category-menu'>
                            
                            <div className='chat-menu-user-img-container'>
                                <DisplayUserStatusOrb id='user' status={user.status} />
                                <img className='chat-menu-user-img' src={user.image} alt='failed to load user img' data-user='other user' data-socketid={user.socketId} onError={onImgError} /> 
                            </div>
                            <b className='display-username'>{user.username}</b>

                        </div>
                    </li>         
                ));
                    
                return (
                    <div className='category-container-layout selected' id='online-category-container'>
                        <div className='category-header-layout' id='online-category-header' onClick={onSelect}>
                            <b className='category-header'>online</b>
                        </div>
        
                        <ul id='online-menu-list' className='menu-list'>
                            {aUsers}
                        </ul>
                    </div>        
                );
            }

            return (
                <div className='category-container-layout selected' id='online-category-container'>
                    <div className='category-header-layout' id='online-category-header' onClick={onSelect}>
                        <b className='category-header'>online<small>{` (${users.length - 1})`}</small></b>
                    </div>
                </div>        
            );
        }

        return null;
    }
    catch(err) {
        console.log(`ERR chat_menu.js DisplayOnlineCategory(): ${err.message}`);
    }
}

function DisplayUserOptions({ isDisplayed, logout }) {
    if ( !isDisplayed ) { //if the user options modal window is not to be displayed
        return null;
    }

    return (
        <div id='display-user-options-container'>
            <div className='user-options-container' id='user-logout-container' onClick={ e => logout(e) }>
                <img className='user-option-img' id='user-logout' src='/images/titlebar_icons/exit.svg' alt='failed to load logout img' />
                <small className='user-option-text' id='user-logout-text'>Logout</small>
            </div>

            <div className='user-options-container' onClick={e => alert('Not implemented D:') } >
                <img className='user-option-img' id='user-edit-profile-pic' src='/images/titlebar_icons/edit-profile.svg' alt='failed to load edit profile img' />
                <small className='user-option-text'>Edit pic</small>
            </div>
        </div>
    );
}

class ChatMenu extends Component {
    constructor(props) {
        super(props);

        this.state = {
            displayUserOptionsModal: false, //determines if the user options modal window is displayed

            selectedCategories: [
                'channels',
            ],
            filter: '',   //filter - determines what is displayed from the selected category
        }; 

        this.onCategorySelect = this.onCategorySelect.bind(this);
        this.onFilterChange = this.onFilterChange.bind(this);
        this.onChannelSelect = this.onChannelSelect.bind(this); //sends selected channel/user info back to chat
        this.onRemoveRecentChannel = this.onRemoveRecentChannel.bind(this); //sends selected channel/user info back to chat for removal from state
        this.onRemoveCategory = this.onRemoveCategory.bind(this); //sends the channel info back to chat for removal from state

        this.enableUserPanel = this.enableUserPanel.bind(this); //panel appears onMouseEnter 
        this.disableUserPanel = this.disableUserPanel.bind(this); //panel disabled onMouseLeave

        this.onImgError = this.onImgError.bind(this); //loads the placeholder img if the profile img fails
    }

    //determines which category list to display
    onCategorySelect(e) {
        try {
            e.preventDefault();
            let target = e.currentTarget.id;
            let selection = ''; //defaults to '' if selection is not found
            console.log(`onCategorySelect(): ${target}`);
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

            /*
            console.log('onCategorySelect() selection info:');
            console.log(`-index: ${selection.index}`);
            console.log(`-channel: ${selection.channel}`);
            */
            if ( selection.index >= 0 ) { //if the channel already exists
                //console.log(`Chat menu onCategorySelect(): ${selection.channel} already exists, removing channel`); 
                newSelections.splice( selection.index, 1 ); //removes channel from selected channels
                this.setState({ selectedCategories: newSelections });
            }

            else if( selection.channel !== 'N/A' ) { //channel doesn't exist yet 
                //console.log(`Chat menu onCategorySelect(): ${selection.channel} doesn't exist, adding channel`);             
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
        e.preventDefault();

        let id = e.currentTarget.id; 
        //console.log(`Chat Menu onChannelSelect: ${id}`);
        this.props.onSelect( id );
    }

    onRemoveRecentChannel(e) {
        e.preventDefault();
        //console.log('\n*ENTERING onRemoveRecentChannel() - chat_menu.js');
        //console.log(`onRemoveRecentChannel(): attempting to remove ${e.currentTarget.id}`);

        this.props.onRemoveRecentChannel(e.currentTarget.id);
    }

    onRemoveCategory(e) {
        e.preventDefault();        
        this.props.onRemoveCategory( e.currentTarget.id );
    }

    enableUserPanel(e) {
        e.preventDefault();
        this.setState({ displayUserOptionsModal: true });
    }

    disableUserPanel(e) {
        e.preventDefault();
        this.setState({ displayUserOptionsModal: false });
    }

    onImgError(e) {
        let targetData = e.currentTarget.dataset;

        if ( targetData.user === 'current user' ) {
            //console.log('image fail current user');
            this.props.onImgFail('current user'); //specifies the current user's img failed to load
        }

        else {
            //console.log('image fail other user');
            this.props.onImgFail( targetData.socketid ); 
        }
    }

    render() {
        /**need to pass updated DisplayMenuUserInfo() data in order to display the image, currently undefined */
        return (
            <div id='chat-menu-container'>
                <DisplayMenuUserInfo user={this.props.userData} onImgError={this.onImgError} isDisplayed={this.state.displayUserOptionsModal}
                                     enableUserPanel={this.enableUserPanel} disableUserPanel={this.disableUserPanel} logout={this.props.logout} />
                
                <div id='all-menu-categories'>
                    <DisplayRecentCategory selectedCategories={this.state.selectedCategories} onSelect={this.onCategorySelect} onChannelSelect={this.onChannelSelect} onImgError={this.onImgError}
                                           recentChannels={this.props.recentChannels} onRemoveRecentChannel={this.onRemoveRecentChannel} />
                                           
                    <DisplayChannelsCategory selectedCategories={this.state.selectedCategories} onSelect={this.onCategorySelect} onChannelSelect={this.onChannelSelect}
                                             joinedChannels={this.props.joinedChannels} onRemoveCategory={this.onRemoveCategory} />

                    <DisplayOnlineCategory selectedCategories={this.state.selectedCategories} userData={this.props.userData} users={this.props.users} onSelect={this.onCategorySelect}
                                           onChannelSelect={this.onChannelSelect} onImgError={this.onImgError} />
                </div>
                
            </div>
        );
    }
}

export default ChatMenu;