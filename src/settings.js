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

function DisplayColorThemes({ currentTheme, onColorThemeSelection, onColorCycle }) {
    
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

                {currentTheme}
                
                <div className='settings-navigation-arrows-container'>
                    <img className='settings-navigation-arrows' id='settings-navigation-arrow-right' src='/images/settings_icons/arrow-right.svg'
                         alt='arrow right img missing' onClick={onColorCycle} />                
                </div>

            </div>
            
        </div>
    );
}

class Settings extends Component {
    constructor(props) {
        super(props);
        this.state = {
           //currentThemeDisplayed: 'react-theme.jpg', //initially undefined - once component mounts, the currentTheme is set based on the stylesheet
            currentThemeDisplayed: null, //theme currently being displayed in settings
            selectedTheme: null, //theme currently in use
            
            displaySubmenu: {
                component: undefined, //if !null, the menu for the clicked menu item will be displayed 
                str: undefined,                                               //component string value for comparisons
            },
        };  

        this.onColorTheme = this.onColorTheme.bind(this); //toggles color theme settings
        this.onColorThemeSelection = this.onColorThemeSelection.bind(this); //color theme to apply

        this.setDisplayedTheme = this.setDisplayedTheme.bind(this);
        this.onCycleColorTheme = this.onCycleColorTheme.bind(this); //allows the user to cycle through the current color theme

        this.onTypingNotification = this.onTypingNotification.bind(this); //toggles typing notification settings
    }

    componentDidMount() {
        let currentThemeLink = document.getElementById('color-theme-stylesheet');
        let selectedTheme = currentThemeLink.getAttribute('href');

        console.log('\n\n****************COMPONENT MOUNTED');
        console.log(`Current theme: ${currentThemeLink.getAttribute('href')}`);

        this.stylesheets = [
            {
                name: 'react theme',
                img: '/images/settings_icons/react_theme.jpg',
                css: 'react_theme.css'
            },
            {
                name: 'cotton candy theme',
                img: '/images/settings_icons/cotton_candy_theme.jpg',
                css: 'cotton_candy_theme.css'
            },
            {
                name: 'dark theme',
                img: '/images/settings_icons/dark_theme.jpg',
                css: 'dark_theme.css'
            },
        ];
        
        this.setDisplayedTheme();
        this.setState({ selectedTheme  });
    }

    onColorTheme(e = undefined) {
        if ( this.state.displaySubmenu.str !== 'DisplayColorThemes' ) {
            this.setState({
                displaySubmenu: {
                    //component: <DisplayColorThemes onColorSelect={this.onColorThemeSelection}/>,
                    component: <DisplayColorThemes currentTheme={this.state.currentThemeDisplayed} displayedTheme={this.state.currentThemeDisplayed} onColorThemeSelection={this.onColorThemeSelection} onColorCycle={this.onCycleColorTheme} />,
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
        let currentThemeDisplayed = document.getElementById('settings-theme-view').getAttribute('src');

        for (let i = 0; i < this.stylesheets.length; i++) {
            if ( currentThemeDisplayed === this.stylesheets[i].img ) {
                console.log('theme found');

                document.getElementById('color-theme-stylesheet').setAttribute('href', this.stylesheets[i].css );      
                this.setState({
                    selectedTheme: this.stylesheets[i].css
                });

                this.props.onToggleSettings();
                break;
            }
        }
        

        console.log('*LEAVING onColorThemeSelection()\n');
    }

    setDisplayedTheme(path = undefined) {
        let currentThemeLink = document.getElementById('color-theme-stylesheet');        
        
        if ( typeof(path) === 'undefined' ) { //specific path for theme not given
            let imgSrc = '';

            switch( currentThemeLink.getAttribute('href') ) {
                case 'react_theme.css':
                    console.log('react theme selected');
                    imgSrc = this.stylesheets[0].img;
                    break;
    
                case 'cotton_candy_theme.css':
                    imgSrc = this.stylesheets[1].img;
                    break;
                
                case 'dark_theme.css':
                    imgSrc = this.stylesheets[2].img;            
                    break;
                
                default:
                    console.log('other theme selected');
            }

            console.log(`setDisplayedTheme() image src: ${imgSrc}`);            
            
            this.setState({
                currentThemeDisplayed: (<img id='settings-theme-view' src={imgSrc} alt='settings display unable to load' onClick={this.onColorThemeSelection} />)
            });
        }

        else {
            console.log(`setDisplayedTheme() path src: ${path}`);            
            this.setState({
                currentThemeDisplayed: (<img id='settings-theme-view' src={path} alt='settings display unable to load' onClick={this.onColorThemeSelection} />)
            });
        }
    }

    onCycleColorTheme(e) {
        e.preventDefault();

        
        console.log('\n*ENTERING onCycleColorTheme()');
        let arrowId = e.currentTarget.id;
        let currentThemeElement = document.getElementById('settings-theme-view');
        let currentTheme = currentThemeElement.getAttribute('src');



        console.log(`arrow: ${arrowId}`);
        console.log(`current theme: ${currentTheme}`);

        for(let i = 0; i < this.stylesheets.length; i++) { //finds current stylesheet

            if ( currentTheme === this.stylesheets[i].img ) { //current stylesheet found

                if ( arrowId === 'settings-navigation-arrow-left' ) { //left arrow selected
                    if ( i - 1 < 0) {
                        this.setDisplayedTheme( this.stylesheets[ this.stylesheets.length - 1 ].img );
                        currentThemeElement.setAttribute('src', this.stylesheets[ this.stylesheets.length - 1 ].img );
                    }

                    else {
                        this.setDisplayedTheme( this.stylesheets[ i - 1 ].img );          
                        currentThemeElement.setAttribute('src', this.stylesheets[ i - 1 ].img );                                      
                    }

                    break;
                }
                
                else if ( arrowId === 'settings-navigation-arrow-right' ) { //right arrow selected
                    if ( i + 1 >= this.stylesheets.length ) { //currently on last stylesheet - starting over
                        this.setDisplayedTheme( this.stylesheets[0].img );
                        currentThemeElement.setAttribute('src', this.stylesheets[0].img );                        
                    }

                    else {
                        this.setDisplayedTheme( this.stylesheets[i + 1].img );
                        currentThemeElement.setAttribute('src', this.stylesheets[ i + 1 ].img );
                    }    
    
                    break;
                }
            }
        }

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