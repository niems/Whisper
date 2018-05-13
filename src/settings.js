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

function DisplayColorThemes({ onColorThemeSelection, onColorCycle }) {

    return (
        <div className='settings-submenu color-theme-submenu' id='color-theme-submenu'>
            <p className='settings-submenu-description'>
                Click to apply theme
            </p>

            <div className='settings-theme-navigation'>
                <div className='settings-navigation-arrows-container'>
                    <img className='settings-navigation-arrows' id='settings-navigation-arrow-left' src='/images/settings_icons/arrow-left.svg'
                         alt='arrow left img missing' onClick={onColorCycle} />
                </div>

                <img id='settings-theme-view' src='/images/settings_icons/react_theme.jpg' alt='settings display unable to load' onClick={onColorThemeSelection} />                
                
                <div className='settings-navigation-arrows-container'>
                    <img className='settings-navigation-arrows' id='settings-navigation-arrow-right' src='/images/settings_icons/arrow-right.svg'
                         alt='arrow right img missing' onClick={onColorCycle} />                
                </div>

            </div>
            
        </div>
    );
}
/**
 * <img className='settings-submenu-color-theme' id='color-theme-react'
                src='images/settings_icons/react_theme.jpg' alt='failed to load react theme' onClick={onColorCycle} />

            <img className='settings-submenu-color-theme' id='color-theme-cotton-candy'
                 src='images/settings_icons/cotton_candy_theme.jpg' alt='failed to load cotton candy theme' onClick={onColorCycle} /> 

            <img className='settings-submenu-color-theme' id='color-theme-dark'
                 src='images/settings_icons/dark_theme.jpg' alt='failed to load dark theme' onClick={onColorCycle} />
 */
class Settings extends Component {
    constructor(props) {
        super(props);
        this.state = {
            displaySubmenu: {
                component: <DisplayColorThemes onColorThemeSelection={this.onColorThemeSelection} onColorCycle={this.onCycleColorTheme} />, //if !null, the menu for the clicked menu item will be displayed 
                str: 'DisplayColorThemes'                                               //component string value for comparisons
            },

            currentTheme: undefined, //initially undefined - once component mounts, the currentTheme is set based on the stylesheet
        };  

        this.onColorTheme = this.onColorTheme.bind(this); //toggles color theme settings
        this.onColorThemeSelection = this.onColorThemeSelection.bind(this); //color theme to apply
        this.onCycleColorTheme = this.onCycleColorTheme.bind(this); //allows the user to cycle through the current color theme

        this.onTypingNotification = this.onTypingNotification.bind(this); //toggles typing notification settings
    }

    componentDidMount() {
        this.currentThemeLink = document.getElementById('color-theme-stylesheet');

        console.log('\n\n****************COMPONENT MOUNTED');
        console.log(`Current theme: ${this.currentThemeLink.getAttribute('href')}`);

        this.stylesheets = [
            'color-theme-cotton-candy',
            'color-theme-dark',
            'color-theme-react'
        ];

        this.setState({
            currentTheme: this.currentThemeLink.getAttribute('href')
        });
        
    }

    onColorTheme(e = undefined) {
        if ( this.state.displaySubmenu.str !== 'DisplayColorThemes' ) {
            this.setState({
                displaySubmenu: {
                    //component: <DisplayColorThemes onColorSelect={this.onColorThemeSelection}/>,
                    component: <DisplayColorThemes onColorThemeSelection={this.onColorThemeSelection} onColorCycle={this.onCycleColorTheme} />,
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
        e.preventDefault();
        console.log('\n*ENTERING onColorThemeSelection()');

        

        console.log('*LEAVING onColorThemeSelection()\n');
    }

    onCycleColorTheme(e) {
        e.preventDefault();

        console.log('\n*ENTERING onCycleColorTheme()');

        

        //updates state & displayed stylesheet
        //this.currentThemeLink.setAttribute('href', this.stylesheets[ currentThemeIndex ]);
        //this.setState({ currentThemeIndex });
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