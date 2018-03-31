import React from 'react'
import './titlebar.css'

const Titlebar = ({username, onOpenSettings, onClose })  => {
    return (
        <div id='display-titlebar-container'>
            <img id='titlebar-menu-icon' onClick={onOpenSettings} src='/images/menu_white.png' />
            <small id='titlebar-username'>{username}</small>
            <img className='titlebar-icon' id='close-app' onClick={onClose} src='/images/close_white.png' />
        </div>
    ); 
}

export default Titlebar;