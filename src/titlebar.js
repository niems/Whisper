import React from 'react'
import './titlebar.css'

const Titlebar = ({ onOpenSettings, onClose })  => {
    return (
        <div id='display-titlebar-container'>
            <img id='titlebar-menu-icon' onClick={onOpenSettings} src='/images/titlebar_icons/menu-white.svg' alt='failed to load menu icon' />
            <img className='titlebar-icon' id='close-app' onClick={onClose} src='/images/titlebar_icons/close.svg' alt='failed to load close icon' />
        </div>
    ); 
}

export default Titlebar;