import React, {Component} from 'react'
import io from 'socket.io-client'
import './style/login.css'

function DisplayTitlebar(props) {
    return (
        <div className='titlebar-container'>
            <small id='app-title'>Whisper</small>
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

function DisplayInput( {iconName, iconId, inputId, inputType, value, onChange} ) {
    return (
        <div className='login-display'>
            <i className='material-icons login-inputfield-icon' id={iconId}>{iconName}</i>
            <input type={inputType} className='login-inputfield' id={inputId} value={value} onChange={onChange} />
        </div>
    );    
}

function DisplayButton( {id, name, onClick} ) {
    return (
        <button id={id} onClick={onClick}>{name}</button>
    );
}

function DisplayLogin( {data, onChange, onSubmit} ) {
    if (data.user.signUp) {
        return (
            <div className='login-pane'>
                <DisplayLoginHeader />
                <DisplayInput iconName={'email'} iconId={'emailIcon'} inputId={'emailInput'} inputType='text' value={data.user.email} onChange={onChange} />                
                <DisplayInput iconName={'person'} iconId={'usernameIcon'} inputId={'usernameInput'} inputType='text' value={data.user.username} onChange={onChange} />
                <DisplayInput iconName={'lock'} iconId={'passwordIcon'} inputId={'passwordInput'} inputType='password' value={data.user.pass} onChange={onChange} />
                <DisplayInput iconName={'lock'} iconId={'confirmpasswordIcon'} inputId={'confirmPasswordInput'} inputType='password' value={data.user.confirmPass} onChange={onChange} />   
                <DisplayButton id='loginButton' name='Connect' onClick={onSubmit} />                         
            </div>
        ); 
    }
    return (
        <div className='login-pane'>
            <DisplayLoginHeader />
            <DisplayInput iconName={'person'} iconId={'usernameIcon'} inputId={'usernameInput'} inputType='text' value={data.user.username} onChange={onChange} />
            <DisplayInput iconName={'lock'} iconId={'passwordIcon'} inputId={'passwordInput'} inputType='password' value={data.user.pass} onChange={onChange} />            
            <DisplayButton id='loginButton' name='Connect' onClick={onSubmit} />
        </div>
    );    
}

class Login extends Component {
    constructor(props) {
        super(props);

        this.state = {
            signUp: false, //true if user is creating a new account
            email: '',          //email inputfield
            username: '',      //username inputfield
            pass: '',         //password inputfield
            confirmPass: ''  //confirm password inputfield
        }; 

        
        this.onChange = this.onChange.bind(this); //an inputfield has changed
        this.onButtonSubmit = this.onButtonSubmit.bind(this); //user submitted by clicking the login button
        this.onServerConnect = this.onServerConnect.bind(this); //user has just been connected to server
        
        /*
        this.socket = io('http://localhost:8080'); //connects to server
        this.socket.on('CONNECTED_TO_SERVER', (data) => {
            this.onServerConnect(data);
        });
        */
    }

    onChange(e) {
        let input = e.currentTarget.id;     //element changed 
        let value = e.currentTarget.value; 
        
        switch(input) {
            case 'usernameInput':
                this.setState( {username: value} );
                break;
            case 'passwordInput':
                this.setState( {pass: value} );
                break;
            case 'emailInput':
                this.setState( {email: value} );
                break;
            case 'confirmPasswordInput':
                this.setState( {confirmPass: value} );
        }
    }

    onButtonSubmit(e) {
        try {
            e.preventDefault();

            if ( this.state.signUp ) { //new account - email verification and confirm password needs to be checked
                if ( this.state.email !== '' ) {
                    if ( this.state.confirmPass !== '' ) {
                        if ( this.state.pass !== this.state.confirmPass ) {
                            alert("Error: pass & confirm pass don't match");
                            document.getElementById('confirmPasswordInput').focus();
                            return;
                        }
                    }

                    else {
                        alert('Invalid confirmed password');
                        document.getElementById('confirmPasswordInput').focus();
                        return;
                    }
                }

                else {
                    alert('Invalid email address');
                    document.getElementById('emailInput').focus();
                    return;
                }
            }

            if ( this.state.username !== '' ) {
                if ( this.state.pass !== '' ) {
                    alert('login approved');
                }

                else {
                    alert('Invalid password');
                    document.getElementById('passwordInput').focus();
                    return;
                }
            }

            else {
                alert('Invalid username');
                document.getElementById('usernameInput').focus();
                return;
            }

            window.location.assign('http://localhost:3000/chat.html');
        }
        catch(e) {
            console.log(`ERR login - onButtonSubmit(): ${e.message}`);
        }
    }

    onServerConnect(data) {
        alert(`My id: ${data.name}: ${data.id}`);
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
        let data = {
            user: {
                signUp: this.state.signUp,
                email: this.state.email,
                username: this.state.username,
                pass: this.state.pass,
                confirmPass: this.state.confirmPass
            }
        };

        return (
            <div className='login-pane-container'> 
               <DisplayTitlebar />
               <DisplayLogin data={data} onChange={this.onChange} onSubmit={this.onButtonSubmit} />
            </div>
       );
    }
}
export default Login;