import React from 'react'
import './titlebar.css'

const Titlebar = ({ isElectron, onOpenSettings, onClose })  => {

    if ( isElectron ) { //runs if the client view is an electron window
        return (
            <div id='display-titlebar-container'>
                <img id='titlebar-menu-icon' onClick={onOpenSettings} src='/images/titlebar_icons/menu-white.svg' alt='failed to load menu icon' />
                <img className='titlebar-icon' id='close-app' onClick={onClose} src='/images/titlebar_icons/close.svg' alt='failed to load close icon' />
            </div>
        ); 
    }

    return ( //removes close icon if client view is running in the browser
        <div id='display-titlebar-container'>
            <img id='titlebar-menu-icon' onClick={onOpenSettings} src='/images/titlebar_icons/menu-white.svg' alt='failed to load menu icon' />
        </div>
    ); 
}

export default Titlebar;