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

            <button className='settings-submenu-color-theme' id='color-theme-blue' onClick={onColorSelect}>
                Dark/Blue theme
            </button>
            <button className='settings-submenu-color-theme' id='color-theme-green' onClick={onColorSelect}>
                Slate/Green theme
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
            }
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
        let selectedTheme = e.currentTarget.value;
        let currentTheme = document.getElementById('color-theme-stylesheet');

        //alert(currentTheme.href);
        if ( selectedTheme === 'color-theme-blue' ) {
            alert(currentTheme.getAttribute('href'));
            currentTheme.href = 'blue_theme.css';
            currentTheme.setAttribute('href', 'blue_theme.css');
            alert(currentTheme.getAttribute('href'));
        }

        else if ( selectedTheme === 'color-theme-green' ) {
            alert(currentTheme.getAttribute('href'));
            currentTheme.href = 'dark_theme.css';
            currentTheme.setAttribute('href', 'dark_theme.css');
            alert(currentTheme.getAttribute('href'));
        }        
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