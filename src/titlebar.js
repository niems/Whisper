import React from 'react'
import './titlebar.css'

const Titlebar = ({ onOpenSettings, onClose })  => {
    return (
        <div id='display-titlebar-container'>
            <img id='titlebar-menu-icon' onClick={onOpenSettings} src='/images/menu_white.png' alt='failed to load menu_white.png' />
            <img className='titlebar-icon' id='close-app' onClick={onClose} src='/images/close_white.png' alt='failed to load close_white.png' />
        </div>
    ); 
}

export default Titlebar;