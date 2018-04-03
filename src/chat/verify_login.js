import React from 'react'
import './style/verify_login.css'

const VerifyLogin = (props) => {
    return (
        <div className='verify-login-container'>
            <h3 id='verify-login-header'>Verifying account info</h3>
            <div id='verify-login-animation'></div>
        </div>
    );
}

export default VerifyLogin;