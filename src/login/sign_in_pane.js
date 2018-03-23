import React from 'react'
import './style/sign-in-pane.css'

function DisplaySignInInput(props) {
    return (
        <div className='row justify-content-center sign-in-input-container'>
            <div className='col-12 sign-in-input'>
                <input type='text' className='sign-in-inputfield' id='sign-in-username' />
            </div>

            <div className='col-12 sign-in-input'>
                <input type='text' className='sign-in-inputfield' id='sign-in-password' />
            </div>

            <div className='col-12 sign-in-input'>
                <button id='sign-in-submit'>Login</button>
            </div>
        </div>
    );    
}
/*
const SignInPane = (props) => {
    return (
        <div className='container-fluid sign-in-pane-container'>       
            <DisplaySignInInput />
        </div>
    )
}
*/

const SignInPane = (props) => {
    return (
        <div className='container-fluid sign-in-pane-container'>       
            <DisplaySignInInput />
        </div>
    )
}

export default SignInPane;