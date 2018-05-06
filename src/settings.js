import React, {Component} from 'react'
import './settings.css'

function DisplaySettingsMenu({ onColorTheme, onTyping }) {
    return (
        <div id='settings-menu-container'>
            <img className='settings-menu-item' id='settings-color-theme-icon' onClick={onColorTheme} src='/images/settings_icons/color-theme.svg' alt='/images/placeholder.svg'  />
            <img className='settings-menu-item' id='settings-user-typing-icon' onClick={onTyping} src='/images/settings_icons/typing-notification.svg' alt='/images/placeholder.svg'  />
        </div>
    );
}

function DisplayTypingNotification(props) {
    return (
        <div className='settings-submenu typing-notification-submenu'>
            <img className='settings-submenu-img' id='typing-notification-img' src='/images/chat_bubble.gif' alt='/images/placeholder.svg'  />
            <p className='settings-submenu-description'>Receive a notification when a user is typing to you</p>
        </div>
    )
}

function DisplayColorThemes({ onColorSelect }) {
    return (
        <div className='settings-submenu color-theme-submenu' id='color-theme-submenu'>
            <p className='settings-submenu-description'>
                Click to apply any theme below
            </p>

            <button className='settings-submenu-color-theme' id='color-theme-cotton-candy' onClick={onColorSelect}>
                Cotton Candy Theme
            </button>
            <button className='settings-submenu-color-theme' id='color-theme-dark' onClick={onColorSelect}>
                Dark Theme
            </button>            
        </div>
    );
}

class Settings extends Component {
    constructor(props) {
        super(props);
        this.state = {
            displaySubmenu: {
                component: undefined,   //if !null, the menu for the clicked menu item will be displayed 
                str: ''                 //component string value for comparisons
            },

        }; 

        this.onColorTheme = this.onColorTheme.bind(this); //toggles color theme settings
        this.onColorThemeSelection = this.onColorThemeSelection.bind(this); //color theme to apply

        this.onTypingNotification = this.onTypingNotification.bind(this); //toggles typing notification settings
    }

    onColorTheme(e) {
        if ( this.state.displaySubmenu.str !== 'DisplayColorThemes' ) {
            this.setState({
                displaySubmenu: {
                    component: <DisplayColorThemes onColorSelect={this.onColorThemeSelection}/>,
                    str: 'DisplayColorThemes'
                }
            });
        }

        else {
            this.setState({
                displaySubmenu: {
                    component: undefined,
                    str: ''
                }
            });
        }
    }

    onColorThemeSelection(e) {
        console.log('\n*ENTERING onColorThemeSelection()');
        let selectedTheme = e.currentTarget.id;
        let currentTheme = document.getElementById('color-theme-stylesheet');


        //alert(currentTheme.href);
        if ( selectedTheme === 'color-theme-cotton-candy' ) {
            //alert(currentTheme.getAttribute('href'));
            
            currentTheme.setAttribute('href', 'cotton_candy_theme.css');
            //alert(currentTheme.getAttribute('href'));
        }

        else if ( selectedTheme === 'color-theme-dark' ) {
            //alert(currentTheme.getAttribute('href'));
            currentTheme.href = 'dark_theme.css';
            currentTheme.setAttribute('href', 'dark_theme.css');
            //alert(currentTheme.getAttribute('href'));
        }        

        console.log('*LEAVING onColorThemeSelection()\n');
    }

    onTypingNotification(e) {
        if ( this.state.displaySubmenu.str !=='DisplayTypingNotification' ) {
            this.setState({
                displaySubmenu: {
                    component: <DisplayTypingNotification />,
                    str: 'DisplayTypingNotification'
                }
            });
        }

        else {
            this.setState({
                displaySubmenu: {
                    component: undefined,
                    str: ''
                }
            });
        }
    }

    render() {
        return (
            <div id='settings-wrapper'>
                <DisplaySettingsMenu onColorTheme={this.onColorTheme} onTyping={this.onTypingNotification} />
                {this.state.displaySubmenu.component}
            </div>
        )
    }    
};

export default Settings;