import React, {Component} from 'react'
import './style/login.css'

function DisplayTitlebar(props) {
    return (
        <div className='titlebar-container'>
            <i className='material-icons titlebar-icon' id='close-app'>data_usage</i>
        </div>
    );
}

function DisplayLoginHeader(props) {
    return (
        <div className='login-pane-header'>
            <h5 id='login-header'></h5>
            <p id='login-header-info'>
                Login / Sign up
            </p>
        </div>
    );
}

function DisplayInput( {iconName, iconId, inputId, inputType} ) {
    return (
        <div className='login-display'>
            <i className='material-icons login-inputfield-icon' id={iconId}>{iconName}</i>
            <input type={inputType} className='login-inputfield' id={inputId} />
        </div>
    );    
}

function DisplayButton( {id, name} ) {
    return (
        <button id={id}>{name}</button>
    );
}

function DisplayLogin( {signUp} ) {
    if (signUp) {
        return (
            <div className='login-pane'>
                <DisplayLoginHeader />
                <DisplayInput iconName={'email'} iconId={'emailIcon'} inputId={'emailInput'} inputType='text'/>                
                <DisplayInput iconName={'person'} iconId={'usernameIcon'} inputId={'usernameInput'} inputType='text'/>
                <DisplayInput iconName={'lock'} iconId={'passwordIcon'} inputId={'passwordInput'} inputType='password' />
                <DisplayInput iconName={'lock'} iconId={'confirmpasswordIcon'} inputId={'confirmPasswordInput'} inputType='password'/>   
                <DisplayButton id='loginButton' name='Login' />                         
            </div>
        ); 
    }
    return (
        <div className='login-pane'>
            <DisplayLoginHeader />
            <DisplayInput iconName={'person'} iconId={'usernameIcon'} inputId={'usernameInput'} inputType='text' />
            <DisplayInput iconName={'lock'} iconId={'passwordIcon'} inputId={'passwordInput'} inputType='password' />            
            <DisplayButton id='loginButton' name='Login' />
        </div>
    );    
}

class Login extends Component {
    constructor(props) {
        super(props);

        this.state = {signUp: false}; //true if user is creating a new account
    }

    componentDidMount() {
        try {
            let mainInput;
            if ( this.state.signUp ) { //user signing up for new account - email verification & confirm password fields added
                mainInput = document.getElementById('emailInput');
            }

            else {
                mainInput = document.getElementById('usernameInput');
            }

            mainInput.focus();
        }
        catch(e) {
            console.log(`ERR Login - componentDidMount(): ${e.message}`);
        }        
    }

    render() {
        return (
            <div className='login-pane-container'> 
               <DisplayTitlebar />
               <DisplayLogin signUp={this.state.signUp} />
            </div>
       );
    }
}
export default Login;