import React from 'react'
import './style/verify_login.css'

const VerifyLogin = (props) => {
    return (
        <div className='verify-login-container'>
            <h3 id='verify-login-header'>Verifying account info</h3>
            <img id='verify-login-animation' src='/images/loading_images/tail-spin.svg' alt='failed to load svg :(' />
        </div>
    );
}

export default VerifyLogin;