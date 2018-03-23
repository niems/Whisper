import React from 'react'
import './style/login.css'

function LoginFormat(props) {
    //use this component to 
    <div className='login-format'>
        <i className='material-icons'>email</i><input type='text' className='login-input' id='email-verification' />
    </div>
}

function DisplayLoginInput(props) {
    if (false) {
        return (
            <div className='login-area'>
                <i className='material-icons'>email</i><input type='text' className='login-input' id='email-verification' />
            </div>
        );
    }

    return (
        <div className='login-area'>
            <input type='text' className='login-input' id='username' />
            <input type='password' className='login-input' id='password' />
            <button className='login-submit' id='login-submit'>Login</button>
        </div>
    );
}

function DisplayLoginPane(props) {
    return (
        <div className='login-pane'>
            <DisplayLoginInput />
        </div>
    );
}

function DisplayTitlebar(props) {
    return (
        <div className='titlebar-pane'>

        <span className='titlebar-icon-container'>
            <i className='material-icons titlebar-icon'>data_usage</i>
        </span>
        
        </div>
    );
}

const Login = (props) => {
    return (
         <div className='login-pane-container'>
            <DisplayTitlebar />  
            <DisplayLoginPane />
         </div>
    );
}

export default Login;